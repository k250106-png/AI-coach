import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Profile - Vetto AI Interview Coach',
  description: 'Update your profile, resume, and interview preferences.',
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
