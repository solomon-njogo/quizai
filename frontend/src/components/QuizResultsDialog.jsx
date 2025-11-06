import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const QuizResultsDialog = ({ open, onClose, score, total, percentage, onRetake }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getScoreColor = () => {
    if (percentage >= 90) return '#4CAF50'; // Green
    if (percentage >= 70) return '#81C784'; // Light Green
    if (percentage >= 50) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getScoreMessage = () => {
    if (percentage >= 90) return 'Excellent! Outstanding performance!';
    if (percentage >= 70) return 'Great job! Well done!';
    if (percentage >= 50) return 'Good effort! Keep practicing!';
    return 'Keep studying! You can do better!';
  };

  const getScoreIcon = () => {
    if (percentage >= 70) {
      return <EmojiEventsIcon sx={{ fontSize: 60, color: '#FFD700' }} />;
    }
    return null;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          backgroundColor: '#242424',
          borderRadius: 2,
          border: '1px solid #333333',
        },
      }}
    >
      <DialogTitle
        sx={{
          color: '#FFFFFF',
          textAlign: 'center',
          pt: 4,
          pb: 2,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          {getScoreIcon()}
          <Typography variant="h4" component="div" fontWeight="bold">
            Quiz Complete!
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ px: { xs: 2, sm: 4 }, pb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            py: 2,
          }}
        >
          {/* Score Display */}
          <Box
            sx={{
              width: '100%',
              textAlign: 'center',
              p: 3,
              backgroundColor: '#1A1A1A',
              borderRadius: 2,
              border: '1px solid #333333',
            }}
          >
            <Typography
              variant="h2"
              component="div"
              sx={{
                color: getScoreColor(),
                fontWeight: 'bold',
                mb: 1,
                fontSize: { xs: '3rem', sm: '4rem' },
              }}
            >
              {percentage}%
            </Typography>
            <Typography variant="h6" sx={{ color: '#B0B0B0', mb: 2 }}>
              {score} out of {total} correct
            </Typography>
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{
                height: 12,
                borderRadius: 6,
                backgroundColor: '#333333',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getScoreColor(),
                },
              }}
            />
          </Box>

          {/* Message */}
          <Typography
            variant="h6"
            sx={{
              color: getScoreColor(),
              textAlign: 'center',
              fontWeight: 600,
            }}
          >
            {getScoreMessage()}
          </Typography>

          {/* Score Breakdown */}
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-around',
              p: 2,
              backgroundColor: '#1A1A1A',
              borderRadius: 2,
              border: '1px solid #333333',
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 28 }} />
                <Typography variant="h4" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                  {score}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
                Correct
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                <CancelIcon sx={{ color: '#F44336', fontSize: 28 }} />
                <Typography variant="h4" sx={{ color: '#F44336', fontWeight: 'bold' }}>
                  {total - score}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
                Incorrect
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          px: { xs: 2, sm: 4 },
          pb: 3,
          pt: 2,
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            color: '#FFFFFF',
            borderColor: '#505050',
            minWidth: 120,
            '&:hover': {
              borderColor: '#4FC3F7',
              backgroundColor: 'rgba(79, 195, 247, 0.08)',
            },
          }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          onClick={onRetake}
          sx={{
            backgroundColor: '#4FC3F7',
            color: '#FFFFFF',
            minWidth: 120,
            '&:hover': {
              backgroundColor: '#3FB0E0',
            },
          }}
        >
          Retake Quiz
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuizResultsDialog;

