import React, { useState } from 'react';
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Button,
  Paper,
  Alert,
  Grid,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import { QuizQuestion } from '../services/api';

interface QuizDisplayProps {
  questions: {
    multiple_choice: QuizQuestion[];
    true_false: QuizQuestion[];
    fill_blanks: QuizQuestion[];
    matching: QuizQuestion[];
    short_answer: QuizQuestion[];
  };
}

export const QuizDisplay: React.FC<QuizDisplayProps> = ({ questions }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    let correct = 0;
    let total = 0;

    // Check multiple choice and true/false questions
    [...questions.multiple_choice, ...questions.true_false].forEach((q, index) => {
      total++;
      if (answers[`q${index}`]?.toLowerCase() === q.correct_answer.toLowerCase()) {
        correct++;
      }
    });

    // Check fill in the blanks questions
    questions.fill_blanks.forEach((q, index) => {
      total++;
      const userAnswer = answers[`q${index + questions.multiple_choice.length + questions.true_false.length}`]?.toLowerCase() || '';
      if (userAnswer.includes(q.correct_answer.toLowerCase()) || 
          q.correct_answer.toLowerCase().includes(userAnswer)) {
        correct++;
      }
    });

    // Check matching questions
    questions.matching.forEach((q, index) => {
      total++;
      const userAnswer = answers[`q${index + questions.multiple_choice.length + questions.true_false.length + questions.fill_blanks.length}`]?.toLowerCase() || '';
      const correctMatches = q.correct_answer.toLowerCase().split(',');
      const userMatches = userAnswer.split(',');
      if (userMatches.length === correctMatches.length && 
          userMatches.every(match => correctMatches.includes(match))) {
        correct++;
      }
    });

    // Check short answer questions
    questions.short_answer.forEach((q, index) => {
      total++;
      const userAnswer = answers[`q${index + questions.multiple_choice.length + questions.true_false.length + questions.fill_blanks.length + questions.matching.length}`]?.toLowerCase() || '';
      if (userAnswer.includes(q.correct_answer.toLowerCase()) || 
          q.correct_answer.toLowerCase().includes(userAnswer)) {
        correct++;
      }
    });

    setScore({ correct, total });
    setShowResults(true);
  };

  const renderQuestion = (question: QuizQuestion, index: number, type: string) => {
    const questionId = `q${index}`;
    const isCorrect = showResults && answers[questionId]?.toLowerCase() === question.correct_answer.toLowerCase();

    return (
      <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: showResults ? (isCorrect ? '#e8f5e9' : '#ffebee') : 'white' }}>
        <Typography variant="h6" gutterBottom>
          {type} Question {index + 1}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {question.question}
        </Typography>

        {type === 'Multiple Choice' && (
          <FormControl component="fieldset">
            <RadioGroup
              value={answers[questionId] || ''}
              onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            >
              {question.options.map((option, optIndex) => (
                <FormControlLabel
                  key={optIndex}
                  value={option}
                  control={<Radio />}
                  label={option}
                  disabled={showResults}
                />
              ))}
            </RadioGroup>
          </FormControl>
        )}

        {type === 'True/False' && (
          <FormControl component="fieldset">
            <RadioGroup
              value={answers[questionId] || ''}
              onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            >
              <FormControlLabel value="true" control={<Radio />} label="True" disabled={showResults} />
              <FormControlLabel value="false" control={<Radio />} label="False" disabled={showResults} />
            </RadioGroup>
          </FormControl>
        )}

        {type === 'Fill in the Blanks' && (
          <TextField
            fullWidth
            value={answers[questionId] || ''}
            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            disabled={showResults}
            placeholder="Enter your answer..."
            sx={{ mt: 1 }}
          />
        )}

        {type === 'Matching' && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {question.options.map((term, termIndex) => (
                <Box key={termIndex}>
                  <FormControl fullWidth>
                    <InputLabel>{term}</InputLabel>
                    <Select
                      value={answers[`${questionId}_${termIndex}`] || ''}
                      onChange={(e) => {
                        const newAnswers = { ...answers };
                        newAnswers[`${questionId}_${termIndex}`] = e.target.value;
                        setAnswers(newAnswers);
                      }}
                      disabled={showResults}
                    >
                      {question.correct_answer.split(',').map((def, defIndex) => (
                        <MenuItem key={defIndex} value={def}>
                          {def}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {type === 'Short Answer' && (
          <TextField
            fullWidth
            multiline
            rows={2}
            value={answers[questionId] || ''}
            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            disabled={showResults}
            placeholder="Enter your answer..."
          />
        )}

        {showResults && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color={isCorrect ? 'success.main' : 'error.main'}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Correct Answer: {question.correct_answer}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Explanation: {question.explanation}
            </Typography>
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Quiz Questions
      </Typography>

      {questions.multiple_choice.map((q, i) => renderQuestion(q, i, 'Multiple Choice'))}
      {questions.true_false.map((q, i) => renderQuestion(q, i + questions.multiple_choice.length, 'True/False'))}
      {questions.fill_blanks.map((q, i) => renderQuestion(q, i + questions.multiple_choice.length + questions.true_false.length, 'Fill in the Blanks'))}
      {questions.matching.map((q, i) => renderQuestion(q, i + questions.multiple_choice.length + questions.true_false.length + questions.fill_blanks.length, 'Matching'))}
      {questions.short_answer.map((q, i) => renderQuestion(q, i + questions.multiple_choice.length + questions.true_false.length + questions.fill_blanks.length + questions.matching.length, 'Short Answer'))}

      {!showResults && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={Object.keys(answers).length === 0}
          sx={{ mt: 2 }}
        >
          Submit Answers
        </Button>
      )}

      {showResults && (
        <Alert severity={score.correct / score.total >= 0.7 ? 'success' : 'warning'} sx={{ mt: 2 }}>
          Your Score: {score.correct} out of {score.total} ({Math.round((score.correct / score.total) * 100)}%)
        </Alert>
      )}
    </Box>
  );
}; 