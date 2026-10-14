'use client';

// ─────────────────────────────────────────────────────────────
// Bilingue FR / EN (pages publiques uniquement — l'admin reste en français)
//
// Utilisation dans un composant :
//     const t = useT();
//     <h1>{t('Nos Forfaits')}</h1>
// Le texte français sert de clé : s'il n'a pas de traduction dans
// app/lib/translations.ts, il s'affiche en français (rien ne casse).
// ─────────────────────────────────────────────────────────────

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { EN } from './translations';

export type Lang = 'fr' | 'en';
const STORAGE_KEY = 'lang';

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
    lang: 'fr',
    setLang: () => {},
});

export function LangProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<Lang>('fr');

    // 1re visite : anglais si le navigateur n'est pas en français ; ensuite, le choix du visiteur est retenu
    useEffect(() => {
        let initial: Lang = 'fr';
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved === 'fr' || saved === 'en') initial = saved;
            else if (!navigator.language.toLowerCase().startsWith('fr')) initial = 'en';
        } catch { /* stockage indisponible */ }
        const param = new URLSearchParams(window.location.search).get('lang');
        if (param === 'fr' || param === 'en') initial = param;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLangState(initial);
    }, []);

    useEffect(() => {
        document.documentElement.lang = lang;
    }, [lang]);

    const setLang = useCallback((l: Lang) => {
        setLangState(l);
        try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
    }, []);

    return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
    return useContext(LangContext);
}

/**
 * Renvoie la fonction de traduction t('texte français').
 * Un contexte optionnel distingue un même mot traduit différemment
 * (ex. t('Accueil', 'forfaits') → clé 'forfaits|Accueil').
 */
export function useT() {
    const { lang } = useLang();
    return useCallback(
        (fr: string, ctx?: string) =>
            lang === 'en' ? (ctx ? EN[`${ctx}|${fr}`] : undefined) ?? EN[fr] ?? fr : fr,
        [lang]
    );
}

/** Choisit le champ anglais d'un contenu (ex. maison) s'il existe. */
export function useLocalized() {
    const { lang } = useLang();
    return useCallback(
        (fr: string, en?: string) => (lang === 'en' && en && en.trim() ? en : fr),
        [lang]
    );
}

/** Bouton FR | EN (dans le style du site). */
export function LangSwitch({ className = '' }: { className?: string }) {
    const { lang, setLang } = useLang();
    const item = (l: Lang) => (
        <button
            type="button"
            onClick={() => setLang(l)}
            aria-pressed={lang === l}
            aria-label={l === 'fr' ? 'Français' : 'English'}
            className={`px-1 transition-colors ${lang === l ? 'text-[#B88A44] font-bold' : 'text-[#1A1A1A]/40 hover:text-[#1A1A1A]'}`}
        >
            {l.toUpperCase()}
        </button>
    );
    return (
        <div className={`flex items-center gap-1 text-[10px] uppercase tracking-[0.25em] ${className}`}>
            {item('fr')}
            <span className="text-[#B88A44]/40">|</span>
            {item('en')}
        </div>
    );
}
