'use client';

import Link from 'next/link';
import Image from 'next/image'; // On réintègre le composant Next.js
import { Shield, Key, Users } from 'lucide-react';

export default function HomeServices() {
    return (
        <section className="relative w-full max-w-7xl mx-auto px-4 md:px-6 flex flex-col
            h-auto py-20 justify-start
            md:h-full md:max-h-[85vh] md:justify-center md:py-0 md:pb-20"
        >
            {/* Titre */}
            <div className="text-center mb-10 md:mb-8 shrink-0">
                <span className="text-[#B88A44] text-[10px] uppercase tracking-[0.4em] mb-2 block font-bold">
                    Nos Domaines d'Excellence
                </span>
                <h2 className="text-[#1A1A1A] text-2xl md:text-4xl font-serif uppercase tracking-[0.2em] leading-tight">
                    Trois Expertises
                </h2>
                <div className="w-20 h-[1px] bg-[#B88A44]/30 mx-auto mt-6"></div>
            </div>

            {/* Grille des 3 Cartes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full md:grow-0">
                <ServiceCard
                    imageSrc="/chant-de-lavande.jpg"
                    icon={<Shield className="w-5 h-5 text-[#F7F5F0]" />}
                    title="Résidences Secondaires"
                    subtitle="Sérénité & Vigilance"
                    description="Une surveillance régulière pour une maison toujours prête à vous accueillir."
                    link="/forfaits/#secondaire"
                />

                <ServiceCard
                    imageSrc="/maison.jpg"
                    icon={<Key className="w-5 h-5 text-[#F7F5F0]" />}
                    title="Gestion Locative"
                    subtitle="Rendement & Accueil"
                    description="Optimisation des revenus et accueil 5 étoiles pour vos voyageurs."
                    link="/forfaits/#saisonnier"
                />

                <ServiceCard
                    imageSrc="/gite-hote.jpg"
                    icon={<Users className="w-5 h-5 text-[#F7F5F0]" />}
                    title="Gîtes & Hôtes"
                    subtitle="Soutien aux Propriétaires"
                    description="Ménage, linge et assistance pour sublimer l'expérience de vos hôtes."
                    link="/forfaits/#gites"
                />
            </div>

            {/* Bouton global */}
            <div className="mt-12 md:mt-8 text-center shrink-0">
                <Link
                    href="/forfaits"
                    className="inline-block px-8 py-3 border border-[#B88A44] text-[#1A1A1A] text-[10px] uppercase tracking-[0.3em] hover:bg-[#B88A44] hover:text-[#F7F5F0] transition-all duration-500"
                >
                    Voir les détails
                </Link>
            </div>
        </section>
    );
}

function ServiceCard({ imageSrc, icon, title, subtitle, description, link }: any) {
    return (
        <Link href={link} className="group block w-full relative overflow-hidden rounded-sm
            min-h-[300px] md:min-h-[400px] h-full gpu-accelerated"
        >
            {/* Image optimisée avec transitions GPU */}
            <div className="absolute inset-0 w-full h-full">
                <Image
                    src={imageSrc}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover opacity-90 optimized-image-hover group-hover:scale-105"
                    quality={75}
                    loading="lazy"
                />
            </div>

            {/* Overlay avec transition optimisée */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300"></div>
            <div className="absolute inset-0 border border-[#F7F5F0]/10 m-3 z-20 pointer-events-none"></div>

            <div className="relative z-10 h-full p-6 md:p-8 flex flex-col items-center justify-center text-center">
                {/* Icône avec transitions spécifiques (pas transition-all) */}
                <div className="mb-4 p-3 rounded-full border border-[#F7F5F0]/30 text-[#F7F5F0] group-hover:bg-[#B88A44] group-hover:border-[#B88A44] transition-colors duration-300">
                    {icon}
                </div>
                <h3 className="text-[#F7F5F0] text-lg font-serif uppercase tracking-[0.2em] mb-2">
                    {title}
                </h3>
                <span className="text-[#B88A44] text-[9px] uppercase tracking-[0.25em] mb-4 font-bold">
                    {subtitle}
                </span>
                <p className="text-[#F7F5F0]/80 text-[11px] leading-relaxed uppercase tracking-wider line-clamp-3">
                    {description}
                </p>
                {/* Ligne avec transition de largeur optimisée */}
                <div className="w-0 group-hover:w-12 h-[1px] bg-[#B88A44] mt-6 transition-[width] duration-300"></div>
            </div>
        </Link>
    );
}