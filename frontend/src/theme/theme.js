import { createTheme } from '@mui/material/styles';

// Color palette - blue only
const colors = {
  primary: {
    main: '#1CB0F6', // Blue
    light: '#4FC3F7',
    dark: '#0D8BD9',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#1CB0F6',
    light: '#4FC3F7',
    dark: '#0D8BD9',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#1CB0F6',
    light: '#4FC3F7',
    dark: '#0D8BD9',
  },
  error: {
    main: '#FF4B4B',
    light: '#FF6B6B',
    dark: '#E53935',
  },
  warning: {
    main: '#FFC107',
    light: '#FFD54F',
    dark: '#FFA000',
  },
  background: {
    default: '#FFFFFF',
    paper: '#FFFFFF',
    light: '#F7F7F7',
  },
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
  },
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
  },
};

// Theme
export const theme = createTheme({
  palette: {
    ...colors,
    mode: 'light',
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      color: colors.text.primary,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
      color: colors.text.primary,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
      color: colors.text.primary,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      color: colors.text.primary,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      color: colors.text.primary,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
      color: colors.text.primary,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      color: colors.text.primary,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: colors.text.secondary,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '1rem',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          padding: '12px 32px',
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(28, 176, 246, 0.3)',
          },
          '&.Mui-disabled': {
            backgroundColor: colors.border.light,
            color: colors.text.secondary,
          },
        },
        contained: {
          backgroundColor: colors.primary.main,
          color: colors.primary.contrastText,
          '&:hover': {
            backgroundColor: colors.primary.dark,
          },
        },
        outlined: {
          borderColor: colors.primary.main,
          color: colors.primary.main,
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            backgroundColor: 'rgba(28, 176, 246, 0.08)',
          },
        },
        text: {
          color: colors.primary.main,
          '&:hover': {
            backgroundColor: 'rgba(28, 176, 246, 0.08)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            '& fieldset': {
              borderColor: colors.border.medium,
              borderWidth: 2,
            },
            '&:hover fieldset': {
              borderColor: colors.primary.light,
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary.main,
              borderWidth: 2,
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: colors.primary.main,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
        },
        elevation3: {
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: colors.text.primary,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        standardSuccess: {
          backgroundColor: 'rgba(28, 176, 246, 0.1)',
          color: colors.success.dark,
        },
        standardError: {
          backgroundColor: 'rgba(255, 75, 75, 0.1)',
          color: colors.error.dark,
        },
      },
    },
  },
});

export default theme;

