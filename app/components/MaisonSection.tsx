'use client';

// Section d'une maison (page Expérience + aperçu dans l'admin)
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useT, useLocalized } from '@/lib/i18n';
import { Experience, thumbOf, toRoman } from '@/lib/experiences';

// ── SECTION MAISON ──
// Une maison = un écran (h-[100dvh]), avec arrêt du scroll sur chaque maison.
const MAX_THUMBS = 6;

export default function MaisonSection({
    exp, index, total, onOpen, previewMode = false,
}: {
    exp: Experience;
    index: number;
    total: number;
    onOpen: (imageIndex: number) => void;
    /** Aperçu admin : le bouton « Je suis intéressé·e » est affiché mais non cliquable. */
    previewMode?: boolean;
}) {
    const t = useT();
    const loc = useLocalized();
    const ref = useRef<HTMLElement>(null);
    const [visible, setVisible] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold: 0.15 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    const isGauche = index % 2 === 1; // alterne texte à droite / à gauche
    const cover = exp.images[0];
    const galerie = exp.images.slice(1);
    const thumbs = galerie.slice(0, MAX_THUMBS);
    const hidden = galerie.length - MAX_THUMBS; // photos cachées au-delà de 6
    const title = loc(exp.title, exp.titleEn);
    const location = loc(exp.location, exp.locationEn);
    const description = loc(exp.description, exp.descriptionEn);
    const longText = description.length > 280;

    return (
        <section
            ref={ref}
            id={`exp-${exp.id}`}
            data-sidebar-section
            className="snap-start snap-always min-h-[100dvh] min-[1101px]:h-[100dvh] w-full flex flex-col md:flex-row relative overflow-hidden pt-20"
        >
            {/* ── IMAGE PRINCIPALE ── */}
            <button
                type="button"
                onClick={() => cover && onOpen(0)}
                className={`relative w-full md:w-3/5 h-[38dvh] md:h-auto md:self-stretch shrink-0 cursor-zoom-in overflow-hidden ${isGauche ? 'md:order-2' : 'md:order-1'}`}
                aria-label={`${t('Agrandir la photo de')} ${title}`}
            >
                {cover ? (
                    <Image
                        src={cover.url}
                        alt={exp.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 60vw"
                        className={`object-cover transition-all duration-[2000ms] ${visible ? 'scale-100 opacity-100' : 'scale-105 opacity-0'}`}
                    />
                ) : (
                    <div className="absolute inset-0 bg-[#E9E4D8]" />
                )}
                <div className="absolute inset-0 border border-[#F7F5F0]/40 m-3 md:m-5 pointer-events-none"></div>
                <div className={`absolute top-6 md:top-8 ${isGauche ? 'right-6 md:right-8' : 'left-6 md:left-8'} z-10`}>
                    <span className="font-serif text-[#F7F5F0]/70 text-6xl md:text-9xl leading-none select-none drop-shadow-lg">
                        {toRoman(index + 1)}
                    </span>
                </div>
            </button>

            {/* ── TEXTE ── */}
            <div className={`
                relative z-10 flex flex-col justify-center min-h-0 flex-1
                w-full md:w-2/5 px-6 md:px-12 lg:px-16
                py-5 md:py-8
                ${isGauche ? 'md:order-1' : 'md:order-2'}
            `}>
                <div className={`min-h-0 flex flex-col transition-all duration-1000 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="flex items-center gap-4 mb-3 md:mb-8">
                        <div className="w-8 h-[1px] bg-[#B88A44]/50"></div>
                        <span className="text-[#B88A44]/70 text-[9px] uppercase tracking-[0.4em] font-medium">
                            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                        </span>
                    </div>

                    <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl uppercase tracking-[0.1em] leading-tight text-[#1A1A1A] mb-2 md:mb-3">
                        {title}
                    </h2>

                    {location && (
                        <p className="text-[#B88A44] text-[10px] md:text-[10px] uppercase tracking-[0.35em] font-bold mb-3 md:mb-6">
                            {location}
                        </p>
                    )}

                    <div className="w-10 h-[1px] bg-[#B88A44]/40 mb-3 md:mb-6"></div>

                    {/* Description : coupée pour tenir sur l'écran, dépliable dans son cadre */}
                    <div className={`max-w-md ${expanded ? 'max-h-[30dvh] md:max-h-[34dvh] overflow-y-auto scrollbar-hide pr-1' : ''}`}>
                        <p className={`text-[#1A1A1A]/65 text-[13px] md:text-[15px] leading-[1.8] tracking-wide whitespace-pre-line ${expanded ? '' : 'line-clamp-3 md:line-clamp-6 md:[@media(max-height:900px)]:line-clamp-5'}`}>
                            {description}
                        </p>
                    </div>
                    {longText && (
                        <button
                            type="button"
                            onClick={() => setExpanded((e) => !e)}
                            className="self-start mt-2 text-[#B88A44] text-[10px] uppercase tracking-[0.3em] font-bold hover:text-[#1A1A1A] transition-colors"
                        >
                            {expanded ? t('— Réduire') : t('+ Lire la suite')}
                        </button>
                    )}

                    {/* Galerie : 6 vignettes max, puis bouton « + » */}
                    {thumbs.length > 0 && (
                        <div className="mt-4 md:mt-8 max-w-md">
                            <div className="flex items-center justify-between mb-2 md:mb-3">
                                <p className="text-[#B88A44] text-[9px] uppercase tracking-[0.4em] font-bold">{t('Galerie')}</p>
                                <span className="text-[#1A1A1A]/35 text-[9px] uppercase tracking-[0.3em]">
                                    {exp.images.length} {t('photos')}
                                </span>
                            </div>
                            <div className="grid grid-cols-6 md:grid-cols-3 md:[@media(max-height:900px)]:grid-cols-6 gap-1.5 md:gap-2">
                                {thumbs.map((img, j) => {
                                    const isMoreTile = j === MAX_THUMBS - 1 && hidden > 0;
                                    return (
                                        <button
                                            type="button"
                                            key={`${j}-${img.path || img.url}`}
                                            onClick={() => onOpen(j + 1)}
                                            className="relative aspect-square overflow-hidden group cursor-zoom-in"
                                            aria-label={isMoreTile ? `${t('Voir les')} ${hidden} ${t('autres photos')}` : `${t('Agrandir la photo')} ${j + 2}`}
                                        >
                                            <Image
                                                src={thumbOf(img)}
                                                alt={`${exp.title} — photo ${j + 2}`}
                                                fill
                                                sizes="(max-width: 768px) 16vw, 130px"
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            {isMoreTile && (
                                                <span className="absolute inset-0 bg-[#1A1A1A]/60 group-hover:bg-[#B88A44]/85 transition-colors duration-500 flex items-center justify-center">
                                                    <span className="absolute inset-0 border border-[#F7F5F0]/40 m-1 md:m-1.5"></span>
                                                    <span className="font-serif text-[#F7F5F0] text-sm md:text-2xl tracking-[0.1em]">
                                                        +{hidden}
                                                    </span>
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Contact pré-rempli avec le nom de la maison */}
                    {(
                        <Link
                            href={`/contact?sujet=maison&maison=${encodeURIComponent(exp.title)}`}
                            onClick={(e) => { if (previewMode) e.preventDefault(); }}
                            aria-disabled={previewMode}
                            className="self-start inline-flex items-center gap-2 mt-5 md:mt-8 bg-[#B88A44] text-white px-6 md:px-8 py-3 md:py-3.5 text-[10px] uppercase tracking-[0.3em] font-bold border border-[#B88A44] hover:bg-transparent hover:text-[#B88A44] transition-colors duration-500"
                        >
                            {t('Je suis intéressé·e')} <ChevronRight size={14} />
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}

