import React, { useState } from 'react';
import { uploadPdf } from '../features/pdf-topic-extractor/api';

interface Chapter {
  title: string;
  pageNumber: number;
  position: {
    top: number;
    left: number;
  };
  topics: Topic[];
}

interface Topic {
  name: string;
  pageNumber: number;
  position: {
    top: number;
    left: number;
  };
  subTopics?: Topic[];
}

interface AnalysisResponse {
  chapters: Chapter[];
}

export const ChapterAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    try {
      setIsLoading(true);
      const result = await uploadPdf(file);
      setAnalysis(result);
    } catch (error) {
      alert('Failed to analyze document');
    } finally {
      setIsLoading(false);
    }
  };

  const renderChapterTree = (chapter: Chapter) => (
    <div 
      key={chapter.title}
      className={`p-4 rounded-lg cursor-pointer transition-all
        ${selectedChapter?.title === chapter.title 
          ? 'bg-blue-50 border-2 border-blue-500' 
          : 'bg-white border-2 border-gray-100 hover:border-blue-300'}`}
      onClick={() => setSelectedChapter(chapter)}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{chapter.title}</h3>
          <p className="text-sm text-gray-600">Page {chapter.pageNumber}</p>
        </div>
        <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
          {chapter.topics.length} topics
        </span>
      </div>
    </div>
  );

  const renderTopicList = (topics: Topic[], level: number = 0) => (
    <div className={`space-y-2 ${level > 0 ? 'ml-6' : ''}`}>
      {topics.map((topic) => (
        <div key={topic.name} className="relative">
          <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
            <div className="flex-1">
              <h4 className="text-gray-800">{topic.name}</h4>
              <p className="text-sm text-gray-600">Page {topic.pageNumber}</p>
            </div>
            {topic.subTopics && topic.subTopics.length > 0 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                {topic.subTopics.length} sub-topics
              </span>
            )}
          </div>
          {topic.subTopics && topic.subTopics.length > 0 && (
            renderTopicList(topic.subTopics, level + 1)
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Chapter & Topic Analyzer</h1>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleUpload}
              disabled={!file || isLoading}
              className={`px-6 py-3 rounded-lg font-medium text-white transition-colors
                ${!file || isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isLoading ? 'Analyzing...' : 'Analyze Document'}
            </button>
          </div>
        </div>

        {analysis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Chapter List */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Chapters</h2>
                <div className="space-y-4">
                  {analysis.chapters.map(renderChapterTree)}
                </div>
              </div>
            </div>

            {/* Topic Details */}
            <div className="md:col-span-2">
              {selectedChapter ? (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedChapter.title}</h2>
                      <p className="text-gray-600">Page {selectedChapter.pageNumber}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full">
                        {selectedChapter.topics.length} Topics
                      </span>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {renderTopicList(selectedChapter.topics)}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-center h-full">
                  <p className="text-gray-500">Select a chapter to view its topics</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 