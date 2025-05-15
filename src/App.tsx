import { FileUpload } from './components/FileUpload';
import { useState } from 'react';
import { PageContent } from './services/pdf-extractor';
import { AnalysisResponse } from './services/api';
import { QuizDisplay } from './components/QuizDisplay';

function App() {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileProcessed = async (pages: PageContent[]) => {
    try {
      const response = await fetch('http://localhost:8000/pdf/analyze-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pages }),
      });
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError('Failed to analyze PDF');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PDF Quiz Generator</h1>
      <FileUpload onFileProcessed={handleFileProcessed} onError={setError} />
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {analysis && <QuizDisplay analysis={analysis} />}
    </div>
  );
}

export default App;
