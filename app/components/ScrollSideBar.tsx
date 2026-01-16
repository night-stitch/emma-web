'use client';

import { useEffect, useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';

const PAGE_SECTIONS: Record<string, { id: string }[]> = {
    '/': [{ id: 'hero' }, { id: 'services' }, { id: 'engagement' }, { id: 'about' }],
    '/forfaits': [{ id: 'intro' }, { id: 'secondaire' }, { id: 'saisonnier' }, { id: 'gites' }],
    '/contact': [{ id: 'contact-main' }],
};

export default function ScrollSideBar() {
    const pathname = usePathname();
    const [activeSection, setActiveSection] = useState('');
    const sections = useMemo(() => PAGE_SECTIONS[pathname] || [], [pathname]);

    useEffect(() => {
        if (sections.length === 0) return;
        setActiveSection(sections[0].id);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { threshold: 0.2, rootMargin: "-20% 0px -20% 0px" }
        );

        sections.forEach((section) => {
            const element = document.getElementById(section.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [sections]);

    const handleScrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (sections.length === 0) return null;

    return (
        <aside className="fixed right-6 md:right-10 top-1/2 -translate-y-1/2 z-[1000000] flex flex-col items-center pointer-events-auto">
            <div className="flex flex-col gap-5">
                {sections.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => handleScrollTo(section.id)}
                        className="group flex items-center justify-center p-2 outline-none"
                    >
                        <div
                            className={`
                                w-[3px] rounded-full transition-all duration-700 ease-in-out
                                ring-1 ring-black/10 /* Petite bordure pour le fond blanc */
                                ${activeSection === section.id
                                ? 'h-16 bg-[#B88A44] shadow-[0_0_15px_rgba(0,0,0,0.3),0_0_10px_rgba(184,138,68,0.8)]'
                                : 'h-8 bg-[#1A1A1A]/40 shadow-sm hover:bg-[#B88A44]/60 hover:h-12'
                            }
                            `}
                        />
                    </button>
                ))}
            </div>
        </aside>
    );
}