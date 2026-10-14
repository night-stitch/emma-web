'use client';

import { useT } from '@/lib/i18n';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function HeroSection() {
    const t = useT();
    return (
        <section className="relative w-full h-[100dvh] flex items-center justify-center overflow-hidden">

            {/* 1. IMAGE DE FOND - Optimisée avec will-change pour le GPU */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/photo-village.jpg"
                    alt="Panorama Provence"
                    fill
                    sizes="100vw"
                    className="object-cover will-change-transform"
                    priority
                    quality={80}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBQYhEhMiMUFR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQACAwEAAAAAAAAAAAAAAAABAgADESH/2gAMAwEAAhEDEQA/ANW2xuy3murlLi8hS1VY+h0Qs5J5yDxj2P3Paiu/1JSfNw0f/9k="
                />
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0.15)_55%,transparent_80%)]"></div>
            </div>

            {/* 2. LE CONTENU TEXTE - Animations CSS optimisées */}
            <div className="relative z-10 text-center px-4 md:px-6 max-w-4xl mx-auto mt-0 md:mt-10 text-on-photo">

                <span className="text-[#F7F5F0] text-[10px] md:text-sm uppercase tracking-[0.3em] md:tracking-[0.4em] mb-4 md:mb-6 block animate-fade-up-delay-1">
                    {t('Conciergerie de Prestige')}
                </span>

                <h1 className="text-[#F7F5F0] text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif uppercase tracking-[0.1em] md:tracking-[0.15em] leading-tight mb-6 md:mb-8 drop-shadow-lg animate-fade-up-delay-2">
                    {t('L’Art de Vivre')} <br /> <span className="text-[#B88A44]">{t('En Provence')}</span>
                </h1>

                <div className="w-16 md:w-24 h-[1px] bg-[#B88A44] mx-auto mb-6 md:mb-8 shadow-[0_0_10px_#B88A44] animate-fade-up-delay-2"></div>

                <p className="text-[#F7F5F0]/90 text-[10px] md:text-base uppercase tracking-[0.15em] md:tracking-[0.2em] max-w-xs md:max-w-2xl mx-auto leading-relaxed drop-shadow-md animate-fade-up-delay-3">
                    {t('Gestion de propriétés d’exception & Expériences sur-mesure')}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mt-8 md:mt-12 animate-fade-up-delay-3">
                    <Link href="/forfaits" className="inline-flex items-center gap-2 bg-[#B88A44] text-white px-8 md:px-10 py-3.5 md:py-4 text-[10px] uppercase tracking-[0.3em] font-bold border border-[#B88A44] hover:bg-transparent transition-colors duration-500">
                        {t('Découvrir nos forfaits')} <ChevronRight size={14} />
                    </Link>
                    <Link href="/contact" className="inline-flex items-center gap-2 px-8 md:px-10 py-3.5 md:py-4 border border-[#F7F5F0]/40 text-[#F7F5F0] text-[10px] uppercase tracking-[0.3em] hover:bg-[#F7F5F0] hover:text-[#1A1A1A] transition-colors duration-500">
                        {t('Nous contacter')}
                    </Link>
                </div>
            </div>
        </section>
    );
}