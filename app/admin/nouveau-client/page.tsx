'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import {
    User, Home, Key, Wifi, Droplet, Save, Loader2,
    CheckCircle, ArrowRight, ArrowLeft, Trash2, Calendar, ClipboardList
} from 'lucide-react';
import Link from 'next/link';

export default function NewClientPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [step, setStep] = useState(1); // Gestion des étapes (1 à 3)

    const [formData, setFormData] = useState({
        ownerName: '', phone: '', email: '',
        address: '', wifiName: '', wifiPassword: '',
        alarmCode: '', keyBox: '', keyCount: '1',
        waterLocation: '', elecLocation: '',
        garbageDays: '', poolDay: '', gardenDay: '',
        contractType: 'Standard', notes: ''
    });

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (step < 3) return setStep(step + 1);

        setLoading(true);
        try {
            await addDoc(collection(db, "clients"), {
                ...formData,
                createdAt: serverTimestamp(),
            });

            setSuccess(true);
            setTimeout(() => {
                router.push('/admin'); // Redirection vers le dashboard
            }, 2000);
        } catch (error) {
            alert("Erreur lors de la sauvegarde.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-12 px-4 md:px-8">
            <div className="max-w-3xl mx-auto">

                {/* PROGRESSION */}
                <div className="mb-12">
                    <Link href="/admin" className="inline-flex items-center gap-2 text-[#B88A44] text-[10px] uppercase tracking-widest font-bold mb-4 hover:text-[#1A1A1A] transition-colors">
                        <ArrowLeft size={14} /> Retour
                    </Link>
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-[#1A1A1A] text-2xl font-serif uppercase tracking-widest">
                            Nouvelle <span className="text-[#B88A44]">Fiche</span>
                        </h1>
                        <span className="text-[10px] font-bold text-[#B88A44] uppercase tracking-[0.2em]">Étape {step} sur 3</span>
                    </div>
                    <div className="h-1 w-full bg-[#1A1A1A]/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#B88A44] transition-all duration-500"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 shadow-xl border-t-4 border-[#B88A44]">

                    {/* ÉTAPE 1 : PROPRIÉTAIRE */}
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            <SectionTitle icon={<User size={18}/>} title="Identité du Propriétaire" />
                            <div className="grid grid-cols-1 gap-6">
                                <Input name="ownerName" label="Nom & Prénom" value={formData.ownerName} onChange={handleChange} required />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input name="phone" label="Téléphone Direct" value={formData.phone} onChange={handleChange} />
                                    <Input name="email" label="Email" value={formData.email} onChange={handleChange} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Type de Contrat</label>
                                    <select
                                        name="contractType"
                                        value={formData.contractType}
                                        onChange={handleChange}
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
                            <Input name="address" label="Adresse de la Propriété" value={formData.address} onChange={handleChange} />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#B88A44]">Sécurité</p>
                                    <Input name="alarmCode" label="Code Alarme" value={formData.alarmCode} onChange={handleChange} />
                                    <Input name="keyBox" label="Code Boîte à Clés" value={formData.keyBox} onChange={handleChange} />
                                    <Input name="keyCount" label="Nombre de jeux de clés" type="number" value={formData.keyCount} onChange={handleChange} />
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#B88A44]">Digital</p>
                                    <Input name="wifiName" label="Nom du Wifi" value={formData.wifiName} onChange={handleChange} />
                                    <Input name="wifiPassword" label="Mot de passe" value={formData.wifiPassword} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ÉTAPE 3 : TECHNIQUE & ENTRETIEN */}
                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            <SectionTitle icon={<Droplet size={18}/>} title="Technique & Entretien" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input name="waterLocation" label="Vanne d'arrêt Eau" value={formData.waterLocation} onChange={handleChange} />
                                <Input name="elecLocation" label="Compteur Électrique" value={formData.elecLocation} onChange={handleChange} />
                                <Input name="garbageDays" label="Jours Poubelles" placeholder="ex: Lundi (Vert), Jeudi (Jaune)" value={formData.garbageDays} onChange={handleChange} />
                                <Input name="poolDay" label="Passage Pisciniste" placeholder="ex: Chaque Mardi" value={formData.poolDay} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Notes & Consignes Particulières</label>
                                <textarea
                                    name="notes" value={formData.notes} onChange={handleChange} rows={4}
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

function SectionTitle({ icon, title }: any) {
    return (
        <div className="flex items-center gap-3 border-b border-[#B88A44]/10 pb-4">
            <span className="text-[#B88A44]">{icon}</span>
            <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-[#1A1A1A]">{title}</h2>
        </div>
    );
}

function Input({ label, name, value, onChange, placeholder, required, type = "text" }: any) {
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