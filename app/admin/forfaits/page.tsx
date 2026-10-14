'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, ArrowDown, ArrowUp, Eye, GripVertical, HelpCircle, Loader2, Plus, RotateCcw, Save, Star, Tag, Trash2,
} from 'lucide-react';
import {
    DEFAULT_FAQ, DEFAULT_FORFAITS, FORFAIT_IMAGES, FaqItem, Forfait, ForfaitFeature, ForfaitPack,
    fetchFaq, fetchForfaits, resetFaq, resetForfait, saveFaq, saveForfait,
} from '@/lib/forfaits';
import { moveItem, useDragSort } from '@/lib/useDragSort';
import { askConfirm, notify } from '@/lib/feedback';

const inputClass =
    'w-full bg-[#F7F5F0] border-b border-[#B88A44]/20 py-2.5 px-2 text-sm font-serif outline-none focus:border-[#B88A44] transition-colors';
const labelClass = 'text-[10px] uppercase font-bold text-[#B88A44] tracking-widest';
const enInput = `${inputClass} bg-[#EEF2F7]/60`;

const TAB_LABELS: Record<Forfait['id'], string> = {
    secondaire: 'Résidences secondaires',
    saisonnier: 'Locations saisonnières',
    gites: "Gîtes & maisons d'hôtes",
};

