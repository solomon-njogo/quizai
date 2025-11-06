import { Container, Typography, Box, Paper, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  CloudUpload as CloudUploadIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        flex: 1,
        width: '100%',
        backgroundColor: '#F7F7F7',
        py: { xs: 3, sm: 6, md: 8 },
        px: { xs: 2, sm: 3, md: 4 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container
        component="main"
        maxWidth="md"
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography
          component="h1"
          variant="h2"
          sx={{
            mb: { xs: 1.5, sm: 2 },
            fontWeight: 700,
            color: '#1CB0F6',
            textAlign: 'center',
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
          }}
        >
          Welcome to QuizAI!
        </Typography>
        <Typography
          variant="h6"
          sx={{
            mb: { xs: 3, sm: 4 },
            color: '#6B7280',
            textAlign: 'center',
            fontWeight: 400,
            fontSize: { xs: '1rem', sm: '1.25rem' },
            px: { xs: 2, sm: 0 },
          }}
        >
          Transform your learning with AI-powered quizzes
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
          }}
        >
          {user && (
            <Box sx={{ textAlign: 'center', width: '100%' }}>
              <Typography
                variant="body1"
                sx={{
                  color: '#6B7280',
                  mb: 1,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                Signed in as
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#1F2937',
                  fontWeight: 600,
                  mb: 3,
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  wordBreak: 'break-word',
                }}
              >
                {user.email}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#6B7280',
                  mb: 3,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  px: { xs: 1, sm: 0 },
                }}
              >
                Manage your course materials and create AI-powered quizzes
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<FolderIcon />}
                    onClick={() => navigate('/course-materials')}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    }}
                  >
                    View Course Materials
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<CloudUploadIcon />}
                    onClick={() => navigate('/course-materials')}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    }}
                  >
                    Upload Material
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Home;

