'use client';

import { useEffect, useRef } from "react";
import { PDFPageType, renderPDFPage } from "@/lib/pdf-utils";
import { NetworkItem } from "@/lib/store";
import { ItemsCanvas } from "./ItemsCanvas";

interface PDFCanvasProps {
  page: PDFPageType | null;
  scale: number;
  className?: string;
  items: Record<string, NetworkItem>;
  updateItem: (updatedItem: NetworkItem) => void;
}

export function PDFCanvas({
  page,
  scale,
  className = "",
  items,
  updateItem,
}: PDFCanvasProps) {
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const renderPDF = async () => {
      if (!page || !pdfCanvasRef.current) return;
      const canvas = pdfCanvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;
      
      const viewport = page.getViewport({ scale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      setDimensions({
        width: viewport.width,
        height: viewport.height
      });

      try {
        context.clearRect(0, 0, canvas.width, canvas.height);
        await renderPDFPage(page, canvas, scale);
      } catch (error) {
        console.error("Error rendering PDF page:", error);
      }
    };

    renderPDF();
  }, [page, scale]);

  return (
    <div style={{ position: "relative" }} className={className}>
      <canvas
        ref={pdfCanvasRef}
        style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}
      />
      <ItemsCanvas
        width={dimensions.width}
        height={dimensions.height}
        scale={scale}
        items={items}
        updateItem={updateItem}
        className={className}
      />
    </div>
  );
}
