import { Container, Paper, Typography, Box, Alert } from '@mui/material';

const SupabaseConfigError = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F7F7F7',
        py: { xs: 3, sm: 6, md: 8 },
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Container component="main" maxWidth="sm" sx={{ width: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography
            component="h1"
            variant="h3"
            sx={{
              mb: 1,
              fontWeight: 700,
              color: '#1CB0F6',
              textAlign: 'center',
              fontSize: { xs: '1.75rem', sm: '2.125rem', md: '3rem' },
            }}
          >
            Configuration Required
          </Typography>
          <Paper
            elevation={0}
            sx={{
              padding: { xs: 3, sm: 4, md: 5 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              maxWidth: '100%',
              borderRadius: 4,
              border: '1px solid #E5E7EB',
              backgroundColor: '#FFFFFF',
              mt: { xs: 3, sm: 4 },
            }}
          >
            <Alert
              severity="error"
              sx={{
                width: '100%',
                borderRadius: 2,
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  mb: 1,
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                Missing Supabase Configuration
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mb: 2,
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                }}
              >
                Please create a <code>.env</code> file in the frontend directory with:
              </Typography>
              <Box
                component="pre"
                sx={{
                  mt: 2,
                  p: { xs: 1.5, sm: 2 },
                  bgcolor: '#F7F7F7',
                  borderRadius: 2,
                  overflow: 'auto',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  border: '1px solid #E5E7EB',
                  width: '100%',
                  maxWidth: '100%',
                }}
              >
                {`VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`}
              </Box>
              <Typography
                variant="body2"
                sx={{
                  mt: 2,
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                }}
              >
                After adding the environment variables, restart the development server.
              </Typography>
            </Alert>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default SupabaseConfigError;

