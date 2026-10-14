'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { ConfirmRequest, Toast, subscribeFeedback } from '@/lib/feedback';

/** Notifications (en haut à droite) + fenêtre de confirmation, dans le style du site. */
export default function AdminFeedback() {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [pending, setPending] = useState<ConfirmRequest | null>(null);

    useEffect(() => subscribeFeedback({
        toast: (t) => {
            setToasts((list) => [...list, t]);
            setTimeout(() => setToasts((list) => list.filter((x) => x.id !== t.id)), 4500);
        },
        confirm: (c) => setPending(c),
    }), []);

    const answer = (ok: boolean) => {
        pending?.resolve(ok);
        setPending(null);
    };

    useEffect(() => {
        if (!pending) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') answer(false);
            if (e.key === 'Enter') answer(true);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    });


    return (
        <>
            {/* NOTIFICATIONS */}
            <div className="fixed top-24 right-4 md:right-6 z-[100001] flex flex-col gap-3 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`pointer-events-auto bg-white shadow-2xl border-l-4 p-5 flex items-start gap-4 animate-fade-up ${t.type === 'error' ? 'border-red-500' : 'border-[#B88A44]'}`}
                    >
                        {t.type === 'error' ? <XCircle className="text-red-500 shrink-0" size={20} />
                            : t.type === 'info' ? <Info className="text-[#B88A44] shrink-0" size={20} />
                                : <CheckCircle className="text-[#B88A44] shrink-0" size={20} />}
                        <p className="flex-1 text-[#1A1A1A]/75 text-xs leading-relaxed">{t.message}</p>
                        <button onClick={() => setToasts((l) => l.filter((x) => x.id !== t.id))} className="text-[#1A1A1A]/25 hover:text-[#1A1A1A]" aria-label="Fermer">
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {/* CONFIRMATION */}
            {pending && (
                <div className="fixed inset-0 z-[100002] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#1A1A1A]/70 backdrop-blur-sm" onClick={() => answer(false)} />
                    <div role="alertdialog" aria-modal="true" className="relative bg-white w-full max-w-md p-8 md:p-10 shadow-2xl border-t-4 border-[#B88A44] text-center">
                        <div className="absolute inset-0 m-2 border border-[#B88A44]/10 pointer-events-none"></div>
                        <div className="relative">
                            <div className="w-12 h-12 mx-auto mb-5 border border-[#B88A44]/30 flex items-center justify-center text-[#B88A44]">
                                <AlertTriangle size={18} />
                            </div>
                            <span className="text-[#B88A44] text-[10px] uppercase tracking-[0.3em] font-bold block mb-3">Confirmation</span>
                            <p className="text-[#1A1A1A] font-serif text-lg leading-snug mb-8">{pending.message}</p>
                            <div className="flex flex-col-reverse sm:flex-row gap-3">
                                <button onClick={() => answer(false)} className="sm:flex-1 border border-[#1A1A1A]/20 text-[#1A1A1A]/70 py-3.5 text-[10px] uppercase font-bold tracking-widest hover:border-[#B88A44] hover:text-[#B88A44] transition-colors">
                                    Annuler
                                </button>
                                <button autoFocus onClick={() => answer(true)} className="sm:flex-1 bg-[#1A1A1A] text-white py-3.5 text-[10px] uppercase font-bold tracking-widest hover:bg-[#B88A44] transition-colors">
                                    Confirmer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
