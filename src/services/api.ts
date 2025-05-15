import axios from 'axios';
import { PageContent } from './pdf-extractor';

export const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface Topic {
  name: string;
  confidence: number;
  pageNumber: number;
  lineNumber: number;
}

export interface Chapter {
  name: string;
  confidence: number;
  pageNumber: number;
  lineNumber: number;
}

export interface QuizQuestion {
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

export interface AnalysisResponse {
  topics: Array<{
    name: string;
    confidence: number;
    page_number: number;
    line_number: number;
  }>;
  chapters: Array<{
    number: number;
    name: string;
    confidence: number;
    page_number: number;
    line_number: number;
  }>;
  questions: QuizQuestion[];
}

export class API {
  static async analyzePages(pages: PageContent[]): Promise<AnalysisResponse> {
    try {
      const response = await axios.post(`${API_URL}/pdf/analyze-pages`, {
        pages: pages.map(page => ({
          page_number: page.pageNumber,
          text: page.text,
          line_numbers: page.lineNumbers
        }))
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to analyze pages');
    }
  }

  public static async getAnalysisResults(fileId: string): Promise<AnalysisResponse> {
    try {
      const response = await axios.get(`${API_URL}/pdf/analysis/${fileId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting analysis results:', error);
      throw error;
    }
  }
}