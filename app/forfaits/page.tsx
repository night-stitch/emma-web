'use client';

import React from 'react';
import { Check } from 'lucide-react';
import Image from 'next/image';
import Link from "next/link";

export default function ForfaitsPage() {
    return (
        /* On s'assure que rien ne bloque l'affichage ici */
        <div className="relative">

            {/* SECTION 1 : INTRO */}
            <section id="intro" className="snap-section h-auto py-32 md:h-screen w-full md:snap-center flex items-center justify-center px-6">
                <div className="text-center max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <span className="text-[#B88A44] text-[10px] md:text-xs uppercase tracking-[0.5em] mb-6 block font-bold">
                        Tarification & Services
                    </span>
                    <h1 className="text-[#1A1A1A] text-4xl md:text-7xl font-serif uppercase tracking-[0.15em] leading-tight mb-8">
                        Nos Forfaits <br /> <span className="text-[#B88A44] italic lowercase font-serif pr-4">Exclusifs</span>
                    </h1>
                </div>
            </section>

            {/* --- SECTION 2 : RÉSIDENCES SECONDAIRES --- */}
            <section id="secondaire" className="snap-section min-h-screen w-full md:snap-center relative flex items-center justify-center py-12 md:py-20 px-4 md:px-6 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image src="/maison-stone.jpg" alt="Background" fill className="object-cover" priority />
                    <div className="absolute inset-0 bg-black/80"></div>
                </div>
                <div className="relative z-10 w-full">
                    <PricingSection
                        title="Résidences Secondaires"
                        subtitle="Surveillance & Intendance"
                        description="Une gestion complète de votre bien, de la simple vigilance à l'expérience hôtelière 7j/7."
                        lightText={true}
                        features={[
                            { title: "Vigilance", desc: "Visites de contrôle, aération, relevé courrier." },
                            { title: "Intendance", desc: "Préparation complète et fermeture." },
                            { title: "Maintenance", desc: "Suivi travaux et coordination artisans." },
                            { title: "Conciergerie", desc: "Courses et réservations." },
                        ]}
                        packs={[
                            { name: "Pack Surveillance", price: "Mensuel + Déplac.", list: ["Passages réguliers", "Sécurité", "Rapport"] },
                            { name: "Pack Entretien", price: "Mensuel", list: ["Pack Surveillance", "Jardin & Piscine", "Artisans"] },
                            { name: "Pack Sérénité", price: "Fixe + Variable", list: ["Pack Entretien", "Préparation Arrivée", "Ménage départ"] },
                            { name: "Pack Premium", price: "Sur Mesure", list: ["Tout inclus", "Service VIP", "7j/7"], highlight: true },
                        ]}
                    />
                </div>
            </section>

            {/* --- SECTION 3 : LOCATIONS SAISONNIÈRES --- */}
            <section id="saisonnier" className="snap-section min-h-screen w-full md:snap-center relative flex items-center justify-center py-12 md:py-20 px-4 md:px-6 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image src="/gite-stone.jpg" alt="Interieur Luxe" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/80"></div>
                </div>
                <div className="relative z-10 w-full">
                    <PricingSection
                        title="Locations Saisonnières"
                        subtitle="Gestion & Rentabilité"
                        description="Maximisez vos revenus locatifs sans les contraintes. De la mise en ligne à l'accueil VIP, nous gérons tout."
                        lightText={true}
                        reversed={true}
                        features={[
                            { title: "Commercialisation (PMS)", desc: "Création annonces, photos pro, sélection rigoureuse locataires." },
                            { title: "Logistique & Intendance", desc: "Ménage pro, blanchisserie hôtelière, réassort consommables." },
                            { title: "Expérience Voyageurs", desc: "Accueil personnalisé, check-out, guide d'accueil et assistance 7j/7." },
                            { title: "Suivi & Admin", desc: "Rapport mensuel d'occupation, gestion des avis clients." },
                        ]}
                        packs={[
                            { name: "Pack Clés en main", price: "Par déplacement", list: ["Remise des clés", "Récupération", "Présentation rapide"] },
                            { name: "Pack Essentiel", price: "Sur Devis", list: ["Remise des clés", "Réassort consommables", "Ménage de fin de séjour"] },
                            { name: "Pack Confort Client", price: "Journalier", list: ["Pack Essentiel inclus", "Accueil personnalisé", "Assistance 7j/7", "Services à la demande"] },
                            { name: "Pack Gestion", price: "20% Revenus", list: ["Pack Essentiel inclus", "Gestion complète (PMS)", "Coordination maintenance", "Gestion des avis"] },
                            { name: "Pack Premium", price: "25% Revenus", list: ["Gestion 100% Intégrale", "Pack Confort Client inclus", "Service VIP 7j/7", "Comptabilité avancée"], highlight: true },
                        ]}
                    />
                </div>
            </section>

            {/* --- SECTION 4 : GÎTES & MAISONS D'HÔTES --- */}
            <section id="gites" className="snap-section min-h-screen w-full md:snap-center relative flex items-center justify-center py-12 md:py-20 px-4 md:px-6 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image src="/hote-stone.jpg" alt="Ambiance Gîte" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/80"></div>
                </div>
                <div className="relative z-10 w-full">
                    <PricingSection
                        title="Gîtes & Maisons d'Hôtes"
                        subtitle="Support Opérationnel"
                        description="Allégez votre quotidien de propriétaire tout en offrant une expérience 5 étoiles à vos hôtes."
                        lightText={true}
                        reversed={false}
                        features={[
                            { title: "Accueil & Relation", desc: "Accueil physique, assistance séjour, gestion demandes, check-out." },
                            { title: "Intendance & Linge", desc: "Ménage quotidien et inter-séjour, gestion complète du linge." },
                            { title: "Gestion & Maintenance", desc: "Plannings (PMS), réassort, coordination artisans, piscine/jardin." },
                            { title: "Services & Marketing", desc: "Activités locales, transferts gare/aéroport, pack photos." },
                        ]}
                        packs={[
                            { name: "Pack Exploitation", price: "Taux Horaire", list: ["Accueil & Départ", "Ménage & Linge", "Assistance séjour", "Petit-déjeuner"] },
                            { name: "Pack Gestion", price: "Mensuel", list: ["Gestion prestataires", "Organisation calendrier", "Réassort consommables", "Suivi maintenance"] },
                            { name: "Pack Premium", price: "Sur Devis", list: ["Pack Exploitation inclus", "Interlocuteur Unique", "Assistance Personnalisée", "Services à la demande"], highlight: true },
                        ]}
                    />
                </div>
            </section>
        </div>
    );
}

// --- SOUS-COMPOSANT OPTIMISÉ MOBILE ---
function PricingSection({ title, subtitle, description, features, packs, reversed = false, lightText = false }: any) {
    const titleColor = lightText ? "text-white drop-shadow-md" : "text-[#1A1A1A]";
    const descColor = lightText ? "text-white/90 drop-shadow-sm font-light" : "text-[#1A1A1A]/70";
    const featureTitleColor = lightText ? "text-white drop-shadow-sm" : "text-[#1A1A1A]";
    const featureDescColor = lightText ? "text-white/70" : "text-[#1A1A1A]/50";
    const btnBorder = lightText ? "border-[#B88A44] text-white hover:bg-[#B88A44] hover:text-white" : "border-[#B88A44] text-[#1A1A1A] hover:bg-[#B88A44] hover:text-white";

    return (
        // MOBILE : gap-10 (plus serré) | DESKTOP : gap-16 (plus aéré)
        <div className={`max-w-7xl w-full mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-start ${reversed ? 'lg:grid-flow-dense' : ''}`}>

            {/* COLONNE TEXTE */}
            <div className={`space-y-8 md:space-y-10 ${reversed ? 'lg:col-start-2' : ''}`}>
                <div>
                    <span className="text-[#B88A44] text-[10px] uppercase tracking-[0.4em] mb-4 block font-bold">
                        {subtitle}
                    </span>
                    <h2 className={`${titleColor} text-3xl md:text-5xl font-serif uppercase tracking-[0.15em] mb-6`}>
                        {title}
                    </h2>
                    <div className="w-20 h-[1px] bg-[#B88A44] mb-8 shadow-[0_0_10px_#B88A44]"></div>
                    <p className={`${descColor} text-sm leading-relaxed tracking-wide mb-8`}>
                        {description}
                    </p>
                </div>

                <div className="space-y-6 md:space-y-8">
                    {features.map((feat: any, i: number) => (
                        <div key={i} className="flex gap-4 group">
                            <span className="text-[#B88A44] font-serif italic text-lg opacity-100 transition-opacity">
                                0{i + 1}.
                            </span>
                            <div>
                                <h4 className={`${featureTitleColor} text-[11px] uppercase tracking-[0.2em] font-bold mb-2`}>
                                    {feat.title}
                                </h4>
                                <p className={`${featureDescColor} text-[10px] uppercase tracking-wider leading-relaxed`}>
                                    {feat.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* COLONNE PACKS */}
            {/* MOBILE : Pas de margin-top | DESKTOP : lg:mt-24 pour le décalage esthétique */}
            <div className={`flex flex-col gap-6 md:gap-8 ${reversed ? 'lg:col-start-1' : ''} lg:mt-24`}>

                {/* Grille des Packs : 1 colonne mobile, 2 colonnes desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {packs.map((pack: any, i: number) => {
                        const isLastAndOdd = i === packs.length - 1 && packs.length % 2 !== 0;

                        return (
                            <div
                                key={i}
                                className={`
                                    p-6 transition-all duration-500 flex flex-col justify-between backdrop-blur-md
                                    ${isLastAndOdd ? 'sm:col-span-2 text-center items-center' : ''}
                                    ${pack.highlight
                                    ? 'bg-[#F7F5F0] border-2 border-[#B88A44] shadow-2xl z-10'
                                    : 'bg-[#F7F5F0]/95 border border-transparent hover:bg-white'
                                }
                                `}
                            >
                                <div className="mb-4 w-full">
                                    <h3 className="text-[#1A1A1A] text-[11px] font-bold uppercase tracking-widest mb-1">
                                        {pack.name}
                                    </h3>
                                    <span className="block text-[#B88A44] font-bold text-[9px] uppercase tracking-widest">
                                        {pack.price}
                                    </span>
                                </div>

                                <ul className={`space-y-2 ${isLastAndOdd ? 'grid sm:grid-cols-2 gap-x-8 gap-y-2 w-full text-left' : ''}`}>
                                    {pack.list.map((item: string, j: number) => (
                                        <li key={j} className="flex items-start gap-2 text-[9px] uppercase tracking-wider text-[#1A1A1A]/80 leading-tight font-medium">
                                            <Check className="w-3 h-3 text-[#B88A44] shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                <div className="text-center pt-4">
                    <Link
                        href="/contact"
                        className={`
                            inline-block px-10 py-4 border ${btnBorder} 
                            text-[10px] uppercase tracking-[0.3em] font-medium 
                            transition-all duration-500 hover:scale-105 hover:shadow-[0_0_20px_rgba(184,138,68,0.4)]
                        `}
                    >
                        Demander une étude
                    </Link>
                </div>

            </div>
        </div>
    );
}