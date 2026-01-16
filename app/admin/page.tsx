'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
    collection, getDocs, deleteDoc, doc, query,
    orderBy, addDoc, serverTimestamp
} from 'firebase/firestore';
import Link from 'next/link';
import {
    Plus, User, MapPin, Phone, Trash2, Loader2,
    Search, MessageSquare, Mail, Calendar, X, Send, Clock
} from 'lucide-react';

export default function AdminDashboard() {
    const [clients, setClients] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [missions, setMissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);

    const [eventData, setEventData] = useState({
        clientId: '',
        date: '',
        startTime: '09:00',
        endTime: '10:00',
        description: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const clientsSnap = await getDocs(collection(db, "clients"));
                setClients(clientsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                const msgQ = query(collection(db, "messages"), orderBy("createdAt", "desc"));
                const messagesSnap = await getDocs(msgQ);
                setMessages(messagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                const missionsSnap = await getDocs(collection(db, "missions"));
                const allMissions = missionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

                const now = new Date();
                const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
                const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 7));

                const weekMissions = allMissions.filter((m: any) => {
                    const mDate = new Date(m.date);
                    return mDate >= startOfWeek && mDate <= endOfWeek;
                }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

                setMissions(weekMissions);
            } catch (error) {
                console.error("Erreur:", error);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const handlePlanEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const selectedClient = clients.find(c => c.id === eventData.clientId);
        const clientName = selectedClient ? selectedClient.ownerName : "Client";
        const clientAddress = selectedClient ? selectedClient.address : "Lieu non précisé";

        const sTime = eventData.startTime.replace(':', '') + '00';
        const eTime = eventData.endTime.replace(':', '') + '00';
        const gDate = eventData.date.replace(/-/g, '');

        try {
            await addDoc(collection(db, "missions"), {
                ...eventData,
                clientName,
                clientAddress,
                createdAt: serverTimestamp()
            });

            const title = encodeURIComponent(`Mission : ${eventData.description} (${clientName})`);
            const details = encodeURIComponent(`Mission : ${eventData.description}\nHeure : ${eventData.startTime}-${eventData.endTime}`);
            const location = encodeURIComponent(clientAddress);
            const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${gDate}T${sTime}/${gDate}T${eTime}`;

            window.open(googleUrl, '_blank');
            setIsEventModalOpen(false);
            window.location.reload();
        } catch (error) {
            alert("Erreur");
        }
        setLoading(false);
    };

    const handleDeleteClient = async (id: string) => {
        if (confirm("Supprimer ce client ?")) {
            await deleteDoc(doc(db, "clients", id));
            setClients(clients.filter(c => c.id !== id));
        }
    };

    const filteredClients = clients.filter(client =>
        client.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin text-[#B88A44]" size={40} /></div>;

    return (
        <div className="min-h-screen py-6 md:py-12">
            <div className="max-w-7xl mx-auto px-4 md:px-6">

                {/* EN-TÊTE - Stack vertical sur mobile, horizontal sur Desktop */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-12">
                    <div className="w-full md:w-auto">
                        <span className="text-[#B88A44] text-[10px] uppercase tracking-[0.3em] font-bold block mb-1">Administration</span>
                        <h1 className="text-[#1A1A1A] text-2xl md:text-4xl font-serif uppercase tracking-widest leading-tight">
                            Tableau de <span className="text-[#B88A44]">Bord</span>
                        </h1>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <button onClick={() => setIsEventModalOpen(true)} className="flex items-center justify-center gap-2 border border-[#B88A44] text-[#B88A44] px-6 py-3 md:px-8 md:py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#B88A44] hover:text-white transition-all shadow-sm">
                            <Calendar size={14} /> Planifier
                        </button>
                        <Link href="/admin/nouveau-client" className="flex items-center justify-center gap-2 bg-[#1A1A1A] text-white px-6 py-3 md:px-8 md:py-4 text-[10px] uppercase tracking-[0.2em] hover:bg-[#B88A44] transition-all shadow-lg text-center">
                            <Plus size={14} /> Client
                        </Link>
                    </div>
                </div>

                <div className="space-y-8 md:space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

                        {/* MISSIONS SEMAINE */}
                        <section className="bg-white p-4 md:p-8 border border-[#B88A44]/10 shadow-sm">
                            <div className="flex items-center gap-3 mb-6 border-b border-[#B88A44]/10 pb-4">
                                <Calendar className="text-[#B88A44]" size={18} />
                                <h2 className="text-[#1A1A1A] text-sm font-serif uppercase tracking-widest">Missions <span className="text-[#B88A44]">Semaine</span></h2>
                            </div>
                            <div className="space-y-3">
                                {missions.length === 0 ? (
                                    <p className="text-[11px] text-[#1A1A1A]/40 italic font-serif py-4">Aucune mission prévue.</p>
                                ) : (
                                    missions.map((m) => (
                                        <div key={m.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-[#F7F5F0] border-l-2 border-[#B88A44] group relative">
                                            <div className="text-center min-w-[35px] md:min-w-[45px]">
                                                <p className="text-[9px] font-bold text-[#B88A44] uppercase">{new Date(m.date).toLocaleDateString('fr-FR', { weekday: 'short' })}</p>
                                                <p className="text-sm font-bold">{new Date(m.date).getDate()}</p>
                                            </div>
                                            <div className="flex-1 text-[11px] overflow-hidden">
                                                <p className="font-bold uppercase tracking-wider truncate">{m.description}</p>
                                                <p className="text-[#1A1A1A]/50 italic flex items-center gap-1"><Clock size={10}/> {m.startTime} - {m.endTime}</p>
                                                <p className="text-[#1A1A1A]/50 italic truncate flex items-center gap-1"><MapPin size={10}/> {m.clientName}</p>
                                            </div>
                                            <button onClick={async () => { if(confirm("Supprimer ?")) { await deleteDoc(doc(db, "missions", m.id)); window.location.reload(); }}} className="text-red-300 hover:text-red-600 p-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* MESSAGES */}
                        <section className="bg-white p-4 md:p-8 border border-[#B88A44]/10 shadow-sm">
                            <div className="flex items-center gap-3 mb-6 border-b border-[#B88A44]/10 pb-4">
                                <MessageSquare className="text-[#B88A44]" size={18} />
                                <h2 className="text-[#1A1A1A] text-sm font-serif uppercase tracking-widest">Derniers <span className="text-[#B88A44]">Messages</span></h2>
                            </div>
                            <div className="space-y-4">
                                {messages.slice(0, 3).map((msg) => (
                                    <Link href="/admin/messages" key={msg.id} className="block group border-b border-gray-50 pb-3 last:border-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-[11px] font-bold uppercase truncate pr-2">{msg.name}</p>
                                            <span className="text-[9px] text-[#1A1A1A]/40 shrink-0">{msg.createdAt?.toDate().toLocaleDateString('fr-FR')}</span>
                                        </div>
                                        <p className="text-[12px] text-[#1A1A1A]/60 font-serif italic line-clamp-1 group-hover:text-[#B88A44] transition-colors italic">"{msg.message}"</p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* CLIENTS */}
                    <section>
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-[#B88A44]/10 pb-4 gap-4">
                            <div className="flex items-center gap-3 text-lg font-serif uppercase tracking-widest"><User className="text-[#B88A44]" size={20} /> Vos Clients</div>
                            <div className="relative w-full md:w-auto">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B88A44]/50 w-3.5 h-3.5" />
                                <input type="text" placeholder="Rechercher..." className="w-full md:w-64 pl-9 pr-4 py-2 bg-white border border-[#B88A44]/10 text-xs focus:outline-none focus:border-[#B88A44] font-serif" onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {filteredClients.map((client) => (
                                <div key={client.id} className="group relative">
                                    <Link href={`/admin/client?id=${client.id}`} className="block bg-white p-4 md:p-6 border border-[#B88A44]/10 shadow-sm hover:shadow-xl transition-all h-full">
                                        <h3 className="text-[13px] font-bold uppercase truncate mb-1">{client.ownerName}</h3>
                                        <p className="text-[11px] text-[#1A1A1A]/70 italic line-clamp-1"><MapPin size={12} className="inline mr-1"/>{client.address}</p>
                                        <div className="text-[9px] uppercase tracking-widest text-[#B88A44] font-bold mt-4 pt-4 border-t border-gray-50 flex justify-between">Fiche complète <span>→</span></div>
                                    </Link>
                                    <button onClick={(e) => { e.preventDefault(); handleDeleteClient(client.id); }} className="absolute top-2 right-2 text-[#1A1A1A]/10 hover:text-red-600 p-2"><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {/* MODAL PLANIFICATION - Adaptée pour écran tactile */}
            {isEventModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#1A1A1A]/80 backdrop-blur-sm" onClick={() => setIsEventModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-lg p-6 md:p-12 shadow-2xl border-t-4 border-[#B88A44] overflow-y-auto max-h-[90vh]">
                        <button onClick={() => setIsEventModalOpen(false)} className="absolute top-4 right-4 text-[#1A1A1A]/40 hover:text-[#B88A44]">
                            <X size={24} />
                        </button>
                        <h2 className="text-[#1A1A1A] text-xl md:text-2xl font-serif uppercase tracking-widest mb-6 md:mb-8">Nouvelle Mission</h2>
                        <form onSubmit={handlePlanEvent} className="space-y-4 md:space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-[#B88A44]">Propriétaire</label>
                                <select required className="w-full bg-[#F7F5F0] border-b border-[#B88A44]/20 py-3 px-2 text-sm font-serif outline-none" value={eventData.clientId} onChange={(e) => setEventData({...eventData, clientId: e.target.value})}>
                                    <option value="">Sélectionner un client...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.ownerName}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-[#B88A44]">Date</label>
                                <input type="date" required className="w-full bg-[#F7F5F0] border-b border-[#B88A44]/20 py-3 px-2 text-sm outline-none" value={eventData.date} onChange={(e) => setEventData({...eventData, date: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-[#B88A44]">Début</label>
                                    <input type="time" required className="w-full bg-[#F7F5F0] border-b border-[#B88A44]/20 py-3 px-2 text-sm outline-none" value={eventData.startTime} onChange={(e) => setEventData({...eventData, startTime: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-[#B88A44]">Fin</label>
                                    <input type="time" required className="w-full bg-[#F7F5F0] border-b border-[#B88A44]/20 py-3 px-2 text-sm outline-none" value={eventData.endTime} onChange={(e) => setEventData({...eventData, endTime: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-[#B88A44]">Mission</label>
                                <input type="text" required placeholder="Description..." className="w-full bg-[#F7F5F0] border-b border-[#B88A44]/20 py-3 px-2 text-sm font-serif outline-none" value={eventData.description} onChange={(e) => setEventData({...eventData, description: e.target.value})} />
                            </div>
                            <button type="submit" className="w-full bg-[#1A1A1A] text-white py-4 md:py-5 text-[10px] uppercase font-bold tracking-widest hover:bg-[#B88A44] transition-all flex items-center justify-center gap-3 mt-4 shadow-lg"><Send size={14} /> Confirmer & Planifier</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}