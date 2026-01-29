'use client';

import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, ArrowRight, Loader2, CheckCircle, XCircle, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// L'import d'EmailJS a été supprimé

export default function ContactPage() {
    const [loading, setLoading] = useState(false);

    // État pour la notification personnalisée
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: 'success' // 'success' ou 'error'
    });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    // Auto-fermeture de la notification après 5 secondes
    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ ...notification, show: false });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Sauvegarde dans Firestore (Backup de sécurité)
            await addDoc(collection(db, "messages"), {
                ...formData,
                createdAt: serverTimestamp(),
            });

            // 2. Envoi de l'email via Cloud Function pour notifier l'admin
            const response = await fetch('https://us-central1-lacleprovencale-c1c69.cloudfunctions.net/notifyNewContact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Erreur serveur lors de l'envoi");
            }

            // Notification de succès
            setNotification({
                show: true,
                message: "Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.",
                type: 'success'
            });

            // Reset du formulaire
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });

        } catch (error) {
            console.error("Erreur envoi:", error);
            setNotification({
                show: true,
                message: "Une erreur est survenue lors de l'envoi. Veuillez vérifier votre connexion.",
                type: 'error'
            });
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen pt-20 relative">
            {/* Bouton Retour */}
            <Link
                href="/"
                className="fixed top-24 left-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-sm text-[#1A1A1A] px-4 py-2 rounded-full shadow-lg hover:bg-[#B88A44] hover:text-white transition-all text-[10px] uppercase tracking-widest font-bold"
            >
                <ArrowLeft size={14} /> Retour
            </Link>

            {/* --- COMPOSANT NOTIFICATION PERSONNALISÉE --- */}
            {notification.show && (
                <div className="fixed top-24 right-6 z-[9999] w-full max-w-sm animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className={`bg-white shadow-2xl border-l-4 p-6 ${notification.type === 'success' ? 'border-[#B88A44]' : 'border-red-500'}`}>
                        <div className="flex items-start gap-4">
                            {notification.type === 'success' ? (
                                <CheckCircle className="text-[#B88A44] shrink-0" size={24} />
                            ) : (
                                <XCircle className="text-red-500 shrink-0" size={24} />
                            )}
                            <div className="flex-1">
                                <h3 className="text-[#1A1A1A] font-serif text-sm uppercase tracking-widest mb-1 font-bold">
                                    {notification.type === 'success' ? 'Confirmation' : 'Erreur'}
                                </h3>
                                <p className="text-[#1A1A1A]/60 text-xs leading-relaxed">
                                    {notification.message}
                                </p>
                            </div>
                            <button
                                onClick={() => setNotification({ ...notification, show: false })}
                                className="text-[#1A1A1A]/20 hover:text-[#1A1A1A] transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <section id="contact-main" className="min-h-[85vh] w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 px-6 py-12">

                {/* --- COLONNE GAUCHE --- */}
                <div className="w-full lg:w-1/2 space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
                    <div>
                        <span className="text-[#B88A44] text-[10px] uppercase tracking-[0.4em] mb-4 block font-bold">Parlons de vous</span>
                        <h1 className="text-[#1A1A1A] text-4xl md:text-6xl font-serif uppercase tracking-[0.1em] leading-tight mb-6">
                            Une Demande <br /> <span className="text-[#B88A44] italic lowercase font-serif pr-2">particulière</span> ?
                        </h1>
                        <p className="text-[#1A1A1A]/60 text-sm md:text-base leading-relaxed tracking-wide max-w-md">
                            Que ce soit pour une gestion complète ou un besoin ponctuel, nous sommes à votre écoute pour concevoir une solution sur-mesure.
                        </p>
                    </div>

                    <div className="space-y-6 border-l-2 border-[#B88A44]/20 pl-8">
                        <ContactInfo icon={<Phone size={18} />} label="Téléphone" value="06 00 00 00 00" link="tel:+33600000000" />
                        <ContactInfo icon={<Mail size={18} />} label="Email" value="contact@cle-provencale.com" link="mailto:contact@cle-provencale.com" />
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full border border-[#B88A44]/30 flex items-center justify-center text-[#B88A44]"><MapPin size={18} /></div>
                            <div>
                                <p className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/50 mb-1">Zone d'intervention</p>
                                <span className="text-[#1A1A1A] font-serif text-lg">Gordes & le Luberon</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- COLONNE DROITE : FORMULAIRE --- */}
                <div className="w-full lg:w-1/2 bg-white p-8 md:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 border-t-4 border-[#B88A44]">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput name="name" placeholder="Votre Nom" onChange={handleChange} value={formData.name} required />
                            <FormInput name="phone" placeholder="Téléphone" onChange={handleChange} value={formData.phone} />
                        </div>
                        <FormInput name="email" type="email" placeholder="Adresse Email" onChange={handleChange} value={formData.email} required />

                        <div className="relative group">
                            <select
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b border-[#1A1A1A]/20 py-4 text-[#1A1A1A] focus:outline-none focus:border-[#B88A44] transition-colors font-serif appearance-none cursor-pointer"
                            >
                                <option value="" disabled>Sujet de votre demande</option>
                                <option value="residence">Gestion Résidence Secondaire</option>
                                <option value="location">Gestion Locative (Saisonnier)</option>
                                <option value="gite">Support Gîte / Maison d'hôtes</option>
                                <option value="autre">Autre demande</option>
                            </select>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[#B88A44]">▼</div>
                        </div>

                        <textarea
                            name="message" rows={4} required
                            placeholder="Comment pouvons-nous vous aider ?"
                            className="w-full bg-transparent border-b border-[#1A1A1A]/20 py-4 text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus:outline-none focus:border-[#B88A44] transition-colors font-serif resize-none"
                            onChange={handleChange}
                            value={formData.message}
                        ></textarea>

                        <div className="pt-4 text-right">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center gap-3 px-10 py-4 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-[0.3em] hover:bg-[#B88A44] transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : "Envoyer le message"}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
}

// Composants internes pour la propreté du code
function ContactInfo({ icon, label, value, link }: any) {
    return (
        <div className="group flex items-center gap-4 cursor-pointer">
            <div className="w-10 h-10 rounded-full border border-[#B88A44]/30 flex items-center justify-center text-[#B88A44] group-hover:bg-[#B88A44] group-hover:text-white transition-all duration-500">
                {icon}
            </div>
            <div>
                <p className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/50 mb-1">{label}</p>
                <a href={link} className="text-[#1A1A1A] font-serif text-lg group-hover:text-[#B88A44] transition-colors">
                    {value}
                </a>
            </div>
        </div>
    );
}

function FormInput({ name, type = "text", placeholder, onChange, value, required }: any) {
    return (
        <div className="relative group">
            <input
                type={type} name={name} required={required}
                placeholder={placeholder}
                value={value}
                className="w-full bg-transparent border-b border-[#1A1A1A]/20 py-4 text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus:outline-none focus:border-[#B88A44] transition-colors font-serif"
                onChange={onChange}
            />
        </div>
    );
}