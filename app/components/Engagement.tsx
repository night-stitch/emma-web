'use client';

import Image from 'next/image';
import { Clock, Heart, Lock } from 'lucide-react';

export default function Engagement() {
    return (
        <section className="relative w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-12 px-6
            h-auto py-20
            md:h-full md:py-24"
        >

            {/* 1. COLONNE GAUCHE : TEXTE & VALEURS */}
            <div className="flex-1 space-y-10 md:space-y-14 w-full">

                {/* En-tête de la section */}
                <div className="text-center md:text-left space-y-4">
                    <span className="text-[#B88A44] text-xs uppercase tracking-[0.4em] block font-bold">
                        Nos Valeurs
                    </span>
                    <h2 className="text-[#1A1A1A] text-4xl md:text-6xl font-serif uppercase tracking-[0.1em] leading-tight">
                        L'Esprit <br /> <span className="text-[#B88A44]">Conciergerie</span>
                    </h2>
                </div>

                {/* Liste des Engagements */}
                <div className="space-y-10 md:space-y-12">

                    <EngagementItem
                        icon={<Clock className="w-6 h-6" />}
                        title="Proximité & Disponibilité"
                        text="Toujours à vos côtés. Une assistance locale, réactive et disponible 24h/24 pour répondre à vos moindres désirs."
                    />

                    <EngagementItem
                        icon={<Heart className="w-6 h-6" />}
                        title="Éthique Locale"
                        text="Nous privilégions les artisans d'art et les producteurs de notre région pour vous offrir l'authenticité de la Provence."
                    />

                    <EngagementItem
                        icon={<Lock className="w-6 h-6" />}
                        title="Confiance & Discrétion"
                        text="Une relation fondée sur la transparence. Votre vie privée est notre priorité absolue, en toute circonstance."
                    />

                </div>
            </div>

            {/* 2. COLONNE DROITE : IMAGE */}
            <div className="flex-1 w-full h-[350px] md:h-[700px] relative mt-8 md:mt-0">
                {/* Cadre décoratif */}
                <div className="absolute top-5 -right-5 w-full h-full border border-[#B88A44]/30 z-0 hidden md:block"></div>

                {/* Image principale */}
                <div className="relative w-full h-full overflow-hidden rounded-sm shadow-2xl z-10">
                    <Image
                        src="/engagement.jpg"
                        alt="Paysage Provence"
                        fill
                        priority
                        quality={85}
                        className="object-cover hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-[#B88A44]/10 mix-blend-overlay"></div>
                </div>
            </div>

        </section>
    );
}

// --- SOUS-COMPOSANT ITEM AVEC TEXTE AGRANDI ---
function EngagementItem({ icon, title, text }: any) {
    return (
        <div className="flex flex-col sm:flex-row gap-6 group items-center sm:items-start text-center sm:text-left">
            {/* Icône encerclée (Agrandie) */}
            <div className="shrink-0">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border border-[#B88A44]/20 flex items-center justify-center text-[#B88A44] group-hover:bg-[#B88A44] group-hover:text-white transition-all duration-500 shadow-sm">
                    {icon}
                </div>
            </div>

            {/* Texte (Agrandi) */}
            <div className="space-y-2">
                <h3 className="text-[#1A1A1A] text-lg md:text-xl font-serif uppercase tracking-[0.15em] group-hover:text-[#B88A44] transition-colors font-bold">
                    {title}
                </h3>
                <p className="text-[#1A1A1A]/70 text-sm md:text-base leading-relaxed tracking-wide max-w-lg">
                    {text}
                </p>
            </div>
        </div>
    );
}