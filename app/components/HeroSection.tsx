'use client';

import Image from 'next/image';

export default function HeroSection() {
    return (
        // CHANGEMENT 1 : 'h-[100dvh]' est la clé pour le mobile.
        // Cela évite que le contenu soit caché derrière la barre de navigation du téléphone.
        <section className="relative w-full h-[100dvh] flex items-center justify-center overflow-hidden">

            {/* 1. IMAGE DE FOND */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/photo-village.jpg"
                    alt="Panorama Provence"
                    fill
                    className="object-cover"
                    priority
                    quality={85}
                />
                {/* On garde le voile sombre */}
                <div className="absolute inset-0 bg-black/30"></div>
            </div>

            {/* 2. LE CONTENU TEXTE */}
            <div className="relative z-10 text-center px-4 md:px-6 max-w-4xl mx-auto mt-0 md:mt-10">

                {/* Sous-titre : Plus petit sur mobile (text-[10px]) */}
                <span className="text-[#F7F5F0] text-[10px] md:text-sm uppercase tracking-[0.3em] md:tracking-[0.4em] mb-4 md:mb-6 block animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    Conciergerie de Prestige
                </span>

                {/* Titre Principal : Adaptation drastique de la taille */}
                {/* Mobile : text-3xl | Ordi : text-7xl */}
                <h1 className="text-[#F7F5F0] text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif uppercase tracking-[0.1em] md:tracking-[0.15em] leading-tight mb-6 md:mb-8 drop-shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    L'Art de Vivre <br /> <span className="text-[#B88A44]">En Provence</span>
                </h1>

                {/* Séparateur */}
                <div className="w-16 md:w-24 h-[1px] bg-[#B88A44] mx-auto mb-6 md:mb-8 shadow-[0_0_10px_#B88A44]"></div>

                {/* Description */}
                <p className="text-[#F7F5F0]/90 text-[10px] md:text-base uppercase tracking-[0.15em] md:tracking-[0.2em] max-w-xs md:max-w-2xl mx-auto leading-relaxed drop-shadow-md animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                    Gestion de propriétés d'exception & Expériences sur-mesure
                </p>
            </div>
        </section>
    );
}