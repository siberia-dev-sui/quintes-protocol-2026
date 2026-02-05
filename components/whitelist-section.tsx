"use client";

import { useState, Suspense } from "react";
import { toast } from "sonner";
import { Pill } from "./pill";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabase";
import { generateReferralCode } from "@/lib/referral";
import { logger, sanitizeForLog } from "@/utils/logger";
// REMOVED: Gasless sponsor mode disabled - User pays gas directly
// import { requestSponsoredWhitelist } from "@/lib/gasless/sponsor-client";

// =============================================================================
// iEXEC BELLECOUR NETWORK CONFIG (The ONLY network where Web3Mail contracts work)
// =============================================================================
const IEXEC_BELLECOUR_CHAIN_ID = '0x86'; // Chain ID 134 in Hex
const IEXEC_BELLECOUR_CONFIG = {
    chainId: 134,
    chainIdHex: '0x86',
    chainName: 'iExec Bellecour',
    rpcUrl: 'https://bellecour.iex.ec',
    blockExplorer: 'https://blockscout-bellecour.iex.ec',
    nativeCurrency: { name: 'xRLC', symbol: 'xRLC', decimals: 18 }
};

// =============================================================================
// WALLET PROVIDER DETECTION (Handles multiple wallet extensions)
// =============================================================================

/**
 * Get MetaMask provider specifically, even when multiple wallets are installed.
 * This handles the common "Cannot set property ethereum" conflict.
 */
function getMetaMaskProvider(): any | null {
    if (typeof window === 'undefined') return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ethereum = window.ethereum as any;
    if (!ethereum) return null;

    // If MetaMask is the only wallet, use it directly
    if (ethereum.isMetaMask && !ethereum.providers) {
        return ethereum;
    }

    // Multiple wallets installed - find MetaMask specifically
    if (ethereum.providers?.length) {
        const metaMaskProvider = ethereum.providers.find(
            (provider: any) => provider.isMetaMask
        );
        if (metaMaskProvider) {
            console.log('[DEBUG] Found MetaMask in multiple providers');
            return metaMaskProvider;
        }
    }

    // Fallback: if ethereum.isMetaMask, use it
    if (ethereum.isMetaMask) {
        return ethereum;
    }

    // No MetaMask found
    console.warn('MetaMask not found among installed wallet providers');
    return null;
}

// =============================================================================
// iEXEC WEB3MAIL INTEGRATION (Gasless - Sponsor pays gas)
// =============================================================================

// Web3Mail iApp whitelist address (supports all versions)
const WEB3MAIL_APP_WHITELIST = '0xD5054a18565c4a9E5c1aa3cEB53258bd59d4c78C';

/**
 * Initialize iExec DataProtector SDK for protectData & grantAccess
 * Note: User's MetaMask signer is used (user signs & pays gas)
 */
async function initializeDataProtector() {
    const { IExecDataProtectorCore } = await import('@iexec/dataprotector');
    return new IExecDataProtectorCore(window.ethereum!);
}

/**
 * Initialize iExec Web3Mail SDK for sendEmail
 */
async function initializeWeb3Mail() {
    const { IExecWeb3mail } = await import('@iexec/web3mail');
    const { BrowserProvider } = await import('ethers');

    const provider = new BrowserProvider(window.ethereum!);
    const signer = await provider.getSigner();

    return new IExecWeb3mail(signer);
}

/**
 * Switch to iExec Bellecour network (CRITICAL FIX)
 * This is the ONLY network where the Web3Mail contracts are deployed.
 */
