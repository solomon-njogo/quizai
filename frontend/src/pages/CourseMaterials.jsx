import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  getCourseMaterials,
  deleteCourseMaterial,
  getCourseMaterialDownloadUrl,
} from '../utils/api';
import FileUpload from '../components/FileUpload';

const CourseMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const navigate = useNavigate();

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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileTypeColor = (mimeType) => {
    if (mimeType.includes('pdf')) return '#FF4B4B';
    if (mimeType.includes('word') || mimeType.includes('document')) return '#1CB0F6';
    if (mimeType.includes('text')) return '#10B981';
    return '#6B7280';
  };

  const getFileTypeLabel = (mimeType) => {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'DOCX';
    if (mimeType.includes('text')) return 'TXT';
    return 'FILE';
  };

  const handleUploadSuccess = () => {
    setUploadDialogOpen(false);
    fetchMaterials();
  };

  return (
    <Box
      sx={{
        flex: 1,
        width: '100%',
        backgroundColor: '#F7F7F7',
        py: { xs: 3, sm: 4, md: 5 },
        px: { xs: 2, sm: 3, md: 4 },
        minHeight: '100%',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: { xs: 3, sm: 4 },
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#1CB0F6',
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
            }}
          >
            Course Materials
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchMaterials}
              disabled={loading}
              sx={{
                borderRadius: 2,
                px: { xs: 2, sm: 3 },
                py: 1,
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={() => setUploadDialogOpen(true)}
              sx={{
                borderRadius: 2,
                px: { xs: 2, sm: 3 },
                py: 1,
              }}
            >
              Upload File
            </Button>
          </Box>
        </Box>

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
        ) : materials.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, sm: 6, md: 8 },
              textAlign: 'center',
              borderRadius: 4,
              border: '1px solid #E5E7EB',
              backgroundColor: '#FFFFFF',
            }}
          >
            <DescriptionIcon
              sx={{
                fontSize: { xs: 48, sm: 64, md: 80 },
                color: '#D1D5DB',
                mb: 2,
              }}
            />
            <Typography
              variant="h6"
              sx={{
                color: '#6B7280',
                mb: 1,
                fontSize: { xs: '1rem', sm: '1.25rem' },
              }}
            >
              No course materials yet
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#9CA3AF',
                mb: 3,
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              Upload your first document to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={() => setUploadDialogOpen(true)}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
              }}
            >
              Upload File
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {materials.map((material) => (
              <Grid item xs={12} sm={6} md={4} key={material.id}>
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
                          backgroundColor: `${getFileTypeColor(material.mime_type)}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <DescriptionIcon
                          sx={{
                            color: getFileTypeColor(material.mime_type),
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
                            fontSize: { xs: '1rem', sm: '1.125rem' },
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {material.original_filename}
                        </Typography>
                        <Chip
                          label={getFileTypeLabel(material.mime_type)}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.75rem',
                            backgroundColor: `${getFileTypeColor(material.mime_type)}15`,
                            color: getFileTypeColor(material.mime_type),
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        mt: 2,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#6B7280',
                          fontSize: '0.8125rem',
                        }}
                      >
                        Size: {formatFileSize(material.file_size)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#6B7280',
                          fontSize: '0.8125rem',
                        }}
                      >
                        Uploaded: {formatDate(material.created_at)}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions
                    sx={{
                      px: 2,
                      pb: 2,
                      pt: 0,
                      gap: 1,
                    }}
                  >
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(material)}
                      sx={{
                        color: '#1CB0F6',
                        fontSize: '0.875rem',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: 'rgba(28, 176, 246, 0.08)',
                        },
                      }}
                    >
                      Download
                    </Button>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(material)}
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
            <DialogContentText sx={{ color: '#6B7280' }}>
              Are you sure you want to delete "{materialToDelete?.original_filename}"? This action cannot be undone.
            </DialogContentText>
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
      </Container>
    </Box>
  );
};

export default CourseMaterials;

