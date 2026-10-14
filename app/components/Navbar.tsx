'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {Lock, UserPlus, LayoutDashboard, MessageSquare, FileText, Home, ChevronDown, LogOut, Tag} from 'lucide-react';
import { useUnreadMessages } from '@/lib/useUnreadMessages';
import { useAdminAuth, adminSignOut } from '@/lib/adminAuth';
import { useT, LangSwitch } from '@/lib/i18n';

export default function Navbar() {
    const t = useT();
    const [isOpen, setIsOpen] = useState(false);
    const { isAdmin } = useAdminAuth(); // liens admin visibles uniquement une fois connectée
    const unread = useUnreadMessages(isAdmin); // pastille « nouveaux messages »
    const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

    // Nettoie l'ancien système (?secret=emma) qui n'est plus utilisé
    useEffect(() => {
        try { localStorage.removeItem('isAdmin'); } catch { /* ignore */ }
    }, []);

    const handleSignOut = async () => {
        setIsAdminMenuOpen(false);
        setIsOpen(false);
        await adminSignOut();
        window.location.href = '/';
    };

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    }, [isOpen]);

    const links = [
        { name: 'Accueil', href: '/' },
        { name: 'Forfaits', href: '/forfaits' },
        { name: 'Expérience', href: '/experience' },
    ];

    const adminLinks = [
        { name: 'Dashboard', href: '/admin', Icon: LayoutDashboard },
        { name: 'Messages', href: '/admin/messages', Icon: MessageSquare },
        { name: 'Nouveau client', href: '/admin/client', Icon: UserPlus },
        { name: 'Facturation', href: '/admin/facturation', Icon: FileText },
        { name: 'Expérience', href: '/admin/experience', Icon: Home },
        { name: 'Forfaits', href: '/admin/forfaits', Icon: Tag },
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
                            {t(l.name)}
                        </Link>
                    ))}

                    {/* --- MENU ADMIN DESKTOP (déroulant pour ne pas surcharger la barre) --- */}
                    {isAdmin && (
                        <div className="relative group border-x border-[#B88A44]/10 px-6 mx-2 h-20 flex items-center">
                            <button
                                type="button"
                                onClick={() => setIsAdminMenuOpen((o) => !o)}
                                className="flex items-center gap-2 text-[#B88A44] text-[10px] uppercase tracking-widest font-bold hover:opacity-70 transition-opacity"
                            >
                                <Lock size={14} /> Admin
                                {unread > 0 && <Badge n={unread} />}
                                <ChevronDown size={12} className={`transition-transform ${isAdminMenuOpen ? 'rotate-180' : 'group-hover:rotate-180'}`} />
                            </button>
                            <div className={`absolute top-full right-0 min-w-[220px] bg-[#F7F5F0] border border-[#B88A44]/15 shadow-xl py-2 transition-all duration-200 ${isAdminMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0'}`}>
                                {adminLinks.map(({ name, href, Icon }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={() => setIsAdminMenuOpen(false)}
                                        className="flex items-center gap-3 px-5 py-3 text-[#B88A44] text-[10px] uppercase tracking-widest font-bold hover:bg-[#B88A44] hover:text-white transition-colors"
                                    >
                                        <Icon size={14} /> {name}
                                        {href === '/admin/messages' && unread > 0 && <Badge n={unread} className="ml-auto" />}
                                    </Link>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-5 py-3 border-t border-[#B88A44]/15 mt-1 text-[#1A1A1A]/60 text-[10px] uppercase tracking-widest font-bold hover:bg-[#1A1A1A] hover:text-white transition-colors"
                                >
                                    <LogOut size={14} /> Déconnexion
                                </button>
                            </div>
                        </div>
                    )}

                    <Link
                        href="/contact"
                        className="px-8 py-2.5 border border-[#B88A44] text-[#1A1A1A] text-[10px] uppercase tracking-[0.3em] hover:bg-[#B88A44] hover:text-white transition-all ml-2"
                    >
                        {t('Contact')}
                    </Link>
                    <LangSwitch />
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
                            {t(l.name)}
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
                                {unread > 0 && <Badge n={unread} />}
                            </Link>
                            <Link href="/admin/client" onClick={() => setIsOpen(false)} className="text-[#B88A44] text-sm uppercase tracking-[0.3em] font-bold flex items-center justify-center gap-3">
                                <UserPlus size={18} /> Nouveau Client
                            </Link>
                            <Link href="/admin/facturation" onClick={() => setIsOpen(false)} className="text-[#B88A44] text-sm uppercase tracking-[0.3em] font-bold flex items-center justify-center gap-3">
                                <FileText size={18} /> Facturation
                            </Link>
                            <Link href="/admin/experience" onClick={() => setIsOpen(false)} className="text-[#B88A44] text-sm uppercase tracking-[0.3em] font-bold flex items-center justify-center gap-3">
                                <Home size={18} /> Expérience
                            </Link>
                            <Link href="/admin/forfaits" onClick={() => setIsOpen(false)} className="text-[#B88A44] text-sm uppercase tracking-[0.3em] font-bold flex items-center justify-center gap-3">
                                <Tag size={18} /> Forfaits
                            </Link>
                            <button type="button" onClick={handleSignOut} className="text-[#1A1A1A]/50 text-sm uppercase tracking-[0.3em] font-bold flex items-center justify-center gap-3">
                                <LogOut size={18} /> Déconnexion
                            </button>
                        </div>
                    )}

                    <Link
                        href="/contact"
                        onClick={() => setIsOpen(false)}
                        className="mt-4 px-12 py-4 border border-[#B88A44] text-[#B88A44] text-xs uppercase tracking-[0.4em] font-bold"
                    >
                        {t('Nous contacter')}
                    </Link>
                    <LangSwitch className="mt-2 text-xs" />
                </div>
            </div>
        </nav>
    );
}

/** Pastille dorée avec un nombre (ex. messages à traiter). */
function Badge({ n, className = '' }: { n: number; className?: string }) {
    return (
        <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#B88A44] text-white text-[9px] font-bold tracking-normal leading-none animate-pulse ${className}`}
              aria-label={`${n} message${n > 1 ? 's' : ''} à traiter`}>
            {n > 99 ? '99+' : n}
        </span>
    );
}
