'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import {
    FileText, Plus, Trash2, Download, Percent, Mail, X,
    BookOpen, Calculator, Folder, Check, Minus,
    Package, Wine, Sparkles, ShoppingBag, Tag, User, Building2,
    Euro, Edit2, Save
} from 'lucide-react';
import Link from 'next/link';

type DocumentType = 'devis' | 'facture';
type TabType = 'prestations' | 'produits';
type ClientType = 'particulier' | 'entreprise';

interface Prestation {
    id: string;
    desc?: string;
    duration?: number;
    category?: string;
}

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    unit: string;
}

interface ProductCategory {
    id: string;
    name: string;
    icon: string;
}

interface PrestationCategory {
    id: string;
    name: string;
    icon: string;
}

interface Client {
    id: string;
    ownerName?: string;
    address?: string;
    email?: string;
    siret?: string;
    type?: ClientType;
}

interface SelectedPrestation {
    id: string;
    quantity: number;
}

interface SelectedProduct {
    id: string;
    quantity: number;
}

interface InvoicePrestation {
    id: string;
    desc: string;
    duration: number;
    quantity: number;
}

interface InvoiceProduct {
    id: string;
    name: string;
    price: number;
    quantity: number;
    unit: string;
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
    clientSiret: string;
    clientType: ClientType;
    date: string;
    validUntil: string;
    dueDate: string;
    tvaRate: number;
    tvaRateProduits: number;
    hourlyRate: number;
    categories: InvoiceCategory[];
    products: InvoiceProduct[];
    paymentMethod: string;
    notes: string;
}

// TVA en France
const TVA_RATES = {
    particulier: {
        prestations: 10, // Services à la personne - taux réduit
        produits: 20     // Taux normal
    },
    entreprise: {
        prestations: 20, // Taux normal
        produits: 20     // Taux normal
    }
};

const ICON_MAP: { [key: string]: React.ComponentType<{ size?: number; className?: string }> } = {
    'sparkles': Sparkles,
    'wine': Wine,
    'shopping-bag': ShoppingBag,
    'package': Package,
    'folder': Folder,
    'tag': Tag,
    'leaf': Folder,
    'home': Folder,
    'key': Folder,
    'scissors': Folder,
};

const getIconComponent = (iconId: string) => {
    return ICON_MAP[iconId] || Folder;
};

