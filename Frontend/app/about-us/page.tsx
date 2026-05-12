'use client';

import Link from 'next/link';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import BoltIcon from '@mui/icons-material/Bolt';
import FavoriteIcon from '@mui/icons-material/Favorite';

const pillars = [
  {
    title: 'Practice That Feels Real',
    description: 'Live interview flow, role-specific questioning, and guidance that mimics modern hiring rounds.',
    icon: <RocketLaunchIcon fontSize="small" />,
  },
  {
    title: 'Feedback That Is Actionable',
    description: 'We score clarity, STAR structure, confidence, and delivery so you know exactly what to improve next.',
    icon: <BoltIcon fontSize="small" />,
  },
  {
    title: 'Built For Career Momentum',
    description: 'From students to experienced professionals, MIRA helps you show your best version in interviews.',
    icon: <FavoriteIcon fontSize="small" />,
  },
];

const metrics = [
  { value: '50K+', label: 'Mock responses analyzed' },
  { value: '200+', label: 'Role-specific interview paths' },
  { value: '24/7', label: 'Always-on AI interview coach' },
];

export default function AboutUsPage() {
  return (
    <Box className="pro-page" sx={{ py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <Card className="pro-panel vetto-spotlight" data-reveal="up" sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 5 }}>
          <CardContent>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={7}>
                <Typography className="section-kicker">About MIRA</Typography>
                <Typography variant="h2" sx={{ mt: 1.5, fontWeight: 900, letterSpacing: '-0.03em' }}>
                  We built MIRA to make interview prep strategic, not random.
                </Typography>
                <Typography sx={{ mt: 2, color: 'var(--text-secondary)', maxWidth: 720, lineHeight: 1.75 }}>
                  MIRA combines AI interview simulation, recruiter-grade evaluation signals, and coaching clarity in one place.
                  The goal is simple: give every candidate a repeatable system to practice, improve, and perform with confidence.
                </Typography>

                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 3 }}>
                  <Chip label="AI Interview Coach" color="primary" />
                  <Chip label="Role-based Scenarios" color="secondary" />
                  <Chip label="Recruiter Lens" color="info" />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
                  <Button component={Link} href="/how-it-works" variant="contained" className="neon-button">
                    See How It Works
                  </Button>
                  <Button component={Link} href="/contact-us" variant="outlined">
                    Talk To Team
                  </Button>
                </Stack>
              </Grid>

              <Grid item xs={12} md={5}>
                <Box className="vetto-orbit-wrap" data-reveal="zoom">
                  {metrics.map(metric => (
                    <Box key={metric.label} className="vetto-orbit-card">
                      <Typography variant="h4" sx={{ fontWeight: 900 }}>{metric.value}</Typography>
                      <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>{metric.label}</Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          {pillars.map((pillar, index) => (
            <Grid item xs={12} md={4} key={pillar.title}>
              <Card className="pro-card" data-reveal="up" data-reveal-delay={String((index + 1) * 80)}>
                <CardContent sx={{ p: 3 }}>
                  <Box className="vetto-icon-chip">{pillar.icon}</Box>
                  <Typography variant="h6" sx={{ mt: 1.5, fontWeight: 800 }}>{pillar.title}</Typography>
                  <Typography sx={{ mt: 1.25, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    {pillar.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
