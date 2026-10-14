import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/** Mise en page commune des pages légales (style du site). */
export default function LegalPage({
    surtitle, title, updated, children,
}: {
    surtitle: string;
    title: string;
    updated: string;
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen pt-20">
            <Link
                href="/"
                className="fixed top-24 left-4 z-50 flex min-[1101px]:hidden items-center gap-2 bg-[#F7F5F0]/95 backdrop-blur-sm text-[#1A1A1A] px-4 py-2 border border-[#B88A44]/30 hover:bg-[#B88A44] hover:text-white hover:border-[#B88A44] transition-colors text-[10px] uppercase tracking-widest font-bold"
            >
                <ArrowLeft size={14} /> Retour
            </Link>

            <section id="legal" className="max-w-3xl mx-auto px-6 py-16 md:py-24">
                <header className="text-center mb-14">
                    <span className="text-[#B88A44] text-[10px] uppercase tracking-[0.4em] mb-3 block font-bold">{surtitle}</span>
                    <h1 className="text-[#1A1A1A] text-3xl md:text-5xl font-serif uppercase tracking-[0.12em] leading-tight">{title}</h1>
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <div className="w-10 h-[1px] bg-[#B88A44]/60"></div>
                        <div className="w-1.5 h-1.5 rotate-45 bg-[#B88A44]/70"></div>
                        <div className="w-10 h-[1px] bg-[#B88A44]/60"></div>
                    </div>
                    <p className="text-[#1A1A1A]/40 text-[10px] uppercase tracking-[0.3em] mt-6">Dernière mise à jour : {updated}</p>
                </header>

                <div className="relative bg-white/60 border border-[#B88A44]/15 p-6 md:p-12">
                    <div className="absolute inset-0 m-2 border border-[#B88A44]/10 pointer-events-none"></div>
                    <div className="relative space-y-10 text-[#1A1A1A]/75 text-sm md:text-[15px] leading-relaxed
                        [&_h2]:text-[#1A1A1A] [&_h2]:font-serif [&_h2]:uppercase [&_h2]:tracking-[0.15em] [&_h2]:text-base [&_h2]:md:text-lg [&_h2]:mb-4
                        [&_h2]:pb-3 [&_h2]:border-b [&_h2]:border-[#B88A44]/20
                        [&_p]:mb-3 [&_ul]:list-none [&_ul]:space-y-2 [&_li]:pl-5 [&_li]:relative
                        [&_li]:before:content-[''] [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[0.6em] [&_li]:before:w-1.5 [&_li]:before:h-1.5 [&_li]:before:rotate-45 [&_li]:before:bg-[#B88A44]
                        [&_a]:text-[#B88A44] [&_a]:underline [&_a]:underline-offset-4 [&_strong]:text-[#1A1A1A]
                        [&_.todo]:bg-[#B88A44]/15 [&_.todo]:text-[#8a6326] [&_.todo]:px-1.5 [&_.todo]:font-semibold">
                        {children}
                    </div>
                </div>
            </section>
        </div>
    );
}
