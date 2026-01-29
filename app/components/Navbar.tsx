'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {Lock, UserPlus, LayoutDashboard, MessageSquare, FileText} from 'lucide-react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const isAdminStored = localStorage.getItem('isAdmin') === 'true';
        if (isAdminStored) {
            setIsAdmin(true);
        }

        const params = new URLSearchParams(window.location.search);
        if (params.get('secret') === 'emma') {
            localStorage.setItem('isAdmin', 'true');
            setIsAdmin(true);
            alert("Mode Administratrice Activé 🔓");
            window.location.href = '/admin';
        }
    }, []);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    }, [isOpen]);

    const links = [
        { name: 'Accueil', href: '/' },
        { name: 'Forfaits', href: '/forfaits' },
    ];

    return (
        <nav className="fixed top-0 w-full h-20 z-[50] bg-[#F7F5F0] border-b border-[#B88A44]/15">
            <div className="max-w-9xl mx-auto px-6 h-full flex items-center justify-between relative z-[1001]">

                {/* LOGO */}
                <div className="shrink-0">
                    <Link href="/" className="relative flex items-center group">
                        <div className="relative w-[30px] md:w-[50px] h-10 md:h-12">
                            <div className="absolute w-[35px] h-[35px] md:w-[60px] md:h-[60px] top-1/2 -translate-y-1/2 left-0 transition-transform duration-500 group-hover:scale-105">
                                <Image src="/logo.png" alt="Logo" fill className="object-contain" priority />
                            </div>
                        </div>
                        <div className="flex flex-col justify-center ml-2 md:ml-4">
                            <span className="text-[#B88A44] text-sm md:text-xl font-serif uppercase tracking-[0.3em] leading-none">La Clé</span>
                            <span className="text-[#B88A44] text-sm md:text-xl font-serif uppercase tracking-[0.3em] mt-1 leading-none">Provençale</span>
                        </div>
                    </Link>
                </div>

                {/* DESKTOP */}
                <div className="hidden min-[1101px]:flex items-center gap-6">
                    {links.map((l) => (
                        <Link key={l.name} href={l.href} className="text-[#1A1A1A] text-[11px] uppercase tracking-[0.3em] font-medium hover:text-[#B88A44] transition-colors">
                            {l.name}
                        </Link>
                    ))}

                    {/* --- LIENS ADMIN DESKTOP --- */}
                    {isAdmin && (
                        <div className="flex items-center gap-6 border-x border-[#B88A44]/10 px-6 mx-2">
                            <Link href="/admin" className="flex items-center gap-2 text-[#B88A44] text-[10px] uppercase tracking-widest font-bold hover:opacity-70 transition-opacity">
                                <LayoutDashboard size={14} /> Dashboard
                            </Link>
                            {/* NOUVEAU LIEN MESSAGERIE */}
                            <Link href="/admin/messages" className="flex items-center gap-2 text-[#B88A44] text-[10px] uppercase tracking-widest font-bold hover:opacity-70 transition-opacity">
                                <MessageSquare size={14} /> Messages
                            </Link>
                            <Link href="/admin/client" className="flex items-center gap-2 text-[#B88A44] text-[10px] uppercase tracking-widest font-bold hover:opacity-70 transition-opacity">
                                <UserPlus size={14} /> Nouveau
                            </Link>
                            <Link href="/admin/facturation" className="flex items-center gap-2 text-[#B88A44] text-[10px] uppercase tracking-widest font-bold hover:opacity-70 transition-opacity">
                                <FileText size={14} /> Facturation
                            </Link>
                        </div>
                    )}

                    <Link
                        href="/contact"
                        className="px-8 py-2.5 border border-[#B88A44] text-[#1A1A1A] text-[10px] uppercase tracking-[0.3em] hover:bg-[#B88A44] hover:text-white transition-all ml-2"
                    >
                        Contact
                    </Link>
                </div>

                {/* BURGER (Mobile) */}
                <button onClick={() => setIsOpen(!isOpen)} className="min-[1101px]:hidden p-2 text-[#B88A44]">
                    <div className="w-6 h-5 flex flex-col justify-between">
                        <span className={`h-[1px] bg-[#B88A44] transition-all ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                        <span className={`h-[1px] bg-[#B88A44] transition-all ${isOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`h-[1px] bg-[#B88A44] transition-all ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                    </div>
                </button>
            </div>

            {/* OVERLAY MOBILE */}
            <div className={`fixed inset-0 bg-[#F7F5F0] z-[1000] flex flex-col items-center justify-center transition-all duration-500 min-[1101px]:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                <div className="flex flex-col items-center gap-8 text-center w-full">
                    {links.map((l) => (
                        <Link key={l.name} href={l.href} onClick={() => setIsOpen(false)} className="text-[#1A1A1A] text-2xl font-serif uppercase tracking-[0.4em]">
                            {l.name}
                        </Link>
                    ))}

                    {/* --- LIENS ADMIN MOBILE --- */}
                    {isAdmin && (
                        <div className="flex flex-col gap-6 pt-8 border-t border-[#B88A44]/20 w-full px-10">
                            <Link href="/admin" onClick={() => setIsOpen(false)} className="text-[#B88A44] text-sm uppercase tracking-[0.3em] font-bold flex items-center justify-center gap-3">
                                <LayoutDashboard size={18} /> Dashboard
                            </Link>
                            {/* NOUVEAU LIEN MESSAGERIE MOBILE */}
                            <Link href="/admin/messages" onClick={() => setIsOpen(false)} className="text-[#B88A44] text-sm uppercase tracking-[0.3em] font-bold flex items-center justify-center gap-3">
                                <MessageSquare size={18} /> Messagerie
                            </Link>
                            <Link href="/admin/client" onClick={() => setIsOpen(false)} className="text-[#B88A44] text-sm uppercase tracking-[0.3em] font-bold flex items-center justify-center gap-3">
                                <UserPlus size={18} /> Nouveau Client
                            </Link>
                            <Link href="/admin/facturation" onClick={() => setIsOpen(false)} className="text-[#B88A44] text-sm uppercase tracking-[0.3em] font-bold flex items-center justify-center gap-3">
                                <FileText size={18} /> Facturation
                            </Link>
                        </div>
                    )}

                    <Link
                        href="/contact"
                        onClick={() => setIsOpen(false)}
                        className="mt-4 px-12 py-4 border border-[#B88A44] text-[#B88A44] text-xs uppercase tracking-[0.4em] font-bold"
                    >
                        Nous contacter
                    </Link>
                </div>
            </div>
        </nav>
    );
}