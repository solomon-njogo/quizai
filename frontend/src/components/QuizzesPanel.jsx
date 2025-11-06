import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PlayArrow as PlayArrowIcon,
  Quiz as QuizIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  getQuizzes,
  createQuiz,
  deleteQuiz,
  updateQuiz,
} from '../utils/api';

const QuizzesPanel = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizQuestions, setNewQuizQuestions] = useState('');

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getQuizzes({
        orderBy: 'created_at',
        orderDirection: 'desc',
      });
      setQuizzes(response.data.quizzes || []);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError(
        err.response?.data?.message ||
          'Failed to load quizzes. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleCreateQuiz = async () => {
    if (!newQuizTitle.trim()) {
      setError('Please enter a quiz title');
      return;
    }

    try {
      setCreating(true);
      setError(null);

      // Parse questions from text (simple format: question|option1|option2|option3|option4|correct|explanation)
      // For now, create a simple quiz structure
      // In a real implementation, you'd have a proper form for creating questions
      const questions = [];
      if (newQuizQuestions.trim()) {
        const questionLines = newQuizQuestions.trim().split('\n');
        questionLines.forEach((line, index) => {
          const parts = line.split('|');
          if (parts.length >= 7) {
            questions.push({
              question: parts[0].trim(),
              options: [
                parts[1].trim(),
                parts[2].trim(),
                parts[3].trim(),
                parts[4].trim(),
              ],
              correct: parseInt(parts[5].trim()) || 0,
              explanation: parts[6].trim(),
            });
          }
        });
      }

      // If no questions provided, create a placeholder
      if (questions.length === 0) {
        questions.push({
          question: 'Sample question - Edit to add your questions',
          options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          correct: 0,
          explanation: 'Sample explanation',
        });
      }

      const response = await createQuiz({
        title: newQuizTitle.trim(),
        questions: questions,
      });

      setQuizzes([response.data.quiz, ...quizzes]);
      setCreateDialogOpen(false);
      setNewQuizTitle('');
      setNewQuizQuestions('');
    } catch (err) {
      console.error('Error creating quiz:', err);
      setError(
        err.response?.data?.message ||
          'Failed to create quiz. Please try again.'
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClick = (quiz) => {
    setQuizToDelete(quiz);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!quizToDelete) return;

    try {
      setDeleting(true);
      await deleteQuiz(quizToDelete.id);
      setQuizzes(quizzes.filter((q) => q.id !== quizToDelete.id));
      setDeleteDialogOpen(false);
      setQuizToDelete(null);
    } catch (err) {
      console.error('Error deleting quiz:', err);
      setError(
        err.response?.data?.message ||
          'Failed to delete quiz. Please try again.'
      );
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid #E5E7EB',
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: '#1F2937',
              fontSize: '1.5rem',
            }}
          >
            Quizzes
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={fetchQuizzes}
              disabled={loading}
              size="small"
              sx={{
                border: '1px solid #E5E7EB',
                borderRadius: 2,
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{
                borderRadius: 2,
                px: 2,
                py: 1,
                textTransform: 'none',
              }}
            >
              Create Quiz
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Content Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          p: 3,
        }}
      >
        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
            }}
          >
            <CircularProgress sx={{ color: '#1CB0F6' }} />
          </Box>
        ) : quizzes.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
            }}
          >
            <QuizIcon
              sx={{
                fontSize: 64,
                color: '#D1D5DB',
                mb: 2,
              }}
            />
            <Typography
              variant="h6"
              sx={{
                color: '#6B7280',
                mb: 1,
                fontWeight: 500,
              }}
            >
              No quizzes yet
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#9CA3AF',
                mb: 3,
              }}
            >
              Create your first quiz to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
              }}
            >
              Create Quiz
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {quizzes.map((quiz) => (
              <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    border: '1px solid #E5E7EB',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(28, 176, 246, 0.15)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        mb: 2,
                        gap: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          backgroundColor: 'rgba(28, 176, 246, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <QuizIcon
                          sx={{
                            color: '#1CB0F6',
                            fontSize: 28,
                          }}
                        />
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: '#1F2937',
                            fontSize: '1.125rem',
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {quiz.title}
                        </Typography>
                        <Chip
                          label={`${quiz.questions?.length || 0} questions`}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.75rem',
                            backgroundColor: 'rgba(28, 176, 246, 0.1)',
                            color: '#1CB0F6',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#6B7280',
                        fontSize: '0.8125rem',
                      }}
                    >
                      Created: {formatDate(quiz.created_at)}
                    </Typography>
                  </CardContent>
                  <Divider />
                  <CardActions
                    sx={{
                      px: 2,
                      pb: 2,
                      pt: 1.5,
                      gap: 1,
                    }}
                  >
                    <Button
                      size="small"
                      startIcon={<PlayArrowIcon />}
                      sx={{
                        color: '#1CB0F6',
                        fontSize: '0.875rem',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: 'rgba(28, 176, 246, 0.08)',
                        },
                      }}
                    >
                      Take Quiz
                    </Button>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton
                      size="small"
                      sx={{
                        color: '#6B7280',
                        '&:hover': {
                          backgroundColor: 'rgba(28, 176, 246, 0.08)',
                        },
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(quiz)}
                      sx={{
                        color: '#FF4B4B',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 75, 75, 0.08)',
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Create Quiz Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => !creating && setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, color: '#1F2937' }}>
          Create New Quiz
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Quiz Title"
              value={newQuizTitle}
              onChange={(e) => setNewQuizTitle(e.target.value)}
              fullWidth
              placeholder="Enter quiz title"
              required
            />
            <TextField
              label="Questions (Optional)"
              value={newQuizQuestions}
              onChange={(e) => setNewQuizQuestions(e.target.value)}
              fullWidth
              multiline
              rows={6}
              placeholder="Format: question|option1|option2|option3|option4|correct_index|explanation (one per line)"
              helperText="Leave empty to create a quiz template you can edit later"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setCreateDialogOpen(false)}
            disabled={creating}
            sx={{ color: '#6B7280' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateQuiz}
            disabled={creating || !newQuizTitle.trim()}
            variant="contained"
          >
            {creating ? <CircularProgress size={20} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, color: '#1F2937' }}>
          Delete Quiz
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#6B7280' }}>
            Are you sure you want to delete "{quizToDelete?.title}"? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
            sx={{ color: '#6B7280' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={deleting}
            variant="contained"
            sx={{
              backgroundColor: '#FF4B4B',
              '&:hover': {
                backgroundColor: '#E53935',
              },
            }}
          >
            {deleting ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuizzesPanel;

