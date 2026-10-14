'use client';

// Glisser-déposer pour réordonner une liste (souris / trackpad).
// Sur écran tactile, les petites flèches restent disponibles.
import { useState } from 'react';

export function moveItem<T>(list: T[], from: number, to: number): T[] {
    if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
}

export function useDragSort<T>(items: T[], onChange: (next: T[]) => void) {
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [overIndex, setOverIndex] = useState<number | null>(null);

    const props = (index: number) => ({
        draggable: true,
        onDragStart: (e: React.DragEvent) => {
            setDragIndex(index);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', String(index)); // requis par Firefox
        },
        onDragOver: (e: React.DragEvent) => {
            if (dragIndex === null) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (overIndex !== index) setOverIndex(index);
        },
        onDrop: (e: React.DragEvent) => {
            e.preventDefault();
            if (dragIndex !== null) onChange(moveItem(items, dragIndex, index));
            setDragIndex(null);
            setOverIndex(null);
        },
        onDragEnd: () => {
            setDragIndex(null);
            setOverIndex(null);
        },
    });

    /** Classes à ajouter à un élément pour montrer l'état du glisser. */
    const stateClass = (index: number) =>
        dragIndex === index ? 'opacity-40' : overIndex === index && dragIndex !== null ? 'ring-2 ring-[#B88A44] ring-offset-2' : '';

    return { props, stateClass, dragging: dragIndex !== null };
}
