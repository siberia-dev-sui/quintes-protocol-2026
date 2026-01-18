"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pill } from "./pill";
import { Button } from "./ui/button";
import { NETWORK_CONFIG } from "@/lib/network-config";

// =============================================================================
// iEXEC WEB3MAIL INTEGRATION (User Pays Gas)
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
 * Check and switch to Arbitrum Sepolia network
 */
async function ensureCorrectNetwork(): Promise<boolean> {
    if (!window.ethereum) return false;

    try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const currentChainId = parseInt(chainId as unknown as string, 16);

        if (currentChainId === NETWORK_CONFIG.chainId) return true;

        // Try to switch network
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: NETWORK_CONFIG.chainIdHex }]
            });
            return true;
        } catch (switchError: unknown) {
            // Network not added, try to add it
            if ((switchError as { code: number }).code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: NETWORK_CONFIG.chainIdHex,
                        chainName: NETWORK_CONFIG.chainName,
                        nativeCurrency: NETWORK_CONFIG.nativeCurrency,
                        rpcUrls: [NETWORK_CONFIG.rpcUrl],
                        blockExplorerUrls: [NETWORK_CONFIG.blockExplorer]
                    }]
                });
                return true;
            }
            throw switchError;
        }
    } catch (error) {
        console.error('Network switch error:', error);
        return false;
    }
}

// =============================================================================
// COMPONENT
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
            console.log("Whitelist signup (FREE):", email);
            // TODO: Send to backend/database
        }
    };

    // =========================================================================
    // PREMIUM VERSION - Connect Wallet
    // =========================================================================
    const connectWallet = async () => {
        if (typeof window.ethereum === "undefined") {
            toast.error("MetaMask is not installed", {
                description: "Please install MetaMask to continue.",
                action: {
                    label: "Install",
                    onClick: () => window.open("https://metamask.io/download/", "_blank")
                }
            });
            return;
        }

        setIsConnecting(true);
        try {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts"
            });

            if (accounts && accounts.length > 0) {
                // Check/switch network
                const correctNetwork = await ensureCorrectNetwork();
                if (!correctNetwork) {
                    toast.warning(`Please switch to ${NETWORK_CONFIG.chainName} in MetaMask`);
                    setIsConnecting(false);
                    return;
                }

                setWalletAddress(accounts[0]);
                setWalletConnected(true);
            }
        } catch (error) {
            console.error("Connection error:", error);
            toast.error("Failed to connect wallet", {
                description: "Please try again."
            });
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
            // Ensure correct network
            const correctNetwork = await ensureCorrectNetwork();
            if (!correctNetwork) {
                throw new Error(`Please switch to ${NETWORK_CONFIG.chainName}`);
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
            console.log("✅ Email protected:", protectedData.address);

            // STEP 2: Grant Access to Web3Mail App (User signs TX #2)
            // This allows the Web3Mail iApp to process the protected email
            setSubmitStatus("🔑 Granting access...");
            await dataProtector.grantAccess({
                protectedData: protectedData.address,
                authorizedApp: WEB3MAIL_APP_WHITELIST, // iExec Web3Mail whitelist
                authorizedUser: '0x0000000000000000000000000000000000000000', // Allow any user (sender)
                numberOfAccess: 1000 // Allow multiple emails to be sent
            });
            console.log("✅ Access granted to Web3Mail");

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
            console.log("✅ Email sent successfully");

            // Success!
            setPremiumSuccess(true);
            setSubmitStatus("✅ Successfully whitelisted!");

        } catch (error: unknown) {
            console.error("❌ iExec Whitelist Error:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            toast.error("Registration failed", {
                description: errorMessage
            });
            setSubmitStatus("");
        } finally {
            setIsSubmitting(false);
        }
    };

    // =========================================================================
    // RENDER
    // =========================================================================
    return (
        <section id="whitelist" className="section-with-guides py-32 px-6">
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

                {/* TABS */}
                <div className="flex gap-3 justify-center mb-10">
                    <button
                        onClick={() => setActiveTab('free')}
                        className={`px-6 py-3 font-mono text-sm uppercase transition-all border ${activeTab === 'free'
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-foreground/60 hover:text-foreground hover:border-foreground/30'
                            }`}
                        style={{
                            clipPath: "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)"
                        }}
                    >
                        [FREE] Standard
                    </button>
                    <button
                        onClick={() => setActiveTab('premium')}
                        className={`px-6 py-3 font-mono text-sm uppercase transition-all border relative ${activeTab === 'premium'
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-foreground/60 hover:text-foreground hover:border-foreground/30'
                            }`}
                        style={{
                            clipPath: "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)"
                        }}
                    >
                        <span className="inline-block size-1.5 rounded-full bg-primary shadow-glow shadow-primary/50 mr-2" />
                        [PREMIUM] Verified
                    </button>
                </div>

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
                                        className="w-full sm:w-auto min-w-[280px] px-6 py-4 bg-background border border-border font-mono text-foreground placeholder:text-foreground/40 focus:border-primary/50 focus:outline-none transition-colors"
                                        style={{
                                            clipPath: "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)"
                                        }}
                                    />
                                    <Button type="submit" size="sm">
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

                                    <input
                                        type="email"
                                        value={proEmail}
                                        onChange={(e) => setProEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        disabled={isSubmitting}
                                        className="w-full px-6 py-4 bg-background border border-border font-mono text-foreground placeholder:text-foreground/40 focus:border-primary/50 focus:outline-none transition-colors disabled:opacity-50"
                                        style={{
                                            clipPath: "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)"
                                        }}
                                    />

                                    <Button
                                        onClick={joinVerifiedWhitelist}
                                        disabled={isSubmitting}
                                        size="sm"
                                        className="w-full"
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
                                        ⚠️ Requires ETH on Arbitrum Sepolia for gas
                                    </p>
                                </div>
                            ) : (
                                // Not Connected - Show Connect Button
                                <div className="space-y-4">
                                    <Button
                                        onClick={connectWallet}
                                        disabled={isConnecting}
                                        size="sm"
                                        className="w-full"
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

                                    <p className="font-mono text-xs text-foreground/40 text-center">
                                        Privacy-preserving signup via wallet.<br />
                                        Your email is encrypted on-chain using <span className="text-primary">iExec TEE</span>.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <p className="font-mono text-xs text-foreground/40 mt-10">
                    Powered by Arbitrum & iExec
                </p>
            </div>
        </section>
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
