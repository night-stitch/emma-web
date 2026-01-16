'use client';

import React from 'react';

const categories = [
    { id: 'secondaire', name: 'Résidences Secondaires' },
    { id: 'saisonnier', name: 'Locations Saisonnières' },
    { id: 'gites', name: 'Gîtes & Maisons d’Hôtes' },
];

export default function CategoryFilter({ activeCategory, setActiveCategory }: any) {
    const scrollToSection = (id: string) => {
        setActiveCategory(id);
        const element = document.getElementById(id);
        if (element) {
            // On calcule le décalage pour ne pas que la navbar cache le titre
            const offset = 180;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="sticky top-20 z-40 w-full bg-[#F7F5F0]/80 backdrop-blur-md border-b border-[#B88A44]/10">
            <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-center gap-4 md:gap-12">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => scrollToSection(cat.id)}
                        className={`text-[10px] md:text-[11px] uppercase tracking-[0.2em] transition-all duration-500 relative group ${
                            activeCategory === cat.id ? 'text-[#B88A44] font-bold' : 'text-[#1A1A1A]/50'
                        }`}
                    >
                        {cat.name}
                        {/* Ligne d'accentuation pour la catégorie active */}
                        <span className={`absolute -bottom-1 left-0 h-[1px] bg-[#B88A44] transition-all duration-500 ${
                            activeCategory === cat.id ? 'w-full' : 'w-0 group-hover:w-full'
                        }`}></span>
                    </button>
                ))}
            </div>
        </div>
    );
}