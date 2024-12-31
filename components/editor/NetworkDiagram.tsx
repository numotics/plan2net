"use client";

import { useEffect, useRef } from "react";
import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import { useEditorStore } from "@/lib/store";
import { library } from "@/lib/itemLibrary";
import { hashCode, intToHexColor } from "@/lib/utils";

// Initialize Cytoscape extensions
cytoscape.use(dagre);

export function NetworkDiagram() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  // Extract necessary state and actions from Zustand store
  const { setSelectedNode, addItem, itemsRegistry } = useEditorStore();

  // Initialize Cytoscape instance and set up event listeners
  useEffect(() => {
    if (!containerRef.current) return;

    console.log("Initializing Cytoscape");

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: [], // Initial empty elements
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#4299e1",
            label: "data(label)",
            color: "#2d3748",
            "text-valign": "center",
            "text-halign": "center",
            width: 40,
            height: 40,
          },
        },
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "#a0aec0",
            "target-arrow-color": "#a0aec0",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
          },
        },
        {
          selector: ":selected",
          style: {
            "background-color": "#2b6cb0",
            "line-color": "#2b6cb0",
            "target-arrow-color": "#2b6cb0",
          },
        },
      ],
      layout: {
        name: "grid",
      },
      // Enable user interaction
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: true,
      maxZoom: 5,
      minZoom: 0.5
    });



    // Event listener for node selection
    cyRef.current.on("tap", "node", (evt) => {
      setSelectedNode(evt.target.id());
    });

    // Clean up Cytoscape instance on component unmount
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [setSelectedNode]);

  // Centralized rendering function
  const renderNetwork = () => {
    if (!cyRef.current) return;
    const cy = cyRef.current;

    // Begin transaction for batch updates
    cy.batch(() => {
      // Clear existing elements to avoid duplicates
      cy.elements().remove();

      // Add nodes from itemsRegistry
      Object.values(itemsRegistry).forEach((item) => {
        cy.add({
          group: "nodes",
          data: {
            id: item.id,
            label: item.label,
            type: item.type,
            properties: item.properties,
          },
          position: item.position,
        });
      });

      // Create edges based on properties
      Object.values(itemsRegistry).forEach((sourceItem) => {
        if (!sourceItem.properties) return;

        Object.entries(sourceItem.properties).forEach(([key, targetId]) => {
          if (itemsRegistry[targetId]) {
            const edgeId = `${sourceItem.id}-${targetId}-edge`;
            const edgeColor = intToHexColor(hashCode(key));
            cy.add({
              group: "edges",
              data: {
                id: edgeId,
                source: sourceItem.id,
                target: targetId,
                color: edgeColor,
              },
              style: {
                "line-color": edgeColor,
              },
            });
          }
        });
      });

      // Apply layout after adding all elements
      cy.layout({ name: "dagre" }).run();
    });
  };

  // Invoke renderNetwork whenever itemsRegistry changes
  useEffect(() => {
    renderNetwork();
  }, [itemsRegistry]);

  // Handle drag over event
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    console.log("Drag over event");
  };

  // Handle drop event
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    console.log("Drop event triggered");

    const itemType = e.dataTransfer.getData("application/reactflow");
    console.log("Dropped item type:", itemType);

    if (!itemType) {
      console.log("Missing item type");
      return;
    }

    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) {
      console.log("No container rect found");
      return;
    }

    const position = {
      x: e.clientX - containerRect.left,
      y: e.clientY - containerRect.top,
    };
    console.log("Drop position:", position);

    try {
      const existingNodes = Object.values(itemsRegistry).filter(
        (item) => item.type === itemType
      );
      const nodeId = `${itemType}-${existingNodes.length + 1}`;

      // Add item to Zustand store. This will trigger useEffect to render the network.
      addItem({
        id: nodeId,
        type: itemType,
        label: nodeId,
        position,
        pdfPosition: {
          x: 100,
          y: 100,
        },
        properties: library[itemType]?.properties,
      });

      console.log("Item added to registry:", nodeId);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  // Handle drag enter event
  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    console.log("Drag enter event");
  };

  return (
    <div
      ref={containerRef}
      onDragOver={onDragOver}
      onDrop={onDrop} // Changed to onDrop from onDropCapture for clarity
      onDragEnter={onDragEnter}
      className="h-full w-full bg-white cursor-grab"
    />
  );
}