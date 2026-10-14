'use client';

import { useT } from '@/lib/i18n';

// ─────────────────────────────────────────────────────────────
// Page de réponse client : /reply/{idDuMessage}
// Le lien est envoyé par email quand Emma répond depuis l'admin › Messages.
// Firebase Hosting redirige /reply/** vers cette page (voir firebase.json).
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, CheckCircle, Loader2, Send } from 'lucide-react';
import { db } from '@/lib/firebase';

interface Reply { id: string; text: string; date: string; from: 'admin' | 'client' }
interface Conversation { name: string; message: string; subject?: string; replies?: Reply[] }

function formatDate(d: string) {
    const date = new Date(d);
    return isNaN(date.getTime()) ? '' : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
}

export default function ReplyPage() {
    const t = useT();
    const [id, setId] = useState<string | null>(null);
    const [conv, setConv] = useState<Conversation | null>(null);
    const [state, setState] = useState<'loading' | 'ready' | 'notfound' | 'sent'>('loading');
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const parts = window.location.pathname.split('/').filter(Boolean); // ['reply', '<id>']
        const msgId = parts[0] === 'reply' && parts[1] && parts[1] !== 'placeholder' ? parts[1] : null;
        setId(msgId);
        if (!msgId) { setState('notfound'); return; }
        getDoc(doc(db, 'messages', msgId))
            .then((snap) => {
                if (!snap.exists()) { setState('notfound'); return; }
                setConv(snap.data() as Conversation);
                setState('ready');
            })
            .catch(() => setState('notfound'));
    }, []);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !text.trim()) return;
        setSending(true); setError('');
        try {
            await updateDoc(doc(db, 'messages', id), {
                replies: arrayUnion({ id: Date.now().toString(), text: text.trim(), date: new Date().toISOString(), from: 'client' }),
                status: 'nouvelle réponse',
                lastClientReplyAt: serverTimestamp(),
            });
            setState('sent');
        } catch (err) {
            console.error(err);
            setError("L’envoi n’a pas abouti. Réessayez, ou écrivez-nous directement par email.");
        }
        setSending(false);
    };

    return (
        <div className="min-h-screen pt-20">
            <section className="max-w-2xl mx-auto px-6 py-16 md:py-24">
                <header className="text-center mb-10">
                    <span className="text-[#B88A44] text-[10px] uppercase tracking-[0.4em] mb-3 block font-bold">{t('Votre échange')}</span>
                    <h1 className="text-[#1A1A1A] text-3xl md:text-4xl font-serif uppercase tracking-[0.12em]">{t('Répondre')}</h1>
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <div className="w-10 h-[1px] bg-[#B88A44]/60"></div>
                        <div className="w-1.5 h-1.5 rotate-45 bg-[#B88A44]/70"></div>
                        <div className="w-10 h-[1px] bg-[#B88A44]/60"></div>
                    </div>
                </header>

                {state === 'loading' && (
                    <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#B88A44]" size={32} /></div>
                )}

                {state === 'notfound' && (
                    <div className="text-center bg-white border-t-4 border-[#B88A44] p-10 shadow-sm">
                        <p className="font-serif text-lg text-[#1A1A1A] mb-3">{t('Cette conversation est introuvable.')}</p>
                        <p className="text-sm text-[#1A1A1A]/60 mb-8">{t('Le lien a peut-être expiré. Vous pouvez nous écrire directement.')}</p>
                        <Link href="/contact" className="inline-block px-8 py-3 border border-[#B88A44] text-[#1A1A1A] text-[10px] uppercase tracking-[0.3em] hover:bg-[#B88A44] hover:text-white transition-colors">
                            {t('Nous contacter')}
                        </Link>
                    </div>
                )}

                {state === 'sent' && (
                    <div className="text-center bg-white border-t-4 border-[#B88A44] p-10 shadow-sm">
                        <CheckCircle className="mx-auto text-[#B88A44] mb-4" size={32} />
                        <p className="font-serif text-lg text-[#1A1A1A] mb-3">{t('Merci, votre réponse a bien été envoyée.')}</p>
                        <p className="text-sm text-[#1A1A1A]/60 mb-8">{t('Nous revenons vers vous très rapidement.')}</p>
                        <Link href="/" className="inline-flex items-center gap-2 text-[#B88A44] text-[10px] uppercase tracking-[0.3em] font-bold hover:text-[#1A1A1A] transition-colors">
                            <ArrowLeft size={14} /> {t('Retour au site')}
                        </Link>
                    </div>
                )}

                {state === 'ready' && conv && (
                    <>
                        {/* Fil de la conversation */}
                        <div className="space-y-4 mb-10">
                            <Bubble who={`${conv.name || t('Vous')}`} date="" text={conv.message} client />
                            {(conv.replies || []).map((r) => (
                                <Bubble key={r.id} who={r.from === 'admin' ? 'La Clé Provençale' : (conv.name || t('Vous'))} date={formatDate(r.date)} text={r.text} client={r.from === 'client'} />
                            ))}
                        </div>

                        {/* Formulaire de réponse */}
                        <form onSubmit={handleSend} className="bg-white p-6 md:p-10 border-t-4 border-[#B88A44] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] space-y-6">
                            <label htmlFor="reply" className="text-[10px] uppercase font-bold text-[#B88A44] tracking-widest block">{t('Votre réponse')}</label>
                            <textarea
                                id="reply" rows={5} required maxLength={4000}
                                value={text} onChange={(e) => setText(e.target.value)}
                                placeholder={t('Écrivez votre message…')}
                                className="w-full bg-transparent border-b border-[#1A1A1A]/20 py-3 text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus:outline-none focus:border-[#B88A44] transition-colors font-serif resize-none"
                            />
                            {error && <p className="text-[12px] text-red-600 font-serif italic">{t(error)}</p>}
                            <div className="text-right">
                                <button type="submit" disabled={sending || !text.trim()}
                                        className="inline-flex items-center gap-3 px-10 py-4 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-[0.3em] hover:bg-[#B88A44] transition-colors disabled:opacity-50">
                                    {sending ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />} {t('Envoyer')}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </section>
        </div>
    );
}

function Bubble({ who, date, text, client }: { who: string; date: string; text: string; client?: boolean }) {
    return (
        <div className={`p-5 border-l-2 ${client ? 'bg-white/70 border-[#1A1A1A]/20 mr-6 md:mr-12' : 'bg-white border-[#B88A44] ml-6 md:ml-12'}`}>
            <div className="flex justify-between items-baseline gap-4 mb-2">
                <span className={`text-[10px] uppercase tracking-widest font-bold ${client ? 'text-[#1A1A1A]/60' : 'text-[#B88A44]'}`}>{who}</span>
                {date && <span className="text-[10px] text-[#1A1A1A]/40">{date}</span>}
            </div>
            <p className="text-sm text-[#1A1A1A]/75 leading-relaxed whitespace-pre-line">{text}</p>
        </div>
    );
}
