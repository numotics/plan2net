'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';
import { MenuIcon, Save, ZoomIn, ZoomOut } from 'lucide-react';
import { useEditorStore, serializeProject, importProject } from '@/lib/store';
import { saveToFile } from '@/lib/utils';
import { useState } from 'react';
import { PortalModal } from '@/components/util/PortalModal';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';

export function Header() {
  const { zoomLevel, setZoomLevel, setContent } = useEditorStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [newContentUrl, setNewContentUrl] = useState('');
  const [contentType, setContentType] = useState<'pdf' | 'image'>('pdf');

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

  const handleContentUrlChange = () => {
    if (newContentUrl) {
      setContent(newContentUrl, contentType);
      setIsContentModalOpen(false);
      setNewContentUrl('');
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
            <DropdownMenuItem onSelect={() => setIsContentModalOpen(true)}>Change Content</DropdownMenuItem>
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

      {/* File Open Modal */}
      <PortalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="w-1/3">
        <h2>Select a file to open</h2>
        <input type="file" onChange={handleFileChange} />
      </PortalModal>

      {/* Content Change Modal */}
      <PortalModal isOpen={isContentModalOpen} onClose={() => setIsContentModalOpen(false)} className="w-1/3">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Change Content</h2>
          
          <div className="space-y-2">
            <Label>Content Type</Label>
            <Select value={contentType} onValueChange={(value: 'pdf' | 'image') => setContentType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="image">Image</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>URL</Label>
            <Input
              type="text"
              placeholder="Enter content URL"
              value={newContentUrl}
              onChange={(e) => setNewContentUrl(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsContentModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleContentUrlChange}>
              Update
            </Button>
          </div>
        </div>
      </PortalModal>
    </header>
  );
}
