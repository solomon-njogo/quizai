import { useState } from 'react';
import { Box, IconButton, Typography, useTheme, useMediaQuery } from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

const CollapsibleTab = ({
  title,
  children,
  position = 'left', // 'left' or 'right'
  defaultCollapsed = false,
  width = 320,
  collapsedWidth = 48,
  headerContent,
  onToggle,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [collapsed, setCollapsed] = useState(isMobile ? true : defaultCollapsed);

  const handleToggle = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    if (onToggle) {
      onToggle(newCollapsed);
    }
  };

  const isLeft = position === 'left';
  const currentWidth = collapsed ? collapsedWidth : width;

  return (
    <>
      {/* Collapsed Tab Button */}
      {collapsed && (
        <Box
          sx={{
            width: collapsedWidth,
            minWidth: collapsedWidth,
            maxWidth: collapsedWidth,
            display: { xs: isLeft ? 'none' : 'flex', md: 'flex' },
            flexDirection: 'column',
            backgroundColor: '#242424',
            borderRight: isLeft ? '1px solid #333333' : 'none',
            borderLeft: !isLeft ? '1px solid #333333' : 'none',
            position: 'relative',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
            zIndex: 10,
          }}
        >
          {/* Tab Header when collapsed */}
          <Box
            onClick={handleToggle}
            sx={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              cursor: 'pointer',
              userSelect: 'none',
              px: 1,
              py: 2,
              '&:hover': {
                backgroundColor: 'rgba(79, 195, 247, 0.08)',
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.875rem',
                letterSpacing: '0.5px',
              }}
            >
              {title}
            </Typography>
          </Box>

          {/* Expand button at bottom */}
          <IconButton
            onClick={handleToggle}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#FFFFFF',
              backgroundColor: 'rgba(79, 195, 247, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(79, 195, 247, 0.2)',
              },
            }}
          >
            {isLeft ? (
              <ChevronRightIcon sx={{ fontSize: 20 }} />
            ) : (
              <ChevronLeftIcon sx={{ fontSize: 20 }} />
            )}
          </IconButton>
        </Box>
      )}

      {/* Expanded Tab Panel */}
      {!collapsed && (
        <Box
          sx={{
            width: { xs: '100%', md: width },
            minWidth: { xs: '100%', md: width },
            maxWidth: { xs: '100%', md: width },
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#242424',
            borderRight: isLeft ? { xs: 'none', md: '1px solid #333333' } : 'none',
            borderLeft: !isLeft ? { xs: 'none', md: '1px solid #333333' } : 'none',
            position: { xs: 'absolute', md: 'relative' },
            zIndex: { xs: 20, md: 1 },
            height: '100%',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
            boxShadow: { xs: '2px 0 8px rgba(0,0,0,0.3)', md: 'none' },
          }}
        >
          {/* Tab Header when expanded */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1.5,
              borderBottom: '1px solid #333333',
              backgroundColor: '#1F1F1F',
              minHeight: 48,
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  flexShrink: 0,
                }}
              >
                {title}
              </Typography>
              {headerContent && (
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  {headerContent}
                </Box>
              )}
            </Box>
            <IconButton
              onClick={handleToggle}
              size="small"
              sx={{
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: 'rgba(79, 195, 247, 0.08)',
                },
              }}
            >
              {isLeft ? (
                <ChevronLeftIcon sx={{ fontSize: 20 }} />
              ) : (
                <ChevronRightIcon sx={{ fontSize: 20 }} />
              )}
            </IconButton>
          </Box>

          {/* Tab Content */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {children}
          </Box>
        </Box>
      )}

      {/* Collapse button on the edge when expanded (for left panel) */}
      {!collapsed && isLeft && (
        <IconButton
          onClick={handleToggle}
          sx={{
            position: 'absolute',
            left: { xs: 'auto', md: width - 12 },
            right: { xs: 8, md: 'auto' },
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 30,
            backgroundColor: '#242424',
            border: '1px solid #333333',
            borderRadius: { xs: '8px', md: '0 8px 8px 0' },
            width: { xs: 32, md: 24 },
            height: 48,
            minWidth: { xs: 32, md: 24 },
            padding: 0,
            color: '#FFFFFF',
            boxShadow: '2px 0 4px rgba(0,0,0,0.2)',
            display: { xs: 'flex', md: 'flex' },
            '&:hover': {
              backgroundColor: '#2A2A2A',
              borderColor: '#4FC3F7',
            },
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: 20 }} />
        </IconButton>
      )}

      {/* Collapse button on the edge when expanded (for right panel) */}
      {!collapsed && !isLeft && (
        <IconButton
          onClick={handleToggle}
          sx={{
            position: 'absolute',
            right: { xs: 8, md: width - 12 },
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 30,
            backgroundColor: '#242424',
            border: '1px solid #333333',
            borderRadius: { xs: '8px', md: '8px 0 0 8px' },
            width: { xs: 32, md: 24 },
            height: 48,
            minWidth: { xs: 32, md: 24 },
            padding: 0,
            color: '#FFFFFF',
            boxShadow: '-2px 0 4px rgba(0,0,0,0.2)',
            display: { xs: 'flex', md: 'flex' },
            '&:hover': {
              backgroundColor: '#2A2A2A',
              borderColor: '#4FC3F7',
            },
          }}
        >
          <ChevronRightIcon sx={{ fontSize: 20 }} />
        </IconButton>
      )}

      {/* Mobile overlay when panel is expanded */}
      {!collapsed && (
        <Box
          onClick={handleToggle}
          sx={{
            display: { xs: 'block', md: 'none' },
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 15,
          }}
        />
      )}

      {/* Mobile button to open collapsed panel */}
      {collapsed && isLeft && (
        <IconButton
          onClick={handleToggle}
          sx={{
            position: 'absolute',
            left: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 20,
            backgroundColor: '#242424',
            border: '1px solid #333333',
            borderRadius: '0 8px 8px 0',
            width: 32,
            height: 48,
            minWidth: 32,
            padding: 0,
            display: { xs: 'flex', sm: 'flex', md: 'none' },
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#2A2A2A',
              borderColor: '#4FC3F7',
            },
          }}
        >
          <ChevronRightIcon sx={{ fontSize: 20 }} />
        </IconButton>
      )}
    </>
  );
};

export default CollapsibleTab;

