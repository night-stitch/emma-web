'use client';

import React from 'react';

export default function ExperiencePage() {
    return (
        <div className="relative">
            {/* Section 1 - Rouge */}
            <section
                id="exp-1"
                className="snap-section h-screen w-full flex items-center justify-center"
            >
                <h1 className="text-white text-5xl font-serif uppercase tracking-widest">Expérience 01</h1>
            </section>

            {/* Section 2 - Bleu */}
            <section
                id="exp-2"
                className="snap-section h-screen w-full flex items-center justify-center bg-blue-900"
            >
                <h1 className="text-white text-5xl font-serif uppercase tracking-widest">Expérience 02</h1>
            </section>

            {/* Section 3 - Vert */}
            <section
                id="exp-3"
                className="snap-section h-screen w-full flex items-center justify-center bg-green-900"
            >
                <h1 className="text-white text-5xl font-serif uppercase tracking-widest">Expérience 03</h1>
            </section>

            {/* Section 4 - Or */}
            <section
                id="exp-4"
                className="snap-section h-screen w-full flex items-center justify-center bg-[#B88A44]"
            >
                <h1 className="text-white text-5xl font-serif uppercase tracking-widest">Expérience 04</h1>
            </section>
        </div>
    );
}