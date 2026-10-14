// ─────────────────────────────────────────────────────────────
// Forfaits (page /forfaits) — modifiables depuis l'admin › Forfaits
//
// Firestore : collection `forfaits`, un document par section
// (secondaire, saisonnier, gites). Tant qu'une section n'a jamais été
// enregistrée depuis l'admin, le contenu par défaut ci-dessous s'affiche.
// Les champs « En » sont facultatifs : sans eux, la traduction automatique
// (app/lib/translations.ts) ou le français est utilisé.
// ─────────────────────────────────────────────────────────────

import { db } from '@/lib/firebase';
import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';

export interface ForfaitFeature {
    title: string;
    desc: string;
    titleEn?: string;
    descEn?: string;
}

export interface ForfaitPack {
    name: string;
    price: string;
    list: string[];
    highlight?: boolean;
    nameEn?: string;
    priceEn?: string;
    listEn?: string[];
}

export interface Forfait {
    id: 'secondaire' | 'saisonnier' | 'gites';
    image: string;
    title: string;
    subtitle: string;
    description: string;
    titleEn?: string;
    subtitleEn?: string;
    descriptionEn?: string;
    features: ForfaitFeature[];
    packs: ForfaitPack[];
}

/** Photos disponibles pour le fond d'une section. */
export const FORFAIT_IMAGES = [
    { src: '/maison-stone.jpg', label: 'Maison en pierre' },
    { src: '/gite-stone.jpg', label: 'Gîte en pierre' },
    { src: '/hote-stone.jpg', label: "Maison d'hôtes" },
    { src: '/maison.jpg', label: 'Maison' },
    { src: '/gite-hote.jpg', label: 'Gîte & hôtes' },
    { src: '/photo-village.jpg', label: 'Village' },
    { src: '/chant-de-lavande.jpg', label: 'Champ de lavande' },
    { src: '/engagement.jpg', label: 'Ruelle' },
];

export const DEFAULT_FORFAITS: Forfait[] = [
    {
        id: 'secondaire',
        image: '/maison-stone.jpg',
        title: 'Résidences Secondaires',
        subtitle: 'Surveillance & Intendance',
        description: "Une gestion complète de votre bien, de la simple vigilance à l'expérience hôtelière 7j/7.",
        features: [
            { title: 'Vigilance', desc: 'Visites de contrôle, aération, relevé courrier.' },
            { title: 'Intendance', desc: 'Préparation complète et fermeture.' },
            { title: 'Maintenance', desc: 'Suivi travaux et coordination artisans.' },
            { title: 'Conciergerie', desc: 'Courses et réservations.' },
        ],
        packs: [
            { name: 'Pack Surveillance', price: 'Mensuel + Déplac.', list: ['Passages réguliers', 'Sécurité', 'Rapport'] },
            { name: 'Pack Entretien', price: 'Mensuel', list: ['Pack Surveillance', 'Jardin & Piscine', 'Artisans'] },
            { name: 'Pack Sérénité', price: 'Fixe + Variable', list: ['Pack Entretien', 'Préparation Arrivée', 'Ménage départ'], highlight: true },
        ],
    },
    {
        id: 'saisonnier',
        image: '/gite-stone.jpg',
        title: 'Locations Saisonnières',
        subtitle: 'Gestion & Rentabilité',
        description: "Maximisez vos revenus locatifs sans les contraintes. De la mise en ligne à l'accueil VIP, nous gérons tout.",
        features: [
            { title: 'Commercialisation', desc: 'Création annonces, photos pro, sélection locataires.' },
            { title: 'Logistique', desc: 'Ménage pro, blanchisserie, réassort.' },
            { title: 'Expérience', desc: 'Accueil personnalisé, assistance 7j/7.' },
            { title: 'Suivi', desc: 'Rapport mensuel, gestion des avis.' },
        ],
        packs: [
            { name: 'Pack Clés en main', price: 'Par déplacement', list: ['Remise des clés', 'Récupération', 'Présentation'] },
            { name: 'Pack Essentiel', price: 'Sur Devis', list: ['Remise des clés', 'Réassort', 'Ménage départ'] },
            { name: 'Pack Confort', price: 'Journalier', list: ['Pack Essentiel', 'Accueil VIP', 'Assistance 7j/7'] },
            { name: 'Pack Gestion', price: '20% Revenus', list: ['Pack Essentiel', 'Gestion PMS', 'Maintenance'], highlight: true },
        ],
    },
    {
        id: 'gites',
        image: '/hote-stone.jpg',
        title: "Gîtes & Maisons d'Hôtes",
        subtitle: 'Support Opérationnel',
        description: 'Allégez votre quotidien de propriétaire tout en offrant une expérience 5 étoiles à vos hôtes.',
        features: [
            { title: 'Accueil', desc: 'Accueil physique, assistance séjour, check-out.' },
            { title: 'Intendance', desc: 'Ménage quotidien, gestion du linge.' },
            { title: 'Gestion', desc: 'Plannings, réassort, coordination.' },
            { title: 'Services', desc: 'Activités locales, transferts.' },
        ],
        packs: [
            { name: 'Pack Exploitation', price: 'Taux Horaire', list: ['Accueil & Départ', 'Ménage & Linge', 'Petit-déjeuner'] },
            { name: 'Pack Gestion', price: 'Mensuel', list: ['Gestion prestataires', 'Calendrier', 'Maintenance'], highlight: true },
        ],
    },
];

