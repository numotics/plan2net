'use client';

import { Button } from '@/components/ui/button';
import { Wifi, Server, Laptop, Router } from 'lucide-react';

const networkItems = [
  { id: 'router', label: 'Router', icon: Router },
  { id: 'switch', label: 'Switch', icon: Wifi },
  { id: 'server', label: 'Server', icon: Server },
  { id: 'workstation', label: 'Workstation', icon: Laptop },
];

export function Sidebar() {
  const onDragStart = (e: React.DragEvent, itemType: string) => {
    e.dataTransfer.setData('application/reactflow', itemType);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 border-r border-border bg-card p-4">
      <h2 className="mb-4 font-semibold">Network Components</h2>
      <div className="space-y-2">
        {networkItems.map((item) => {
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