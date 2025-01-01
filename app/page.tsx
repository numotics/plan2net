'use client';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Header } from '@/components/layout/Header';
import { ContentViewer } from '@/components/editor/ContentViewer';
import { NetworkDiagram } from '@/components/editor/NetworkDiagram';
import { Library } from '@/components/editor/Library';
import { PropertyEditor } from '@/components/editor/PropertyEditor';

export default function Home() {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex overflow-hidden">
        <div className="h-screen flex flex-col">
            <Library />
            <PropertyEditor />
        </div>
        <ResizablePanelGroup direction="horizontal" className="flex-grow">
          <ResizablePanel defaultSize={50}>
            <ContentViewer />
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
