import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface LineNumber {
  start: number;
  end: number;
}

export interface PageContent {
  page_number: number;
  text: string;
  line_numbers: LineNumber[];
}

export interface Topic {
  name: string;
  confidence: number;
  page_number: number;
  line_number: number;
}

export interface Chapter {
  number: number;
  name: string;
  confidence: number;
  page_number: number;
  line_number: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  type: string;
  page_number: number;
  line_number: number;
  chapter: string;
  topic: string;
}

export interface AnalysisResponse {
  topics: Topic[];
  chapters: Chapter[];
  questions: QuizQuestion[];
}

export class API {
  static async uploadChunk(file: File, chunkIndex: number, totalChunks: number, fileName: string): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('chunk_index', chunkIndex.toString());
    formData.append('total_chunks', totalChunks.toString());
    formData.append('file_name', fileName);

    try {
      await axios.post(`${API_URL}/pdf/upload-chunk`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      throw new Error('Failed to upload chunk');
    }
  }

  static async finalizeUpload(fileName: string, totalChunks: number): Promise<AnalysisResponse> {
    const formData = new FormData();
    formData.append('file_name', fileName);
    formData.append('total_chunks', totalChunks.toString());

    try {
      const response = await axios.post(`${API_URL}/pdf/finalize-upload`, formData);
      return response.data.analysis;
    } catch (error) {
      throw new Error('Failed to finalize upload');
    }
  }

  static async getAnalysis(fileId: string): Promise<AnalysisResponse> {
    try {
      const response = await axios.get(`${API_URL}/pdf/analysis/${fileId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get analysis results');
    }
  }
}