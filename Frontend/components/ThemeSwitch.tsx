'use client';

import { useVettoTheme } from '@/app/theme-provider';

function MoonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="theme-switch-icon">
      <path d="M21 14.4A8.2 8.2 0 0 1 9.6 3 9 9 0 1 0 21 14.4Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="theme-switch-icon">
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function ThemeSwitch() {
  const { theme, toggleTheme, mounted } = useVettoTheme();
  const isLight = mounted && theme === 'light';
  const nextLabel = isLight ? 'Switch to Dark' : 'Switch to Light';

  return (
    <button
      type="button"
      className="theme-switch"
      onClick={toggleTheme}
      aria-label={nextLabel}
      title={nextLabel}
    >
      <span className="theme-switch-track" data-light={isLight}>
        <span className="theme-switch-thumb">{isLight ? <SunIcon /> : <MoonIcon />}</span>
      </span>
    </button>
  );
}
