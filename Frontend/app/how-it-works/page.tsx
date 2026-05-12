'use client';

import Link from 'next/link';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import HearingIcon from '@mui/icons-material/Hearing';
import InsightsIcon from '@mui/icons-material/Insights';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const steps = [
  {
    title: 'Pick Your Role Path',
    detail: 'Choose your target role, difficulty, and interview style so your session matches real hiring expectations.',
    icon: <AssignmentTurnedInIcon fontSize="small" />,
  },
  {
    title: 'Practice In Live Rounds',
    detail: 'Answer adaptive questions while Vetto tracks pacing, relevance, and confidence in real time.',
    icon: <HearingIcon fontSize="small" />,
  },
  {
    title: 'Get Structured AI Feedback',
    detail: 'Receive STAR analysis, strengths, weak spots, and tactical fixes after each response.',
    icon: <InsightsIcon fontSize="small" />,
  },
  {
    title: 'Improve And Re-run',
    detail: 'Use your report to iterate quickly and watch your interview performance trend upward over time.',
    icon: <TrendingUpIcon fontSize="small" />,
  },
];

export default function HowItWorksPage() {
  return (
    <Box className="pro-page" sx={{ py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <Card className="pro-panel vetto-spotlight" data-reveal="up" sx={{ borderRadius: 5 }}>
          <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
            <Typography className="section-kicker">How It Works</Typography>
            <Typography variant="h2" sx={{ mt: 1.5, fontWeight: 900, letterSpacing: '-0.03em' }}>
              A focused 4-step loop for interview mastery.
            </Typography>
            <Typography sx={{ mt: 2, color: 'var(--text-secondary)', maxWidth: 800, lineHeight: 1.75 }}>
              Vetto is designed like a performance system, not a one-off chatbot. Each cycle gives you measurable insight,
              practical coaching, and a clear next move.
            </Typography>
          </CardContent>
        </Card>

        <Box className="vetto-timeline" sx={{ mt: 3 }}>
          {steps.map((step, index) => (
            <Card key={step.title} className="pro-card" data-reveal={index % 2 === 0 ? 'left' : 'right'}>
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <Box className="vetto-step-pill">
                      <span>{step.icon}</span>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Step {index + 1}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={9}>
                    <Typography variant="h5" sx={{ fontWeight: 850, letterSpacing: '-0.02em' }}>
                      {step.title}
                    </Typography>
                    <Typography sx={{ mt: 1, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                      {step.detail}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }} data-reveal="up">
          <Button component={Link} href="/auth" variant="contained" className="neon-button">
            Start Practicing
          </Button>
          <Button component={Link} href="/about-us" variant="outlined">
            Why We Built This
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
