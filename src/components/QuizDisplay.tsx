import React, { useState } from 'react';
import { AnalysisResponse, QuizQuestion } from '../services/api';

interface QuizDisplayProps {
  analysis: AnalysisResponse;
}

export const QuizDisplay: React.FC<QuizDisplayProps> = ({ analysis }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = analysis.questions[currentQuestionIndex];

  const handleAnswerSubmit = () => {
    if (selectedAnswer === currentQuestion.correct_answer) {
      setScore(score + 1);
    }
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setSelectedAnswer('');
    setShowExplanation(false);
  };

  if (!currentQuestion) {
    return (
      <div className="mt-4 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-bold">Quiz Complete!</h2>
        <p className="mt-2">Your score: {score} out of {analysis.questions.length}</p>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Question {currentQuestionIndex + 1}</h2>
      <p className="mb-4">{currentQuestion.question}</p>

      {currentQuestion.type === 'multiple_choice' && (
        <div className="space-y-2">
          {currentQuestion.options.map((option, index) => (
            <label key={index} className="flex items-center space-x-2">
              <input
                type="radio"
                name="answer"
                value={option}
                checked={selectedAnswer === option}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                className="form-radio"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )}

      {currentQuestion.type === 'true_false' && (
        <div className="space-y-2">
          {['True', 'False'].map((option) => (
            <label key={option} className="flex items-center space-x-2">
              <input
                type="radio"
                name="answer"
                value={option}
                checked={selectedAnswer === option}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                className="form-radio"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )}

      {currentQuestion.type === 'short_answer' && (
        <input
          type="text"
          value={selectedAnswer}
          onChange={(e) => setSelectedAnswer(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter your answer"
        />
      )}

      {!showExplanation ? (
        <button
          onClick={handleAnswerSubmit}
          disabled={!selectedAnswer}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Submit Answer
        </button>
      ) : (
        <div className="mt-4">
          <p className="font-bold">
            {selectedAnswer === currentQuestion.correct_answer ? 'Correct!' : 'Incorrect!'}
          </p>
          <p className="mt-2">{currentQuestion.explanation}</p>
          <button
            onClick={handleNextQuestion}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
          >
            Next Question
          </button>
        </div>
      )}
    </div>
  );
}; 