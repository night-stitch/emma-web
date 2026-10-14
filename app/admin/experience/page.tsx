'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
    ArrowLeft, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Eye, EyeOff,
    ImagePlus, Loader2, MapPin, Pencil, Plus, Save, Star, Trash2, X, Home,
} from 'lucide-react';
import {
    Experience, ExperienceImage, MAX_FEATURED, createExperience, deleteExperience, deleteImageFile, pathsOf, thumbOf,
    fetchExperiences, newExperienceId, updateExperience, uploadExperienceImage,
} from '@/lib/experiences';
import { notify, askConfirm } from '@/lib/feedback';
import { useDragSort } from '@/lib/useDragSort';
import { LangSwitch } from '@/lib/i18n';
import MaisonSection from '@/components/MaisonSection';

interface Draft {
    id: string;
    isNew: boolean;
    title: string;
    location: string;
    description: string;
    titleEn: string;
    locationEn: string;
    descriptionEn: string;
    images: ExperienceImage[];
    published: boolean;
    featured: boolean;
    order: number;
}

const emptyDraft = (order: number): Draft => ({
    id: newExperienceId(),
    isNew: true,
    title: '',
    location: '',
    description: '',
    titleEn: '',
    locationEn: '',
    descriptionEn: '',
    images: [],
    published: true,
    featured: false,
    order,
});

const inputClass =
    'w-full bg-[#F7F5F0] border-b border-[#B88A44]/20 py-3 px-2 text-sm font-serif outline-none focus:border-[#B88A44] transition-colors';
const labelClass = 'text-[10px] uppercase font-bold text-[#B88A44] tracking-widest';

