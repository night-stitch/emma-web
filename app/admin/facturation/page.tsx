'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import {
    FileText, Plus, Trash2, Download, Percent, Mail, X,
    BookOpen, ExternalLink, Calculator, Folder, Check, Minus
} from 'lucide-react';
import Link from 'next/link';

type DocumentType = 'devis' | 'facture';

interface Prestation {
    id: string;
    desc?: string;
    duration?: number;
    category?: string;
}

interface Client {
    id: string;
    ownerName?: string;
    address?: string;
}

interface SelectedPrestation {
    id: string;
    quantity: number;
}

interface InvoicePrestation {
    id: string;
    desc: string;
    duration: number;
    quantity: number;
}

interface InvoiceCategory {
    name: string;
    duration: number;
    price: number;
    prestations: InvoicePrestation[];
}

interface Invoice {
    invoiceNumber: string;
    clientId: string;
    clientName: string;
    clientAddress: string;
    date: string;
    validUntil: string;
    tvaRate: number;
    categories: InvoiceCategory[];
}

export default function FacturationPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [prestations, setPrestations] = useState<Prestation[]>([]);
    const [hourlyRate, setHourlyRate] = useState(35);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedPrestations, setSelectedPrestations] = useState<SelectedPrestation[]>([]);
    const [documentType, setDocumentType] = useState<DocumentType>('facture');

    const [invoice, setInvoice] = useState<Invoice>({
        invoiceNumber: "2026-001",
        clientId: '',
        clientName: 'Nom du Client',
        clientAddress: 'Adresse du Client',
        date: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tvaRate: 20,
        categories: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const clientsSnap = await getDocs(collection(db, "clients"));
                setClients(clientsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Client)));

                const prestationsSnap = await getDocs(collection(db, "prestations"));
                const prestationsData = prestationsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Prestation));
                setPrestations(prestationsData);

                const uniqueCategories = [...new Set(prestationsData.map(p => p.category).filter((c): c is string => Boolean(c)))];
                setCategories(uniqueCategories);

                const rateDoc = await getDoc(doc(db, "settings", "hourlyRate"));
                if (rateDoc.exists()) {
                    const data = rateDoc.data();
                    setHourlyRate(data?.rate || 35);
                }
            } catch (error) {
                console.error("Erreur chargement:", error);
            }
        };
        fetchData();
    }, []);

    const openCategory = (category: string) => {
        setSelectedCategory(category);
        const existingCategory = invoice.categories.find(c => c.name === category);
        if (existingCategory) {
            setSelectedPrestations(existingCategory.prestations.map(p => ({ id: p.id, quantity: p.quantity })));
        } else {
            setSelectedPrestations([]);
        }
    };

    const closeCategory = () => {
        setSelectedCategory(null);
        setSelectedPrestations([]);
    };

    const getQuantity = (id: string): number => {
        const found = selectedPrestations.find(p => p.id === id);
        return found ? found.quantity : 0;
    };

    const updateQuantity = (id: string, quantity: number) => {
        let newSelectedPrestations: SelectedPrestation[];

        if (quantity <= 0) {
            newSelectedPrestations = selectedPrestations.filter(p => p.id !== id);
        } else {
            const existing = selectedPrestations.find(p => p.id === id);
            if (existing) {
                newSelectedPrestations = selectedPrestations.map(p => p.id === id ? { ...p, quantity } : p);
            } else {
                newSelectedPrestations = [...selectedPrestations, { id, quantity }];
            }
        }

        setSelectedPrestations(newSelectedPrestations);
    };

    const incrementQuantity = (id: string) => {
        updateQuantity(id, getQuantity(id) + 1);
    };

    const decrementQuantity = (id: string) => {
        const current = getQuantity(id);
        if (current > 0) {
            updateQuantity(id, current - 1);
        }
    };

    const saveCategoryToInvoice = () => {
        if (!selectedCategory || selectedPrestations.length === 0) {
            return;
        }

        const categoryPrestations: InvoicePrestation[] = selectedPrestations.map(sp => {
            const prestation = prestations.find(p => p.id === sp.id);
            return {
                id: sp.id,
                desc: prestation?.desc || '',
                duration: (prestation?.duration || 0) * sp.quantity,
                quantity: sp.quantity
            };
        });

        const totalDuration = categoryPrestations.reduce((acc, p) => acc + p.duration, 0);
        const totalPrice = (totalDuration / 60) * hourlyRate;

        const existingCategoryIndex = invoice.categories.findIndex(c => c.name === selectedCategory);

        const newCategory: InvoiceCategory = {
            name: selectedCategory,
            duration: totalDuration,
            price: totalPrice,
            prestations: categoryPrestations
        };

        if (existingCategoryIndex !== -1) {
            const newCategories = [...invoice.categories];
            newCategories[existingCategoryIndex] = newCategory;
            setInvoice({ ...invoice, categories: newCategories });
        } else {
            setInvoice({ ...invoice, categories: [...invoice.categories, newCategory] });
        }

        closeCategory();
    };

    const removeCategory = (index: number) => {
        const newCategories = invoice.categories.filter((_, i) => i !== index);
        setInvoice({ ...invoice, categories: newCategories });
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0 && mins > 0) return `${hours}h${mins}`;
        if (hours > 0) return `${hours}h`;
        return `${mins}min`;
    };

    const totalHT = invoice.categories.reduce((acc, cat) => acc + cat.price, 0);
    const totalTVA = (totalHT * invoice.tvaRate) / 100;
    const totalTTC = totalHT + totalTVA;

    const categoryPrestationsList = selectedCategory
        ? prestations.filter(p => p.category === selectedCategory)
        : [];

    const selectedTotal = selectedPrestations.reduce((acc, sp) => {
        const p = prestations.find(pr => pr.id === sp.id);
        return acc + ((p?.duration || 0) * sp.quantity);
    }, 0);

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            {/* Styles pour impression A4 */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #print-area, #print-area * {
                        visibility: visible;
                    }
                    #print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 210mm;
                        min-height: 297mm;
                        padding: 15mm;
                        background: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

            {/* VERSION ÉCRAN */}
            <div className="h-[91.5vh] w-full flex">

                {/* COLONNE GAUCHE - FORMULAIRE */}
                <div className="w-[280px] h-full overflow-y-auto p-5 border-r border-[#B88A44]/10 bg-[#F7F5F0] flex-shrink-0">
                    <div className="mb-6">
                        <span className="text-[#B88A44] text-[9px] uppercase tracking-[0.4em] font-bold block mb-1">
                            La Clé Provençale
                        </span>
                        <h1 className="text-[#1A1A1A] text-lg font-serif uppercase tracking-widest leading-tight">
                            Gestion <span className="text-[#B88A44]">Document</span>
                        </h1>
                    </div>

                    <div className="space-y-5">
                        {/* Type de Document */}
                        <div>
                            <label className="text-[9px] uppercase font-bold text-[#B88A44] mb-2 block tracking-widest">Type</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setDocumentType('devis')}
                                    className={`p-2 rounded-sm border-2 transition-all flex flex-col items-center gap-1 ${
                                        documentType === 'devis' ? 'border-[#B88A44] bg-[#B88A44]/10' : 'border-gray-200 hover:border-[#B88A44]/50 bg-white/50'
                                    }`}
                                >
                                    <Calculator size={18} className={documentType === 'devis' ? 'text-[#B88A44]' : 'text-gray-400'} />
                                    <span className={`text-[8px] uppercase font-bold tracking-widest ${documentType === 'devis' ? 'text-[#B88A44]' : 'text-gray-600'}`}>Devis</span>
                                </button>
                                <button
                                    onClick={() => setDocumentType('facture')}
                                    className={`p-2 rounded-sm border-2 transition-all flex flex-col items-center gap-1 ${
                                        documentType === 'facture' ? 'border-[#B88A44] bg-[#B88A44]/10' : 'border-gray-200 hover:border-[#B88A44]/50 bg-white/50'
                                    }`}
                                >
                                    <FileText size={18} className={documentType === 'facture' ? 'text-[#B88A44]' : 'text-gray-400'} />
                                    <span className={`text-[8px] uppercase font-bold tracking-widest ${documentType === 'facture' ? 'text-[#B88A44]' : 'text-gray-600'}`}>Facture</span>
                                </button>
                            </div>
                        </div>

                        <Link href="/catalogue">
                            <button className="w-full bg-gradient-to-r from-[#B88A44] to-[#A07A34] text-white py-3 text-[8px] uppercase font-bold tracking-[0.2em] flex items-center justify-center gap-2 hover:from-[#A07A34] hover:to-[#8F6A2A] transition-all rounded-sm shadow-lg">
                                <BookOpen size={14} /> Catalogue <ExternalLink size={10} />
                            </button>
                        </Link>

                        {/* Client et dates */}
                        <div className="space-y-3">
                            <div>
                                <label className="text-[9px] uppercase font-bold text-[#B88A44] mb-1 block tracking-widest">Destinataire</label>
                                <select
                                    className="w-full bg-white p-2 text-xs outline-none border border-[#B88A44]/20 focus:border-[#B88A44] transition-colors rounded-sm"
                                    value={invoice.clientId}
                                    onChange={(e) => {
                                        const c = clients.find(cl => cl.id === e.target.value);
                                        setInvoice({
                                            ...invoice,
                                            clientId: e.target.value,
                                            clientName: c?.ownerName || '',
                                            clientAddress: c?.address || ''
                                        });
                                    }}
                                >
                                    <option value="">Sélectionner...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.ownerName}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[9px] uppercase font-bold text-[#B88A44] block mb-1">
                                    {documentType === 'devis' ? "Date d'émission" : "Date"}
                                </label>
                                <input
                                    type="date"
                                    value={invoice.date}
                                    onChange={(e) => setInvoice({...invoice, date: e.target.value})}
                                    className="w-full bg-white p-2 text-xs outline-none border border-[#B88A44]/20 rounded-sm"
                                />
                            </div>
                            {documentType === 'devis' ? (
                                <div>
                                    <label className="text-[9px] uppercase font-bold text-[#B88A44] block mb-1">Valide jusqu&apos;au</label>
                                    <input
                                        type="date"
                                        value={invoice.validUntil}
                                        onChange={(e) => setInvoice({...invoice, validUntil: e.target.value})}
                                        className="w-full bg-white p-2 text-xs outline-none border border-[#B88A44]/20 rounded-sm"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="text-[9px] uppercase font-bold text-[#B88A44] block mb-1">TVA (%)</label>
                                    <input
                                        type="number"
                                        value={invoice.tvaRate}
                                        onChange={(e) => setInvoice({...invoice, tvaRate: parseFloat(e.target.value) || 0})}
                                        className="w-full bg-white p-2 text-xs outline-none border border-[#B88A44]/20 rounded-sm"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Prestations ajoutées */}
                        <div className="space-y-2">
                            <label className="text-[9px] uppercase font-bold text-[#B88A44] block tracking-widest">
                                Ajoutées ({invoice.categories.length})
                            </label>

                            {invoice.categories.length === 0 ? (
                                <div className="text-center py-4 text-gray-400 text-[10px] italic border-2 border-dashed border-gray-200 rounded-sm">
                                    Sélectionnez une catégorie →
                                </div>
                            ) : (
                                invoice.categories.map((cat, index) => (
                                    <div key={`cat-${index}`} className="bg-white p-2 rounded-sm border border-[#B88A44]/20">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-1">
                                                <Folder size={12} className="text-[#B88A44]" />
                                                <h3 className="text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A]">{cat.name}</h3>
                                            </div>
                                            <button
                                                onClick={() => removeCategory(index)}
                                                className="text-red-300 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 size={10}/>
                                            </button>
                                        </div>

                                        <div className="space-y-0.5 mb-1">
                                            {cat.prestations.map((p, i) => (
                                                <div key={`prest-${i}`} className="text-[8px] text-gray-500 flex items-center gap-1">
                                                    <span className="text-[#B88A44] font-bold">{p.quantity}×</span>
                                                    <span className="truncate">{p.desc}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between pt-1 border-t border-[#B88A44]/10">
                                            <span className="text-[9px] text-gray-500">{formatDuration(cat.duration)}</span>
                                            <span className="text-[10px] font-bold text-[#B88A44]">{cat.price.toFixed(2)} €</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-3">
                            <button
                                onClick={handlePrint}
                                className="bg-[#1A1A1A] text-white py-3 text-[8px] uppercase font-bold tracking-[0.2em] flex items-center justify-center gap-1 hover:bg-[#B88A44] transition-all rounded-sm"
                            >
                                <Download size={12} /> PDF
                            </button>
                            <button className="border border-[#1A1A1A] text-[#1A1A1A] py-3 text-[8px] uppercase font-bold tracking-[0.2em] flex items-center justify-center gap-1 hover:bg-gray-100 transition-all bg-white rounded-sm">
                                <Mail size={12} /> Envoyer
                            </button>
                        </div>
                    </div>
                </div>

                {/* COLONNE CATÉGORIES VERTICALES */}
                <div className="w-[90px] h-full flex flex-col bg-gradient-to-b from-[#1A1A1A] to-[#2A2A2A] py-4 flex-shrink-0">
                    <div className="px-2 mb-3">
                        <span className="text-[7px] uppercase tracking-[0.1em] text-[#B88A44] font-bold">Catégories</span>
                    </div>
                    <div className="flex-1 overflow-y-auto px-1.5 space-y-1.5">
                        {categories.map((category) => {
                            const categoryPrestationsCount = prestations.filter(p => p.category === category).length;
                            const isInInvoice = invoice.categories.some(c => c.name === category);
                            const isSelected = selectedCategory === category;
                            return (
                                <button
                                    key={category}
                                    onClick={() => isSelected ? closeCategory() : openCategory(category)}
                                    className={`w-full p-2 border rounded-sm transition-all text-left ${
                                        isSelected
                                            ? 'bg-[#B88A44] border-[#B88A44]'
                                            : isInInvoice
                                                ? 'bg-[#B88A44]/20 border-[#B88A44]/50'
                                                : 'bg-white/5 hover:bg-[#B88A44]/20 border-white/10 hover:border-[#B88A44]/50'
                                    }`}
                                >
                                    <div className="flex flex-col items-center gap-1">
                                        <Folder size={16} className={isSelected ? 'text-white' : 'text-[#B88A44]'} />
                                        <span className={`text-[7px] uppercase font-bold tracking-wider text-center leading-tight ${isSelected ? 'text-white' : 'text-white/80'}`}>{category}</span>
                                        <span className={`text-[7px] ${isSelected ? 'text-white/70' : 'text-[#B88A44]/70'}`}>{categoryPrestationsCount}</span>
                                        {isInInvoice && !isSelected && <Check size={10} className="text-[#B88A44]" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* PANNEAU PRESTATIONS */}
                {selectedCategory && (
                    <div className="w-[280px] h-full flex flex-col bg-white border-r border-[#B88A44]/20 flex-shrink-0">
                        <div className="bg-gradient-to-r from-[#B88A44] to-[#A07A34] p-3 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <Folder size={16} className="text-white" />
                                <h3 className="text-white text-xs font-bold uppercase tracking-widest">{selectedCategory}</h3>
                            </div>
                            <button onClick={closeCategory} className="text-white hover:bg-white/20 p-1 rounded-full transition-all">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {categoryPrestationsList.map((prestation) => {
                                const quantity = getQuantity(prestation.id);
                                const isSelected = quantity > 0;
                                return (
                                    <div
                                        key={prestation.id}
                                        className={`p-3 rounded-sm border-2 transition-all ${
                                            isSelected ? 'border-[#B88A44] bg-[#B88A44]/5' : 'border-gray-200 bg-gray-50'
                                        }`}
                                    >
                                        <div className="mb-2">
                                            <p className="text-sm font-serif text-[#1A1A1A]">{prestation.desc}</p>
                                            <p className="text-[9px] text-gray-500 mt-0.5">{formatDuration(prestation.duration || 30)} / unité</p>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => decrementQuantity(prestation.id)}
                                                    className={`w-7 h-7 rounded flex items-center justify-center transition-all ${
                                                        quantity > 0
                                                            ? 'bg-[#B88A44] text-white hover:bg-[#A07A34]'
                                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    }`}
                                                    disabled={quantity === 0}
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className={`w-8 text-center font-bold ${quantity > 0 ? 'text-[#B88A44]' : 'text-gray-400'}`}>
                                                    {quantity}
                                                </span>
                                                <button
                                                    onClick={() => incrementQuantity(prestation.id)}
                                                    className="w-7 h-7 rounded bg-[#B88A44] text-white flex items-center justify-center hover:bg-[#A07A34] transition-all"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            {quantity > 0 && (
                                                <span className="text-xs font-bold text-[#B88A44]">
                                                    {formatDuration((prestation.duration || 30) * quantity)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* BOUTON AJOUTER - TOUJOURS VISIBLE */}
                        <div className="p-3 border-t-2 border-[#B88A44] bg-[#F7F5F0] flex-shrink-0">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] text-gray-600 font-bold">
                                    {selectedPrestations.reduce((acc, p) => acc + p.quantity, 0)} prestation(s)
                                </span>
                                <span className="text-base font-bold text-[#B88A44]">
                                    {((selectedTotal / 60) * hourlyRate).toFixed(2)} €
                                </span>
                            </div>
                            <button
                                onClick={saveCategoryToInvoice}
                                disabled={selectedPrestations.length === 0}
                                className="w-full bg-[#B88A44] text-white py-4 text-[10px] uppercase font-bold tracking-widest hover:bg-[#A07A34] transition-all rounded-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                {invoice.categories.some(c => c.name === selectedCategory) ? '✓ METTRE À JOUR' : '+ AJOUTER À LA FACTURE'}
                            </button>
                        </div>
                    </div>
                )}

                {/* COLONNE DROITE - APERÇU ÉCRAN */}
                <div className="flex-1 h-full flex items-center justify-center p-6 overflow-auto bg-[#E8E6E0]/50">
                    <div id="print-area" className="bg-white shadow-2xl p-8 flex flex-col text-[#1A1A1A] w-full max-w-xl print:shadow-none print:max-w-none print:p-[15mm]">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-lg font-serif tracking-widest uppercase mb-1 print:text-2xl">La Clé <span className="text-[#B88A44]">Provençale</span></h2>
                                <p className="text-[7px] text-gray-400 uppercase tracking-[0.2em] print:text-[10px]">Services à la Personne de Luxe</p>
                            </div>
                            <div className="text-right">
                                <h3 className="text-base font-serif uppercase text-[#B88A44] tracking-widest print:text-xl">{documentType === 'devis' ? 'Devis' : 'Facture'}</h3>
                                <p className="text-[8px] font-bold print:text-[11px]">N° {invoice.invoiceNumber}</p>
                                <p className="text-[7px] text-gray-500 print:text-[10px]">{new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
                                {documentType === 'devis' && <p className="text-[7px] text-gray-500 mt-0.5 print:text-[10px]">Valide jusqu&apos;au {new Date(invoice.validUntil).toLocaleDateString('fr-FR')}</p>}
                            </div>
                        </div>

                        <div className="mb-5 border-l-2 border-[#B88A44] pl-3 py-1 bg-[#F7F5F0]/30 print:mb-10 print:pl-4 print:py-3">
                            <p className="text-[7px] uppercase tracking-widest text-[#B88A44] mb-0.5 font-bold print:text-[10px]">{documentType === 'devis' ? 'Devis pour :' : 'Facturé à :'}</p>
                            <p className="text-xs font-bold uppercase mb-0.5 print:text-base">{invoice.clientName}</p>
                            <p className="text-[9px] text-gray-600 italic leading-relaxed print:text-[12px]">{invoice.clientAddress}</p>
                        </div>

                        {invoice.categories.length === 0 ? (
                            <div className="text-center py-10 text-gray-300 italic print:py-20">
                                Aucune prestation ajoutée
                            </div>
                        ) : (
                            <table className="w-full mb-5 print:mb-10">
                                <thead className="border-b border-[#B88A44]/20 text-[7px] uppercase tracking-widest text-[#B88A44] font-bold print:text-[10px]" style={{ borderBottom: '2px solid #B88A44' }}>
                                <tr>
                                    <th className="text-left py-2 px-1 print:py-3">Catégorie</th>
                                    <th className="text-center py-2 px-1 print:py-3">Durée</th>
                                    <th className="text-right py-2 px-1 print:py-3">Prix HT</th>
                                </tr>
                                </thead>
                                <tbody className="text-[9px] print:text-[11px]">
                                {invoice.categories.map((cat, i) => (
                                    <tr key={i} className="border-b border-gray-100">
                                        <td className="py-2 px-1 print:py-4">
                                            <span className="font-serif font-medium print:text-[13px]">{cat.name}</span>
                                            <div className="text-[7px] text-gray-400 mt-0.5 print:text-[10px]">
                                                {cat.prestations.map((p) => `${p.quantity}× ${p.desc}`).join(', ')}
                                            </div>
                                        </td>
                                        <td className="py-2 px-1 text-center font-bold print:py-4">{formatDuration(cat.duration)}</td>
                                        <td className="py-2 px-1 text-right font-bold print:py-4">{cat.price.toFixed(2)} €</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}

                        <div className="ml-auto w-44 space-y-1 border-t-2 border-[#1A1A1A] pt-3 print:w-56 print:pt-4" style={{ borderTop: '3px solid #1A1A1A' }}>
                            <div className="flex justify-between text-[8px] uppercase tracking-widest print:text-[11px]"><span>Total HT</span><span className="font-bold">{totalHT.toFixed(2)} €</span></div>
                            {documentType === 'facture' && <div className="flex justify-between text-[8px] text-gray-400 print:text-[11px]"><span>TVA ({invoice.tvaRate}%)</span><span>{totalTVA.toFixed(2)} €</span></div>}
                            <div className="flex justify-between text-sm font-serif text-[#B88A44] border-t border-gray-100 pt-2 print:text-lg print:pt-3">
                                <span>TOTAL TTC</span><span className="font-bold">{(documentType === 'facture' ? totalTTC : totalHT).toFixed(2)} €</span>
                            </div>
                        </div>

                        <div className="mt-6 p-2 bg-[#B88A44]/5 border border-[#B88A44]/20 rounded-sm print:mt-12 print:p-4">
                            <p className="font-bold text-[#B88A44] uppercase text-[7px] mb-0.5 tracking-widest flex items-center gap-1 print:text-[10px]"><Percent size={9} className="print:hidden" />✦ Avantage Fiscal SAP</p>
                            <p className="text-[9px] font-serif italic text-[#1A1A1A] leading-relaxed print:text-[11px]">
                                Crédit d&apos;impôt 50%. Avantage : <span className="font-bold text-[#B88A44]">{((documentType === 'facture' ? totalTTC : totalHT)/2).toFixed(2)} €</span>
                            </p>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100 text-[6px] text-gray-400 uppercase tracking-tighter text-center print:text-[9px] print:mt-auto print:pt-6">
                            La Clé Provençale — SIRET : [VOTRE SIRET] — {documentType === 'facture' && `TVA : ${invoice.tvaRate}% —`} Paiement à réception.
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}