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
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          maxWidth: 600,
          width: '100%',
        }}
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Configuration Error
          </Typography>
        </Alert>
        <Typography variant="body1" paragraph>
          Supabase is not properly configured. Please ensure the following
          environment variables are set:
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <li>
            <Typography variant="body2">
              <code>VITE_SUPABASE_URL</code>
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <code>VITE_SUPABASE_ANON_KEY</code>
            </Typography>
          </li>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Create a <code>.env</code> file in the frontend directory with these
          variables.
        </Typography>
      </Paper>
    </Box>
  );
};

export default SupabaseConfigError;

