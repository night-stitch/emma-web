// ─────────────────────────────────────────────────────────────
// Expériences — maisons mises en avant (page /experience)
//
// Firestore : collection `experiences`
// Storage   : experiences/{experienceId}/{timestamp}-{nom}.jpg        (photo, 2000 px max)
//             experiences/{experienceId}/thumb-{timestamp}-{nom}.jpg  (miniature, 600 px)
//
// La première photo du tableau `images` sert de photo principale.
// ─────────────────────────────────────────────────────────────

import { db, storage } from '@/lib/firebase';
import {
    collection, getDocs, setDoc, updateDoc, deleteDoc, doc,
    query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export interface ExperienceImage {
    url: string;
    /** Chemin dans Firebase Storage (pour pouvoir supprimer le fichier). */
    path: string;
    /** Miniature légère pour les vignettes (absente sur les photos envoyées avant). */
    thumbUrl?: string;
    thumbPath?: string;
}

/** URL à utiliser pour une petite vignette (miniature si elle existe). */
export const thumbOf = (img: ExperienceImage) => img.thumbUrl || img.url;

/** Chemins Storage d'une photo (photo + miniature). */
export const pathsOf = (img: ExperienceImage) => [img.path, img.thumbPath].filter((p): p is string => !!p);

export interface Experience {
    id: string;
    title: string;
    location: string;
    description: string;
    /** Version anglaise (facultative : sinon le français est affiché). */
    titleEn?: string;
    locationEn?: string;
    descriptionEn?: string;
    images: ExperienceImage[];
    order: number;
    published: boolean;
    /** Mise en avant sur la page d'accueil (3 maximum). */
    featured: boolean;
}

export type ExperienceInput = Omit<Experience, 'id'>;

const COLLECTION = 'experiences';

/** Toutes les expériences, triées par ordre d'affichage. */
export async function fetchExperiences(onlyPublished = false): Promise<Experience[]> {
    const snap = await getDocs(query(collection(db, COLLECTION), orderBy('order', 'asc')));
    const list = snap.docs.map((d) => {
        const data = d.data();
        return {
            id: d.id,
            title: data.title ?? '',
            location: data.location ?? '',
            description: data.description ?? '',
            titleEn: data.titleEn ?? '',
            locationEn: data.locationEn ?? '',
            descriptionEn: data.descriptionEn ?? '',
            images: Array.isArray(data.images)
                ? (data.images as ExperienceImage[]).filter(
                    (img, i, arr) => arr.findIndex((o) => (o.path || o.url) === (img.path || img.url)) === i
                )
                : [],
            order: typeof data.order === 'number' ? data.order : 0,
            published: data.published !== false,
            featured: data.featured === true,
        } as Experience;
    });
    return onlyPublished ? list.filter((e) => e.published) : list;
}

/** Génère un identifiant Firestore sans créer le document (utile pour uploader les photos avant d'enregistrer). */
export function newExperienceId(): string {
    return doc(collection(db, COLLECTION)).id;
}

export async function createExperience(id: string, data: ExperienceInput) {
    await setDoc(doc(db, COLLECTION, id), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

export async function updateExperience(id: string, data: Partial<ExperienceInput>) {
    await updateDoc(doc(db, COLLECTION, id), { ...data, updatedAt: serverTimestamp() });
}

/** Supprime la fiche ET toutes ses photos dans Storage. */
export async function deleteExperience(exp: Experience) {
    await Promise.all(exp.images.flatMap(pathsOf).map(deleteImageFile));
    await deleteDoc(doc(db, COLLECTION, exp.id));
}

export async function deleteImageFile(path: string) {
    if (!path) return;
    try {
        await deleteObject(ref(storage, path));
    } catch (e) {
        // Fichier déjà supprimé : on ignore.
        console.warn('Suppression photo impossible :', path, e);
    }
}

/**
 * Redimensionne une photo côté navigateur (max 2000px, JPEG 82%)
 * pour garder un site rapide même avec des photos de téléphone.
 */
async function compressImage(file: File, maxSize = 2000, quality = 0.82): Promise<Blob> {
    if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;
    try {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
        const w = Math.round(bitmap.width * scale);
        const h = Math.round(bitmap.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return file;
        ctx.drawImage(bitmap, 0, 0, w, h);
        bitmap.close();
        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, 'image/jpeg', quality)
        );
        return blob && blob.size < file.size ? blob : file;
    } catch {
        return file;
    }
}

export async function uploadExperienceImage(experienceId: string, file: File): Promise<ExperienceImage> {
    const blob = await compressImage(file);
    const safeName = file.name
        .replace(/\.[^.]+$/, '')
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-zA-Z0-9-_]/g, '-')
        .slice(0, 40) || 'photo';
    const ext = blob.type === 'image/jpeg' ? 'jpg' : (file.name.split('.').pop() || 'jpg');
    const stamp = Date.now();
    const path = `experiences/${experienceId}/${stamp}-${safeName}.${ext}`;
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, blob, { contentType: blob.type || file.type });
    const url = await getDownloadURL(fileRef);

    // Miniature 600 px pour les vignettes (≈ 10 fois plus légère)
    const thumbBlob = await compressImage(file, 600, 0.75);
    if (thumbBlob !== file || file.size < 300_000) {
        const thumbPath = `experiences/${experienceId}/thumb-${stamp}-${safeName}.jpg`;
        const thumbRef = ref(storage, thumbPath);
        await uploadBytes(thumbRef, thumbBlob, { contentType: thumbBlob.type || 'image/jpeg' });
        const thumbUrl = await getDownloadURL(thumbRef);
        return { url, path, thumbUrl, thumbPath };
    }
    return { url, path };
}

/** Nombre maximum de maisons mises en avant sur l'accueil. */
export const MAX_FEATURED = 3;

/** Chiffres romains pour la numérotation façon « exposition ». */
export function toRoman(n: number): string {
    const map: [number, string][] = [
        [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
        [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
    ];
    let res = '';
    for (const [v, s] of map) while (n >= v) { res += s; n -= v; }
    return res;
}
