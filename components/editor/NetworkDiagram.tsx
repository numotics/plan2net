"use client";

import { useEffect, useRef, useMemo } from "react";
import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import { useEditorStore } from "@/lib/store";
import { library } from "@/lib/itemLibrary";
import { hashCode, intToHexColor } from "@/lib/utils";

cytoscape.use(dagre);

function filterRegistryForRendering(itemsRegistry) {
  return Object.keys(itemsRegistry).reduce((acc, key) => {
    const { pdfPosition, ...rest } = itemsRegistry[key];
    acc[key] = rest;
    return acc;
  }, {});
}

export function NetworkDiagram() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  const { setSelectedNode, addItem, itemsRegistry } = useEditorStore();

  const nonPdfItemsRegistry = useMemo(() => filterRegistryForRendering(itemsRegistry), [itemsRegistry]);

  useEffect(() => {
    if (!containerRef.current) return;

    console.log("Initializing Cytoscape");

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: [],
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
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: true,
      maxZoom: 5,
      minZoom: 0.5,
    });

    cyRef.current.on("tap", "node", (evt) => {
      setSelectedNode(evt.target.id());
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [setSelectedNode]);

  const renderNetwork = () => {
    if (!cyRef.current) return;
    const cy = cyRef.current;

    cy.batch(() => {
      cy.elements().remove();

      Object.values(nonPdfItemsRegistry).forEach((item) => {
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

      Object.values(nonPdfItemsRegistry).forEach((sourceItem) => {
        if (!sourceItem.properties) return;

        Object.entries(sourceItem.properties).forEach(([key, targetId]) => {
          if (nonPdfItemsRegistry[targetId]) {
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
    });
  };

  useEffect(() => {
    renderNetwork();
  }, [nonPdfItemsRegistry]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    console.log("Drag over event");
  };

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

      setSelectedNode(nodeId);

      console.log("Item added to registry:", nodeId);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    console.log("Drag enter event");
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
