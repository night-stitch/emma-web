'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useT } from '@/lib/i18n';

export default function NotFoundContent() {
    const t = useT();
    return (
        <section className="min-h-[100dvh] w-full flex items-center justify-center px-6 pt-20 relative overflow-hidden">
            {/* Grand chiffre en filigrane, façon exposition */}
            <span className="absolute inset-0 flex items-center justify-center font-serif text-[#B88A44]/[0.07] text-[40vw] md:text-[28vw] leading-none select-none pointer-events-none">
                404
            </span>

            <div className="relative z-10 text-center max-w-xl">
                <span className="text-[#B88A44] text-[10px] md:text-xs uppercase tracking-[0.4em] mb-4 block font-bold">
                    {t('Erreur 404')}
                </span>
                <h1 className="text-[#1A1A1A] text-3xl md:text-5xl font-serif uppercase tracking-[0.12em] leading-tight mb-6">
                    {t('Cette page')} <br />
                    <span className="text-[#B88A44] italic normal-case">{t('s’est égarée')}</span>
                </h1>
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="w-10 h-[1px] bg-[#B88A44]/60"></div>
                    <div className="w-1.5 h-1.5 rotate-45 bg-[#B88A44]/70"></div>
                    <div className="w-10 h-[1px] bg-[#B88A44]/60"></div>
                </div>
                <p className="text-[#1A1A1A]/60 text-xs md:text-sm uppercase tracking-[0.15em] leading-relaxed mb-10">
                    {t('Comme un chemin de traverse dans le Luberon,')}<br className="hidden sm:block" /> {t('elle ne mène nulle part.')}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <Link href="/" className="inline-flex items-center gap-2 bg-[#B88A44] text-white px-8 py-4 text-[10px] uppercase tracking-[0.3em] font-bold border border-[#B88A44] hover:bg-transparent hover:text-[#B88A44] transition-colors duration-500">
                        <ArrowLeft size={14} /> {t('Retour à l’accueil')}
                    </Link>
                    <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 border border-[#1A1A1A]/20 text-[#1A1A1A] text-[10px] uppercase tracking-[0.3em] hover:border-[#B88A44] hover:text-[#B88A44] transition-colors duration-500">
                        {t('Nous contacter')}
                    </Link>
                </div>
            </div>
        </section>
    );
}
