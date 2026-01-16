'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Mail, Phone, Trash2, Calendar, User, Send, CheckCircle2, Inbox, Filter } from 'lucide-react';
import emailjs from '@emailjs/browser';

export default function AdminMessages() {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // --- FILTRES ---
    const [filter, setFilter] = useState<'tous' | 'en_attente' | 'repondu'>('tous');

    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
    const [sendingReply, setSendingReply] = useState(false);

    useEffect(() => {
        const fetchMessages = async () => {
            const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(list);
            setLoading(false);
        };
        fetchMessages();
    }, []);

    // --- LOGIQUE DE FILTRAGE ---
    const filteredMessages = messages.filter(msg => {
        if (filter === 'en_attente') return msg.status !== 'répondu';
        if (filter === 'repondu') return msg.status === 'répondu';
        return true;
    });

    const deleteMessage = async (id: string) => {
        if(confirm("Supprimer définitivement ce message ?")) {
            await deleteDoc(doc(db, "messages", id));
            setMessages(messages.filter(m => m.id !== id));
        }
    };

    const handleSendReply = async (msg: any) => {
        if (!replyText.trim()) return;
        setSendingReply(true);

        try {
            await emailjs.send(
                'service_7aao02b',
                'template_wbz7brq',
                {
                    to_name: msg.name,
                    to_email: msg.email,
                    original_message: msg.message,
                    reply_text: replyText,
                },
                'w80kZ6WXyUSDiCnpQ'
            );

            await updateDoc(doc(db, "messages", msg.id), {
                status: 'répondu',
                repliedAt: new Date()
            });

            setMessages(messages.map(m =>
                m.id === msg.id ? { ...m, status: 'répondu' } : m
            ));

            alert("Réponse envoyée !");
            setReplyingTo(null);
            setReplyText("");
        } catch (error) {
            console.error(error);
            alert("Erreur d'envoi.");
        }
        setSendingReply(false);
    };

    return (
        <div className="max-w-6xl mx-auto py-12 px-6">

            {/* EN-TÊTE & FILTRES */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                <div>
                    <span className="text-[#B88A44] text-[10px] uppercase tracking-[0.3em] font-bold">Administration</span>
                    <h1 className="text-[#1A1A1A] text-3xl font-serif uppercase tracking-widest mt-2">
                        Boîte <span className="text-[#B88A44]">Réception</span>
                    </h1>
                </div>

                {/* BARRE DE FILTRES STYLE LUXE */}
                <div className="flex bg-white border border-[#B88A44]/10 p-1 shadow-sm">
                    {[
                        { id: 'tous', label: 'Tous', icon: <Inbox size={12}/> },
                        { id: 'en_attente', label: 'À traiter', icon: <Filter size={12}/> },
                        { id: 'repondu', label: 'Répondus', icon: <CheckCircle2 size={12}/> }
                    ].map((btn) => (
                        <button
                            key={btn.id}
                            onClick={() => setFilter(btn.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-all ${
                                filter === btn.id
                                    ? 'bg-[#1A1A1A] text-white'
                                    : 'text-[#1A1A1A]/40 hover:text-[#B88A44]'
                            }`}
                        >
                            {btn.icon} {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 italic">Chargement...</div>
            ) : filteredMessages.length === 0 ? (
                <div className="text-center py-24 border border-dashed border-[#B88A44]/20 text-[#1A1A1A]/40 font-serif italic">
                    {filter === 'en_attente' ? "Félicitations, vous avez répondu à tout !" : "Aucun message trouvé."}
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredMessages.map((msg) => (
                        <div key={msg.id} className={`bg-white p-6 border transition-all ${msg.status === 'répondu' ? 'border-green-100' : 'border-[#B88A44]/10 shadow-sm'} relative group`}>

                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#F7F5F0] flex items-center justify-center text-[#B88A44]"><User size={14}/></div>
                                        <span className="font-bold text-sm uppercase tracking-wide">{msg.name}</span>
                                        {msg.status === 'répondu' ? (
                                            <span className="text-[9px] bg-green-600 text-white px-2 py-0.5 uppercase tracking-widest flex items-center gap-1 font-bold">
                                                <CheckCircle2 size={10} /> Répondu
                                            </span>
                                        ) : (
                                            <span className="text-[9px] bg-[#B88A44] text-white px-2 py-0.5 uppercase tracking-widest font-bold">{msg.subject}</span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-[11px] text-[#1A1A1A]/50 font-medium">
                                        <span className="flex items-center gap-1.5"><Mail size={12}/> {msg.email}</span>
                                        <span className="flex items-center gap-1.5"><Phone size={12}/> {msg.phone}</span>
                                        <span className="flex items-center gap-1.5"><Calendar size={12}/> {msg.createdAt?.toDate().toLocaleDateString('fr-FR')}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {msg.status !== 'répondu' && (
                                        <button
                                            onClick={() => setReplyingTo(replyingTo === msg.id ? null : msg.id)}
                                            className="text-[10px] uppercase tracking-widest font-bold text-[#B88A44] border border-[#B88A44]/30 px-3 py-1.5 hover:bg-[#B88A44] hover:text-white transition-all"
                                        >
                                            Répondre
                                        </button>
                                    )}
                                    <button onClick={() => deleteMessage(msg.id)} className="text-red-200 hover:text-red-600 p-2 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 p-5 bg-[#F7F5F0] rounded-sm italic text-[13px] text-[#1A1A1A]/80 leading-relaxed font-serif border-l-2 border-[#B88A44]/30">
                                "{msg.message}"
                            </div>

                            {/* ZONE DE RÉPONSE */}
                            {replyingTo === msg.id && (
                                <div className="mt-6 pt-6 border-t border-[#B88A44]/10">
                                    <textarea
                                        autoFocus
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder={`Écrire votre réponse...`}
                                        className="w-full p-4 bg-white border border-[#B88A44]/20 rounded-sm text-sm font-serif focus:outline-none focus:border-[#B88A44] min-h-[150px]"
                                    />
                                    <div className="flex justify-end mt-4">
                                        <button
                                            onClick={() => handleSendReply(msg)}
                                            disabled={sendingReply || !replyText.trim()}
                                            className="flex items-center gap-2 bg-[#1A1A1A] text-white px-6 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-[#B88A44] transition-all disabled:opacity-50"
                                        >
                                            {sendingReply ? "Envoi..." : "Envoyer la réponse"}
                                            <Send size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}