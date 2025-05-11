import React, { useState } from 'react';
import { uploadPdf, analyzePdf, generateQuiz } from '../features/pdf-topic-extractor/api';

interface QuizQuestion {
  question: string;
  options?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer?: string;
  answers?: string[];
  pairs?: Record<string, string>;
}

interface PageQuiz {
  topic: string;
  chapter?: string;
  page: number;
  questions: {
    multiple_choice: QuizQuestion[];
    fill_blanks: QuizQuestion[];
    true_false: QuizQuestion[];
    matching: QuizQuestion[];
  };
}

interface QuizResponse {
  quizzes: {
    [key: string]: PageQuiz;
  };
}

interface SubTopic {
  name: string;
  pageNumber: number;
  position: {
    top: number;
    left: number;
  };
  subTopics?: SubTopic[];
}

interface Topic {
  name: string;
  pageNumber: number;
  position: {
    top: number;
    left: number;
  };
  subTopics?: SubTopic[];
}

interface Chapter {
  title: string;
  pageNumber: number;
  position: {
    top: number;
    left: number;
  };
  topics: Topic[];
}

interface AnalysisResponse {
  chapters: {
    chapters: Chapter[];
  };
}

interface SelectedContent {
  chapters: Chapter[];
  topics: Topic[];
  subTopics: SubTopic[];
}

