import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { getQuiz, submitQuiz } from '../utils/api';
import QuizResultsDialog from '../components/QuizResultsDialog';

const QuizTaking = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getQuiz(quizId);
      setQuiz(response.quiz);
      // Initialize selected answers
      const initialAnswers = {};
      response.quiz.questions.forEach((_, index) => {
        initialAnswers[index] = null;
      });
      setSelectedAnswers(initialAnswers);
      setAnsweredQuestions(new Set());
      setShowFinalResults(false);
    } catch (err) {
      console.error('Error loading quiz:', err);
      setError('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    // Don't allow changes if already answered
    if (answeredQuestions.has(questionIndex)) return;
    
    // Set the selected answer
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }));
    
    // Mark question as answered
    setAnsweredQuestions((prev) => new Set([...prev, questionIndex]));
    
    // Auto-advance to next question after a short delay
    setTimeout(() => {
      if (questionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex(questionIndex + 1);
      }
      // Don't auto-submit - user will click submit button when ready
    }, 2000); // 2 second delay to show feedback
  };

  const handleQuizComplete = async () => {
    try {
      setSubmitting(true);
      setSubmitError(null);
      
      // Convert selectedAnswers object to array
      const answersArray = quiz.questions.map((_, index) => selectedAnswers[index]);
      
      // Submit quiz results
      await submitQuiz(quizId, answersArray);
      
      // Show results dialog
      setShowFinalResults(true);
      setShowResultsDialog(true);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setSubmitError('Failed to save quiz results. Your score was still calculated.');
      // Still show results even if submission fails
      setShowFinalResults(true);
      setShowResultsDialog(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionClick = (index) => {
    setCurrentQuestionIndex(index);
  };

  const calculateScore = () => {
    if (!quiz || answeredQuestions.size === 0) return { correct: 0, total: 0, percentage: 0 };
    
    let correct = 0;
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct) {
        correct++;
      }
    });

    const total = quiz.questions.length;
    const percentage = Math.round((correct / total) * 100);
    
    return { correct, total, percentage };
  };

  const isQuestionAnswered = (questionIndex) => {
    return answeredQuestions.has(questionIndex);
  };

  const handleRetakeQuiz = () => {
    setShowResultsDialog(false);
    setShowFinalResults(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setAnsweredQuestions(new Set());
    setSubmitError(null);
    // Reset selected answers
    const initialAnswers = {};
    quiz.questions.forEach((_, index) => {
      initialAnswers[index] = null;
    });
    setSelectedAnswers(initialAnswers);
  };

  const handleCloseDialog = () => {
    setShowResultsDialog(false);
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

  if (error || !quiz) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#1A1A1A', py: 4, px: 2 }}>
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error || 'Quiz not found'}
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)}
          sx={{ color: '#FFFFFF' }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((answeredQuestions.size) / quiz.questions.length) * 100;
  const score = calculateScore();
  const allAnswered = answeredQuestions.size === quiz.questions.length;
  const currentQuestionAnswered = isQuestionAnswered(currentQuestionIndex);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#1A1A1A',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          py: 2,
          borderBottom: '1px solid #333333',
          flexShrink: 0,
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 1, color: '#FFFFFF' }}
        >
          Back
        </Button>
        <Typography variant="h5" component="h1" fontWeight="bold" sx={{ color: '#FFFFFF', mb: 1 }}>
          {quiz.title}
        </Typography>
        {showFinalResults && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#242424', borderRadius: 2, border: '1px solid #333333' }}>
            <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 1 }}>
              Quiz Complete!
            </Typography>
            <Typography variant="body1" sx={{ color: score.percentage >= 70 ? '#4CAF50' : score.percentage >= 50 ? '#FF9800' : '#F44336', fontWeight: 600 }}>
              Score: {score.correct} / {score.total} ({score.percentage}%)
            </Typography>
          </Box>
        )}
        {!showFinalResults && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
                {answeredQuestions.size} / {quiz.questions.length} answered
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: '#333333',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: allAnswered ? '#4CAF50' : '#4FC3F7',
                },
              }} 
            />
            {allAnswered && (
              <Alert 
                severity="success" 
                sx={{ 
                  mt: 2, 
                  borderRadius: 2,
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  border: '1px solid #4CAF50',
                  '& .MuiAlert-icon': {
                    color: '#4CAF50',
                  },
                }}
              >
                <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                  All questions answered! Click "Submit Quiz" below to finish.
                </Typography>
              </Alert>
            )}
          </Box>
        )}
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          px: { xs: 2, sm: 3, md: 4 },
          py: 3,
        }}
      >
        <Card
          sx={{
            backgroundColor: '#242424',
            border: '1px solid #333333',
            borderRadius: 2,
            mb: 3,
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#FFFFFF', 
                mb: 3,
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.25rem' },
              }}
            >
              {currentQuestion.question}
            </Typography>

            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={selectedAnswers[currentQuestionIndex]?.toString() || ''}
                onChange={(e) => handleAnswerSelect(currentQuestionIndex, parseInt(e.target.value))}
              >
                {currentQuestion.options.map((option, optionIndex) => {
                  const isCorrect = optionIndex === currentQuestion.correct;
                  const isSelected = selectedAnswers[currentQuestionIndex] === optionIndex;
                  const isWrongSelected = currentQuestionAnswered && isSelected && !isCorrect;
                  const showCorrect = currentQuestionAnswered && isCorrect;
                  
                  return (
                    <FormControlLabel
                      key={optionIndex}
                      value={optionIndex.toString()}
                      disabled={currentQuestionAnswered}
                      control={
                        <Radio
                          sx={{
                            color: currentQuestionAnswered
                              ? showCorrect
                                ? '#4CAF50'
                                : isWrongSelected
                                ? '#F44336'
                                : '#B0B0B0'
                              : '#4FC3F7',
                            '&.Mui-checked': {
                              color: currentQuestionAnswered
                                ? showCorrect
                                  ? '#4CAF50'
                                  : '#F44336'
                                : '#4FC3F7',
                            },
                            '&.Mui-disabled': {
                              color: currentQuestionAnswered
                                ? showCorrect
                                  ? '#4CAF50'
                                  : isWrongSelected
                                  ? '#F44336'
                                  : '#B0B0B0'
                                : '#B0B0B0',
                            },
                          }}
                        />
                      }
                      label={
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            width: '100%',
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: currentQuestionAnswered
                              ? showCorrect
                                ? 'rgba(76, 175, 80, 0.1)'
                                : isWrongSelected
                                ? 'rgba(244, 67, 54, 0.1)'
                                : 'transparent'
                              : isSelected
                              ? 'rgba(79, 195, 247, 0.08)'
                              : 'transparent',
                            border: currentQuestionAnswered
                              ? showCorrect
                                ? '2px solid #4CAF50'
                                : isWrongSelected
                                ? '2px solid #F44336'
                                : '1px solid #333333'
                              : isSelected
                              ? '2px solid #4FC3F7'
                              : '1px solid #333333',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Typography
                            sx={{
                              color: '#FFFFFF',
                              flex: 1,
                              fontSize: { xs: '0.875rem', sm: '1rem' },
                            }}
                          >
                            {option}
                          </Typography>
                          {currentQuestionAnswered && showCorrect && (
                            <CheckCircleIcon sx={{ color: '#4CAF50' }} />
                          )}
                          {currentQuestionAnswered && isWrongSelected && (
                            <CancelIcon sx={{ color: '#F44336' }} />
                          )}
                        </Box>
                      }
                      sx={{
                        width: '100%',
                        margin: 0,
                        mb: 1.5,
                        '&:last-child': { mb: 0 },
                        '& .MuiFormControlLabel-label': {
                          width: '100%',
                        },
                      }}
                    />
                  );
                })}
              </RadioGroup>
            </FormControl>

            {currentQuestionAnswered && (
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  backgroundColor: '#1A1A1A',
                  borderRadius: 2,
                  border: '1px solid #333333',
                  animation: 'fadeIn 0.3s ease-in',
                  '@keyframes fadeIn': {
                    from: { opacity: 0, transform: 'translateY(-10px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {selectedAnswers[currentQuestionIndex] === currentQuestion.correct ? (
                    <>
                      <CheckCircleIcon sx={{ color: '#4CAF50' }} />
                      <Typography
                        variant="subtitle2"
                        sx={{ color: '#4CAF50', fontWeight: 600 }}
                      >
                        Correct!
                      </Typography>
                    </>
                  ) : (
                    <>
                      <CancelIcon sx={{ color: '#F44336' }} />
                      <Typography
                        variant="subtitle2"
                        sx={{ color: '#F44336', fontWeight: 600 }}
                      >
                        Incorrect
                      </Typography>
                    </>
                  )}
                </Box>
                <Typography
                  variant="subtitle2"
                  sx={{ color: '#4FC3F7', mb: 1, fontWeight: 600 }}
                >
                  Explanation:
                </Typography>
                <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
                  {currentQuestion.explanation}
                </Typography>
                {!allAnswered && (
                  <Typography variant="body2" sx={{ color: '#B0B0B0', mt: 2, fontStyle: 'italic' }}>
                    Moving to next question...
                  </Typography>
                )}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Question Navigation */}
        {!showFinalResults && (
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              mb: 3,
            }}
          >
            {quiz.questions.map((_, index) => {
              const isAnswered = isQuestionAnswered(index);
              const isCorrect = selectedAnswers[index] === quiz.questions[index].correct;
              
              return (
                <Button
                  key={index}
                  variant={index === currentQuestionIndex ? 'contained' : 'outlined'}
                  onClick={() => handleQuestionClick(index)}
                  sx={{
                    minWidth: { xs: 36, sm: 44 },
                    height: { xs: 36, sm: 44 },
                    p: 0,
                    backgroundColor: index === currentQuestionIndex
                      ? '#4FC3F7'
                      : isAnswered
                      ? isCorrect
                        ? 'rgba(76, 175, 80, 0.2)'
                        : 'rgba(244, 67, 54, 0.2)'
                      : 'transparent',
                    borderColor: index === currentQuestionIndex
                      ? '#4FC3F7'
                      : isAnswered
                      ? isCorrect
                        ? '#4CAF50'
                        : '#F44336'
                      : '#505050',
                    color: '#FFFFFF',
                    '&:hover': {
                      backgroundColor: index === currentQuestionIndex
                        ? '#3FB0E0'
                        : 'rgba(79, 195, 247, 0.15)',
                      borderColor: '#4FC3F7',
                    },
                  }}
                >
                  {index + 1}
                </Button>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Footer Actions */}
      <Box
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          py: 2,
          borderTop: '1px solid #333333',
          flexShrink: 0,
          display: 'flex',
          gap: 2,
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          {!showFinalResults && (
            <>
              <Button
                variant="outlined"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                sx={{ color: '#FFFFFF', borderColor: '#505050' }}
              >
                Previous
              </Button>
              <Button
                variant="outlined"
                onClick={handleNext}
                disabled={currentQuestionIndex === quiz.questions.length - 1}
                sx={{ color: '#FFFFFF', borderColor: '#505050' }}
              >
                Next
              </Button>
            </>
          )}
        </Box>
        {!showFinalResults && allAnswered && (
          <Button
            variant="contained"
            onClick={handleQuizComplete}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : null}
            sx={{
              backgroundColor: '#4FC3F7',
              color: '#FFFFFF',
              minWidth: 140,
              fontSize: '1rem',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#3FB0E0',
              },
              '&:disabled': {
                backgroundColor: '#333333',
                color: '#666666',
              },
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        )}
        {showFinalResults && (
          <Button
            variant="contained"
            onClick={handleRetakeQuiz}
            sx={{
              backgroundColor: '#4FC3F7',
              color: '#FFFFFF',
              '&:hover': {
                backgroundColor: '#3FB0E0',
              },
            }}
          >
            Retake Quiz
          </Button>
        )}
      </Box>

      {/* Results Dialog */}
      <QuizResultsDialog
        open={showResultsDialog}
        onClose={handleCloseDialog}
        score={score.correct}
        total={score.total}
        percentage={score.percentage}
        onRetake={handleRetakeQuiz}
      />

      {/* Submit Error Alert */}
      {submitError && (
        <Alert 
          severity="warning" 
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16, 
            zIndex: 1300,
            maxWidth: { xs: 'calc(100% - 32px)', sm: 400 },
          }}
          onClose={() => setSubmitError(null)}
        >
          {submitError}
        </Alert>
      )}
    </Box>
  );
};

export default QuizTaking;

