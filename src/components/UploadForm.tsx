import React, { useState } from 'react';
import { uploadPdf } from '../features/pdf-topic-extractor/api';

interface QuizQuestion {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: string;
}

interface PageQuiz {
  topic: string;
  questions: QuizQuestion[];
}

interface QuizResponse {
  quizzes: {
    [key: string]: PageQuiz;
  };
}

export const UploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [quizzes, setQuizzes] = useState<QuizResponse | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: string}>({});
  const [showResults, setShowResults] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    try {
      const result = await uploadPdf(file);
      setQuizzes(result);
      setSelectedAnswers({});
      setShowResults(false);
    } catch (error) {
      alert('Failed to extract topics and generate questions');
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateScore = () => {
    if (!quizzes) return { correct: 0, total: 0 };
    let correct = 0;
    let total = 0;

    Object.entries(quizzes.quizzes).forEach(([pageKey, pageQuiz]) => {
      pageQuiz.questions.forEach((question, qIndex) => {
        const questionId = `${pageKey}_q${qIndex}`;
        if (selectedAnswers[questionId] === question.correct_answer) {
          correct++;
        }
        total++;
      });
    });

    return { correct, total };
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Upload PDF for Quiz Generation</h1>
      <div className="mb-6">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-4"
        />
        <button
          onClick={handleUpload}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Generate Quiz
        </button>
      </div>

      {quizzes && (
        <div className="space-y-8">
          {Object.entries(quizzes.quizzes).map(([pageKey, pageQuiz]) => (
            <div key={pageKey} className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Page {pageKey.split('_')[1]} - {pageQuiz.topic}</h2>
              <div className="space-y-6">
                {pageQuiz.questions.map((question, qIndex) => {
                  const questionId = `${pageKey}_q${qIndex}`;
                  return (
                    <div key={questionId} className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium mb-3">{qIndex + 1}. {question.question}</p>
                      <div className="space-y-2">
                        {Object.entries(question.options).map(([key, value]) => (
                          <label key={key} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name={questionId}
                              value={key}
                              checked={selectedAnswers[questionId] === key}
                              onChange={() => handleAnswerSelect(questionId, key)}
                              className="form-radio"
                            />
                            <span>{key}. {value}</span>
                          </label>
                        ))}
                      </div>
                      {showResults && (
                        <div className={`mt-2 text-sm ${
                          selectedAnswers[questionId] === question.correct_answer
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {selectedAnswers[questionId] === question.correct_answer
                            ? '✓ Correct!'
                            : `✗ Incorrect. The correct answer is ${question.correct_answer}`}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {Object.keys(quizzes.quizzes).length > 0 && (
            <div className="mt-6">
              <button
                onClick={() => setShowResults(true)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Check Answers
              </button>
              {showResults && (
                <div className="mt-4 text-lg">
                  Score: {calculateScore().correct} out of {calculateScore().total} correct
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
