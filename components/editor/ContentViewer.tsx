'use client';

import { PDFViewer } from './PDFViewer';
import { ImageViewer } from './ImageViewer';
import { useEditorStore } from '@/lib/store';

export function ContentViewer() {
  const { contentURL, contentType } = useEditorStore();

  if (contentType === 'image') {
    return <ImageViewer url={contentURL} />;
  }

  return <PDFViewer url={contentURL} />;
}
