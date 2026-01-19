'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import {
    BookOpen, Plus, Trash2, Edit2, Save, X, Search,
    TrendingUp, Package, Clock, DollarSign
} from 'lucide-react';

export default function CataloguePage() {
    const [prestations, setPrestations] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ desc: '', duration: 30, category: '' });
    const [showAddForm, setShowAddForm] = useState(false);
    const [newPrestation, setNewPrestation] = useState({ desc: '', duration: 30, category: 'Ménage' });
    const [selectedCategory, setSelectedCategory] = useState('Toutes');
    const [hourlyRate, setHourlyRate] = useState(35);
    const [isEditingRate, setIsEditingRate] = useState(false);

    const categories = ['Toutes', 'Ménage', 'Jardinage', 'Entretien', 'Conciergerie', 'Autre'];

    useEffect(() => {
        fetchPrestations();
        fetchHourlyRate();
    }, []);

    const fetchHourlyRate = async () => {
        const rateDoc = await getDoc(doc(db, "settings", "hourlyRate"));
        if (rateDoc.exists()) {
            setHourlyRate(rateDoc.data().rate || 35);
        }
    };

    const saveHourlyRate = async () => {
        await setDoc(doc(db, "settings", "hourlyRate"), {
            rate: hourlyRate,
            updatedAt: new Date()
        });
        setIsEditingRate(false);
        await fetchPrestations(); // Rafraîchir pour recalculer les prix
    };

    const calculatePrice = (duration: number) => {
        return (duration / 60) * hourlyRate;
    };

    const fetchPrestations = async () => {
        const snap = await getDocs(collection(db, "prestations"));
        setPrestations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const addPrestation = async () => {
        if (!newPrestation.desc || !newPrestation.duration) return;

        await addDoc(collection(db, "prestations"), {
            desc: newPrestation.desc,
            duration: newPrestation.duration || 30,
            category: newPrestation.category,
            createdAt: new Date()
        });

        await fetchPrestations();
        setNewPrestation({ desc: '', duration: 30, category: 'Ménage' });
        setShowAddForm(false);
    };

    const deletePrestation = async (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette prestation ?')) {
            await deleteDoc(doc(db, "prestations", id));
            await fetchPrestations();
        }
    };

    const startEdit = (prestation: any) => {
        setEditingId(prestation.id);
        setEditForm({
            desc: prestation.desc,
            duration: prestation.duration || 30,
            category: prestation.category || 'Autre'
        });
    };

    const saveEdit = async (id: string) => {
        await updateDoc(doc(db, "prestations", id), {
            desc: editForm.desc,
            duration: editForm.duration,
            category: editForm.category
        });
        await fetchPrestations();
        setEditingId(null);
    };

    const filteredPrestations = prestations.filter(p => {
        const matchesSearch = p.desc.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Toutes' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const stats = {
        total: prestations.length,
        hourlyRate: hourlyRate
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0 && mins > 0) return `${hours}h${mins}`;
        if (hours > 0) return `${hours}h`;
        return `${mins}min`;
    };

    return (
        <div className="min-h-screen p-4 lg:p-10">
            <div className="max-w-7xl mx-auto">

                {/* En-tête */}
                <div className="mb-10">
                    <div className="flex items-center gap-4 mb-2">
                        <BookOpen size={32} className="text-[#B88A44]" />
                        <div>
                            <span className="text-[#B88A44] text-[10px] uppercase tracking-[0.4em] font-bold block">
                                La Clé Provençale
                            </span>
                            <h1 className="text-[#1A1A1A] text-3xl font-serif uppercase tracking-widest leading-tight">
                                Catalogue des <span className="text-[#B88A44]">Prestations</span>
                            </h1>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 italic mt-2">
                        Gérez l'ensemble de vos prestations et services
                    </p>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-sm shadow-lg border-l-4 border-[#B88A44]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Total Prestations</p>
                                <p className="text-3xl font-bold text-[#1A1A1A]">{stats.total}</p>
                            </div>
                            <Package size={32} className="text-[#B88A44]/30" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-sm shadow-lg border-l-4 border-[#B88A44] cursor-pointer hover:shadow-xl transition-all" onClick={() => setIsEditingRate(true)}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Taux Horaire</p>
                                {isEditingRate ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            step="0.5"
                                            value={hourlyRate}
                                            onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                                            className="w-24 text-3xl font-bold text-[#1A1A1A] bg-[#F7F5F0] p-2 rounded outline-none border-2 border-[#B88A44]"
                                            autoFocus
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                saveHourlyRate();
                                            }}
                                            className="text-green-600 hover:text-green-700 p-2 bg-green-50 rounded-sm"
                                        >
                                            <Save size={20} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsEditingRate(false);
                                                fetchHourlyRate();
                                            }}
                                            className="text-gray-400 hover:text-gray-600 p-2 bg-gray-50 rounded-sm"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-3xl font-bold text-[#1A1A1A]">{stats.hourlyRate.toFixed(2)} €</p>
                                )}
                            </div>
                            <DollarSign size={32} className="text-[#B88A44]/30" />
                        </div>
                        {!isEditingRate && (
                            <p className="text-[9px] text-gray-400 mt-2 italic">Cliquer pour modifier</p>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-sm shadow-lg border-l-4 border-[#B88A44]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Catégories</p>
                                <p className="text-3xl font-bold text-[#1A1A1A]">{categories.length - 1}</p>
                            </div>
                            <TrendingUp size={32} className="text-[#B88A44]/30" />
                        </div>
                    </div>
                </div>

                {/* Barre d'actions */}
                <div className="bg-white p-6 rounded-sm shadow-lg mb-8">
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        {/* Recherche */}
                        <div className="flex-1 relative w-full">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher une prestation..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-[#F7F5F0] rounded-sm outline-none border-2 border-transparent focus:border-[#B88A44] transition-all"
                            />
                        </div>

                        {/* Filtres par catégorie */}
                        <div className="flex gap-2 flex-wrap">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 text-[10px] uppercase font-bold tracking-widest rounded-sm transition-all ${
                                        selectedCategory === cat
                                            ? 'bg-[#B88A44] text-white'
                                            : 'bg-[#F7F5F0] text-gray-600 hover:bg-[#B88A44]/20'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Bouton Ajouter */}
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="bg-[#1A1A1A] text-white px-6 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-[#B88A44] transition-all flex items-center gap-2 rounded-sm shadow-lg"
                        >
                            <Plus size={16} /> Nouvelle Prestation
                        </button>
                    </div>
                </div>

                {/* Formulaire d'ajout */}
                {showAddForm && (
                    <div className="bg-white p-8 rounded-sm shadow-2xl mb-8 border-2 border-[#B88A44]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-serif uppercase text-[#B88A44] tracking-widest">
                                Nouvelle Prestation
                            </h3>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="md:col-span-2">
                                <label className="text-[10px] uppercase font-bold text-[#B88A44] mb-2 block tracking-widest">
                                    Nom de la prestation
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: Ménage fin de séjour"
                                    value={newPrestation.desc}
                                    onChange={(e) => setNewPrestation({...newPrestation, desc: e.target.value})}
                                    className="w-full bg-[#F7F5F0] p-4 text-sm outline-none border-b-2 border-[#B88A44]/20 focus:border-[#B88A44] transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-bold text-[#B88A44] mb-2 block tracking-widest">
                                    Catégorie
                                </label>
                                <select
                                    value={newPrestation.category}
                                    onChange={(e) => setNewPrestation({...newPrestation, category: e.target.value})}
                                    className="w-full bg-[#F7F5F0] p-4 text-sm outline-none border-b-2 border-[#B88A44]/20 focus:border-[#B88A44] transition-all"
                                >
                                    {categories.filter(c => c !== 'Toutes').map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-bold text-[#B88A44] mb-2 block tracking-widest">
                                    Durée (minutes)
                                </label>
                                <input
                                    type="number"
                                    step="15"
                                    placeholder="30"
                                    value={newPrestation.duration || ''}
                                    onChange={(e) => setNewPrestation({...newPrestation, duration: parseInt(e.target.value) || 30})}
                                    className="w-full bg-[#F7F5F0] p-4 text-sm outline-none border-b-2 border-[#B88A44]/20 focus:border-[#B88A44] transition-all"
                                />
                            </div>

                            <div className="md:col-span-4">
                                <div className="bg-[#B88A44]/10 p-4 rounded-lg border-l-4 border-[#B88A44]">
                                    <p className="text-[10px] uppercase tracking-widest text-[#B88A44] font-bold mb-1">Prix estimé</p>
                                    <p className="text-2xl font-bold text-[#1A1A1A]">
                                        {calculatePrice(newPrestation.duration).toFixed(2)} €
                                    </p>
                                    <p className="text-[9px] text-gray-600 mt-1">
                                        Basé sur {newPrestation.duration}min × {hourlyRate}€/h
                                    </p>
                                </div>
                            </div>

                            <div className="md:col-span-4 flex justify-end">
                                <button
                                    onClick={addPrestation}
                                    className="bg-[#B88A44] text-white px-8 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-[#A07A34] transition-all flex items-center gap-2 rounded-sm shadow-lg"
                                >
                                    <Save size={16} /> Enregistrer
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Liste des prestations */}
                <div className="bg-white rounded-sm shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#1A1A1A] text-white">
                            <tr>
                                <th className="text-left p-4 text-[10px] uppercase tracking-widest font-bold">Prestation</th>
                                <th className="text-left p-4 text-[10px] uppercase tracking-widest font-bold">Catégorie</th>
                                <th className="text-center p-4 text-[10px] uppercase tracking-widest font-bold">Durée</th>
                                <th className="text-right p-4 text-[10px] uppercase tracking-widest font-bold">Prix Estimé</th>
                                <th className="text-center p-4 text-[10px] uppercase tracking-widest font-bold">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredPrestations.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-gray-400 italic">
                                        Aucune prestation trouvée
                                    </td>
                                </tr>
                            ) : (
                                filteredPrestations.map((prestation, index) => (
                                    <tr
                                        key={prestation.id}
                                        className={`border-b border-gray-100 hover:bg-[#F7F5F0] transition-all ${
                                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                        }`}
                                    >
                                        {editingId === prestation.id ? (
                                            <>
                                                <td className="p-4">
                                                    <input
                                                        type="text"
                                                        value={editForm.desc}
                                                        onChange={(e) => setEditForm({...editForm, desc: e.target.value})}
                                                        className="w-full bg-white border border-[#B88A44]/30 p-2 rounded-sm text-sm"
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <select
                                                        value={editForm.category}
                                                        onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                                                        className="w-full bg-white border border-[#B88A44]/30 p-2 rounded-sm text-sm"
                                                    >
                                                        {categories.filter(c => c !== 'Toutes').map(cat => (
                                                            <option key={cat} value={cat}>{cat}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="p-4">
                                                    <input
                                                        type="number"
                                                        step="15"
                                                        value={editForm.duration}
                                                        onChange={(e) => setEditForm({...editForm, duration: parseInt(e.target.value)})}
                                                        className="w-full bg-white border border-[#B88A44]/30 p-2 rounded-sm text-sm text-center"
                                                    />
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div>
                                                        <p className="text-lg font-bold text-[#B88A44]">
                                                            {calculatePrice(editForm.duration).toFixed(2)} €
                                                        </p>
                                                        <p className="text-[9px] text-gray-500">
                                                            {editForm.duration}min × {hourlyRate}€/h
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => saveEdit(prestation.id)}
                                                            className="text-green-600 hover:text-green-700 p-2 hover:bg-green-50 rounded-sm transition-all"
                                                            title="Sauvegarder"
                                                        >
                                                            <Save size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingId(null)}
                                                            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-sm transition-all"
                                                            title="Annuler"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="p-4">
                                                    <p className="font-serif text-[#1A1A1A]">{prestation.desc}</p>
                                                </td>
                                                <td className="p-4">
                                                    <span className="inline-block px-3 py-1 bg-[#B88A44]/10 text-[#B88A44] text-[9px] uppercase font-bold tracking-widest rounded-full">
                                                        {prestation.category || 'Autre'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="inline-flex items-center gap-1 text-sm font-bold text-[#1A1A1A]">
                                                        <Clock size={14} className="text-[#B88A44]" />
                                                        {formatDuration(prestation.duration || 30)}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div>
                                                        <p className="text-lg font-bold text-[#B88A44]">
                                                            {calculatePrice(prestation.duration || 30).toFixed(2)} €
                                                        </p>
                                                        <p className="text-[9px] text-gray-500">
                                                            {prestation.duration || 30}min × {hourlyRate}€/h
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => startEdit(prestation)}
                                                            className="text-[#B88A44] hover:text-[#A07A34] p-2 hover:bg-[#B88A44]/10 rounded-sm transition-all"
                                                            title="Modifier"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => deletePrestation(prestation.id)}
                                                            className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-sm transition-all"
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-[10px] text-gray-400 uppercase tracking-widest">
                    {filteredPrestations.length} prestation{filteredPrestations.length > 1 ? 's' : ''} affichée{filteredPrestations.length > 1 ? 's' : ''}
                </div>
            </div>
        </div>
    );
}