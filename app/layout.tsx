import type { Metadata, Viewport } from 'next';
import SiteShell from './components/SiteShell';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from './lib/site';
import './globals.css';

// ─── SEO : valeurs par défaut pour tout le site ───
// Chaque page peut les compléter via son propre layout.tsx (experience, forfaits, contact…)
export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: `${SITE_NAME} — Conciergerie de prestige en Provence`,
        template: `%s · ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    keywords: ['conciergerie', 'Provence', 'Gordes', 'Luberon', 'résidence secondaire', 'location saisonnière', 'gîte', "maison d'hôtes", 'gestion locative'],
    alternates: { canonical: '/' },
    openGraph: {
        type: 'website',
        locale: 'fr_FR',
        url: SITE_URL,
        siteName: SITE_NAME,
        title: `${SITE_NAME} — Conciergerie de prestige en Provence`,
        description: SITE_DESCRIPTION,
        images: [{ url: '/photo-village.jpg', width: 2000, height: 1500, alt: 'Village provençal — La Clé Provençale' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: `${SITE_NAME} — Conciergerie de prestige en Provence`,
        description: SITE_DESCRIPTION,
        images: ['/photo-village.jpg'],
    },
};

export const viewport: Viewport = {
    themeColor: '#F7F5F0',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="fr" data-scroll-behavior="smooth" className="snap-y snap-mandatory scroll-smooth">
            <body className="bg-[#F7F5F0] selection:bg-[#B88A44]/20 min-h-screen relative">
                <SiteShell>{children}</SiteShell>
            </body>
        </html>
    );
}
