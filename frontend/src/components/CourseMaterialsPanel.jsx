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
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { getCourseMaterials, uploadCourseMaterial, deleteCourseMaterial } from '../utils/api';

const CourseMaterialsPanel = ({ courseId }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (courseId) {
      loadMaterials();
    }
  }, [courseId]);

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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      await uploadCourseMaterial(file, courseId);
      await loadMaterials();
      event.target.value = ''; // Reset file input
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) {
      return;
    }

    try {
      setError(null);
      await deleteCourseMaterial(materialId);
      await loadMaterials();
    } catch (err) {
      console.error('Error deleting material:', err);
      setError('Failed to delete material');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
          Course Materials
        </Typography>
        <Button
          variant="outlined"
          component="label"
          startIcon={<UploadFileIcon />}
          disabled={uploading}
          size="small"
          sx={{
            borderRadius: 2,
            borderColor: '#505050',
            color: '#FFFFFF',
            '&:hover': {
              borderColor: '#4FC3F7',
              backgroundColor: 'rgba(79, 195, 247, 0.08)',
            },
          }}
        >
          {uploading ? <CircularProgress size={20} sx={{ color: '#4FC3F7' }} /> : 'Upload'}
          <input
            type="file"
            hidden
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.txt"
          />
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
      ) : materials.length === 0 ? (
        <Typography variant="body2" sx={{ color: '#B0B0B0', textAlign: 'center', py: 4 }}>
          No materials uploaded yet
        </Typography>
      ) : (
        <List sx={{ flex: 1, overflow: 'auto' }}>
          {materials.map((material) => (
            <ListItem
              key={material.id}
              sx={{
                borderRadius: 2,
                mb: 1,
                '&:hover': {
                  backgroundColor: 'rgba(79, 195, 247, 0.08)',
                },
              }}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(material.id)}
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
                    {material.original_filename}
                  </Typography>
                }
                secondary={
                  <Typography sx={{ color: '#B0B0B0', fontSize: '0.75rem' }}>
                    {formatFileSize(material.file_size)} • {new Date(material.created_at).toLocaleDateString()}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default CourseMaterialsPanel;

