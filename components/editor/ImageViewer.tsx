'use client';

import { useEditorStore } from '@/lib/store';
import { useEffect, useRef, useState } from 'react';
import { ItemsCanvas } from './ItemsCanvas';

interface ImageViewerProps {
  data: string;
}

export function ImageViewer({ data }: ImageViewerProps) {
  const { zoomLevel, itemsRegistry, updateItem } = useEditorStore();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = new Image();
    img.src = data;
    img.onload = () => {
      setDimensions({
        width: img.width * zoomLevel,
        height: img.height * zoomLevel
      });
    };
  }, [data, zoomLevel]);

  return (
    <div className="h-full w-full overflow-auto bg-muted p-4">
      <div className="relative mx-auto" style={{ width: dimensions.width, height: dimensions.height }}>
        <img 
          ref={imageRef}
          src={data} 
          alt="Floor plan"
          className="max-w-none shadow-lg absolute top-0 left-0"
          style={{ 
            width: dimensions.width,
            height: dimensions.height,
            imageRendering: 'pixelated',
          }}
        />
        <ItemsCanvas
          width={dimensions.width}
          height={dimensions.height}
          scale={zoomLevel}
          items={itemsRegistry}
          updateItem={updateItem}
        />
      </div>
    </div>
  );
}
