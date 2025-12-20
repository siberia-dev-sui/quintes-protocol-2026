# Quintes Protocol - Neo V6 (Experimental)

![Quintes Protocol Hero](images/661fa8c48456bfac79f572e2_Hero%20Left.webp)

> **Sustainable Crypto Yields up to 33% APY.**  
> Built for long-term capital preservation, Quintes Protocol integrates institutional-grade financial engineering with the power of decentralized technologies.

## 🚀 Overview

**Quintes Protocol Neo V6** represents the latest evolution in our frontend interface, combining a pixel-perfect, high-fidelity aesthetic with robust Web3 functionality. This experimental release focuses on demonstrating seamless user onboarding via **iExec Web3 Mail** integration, allowing for privacy-preserving, wallet-based whitelist registration.

### Key Features

*   **Premium UI/UX**: A dark-mode, glassmorphism-inspired design system built with clean HTML5 and CSS3.
*   **Web3 Integration**: Native MetaMask connectivity via `ethers.js`.
*   **Privacy-First Whitelist**: Integrated **iExec Confidential Computing** logic to allow users to join the alpha whitelist without exposing their email addresses publicly on-chain.
*   **Arbitrum Sepolia Ready**: Pre-configured to interact with the Arbitrum Sepolia testnet for low-cost, high-speed transactions.

---

## 🛠 Tech Stack

*   **Frontend**: Static HTML5, CSS3, Vanilla JavaScript (ES6+).
*   **Web3**: `ethers.js` (v5.7.2) for blockchain interaction.
*   **Integration**: iExec SDK (Confidential Computing & Web3 Mail).
*   **Styling**: Custom Webflow-derived CSS with responsive layouts.

---

## 🔌 Connection & Whitelist Flow

The application implements a custom Web3 Connection Manager (`js/web3-connect.js`) that handles the user journey:

1.  **Wallet Detection**: Automatically detects MetaMask injection.
2.  **Connection Request**: Prompts user to connect their wallet.
3.  **Network Enforce**: automatically checks and requests a switch to **Arbitrum Sepolia** (Chain ID: 421614) if the user is on the wrong network.
4.  **Authenticated UI**: Upon successful connection, the "Connect Wallet" button transforms to show the user's shortened address and unlocks the **Verified Alpha Access** form.
5.  **iExec Submission**: (Mocked in this frontend release) Securely prepares the user's email for encryption and submission via iExec's Data Protector.

---

## 📦 Installation & Deployment

Since this project is built as a highly optimized static site, deployment is remarkably simple.

### Local Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/siberia-dev-sui/quintes-neo-experimental-v6.git
    cd quintes-neo-experimental-v6
    ```

2.  **Serve the application:**
    You can use any static file server. For example:
    
    *Python:*
    ```bash
    python3 -m http.server 8000
    ```
    
    *Node.js (http-server):*
    ```bash
    npx http-server .
    ```

3.  **Access:**
    Open `http://localhost:8000` in your browser.

### Recommended Requirements
*   **Browser**: Chrome, Brave, or Firefox with **MetaMask** installed.
*   **Network**: Arbitrum Sepolia Testnet (for testing Web3 interactions).

---

## 📂 Project Structure

```bash
quintes-neo-experimental-v6/
├── index.html          # Main application entry point
├── css/                # Stylesheets (Layout, Typography, Effects)
├── js/
│   ├── web3-connect.js # Core Web3 logic (Wallet, Network, UI)
│   └── ...             # UI interactions & Polyfills
├── images/             # Optimized assets (WebP/SVG)
└── fonts/              # Custom typography files
```

---

## 🔒 Security & Privacy

This project leverages **iExec** to ensure that user contact information remains confidential. By using Web3 Mail, we enable direct communication with our community without storing raw emails on centralized, vulnerable databases.

---

© 2025 Quintes Protocol. All Rights Reserved.
