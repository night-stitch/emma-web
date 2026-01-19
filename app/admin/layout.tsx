'use client';

import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        /* h-screen + flex-col : On verrouille la hauteur totale.
           Le contenu ne pourra jamais dépasser la taille de l'écran.
        */
        <div className="flex flex-col">
            <main className="flex-1 overflow-hidden relative pt-20">
                {children}
            </main>
        </div>
    );
}