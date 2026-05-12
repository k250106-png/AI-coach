'use client';

import { Box, Card, CardContent, Button, Typography, Stack } from '@mui/material';
import { Download, Share } from '@mui/icons-material';
import html2canvas from 'html2canvas';
import { useRef } from 'react';

interface ScoreCardProps {
  score: number;
  maxScore?: number;
  role: string;
  level: string;
  date: string;
  feedback?: string;
}

export default function ScoreCard({ score, maxScore = 100, role, level, date, feedback }: ScoreCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const percentage = (score / maxScore) * 100;

  const downloadImage = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0F172A',
        scale: 2,
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `vetto-score-${Date.now()}.png`;
      link.click();
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const shareOnSocial = async () => {
    const text = `I scored ${score}/100 on the ${role} interview at level ${level} on Vetto AI! 🎉 #VettoAI #InterviewPrep`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Vetto Interview Score',
          text,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text);
      alert('Text copied to clipboard!');
    }
  };

  return (
    <Card
      ref={cardRef}
      sx={{
        background: 'linear-gradient(135deg, rgba(23, 37, 84, 0.95) 0%, rgba(30, 41, 59, 0.8) 100%)',
        border: '2px solid rgba(99, 102, 241, 0.4)',
        backdropFilter: 'blur(10px)',
        p: 4,
        textAlign: 'center',
      }}
    >
      <CardContent>
        {/* Logo/Header */}
        <Typography
          sx={{
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '28px',
            fontWeight: 700,
            mb: 3,
          }}
        >
          VETTO
        </Typography>

        {/* Score Circle */}
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: `conic-gradient(#6366F1 0% ${percentage}%, rgba(99, 102, 241, 0.1) ${percentage}% 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 110,
              height: 110,
              borderRadius: '50%',
              background: '#172554',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ fontSize: '36px', fontWeight: 700, color: '#6366F1' }}>
              {score}
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#93C5FD' }}>
              / {maxScore}
            </Typography>
          </Box>
        </Box>

        {/* Details */}
        <Stack spacing={1.5} sx={{ mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: '12px', color: '#93C5FD', mb: 0.5 }}>
              ROLE
            </Typography>
            <Typography sx={{ fontWeight: 700, color: '#F7F8FD' }}>
              {role}
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontSize: '12px', color: '#93C5FD', mb: 0.5 }}>
              LEVEL
            </Typography>
            <Typography sx={{ fontWeight: 700, color: '#F7F8FD' }}>
              {level}
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontSize: '12px', color: '#93C5FD', mb: 0.5 }}>
              DATE
            </Typography>
            <Typography sx={{ fontWeight: 700, color: '#F7F8FD' }}>
              {date}
            </Typography>
          </Box>

          {feedback && (
            <Box
              sx={{
                p: 2,
                background: 'rgba(99, 102, 241, 0.05)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: 1,
                mt: 2,
              }}
            >
              <Typography sx={{ fontSize: '12px', color: '#93C5FD', mb: 1 }}>
                FEEDBACK
              </Typography>
              <Typography sx={{ fontSize: '14px', color: '#D0D5E8', lineHeight: 1.4 }}>
                {feedback}
              </Typography>
            </Box>
          )}
        </Stack>

        {/* Footer */}
        <Typography sx={{ fontSize: '12px', color: '#64748B', mb: 3 }}>
          www.vetto-ai.com • Practice Makes Perfect
        </Typography>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} sx={{ display: { xs: 'none', sm: 'flex' } }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Download />}
            onClick={downloadImage}
            sx={{
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              fontWeight: 700,
            }}
          >
            Download
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Share />}
            onClick={shareOnSocial}
            sx={{
              borderColor: '#6366F1',
              color: '#6366F1',
              '&:hover': {
                borderColor: '#8B5CF6',
                color: '#8B5CF6',
              },
            }}
          >
            Share
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
