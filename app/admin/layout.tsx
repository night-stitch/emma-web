import type { Metadata } from 'next';
import AdminShell from './AdminShell';

// L'administration ne doit jamais apparaître dans Google
export const metadata: Metadata = {
    title: 'Administration',
    robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <AdminShell>{children}</AdminShell>;
}
