"use client";

import type React from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  ConnectionLineType,
  MarkerType,
  Panel,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from "reactflow";
import type { CalculationNode, CalculationEdge } from "@/types/graph";
import CalculationNodeComponent from "../calculation-node";
import CustomEdge from "../custom-edge";
import MiniMapNode from "./minimap-node";

// Node types registration
const nodeTypes = {
  calculationNode: CalculationNodeComponent,
};

// Edge types registration
const edgeTypes = {
  custom: CustomEdge,
};

interface GraphCanvasProps {
  nodes: CalculationNode[];
  edges: CalculationEdge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onNodeClick: (event: React.MouseEvent, node: CalculationNode) => void;
  onEdgeClick: (event: React.MouseEvent, edge: CalculationEdge) => void;
  onPaneClick: () => void;
  isViewOnly: boolean;
  children: React.ReactNode;
}

export default function GraphCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onEdgeClick,
  onPaneClick,
  isViewOnly,
  children,
}: GraphCanvasProps) {
  return (
    <div className="flex-1 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-right"
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultEdgeOptions={{
          type: "custom",
          animated: true,
          interactionWidth: 20,
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        }}
        nodesDraggable={!isViewOnly}
        nodesConnectable={!isViewOnly}
        elementsSelectable={!isViewOnly}
        // Disable all interactions when in view-only mode
        zoomOnScroll={!isViewOnly}
        zoomOnPinch={!isViewOnly}
        panOnScroll={!isViewOnly}
        panOnDrag={!isViewOnly}
        selectionOnDrag={!isViewOnly}
        proOptions={{ hideAttribution: true }}
      >
        {!isViewOnly && (
          <>
            <Controls
              className="bg-background/90 shadow-md border rounded-lg p-1"
              showInteractive={false}
            />
            <MiniMap
              nodeStrokeWidth={3}
              zoomable
              pannable
              nodeComponent={MiniMapNode}
              className="bg-background/90 rounded-lg shadow-md border p-2"
              nodeBorderRadius={5}
            />
          </>
        )}
        <Background gap={12} size={1} color="#f1f1f1" />

        {children}

        {isViewOnly && (
          <Panel
            position="bottom-right"
            className="bg-background/80 p-2 rounded-md shadow-md border"
          >
            <div className="text-xs text-muted-foreground">
              View-only mode. Interactions disabled.
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
