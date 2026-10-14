import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Nos forfaits de conciergerie',
    description: 'Forfaits sur mesure pour résidences secondaires, locations saisonnières et gîtes : surveillance, intendance, ménage, accueil et gestion locative.',
    alternates: { canonical: '/forfaits' },
    openGraph: {
        title: 'Nos forfaits de conciergerie',
        description: 'Forfaits sur mesure pour résidences secondaires, locations saisonnières et gîtes : surveillance, intendance, ménage, accueil et gestion locative.',
        url: '/forfaits',
        images: ['/maison-stone.jpg'],
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
