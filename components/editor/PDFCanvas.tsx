'use client';

import { useEffect, useRef } from 'react';
import { PDFPageType, renderPDFPage } from '@/lib/pdf-utils';

interface PDFCanvasProps {
  page: PDFPageType | null;
  scale: number;
  className?: string;
}

export function PDFCanvas({ page, scale, className = '' }: PDFCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderingRef = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !page || renderingRef.current) return;

    renderingRef.current = true;
    renderPDFPage(page, canvas, scale)
      .finally(() => {
        renderingRef.current = false;
      });

    return () => {
      // Clear the canvas on cleanup
      const context = canvas.getContext('2d');
      context?.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [page, scale]);

  return <canvas ref={canvasRef} className={className} />;
}