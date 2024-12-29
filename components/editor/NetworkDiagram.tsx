'use client';

import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { useEditorStore } from '@/lib/store';

cytoscape.use(dagre);

export function NetworkDiagram() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const { setSelectedNode } = useEditorStore();

  useEffect(() => {
    if (!containerRef.current) return;

    console.log('Initializing cytoscape');
    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: [],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#4299e1',
            'label': 'data(label)',
            'color': '#2d3748',
            'text-valign': 'center',
            'text-halign': 'center',
            'width': 40,
            'height': 40,
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#a0aec0',
            'target-arrow-color': '#a0aec0',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier'
          }
        },
        {
          selector: ':selected',
          style: {
            'background-color': '#2b6cb0',
            'line-color': '#2b6cb0',
            'target-arrow-color': '#2b6cb0',
          }
        }
      ],
      layout: {
        name: 'grid',
      },
      // Enable user interaction
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: true,
    });

    cyRef.current.on('tap', 'node', (evt) => {
      setSelectedNode(evt.target.id());
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [setSelectedNode]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    console.log('Drag over event');
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    console.log('Drop event triggered');
    
    const itemType = e.dataTransfer.getData('application/reactflow');
    console.log('Dropped item type:', itemType);
    
    if (!itemType || !cyRef.current) {
      console.log('Missing item type or cytoscape instance');
      return;
    }

    // Get drop position relative to the container
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) {
      console.log('No container rect found');
      return;
    }

    const position = {
      x: e.clientX - containerRect.left,
      y: e.clientY - containerRect.top,
    };
    console.log('Drop position:', position);

    try {
      // Add the new node
      const nodeId = `${itemType}-${Date.now()}`;
      const newNode = cyRef.current.add({
        group: 'nodes',
        data: { 
          id: nodeId,
          label: itemType.charAt(0).toUpperCase() + itemType.slice(1)
        },
        position
      });
      console.log('Node added successfully:', newNode.id());
    } catch (error) {
      console.error('Error adding node:', error);
    }
  };

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    console.log('Drag enter event');
  };

  return (
    <div 
      ref={containerRef}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnter={onDragEnter}
      className="h-full w-full bg-white cursor-grab"
    />
  );
}