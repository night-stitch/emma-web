'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, deleteDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Mail, Phone, Trash2, Calendar, User, Send, CheckCircle2, Inbox, Filter, MessageCircle, Reply, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
// L'import emailjs a été supprimé

interface ReplyMessage {
    id: string;
    text: string;
    date: Date;
    from: 'admin' | 'client';
}

interface Message {
    id: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    status: string;
    createdAt: any;
    replies?: ReplyMessage[];
}

export default function AdminMessages() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'tous' | 'en_attente' | 'repondu' | 'nouvelle_reponse'>('tous');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
    const [sendingReply, setSendingReply] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMessages = async () => {
        setRefreshing(true);
        try {
            const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const list = querySnapshot.docs.map(docSnap => {
                const data = docSnap.data();
                return { id: docSnap.id, ...data } as Message;
            });
            setMessages(list);
        } catch (error) {
            console.error("Erreur chargement:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const filteredMessages = messages.filter(msg => {
        if (filter === 'en_attente') return msg.status !== 'répondu' && msg.status !== 'nouvelle réponse';
        if (filter === 'repondu') return msg.status === 'répondu';
        if (filter === 'nouvelle_reponse') return msg.status === 'nouvelle réponse';
        return true;
    });

    const newRepliesCount = messages.filter(m => m.status === 'nouvelle réponse').length;

    const deleteMessage = async (id: string) => {
        if(confirm("Supprimer définitivement ce message et toute la conversation ?")) {
            await deleteDoc(doc(db, "messages", id));
            setMessages(messages.filter(m => m.id !== id));
        }
    };

    const markAsRead = async (msgId: string) => {
        try {
            await updateDoc(doc(db, "messages", msgId), {
                status: 'répondu'
            });
            setMessages(messages.map(m =>
                m.id === msgId ? { ...m, status: 'répondu' } : m
            ));
        } catch (error) {
            console.error("Erreur:", error);
        }
    };

    const handleSendReply = async (msg: Message) => {
        if (!replyText.trim()) return;
        setSendingReply(true);

        try {
            // Créer l'objet réponse pour la DB locale
            const newReply: ReplyMessage = {
                id: Date.now().toString(),
                text: replyText,
                date: new Date(),
                from: 'admin'
            };

            // Générer le lien de réponse
            const replyLink = `${window.location.origin}/reply/${msg.id}`;

            // Appel à la Cloud Function pour envoyer la réponse par email
            const response = await fetch('https://us-central1-lacleprovencale-c1c69.cloudfunctions.net/sendContactEmail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to_name: msg.name,
                    to_email: msg.email,
                    original_message: msg.message,
                    reply_text: replyText,
                    reply_link: replyLink,
                }),
            });

            if (!response.ok) {
                throw new Error("Erreur serveur lors de l'envoi du mail");
            }
            // -------------------------------------------------------------------

            // Sauvegarder la réponse dans Firebase Firestore
            const replyData = {
                id: newReply.id,
                text: newReply.text,
                date: new Date().toISOString(),
                from: 'admin'
            };

            await updateDoc(doc(db, "messages", msg.id), {
                status: 'répondu',
                repliedAt: new Date(),
                replies: arrayUnion(replyData)
            });

            // Mettre à jour l'état local
            const localReply = { ...replyData, date: new Date().toISOString() };
            setMessages(messages.map(m =>
                m.id === msg.id
                    ? {
                        ...m,
                        status: 'répondu',
                        replies: [...(m.replies || []), localReply as any]
                    }
                    : m
            ));

            alert("Réponse envoyée avec succès !");
            setReplyingTo(null);
            setReplyText("");
        } catch (error) {
            console.error(error);
            alert("Erreur lors de l'envoi de la réponse.");
        }
        setSendingReply(false);
    };

    const formatDate = (date: any) => {
        if (!date) return '';
        let d: Date;
        if (date.toDate) {
            d = date.toDate();
        } else if (typeof date === 'string') {
            d = new Date(date);
        } else if (date.seconds) {
            d = new Date(date.seconds * 1000);
        } else {
            d = new Date(date);
        }
        return d.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="max-w-6xl mx-auto py-12 px-6">

            {/* EN-TÊTE & FILTRES */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                <div>
                    <Link href="/admin" className="inline-flex items-center gap-2 text-[#B88A44] text-[10px] uppercase tracking-widest font-bold mb-3 hover:text-[#1A1A1A] transition-colors">
                        <ArrowLeft size={14} /> Retour
                    </Link>
                    <span className="text-[#B88A44] text-[10px] uppercase tracking-[0.3em] font-bold block">Administration</span>
                    <h1 className="text-[#1A1A1A] text-3xl font-serif uppercase tracking-widest mt-2">
                        Boîte <span className="text-[#B88A44]">Réception</span>
                    </h1>
                </div>

                {/* BARRE DE FILTRES */}
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={fetchMessages}
                        disabled={refreshing}
                        className={`p-2 border border-[#B88A44]/20 bg-white hover:bg-[#B88A44]/10 transition-all ${refreshing ? 'animate-spin' : ''}`}
                        title="Rafraîchir"
                    >
                        <RefreshCw size={16} className="text-[#B88A44]" />
                    </button>
                    <div className="flex flex-wrap bg-white border border-[#B88A44]/10 p-1 shadow-sm">
                        {[
                            { id: 'tous', label: 'Tous', icon: <Inbox size={12}/> },
                            { id: 'en_attente', label: 'À traiter', icon: <Filter size={12}/> },
                            { id: 'nouvelle_reponse', label: 'Nouvelles réponses', icon: <MessageCircle size={12}/>, count: newRepliesCount },
                            { id: 'repondu', label: 'Répondus', icon: <CheckCircle2 size={12}/> }
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setFilter(btn.id as any)}
                                className={`flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-all relative ${
                                    filter === btn.id
                                        ? 'bg-[#1A1A1A] text-white'
                                        : 'text-[#1A1A1A]/40 hover:text-[#B88A44]'
                                }`}
                            >
                                {btn.icon} {btn.label}
                                {btn.count && btn.count > 0 && (
                                    <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full ml-1">
                                    {btn.count}
                                </span>
                                )}
                            </button>
                        ))}
                    </div>
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
                    {filteredMessages.map((msg) => {
                        const hasReplies = msg.replies && msg.replies.length > 0;

                        return (
                            <div key={msg.id} className={`bg-white border transition-all ${msg.status === 'répondu' ? 'border-green-100' : 'border-[#B88A44]/10 shadow-sm'} relative`}>

                                {/* EN-TÊTE DU MESSAGE */}
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                        <div className="space-y-3 flex-1">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <div className="w-8 h-8 rounded-full bg-[#F7F5F0] flex items-center justify-center text-[#B88A44]">
                                                    <User size={14}/>
                                                </div>
                                                <span className="font-bold text-sm uppercase tracking-wide">{msg.name}</span>
                                                {msg.status === 'répondu' ? (
                                                    <span className="text-[9px] bg-green-600 text-white px-2 py-0.5 uppercase tracking-widest flex items-center gap-1 font-bold">
                                                        <CheckCircle2 size={10} /> Répondu
                                                    </span>
                                                ) : msg.status === 'nouvelle réponse' ? (
                                                    <span className="text-[9px] bg-red-500 text-white px-2 py-0.5 uppercase tracking-widest flex items-center gap-1 font-bold animate-pulse">
                                                        <MessageCircle size={10} /> Nouvelle réponse
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] bg-[#B88A44] text-white px-2 py-0.5 uppercase tracking-widest font-bold">{msg.subject}</span>
                                                )}
                                                {hasReplies && (
                                                    <span className="text-[9px] bg-blue-100 text-blue-600 px-2 py-0.5 uppercase tracking-widest font-bold flex items-center gap-1">
                                                        <MessageCircle size={10} /> {msg.replies!.length} échange(s)
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-[11px] text-[#1A1A1A]/50 font-medium">
                                                <span className="flex items-center gap-1.5"><Mail size={12}/> {msg.email}</span>
                                                <span className="flex items-center gap-1.5"><Phone size={12}/> {msg.phone}</span>
                                                <span className="flex items-center gap-1.5"><Calendar size={12}/> {msg.createdAt?.toDate().toLocaleDateString('fr-FR')}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {msg.status === 'nouvelle réponse' && (
                                                <button
                                                    onClick={() => markAsRead(msg.id)}
                                                    className="text-[10px] uppercase tracking-widest font-bold text-green-600 border border-green-300 px-3 py-1.5 hover:bg-green-600 hover:text-white transition-all flex items-center gap-1"
                                                >
                                                    <CheckCircle2 size={12} /> Marquer lu
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setReplyingTo(replyingTo === msg.id ? null : msg.id)}
                                                className="text-[10px] uppercase tracking-widest font-bold text-[#B88A44] border border-[#B88A44]/30 px-3 py-1.5 hover:bg-[#B88A44] hover:text-white transition-all flex items-center gap-1"
                                            >
                                                <Reply size={12} /> Répondre
                                            </button>
                                            <button onClick={() => deleteMessage(msg.id)} className="text-red-200 hover:text-red-600 p-2 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* MESSAGE ORIGINAL */}
                                    <div className="mt-6 p-5 bg-[#F7F5F0] rounded-sm text-[13px] text-[#1A1A1A]/80 leading-relaxed font-serif border-l-4 border-[#B88A44]/30">
                                        <div className="flex items-center gap-2 mb-2 text-[10px] text-[#B88A44] uppercase tracking-widest font-bold">
                                            <User size={12} /> Message de {msg.name}
                                            <span className="text-[#1A1A1A]/30">• {formatDate(msg.createdAt)}</span>
                                        </div>
                                        <p className="italic">&quot;{msg.message}&quot;</p>
                                    </div>
                                </div>

                                {/* HISTORIQUE DE LA CONVERSATION */}
                                {hasReplies && (
                                    <div className="border-t border-[#B88A44]/10 px-6 py-4">
                                        <div className="flex items-center gap-2 text-[10px] text-[#1A1A1A]/50 uppercase tracking-widest font-bold mb-4">
                                            <MessageCircle size={14} />
                                            Conversation ({msg.replies!.length} échange{msg.replies!.length > 1 ? 's' : ''})
                                        </div>
                                        <div className="space-y-4">
                                            {msg.replies!.map((reply, index) => (
                                                <div
                                                    key={reply.id || index}
                                                    className={`p-4 rounded-sm text-[13px] leading-relaxed font-serif ${
                                                        reply.from === 'admin'
                                                            ? 'bg-[#1A1A1A]/5 border-l-4 border-[#1A1A1A]/30 ml-8'
                                                            : 'bg-[#B88A44]/5 border-l-4 border-[#B88A44]/30 mr-8'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2 mb-2 text-[10px] uppercase tracking-widest font-bold">
                                                        {reply.from === 'admin' ? (
                                                            <>
                                                                <Send size={12} className="text-[#1A1A1A]/50" />
                                                                <span className="text-[#1A1A1A]/50">Votre réponse</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <User size={12} className="text-[#B88A44]" />
                                                                <span className="text-[#B88A44]">Réponse de {msg.name}</span>
                                                            </>
                                                        )}
                                                        <span className="text-[#1A1A1A]/30">• {formatDate(reply.date)}</span>
                                                    </div>
                                                    <p className={reply.from === 'admin' ? 'text-[#1A1A1A]/70' : 'text-[#1A1A1A]/80 italic'}>
                                                        {reply.from === 'client' && '"'}{reply.text}{reply.from === 'client' && '"'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ZONE DE RÉPONSE */}
                                {replyingTo === msg.id && (
                                    <div className="p-6 border-t border-[#B88A44]/10 bg-[#F7F5F0]/30">
                                        <div className="flex items-center gap-2 mb-3 text-[10px] uppercase tracking-widest font-bold text-[#B88A44]">
                                            <Send size={12} /> Nouvelle réponse à {msg.name}
                                        </div>
                                        <textarea
                                            autoFocus
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder={`Écrire votre réponse...`}
                                            className="w-full p-4 bg-white border border-[#B88A44]/20 rounded-sm text-sm font-serif focus:outline-none focus:border-[#B88A44] min-h-[150px]"
                                        />
                                        <div className="flex justify-between items-center mt-4">
                                            <button
                                                onClick={() => { setReplyingTo(null); setReplyText(""); }}
                                                className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-all"
                                            >
                                                Annuler
                                            </button>
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
                        );
                    })}
                </div>
            )}
        </div>
    );
}