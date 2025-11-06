import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import { getCourses, createCourse, deleteCourse } from '../utils/api';

const CoursesDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await getCourses();
      setCourses(response.courses || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    if (!newCourseName.trim()) return;

    try {
      setCreating(true);
      const response = await createCourse({ name: newCourseName.trim() });
      setCreateDialogOpen(false);
      setNewCourseName('');
      await loadCourses();
      // Navigate to the new course
      navigate(`/courses/${response.course.id}`);
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCourse = async (courseId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      await deleteCourse(courseId);
      await loadCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#1A1A1A', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" fontWeight="bold" sx={{ color: '#FFFFFF' }}>
            My Courses
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Create New Course Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: '100%',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundColor: '#242424',
                border: '1px solid #333333',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#4FC3F7',
                  backgroundColor: '#2A2A2A',
                },
              }}
              onClick={() => setCreateDialogOpen(true)}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <AddIcon sx={{ fontSize: 64, color: '#4FC3F7', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 500 }}>
                  Create new course
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Course Cards */}
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card
                sx={{
                  height: '100%',
                  minHeight: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#242424',
                  border: '1px solid #333333',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#4FC3F7',
                    backgroundColor: '#2A2A2A',
                  },
                }}
              >
                <CardActionArea
                  onClick={() => navigate(`/courses/${course.id}`)}
                  sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <FolderIcon sx={{ fontSize: 40, color: '#4FC3F7', mr: 1.5, mt: 0.5 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="h6" component="h2" sx={{ color: '#FFFFFF', fontWeight: 500, mb: 1 }}>
                          {course.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#B0B0B0', fontSize: '0.875rem' }}>
                          {formatDate(course.created_at)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}

          {courses.length === 0 && (
            <Grid item xs={12}>
              <Box
                sx={{
                  textAlign: 'center',
                  py: 8,
                  px: 2,
                }}
              >
                <FolderIcon sx={{ fontSize: 64, color: '#B0B0B0', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 1, fontWeight: 500 }}>
                  No courses yet
                </Typography>
                <Typography variant="body2" sx={{ color: '#B0B0B0', mb: 3 }}>
                  Create your first course to get started
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>

      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#242424',
            border: '1px solid #333333',
          }
        }}
      >
        <DialogTitle sx={{ color: '#FFFFFF', fontWeight: 600 }}>Create New Course</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Course Name"
            fullWidth
            variant="outlined"
            value={newCourseName}
            onChange={(e) => setNewCourseName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateCourse();
              }
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setCreateDialogOpen(false)} 
            disabled={creating}
            sx={{ color: '#FFFFFF' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateCourse}
            variant="contained"
            disabled={!newCourseName.trim() || creating}
            sx={{ borderRadius: 2 }}
          >
            {creating ? <CircularProgress size={20} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CoursesDashboard;

