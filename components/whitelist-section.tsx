"use client";

import { useState, Suspense, useRef } from "react";
import { toast } from "sonner";
import { Pill } from "./pill";
import { Button } from "./ui/button";
import { WalletModal } from "./wallet-modal";
import { generateReferralCode } from "@/lib/referral";
import { logger, sanitizeForLog } from "@/utils/logger";
// Note: iExec SDK imports have been removed — all iExec operations now run server-side

// =============================================================================
// IEXEC NETWORK CONFIGURATION (Hybrid: Mainnet & Testnet)
// =============================================================================

// 1. CONFIGURATION TOGGLE
// 'mainnet' = Arbitrum One (Production)
// 'testnet' = Arbitrum Sepolia (Testing)
// 'sidechain' = Bellecour (Legacy)
const NETWORK_MODE = 'mainnet' as 'mainnet' | 'testnet' | 'sidechain';

// 2. MAINNET CONFIG (Arbitrum One)
const IEXEC_MAINNET_CONFIG = {
    chainId: 42161,
    chainIdHex: '0xa4b1',
    chainName: 'Arbitrum One',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorer: 'https://arbiscan.io',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }
};

// 3. LEGACY SIDECHAIN CONFIG (iExec Bellecour)
const IEXEC_BELLECOUR_CONFIG = {
    chainId: 134,
    chainIdHex: '0x86',
    chainName: 'iExec Bellecour',
    rpcUrl: 'https://bellecour.iex.ec',
    blockExplorer: 'https://blockscout-bellecour.iex.ec',
    nativeCurrency: { name: 'xRLC', symbol: 'xRLC', decimals: 18 }
};

// 4. TESTNET CONFIG (Arbitrum Sepolia)
const IEXEC_TESTNET_CONFIG = {
    chainId: 421614,
    chainIdHex: '0x66eee',
    chainName: 'Arbitrum Sepolia',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    blockExplorer: 'https://sepolia.arbiscan.io',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }
};

// 5. ACTIVE CONFIGURATION
const CURRENT_CONFIG = NETWORK_MODE === 'mainnet'
    ? IEXEC_MAINNET_CONFIG
    : NETWORK_MODE === 'sidechain'
        ? IEXEC_BELLECOUR_CONFIG
        : IEXEC_TESTNET_CONFIG;

const IEXEC_CHAIN_ID = CURRENT_CONFIG.chainId;

console.log(`[CONFIG] Running in ${NETWORK_MODE} mode on ${CURRENT_CONFIG.chainName}`);

// =============================================================================
// WALLET PROVIDER DETECTION (EIP-6963 + Legacy Support)
// =============================================================================

// Store for EIP-6963 discovered providers
let eip6963Providers: Array<{ info: { rdns: string; name: string }; provider: any }> = [];
let eip6963Initialized = false;

/**
 * Initialize EIP-6963 provider discovery (Modern standard - avoids window.ethereum conflicts)
 * https://eips.ethereum.org/EIPS/eip-6963
 */
function initEIP6963() {
    if (typeof window === 'undefined' || eip6963Initialized) return;

    eip6963Initialized = true;

    // Listen for wallet announcements
    window.addEventListener('eip6963:announceProvider', (event: any) => {
        const { info, provider } = event.detail;
        console.log('[DEBUG] EIP-6963: Wallet announced:', info.name, info.rdns);

        // Don't add duplicates
        if (!eip6963Providers.find(p => p.info.rdns === info.rdns)) {
            eip6963Providers.push({ info, provider });
        }
    });

    // Request all wallets to announce themselves
    window.dispatchEvent(new Event('eip6963:requestProvider'));
    console.log('[DEBUG] EIP-6963: Requested provider announcements');
}

/**
 * Get MetaMask provider using EIP-6963 first, then legacy fallback
 */
