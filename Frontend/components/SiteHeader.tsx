'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, Box, Button, Chip, Stack } from '@mui/material';
import { useAuthContext } from '@/src/context/AuthContext';
import { logout } from '@/src/services/auth';
import ThemeSwitch from './ThemeSwitch';

const PROTECTED_ROUTE_PREFIXES = ['/dashboard', '/interview', '/jobs', '/report', '/profile', '/admin', '/recruiter'];

function isProtectedRoute(pathname: string) {
  if (pathname === '/report/demo') {
    return false;
  }

  return PROTECTED_ROUTE_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, authLoading } = useAuthContext();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userLabel = String(user?.displayName || user?.email || 'Signed in');
  const userAvatar = user?.photoURL || '';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navItems = useMemo(() => {
    if (!user) {
      return [
        { href: '/', label: 'Home' },
        { href: '/how-it-works', label: 'How It Works' },
        { href: '/about-us', label: 'About Us' },
        { href: '/contact-us', label: 'Contact Us' },
      ];
    }

    return [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/jobs', label: 'Jobs' },
      { href: '/interview', label: 'Interview' },
      { href: '/linkedin-optimizer', label: 'LinkedIn Optimizer' },
      ...(String(role || '').toUpperCase() === 'RECRUITER' ? [{ href: '/hiring', label: 'Hiring Intelligence' }] : []),
      ...(String(role || '').toUpperCase() === 'RECRUITER' ? [{ href: '/recruiter/applications', label: 'Recruiter CTS' }] : []),
      { href: '/profile', label: 'Profile' },
    ];
  }, [user, role]);

  const isActive = (href: string) => {
    if (!pathname) {
      return false;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const dashboardHref = user ? '/dashboard' : '/auth';
  const brandHref = !user
    ? '/'
    : String(role || '').toUpperCase() === 'RECRUITER'
      ? '/recruiter/dashboard'
      : String(role || '').toUpperCase() === 'ADMIN'
        ? '/admin/dashboard'
        : '/dashboard';
  const inProtectedRoute = pathname ? isProtectedRoute(pathname) : false;

  if (inProtectedRoute && !user) {
    return null;
  }

  return (
    <Box className={`site-header glass-header ${scrolled ? 'site-header-scrolled' : ''}`} component="header">
      <div className="brand-group">
        <Link href={brandHref} className="brand-link brand-lockup">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-text">MIRA</span>
        </Link>
      </div>

      <Stack className={`site-nav ${mobileOpen ? 'site-nav-open' : ''}`} direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
        {navItems.map(item => (
          <Link key={item.href} href={item.href} className={isActive(item.href) ? 'active' : ''}>{item.label}</Link>
        ))}

        <Stack direction="row" className="header-actions" alignItems="center">
          {!authLoading && user ? (
            <>
              <Chip
                avatar={<Avatar alt={userLabel} src={userAvatar} />}
                label={userLabel}
                variant="outlined"
                sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'inherit' }}
              />
              <Chip label={String(role || 'CANDIDATE')} color="primary" variant="outlined" />
              <Button component={Link} href={dashboardHref} size="small" variant="text" className="header-action-btn header-action-ghost">
                Open Dashboard
              </Button>
              <Button size="small" variant="contained" className="header-action-btn header-action-primary" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : !authLoading ? (
            <>
              <Button component={Link} href="/auth" size="small" variant="contained" className="header-action-btn header-action-primary">
                Sign In
              </Button>
            </>
          ) : null}
        </Stack>
      </Stack>
      <div className="site-header-right">
        <ThemeSwitch />
        <button
          type="button"
          className={`hamburger ${mobileOpen ? 'is-open' : ''}`}
          onClick={() => setMobileOpen(prev => !prev)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </Box>
  );
}
