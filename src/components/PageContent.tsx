import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { ExtractedPage } from '../services/pdf-extractor';

interface PageContentProps {
  page: ExtractedPage;
  topics: any[];
  chapters: any[];
}

export const PageContent: React.FC<PageContentProps> = ({
  page,
}) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Page {page.pageNumber}
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {page.text}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}; 