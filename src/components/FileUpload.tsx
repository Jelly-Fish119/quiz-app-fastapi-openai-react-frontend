import React from 'react';
import { Box, Button, LinearProgress, Typography } from '@mui/material';
import { PDFExtractor, ExtractedPage } from '../services/pdf-extractor';

interface FileUploadProps {
  onFileProcessed: (pages: ExtractedPage[]) => void;
  onError: (error: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileProcessed,
  onError,
}) => {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      onError('Please select a PDF file');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const pages = await PDFExtractor.extractPages(file);
      onFileProcessed(pages);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to process PDF');
    } finally {
      setIsProcessing(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        ref={fileInputRef}
      />
      <Button
        variant="contained"
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
        fullWidth
      >
        {isProcessing ? 'Processing PDF...' : 'Select PDF File'}
      </Button>

      {isProcessing && (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            {progress}%
          </Typography>
        </Box>
      )}
    </Box>
  );
}; 