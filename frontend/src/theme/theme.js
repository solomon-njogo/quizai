import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4FC3F7',
      light: '#81D4FA',
      dark: '#29B6F6',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#4FC3F7',
      light: '#81D4FA',
      dark: '#29B6F6',
    },
    background: {
      default: '#1A1A1A',
      paper: '#242424',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
    },
    divider: '#404040',
    action: {
      active: '#4FC3F7',
      hover: 'rgba(79, 195, 247, 0.08)',
      selected: 'rgba(79, 195, 247, 0.16)',
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
    },
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontWeight: 700,
      color: '#FFFFFF',
    },
    h2: {
      fontWeight: 700,
      color: '#FFFFFF',
    },
    h3: {
      fontWeight: 700,
      color: '#FFFFFF',
    },
    h4: {
      fontWeight: 600,
      color: '#FFFFFF',
    },
    h5: {
      fontWeight: 600,
      color: '#FFFFFF',
    },
    h6: {
      fontWeight: 600,
      color: '#FFFFFF',
    },
    body1: {
      color: '#FFFFFF',
    },
    body2: {
      color: '#B0B0B0',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          backgroundColor: '#4FC3F7',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#29B6F6',
          },
        },
        outlined: {
          borderColor: '#505050',
          color: '#FFFFFF',
          '&:hover': {
            borderColor: '#4FC3F7',
            backgroundColor: 'rgba(79, 195, 247, 0.08)',
          },
        },
        text: {
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: 'rgba(79, 195, 247, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#242424',
          borderRadius: 8,
          boxShadow: 'none',
          border: '1px solid #333333',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#242424',
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: 'none',
          border: '1px solid #333333',
        },
        elevation2: {
          boxShadow: 'none',
          border: '1px solid #333333',
        },
        elevation3: {
          boxShadow: 'none',
          border: '1px solid #333333',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#242424',
            borderRadius: 8,
            '& fieldset': {
              borderColor: '#505050',
            },
            '&:hover fieldset': {
              borderColor: '#4FC3F7',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#4FC3F7',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#B0B0B0',
            '&.Mui-focused': {
              color: '#4FC3F7',
            },
          },
          '& .MuiInputBase-input': {
            color: '#FFFFFF',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A1A1A',
          boxShadow: 'none',
          borderBottom: '1px solid #333333',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover': {
            backgroundColor: 'rgba(79, 195, 247, 0.08)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: 'rgba(79, 195, 247, 0.08)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#333333',
          color: '#FFFFFF',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#242424',
          borderRadius: 8,
        },
      },
    },
  },
});

