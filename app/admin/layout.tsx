'use client';

import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen pt-20">
            <main className="w-full min-h-screen">
                <div className="p-4 md:p-12">
                    {children}
                </div>
            </main>
        </div>
    );
}