export default function AdminForfaitsPage() {
    const [forfaits, setForfaits] = useState<Forfait[]>(DEFAULT_FORFAITS);
    const [saved, setSaved] = useState<string>(JSON.stringify(DEFAULT_FORFAITS));
    const [active, setActive] = useState<Forfait['id']>('secondaire');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showEn, setShowEn] = useState(false);
    const [view, setView] = useState<'section' | 'faq'>('section');
    const [faq, setFaq] = useState<FaqItem[]>(DEFAULT_FAQ);
    const [savedFaq, setSavedFaq] = useState<string>(JSON.stringify(DEFAULT_FAQ));

    useEffect(() => {
        Promise.all([
            fetchForfaits().then((list) => { setForfaits(list); setSaved(JSON.stringify(list)); }),
            fetchFaq().then((items) => { setFaq(items); setSavedFaq(JSON.stringify(items)); }),
        ])
            .catch(() => notify('Erreur lors du chargement des forfaits.'))
            .finally(() => setLoading(false));
    }, []);

    const f = forfaits.find((x) => x.id === active)!;
    const savedF = useMemo(() => (JSON.parse(saved) as Forfait[]).find((x) => x.id === active), [saved, active]);
    const sectionDirty = JSON.stringify(f) !== JSON.stringify(savedF);
    const faqDirty = JSON.stringify(faq) !== savedFaq;
    const dirty = view === 'faq' ? faqDirty : sectionDirty;

    // Prévenir avant de quitter la page avec des modifications non enregistrées
    useEffect(() => {
        const anyDirty = JSON.stringify(forfaits) !== saved || JSON.stringify(faq) !== savedFaq;
        const h = (e: BeforeUnloadEvent) => { if (anyDirty) { e.preventDefault(); } };
        window.addEventListener('beforeunload', h);
        return () => window.removeEventListener('beforeunload', h);
    }, [forfaits, saved, faq, savedFaq]);

    const update = (patch: Partial<Forfait>) =>
        setForfaits((list) => list.map((x) => (x.id === active ? { ...x, ...patch } : x)));

    const switchTab = async (id: Forfait['id'] | 'faq') => {
        if ((id === 'faq' && view === 'faq') || (id === active && view === 'section')) return;
        if (dirty && !(await askConfirm('Des modifications ne sont pas enregistrées dans cet onglet. Changer quand même ? (elles restent en mémoire)'))) return;
        if (id === 'faq') { setView('faq'); return; }
        setView('section');
        setActive(id);
    };

    // ── FAQ ──
    const faqDrag = useDragSort(faq, setFaq);
    const updateFaq = (i: number, patch: Partial<FaqItem>) => setFaq(faq.map((x, j) => (j === i ? { ...x, ...patch } : x)));
    const handleSaveFaq = async () => {
        const clean = faq.filter((x) => x.q.trim() && x.a.trim());
        setSaving(true);
        try {
            await saveFaq(clean);
            setFaq(clean);
            setSavedFaq(JSON.stringify(clean));
            notify('Questions fréquentes enregistrées ! Elles sont en ligne sur la page Forfaits.');
        } catch { notify("Erreur lors de l'enregistrement."); }
        setSaving(false);
    };
    const handleResetFaq = async () => {
        if (!(await askConfirm('Revenir aux questions d’origine ? Vos questions et réponses seront remplacées.'))) return;
        try {
            await resetFaq();
            setFaq(DEFAULT_FAQ);
            setSavedFaq(JSON.stringify(DEFAULT_FAQ));
            notify('Questions d’origine restaurées.');
        } catch { notify('Erreur lors de la restauration.'); }
    };

    const handleSave = async () => {
        // Nettoyage : lignes vides retirées
        const clean: Forfait = {
            ...f,
            features: f.features.filter((x) => x.title.trim() || x.desc.trim()),
            packs: f.packs
                .filter((p) => p.name.trim())
                .map((p) => ({ ...p, list: p.list.filter((l) => l.trim()), listEn: (p.listEn || []).map((l) => l.trim()) })),
        };
        setSaving(true);
        try {
            await saveForfait(clean);
            const next = forfaits.map((x) => (x.id === active ? clean : x));
            setForfaits(next);
            setSaved(JSON.stringify(next));
            notify('Forfait enregistré ! Il est en ligne sur la page Forfaits.');
        } catch (e) {
            console.error(e);
            notify("Erreur lors de l'enregistrement.");
        }
        setSaving(false);
    };

    const handleReset = async () => {
        if (!(await askConfirm(`Revenir au contenu d'origine pour « ${TAB_LABELS[active]} » ? Vos modifications de cette section seront perdues.`))) return;
        try {
            await resetForfait(active);
            const def = DEFAULT_FORFAITS.find((x) => x.id === active)!;
            const next = forfaits.map((x) => (x.id === active ? def : x));
            setForfaits(next);
            setSaved(JSON.stringify(next));
            notify('Contenu d’origine restauré.');
        } catch { notify('Erreur lors de la restauration.'); }
    };

    // Services (bande)
    const setFeatures = (features: ForfaitFeature[]) => update({ features });
    const featDrag = useDragSort(f.features, setFeatures);
    // Packs
    const setPacks = (packs: ForfaitPack[]) => update({ packs });
    const packDrag = useDragSort(f.packs, setPacks);
    const updatePack = (i: number, patch: Partial<ForfaitPack>) => setPacks(f.packs.map((p, j) => (j === i ? { ...p, ...patch } : p)));

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin text-[#B88A44]" size={40} /></div>;
    }

    return (
        <div className="min-h-screen py-6 md:py-12">
            <div className="max-w-6xl mx-auto px-4 md:px-6">

                {/* EN-TÊTE */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <Link href="/admin" className="inline-flex items-center gap-2 text-[#B88A44] text-[10px] uppercase tracking-widest font-bold mb-3 hover:text-[#1A1A1A] transition-colors">
                            <ArrowLeft size={14} /> Tableau de bord
                        </Link>
                        <span className="text-[#B88A44] text-[10px] uppercase tracking-[0.3em] font-bold block mb-1">Administration</span>
                        <h1 className="text-[#1A1A1A] text-2xl md:text-4xl font-serif uppercase tracking-widest leading-tight">
                            Page <span className="text-[#B88A44]">Forfaits</span>
                        </h1>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link href={`/forfaits#${view === 'faq' ? 'faq' : active}`} target="_blank" className="flex items-center gap-2 border border-[#B88A44] text-[#B88A44] px-5 py-3 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#B88A44] hover:text-white transition-all">
                            <Eye size={14} /> Voir la page
                        </Link>
                        <button onClick={view === 'faq' ? handleSaveFaq : handleSave} disabled={!dirty || saving} className="flex items-center gap-2 bg-[#1A1A1A] text-white px-6 py-3 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#B88A44] transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed">
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {dirty ? 'Enregistrer' : 'Enregistré'}
                        </button>
                    </div>
                </div>

                {/* ONGLETS */}
                <div className="flex flex-wrap gap-2 border-b border-[#B88A44]/15 mb-8">
                    {DEFAULT_FORFAITS.map((d, i) => {
                        const cur = forfaits.find((x) => x.id === d.id)!;
                        const savedCur = (JSON.parse(saved) as Forfait[]).find((x) => x.id === d.id);
                        const changed = JSON.stringify(cur) !== JSON.stringify(savedCur);
                        return (
                            <button key={d.id} onClick={() => switchTab(d.id)}
                                    className={`px-4 md:px-6 py-3 text-[10px] uppercase tracking-widest font-bold border-b-2 -mb-px transition-colors ${view === 'section' && active === d.id ? 'border-[#B88A44] text-[#1A1A1A]' : 'border-transparent text-[#1A1A1A]/40 hover:text-[#B88A44]'}`}>
                                <span className="font-serif text-[#B88A44] mr-2">{['I', 'II', 'III'][i]}</span>{TAB_LABELS[d.id]}
                                {changed && <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-[#B88A44] align-middle" title="Non enregistré" />}
                            </button>
                        );
                    })}
                    <button onClick={() => switchTab('faq')}
                            className={`px-4 md:px-6 py-3 text-[10px] uppercase tracking-widest font-bold border-b-2 -mb-px transition-colors flex items-center gap-2 ${view === 'faq' ? 'border-[#B88A44] text-[#1A1A1A]' : 'border-transparent text-[#1A1A1A]/40 hover:text-[#B88A44]'}`}>
                        <HelpCircle size={13} className="text-[#B88A44]" /> Questions fréquentes
                        {faqDirty && <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#B88A44]" title="Non enregistré" />}
                    </button>
                </div>

                <label className="flex items-center gap-2 mb-6 text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/60 cursor-pointer select-none w-fit">
                    <input type="checkbox" checked={showEn} onChange={(e) => setShowEn(e.target.checked)} className="accent-[#B88A44]" />
                    🇬🇧 Afficher les champs anglais <span className="normal-case tracking-normal font-normal italic text-[#1A1A1A]/40">(facultatifs : sinon la traduction automatique est utilisée)</span>
                </label>

                {view === 'faq' ? (
                <div className="space-y-8">
                    <Card title="Questions fréquentes" hint="Affichées en bas de la page Forfaits, en accordéon. Glissez ⋮⋮ pour réordonner. Une question sans réponse n’est pas affichée.">
                        <div className="space-y-3">
                            {faq.map((item, i) => (
                                <div key={i} {...faqDrag.props(i)} className={`flex gap-3 items-start bg-[#F7F5F0]/60 border border-[#B88A44]/10 p-3 md:p-4 transition ${faqDrag.stateClass(i)}`}>
                                    <div className="flex flex-col items-center pt-2 text-[#1A1A1A]/30">
                                        <GripVertical size={16} className="cursor-grab active:cursor-grabbing" />
                                        <span className="font-serif text-[#B88A44] text-sm mt-1">{String(i + 1).padStart(2, '0')}</span>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <input className={`${inputClass} font-bold`} placeholder="Question (ex : Comment se passe la remise des clés ?)" value={item.q} onChange={(e) => updateFaq(i, { q: e.target.value })} />
                                        <textarea rows={3} className={`${inputClass} resize-y leading-relaxed`} placeholder="Réponse" value={item.a} onChange={(e) => updateFaq(i, { a: e.target.value })} />
                                        {showEn && <>
                                            <input className={`${enInput} font-bold`} placeholder="🇬🇧 Question" value={item.qEn || ''} onChange={(e) => updateFaq(i, { qEn: e.target.value })} />
                                            <textarea rows={3} className={`${enInput} resize-y leading-relaxed`} placeholder="🇬🇧 Answer" value={item.aEn || ''} onChange={(e) => updateFaq(i, { aEn: e.target.value })} />
                                        </>}
                                    </div>
                                    <RowActions
                                        onUp={i > 0 ? () => setFaq(moveItem(faq, i, i - 1)) : undefined}
                                        onDown={i < faq.length - 1 ? () => setFaq(moveItem(faq, i, i + 1)) : undefined}
                                        onDelete={async () => { if (await askConfirm(`Supprimer la question « ${item.q || 'sans titre'} » ?`)) setFaq(faq.filter((_, j) => j !== i)); }}
                                    />
                                </div>
                            ))}
                        </div>
                        <AddButton onClick={() => setFaq([...faq, { q: '', a: '' }])} label="Ajouter une question" />
                    </Card>

                    <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-2">
                        <button onClick={handleResetFaq} className="flex items-center justify-center gap-2 text-[#1A1A1A]/50 text-[10px] uppercase tracking-widest font-bold hover:text-red-600 transition-colors py-3">
                            <RotateCcw size={13} /> Revenir aux questions d’origine
                        </button>
                        <button onClick={handleSaveFaq} disabled={!faqDirty || saving} className="flex items-center justify-center gap-3 bg-[#1A1A1A] text-white px-10 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#B88A44] transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed">
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {faqDirty ? 'Enregistrer les questions' : 'Questions enregistrées'}
                        </button>
                    </div>
                </div>
                ) : (
                <div className="space-y-8">
                    {/* 1. EN-TÊTE DE LA SECTION */}
                    <Card title="En-tête de la section">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Field label="Titre" value={f.title} onChange={(v) => update({ title: v })} en={showEn ? { value: f.titleEn || '', onChange: (v) => update({ titleEn: v }) } : undefined} />
                            <Field label="Sous-titre" value={f.subtitle} onChange={(v) => update({ subtitle: v })} en={showEn ? { value: f.subtitleEn || '', onChange: (v) => update({ subtitleEn: v }) } : undefined} />
                        </div>
                        <Field label="Description" textarea value={f.description} onChange={(v) => update({ description: v })} en={showEn ? { value: f.descriptionEn || '', onChange: (v) => update({ descriptionEn: v }) } : undefined} />

                        <div className="space-y-2">
                            <span className={labelClass}>Photo de fond</span>
                            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                                {FORFAIT_IMAGES.map((img) => (
                                    <button key={img.src} type="button" title={img.label} onClick={() => update({ image: img.src })}
                                            className={`relative aspect-square overflow-hidden ${f.image === img.src ? 'ring-2 ring-[#B88A44] ring-offset-2' : 'opacity-60 hover:opacity-100'}`}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={img.src} alt={img.label} className="absolute inset-0 w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* 2. SERVICES (BANDE) */}
                    <Card title="Services inclus" hint="La bande de 4 services sous le titre. Glissez ⋮⋮ pour réordonner.">
                        <div className="space-y-3">
                            {f.features.map((feat, i) => (
                                <div key={i} {...featDrag.props(i)} className={`flex gap-3 items-start bg-[#F7F5F0]/60 border border-[#B88A44]/10 p-3 transition ${featDrag.stateClass(i)}`}>
                                    <div className="flex flex-col items-center pt-2 text-[#1A1A1A]/30">
                                        <GripVertical size={16} className="cursor-grab active:cursor-grabbing" />
                                        <span className="font-serif text-[#B88A44] text-sm mt-1">{String(i + 1).padStart(2, '0')}</span>
                                    </div>
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-3">
                                        <input className={inputClass} placeholder="Titre (ex : Vigilance)" value={feat.title} onChange={(e) => setFeatures(f.features.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
                                        <input className={inputClass} placeholder="Description courte" value={feat.desc} onChange={(e) => setFeatures(f.features.map((x, j) => (j === i ? { ...x, desc: e.target.value } : x)))} />
                                        {showEn && <>
                                            <input className={enInput} placeholder="🇬🇧 Title" value={feat.titleEn || ''} onChange={(e) => setFeatures(f.features.map((x, j) => (j === i ? { ...x, titleEn: e.target.value } : x)))} />
                                            <input className={enInput} placeholder="🇬🇧 Short description" value={feat.descEn || ''} onChange={(e) => setFeatures(f.features.map((x, j) => (j === i ? { ...x, descEn: e.target.value } : x)))} />
                                        </>}
                                    </div>
                                    <RowActions
                                        onUp={i > 0 ? () => setFeatures(moveItem(f.features, i, i - 1)) : undefined}
                                        onDown={i < f.features.length - 1 ? () => setFeatures(moveItem(f.features, i, i + 1)) : undefined}
                                        onDelete={() => setFeatures(f.features.filter((_, j) => j !== i))}
                                    />
                                </div>
                            ))}
                        </div>
                        <AddButton onClick={() => setFeatures([...f.features, { title: '', desc: '' }])} label="Ajouter un service" />
                        {f.features.length !== 4 && <p className="text-[11px] text-[#1A1A1A]/40 italic font-serif">Conseil : 4 services donnent le meilleur rendu (une ligne sur ordinateur, 2×2 sur mobile).</p>}
                    </Card>

                    {/* 3. PACKS */}
                    <Card title="Packs" hint="Les cartes de prix. Glissez ⋮⋮ pour réordonner, ★ pour mettre un pack en avant (« Recommandé »).">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {f.packs.map((pack, i) => (
                                <div key={i} {...packDrag.props(i)} className={`relative bg-white border p-5 transition ${pack.highlight ? 'border-t-4 border-t-[#B88A44] border-[#B88A44]/20' : 'border-[#B88A44]/15'} ${packDrag.stateClass(i)}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2 text-[#1A1A1A]/30">
                                            <GripVertical size={16} className="cursor-grab active:cursor-grabbing" />
                                            <span className="text-[10px] uppercase tracking-widest font-bold">Pack {i + 1}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button type="button" title={pack.highlight ? 'Retirer « Recommandé »' : 'Mettre en avant (« Recommandé »)'}
                                                    onClick={() => setPacks(f.packs.map((p, j) => ({ ...p, highlight: j === i ? !p.highlight : false })))}
                                                    className={`p-1.5 ${pack.highlight ? 'text-[#B88A44]' : 'text-[#1A1A1A]/25 hover:text-[#B88A44]'}`}>
                                                <Star size={15} fill={pack.highlight ? 'currentColor' : 'none'} />
                                            </button>
                                            <RowActions
                                                onUp={i > 0 ? () => setPacks(moveItem(f.packs, i, i - 1)) : undefined}
                                                onDown={i < f.packs.length - 1 ? () => setPacks(moveItem(f.packs, i, i + 1)) : undefined}
                                                onDelete={async () => { if (await askConfirm(`Supprimer « ${pack.name || 'ce pack'} » ?`)) setPacks(f.packs.filter((_, j) => j !== i)); }}
                                                inline
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <input className={`${inputClass} uppercase tracking-wider`} placeholder="Nom du pack" value={pack.name} onChange={(e) => updatePack(i, { name: e.target.value })} />
                                        <div className="flex items-center gap-2">
                                            <Tag size={14} className="text-[#B88A44] shrink-0" />
                                            <input className={inputClass} placeholder="Prix / formule (ex : Mensuel, Sur devis, 20 % des revenus)" value={pack.price} onChange={(e) => updatePack(i, { price: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <span className={labelClass}>Inclus (une ligne par élément)</span>
                                            <textarea rows={4} className={`${inputClass} resize-y`} value={pack.list.join('\n')} onChange={(e) => updatePack(i, { list: e.target.value.split('\n') })} />
                                        </div>
                                        {showEn && (
                                            <div className="space-y-2 pt-2 border-t border-dashed border-[#B88A44]/20">
                                                <input className={enInput} placeholder="🇬🇧 Package name" value={pack.nameEn || ''} onChange={(e) => updatePack(i, { nameEn: e.target.value })} />
                                                <input className={enInput} placeholder="🇬🇧 Price / formula" value={pack.priceEn || ''} onChange={(e) => updatePack(i, { priceEn: e.target.value })} />
                                                <textarea rows={4} className={`${enInput} resize-y`} placeholder={'🇬🇧 Included (same order, one per line)'} value={(pack.listEn || []).join('\n')} onChange={(e) => updatePack(i, { listEn: e.target.value.split('\n') })} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <AddButton onClick={() => setPacks([...f.packs, { name: '', price: '', list: [] }])} label="Ajouter un pack" />
                    </Card>

                    {/* ACTIONS BAS DE PAGE */}
                    <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-2">
                        <button onClick={handleReset} className="flex items-center justify-center gap-2 text-[#1A1A1A]/50 text-[10px] uppercase tracking-widest font-bold hover:text-red-600 transition-colors py-3">
                            <RotateCcw size={13} /> Revenir au contenu d’origine
                        </button>
                        <button onClick={handleSave} disabled={!dirty || saving} className="flex items-center justify-center gap-3 bg-[#1A1A1A] text-white px-10 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#B88A44] transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed">
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {dirty ? 'Enregistrer cette section' : 'Section enregistrée'}
                        </button>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
}

// ── Petits composants ──
function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
    return (
        <section className="bg-white border border-[#B88A44]/10 shadow-sm p-5 md:p-8 space-y-5">
            <div className="border-b border-[#B88A44]/10 pb-3">
                <h2 className="text-[#1A1A1A] text-sm font-serif uppercase tracking-widest">{title}</h2>
                {hint && <p className="text-[11px] text-[#1A1A1A]/45 italic font-serif mt-1">{hint}</p>}
            </div>
            {children}
        </section>
    );
}

function Field({ label, value, onChange, textarea, en }: {
    label: string; value: string; onChange: (v: string) => void; textarea?: boolean;
    en?: { value: string; onChange: (v: string) => void };
}) {
    return (
        <div className="space-y-1">
            <span className={labelClass}>{label}</span>
            {textarea
                ? <textarea rows={3} className={`${inputClass} resize-y leading-relaxed`} value={value} onChange={(e) => onChange(e.target.value)} />
                : <input className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} />}
            {en && (textarea
                ? <textarea rows={3} className={`${enInput} resize-y leading-relaxed mt-2`} placeholder="🇬🇧 English" value={en.value} onChange={(e) => en.onChange(e.target.value)} />
                : <input className={`${enInput} mt-2`} placeholder="🇬🇧 English" value={en.value} onChange={(e) => en.onChange(e.target.value)} />)}
        </div>
    );
}

function RowActions({ onUp, onDown, onDelete, inline }: { onUp?: () => void; onDown?: () => void; onDelete: () => void; inline?: boolean }) {
    const btn = 'p-1.5 text-[#1A1A1A]/30 hover:text-[#B88A44] disabled:opacity-20 disabled:cursor-not-allowed';
    return (
        <div className={`flex ${inline ? 'flex-row' : 'flex-col'} items-center`}>
            <button type="button" className={btn} disabled={!onUp} onClick={onUp} title="Monter" aria-label="Monter"><ArrowUp size={13} /></button>
            <button type="button" className={btn} disabled={!onDown} onClick={onDown} title="Descendre" aria-label="Descendre"><ArrowDown size={13} /></button>
            <button type="button" className="p-1.5 text-red-300 hover:text-red-600" onClick={onDelete} title="Supprimer" aria-label="Supprimer"><Trash2 size={13} /></button>
        </div>
    );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
    return (
        <button type="button" onClick={onClick} className="flex items-center gap-2 border border-dashed border-[#B88A44]/40 text-[#B88A44] px-5 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#B88A44]/5 transition-colors">
            <Plus size={14} /> {label}
        </button>
    );
}