async function switchNetworkToBellecour(): Promise<boolean> {
    console.log('[DEBUG] switchNetworkToBellecour: Starting...');
    const provider = getMetaMaskProvider();
    if (!provider) {
        console.log('[DEBUG] switchNetworkToBellecour: No MetaMask provider found');
        return false;
    }

    try {
        console.log('[DEBUG] Getting current chainId...');
        const chainId = await provider.request({ method: 'eth_chainId' });
        console.log('[DEBUG] Current chainId:', chainId);
        const currentChainId = parseInt(chainId as unknown as string, 16);
        console.log('[DEBUG] Parsed chainId:', currentChainId);

        if (currentChainId === IEXEC_BELLECOUR_CONFIG.chainId) {
            console.log('[DEBUG] Already on Bellecour!');
            return true;
        }

        // Try to switch network
        console.log('[DEBUG] Switching to Bellecour...');
        try {
            await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: IEXEC_BELLECOUR_CHAIN_ID }]
            });
            console.log('[DEBUG] Network switched successfully!');
            return true;
        } catch (switchError: unknown) {
            console.log('[DEBUG] Switch error:', switchError);
            // Network not added, try to add it
            if ((switchError as { code: number }).code === 4902) {
                console.log('[DEBUG] Network not found, adding Bellecour...');
                await provider.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: IEXEC_BELLECOUR_CHAIN_ID,
                        chainName: IEXEC_BELLECOUR_CONFIG.chainName,
                        nativeCurrency: IEXEC_BELLECOUR_CONFIG.nativeCurrency,
                        rpcUrls: [IEXEC_BELLECOUR_CONFIG.rpcUrl],
                        blockExplorerUrls: [IEXEC_BELLECOUR_CONFIG.blockExplorer]
                    }]
                });
                console.log('[DEBUG] Network added successfully!');
                return true;
            }
            throw switchError;
        }
    } catch (error) {
        console.error('[DEBUG] Network switch error:', error);
        return false;
    }
}

// =============================================================================
// COMPONENT (Wrapped in Suspense for Next.js static build compatibility)
// =============================================================================

type TabMode = 'free' | 'premium';

