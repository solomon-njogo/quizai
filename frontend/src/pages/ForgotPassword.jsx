import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setError(error.message || 'Failed to send reset email');
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F7F7F7',
        py: { xs: 4, sm: 8 },
        px: { xs: 2, sm: 0 },
      }}
    >
      <Container component="main" maxWidth="sm">
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
            Reset Password
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              color: '#6B7280',
              textAlign: 'center',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              px: { xs: 2, sm: 0 },
            }}
          >
            No worries! We'll help you get back into your account
          </Typography>
          <Paper
            elevation={0}
            sx={{
              padding: { xs: 3, sm: 5 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              borderRadius: 4,
              border: '1px solid #E5E7EB',
              backgroundColor: '#FFFFFF',
            }}
          >
            {success ? (
              <>
                <Alert
                  severity="success"
                  sx={{
                    width: '100%',
                    mb: 3,
                    borderRadius: 2,
                  }}
                >
                  Password reset email sent! Please check your inbox.
                </Alert>
                <Box sx={{ textAlign: 'center', width: '100%' }}>
                  <Link
                    to="/login"
                    style={{
                      textDecoration: 'none',
                      color: '#1CB0F6',
                      fontWeight: 600,
                    }}
                  >
                    <Typography variant="body2">
                      Back to Sign In
                    </Typography>
                  </Link>
                </Box>
              </>
            ) : (
              <>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 3,
                    textAlign: 'center',
                    color: '#6B7280',
                  }}
                >
                  Enter your email address and we'll send you a link to reset your password.
                </Typography>
                {error && (
                  <Alert
                    severity="error"
                    sx={{
                      width: '100%',
                      mb: 3,
                      borderRadius: 2,
                    }}
                  >
                    {error}
                  </Alert>
                )}
                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    sx={{ mb: 3 }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      mb: 3,
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      borderRadius: 2,
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                  <Box sx={{ textAlign: 'center' }}>
                    <Link
                      to="/login"
                      style={{
                        textDecoration: 'none',
                        color: '#1CB0F6',
                        fontWeight: 600,
                      }}
                    >
                      <Typography variant="body2">
                        Back to Sign In
                      </Typography>
                    </Link>
                  </Box>
                </Box>
              </>
            )}
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
