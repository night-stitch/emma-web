'use client';

import { useT, useLang } from '@/lib/i18n';
import { DEFAULT_FORFAITS, Forfait, fetchForfaits } from '@/lib/forfaits';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '../components/Footer';
import FaqSection from '../components/FaqSection';

// Sujet pré-sélectionné dans le formulaire de contact pour chaque section
const CONTACT_SUJET: Record<string, string> = { secondaire: 'residence', saisonnier: 'location', gites: 'gite' };

interface Feature { title: string; desc: string }
interface Pack { name: string; price: string; list: string[]; highlight?: boolean }

export default function ForfaitsPage() {
    const t = useT();
    const { lang } = useLang();
    const [forfaits, setForfaits] = useState<Forfait[]>(DEFAULT_FORFAITS);

    // Contenu enregistré dans l'admin (sinon : contenu par défaut)
    useEffect(() => {
        fetchForfaits().then(setForfaits).catch((e) => console.warn('Forfaits : contenu par défaut utilisé', e));
    }, []);

    // Texte dans la langue choisie : version anglaise saisie dans l'admin, sinon traduction automatique
    const L = (fr: string, en?: string, ctx?: string) => (lang === 'en' ? (en && en.trim()) || t(fr, ctx) : fr);

    return (
        <div className="relative">
            {/* Bouton Retour */}
            <Link
                href="/"
                className="fixed top-24 left-4 z-50 flex min-[1101px]:hidden items-center gap-2 bg-[#F7F5F0]/95 backdrop-blur-sm text-[#1A1A1A] px-4 py-2 border border-[#B88A44]/30 hover:bg-[#B88A44] hover:text-white hover:border-[#B88A44] transition-colors text-[10px] uppercase tracking-widest font-bold"
            >
                <ArrowLeft size={14} /> {t('Retour')}
            </Link>

            {/* ── SECTION 1 : INTRO ── */}
            <section id="intro" className="snap-start snap-always h-[100dvh] w-full flex items-center justify-center px-4 md:px-6 pt-20 relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image src="/chant-de-lavande.jpg" alt="Provence" fill sizes="100vw" className="object-cover" priority />
                    <div className="absolute inset-0 bg-black/50"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0.15)_55%,transparent_80%)]"></div>
                </div>

                {/* Cadre intérieur, comme les cartes de l'accueil */}
                <div className="absolute inset-0 border border-[#F7F5F0]/15 m-4 md:m-10 mt-24 md:mt-28 z-10 pointer-events-none"></div>

                <div className="text-center max-w-4xl mx-auto relative z-10 px-2 text-on-photo">
                    <span className="text-[#F7F5F0] text-[10px] md:text-sm uppercase tracking-[0.3em] md:tracking-[0.4em] mb-4 md:mb-6 block animate-fade-up-delay-1">
                        {t('Tarification & Services')}
                    </span>

                    <h1 className="text-[#F7F5F0] text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif uppercase tracking-[0.1em] md:tracking-[0.15em] leading-tight mb-6 md:mb-8 drop-shadow-lg animate-fade-up-delay-2">
                        {t('Nos Forfaits', 'hero')} <br /> <span className="text-[#B88A44]">{t('Exclusifs', 'hero')}</span>
                    </h1>

                    <div className="w-16 md:w-24 h-[1px] bg-[#B88A44] mx-auto mb-6 md:mb-8 animate-fade-up-delay-2"></div>

                    <p className="text-[#F7F5F0]/90 text-[10px] md:text-base uppercase tracking-[0.15em] md:tracking-[0.2em] max-w-xs md:max-w-2xl mx-auto leading-relaxed animate-fade-up-delay-3">
                        {t('Des solutions sur mesure pour chaque propriété en Provence')}
                    </p>
                    <p className="text-[#B88A44] text-[10px] md:text-[11px] uppercase tracking-[0.35em] mt-4 font-bold animate-fade-up-delay-3">
                        {t('Excellence · Sérénité · Confiance')}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mt-10 md:mt-12 animate-fade-up-delay-3">
                        <a href="#secondaire" className="inline-flex items-center gap-2 bg-[#B88A44] text-white px-8 md:px-10 py-3.5 md:py-4 text-[10px] uppercase tracking-[0.3em] font-bold border border-[#B88A44] hover:bg-transparent transition-colors duration-500">
                            {t('Découvrir nos offres')} <ChevronRight size={14} />
                        </a>
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

            {/* ── SECTIONS DES FORFAITS (modifiables dans l'admin › Forfaits) ── */}
            {forfaits.map((f, i) => (
                <PricingSection
                    key={f.id}
                    id={f.id}
                    contactHref={`/contact?sujet=${CONTACT_SUJET[f.id]}&forfait=${encodeURIComponent(f.title)}`}
                    numero={['I', 'II', 'III'][i] ?? String(i + 1)}
                    image={f.image}
                    title={L(f.title, f.titleEn)}
                    subtitle={L(f.subtitle, f.subtitleEn)}
                    description={L(f.description, f.descriptionEn)}
                    features={f.features.map((x) => ({ title: L(x.title, x.titleEn, 'forfaits'), desc: L(x.desc, x.descEn) }))}
                    packs={f.packs.map((p) => ({
                        name: L(p.name, p.nameEn),
                        price: L(p.price, p.priceEn),
                        highlight: p.highlight,
                        list: p.list.map((item, j) => L(item, p.listEn?.[j])),
                    }))}
                />
            ))}

            {/* ── FAQ (modifiable dans l'admin › Forfaits › Questions fréquentes) ── */}
            <FaqSection />

            {/* FOOTER */}
            <section className="snap-start">
                <Footer />
            </section>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// SECTION TARIFAIRE
