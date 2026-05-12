import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Vetto',
  description: 'Platform admin controls and analytics.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
