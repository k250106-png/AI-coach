'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Box, Card, CardContent, Typography } from '@mui/material';

interface ProgressDataPoint {
  date: string;
  score: number;
  role: string;
}

interface ProgressChartProps {
  data: ProgressDataPoint[];
  title?: string;
}

export default function ProgressChart({ data, title = 'Interview Score Progress' }: ProgressChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card
        sx={{
          background: 'rgba(23, 37, 84, 0.8)',
          border: '1px solid rgba(147, 197, 253, 0.2)',
        }}
      >
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography sx={{ color: '#D0D5E8' }}>No data available yet. Start an interview to see your progress!</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        background: 'rgba(23, 37, 84, 0.8)',
        border: '1px solid rgba(147, 197, 253, 0.2)',
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
          {title}
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(147, 197, 253, 0.1)" />
            <XAxis dataKey="date" stroke="#93C5FD" style={{ fontSize: '12px' }} />
            <YAxis stroke="#93C5FD" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                background: '#172554',
                border: '1px solid rgba(147, 197, 253, 0.2)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#F7F8FD' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#6366F1"
              strokeWidth={2}
              dot={{ fill: '#6366F1', r: 5 }}
              activeDot={{ r: 7 }}
              name="Score"
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
