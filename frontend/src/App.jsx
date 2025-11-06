import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SupabaseConfigError from './components/SupabaseConfigError';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import { AppBar, Toolbar, Typography, Button, Box, CssBaseline, Avatar } from '@mui/material';
import { isSupabaseConfigured } from './utils/supabase';
import { theme } from './theme/theme';
import './App.css';

const AppContent = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <CssBaseline />
      {user && (
        <AppBar position="static" elevation={0} sx={{ flexShrink: 0 }}>
          <Toolbar sx={{ px: { xs: 2, sm: 4 }, py: 1.5 }}>
            <Typography
              variant="h5"
              component="div"
              sx={{
                flexGrow: 1,
                fontWeight: 700,
                color: '#1CB0F6',
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
              }}
            >
              QuizAI
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
              <Avatar
                sx={{
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  bgcolor: '#1CB0F6',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  fontWeight: 600,
                }}
              >
                {user.email?.charAt(0).toUpperCase()}
              </Avatar>
              <Button
                variant="outlined"
                onClick={handleLogout}
                sx={{
                  borderRadius: 2,
                  px: { xs: 1.5, sm: 2 },
                  py: 0.75,
                  borderColor: '#E5E7EB',
                  color: '#1F2937',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  '&:hover': {
                    borderColor: '#1CB0F6',
                    backgroundColor: 'rgba(28, 176, 246, 0.08)',
                  },
                }}
              >
                Logout
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
      )}
      <Box
        component="main"
        sx={{
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

function App() {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SupabaseConfigError />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
