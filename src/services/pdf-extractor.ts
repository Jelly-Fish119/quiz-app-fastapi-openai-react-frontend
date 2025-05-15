import * as pdfjsLib from 'pdfjs-dist';
import axios from 'axios';
import { API_URL } from './api';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface PageContent {
  pageNumber: number;
  text: string;
  lineNumbers: { start: number; end: number; }[];
}

export interface UploadProgress {
  percentage: number;
}

export class PDFExtractor {
  private static readonly CHUNK_SIZE = 1024 * 1024; // 1MB chunks

  public static async uploadFile(file: File, onProgress?: (progress: UploadProgress) => void): Promise<string> {
    const totalChunks = Math.ceil(file.size / this.CHUNK_SIZE);
    let uploadedChunks = 0;
    const fileName = file.name;

    const uploadChunk = async (chunk: Blob, chunkIndex: number): Promise<void> => {
      const formData = new FormData();
      formData.append('file', chunk);
      formData.append('chunk_index', chunkIndex.toString());
      formData.append('total_chunks', totalChunks.toString());
      formData.append('file_name', fileName);

      console.log(`Uploading chunk ${chunkIndex} of ${totalChunks} for file ${fileName}`);
      await axios.post(`${API_URL}/pdf/upload-chunk`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      uploadedChunks++;
      if (onProgress) {
        onProgress({
          percentage: (uploadedChunks / totalChunks) * 100
        });
      }
    };

    // Upload chunks sequentially
    for (let i = 0; i < totalChunks; i++) {
      const start = i * this.CHUNK_SIZE;
      const end = Math.min(start + this.CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);
      await uploadChunk(chunk, i);
    }

    console.log(`Finalizing upload for file ${fileName} with ${totalChunks} chunks`);
    const formData = new FormData();
    formData.append('file_name', fileName);
    formData.append('total_chunks', totalChunks.toString());

    const response = await axios.post(`${API_URL}/pdf/finalize-upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (response.status !== 200) {
      throw new Error('Failed to finalize upload');
    }

    return response.data.fileId;
  }

  public static async extractPages(file: File): Promise<PageContent[]> {
    try {
      const pdf = await pdfjsLib.getDocument(await file.arrayBuffer()).promise;
      const pages: PageContent[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items.map((item: any) => item.str).join(' ');
        const lineNumbers = content.items.map((item: any) => ({
          start: item.transform[5],
          end: item.transform[5] + 12
        }));
        
        pages.push({
          pageNumber: i,
          text,
          lineNumbers
        });
      }

      return pages;
    } catch (error) {
      console.error('Error extracting PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  async finalizeUpload(fileName: string, totalChunks: number): Promise<string> {
    const formData = new FormData();
    formData.append('file_name', fileName);
    formData.append('total_chunks', totalChunks.toString());

    const response = await axios.post(`${API_URL}/pdf/finalize-upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (response.status !== 200) {
      throw new Error('Failed to finalize upload');
    }

    return response.data.fileId;
  }
}

// Export the extractPages function directly
export const extractPages = PDFExtractor.extractPages;
