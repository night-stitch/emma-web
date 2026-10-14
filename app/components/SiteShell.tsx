'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import ScrollSideBar from './ScrollSideBar';
import Footer from './Footer';
import { LangProvider } from '@/lib/i18n';

/**
 * Habillage commun à toutes les pages (navbar, barre latérale, footer).
 * Séparé du layout pour que layout.tsx reste un composant serveur
 * et puisse définir les métadonnées SEO.
 */
export default function SiteShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() || '/';
    const isAdminPage = pathname.startsWith('/admin');
    const isForfaitPage = pathname.startsWith('/forfaits');

    // Pas d'effet « page par page » dans l'admin
    useEffect(() => {
        const html = document.documentElement;
        html.classList.toggle('snap-y', !isAdminPage);
        html.classList.toggle('snap-mandatory', !isAdminPage);
    }, [isAdminPage]);

    return (
        <LangProvider>
            {/* NAVBAR : toujours visible */}
            <header className="fixed top-0 w-full z-[9999]">
                <Navbar />
            </header>

            {!isAdminPage && <ScrollSideBar />}

            <main className="relative z-10 w-full">
                {children}
            </main>

            {/* FOOTER : masqué sur l'admin et sur Forfaits (qui a son propre footer) */}
            {!isAdminPage && !isForfaitPage && (
                <footer className="snap-start relative z-20">
                    <Footer />
                </footer>
            )}
        </LangProvider>
    );
}
