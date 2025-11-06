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
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Course Materials</Typography>
        <Button
          variant="outlined"
          component="label"
          startIcon={<UploadFileIcon />}
          disabled={uploading}
          size="small"
        >
          {uploading ? <CircularProgress size={20} /> : 'Upload'}
          <input
            type="file"
            hidden
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.txt"
          />
        </Button>
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
      ) : materials.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No materials uploaded yet
        </Typography>
      ) : (
        <List>
          {materials.map((material) => (
            <ListItem
              key={material.id}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(material.id)}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={material.original_filename}
                secondary={`${formatFileSize(material.file_size)} • ${new Date(material.created_at).toLocaleDateString()}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default CourseMaterialsPanel;

