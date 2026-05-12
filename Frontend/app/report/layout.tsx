import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interview Report - Vetto AI Interview Coach',
  description: 'View detailed feedback and insights from your interview practice session.',
};

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
