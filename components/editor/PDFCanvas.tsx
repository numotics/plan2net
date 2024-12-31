"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { PDFPageType, renderPDFPage } from "@/lib/pdf-utils";
import { NetworkItem } from "@/lib/store";

interface PDFCanvasProps {
  page: PDFPageType | null;
  scale: number;
  className?: string;
  items: Record<string, NetworkItem>;
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
    Object.values(items).map((item) => ({
      ...item,
      isDragging: false,
    }))
  );

  useEffect(() => {
    setDraggableItems(
      Object.values(items).map((item) => ({
        ...item,
        isDragging: false,
      }))
    );
  }, [items]);

  const drawItems = useCallback((context: CanvasRenderingContext2D) => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.font = "20px Arial";
    context.fillStyle = "black";

    draggableItems.forEach((item) => {
      let { x, y } = item.pdfPosition;
      x = x * scale;
      y = y * scale;
      context.fillText(item.label, x, y);

      context.fillStyle = "rgba(200,200,200,0.5)";
      context.fillRect(x, y - HANDLE_SIZE, HANDLE_SIZE, HANDLE_SIZE);
      context.fillStyle = "black";
    });
  }, [draggableItems, scale]);

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
  }, [page, scale]);
  useEffect(() => {
    const canvas = itemsCanvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;
    drawItems(context);
  }, [draggableItems, drawItems]);

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      const canvas = itemsCanvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const offsetX = (event.clientX - rect.left) / scale;
      const offsetY = (event.clientY - rect.top) / scale;

      let itemToDragIndex = -1;

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

  const handleMouseMove = useCallback((event: MouseEvent) => {
      const canvas = itemsCanvasRef.current;
      if (!canvas) return;

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
  }, [scale, draggableItems]);
  useEffect(() => {
    const canvas = itemsCanvasRef.current;
    if (!canvas) return;

    let animationFrameId: number;

    const moveListener = (event: MouseEvent) => {
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(() => {
          handleMouseMove(event);
          animationFrameId = 0;
        });
      }
    };

    canvas.addEventListener("mousemove", moveListener);

    return () => {
      canvas.removeEventListener("mousemove", moveListener);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [handleMouseMove]);

  const handleMouseUp = useCallback(() => {
    setDraggableItems((prevItems) =>
      prevItems.map((item) => {
        if (item.isDragging) {
          const { isDragging, ...networkItem } = item;
          updateItem(networkItem);
        }
        return {
          ...item,
          isDragging: false,
        };
      })
  );
  }, [updateItem]);

  useEffect(() => {
    const canvas = itemsCanvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseDown, handleMouseUp]);

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
