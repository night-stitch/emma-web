'use client';

import { useT, useLocalized } from '@/lib/i18n';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import { Experience, fetchExperiences } from '@/lib/experiences';
import MaisonSection from '@/components/MaisonSection';

export default function ExperiencePage() {
    const t = useT();
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);
    const [lightbox, setLightbox] = useState<{ exp: Experience; index: number } | null>(null);

    // Photos principales des maisons, pour le fond de l'ouverture (5 max)
    const covers = experiences.map((e) => e.images[0]?.url).filter((u): u is string => !!u).slice(0, 5);

    useEffect(() => {
        fetchExperiences(true)
            .then(setExperiences)
            .catch((e) => console.error('Erreur chargement expériences :', e))
            .finally(() => setLoading(false));
    }, []);

    // Prévient la barre latérale que les sections sont dans le DOM,
    // puis va directement à la maison demandée (lien depuis l'accueil : /experience#exp-xxx)
    useEffect(() => {
        if (loading) return;
        window.dispatchEvent(new Event('sections-updated'));
        const hash = window.location.hash.slice(1);
        if (hash) {
            requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }));
        }
    }, [loading, experiences]);

    return (
        <div className="text-[#1A1A1A]">
            {/* Bouton retour */}
            <Link
                href="/"
                className="fixed top-24 left-4 z-50 flex min-[1101px]:hidden items-center gap-2 bg-[#F7F5F0]/95 backdrop-blur-sm text-[#1A1A1A] px-4 py-2 border border-[#B88A44]/30 hover:bg-[#B88A44] hover:text-white hover:border-[#B88A44] transition-colors text-[10px] uppercase tracking-widest font-bold"
            >
                <ArrowLeft size={14} /> {t('Retour')}
            </Link>

            {/* ── OUVERTURE (même disposition que Forfaits) ── */}
            <section id="intro" data-sidebar-section className="snap-start snap-always h-[100dvh] w-full flex items-center justify-center px-4 md:px-6 pt-20 relative overflow-hidden">
                {/* Fond : mosaïque des photos principales de toutes les maisons */}
                <div className="absolute inset-0 z-0 bg-[#1A1A1A]">
                    {covers.length === 0 ? (
                        <Image src="/chant-de-lavande.jpg" alt="Provence" fill sizes="100vw" className="object-cover" priority />
                    ) : (
                        <div className="absolute inset-0 flex">
                            {covers.map((url, i) => (
                                <div
                                    key={`${i}-${url}`}
                                    className={`relative flex-1 h-full overflow-hidden ${i >= 3 ? 'hidden md:block' : ''} ${i > 0 ? 'border-l border-[#B88A44]/40' : ''}`}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={url}
                                        alt=""
                                        className="absolute inset-0 w-full h-full object-cover animate-[mosaic-zoom_20s_ease-in-out_infinite_alternate]"
                                        style={{ animationDelay: `${i * -4}s` }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/50"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0.15)_55%,transparent_80%)]"></div>
                </div>

                {/* Cadre intérieur, comme les cartes de l'accueil */}
                <div className="absolute inset-0 border border-[#F7F5F0]/15 m-4 md:m-10 mt-24 md:mt-28 z-10 pointer-events-none"></div>

                <div className="text-center max-w-4xl mx-auto relative z-10 px-2 text-on-photo">
                    <span className="text-[#F7F5F0] text-[10px] md:text-sm uppercase tracking-[0.3em] md:tracking-[0.4em] mb-4 md:mb-6 block animate-fade-up-delay-1">
                        {t('Collection — La Clé Provençale')}
                    </span>

                    <h1 className="text-[#F7F5F0] text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif uppercase tracking-[0.1em] md:tracking-[0.15em] leading-tight mb-6 md:mb-8 drop-shadow-lg animate-fade-up-delay-2">
                        {t('L’Expérience')} <br /> <span className="text-[#B88A44]">{t('Provençale')}</span>
                    </h1>

                    <div className="w-16 md:w-24 h-[1px] bg-[#B88A44] mx-auto mb-6 md:mb-8 animate-fade-up-delay-2"></div>

                    <p className="text-[#F7F5F0]/90 text-[10px] md:text-base uppercase tracking-[0.15em] md:tracking-[0.2em] max-w-xs md:max-w-2xl mx-auto leading-relaxed animate-fade-up-delay-3">
                        {t('Des maisons choisies avec soin, une Provence à vivre')}
                    </p>
                    <p className="text-[#B88A44] text-[10px] md:text-[11px] uppercase tracking-[0.35em] mt-4 font-bold animate-fade-up-delay-3">
                        {t('Authenticité · Caractère · Art de vivre')}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mt-10 md:mt-12 animate-fade-up-delay-3">
                        <button
                            type="button"
                            onClick={() => {
                                const first = experiences[0];
                                if (first) document.getElementById(`exp-${first.id}`)?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="inline-flex items-center gap-2 bg-[#B88A44] text-white px-8 md:px-10 py-3.5 md:py-4 text-[10px] uppercase tracking-[0.3em] font-bold border border-[#B88A44] hover:bg-transparent transition-colors duration-500"
                        >
                            {t('Découvrir les maisons')} <ChevronRight size={14} />
                        </button>
                        <Link href="/contact" className="inline-flex items-center gap-2 px-8 md:px-10 py-3.5 md:py-4 border border-[#F7F5F0]/40 text-[#F7F5F0] text-[10px] uppercase tracking-[0.3em] hover:bg-[#F7F5F0] hover:text-[#1A1A1A] transition-colors duration-500">
                            {t('Nous contacter')}
                        </Link>
                    </div>
                </div>

                <div className="hidden min-[1101px]:flex [@media(max-height:820px)]:!hidden absolute bottom-14 left-1/2 -translate-x-1/2 flex-col items-center gap-3 z-10">
                    <span className="text-[9px] uppercase tracking-[0.4em] text-white/40">{t('Découvrir')}</span>
                    <div className="w-[1px] h-10 bg-gradient-to-b from-[#B88A44]/60 to-transparent"></div>
                </div>
            </section>

            {/* ── MAISONS ── */}
            {loading ? (
                <section className="min-h-[50vh] flex items-center justify-center">
                    <Loader2 className="animate-spin text-[#B88A44]" size={32} />
                </section>
            ) : experiences.length === 0 ? (
                <section className="min-h-[50vh] flex flex-col items-center justify-center px-6 text-center">
                    <p className="text-[#1A1A1A]/40 text-[10px] uppercase tracking-[0.4em]">
                        {t('Nouvelles maisons bientôt dévoilées')}
                    </p>
                </section>
            ) : (
                experiences.map((exp, i) => (
                    <MaisonSection
                        key={exp.id}
                        exp={exp}
                        index={i}
                        total={experiences.length}
                        onOpen={(index) => setLightbox({ exp, index })}
                    />
                ))
            )}

            {/* ── ÉPILOGUE ── */}
            <section className="snap-start min-h-[70vh] flex flex-col items-center justify-center px-6 relative overflow-hidden">
                <div className="relative z-10 text-center max-w-xl mx-auto">
                    <div className="w-[1px] h-16 bg-gradient-to-b from-transparent to-[#B88A44]/40 mx-auto mb-12"></div>
                    <p className="text-[#B88A44] text-[10px] uppercase tracking-[0.4em] mb-6 font-bold">{t('Votre séjour')}</p>
                    <h2 className="font-serif text-3xl md:text-5xl uppercase tracking-[0.12em] text-[#1A1A1A] mb-6">
                        {t('Envie de')}<br />
                        <span className="italic text-[#B88A44]">{t('vivre l’expérience ?')}</span>
                    </h2>
                    <p className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-[0.3em] leading-loose mb-12">
                        {t('Écrivez-nous.')}<br />{t('Nous préparons tout pour vous.')}
                    </p>
                    <Link
                        href="/contact"
                        className="inline-block border border-[#B88A44] text-[#1A1A1A] px-10 py-4 text-[10px] uppercase tracking-[0.35em] font-medium hover:bg-[#B88A44] hover:text-white hover:border-[#B88A44] transition-all duration-500"
                    >
                        {t('Nous écrire')}
                    </Link>
                    <div className="w-[1px] h-16 bg-gradient-to-t from-transparent to-[#B88A44]/20 mx-auto mt-12"></div>
                </div>
            </section>

            {lightbox && (
                <Lightbox
                    exp={lightbox.exp}
                    index={lightbox.index}
                    onChange={(index) => setLightbox({ ...lightbox, index })}
                    onClose={() => setLightbox(null)}
                />
            )}
        </div>
    );
}

// ── VISIONNEUSE PLEIN ÉCRAN ──
function Lightbox({
    exp, index, onChange, onClose,
}: {
    exp: Experience;
    index: number;
    onChange: (i: number) => void;
    onClose: () => void;
}) {
    const t = useT();
    const loc = useLocalized();
    const count = exp.images.length;
    const prev = useCallback(() => onChange((index - 1 + count) % count), [index, count, onChange]);
    const next = useCallback(() => onChange((index + 1) % count), [index, count, onChange]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        };
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose, prev, next]);

    const img = exp.images[index];
    if (!img) return null;

    return (
        <div className="fixed inset-0 z-[100000] bg-[#0D0D0B]/95 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
            <button onClick={onClose} className="absolute top-6 right-6 text-white/60 hover:text-[#B88A44] transition-colors z-10" aria-label={t('Fermer')}>
                <X size={28} />
            </button>

            {count > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); prev(); }}
                        className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-[#B88A44] transition-colors z-10"
                        aria-label={t('Photo précédente')}
                    >
                        <ChevronLeft size={36} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); next(); }}
                        className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-[#B88A44] transition-colors z-10"
                        aria-label={t('Photo suivante')}
                    >
                        <ChevronRight size={36} />
                    </button>
                </>
            )}

            {/* Seule la photo bloque le clic : tout le reste (le noir) ferme la visionneuse */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                key={img.url}
                src={img.url}
                alt={`${exp.title} — photo ${index + 1}`}
                onClick={(e) => e.stopPropagation()}
                className="max-w-[88vw] max-h-[75vh] object-contain shadow-2xl animate-fade-up"
            />

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none">
                <p className="font-serif text-white/80 text-sm uppercase tracking-[0.3em]">{loc(exp.title, exp.titleEn)}</p>
                <p className="text-[#B88A44]/70 text-[10px] uppercase tracking-[0.4em] mt-2">
                    {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
                </p>
            </div>
        </div>
    );
}
