'use client';

// ─────────────────────────────────────────────────────────────
// Connexion à l'administration (Firebase Authentication)
//
// ⚠️ La même liste d'emails est dans firestore.rules et storage.rules.
//    Si tu ajoutes ou retires un admin, modifie les 3 fichiers.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import {
    User, onAuthStateChanged, signInWithEmailAndPassword, signOut,
    sendPasswordResetEmail, setPersistence, browserLocalPersistence,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export const ADMIN_EMAILS = [
    'conciergerie@lacleprovencale.fr',
    'alexandre22nadal@gmail.com',
];

export function isAdminUser(user: User | null): boolean {
    return !!user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
}

/** État de connexion en direct : { user, isAdmin, loading } */
export function useAdminAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        return onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });
    }, []);

    return { user, isAdmin: isAdminUser(user), loading };
}

export async function adminSignIn(email: string, password: string) {
    await setPersistence(auth, browserLocalPersistence); // reste connectée sur cet appareil
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    if (!isAdminUser(cred.user)) {
        await signOut(auth);
        throw new Error('not-admin');
    }
    return cred.user;
}

export function adminSignOut() {
    return signOut(auth);
}

export function adminResetPassword(email: string) {
    return sendPasswordResetEmail(auth, email.trim());
}

/** Traduit les erreurs Firebase en messages lisibles. */
export function authErrorMessage(err: unknown): string {
    const code = (err as { code?: string; message?: string })?.code || (err as Error)?.message || '';
    switch (code) {
        case 'not-admin':
            return "Ce compte n'a pas accès à l'administration.";
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
        case 'auth/invalid-email':
            return 'Email ou mot de passe incorrect.';
        case 'auth/too-many-requests':
            return 'Trop de tentatives. Réessayez dans quelques minutes.';
        case 'auth/network-request-failed':
            return 'Problème de connexion internet.';
        default:
            return 'Connexion impossible. Réessayez.';
    }
}
