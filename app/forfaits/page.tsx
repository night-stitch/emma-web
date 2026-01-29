'use client';

import React from 'react';
import { Check, ChevronRight, Sparkles, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from "next/link";
import Footer from '../components/Footer';

export default function ForfaitsPage() {
    return (
        <div className="relative overflow-y-auto scroll-smooth">
            {/* Bouton Retour */}
            <Link
                href="/"
                className="fixed top-24 left-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-sm text-[#1A1A1A] px-4 py-2 rounded-full shadow-lg hover:bg-[#B88A44] hover:text-white transition-all text-[10px] uppercase tracking-widest font-bold"
            >
                <ArrowLeft size={14} /> Retour
            </Link>

            {/* SECTION 1 : INTRO */}
            <section id="intro" className="min-h-screen w-full flex items-center justify-center px-4 md:px-6 py-20 md:py-0 relative overflow-hidden">
                {/* Background image */}
                <div className="absolute inset-0 z-0">
                    <Image src="/chant-de-lavande.jpg" alt="Provence" fill className="object-cover" priority />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80"></div>
                    {/* Golden glow effects */}
                    <div className="absolute top-0 left-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#B88A44]/15 rounded-full blur-[100px] md:blur-[150px]"></div>
                    <div className="absolute bottom-0 right-0 w-[350px] md:w-[700px] h-[350px] md:h-[700px] bg-[#B88A44]/12 rounded-full blur-[120px] md:blur-[180px]"></div>
                    {/* Bottom transition fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/90 to-transparent"></div>
                </div>

                {/* Decorative corner frames - hidden on mobile */}
                <div className="hidden md:block absolute top-30 left-16 w-24 h-24 border-l-2 border-t-2 border-[#B88A44]/40 z-10"></div>
                <div className="hidden md:block absolute top-30 right-16 w-24 h-24 border-r-2 border-t-2 border-[#B88A44]/40 z-10"></div>
                <div className="hidden md:block absolute bottom-10 left-16 w-24 h-24 border-l-2 border-b-2 border-[#B88A44]/40 z-10"></div>
                <div className="hidden md:block absolute bottom-10 right-16 w-24 h-24 border-r-2 border-b-2 border-[#B88A44]/40 z-10"></div>

                <div className="text-center max-w-4xl mx-auto relative z-10 px-2">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 md:gap-3 bg-white/10 backdrop-blur-md border border-[#B88A44]/40 rounded-full px-4 md:px-6 py-2 md:py-3 mb-6 md:mb-10 shadow-xl">
                        <div className="w-2 h-2 rounded-full bg-[#B88A44] animate-pulse"></div>
                        <span className="text-[#B88A44] text-[8px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] font-bold">
                            Tarification & Services
                        </span>
                        <Sparkles size={12} className="text-[#B88A44] md:hidden" />
                        <Sparkles size={14} className="text-[#B88A44] hidden md:block" />
                    </div>

                    {/* Main title */}
                    <div className="relative mb-6 md:mb-8">
                        <h1 className="text-white text-3xl sm:text-4xl md:text-7xl lg:text-8xl font-serif uppercase tracking-[0.08em] md:tracking-[0.12em] leading-[1.1] drop-shadow-lg">
                            Nos Forfaits
                        </h1>
                        <div className="flex items-center justify-center gap-3 md:gap-6 mt-3 md:mt-4">
                            <div className="w-8 md:w-16 h-[1px] bg-gradient-to-r from-transparent to-[#B88A44]"></div>
                            <span className="text-[#B88A44] text-2xl sm:text-3xl md:text-6xl lg:text-7xl italic font-serif lowercase drop-shadow-lg">
                                Exclusifs
                            </span>
                            <div className="w-8 md:w-16 h-[1px] bg-gradient-to-l from-transparent to-[#B88A44]"></div>
                        </div>
                    </div>

                    {/* Decorative divider */}
                    <div className="flex items-center justify-center gap-4 mb-6 md:mb-8">
                        <div className="w-8 md:w-12 h-[1px] bg-[#B88A44]/50"></div>
                        <div className="w-2 h-2 rotate-45 border border-[#B88A44]/70"></div>
                        <div className="w-8 md:w-12 h-[1px] bg-[#B88A44]/50"></div>
                    </div>

                    {/* Description */}
                    <p className="text-white/80 text-sm md:text-lg max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed tracking-wide px-2">
                        Des solutions sur mesure pour chaque type de propriété en Provence.
                        <span className="block mt-2 md:mt-3 text-[#B88A44] text-xs md:text-sm font-medium uppercase tracking-[0.15em] md:tracking-[0.2em]">
                            Excellence • Sérénité • Confiance
                        </span>
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
                        <a href="#secondaire" className="group inline-flex items-center justify-center gap-2 md:gap-3 bg-[#B88A44] text-white px-6 md:px-10 py-4 md:py-5 rounded-full text-[10px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em] font-bold hover:bg-white hover:text-[#1A1A1A] transition-all duration-500 shadow-2xl shadow-[#B88A44]/30 hover:scale-105">
                            Découvrir nos offres
                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform md:hidden" />
                            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform hidden md:block" />
                        </a>
                        <Link href="/contact" className="inline-flex items-center justify-center gap-2 text-white/70 px-6 md:px-8 py-3 md:py-4 text-[10px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em] font-medium hover:text-[#B88A44] transition-all duration-300 border border-white/20 rounded-full hover:border-[#B88A44]/50">
                            Nous contacter
                            <ChevronRight size={12} className="md:hidden" />
                            <ChevronRight size={14} className="hidden md:block" />
                        </Link>
                    </div>

                    {/* Scroll indicator - hidden on mobile */}
                    <div className="hidden md:flex absolute -bottom-20 left-1/2 -translate-x-1/2 flex-col items-center gap-2">
                        <span className="text-[8px] uppercase tracking-[0.3em] text-white/40">Scroll</span>
                        <div className="w-[1px] h-8 bg-gradient-to-b from-[#B88A44]/60 to-transparent"></div>
                    </div>
                </div>
            </section>

            {/* --- SECTION 2 : RÉSIDENCES SECONDAIRES --- */}
            <section id="secondaire" className="min-h-screen w-full relative flex flex-col justify-center py-16 md:py-24 px-4 md:px-12 overflow-hidden">
                {/* Background image */}
                <div className="absolute inset-0 z-0">
                    <Image src="/maison-stone.jpg" alt="Background" fill className="object-cover" priority />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80"></div>
                    {/* Top transition fade */}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/70 to-transparent"></div>
                    {/* Bottom transition fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent"></div>
                    {/* Golden glow effects */}
                    <div className="absolute top-0 left-0 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-[#B88A44]/10 rounded-full blur-[80px] md:blur-[120px]"></div>
                    <div className="absolute bottom-0 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#B88A44]/10 rounded-full blur-[100px] md:blur-[150px]"></div>
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:h-full">
                    <ModernPricingSection
                        title="Résidences Secondaires"
                        subtitle="Surveillance & Intendance"
                        description="Une gestion complète de votre bien, de la simple vigilance à l'expérience hôtelière 7j/7."
                        features={[
                            { title: "Vigilance", desc: "Visites de contrôle, aération, relevé courrier." },
                            { title: "Intendance", desc: "Préparation complète et fermeture." },
                            { title: "Maintenance", desc: "Suivi travaux et coordination artisans." },
                            { title: "Conciergerie", desc: "Courses et réservations." },
                        ]}
                        packs={[
                            { name: "Pack Surveillance", price: "Mensuel + Déplac.", list: ["Passages réguliers", "Sécurité", "Rapport"] },
                            { name: "Pack Entretien", price: "Mensuel", list: ["Pack Surveillance", "Jardin & Piscine", "Artisans"] },
                            { name: "Pack Sérénité", price: "Fixe + Variable", list: ["Pack Entretien", "Préparation Arrivée", "Ménage départ"], highlight: true },
                        ]}
                    />
                </div>
            </section>

            {/* --- SECTION 3 : LOCATIONS SAISONNIÈRES --- */}
            <section id="saisonnier" className="min-h-screen w-full relative flex flex-col justify-center py-16 md:py-24 px-4 md:px-12 overflow-hidden">
                {/* Background image */}
                <div className="absolute inset-0 z-0">
                    <Image src="/gite-stone.jpg" alt="Interieur Luxe" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80"></div>
                    {/* Top transition fade */}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/70 to-transparent"></div>
                    {/* Bottom transition fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent"></div>
                    {/* Golden glow effects */}
                    <div className="absolute top-1/4 right-0 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-[#B88A44]/10 rounded-full blur-[80px] md:blur-[120px]"></div>
                    <div className="absolute bottom-1/4 left-0 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-[#B88A44]/10 rounded-full blur-[70px] md:blur-[100px]"></div>
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:h-full">
                    <ModernPricingSection
                        title="Locations Saisonnières"
                        subtitle="Gestion & Rentabilité"
                        description="Maximisez vos revenus locatifs sans les contraintes. De la mise en ligne à l'accueil VIP, nous gérons tout."
                        features={[
                            { title: "Commercialisation", desc: "Création annonces, photos pro, sélection locataires." },
                            { title: "Logistique", desc: "Ménage pro, blanchisserie, réassort." },
                            { title: "Expérience", desc: "Accueil personnalisé, assistance 7j/7." },
                            { title: "Suivi", desc: "Rapport mensuel, gestion des avis." },
                        ]}
                        packs={[
                            { name: "Pack Clés en main", price: "Par déplacement", list: ["Remise des clés", "Récupération", "Présentation"] },
                            { name: "Pack Essentiel", price: "Sur Devis", list: ["Remise des clés", "Réassort", "Ménage départ"] },
                            { name: "Pack Confort", price: "Journalier", list: ["Pack Essentiel", "Accueil VIP", "Assistance 7j/7"] },
                            { name: "Pack Gestion", price: "20% Revenus", list: ["Pack Essentiel", "Gestion PMS", "Maintenance"], highlight: true },
                        ]}
                    />
                </div>
            </section>

            {/* --- SECTION 4 : GÎTES & MAISONS D'HÔTES --- */}
            <section id="gites" className="min-h-screen w-full relative flex flex-col justify-center py-16 md:py-24 px-4 md:px-12 overflow-hidden">
                {/* Background image */}
                <div className="absolute inset-0 z-0">
                    <Image src="/hote-stone.jpg" alt="Ambiance Gîte" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/70"></div>
                    {/* Top transition fade */}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/70 to-transparent"></div>
                    {/* Golden glow effects */}
                    <div className="absolute top-0 left-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#B88A44]/10 rounded-full blur-[100px] md:blur-[140px]"></div>
                    <div className="absolute bottom-0 right-1/4 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-[#B88A44]/10 rounded-full blur-[80px] md:blur-[120px]"></div>
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:h-full">
                    <ModernPricingSection
                        title="Gîtes & Maisons d'Hôtes"
                        subtitle="Support Opérationnel"
                        description="Allégez votre quotidien de propriétaire tout en offrant une expérience 5 étoiles à vos hôtes."
                        features={[
                            { title: "Accueil", desc: "Accueil physique, assistance séjour, check-out." },
                            { title: "Intendance", desc: "Ménage quotidien, gestion du linge." },
                            { title: "Gestion", desc: "Plannings, réassort, coordination." },
                            { title: "Services", desc: "Activités locales, transferts." },
                        ]}
                        packs={[
                            { name: "Pack Exploitation", price: "Taux Horaire", list: ["Accueil & Départ", "Ménage & Linge", "Petit-déjeuner"] },
                            { name: "Pack Gestion", price: "Mensuel", list: ["Gestion prestataires", "Calendrier", "Maintenance"], highlight: true },
                        ]}
                    />
                </div>
            </section>

            {/* FOOTER */}
            <section>
                <Footer />
            </section>
        </div>
    );
}

// --- COMPOSANT MODERNE ---
function ModernPricingSection({ title, subtitle, description, features, packs }: any) {
    return (
        <div className="flex flex-col md:h-full justify-between gap-8 md:gap-16">

            {/* HAUT : TITRE ET FEATURES */}
            <div>
                <div className="text-center mb-6 md:mb-12">
                    <span className="inline-block text-[#B88A44] text-[8px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] mb-4 md:mb-6 font-bold bg-[#B88A44]/20 px-4 md:px-5 py-2 md:py-2.5 rounded-full">
                        {subtitle}
                    </span>
                    <h2 className="text-white text-2xl sm:text-3xl md:text-6xl font-serif uppercase tracking-[0.1em] md:tracking-[0.15em] mb-4 md:mb-6">
                        {title}
                    </h2>
                    <div className="w-16 md:w-24 h-[2px] bg-gradient-to-r from-transparent via-[#B88A44] to-transparent mx-auto mb-4 md:mb-6"></div>
                    <p className="text-white/70 text-xs md:text-base leading-relaxed tracking-wide max-w-2xl mx-auto px-2">
                        {description}
                    </p>
                </div>

                {/* Features - en colonne */}
                <div className="flex flex-col gap-3 md:gap-4 max-w-2xl mx-auto">
                    {features.map((feat: any, i: number) => (
                        <div key={i} className="flex gap-3 md:gap-4 bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 border border-white/10 hover:bg-white/15 transition-all duration-300">
                            <span className="text-[#B88A44] font-serif italic text-lg md:text-2xl">
                                0{i + 1}.
                            </span>
                            <div>
                                <h4 className="text-white text-[10px] md:text-[11px] uppercase tracking-[0.15em] md:tracking-[0.2em] font-bold mb-0.5 md:mb-1">
                                    {feat.title}
                                </h4>
                                <p className="text-white/50 text-[9px] md:text-[10px] uppercase tracking-wider">
                                    {feat.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* BAS : PACKS */}
            <div>
                {/* Ligne des Packs - centrés avec scroll */}
                <div className="overflow-x-auto pb-4 scrollbar-hide text-center">
                    <div className="inline-flex flex-nowrap gap-3 md:gap-6 items-stretch px-4">
                    {packs.map((pack: any, i: number) => {
                        return (
                            <div
                                key={i}
                                className={`
                                    relative rounded-xl md:rounded-2xl p-4 md:p-8 transition-all duration-500 flex flex-col flex-shrink-0 w-[160px] md:w-[200px] lg:w-[220px] overflow-hidden
                                    ${pack.highlight
                                        ? 'bg-[#F7F5F0] shadow-2xl shadow-black/20 z-10'
                                        : 'bg-[#F7F5F0] hover:shadow-xl hover:-translate-y-2'
                                    }
                                `}
                            >
                                {/* Effet de lumière dorée comme global.css */}
                                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(at_0%_0%,rgba(184,138,68,0.08)_0,transparent_50%)]"></div>
                                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(at_100%_100%,rgba(184,138,68,0.06)_0,transparent_50%)]"></div>

                                <div className="relative z-10">
                                    <div className="mb-3 md:mb-5 w-full">
                                        <h3 className="text-[#1A1A1A] text-[10px] md:text-[12px] font-bold uppercase tracking-wider mb-0.5 md:mb-1">
                                            {pack.name}
                                        </h3>
                                        <span className="text-[#B88A44] font-bold text-[9px] md:text-[10px] uppercase tracking-widest">
                                            {pack.price}
                                        </span>
                                    </div>

                                    <div className="h-px bg-gradient-to-r from-[#B88A44]/40 via-[#B88A44]/20 to-transparent mb-3 md:mb-5 w-full"></div>

                                    <ul className="space-y-2 md:space-y-3">
                                        {pack.list.map((item: string, j: number) => (
                                            <li key={j} className="flex items-start gap-2 md:gap-3 text-[9px] md:text-[11px] uppercase tracking-wider text-[#1A1A1A]/60 leading-tight font-medium">
                                                <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-[#B88A44]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-[#B88A44]" />
                                                </div>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                    </div>
                </div>

                <div className="text-center pt-6 md:pt-12">
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 md:gap-3 bg-white/10 backdrop-blur-sm text-white border border-white/20 px-6 md:px-12 py-3 md:py-5 rounded-full text-[10px] md:text-[11px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-medium transition-all duration-500 hover:bg-[#B88A44] hover:border-[#B88A44] hover:scale-105 hover:shadow-xl"
                    >
                        Demander une étude
                        <ChevronRight size={14} className="md:hidden" />
                        <ChevronRight size={16} className="hidden md:block" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
