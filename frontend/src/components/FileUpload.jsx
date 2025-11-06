import { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  Paper,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { uploadFile } from '../utils/api';

const FileUpload = ({ onUploadSuccess, onCancel }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const allowedExtensions = ['.pdf', '.txt', '.docx'];
    const fileExtension = selectedFile.name
      .substring(selectedFile.name.lastIndexOf('.'))
      .toLowerCase();

    if (
      !allowedTypes.includes(selectedFile.type) &&
      !allowedExtensions.includes(fileExtension)
    ) {
      setError(
        'Invalid file type. Only PDF, TXT, and DOCX files are allowed.'
      );
      setFile(null);
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (selectedFile.size > maxSize) {
      setError('File size exceeds the 10MB limit.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(false);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      setSuccess(false);
      setUploadProgress(0);

      const response = await uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });

      setSuccess(true);
      setUploadProgress(100);

      // Call success callback after a short delay
      setTimeout(() => {
        if (onUploadSuccess) {
          onUploadSuccess(response.data);
        }
        // Reset state
        setFile(null);
        setSuccess(false);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 1500);
    } catch (err) {
      console.error('Upload error:', err);
      console.error('Error response:', err.response?.data);
      
      // Extract error message from response
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to upload file. Please try again.';
      
      setError(errorMessage);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const event = {
        target: {
          files: [droppedFile],
        },
      };
      handleFileSelect(event);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Box sx={{ width: '100%' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.docx"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        id="file-upload-input"
      />

      {!file && !success && (
        <Paper
          elevation={0}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          sx={{
            border: '2px dashed #D1D5DB',
            borderRadius: 3,
            p: { xs: 3, sm: 4 },
            textAlign: 'center',
            backgroundColor: '#F9FAFB',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: '#1CB0F6',
              backgroundColor: '#F0F9FF',
            },
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <CloudUploadIcon
            sx={{
              fontSize: { xs: 48, sm: 64 },
              color: '#9CA3AF',
              mb: 2,
            }}
          />
          <Typography
            variant="h6"
            sx={{
              color: '#1F2937',
              mb: 1,
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.125rem' },
            }}
          >
            Drag and drop a file here, or click to select
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#6B7280',
              mb: 2,
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
          >
            Supported formats: PDF, TXT, DOCX (Max 10MB)
          </Typography>
          <Button
            variant="outlined"
            component="span"
            startIcon={<CloudUploadIcon />}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
            }}
          >
            Select File
          </Button>
        </Paper>
      )}

      {file && !success && (
        <Box>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid #E5E7EB',
              backgroundColor: '#FFFFFF',
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    color: '#1F2937',
                    mb: 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {file.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#6B7280',
                    fontSize: '0.875rem',
                  }}
                >
                  {formatFileSize(file.size)}
                </Typography>
              </Box>
              <Button
                variant="text"
                onClick={() => {
                  setFile(null);
                  setError(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                sx={{
                  color: '#6B7280',
                  minWidth: 'auto',
                  px: 1,
                }}
              >
                Remove
              </Button>
            </Box>

            {uploading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#E5E7EB',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#1CB0F6',
                    },
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: '#6B7280',
                    mt: 1,
                    textAlign: 'center',
                    fontSize: '0.875rem',
                  }}
                >
                  Uploading... {uploadProgress}%
                </Typography>
              </Box>
            )}

            {!uploading && (
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                {onCancel && (
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={onCancel}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleUpload}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                  }}
                >
                  Upload File
                </Button>
              </Box>
            )}
          </Paper>
        </Box>
      )}

      {success && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: '1px solid #10B981',
            backgroundColor: '#F0FDF4',
            textAlign: 'center',
          }}
        >
          <CheckCircleIcon
            sx={{
              fontSize: 48,
              color: '#10B981',
              mb: 1,
            }}
          />
          <Typography
            variant="h6"
            sx={{
              color: '#10B981',
              fontWeight: 600,
              mb: 0.5,
            }}
          >
            Upload Successful!
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#6B7280',
            }}
          >
            Your file has been uploaded and processed successfully.
          </Typography>
        </Paper>
      )}

      {error && (
        <Alert
          severity="error"
          icon={<ErrorIcon />}
          onClose={() => setError(null)}
          sx={{
            mt: 2,
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default FileUpload;