function getMetaMaskProvider(): any | null {
    if (typeof window === 'undefined') return null;

    // Initialize EIP-6963 if not done
    initEIP6963();

    // Give wallets a moment to announce (they do so asynchronously)
    // Check EIP-6963 providers first
    const metamaskEIP6963 = eip6963Providers.find(p =>
        p.info.rdns === 'io.metamask' ||
        p.info.name.toLowerCase().includes('metamask')
    );

    if (metamaskEIP6963) {
        console.log('[DEBUG] ✅ Found MetaMask via EIP-6963:', metamaskEIP6963.info.name);
        return metamaskEIP6963.provider;
    }

    // Log all discovered providers for debugging
    if (eip6963Providers.length > 0) {
        console.log('[DEBUG] EIP-6963 providers found:', eip6963Providers.map(p => p.info.name));
    }

    // === LEGACY FALLBACK (window.ethereum) ===
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ethereum = window.ethereum as any;
    if (!ethereum) {
        console.log('[DEBUG] No window.ethereum found');
        return null;
    }

    console.log('[DEBUG] Falling back to legacy window.ethereum detection');

    // Case 1: Multiple providers array exists
    if (ethereum.providers && Array.isArray(ethereum.providers)) {
        const metaMaskProvider = ethereum.providers.find((provider: any) => {
            return provider.isMetaMask &&
                !provider.isCoinbaseWallet &&
                !provider.isRabby &&
                !provider.isPhantom &&
                !provider.isBraveWallet;
        });

        if (metaMaskProvider) {
            console.log('[DEBUG] ✅ Found MetaMask in legacy providers array');
            return metaMaskProvider;
        }

        // Just take first with isMetaMask
        const anyMetaMask = ethereum.providers.find((p: any) => p.isMetaMask);
        if (anyMetaMask) {
            console.log('[DEBUG] ⚠️ Using first isMetaMask provider');
            return anyMetaMask;
        }
    }

    // Case 2: Single provider 
    if (ethereum.isMetaMask && !ethereum.isCoinbaseWallet && !ethereum.isRabby) {
        console.log('[DEBUG] ✅ Found MetaMask as single provider');
        return ethereum;
    }

    // Case 3: providerMap
    if (ethereum.providerMap) {
        const metamaskFromMap = ethereum.providerMap.get('MetaMask');
        if (metamaskFromMap) {
            console.log('[DEBUG] ✅ Found MetaMask in providerMap');
            return metamaskFromMap;
        }
    }

    // Last resort
    console.warn('[DEBUG] ⚠️ Using default ethereum (may have conflicts)');
    return ethereum;
}

// =============================================================================
// iEXEC WEB3MAIL INTEGRATION (Gasless - Sponsor pays gas)
// =============================================================================

// Web3Mail iApp whitelist addresses (NETWORK-SPECIFIC)
// Bellecour: 0x781482C39CcE25546583EaC4957Fb7Bf04C277D2
// Arbitrum One: 0xD5054a18565c4a9E5c1aa3cEB53258bd59d4c78C
const WEB3MAIL_APP_WHITELIST = NETWORK_MODE === 'sidechain'
    ? '0x781482C39CcE25546583EaC4957Fb7Bf04C277D2'  // Bellecour
    : '0xD5054a18565c4a9E5c1aa3cEB53258bd59d4c78C'; // Arbitrum One & Sepolia

/**
 * Initialize iExec DataProtector SDK for protectData & grantAccess
 * Note: User's MetaMask signer is used (user signs & pays gas)
 */
async function initializeDataProtector(provider?: any) {
    const { IExecDataProtectorCore } = await import('@iexec/dataprotector');
    const ethProvider = provider || window.ethereum!;
    return new IExecDataProtectorCore(ethProvider);
}

/**
 * Initialize iExec Web3Mail SDK for sendEmail
 */
