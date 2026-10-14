'use client';

// Nombre de messages à traiter, en direct (nouveau message du formulaire
// ou nouvelle réponse d'un client). Utilisé pour la pastille du menu Admin.
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useUnreadMessages(enabled: boolean) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!enabled) return;
        const unsub = onSnapshot(
            collection(db, 'messages'),
            (snap) => setCount(snap.docs.filter((d) => d.data().status !== 'répondu').length),
            (err) => console.warn('Pastille messages :', err.message)
        );
        return () => { unsub(); setCount(0); };
    }, [enabled]);

    return count;
}
