'use client';

// ─────────────────────────────────────────────────────────────
// Avis Google (Places API New), affichés dans le style du site.
// Configuration : .env.local → NEXT_PUBLIC_GOOGLE_PLACES_KEY et NEXT_PUBLIC_GOOGLE_PLACE_ID
// Google renvoie au maximum 5 avis (les « plus pertinents »).
// Règles Google : mention « Avis Google », nom de l'auteur affiché et lien vers la fiche.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Star } from 'lucide-react';
import { useLang, useT } from '@/lib/i18n';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY;
const PLACE_ID = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID;
const CACHE_KEY = 'google-reviews-v2';
const CACHE_MS = 6 * 60 * 60 * 1000; // 6 h : limite les appels (et donc les coûts)

interface Review {
    rating: number;
    text?: { text: string };
    originalText?: { text: string };
    relativePublishTimeDescription?: string;
    publishTime?: string;
    authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
}
interface PlaceData {
    rating?: number;
    userRatingCount?: number;
    googleMapsUri?: string;
    reviews?: Review[];
}

async function loadPlace(lang: string): Promise<PlaceData> {
    try {
        const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY + lang) || 'null');
        if (cached && Date.now() - cached.t < CACHE_MS) return cached.d as PlaceData;
    } catch { /* pas de cache */ }

    const res = await fetch(`https://places.googleapis.com/v1/places/${PLACE_ID}?languageCode=${lang}`, {
        headers: {
            'X-Goog-Api-Key': API_KEY as string,
            'X-Goog-FieldMask': 'rating,userRatingCount,googleMapsUri,reviews',
        },
    });
    if (!res.ok) throw new Error(`Places API ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as PlaceData;
    try { sessionStorage.setItem(CACHE_KEY + lang, JSON.stringify({ t: Date.now(), d: data })); } catch { /* ignore */ }
    return data;
}

function Stars({ value, size = 14 }: { value: number; size?: number }) {
    return (
        <div className="flex items-center gap-1" aria-label={`${value} sur 5`}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={size} className="text-[#B88A44]" fill={i <= Math.round(value) ? 'currentColor' : 'none'} strokeWidth={1.5} />
            ))}
        </div>
    );
}

export default function GoogleReviews() {
    const t = useT();
    const { lang } = useLang();
    const [data, setData] = useState<PlaceData | null>(null);
    const [status, setStatus] = useState<'loading' | 'ok' | 'error'>(API_KEY && PLACE_ID ? 'loading' : 'error');
    const track = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!API_KEY || !PLACE_ID) {
            console.warn('Avis Google : NEXT_PUBLIC_GOOGLE_PLACES_KEY ou NEXT_PUBLIC_GOOGLE_PLACE_ID manquant dans .env.local');
            return;
        }
        loadPlace(lang)
            .then((d) => { setData(d); setStatus(d.reviews?.length ? 'ok' : 'error'); })
            .catch((e) => { console.warn('Avis Google indisponibles :', e); setStatus('error'); });
    }, [lang]);

    // Prévient la barre latérale quand la section apparaît ou disparaît
    useEffect(() => {
        if (status !== 'loading') window.dispatchEvent(new Event('sections-updated'));
    }, [status]);

    const scroll = (dir: -1 | 1) => {
        const el = track.current;
        if (!el) return;
        el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: 'smooth' });
    };

    // Rien à afficher (pas configuré, erreur, ou aucun avis) : la section ne s'affiche pas
    if (status === 'error') return null;

    const reviews = (data?.reviews || []).filter((r) => (r.text?.text || r.originalText?.text || '').trim());

    return (
        <section id="avis" className="min-h-screen w-full snap-start relative flex items-center justify-center pt-20">
            <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-12">

                {/* Titre */}
                <div className="text-center mb-10 md:mb-12">
                    <span className="text-[#B88A44] text-[10px] uppercase tracking-[0.4em] mb-2 block font-bold">
                        {t('Avis clients')}
                    </span>
                    <h2 className="text-[#1A1A1A] text-2xl md:text-4xl font-serif uppercase tracking-[0.2em] leading-tight">
                        {t('Ils nous font confiance')}
                    </h2>
                    <div className="w-20 h-[1px] bg-[#B88A44]/30 mx-auto mt-6"></div>
                </div>

                {status === 'loading' ? (
                    <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#B88A44]" size={28} /></div>
                ) : (
                    <>
                        {/* Note globale */}
                        {data?.rating && (
                            <div className="flex flex-col items-center gap-3 mb-10 md:mb-12">
                                <span className="font-serif text-5xl md:text-6xl text-[#1A1A1A] leading-none">
                                    {data.rating.toLocaleString(lang === 'en' ? 'en-GB' : 'fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                </span>
                                <Stars value={data.rating} size={18} />
                                {data.userRatingCount ? (
                                    <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-[0.3em]">
                                        {data.userRatingCount} {t('avis sur Google')}
                                    </span>
                                ) : null}
                            </div>
                        )}

                        {/* Cartes d'avis (défilement horizontal) */}
                        <div className="relative">
                            <div
                                ref={track}
                                className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-4 px-4 md:mx-0 md:px-0"
                            >
                                {reviews.map((r, i) => {
                                    const author = r.authorAttribution;
                                    const text = r.text?.text || r.originalText?.text || '';
                                    return (
                                        <article
                                            key={`${i}-${author?.displayName}`}
                                            className="relative snap-start shrink-0 w-[85%] sm:w-[60%] md:w-[calc((100%-3rem)/3)] bg-white border-t-4 border-[#B88A44] shadow-sm p-6 md:p-8 flex flex-col"
                                        >
                                            <div className="absolute inset-0 m-2 border border-[#B88A44]/10 pointer-events-none"></div>
                                            <span className="absolute top-3 right-6 font-serif text-6xl text-[#B88A44]/15 leading-none select-none" aria-hidden="true">&ldquo;</span>

                                            <Stars value={r.rating} />
                                            <p className="relative text-[#1A1A1A]/70 text-sm leading-relaxed mt-4 mb-6 line-clamp-6 whitespace-pre-line">
                                                {text}
                                            </p>

                                            <div className="relative mt-auto pt-4 border-t border-[#B88A44]/15 flex items-center gap-3">
                                                {author?.photoUri && (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={author.photoUri} alt="" referrerPolicy="no-referrer" className="w-9 h-9 object-cover" />
                                                )}
                                                <div className="min-w-0">
                                                    {author?.uri ? (
                                                        <a href={author.uri} target="_blank" rel="noopener noreferrer" className="block text-[#1A1A1A] text-[11px] uppercase tracking-[0.15em] font-bold truncate hover:text-[#B88A44] transition-colors">
                                                            {author.displayName}
                                                        </a>
                                                    ) : (
                                                        <span className="block text-[#1A1A1A] text-[11px] uppercase tracking-[0.15em] font-bold truncate">{author?.displayName || t('Client Google')}</span>
                                                    )}
                                                    <span className="text-[#1A1A1A]/40 text-[10px]">{r.relativePublishTimeDescription}</span>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>

                            {/* Flèches (si plus de 3 avis) */}
                            {reviews.length > 3 && (
                                <div className="hidden md:flex justify-center gap-3 mt-6">
                                    <button type="button" onClick={() => scroll(-1)} aria-label={t('Avis précédents')}
                                            className="w-10 h-10 flex items-center justify-center border border-[#B88A44]/40 text-[#B88A44] hover:bg-[#B88A44] hover:text-white transition-colors">
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button type="button" onClick={() => scroll(1)} aria-label={t('Avis suivants')}
                                            className="w-10 h-10 flex items-center justify-center border border-[#B88A44]/40 text-[#B88A44] hover:bg-[#B88A44] hover:text-white transition-colors">
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Lien vers Google + mention obligatoire */}
                        <div className="mt-10 md:mt-12 flex flex-col items-center gap-4">
                            {data?.googleMapsUri && (
                                <a href={data.googleMapsUri} target="_blank" rel="noopener noreferrer"
                                   className="inline-block px-8 py-3 border border-[#B88A44] text-[#1A1A1A] text-[10px] uppercase tracking-[0.3em] hover:bg-[#B88A44] hover:text-[#F7F5F0] transition-all duration-500">
                                    {t('Voir tous nos avis sur Google')}
                                </a>
                            )}
                            <span className="text-[#1A1A1A]/40 text-[10px] tracking-wide">{t('Avis fournis par Google')}</span>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
