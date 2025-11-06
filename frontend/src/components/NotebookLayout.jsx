import { useState, useEffect } from 'react';
import { Box, AppBar, Toolbar, Typography, Avatar, Button, IconButton, useMediaQuery, useTheme } from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import CourseMaterialsPanel from './CourseMaterialsPanel';
import QuizzesPanel from './QuizzesPanel';

const NotebookLayout = () => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(isMobile);

  useEffect(() => {
    // On mobile, start with panel collapsed; on desktop, start expanded
    setLeftPanelCollapsed(isMobile);
  }, [isMobile]);

  const handleLogout = async () => {
    await logout();
  };

  const toggleLeftPanel = () => {
    setLeftPanelCollapsed(!leftPanelCollapsed);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: '#F7F7F7',
      }}
    >
      {/* Top Navigation Bar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          flexShrink: 0,
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 }, py: 1.5, minHeight: '64px !important' }}>
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 700,
              color: '#1CB0F6',
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              cursor: 'pointer',
            }}
          >
            QuizAI
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
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
              {user?.email?.charAt(0).toUpperCase()}
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

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Left Panel - Course Materials */}
        <Box
          sx={{
            width: leftPanelCollapsed ? 0 : { xs: '100%', sm: '100%', md: '320px' },
            minWidth: leftPanelCollapsed ? 0 : { xs: '100%', sm: '100%', md: '320px' },
            maxWidth: leftPanelCollapsed ? 0 : { xs: '100%', sm: '100%', md: '320px' },
            display: { xs: leftPanelCollapsed ? 'none' : 'flex', sm: leftPanelCollapsed ? 'none' : 'flex', md: 'flex' },
            flexDirection: 'column',
            borderRight: { xs: 'none', sm: 'none', md: '1px solid #E5E7EB' },
            backgroundColor: '#FFFFFF',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
            position: { xs: 'absolute', sm: 'absolute', md: 'relative' },
            zIndex: { xs: 10, sm: 10, md: 1 },
            height: { xs: '100%', sm: '100%', md: 'auto' },
            boxShadow: { xs: leftPanelCollapsed ? 'none' : '2px 0 8px rgba(0,0,0,0.1)', sm: leftPanelCollapsed ? 'none' : '2px 0 8px rgba(0,0,0,0.1)', md: 'none' },
          }}
        >
          <CourseMaterialsPanel onClose={() => setLeftPanelCollapsed(true)} />
        </Box>

        {/* Collapse/Expand Button */}
        <IconButton
          onClick={toggleLeftPanel}
          sx={{
            position: 'absolute',
            left: leftPanelCollapsed ? 0 : { xs: 'auto', md: '320px' },
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 20,
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '0 8px 8px 0',
            width: 24,
            height: 48,
            minWidth: 24,
            padding: 0,
            display: { xs: 'none', md: 'flex' },
            '&:hover': {
              backgroundColor: '#F9FAFB',
            },
          }}
        >
          {leftPanelCollapsed ? (
            <ChevronRightIcon sx={{ fontSize: 20, color: '#6B7280' }} />
          ) : (
            <ChevronLeftIcon sx={{ fontSize: 20, color: '#6B7280' }} />
          )}
        </IconButton>

        {/* Right Panel - Quizzes */}
        <Box
          sx={{
            flex: 1,
            display: { xs: leftPanelCollapsed ? 'flex' : 'none', sm: leftPanelCollapsed ? 'flex' : 'none', md: 'flex' },
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
            minWidth: 0,
          }}
        >
          <QuizzesPanel />
        </Box>

        {/* Mobile toggle button to show course materials */}
        {leftPanelCollapsed && (
          <IconButton
            onClick={toggleLeftPanel}
            sx={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 20,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '0 8px 8px 0',
              width: 32,
              height: 48,
              minWidth: 32,
              padding: 0,
              display: { xs: 'flex', sm: 'flex', md: 'none' },
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                backgroundColor: '#F9FAFB',
              },
            }}
          >
            <ChevronRightIcon sx={{ fontSize: 20, color: '#6B7280' }} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default NotebookLayout;

