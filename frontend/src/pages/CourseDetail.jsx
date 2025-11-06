import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CourseMaterialsPanel from '../components/CourseMaterialsPanel';
import QuizzesPanel from '../components/QuizzesPanel';
import CollapsibleTab from '../components/CollapsibleTab';
import { getCourse } from '../utils/api';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(isMobile);

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  useEffect(() => {
    setLeftPanelCollapsed(isMobile);
  }, [isMobile]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCourse(courseId);
      setCourse(response.course);
    } catch (err) {
      console.error('Error loading course:', err);
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#1A1A1A',
        }}
      >
        <CircularProgress sx={{ color: '#4FC3F7' }} />
      </Box>
    );
  }

  if (error || !course) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#1A1A1A', py: 4, px: 2 }}>
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error || 'Course not found'}
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/')}
          sx={{ color: '#FFFFFF' }}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

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
      {/* Header */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          borderBottom: '1px solid #333333',
          flexShrink: 0,
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 1, color: '#FFFFFF' }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" component="h1" fontWeight="bold" sx={{ color: '#FFFFFF' }}>
          {course.name}
        </Typography>
      </Box>

      {/* Main Content Area with Collapsible Tabs */}
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
          <CourseMaterialsPanel courseId={courseId} />
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
          <QuizzesPanel courseId={courseId} />
        </Box>
      </Box>
    </Box>
  );
};

export default CourseDetail;

