import React from 'react';
import { Container, Box, Alert, Typography, TextField, Button, Chip, CircularProgress } from '@mui/material';
import { FileUpload } from './FileUpload';
import { PageContent } from './PageContent';
import { QuizDisplay } from './QuizDisplay';
import {  ExtractedPage } from '../services/pdf-extractor';
import { API, QuizResponse } from '../services/api';

export const UploadForm: React.FC = () => {
  const [pages, setPages] = React.useState<ExtractedPage[]>([]);
  const [selectedPages, setSelectedPages] = React.useState<ExtractedPage[]>([]);
  const [pageNumber, setPageNumber] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [quizResponse, setQuizResponse] = React.useState<QuizResponse | null>(null);

  const handleFileProcessed = async (extractedPages: ExtractedPage[]) => {
    setPages(extractedPages);
    setSelectedPages([]);
    setPageNumber('');
    setError('');
    setQuizResponse(null);
  };

  const handlePageSelect = () => {
    const pageNum = parseInt(pageNumber);
    if (isNaN(pageNum) || pageNum < 1 || pageNum > pages.length) {
      setError(`Please enter a valid page number between 1 and ${pages.length}`);
      return;
    }

    // Check if page is already selected
    if (selectedPages.some(p => p.pageNumber === pageNum)) {
      setError('This page is already selected');
      return;
    }

    setSelectedPages([...selectedPages, pages[pageNum - 1]]);
    setPageNumber('');
    setError('');
  };

  const handleRemovePage = (pageNumber: number) => {
    setSelectedPages(selectedPages.filter(p => p.pageNumber !== pageNumber));
    setQuizResponse(null);
  };

  const handleAnalyzePages = async () => {
    if (selectedPages.length === 0) {
      setError('Please select at least one page');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await API.analyzePages(selectedPages);
      setQuizResponse(response);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to analyze pages');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          PDF Quiz Generator
        </Typography>

        <FileUpload
          onFileProcessed={handleFileProcessed}
          onError={setError}
        />

        {pages.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
              <TextField
                label="Page Number"
                type="number"
                value={pageNumber}
                onChange={(e) => setPageNumber(e.target.value)}
                size="small"
                sx={{ width: 120 }}
              />
              <Button 
                variant="contained" 
                onClick={handlePageSelect}
                disabled={!pageNumber}
              >
                Add Page
              </Button>
              <Typography variant="body2" color="text.secondary">
                Total Pages: {pages.length}
              </Typography>
            </Box>

            {selectedPages.length > 0 && (
              <>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {selectedPages.map((page) => (
                    <Chip
                      key={page.pageNumber}
                      label={`Page ${page.pageNumber}`}
                      onDelete={() => handleRemovePage(page.pageNumber)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleAnalyzePages}
                  disabled={isLoading}
                  sx={{ mb: 2 }}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Generate Quiz'}
                </Button>
              </>
            )}
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {quizResponse && (
          <>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>Topics</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {quizResponse.topics.map((topic, index) => (
                  <Chip
                    key={index}
                    label={`${topic.name} (${Math.round(topic.confidence * 100)}%)`}
                    color="primary"
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>Chapters</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {quizResponse.chapters.map((chapter, index) => (
                  <Chip
                    key={index}
                    label={`${chapter.name} (${Math.round(chapter.confidence * 100)}%)`}
                    color="secondary"
                  />
                ))}
              </Box>
            </Box>

            <QuizDisplay questions={quizResponse.questions} />
          </>
        )}

        {selectedPages.map((page) => (
          <PageContent
            key={page.pageNumber}
            page={page}
            topics={[]}
            chapters={[]}
          />
        ))}
      </Box>
    </Container>
  );
};