export const UploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [quizzes, setQuizzes] = useState<QuizResponse | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: any}>({});
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const [availablePages, setAvailablePages] = useState<number[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<{top: number; left: number} | null>(null);
  const [selectedContent, setSelectedContent] = useState<SelectedContent | null>(null);
  const [showContentPreview, setShowContentPreview] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    try {
      setIsLoading(true);
      const analysis = await analyzePdf(selectedFile);
      setChapters(analysis.chapters.chapters);
      
      // Extract unique page numbers from chapters
      const pages = new Set<number>();
      analysis.chapters.chapters.forEach((chapter: Chapter) => {
        pages.add(chapter.pageNumber);
        chapter.topics.forEach((topic: Topic) => {
          pages.add(topic.pageNumber);
          topic.subTopics?.forEach((subTopic: SubTopic) => {
            pages.add(subTopic.pageNumber);
          });
        });
      });
      setAvailablePages(Array.from(pages).sort((a, b) => a - b));
    } catch (error) {
      alert('Failed to analyze document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentSelection = () => {
    if (!selectedPage) return;

    const selectedChapters: Chapter[] = [];
    const selectedTopics: Topic[] = [];
    const selectedSubTopics: SubTopic[] = [];

    chapters.forEach((chapter: Chapter) => {
      if (chapter.pageNumber === selectedPage) {
        selectedChapters.push(chapter);
        
        chapter.topics.forEach((topic: Topic) => {
          if (topic.pageNumber === selectedPage) {
            selectedTopics.push(topic);
            
            topic.subTopics?.forEach((subTopic: SubTopic) => {
              if (subTopic.pageNumber === selectedPage) {
                selectedSubTopics.push(subTopic);
              }
            });
          }
        });
      }
    });

    setSelectedContent({
      chapters: selectedChapters,
      topics: selectedTopics,
      subTopics: selectedSubTopics
    });
    setShowContentPreview(true);
  };

  const handleGenerateQuiz = async () => {
    if (!file || !selectedContent) return;
    try {
      setIsLoading(true);
      const result = await generateQuiz(file, selectedChapter || undefined, selectedPage || undefined);
      setQuizzes(result);
      setSelectedAnswers({});
      setShowResults(false);
    } catch (error) {
      alert('Failed to generate quiz questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: any) => {
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
      // Multiple Choice
      pageQuiz.questions.multiple_choice.forEach((question, qIndex) => {
        const questionId = `${pageKey}_mc_${qIndex}`;
        if (selectedAnswers[questionId] === question.correct_answer) {
          correct++;
        }
        total++;
      });

      // Fill in the Blanks
      pageQuiz.questions.fill_blanks.forEach((question, qIndex) => {
        const questionId = `${pageKey}_fb_${qIndex}`;
        const userAnswers = selectedAnswers[questionId] || [];
        const correctAnswers = question.answers || [];
        const correctCount = userAnswers.filter((ans: string, i: number) => 
          ans.toLowerCase() === correctAnswers[i].toLowerCase()
        ).length;
        correct += correctCount;
        total += correctAnswers.length;
      });

      // True/False
      pageQuiz.questions.true_false.forEach((question, qIndex) => {
        const questionId = `${pageKey}_tf_${qIndex}`;
        if (selectedAnswers[questionId] === question.correct_answer) {
          correct++;
        }
        total++;
      });

      // Matching
      pageQuiz.questions.matching.forEach((question, qIndex) => {
        const questionId = `${pageKey}_m_${qIndex}`;
        const userMatches = selectedAnswers[questionId] || {};
        const correctPairs = question.pairs || {};
        const correctCount = Object.entries(correctPairs).filter(([key, value]) => 
          userMatches[key] === value
        ).length;
        correct += correctCount;
        total += Object.keys(correctPairs).length;
      });
    });

    return { correct, total };
  };

  const renderMultipleChoice = (question: QuizQuestion, questionId: string) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <p className="text-lg font-medium mb-4 text-gray-800">{question.question}</p>
      <div className="space-y-3">
        {question.options && Object.entries(question.options).map(([key, value]) => (
          <label 
            key={key} 
            className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all
              ${selectedAnswers[questionId] === key 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'}`}
          >
            <input
              type="radio"
              name={questionId}
              value={key}
              checked={selectedAnswers[questionId] === key}
              onChange={() => handleAnswerSelect(questionId, key)}
              className="hidden"
            />
            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 mr-3">
              {key}
            </span>
            <span className="text-gray-700">{value}</span>
          </label>
        ))}
      </div>
      {showResults && (
        <div className={`mt-4 p-3 rounded-lg ${
          selectedAnswers[questionId] === question.correct_answer
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-700'
        }`}>
          {selectedAnswers[questionId] === question.correct_answer
            ? '✓ Correct!'
            : `✗ Incorrect. The correct answer is ${question.correct_answer}`}
        </div>
      )}
    </div>
  );

  const renderFillBlanks = (question: QuizQuestion, questionId: string) => {
    const blanks = question.question.match(/\[BLANK\]/g) || [];
    const userAnswers = selectedAnswers[questionId] || Array(blanks.length).fill('');
    
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <p className="text-lg font-medium mb-4 text-gray-800">
          {question.question.split('[BLANK]').map((part, i) => (
            <React.Fragment key={i}>
              {part}
              {i < blanks.length && (
                <input
                  type="text"
                  value={userAnswers[i]}
                  onChange={(e) => {
                    const newAnswers = [...userAnswers];
                    newAnswers[i] = e.target.value;
                    handleAnswerSelect(questionId, newAnswers);
                  }}
                  className="mx-2 px-3 py-1 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none w-32"
                  placeholder="Your answer"
                />
              )}
            </React.Fragment>
          ))}
        </p>
        {showResults && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Correct answers:</p>
            <ul className="space-y-2">
              {question.answers?.map((answer, i) => (
                <li key={i} className="flex items-center text-gray-600">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 mr-2">
                    {i + 1}
                  </span>
                  {answer}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderTrueFalse = (question: QuizQuestion, questionId: string) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <p className="text-lg font-medium mb-4 text-gray-800">{question.question}</p>
      <div className="flex space-x-4">
        {['true', 'false'].map((option) => (
          <label 
            key={option}
            className={`flex-1 p-4 rounded-lg border-2 cursor-pointer text-center transition-all
              ${selectedAnswers[questionId] === (option === 'true')
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'}`}
          >
            <input
              type="radio"
              name={questionId}
              value={option}
              checked={selectedAnswers[questionId] === (option === 'true')}
              onChange={() => handleAnswerSelect(questionId, option === 'true')}
              className="hidden"
            />
            <span className="text-lg font-medium">
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </span>
          </label>
        ))}
      </div>
      {showResults && (
        <div className={`mt-4 p-3 rounded-lg ${
          selectedAnswers[questionId] === question.correct_answer
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-700'
        }`}>
          {selectedAnswers[questionId] === question.correct_answer
            ? '✓ Correct!'
            : `✗ Incorrect. The correct answer is ${question.correct_answer ? 'True' : 'False'}`}
        </div>
      )}
    </div>
  );

  const renderMatching = (question: QuizQuestion, questionId: string) => {
    const pairs = question.pairs || {};
    const userMatches = selectedAnswers[questionId] || {};
    
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <p className="text-lg font-medium mb-4 text-gray-800">{question.question}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 mb-3">Terms</h4>
            {Object.keys(pairs).map((term) => (
              <div key={term} className="flex items-center space-x-3">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                  {term}
                </span>
                <select
                  value={userMatches[term] || ''}
                  onChange={(e) => {
                    const newMatches = { ...userMatches, [term]: e.target.value };
                    handleAnswerSelect(questionId, newMatches);
                  }}
                  className="flex-1 p-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select definition</option>
                  {Object.values(pairs).map((def) => (
                    <option key={def} value={def}>{def}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          {showResults && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700 mb-3">Correct Matches</h4>
              {Object.entries(pairs).map(([term, def]) => (
                <div key={term} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200">
                    {term}
                  </span>
                  <span className="text-gray-600">{def}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContentPreview = () => {
    if (!selectedContent) return null;

    return (
      <div className="mb-6 space-y-6">
        {/* Content Tree View */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Content Structure for Page {selectedPage}</h3>
          <div className="space-y-6">
            {selectedContent.chapters.length > 0 ? (
              selectedContent.chapters.map((chapter) => (
                <div key={chapter.title} className="space-y-4">
                  {/* Chapter */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <h4 className="text-lg font-semibold text-blue-900">{chapter.title}</h4>
                    </div>
                  </div>

                  {/* Topics */}
                  <div className="ml-6 space-y-4">
                    <h3>Topic</h3>
                    {chapter.topics.map((topic) => (
                      <div key={topic.name} className="space-y-3">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <h5 className="text-md font-medium text-green-900">{topic.name}</h5>
                          </div>
                        </div>

                        {/* Subtopics */}
                        <h4>Subtopic</h4>
                        {topic.subTopics && topic.subTopics.length > 0 && (
                          <div className="ml-6 space-y-2">
                            {topic.subTopics.map((subTopic) => (
                              <div key={subTopic.name} className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                <div className="flex items-center space-x-3">
                                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                  <p className="text-sm font-medium text-purple-900">{subTopic.name}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No content found for this page</p>
            )}
          </div>
        </div>

        {/* Generate Quiz Button */}
        <button
          onClick={handleGenerateQuiz}
          disabled={isLoading}
          className={`w-full px-6 py-3 rounded-lg font-medium text-white transition-colors
            ${isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'}`}
        >
          {isLoading ? 'Generating...' : 'Generate Quiz'}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">PDF Quiz Generator</h1>
          
          {/* File Upload */}
          <div className="mb-6">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Page Selection */}
          {chapters.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Page
              </label>
              <select
                value={selectedPage || ''}
                onChange={(e) => {
                  const page = e.target.value ? parseInt(e.target.value) : null;
                  setSelectedPage(page);
                  setSelectedChapter('');
                  setSelectedContent(null);
                  setShowContentPreview(false);
                }}
                className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select a page</option>
                {availablePages.map((page) => (
                  <option key={page} value={page}>
                    Page {page}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Preview Content Button */}
          {selectedPage && !showContentPreview && (
            <button
              onClick={handleContentSelection}
              className="w-full mb-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Preview Chapters, Topics and Subtopics
            </button>
          )}

          {/* Content Preview */}
          {showContentPreview && renderContentPreview()}
        </div>

        {/* Quiz Display */}
        {quizzes && (
          <div className="space-y-8">
            {Object.entries(quizzes.quizzes).map(([pageKey, pageQuiz]) => (
              <div key={pageKey} className="bg-white rounded-2xl shadow-lg p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {pageQuiz.chapter ? `Chapter: ${pageQuiz.chapter}` : `Page ${pageQuiz.page}`}
                  </h2>
                  <p className="text-gray-600">Topic: {pageQuiz.topic}</p>
                </div>

                {/* Multiple Choice Questions */}
                <div className="mb-12">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-3">
                      1
                    </span>
                    Multiple Choice Questions
                  </h3>
                  <div className="space-y-6">
                    {pageQuiz.questions.multiple_choice.map((question, qIndex) => (
                      <div key={`${pageKey}_mc_${qIndex}`}>
                        {renderMultipleChoice(question, `${pageKey}_mc_${qIndex}`)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fill in the Blanks */}
                <div className="mb-12">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-green-600 mr-3">
                      2
                    </span>
                    Fill in the Blanks
                  </h3>
                  <div className="space-y-6">
                    {pageQuiz.questions.fill_blanks.map((question, qIndex) => (
                      <div key={`${pageKey}_fb_${qIndex}`}>
                        {renderFillBlanks(question, `${pageKey}_fb_${qIndex}`)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* True/False Questions */}
                <div className="mb-12">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">
                      3
                    </span>
                    True/False Questions
                  </h3>
                  <div className="space-y-6">
                    {pageQuiz.questions.true_false.map((question, qIndex) => (
                      <div key={`${pageKey}_tf_${qIndex}`}>
                        {renderTrueFalse(question, `${pageKey}_tf_${qIndex}`)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Matching Questions */}
                <div className="mb-12">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 mr-3">
                      4
                    </span>
                    Matching Questions
                  </h3>
                  <div className="space-y-6">
                    {pageQuiz.questions.matching.map((question, qIndex) => (
                      <div key={`${pageKey}_m_${qIndex}`}>
                        {renderMatching(question, `${pageKey}_m_${qIndex}`)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Results Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowResults(true)}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Check Answers
                  </button>
                  
                  {showResults && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium text-gray-800">Your Score</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {calculateScore().correct} / {calculateScore().total}
                        </span>
                      </div>
                      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 transition-all duration-500"
                          style={{ 
                            width: `${(calculateScore().correct / calculateScore().total) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
