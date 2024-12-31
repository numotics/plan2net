'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';
import { MenuIcon, Save, ZoomIn, ZoomOut } from 'lucide-react';
import { useEditorStore, serializeProject, importProject } from '@/lib/store';
import { saveToFile } from '@/lib/utils';
import { useState } from 'react';
import { PortalModal } from '@/components/util/PortalModal';

export function Header() {
  const { zoomLevel, setZoomLevel } = useEditorStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = () => {
    let serialized = serializeProject();
    saveToFile(serialized);
  };

  const handleOpen = () => {
    setIsModalOpen(true);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importProject(event)
      setIsModalOpen(false)
    }
  };

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-4">
              <MenuIcon className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => console.log('New Project')}>New</DropdownMenuItem>
            <DropdownMenuItem onSelect={handleOpen}>Open</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => console.log('Preferences')}>Preferences</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
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
            onClick={() => setZoomLevel(Math.min(4, zoomLevel + 0.1))}
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSave}>
            <Save className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Modal for File Input */}
      <PortalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="w-1/3">
        <h2>Select a file to open</h2>
        <input type="file" onChange={handleFileChange} />
      </PortalModal>
    </header>
  );
}