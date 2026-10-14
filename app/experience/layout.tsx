import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "L'Expérience — nos maisons en Provence",
    description: "Découvrez nos maisons de caractère en Provence : mas, gîtes et demeures d'exception sélectionnés par La Clé Provençale.",
    alternates: { canonical: '/experience' },
    openGraph: {
        title: "L'Expérience — nos maisons en Provence",
        description: "Découvrez nos maisons de caractère en Provence : mas, gîtes et demeures d'exception sélectionnés par La Clé Provençale.",
        url: '/experience',
        images: ['/chant-de-lavande.jpg'],
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
