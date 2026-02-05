"use client"

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ExternalLink, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

// =============================================================================
// TYPES
// =============================================================================

type WalletType = 'metamask' | 'coinbase' | 'walletconnect'

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'error'

interface WalletInfo {
    id: WalletType
    name: string
    icon: string
    description: string
    installed?: boolean
    downloadUrl: string
}

interface WalletModalProps {
    isOpen: boolean
    onClose: () => void
    onConnect: (address: string, provider: any) => void
    targetChainId?: number
}

// =============================================================================
// EIP-6963 PROVIDER DISCOVERY
// =============================================================================

interface EIP6963Provider {
    info: {
        uuid: string
        name: string
        icon: string
        rdns: string
    }
    provider: any
}

let eip6963Providers: EIP6963Provider[] = []
let eip6963Initialized = false

function initEIP6963() {
    if (typeof window === 'undefined' || eip6963Initialized) return

    eip6963Initialized = true

    window.addEventListener('eip6963:announceProvider', (event: any) => {
        const { info, provider } = event.detail
        if (!eip6963Providers.find(p => p.info.rdns === info.rdns)) {
            eip6963Providers.push({ info, provider })
        }
    })

    window.dispatchEvent(new Event('eip6963:requestProvider'))
}

// =============================================================================
// WALLET DEFINITIONS
// =============================================================================

const WALLETS: WalletInfo[] = [
    {
        id: 'metamask',
        name: 'MetaMask',
        icon: '🦊',
        description: 'Connect with MetaMask browser extension',
        downloadUrl: 'https://metamask.io/download/'
    },
    {
        id: 'coinbase',
        name: 'Coinbase Wallet',
        icon: '🔵',
        description: 'Connect with Coinbase Wallet',
        downloadUrl: 'https://www.coinbase.com/wallet'
    },
    {
        id: 'walletconnect',
        name: 'WalletConnect',
        icon: '🔗',
        description: 'Scan with your mobile wallet',
        downloadUrl: ''
    }
]

// iExec Bellecour Network Config
const BELLECOUR_CONFIG = {
    chainId: 134,
    chainIdHex: '0x86',
    chainName: 'iExec Sidechain',
    nativeCurrency: { name: 'xRLC', symbol: 'xRLC', decimals: 18 },
    rpcUrls: ['https://bellecour.iex.ec'],
    blockExplorerUrls: ['https://blockscout-bellecour.iex.ec']
}

// =============================================================================
// WALLET MODAL COMPONENT
// =============================================================================

