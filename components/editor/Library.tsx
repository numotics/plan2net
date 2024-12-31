'use client';

import { Button } from '@/components/ui/button';
import { library } from '@/lib/itemLibrary';

export function Library() {
  const onDragStart = (e: React.DragEvent, itemType: string) => {
    e.dataTransfer.setData('application/reactflow', itemType);
    e.dataTransfer.effectAllowed = 'move';
  };

  // TODO: Implement adding new items to library

  return (
    <div className="w-64 border-r border-border bg-card p-4">
      <h2 className="mb-4 font-semibold">Network Components</h2>
      <div className="space-y-2">
        {Object.entries(library).map((entry) => {
          const item = entry[1];
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => onDragStart(e, item.id)}
              className="flex cursor-move items-center gap-2 rounded-lg border border-border bg-card p-2 hover:bg-accent"
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}