'use client';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Header } from '@/components/layout/Header';
import { PDFViewer } from '@/components/editor/PDFViewer';
import { NetworkDiagram } from '@/components/editor/NetworkDiagram';
import { Sidebar } from '@/components/editor/Sidebar';

export default function Home() {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={50}>
            <PDFViewer url="/sample.pdf" />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>
            <NetworkDiagram />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
