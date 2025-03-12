"use client";

import { CalculationEdge, CalculationNode } from "@/types/graph";
import type { Node, Edge } from "reactflow";

// Calculate emissions for edges and propagate to target nodes
export function calculateEmissions(nodes: Node[], edges: Edge[]) {
  // Reset total emissions to manual emissions
  let updatedNodes = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      totalEmissions: node.data.manualEmissions || 0,
    },
  }));

  // Calculate edge emissions
  let updatedEdges = edges.map((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    if (sourceNode) {
      const edgeWeight = edge.data?.weight || 1;
      const sourceWeight = sourceNode.data.weight;
      const sourceEmissions = sourceNode.data.manualEmissions || 0;

      const edgeEmissions =
        sourceWeight > 0 ? (sourceWeight / edgeWeight) * sourceEmissions : 0;

      return {
        ...edge,
        data: {
          ...edge.data,
          emissions: edgeEmissions,
        },
      };
    }
    return edge;
  });

  let changes = true;
  while (changes) {
    changes = false;

    const newNodes = updatedNodes.map((node) => {
      const inboundEdges = updatedEdges.filter((e) => e.target === node.id);
      const totalInboundEmissions = inboundEdges.reduce(
        (sum, e) => sum + (e.data?.emissions || 0),
        0
      );

      const newTotalEmissions =
        (node.data.manualEmissions || 0) + totalInboundEmissions;

      if (newTotalEmissions !== node.data.totalEmissions) {
        changes = true; // Mark that a change occurred
      }

      return {
        ...node,
        data: {
          ...node.data,
          totalEmissions: newTotalEmissions,
        },
      };
    });

    updatedNodes = newNodes;

    // Update edge emissions based on new node values
    updatedEdges = updatedEdges.map((edge) => {
      const sourceNode = updatedNodes.find((n) => n.id === edge.source);
      if (sourceNode) {
        const edgeWeight = edge.data?.weight || 1;
        const sourceWeight = sourceNode.data.weight;
        const sourceEmissions = sourceNode.data.totalEmissions; // Use totalEmissions now

        const edgeEmissions =
          sourceWeight > 0 ? (sourceWeight / edgeWeight) * sourceEmissions : 0;

        return {
          ...edge,
          data: {
            ...edge.data,
            emissions: edgeEmissions,
          },
        };
      }
      return edge;
    });
  }

  return { updatedNodes, updatedEdges };
}

// Validate edge weights against node weight constraint
export function validateEdgeWeights(nodes: Node[], edges: Edge[]) {
  // For each node, check if total outbound edge weights exceed node weight
  const validationErrors: {
    nodeId: string;
    nodeName: string;
    totalWeight: number;
    nodeWeight: number;
  }[] = [];

  nodes.forEach((node) => {
    const outboundEdges = edges.filter((edge) => edge.source === node.id);
    const totalEdgeWeight = outboundEdges.reduce(
      (sum, edge) => sum + (edge.data?.weight || 0),
      0
    );

    if (totalEdgeWeight > node.data.weight) {
      validationErrors.push({
        nodeId: node.id,
        nodeName: node.data.label,
        totalWeight: totalEdgeWeight,
        nodeWeight: node.data.weight,
      });
    }
  });

  return validationErrors;
}

// Check if adding an edge would create a cycle
export function wouldCreateCycle(
  nodes: Node[],
  edges: Edge[],
  sourceId: string,
  targetId: string
): boolean {
  // If source and target are the same, it's a self-loop (cycle)
  if (sourceId === targetId) {
    return true;
  }

  // Create a directed graph representation
  const graph: Record<string, string[]> = {};

  // Initialize graph with all nodes
  nodes.forEach((node) => {
    graph[node.id] = [];
  });

  // Add existing edges
  edges.forEach((edge) => {
    if (graph[edge.source]) {
      graph[edge.source].push(edge.target);
    }
  });

  // Add the potential new edge
  if (graph[sourceId]) {
    graph[sourceId].push(targetId);
  }

  // checking for cycles using DFS..
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(nodeId: string): boolean {
    // Mark current node as visited and add to recursion stack
    visited.add(nodeId);
    recursionStack.add(nodeId);

    // Visit all adjacent nodes
    for (const adjacentNode of graph[nodeId] || []) {
      // If not visited, check if there's a cycle starting from this node
      if (!visited.has(adjacentNode)) {
        if (hasCycle(adjacentNode)) {
          return true;
        }
      }
      // If the adjacent node is in the recursion stack, we found a cycle
      else if (recursionStack.has(adjacentNode)) {
        return true;
      }
    }

    // Remove the node from recursion stack
    recursionStack.delete(nodeId);
    return false;
  }

  // Check for cycles starting from each unvisited node
  for (const nodeId of Object.keys(graph)) {
    if (!visited.has(nodeId)) {
      if (hasCycle(nodeId)) {
        return true;
      }
    }
  }

  return false;
}

export function trackOutboundEdges(
  nodes: CalculationNode[],
  edges: CalculationEdge[]
): CalculationNode[] {
  // Create a map of node ID to outbound edges
  const nodeOutboundEdges: Record<string, CalculationEdge[]> = {};

  // Initialize with empty arrays
  nodes.forEach((node) => {
    nodeOutboundEdges[node.id] = [];
  });

  // Populate with edges
  edges.forEach((edge) => {
    if (nodeOutboundEdges[edge.source]) {
      nodeOutboundEdges[edge.source].push(edge);
    }
  });

  // Update nodes with their outbound edges, but only if they've changed
  return nodes.map((node) => {
    const currentOutboundEdges = node.data.__outboundEdges || [];
    const newOutboundEdges = nodeOutboundEdges[node.id] || [];

    // Only update if the outbound edges have changed
    if (
      JSON.stringify(currentOutboundEdges.map((e) => e.id)) !==
      JSON.stringify(newOutboundEdges.map((e) => e.id))
    ) {
      return {
        ...node,
        data: {
          ...node.data,
          __outboundEdges: newOutboundEdges,
        },
      };
    }

    return node;
  });
}

export function validateEdgeWeightChange(
  sourceNodeId: string,
  edgeId: string,
  newWeight: number,
  nodes: CalculationNode[],
  edges: CalculationEdge[]
): boolean {
  const sourceNode = nodes.find((node) => node.id === sourceNodeId);
  if (!sourceNode) return false;

  const nodeWeight = sourceNode.data.weight || 0;
  const outboundEdges = edges.filter(
    (edge) => edge.source === sourceNodeId && edge.id !== edgeId
  );

  // Calculate sum of other outbound edge weights
  const otherEdgesWeight = outboundEdges.reduce(
    (sum, edge) => sum + (edge.data?.weight || 0),
    0
  );

  // Check if adding the new weight would exceed the node's weight
  return otherEdgesWeight + newWeight <= nodeWeight;
}
