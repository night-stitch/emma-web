'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import {
    BookOpen, Plus, Trash2, Edit2, Save, X, Search, Clock,
    ArrowLeft, FolderPlus, Folder, DollarSign, Sparkles, Home,
    Scissors, Leaf, Key, MoreHorizontal, LayoutGrid, List
} from 'lucide-react';
import Link from 'next/link';

type MobileView = 'categories' | 'list';

interface Prestation {
    id: string;
    desc: string;
    duration: number;
    category: string;
}

interface PrestationCategory {
    id: string;
    name: string;
    icon: string;
}

const ICON_OPTIONS = [
    { id: 'sparkles', name: 'Ménage', icon: Sparkles },
    { id: 'leaf', name: 'Jardin', icon: Leaf },
    { id: 'home', name: 'Maison', icon: Home },
    { id: 'key', name: 'Conciergerie', icon: Key },
    { id: 'scissors', name: 'Entretien', icon: Scissors },
    { id: 'folder', name: 'Autre', icon: Folder },
];

const DEFAULT_CATEGORIES: Omit<PrestationCategory, 'id'>[] = [
    { name: 'Ménage', icon: 'sparkles' },
    { name: 'Jardinage', icon: 'leaf' },
    { name: 'Entretien', icon: 'scissors' },
    { name: 'Conciergerie', icon: 'key' },
    { name: 'Autre', icon: 'folder' },
];

const getIconComponent = (iconId: string) => {
    const found = ICON_OPTIONS.find(i => i.id === iconId);
    return found ? found.icon : Folder;
};

