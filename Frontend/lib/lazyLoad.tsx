/**
 * Lazy loading utilities for performance optimization
 * Usage:
 * const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
 *   loading: () => <LoadingFallback />,
 *   ssr: false,
 * });
 */

import dynamic from 'next/dynamic';
import { Box, CircularProgress } from '@mui/material';

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
    <CircularProgress sx={{ color: 'var(--accent-1)' }} />
  </Box>
);

// Lazy load heavy components
export const lazyLoadComponent = (importFunc: () => Promise<any>, options = {}) => {
  return dynamic(importFunc, {
    loading: () => <LoadingFallback />,
    ssr: false,
    ...options,
  });
};

// Export specific lazy-loaded components
export const LazyProgressChart = dynamic(() => import('@/components/ProgressChart'), {
  loading: () => <LoadingFallback />,
  ssr: false,
});

export const LazyScoreCard = dynamic(() => import('@/components/ScoreCard'), {
  loading: () => <LoadingFallback />,
  ssr: false,
});

export const LazyChartWidget = dynamic(() => import('@/src/components/LiveSpeechHud'), {
  loading: () => <LoadingFallback />,
  ssr: false,
});
