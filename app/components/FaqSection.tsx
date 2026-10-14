'use client';

// FAQ de la page Forfaits (questions/réponses modifiables dans l'admin › Forfaits)
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Plus } from 'lucide-react';
import { DEFAULT_FAQ, FaqItem, fetchFaq } from '@/lib/forfaits';
import { useLocalized, useT } from '@/lib/i18n';

export default function FaqSection() {
    const t = useT();
    const loc = useLocalized();
    const [items, setItems] = useState<FaqItem[]>(DEFAULT_FAQ);
    const [open, setOpen] = useState<number | null>(0);

    useEffect(() => {
        fetchFaq().then(setItems).catch((e) => console.warn('FAQ : contenu par défaut utilisé', e));
    }, []);

    const list = items.filter((x) => x.q.trim() && x.a.trim());
    if (list.length === 0) return null;

    return (
        <section id="faq" className="snap-start min-h-[100dvh] w-full flex items-center justify-center pt-20">
            <div className="w-full max-w-3xl mx-auto px-5 md:px-6 py-16 md:py-12">
                <div className="text-center mb-10 md:mb-12">
                    <span className="text-[#B88A44] text-[10px] uppercase tracking-[0.4em] mb-2 block font-bold">
                        {t('Vos questions, nos réponses')}
                    </span>
                    <h2 className="text-[#1A1A1A] text-2xl md:text-4xl font-serif uppercase tracking-[0.2em] leading-tight">
                        {t('Questions fréquentes')}
                    </h2>
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <div className="w-10 h-[1px] bg-[#B88A44]/60"></div>
                        <div className="w-1.5 h-1.5 rotate-45 bg-[#B88A44]/70"></div>
                        <div className="w-10 h-[1px] bg-[#B88A44]/60"></div>
                    </div>
                </div>

                <div className="border-t border-[#B88A44]/25">
                    {list.map((item, i) => {
                        const isOpen = open === i;
                        return (
                            <div key={i} className="border-b border-[#B88A44]/25">
                                <button
                                    type="button"
                                    onClick={() => setOpen(isOpen ? null : i)}
                                    aria-expanded={isOpen}
                                    className="w-full flex items-start gap-4 md:gap-6 py-5 md:py-6 text-left group"
                                >
                                    <span className="font-serif italic text-[#B88A44] text-base md:text-lg leading-snug pt-0.5 w-7 shrink-0">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <span className={`flex-1 font-serif text-base md:text-lg leading-snug transition-colors ${isOpen ? 'text-[#B88A44]' : 'text-[#1A1A1A] group-hover:text-[#B88A44]'}`}>
                                        {loc(item.q, item.qEn)}
                                    </span>
                                    <span className={`w-7 h-7 shrink-0 border flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-[#B88A44] border-[#B88A44] text-white rotate-45' : 'border-[#B88A44]/40 text-[#B88A44]'}`}>
                                        <Plus size={14} />
                                    </span>
                                </button>
                                <div className={`grid transition-[grid-template-rows] duration-500 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                    <div className="overflow-hidden">
                                        <p className="pl-11 md:pl-[3.25rem] pr-11 pb-6 text-[#1A1A1A]/65 text-sm md:text-[15px] leading-relaxed whitespace-pre-line">
                                            {loc(item.a, item.aEn)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="text-center mt-10 md:mt-12">
                    <p className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-[0.3em] mb-4">{t('Une autre question ?')}</p>
                    <Link
                        href="/contact?sujet=autre"
                        className="inline-flex items-center gap-3 px-10 py-4 border border-[#B88A44] text-[#1A1A1A] text-[10px] uppercase tracking-[0.3em] hover:bg-[#B88A44] hover:text-white transition-colors duration-500"
                    >
                        {t('Nous écrire')} <ChevronRight size={14} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
