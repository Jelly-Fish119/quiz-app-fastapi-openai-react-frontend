import axios from 'axios';
import { ExtractedPage } from './pdf-extractor';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface Topic {
  name: string;
  confidence: number;
  pageNumber: number;
}

export interface Chapter {
  name: string;
  confidence: number;
  pageNumber: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blanks' | 'matching' | 'short_answer';
}

export interface QuizResponse {
  topics: Topic[];
  chapters: Chapter[];
  questions: {
    multiple_choice: QuizQuestion[];
    true_false: QuizQuestion[];
    fill_blanks: QuizQuestion[];
    matching: QuizQuestion[];
    short_answer: QuizQuestion[];
  };
}

export class API {
  static async analyzePages(pages: ExtractedPage[]): Promise<QuizResponse> {
    try {
      const response = await axios.post(`${API_URL}/pdf/analyze-pages`, {
        pages: pages.map(page => ({
          page_number: page.pageNumber,
          text: page.text
        }))
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to analyze pages');
    }
  }
} 