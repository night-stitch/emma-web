import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact',
    description: 'Contactez La Clé Provençale, conciergerie à Gordes et dans le Luberon, pour une étude personnalisée de votre propriété.',
    alternates: { canonical: '/contact' },
    openGraph: {
        title: 'Contact',
        description: 'Contactez La Clé Provençale, conciergerie à Gordes et dans le Luberon, pour une étude personnalisée de votre propriété.',
        url: '/contact',
        images: ['/photo-village.jpg'],
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