export default function CataloguePage() {
    const [prestations, setPrestations] = useState<Prestation[]>([]);
    const [categories, setCategories] = useState<PrestationCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingPrestation, setEditingPrestation] = useState<Prestation | null>(null);
    const [editingCategory, setEditingCategory] = useState<PrestationCategory | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [hourlyRate, setHourlyRate] = useState(25);
    const [isEditingRate, setIsEditingRate] = useState(false);
    const [tempRate, setTempRate] = useState(25);
    const [mobileView, setMobileView] = useState<MobileView>('list');

    const [formData, setFormData] = useState({
        desc: '',
        duration: 30,
        category: ''
    });

    const [categoryFormData, setCategoryFormData] = useState({
        name: '',
        icon: 'folder'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Charger les prestations
            const prestationsSnap = await getDocs(collection(db, "prestations"));
            const prestationsData = prestationsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Prestation));
            setPrestations(prestationsData);

            // Charger les catégories
            const categoriesSnap = await getDocs(collection(db, "prestationCategories"));
            if (categoriesSnap.empty) {
                // Si pas de catégories, créer les catégories par défaut
                for (const cat of DEFAULT_CATEGORIES) {
                    await addDoc(collection(db, "prestationCategories"), {
                        name: cat.name,
                        icon: cat.icon
                    });
                }
                // Recharger
                const newCategoriesSnap = await getDocs(collection(db, "prestationCategories"));
                setCategories(newCategoriesSnap.docs.map(d => ({ id: d.id, ...d.data() } as PrestationCategory)));
            } else {
                setCategories(categoriesSnap.docs.map(d => ({ id: d.id, ...d.data() } as PrestationCategory)));
            }

            // Charger le taux horaire
            const rateDoc = await getDoc(doc(db, "settings", "hourlyRate"));
            if (rateDoc.exists()) {
                const rate = rateDoc.data().rate || 25;
                setHourlyRate(rate);
                setTempRate(rate);
            }
        } catch (error) {
            console.error("Erreur chargement:", error);
        } finally {
            setLoading(false);
        }
    };

    const saveHourlyRate = async () => {
        try {
            await setDoc(doc(db, "settings", "hourlyRate"), {
                rate: tempRate,
                updatedAt: new Date()
            });
            setHourlyRate(tempRate);
            setIsEditingRate(false);
        } catch (error) {
            console.error("Erreur sauvegarde taux:", error);
        }
    };

    const calculatePrice = (duration: number) => {
        return (duration / 60) * hourlyRate;
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0 && mins > 0) return `${hours}h${mins}`;
        if (hours > 0) return `${hours}h`;
        return `${mins}min`;
    };

    // PRESTATIONS
    const handleAddPrestation = async () => {
        if (!formData.desc || !formData.category) return;

        try {
            await addDoc(collection(db, "prestations"), {
                desc: formData.desc,
                duration: formData.duration || 30,
                category: formData.category,
                createdAt: new Date()
            });
            await fetchData();
            resetForm();
            setShowAddModal(false);
        } catch (error) {
            console.error("Erreur ajout prestation:", error);
        }
    };

    const handleUpdatePrestation = async () => {
        if (!editingPrestation || !formData.desc) return;

        try {
            await updateDoc(doc(db, "prestations", editingPrestation.id), {
                desc: formData.desc,
                duration: formData.duration,
                category: formData.category
            });
            await fetchData();
            resetForm();
            setEditingPrestation(null);
        } catch (error) {
            console.error("Erreur mise à jour prestation:", error);
        }
    };

    const handleDeletePrestation = async (id: string) => {
        if (!confirm("Supprimer cette prestation ?")) return;

        try {
            await deleteDoc(doc(db, "prestations", id));
            await fetchData();
        } catch (error) {
            console.error("Erreur suppression prestation:", error);
        }
    };

    const startEditingPrestation = (prestation: Prestation) => {
        setEditingPrestation(prestation);
        setFormData({
            desc: prestation.desc,
            duration: prestation.duration || 30,
            category: prestation.category
        });
    };

    const resetForm = () => {
        setFormData({
            desc: '',
            duration: 30,
            category: selectedCategory || ''
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
            await addDoc(collection(db, "prestationCategories"), {
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
            await updateDoc(doc(db, "prestationCategories", editingCategory.id), {
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
        const prestationsInCategory = prestations.filter(p => p.category === id).length;
        if (prestationsInCategory > 0) {
            alert(`Impossible de supprimer cette catégorie car elle contient ${prestationsInCategory} prestation(s).`);
            return;
        }
        if (!confirm("Supprimer cette catégorie ?")) return;

        try {
            await deleteDoc(doc(db, "prestationCategories", id));
            if (selectedCategory === id) {
                setSelectedCategory(null);
            }
            await fetchData();
        } catch (error) {
            console.error("Erreur suppression catégorie:", error);
        }
    };

    const startEditingCategory = (category: PrestationCategory) => {
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
            icon: 'folder'
        });
        setEditingCategory(null);
    };

    const openCategoryModal = () => {
        resetCategoryForm();
        setShowCategoryModal(true);
    };

    const filteredPrestations = prestations.filter(p => {
        const matchesCategory = !selectedCategory || p.category === selectedCategory;
        const matchesSearch = searchQuery === '' ||
            p.desc.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const selectedCategoryData = categories.find(c => c.id === selectedCategory);
    const CategoryIcon = selectedCategoryData ? getIconComponent(selectedCategoryData.icon) : BookOpen;

    return (
        <div className="h-[91.5vh] w-full flex flex-col lg:flex-row">
            {/* NAVIGATION MOBILE - Bottom tabs */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#B88A44]/20 z-50 flex shadow-lg">
                <button
                    onClick={() => setMobileView('categories')}
                    className={`flex-1 py-3 flex flex-col items-center gap-1 transition-all ${
                        mobileView === 'categories' ? 'bg-[#B88A44]/10 text-[#B88A44]' : 'text-gray-500'
                    }`}
                >
                    <LayoutGrid size={20} />
                    <span className="text-[9px] uppercase font-bold tracking-wider">Catégories</span>
                </button>
                <button
                    onClick={() => setMobileView('list')}
                    className={`flex-1 py-3 flex flex-col items-center gap-1 transition-all relative ${
                        mobileView === 'list' ? 'bg-[#B88A44]/10 text-[#B88A44]' : 'text-gray-500'
                    }`}
                >
                    <List size={20} />
                    <span className="text-[9px] uppercase font-bold tracking-wider">Prestations</span>
                    {prestations.length > 0 && (
                        <span className="absolute top-1 right-1/4 bg-[#B88A44] text-white text-[8px] px-1.5 rounded-full">{prestations.length}</span>
                    )}
                </button>
            </div>

            {/* Sidebar Catégories */}
            <div className={`w-full lg:w-[220px] h-[calc(100%-60px)] lg:h-full flex flex-col bg-gradient-to-b from-[#1A1A1A] to-[#2A2A2A] p-4 flex-shrink-0 ${
                mobileView === 'categories' ? 'block' : 'hidden lg:flex'
            }`}>
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
                        Catalogue <span className="text-[#B88A44]">Prestations</span>
                    </h1>
                </div>

                {/* Taux horaire */}
                <div className="mb-4 p-3 bg-white/5 rounded-sm border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] uppercase tracking-wider text-[#B88A44] font-bold">Taux horaire</span>
                        {!isEditingRate && (
                            <button
                                onClick={() => setIsEditingRate(true)}
                                className="text-white/50 hover:text-white transition-colors"
                            >
                                <Edit2 size={12} />
                            </button>
                        )}
                    </div>
                    {isEditingRate ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                step="0.5"
                                value={tempRate}
                                onChange={(e) => setTempRate(parseFloat(e.target.value) || 0)}
                                className="flex-1 bg-white/10 text-white p-2 rounded-sm text-sm outline-none border border-[#B88A44]"
                                autoFocus
                            />
                            <button
                                onClick={saveHourlyRate}
                                className="p-2 bg-green-500/20 text-green-400 rounded-sm hover:bg-green-500/30 transition-all"
                            >
                                <Save size={14} />
                            </button>
                            <button
                                onClick={() => { setIsEditingRate(false); setTempRate(hourlyRate); }}
                                className="p-2 bg-white/10 text-white/50 rounded-sm hover:bg-white/20 transition-all"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <DollarSign size={18} className="text-[#B88A44]" />
                            <span className="text-white text-xl font-bold">{hourlyRate.toFixed(2)} €/h</span>
                        </div>
                    )}
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
                            <BookOpen size={18} className={selectedCategory === null ? 'text-white' : 'text-[#B88A44]'} />
                            <div>
                                <span className={`text-[10px] uppercase font-bold tracking-wider block ${selectedCategory === null ? 'text-white' : 'text-white/80'}`}>
                                    Toutes les prestations
                                </span>
                                <span className={`text-[9px] ${selectedCategory === null ? 'text-white/70' : 'text-[#B88A44]/70'}`}>
                                    {prestations.length} prestation(s)
                                </span>
                            </div>
                        </div>
                    </button>

                    {categories.map((cat) => {
                        const Icon = getIconComponent(cat.icon);
                        const count = prestations.filter(p => p.category === cat.id).length;
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
                                                {count} prestation(s)
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
                        {categories.length} catégorie(s) • {prestations.length} prestation(s)
                    </div>
                </div>
            </div>

            {/* Contenu Principal */}
            <div className={`flex-1 w-full h-[calc(100%-60px)] lg:h-full flex flex-col p-4 lg:p-6 overflow-hidden ${
                mobileView === 'list' ? 'block' : 'hidden lg:flex'
            }`}>
                {/* Bouton retour mobile */}
                <button
                    onClick={() => setMobileView('categories')}
                    className="lg:hidden flex items-center gap-2 text-[#B88A44] text-[10px] uppercase tracking-widest font-bold mb-4 hover:text-[#1A1A1A] transition-colors"
                >
                    <ArrowLeft size={14} /> Retour aux catégories
                </button>

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 lg:mb-6 gap-4">
                    <div className="flex items-center gap-3 lg:gap-4">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#B88A44] rounded-sm flex items-center justify-center flex-shrink-0">
                            <CategoryIcon size={20} className="lg:w-6 lg:h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-base lg:text-xl font-serif uppercase tracking-widest text-[#1A1A1A]">
                                {selectedCategoryData?.name || 'Toutes les prestations'}
                            </h2>
                            <p className="text-[9px] lg:text-[10px] text-gray-500 uppercase tracking-wider">
                                {filteredPrestations.length} prestation(s) • {hourlyRate.toFixed(2)} €/h
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 lg:gap-3">
                        <div className="relative flex-1 lg:flex-none">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full lg:w-[200px] pl-10 pr-4 py-2 text-sm bg-white border border-[#B88A44]/20 rounded-sm outline-none focus:border-[#B88A44]"
                            />
                        </div>
                        <button
                            onClick={openAddModal}
                            className="bg-[#B88A44] text-white px-3 lg:px-4 py-2 text-[9px] lg:text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 hover:bg-[#A07A34] transition-all rounded-sm whitespace-nowrap"
                        >
                            <Plus size={16} /> <span className="hidden sm:inline">Ajouter</span> <span className="sm:hidden">+</span>
                        </button>
                    </div>
                </div>

                {/* Liste des Prestations */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-20 text-gray-400">Chargement...</div>
                    ) : filteredPrestations.length === 0 ? (
                        <div className="text-center py-20">
                            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-400 italic">Aucune prestation {selectedCategory ? 'dans cette catégorie' : ''}</p>
                            <button
                                onClick={openAddModal}
                                className="mt-4 text-[#B88A44] text-sm underline hover:no-underline"
                            >
                                Ajouter une prestation
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 pb-4">
                            {filteredPrestations.map((prestation) => {
                                const prestationCategory = categories.find(c => c.id === prestation.category);
                                const price = calculatePrice(prestation.duration || 30);
                                return (
                                    <div
                                        key={prestation.id}
                                        className="bg-white p-4 rounded-sm border border-[#B88A44]/20 hover:border-[#B88A44]/50 transition-all group"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <Clock size={16} className="text-[#B88A44] flex-shrink-0" />
                                                <h3 className="font-serif font-bold text-[#1A1A1A] text-sm lg:text-base truncate">{prestation.desc}</h3>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-100 xl:opacity-0 xl:group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                                                <button
                                                    onClick={() => startEditingPrestation(prestation)}
                                                    className="p-1.5 lg:p-1 text-gray-400 hover:text-[#B88A44] transition-colors"
                                                >
                                                    <Edit2 size={16} className="lg:w-3.5 lg:h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePrestation(prestation.id)}
                                                    className="p-1.5 lg:p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={16} className="lg:w-3.5 lg:h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#F7F5F0] text-[#1A1A1A] text-[10px] font-bold rounded-sm">
                                                <Clock size={12} className="text-[#B88A44]" />
                                                {formatDuration(prestation.duration || 30)}
                                            </span>
                                            {prestationCategory && (
                                                <span className="text-[9px] text-[#B88A44] uppercase font-bold">
                                                    {prestationCategory.name}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-[#B88A44]/10">
                                            <span className="text-[9px] text-gray-400">
                                                {prestation.duration || 30}min × {hourlyRate}€/h
                                            </span>
                                            <span className="text-lg font-bold text-[#B88A44]">{price.toFixed(2)} €</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Ajout/Edition Prestation */}
            {(showAddModal || editingPrestation) && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-sm w-full max-w-md shadow-2xl">
                        <div className="bg-gradient-to-r from-[#B88A44] to-[#A07A34] p-4 flex items-center justify-between">
                            <h3 className="text-white font-bold uppercase tracking-widest text-sm">
                                {editingPrestation ? 'Modifier la Prestation' : 'Nouvelle Prestation'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setEditingPrestation(null);
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
                                    Nom de la prestation *
                                </label>
                                <input
                                    type="text"
                                    value={formData.desc}
                                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                                    className="w-full p-3 text-sm border border-[#B88A44]/20 rounded-sm outline-none focus:border-[#B88A44]"
                                    placeholder="Ex: Ménage fin de séjour"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-[#B88A44] mb-1 block tracking-widest">
                                        Durée (minutes) *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="1"
                                            min="1"
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: Math.max(1, parseInt(e.target.value) || 1) })}
                                            className="w-full p-3 text-sm border border-[#B88A44]/20 rounded-sm outline-none focus:border-[#B88A44] pr-12"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">min</span>
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
                                        <option value="">Sélectionner...</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Aperçu du prix */}
                            <div className="p-4 bg-[#B88A44]/10 rounded-sm border-l-4 border-[#B88A44]">
                                <p className="text-[9px] uppercase tracking-widest text-[#B88A44] font-bold mb-1">Prix estimé</p>
                                <p className="text-2xl font-bold text-[#1A1A1A]">
                                    {calculatePrice(formData.duration).toFixed(2)} €
                                </p>
                                <p className="text-[9px] text-gray-500 mt-1">
                                    {formData.duration}min × {hourlyRate}€/h
                                </p>
                            </div>
                        </div>

                        <div className="p-4 border-t border-[#B88A44]/20 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setEditingPrestation(null);
                                    resetForm();
                                }}
                                className="px-4 py-2 text-[10px] uppercase font-bold tracking-widest text-gray-600 hover:text-gray-800 transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={editingPrestation ? handleUpdatePrestation : handleAddPrestation}
                                disabled={!formData.desc || !formData.category}
                                className="bg-[#B88A44] text-white px-6 py-2 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 hover:bg-[#A07A34] transition-all rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save size={14} /> {editingPrestation ? 'Mettre à jour' : 'Enregistrer'}
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
                                    placeholder="Ex: Repassage"
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