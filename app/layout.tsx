'use client';

import { usePathname } from 'next/navigation';
import Navbar from './components/Navbar';
import ScrollSideBar from './components/ScrollSideBar';
import Footer from './components/Footer';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // 1. On vérifie si on est sur une page admin
    const isAdminPage = pathname.startsWith('/admin');
    const isForfaitPage = pathname.startsWith('/forfaits');

    // 2. On définit les classes du snap uniquement si on n'est PAS en admin
    // Sur l'admin, on garde juste "scroll-smooth" pour la fluidité
    const snapClasses = isAdminPage
        ? "scroll-smooth"
        : "snap-y snap-mandatory scroll-smooth";

    return (
        <html lang="fr" data-scroll-behavior="smooth" className={snapClasses}>
        <body className="bg-[#F7F5F0] selection:bg-[#B88A44]/20 min-h-screen relative">

        {/* NAVBAR : Toujours visible */}
        <header className="fixed top-0 w-full z-[9999]">
            <Navbar />
        </header>

        {/* La barre latérale de scroll (à désactiver aussi en admin si besoin) */}
        {!isAdminPage && <ScrollSideBar />}

        {/* CONTENU : Padding-top pour la Navbar */}
        <main className="relative z-10 w-full">
            {children}
        </main>

        {/* FOOTER : Masqué sur forfaits et éventuellement admin selon vos préférences */}
        {!isAdminPage ? (
            <footer className="snap-start relative z-20">
                <Footer />
            </footer>
        ) : (
            <div className="hidden" aria-hidden="true" />
        )}
        </body>
        </html>
    );
}