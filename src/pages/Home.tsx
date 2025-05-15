import React, { useState } from 'react';
import { Box, Container, Typography, CircularProgress } from '@mui/material';
import { FileUpload } from '../components/FileUpload';
import QuizDisplay from '../components/QuizDisplay';
import { AnalysisResponse } from '../services/api';

const Home: React.FC = () => {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysisComplete = (data: AnalysisResponse) => {
    setAnalysis(data);
    setLoading(false);
    setError(null);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          PDF Quiz Generator
        </Typography>

        {!analysis && (
          <FileUpload
            onAnalysisComplete={handleAnalysisComplete}
            onError={setError}
            setLoading={setLoading}
          />
        )}

        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        {analysis && (
          <QuizDisplay questions={analysis.questions} />
        )}
      </Box>
    </Container>
  );
};

export default Home; 