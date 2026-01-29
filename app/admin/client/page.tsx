'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
    doc, getDoc, collection, getDocs, query, where,
    orderBy, deleteDoc, addDoc, serverTimestamp, updateDoc
} from 'firebase/firestore';

// Fonction pour changer le statut d'un document
const cycleStatus = (currentStatus: string) => {
    const statusOrder = ['émis', 'à payer', 'payé'];
    const currentIndex = statusOrder.indexOf(currentStatus || 'émis');
    return statusOrder[(currentIndex + 1) % statusOrder.length];
};

import {
    User, MapPin, Phone, Mail, Wifi, Lock, Home,
    Droplet, ArrowLeft, Calendar, FileText, Clock,
    Trash2, Send, X, Plus, Key, Waves, Leaf,
    ClipboardList, Pencil, CheckCircle, XCircle,
    ArrowRight, Loader2, Save
} from 'lucide-react';
import Link from 'next/link';

function ClientPageContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const router = useRouter();

    // Mode: 'new' pour création, 'view' pour consultation/édition
    const isNewClient = !id;

    const [client, setClient] = useState<any>(null);
    const [missions, setMissions] = useState<any[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(!isNewClient);

    // ÉTATS POUR L'ÉDITION (client existant)
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>({});

    // ÉTATS POUR LA CRÉATION (nouveau client)
    const [step, setStep] = useState(1);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        ownerName: '', phone: '', email: '',
        address: '', wifiName: '', wifiPassword: '',
        alarmCode: '', keyBox: '', keyCount: '1',
        waterLocation: '', elecLocation: '',
        garbageDays: '', poolDay: '', gardenDay: '',
        contractType: 'Standard', notes: ''
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [eventData, setEventData] = useState({
        date: '', startTime: '09:00', endTime: '10:00', description: ''
    });

    // Charger les données du client existant
    useEffect(() => {
        if (isNewClient) return;

        const fetchData = async () => {
            try {
                const docRef = doc(db, "clients", id!);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setClient(data);
                    setEditData(data);

                    const missionsQ = query(
                        collection(db, "missions"),
                        where("clientId", "==", id),
                        orderBy("date", "desc")
                    );
                    const missionsSnap = await getDocs(missionsQ);
                    setMissions(missionsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

                    const documentsQ = query(
                        collection(db, "documents"),
                        where("clientId", "==", id),
                        orderBy("createdAt", "desc")
                    );
                    const documentsSnap = await getDocs(documentsQ);
                    setDocuments(documentsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
                } else {
                    router.push('/admin');
                }
            } catch (error) { console.error(error); }
            setLoading(false);
        };
        fetchData();
    }, [id, router, isNewClient]);

    // FONCTIONS POUR CLIENT EXISTANT
    const handleUpdateClient = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const docRef = doc(db, "clients", id);
            await updateDoc(docRef, editData);
            setClient(editData);
            setIsEditing(false);
            alert("Fiche client mise à jour !");
        } catch (error) {
            alert("Erreur lors de la mise à jour");
        }
        setLoading(false);
    };

    const handleAddMission = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const missionData = {
                ...eventData,
                clientId: id,
                clientName: client.ownerName,
                clientAddress: client.address || "Non précisée",
                createdAt: serverTimestamp()
            };
            await addDoc(collection(db, "missions"), missionData);
            const sTime = eventData.startTime.replace(':', '') + '00';
            const eTime = eventData.endTime.replace(':', '') + '00';
            const gDate = eventData.date.replace(/-/g, '');
            const title = encodeURIComponent(`Mission : ${eventData.description} (${client.ownerName})`);
            const loc = encodeURIComponent(client.address || "");
            const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&location=${loc}&dates=${gDate}T${sTime}/${gDate}T${eTime}`;
            window.open(googleUrl, '_blank');
            setIsModalOpen(false);
            window.location.reload();
        } catch (error) { alert("Erreur mission"); }
    };

    const deleteMission = async (missionId: string) => {
        if (confirm("Supprimer cette mission ?")) {
            await deleteDoc(doc(db, "missions", missionId));
            setMissions(missions.filter(m => m.id !== missionId));
        }
    };

    const changeDocumentStatus = async (docId: string, currentStatus: string) => {
        const nextStatus = cycleStatus(currentStatus);
        try {
            await updateDoc(doc(db, "documents", docId), {
                status: nextStatus,
                updatedAt: serverTimestamp()
            });
            setDocuments(prev => prev.map(d =>
                d.id === docId ? { ...d, status: nextStatus } : d
            ));
        } catch (error) {
            console.error("Erreur changement statut:", error);
        }
    };

    // FONCTIONS POUR NOUVEAU CLIENT
    const handleFormChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNewClientSubmit = async (e: any) => {
        e.preventDefault();
        if (step < 3) return setStep(step + 1);

        setLoading(true);
        try {
            const docRef = await addDoc(collection(db, "clients"), {
                ...formData,
                createdAt: serverTimestamp(),
            });

            setSuccess(true);
            setTimeout(() => {
                router.push(`/admin/client?id=${docRef.id}`);
            }, 1500);
        } catch (error) {
            alert("Erreur lors de la sauvegarde.");
            setLoading(false);
        }
    };

    // ========== RENDU NOUVEAU CLIENT ==========
    if (isNewClient) {
        return (
            <div className="min-h-screen py-12 px-4 md:px-8">
                <div className="max-w-3xl mx-auto">

                    {/* HEADER + PROGRESSION */}
                    <div className="mb-12">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-4">
                                <Link href="/admin" className="text-[#B88A44] hover:text-[#1A1A1A] transition-colors">
                                    <ArrowLeft size={20} />
                                </Link>
                                <h1 className="text-[#1A1A1A] text-2xl font-serif uppercase tracking-widest">
                                    Nouvelle <span className="text-[#B88A44]">Fiche</span>
                                </h1>
                            </div>
                            <span className="text-[10px] font-bold text-[#B88A44] uppercase tracking-[0.2em]">Étape {step} sur 3</span>
                        </div>
                        <div className="h-1 w-full bg-[#1A1A1A]/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#B88A44] transition-all duration-500"
                                style={{ width: `${(step / 3) * 100}%` }}
                            />
                        </div>
                    </div>

                    <form onSubmit={handleNewClientSubmit} className="bg-white p-8 md:p-12 shadow-xl border-t-4 border-[#B88A44]">

                        {/* ÉTAPE 1 : PROPRIÉTAIRE */}
                        {step === 1 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                                <SectionTitle icon={<User size={18}/>} title="Identité du Propriétaire" />
                                <div className="grid grid-cols-1 gap-6">
                                    <FormInput name="ownerName" label="Nom & Prénom" value={formData.ownerName} onChange={handleFormChange} required />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormInput name="phone" label="Téléphone Direct" value={formData.phone} onChange={handleFormChange} />
                                        <FormInput name="email" label="Email" value={formData.email} onChange={handleFormChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Type de Contrat</label>
                                        <select
                                            name="contractType"
                                            value={formData.contractType}
                                            onChange={handleFormChange}
                                            className="w-full bg-[#F7F5F0] border-b border-[#B88A44]/20 py-3 px-4 text-sm focus:outline-none"
                                        >
                                            <option value="Standard">Standard (Entretien)</option>
                                            <option value="Premium">Premium (Gestion Totale)</option>
                                            <option value="Saisonnier">Saisonnier (Location)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ÉTAPE 2 : PROPRIÉTÉ & ACCÈS */}
                        {step === 2 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                                <SectionTitle icon={<Home size={18}/>} title="Accès & Connexion" />
                                <FormInput name="address" label="Adresse de la Propriété" value={formData.address} onChange={handleFormChange} />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#B88A44]">Sécurité</p>
                                        <FormInput name="alarmCode" label="Code Alarme" value={formData.alarmCode} onChange={handleFormChange} />
                                        <FormInput name="keyBox" label="Code Boîte à Clés" value={formData.keyBox} onChange={handleFormChange} />
                                        <FormInput name="keyCount" label="Nombre de jeux de clés" type="number" value={formData.keyCount} onChange={handleFormChange} />
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#B88A44]">Digital</p>
                                        <FormInput name="wifiName" label="Nom du Wifi" value={formData.wifiName} onChange={handleFormChange} />
                                        <FormInput name="wifiPassword" label="Mot de passe" value={formData.wifiPassword} onChange={handleFormChange} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ÉTAPE 3 : TECHNIQUE & ENTRETIEN */}
                        {step === 3 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                                <SectionTitle icon={<Droplet size={18}/>} title="Technique & Entretien" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormInput name="waterLocation" label="Vanne d'arrêt Eau" value={formData.waterLocation} onChange={handleFormChange} />
                                    <FormInput name="elecLocation" label="Compteur Électrique" value={formData.elecLocation} onChange={handleFormChange} />
                                    <FormInput name="garbageDays" label="Jours Poubelles" placeholder="ex: Lundi (Vert), Jeudi (Jaune)" value={formData.garbageDays} onChange={handleFormChange} />
                                    <FormInput name="poolDay" label="Passage Pisciniste" placeholder="ex: Chaque Mardi" value={formData.poolDay} onChange={handleFormChange} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Notes & Consignes Particulières</label>
                                    <textarea
                                        name="notes" value={formData.notes} onChange={handleFormChange} rows={4}
                                        className="w-full bg-[#F7F5F0] border border-[#B88A44]/10 p-4 text-sm font-serif focus:outline-none focus:border-[#B88A44]"
                                    />
                                </div>
                            </div>
                        )}

                        {/* BOUTONS DE NAVIGATION */}
                        <div className="mt-12 flex justify-between gap-4">
                            {step > 1 && (
                                <button
                                    type="button" onClick={() => setStep(step - 1)}
                                    className="flex items-center gap-3 px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/40 hover:text-[#B88A44] transition-colors"
                                >
                                    <ArrowLeft size={16} /> Précédent
                                </button>
                            )}

                            <button
                                type="submit" disabled={loading}
                                className={`ml-auto flex items-center gap-3 px-10 py-4 text-[10px] uppercase font-bold tracking-[0.2em] transition-all duration-500 shadow-lg ${
                                    step === 3 ? 'bg-[#1A1A1A] text-white hover:bg-[#B88A44]' : 'border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white'
                                }`}
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : success ? <CheckCircle size={16} /> : null}
                                {step === 3 ? (success ? "Terminé !" : "Finaliser la Fiche") : "Étape Suivante"}
                                {step < 3 && <ArrowRight size={16} />}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // ========== RENDU CLIENT EXISTANT ==========
    if (loading && !isEditing) return <div className="flex justify-center py-20 text-[#B88A44] font-serif italic">Chargement...</div>;
    if (!client) return null;

    return (
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-20 px-4">

            <div className="pt-4 flex justify-between items-center">
                <Link href="/admin" className="inline-flex items-center gap-2 text-[#B88A44] text-[10px] uppercase tracking-widest font-bold">
                    <ArrowLeft size={14} /> Retour
                </Link>

                {/* BOUTON ÉDITION */}
                <button
                    onClick={() => isEditing ? handleUpdateClient() : setIsEditing(true)}
                    className={`flex items-center gap-2 px-6 py-2 text-[10px] uppercase tracking-widest font-bold transition-all ${
                        isEditing ? 'bg-green-600 text-white' : 'bg-[#1A1A1A] text-white hover:bg-[#B88A44]'
                    }`}
                >
                    {isEditing ? <><CheckCircle size={14}/> Enregistrer</> : <><Pencil size={14}/> Modifier la fiche</>}
                </button>
            </div>

            {/* HEADER */}
            <div className="bg-[#1A1A1A] text-white p-6 md:p-12 shadow-2xl relative overflow-hidden border-b-4 border-[#B88A44]">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-[#B88A44] text-[10px] uppercase tracking-[0.4em] font-bold">Dossier Client</span>
                        {isEditing && <span className="text-orange-400 text-[10px] font-bold uppercase animate-pulse">Mode Édition Activé</span>}
                    </div>
                    {isEditing ? (
                        <input
                            className="bg-white/10 border-b border-[#B88A44] text-2xl md:text-5xl font-serif uppercase tracking-widest w-full outline-none focus:bg-white/20 px-2"
                            value={editData.ownerName}
                            onChange={(e) => setEditData({...editData, ownerName: e.target.value})}
                        />
                    ) : (
                        <h1 className="text-2xl md:text-5xl font-serif uppercase tracking-widest">{client.ownerName}</h1>
                    )}
                </div>
                <User className="absolute right-[-20px] bottom-[-20px] text-white/5 w-48 h-48 md:w-64 md:h-64" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

                <div className="space-y-6 md:space-y-8">
                    {/* CONTACT */}
                    <DetailBlock title="Contact" icon={<Phone size={18}/>}>
                        <div className="space-y-4">
                            <EditableLabel label="Téléphone" name="phone" value={client.phone} isEditing={isEditing} editData={editData} setEditData={setEditData} />
                            <EditableLabel label="Email" name="email" value={client.email} isEditing={isEditing} editData={editData} setEditData={setEditData} />
                            <EditableLabel label="Adresse" name="address" value={client.address} isEditing={isEditing} editData={editData} setEditData={setEditData} isItalic />
                        </div>
                    </DetailBlock>

                    {/* MISSIONS */}
                    <DetailBlock title="Missions" icon={<Calendar size={18}/>} action={<button onClick={() => setIsModalOpen(true)} className="p-1 text-[#B88A44]"><Plus size={18} /></button>}>
                        <div className="space-y-3">
                            {missions.length === 0 ? <p className="text-[11px] opacity-40 italic">Aucun historique.</p> :
                                missions.map((m) => (
                                    <div key={m.id} className="p-3 bg-[#F7F5F0] border-l-2 border-[#B88A44] relative group">
                                        <p className="text-[10px] font-bold uppercase mb-1">{m.description}</p>
                                        <div className="text-[9px] opacity-60 flex flex-col gap-0.5">
                                            <span>Le {new Date(m.date).toLocaleDateString('fr-FR')} | {m.startTime}-{m.endTime}</span>
                                        </div>
                                        <button onClick={() => deleteMission(m.id)} className="absolute top-2 right-2 text-red-400 p-1 xl:opacity-0 xl:group-hover:opacity-100"><Trash2 size={12} /></button>
                                    </div>
                                ))
                            }
                        </div>
                    </DetailBlock>

                    {/* DOCUMENTS (Devis & Factures) */}
                    <DetailBlock title="Devis & Factures" icon={<FileText size={18}/>}>
                        <div className="space-y-3">
                            {documents.length === 0 ? <p className="text-[11px] opacity-40 italic">Aucun document.</p> :
                                documents.map((docItem) => (
                                    <Link
                                        key={docItem.id}
                                        href={`/admin/facturation?doc=${docItem.id}`}
                                        className={`block p-3 border-l-2 relative group cursor-pointer hover:shadow-md transition-all ${docItem.type === 'devis' ? 'bg-blue-50 border-blue-500 hover:bg-blue-100' : 'bg-green-50 border-green-500 hover:bg-green-100'}`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[8px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${docItem.type === 'devis' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
                                                    {docItem.type}
                                                </span>
                                                <p className="text-[10px] font-bold">N° {docItem.invoiceNumber}</p>
                                            </div>
                                            <button
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); changeDocumentStatus(docItem.id, docItem.status); }}
                                                className={`text-[8px] uppercase font-bold px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-all ${
                                                    docItem.status === 'payé' ? 'bg-green-500 text-white' :
                                                    docItem.status === 'à payer' ? 'bg-orange-500 text-white' :
                                                    'bg-blue-500 text-white'
                                                }`}
                                                title="Cliquer pour changer le statut"
                                            >
                                                {docItem.status || 'émis'}
                                            </button>
                                        </div>
                                        <div className="text-[9px] opacity-60 flex flex-col gap-0.5">
                                            <span>Le {docItem.createdAt?.toDate ? new Date(docItem.createdAt.toDate()).toLocaleDateString('fr-FR') : new Date(docItem.date).toLocaleDateString('fr-FR')}</span>
                                            <span className="font-bold text-[#1A1A1A]">{docItem.totalTTC?.toFixed(2)} € TTC</span>
                                        </div>
                                        <div className="text-[8px] text-gray-500 mt-1">
                                            {docItem.categories?.length > 0 && <span>{docItem.categories.length} prestation(s)</span>}
                                            {docItem.categories?.length > 0 && docItem.products?.length > 0 && <span> • </span>}
                                            {docItem.products?.length > 0 && <span>{docItem.products.length} produit(s)</span>}
                                        </div>
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#B88A44] opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Pencil size={14} />
                                        </span>
                                    </Link>
                                ))
                            }
                        </div>
                    </DetailBlock>
                </div>

                <div className="lg:col-span-2 space-y-6 md:space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {/* CODES ACCÈS */}
                        <DetailBlock title="Accès & Codes" icon={<Lock size={18}/>}>
                            <div className="space-y-4">
                                <EditableBlock label="Code Alarme" name="alarmCode" value={client.alarmCode} isEditing={isEditing} editData={editData} setEditData={setEditData} isMono />
                                <div className="grid grid-cols-2 gap-4">
                                    <EditableBlock label="Boîte Clés" name="keyBox" value={client.keyBox} isEditing={isEditing} editData={editData} setEditData={setEditData} isMono />
                                    <EditableBlock label="Nb Clés" name="keyCount" value={client.keyCount} isEditing={isEditing} editData={editData} setEditData={setEditData} />
                                </div>
                            </div>
                        </DetailBlock>

                        {/* WIFI */}
                        <DetailBlock title="Wifi" icon={<Wifi size={18}/>}>
                            <div className="space-y-4">
                                <EditableLabel label="Nom Réseau" name="wifiName" value={client.wifiName} isEditing={isEditing} editData={editData} setEditData={setEditData} />
                                <EditableLabel label="Mot de passe" name="wifiPassword" value={client.wifiPassword} isEditing={isEditing} editData={editData} setEditData={setEditData} isMono isGold />
                            </div>
                        </DetailBlock>
                    </div>

                    {/* LOGISTIQUE */}
                    <DetailBlock title="Entretien & Logistique" icon={<ClipboardList size={18}/>}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <EditableLabel label="Jours Poubelles" name="garbageDays" value={client.garbageDays} isEditing={isEditing} editData={editData} setEditData={setEditData} />
                            <EditableLabel label="Passage Piscine" name="poolDay" value={client.poolDay} isEditing={isEditing} editData={editData} setEditData={setEditData} />
                            <EditableLabel label="Jardinier" name="gardenDay" value={client.gardenDay} isEditing={isEditing} editData={editData} setEditData={setEditData} />
                        </div>
                    </DetailBlock>

                    {/* TECHNIQUE & NOTES */}
                    <DetailBlock title="Technique & Consignes" icon={<Droplet size={18}/>}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-[#B88A44]/10">
                            <EditableLabel label="Vanne d'Eau" name="waterLocation" value={client.waterLocation} isEditing={isEditing} editData={editData} setEditData={setEditData} />
                            <EditableLabel label="Compteur Élec" name="elecLocation" value={client.elecLocation} isEditing={isEditing} editData={editData} setEditData={setEditData} />
                        </div>
                        <div className="space-y-3">
                            <p className="text-[10px] uppercase font-bold tracking-widest opacity-40 flex items-center gap-2"><FileText size={12}/> Notes Spécifiques</p>
                            {isEditing ? (
                                <textarea
                                    className="w-full bg-[#F7F5F0] border border-[#B88A44]/30 p-4 text-sm font-serif italic outline-none focus:border-[#B88A44]"
                                    rows={4}
                                    value={editData.notes}
                                    onChange={(e) => setEditData({...editData, notes: e.target.value})}
                                />
                            ) : (
                                <p className="text-sm text-[#1A1A1A]/70 leading-relaxed font-serif italic bg-[#F7F5F0]/50 p-4 rounded-sm">
                                    {client.notes || "Aucune consigne particulière."}
                                </p>
                            )}
                        </div>
                    </DetailBlock>
                </div>
            </div>

            {/* MODAL PLANIFICATION */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center px-0 md:px-4">
                    <div className="absolute inset-0 bg-[#1A1A1A]/90 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-md p-8 md:p-10 shadow-2xl border-t-4 border-[#B88A44] rounded-t-2xl md:rounded-none animate-in slide-in-from-bottom md:zoom-in duration-300">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 opacity-30 hover:opacity-100"><X size={24} /></button>
                        <h2 className="text-[#1A1A1A] text-xl font-serif uppercase tracking-widest mb-6 text-center">Planifier Mission</h2>
                        <form onSubmit={handleAddMission} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Date</label>
                                <input type="date" required className="w-full bg-[#F7F5F0] border-b border-[#B88A44]/20 py-3 px-4 text-sm outline-none" onChange={(e) => setEventData({...eventData, date: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Début</label>
                                    <input type="time" required className="w-full bg-[#F7F5F0] border-b border-[#B88A44]/20 py-3 px-4 text-sm outline-none" value={eventData.startTime} onChange={(e) => setEventData({...eventData, startTime: e.target.value})} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Fin</label>
                                    <input type="time" required className="w-full bg-[#F7F5F0] border-b border-[#B88A44]/20 py-3 px-4 text-sm outline-none" value={eventData.endTime} onChange={(e) => setEventData({...eventData, endTime: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Mission</label>
                                <input type="text" required placeholder="Ménage, accueil..." className="w-full bg-[#F7F5F0] border-b border-[#B88A44]/20 py-3 px-4 text-sm outline-none" onChange={(e) => setEventData({...eventData, description: e.target.value})} />
                            </div>
                            <button type="submit" className="w-full bg-[#1A1A1A] text-white py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#B88A44] transition-all flex items-center justify-center gap-3">
                                <Send size={14} /> Confirmer & Agenda
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- COMPOSANTS ---

function SectionTitle({ icon, title }: any) {
    return (
        <div className="flex items-center gap-3 border-b border-[#B88A44]/10 pb-4">
            <span className="text-[#B88A44]">{icon}</span>
            <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-[#1A1A1A]">{title}</h2>
        </div>
    );
}

function FormInput({ label, name, value, onChange, placeholder, required, type = "text" }: any) {
    return (
        <div className="flex flex-col gap-1 w-full">
            <label className="text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A]/40 ml-1">{label}</label>
            <input
                type={type} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder}
                className="w-full bg-[#F7F5F0] border-b border-[#B88A44]/20 py-3 px-4 text-sm focus:outline-none focus:border-[#B88A44] transition-all font-serif"
            />
        </div>
    );
}

function EditableLabel({ label, name, value, isEditing, editData, setEditData, isItalic, isMono, isGold }: any) {
    return (
        <div className="space-y-1">
            <p className="text-[9px] uppercase opacity-40 font-bold tracking-widest">{label}</p>
            {isEditing ? (
                <input
                    className="w-full bg-[#F7F5F0] border-b border-[#B88A44]/30 text-sm py-1 outline-none focus:border-[#B88A44]"
                    value={editData[name] || ''}
                    onChange={(e) => setEditData({...editData, [name]: e.target.value})}
                />
            ) : (
                <p className={`text-sm ${isItalic ? 'font-serif italic text-[#1A1A1A]/70' : 'font-medium'} ${isMono ? 'font-mono tracking-widest' : ''} ${isGold ? 'text-[#B88A44]' : ''}`}>
                    {value || '---'}
                </p>
            )}
        </div>
    );
}

function EditableBlock({ label, name, value, isEditing, editData, setEditData, isMono }: any) {
    return (
        <div className="bg-[#F7F5F0] p-4 border-l-2 border-[#B88A44]">
            <p className="text-[9px] uppercase opacity-40 font-bold mb-1">{label}</p>
            {isEditing ? (
                <input
                    className="w-full bg-transparent border-b border-[#B88A44]/30 text-sm font-bold outline-none"
                    value={editData[name] || ''}
                    onChange={(e) => setEditData({...editData, [name]: e.target.value})}
                />
            ) : (
                <p className={`text-lg font-bold ${isMono ? 'font-mono tracking-tighter' : ''}`}>{value || '---'}</p>
            )}
        </div>
    );
}

function DetailBlock({ title, icon, action, children }: any) {
    return (
        <div className="bg-white border border-[#B88A44]/10 p-5 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-[#B88A44]">{icon}</span>
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold">{title}</h3>
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}

export default function ClientPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center font-serif italic text-[#B88A44]">Chargement...</div>}>
            <ClientPageContent />
        </Suspense>
    );
}
