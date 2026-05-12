import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Smart Hiring - Vetto AI',
  description: 'AI-powered candidate screening and hiring platform.',
};

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
