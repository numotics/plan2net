'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import { NetworkItem } from "@/lib/store";

interface ItemsCanvasProps {
  width: number;
  height: number;
  scale: number;
  items: Record<string, NetworkItem>;
  updateItem: (updatedItem: NetworkItem) => void;
  className?: string;
}

interface DraggableItem extends NetworkItem {
  isDragging: boolean;
}

const HANDLE_SIZE = 20;

export function ItemsCanvas({
  width,
  height,
  scale,
  items,
  updateItem,
  className = "",
}: ItemsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return;
    drawItems(context);
  }, [width, height, drawItems]);

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      const canvas = canvasRef.current;
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
    const canvas = canvasRef.current;
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
  }, [scale]);

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
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 1,
        touchAction: "none",
      }}
    />
  );
}
