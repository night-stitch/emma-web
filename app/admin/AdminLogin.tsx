'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Lock } from 'lucide-react';
import { adminResetPassword, adminSignIn, authErrorMessage } from '@/lib/adminAuth';

const inputClass =
    'w-full bg-[#F7F5F0] border-b border-[#B88A44]/20 py-3 px-2 text-sm font-serif outline-none focus:border-[#B88A44] transition-colors';
const labelClass = 'text-[10px] uppercase font-bold text-[#B88A44] tracking-widest';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setInfo(''); setLoading(true);
        try {
            await adminSignIn(email, password);
            // Le layout admin se met à jour tout seul une fois connecté
        } catch (err) {
            setError(authErrorMessage(err));
        }
        setLoading(false);
    };

    const handleReset = async () => {
        setError(''); setInfo('');
        if (!email.trim()) { setError("Entrez d'abord votre email ci-dessus."); return; }
        try {
            await adminResetPassword(email);
            setInfo('Un email de réinitialisation vient de vous être envoyé.');
        } catch (err) {
            setError(authErrorMessage(err));
        }
    };

    return (
        <div className="min-h-[calc(100dvh-5rem)] flex items-center justify-center px-4 py-12">
            <div className="relative bg-white w-full max-w-md p-8 md:p-12 shadow-2xl border-t-4 border-[#B88A44]">
                <div className="absolute inset-0 m-2 border border-[#B88A44]/10 pointer-events-none"></div>

                <div className="relative text-center mb-8 md:mb-10">
                    <div className="w-12 h-12 mx-auto mb-5 border border-[#B88A44]/30 flex items-center justify-center text-[#B88A44]">
                        <Lock size={18} />
                    </div>
                    <span className="text-[#B88A44] text-[10px] uppercase tracking-[0.3em] font-bold block mb-2">Espace privé</span>
                    <h1 className="text-[#1A1A1A] text-2xl md:text-3xl font-serif uppercase tracking-widest">
                        Administration
                    </h1>
                    <div className="w-12 h-[1px] bg-[#B88A44] mx-auto mt-5"></div>
                </div>

                <form onSubmit={handleSubmit} className="relative space-y-6">
                    <div className="space-y-1">
                        <label className={labelClass} htmlFor="admin-email">Email</label>
                        <input id="admin-email" type="email" autoComplete="username" required className={inputClass}
                               value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className={labelClass} htmlFor="admin-password">Mot de passe</label>
                        <input id="admin-password" type="password" autoComplete="current-password" required className={inputClass}
                               value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>

                    {error && <p className="text-[11px] text-red-600 font-serif italic">{error}</p>}
                    {info && <p className="text-[11px] text-[#B88A44] font-serif italic">{info}</p>}

                    <button type="submit" disabled={loading}
                            className="w-full bg-[#1A1A1A] text-white py-4 md:py-5 text-[10px] uppercase font-bold tracking-widest hover:bg-[#B88A44] transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50">
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                        Se connecter
                    </button>

                    <div className="flex items-center justify-between pt-2">
                        <Link href="/" className="inline-flex items-center gap-2 text-[#1A1A1A]/50 text-[9px] uppercase tracking-widest font-bold hover:text-[#B88A44] transition-colors">
                            <ArrowLeft size={12} /> Retour au site
                        </Link>
                        <button type="button" onClick={handleReset}
                                className="text-[#B88A44] text-[9px] uppercase tracking-widest font-bold hover:text-[#1A1A1A] transition-colors">
                            Mot de passe oublié ?
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
