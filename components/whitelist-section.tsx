'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { IExecDataProtector } from '@iexec/dataprotector';
import { IExecWeb3mail } from '@iexec/web3mail';
import { supabase } from '@/lib/supabase';
import { generateReferralCode } from '@/lib/referral';
import { useSearchParams } from 'next/navigation';

// CONSTANTES VITALES
const IEXEC_BELLECOUR_CHAIN_ID = '0x86'; // Chain ID 134 en Hex
const WEB3MAIL_APP_ADDRESS = '0xD5054a18565c4a9E5c1aa3cEB53258bd59d4c78C'; // iExec Web3Mail App

// Extend Window interface for ethereum
declare global {
    interface Window {
        ethereum?: any;
    }
}

export function WhitelistSection() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const searchParams = useSearchParams();

    // 1. Función para asegurar la red correcta (BELLECOUR)
    const switchNetworkToBellecour = async () => {
        if (!window.ethereum) throw new Error("No wallet found");

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: IEXEC_BELLECOUR_CHAIN_ID }],
            });
        } catch (switchError: any) {
            // Si la red no existe, la agregamos
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: IEXEC_BELLECOUR_CHAIN_ID,
                            chainName: 'iExec Bellecour',
                            nativeCurrency: { name: 'xRLC', symbol: 'xRLC', decimals: 18 },
                            rpcUrls: ['https://bellecour.iex.ec'],
                            blockExplorerUrls: ['https://blockscout-bellecour.iex.ec'],
                        },
                    ],
                });
            } else {
                throw switchError;
            }
        }
    };

    const handleRegister = async () => {
        if (!email) return alert("Por favor ingresa un email");
        setLoading(true);
        setStatus('Iniciando...');

        try {
            // A. Verificar Wallet y Red
            if (!window.ethereum) throw new Error("Instala MetaMask");
            await switchNetworkToBellecour(); // FIX CRÍTICO DEL AUDITOR

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const userAddress = await signer.getAddress();

            // B. Inicializar SDKs con el Signer v6
            const dataProtector = new IExecDataProtector(provider);
            const web3mail = new IExecWeb3mail(provider);

            // C. Flujo iExec (Las 3 firmas dolorosas pero necesarias por ahora)

            // Paso 1: Proteger el Email
            setStatus('1/3 Firmando protección de datos...');
            const protectedData = await dataProtector.core.protectData({
                data: { email: email },
                name: `Email for Quintes Whitelist`,
            });
            const protectedDataAddress = protectedData.address;

            // Paso 2: Dar permiso a la App de Email
            setStatus('2/3 Autorizando envío de email...');
            await dataProtector.core.grantAccess({
                protectedData: protectedDataAddress,
                authorizedApp: WEB3MAIL_APP_ADDRESS,
                authorizedUser: userAddress, // FIX DE SEGURIDAD: Solo tú puedes usar tu dato
            });

            // Paso 3: Enviar el Email de Bienvenida
            setStatus('3/3 Enviando confirmación...');
            await web3mail.sendEmail({
                protectedData: protectedDataAddress,
                emailSubject: 'Bienvenido a Quintes Protocol',
                emailContent: 'Estás oficialmente en la Whitelist. Tu privacidad está protegida on-chain.',
                contentType: 'text/plain',
                senderName: 'Quintes Protocol',
            });

            // D. GUARDAR EN SUPABASE (El eslabón perdido)
            setStatus('Finalizando registro...');

            const refCode = generateReferralCode();
            const referredBy = searchParams.get('ref');

            const { error: dbError } = await supabase
                .from('whitelist_users')
                .insert([
                    {
                        wallet_address: userAddress,
                        protected_data_address: protectedDataAddress,
                        referral_code: refCode,
                        referred_by: referredBy,
                        status: 'active'
                    }
                ]);

            if (dbError) {
                console.error("Error guardando en DB:", dbError);
                // No fallamos toda la app si falla la DB, pero avisamos
                alert("Registro en Blockchain exitoso, pero hubo un error guardando tu perfil.");
            } else {
                alert(`¡ÉXITO TOTAL! Tu código de referido es: ${refCode}`);
                setEmail('');
            }

        } catch (error: any) {
            console.error(error);
            alert(`Error: ${error.message || "Algo salió mal"}`);
        } finally {
            setLoading(false);
            setStatus('');
        }
    };

    return (
        <div className="p-4 border rounded bg-gray-900 text-white">
            <h2 className="text-xl mb-4">Únete a la Whitelist Privada</h2>
            <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-black p-2 rounded w-full mb-4"
                disabled={loading}
            />
            <button
                onClick={handleRegister}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
            >
                {loading ? status : 'Proteger Email & Unirse'}
            </button>

            {/* Disclaimer sobre UX */}
            <p className="text-xs text-gray-400 mt-2">
                *Requerirá 3 firmas en tu wallet (Red iExec Bellecour). Es gratis (Gasless).
            </p>
        </div>
    );
}