async function initializeWeb3Mail(walletProvider?: any) {
    const { IExecWeb3mail } = await import('@iexec/web3mail');
    const { BrowserProvider } = await import('ethers');

    const ethProvider = walletProvider || window.ethereum!;
    const provider = new BrowserProvider(ethProvider);
    const signer = await provider.getSigner();

    return new IExecWeb3mail(signer);
}

/**
 * Switch to iExec Bellecour network (CRITICAL FIX)
 * This is the ONLY network where the Web3Mail contracts are deployed.
 */
/**
 * Switch to the configured iExec network (Mainnet or Testnet)
 * Controlled by CURRENT_CONFIG
 */
async function switchNetwork(optionalProvider?: any): Promise<boolean> {
    console.log(`[DEBUG] switchNetwork: Switching to ${CURRENT_CONFIG.chainName}...`);
    const provider = optionalProvider || getMetaMaskProvider();
    if (!provider) {
        console.log('[DEBUG] switchNetwork: No MetaMask provider found');
        return false;
    }

    try {
        console.log('[DEBUG] Getting current chainId...');
        const chainId = await provider.request({ method: 'eth_chainId' });
        console.log('[DEBUG] Current chainId:', chainId);
        const currentChainId = parseInt(chainId as unknown as string, 16);
        console.log('[DEBUG] Parsed chainId:', currentChainId);

        if (currentChainId === CURRENT_CONFIG.chainId) {
            console.log(`[DEBUG] Already on ${CURRENT_CONFIG.chainName}!`);
            return true;
        }

        // Try to switch network
        console.log(`[DEBUG] Switching to ${CURRENT_CONFIG.chainName}...`);
        try {
            await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: CURRENT_CONFIG.chainIdHex }]
            });
            console.log('[DEBUG] Network switched successfully!');
            return true;
        } catch (switchError: unknown) {
            console.log('[DEBUG] Switch error:', switchError);
            // Network not added, try to add it
            if ((switchError as { code: number }).code === 4902) {
                console.log(`[DEBUG] Network not found, adding ${CURRENT_CONFIG.chainName}...`);
                await provider.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: CURRENT_CONFIG.chainIdHex,
                        chainName: CURRENT_CONFIG.chainName,
                        nativeCurrency: CURRENT_CONFIG.nativeCurrency,
                        rpcUrls: [CURRENT_CONFIG.rpcUrl],
                        blockExplorerUrls: [CURRENT_CONFIG.blockExplorer]
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
    const [isFreeSubmitting, setIsFreeSubmitting] = useState(false);


    // PREMIUM version state
    const [proEmail, setProEmail] = useState("");
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState("");
    const [isConnecting, setIsConnecting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState("");
    const [premiumSuccess, setPremiumSuccess] = useState(false);
    const [currentStep, setCurrentStep] = useState(0); // 0 = not started, 1-4 = active steps

    // Step definitions for the progress stepper
    const REGISTRATION_STEPS = [
        { id: 1, label: 'Encrypt', desc: 'Encrypting your email on-chain', icon: '🔒' },
        { id: 2, label: 'Access', desc: 'Granting Web3Mail permission', icon: '🔑' },
        { id: 3, label: 'Prepare', desc: 'Setting up iExec account', icon: '💰' },
        { id: 4, label: 'Confirm', desc: 'Sending confirmation email', icon: '📨' },
    ];

    // Wallet Modal state
    const [showWalletModal, setShowWalletModal] = useState(false);
    const connectedProviderRef = useRef<any>(null);

    const shortenAddress = (address: string) => {
        return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
    };

    // Handle wallet connection from modal
    const handleWalletConnect = (address: string, provider: any) => {
        setWalletAddress(address);
        setWalletConnected(true);
        connectedProviderRef.current = provider;
        toast.success("Wallet Connected", {
            description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`
        });
    };

    // =========================================================================
    // FREE VERSION - Simple Email
    // =========================================================================
    const handleFreeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            toast.error("Please enter a valid email address");
            return;
        }

        setIsFreeSubmitting(true);
        logger.info("Whitelist signup (FREE):", sanitizeForLog(email));

        try {
            const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null;

            const response = await fetch('/api/whitelist/free', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    user_agent: userAgent
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                // If it's a duplicate email, show a friendlier message
                if (result.error === 'Email already registered') {
                    toast.info("This email is already on the waitlist!");
                    setFreeSubmitted(true);
                    return;
                }
                throw new Error(result.error || "Failed to save email to database");
            }

            setFreeSubmitted(true);
            toast.success("Joined Whitelist", {
                description: "We'll be in touch soon!"
            });
        } catch (error) {
            logger.error("Free Whitelist Registration Error:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            toast.error("Registration failed", {
                description: errorMessage
            });
        } finally {
            setIsFreeSubmitting(false);
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
                const correctNetwork = await switchNetwork();
                console.log('[DEBUG] Network switch result:', correctNetwork);
                if (!correctNetwork) {
                    toast.warning(`Please switch to ${CURRENT_CONFIG.chainName} in MetaMask`);
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
        setCurrentStep(0);
        setSubmitStatus("Initializing...");

        try {
            // Use stored provider if available (EIP-6963), else fallback to detection
            const provider = connectedProviderRef.current || getMetaMaskProvider();

            if (!provider) {
                toast.error("Wallet not found. Please connect first.");
                setSubmitStatus("Error: No wallet found");
                setIsSubmitting(false);
                return;
            }

            // Ensure correct network matches our config (Arbitrum One, Sepolia, or Bellecour)
            const correctNetwork = await switchNetwork(provider);
            if (!correctNetwork) {
                throw new Error(`Please switch to ${CURRENT_CONFIG.chainName}`);
            }

            // =====================================================================
            // SERVER-SIDE iExec EXECUTION (Zero MetaMask Popups)
            // The backend handles ALL iExec operations:
            //   protectData → grantAccess → deposit → sendEmail
            // User signs NOTHING. Server wallet pays all gas + RLC fees.
            // =====================================================================
            setCurrentStep(1);
            setSubmitStatus("Processing your registration...");

            const iexecResponse = await fetch('/api/whitelist/iexec-execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: proEmail, walletAddress }),
            });

            const iexecResult = await iexecResponse.json();

            if (!iexecResponse.ok || !iexecResult.success) {
                throw new Error(iexecResult.error || 'Server-side iExec execution failed');
            }

            logger.info("Server-side iExec complete:", iexecResult.protectedDataAddress);
            setCurrentStep(2);
            setSubmitStatus("Saving your profile...");

            // Save to database
            const refCode = generateReferralCode();
            const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null;

            try {
                const response = await fetch('/api/whitelist/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        wallet_address: walletAddress,
                        protected_data_address: iexecResult.protectedDataAddress,
                        referral_code: refCode,
                        user_agent: userAgent
                    })
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.error || "Failed to save to database");
                }
            } catch (dbError) {
                logger.error("DB Error (non-fatal):", dbError);
                toast.warning("Profile saved on blockchain, but database sync had an issue.", {
                    description: "Your whitelist spot is secured. We'll sync your profile shortly."
                });
            }

            // Success!
            setPremiumSuccess(true);
            setSubmitStatus("✅ Successfully whitelisted!");
            toast.success("You're in!", { description: `Your referral code: ${refCode}` });

        } catch (error: unknown) {
            logger.error("Whitelist Error:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";

            toast.error("Registration failed", {
                description: errorMessage
            });
            setSubmitStatus("");
            setCurrentStep(0);

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

                <h2 className="text-3xl md:text-4xl lg:text-5xl font-sentient mb-6">
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
                                        disabled={isFreeSubmitting}
                                        className="w-full sm:w-auto min-w-[280px] px-6 py-4 bg-background border border-border font-mono text-foreground placeholder:text-foreground/40 focus:border-primary/50 focus:shadow-lg focus:shadow-primary/20 focus:scale-[1.02] focus:outline-none transition-all duration-300 disabled:opacity-50"
                                        style={{
                                            clipPath: "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)"
                                        }}
                                    />
                                    <Button type="submit" size="sm" disabled={isFreeSubmitting} className="hover:scale-105 hover:-translate-y-0.5 transition-transform duration-300">
                                        {isFreeSubmitting ? (
                                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8" />
                                            </svg>
                                        ) : (
                                            "[Subscribe]"
                                        )}
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

                                    {/* Progress Stepper - shown during registration */}
                                    {isSubmitting && currentStep > 0 && (
                                        <div className="mb-6 p-4 border border-border/50 bg-background/80 backdrop-blur-sm" style={{
                                            clipPath: "polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)"
                                        }}>
                                            <div className="flex items-center justify-between mb-3">
                                                {REGISTRATION_STEPS.map((step, idx) => (
                                                    <div key={step.id} className="flex items-center flex-1">
                                                        <div className={`flex flex-col items-center gap-1 flex-1 transition-all duration-500 ${step.id < currentStep ? 'opacity-100' :
                                                            step.id === currentStep ? 'opacity-100 scale-110' :
                                                                'opacity-30'
                                                            }`}>
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 ${step.id < currentStep
                                                                ? 'border-green-500 bg-green-500/20 text-green-400'
                                                                : step.id === currentStep
                                                                    ? 'border-primary bg-primary/20 text-primary animate-pulse shadow-lg shadow-primary/30'
                                                                    : 'border-border bg-background text-foreground/30'
                                                                }`}>
                                                                {step.id < currentStep ? '✓' : step.icon}
                                                            </div>
                                                            <span className={`text-[10px] font-mono uppercase tracking-wider ${step.id === currentStep ? 'text-primary font-bold' :
                                                                step.id < currentStep ? 'text-green-400' : 'text-foreground/30'
                                                                }`}>{step.label}</span>
                                                        </div>
                                                        {idx < REGISTRATION_STEPS.length - 1 && (
                                                            <div className={`h-[2px] flex-1 mx-1 transition-all duration-500 ${step.id < currentStep ? 'bg-green-500/60' : 'bg-border/30'
                                                                }`} />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-xs font-mono text-primary/80 text-center animate-pulse">
                                                {submitStatus}
                                            </p>
                                        </div>
                                    )}

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
                                                Step {currentStep} of 4 — Check MetaMask
                                            </>
                                        ) : (
                                            "[Join Verified Whitelist]"
                                        )}
                                    </Button>

                                    <p className="font-mono text-xs text-foreground/40 text-center">
                                        ⚠️ Gas: ETH | Service: 5 RLC. <a href="https://app.uniswap.org/explore/tokens/arbitrum/0xe649e6a1f2afc63ca268c2363691cecaf75cf47c" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Get RLC (Uniswap) →</a>
                                    </p>
                                </div>
                            ) : (
                                // Not Connected - Show Connect Button
                                <div className="space-y-4">
                                    <Button
                                        onClick={() => setShowWalletModal(true)}
                                        size="sm"
                                        className="w-full hover:scale-105 hover:-translate-y-0.5 transition-transform duration-300"
                                    >
                                        [Connect Wallet]
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
                    Powered by iExec Protocol &amp; Web3Mail
                </p>
            </div>

            {/* Wallet Connection Modal */}
            <WalletModal
                isOpen={showWalletModal}
                onClose={() => setShowWalletModal(false)}
                onConnect={handleWalletConnect}
                targetChainId={CURRENT_CONFIG.chainId}
                networkConfig={CURRENT_CONFIG}
            />
        </section>
    );
}

// Wrapper with Suspense for Next.js static build compatibility
export function WhitelistSectionWrapper() {
    return (
        <Suspense fallback={<div className="py-32 text-center font-mono text-foreground/40">Loading whitelist...</div>}>
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
