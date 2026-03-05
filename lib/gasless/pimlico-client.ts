/**
 * Pimlico Smart Account Client for Hybrid EOA + ERC-4337 Architecture
 * 
 * This module creates a "sponsored provider" that looks like a normal EIP-1193 
 * provider to the iExec SDK, but internally routes all eth_sendTransaction calls 
 * through Pimlico's Bundler + Paymaster on Arbitrum.
 * 
 * The result: iExec SDK thinks it's talking to MetaMask, but Pimlico pays the gas
 * using the Arbifuel Grant.
 * 
 * Architecture:
 *   - protectData() → Uses real MetaMask (EOA encryption, no gas)
 *   - grantAccess() → Uses this Pimlico-wrapped provider (sponsored gas)
 *   - sendEmail()   → Uses this Pimlico-wrapped provider (sponsored gas)
 */

import { createPublicClient, http } from 'viem';
import { arbitrum } from 'viem/chains';
import { entryPoint07Address } from 'viem/account-abstraction';
import { createSmartAccountClient } from 'permissionless';
import { toSimpleSmartAccount } from 'permissionless/accounts';
import { createPimlicoClient } from 'permissionless/clients/pimlico';

// ─── Constants ───────────────────────────────────────────────────────────────

const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY || '';
const PIMLICO_RPC_URL = `https://api.pimlico.io/v2/42161/rpc?apikey=${PIMLICO_API_KEY}`;
const ARBITRUM_RPC_URL = 'https://arb1.arbitrum.io/rpc';

// ─── Types ───────────────────────────────────────────────────────────────────

// Minimal EIP-1193 interface that iExec SDK expects
interface MinimalProvider {
    request(args: { method: string; params?: unknown[] }): Promise<unknown>;
    on?: (...args: unknown[]) => void;
    removeListener?: (...args: unknown[]) => void;
}

export interface PimlicoSponsoredResult {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    smartAccountClient: any;
    smartAccountAddress: `0x${string}`;
    sponsoredProvider: MinimalProvider;
}

// ─── Core Functions ──────────────────────────────────────────────────────────

/**
 * Creates a Pimlico-sponsored Smart Account Client derived from the user's MetaMask EOA.
 * 
 * The Smart Account is a counterfactual address (may not be deployed yet).
 * Pimlico will deploy it automatically on the first UserOperation.
 * 
 * @param eoaProvider - The standard MetaMask/EIP-1193 provider (window.ethereum)
 */
export async function createPimlicoSponsoredClient(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    eoaProvider: any
): Promise<PimlicoSponsoredResult> {
    if (!PIMLICO_API_KEY) {
        throw new Error('[Pimlico] NEXT_PUBLIC_PIMLICO_API_KEY is not set. Cannot create sponsored client.');
    }

    // 1. Create a public client for reading Arbitrum state
    const publicClient = createPublicClient({
        chain: arbitrum,
        transport: http(ARBITRUM_RPC_URL),
    });

    // 2. Create Pimlico paymaster client (handles gas sponsorship)
    const paymasterClient = createPimlicoClient({
        entryPoint: {
            address: entryPoint07Address,
            version: '0.7',
        },
        transport: http(PIMLICO_RPC_URL),
    });

    // 3. Get the user's EOA address from MetaMask
    const accounts = await eoaProvider.request({ method: 'eth_requestAccounts' }) as `0x${string}`[];
    const eoaAddress = accounts[0];

    // 4. Create EOA signer adapter for viem
    //    We need to convert the EIP-1193 provider into a viem-compatible "owner" account
    const { toAccount } = await import('viem/accounts');

    // Create a custom account that uses MetaMask for signing
    const eoaAccount = toAccount({
        address: eoaAddress,

        // Sign a message using MetaMask
        async signMessage({ message }: { message: string | { raw: Uint8Array | string } }) {
            const messageStr = typeof message === 'string' ? message :
                typeof message === 'object' && 'raw' in message ?
                    (typeof message.raw === 'string' ? message.raw : `0x${Buffer.from(message.raw).toString('hex')}`) :
                    String(message);

            return eoaProvider.request({
                method: 'personal_sign',
                params: [messageStr, eoaAddress] as unknown[],
            }) as Promise<`0x${string}`>;
        },

        // Sign typed data (EIP-712) using MetaMask
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async signTypedData(typedData: any) {
            return eoaProvider.request({
                method: 'eth_signTypedData_v4',
                params: [eoaAddress, JSON.stringify(typedData)] as unknown[],
            }) as Promise<`0x${string}`>;
        },

        // Sign a transaction using MetaMask
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async signTransaction(transaction: any) {
            return eoaProvider.request({
                method: 'eth_signTransaction',
                params: [transaction] as unknown[],
            }) as Promise<`0x${string}`>;
        },
    });

    // 5. Derive a SimpleSmartAccount owned by the user's EOA
    const simpleAccount = await toSimpleSmartAccount({
        client: publicClient,
        owner: eoaAccount,
        entryPoint: {
            address: entryPoint07Address,
            version: '0.7',
        },
    });

    // 6. Create the Smart Account Client (the "magic" client)
    //    This routes all sendTransaction calls through Pimlico's Bundler
    const smartAccountClient = createSmartAccountClient({
        account: simpleAccount,
        chain: arbitrum,
        paymaster: paymasterClient,
        bundlerTransport: http(PIMLICO_RPC_URL),
        userOperation: {
            estimateFeesPerGas: async () => (await paymasterClient.getUserOperationGasPrice()).fast,
        },
    });

    const smartAccountAddress = simpleAccount.address;

    // 7. Create an EIP-1193-compatible provider wrapper
    //    This is the KEY INNOVATION: it wraps the Smart Account Client
    //    as a standard provider that the iExec SDK can accept
    const sponsoredProvider = createSponsoredEIP1193Provider(
        eoaProvider,
        smartAccountClient,
        smartAccountAddress,
        eoaAddress
    );

    console.log('[Pimlico] Smart Account derived:', smartAccountAddress);
    console.log('[Pimlico] EOA owner:', eoaAddress);
    console.log('[Pimlico] Sponsored provider ready — gas will be paid by Arbifuel');

    return {
        smartAccountClient,
        smartAccountAddress,
        sponsoredProvider,
    };
}

