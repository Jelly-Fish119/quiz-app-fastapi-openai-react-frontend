import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export class PDFExtractor {
  private static async loadPDF(file: File): Promise<pdfjsLib.PDFDocumentProxy> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    return pdf;
  }

  public static async extractPages(file: File): Promise<ExtractedPage[]> {
    try {
      const pdf = await this.loadPDF(file);
      const pages: ExtractedPage[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items
          .map((item: any) => item.str)
          .join(' ');

        pages.push({
          pageNumber: i,
          text: text
        });
      }

      return pages;
    } catch (error) {
      console.error('Error extracting PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }
} 