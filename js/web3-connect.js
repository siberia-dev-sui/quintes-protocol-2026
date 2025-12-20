/**
 * Web3 Connection Manager - Vanilla JS
 * Handles MetaMask wallet connection and network switching
 * Based on useWeb3.js from quintes-proof-v4
 */

(function() {
    'use strict';

    // ============================================================================
    // CONFIGURATION
    // ============================================================================
    
    const NETWORK_CONFIG = {
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
    };

    // ============================================================================
    // STATE
    // ============================================================================

    let connectedAddress = null;
    let isCorrectNetwork = false;

    // ============================================================================
    // HELPER FUNCTIONS
    // ============================================================================

    /**
     * Check if MetaMask is installed
     */
    function isMetaMaskInstalled() {
        return typeof window.ethereum !== 'undefined';
    }

    /**
     * Shorten address for display
     */
    function shortenAddress(address) {
        if (!address) return '';
        return address.substring(0, 6) + '...' + address.substring(38);
    }

    /**
     * Check current network
     */
    async function checkNetwork() {
        if (!window.ethereum) return false;
        
        try {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            const currentChainId = parseInt(chainId, 16);
            isCorrectNetwork = currentChainId === NETWORK_CONFIG.chainId;
            return isCorrectNetwork;
        } catch (err) {
            console.error('Error checking network:', err);
            return false;
        }
    }

    /**
     * Switch to Arbitrum Sepolia network
     */
    async function switchNetwork() {
        if (!window.ethereum) return false;

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: NETWORK_CONFIG.chainIdHex }]
            });
            isCorrectNetwork = true;
            return true;
        } catch (switchError) {
            // Network not added, try to add it
            if (switchError.code === 4902) {
                try {
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
                    isCorrectNetwork = true;
                    return true;
                } catch (addError) {
                    console.error('Error adding network:', addError);
                    return false;
                }
            }
            console.error('Error switching network:', switchError);
            return false;
        }
    }

    // ============================================================================
    // UI UPDATE FUNCTIONS
    // ============================================================================

    /**
     * Update button UI after connection
     */
    function updateButtonUI(button, address) {
        if (!button) return;
        
        const shortened = shortenAddress(address);
        button.innerHTML = `
            <span style="display: inline-flex; align-items: center; gap: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                </svg>
                ${shortened}
            </span>
        `;
        button.style.background = 'linear-gradient(90deg, #10B981 0%, #059669 100%)';
        button.style.cursor = 'default';
    }

    /**
     * Show email input form after wallet connection
     */
    function showEmailInput(container) {
        // Find the premium card container
        const premiumCard = container.closest('.whitelist-card.premium');
        if (!premiumCard) return;

        // Create connected state UI
        const connectedHTML = `
            <div class="wallet-connected-state" style="text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; margin-bottom: 16px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2">
                        <path d="M9 12L11 14L15 10"/>
                        <circle cx="12" cy="12" r="10"/>
                    </svg>
                    <span style="color: #10B981; font-size: 14px; font-weight: 600;">Connected: ${shortenAddress(connectedAddress)}</span>
                </div>
                <p style="color: rgba(255,255,255,0.6); font-size: 13px; margin-bottom: 12px;">Enter your email to complete Web3 signup:</p>
                <input type="email" id="web3-email-input" class="whitelist-input" placeholder="Enter your email" style="margin-bottom: 12px;">
                <button id="web3-submit-btn" class="whitelist-btn primary" style="width: 100%;">
                    Join Verified Whitelist
                </button>
                <p class="powered-by" style="margin-top: 12px;">Powered by <span>iExec</span> Confidential Computing</p>
            </div>
        `;

        // Replace button with connected state
        const buttonContainer = premiumCard.querySelector('.whitelist-btn.primary');
        if (buttonContainer) {
            buttonContainer.outerHTML = connectedHTML;
        }

        // Add submit handler
        const submitBtn = document.getElementById('web3-submit-btn');
        const emailInput = document.getElementById('web3-email-input');
        
        if (submitBtn && emailInput) {
            submitBtn.addEventListener('click', function() {
                const email = emailInput.value.trim();
                if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                    alert('Please enter a valid email address');
                    return;
                }
                
                // Show success (in production, this would call the backend)
                submitBtn.innerHTML = '✓ Submitted!';
                submitBtn.style.background = 'linear-gradient(90deg, #10B981 0%, #059669 100%)';
                emailInput.disabled = true;
                submitBtn.disabled = true;
                
                console.log('Web3 signup submitted:', { email, address: connectedAddress });
            });
        }
    }

    // ============================================================================
    // MAIN CONNECTION FUNCTION
    // ============================================================================

    /**
     * Connect to MetaMask wallet
     */
    async function connectWallet(button) {
        if (!isMetaMaskInstalled()) {
            alert('MetaMask is not installed. Please install it from metamask.io');
            window.open('https://metamask.io/download/', '_blank');
            return null;
        }

        // Show loading state
        const originalContent = button.innerHTML;
        button.innerHTML = `
            <span style="display: inline-flex; align-items: center; gap: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                Connecting...
            </span>
        `;
        button.disabled = true;

        try {
            // Request account access
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });

            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts found');
            }

            connectedAddress = accounts[0];
            console.log('✅ Wallet connected:', connectedAddress);

            // Check and switch network if needed
            const onCorrectNetwork = await checkNetwork();
            if (!onCorrectNetwork) {
                const switched = await switchNetwork();
                if (!switched) {
                    alert('Please switch to Arbitrum Sepolia network in MetaMask');
                }
            }

            // Update UI
            updateButtonUI(button, connectedAddress);
            showEmailInput(button);

            return connectedAddress;

        } catch (err) {
            console.error('Connection error:', err);
            button.innerHTML = originalContent;
            button.disabled = false;
            
            if (err.code === 4001) {
                alert('Connection rejected. Please try again.');
            } else {
                alert('Failed to connect wallet. Please try again.');
            }
            return null;
        }
    }

    // ============================================================================
    // EVENT LISTENERS
    // ============================================================================

    /**
     * Initialize Web3 connection handlers
     */
    function init() {
        console.log('🔌 Web3 Connect initialized');

        // Find the "Connect Wallet" button in the premium card
        const connectButtons = document.querySelectorAll('.whitelist-card.premium .whitelist-btn.primary');
        
        connectButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                connectWallet(button);
            });
        });

        // Listen for account changes
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', function(accounts) {
                if (accounts.length === 0) {
                    connectedAddress = null;
                    location.reload(); // Reset UI
                } else {
                    connectedAddress = accounts[0];
                    console.log('Account changed:', connectedAddress);
                }
            });

            window.ethereum.on('chainChanged', function() {
                checkNetwork();
            });

            // Check if already connected
            window.ethereum.request({ method: 'eth_accounts' })
                .then(accounts => {
                    if (accounts.length > 0) {
                        connectedAddress = accounts[0];
                        checkNetwork();
                        // Auto-update UI if already connected
                        const btn = document.querySelector('.whitelist-card.premium .whitelist-btn.primary');
                        if (btn && connectedAddress) {
                            updateButtonUI(btn, connectedAddress);
                            showEmailInput(btn);
                        }
                    }
                });
        }
    }

    // ============================================================================
    // STYLES
    // ============================================================================

    const styles = document.createElement('style');
    styles.textContent = `
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .spin {
            animation: spin 1s linear infinite;
        }
    `;
    document.head.appendChild(styles);

    // ============================================================================
    // RUN ON DOM READY
    // ============================================================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