/**
 * Creates an EIP-1193 provider that wraps the Pimlico SmartAccountClient.
 * 
 * The iExec SDK calls provider.request({ method: 'eth_sendTransaction', ... })
 * internally. This wrapper intercepts those calls and routes them through 
 * Pimlico's bundler instead of MetaMask, making the transaction gasless.
 * 
 * For non-transaction calls (eth_chainId, eth_call, etc.), it falls back 
 * to the original MetaMask provider.
 */
function createSponsoredEIP1193Provider(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    originalProvider: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    smartAccountClient: any,
    smartAccountAddress: `0x${string}`,
    eoaAddress: `0x${string}`
): MinimalProvider {
    const sponsoredProvider: MinimalProvider = {
        async request({ method, params }: { method: string; params?: unknown[] }) {
            switch (method) {
                // ─── Intercept: Return EOA address ────────────────────
                case 'eth_accounts':
                case 'eth_requestAccounts':
                    // Return the EOA address since the data is owned by the EOA
                    return [eoaAddress];

                // ─── Intercept: Route transactions through Pimlico ────
                case 'eth_sendTransaction': {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const tx = (params as any[])[0];
                    console.log('[Pimlico Provider] Intercepting eth_sendTransaction:', {
                        to: tx.to,
                        value: tx.value,
                        dataLength: tx.data?.length || 0,
                    });

                    try {
                        // Route the transaction through the Smart Account Client
                        // Pimlico will sponsor the gas via the Paymaster
                        const txHash = await smartAccountClient.sendTransaction({
                            to: tx.to as `0x${string}`,
                            value: tx.value ? BigInt(tx.value) : BigInt(0),
                            data: (tx.data as `0x${string}`) || '0x',
                        });

                        console.log('[Pimlico Provider] Sponsored TX hash:', txHash);
                        return txHash;
                    } catch (error) {
                        console.error('[Pimlico Provider] Sponsored TX failed:', error);
                        // Fallback to original provider if Pimlico fails
                        console.warn('[Pimlico Provider] Falling back to MetaMask (user will pay gas)');
                        return originalProvider.request({ method, params });
                    }
                }

                // ─── Intercept: Sign messages with MetaMask ───────────
                case 'personal_sign':
                case 'eth_sign':
                case 'eth_signTypedData':
                case 'eth_signTypedData_v3':
                case 'eth_signTypedData_v4':
                    // Signatures must come from the EOA (MetaMask), not the Smart Account
                    return originalProvider.request({ method, params });

                // ─── Pass-through: Everything else to MetaMask ────────
                default:
                    return originalProvider.request({ method, params });
            }
        },

        // Forward event listeners to the original provider
        on: originalProvider.on?.bind(originalProvider),
        removeListener: originalProvider.removeListener?.bind(originalProvider),
    };

    return sponsoredProvider;
}
