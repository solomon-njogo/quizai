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
import { getQuizzes, deleteQuiz } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const QuizzesPanel = ({ courseId }) => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Quizzes</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : quizzes.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No quizzes created yet
        </Typography>
      ) : (
        <List>
          {quizzes.map((quiz) => (
            <ListItem
              key={quiz.id}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(quiz.id)}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={quiz.title}
                secondary={`${quiz.questions?.length || 0} questions • ${new Date(quiz.created_at).toLocaleDateString()}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default QuizzesPanel;