export function WalletModal({ isOpen, onClose, onConnect, targetChainId = 134 }: WalletModalProps) {
    const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null)
    const [connectionState, setConnectionState] = useState<ConnectionState>('idle')
    const [errorMessage, setErrorMessage] = useState('')
    const [installedWallets, setInstalledWallets] = useState<Set<WalletType>>(new Set())

    // Detect installed wallets
    useEffect(() => {
        if (!isOpen) return

        initEIP6963()

        // Wait a bit for EIP-6963 announcements
        const timer = setTimeout(() => {
            const installed = new Set<WalletType>()

            // Check EIP-6963 providers
            eip6963Providers.forEach(p => {
                if (p.info.rdns === 'io.metamask' || p.info.name.toLowerCase().includes('metamask')) {
                    installed.add('metamask')
                }
                if (p.info.rdns === 'com.coinbase.wallet' || p.info.name.toLowerCase().includes('coinbase')) {
                    installed.add('coinbase')
                }
            })

            // Legacy detection
            const ethereum = (window as any).ethereum
            if (ethereum) {
                if (ethereum.isMetaMask) installed.add('metamask')
                if (ethereum.isCoinbaseWallet) installed.add('coinbase')

                // Check providers array
                if (ethereum.providers) {
                    ethereum.providers.forEach((p: any) => {
                        if (p.isMetaMask) installed.add('metamask')
                        if (p.isCoinbaseWallet) installed.add('coinbase')
                    })
                }
            }

            setInstalledWallets(installed)
        }, 200)

        return () => clearTimeout(timer)
    }, [isOpen])

    // Get provider for specific wallet
    const getProvider = useCallback((walletType: WalletType): any | null => {
        // Try EIP-6963 first
        if (walletType === 'metamask') {
            const mm = eip6963Providers.find(p =>
                p.info.rdns === 'io.metamask' || p.info.name.toLowerCase().includes('metamask')
            )
            if (mm) return mm.provider
        }

        if (walletType === 'coinbase') {
            const cb = eip6963Providers.find(p =>
                p.info.rdns === 'com.coinbase.wallet' || p.info.name.toLowerCase().includes('coinbase')
            )
            if (cb) return cb.provider
        }

        // Legacy fallback
        const ethereum = (window as any).ethereum
        if (!ethereum) return null

        if (ethereum.providers) {
            if (walletType === 'metamask') {
                return ethereum.providers.find((p: any) => p.isMetaMask)
            }
            if (walletType === 'coinbase') {
                return ethereum.providers.find((p: any) => p.isCoinbaseWallet)
            }
        }

        // Single provider
        if (walletType === 'metamask' && ethereum.isMetaMask) return ethereum
        if (walletType === 'coinbase' && ethereum.isCoinbaseWallet) return ethereum

        return ethereum
    }, [])

    // Switch network to Bellecour
    const switchNetwork = async (provider: any): Promise<boolean> => {
        try {
            const chainId = await provider.request({ method: 'eth_chainId' })
            if (parseInt(chainId, 16) === targetChainId) return true

            try {
                await provider.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: BELLECOUR_CONFIG.chainIdHex }]
                })
                return true
            } catch (switchError: any) {
                if (switchError.code === 4902) {
                    await provider.request({
                        method: 'wallet_addEthereumChain',
                        params: [BELLECOUR_CONFIG]
                    })
                    return true
                }
                throw switchError
            }
        } catch (error) {
            console.error('Network switch error:', error)
            return false
        }
    }

    // Connect to selected wallet
    const connectWallet = async (walletType: WalletType) => {
        setSelectedWallet(walletType)
        setConnectionState('connecting')
        setErrorMessage('')

        // WalletConnect requires special handling (not implemented in this version)
        if (walletType === 'walletconnect') {
            setErrorMessage('WalletConnect coming soon. Please use MetaMask or Coinbase Wallet.')
            setConnectionState('error')
            return
        }

        const provider = getProvider(walletType)

        if (!provider) {
            const wallet = WALLETS.find(w => w.id === walletType)
            setErrorMessage(`${wallet?.name} not found. Please install it first.`)
            setConnectionState('error')
            return
        }

        try {
            // Request accounts
            const accounts = await provider.request({ method: 'eth_requestAccounts' })

            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts found')
            }

            // Switch to correct network
            const networkOk = await switchNetwork(provider)
            if (!networkOk) {
                throw new Error('Failed to switch to iExec Bellecour network')
            }

            // Success!
            setConnectionState('connected')

            // Notify parent after brief delay to show success state
            setTimeout(() => {
                onConnect(accounts[0], provider)
                onClose()
            }, 1000)

        } catch (error: any) {
            console.error('Connection error:', error)

            if (error.code === 4001) {
                setErrorMessage('Connection rejected. Please try again.')
            } else {
                setErrorMessage(error.message || 'Failed to connect. Please try again.')
            }
            setConnectionState('error')
        }
    }

    // Reset state
    const goBack = () => {
        setSelectedWallet(null)
        setConnectionState('idle')
        setErrorMessage('')
    }

    const handleClose = () => {
        goBack()
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md mx-4 bg-background border border-primary/30 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-primary/20">
                    {selectedWallet && connectionState !== 'idle' ? (
                        <button
                            onClick={goBack}
                            className="p-1 hover:bg-primary/10 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-foreground/60" />
                        </button>
                    ) : (
                        <div className="w-7" />
                    )}

                    <h2 className="text-lg font-semibold text-foreground">
                        {selectedWallet
                            ? WALLETS.find(w => w.id === selectedWallet)?.name
                            : 'Connect Wallet'}
                    </h2>

                    <button
                        onClick={handleClose}
                        className="p-1 hover:bg-primary/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-foreground/60" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {connectionState === 'idle' && (
                        <div className="space-y-3">
                            {WALLETS.map(wallet => (
                                <button
                                    key={wallet.id}
                                    onClick={() => connectWallet(wallet.id)}
                                    className="w-full flex items-center gap-4 p-4 bg-background hover:bg-primary/5 border border-primary/20 hover:border-primary/40 rounded-xl transition-all group"
                                >
                                    <span className="text-3xl">{wallet.icon}</span>
                                    <div className="flex-1 text-left">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-foreground">
                                                {wallet.name}
                                            </span>
                                            {installedWallets.has(wallet.id) && (
                                                <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full font-medium">
                                                    INSTALLED
                                                </span>
                                            )}
                                            {wallet.id === 'walletconnect' && (
                                                <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full font-medium">
                                                    QR CODE
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-foreground/50">
                                            {wallet.description}
                                        </p>
                                    </div>
                                    <ChevronLeft className="w-5 h-5 text-foreground/30 rotate-180 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ))}
                        </div>
                    )}

                    {connectionState === 'connecting' && (
                        <div className="flex flex-col items-center py-8">
                            <div className="text-6xl mb-6 animate-bounce">
                                {WALLETS.find(w => w.id === selectedWallet)?.icon}
                            </div>
                            <h3 className="text-lg font-medium text-foreground mb-2">
                                Continue in {WALLETS.find(w => w.id === selectedWallet)?.name}
                            </h3>
                            <p className="text-sm text-foreground/50 text-center mb-6">
                                Accept the connection request in your wallet
                            </p>
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        </div>
                    )}

                    {connectionState === 'connected' && (
                        <div className="flex flex-col items-center py-8">
                            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">
                                Connected!
                            </h3>
                            <p className="text-sm text-foreground/50">
                                Redirecting...
                            </p>
                        </div>
                    )}

                    {connectionState === 'error' && (
                        <div className="flex flex-col items-center py-8">
                            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">
                                Connection Failed
                            </h3>
                            <p className="text-sm text-foreground/50 text-center mb-6">
                                {errorMessage}
                            </p>
                            <button
                                onClick={() => selectedWallet && connectWallet(selectedWallet)}
                                className="px-6 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg text-foreground transition-colors"
                            >
                                ⟳ Try again
                            </button>

                            {selectedWallet && !installedWallets.has(selectedWallet) && (
                                <a
                                    href={WALLETS.find(w => w.id === selectedWallet)?.downloadUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 text-sm text-primary hover:underline flex items-center gap-1"
                                >
                                    Don't have {WALLETS.find(w => w.id === selectedWallet)?.name}?
                                    <span className="font-medium">Get</span>
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-primary/10 bg-primary/5">
                    <p className="text-xs text-center text-foreground/40">
                        By connecting, you agree to our Terms of Service
                    </p>
                </div>
            </div>
        </div>
    )
}