// ─────────────────────────────────────────────────────────────
function PricingSection({
    id, contactHref, numero, image, title, subtitle, description, features, packs,
}: {
    id: string;
    contactHref: string;
    numero: string;
    image: string;
    title: string;
    subtitle: string;
    description: string;
    features: Feature[];
    packs: Pack[];
}) {
    const t = useT();
    const gridCols =
        packs.length >= 4 ? 'md:grid-cols-4'
            : packs.length === 3 ? 'md:grid-cols-3 md:max-w-4xl md:mx-auto'
                : 'md:grid-cols-2 md:max-w-2xl md:mx-auto';

    return (
        // Un forfait = un écran, avec arrêt du scroll (comme l'accueil)
        <section id={id} className="snap-start snap-always min-h-[100dvh] min-[1101px]:h-[100dvh] w-full relative flex flex-col pt-20 overflow-hidden">
            {/* Fond : la photo transparaît sous un voile papier */}
            <div className="absolute inset-0 z-0">
                <Image src={image} alt="" fill sizes="100vw" className="object-cover" />
                <div className="absolute inset-0 bg-black/60"></div>
            </div>

            {/* Numéro façon exposition */}
            <span className="hidden md:block absolute top-24 left-8 lg:left-12 z-10 font-serif text-[#B88A44]/30 text-8xl lg:text-9xl leading-none select-none">
                {numero}
            </span>

            <div className="relative z-10 flex-1 min-h-0 w-full max-w-6xl mx-auto px-4 md:px-10 flex flex-col justify-center gap-4 md:gap-6 lg:gap-8 py-4 md:py-6">

                {/* EN-TÊTE */}
                <div className="text-center shrink-0 text-on-photo">
                    <span className="block text-[#B88A44] text-[9px] md:text-[10px] uppercase tracking-[0.4em] mb-2 md:mb-3 font-bold">
                        {t(subtitle)}
                    </span>
                    <h2 className="text-[#F7F5F0] text-xl sm:text-2xl md:text-4xl lg:text-5xl font-serif uppercase tracking-[0.12em] md:tracking-[0.15em] mb-3 md:mb-4">
                        {t(title)}
                    </h2>
                    <div className="flex items-center justify-center gap-4 mb-3 md:mb-4">
                        <div className="w-10 md:w-16 h-[1px] bg-[#B88A44]/60"></div>
                        <div className="w-1.5 h-1.5 rotate-45 bg-[#B88A44]/70"></div>
                        <div className="w-10 md:w-16 h-[1px] bg-[#B88A44]/60"></div>
                    </div>
                    <p className="text-[#F7F5F0]/75 text-[10px] md:text-xs lg:text-sm uppercase tracking-[0.12em] md:tracking-[0.15em] leading-relaxed max-w-2xl mx-auto line-clamp-2 md:line-clamp-none">
                        {t(description)}
                    </p>
                </div>

                {/* SERVICES : bande de filets dorés (2×2 sur mobile, 4 colonnes sur ordinateur) */}
                <div className="grid grid-cols-2 md:grid-cols-4 bg-black/25 backdrop-blur-sm border border-[#B88A44]/30 shrink-0">
                    {features.map((feat, i) => (
                        <div
                            key={feat.title}
                            className={`flex gap-2 md:gap-3 px-3 md:px-5 py-2.5 md:py-4 border-[#B88A44]/30
                                ${i % 2 === 0 ? 'border-r' : i < features.length - 1 ? 'md:border-r' : ''}
                                ${i < 2 ? 'border-b md:border-b-0' : ''}`}
                        >
                            <span className="text-[#B88A44] font-serif italic text-base md:text-xl leading-none pt-0.5">
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <div className="min-w-0">
                                <h4 className="text-[#F7F5F0] text-[10px] md:text-[10px] uppercase tracking-[0.2em] font-bold mb-0.5 md:mb-1">
                                    {t(feat.title, 'forfaits')}
                                </h4>
                                <p className="hidden sm:block text-[#F7F5F0]/60 text-[10px] md:text-[10px] uppercase tracking-wider leading-snug">
                                    {t(feat.desc)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* PACKS : carrousel horizontal sur mobile, grille sur ordinateur */}
                <div className="shrink-0 -mx-4 md:mx-0 pt-4">
                    <div className={`flex md:grid ${gridCols} gap-3 md:gap-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-hide px-4 md:px-0 pb-1`}>
                        {packs.map((pack) => (
                            <div
                                key={pack.name}
                                className={`group relative flex flex-col bg-white p-5 md:p-6 lg:p-7 border border-[#B88A44]/10 transition-all duration-500 md:hover:-translate-y-1 hover:shadow-xl
                                    w-[72%] sm:w-[45%] md:w-auto shrink-0 snap-center
                                    ${pack.highlight ? 'border-t-4 border-t-[#B88A44] shadow-lg' : 'border-t-4 border-t-transparent shadow-sm'}`}
                            >
                                <div className="absolute inset-0 m-2 border border-[#B88A44]/15 pointer-events-none"></div>

                                {pack.highlight && (
                                    <span className="absolute -top-px right-5 -translate-y-full bg-[#B88A44] text-white text-[9px] md:text-[9px] uppercase tracking-[0.3em] font-bold px-2.5 py-1">
                                        {t('Recommandé')}
                                    </span>
                                )}

                                <div className="relative">
                                    <h3 className="text-[#1A1A1A] text-xs md:text-sm lg:text-base font-serif uppercase tracking-[0.15em] mb-1.5">
                                        {t(pack.name)}
                                    </h3>
                                    <span className="text-[#B88A44] font-bold text-[10px] md:text-[10px] uppercase tracking-[0.25em]">
                                        {t(pack.price)}
                                    </span>

                                    <div className="w-8 h-[1px] bg-[#B88A44] my-3 md:my-4 group-hover:w-14 transition-[width] duration-500"></div>

                                    <ul className="space-y-2 md:space-y-2.5">
                                        {pack.list.map((item) => (
                                            <li key={item} className="flex items-center gap-2.5 text-[10px] md:text-[10px] lg:text-[11px] uppercase tracking-wider text-[#1A1A1A]/65 font-medium">
                                                <span className="w-1.5 h-1.5 rotate-45 bg-[#B88A44] shrink-0"></span>
                                                {t(item)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center shrink-0">
                    <Link
                        href={contactHref}
                        className="inline-flex items-center gap-3 px-8 md:px-12 py-3 md:py-4 border border-[#B88A44] text-[#F7F5F0] text-[10px] uppercase tracking-[0.3em] hover:bg-[#B88A44] hover:text-white transition-colors duration-500"
                    >
                        {t('Demander une étude')} <ChevronRight size={14} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
