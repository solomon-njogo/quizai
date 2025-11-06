import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  getCourseMaterials,
  deleteCourseMaterial,
  getCourseMaterialDownloadUrl,
} from '../utils/api';
import FileUpload from './FileUpload';

const CourseMaterialsPanel = ({ onClose }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMaterials, setSelectedMaterials] = useState(new Set());
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCourseMaterials({
        orderBy: 'created_at',
        orderDirection: 'desc',
      });
      setMaterials(response.data.materials || []);
    } catch (err) {
      console.error('Error fetching course materials:', err);
      setError(
        err.response?.data?.message ||
          'Failed to load course materials. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedMaterials(new Set(materials.map((m) => m.id)));
    } else {
      setSelectedMaterials(new Set());
    }
  };

  const handleSelectMaterial = (materialId) => {
    const newSelected = new Set(selectedMaterials);
    if (newSelected.has(materialId)) {
      newSelected.delete(materialId);
    } else {
      newSelected.add(materialId);
    }
    setSelectedMaterials(newSelected);
  };

  const handleDeleteClick = (material) => {
    setMaterialToDelete(material);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!materialToDelete) return;

    try {
      setDeleting(true);
      await deleteCourseMaterial(materialToDelete.id);
      setMaterials(materials.filter((m) => m.id !== materialToDelete.id));
      setDeleteDialogOpen(false);
      setMaterialToDelete(null);
      if (selectedMaterials.has(materialToDelete.id)) {
        const newSelected = new Set(selectedMaterials);
        newSelected.delete(materialToDelete.id);
        setSelectedMaterials(newSelected);
      }
    } catch (err) {
      console.error('Error deleting material:', err);
      setError(
        err.response?.data?.message ||
          'Failed to delete material. Please try again.'
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async (material) => {
    try {
      const response = await getCourseMaterialDownloadUrl(material.id);
      if (response.data.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank');
      }
    } catch (err) {
      console.error('Error getting download URL:', err);
      setError(
        err.response?.data?.message ||
          'Failed to get download link. Please try again.'
      );
    }
  };

  const handleUploadSuccess = () => {
    setUploadDialogOpen(false);
    fetchMaterials();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getFileTypeColor = (mimeType) => {
    if (mimeType.includes('pdf')) return '#FF4B4B';
    if (mimeType.includes('word') || mimeType.includes('document'))
      return '#1CB0F6';
    if (mimeType.includes('text')) return '#10B981';
    return '#6B7280';
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
          p: 2,
          borderBottom: '1px solid #E5E7EB',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#1F2937',
              fontSize: '1rem',
            }}
          >
            Course Materials
          </Typography>
          {onClose && (
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                display: { xs: 'flex', md: 'none' },
                color: '#6B7280',
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setUploadDialogOpen(true)}
            size="small"
            sx={{
              flex: 1,
              borderRadius: 2,
              py: 0.75,
              fontSize: '0.875rem',
              textTransform: 'none',
            }}
          >
            Add
          </Button>
          <IconButton
            onClick={fetchMaterials}
            disabled={loading}
            size="small"
            sx={{
              border: '1px solid #E5E7EB',
              borderRadius: 2,
            }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Select All Checkbox */}
      {materials.length > 0 && (
        <Box
          sx={{
            px: 2,
            py: 1,
            borderBottom: '1px solid #E5E7EB',
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Checkbox
              checked={
                materials.length > 0 &&
                selectedMaterials.size === materials.length
              }
              indeterminate={
                selectedMaterials.size > 0 &&
                selectedMaterials.size < materials.length
              }
              onChange={handleSelectAll}
              size="small"
              sx={{ p: 0.5 }}
            />
            <Typography
              variant="body2"
              sx={{
                color: '#6B7280',
                fontSize: '0.875rem',
              }}
            >
              Select all materials
            </Typography>
          </Box>
        </Box>
      )}

      {/* Materials List */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: 4,
            }}
          >
            <CircularProgress size={24} sx={{ color: '#1CB0F6' }} />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2 }}>
            <Alert severity="error" sx={{ fontSize: '0.875rem' }}>
              {error}
            </Alert>
          </Box>
        ) : materials.length === 0 ? (
          <Box
            sx={{
              p: 3,
              textAlign: 'center',
            }}
          >
            <DescriptionIcon
              sx={{
                fontSize: 48,
                color: '#D1D5DB',
                mb: 1,
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: '#6B7280',
                fontSize: '0.875rem',
              }}
            >
              No materials yet
            </Typography>
            <Button
              variant="text"
              size="small"
              onClick={() => setUploadDialogOpen(true)}
              sx={{
                mt: 1,
                color: '#1CB0F6',
                fontSize: '0.875rem',
                textTransform: 'none',
              }}
            >
              Upload your first file
            </Button>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {materials.map((material, index) => (
              <Box key={material.id}>
                <ListItem
                  sx={{
                    px: 2,
                    py: 1,
                    '&:hover': {
                      backgroundColor: '#F9FAFB',
                    },
                  }}
                >
                  <Checkbox
                    checked={selectedMaterials.has(material.id)}
                    onChange={() => handleSelectMaterial(material.id)}
                    size="small"
                    sx={{ p: 0.5, mr: 1 }}
                  />
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <DescriptionIcon
                      sx={{
                        color: getFileTypeColor(material.mime_type),
                        fontSize: 24,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          color: '#1F2937',
                          fontSize: '0.875rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {material.original_filename}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#6B7280',
                          fontSize: '0.75rem',
                        }}
                      >
                        {formatDate(material.created_at)}
                      </Typography>
                    }
                    sx={{ m: 0 }}
                  />
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleDownload(material)}
                      sx={{
                        p: 0.5,
                        '&:hover': {
                          backgroundColor: 'rgba(28, 176, 246, 0.08)',
                        },
                      }}
                    >
                      <DownloadIcon
                        fontSize="small"
                        sx={{ color: '#6B7280', fontSize: 18 }}
                      />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(material)}
                      sx={{
                        p: 0.5,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 75, 75, 0.08)',
                        },
                      }}
                    >
                      <DeleteIcon
                        fontSize="small"
                        sx={{ color: '#FF4B4B', fontSize: 18 }}
                      />
                    </IconButton>
                  </Box>
                </ListItem>
                {index < materials.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </Box>

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, color: '#1F2937' }}>
          Upload Course Material
        </DialogTitle>
        <DialogContent>
          <FileUpload
            onUploadSuccess={handleUploadSuccess}
            onCancel={() => setUploadDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, color: '#1F2937' }}>
          Delete Course Material
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#6B7280' }}>
            Are you sure you want to delete "{materialToDelete?.original_filename}"? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <Box sx={{ px: 3, pb: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
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
        </Box>
      </Dialog>
    </Box>
  );
};

export default CourseMaterialsPanel;

