"use client";

import { CalculationNode } from "@/types/graph";
import { useState, useCallback } from "react";
import { useNodesState, useEdgesState, type Node, type Edge } from "reactflow";

// Initial data
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export function useGraphState() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  // Update node properties
  const updateNodeProperties = useCallback(
    (id: string, data: Partial<CalculationNode["data"]>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return { ...node, data: { ...node.data, ...data } };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  // Update edge properties
  const updateEdgeProperties = useCallback(
    (id: string, data: any) => {
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === id) {
            return { ...edge, data: { ...edge.data, ...data } };
          }
          return edge;
        })
      );
    },
    [setEdges]
  );

  return {
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    selectedNode,
    setSelectedNode,
    selectedEdge,
    setSelectedEdge,
    updateNodeProperties,
    updateEdgeProperties,
  };
}
