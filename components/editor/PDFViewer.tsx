'use client';

import { usePDFPage } from '@/hooks/usePDFPage';
import { PDFCanvas } from './PDFCanvas';
import { useEditorStore } from '@/lib/store';

interface PDFViewerProps {
  url: string;
}

export function PDFViewer({ url }: PDFViewerProps) {
  const { zoomLevel } = useEditorStore();
  const { page, loading, error } = usePDFPage(url);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Loading PDF...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted">
        <p className="text-destructive">Failed to load PDF</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto bg-muted p-4">
      <PDFCanvas
        page={page}
        scale={zoomLevel}
        className="mx-auto shadow-lg"
      />
    </div>
  );
}