'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { useAdminAuth } from '@/lib/adminAuth';
import AdminLogin from './AdminLogin';
import AdminFeedback from '@/components/AdminFeedback';

export default function AdminShell({ children }: { children: React.ReactNode }) {
    const { isAdmin, loading } = useAdminAuth();

    return (
        <div className="flex flex-col">
            <main className="flex-1 overflow-hidden relative pt-20">
                {loading ? (
                    <div className="flex justify-center items-center min-h-[calc(100dvh-5rem)]">
                        <Loader2 className="animate-spin text-[#B88A44]" size={36} />
                    </div>
                ) : isAdmin ? (
                    <>
                        {children}
                        <AdminFeedback />
                    </>
                ) : (
                    // Pas connectée (ou compte non autorisé) : aucune page admin n'est affichée
                    <AdminLogin />
                )}
            </main>
        </div>
    );
}
