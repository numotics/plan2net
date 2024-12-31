'use client';

import { useEditorStore } from '@/lib/store';

interface ImageViewerProps {
  url: string;
}

export function ImageViewer({ url }: ImageViewerProps) {
  const { zoomLevel, itemsRegistry, updateItem } = useEditorStore();

  return (
    <div className="h-full w-full overflow-auto bg-muted p-4">
      <div className="mx-auto" style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}>
        <img 
          src={url} 
          alt="Floor plan"
          className="max-w-none shadow-lg"
          style={{ 
            imageRendering: 'pixelated',
          }}
        />
      </div>
    </div>
  );
}
