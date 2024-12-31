'use client';

import { Button } from '@/components/ui/button';
import { MenuIcon, Save, ZoomIn, ZoomOut } from 'lucide-react';
import { useEditorStore } from '@/lib/store';

export function Header() {
  const { zoomLevel, setZoomLevel } = useEditorStore();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <Button variant="ghost" size="icon" className="mr-4">
          <MenuIcon className="h-5 w-5" />
        </Button>
        
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Floor Plan & Network Editor</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <span className="min-w-[3rem] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Save className="h-5 w-5" /> {/* TODO: Implement Saving functionality */}
          </Button>
        </div>
      </div>
    </header>
  );
}