import Link from 'next/link';
import { Box, Button, Container, Stack, Typography } from '@mui/material';

export default function NotFoundPage() {
  return (
    <Box className="pro-page" minHeight="75vh" display="grid" sx={{ placeItems: 'center' }}>
      <Container maxWidth="sm">
        <Stack spacing={2} alignItems="center" textAlign="center" className="pro-panel" sx={{ p: 4, borderRadius: 4 }}>
          <Typography variant="overline" className="section-kicker">
            404
          </Typography>
          <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: '-0.03em' }}>
            Page not found
          </Typography>
          <Typography color="text.secondary">
            This route does not exist yet. Head back home or continue to your dashboard.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button component={Link} href="/" variant="contained" className="neon-button">
              Go Home
            </Button>
            <Button component={Link} href="/dashboard" variant="outlined">
              Open Dashboard
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
