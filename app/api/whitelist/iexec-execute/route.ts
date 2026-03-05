import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// ─── Constants ───────────────────────────────────────────────────────────────

const WEB3MAIL_APP_WHITELIST = '0xD5054a18565c4a9E5c1aa3cEB53258bd59d4c78C'; // Arbitrum One
const ARBITRUM_RPC = 'https://arb1.arbitrum.io/rpc';

// Email template (same premium HTML from the frontend)
const EMAIL_SUBJECT = "🔐 You're in — Welcome to the Quintes Protocol Whitelist";
const EMAIL_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Quintes Protocol</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" style="max-width:600px;width:100%;" cellspacing="0" cellpadding="0" border="0">
          <!-- HEADER -->
          <tr>
            <td style="background:#0a0a0a;border:1px solid #1f1f1f;padding:48px 48px 32px;text-align:center;">
              <div style="display:inline-block;border:1px solid #FFC700;padding:6px 16px;margin-bottom:24px;">
                <span style="font-size:10px;letter-spacing:4px;color:#FFC700;text-transform:uppercase;">Early Access Confirmed</span>
              </div>
              <h1 style="margin:0 0 16px;font-size:36px;font-weight:700;color:#ffffff;letter-spacing:-1px;line-height:1.2;">Welcome to<br /><span style="color:#FFC700;">Quintes Protocol</span></h1>
              <p style="margin:0;font-size:16px;color:#aaaaaa;line-height:1.6;">Your whitelist position is secured on the blockchain.</p>
            </td>
          </tr>
          <!-- DIVIDER -->
          <tr>
            <td style="background:linear-gradient(90deg,#0a0a0a 0%,#FFC700 50%,#0a0a0a 100%);height:1px;font-size:0;"></td>
          </tr>
          <!-- BODY -->
          <tr>
            <td style="background:#0d0d0d;border:1px solid #1f1f1f;border-top:0;padding:40px 48px;">
              <p style="margin:0 0 24px;font-size:15px;color:#cccccc;line-height:1.7;">You're among the first to experience institutional-grade DeFi yields, secured by zero-knowledge proofs and iExec's decentralized infrastructure.</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background:#111111;border:1px solid #2a2a2a;padding:24px;border-left:3px solid #FFC700;">
                    <p style="margin:0 0 8px;font-size:11px;letter-spacing:3px;color:#FFC700;text-transform:uppercase;">What's Next</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr><td style="padding:6px 0;color:#aaaaaa;font-size:13px;">◎ &nbsp;Protocol launch notification via encrypted Web3Mail</td></tr>
                      <tr><td style="padding:6px 0;color:#aaaaaa;font-size:13px;">◎ &nbsp;Priority access to Quintes vaults &amp; yield strategies</td></tr>
                      <tr><td style="padding:6px 0;color:#aaaaaa;font-size:13px;">◎ &nbsp;Early contributor rewards &amp; referral bonuses</td></tr>
                    </table>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 32px;">
                <tr>
                  <td align="center" style="background:#0a0a0a;border:1px solid #1f1f1f;padding:12px 24px;">
                    <span style="font-size:11px;letter-spacing:2px;color:#555555;text-transform:uppercase;">🔒 Encrypted &amp; Secured by iExec Web3Mail</span>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:13px;color:#555555;line-height:1.6;text-align:center;">Your email address is protected and encrypted on-chain. Only Quintes Protocol can deliver messages to your inbox — no third party has access to your data.</p>
            </td>
          </tr>
          <!-- FOOTER -->
          <tr>
            <td style="background:#080808;border:1px solid #1f1f1f;border-top:0;padding:24px 48px;text-align:center;">
              <p style="margin:0 0 8px;font-size:11px;color:#333333;letter-spacing:2px;text-transform:uppercase;">Quintes Protocol &mdash; Institutional DeFi</p>
              <p style="margin:0;font-size:10px;color:#2a2a2a;">This message was sent via iExec Web3Mail. Your privacy is protected by decentralized, zero-knowledge encryption.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// ─── Route Handler ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // 1. Validate input
    const body = await req.json();
    const { email, walletAddress } = body;

    if (!email || !walletAddress) {
      return NextResponse.json({ error: 'Missing email or walletAddress' }, { status: 400 });
    }

    if (!ethers.isAddress(walletAddress)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // 2. Get the server's private key
    const sponsorPrivateKey = process.env.SPONSOR_PRIVATE_KEY;
    if (!sponsorPrivateKey) {
      console.error('[iExec Execute] SPONSOR_PRIVATE_KEY not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    console.log(`[iExec Execute] Starting server-side execution for ${walletAddress.slice(0, 8)}...`);

    // 3. Initialize iExec SDK with the SERVER's wallet (not the user's!)
    //    This is the key: the server wallet pays all gas + RLC fees
    const { IExecDataProtectorCore } = await import('@iexec/dataprotector');
    const { IExecWeb3mail } = await import('@iexec/web3mail');
    const { IExec } = await import('iexec');

    // Create an ethers wallet from the private key
    const provider = new ethers.JsonRpcProvider(ARBITRUM_RPC);
    const serverWallet = new ethers.Wallet(sponsorPrivateKey, provider);

    console.log(`[iExec Execute] Server wallet: ${serverWallet.address}`);

    // Initialize iExec DataProtector with server wallet
    const dataProtector = new IExecDataProtectorCore(serverWallet, {
      iexecOptions: {
        smsURL: 'https://sms.arbitrum-mainnet.iex.ec',
        resultProxyURL: 'https://result.arbitrum-mainnet.iex.ec',
      }
    });

    console.log('[iExec Execute] Step 1/4: Protecting email data...');

    // 4. STEP 1: Protect Data (encrypt + register dataset)
    const protectedData = await dataProtector.protectData({
      data: { email },
      name: `Quintes Whitelist - ${walletAddress.slice(0, 8)}`
    });
    console.log(`[iExec Execute] Email protected: ${protectedData.address}`);

    // 5. STEP 2: Grant Access to Web3Mail App
    console.log('[iExec Execute] Step 2/4: Granting access to Web3Mail...');
    await dataProtector.grantAccess({
      protectedData: protectedData.address,
      authorizedApp: WEB3MAIL_APP_WHITELIST,
      authorizedUser: '0x0000000000000000000000000000000000000000',
      numberOfAccess: 1000
    });
    console.log('[iExec Execute] Access granted');

    // 6. STEP 3: Deposit RLC into iExec escrow (if needed)
    console.log('[iExec Execute] Step 3/4: Checking RLC escrow balance...');
    const iexec = new IExec({ ethProvider: serverWallet });
    const account = await iexec.account.checkBalance(serverWallet.address);
    const currentStake = BigInt(account.stake.toString());
    const requiredStake = BigInt(150000000); // 0.15 RLC in nRLC

    if (currentStake < requiredStake) {
      const depositAmount = requiredStake - currentStake;
      console.log(`[iExec Execute] Depositing ${depositAmount.toString()} nRLC...`);
      await iexec.account.deposit(depositAmount.toString());
    } else {
      console.log('[iExec Execute] Escrow already funded');
    }

    // 7. STEP 4: Send Welcome Email via Web3Mail
    console.log('[iExec Execute] Step 4/4: Sending welcome email...');
    const web3mail = new IExecWeb3mail(serverWallet);

    await web3mail.sendEmail({
      protectedData: protectedData.address,
      emailSubject: EMAIL_SUBJECT,
      emailContent: EMAIL_CONTENT,
      contentType: 'text/html',
      senderName: 'Quintes Protocol',
      workerpoolMaxPrice: 100000000, // 0.1 RLC
    });

    console.log('[iExec Execute] ✅ Email sent successfully!');

    // 8. Return success with the protected data address
    return NextResponse.json({
      success: true,
      protectedDataAddress: protectedData.address,
      message: 'Whitelist registration complete. Welcome email sent.',
    });

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown server error';
    console.error('[iExec Execute] ❌ Error:', errMsg);
    return NextResponse.json({
      success: false,
      error: errMsg
    }, { status: 500 });
  }
}
