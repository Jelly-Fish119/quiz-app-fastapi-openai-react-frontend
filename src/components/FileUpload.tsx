import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { PDFExtractor, PageContent } from '../services/pdf-extractor';
import { AnalysisResponse, API } from '../services/api';

interface FileUploadProps {
  onAnalysisComplete: (data: AnalysisResponse) => void;
  onError: (error: string) => void;
  setLoading: (loading: boolean) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onAnalysisComplete,
  onError,
  setLoading,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      onError('Please select a file first');
      return;
    }

    try {
      setLoading(true);
      const pages = await PDFExtractor.extractPages(selectedFile);
      const analysis = await API.analyzePages(pages);
      onAnalysisComplete(analysis);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to process PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Button variant="contained" component="span">
          Select PDF
        </Button>
      </label>
      {selectedFile && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            Selected file: {selectedFile.name}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            sx={{ mt: 1 }}
          >
            Upload and Analyze
          </Button>
        </Box>
      )}
    </Box>
  );
}; 