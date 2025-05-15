import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Button,
  Paper,
  Divider,
  Alert,
  Chip,
  Stack,
} from '@mui/material';

interface Option {
  text: string;
  value: string;
}

interface Question {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_answer';
  page_number: number;
  line_number: number;
  chapter: string;
  topic: string;
}

interface QuizDisplayProps {
  questions: Question[];
}

const QuizDisplay: React.FC<QuizDisplayProps> = ({ questions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerChange = (answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      if (userAnswer && userAnswer.toLowerCase() === question.correct_answer.toLowerCase()) {
        correctAnswers++;
      }
    });
    setScore((correctAnswers / questions.length) * 100);
    setShowResults(true);
  };

  const renderQuestionInput = () => {
    switch (currentQuestion.type) {
      case 'multiple_choice':
        return (
          <FormControl component="fieldset">
            <RadioGroup
              value={userAnswers[currentQuestionIndex] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
            >
              {currentQuestion.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option.split(']')[0] + ']'}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );

      case 'true_false':
        return (
          <FormControl component="fieldset">
            <RadioGroup
              value={userAnswers[currentQuestionIndex] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
            >
              <FormControlLabel value="True" control={<Radio />} label="True" />
              <FormControlLabel value="False" control={<Radio />} label="False" />
            </RadioGroup>
          </FormControl>
        );

      case 'fill_blank':
        return (
          <TextField
            fullWidth
            value={userAnswers[currentQuestionIndex] || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Enter your answer"
            variant="outlined"
          />
        );

      case 'short_answer':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            value={userAnswers[currentQuestionIndex] || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Enter your answer"
            variant="outlined"
          />
        );

      default:
        return null;
    }
  };

  const renderQuestionResult = () => {
    if (!showResults) return null;

    const userAnswer = userAnswers[currentQuestionIndex];
    const isCorrect = userAnswer && userAnswer.toLowerCase() === currentQuestion.correct_answer.toLowerCase();

    return (
      <Box mt={2}>
        <Alert severity={isCorrect ? 'success' : 'error'}>
          {isCorrect ? 'Correct!' : 'Incorrect!'}
        </Alert>
        <Typography variant="body2" color="textSecondary" mt={1}>
          <strong>Correct Answer:</strong> {currentQuestion.correct_answer}
        </Typography>
        <Typography variant="body2" color="textSecondary" mt={1}>
          <strong>Explanation:</strong> {currentQuestion.explanation}
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      {showResults ? (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Quiz Results
          </Typography>
          <Typography variant="h5" color="primary">
            Score: {score.toFixed(1)}%
          </Typography>
          <Typography variant="body1" mt={2}>
            You got {Math.round((score / 100) * questions.length)} out of {questions.length} questions correct.
          </Typography>
        </Paper>
      ) : (
        <Card>
          <CardContent>
            <Stack direction="row" spacing={1} mb={2}>
              <Chip label={`Chapter: ${currentQuestion.chapter}`} />
              <Chip label={`Topic: ${currentQuestion.topic}`} />
              <Chip label={`Page: ${currentQuestion.page_number}`} />
              <Chip label={`Line: ${currentQuestion.line_number}`} />
            </Stack>

            <Typography variant="h6" gutterBottom>
              Question {currentQuestionIndex + 1} of {questions.length}
            </Typography>

            <Typography variant="body1" gutterBottom>
              {currentQuestion.question}
            </Typography>

            <Box mt={2}>
              {renderQuestionInput()}
            </Box>

            {renderQuestionResult()}

            <Box mt={3} display="flex" justifyContent="space-between">
              <Button
                variant="contained"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>

              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={calculateScore}
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default QuizDisplay; 