const COLLECTION = 'forfaits';

/** Les 3 sections, avec le contenu enregistré dans l'admin s'il existe. */
export async function fetchForfaits(): Promise<Forfait[]> {
    const snap = await getDocs(collection(db, COLLECTION));
    const saved = new Map(snap.docs.map((d) => [d.id, d.data() as Partial<Forfait>]));
    return DEFAULT_FORFAITS.map((def) => {
        const s = saved.get(def.id);
        return s ? { ...def, ...s, id: def.id } as Forfait : def;
    });
}

export async function saveForfait(f: Forfait) {
    await setDoc(doc(db, COLLECTION, f.id), { ...f, updatedAt: serverTimestamp() });
}

/** Revient au contenu d'origine (supprime la version enregistrée). */
export async function resetForfait(id: Forfait['id']) {
    await deleteDoc(doc(db, COLLECTION, id));
}

// ─────────────────────────────────────────────────────────────
// FAQ de la page Forfaits — modifiable dans l'admin › Forfaits › Questions fréquentes
// Stockée dans forfaits/_faq. Contenu de départ ci-dessous (à adapter par Emma).
// ─────────────────────────────────────────────────────────────

export interface FaqItem {
    q: string;
    a: string;
    qEn?: string;
    aEn?: string;
}

export const DEFAULT_FAQ: FaqItem[] = [
    {
        q: 'Comment se passe la remise des clés ?',
        a: "Nous accueillons vos voyageurs (ou vous-même) sur place à l'heure convenue, présentons la maison et ses équipements, puis récupérons les clés au départ. Une boîte à clés sécurisée peut aussi être mise en place pour les arrivées tardives.",
        qEn: 'How does the key handover work?',
        aEn: 'We welcome your guests (or you) on site at the agreed time, show them around the house and its equipment, then collect the keys on departure. A secure key box can also be set up for late arrivals.',
    },
    {
        q: 'Que comprend le ménage ?',
        a: 'Un ménage complet entre chaque séjour : pièces de vie, cuisine, salles de bain, sols et poussières, ainsi que le changement du linge de lit et de toilette. Le détail exact figure dans votre devis.',
        qEn: 'What does the cleaning include?',
        aEn: 'A full clean between each stay: living areas, kitchen, bathrooms, floors and dusting, as well as fresh bed and bath linen. The exact details are listed in your quotation.',
    },
    {
        q: 'Quelle zone couvrez-vous ?',
        a: 'Nous intervenons à Gordes et dans les villages du Luberon. Contactez-nous pour vérifier que votre propriété se trouve dans notre secteur.',
        qEn: 'Which area do you cover?',
        aEn: 'We work in Gordes and the villages of the Luberon. Contact us to check that your property is within our area.',
    },
    {
        q: 'Comment sont établis les tarifs ?',
        a: "Chaque propriété est unique : après un échange ou une visite, nous établissons un devis personnalisé selon la taille du bien et les prestations choisies.",
        qEn: 'How are prices set?',
        aEn: 'Every property is unique: after a conversation or a visit, we prepare a tailored quotation based on the size of the property and the services you choose.',
    },
    {
        q: 'Puis-je adapter un forfait ou ajouter des services ?',
        a: 'Oui. Les forfaits sont une base : ils peuvent être ajustés et complétés (jardin, piscine, courses, conciergerie…) selon vos besoins.',
        qEn: 'Can I adapt a package or add services?',
        aEn: 'Yes. Our packages are a starting point: they can be adjusted and extended (garden, pool, shopping, concierge services…) to suit your needs.',
    },
    {
        q: 'Comment suis-je informé·e de l’état de ma maison ?',
        a: 'Après chaque passage, vous recevez un compte rendu, avec photos si besoin. En cas d’imprévu, nous vous prévenons immédiatement.',
        qEn: 'How am I kept informed about my home?',
        aEn: 'After each visit you receive a report, with photos when needed. If anything unexpected happens, we let you know straight away.',
    },
];

const FAQ_DOC = '_faq';

export async function fetchFaq(): Promise<FaqItem[]> {
    const snap = await getDoc(doc(db, COLLECTION, FAQ_DOC));
    const items = snap.exists() ? (snap.data().items as FaqItem[] | undefined) : undefined;
    return Array.isArray(items) ? items : DEFAULT_FAQ;
}

export async function saveFaq(items: FaqItem[]) {
    await setDoc(doc(db, COLLECTION, FAQ_DOC), { items, updatedAt: serverTimestamp() });
}

export async function resetFaq() {
    await deleteDoc(doc(db, COLLECTION, FAQ_DOC));
}
