import { FileUpload } from './components/FileUpload';
import { useState } from 'react';
import { AnalysisResponse } from './services/api';
import QuizDisplay from './components/QuizDisplay';

function App() {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalysisComplete = (data: AnalysisResponse) => {
    setAnalysis(data);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PDF Quiz Generator</h1>
      <FileUpload 
        onAnalysisComplete={handleAnalysisComplete} 
        onError={setError}
        setLoading={setLoading}
      />
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {analysis && <QuizDisplay questions={analysis.questions} />}
    </div>
  );
}

export default App;
