'use client';

import { useState, useEffect } from 'react';
import { PDFDocumentType, PDFPageType, loadPDFDocument } from '@/lib/pdf-utils';

export function usePDFPage(url: string, pageNumber: number = 1) {
  const [document, setDocument] = useState<PDFDocumentType | null>(null);
  const [page, setPage] = useState<PDFPageType | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadDocument() {
      try {
        setLoading(true);
        const doc = await loadPDFDocument(url);
        
        if (!mounted) return;
        
        setDocument(doc);
        const pdfPage = await doc.getPage(pageNumber);
        
        if (!mounted) {
          pdfPage.cleanup();
          return;
        }
        
        setPage(pdfPage);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err : new Error('Failed to load PDF'));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDocument();

    return () => {
      mounted = false;
      // Cleanup current page
      page?.cleanup();
    };
  }, [url, pageNumber]);

  return { document, page, error, loading };
}
