'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import {
    Package, Plus, Trash2, Edit2, Save, X, Wine, Sparkles, ShoppingBag,
    ArrowLeft, Search, Euro, FolderPlus, Folder, Tag
} from 'lucide-react';
import Link from 'next/link';

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

const DEFAULT_CATEGORIES: ProductCategory[] = [
    { id: 'menage', name: 'Produits Ménagers', icon: 'sparkles' },
    { id: 'vin', name: 'Vins & Spiritueux', icon: 'wine' },
    { id: 'autre', name: 'Autres Produits', icon: 'shopping-bag' },
];

const ICON_OPTIONS = [
    { id: 'sparkles', name: 'Ménage', icon: Sparkles },
    { id: 'wine', name: 'Vin', icon: Wine },
    { id: 'shopping-bag', name: 'Shopping', icon: ShoppingBag },
    { id: 'package', name: 'Colis', icon: Package },
    { id: 'folder', name: 'Dossier', icon: Folder },
    { id: 'tag', name: 'Tag', icon: Tag },
];

const getIconComponent = (iconId: string) => {
    const found = ICON_OPTIONS.find(i => i.id === iconId);
    return found ? found.icon : Package;
};

export default function CatalogueProduits() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        category: '',
        unit: 'unité'
    });

    const [categoryFormData, setCategoryFormData] = useState({
        name: '',
        icon: 'package'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Charger les produits
            const productsSnap = await getDocs(collection(db, "products"));
            const productsData = productsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
            setProducts(productsData);

            // Charger les catégories
            const categoriesSnap = await getDocs(collection(db, "productCategories"));
            if (categoriesSnap.empty) {
                // Si pas de catégories, créer les catégories par défaut
                for (const cat of DEFAULT_CATEGORIES) {
                    await addDoc(collection(db, "productCategories"), {
                        name: cat.name,
                        icon: cat.icon
                    });
                }
                // Recharger
                const newCategoriesSnap = await getDocs(collection(db, "productCategories"));
                setCategories(newCategoriesSnap.docs.map(d => ({ id: d.id, ...d.data() } as ProductCategory)));
            } else {
                setCategories(categoriesSnap.docs.map(d => ({ id: d.id, ...d.data() } as ProductCategory)));
            }
        } catch (error) {
            console.error("Erreur chargement:", error);
        } finally {
            setLoading(false);
        }
    };

    // PRODUITS
    const handleAddProduct = async () => {
        if (!formData.name || formData.price <= 0 || !formData.category) return;

        try {
            await addDoc(collection(db, "products"), {
                name: formData.name,
                description: formData.description,
                price: formData.price,
                category: formData.category,
                unit: formData.unit
            });
            await fetchData();
            resetForm();
            setShowAddModal(false);
        } catch (error) {
            console.error("Erreur ajout produit:", error);
        }
    };

    const handleUpdateProduct = async () => {
        if (!editingProduct || !formData.name || formData.price <= 0) return;

        try {
            await updateDoc(doc(db, "products", editingProduct.id), {
                name: formData.name,
                description: formData.description,
                price: formData.price,
                category: formData.category,
                unit: formData.unit
            });
            await fetchData();
            resetForm();
            setEditingProduct(null);
        } catch (error) {
            console.error("Erreur mise à jour produit:", error);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm("Supprimer ce produit ?")) return;

        try {
            await deleteDoc(doc(db, "products", id));
            await fetchData();
        } catch (error) {
            console.error("Erreur suppression produit:", error);
        }
    };

    const startEditingProduct = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            category: product.category,
            unit: product.unit
        });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: 0,
            category: selectedCategory || '',
            unit: 'unité'
        });
    };

    const openAddModal = () => {
        resetForm();
        setFormData(prev => ({ ...prev, category: selectedCategory || (categories[0]?.id || '') }));
        setShowAddModal(true);
    };

    // CATÉGORIES
    const handleAddCategory = async () => {
        if (!categoryFormData.name) return;

        try {
            await addDoc(collection(db, "productCategories"), {
                name: categoryFormData.name,
                icon: categoryFormData.icon
            });
            await fetchData();
            resetCategoryForm();
            setShowCategoryModal(false);
        } catch (error) {
            console.error("Erreur ajout catégorie:", error);
        }
    };

    const handleUpdateCategory = async () => {
        if (!editingCategory || !categoryFormData.name) return;

        try {
            await updateDoc(doc(db, "productCategories", editingCategory.id), {
                name: categoryFormData.name,
                icon: categoryFormData.icon
            });
            await fetchData();
            resetCategoryForm();
            setEditingCategory(null);
            setShowCategoryModal(false);
        } catch (error) {
            console.error("Erreur mise à jour catégorie:", error);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        const productsInCategory = products.filter(p => p.category === id).length;
        if (productsInCategory > 0) {
            alert(`Impossible de supprimer cette catégorie car elle contient ${productsInCategory} produit(s).`);
            return;
        }
        if (!confirm("Supprimer cette catégorie ?")) return;

        try {
            await deleteDoc(doc(db, "productCategories", id));
            if (selectedCategory === id) {
                setSelectedCategory(null);
            }
            await fetchData();
        } catch (error) {
            console.error("Erreur suppression catégorie:", error);
        }
    };

    const startEditingCategory = (category: ProductCategory) => {
        setEditingCategory(category);
        setCategoryFormData({
            name: category.name,
            icon: category.icon
        });
        setShowCategoryModal(true);
    };

    const resetCategoryForm = () => {
        setCategoryFormData({
            name: '',
            icon: 'package'
        });
        setEditingCategory(null);
    };

    const openCategoryModal = () => {
        resetCategoryForm();
        setShowCategoryModal(true);
    };

    const filteredProducts = products.filter(p => {
        const matchesCategory = !selectedCategory || p.category === selectedCategory;
        const matchesSearch = searchQuery === '' ||
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const selectedCategoryData = categories.find(c => c.id === selectedCategory);
    const CategoryIcon = selectedCategoryData ? getIconComponent(selectedCategoryData.icon) : Package;

    return (
        <div className="h-[91.5vh] w-full flex">
            {/* Sidebar Catégories */}
            <div className="w-[220px] h-full flex flex-col bg-gradient-to-b from-[#1A1A1A] to-[#2A2A2A] p-4 flex-shrink-0">
                <Link href="/admin/facturation">
                    <button className="w-full mb-6 flex items-center gap-2 text-white/70 hover:text-white text-[10px] uppercase tracking-widest transition-all">
                        <ArrowLeft size={14} /> Retour Facturation
                    </button>
                </Link>

                <div className="mb-6">
                    <span className="text-[#B88A44] text-[9px] uppercase tracking-[0.3em] font-bold block mb-1">
                        La Clé Provençale
                    </span>
                    <h1 className="text-white text-lg font-serif uppercase tracking-widest">
                        Catalogue <span className="text-[#B88A44]">Produits</span>
                    </h1>
                </div>

                {/* Bouton Nouvelle Catégorie */}
                <button
                    onClick={openCategoryModal}
                    className="w-full mb-4 p-2 border-2 border-dashed border-[#B88A44]/50 rounded-sm text-[#B88A44] hover:bg-[#B88A44]/10 transition-all flex items-center justify-center gap-2"
                >
                    <FolderPlus size={16} />
                    <span className="text-[9px] uppercase font-bold tracking-wider">Nouvelle Catégorie</span>
                </button>

                {/* Liste des catégories */}
                <div className="flex-1 overflow-y-auto space-y-2">
                    {/* Toutes les catégories */}
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`w-full p-3 rounded-sm border transition-all text-left ${
                            selectedCategory === null
                                ? 'bg-[#B88A44] border-[#B88A44]'
                                : 'bg-white/5 border-white/10 hover:bg-[#B88A44]/20 hover:border-[#B88A44]/50'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <Package size={18} className={selectedCategory === null ? 'text-white' : 'text-[#B88A44]'} />
                            <div>
                                <span className={`text-[10px] uppercase font-bold tracking-wider block ${selectedCategory === null ? 'text-white' : 'text-white/80'}`}>
                                    Tous les produits
                                </span>
                                <span className={`text-[9px] ${selectedCategory === null ? 'text-white/70' : 'text-[#B88A44]/70'}`}>
                                    {products.length} produit(s)
                                </span>
                            </div>
                        </div>
                    </button>

                    {categories.map((cat) => {
                        const Icon = getIconComponent(cat.icon);
                        const count = products.filter(p => p.category === cat.id).length;
                        const isSelected = selectedCategory === cat.id;
                        return (
                            <div key={cat.id} className="relative group">
                                <button
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`w-full p-3 rounded-sm border transition-all text-left ${
                                        isSelected
                                            ? 'bg-[#B88A44] border-[#B88A44]'
                                            : 'bg-white/5 border-white/10 hover:bg-[#B88A44]/20 hover:border-[#B88A44]/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon size={18} className={isSelected ? 'text-white' : 'text-[#B88A44]'} />
                                        <div className="flex-1 min-w-0">
                                            <span className={`text-[10px] uppercase font-bold tracking-wider block truncate ${isSelected ? 'text-white' : 'text-white/80'}`}>
                                                {cat.name}
                                            </span>
                                            <span className={`text-[9px] ${isSelected ? 'text-white/70' : 'text-[#B88A44]/70'}`}>
                                                {count} produit(s)
                                            </span>
                                        </div>
                                    </div>
                                </button>
                                {/* Boutons édition/suppression */}
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); startEditingCategory(cat); }}
                                        className="p-1 text-white/50 hover:text-white transition-colors"
                                    >
                                        <Edit2 size={12} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                                        className="p-1 text-white/50 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-[8px] text-white/30 uppercase tracking-wider text-center">
                        {categories.length} catégorie(s) • {products.length} produit(s)
                    </div>
                </div>
            </div>

            {/* Contenu Principal */}
            <div className="flex-1 h-full flex flex-col p-6 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#B88A44] rounded-sm flex items-center justify-center">
                            <CategoryIcon size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-serif uppercase tracking-widest text-[#1A1A1A]">
                                {selectedCategoryData?.name || 'Tous les produits'}
                            </h2>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                                {filteredProducts.length} produit(s)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 text-sm bg-white border border-[#B88A44]/20 rounded-sm outline-none focus:border-[#B88A44] w-[200px]"
                            />
                        </div>
                        <button
                            onClick={openAddModal}
                            className="bg-[#B88A44] text-white px-4 py-2 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 hover:bg-[#A07A34] transition-all rounded-sm"
                        >
                            <Plus size={16} /> Ajouter Produit
                        </button>
                    </div>
                </div>

                {/* Liste des Produits */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-20 text-gray-400">Chargement...</div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-20">
                            <Package size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-400 italic">Aucun produit {selectedCategory ? 'dans cette catégorie' : ''}</p>
                            <button
                                onClick={openAddModal}
                                className="mt-4 text-[#B88A44] text-sm underline hover:no-underline"
                            >
                                Ajouter un produit
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredProducts.map((product) => {
                                const productCategory = categories.find(c => c.id === product.category);
                                return (
                                    <div
                                        key={product.id}
                                        className="bg-white p-4 rounded-sm border border-[#B88A44]/20 hover:border-[#B88A44]/50 transition-all group"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Package size={16} className="text-[#B88A44]" />
                                                <h3 className="font-serif font-bold text-[#1A1A1A]">{product.name}</h3>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => startEditingProduct(product)}
                                                    className="p-1 text-gray-400 hover:text-[#B88A44] transition-colors"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {product.description && (
                                            <p className="text-[11px] text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                                        )}

                                        <div className="flex items-center justify-between pt-3 border-t border-[#B88A44]/10">
                                            <div>
                                                <span className="text-[9px] text-gray-400 uppercase block">{product.unit}</span>
                                                {productCategory && (
                                                    <span className="text-[8px] text-[#B88A44] uppercase">{productCategory.name}</span>
                                                )}
                                            </div>
                                            <span className="text-lg font-bold text-[#B88A44]">{product.price.toFixed(2)} €</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Ajout/Edition Produit */}
            {(showAddModal || editingProduct) && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-sm w-full max-w-md shadow-2xl">
                        <div className="bg-gradient-to-r from-[#B88A44] to-[#A07A34] p-4 flex items-center justify-between">
                            <h3 className="text-white font-bold uppercase tracking-widest text-sm">
                                {editingProduct ? 'Modifier le Produit' : 'Nouveau Produit'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setEditingProduct(null);
                                    resetForm();
                                }}
                                className="text-white hover:bg-white/20 p-1 rounded-full transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-[#B88A44] mb-1 block tracking-widest">
                                    Nom du produit *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-3 text-sm border border-[#B88A44]/20 rounded-sm outline-none focus:border-[#B88A44]"
                                    placeholder="Ex: Produit vaisselle écologique"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-bold text-[#B88A44] mb-1 block tracking-widest">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-3 text-sm border border-[#B88A44]/20 rounded-sm outline-none focus:border-[#B88A44] resize-none"
                                    rows={2}
                                    placeholder="Description optionnelle..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-[#B88A44] mb-1 block tracking-widest">
                                        Prix (€) *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                            className="w-full p-3 text-sm border border-[#B88A44]/20 rounded-sm outline-none focus:border-[#B88A44] pr-8"
                                        />
                                        <Euro size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase font-bold text-[#B88A44] mb-1 block tracking-widest">
                                        Unité
                                    </label>
                                    <select
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        className="w-full p-3 text-sm border border-[#B88A44]/20 rounded-sm outline-none focus:border-[#B88A44]"
                                    >
                                        <option value="unité">Unité</option>
                                        <option value="bouteille">Bouteille</option>
                                        <option value="litre">Litre</option>
                                        <option value="kg">Kilogramme</option>
                                        <option value="lot">Lot</option>
                                        <option value="boîte">Boîte</option>
                                        <option value="pack">Pack</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-bold text-[#B88A44] mb-1 block tracking-widest">
                                    Catégorie *
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full p-3 text-sm border border-[#B88A44]/20 rounded-sm outline-none focus:border-[#B88A44]"
                                >
                                    <option value="">Sélectionner une catégorie...</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="p-4 border-t border-[#B88A44]/20 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setEditingProduct(null);
                                    resetForm();
                                }}
                                className="px-4 py-2 text-[10px] uppercase font-bold tracking-widest text-gray-600 hover:text-gray-800 transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                                disabled={!formData.name || formData.price <= 0 || !formData.category}
                                className="bg-[#B88A44] text-white px-6 py-2 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 hover:bg-[#A07A34] transition-all rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save size={14} /> {editingProduct ? 'Mettre à jour' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Ajout/Edition Catégorie */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-sm w-full max-w-md shadow-2xl">
                        <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] p-4 flex items-center justify-between">
                            <h3 className="text-white font-bold uppercase tracking-widest text-sm">
                                {editingCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowCategoryModal(false);
                                    resetCategoryForm();
                                }}
                                className="text-white hover:bg-white/20 p-1 rounded-full transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-[#B88A44] mb-1 block tracking-widest">
                                    Nom de la catégorie *
                                </label>
                                <input
                                    type="text"
                                    value={categoryFormData.name}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                                    className="w-full p-3 text-sm border border-[#B88A44]/20 rounded-sm outline-none focus:border-[#B88A44]"
                                    placeholder="Ex: Produits Bio"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-bold text-[#B88A44] mb-2 block tracking-widest">
                                    Icône
                                </label>
                                <div className="grid grid-cols-6 gap-2">
                                    {ICON_OPTIONS.map((option) => {
                                        const Icon = option.icon;
                                        const isSelected = categoryFormData.icon === option.id;
                                        return (
                                            <button
                                                key={option.id}
                                                onClick={() => setCategoryFormData({ ...categoryFormData, icon: option.id })}
                                                className={`p-3 rounded-sm border-2 transition-all flex flex-col items-center gap-1 ${
                                                    isSelected
                                                        ? 'border-[#B88A44] bg-[#B88A44]/10'
                                                        : 'border-gray-200 hover:border-[#B88A44]/50'
                                                }`}
                                            >
                                                <Icon size={20} className={isSelected ? 'text-[#B88A44]' : 'text-gray-400'} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Aperçu */}
                            <div className="p-4 bg-gray-50 rounded-sm">
                                <p className="text-[9px] uppercase text-gray-400 mb-2">Aperçu</p>
                                <div className="flex items-center gap-3">
                                    {(() => {
                                        const Icon = getIconComponent(categoryFormData.icon);
                                        return <Icon size={24} className="text-[#B88A44]" />;
                                    })()}
                                    <span className="font-bold text-[#1A1A1A]">
                                        {categoryFormData.name || 'Nom de la catégorie'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowCategoryModal(false);
                                    resetCategoryForm();
                                }}
                                className="px-4 py-2 text-[10px] uppercase font-bold tracking-widest text-gray-600 hover:text-gray-800 transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                                disabled={!categoryFormData.name}
                                className="bg-[#1A1A1A] text-white px-6 py-2 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 hover:bg-[#2A2A2A] transition-all rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save size={14} /> {editingCategory ? 'Mettre à jour' : 'Créer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}