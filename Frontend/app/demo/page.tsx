import type { Metadata } from 'next';
import { Box, Container, Card, CardContent, Button, Typography, LinearProgress } from '@mui/material';
import { PlayArrow } from '@mui/icons-material';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Free Demo Interview - Vetto AI',
  description: 'Try Vetto for free with a single demo interview question. No signup required!',
};

export default function DemoPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          Try Vetto Free
        </Typography>
        <Typography variant="h6" sx={{ color: '#D0D5E8', mb: 4 }}>
          Get started with a free demo interview. No credit card required!
        </Typography>
      </Box>

      <Card
        sx={{
          background: 'rgba(23, 37, 84, 0.8)',
          border: '1px solid rgba(147, 197, 253, 0.2)',
          backdropFilter: 'blur(10px)',
          mb: 4,
        }}
      >
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Interview Progression
            </Typography>
            <LinearProgress
              variant="determinate"
              value={33}
              sx={{
                height: 8,
                borderRadius: 4,
                background: 'rgba(147, 197, 253, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)',
                  borderRadius: 4,
                },
              }}
            />
            <Typography variant="caption" sx={{ color: '#93C5FD', mt: 1, display: 'block' }}>
              1 question of 1 • Demo mode
            </Typography>
          </Box>

          <Box
            sx={{
              p: 3,
              background: 'rgba(99, 102, 241, 0.05)',
              border: '1px dashed rgba(99, 102, 241, 0.2)',
              borderRadius: 2,
              mb: 3,
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Demo Question
            </Typography>
            <Typography sx={{ color: '#D0D5E8', lineHeight: 1.6 }}>
              Describe a time when you had to handle a difficult team member. How did you approach the situation?
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              What you'll get:
            </Typography>
            <ul style={{ margin: '0 0 0 20px', paddingLeft: 0 }}>
              {[
                'Live feedback on your answer',
                'STAR framework analysis',
                'Confidence score',
                'Improvement suggestions',
              ].map(item => (
                <li
                  key={item}
                  style={{
                    color: '#D0D5E8',
                    marginBottom: '8px',
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Link href="/auth?next=/interview" style={{ flex: 1 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<PlayArrow />}
                sx={{
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  py: 1.5,
                  fontWeight: 700,
                }}
              >
                Start Demo Interview
              </Button>
            </Link>
            <Link href="/" style={{ flex: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                sx={{
                  borderColor: 'rgba(147, 197, 253, 0.4)',
                  color: '#93C5FD',
                  '&:hover': {
                    borderColor: '#93C5FD',
                    background: 'rgba(147, 197, 253, 0.1)',
                  },
                }}
              >
                Go Back
              </Button>
            </Link>
          </Box>
        </CardContent>
      </Card>

      <Card
        sx={{
          background: 'rgba(52, 211, 153, 0.05)',
          border: '1px solid rgba(52, 211, 153, 0.2)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, color: '#34D399' }}>
            ✓ Why Vetto?
          </Typography>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {[
              'AI-powered feedback from Gemini',
              'Trusted by 5000+ professionals in Pakistan',
              'Real interview scenarios for tech & corporate roles',
              'Shareable performance cards',
            ].map(item => (
              <li key={item} style={{ color: '#D0D5E8', marginBottom: '8px' }}>
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </Container>
  );
}
