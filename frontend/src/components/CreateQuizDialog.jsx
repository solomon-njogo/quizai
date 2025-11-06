import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';
import { getCourseMaterials, generateQuiz } from '../utils/api';

const CreateQuizDialog = ({ open, courseId, onClose, onSuccess }) => {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && courseId) {
      loadMaterials();
    } else {
      // Reset state when dialog closes
      setSelectedMaterials([]);
      setError(null);
    }
  }, [open, courseId]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCourseMaterials(courseId);
      setMaterials(response.materials || []);
    } catch (err) {
      console.error('Error loading materials:', err);
      setError('Failed to load course materials');
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialToggle = (materialId) => {
    setSelectedMaterials((prev) => {
      if (prev.includes(materialId)) {
        return prev.filter((id) => id !== materialId);
      } else {
        return [...prev, materialId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedMaterials.length === materials.length) {
      setSelectedMaterials([]);
    } else {
      setSelectedMaterials(materials.map((m) => m.id));
    }
  };

  const handleGenerate = async () => {
    if (selectedMaterials.length === 0) {
      setError('Please select at least one material');
      return;
    }

    try {
      setGenerating(true);
      setError(null);

      const response = await generateQuiz({
        course_id: courseId,
        material_ids: selectedMaterials,
      });

      if (response.success && response.quiz) {
        onSuccess(response.quiz);
        onClose();
      } else {
        setError(response.message || 'Failed to generate quiz');
      }
    } catch (err) {
      console.error('Error generating quiz:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error ||
                          err.message ||
                          'Failed to generate quiz. Please try again.';
      setError(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#2A2A2A',
          color: '#FFFFFF',
        },
      }}
    >
      <DialogTitle sx={{ color: '#FFFFFF', borderBottom: '1px solid #404040' }}>
        Create Quiz
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="body2" sx={{ color: '#B0B0B0', mb: 2 }}>
          Select course materials to generate a quiz from. The quiz will contain exactly 10 questions.
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: 2 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {generating && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#4FC3F7', mb: 1 }}>
              Generating 10 questions...
            </Typography>
            <LinearProgress sx={{ borderRadius: 1 }} />
          </Box>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress sx={{ color: '#4FC3F7' }} />
          </Box>
        ) : materials.length === 0 ? (
          <Typography variant="body2" sx={{ color: '#B0B0B0', textAlign: 'center', py: 4 }}>
            No materials available. Please upload materials first.
          </Typography>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedMaterials.length === materials.length && materials.length > 0}
                    indeterminate={selectedMaterials.length > 0 && selectedMaterials.length < materials.length}
                    onChange={handleSelectAll}
                    sx={{
                      color: '#4FC3F7',
                      '&.Mui-checked': {
                        color: '#4FC3F7',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                    Select All ({materials.length} materials)
                  </Typography>
                }
              />
            </Box>
            <List
              sx={{
                maxHeight: 400,
                overflow: 'auto',
                border: '1px solid #404040',
                borderRadius: 2,
                p: 1,
              }}
            >
              {materials.map((material) => (
                <ListItem
                  key={material.id}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&:hover': {
                      backgroundColor: 'rgba(79, 195, 247, 0.08)',
                    },
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedMaterials.includes(material.id)}
                        onChange={() => handleMaterialToggle(material.id)}
                        disabled={generating}
                        sx={{
                          color: '#4FC3F7',
                          '&.Mui-checked': {
                            color: '#4FC3F7',
                          },
                        }}
                      />
                    }
                    label={
                      <ListItemText
                        primary={
                          <Typography sx={{ color: '#FFFFFF', fontSize: '0.875rem' }}>
                            {material.original_filename || material.filename}
                          </Typography>
                        }
                        secondary={
                          <Typography sx={{ color: '#B0B0B0', fontSize: '0.75rem' }}>
                            {new Date(material.created_at).toLocaleDateString()}
                          </Typography>
                        }
                      />
                    }
                    sx={{ width: '100%', m: 0 }}
                  />
                </ListItem>
              ))}
            </List>
            {selectedMaterials.length > 0 && (
              <Typography variant="body2" sx={{ color: '#4FC3F7', mt: 2, textAlign: 'center' }}>
                {selectedMaterials.length} material{selectedMaterials.length !== 1 ? 's' : ''} selected
              </Typography>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ borderTop: '1px solid #404040', p: 2 }}>
        <Button
          onClick={onClose}
          disabled={generating}
          sx={{
            color: '#B0B0B0',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleGenerate}
          disabled={generating || selectedMaterials.length === 0}
          variant="contained"
          sx={{
            backgroundColor: '#4FC3F7',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#3FB0E0',
            },
            '&:disabled': {
              backgroundColor: '#404040',
              color: '#808080',
            },
          }}
        >
          {generating ? (
            <>
              <CircularProgress size={20} sx={{ color: '#FFFFFF', mr: 1 }} />
              Generating...
            </>
          ) : (
            'Generate Quiz'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateQuizDialog;

