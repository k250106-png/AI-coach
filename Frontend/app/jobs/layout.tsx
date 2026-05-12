import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Jobs - Vetto AI Interview Coach',
  description: 'Find and practice for job interviews matching your target role and experience level.',
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
