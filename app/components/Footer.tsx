'use client';

import Link from 'next/link';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-[#F7F5F0] border-t border-[#B88A44]/20 pt-20 pb-10 snap-start">
            <div className="max-w-7xl mx-auto px-6">

                {/* PARTIE HAUTE : GRILLE 4 COLONNES */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">

                    {/* 1. MARQUE & IDENTITÉ */}
                    <div className="space-y-6">
                        <h3 className="text-[#1A1A1A] text-2xl font-serif tracking-wider">
                            LA CLÉ PROVENÇALE
                        </h3>
                        <p className="text-[#1A1A1A]/60 text-[10px] uppercase tracking-[0.2em] leading-relaxed">
                            Conciergerie de Prestige.<br />
                            L'art de vivre, tout simplement.
                        </p>
                        {/* Réseaux Sociaux */}
                        <div className="flex gap-4">
                            <SocialIcon icon={<Instagram size={18} />} href="https://www.instagram.com/la_cle_provencale?igsh=MTB2bXo2eG55bTFleQ%3D%3D&utm_source=qr" />
                            <SocialIcon icon={<Facebook size={18} />} href="https://www.facebook.com/share/1MTv9X7Hrb/?mibextid=wwXIfr" />
                        </div>
                    </div>

                    {/* 2. NAVIGATION RAPIDE */}
                    <div>
                        <h4 className="text-[#B88A44] text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
                            Explorer
                        </h4>
                        <ul className="space-y-4">
                            <FooterLink href="/" label="Accueil" />
                            <FooterLink href="/forfaits" label="Nos Forfaits" />
                        </ul>
                    </div>

                    {/* 4. CONTACT */}
                    <div>
                        <h4 className="text-[#B88A44] text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
                            Nous Contacter
                        </h4>
                        <ul className="space-y-6">
                            <ContactItem icon={<Phone size={14} />} text="06 68 60 40 63" />
                            <ContactItem icon={<Mail size={14} />} text="conciergerie@lacleprovencale.fr" />
                            <ContactItem icon={<MapPin size={14} />} text="Gordes, Luberon, Provence" />
                        </ul>
                    </div>
                </div>

                {/* PARTIE BASSE : COPYRIGHT */}
                <div className="border-t border-[#B88A44]/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[#1A1A1A]/40 text-[9px] uppercase tracking-[0.2em]">
                        © 2024 La Clé Provençale. Tous droits réservés.
                    </p>
                    <p className="text-[#1A1A1A]/30 text-[9px] uppercase tracking-[0.2em]">
                        Fait avec élégance en Provence
                    </p>
                </div>
            </div>
        </footer>
    );
}

// --- SOUS-COMPOSANTS POUR LE STYLE ---

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

function ContactItem({ icon, text }: { icon: any; text: string }) {
    return (
        <li className="flex items-center gap-3 text-[#1A1A1A]/70 group">
            <span className="text-[#B88A44] group-hover:scale-110 transition-transform">
                {icon}
            </span>
            <span className="text-[10px] uppercase tracking-[0.15em]">
                {text}
            </span>
        </li>
    );
}

function SocialIcon({ icon, href }: { icon: any; href: string }) {
    return (
        <a
            href={href}
            className="w-8 h-8 flex items-center justify-center border border-[#B88A44]/30 rounded-full text-[#B88A44] hover:bg-[#B88A44] hover:text-white transition-all duration-300"
        >
            {icon}
        </a>
    );
}