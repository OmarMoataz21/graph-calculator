import type { Node as ReactFlowNode, Edge as ReactFlowEdge } from "reactflow";

// Node data type
export interface CalculationNodeData {
  label: string;
  weight: number;
  emissions: number; // Manual emissions (for backward compatibility)
  manualEmissions: number; // Manual emissions
  totalEmissions: number; // Total emissions (manual + incoming)
  __outboundEdges?: CalculationEdge[]; // For internal tracking
}

// Edge data type
export interface CalculationEdgeData {
  weight: number;
  emissions: number;
}

// Extend ReactFlow types with our custom data
export type CalculationNode = ReactFlowNode<CalculationNodeData>;
export type CalculationEdge = ReactFlowEdge<CalculationEdgeData>;

// Saved configuration type
export interface SavedConfiguration {
  _id: string;
  name: string;
  nodesCount: number;
  edgesCount: number;
}

// Validation error type
export interface ValidationError {
  nodeId: string;
  nodeName: string;
  totalWeight: number;
  nodeWeight: number;
}
