import * as pdfjs from 'pdfjs-dist';
import { API } from './api';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export interface ExtractedPage {
    pageNumber: number;
    text: string;
}

export interface Chapter {
    name: string;
    confidence: number;
}

export class PDFService {
    private static instance: PDFService;
    private currentPDF: pdfjs.PDFDocumentProxy | null = null;

    private constructor() {}

    public static getInstance(): PDFService {
        if (!PDFService.instance) {
            PDFService.instance = new PDFService();
        }
        return PDFService.instance;
    }

    /**
     * Load a PDF file and extract text from all pages
     */
    public async loadPDF(file: File): Promise<ExtractedPage[]> {
        try {
            const arrayBuffer = await file.arrayBuffer();
            this.currentPDF = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            
            const pages: ExtractedPage[] = [];
            for (let i = 1; i <= this.currentPDF.numPages; i++) {
                const page = await this.currentPDF.getPage(i);
                const textContent = await page.getTextContent();
                const text = textContent.items
                    .map((item: any) => item.str)
                    .join(' ')
                    .trim();
                
                pages.push({
                    pageNumber: i,
                    text: text
                });
            }
            
            return pages;
        } catch (error) {
            console.error('Error loading PDF:', error);
            throw new Error('Failed to load PDF file');
        }
    }

    /**
     * Analyze a PDF file and return topics and chapters for all pages
     */
    public async analyzePDF(file: File): Promise<any> {
        try {
            const pages = await this.loadPDF(file);
            const response = await API.analyzePages(pages);
            return response;
        } catch (error) {
            console.error('Error analyzing PDF:', error);
            throw new Error('Failed to analyze PDF');
        }
    }

    /**
     * Analyze chapters from a specific page
     */
    public async analyzeChapters(page: ExtractedPage): Promise<Chapter[]> {
        try {
            const response = await API.analyzePage(page.pageNumber, page.text);
            return response.chapters;
        } catch (error) {
            console.error('Error analyzing chapters:', error);
            throw new Error('Failed to analyze chapters');
        }
    }

    /**
     * Generate quiz questions for a specific page and chapter
     */
    public async generateQuiz(page: ExtractedPage, chapter: Chapter): Promise<any> {
        try {
            const response = await API.generateQuiz(page.pageNumber, page.text, chapter.name);
            return response.questions;
        } catch (error) {
            console.error('Error generating quiz:', error);
            throw new Error('Failed to generate quiz questions');
        }
    }

    /**
     * Clean up resources
     */
    public async cleanup(): Promise<void> {
        if (this.currentPDF) {
            await this.currentPDF.destroy();
            this.currentPDF = null;
        }
    }
} 