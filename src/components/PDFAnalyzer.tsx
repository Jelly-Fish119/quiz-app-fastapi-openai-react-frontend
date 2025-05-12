import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, Paper, List, ListItem, ListItemText, Chip } from '@mui/material';
import { PDFService, ExtractedPage, Chapter } from '../services/pdf-service';

export const PDFAnalyzer: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [extractedPages, setExtractedPages] = useState<ExtractedPage[]>([]);
    const [selectedPage, setSelectedPage] = useState<ExtractedPage | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);
        setExtractedPages([]);
        setSelectedPage(null);
        setChapters([]);

        try {
            const pdfService = PDFService.getInstance();
            const pages = await pdfService.loadPDF(file);
            setExtractedPages(pages);
        } catch (error) {
            setError('Failed to load PDF file');
            console.error('Error loading PDF:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePageSelect = async (page: ExtractedPage) => {
        setIsLoading(true);
        setError(null);
        setSelectedPage(page);
        setChapters([]);

        try {
            const pdfService = PDFService.getInstance();
            const extractedChapters = await pdfService.analyzeChapters(page);
            setChapters(extractedChapters);
        } catch (error) {
            setError('Failed to analyze chapters');
            console.error('Error analyzing chapters:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
            <Typography variant="h4" gutterBottom>
                PDF Chapter Analyzer
            </Typography>

            <Box sx={{ mb: 3 }}>
                <input
                    accept="application/pdf"
                    style={{ display: 'none' }}
                    id="pdf-file-input"
                    type="file"
                    onChange={handleFileSelect}
                />
                <label htmlFor="pdf-file-input">
                    <Button variant="contained" component="span" disabled={isLoading}>
                        Select PDF File
                    </Button>
                </label>
            </Box>

            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Typography color="error" sx={{ my: 2 }}>
                    {error}
                </Typography>
            )}

            {extractedPages.length > 0 && (
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Extracted Pages
                    </Typography>
                    <List>
                        {extractedPages.map((page) => (
                            <ListItem
                                key={page.pageNumber}
                                sx={{
                                    cursor: 'pointer',
                                    bgcolor: selectedPage?.pageNumber === page.pageNumber ? 'action.selected' : 'inherit',
                                    '&:hover': {
                                        bgcolor: 'action.hover'
                                    }
                                }}
                                onClick={() => handlePageSelect(page)}
                            >
                                <ListItemText
                                    primary={`Page ${page.pageNumber}`}
                                    secondary={`${page.text.substring(0, 100)}...`}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}

            {chapters.length > 0 && (
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Detected Chapters
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {chapters.map((chapter, index) => (
                            <Chip
                                key={index}
                                label={`${chapter.name} (${Math.round(chapter.confidence * 100)}%)`}
                                color="primary"
                                variant="outlined"
                            />
                        ))}
                    </Box>
                </Paper>
            )}
        </Box>
    );
}; 