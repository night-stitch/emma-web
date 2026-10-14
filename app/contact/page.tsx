'use client';

import { useT } from '@/lib/i18n';

import React, { useState, useEffect, useRef } from 'react';
import { Phone, Mail, MapPin, ArrowRight, Loader2, CheckCircle, XCircle, X, ArrowLeft, Instagram, Facebook } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// L'import d'EmailJS a été supprimé

export default function ContactPage() {
    const t = useT();
    const [loading, setLoading] = useState(false);
    const [consent, setConsent] = useState(false);
    // Anti-spam : champ invisible pour les humains, que les robots remplissent
    const [website, setWebsite] = useState('');
    const [openedAt] = useState(() => Date.now());
    const prefillRef = useRef('');

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
        message: '',
        maison: '',   // rempli quand on arrive depuis une maison (« Je suis intéressé·e »)
        forfait: '',  // rempli quand on arrive depuis « Demander une étude »
    });

    // Pré-remplissage depuis un lien : /contact?sujet=location&forfait=… ou ?sujet=maison&maison=…
    useEffect(() => {
        const q = new URLSearchParams(window.location.search);
        const sujet = q.get('sujet') || '';
        const maison = (q.get('maison') || '').slice(0, 120);
        const forfait = (q.get('forfait') || '').slice(0, 120);
        if (!sujet && !maison && !forfait) return;
        const subject = maison ? 'maison' : ['residence', 'location', 'gite', 'autre'].includes(sujet) ? sujet : '';
        const message = maison
            ? `${t('Bonjour, je suis intéressé·e par la maison')} « ${maison} ». `
            : forfait
                ? `${t('Bonjour, je souhaiterais une étude pour')} « ${forfait} ». `
                : '';
        // Le message pré-rempli suit la langue tant que le visiteur ne l'a pas modifié
        const previous = prefillRef.current;
        prefillRef.current = message;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData((f) => ({ ...f, subject, maison, forfait, message: !f.message || f.message === previous ? message : f.message }));
    }, [t]);

    // Auto-fermeture de la notification après 5 secondes
    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ ...notification, show: false });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Robot détecté (champ piège rempli ou formulaire envoyé en moins de 3 s) :
        // on fait comme si tout allait bien, sans rien enregistrer.
        if (website.trim() !== '' || Date.now() - openedAt < 3000) {
            setNotification({ show: true, message: "Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.", type: 'success' });
            setFormData({ name: '', email: '', phone: '', subject: '', message: '', maison: '', forfait: '' });
            setConsent(false);
            return;
        }

        setLoading(true);

        try {
            // 1. Enregistrement du message (c'est lui qui compte : visible dans l'admin › Messages)
            await addDoc(collection(db, "messages"), {
                ...formData,
                consent: true,
                createdAt: serverTimestamp(),
            });

            // 2. Email de notification via Cloud Function : bonus. S'il échoue, le message
            //    est quand même reçu dans l'admin, donc pas d'erreur affichée au visiteur.
            fetch('https://us-central1-lacleprovencale-c1c69.cloudfunctions.net/notifyNewContact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            }).then((r) => {
                if (!r.ok) console.warn('Notification email non envoyée (statut ' + r.status + ')');
            }).catch((err) => console.warn('Notification email non envoyée :', err));

            // Notification de succès
            setNotification({
                show: true,
                message: "Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.",
                type: 'success'
            });

            // Reset du formulaire
            setFormData({ name: '', email: '', phone: '', subject: '', message: '', maison: '', forfait: '' });
            setConsent(false);

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
                className="fixed top-24 left-4 z-50 flex min-[1101px]:hidden items-center gap-2 bg-[#F7F5F0]/95 backdrop-blur-sm text-[#1A1A1A] px-4 py-2 border border-[#B88A44]/30 hover:bg-[#B88A44] hover:text-white hover:border-[#B88A44] transition-colors text-[10px] uppercase tracking-widest font-bold"
            >
                <ArrowLeft size={14} /> {t('Retour')}
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
                                    {notification.type === 'success' ? t('Confirmation') : t('Erreur')}
                                </h3>
                                <p className="text-[#1A1A1A]/60 text-xs leading-relaxed">
                                    {t(notification.message)}
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

            <section id="contact-main" className="min-h-[85vh] w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 px-6 pt-20 pb-12 min-[1101px]:py-12">

                {/* --- COLONNE GAUCHE --- */}
                <div className="w-full lg:w-1/2 space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
                    <div>
                        <span className="text-[#B88A44] text-[10px] uppercase tracking-[0.4em] mb-4 block font-bold">{t('Parlons de vous')}</span>
                        <h1 className="text-[#1A1A1A] text-4xl md:text-6xl font-serif uppercase tracking-[0.1em] leading-tight mb-6">
                            {t('Une Demande')} <br /> <span className="text-[#B88A44] italic lowercase font-serif pr-2">{t('particulière')}</span>{t(' ?')}
                        </h1>
                        <p className="text-[#1A1A1A]/60 text-sm md:text-base leading-relaxed tracking-wide max-w-md">
                            {t('Que ce soit pour une gestion complète ou un besoin ponctuel, nous sommes à votre écoute pour concevoir une solution sur-mesure.')}
                        </p>
                    </div>

                    <div className="space-y-6 border-l-2 border-[#B88A44]/20 pl-8">
                        <ContactInfo icon={<Phone size={18} />} label={t('Téléphone')} value="06 68 60 40 63" link="tel:+33668604063" />
                        <ContactInfo icon={<Mail size={18} />} label={t('Email')} value="conciergerie@lacleprovencale.fr" link="mailto:conciergerie@lacleprovencale.fr" />
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 border border-[#B88A44]/30 flex items-center justify-center text-[#B88A44]"><MapPin size={18} /></div>
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/50 mb-1">{t('Zone d’intervention')}</p>
                                <span className="text-[#1A1A1A] font-serif text-lg">{t('Gordes, Luberon, Provence')}</span>
                            </div>
                        </div>

                        {/* Réseaux sociaux (mêmes liens que le footer) */}
                        <div className="flex items-center gap-4 pt-2">
                            <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/50">{t('Suivez-nous')}</p>
                            <a href="https://www.instagram.com/la_cle_provencale?igsh=MTB2bXo2eG55bTFleQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 border border-[#B88A44]/30 flex items-center justify-center text-[#B88A44] hover:bg-[#B88A44] hover:text-white transition-all duration-300">
                                <Instagram size={16} />
                            </a>
                            <a href="https://www.facebook.com/share/1MTv9X7Hrb/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 border border-[#B88A44]/30 flex items-center justify-center text-[#B88A44] hover:bg-[#B88A44] hover:text-white transition-all duration-300">
                                <Facebook size={16} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* --- COLONNE DROITE : FORMULAIRE --- */}
                <div className="w-full lg:w-1/2 bg-white p-8 md:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 border-t-4 border-[#B88A44]">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Rappel du sujet quand on arrive depuis une maison ou un forfait */}
                        {(formData.maison || formData.forfait) && (
                            <div className="flex items-center justify-between gap-3 bg-[#F7F5F0] border-l-2 border-[#B88A44] px-4 py-3">
                                <p className="text-[11px] text-[#1A1A1A]/70">
                                    <span className="uppercase tracking-widest text-[10px] font-bold text-[#B88A44] mr-2">{t('À propos de')}</span>
                                    <span className="font-serif text-sm text-[#1A1A1A]">{formData.maison || formData.forfait}</span>
                                </p>
                                <button type="button" aria-label={t('Retirer')} onClick={() => setFormData((f) => ({ ...f, maison: '', forfait: '', subject: f.subject === 'maison' ? '' : f.subject }))}
                                        className="text-[#1A1A1A]/30 hover:text-[#B88A44] text-lg leading-none">×</button>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput name="name" placeholder={t('Votre Nom')} onChange={handleChange} value={formData.name} required />
                            <FormInput name="phone" placeholder={t('Téléphone')} onChange={handleChange} value={formData.phone} />
                        </div>
                        <FormInput name="email" type="email" placeholder={t('Adresse Email')} onChange={handleChange} value={formData.email} required />

                        <div className="relative group">
                            <select
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b border-[#1A1A1A]/20 py-4 text-[#1A1A1A] focus:outline-none focus:border-[#B88A44] transition-colors font-serif appearance-none cursor-pointer"
                            >
                                <option value="" disabled>{t('Sujet de votre demande')}</option>
                                <option value="residence">{t('Gestion Résidence Secondaire')}</option>
                                <option value="location">{t('Gestion Locative (Saisonnier)')}</option>
                                <option value="gite">{t('Support Gîte / Maison d’hôtes')}</option>
                                <option value="autre">{t('Autre demande')}</option>
                                {formData.maison && <option value="maison">{t('Maison')} : {formData.maison}</option>}
                            </select>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[#B88A44]">▼</div>
                        </div>

                        <textarea
                            name="message" rows={4} required
                            placeholder={t('Comment pouvons-nous vous aider ?')}
                            className="w-full bg-transparent border-b border-[#1A1A1A]/20 py-4 text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus:outline-none focus:border-[#B88A44] transition-colors font-serif resize-none"
                            onChange={handleChange}
                            value={formData.message}
                        ></textarea>

                        {/* Champ piège anti-spam (invisible) */}
                        <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
                            <label htmlFor="website">Ne pas remplir</label>
                            <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off"
                                   value={website} onChange={(e) => setWebsite(e.target.value)} />
                        </div>

                        {/* Consentement RGPD */}
                        <label className="flex items-start gap-3 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                required
                                checked={consent}
                                onChange={(e) => setConsent(e.target.checked)}
                                className="peer sr-only"
                            />
                            <span className="mt-0.5 w-4 h-4 shrink-0 border border-[#B88A44]/50 flex items-center justify-center peer-checked:bg-[#B88A44] peer-focus-visible:ring-2 peer-focus-visible:ring-[#B88A44]/40 transition-colors">
                                {consent && <span className="w-1.5 h-1.5 rotate-45 bg-white"></span>}
                            </span>
                            <span className="text-[11px] text-[#1A1A1A]/60 leading-relaxed">
                                {t('J’accepte que mes données soient utilisées pour être recontacté·e au sujet de ma demande.')}{' '}
                                {t('Voir notre')} <Link href="/confidentialite" className="text-[#B88A44] underline underline-offset-2">{t('politique de confidentialité')}</Link>.
                            </span>
                        </label>

                        <div className="pt-4 text-right">
                            <button
                                type="submit"
                                disabled={loading || !consent}
                                className="inline-flex items-center gap-3 px-10 py-4 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-[0.3em] hover:bg-[#B88A44] transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : t("Envoyer le message")}
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
function ContactInfo({ icon, label, value, link }: { icon: React.ReactNode; label: string; value: string; link: string }) {
    return (
        <div className="group flex items-center gap-4 cursor-pointer">
            <div className="w-10 h-10 border border-[#B88A44]/30 flex items-center justify-center text-[#B88A44] group-hover:bg-[#B88A44] group-hover:text-white transition-all duration-500">
                {icon}
            </div>
            <div>
                <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/50 mb-1">{label}</p>
                <a href={link} className="text-[#1A1A1A] font-serif text-lg group-hover:text-[#B88A44] transition-colors">
                    {value}
                </a>
            </div>
        </div>
    );
}

function FormInput({ name, type = "text", placeholder, onChange, value, required }: {
    name: string; type?: string; placeholder: string; value: string; required?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
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