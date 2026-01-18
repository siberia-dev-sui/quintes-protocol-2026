/**
 * Network Configuration for Quintes Protocol
 * Supports both Arbitrum Sepolia (testnet) and Arbitrum One (mainnet)
 * 
 * Set NEXT_PUBLIC_CHAIN_ID in your .env.local:
 * - Testnet: 421614
 * - Mainnet: 42161
 */

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 421614;

const NETWORKS = {
    // Arbitrum Sepolia (Testnet)
    421614: {
        chainId: 421614,
        chainIdHex: '0x66eee',
        chainName: 'Arbitrum Sepolia',
        rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
        blockExplorer: 'https://sepolia.arbiscan.io/',
        nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
        }
    },
    // Arbitrum One (Mainnet)
    42161: {
        chainId: 42161,
        chainIdHex: '0xa4b1',
        chainName: 'Arbitrum One',
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
        blockExplorer: 'https://arbiscan.io/',
        nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
        }
    }
} as const;

export const NETWORK_CONFIG = NETWORKS[CHAIN_ID as keyof typeof NETWORKS] || NETWORKS[421614];

export const isMainnet = () => CHAIN_ID === 42161;
export const isTestnet = () => CHAIN_ID === 421614;
