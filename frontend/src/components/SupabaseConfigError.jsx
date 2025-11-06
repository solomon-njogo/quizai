import { Box, Typography, Paper, Alert } from '@mui/material';

const SupabaseConfigError = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: 2,
        backgroundColor: '#1A1A1A',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          padding: 4,
          maxWidth: 600,
          width: '100%',
          backgroundColor: '#242424',
          border: '1px solid #333333',
          borderRadius: 2,
        }}
      >
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          <Typography variant="h5" component="h1" gutterBottom sx={{ color: '#FFFFFF' }}>
            Configuration Error
          </Typography>
        </Alert>
        <Typography variant="body1" paragraph sx={{ color: '#FFFFFF' }}>
          Supabase is not properly configured. Please ensure the following
          environment variables are set:
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <li>
            <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
              <code style={{ color: '#4FC3F7' }}>VITE_SUPABASE_URL</code>
            </Typography>
          </li>
          <li>
            <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
              <code style={{ color: '#4FC3F7' }}>VITE_SUPABASE_ANON_KEY</code>
            </Typography>
          </li>
        </Box>
        <Typography variant="body2" sx={{ mt: 2, color: '#B0B0B0' }}>
          Create a <code style={{ color: '#4FC3F7' }}>.env</code> file in the frontend directory with these
          variables.
        </Typography>
      </Paper>
    </Box>
  );
};

export default SupabaseConfigError;