export default function AdminExperiencePage() {
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);
    const [draft, setDraft] = useState<Draft | null>(null);

    const load = async () => {
        try {
            setExperiences(await fetchExperiences());
        } catch (e) {
            console.error(e);
            notify('Erreur lors du chargement des maisons.');
        }
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const openNew = () => {
        const maxOrder = experiences.reduce((m, e) => Math.max(m, e.order), 0);
        setDraft(emptyDraft(maxOrder + 1));
    };

    const openEdit = (exp: Experience) => setDraft({ ...exp, titleEn: exp.titleEn || '', locationEn: exp.locationEn || '', descriptionEn: exp.descriptionEn || '', images: [...exp.images], isNew: false });

    const handleDelete = async (exp: Experience) => {
        if (!await askConfirm(`Supprimer « ${exp.title} » et toutes ses photos ?`)) return;
        try {
            await deleteExperience(exp);
            setExperiences((list) => list.filter((e) => e.id !== exp.id));
        } catch (e) {
            console.error(e);
            notify('Erreur lors de la suppression.');
        }
    };

    const togglePublished = async (exp: Experience) => {
        await updateExperience(exp.id, { published: !exp.published });
        setExperiences((list) => list.map((e) => (e.id === exp.id ? { ...e, published: !e.published } : e)));
    };

    const featuredCount = experiences.filter((e) => e.featured).length;

    // Étoile : mise en avant sur la page d'accueil (3 max)
    const toggleFeatured = async (exp: Experience) => {
        if (!exp.featured && featuredCount >= MAX_FEATURED) {
            notify(`Vous avez déjà ${MAX_FEATURED} maisons mises en avant sur l'accueil. Retirez une étoile d'abord.`);
            return;
        }
        await updateExperience(exp.id, { featured: !exp.featured });
        setExperiences((list) => list.map((e) => (e.id === exp.id ? { ...e, featured: !e.featured } : e)));
    };

    // Nouvel ordre des maisons (flèches ou glisser-déposer) → enregistré tout de suite
    const saveOrder = async (list: Experience[]) => {
        const reordered = list.map((e, i) => ({ ...e, order: i + 1 }));
        setExperiences(reordered);
        try {
            await Promise.all(reordered.map((e) => updateExperience(e.id, { order: e.order })));
        } catch { notify("Erreur lors de l'enregistrement de l'ordre."); }
    };

    // Échange l'ordre avec la maison voisine
    const move = async (index: number, dir: -1 | 1) => {
        const target = index + dir;
        if (target < 0 || target >= experiences.length) return;
        const list = [...experiences];
        [list[index], list[target]] = [list[target], list[index]];
        await saveOrder(list);
    };

    const listDrag = useDragSort(experiences, (next) => { saveOrder(next); });

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="animate-spin text-[#B88A44]" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-6 md:py-12">
            <div className="max-w-7xl mx-auto px-4 md:px-6">

                {/* EN-TÊTE */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-12">
                    <div className="w-full md:w-auto">
                        <Link href="/admin" className="inline-flex items-center gap-2 text-[#B88A44] text-[10px] uppercase tracking-widest font-bold mb-3 hover:text-[#1A1A1A] transition-colors">
                            <ArrowLeft size={14} /> Tableau de bord
                        </Link>
                        <span className="text-[#B88A44] text-[10px] uppercase tracking-[0.3em] font-bold block mb-1">Administration</span>
                        <h1 className="text-[#1A1A1A] text-2xl md:text-4xl font-serif uppercase tracking-widest leading-tight">
                            Page <span className="text-[#B88A44]">Expérience</span>
                        </h1>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <Link href="/experience" target="_blank" className="flex items-center justify-center gap-2 border border-[#B88A44] text-[#B88A44] px-6 py-3 md:px-8 md:py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#B88A44] hover:text-white transition-all shadow-sm">
                            <Eye size={14} /> Voir la page
                        </Link>
                        <button onClick={openNew} className="flex items-center justify-center gap-2 bg-[#1A1A1A] text-white px-6 py-3 md:px-8 md:py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#B88A44] transition-all shadow-lg">
                            <Plus size={14} /> Nouvelle maison
                        </button>
                    </div>
                </div>

                {/* LISTE */}
                <section>
                    <div className="flex items-center gap-3 mb-8 border-b border-[#B88A44]/10 pb-4 text-lg font-serif uppercase tracking-widest">
                        <Home className="text-[#B88A44]" size={20} /> Maisons mises en avant
                        <span className="hidden md:inline text-[11px] text-[#1A1A1A]/35 font-serif italic normal-case tracking-normal">· glissez les cartes pour changer l’ordre</span>
                        <span className="text-[11px] text-[#1A1A1A]/40 font-sans tracking-normal normal-case">({experiences.length})</span>
                        <span className="ml-auto flex items-center gap-1.5 text-[10px] font-sans font-bold tracking-widest text-[#B88A44]">
                            <Star size={12} fill="currentColor" /> Accueil : {featuredCount}/{MAX_FEATURED}
                        </span>
                    </div>

                    {experiences.length === 0 ? (
                        <div className="bg-white border border-dashed border-[#B88A44]/30 p-12 text-center">
                            <p className="text-[12px] text-[#1A1A1A]/50 italic font-serif mb-6">Aucune maison pour le moment.</p>
                            <button onClick={openNew} className="inline-flex items-center gap-2 bg-[#B88A44] text-white px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#A07A34] transition-all">
                                <Plus size={14} /> Ajouter la première maison
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {experiences.map((exp, i) => (
                                <div key={exp.id} {...listDrag.props(i)} title="Glissez pour changer l’ordre" className={`group bg-white border border-[#B88A44]/10 shadow-sm hover:shadow-xl transition-all flex flex-col cursor-grab active:cursor-grabbing ${listDrag.stateClass(i)}`}>
                                    <button onClick={() => openEdit(exp)} className="relative aspect-[4/3] bg-[#F7F5F0] overflow-hidden">
                                        {exp.images[0] ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={thumbOf(exp.images[0])} alt={exp.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-[#B88A44]/30">
                                                <ImagePlus size={40} />
                                            </div>
                                        )}
                                        <span className={`absolute top-3 left-3 px-3 py-1 text-[9px] uppercase tracking-widest font-bold ${exp.published ? 'bg-[#B88A44] text-white' : 'bg-[#1A1A1A]/70 text-white/80'}`}>
                                            {exp.published ? 'En ligne' : 'Masquée'}
                                        </span>
                                        {exp.featured && (
                                            <span className="absolute bottom-3 left-3 bg-white/95 text-[#B88A44] px-2.5 py-1 text-[9px] uppercase tracking-widest font-bold flex items-center gap-1.5">
                                                <Star size={10} fill="currentColor" /> Accueil
                                            </span>
                                        )}
                                        <span className="absolute top-3 right-3 bg-white/90 px-2 py-1 text-[9px] font-bold text-[#1A1A1A]/70">
                                            {exp.images.length} photo{exp.images.length > 1 ? 's' : ''}
                                        </span>
                                    </button>

                                    <div className="p-4 md:p-6 flex-1 flex flex-col">
                                        <h3 className="text-[13px] font-bold uppercase truncate mb-1">{exp.title || 'Sans titre'}</h3>
                                        {exp.location && (
                                            <p className="text-[11px] text-[#1A1A1A]/70 italic line-clamp-1"><MapPin size={12} className="inline mr-1" />{exp.location}</p>
                                        )}
                                        <p className="text-[12px] text-[#1A1A1A]/50 font-serif italic line-clamp-2 mt-2">{exp.description}</p>

                                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    title={exp.featured ? "Retirer de l'accueil" : "Mettre en avant sur l'accueil"}
                                                    aria-label={exp.featured ? "Retirer de l'accueil" : "Mettre en avant sur l'accueil"}
                                                    onClick={() => toggleFeatured(exp)}
                                                    className={`p-2 transition-colors ${exp.featured ? 'text-[#B88A44]' : 'text-[#1A1A1A]/25 hover:text-[#B88A44]'}`}
                                                >
                                                    <Star size={15} fill={exp.featured ? 'currentColor' : 'none'} />
                                                </button>
                                                <IconBtn title="Monter" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={14} /></IconBtn>
                                                <IconBtn title="Descendre" disabled={i === experiences.length - 1} onClick={() => move(i, 1)}><ArrowDown size={14} /></IconBtn>
                                                <IconBtn title={exp.published ? 'Masquer' : 'Publier'} onClick={() => togglePublished(exp)}>
                                                    {exp.published ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </IconBtn>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => openEdit(exp)} className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-[#B88A44] font-bold px-2 py-2 hover:text-[#1A1A1A] transition-colors">
                                                    <Pencil size={12} /> Modifier
                                                </button>
                                                <IconBtn title="Supprimer" danger onClick={() => handleDelete(exp)}><Trash2 size={14} /></IconBtn>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {draft && (
                <ExperienceEditor
                    draft={draft}
                    otherFeatured={experiences.filter((e) => e.featured && e.id !== draft.id).length}
                    onClose={() => setDraft(null)}
                    onSaved={async () => { setDraft(null); await load(); }}
                />
            )}
        </div>
    );
}

function IconBtn({
    children, onClick, title, disabled, danger,
}: {
    children: React.ReactNode;
    onClick: () => void;
    title: string;
    disabled?: boolean;
    danger?: boolean;
}) {
    return (
        <button
            type="button"
            title={title}
            aria-label={title}
            disabled={disabled}
            onClick={onClick}
            className={`p-2 transition-colors disabled:opacity-20 disabled:cursor-not-allowed ${danger ? 'text-red-300 hover:text-red-600' : 'text-[#1A1A1A]/40 hover:text-[#B88A44]'}`}
        >
            {children}
        </button>
    );
}

// ─────────────────────────────────────────────────────────────
// MODAL D'ÉDITION
// ─────────────────────────────────────────────────────────────
function ExperienceEditor({
    draft: initial, otherFeatured, onClose, onSaved,
}: {
    draft: Draft;
    otherFeatured: number;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [draft, setDraft] = useState<Draft>(initial);
    const [uploading, setUploading] = useState(0);
    const [saving, setSaving] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInput = useRef<HTMLInputElement>(null);

    // Photos envoyées pendant cette édition (supprimées si on annule)
    const uploadedPaths = useRef<string[]>([]);
    // Photos retirées (supprimées du stockage seulement à l'enregistrement)
    const removedPaths = useRef<string[]>([]);

    const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

    const handleFiles = async (files: FileList | File[]) => {
        const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
        if (list.length === 0) return;
        setUploading((n) => n + list.length);
        await Promise.all(list.map(async (file) => {
            try {
                const img = await uploadExperienceImage(draft.id, file);
                uploadedPaths.current.push(...pathsOf(img));
                setDraft((d) => ({ ...d, images: [...d.images, img] }));
            } catch (e) {
                console.error(e);
                notify(`Impossible d'envoyer « ${file.name} ».`);
            } finally {
                setUploading((n) => n - 1);
            }
        }));
    };

    const removeImage = (index: number) => {
        const img = draft.images[index];
        if (img) removedPaths.current.push(...pathsOf(img));
        set('images', draft.images.filter((_, i) => i !== index));
    };

    const photoDrag = useDragSort(draft.images, (images) => set('images', images));
    const [preview, setPreview] = useState(false);

    const moveImage = (index: number, dir: -1 | 1) => {
        const target = index + dir;
        if (target < 0 || target >= draft.images.length) return;
        const imgs = [...draft.images];
        [imgs[index], imgs[target]] = [imgs[target], imgs[index]];
        set('images', imgs);
    };

    const setCover = (index: number) => {
        const imgs = [...draft.images];
        const [img] = imgs.splice(index, 1);
        set('images', [img, ...imgs]);
    };

    const handleCancel = async () => {
        if (uploading > 0) return;
        if (uploadedPaths.current.length && !await askConfirm('Annuler les modifications ? Les photos ajoutées seront supprimées.')) return;
        await Promise.all(uploadedPaths.current.map(deleteImageFile));
        onClose();
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (uploading > 0) return;
        if (!draft.title.trim()) { notify('Le titre est obligatoire.'); return; }
        setSaving(true);
        const data = {
            title: draft.title.trim(),
            location: draft.location.trim(),
            description: draft.description.trim(),
            titleEn: draft.titleEn.trim(),
            locationEn: draft.locationEn.trim(),
            descriptionEn: draft.descriptionEn.trim(),
            images: draft.images,
            published: draft.published,
            featured: draft.featured,
            order: draft.order,
        };
        try {
            if (draft.isNew) await createExperience(draft.id, data);
            else await updateExperience(draft.id, data);
            await Promise.all(removedPaths.current.map(deleteImageFile));
            onSaved();
        } catch (err) {
            console.error(err);
            notify("Erreur lors de l'enregistrement.");
            setSaving(false);
        }
    };

    return (
        <>
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#1A1A1A]/80 backdrop-blur-sm" onClick={handleCancel} />
            <div className="relative bg-white w-full max-w-4xl p-6 md:p-12 shadow-2xl border-t-4 border-[#B88A44] overflow-y-auto max-h-[92vh]">
                <button onClick={handleCancel} className="absolute top-4 right-4 text-[#1A1A1A]/40 hover:text-[#B88A44]" aria-label="Fermer">
                    <X size={24} />
                </button>

                <span className="text-[#B88A44] text-[10px] uppercase tracking-[0.3em] font-bold block mb-1">
                    {draft.isNew ? 'Nouvelle maison' : 'Modifier'}
                </span>
                <h2 className="text-[#1A1A1A] text-xl md:text-2xl font-serif uppercase tracking-widest mb-6 md:mb-8">
                    {draft.title || 'Maison sans titre'}
                </h2>

                <form onSubmit={handleSave} className="space-y-6 md:space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-1">
                            <label className={labelClass}>Titre *</label>
                            <input required className={inputClass} placeholder="Ex : Mas des Oliviers" value={draft.title} onChange={(e) => set('title', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className={labelClass}>Lieu</label>
                            <input className={inputClass} placeholder="Ex : Gordes — Luberon" value={draft.location} onChange={(e) => set('location', e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className={labelClass}>Description</label>
                        <textarea
                            rows={6}
                            className={`${inputClass} resize-y leading-relaxed`}
                            placeholder="Décrivez l'ambiance, les lieux, ce qui rend cette maison unique…"
                            value={draft.description}
                            onChange={(e) => set('description', e.target.value)}
                        />
                    </div>

                    {/* VERSION ANGLAISE (facultative) */}
                    <details className="border border-[#B88A44]/15 bg-[#F7F5F0]/50 group" open={!!(draft.titleEn || draft.descriptionEn)}>
                        <summary className="cursor-pointer select-none px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/70 flex items-center justify-between">
                            <span>🇬🇧 Version anglaise <span className="normal-case tracking-normal font-normal italic text-[#1A1A1A]/40">— facultatif, sinon le texte français est affiché</span></span>
                            <span className="text-[#B88A44] group-open:rotate-180 transition-transform">▾</span>
                        </summary>
                        <div className="px-4 pb-5 pt-2 space-y-4 md:space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <div className="space-y-1">
                                    <label className={labelClass}>Title (EN)</label>
                                    <input className={inputClass} placeholder={draft.title || 'Ex : Olive Grove Farmhouse'} value={draft.titleEn} onChange={(e) => set('titleEn', e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className={labelClass}>Location (EN)</label>
                                    <input className={inputClass} placeholder={draft.location || 'Ex : Gordes — Luberon'} value={draft.locationEn} onChange={(e) => set('locationEn', e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className={labelClass}>Description (EN)</label>
                                <textarea rows={5} className={`${inputClass} resize-y leading-relaxed`} placeholder="English description…" value={draft.descriptionEn} onChange={(e) => set('descriptionEn', e.target.value)} />
                            </div>
                        </div>
                    </details>

                    {/* PHOTOS */}
                    <div className="space-y-3">
                        <div className="flex items-end justify-between">
                            <label className={labelClass}>Photos</label>
                            <span className="text-[10px] text-[#1A1A1A]/40 italic font-serif">La première photo est la principale · glissez les photos pour changer l’ordre</span>
                        </div>

                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                            onClick={() => fileInput.current?.click()}
                            className={`cursor-pointer border-2 border-dashed p-6 md:p-8 text-center transition-colors ${dragOver ? 'border-[#B88A44] bg-[#B88A44]/5' : 'border-[#B88A44]/25 bg-[#F7F5F0] hover:border-[#B88A44]/60'}`}
                        >
                            <ImagePlus className="mx-auto text-[#B88A44] mb-3" size={28} />
                            <p className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A]/70">Ajouter des photos</p>
                            <p className="text-[11px] text-[#1A1A1A]/40 italic font-serif mt-1">Cliquez ou glissez-déposez vos images ici</p>
                            <input
                                ref={fileInput}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.target.value = ''; }}
                            />
                        </div>

                        {(draft.images.length > 0 || uploading > 0) && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {draft.images.map((img, i) => (
                                    <div key={`${i}-${img.path || img.url}`} {...photoDrag.props(i)} title="Glissez pour changer l’ordre" className={`relative aspect-square group overflow-hidden bg-[#F7F5F0] cursor-grab active:cursor-grabbing transition ${i === 0 ? 'ring-2 ring-[#B88A44]' : ''} ${photoDrag.stateClass(i)}`}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={thumbOf(img)} alt={`Photo ${i + 1}`} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                                        {i === 0 && (
                                            <span className="absolute top-2 left-2 bg-[#B88A44] text-white text-[8px] uppercase tracking-widest font-bold px-2 py-1 flex items-center gap-1">
                                                <Star size={9} fill="currentColor" /> Principale
                                            </span>
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 flex items-center justify-between gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <div className="flex">
                                                <ThumbBtn title="Déplacer à gauche" disabled={i === 0} onClick={() => moveImage(i, -1)}><ChevronLeft size={14} /></ThumbBtn>
                                                <ThumbBtn title="Déplacer à droite" disabled={i === draft.images.length - 1} onClick={() => moveImage(i, 1)}><ChevronRight size={14} /></ThumbBtn>
                                                {i !== 0 && <ThumbBtn title="Définir comme principale" onClick={() => setCover(i)}><Star size={13} /></ThumbBtn>}
                                            </div>
                                            <ThumbBtn title="Supprimer" danger onClick={() => removeImage(i)}><Trash2 size={13} /></ThumbBtn>
                                        </div>
                                    </div>
                                ))}
                                {Array.from({ length: uploading }).map((_, i) => (
                                    <div key={`up-${i}`} className="aspect-square bg-[#F7F5F0] border border-[#B88A44]/10 flex flex-col items-center justify-center gap-2">
                                        <Loader2 className="animate-spin text-[#B88A44]" size={22} />
                                        <span className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/40">Envoi…</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* PUBLICATION */}
                    <label className="flex items-center gap-3 cursor-pointer select-none w-fit">
                        <input type="checkbox" className="sr-only peer" checked={draft.published} onChange={(e) => set('published', e.target.checked)} />
                        <span className="w-10 h-5 rounded-full bg-[#1A1A1A]/15 peer-checked:bg-[#B88A44] relative transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
                        <span className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/70">
                            {draft.published ? 'Visible sur le site' : 'Masquée du site'}
                        </span>
                    </label>

                    {/* MISE EN AVANT ACCUEIL */}
                    <button
                        type="button"
                        onClick={() => {
                            if (!draft.featured && otherFeatured >= MAX_FEATURED) {
                                notify(`Vous avez déjà ${MAX_FEATURED} maisons mises en avant sur l'accueil. Retirez une étoile d'abord.`);
                                return;
                            }
                            set('featured', !draft.featured);
                        }}
                        className="flex items-center gap-3 w-fit group"
                    >
                        <span className={`w-9 h-9 flex items-center justify-center border transition-colors ${draft.featured ? 'bg-[#B88A44] border-[#B88A44] text-white' : 'border-[#B88A44]/30 text-[#B88A44]/50 group-hover:border-[#B88A44] group-hover:text-[#B88A44]'}`}>
                            <Star size={16} fill={draft.featured ? 'currentColor' : 'none'} />
                        </span>
                        <span className="text-left">
                            <span className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/70">
                                {draft.featured ? "Mise en avant sur l'accueil" : "Mettre en avant sur l'accueil"}
                            </span>
                            <span className="block text-[10px] text-[#1A1A1A]/40 italic font-serif">
                                {MAX_FEATURED} maisons maximum ({otherFeatured + (draft.featured ? 1 : 0)}/{MAX_FEATURED})
                            </span>
                        </span>
                    </button>

                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                        <button type="button" onClick={() => setPreview(true)} disabled={!draft.title.trim()}
                                className="sm:w-1/4 flex items-center justify-center gap-2 border border-[#B88A44] text-[#B88A44] py-4 text-[10px] uppercase font-bold tracking-widest hover:bg-[#B88A44] hover:text-white transition-all disabled:opacity-40">
                            <Eye size={14} /> Aperçu
                        </button>
                        <button type="button" onClick={handleCancel} disabled={uploading > 0 || saving} className="sm:w-1/4 border border-[#1A1A1A]/20 text-[#1A1A1A]/70 py-4 text-[10px] uppercase font-bold tracking-widest hover:border-[#B88A44] hover:text-[#B88A44] transition-all disabled:opacity-40">
                            Annuler
                        </button>
                        <button type="submit" disabled={uploading > 0 || saving} className="flex-1 bg-[#1A1A1A] text-white py-4 md:py-5 text-[10px] uppercase font-bold tracking-widest hover:bg-[#B88A44] transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-wait">
                            {saving || uploading > 0 ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            {uploading > 0 ? 'Envoi des photos…' : saving ? 'Enregistrement…' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        {/* APERÇU : la maison telle qu'elle apparaîtra sur la page Expérience */}
        {preview && createPortal(
            <div className="fixed inset-0 z-[100000] bg-[#F7F5F0] overflow-y-auto">
                <div className="sticky top-0 z-20 flex items-center justify-between gap-4 bg-[#1A1A1A] text-white px-4 md:px-8 py-3">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold flex items-center gap-2">
                        <Eye size={14} className="text-[#B88A44]" /> Aperçu — rien n’est encore enregistré
                    </span>
                    <div className="flex items-center gap-4">
                        <LangSwitch className="[&_button]:text-white/60 [&_button[aria-pressed=true]]:text-[#B88A44]" />
                        <button type="button" onClick={() => setPreview(false)} className="flex items-center gap-2 border border-white/30 px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#B88A44] hover:border-[#B88A44] transition-colors">
                            <X size={14} /> Fermer l’aperçu
                        </button>
                    </div>
                </div>
                <div className="relative -mt-20">
                    <MaisonSection
                        exp={{ ...draft, id: draft.id }}
                        index={Math.max(0, draft.order - 1)}
                        total={Math.max(draft.order, 1)}
                        onOpen={() => {}}
                        previewMode
                    />
                </div>
            </div>,
            document.body
        )}
        </>
    );
}

function ThumbBtn({
    children, onClick, title, disabled, danger,
}: {
    children: React.ReactNode;
    onClick: () => void;
    title: string;
    disabled?: boolean;
    danger?: boolean;
}) {
    return (
        <button
            type="button"
            title={title}
            aria-label={title}
            disabled={disabled}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={`p-1.5 text-white/80 transition-colors disabled:opacity-30 ${danger ? 'hover:text-red-400' : 'hover:text-[#B88A44]'}`}
        >
            {children}
        </button>
    );
}
