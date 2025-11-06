import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import QuizIcon from '@mui/icons-material/Quiz';
import AddIcon from '@mui/icons-material/Add';
import { getQuizzes, deleteQuiz } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import CreateQuizDialog from './CreateQuizDialog';

const QuizzesPanel = ({ courseId }) => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (courseId) {
      loadQuizzes();
    }
  }, [courseId]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getQuizzes(courseId);
      setQuizzes(response.quizzes || []);
    } catch (err) {
      console.error('Error loading quizzes:', err);
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) {
      return;
    }

    try {
      setError(null);
      await deleteQuiz(quizId);
      await loadQuizzes();
    } catch (err) {
      console.error('Error deleting quiz:', err);
      setError('Failed to delete quiz');
    }
  };

  const handleCreateSuccess = (quiz) => {
    // Refresh quiz list after successful creation
    loadQuizzes();
  };

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
          Quizzes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          size="small"
          sx={{
            backgroundColor: '#4FC3F7',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#3FB0E0',
            },
          }}
        >
          Create Quiz
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress sx={{ color: '#4FC3F7' }} />
        </Box>
      ) : quizzes.length === 0 ? (
        <Typography variant="body2" sx={{ color: '#B0B0B0', textAlign: 'center', py: 4 }}>
          No quizzes created yet
        </Typography>
      ) : (
        <List sx={{ flex: 1, overflow: 'auto' }}>
          {quizzes.map((quiz) => (
            <ListItem
              key={quiz.id}
              sx={{
                borderRadius: 2,
                mb: 1,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'rgba(79, 195, 247, 0.08)',
                },
              }}
              onClick={() => {
                // Navigate to quiz detail if needed
              }}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(quiz.id);
                  }}
                  size="small"
                  sx={{ color: '#FFFFFF' }}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={
                  <Typography sx={{ color: '#FFFFFF', fontSize: '0.875rem' }}>
                    {quiz.title}
                  </Typography>
                }
                secondary={
                  <Typography sx={{ color: '#B0B0B0', fontSize: '0.75rem' }}>
                    {quiz.questions?.length || 0} questions • {new Date(quiz.created_at).toLocaleDateString()}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      <CreateQuizDialog
        open={createDialogOpen}
        courseId={courseId}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </Box>
  );
};

export default QuizzesPanel;

