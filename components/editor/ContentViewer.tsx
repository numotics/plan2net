'use client';

import { PDFViewer } from './PDFViewer';
import { ImageViewer } from './ImageViewer';
import { useEditorStore } from '@/lib/store';

export function ContentViewer() {
  const { contentData, contentType } = useEditorStore();

  if (!contentData) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">No content loaded</p>
      </div>
    );
  }

  if (contentType === 'image') {
    return <ImageViewer data={contentData} />;
  }

  return <PDFViewer data={contentData} />;
}
