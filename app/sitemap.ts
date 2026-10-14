import type { MetadataRoute } from 'next';
import { SITE_URL } from './lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
    const pages: { path: string; priority: number; freq: 'weekly' | 'monthly' | 'yearly' }[] = [
        { path: '', priority: 1, freq: 'monthly' },
        { path: '/experience', priority: 0.9, freq: 'weekly' },
        { path: '/forfaits', priority: 0.9, freq: 'monthly' },
        { path: '/contact', priority: 0.7, freq: 'yearly' },
        { path: '/mentions-legales', priority: 0.2, freq: 'yearly' },
        { path: '/confidentialite', priority: 0.2, freq: 'yearly' },
    ];
    return pages.map((p) => ({
        url: `${SITE_URL}${p.path}`,
        lastModified: new Date(),
        changeFrequency: p.freq,
        priority: p.priority,
    }));
}
