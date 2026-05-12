import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Vetto AI Interview Coach',
  description: 'View your interview practice sessions, scores, and progress analytics.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
