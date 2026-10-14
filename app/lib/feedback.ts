// ─────────────────────────────────────────────────────────────
// Notifications et confirmations de l'admin (remplacent alert/confirm)
// Utilisation : notify("Enregistré !")  ·  if (!(await askConfirm("Supprimer ?"))) return;
// L'affichage est fait par <AdminFeedback /> (monté dans app/admin/layout.tsx).
// ─────────────────────────────────────────────────────────────

export type NotifyType = 'success' | 'error' | 'info';

export interface Toast { id: number; message: string; type: NotifyType }
export interface ConfirmRequest { id: number; message: string; resolve: (ok: boolean) => void }

type Listener = { toast?: (t: Toast) => void; confirm?: (c: ConfirmRequest) => void };
const listeners = new Set<Listener>();
let nextId = 1;

export function subscribeFeedback(l: Listener) {
    listeners.add(l);
    return () => { listeners.delete(l); };
}

function guessType(message: string): NotifyType {
    return /^(erreur|impossible|veuillez|vous avez déjà|le titre est obligatoire)/i.test(message.trim()) ? 'error' : 'success';
}

export function notify(message: string, type?: NotifyType) {
    const t: Toast = { id: nextId++, message, type: type ?? guessType(message) };
    if (listeners.size === 0) { console.log(message); return; }
    listeners.forEach((l) => l.toast?.(t));
}

export function askConfirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
        const handlers = [...listeners].filter((l) => l.confirm);
        if (handlers.length === 0) { resolve(window.confirm(message)); return; }
        handlers[0].confirm!({ id: nextId++, message, resolve });
    });
}
