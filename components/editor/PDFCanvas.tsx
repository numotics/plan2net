"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { PDFPageType, renderPDFPage } from "@/lib/pdf-utils";
import { NetworkItem } from "@/lib/store";
import { getIcon } from "@/lib/itemLibrary";

interface PDFCanvasProps {
  page: PDFPageType | null;
  scale: number;
  className?: string;
  items: NetworkItem[];
  updateItem: (updatedItem: NetworkItem) => void;
}

interface DraggableItem extends NetworkItem {
  isDragging: boolean;
}

const HANDLE_SIZE = 20;

export function PDFCanvas({
  page,
  scale,
  className = "",
  items,
  updateItem,
}: PDFCanvasProps) {
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const itemsCanvasRef = useRef<HTMLCanvasElement>(null);
  const [draggableItems, setDraggableItems] = useState<DraggableItem[]>(
    items.map((item) => ({
      ...item,
      isDragging: false,
    }))
  );

  useEffect(() => {
    setDraggableItems(
      items.map((item) => ({
        ...item,
        isDragging: false,
      }))
    );
  }, [items]);

  useEffect(() => {
    const renderPDF = async () => {
      if (!page || !pdfCanvasRef.current || !itemsCanvasRef.current) return;
      const canvas = pdfCanvasRef.current;
      const itemsCanvas = itemsCanvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;
      const viewport = page.getViewport({ scale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      itemsCanvas.width = viewport.width;
      itemsCanvas.height = viewport.height;

      try {
        context.clearRect(0, 0, canvas.width, canvas.height);
        await renderPDFPage(page, canvas, scale);
        let itemsContext;
        if ((itemsContext = itemsCanvas.getContext("2d"))) {
          drawItems(itemsContext);
        }
      } catch (error) {
        console.error("Error rendering PDF page:", error);
      }
    };

    renderPDF();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, scale]);

  const drawItems = (context: CanvasRenderingContext2D) => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.font = "20px Arial";
    context.fillStyle = "black";

    draggableItems.forEach((item) => {
      let { x, y } = item.pdfPosition;
      x = x * scale;
      y = y * scale;
      const icon = getIcon(item.type);
      if (icon) {
        //context.drawImage(icon, x, yPos - icon.height);
      }
      context.fillText(item.label, x, y);

      context.fillStyle = "rgba(200,200,200,0.5)"; // or any distinguishable color
      context.fillRect(x, y - HANDLE_SIZE, HANDLE_SIZE, HANDLE_SIZE); // Draw handle at bottom right corner
      context.fillStyle = "black"; // or any distinguishable color
    });
  };

  useEffect(() => {
    const canvas = itemsCanvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;
    drawItems(context);
  }, [draggableItems]);

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      const canvas = itemsCanvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const offsetX = (event.clientX - rect.left) / scale;
      const offsetY = (event.clientY - rect.top) / scale;

      let itemToDragIndex = -1;

      // Loop through items in reverse to get the topmost item (assuming later items are 'on top')
      for (let i = draggableItems.length - 1; i >= 0; i--) {
        const item = draggableItems[i];
        const { x, y } = item.pdfPosition;

        if (
          offsetX >= x &&
          offsetX <= x + HANDLE_SIZE &&
          offsetY >= y - HANDLE_SIZE &&
          offsetY <= y
        ) {
          itemToDragIndex = i;
          break;
        }
      }

      if (itemToDragIndex !== -1) {
        setDraggableItems((prevItems) =>
          prevItems.map((item, index) => ({
            ...item,
            isDragging: index === itemToDragIndex,
          }))
        );
      }
    },
    [scale, draggableItems]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const canvas = itemsCanvasRef.current;
      if (!canvas) return;

      const draggingItem = draggableItems.find((item) => item.isDragging);
      if (!draggingItem) return;

      const rect = canvas.getBoundingClientRect();
      const offsetX = (event.clientX - rect.left) / scale;
      const offsetY = (event.clientY - rect.top) / scale;

      setDraggableItems((prevItems) =>
        prevItems.map((item) =>
          item.isDragging
            ? {
                ...item,
                pdfPosition: {
                  x: offsetX,
                  y: offsetY,
                },
              }
            : item
        )
      );
    },
    [scale, draggableItems]
  );

  const handleMouseUp = useCallback(() => {
    setDraggableItems((prevItems) =>
      prevItems.map((item) => {
        if (item.isDragging) {
          const { isDragging, ...networkItem } = item; // Exclude isDragging
          updateItem(networkItem); // Pass only NetworkItem fields
        }
        return {
          ...item,
          isDragging: false,
        };
      })
    );
  }, [updateItem]); // Ensure updateItem is included in dependencies

  useEffect(() => {
    const canvas = itemsCanvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  return (
    <div style={{ position: "relative" }} className={className}>
      <canvas
        ref={pdfCanvasRef}
        style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}
      />
      <canvas
        ref={itemsCanvasRef}
        className={className}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
          touchAction: "none",
        }}
      />
    </div>
  );
}
