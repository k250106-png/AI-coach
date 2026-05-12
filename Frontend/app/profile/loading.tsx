import { Box, CircularProgress } from '@mui/material';

export default function ProfileLoading() {
  return (
    <Box minHeight="70vh" display="grid" sx={{ placeItems: 'center' }}>
      <CircularProgress sx={{ color: 'var(--accent)' }} />
    </Box>
  );
}
