import { useState, useEffect } from 'react';
import { Box, AppBar, Toolbar, Typography, Avatar, Button, useMediaQuery, useTheme } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import CourseMaterialsPanel from './CourseMaterialsPanel';
import QuizzesPanel from './QuizzesPanel';
import CollapsibleTab from './CollapsibleTab';

const NotebookLayout = () => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(isMobile);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  useEffect(() => {
    // On mobile, start with panel collapsed; on desktop, start expanded
    setLeftPanelCollapsed(isMobile);
  }, [isMobile]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: '#1A1A1A',
      }}
    >
      {/* Top Navigation Bar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: '#1A1A1A',
          borderBottom: '1px solid #333333',
          flexShrink: 0,
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 }, py: 1.5, minHeight: '64px !important' }}>
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 700,
              color: '#4FC3F7',
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
                bgcolor: '#4FC3F7',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                fontWeight: 600,
                color: '#FFFFFF',
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
                borderColor: '#505050',
                color: '#FFFFFF',
                fontSize: { xs: '0.875rem', sm: '1rem' },
                '&:hover': {
                  borderColor: '#4FC3F7',
                  backgroundColor: 'rgba(79, 195, 247, 0.08)',
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
        {/* Left Panel - Course Materials (Collapsible Tab) */}
        <CollapsibleTab
          title="Sources"
          position="left"
          defaultCollapsed={isMobile}
          width={320}
          collapsedWidth={48}
          onToggle={(collapsed) => setLeftPanelCollapsed(collapsed)}
        >
          <CourseMaterialsPanel />
        </CollapsibleTab>

        {/* Center Panel - Main Content (Quizzes) */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: '#1A1A1A',
            minWidth: 0,
            position: 'relative',
          }}
        >
          <QuizzesPanel />
        </Box>

        {/* Right Panel - Tools/Actions (Collapsible Tab) - Optional for future use */}
        {/* <CollapsibleTab
          title="Tools"
          position="right"
          defaultCollapsed={true}
          width={280}
          collapsedWidth={48}
          onToggle={(collapsed) => setRightPanelCollapsed(collapsed)}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
              Tools panel content
            </Typography>
          </Box>
        </CollapsibleTab> */}
      </Box>
    </Box>
  );
};

export default NotebookLayout;

