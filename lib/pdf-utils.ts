import * as pdfjsLib from 'pdfjs-dist/webpack';

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export type PDFDocumentType = pdfjsLib.PDFDocumentProxy;
export type PDFPageType = pdfjsLib.PDFPageProxy;

export async function loadPDFDocument(url: string): Promise<PDFDocumentType> {
  try {
    const loadingTask = pdfjsLib.getDocument(url);
    return await loadingTask.promise;
  } catch (error) {
    console.error('Error loading PDF:', error);
    throw error;
  }
}

export async function renderPDFPage(
  page: PDFPageType,
  canvas: HTMLCanvasElement,
  scale: number
): Promise<void> {
  const viewport = page.getViewport({ scale });
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Could not get canvas context');
  }

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  try {
    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;
  } catch (error) {
    console.error('Error rendering PDF page:', error);
    throw error;
  }
}