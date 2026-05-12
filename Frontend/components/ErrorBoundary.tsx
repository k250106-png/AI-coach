'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { Box, Card, CardContent, Button, Typography } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '70vh',
            p: 2,
          }}
        >
          <Card
            sx={{
              maxWidth: 500,
              width: '100%',
              background: 'rgba(23, 37, 84, 0.8)',
              border: '1px solid rgba(147, 197, 253, 0.2)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ mb: 2 }}>
                <ErrorOutline sx={{ fontSize: 48, color: '#FCA5A5' }} />
              </Box>
              <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
                Something went wrong
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: '#D0D5E8', mb: 3 }}
              >
                {this.state.error?.message || 'An unexpected error occurred'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  onClick={() => this.setState({ hasError: false, error: null })}
                  sx={{
                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  }}
                >
                  Try again
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => (window.location.href = '/')}
                  sx={{
                    borderColor: 'rgba(147, 197, 253, 0.4)',
                    color: '#93C5FD',
                    '&:hover': {
                      borderColor: '#93C5FD',
                      background: 'rgba(147, 197, 253, 0.1)',
                    },
                  }}
                >
                  Go Home
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}
