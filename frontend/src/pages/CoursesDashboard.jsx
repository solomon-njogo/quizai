import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
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
  AppBar,
  Toolbar,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Select,
  FormControl,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import SettingsIcon from '@mui/icons-material/Settings';
import AppsIcon from '@mui/icons-material/Apps';
import DescriptionIcon from '@mui/icons-material/Description';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { getCourses, createCourse, deleteCourse } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const CoursesDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [creating, setCreating] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('recent');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

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

  const handleMenuOpen = (event, course) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedCourse(course);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedCourse(null);
  };

  const handleDelete = async () => {
    if (!selectedCourse) return;
    handleMenuClose();
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      await deleteCourse(selectedCourse.id);
      await loadCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course. Please try again.');
    }
  };

  // Get formatted counts string for a course
  const getCountsString = (course) => {
    const sourcesCount = course.materials_count || 0;
    const quizzesCount = course.quizzes_count || 0;
    return `${sourcesCount} source${sourcesCount !== 1 ? 's' : ''} • ${quizzesCount} quiz${quizzesCount !== 1 ? 'zes' : ''}`;
  };

  const recentCourses = courses.slice(0, 8); // Show first 8 as recent

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
      {/* Top Header Bar */}
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
            onClick={() => navigate('/')}
          >
            QuizAI
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            <Button
              startIcon={<SettingsIcon />}
              sx={{
                color: '#FFFFFF',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(79, 195, 247, 0.08)',
                },
              }}
            >
              Settings
            </Button>
            <Chip
              label="PRO"
              size="small"
              sx={{
                backgroundColor: '#4FC3F7',
                color: '#1A1A1A',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            />
            <IconButton sx={{ color: '#FFFFFF' }}>
              <AppsIcon />
            </IconButton>
            <IconButton sx={{ color: '#FFFFFF' }}>
              <DescriptionIcon />
            </IconButton>
            <Avatar
              sx={{
                width: { xs: 32, sm: 36 },
                height: { xs: 32, sm: 36 },
                bgcolor: '#4FC3F7',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                fontWeight: 600,
                color: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              {user?.email?.charAt(0).toUpperCase()}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation/Filter Bar */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 1.5,
          borderBottom: '1px solid #333333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 1,
          flexShrink: 0,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            sx={{
              color: viewMode === 'grid' ? '#4FC3F7' : '#B0B0B0',
              '&:hover': {
                backgroundColor: 'rgba(79, 195, 247, 0.08)',
              },
            }}
            onClick={() => setViewMode('grid')}
          >
            <ViewModuleIcon />
          </IconButton>
          <IconButton
            size="small"
            sx={{
              color: viewMode === 'list' ? '#4FC3F7' : '#B0B0B0',
              '&:hover': {
                backgroundColor: 'rgba(79, 195, 247, 0.08)',
              },
            }}
            onClick={() => setViewMode('list')}
          >
            <ViewListIcon />
          </IconButton>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              displayEmpty
              sx={{
                color: '#FFFFFF',
                backgroundColor: '#242424',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#505050',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#4FC3F7',
                },
                '& .MuiSvgIcon-root': {
                  color: '#FFFFFF',
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: '#242424',
                    border: '1px solid #333333',
                  },
                },
              }}
            >
              <MenuItem value="recent">Most recent</MenuItem>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="date">Date</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 2,
            }}
          >
            Create new
          </Button>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          px: { xs: 2, sm: 3 },
          py: 3,
        }}
      >

        {/* Recent notebooks Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              color: '#FFFFFF',
              fontWeight: 600,
              mb: 2,
              fontSize: '1.125rem',
            }}
          >
            Recent notebooks
          </Typography>

          {viewMode === 'grid' ? (
            <Grid container spacing={2}>
              {/* Create New Course Card */}
              <Grid item xs={12} sm={6} md={4} lg={3}>
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
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#4FC3F7',
                      backgroundColor: '#2A2A2A',
                    },
                  }}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <AddIcon sx={{ fontSize: 48, color: '#4FC3F7', mb: 1.5 }} />
                    <Typography variant="body1" sx={{ color: '#FFFFFF', fontWeight: 500 }}>
                      Create new notebook
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Course Cards */}
              {recentCourses.map((course) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={course.id}>
                  <Card
                    sx={{
                      height: '100%',
                      minHeight: 200,
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: '#242424',
                      border: '1px solid #333333',
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      position: 'relative',
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
                      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              backgroundColor: '#4FC3F7',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 1.5,
                              flexShrink: 0,
                            }}
                          >
                            <FolderIcon sx={{ fontSize: 28, color: '#1A1A1A' }} />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="body1"
                              component="h2"
                              sx={{
                                color: '#FFFFFF',
                                fontWeight: 500,
                                mb: 0.5,
                                fontSize: '0.9375rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {course.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#B0B0B0', fontSize: '0.8125rem', mb: 0.5 }}>
                              {formatDate(course.created_at)}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#B0B0B0', fontSize: '0.8125rem' }}>
                              {getCountsString(course)}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, course)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: '#B0B0B0',
                        '&:hover': {
                          backgroundColor: 'rgba(79, 195, 247, 0.08)',
                        },
                      }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            // List view
            <Box>
              <Card
                sx={{
                  mb: 1,
                  backgroundColor: '#242424',
                  border: '1px solid #333333',
                  borderRadius: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: '#4FC3F7',
                    backgroundColor: '#2A2A2A',
                  },
                }}
                onClick={() => setCreateDialogOpen(true)}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                  <AddIcon sx={{ fontSize: 32, color: '#4FC3F7', mr: 2 }} />
                  <Typography variant="body1" sx={{ color: '#FFFFFF', fontWeight: 500 }}>
                    Create new notebook
                  </Typography>
                </CardContent>
              </Card>
              {recentCourses.map((course) => (
                <Card
                  key={course.id}
                  sx={{
                    mb: 1,
                    backgroundColor: '#242424',
                    border: '1px solid #333333',
                    borderRadius: 2,
                    cursor: 'pointer',
                    position: 'relative',
                    '&:hover': {
                      borderColor: '#4FC3F7',
                      backgroundColor: '#2A2A2A',
                    },
                  }}
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1.5,
                        backgroundColor: '#4FC3F7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        flexShrink: 0,
                      }}
                    >
                      <FolderIcon sx={{ fontSize: 24, color: '#1A1A1A' }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body1" sx={{ color: '#FFFFFF', fontWeight: 500, mb: 0.5 }}>
                        {course.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#B0B0B0', fontSize: '0.8125rem' }}>
                        {formatDate(course.created_at)} • {getCountsString(course)}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, course)}
                      sx={{
                        color: '#B0B0B0',
                        '&:hover': {
                          backgroundColor: 'rgba(79, 195, 247, 0.08)',
                        },
                      }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {courses.length === 0 && (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                px: 2,
              }}
            >
              <FolderIcon sx={{ fontSize: 64, color: '#B0B0B0', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 1, fontWeight: 500 }}>
                No notebooks yet
              </Typography>
              <Typography variant="body2" sx={{ color: '#B0B0B0', mb: 3 }}>
                Create your first notebook to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Create new notebook
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: '#242424',
            border: '1px solid #333333',
            borderRadius: 2,
            minWidth: 180,
          },
        }}
      >
        <MenuItem
          onClick={handleDelete}
          sx={{
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: 'rgba(79, 195, 247, 0.08)',
            },
          }}
        >
          Delete
        </MenuItem>
      </Menu>

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

