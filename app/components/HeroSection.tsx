'use client';

import Image from 'next/image';

export default function HeroSection() {
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
                <div className="absolute inset-0 bg-black/30"></div>
            </div>

            {/* 2. LE CONTENU TEXTE - Animations CSS optimisées */}
            <div className="relative z-10 text-center px-4 md:px-6 max-w-4xl mx-auto mt-0 md:mt-10">

                <span className="text-[#F7F5F0] text-[10px] md:text-sm uppercase tracking-[0.3em] md:tracking-[0.4em] mb-4 md:mb-6 block animate-fade-up-delay-1">
                    Conciergerie de Prestige
                </span>

                <h1 className="text-[#F7F5F0] text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif uppercase tracking-[0.1em] md:tracking-[0.15em] leading-tight mb-6 md:mb-8 drop-shadow-lg animate-fade-up-delay-2">
                    L'Art de Vivre <br /> <span className="text-[#B88A44]">En Provence</span>
                </h1>

                <div className="w-16 md:w-24 h-[1px] bg-[#B88A44] mx-auto mb-6 md:mb-8 shadow-[0_0_10px_#B88A44] animate-fade-up-delay-2"></div>

                <p className="text-[#F7F5F0]/90 text-[10px] md:text-base uppercase tracking-[0.15em] md:tracking-[0.2em] max-w-xs md:max-w-2xl mx-auto leading-relaxed drop-shadow-md animate-fade-up-delay-3">
                    Gestion de propriétés d'exception & Expériences sur-mesure
                </p>
            </div>
        </section>
    );
}