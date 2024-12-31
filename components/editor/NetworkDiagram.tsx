"use client";

import { useEffect, useRef } from "react";
import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import { useEditorStore } from "@/lib/store";
import { library } from "@/lib/itemLibrary";
import { hashCode, intToHexColor } from "@/lib/utils";

cytoscape.use(dagre);

export function NetworkDiagram() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const { setSelectedNode, addItem, itemsRegistry } = useEditorStore();

  useEffect(() => {
    if (!containerRef.current) return;

    console.log("Initializing cytoscape");
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
      // Enable user interaction
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: true,
    });

    // cytoscape handlers

    cyRef.current.on("tap", "node", (evt) => {
      setSelectedNode(evt.target.id());
    });

    // Key handlers

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [setSelectedNode]);

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

    if (!itemType || !cyRef.current) {
      console.log("Missing item type or cytoscape instance");
      return;
    }

    // Get drop position relative to the container
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
      // Add the new node
      const existingNodes = cyRef.current.nodes(`[type="${itemType}"]`);
      const nodeId = `${itemType}-${existingNodes.length + 1}`;

      const newNode = cyRef.current.add({
        group: "nodes",
        data: {
          id: nodeId,
          label: nodeId,
          properties: library[itemType]?.properties,
        },
        position,
      });
      console.log("Node added successfully:", newNode.id());

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
    } catch (error) {
      console.error("Error adding node:", error);
    }
  };

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    console.log("Drag enter event");
  };

  const createEdges = () => {
    if (!cyRef.current) return;

    // Track existing edges to determine which ones to remove
    const edgesToRemove = new Set(
      cyRef.current.edges().map((edge) => edge.id())
    );

    cyRef.current.nodes().forEach((sourceNode) => {
      const sourceData = sourceNode.data();
      const { properties } = sourceData;

      if (!properties) return;

      cyRef.current?.nodes().forEach((targetNode) => {
        if (sourceNode.id() === targetNode.id()) return;

        const propIdx = Object.values(properties).indexOf(targetNode.id());
        if (propIdx !== -1) {
          const edgeId = `${sourceNode.id()}-${targetNode.id()}-edge`;
          const newEdgeColor = intToHexColor(
            hashCode(Object.keys(properties)[propIdx])
          );
          const existingEdge = cyRef.current?.getElementById(edgeId);
          if (!existingEdge?.isEdge()) {
            cyRef.current?.add({
              group: "edges",
              data: {
                id: edgeId,
                source: sourceNode.id(),
                target: targetNode.id(),
                color: newEdgeColor,
              },
              style: {
                "line-color": newEdgeColor,
              },
            });
          } else {
            edgesToRemove.delete(edgeId);

            // Update edge color if it has changed
            const currentEdgeColor = existingEdge.data("color");
            if (currentEdgeColor !== newEdgeColor) {
              existingEdge.data("color", newEdgeColor);
              existingEdge.style("line-color", newEdgeColor);
            }
          }
        }
      });
    });

    edgesToRemove.forEach((edgeId) => {
      cyRef.current?.remove(cyRef.current.getElementById(edgeId));
    });
  };
  useEffect(() => {
    // update properties of each node
    if (!cyRef.current) return;

    cyRef.current.nodes().forEach((node) => {
      Object.entries(itemsRegistry[node.id()]).forEach(([key, value]) => {
        node.data(key, value);
      });
    });

    createEdges();
  }, [itemsRegistry]);

  return (
    <div
      ref={containerRef}
      onDragOver={onDragOver}
      // onDragEnd={onDrop}
      onDropCapture={onDrop}
      // onDragEndCapture={onDrop}
      onDragEnter={onDragEnter}
      className="h-full w-full bg-white cursor-grab"
    />
  );
}
