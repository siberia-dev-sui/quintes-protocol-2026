# iExec Web3Mail Integration Guide

> Frontend-side integration for user-pays-gas model.

---

## Overview

This frontend integrates iExec Web3Mail **directly in the browser**. The user:
1. Connects MetaMask
2. Signs transactions with their own wallet
3. Pays gas fees on Arbitrum Sepolia

---

## Setup

### 1. Install SDK

```bash
pnpm add @iexec/web3mail ethers@5.7.2
```

### 2. Network Configuration

```typescript
const NETWORK_CONFIG = {
  chainId: 421614,
  chainIdHex: '0x66eee',
  chainName: 'Arbitrum Sepolia',
  rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
  blockExplorer: 'https://sepolia.arbiscan.io/'
};
```

---

## Implementation

### In `whitelist-section.tsx`:

```typescript
import { IExecWeb3mail } from '@iexec/web3mail';
import { ethers } from 'ethers';

// After wallet connection:
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const web3mail = new IExecWeb3mail(signer);

// Step 1: Protect Email
const protectedData = await web3mail.protectData({
  data: { email: userEmail }
});

// Step 2: Grant Access
await web3mail.grantAccess({
  protectedData: protectedData.address,
  authorizedUser: walletAddress
});

// Step 3: Send Confirmation
await web3mail.sendEmail({
  protectedData: protectedData.address,
  emailSubject: 'Welcome to Quintes Protocol',
  emailContent: '<html>...</html>'
});
```

---

## User Experience

| Step | User Action | MetaMask Popup |
|------|-------------|----------------|
| 1 | Click "Connect Wallet" | Request connection |
| 2 | Enter email + Submit | Sign protectData TX |
| 3 | Wait | Sign grantAccess TX |
| 4 | Wait | Sign sendEmail TX |
| 5 | Success! | None |

---

## Testing

1. Install MetaMask
2. Add Arbitrum Sepolia network
3. Get test ETH: https://faucets.chain.link/arbitrum-sepolia
4. Run `pnpm dev`
5. Test whitelist flow

---

## Related Files

- `components/whitelist-section.tsx` - Main integration point
- `ARCHITECT_CONTEXT.md` - Project context
