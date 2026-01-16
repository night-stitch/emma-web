'use client';

import Image from 'next/image';

export default function AboutMe() {
    return (
        <section className="relative w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20 px-6
            h-auto py-20
            md:h-full md:py-24"
        >

            {/* 1. COLONNE GAUCHE : PORTRAIT */}
            <div className="flex-1 w-full max-w-sm md:max-w-md relative aspect-[3/4] shrink-0">
                {/* Cadre décoratif doré */}
                <div className="absolute top-4 -left-4 w-full h-full border border-[#B88A44]/30 z-0 hidden md:block"></div>

                <div className="relative w-full h-full overflow-hidden rounded-sm shadow-2xl z-10 bg-[#F7F5F0]">
                    <Image
                        src="/emma-portrait.jpg"
                        alt="Emma Nadal - Fondatrice"
                        fill
                        className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                    />
                </div>
            </div>

            {/* 2. COLONNE DROITE : LE CONTENU */}
            <div className="flex-1 space-y-8 text-center md:text-left w-full">

                {/* En-tête typographique */}
                <div className="space-y-4">
                    <span className="text-[#B88A44] text-[10px] uppercase tracking-[0.4em] font-bold block">
                        La Fondatrice
                    </span>
                    <h2 className="text-[#1A1A1A] text-3xl md:text-5xl font-serif uppercase tracking-widest leading-tight">
                        Découvrez <br />
                        <span className="italic text-[#B88A44] lowercase pr-2">qui je suis.</span>
                    </h2>
                </div>

                {/* Corps de texte : Serif & Interlignage large */}
                <div className="space-y-6 text-[#1A1A1A]/70 text-sm md:text-base leading-relaxed tracking-wide font-serif italic text-justify md:text-left border-l-2 border-[#B88A44]/10 md:pl-8">
                    <p>
                        Originaire de Gordes, au cœur de la Provence, amoureuse de ma région et de son art de vivre,
                        j'ai fondé <strong className="font-bold text-[#1A1A1A] not-italic">La Clé Provençale</strong>,
                        une conciergerie locale dédiée à la gestion et à l'entretien des résidences dans le Luberon.
                    </p>
                    <p>
                        Mon ambition est simple : offrir à chaque propriétaire une tranquillité d'esprit totale,
                        en prenant soin de leur bien avec la même attention que s'il s'agissait du mien.
                    </p>
                    <p>
                        Discrétion, confiance et exigence sont au cœur de chacun de mes services, afin que vous puissiez
                        profiter pleinement de votre propriété, en toute sérénité.
                    </p>
                </div>

                {/* Signature Épurée */}
                <div className="pt-8 flex flex-col md:items-end items-center gap-2">
                    <span className="font-serif italic text-4xl text-[#1A1A1A] transform -rotate-3">
                        Emma Nadal
                    </span>
                    <div className="h-px w-20 bg-[#B88A44]/40 mb-1"></div>
                    <span className="text-[#B88A44] text-[9px] uppercase tracking-[0.3em] font-bold">
                        Fondatrice & Gérante
                    </span>
                </div>

            </div>

        </section>
    );
}