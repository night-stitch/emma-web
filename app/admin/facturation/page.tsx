'use client';

import { useState, useEffect, Suspense } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, doc, addDoc, serverTimestamp, query, orderBy, deleteDoc, updateDoc } from 'firebase/firestore';
import {
    FileText, Plus, Trash2, Download, Percent, Mail, X,
    BookOpen, Calculator, Folder, Check, Minus,
    Package, Wine, Sparkles, ShoppingBag, Tag, User, Building2,
    Euro, Edit2, Save, Eye, ClipboardList, Grid3X3, List, Search, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type MobileView = 'form' | 'categories' | 'preview' | 'documents';

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
    showFiscalAdvantage: boolean;
    taxCreditRate: number;
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

function FacturationContent() {
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
    const [tempRate, setTempRate] = useState(25);
    const [mobileView, setMobileView] = useState<MobileView>('form');

    // États pour la liste des documents
    const [savedDocuments, setSavedDocuments] = useState<any[]>([]);
    const [showDocumentsList, setShowDocumentsList] = useState(false);
    const [documentFilter, setDocumentFilter] = useState<'all' | 'devis' | 'facture'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingDocId, setEditingDocId] = useState<string | null>(null);
    const [documentStatus, setDocumentStatus] = useState<'émis' | 'à payer' | 'payé'>('émis');

    const searchParams = useSearchParams();

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
        hourlyRate: 25,
        categories: [],
        products: [],
        paymentMethod: 'virement',
        notes: '',
        showFiscalAdvantage: true,
        taxCreditRate: 50
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
                    const rate = rateDoc.data().rate || 25;
                    setInvoice(prev => ({ ...prev, hourlyRate: rate }));
                    setTempRate(rate);
                }

                // Récupérer tous les documents (devis/factures)
                const documentsSnap = await getDocs(collection(db, "documents"));
                const docs = documentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                // Trier par date de création (plus récent en premier)
                docs.sort((a: any, b: any) => {
                    const dateA = a.createdAt?.toDate?.() || new Date(a.date);
                    const dateB = b.createdAt?.toDate?.() || new Date(b.date);
                    return dateB.getTime() - dateA.getTime();
                });
                setSavedDocuments(docs);

                // Calculer le prochain numéro de facture
                const currentYear = new Date().getFullYear();
                let maxNum = 0;
                docs.forEach((d: any) => {
                    if (d.invoiceNumber) {
                        const parts = d.invoiceNumber.split('-');
                        if (parts.length === 2 && parseInt(parts[0]) === currentYear) {
                            const num = parseInt(parts[1]);
                            if (num > maxNum) maxNum = num;
                        }
                    }
                });
                const nextNumber = `${currentYear}-${String(maxNum + 1).padStart(3, '0')}`;
                setInvoice(prev => ({ ...prev, invoiceNumber: nextNumber }));
            } catch (error) {
                console.error("Erreur chargement:", error);
            }
        };
        fetchData();
    }, []);

    // Charger un document depuis l'URL (query param ?doc=ID)
    useEffect(() => {
        const docId = searchParams.get('doc');
        if (docId && savedDocuments.length > 0) {
            const docToLoad = savedDocuments.find(d => d.id === docId);
            if (docToLoad) {
                loadDocument(docToLoad);
            }
        }
    }, [searchParams, savedDocuments]);

    // Fonction pour charger un document dans le formulaire
    const loadDocument = (docData: any) => {
        setEditingDocId(docData.id);
        setDocumentType(docData.type || 'facture');
        setDocumentStatus(docData.status || 'émis');
        setInvoice({
            invoiceNumber: docData.invoiceNumber || '',
            clientId: docData.clientId || '',
            clientName: docData.clientName || '',
            clientAddress: docData.clientAddress || '',
            clientSiret: docData.clientSiret || '',
            clientType: docData.clientType || 'particulier',
            date: docData.date || new Date().toISOString().split('T')[0],
            validUntil: docData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dueDate: docData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            tvaRate: docData.tvaRate || TVA_RATES.particulier.prestations,
            tvaRateProduits: docData.tvaRateProduits || TVA_RATES.particulier.produits,
            hourlyRate: docData.hourlyRate || 25,
            categories: docData.categories || [],
            products: docData.products || [],
            paymentMethod: docData.paymentMethod || 'virement',
            notes: docData.notes || '',
            showFiscalAdvantage: docData.showFiscalAdvantage ?? true,
            taxCreditRate: docData.taxCreditRate || 50
        });
        setShowDocumentsList(false);
    };

    // Annuler l'édition et créer un nouveau document
    const cancelEdit = () => {
        setEditingDocId(null);
        setDocumentStatus('émis');
        setInvoice({
            invoiceNumber: (() => {
                const currentYear = new Date().getFullYear();
                let maxNum = 0;
                savedDocuments.forEach((d: any) => {
                    if (d.invoiceNumber) {
                        const parts = d.invoiceNumber.split('-');
                        if (parts.length === 2 && parseInt(parts[0]) === currentYear) {
                            const num = parseInt(parts[1]);
                            if (num > maxNum) maxNum = num;
                        }
                    }
                });
                return `${currentYear}-${String(maxNum + 1).padStart(3, '0')}`;
            })(),
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
            hourlyRate: invoice.hourlyRate,
            categories: [],
            products: [],
            paymentMethod: 'virement',
            notes: '',
            showFiscalAdvantage: true,
            taxCreditRate: 50
        });
    };

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

    // Sauvegarder le document dans Firebase et l'associer au client
    const saveDocument = async (send: boolean = false) => {
        if (!invoice.clientId) {
            alert('Veuillez sélectionner un client');
            return;
        }
        if (invoice.categories.length === 0 && invoice.products.length === 0) {
            alert('Veuillez ajouter au moins une prestation ou un produit');
            return;
        }

        try {
            const documentData = {
                ...invoice,
                type: documentType,
                totalHT,
                totalTVA,
                totalTTC,
                tvaPrestations,
                tvaProduits,
                totalPrestationsHT,
                totalProductsHT,
                status: documentStatus,
                updatedAt: serverTimestamp()
            };

            if (editingDocId) {
                // Mettre à jour le document existant
                await updateDoc(doc(db, "documents", editingDocId), documentData);

                // Mettre à jour la liste locale
                setSavedDocuments(prev => prev.map(d =>
                    d.id === editingDocId ? { ...d, ...documentData, updatedAt: new Date() } : d
                ));

                if (send) {
                    const client = clients.find(c => c.id === invoice.clientId);
                    const subject = encodeURIComponent(`${documentType === 'devis' ? 'Devis' : 'Facture'} N° ${invoice.invoiceNumber} - La Clé Provençale`);
                    const body = encodeURIComponent(`Bonjour ${invoice.clientName},\n\nVeuillez trouver ci-joint votre ${documentType} N° ${invoice.invoiceNumber}.\n\nMontant TTC : ${totalTTC.toFixed(2)} €\n\nCordialement,\nLa Clé Provençale`);
                    window.open(`mailto:${client?.email || ''}?subject=${subject}&body=${body}`, '_blank');
                    alert(`${documentType === 'devis' ? 'Devis' : 'Facture'} mis(e) à jour et envoyé(e) !`);
                } else {
                    alert(`${documentType === 'devis' ? 'Devis' : 'Facture'} mis(e) à jour !`);
                }
            } else {
                // Créer un nouveau document
                const newDocData = { ...documentData, createdAt: serverTimestamp() };
                const docRef = await addDoc(collection(db, "documents"), newDocData);

                // Ajouter le nouveau document à la liste
                setSavedDocuments(prev => [{
                    id: docRef.id,
                    ...newDocData,
                    createdAt: new Date()
                }, ...prev]);

                if (send) {
                    const client = clients.find(c => c.id === invoice.clientId);
                    const subject = encodeURIComponent(`${documentType === 'devis' ? 'Devis' : 'Facture'} N° ${invoice.invoiceNumber} - La Clé Provençale`);
                    const body = encodeURIComponent(`Bonjour ${invoice.clientName},\n\nVeuillez trouver ci-joint votre ${documentType} N° ${invoice.invoiceNumber}.\n\nMontant TTC : ${totalTTC.toFixed(2)} €\n\nCordialement,\nLa Clé Provençale`);
                    window.open(`mailto:${client?.email || ''}?subject=${subject}&body=${body}`, '_blank');
                    alert(`${documentType === 'devis' ? 'Devis' : 'Facture'} envoyé(e) et sauvegardé(e) !`);
                } else {
                    alert(`${documentType === 'devis' ? 'Devis' : 'Facture'} sauvegardé(e) !`);
                }
            }

            // Réinitialiser le formulaire
            setEditingDocId(null);
            setDocumentStatus('émis');
            setInvoice({
                invoiceNumber: `${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
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
                hourlyRate: invoice.hourlyRate,
                categories: [],
                products: [],
                paymentMethod: 'virement',
                notes: '',
                showFiscalAdvantage: true,
                taxCreditRate: 50
            });
        } catch (error) {
            console.error("Erreur sauvegarde:", error);
            alert("Erreur lors de la sauvegarde");
        }
    };

    // Supprimer un document
    const deleteDocument = async (docId: string) => {
        if (!confirm('Supprimer ce document ?')) return;
        try {
            await deleteDoc(doc(db, "documents", docId));
            setSavedDocuments(prev => prev.filter(d => d.id !== docId));
        } catch (error) {
            console.error("Erreur suppression:", error);
            alert("Erreur lors de la suppression");
        }
    };

    // Changer le statut d'un document (cycle: émis → à payer → payé → émis)
    const cycleDocumentStatus = async (docId: string, currentStatus: string) => {
        const statusOrder = ['émis', 'à payer', 'payé'];
        const currentIndex = statusOrder.indexOf(currentStatus || 'émis');
        const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

        try {
            await updateDoc(doc(db, "documents", docId), {
                status: nextStatus,
                updatedAt: serverTimestamp()
            });
            setSavedDocuments(prev => prev.map(d =>
                d.id === docId ? { ...d, status: nextStatus } : d
            ));
        } catch (error) {
            console.error("Erreur changement statut:", error);
        }
    };

    // Filtrer les documents
    const filteredDocuments = savedDocuments.filter(d => {
        const matchesFilter = documentFilter === 'all' || d.type === documentFilter;
        const matchesSearch = searchTerm === '' ||
            d.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

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
                    /* Force display of hidden parents */
                    .hidden {
                        display: block !important;
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

            <div className="h-[91.5vh] w-full flex flex-col lg:flex-row">

                {/* NAVIGATION MOBILE - Bottom tabs */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#B88A44]/20 z-50 flex shadow-lg">
                    <button
                        onClick={() => setMobileView('form')}
                        className={`flex-1 py-3 flex flex-col items-center gap-1 transition-all ${
                            mobileView === 'form' ? 'bg-[#B88A44]/10 text-[#B88A44]' : 'text-gray-500'
                        }`}
                    >
                        <ClipboardList size={20} />
                        <span className="text-[8px] uppercase font-bold tracking-wider">Formulaire</span>
                    </button>
                    <button
                        onClick={() => setMobileView('documents')}
                        className={`flex-1 py-3 flex flex-col items-center gap-1 transition-all ${
                            mobileView === 'documents' ? 'bg-[#B88A44]/10 text-[#B88A44]' : 'text-gray-500'
                        }`}
                    >
                        <FileText size={20} />
                        <span className="text-[8px] uppercase font-bold tracking-wider">Documents</span>
                    </button>
                    <button
                        onClick={() => setMobileView('categories')}
                        className={`flex-1 py-3 flex flex-col items-center gap-1 transition-all ${
                            mobileView === 'categories' ? 'bg-[#B88A44]/10 text-[#B88A44]' : 'text-gray-500'
                        }`}
                    >
                        <Grid3X3 size={20} />
                        <span className="text-[8px] uppercase font-bold tracking-wider">Catalogue</span>
                    </button>
                    <button
                        onClick={() => setMobileView('preview')}
                        className={`flex-1 py-3 flex flex-col items-center gap-1 transition-all relative ${
                            mobileView === 'preview' ? 'bg-[#B88A44]/10 text-[#B88A44]' : 'text-gray-500'
                        }`}
                    >
                        <Eye size={20} />
                        <span className="text-[8px] uppercase font-bold tracking-wider">Aperçu</span>
                        {(invoice.categories.length > 0 || invoice.products.length > 0) && (
                            <span className="absolute top-1 right-1/4 w-2 h-2 bg-[#B88A44] rounded-full"></span>
                        )}
                    </button>
                </div>

                {/* COLONNE GAUCHE - FORMULAIRE */}
                <div className={`w-full lg:w-[300px] h-[calc(100%-60px)] lg:h-full overflow-y-auto p-4 border-r border-[#B88A44]/10 bg-[#F7F5F0] flex-shrink-0 ${
                    mobileView === 'form' ? 'block' : 'hidden lg:block'
                }`}>
                    <div className="mb-4">
                        <Link href="/admin" className="inline-flex items-center gap-2 text-[#B88A44] text-[10px] uppercase tracking-widest font-bold mb-3 hover:text-[#1A1A1A] transition-colors">
                            <ArrowLeft size={14} /> Retour
                        </Link>
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-[#B88A44] text-[9px] uppercase tracking-[0.4em] font-bold block mb-1">
                                    La Clé Provençale
                                </span>
                                <h1 className="text-[#1A1A1A] text-lg font-serif uppercase tracking-widest leading-tight">
                                    Gestion <span className="text-[#B88A44]">Document</span>
                                </h1>
                            </div>
                        </div>
                    </div>

                    {/* Indicateur mode édition */}
                    {editingDocId && (
                        <div className="mb-4 p-3 bg-orange-50 border-2 border-orange-400 rounded-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] uppercase font-bold text-orange-600 tracking-widest">Mode Édition</p>
                                    <p className="text-xs text-orange-800">N° {invoice.invoiceNumber}</p>
                                </div>
                                <button
                                    onClick={cancelEdit}
                                    className="px-3 py-1.5 bg-orange-500 text-white text-[8px] uppercase font-bold tracking-wider rounded-sm hover:bg-orange-600 transition-all flex items-center gap-1"
                                >
                                    <Plus size={12} className="rotate-45" /> Nouveau
                                </button>
                            </div>
                        </div>
                    )}

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

                        {/* Type de Client avec TVA */}
                        <div className="bg-white p-3 rounded-sm border border-[#B88A44]/20">
                            <label className="text-[9px] uppercase font-bold text-[#B88A44] mb-2 block tracking-widest">Type de client</label>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <button
                                    onClick={() => handleClientTypeChange('particulier')}
                                    className={`p-2 rounded-sm border-2 transition-all flex flex-col items-center gap-1 ${
                                        invoice.clientType === 'particulier' ? 'border-[#B88A44] bg-[#B88A44]/10' : 'border-gray-200 hover:border-[#B88A44]/50 bg-white/50'
                                    }`}
                                >
                                    <User size={18} className={invoice.clientType === 'particulier' ? 'text-[#B88A44]' : 'text-gray-400'} />
                                    <span className={`text-[8px] uppercase font-bold tracking-widest ${invoice.clientType === 'particulier' ? 'text-[#B88A44]' : 'text-gray-600'}`}>Particulier</span>
                                    <span className={`text-[7px] ${invoice.clientType === 'particulier' ? 'text-[#B88A44]/70' : 'text-gray-400'}`}>TVA {TVA_RATES.particulier.prestations}%</span>
                                </button>
                                <button
                                    onClick={() => handleClientTypeChange('entreprise')}
                                    className={`p-2 rounded-sm border-2 transition-all flex flex-col items-center gap-1 ${
                                        invoice.clientType === 'entreprise' ? 'border-[#B88A44] bg-[#B88A44]/10' : 'border-gray-200 hover:border-[#B88A44]/50 bg-white/50'
                                    }`}
                                >
                                    <Building2 size={18} className={invoice.clientType === 'entreprise' ? 'text-[#B88A44]' : 'text-gray-400'} />
                                    <span className={`text-[8px] uppercase font-bold tracking-widest ${invoice.clientType === 'entreprise' ? 'text-[#B88A44]' : 'text-gray-600'}`}>Entreprise</span>
                                    <span className={`text-[7px] ${invoice.clientType === 'entreprise' ? 'text-[#B88A44]/70' : 'text-gray-400'}`}>TVA {TVA_RATES.entreprise.prestations}%</span>
                                </button>
                            </div>

                            {/* TVA personnalisable */}
                            <div className="border-t border-[#B88A44]/20 pt-3">
                                <label className="text-[8px] uppercase font-bold text-gray-500 mb-2 block tracking-widest">Personnaliser TVA</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[8px] text-gray-500 block mb-1">Prestations</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={invoice.tvaRate}
                                                onChange={(e) => setInvoice({...invoice, tvaRate: parseFloat(e.target.value) || 0})}
                                                className="w-full bg-gray-50 p-2 text-sm font-bold outline-none border border-[#B88A44]/20 rounded-sm pr-6 focus:border-[#B88A44]"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[8px] text-gray-500 block mb-1">Produits</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={invoice.tvaRateProduits}
                                                onChange={(e) => setInvoice({...invoice, tvaRateProduits: parseFloat(e.target.value) || 0})}
                                                className="w-full bg-gray-50 p-2 text-sm font-bold outline-none border border-[#B88A44]/20 rounded-sm pr-6 focus:border-[#B88A44]"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Avantage fiscal - uniquement pour particuliers */}
                            {invoice.clientType === 'particulier' && (
                                <div className="border-t border-[#B88A44]/20 pt-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-[8px] uppercase font-bold text-gray-500 tracking-widest">Avantage fiscal</label>
                                        <button
                                            onClick={() => setInvoice({...invoice, showFiscalAdvantage: !invoice.showFiscalAdvantage})}
                                            className={`relative w-10 h-5 rounded-full transition-all ${invoice.showFiscalAdvantage ? 'bg-[#B88A44]' : 'bg-gray-300'}`}
                                        >
                                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${invoice.showFiscalAdvantage ? 'left-5' : 'left-0.5'}`}></span>
                                        </button>
                                    </div>
                                    {invoice.showFiscalAdvantage && (
                                        <div>
                                            <label className="text-[8px] text-gray-500 block mb-1">Crédit d&apos;impôt</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    step="1"
                                                    min="0"
                                                    max="100"
                                                    value={invoice.taxCreditRate}
                                                    onChange={(e) => setInvoice({...invoice, taxCreditRate: parseFloat(e.target.value) || 0})}
                                                    className="w-full bg-gray-50 p-2 text-sm font-bold outline-none border border-[#B88A44]/20 rounded-sm pr-6 focus:border-[#B88A44]"
                                                />
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
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

                            {/* Numéro de facture/devis et Statut */}
                            <div className="grid grid-cols-2 gap-2">
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
                                <div>
                                    <label className="text-[9px] uppercase font-bold text-[#B88A44] mb-1 block tracking-widest">Statut</label>
                                    <select
                                        value={documentStatus}
                                        onChange={(e) => setDocumentStatus(e.target.value as 'émis' | 'à payer' | 'payé')}
                                        className={`w-full p-2 text-xs outline-none border rounded-sm font-bold ${
                                            documentStatus === 'payé' ? 'bg-green-100 border-green-500 text-green-700' :
                                            documentStatus === 'à payer' ? 'bg-orange-100 border-orange-500 text-orange-700' :
                                            'bg-blue-100 border-blue-500 text-blue-700'
                                        }`}
                                    >
                                        <option value="émis">Émis</option>
                                        <option value="à payer">À payer</option>
                                        <option value="payé">Payé</option>
                                    </select>
                                </div>
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

                        <div className="grid grid-cols-3 gap-2 pt-2">
                            <button
                                onClick={() => saveDocument(false)}
                                className="bg-green-600 text-white py-3 text-[8px] uppercase font-bold tracking-[0.1em] flex items-center justify-center gap-1 hover:bg-green-700 transition-all rounded-sm"
                            >
                                <Save size={12} /> Sauver
                            </button>
                            <button
                                onClick={handlePrint}
                                className="bg-[#1A1A1A] text-white py-3 text-[8px] uppercase font-bold tracking-[0.1em] flex items-center justify-center gap-1 hover:bg-[#B88A44] transition-all rounded-sm"
                            >
                                <Download size={12} /> PDF
                            </button>
                            <button
                                onClick={() => saveDocument(true)}
                                className="border border-[#1A1A1A] text-[#1A1A1A] py-3 text-[8px] uppercase font-bold tracking-[0.1em] flex items-center justify-center gap-1 hover:bg-gray-100 transition-all bg-white rounded-sm"
                            >
                                <Mail size={12} /> Envoyer
                            </button>
                        </div>
                    </div>
                </div>

                {/* COLONNE CATÉGORIES - TABS */}
                <div className={`w-full lg:w-[100px] h-[calc(100%-60px)] lg:h-full flex flex-col bg-gradient-to-b from-[#1A1A1A] to-[#2A2A2A] flex-shrink-0 ${
                    mobileView === 'categories' ? 'block' : 'hidden lg:flex'
                }`}>
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
                    <div className="flex-1 overflow-y-auto px-3 lg:px-1.5 py-3 lg:py-2">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-1 gap-2 lg:gap-1.5">
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
                                        className={`w-full p-3 lg:p-2 border rounded-sm transition-all text-left ${
                                            isSelected
                                                ? 'bg-[#B88A44] border-[#B88A44]'
                                                : isInInvoice
                                                    ? 'bg-[#B88A44]/20 border-[#B88A44]/50'
                                                    : 'bg-white/5 hover:bg-[#B88A44]/20 border-white/10 hover:border-[#B88A44]/50'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center gap-1">
                                            <Icon size={20} className={`lg:w-4 lg:h-4 ${isSelected ? 'text-white' : 'text-[#B88A44]'}`} />
                                            <span className={`text-[8px] lg:text-[7px] uppercase font-bold tracking-wider text-center leading-tight ${isSelected ? 'text-white' : 'text-white/80'}`}>{cat.name}</span>
                                            <span className={`text-[8px] lg:text-[7px] ${isSelected ? 'text-white/70' : 'text-[#B88A44]/70'}`}>{count}</span>
                                            {isInInvoice && !isSelected && <Check size={12} className="lg:w-2.5 lg:h-2.5 text-[#B88A44]" />}
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
                                        className={`w-full p-3 lg:p-2 border rounded-sm transition-all text-left ${
                                            isSelected
                                                ? 'bg-[#B88A44] border-[#B88A44]'
                                                : hasProducts
                                                    ? 'bg-[#B88A44]/20 border-[#B88A44]/50'
                                                    : 'bg-white/5 hover:bg-[#B88A44]/20 border-white/10 hover:border-[#B88A44]/50'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center gap-1">
                                            <Icon size={20} className={`lg:w-4 lg:h-4 ${isSelected ? 'text-white' : 'text-[#B88A44]'}`} />
                                            <span className={`text-[8px] lg:text-[7px] uppercase font-bold tracking-wider text-center leading-tight ${isSelected ? 'text-white' : 'text-white/80'}`}>{cat.name}</span>
                                            <span className={`text-[8px] lg:text-[7px] ${isSelected ? 'text-white/70' : 'text-[#B88A44]/70'}`}>{count}</span>
                                            {hasProducts && !isSelected && <Check size={12} className="lg:w-2.5 lg:h-2.5 text-[#B88A44]" />}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                        </div>
                    </div>
                </div>

                {/* PANNEAU PRESTATIONS - Modal sur mobile */}
                {selectedCategory && (
                    <div className="fixed top-20 left-0 right-0 bottom-[60px] lg:top-0 lg:bottom-0 lg:relative lg:inset-auto w-full lg:w-[260px] h-auto lg:h-full flex flex-col bg-white border-r border-[#B88A44]/20 flex-shrink-0 z-40 lg:z-auto">
                        <div className="bg-gradient-to-r from-[#B88A44] to-[#A07A34] px-3 py-1.5 lg:p-3 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-1.5">
                                {(() => {
                                    const catData = prestationCategories.find(c => c.id === selectedCategory);
                                    const Icon = catData ? getIconComponent(catData.icon) : Folder;
                                    return <Icon size={14} className="lg:w-4 lg:h-4 text-white" />;
                                })()}
                                <h3 className="text-white text-[11px] lg:text-xs font-bold uppercase tracking-wider">
                                    {prestationCategories.find(c => c.id === selectedCategory)?.name || 'Prestations'}
                                </h3>
                            </div>
                            <button onClick={closeCategory} className="text-white hover:bg-white/20 p-1 rounded-full transition-all">
                                <X size={16} className="lg:w-4 lg:h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 lg:p-3 space-y-3 lg:space-y-2">
                            {categoryPrestationsList.map((prestation) => {
                                const quantity = getPrestationQuantity(prestation.id);
                                const isSelected = quantity > 0;
                                return (
                                    <div key={prestation.id} className={`p-4 lg:p-3 rounded-sm border-2 transition-all ${isSelected ? 'border-[#B88A44] bg-[#B88A44]/5' : 'border-gray-200 bg-gray-50'}`}>
                                        <div className="mb-3 lg:mb-2">
                                            <p className="text-base lg:text-sm font-serif text-[#1A1A1A]">{prestation.desc}</p>
                                            <p className="text-[10px] lg:text-[9px] text-gray-500 mt-1 lg:mt-0.5">{formatDuration(prestation.duration || 30)} / unité</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 lg:gap-2">
                                                <button
                                                    onClick={() => updatePrestationQuantity(prestation.id, quantity - 1)}
                                                    className={`w-10 h-10 lg:w-7 lg:h-7 rounded flex items-center justify-center transition-all ${quantity > 0 ? 'bg-[#B88A44] text-white hover:bg-[#A07A34]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                                    disabled={quantity === 0}
                                                >
                                                    <Minus size={18} className="lg:w-3.5 lg:h-3.5" />
                                                </button>
                                                <span className={`w-10 lg:w-8 text-center text-lg lg:text-base font-bold ${quantity > 0 ? 'text-[#B88A44]' : 'text-gray-400'}`}>{quantity}</span>
                                                <button
                                                    onClick={() => updatePrestationQuantity(prestation.id, quantity + 1)}
                                                    className="w-10 h-10 lg:w-7 lg:h-7 rounded bg-[#B88A44] text-white flex items-center justify-center hover:bg-[#A07A34] transition-all"
                                                >
                                                    <Plus size={18} className="lg:w-3.5 lg:h-3.5" />
                                                </button>
                                            </div>
                                            {quantity > 0 && <span className="text-sm lg:text-xs font-bold text-[#B88A44]">{formatDuration((prestation.duration || 30) * quantity)}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-4 lg:p-3 border-t-2 border-[#B88A44] bg-[#F7F5F0] flex-shrink-0">
                            <div className="flex justify-between items-center mb-3 lg:mb-2">
                                <span className="text-xs lg:text-[10px] text-gray-600 font-bold">{selectedPrestations.reduce((acc, p) => acc + p.quantity, 0)} prestation(s)</span>
                                <span className="text-lg lg:text-base font-bold text-[#B88A44]">{((selectedPrestationsTotal / 60) * invoice.hourlyRate).toFixed(2)} € HT</span>
                            </div>
                            <button
                                onClick={saveCategoryToInvoice}
                                disabled={selectedPrestations.length === 0}
                                className="w-full bg-[#B88A44] text-white py-4 lg:py-3 text-xs lg:text-[10px] uppercase font-bold tracking-widest hover:bg-[#A07A34] transition-all rounded-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                {invoice.categories.some(c => c.name === prestationCategories.find(cat => cat.id === selectedCategory)?.name) ? '✓ METTRE À JOUR' : '+ AJOUTER'}
                            </button>
                        </div>
                    </div>
                )}

                {/* PANNEAU PRODUITS - Modal sur mobile */}
                {selectedProductCategory && (
                    <div className="fixed top-20 left-0 right-0 bottom-[60px] lg:top-0 lg:bottom-0 lg:relative lg:inset-auto w-full lg:w-[260px] h-auto lg:h-full flex flex-col bg-white border-r border-[#1A1A1A]/20 flex-shrink-0 z-40 lg:z-auto">
                        <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] px-3 py-1.5 lg:p-3 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-1.5">
                                {selectedProductCategoryData && (() => {
                                    const Icon = getIconComponent(selectedProductCategoryData.icon);
                                    return <Icon size={14} className="lg:w-4 lg:h-4 text-white" />;
                                })()}
                                <h3 className="text-white text-[11px] lg:text-xs font-bold uppercase tracking-wider">
                                    {selectedProductCategoryData?.name || 'Produits'}
                                </h3>
                            </div>
                            <button onClick={closeProductCategory} className="text-white hover:bg-white/20 p-1 rounded-full transition-all">
                                <X size={16} className="lg:w-4 lg:h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 lg:p-3 space-y-3 lg:space-y-2">
                            {categoryProductsList.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 italic text-sm">
                                    Aucun produit
                                </div>
                            ) : (
                                categoryProductsList.map((product) => {
                                    const quantity = getProductQuantity(product.id);
                                    const isSelected = quantity > 0;
                                    return (
                                        <div key={product.id} className={`p-4 lg:p-3 rounded-sm border-2 transition-all ${isSelected ? 'border-[#1A1A1A] bg-gray-50' : 'border-gray-200 bg-gray-50'}`}>
                                            <div className="mb-3 lg:mb-2">
                                                <p className="text-base lg:text-sm font-serif text-[#1A1A1A]">{product.name}</p>
                                                <p className="text-[10px] lg:text-[9px] text-gray-500 mt-1 lg:mt-0.5">{product.price.toFixed(2)} € HT / {product.unit}</p>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 lg:gap-2">
                                                    <button
                                                        onClick={() => updateProductQuantity(product.id, quantity - 1)}
                                                        className={`w-10 h-10 lg:w-7 lg:h-7 rounded flex items-center justify-center transition-all ${quantity > 0 ? 'bg-[#1A1A1A] text-white hover:bg-[#2A2A2A]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                                        disabled={quantity === 0}
                                                    >
                                                        <Minus size={18} className="lg:w-3.5 lg:h-3.5" />
                                                    </button>
                                                    <span className={`w-10 lg:w-8 text-center text-lg lg:text-base font-bold ${quantity > 0 ? 'text-[#1A1A1A]' : 'text-gray-400'}`}>{quantity}</span>
                                                    <button
                                                        onClick={() => updateProductQuantity(product.id, quantity + 1)}
                                                        className="w-10 h-10 lg:w-7 lg:h-7 rounded bg-[#1A1A1A] text-white flex items-center justify-center hover:bg-[#2A2A2A] transition-all"
                                                    >
                                                        <Plus size={18} className="lg:w-3.5 lg:h-3.5" />
                                                    </button>
                                                </div>
                                                {quantity > 0 && <span className="text-sm lg:text-xs font-bold text-[#1A1A1A]">{(product.price * quantity).toFixed(2)} € HT</span>}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="p-4 lg:p-3 border-t-2 border-[#1A1A1A] bg-gray-100 flex-shrink-0">
                            <div className="flex justify-between items-center mb-3 lg:mb-2">
                                <span className="text-xs lg:text-[10px] text-gray-600 font-bold">{selectedProducts.reduce((acc, p) => acc + p.quantity, 0)} produit(s)</span>
                                <span className="text-lg lg:text-base font-bold text-[#1A1A1A]">{selectedProductsTotal.toFixed(2)} € HT</span>
                            </div>
                            <button
                                onClick={addProductsToInvoice}
                                disabled={selectedProducts.length === 0}
                                className="w-full bg-[#1A1A1A] text-white py-4 lg:py-3 text-xs lg:text-[10px] uppercase font-bold tracking-widest hover:bg-[#2A2A2A] transition-all rounded-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                + AJOUTER PRODUITS
                            </button>
                        </div>
                    </div>
                )}

                {/* COLONNE DROITE - APERÇU */}
                <div className={`flex-1 w-full h-[calc(100%-60px)] lg:h-full flex items-center justify-center p-4 overflow-auto bg-[#E8E6E0]/50 ${
                    mobileView === 'preview' ? 'block' : 'hidden lg:flex'
                }`}>
                    <div id="print-area" className="bg-white shadow-2xl p-6 flex flex-col text-[#1A1A1A] w-full max-w-xl print:shadow-none print:max-w-none print:p-[15mm]">
                        {/* En-tête */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-start gap-3">
                                <img src="/logo.png" alt="Logo La Clé Provençale" className="w-10 h-10 object-contain print:w-14 print:h-14" />
                                <div>
                                <h2 className="text-lg font-serif tracking-widest uppercase mb-1 print:text-2xl">La Clé <span className="text-[#B88A44]">Provençale</span></h2>
                                {invoice.showFiscalAdvantage && invoice.clientType === 'particulier' && invoice.taxCreditRate > 0 && (
                                    <p className="text-[7px] text-gray-400 uppercase tracking-[0.2em] print:text-[10px]">Services à la Personne</p>
                                )}
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
                        <div className="text-[8px] text-gray-500 print:text-[10px] -mt-10 mb-10">
                            <p>1547 Route Neuve</p>
                            <p>84220 Gordes</p>
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

                        {/* Avantage fiscal - uniquement si activé, pour particuliers et taux > 0 */}
                        {invoice.showFiscalAdvantage && invoice.clientType === 'particulier' && totalPrestationsHT > 0 && invoice.taxCreditRate > 0 && (
                            <div className="mt-4 p-2 bg-[#B88A44]/5 border border-[#B88A44]/20 rounded-sm print:mt-8 print:p-3">
                                <p className="font-bold text-[#B88A44] uppercase text-[7px] mb-0.5 tracking-widest print:text-[9px]">✦ Avantage Fiscal Services à la Personne</p>
                                <p className="text-[8px] font-serif text-[#1A1A1A] leading-relaxed print:text-[10px]">
                                    Éligible au crédit d&apos;impôt de {invoice.taxCreditRate}%. Avantage estimé : <span className="font-bold text-[#B88A44]">{((totalPrestationsHT + tvaPrestations) * invoice.taxCreditRate / 100).toFixed(2)} €</span>
                                </p>
                            </div>
                        )}

                        {/* Mention TVA */}
                        <p className="mt-4 text-[7px] text-gray-500 italic print:mt-6 print:text-[9px]">TVA non applicable, art. 293 B du CGI</p>

                        {/* Conditions de paiement - uniquement en mode facture */}
                        {documentType === 'facture' && (
                            <div className="mt-3 text-[7px] text-gray-500 print:mt-6 print:text-[9px]">
                                <p className="font-bold text-gray-700 mb-1">Conditions de paiement :</p>
                                <p>• Paiement à réception de facture (échéance : {new Date(invoice.dueDate).toLocaleDateString('fr-FR')})</p>
                                <p>• Modes de paiement acceptés : Virement bancaire, Chèque</p>
                                <p>• IBAN : FR76 2823 3000 0194 0961 1678 929 BIC/SWIFT : REVOFRP2</p>
                                <p className="mt-1 text-[6px] print:text-[8px]">
                                    En cas de retard de paiement, des pénalités de retard seront appliquées au taux de 3 fois le taux d&apos;intérêt légal,
                                    ainsi qu&apos;une indemnité forfaitaire de 40€ pour frais de recouvrement (art. L441-10 du Code de commerce).
                                </p>
                            </div>
                        )}

                        {/* Pied de page */}
                        <div className="mt-4 pt-3 border-t border-gray-100 text-[6px] text-gray-400 uppercase tracking-tighter text-center print:text-[8px] print:mt-auto print:pt-4">
                            La Clé Provençale — SIRET : 98313347100018 — RCS Avignon<br/>
                            N° TVA : FR 92983133471<br/>
                        </div>
                    </div>
                </div>

                {/* VUE DOCUMENTS MOBILE - Plein écran */}
                <div className={`w-full h-[calc(100%-60px)] flex flex-col bg-white ${
                    mobileView === 'documents' ? 'block lg:hidden' : 'hidden'
                }`}>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] px-3 py-2 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <FileText size={16} className="text-[#B88A44]" />
                            <h2 className="text-white text-[11px] font-bold uppercase tracking-wider">
                                Documents ({savedDocuments.length})
                            </h2>
                        </div>
                    </div>

                    {/* Filtres */}
                    <div className="p-3 bg-[#F7F5F0] border-b border-[#B88A44]/20 flex flex-col gap-2">
                        <div className="flex gap-1.5 flex-wrap">
                            <button
                                onClick={() => setDocumentFilter('all')}
                                className={`px-2 py-1 text-[8px] uppercase font-bold tracking-wider rounded-sm transition-all ${
                                    documentFilter === 'all' ? 'bg-[#1A1A1A] text-white' : 'bg-white text-gray-600'
                                }`}
                            >
                                Tous ({savedDocuments.length})
                            </button>
                            <button
                                onClick={() => setDocumentFilter('devis')}
                                className={`px-2 py-1 text-[8px] uppercase font-bold tracking-wider rounded-sm transition-all ${
                                    documentFilter === 'devis' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
                                }`}
                            >
                                Devis ({savedDocuments.filter(d => d.type === 'devis').length})
                            </button>
                            <button
                                onClick={() => setDocumentFilter('facture')}
                                className={`px-2 py-1 text-[8px] uppercase font-bold tracking-wider rounded-sm transition-all ${
                                    documentFilter === 'facture' ? 'bg-green-500 text-white' : 'bg-white text-gray-600'
                                }`}
                            >
                                Factures ({savedDocuments.filter(d => d.type === 'facture').length})
                            </button>
                        </div>
                    </div>

                    {/* Liste des documents */}
                    <div className="flex-1 overflow-y-auto p-3">
                        {filteredDocuments.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <FileText size={40} className="mx-auto mb-3 opacity-30" />
                                <p className="text-sm italic">Aucun document</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredDocuments.map((docItem) => (
                                    <div
                                        key={docItem.id}
                                        className={`p-3 border-l-4 bg-white shadow-sm ${
                                            docItem.type === 'devis' ? 'border-blue-500' : 'border-green-500'
                                        } ${editingDocId === docItem.id ? 'ring-2 ring-orange-400' : ''}`}
                                        onClick={() => { loadDocument(docItem); setMobileView('preview'); }}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-1.5 py-0.5 text-[7px] uppercase font-bold rounded ${
                                                docItem.type === 'devis' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                                            }`}>
                                                {docItem.type}
                                            </span>
                                            <span className="text-xs font-bold">N° {docItem.invoiceNumber}</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); cycleDocumentStatus(docItem.id, docItem.status); }}
                                                className={`text-[7px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                                    docItem.status === 'payé' ? 'bg-green-500 text-white' :
                                                    docItem.status === 'à payer' ? 'bg-orange-500 text-white' :
                                                    'bg-blue-500 text-white'
                                                }`}
                                            >
                                                {docItem.status || 'émis'}
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">{docItem.clientName}</p>
                                                <p className="text-[10px] text-gray-400">
                                                    {docItem.createdAt?.toDate
                                                        ? new Date(docItem.createdAt.toDate()).toLocaleDateString('fr-FR')
                                                        : new Date(docItem.date).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-[#B88A44]">{docItem.totalTTC?.toFixed(2)} €</span>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteDocument(docItem.id); }}
                                                    className="p-1.5 text-red-400 hover:text-red-600"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL LISTE DES DOCUMENTS - Desktop uniquement */}
            {showDocumentsList && (
                <div className="hidden lg:flex fixed inset-0 z-[9999] items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#1A1A1A]/90 backdrop-blur-sm" onClick={() => setShowDocumentsList(false)} />
                    <div className="relative bg-white w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border-t-4 border-[#B88A44] rounded-sm overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] p-4 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <FileText size={20} className="text-[#B88A44]" />
                                <h2 className="text-white text-sm font-bold uppercase tracking-widest">
                                    Tous les Documents ({savedDocuments.length})
                                </h2>
                            </div>
                            <button onClick={() => setShowDocumentsList(false)} className="text-white hover:bg-white/20 p-2 rounded-full transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Filtres */}
                        <div className="p-4 bg-[#F7F5F0] border-b border-[#B88A44]/20 flex flex-wrap gap-3 items-center">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setDocumentFilter('all')}
                                    className={`px-3 py-1.5 text-[9px] uppercase font-bold tracking-wider rounded-sm transition-all ${
                                        documentFilter === 'all' ? 'bg-[#1A1A1A] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    Tous ({savedDocuments.length})
                                </button>
                                <button
                                    onClick={() => setDocumentFilter('devis')}
                                    className={`px-3 py-1.5 text-[9px] uppercase font-bold tracking-wider rounded-sm transition-all ${
                                        documentFilter === 'devis' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    Devis ({savedDocuments.filter(d => d.type === 'devis').length})
                                </button>
                                <button
                                    onClick={() => setDocumentFilter('facture')}
                                    className={`px-3 py-1.5 text-[9px] uppercase font-bold tracking-wider rounded-sm transition-all ${
                                        documentFilter === 'facture' ? 'bg-green-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    Factures ({savedDocuments.filter(d => d.type === 'facture').length})
                                </button>
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher par client ou n°..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-sm outline-none focus:border-[#B88A44]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Liste des documents */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {filteredDocuments.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <FileText size={48} className="mx-auto mb-3 opacity-30" />
                                    <p className="text-sm italic">Aucun document trouvé</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredDocuments.map((docItem) => (
                                        <div
                                            key={docItem.id}
                                            className={`p-4 border-l-4 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer ${
                                                docItem.type === 'devis' ? 'border-blue-500' : 'border-green-500'
                                            } ${editingDocId === docItem.id ? 'ring-2 ring-orange-400' : ''}`}
                                            onClick={() => loadDocument(docItem)}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`px-2 py-0.5 text-[8px] uppercase font-bold tracking-wider rounded ${
                                                            docItem.type === 'devis' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                                                        }`}>
                                                            {docItem.type}
                                                        </span>
                                                        <span className="text-sm font-bold">N° {docItem.invoiceNumber}</span>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); cycleDocumentStatus(docItem.id, docItem.status); }}
                                                            className={`text-[8px] uppercase font-bold px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-all ${
                                                                docItem.status === 'payé' ? 'bg-green-500 text-white' :
                                                                docItem.status === 'à payer' ? 'bg-orange-500 text-white' :
                                                                'bg-blue-500 text-white'
                                                            }`}
                                                            title="Cliquer pour changer le statut"
                                                        >
                                                            {docItem.status || 'émis'}
                                                        </button>
                                                        {editingDocId === docItem.id && (
                                                            <span className="text-[8px] uppercase font-bold text-orange-500 bg-orange-100 px-2 py-0.5 rounded">
                                                                En cours d&apos;édition
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <span className="font-medium text-[#1A1A1A]">{docItem.clientName}</span>
                                                        <span className="text-gray-400">|</span>
                                                        <span className="text-gray-500">
                                                            {docItem.createdAt?.toDate
                                                                ? new Date(docItem.createdAt.toDate()).toLocaleDateString('fr-FR')
                                                                : new Date(docItem.date).toLocaleDateString('fr-FR')}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-1 text-[10px] text-gray-400">
                                                        {docItem.categories?.length > 0 && <span>{docItem.categories.length} prestation(s)</span>}
                                                        {docItem.products?.length > 0 && <span>{docItem.products.length} produit(s)</span>}
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col items-end gap-2">
                                                    <span className="text-lg font-bold text-[#B88A44]">{docItem.totalTTC?.toFixed(2)} €</span>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); loadDocument(docItem); }}
                                                            className="text-[#B88A44] hover:text-[#1A1A1A] p-1 transition-colors"
                                                            title="Modifier"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); deleteDocument(docItem.id); }}
                                                            className="text-red-400 hover:text-red-600 p-1 transition-colors"
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer avec totaux */}
                        {filteredDocuments.length > 0 && (
                            <div className="p-4 bg-[#1A1A1A] text-white flex items-center justify-between">
                                <span className="text-[10px] uppercase tracking-widest opacity-60">
                                    {filteredDocuments.length} document(s)
                                </span>
                                <div className="text-right">
                                    <span className="text-[10px] uppercase tracking-widest opacity-60 mr-3">Total TTC :</span>
                                    <span className="text-xl font-bold text-[#B88A44]">
                                        {filteredDocuments.reduce((acc, d) => acc + (d.totalTTC || 0), 0).toFixed(2)} €
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default function FacturationPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen text-[#B88A44] font-serif italic">Chargement...</div>}>
            <FacturationContent />
        </Suspense>
    );
}