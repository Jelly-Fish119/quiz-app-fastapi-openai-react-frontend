import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Stack,
} from '@mui/material';

interface Topic {
  name: string;
  confidence: number;
}

interface Chapter {
  name: string;
  confidence: number;
}

interface PageAnalysis {
  page_number: number;
  topics: Topic[];
  chapters: Chapter[];
}

interface PageAnalysisResultsProps {
  analysis: {
    pages: PageAnalysis[];
  };
}

const PageAnalysisResults: React.FC<PageAnalysisResultsProps> = ({ analysis }) => {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      {analysis.pages.map((page, index) => (
        <Card key={page.page_number} sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ color: 'primary.main' }}>
              Page {page.page_number}
            </Typography>
            
            {/* Chapters Section */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'secondary.main' }}>
                Chapters
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {page.chapters.map((chapter, idx) => (
                  <Chip
                    key={idx}
                    label={chapter.name}
                    color="secondary"
                    variant="outlined"
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Stack>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Topics Section */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: 'secondary.main' }}>
                Topics
              </Typography>
              <List>
                {page.topics.map((topic, idx) => (
                  <ListItem key={idx} sx={{ py: 0.5 }}>
                    <ListItemText
                      primary={topic.name}
                      secondary={`Confidence: ${(topic.confidence * 100).toFixed(0)}%`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default PageAnalysisResults; 