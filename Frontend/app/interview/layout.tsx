import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interview Practice - Vetto AI Interview Coach',
  description: 'Live mock interview with AI feedback, STAR framework analysis, and personalized coaching.',
};

export default function InterviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