export function WhitelistSection() {
    // Tab state
    const [activeTab, setActiveTab] = useState<TabMode>('free');

    // FREE version state
    const [email, setEmail] = useState("");
    const [freeSubmitted, setFreeSubmitted] = useState(false);

    // PREMIUM version state
    const [proEmail, setProEmail] = useState("");
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState("");
    const [isConnecting, setIsConnecting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState("");
    const [premiumSuccess, setPremiumSuccess] = useState(false);

    const shortenAddress = (address: string) => {
        return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
    };

    // =========================================================================
    // FREE VERSION - Simple Email
    // =========================================================================
    const handleFreeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setFreeSubmitted(true);
            logger.info("Whitelist signup (FREE):", sanitizeForLog(email));
            // TODO: Send to backend/database
        }
    };

    // =========================================================================
    // PREMIUM VERSION - Connect Wallet
    // =========================================================================
    const connectWallet = async () => {
        // Use getMetaMaskProvider to handle multiple wallet extensions
        const provider = getMetaMaskProvider();

        if (!provider) {
            toast.error("MetaMask is not installed or not detected", {
                description: "Please install MetaMask or disable other wallet extensions.",
                action: {
                    label: "Install",
                    onClick: () => window.open("https://metamask.io/download/", "_blank")
                }
            });
            return;
        }

        setIsConnecting(true);
        console.log('[DEBUG] connectWallet: Starting connection with provider...');
        try {
            console.log('[DEBUG] Requesting accounts...');
            const accounts = await provider.request({
                method: "eth_requestAccounts"
            });
            console.log('[DEBUG] Accounts received:', accounts);

            if (accounts && accounts.length > 0) {
                console.log('[DEBUG] Account found:', accounts[0]);
                // Check/switch network to iExec Bellecour
                const correctNetwork = await switchNetworkToBellecour();
                console.log('[DEBUG] Network switch result:', correctNetwork);
                if (!correctNetwork) {
                    toast.warning(`Please switch to ${IEXEC_BELLECOUR_CONFIG.chainName} in MetaMask`);
                    setIsConnecting(false);
                    return;
                }

                setWalletAddress(accounts[0]);
                setWalletConnected(true);
                console.log('[DEBUG] Wallet connected successfully!');
            } else {
                console.log('[DEBUG] No accounts received');
            }
        } catch (error: unknown) {
            console.error("Connection error:", error);

            // Handle specific MetaMask errors
            const errorCode = (error as { code?: number })?.code;
            const errorMessage = (error as { message?: string })?.message || "";

            if (errorCode === 4001 || errorMessage.includes("User rejected")) {
                toast.error("Connection Rejected", {
                    description: "You rejected the connection request in MetaMask."
                });
            } else if (errorCode === -32002 || errorMessage.includes("pending")) {
                toast.warning("Request Pending", {
                    description: "Please check MetaMask - there may be a pending request."
                });
            } else if (errorMessage.includes("unlock")) {
                toast.error("Wallet Locked", {
                    description: "Please unlock MetaMask and try again."
                });
            } else {
                toast.error("Failed to connect wallet", {
                    description: "Please make sure MetaMask is unlocked and try again."
                });
            }
        } finally {
            setIsConnecting(false);
        }
    };

    // =========================================================================
    // PREMIUM VERSION - Join Whitelist (iExec)
    // =========================================================================
    const joinVerifiedWhitelist = async () => {
        if (!proEmail || !proEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            toast.error("Please enter a valid email address");
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus("Initializing...");

        try {
            // Ensure correct network (Bellecour - where iExec contracts live)
            const correctNetwork = await switchNetworkToBellecour();
            if (!correctNetwork) {
                throw new Error(`Please switch to ${IEXEC_BELLECOUR_CONFIG.chainName}`);
            }

            // Initialize iExec SDKs (uses user's wallet)
            setSubmitStatus("Connecting to iExec...");
            const dataProtector = await initializeDataProtector();
            const web3mail = await initializeWeb3Mail();

            // STEP 1: Protect Email (User signs TX #1)
            setSubmitStatus("🔒 Encrypting email...");
            const protectedData = await dataProtector.protectData({
                data: { email: proEmail },
                name: `Quintes Whitelist - ${walletAddress.slice(0, 8)}`
            });
            logger.info("Email protected:", protectedData.address);

            // STEP 2: Grant Access to Web3Mail App (User signs TX #2)
            // NOTE: When using Web3Mail whitelist, authorizedUser must be zero address
            // The whitelist contract handles authorization internally
            setSubmitStatus("🔑 Granting access...");
            await dataProtector.grantAccess({
                protectedData: protectedData.address,
                authorizedApp: WEB3MAIL_APP_WHITELIST, // iExec Web3Mail whitelist
                authorizedUser: '0x0000000000000000000000000000000000000000', // Zero address for whitelist
                numberOfAccess: 1000 // Allow multiple emails to be sent
            });
            logger.info("Access granted to Web3Mail whitelist");

            // STEP 3: Send Confirmation Email (User signs TX #3)
            setSubmitStatus("📨 Sending confirmation...");
            await web3mail.sendEmail({
                protectedData: protectedData.address,
                emailSubject: "Welcome to Quintes Protocol Whitelist",
                emailContent: `
                    <html>
                        <body style="font-family: Arial, sans-serif; background: #000; color: #fff; padding: 40px;">
                            <div style="max-width: 600px; margin: 0 auto;">
                                <h1 style="color: #FFC700; font-size: 32px;">🎉 Welcome to Quintes Protocol!</h1>
                                <p style="font-size: 18px; line-height: 1.6;">
                                    Congratulations! Your spot on the Quintes Protocol whitelist is secured.
                                </p>
                                <p style="font-size: 16px; line-height: 1.6;">
                                    You're now among the first to experience institutional-grade DeFi yields.
                                </p>
                                <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin: 30px 0; border: 2px solid #FFC700;">
                                    <p style="margin: 0; font-size: 14px; color: #FFC700;"><strong>What's Next?</strong></p>
                                    <p style="margin: 10px 0 0 0; font-size: 14px;">We'll keep you updated on our launch. Stay tuned!</p>
                                </div>
                                <p style="font-size: 12px; color: #888;">
                                    Sent via Web3 Mail - decentralized, encrypted, and secure.
                                </p>
                            </div>
                        </body>
                    </html>
                `
            });
            logger.info("Email sent successfully");

            // STEP 4: Save to Supabase (Data Persistence Fix)
            setSubmitStatus("📝 Saving your profile...");
            const refCode = generateReferralCode();
            const { error: dbError } = await supabase
                .from('whitelist_participants')
                .insert([{
                    wallet_address: walletAddress,
                    protected_data_address: protectedData.address,
                    referral_code: refCode,
                    status: 'active'
                }]);

            if (dbError) {
                logger.error("DB Error (non-fatal):", dbError);
                // Don't fail the whole flow, blockchain part succeeded
            }

            // Success!
            setPremiumSuccess(true);
            setSubmitStatus("✅ Successfully whitelisted!");
            toast.success("You're in!", { description: `Your referral code: ${refCode}` });

        } catch (error: unknown) {
            logger.error("iExec Whitelist Error:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";

            // Handle specific error cases with user-friendly messages
            if (errorMessage.includes("user rejected") || errorMessage.includes("User denied")) {
                toast.error("Transaction Cancelled", {
                    description: "You rejected the transaction in your wallet."
                });
            } else if (errorMessage.includes("insufficient funds") || errorMessage.includes("gas")) {
                toast.error("Insufficient Funds", {
                    description: "You need xRLC on iExec Bellecour to pay for gas. Get free xRLC at faucet.iex.ec",
                    action: {
                        label: "Get xRLC",
                        onClick: () => window.open("https://faucet.iex.ec/", "_blank")
                    }
                });
            } else {
                toast.error("Registration failed", {
                    description: errorMessage
                });
            }
            setSubmitStatus("");
        } finally {
            setIsSubmitting(false);
        }
    };

    // =========================================================================
    // RENDER
    // =========================================================================
    return (
        <section id="whitelist" className="section-with-guides py-32 px-6 relative overflow-hidden">
            {/* Radial gradient background with subtle glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(255, 199, 0, 0.03) 0%, transparent 70%)',
                    backgroundSize: '100% 100%'
                }}
            />

            {/* Guide lines */}
            <div className="guide-lines" />

            <div className="container mx-auto max-w-3xl text-center relative z-10">
                <Pill className="mb-6">EARLY ACCESS</Pill>

                <h2 className="text-4xl md:text-5xl font-sentient mb-6">
                    Join the <i className="font-light">Whitelist</i>
                </h2>

                <p className="font-mono text-foreground/60 mb-12">
                    Be among the first to access Quintes Protocol and start earning sustainable yields.
                </p>

                {/* TABS with micro-animations */}
                <div className="flex gap-3 justify-center mb-10">
                    <button
                        onClick={() => setActiveTab('free')}
                        className={`px-6 py-3 font-mono text-sm uppercase transition-all duration-300 border transform hover:scale-105 hover:-translate-y-0.5 ${activeTab === 'free'
                            ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20'
                            : 'border-border bg-background text-foreground/60 hover:text-foreground hover:border-foreground/30 hover:shadow-md'
                            }`}
                        style={{
                            clipPath: "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)"
                        }}
                    >
                        [FREE] Standard
                    </button>
                    <button
                        onClick={() => setActiveTab('premium')}
                        className={`px-6 py-3 font-mono text-sm uppercase transition-all duration-300 border relative transform hover:scale-105 hover:-translate-y-0.5 ${activeTab === 'premium'
                            ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/30'
                            : 'border-border bg-background text-foreground/60 hover:text-foreground hover:border-foreground/30 hover:shadow-md'
                            }`}
                        style={{
                            clipPath: "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)",
                            animation: activeTab === 'premium' ? 'pulse-glow 2s ease-in-out infinite' : 'none'
                        }}
                    >
                        <span className="inline-block size-1.5 rounded-full bg-primary shadow-glow shadow-primary/50 mr-2 animate-pulse" />
                        [PREMIUM] Verified
                    </button>
                </div>

                {/* Pulse glow animation for premium tab */}
                <style jsx>{`
                    @keyframes pulse-glow {
                        0%, 100% { box-shadow: 0 0 20px rgba(255, 199, 0, 0.3); }
                        50% { box-shadow: 0 0 30px rgba(255, 199, 0, 0.5); }
                    }
                `}</style>

                {/* CONTENT AREA */}
                <div className="max-w-lg mx-auto">
                    {/* ============= FREE VERSION ============= */}
                    {activeTab === 'free' && (
                        <div className="animate-fadeIn">
                            {freeSubmitted ? (
                                <div
                                    className="inline-flex items-center gap-3 px-8 py-4 border border-primary/50 bg-primary/10"
                                    style={{
                                        clipPath: "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)"
                                    }}
                                >
                                    <span className="inline-block size-2 rounded-full bg-primary shadow-glow shadow-primary/50" />
                                    <span className="font-mono text-primary uppercase">Submission Received</span>
                                </div>
                            ) : (
                                <form onSubmit={handleFreeSubmit} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        required
                                        className="w-full sm:w-auto min-w-[280px] px-6 py-4 bg-background border border-border font-mono text-foreground placeholder:text-foreground/40 focus:border-primary/50 focus:shadow-lg focus:shadow-primary/20 focus:scale-[1.02] focus:outline-none transition-all duration-300"
                                        style={{
                                            clipPath: "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)"
                                        }}
                                    />
                                    <Button type="submit" size="sm" className="hover:scale-105 hover:-translate-y-0.5 transition-transform duration-300">
                                        [Subscribe]
                                    </Button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* ============= PREMIUM VERSION (iExec) ============= */}
                    {activeTab === 'premium' && (
                        <div className="animate-fadeIn">
                            {premiumSuccess ? (
                                // Success State
                                <div
                                    className="inline-flex flex-col items-center gap-3 px-10 py-8 border border-primary/50 bg-primary/10"
                                    style={{
                                        clipPath: "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)"
                                    }}
                                >
                                    <div className="size-12 rounded-full border-2 border-primary bg-primary/20 flex items-center justify-center">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6 text-primary">
                                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <span className="font-mono text-primary uppercase font-semibold">Successfully Whitelisted!</span>
                                    <span className="font-mono text-foreground/60 text-sm">Check your email for confirmation.</span>
                                </div>
                            ) : walletConnected ? (
                                // Connected - Show Email Input
                                <div className="space-y-5">
                                    {/* Wallet Connected Badge */}
                                    <div
                                        className="inline-flex items-center gap-2 px-4 py-2 border border-primary/30 bg-primary/5"
                                        style={{
                                            clipPath: "polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)"
                                        }}
                                    >
                                        <span className="inline-block size-1.5 rounded-full bg-primary shadow-glow shadow-primary/50" />
                                        <span className="font-mono text-primary text-xs uppercase">
                                            {shortenAddress(walletAddress)}
                                        </span>
                                    </div>

                                    {/* Email input with encryption icon */}
                                    <div className="relative w-full">
                                        <input
                                            type="email"
                                            value={proEmail}
                                            onChange={(e) => setProEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            disabled={isSubmitting}
                                            className="w-full px-6 py-4 pr-12 bg-background border border-border font-mono text-foreground placeholder:text-foreground/40 focus:border-primary/50 focus:shadow-lg focus:shadow-primary/20 focus:scale-[1.02] focus:outline-none transition-all duration-300 disabled:opacity-50"
                                            style={{
                                                clipPath: "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)"
                                            }}
                                        />
                                        {/* Trust signal: Encryption icon */}
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/60" title="End-to-end encrypted">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={joinVerifiedWhitelist}
                                        disabled={isSubmitting}
                                        size="sm"
                                        className="w-full hover:scale-105 hover:-translate-y-0.5 transition-transform duration-300"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8" />
                                                </svg>
                                                {submitStatus}
                                            </>
                                        ) : (
                                            "[Join Verified Whitelist]"
                                        )}
                                    </Button>

                                    <p className="font-mono text-xs text-foreground/40 text-center">
                                        ⚠️ You pay gas fees in xRLC. <a href="https://faucet.iex.ec/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Get free xRLC →</a>
                                    </p>
                                </div>
                            ) : (
                                // Not Connected - Show Connect Button
                                <div className="space-y-4">
                                    <Button
                                        onClick={connectWallet}
                                        disabled={isConnecting}
                                        size="sm"
                                        className="w-full hover:scale-105 hover:-translate-y-0.5 transition-transform duration-300"
                                    >
                                        {isConnecting ? (
                                            <>
                                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8" />
                                                </svg>
                                                Connecting...
                                            </>
                                        ) : (
                                            "[Connect Wallet]"
                                        )}
                                    </Button>

                                    {/* Trust signal: iExec badge with shield icon */}
                                    <div className="flex items-center justify-center gap-2 font-mono text-xs text-foreground/40 text-center">
                                        <svg className="w-4 h-4 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        <p>
                                            Privacy-preserving signup via wallet.<br />
                                            Your email is encrypted on-chain using <span className="text-primary font-semibold">iExec TEE</span>.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <p className="font-mono text-xs text-foreground/40 mt-10">
                    Powered by iExec Bellecour & Web3Mail
                </p>
            </div>
        </section>
    );
}

// Wrapper with Suspense for Next.js static build compatibility
export function WhitelistSectionWrapper() {
    return (
        <Suspense fallback={<div className="py-32 text-center font-mono text-foreground/40">Cargando whitelist...</div>}>
            <WhitelistSection />
        </Suspense>
    );
}

// Extend Window interface for ethereum
declare global {
    interface Window {
        ethereum?: {
            request: (args: { method: string; params?: unknown[] }) => Promise<string[]>;
            on: (event: string, callback: (accounts: string[]) => void) => void;
        };
    }
}
