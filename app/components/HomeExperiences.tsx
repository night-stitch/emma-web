'use client';

import { useT, useLocalized } from '@/lib/i18n';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Loader2, MapPin } from 'lucide-react';
import { Experience, MAX_FEATURED, fetchExperiences, toRoman } from '@/lib/experiences';

/**
 * Bloc « L'Expérience » de la page d'accueil.
 * Affiche les maisons cochées d'une étoile dans l'admin (3 max).
 * S'il n'y en a aucune, on montre les 3 premières maisons publiées.
 */
export default function HomeExperiences() {
    const t = useT();
    const [items, setItems] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExperiences(true)
            .then((list) => {
                const featured = list.filter((e) => e.featured);
                setItems((featured.length ? featured : list).slice(0, MAX_FEATURED));
            })
            .catch((e) => console.error('Erreur chargement expériences :', e))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="relative w-full max-w-7xl mx-auto px-4 md:px-6 flex flex-col h-auto py-20 md:py-0 md:pb-10 justify-center">
            {/* Titre */}
            <div className="text-center mb-10 md:mb-8 shrink-0">
                <span className="text-[#B88A44] text-[10px] uppercase tracking-[0.4em] mb-2 block font-bold">
                    {t('Collection')}
                </span>
                <h2 className="text-[#1A1A1A] text-2xl md:text-4xl font-serif uppercase tracking-[0.2em] leading-tight">
                    {t('L’Expérience')}
                </h2>
                <div className="w-20 h-[1px] bg-[#B88A44]/30 mx-auto mt-6"></div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-[#B88A44]" size={28} />
                </div>
            ) : items.length === 0 ? (
                <p className="text-center text-[#1A1A1A]/40 text-[10px] uppercase tracking-[0.4em] py-16">
                    {t('Nouvelles maisons bientôt dévoilées')}
                </p>
            ) : (
                <div className={`grid grid-cols-1 gap-6 w-full ${items.length === 1 ? 'md:grid-cols-1 md:max-w-md md:mx-auto' : items.length === 2 ? 'md:grid-cols-2 md:max-w-4xl md:mx-auto' : 'md:grid-cols-3'}`}>
                    {items.map((exp, i) => (
                        <MaisonCard key={exp.id} exp={exp} index={i} />
                    ))}
                </div>
            )}

            <div className="mt-12 md:mt-8 text-center shrink-0">
                <Link
                    href="/experience"
                    className="inline-block px-8 py-3 border border-[#B88A44] text-[#1A1A1A] text-[10px] uppercase tracking-[0.3em] hover:bg-[#B88A44] hover:text-[#F7F5F0] transition-all duration-500"
                >
                    {t('Découvrir toutes les maisons')}
                </Link>
            </div>
        </div>
    );
}

const AUTOPLAY_MS = 8000; // temps passé sur chaque photo

function MaisonCard({ exp, index }: { exp: Experience; index: number }) {
    const t = useT();
    const loc = useLocalized();
    const images = exp.images;
    const count = images.length;
    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);

    // Défilement automatique (décalé d'une carte à l'autre pour ne pas tout changer en même temps)
    useEffect(() => {
        if (count < 2 || paused) return;
        let interval: ReturnType<typeof setInterval> | undefined;
        const start = setTimeout(() => {
            setCurrent((c) => (c + 1) % count);
            interval = setInterval(() => setCurrent((c) => (c + 1) % count), AUTOPLAY_MS);
        }, AUTOPLAY_MS + index * 2000);
        return () => { clearTimeout(start); if (interval) clearInterval(interval); };
    }, [count, paused, index]);

    const go = (e: React.MouseEvent, dir: -1 | 1) => {
        e.preventDefault();   // la carte est un lien : la flèche ne doit pas l'ouvrir
        e.stopPropagation();
        setCurrent((c) => (c + dir + count) % count);
    };

    return (
        <Link
            href={`/experience#exp-${exp.id}`}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className="group block w-full relative overflow-hidden rounded-sm min-h-[300px] md:min-h-[400px] h-full gpu-accelerated bg-[#E9E4D8]"
        >
            {/* Bande de photos qui glisse */}
            {count > 0 && (
                <div
                    className="absolute inset-0 flex transition-transform duration-[2200ms] ease-[cubic-bezier(0.65,0,0.35,1)] will-change-transform"
                    style={{ transform: `translateX(-${current * 100}%)` }}
                >
                    {images.map((img, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            key={`${i}-${img.path || img.url}`}
                            src={img.url}
                            alt={`${exp.title} — photo ${i + 1}`}
                            loading={i === 0 ? 'eager' : 'lazy'}
                            draggable={false}
                            className="w-full h-full object-cover shrink-0 opacity-90"
                        />
                    ))}
                </div>
            )}

            {/* Voile + cadre intérieur, comme les cartes Expertises */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10 group-hover:from-black/80 transition-colors duration-300 pointer-events-none"></div>
            <div className="absolute inset-0 border border-[#F7F5F0]/10 m-3 z-20 pointer-events-none"></div>

            {/* Numéro */}
            <span className="absolute top-6 left-7 z-10 font-serif text-[#F7F5F0]/60 text-5xl leading-none select-none pointer-events-none">
                {toRoman(index + 1)}
            </span>

            {/* Flèches */}
            {count > 1 && (
                <>
                    <button
                        type="button"
                        onClick={(e) => go(e, -1)}
                        aria-label={t('Photo précédente')}
                        className="absolute left-4 top-[38%] -translate-y-1/2 z-30 w-9 h-9 flex items-center justify-center border border-[#F7F5F0]/40 bg-black/20 backdrop-blur-sm text-[#F7F5F0] hover:bg-[#B88A44] hover:border-[#B88A44] transition-all duration-300"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => go(e, 1)}
                        aria-label={t('Photo suivante')}
                        className="absolute right-4 top-[38%] -translate-y-1/2 z-30 w-9 h-9 flex items-center justify-center border border-[#F7F5F0]/40 bg-black/20 backdrop-blur-sm text-[#F7F5F0] hover:bg-[#B88A44] hover:border-[#B88A44] transition-all duration-300"
                    >
                        <ChevronRight size={16} />
                    </button>
                </>
            )}

            <div className="relative z-10 h-full min-h-[300px] md:min-h-[400px] p-6 md:p-8 flex flex-col items-center justify-end text-center pointer-events-none text-on-photo">
                <h3 className="text-[#F7F5F0] text-lg font-serif uppercase tracking-[0.2em] mb-2">
                    {loc(exp.title, exp.titleEn)}
                </h3>
                {exp.location && (
                    <span className="text-[#B88A44] text-[10px] uppercase tracking-[0.25em] mb-3 font-bold flex items-center gap-1.5">
                        <MapPin size={10} /> {loc(exp.location, exp.locationEn)}
                    </span>
                )}
                <p className="text-[#F7F5F0]/80 text-[11px] leading-relaxed uppercase tracking-wider line-clamp-2">
                    {loc(exp.description, exp.descriptionEn)}
                </p>

                {/* Indicateur : petits traits, le trait actif s'allonge en doré */}
                {count > 1 && (
                    <div className="flex items-center gap-1.5 mt-5">
                        {images.slice(0, 10).map((img, i) => (
                            <span
                                key={`${i}-${img.path || img.url}`}
                                className={`h-[2px] transition-all duration-[1200ms] ${i === current % 10 ? 'w-6 bg-[#B88A44]' : 'w-2.5 bg-[#F7F5F0]/40'}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
}