export default function FacturationPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [prestations, setPrestations] = useState<Prestation[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
    const [prestationCategories, setPrestationCategories] = useState<PrestationCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedProductCategory, setSelectedProductCategory] = useState<string | null>(null);
    const [selectedPrestations, setSelectedPrestations] = useState<SelectedPrestation[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
    const [documentType, setDocumentType] = useState<DocumentType>('facture');
    const [activeTab, setActiveTab] = useState<TabType>('prestations');
    const [isEditingRate, setIsEditingRate] = useState(false);
    const [tempRate, setTempRate] = useState(35);

    const [invoice, setInvoice] = useState<Invoice>({
        invoiceNumber: `${new Date().getFullYear()}-001`,
        clientId: '',
        clientName: '',
        clientAddress: '',
        clientSiret: '',
        clientType: 'particulier',
        date: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tvaRate: TVA_RATES.particulier.prestations,
        tvaRateProduits: TVA_RATES.particulier.produits,
        hourlyRate: 35,
        categories: [],
        products: [],
        paymentMethod: 'virement',
        notes: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const clientsSnap = await getDocs(collection(db, "clients"));
                setClients(clientsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Client)));

                const prestationsSnap = await getDocs(collection(db, "prestations"));
                const prestationsData = prestationsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Prestation));
                setPrestations(prestationsData);

                const productsSnap = await getDocs(collection(db, "products"));
                const productsData = productsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
                setProducts(productsData);

                const productCategoriesSnap = await getDocs(collection(db, "productCategories"));
                setProductCategories(productCategoriesSnap.docs.map(d => ({ id: d.id, ...d.data() } as ProductCategory)));

                const prestationCategoriesSnap = await getDocs(collection(db, "prestationCategories"));
                setPrestationCategories(prestationCategoriesSnap.docs.map(d => ({ id: d.id, ...d.data() } as PrestationCategory)));

                const rateDoc = await getDoc(doc(db, "settings", "hourlyRate"));
                if (rateDoc.exists()) {
                    const rate = rateDoc.data().rate || 35;
                    setInvoice(prev => ({ ...prev, hourlyRate: rate }));
                    setTempRate(rate);
                }
            } catch (error) {
                console.error("Erreur chargement:", error);
            }
        };
        fetchData();
    }, []);

    // Mettre à jour les taux TVA quand le type de client change
    const handleClientTypeChange = (type: ClientType) => {
        setInvoice(prev => ({
            ...prev,
            clientType: type,
            tvaRate: TVA_RATES[type].prestations,
            tvaRateProduits: TVA_RATES[type].produits
        }));
    };

    // Mettre à jour le taux horaire
    const saveHourlyRate = () => {
        setInvoice(prev => ({ ...prev, hourlyRate: tempRate }));
        setIsEditingRate(false);
        // Recalculer les prix des catégories
        recalculateCategoryPrices(tempRate);
    };

    const recalculateCategoryPrices = (newRate: number) => {
        const updatedCategories = invoice.categories.map(cat => ({
            ...cat,
            price: (cat.duration / 60) * newRate
        }));
        setInvoice(prev => ({ ...prev, categories: updatedCategories }));
    };

    // PRESTATIONS
    const openCategory = (categoryId: string) => {
        setSelectedCategory(categoryId);
        setSelectedProductCategory(null);
        const categoryData = prestationCategories.find(c => c.id === categoryId);
        const existingCategory = invoice.categories.find(c => c.name === categoryData?.name);
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

    const getPrestationQuantity = (id: string): number => {
        const found = selectedPrestations.find(p => p.id === id);
        return found ? found.quantity : 0;
    };

    const updatePrestationQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) {
            setSelectedPrestations(prev => prev.filter(p => p.id !== id));
        } else {
            setSelectedPrestations(prev => {
                const existing = prev.find(p => p.id === id);
                if (existing) {
                    return prev.map(p => p.id === id ? { ...p, quantity } : p);
                } else {
                    return [...prev, { id, quantity }];
                }
            });
        }
    };

    const saveCategoryToInvoice = () => {
        if (!selectedCategory || selectedPrestations.length === 0) return;

        const categoryData = prestationCategories.find(c => c.id === selectedCategory);
        if (!categoryData) return;

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
        const totalPrice = (totalDuration / 60) * invoice.hourlyRate;

        const existingCategoryIndex = invoice.categories.findIndex(c => c.name === categoryData.name);

        const newCategory: InvoiceCategory = {
            name: categoryData.name,
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
        setInvoice({ ...invoice, categories: invoice.categories.filter((_, i) => i !== index) });
    };

    // PRODUITS
    const openProductCategory = (category: string) => {
        setSelectedProductCategory(category);
        setSelectedCategory(null);
        setSelectedProducts([]);
    };

    const closeProductCategory = () => {
        setSelectedProductCategory(null);
        setSelectedProducts([]);
    };

    const getProductQuantity = (id: string): number => {
        const found = selectedProducts.find(p => p.id === id);
        return found ? found.quantity : 0;
    };

    const updateProductQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) {
            setSelectedProducts(prev => prev.filter(p => p.id !== id));
        } else {
            setSelectedProducts(prev => {
                const existing = prev.find(p => p.id === id);
                if (existing) {
                    return prev.map(p => p.id === id ? { ...p, quantity } : p);
                } else {
                    return [...prev, { id, quantity }];
                }
            });
        }
    };

    const addProductsToInvoice = () => {
        if (selectedProducts.length === 0) return;

        const newProducts: InvoiceProduct[] = selectedProducts.map(sp => {
            const product = products.find(p => p.id === sp.id);
            return {
                id: sp.id,
                name: product?.name || '',
                price: (product?.price || 0) * sp.quantity,
                quantity: sp.quantity,
                unit: product?.unit || 'unité'
            };
        });

        const existingProductIds = invoice.products.map(p => p.id);
        const updatedProducts = [...invoice.products];

        newProducts.forEach(newProd => {
            const existingIndex = existingProductIds.indexOf(newProd.id);
            if (existingIndex !== -1) {
                updatedProducts[existingIndex] = newProd;
            } else {
                updatedProducts.push(newProd);
            }
        });

        setInvoice({ ...invoice, products: updatedProducts });
        closeProductCategory();
    };

    const removeProduct = (index: number) => {
        setInvoice({ ...invoice, products: invoice.products.filter((_, i) => i !== index) });
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0 && mins > 0) return `${hours}h${mins}`;
        if (hours > 0) return `${hours}h`;
        return `${mins}min`;
    };

    // Calculs
    const totalPrestationsHT = invoice.categories.reduce((acc, cat) => acc + cat.price, 0);
    const totalProductsHT = invoice.products.reduce((acc, p) => acc + p.price, 0);
    const totalHT = totalPrestationsHT + totalProductsHT;

    const tvaPrestations = (totalPrestationsHT * invoice.tvaRate) / 100;
    const tvaProduits = (totalProductsHT * invoice.tvaRateProduits) / 100;
    const totalTVA = tvaPrestations + tvaProduits;
    const totalTTC = totalHT + totalTVA;

    const categoryPrestationsList = selectedCategory
        ? prestations.filter(p => p.category === selectedCategory)
        : [];

    const categoryProductsList = selectedProductCategory
        ? products.filter(p => p.category === selectedProductCategory)
        : [];

    const selectedPrestationsTotal = selectedPrestations.reduce((acc, sp) => {
        const p = prestations.find(pr => pr.id === sp.id);
        return acc + ((p?.duration || 0) * sp.quantity);
    }, 0);

    const selectedProductsTotal = selectedProducts.reduce((acc, sp) => {
        const p = products.find(pr => pr.id === sp.id);
        return acc + ((p?.price || 0) * sp.quantity);
    }, 0);

    const handlePrint = () => {
        window.print();
    };

    const selectedProductCategoryData = productCategories.find(c => c.id === selectedProductCategory);

    return (
        <>
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

            <div className="h-[91.5vh] w-full flex">

                {/* COLONNE GAUCHE - FORMULAIRE */}
                <div className="w-[300px] h-full overflow-y-auto p-4 border-r border-[#B88A44]/10 bg-[#F7F5F0] flex-shrink-0">
                    <div className="mb-4">
                        <span className="text-[#B88A44] text-[9px] uppercase tracking-[0.4em] font-bold block mb-1">
                            La Clé Provençale
                        </span>
                        <h1 className="text-[#1A1A1A] text-lg font-serif uppercase tracking-widest leading-tight">
                            Gestion <span className="text-[#B88A44]">Document</span>
                        </h1>
                    </div>

                    <div className="space-y-4">
                        {/* Type de Document */}
                        <div>
                            <label className="text-[9px] uppercase font-bold text-[#B88A44] mb-2 block tracking-widest">Type de document</label>
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

                        {/* Type de Client */}
                        <div>
                            <label className="text-[9px] uppercase font-bold text-[#B88A44] mb-2 block tracking-widest">Type de client</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => handleClientTypeChange('particulier')}
                                    className={`p-2 rounded-sm border-2 transition-all flex flex-col items-center gap-1 ${
                                        invoice.clientType === 'particulier' ? 'border-[#B88A44] bg-[#B88A44]/10' : 'border-gray-200 hover:border-[#B88A44]/50 bg-white/50'
                                    }`}
                                >
                                    <User size={18} className={invoice.clientType === 'particulier' ? 'text-[#B88A44]' : 'text-gray-400'} />
                                    <span className={`text-[8px] uppercase font-bold tracking-widest ${invoice.clientType === 'particulier' ? 'text-[#B88A44]' : 'text-gray-600'}`}>Particulier</span>
                                    <span className={`text-[7px] ${invoice.clientType === 'particulier' ? 'text-[#B88A44]/70' : 'text-gray-400'}`}>TVA 10%</span>
                                </button>
                                <button
                                    onClick={() => handleClientTypeChange('entreprise')}
                                    className={`p-2 rounded-sm border-2 transition-all flex flex-col items-center gap-1 ${
                                        invoice.clientType === 'entreprise' ? 'border-[#B88A44] bg-[#B88A44]/10' : 'border-gray-200 hover:border-[#B88A44]/50 bg-white/50'
                                    }`}
                                >
                                    <Building2 size={18} className={invoice.clientType === 'entreprise' ? 'text-[#B88A44]' : 'text-gray-400'} />
                                    <span className={`text-[8px] uppercase font-bold tracking-widest ${invoice.clientType === 'entreprise' ? 'text-[#B88A44]' : 'text-gray-600'}`}>Entreprise</span>
                                    <span className={`text-[7px] ${invoice.clientType === 'entreprise' ? 'text-[#B88A44]/70' : 'text-gray-400'}`}>TVA 20%</span>
                                </button>
                            </div>
                        </div>

                        {/* Taux horaire modifiable */}
                        <div className="bg-white p-3 rounded-sm border border-[#B88A44]/20">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[9px] uppercase font-bold text-[#B88A44] tracking-widest">Taux horaire</label>
                                {!isEditingRate && (
                                    <button
                                        onClick={() => { setIsEditingRate(true); setTempRate(invoice.hourlyRate); }}
                                        className="text-gray-400 hover:text-[#B88A44] transition-colors"
                                    >
                                        <Edit2 size={12} />
                                    </button>
                                )}
                            </div>
                            {isEditingRate ? (
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="number"
                                            step="0.5"
                                            value={tempRate}
                                            onChange={(e) => setTempRate(parseFloat(e.target.value) || 0)}
                                            className="w-full p-2 text-lg font-bold border border-[#B88A44] rounded-sm outline-none pr-8"
                                            autoFocus
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">€/h</span>
                                    </div>
                                    <button
                                        onClick={saveHourlyRate}
                                        className="p-2 bg-green-500 text-white rounded-sm hover:bg-green-600 transition-all"
                                    >
                                        <Save size={16} />
                                    </button>
                                    <button
                                        onClick={() => setIsEditingRate(false)}
                                        className="p-2 bg-gray-200 text-gray-600 rounded-sm hover:bg-gray-300 transition-all"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Euro size={20} className="text-[#B88A44]" />
                                    <span className="text-2xl font-bold text-[#1A1A1A]">{invoice.hourlyRate.toFixed(2)} €/h</span>
                                </div>
                            )}
                        </div>

                        {/* Liens Catalogues */}
                        <div className="grid grid-cols-2 gap-2">
                            <Link href="/admin/facturation/catalogue">
                                <button className="w-full bg-gradient-to-r from-[#B88A44] to-[#A07A34] text-white py-2 text-[7px] uppercase font-bold tracking-[0.1em] flex items-center justify-center gap-1 hover:from-[#A07A34] hover:to-[#8F6A2A] transition-all rounded-sm shadow-lg">
                                    <BookOpen size={12} /> Prestations
                                </button>
                            </Link>
                            <Link href="/admin/facturation/catalogue-produits">
                                <button className="w-full bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] text-white py-2 text-[7px] uppercase font-bold tracking-[0.1em] flex items-center justify-center gap-1 hover:from-[#2A2A2A] hover:to-[#3A3A3A] transition-all rounded-sm shadow-lg">
                                    <Package size={12} /> Produits
                                </button>
                            </Link>
                        </div>

                        {/* Client et dates */}
                        <div className="space-y-3">
                            <div>
                                <label className="text-[9px] uppercase font-bold text-[#B88A44] mb-1 block tracking-widest">Client</label>
                                <select
                                    className="w-full bg-white p-2 text-xs outline-none border border-[#B88A44]/20 focus:border-[#B88A44] transition-colors rounded-sm"
                                    value={invoice.clientId}
                                    onChange={(e) => {
                                        const c = clients.find(cl => cl.id === e.target.value);
                                        setInvoice({
                                            ...invoice,
                                            clientId: e.target.value,
                                            clientName: c?.ownerName || '',
                                            clientAddress: c?.address || '',
                                            clientSiret: c?.siret || ''
                                        });
                                    }}
                                >
                                    <option value="">Sélectionner un client...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.ownerName}</option>)}
                                </select>
                            </div>

                            {/* Numéro de facture/devis */}
                            <div>
                                <label className="text-[9px] uppercase font-bold text-[#B88A44] mb-1 block tracking-widest">
                                    N° {documentType === 'devis' ? 'Devis' : 'Facture'}
                                </label>
                                <input
                                    type="text"
                                    value={invoice.invoiceNumber}
                                    onChange={(e) => setInvoice({...invoice, invoiceNumber: e.target.value})}
                                    className="w-full bg-white p-2 text-xs outline-none border border-[#B88A44]/20 rounded-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[9px] uppercase font-bold text-[#B88A44] block mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={invoice.date}
                                        onChange={(e) => setInvoice({...invoice, date: e.target.value})}
                                        className="w-full bg-white p-2 text-xs outline-none border border-[#B88A44]/20 rounded-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] uppercase font-bold text-[#B88A44] block mb-1">
                                        {documentType === 'devis' ? 'Validité' : 'Échéance'}
                                    </label>
                                    <input
                                        type="date"
                                        value={documentType === 'devis' ? invoice.validUntil : invoice.dueDate}
                                        onChange={(e) => setInvoice({
                                            ...invoice,
                                            [documentType === 'devis' ? 'validUntil' : 'dueDate']: e.target.value
                                        })}
                                        className="w-full bg-white p-2 text-xs outline-none border border-[#B88A44]/20 rounded-sm"
                                    />
                                </div>
                            </div>

                            {/* TVA personnalisable */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[9px] uppercase font-bold text-[#B88A44] block mb-1">TVA Prestations</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={invoice.tvaRate}
                                            onChange={(e) => setInvoice({...invoice, tvaRate: parseFloat(e.target.value) || 0})}
                                            className="w-full bg-white p-2 text-xs outline-none border border-[#B88A44]/20 rounded-sm pr-6"
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[9px] uppercase font-bold text-[#B88A44] block mb-1">TVA Produits</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={invoice.tvaRateProduits}
                                            onChange={(e) => setInvoice({...invoice, tvaRateProduits: parseFloat(e.target.value) || 0})}
                                            className="w-full bg-white p-2 text-xs outline-none border border-[#B88A44]/20 rounded-sm pr-6"
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Prestations ajoutées */}
                        {invoice.categories.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-[9px] uppercase font-bold text-[#B88A44] block tracking-widest">
                                    Prestations ({invoice.categories.length})
                                </label>
                                {invoice.categories.map((cat, index) => (
                                    <div key={`cat-${index}`} className="bg-white p-2 rounded-sm border border-[#B88A44]/20">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-1">
                                                <Folder size={12} className="text-[#B88A44]" />
                                                <h3 className="text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A]">{cat.name}</h3>
                                            </div>
                                            <button onClick={() => removeCategory(index)} className="text-red-300 hover:text-red-600 transition-colors">
                                                <Trash2 size={10}/>
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between pt-1 border-t border-[#B88A44]/10">
                                            <span className="text-[9px] text-gray-500">{formatDuration(cat.duration)}</span>
                                            <span className="text-[10px] font-bold text-[#B88A44]">{cat.price.toFixed(2)} € HT</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Produits ajoutés */}
                        {invoice.products.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-[9px] uppercase font-bold text-[#B88A44] block tracking-widest">
                                    Produits ({invoice.products.length})
                                </label>
                                {invoice.products.map((prod, index) => (
                                    <div key={`prod-${index}`} className="bg-white p-2 rounded-sm border border-[#1A1A1A]/20">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-1">
                                                <Package size={12} className="text-[#1A1A1A]" />
                                                <h3 className="text-[9px] font-bold text-[#1A1A1A]">{prod.quantity}× {prod.name}</h3>
                                            </div>
                                            <button onClick={() => removeProduct(index)} className="text-red-300 hover:text-red-600 transition-colors">
                                                <Trash2 size={10}/>
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                                            <span className="text-[9px] text-gray-500">{prod.unit}</span>
                                            <span className="text-[10px] font-bold text-[#1A1A1A]">{prod.price.toFixed(2)} € HT</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {invoice.categories.length === 0 && invoice.products.length === 0 && (
                            <div className="text-center py-4 text-gray-400 text-[10px] italic border-2 border-dashed border-gray-200 rounded-sm">
                                Sélectionnez une catégorie →
                            </div>
                        )}

                        {/* Résumé TVA */}
                        {(invoice.categories.length > 0 || invoice.products.length > 0) && (
                            <div className="bg-white p-3 rounded-sm border border-[#B88A44]/20 space-y-1">
                                <div className="flex justify-between text-[9px]">
                                    <span className="text-gray-500">Total HT</span>
                                    <span className="font-bold">{totalHT.toFixed(2)} €</span>
                                </div>
                                {totalPrestationsHT > 0 && (
                                    <div className="flex justify-between text-[9px]">
                                        <span className="text-gray-400">TVA Prestations ({invoice.tvaRate}%)</span>
                                        <span>{tvaPrestations.toFixed(2)} €</span>
                                    </div>
                                )}
                                {totalProductsHT > 0 && (
                                    <div className="flex justify-between text-[9px]">
                                        <span className="text-gray-400">TVA Produits ({invoice.tvaRateProduits}%)</span>
                                        <span>{tvaProduits.toFixed(2)} €</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm font-bold text-[#B88A44] pt-2 border-t border-[#B88A44]/20">
                                    <span>Total TTC</span>
                                    <span>{totalTTC.toFixed(2)} €</span>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 pt-2">
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

                {/* COLONNE CATÉGORIES - TABS */}
                <div className="w-[100px] h-full flex flex-col bg-gradient-to-b from-[#1A1A1A] to-[#2A2A2A] flex-shrink-0">
                    {/* Tabs */}
                    <div className="flex border-b border-white/10">
                        <button
                            onClick={() => { setActiveTab('prestations'); closeProductCategory(); }}
                            className={`flex-1 py-3 text-[7px] uppercase font-bold tracking-wider transition-all ${
                                activeTab === 'prestations' ? 'bg-[#B88A44] text-white' : 'text-white/60 hover:text-white'
                            }`}
                        >
                            Services
                        </button>
                        <button
                            onClick={() => { setActiveTab('produits'); closeCategory(); }}
                            className={`flex-1 py-3 text-[7px] uppercase font-bold tracking-wider transition-all ${
                                activeTab === 'produits' ? 'bg-[#B88A44] text-white' : 'text-white/60 hover:text-white'
                            }`}
                        >
                            Produits
                        </button>
                    </div>

                    {/* Liste Catégories */}
                    <div className="flex-1 overflow-y-auto px-1.5 py-2 space-y-1.5">
                        {activeTab === 'prestations' ? (
                            prestationCategories.map((cat) => {
                                const Icon = getIconComponent(cat.icon);
                                const count = prestations.filter(p => p.category === cat.id).length;
                                const isInInvoice = invoice.categories.some(c => c.name === cat.name);
                                const isSelected = selectedCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => isSelected ? closeCategory() : openCategory(cat.id)}
                                        className={`w-full p-2 border rounded-sm transition-all text-left ${
                                            isSelected
                                                ? 'bg-[#B88A44] border-[#B88A44]'
                                                : isInInvoice
                                                    ? 'bg-[#B88A44]/20 border-[#B88A44]/50'
                                                    : 'bg-white/5 hover:bg-[#B88A44]/20 border-white/10 hover:border-[#B88A44]/50'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center gap-1">
                                            <Icon size={16} className={isSelected ? 'text-white' : 'text-[#B88A44]'} />
                                            <span className={`text-[7px] uppercase font-bold tracking-wider text-center leading-tight ${isSelected ? 'text-white' : 'text-white/80'}`}>{cat.name}</span>
                                            <span className={`text-[7px] ${isSelected ? 'text-white/70' : 'text-[#B88A44]/70'}`}>{count}</span>
                                            {isInInvoice && !isSelected && <Check size={10} className="text-[#B88A44]" />}
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            productCategories.map((cat) => {
                                const Icon = getIconComponent(cat.icon);
                                const count = products.filter(p => p.category === cat.id).length;
                                const isSelected = selectedProductCategory === cat.id;
                                const hasProducts = invoice.products.some(p => {
                                    const prod = products.find(pr => pr.id === p.id);
                                    return prod?.category === cat.id;
                                });
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => isSelected ? closeProductCategory() : openProductCategory(cat.id)}
                                        className={`w-full p-2 border rounded-sm transition-all text-left ${
                                            isSelected
                                                ? 'bg-[#B88A44] border-[#B88A44]'
                                                : hasProducts
                                                    ? 'bg-[#B88A44]/20 border-[#B88A44]/50'
                                                    : 'bg-white/5 hover:bg-[#B88A44]/20 border-white/10 hover:border-[#B88A44]/50'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center gap-1">
                                            <Icon size={16} className={isSelected ? 'text-white' : 'text-[#B88A44]'} />
                                            <span className={`text-[7px] uppercase font-bold tracking-wider text-center leading-tight ${isSelected ? 'text-white' : 'text-white/80'}`}>{cat.name}</span>
                                            <span className={`text-[7px] ${isSelected ? 'text-white/70' : 'text-[#B88A44]/70'}`}>{count}</span>
                                            {hasProducts && !isSelected && <Check size={10} className="text-[#B88A44]" />}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* PANNEAU PRESTATIONS */}
                {selectedCategory && (
                    <div className="w-[260px] h-full flex flex-col bg-white border-r border-[#B88A44]/20 flex-shrink-0">
                        <div className="bg-gradient-to-r from-[#B88A44] to-[#A07A34] p-3 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-2">
                                {(() => {
                                    const catData = prestationCategories.find(c => c.id === selectedCategory);
                                    const Icon = catData ? getIconComponent(catData.icon) : Folder;
                                    return <Icon size={16} className="text-white" />;
                                })()}
                                <h3 className="text-white text-xs font-bold uppercase tracking-widest">
                                    {prestationCategories.find(c => c.id === selectedCategory)?.name || 'Prestations'}
                                </h3>
                            </div>
                            <button onClick={closeCategory} className="text-white hover:bg-white/20 p-1 rounded-full transition-all">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {categoryPrestationsList.map((prestation) => {
                                const quantity = getPrestationQuantity(prestation.id);
                                const isSelected = quantity > 0;
                                return (
                                    <div key={prestation.id} className={`p-3 rounded-sm border-2 transition-all ${isSelected ? 'border-[#B88A44] bg-[#B88A44]/5' : 'border-gray-200 bg-gray-50'}`}>
                                        <div className="mb-2">
                                            <p className="text-sm font-serif text-[#1A1A1A]">{prestation.desc}</p>
                                            <p className="text-[9px] text-gray-500 mt-0.5">{formatDuration(prestation.duration || 30)} / unité</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updatePrestationQuantity(prestation.id, quantity - 1)}
                                                    className={`w-7 h-7 rounded flex items-center justify-center transition-all ${quantity > 0 ? 'bg-[#B88A44] text-white hover:bg-[#A07A34]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                                    disabled={quantity === 0}
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className={`w-8 text-center font-bold ${quantity > 0 ? 'text-[#B88A44]' : 'text-gray-400'}`}>{quantity}</span>
                                                <button
                                                    onClick={() => updatePrestationQuantity(prestation.id, quantity + 1)}
                                                    className="w-7 h-7 rounded bg-[#B88A44] text-white flex items-center justify-center hover:bg-[#A07A34] transition-all"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            {quantity > 0 && <span className="text-xs font-bold text-[#B88A44]">{formatDuration((prestation.duration || 30) * quantity)}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-3 border-t-2 border-[#B88A44] bg-[#F7F5F0] flex-shrink-0">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] text-gray-600 font-bold">{selectedPrestations.reduce((acc, p) => acc + p.quantity, 0)} prestation(s)</span>
                                <span className="text-base font-bold text-[#B88A44]">{((selectedPrestationsTotal / 60) * invoice.hourlyRate).toFixed(2)} € HT</span>
                            </div>
                            <button
                                onClick={saveCategoryToInvoice}
                                disabled={selectedPrestations.length === 0}
                                className="w-full bg-[#B88A44] text-white py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-[#A07A34] transition-all rounded-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                {invoice.categories.some(c => c.name === prestationCategories.find(cat => cat.id === selectedCategory)?.name) ? '✓ METTRE À JOUR' : '+ AJOUTER'}
                            </button>
                        </div>
                    </div>
                )}

                {/* PANNEAU PRODUITS */}
                {selectedProductCategory && (
                    <div className="w-[260px] h-full flex flex-col bg-white border-r border-[#1A1A1A]/20 flex-shrink-0">
                        <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] p-3 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-2">
                                {selectedProductCategoryData && (() => {
                                    const Icon = getIconComponent(selectedProductCategoryData.icon);
                                    return <Icon size={16} className="text-white" />;
                                })()}
                                <h3 className="text-white text-xs font-bold uppercase tracking-widest">
                                    {selectedProductCategoryData?.name || 'Produits'}
                                </h3>
                            </div>
                            <button onClick={closeProductCategory} className="text-white hover:bg-white/20 p-1 rounded-full transition-all">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {categoryProductsList.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 italic text-sm">
                                    Aucun produit
                                </div>
                            ) : (
                                categoryProductsList.map((product) => {
                                    const quantity = getProductQuantity(product.id);
                                    const isSelected = quantity > 0;
                                    return (
                                        <div key={product.id} className={`p-3 rounded-sm border-2 transition-all ${isSelected ? 'border-[#1A1A1A] bg-gray-50' : 'border-gray-200 bg-gray-50'}`}>
                                            <div className="mb-2">
                                                <p className="text-sm font-serif text-[#1A1A1A]">{product.name}</p>
                                                <p className="text-[9px] text-gray-500 mt-0.5">{product.price.toFixed(2)} € HT / {product.unit}</p>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateProductQuantity(product.id, quantity - 1)}
                                                        className={`w-7 h-7 rounded flex items-center justify-center transition-all ${quantity > 0 ? 'bg-[#1A1A1A] text-white hover:bg-[#2A2A2A]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                                        disabled={quantity === 0}
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className={`w-8 text-center font-bold ${quantity > 0 ? 'text-[#1A1A1A]' : 'text-gray-400'}`}>{quantity}</span>
                                                    <button
                                                        onClick={() => updateProductQuantity(product.id, quantity + 1)}
                                                        className="w-7 h-7 rounded bg-[#1A1A1A] text-white flex items-center justify-center hover:bg-[#2A2A2A] transition-all"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                {quantity > 0 && <span className="text-xs font-bold text-[#1A1A1A]">{(product.price * quantity).toFixed(2)} € HT</span>}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="p-3 border-t-2 border-[#1A1A1A] bg-gray-100 flex-shrink-0">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] text-gray-600 font-bold">{selectedProducts.reduce((acc, p) => acc + p.quantity, 0)} produit(s)</span>
                                <span className="text-base font-bold text-[#1A1A1A]">{selectedProductsTotal.toFixed(2)} € HT</span>
                            </div>
                            <button
                                onClick={addProductsToInvoice}
                                disabled={selectedProducts.length === 0}
                                className="w-full bg-[#1A1A1A] text-white py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-[#2A2A2A] transition-all rounded-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                + AJOUTER PRODUITS
                            </button>
                        </div>
                    </div>
                )}

                {/* COLONNE DROITE - APERÇU */}
                <div className="flex-1 h-full flex items-center justify-center p-4 overflow-auto bg-[#E8E6E0]/50">
                    <div id="print-area" className="bg-white shadow-2xl p-6 flex flex-col text-[#1A1A1A] w-full max-w-xl print:shadow-none print:max-w-none print:p-[15mm]">
                        {/* En-tête */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-lg font-serif tracking-widest uppercase mb-1 print:text-2xl">La Clé <span className="text-[#B88A44]">Provençale</span></h2>
                                <p className="text-[7px] text-gray-400 uppercase tracking-[0.2em] print:text-[10px]">Services à la Personne</p>
                                <div className="mt-2 text-[8px] text-gray-500 print:text-[10px]">
                                    <p>123 Avenue de Provence</p>
                                    <p>13100 Aix-en-Provence</p>
                                    <p>SIRET : XXX XXX XXX XXXXX</p>
                                    <p>N° TVA : FR XX XXXXXXXXX</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h3 className="text-base font-serif uppercase text-[#B88A44] tracking-widest print:text-xl">{documentType === 'devis' ? 'Devis' : 'Facture'}</h3>
                                <p className="text-[9px] font-bold print:text-[11px]">N° {invoice.invoiceNumber}</p>
                                <p className="text-[8px] text-gray-500 print:text-[10px]">Date : {new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
                                {documentType === 'devis' ? (
                                    <p className="text-[8px] text-gray-500 print:text-[10px]">Valide jusqu&apos;au : {new Date(invoice.validUntil).toLocaleDateString('fr-FR')}</p>
                                ) : (
                                    <p className="text-[8px] text-gray-500 print:text-[10px]">Échéance : {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</p>
                                )}
                            </div>
                        </div>

                        {/* Informations client */}
                        <div className="mb-5 border-l-2 border-[#B88A44] pl-3 py-2 bg-[#F7F5F0]/30 print:mb-8 print:pl-4 print:py-3">
                            <p className="text-[7px] uppercase tracking-widest text-[#B88A44] mb-1 font-bold print:text-[10px]">
                                {documentType === 'devis' ? 'Devis pour' : 'Facturé à'} :
                            </p>
                            <p className="text-xs font-bold uppercase mb-0.5 print:text-base">{invoice.clientName || 'Nom du client'}</p>
                            <p className="text-[9px] text-gray-600 leading-relaxed print:text-[11px]">{invoice.clientAddress || 'Adresse du client'}</p>
                            {invoice.clientType === 'entreprise' && invoice.clientSiret && (
                                <p className="text-[8px] text-gray-500 mt-1 print:text-[10px]">SIRET : {invoice.clientSiret}</p>
                            )}
                            <p className="text-[8px] text-[#B88A44] mt-1 print:text-[10px]">
                                {invoice.clientType === 'particulier' ? '👤 Particulier' : '🏢 Entreprise'}
                            </p>
                        </div>

                        {invoice.categories.length === 0 && invoice.products.length === 0 ? (
                            <div className="text-center py-8 text-gray-300 italic print:py-16">Aucun élément ajouté</div>
                        ) : (
                            <>
                                {/* Tableau Prestations */}
                                {invoice.categories.length > 0 && (
                                    <div className="mb-4 print:mb-6">
                                        <table className="w-full">
                                            <thead className="text-[7px] uppercase tracking-widest text-[#B88A44] font-bold print:text-[9px]" style={{ borderBottom: '2px solid #B88A44' }}>
                                            <tr>
                                                <th className="text-left py-2 px-1 print:py-2">Prestations</th>
                                                <th className="text-center py-2 px-1 print:py-2">Durée</th>
                                                <th className="text-right py-2 px-1 print:py-2">Prix HT</th>
                                            </tr>
                                            </thead>
                                            <tbody className="text-[8px] print:text-[10px]">
                                            {invoice.categories.map((cat, i) => (
                                                <tr key={i} className="border-b border-gray-100">
                                                    <td className="py-2 px-1 print:py-3">
                                                        <span className="font-serif font-medium print:text-[11px]">{cat.name}</span>
                                                        <div className="text-[7px] text-gray-400 mt-0.5 print:text-[9px]">
                                                            {cat.prestations.map((p) => `${p.quantity}× ${p.desc}`).join(', ')}
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-1 text-center font-bold print:py-3">{formatDuration(cat.duration)}</td>
                                                    <td className="py-2 px-1 text-right font-bold print:py-3">{cat.price.toFixed(2)} €</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                        <div className="text-right text-[8px] text-gray-500 mt-1 print:text-[9px]">
                                            Taux horaire : {invoice.hourlyRate.toFixed(2)} €/h • TVA : {invoice.tvaRate}%
                                        </div>
                                    </div>
                                )}

                                {/* Tableau Produits */}
                                {invoice.products.length > 0 && (
                                    <div className="mb-4 print:mb-6">
                                        <table className="w-full">
                                            <thead className="text-[7px] uppercase tracking-widest text-[#1A1A1A] font-bold print:text-[9px]" style={{ borderBottom: '2px solid #1A1A1A' }}>
                                            <tr>
                                                <th className="text-left py-2 px-1 print:py-2">Produits</th>
                                                <th className="text-center py-2 px-1 print:py-2">Qté</th>
                                                <th className="text-right py-2 px-1 print:py-2">Prix HT</th>
                                            </tr>
                                            </thead>
                                            <tbody className="text-[8px] print:text-[10px]">
                                            {invoice.products.map((prod, i) => (
                                                <tr key={i} className="border-b border-gray-100">
                                                    <td className="py-2 px-1 print:py-3">
                                                        <span className="font-serif font-medium print:text-[11px]">{prod.name}</span>
                                                    </td>
                                                    <td className="py-2 px-1 text-center font-bold print:py-3">{prod.quantity} {prod.unit}</td>
                                                    <td className="py-2 px-1 text-right font-bold print:py-3">{prod.price.toFixed(2)} €</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                        <div className="text-right text-[8px] text-gray-500 mt-1 print:text-[9px]">
                                            TVA : {invoice.tvaRateProduits}%
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Totaux */}
                        <div className="ml-auto w-52 space-y-1 border-t-2 border-[#1A1A1A] pt-3 print:w-64 print:pt-4" style={{ borderTop: '3px solid #1A1A1A' }}>
                            <div className="flex justify-between text-[8px] print:text-[10px]">
                                <span>Total HT</span>
                                <span className="font-bold">{totalHT.toFixed(2)} €</span>
                            </div>
                            {totalPrestationsHT > 0 && (
                                <div className="flex justify-between text-[8px] text-gray-500 print:text-[10px]">
                                    <span>TVA Prestations ({invoice.tvaRate}%)</span>
                                    <span>{tvaPrestations.toFixed(2)} €</span>
                                </div>
                            )}
                            {totalProductsHT > 0 && (
                                <div className="flex justify-between text-[8px] text-gray-500 print:text-[10px]">
                                    <span>TVA Produits ({invoice.tvaRateProduits}%)</span>
                                    <span>{tvaProduits.toFixed(2)} €</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm font-serif text-[#B88A44] border-t border-gray-200 pt-2 print:text-base print:pt-3">
                                <span className="font-bold">TOTAL TTC</span>
                                <span className="font-bold">{totalTTC.toFixed(2)} €</span>
                            </div>
                        </div>

                        {/* Avantage fiscal - uniquement pour particuliers */}
                        {invoice.clientType === 'particulier' && totalPrestationsHT > 0 && (
                            <div className="mt-4 p-2 bg-[#B88A44]/5 border border-[#B88A44]/20 rounded-sm print:mt-8 print:p-3">
                                <p className="font-bold text-[#B88A44] uppercase text-[7px] mb-0.5 tracking-widest print:text-[9px]">✦ Avantage Fiscal Services à la Personne</p>
                                <p className="text-[8px] font-serif text-[#1A1A1A] leading-relaxed print:text-[10px]">
                                    Éligible au crédit d&apos;impôt de 50%. Avantage estimé : <span className="font-bold text-[#B88A44]">{((totalPrestationsHT + tvaPrestations) / 2).toFixed(2)} €</span>
                                </p>
                            </div>
                        )}

                        {/* Conditions de paiement */}
                        <div className="mt-4 text-[7px] text-gray-500 print:mt-6 print:text-[9px]">
                            <p className="font-bold text-gray-700 mb-1">Conditions de paiement :</p>
                            <p>• Paiement à {documentType === 'devis' ? 'la signature' : `réception de facture (échéance : ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')})`}</p>
                            <p>• Modes de paiement acceptés : Virement bancaire, Chèque, CESU</p>
                            {documentType === 'facture' && (
                                <p className="mt-1 text-[6px] print:text-[8px]">
                                    En cas de retard de paiement, des pénalités de retard seront appliquées au taux de 3 fois le taux d&apos;intérêt légal,
                                    ainsi qu&apos;une indemnité forfaitaire de 40€ pour frais de recouvrement (art. L441-10 du Code de commerce).
                                </p>
                            )}
                        </div>

                        {/* Pied de page */}
                        <div className="mt-4 pt-3 border-t border-gray-100 text-[6px] text-gray-400 uppercase tracking-tighter text-center print:text-[8px] print:mt-auto print:pt-4">
                            La Clé Provençale — SIRET : XXX XXX XXX XXXXX — N° TVA : FR XX XXXXXXXXX<br/>
                            Organisme de services à la personne agréé n° SAP XXXXXXXXX
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}