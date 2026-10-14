'use client';

import { useT } from '@/lib/i18n';
import Link from 'next/link';
import { Instagram, Facebook, Mail, Phone, MapPin, Lock } from 'lucide-react';
import { CONTACT, SITE_NAME } from '../lib/site';

export default function Footer() {
    const t = useT();
    const year = new Date().getFullYear();

    return (
        <footer className="bg-[#F7F5F0] border-t border-[#B88A44]/20 pt-20 pb-10 snap-start">
            <div className="max-w-7xl mx-auto px-6">

                {/* PARTIE HAUTE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-20">

                    {/* 1. MARQUE & IDENTITÉ */}
                    <div className="space-y-6">
                        <h3 className="text-[#1A1A1A] text-2xl font-serif tracking-wider uppercase">
                            {SITE_NAME}
                        </h3>
                        <p className="text-[#1A1A1A]/60 text-[10px] uppercase tracking-[0.2em] leading-relaxed">
                            {t('Conciergerie de Prestige.')}<br />
                            {t('L’art de vivre, tout simplement.')}
                        </p>
                        <div className="flex gap-4">
                            <SocialIcon icon={<Instagram size={18} />} href={CONTACT.instagram} label="Instagram" />
                            <SocialIcon icon={<Facebook size={18} />} href={CONTACT.facebook} label="Facebook" />
                        </div>
                    </div>

                    {/* 2. NAVIGATION */}
                    <div>
                        <h4 className="text-[#B88A44] text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
                            {t('Explorer')}
                        </h4>
                        <ul className="space-y-4">
                            <FooterLink href="/" label={t('Accueil')} />
                            <FooterLink href="/forfaits" label={t('Nos Forfaits')} />
                            <FooterLink href="/experience" label={t('L’Expérience')} />
                            <FooterLink href="/contact" label={t('Contact')} />
                        </ul>
                    </div>

                    {/* 3. INFORMATIONS */}
                    <div>
                        <h4 className="text-[#B88A44] text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
                            {t('Informations')}
                        </h4>
                        <ul className="space-y-4">
                            <FooterLink href="/mentions-legales" label={t('Mentions légales')} />
                            <FooterLink href="/confidentialite" label={t('Confidentialité')} />
                        </ul>
                    </div>

                    {/* 4. CONTACT */}
                    <div>
                        <h4 className="text-[#B88A44] text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
                            {t('Nous Contacter')}
                        </h4>
                        <ul className="space-y-6">
                            <ContactItem icon={<Phone size={14} />} text={CONTACT.phone} href={CONTACT.phoneHref} />
                            <ContactItem icon={<Mail size={14} />} text={CONTACT.email} href={`mailto:${CONTACT.email}`} />
                            <ContactItem icon={<MapPin size={14} />} text={t(CONTACT.zone)} />
                        </ul>
                    </div>
                </div>

                {/* PARTIE BASSE */}
                <div className="border-t border-[#B88A44]/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[#1A1A1A]/40 text-[10px] uppercase tracking-[0.2em] text-center">
                        © {year} {SITE_NAME}. {t('Tous droits réservés.')}
                    </p>
                    <div className="flex items-center gap-6">
                        <p className="text-[#1A1A1A]/30 text-[10px] uppercase tracking-[0.2em]">
                            {t('Fait avec élégance en Provence')}
                        </p>
                        <Link
                            href="/admin"
                            aria-label="Espace administration"
                            className="text-[#1A1A1A]/20 hover:text-[#B88A44] transition-colors"
                            title={t('Espace privé')}
                        >
                            <Lock size={12} />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// --- SOUS-COMPOSANTS ---

function FooterLink({ href, label }: { href: string; label: string }) {
    return (
        <li>
            <Link
                href={href}
                className="text-[#1A1A1A]/70 text-[10px] uppercase tracking-[0.2em] hover:text-[#B88A44] transition-colors duration-300"
            >
                {label}
            </Link>
        </li>
    );
}

function ContactItem({ icon, text, href }: { icon: React.ReactNode; text: string; href?: string }) {
    const content = (
        <>
            <span className="text-[#B88A44] group-hover:scale-110 transition-transform">{icon}</span>
            <span className="text-[10px] uppercase tracking-[0.15em] group-hover:text-[#B88A44] transition-colors break-all">{text}</span>
        </>
    );
    return (
        <li>
            {href ? (
                <a href={href} className="flex items-center gap-3 text-[#1A1A1A]/70 group">{content}</a>
            ) : (
                <span className="flex items-center gap-3 text-[#1A1A1A]/70 group">{content}</span>
            )}
        </li>
    );
}

function SocialIcon({ icon, href, label }: { icon: React.ReactNode; href: string; label: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="w-8 h-8 flex items-center justify-center border border-[#B88A44]/30 text-[#B88A44] hover:bg-[#B88A44] hover:text-white transition-all duration-300"
        >
            {icon}
        </a>
    );
}
