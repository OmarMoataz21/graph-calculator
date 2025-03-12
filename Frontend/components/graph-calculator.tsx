"use client";

import type React from "react";

import { useState, useCallback, useRef, useEffect } from "react";
import { ReactFlowProvider, type Connection, useReactFlow } from "reactflow";
import "reactflow/dist/style.css";
import { toast, Toaster } from "sonner";
import { nanoid } from "nanoid";
import GraphCanvas from "./graph/graph-canvas";
import GraphToolbar from "./graph/graph-toolbar";
import PropertiesPanel from "./graph/properties-panel";
import { useGraphState } from "@/hooks/use-graph-state";
import {
  calculateEmissions,
  validateEdgeWeights,
  wouldCreateCycle,
  trackOutboundEdges,
} from "@/lib/graph-utils";
import { getLayoutedElements, animateNodesLayout } from "@/lib/layout-utils";
import type {
  CalculationNode,
  CalculationEdge,
  SavedConfiguration,
} from "@/types/graph";
import {
  deleteGraph,
  listAllGraphs,
  loadGraph,
  saveGraphData,
} from "@/services/graphService";

// Main wrapper component that provides ReactFlow context
export default function GraphCalculatorWrapper() {
  return (
    <ReactFlowProvider>
      <GraphCalculator />
    </ReactFlowProvider>
  );
}

function GraphCalculator() {
  // Handle ResizeObserver errors
  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      if (event.message.includes("ResizeObserver loop")) {
        event.stopImmediatePropagation();
      }
    };

    window.addEventListener("error", errorHandler);

    return () => {
      window.removeEventListener("error", errorHandler);
    };
  }, []);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const {
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
  } = useGraphState();

  const reactFlowInstance = useReactFlow();

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("node");
  const [savedConfigurations, setSavedConfigurations] = useState<
    SavedConfiguration[]
  >([]);
  const [inputValue, setInputValue] = useState("");
  const [isNewEdge, setIsNewEdge] = useState(false);
  const [layoutDirection, setLayoutDirection] = useState<"TB" | "LR">("TB");
  const [isAnimatingLayout, setIsAnimatingLayout] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const configs = await listAllGraphs();
        setSavedConfigurations(configs);
      } catch (error) {
        console.error("Failed to load saved configurations:", error);
        toast.error("Failed to load saved configurations", {
          description: "Please check your connection and try again.",
        });
      }
    };
    fetchData();
  }, []);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: CalculationNode) => {
      if (isViewOnly) return;

      // Clear any selected edges first
      reactFlowInstance.setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          selected: false,
        }))
      );

      // Update ReactFlow's selection state for nodes
      reactFlowInstance.setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          selected: n.id === node.id,
        }))
      );

      setSelectedNode(node);
      setSelectedEdge(null);
      setIsPanelOpen(true);
      setActiveTab("node");
      setIsNewEdge(false);
    },
    [isViewOnly, setSelectedNode, setSelectedEdge, reactFlowInstance]
  );

  // Handle edge selection
  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: CalculationEdge) => {
      if (isViewOnly) return;

      // Clear any selected nodes first
      reactFlowInstance.setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          selected: false,
        }))
      );

      // Update ReactFlow's selection state for edges
      reactFlowInstance.setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          selected: e.id === edge.id,
        }))
      );

      setSelectedEdge(edge);
      setSelectedNode(null);
      setIsPanelOpen(true);
      setActiveTab("edge");
      setIsNewEdge(false);
    },
    [isViewOnly, setSelectedEdge, setSelectedNode, reactFlowInstance]
  );

  // Handle background click to deselect
  const onPaneClick = useCallback(() => {
    // Clear selection in ReactFlow
    reactFlowInstance.setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        selected: false,
      }))
    );
    reactFlowInstance.setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        selected: false,
      }))
    );

    setSelectedNode(null);
    setSelectedEdge(null);
  }, [setSelectedNode, setSelectedEdge, reactFlowInstance]);

  // Handle edge connection
  const onConnect = useCallback(
    (params: Connection) => {
      if (isViewOnly) return;

      // Check if this connection would create a cycle
      if (wouldCreateCycle(nodes, edges, params.source!, params.target!)) {
        toast.error("Invalid Connection", {
          description:
            "Cyclic connections are not allowed. This would create a loop in the graph.",
          duration: 3000,
        });
        return;
      }

      // Check if source node has enough weight for a new edge
      const sourceNode = nodes.find((node) => node.id === params.source);
      if (sourceNode) {
        const outboundEdges = edges.filter(
          (edge) => edge.source === params.source
        );
        const totalEdgeWeight = outboundEdges.reduce(
          (sum, edge) => sum + (edge.data?.weight || 0),
          0
        );

        // Default new edge weight is 1
        if (totalEdgeWeight + 1 > sourceNode.data.weight) {
          toast.error("Invalid Connection", {
            description: `${sourceNode.data.label}'s outbound edge weights would exceed its weight capacity.`,
            duration: 3000,
          });
          return;
        }
      }

      // First, deselect all existing nodes and edges
      reactFlowInstance.setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          selected: false,
        }))
      );

      reactFlowInstance.setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          selected: false,
        }))
      );

      // Create a new edge with default weight and selected state
      const newEdgeId = `e${nanoid()}`;
      const newEdge: CalculationEdge = {
        ...params,
        id: newEdgeId,
        animated: true,
        type: "custom", // Use our custom edge
        data: { weight: 1, emissions: 0 },
        selected: true, // Mark as selected
      } as CalculationEdge;

      setEdges((eds) => [...eds, newEdge]);

      // After adding the edge, select it to edit properties
      setSelectedEdge(newEdge);
      setSelectedNode(null);
      setIsPanelOpen(true);
      setActiveTab("edge");
      setIsNewEdge(true); // Flag to indicate this is a new edge
    },
    [
      isViewOnly,
      nodes,
      edges,
      setEdges,
      setSelectedEdge,
      setSelectedNode,
      reactFlowInstance,
    ]
  );

  const onAddNode = useCallback(() => {
    if (isViewOnly) return;

    // Clear any existing selections
    reactFlowInstance.setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        selected: false,
      }))
    );

    reactFlowInstance.setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        selected: false,
      }))
    );

    const newNodeId = `node-${nanoid()}`;
    const newNode: CalculationNode = {
      id: newNodeId,
      type: "calculationNode",
      position: {
        x: Math.random() * 300 + 50,
        y: Math.random() * 300 + 50,
      },
      data: {
        label: `Node ${nodes.length + 1}`,
        weight: 100,
        emissions: 50,
        totalEmissions: 50, // Total emissions (initially equal to manual)
        manualEmissions: 50, // Store the manual emissions value separately
      },
      selected: true,
    };

    setNodes((nds) => [...nds, newNode]);

    // Select the new node
    setSelectedNode(newNode);
    setSelectedEdge(null);
    setIsPanelOpen(true);
    setActiveTab("node");
    setIsNewEdge(false);

    toast.success("Node Added", {
      description: `${newNode.data.label} has been added to the graph.`,
      duration: 2000,
    });
  }, [
    isViewOnly,
    nodes.length,
    setNodes,
    setSelectedNode,
    setSelectedEdge,
    reactFlowInstance,
  ]);

  // Delete selected node or edge
  const onDelete = useCallback(() => {
    if (isViewOnly) return;

    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setSelectedNode(null);
      setIsPanelOpen(false);

      // Also delete connected edges
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            edge.source !== selectedNode.id && edge.target !== selectedNode.id
        )
      );

      toast.success("Node Deleted", {
        description: "Node and its connections have been removed.",
        duration: 2000,
      });
    } else if (selectedEdge) {
      setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge.id));
      setSelectedEdge(null);
      setIsPanelOpen(false);

      toast.success("Edge Deleted", {
        description: "Connection has been removed.",
        duration: 2000,
      });
    }
  }, [
    isViewOnly,
    selectedNode,
    selectedEdge,
    setNodes,
    setEdges,
    setSelectedNode,
    setSelectedEdge,
  ]);

  // Save current configuration
  const saveConfiguration = useCallback(async () => {
    if (!inputValue.trim()) {
      toast.error("Error", {
        description: "Please enter a name for this configuration.",
        duration: 3000,
      });
      return;
    }

    const newConfig = {
      name: inputValue,
      nodes: nodes,
      edges: edges,
    };

    try {
      const res = await saveGraphData(newConfig);
      setSavedConfigurations((prev) => [
        ...prev,
        res as unknown as SavedConfiguration,
      ]);

      setInputValue("");

      toast.success("Configuration Saved", {
        description: `"${inputValue}" has been saved successfully.`,
        duration: 2000,
      });
    } catch (error) {
      toast.error("Failed to save configuration", {
        description: "Please check your connection and try again.",
      });
    }
  }, [inputValue, nodes, edges]);

  // Load a saved configuration
  const loadConfiguration = useCallback(
    async (id: string) => {
      try {
        const graphData = await loadGraph(id);

        // Reset selection state for nodes and edges
        const updatedNodes = graphData.nodes.map((node: CalculationNode) => ({
          ...node,
          selected: false,
        }));

        const updatedEdges = graphData.edges.map((edge: CalculationEdge) => ({
          ...edge,
          selected: false,
        }));

        setNodes(updatedNodes);
        setEdges(updatedEdges);
        setSelectedNode(null);
        setSelectedEdge(null);

        toast.success("Graph Loaded", {
          description: `"${graphData.name}" has been loaded successfully.`,
          duration: 2000,
        });
      } catch (error) {
        toast.error("Failed to load graph", {
          description: "Something went wrong. Please try again.",
          duration: 3000,
        });
      }
    },
    [setNodes, setEdges, setSelectedNode, setSelectedEdge]
  );

  // Delete a saved configuration
  const deleteConfiguration = useCallback((id: string, name: string) => {
    deleteGraph(id)
      .then(() => {
        setSavedConfigurations((prev) =>
          prev.filter((config) => config._id !== id)
        );
        toast.success("Configuration Deleted", {
          description: `"${name}" has been removed.`,
          duration: 2000,
        });
      })
      .catch(() => {
        toast.error("Failed to delete configuration", {
          description: "Something went wrong. Please try again.",
          duration: 3000,
        });
      });
  }, []);

  // Toggle layout direction
  const toggleLayout = useCallback(() => {
    const newDirection = layoutDirection === "TB" ? "LR" : "TB";

    if (nodes.length === 0) return;

    setLayoutDirection(newDirection);
    const { nodes: layoutedNodes } = getLayoutedElements(
      nodes,
      edges,
      newDirection
    );

    // Animate to new layout
    animateNodesLayout(
      layoutedNodes as unknown as CalculationNode[],
      setNodes,
      setIsAnimatingLayout,
      animationRef
    );

    toast.success("Layout Applied", {
      description: `Graph has been automatically arranged in ${
        newDirection === "TB" ? "vertical" : "horizontal"
      } layout.`,
      duration: 2000,
    });
  }, [layoutDirection, nodes, edges, setNodes]);

  const toggleViewOnly = useCallback(() => {
    setIsViewOnly((prev) => !prev);

    if (!isViewOnly) {
      // Use setTimeout to stagger state updates and prevent ResizeObserver errors
      // First close the panel
      setIsPanelOpen(false);

      // Then clear selections after a small delay
      setTimeout(() => {
        // Clear selection in ReactFlow
        reactFlowInstance.setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            selected: false,
          }))
        );

        reactFlowInstance.setEdges((eds) =>
          eds.map((e) => ({
            ...e,
            selected: false,
          }))
        );

        setSelectedNode(null);
        setSelectedEdge(null);

        toast.info("View-Only Mode", {
          description:
            "Graph is now in view-only mode. Interactions are disabled.",
          duration: 2000,
        });
      }, 50);
    } else {
      toast.info("Edit Mode", {
        description: "Graph is now in edit mode. Interactions are enabled.",
        duration: 2000,
      });
    }
  }, [isViewOnly, setSelectedNode, setSelectedEdge, reactFlowInstance]);

  const openSavedPanel = useCallback(() => {
    setActiveTab("saved");
    setIsPanelOpen(true);
  }, []);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Combined useEffect for calculations and validations
  useEffect(() => {
    // Only run calculations when nodes or edges change and not during layout animation
    if (!isAnimatingLayout) {
      // Track outbound edges for each node
      const nodesWithOutboundEdges = trackOutboundEdges(nodes, edges);

      // Calculate emissions
      const { updatedNodes, updatedEdges } = calculateEmissions(
        nodesWithOutboundEdges,
        edges
      );

      // Update state only if there are actual changes
      const nodesChanged =
        JSON.stringify(
          updatedNodes.map((n) => ({
            id: n.id,
            totalEmissions: n.data.totalEmissions,
            outboundEdges: n.data.__outboundEdges?.length || 0,
          }))
        ) !==
        JSON.stringify(
          nodes.map((n) => ({
            id: n.id,
            totalEmissions: n.data.totalEmissions,
            outboundEdges: n.data.__outboundEdges?.length || 0,
          }))
        );

      const edgesChanged =
        JSON.stringify(
          updatedEdges.map((e) => ({ id: e.id, emissions: e.data?.emissions }))
        ) !==
        JSON.stringify(
          edges.map((e) => ({ id: e.id, emissions: e.data?.emissions }))
        );

      if (nodesChanged) {
        // Preserve selection state when updating nodes
        setNodes((currentNodes) => {
          const selectionMap = new Map(
            currentNodes.map((node) => [node.id, node.selected || false])
          );

          return updatedNodes.map((node) => ({
            ...node,
            selected: selectionMap.get(node.id) || false,
          }));
        });
      }

      if (edgesChanged) {
        // Preserve selection state when updating edges
        setEdges((currentEdges) => {
          const selectionMap = new Map(
            currentEdges.map((edge) => [edge.id, edge.selected || false])
          );

          return updatedEdges.map((edge) => ({
            ...edge,
            selected: selectionMap.get(edge.id) || false,
          }));
        });
      }

      // Check for validation errors
      const errors = validateEdgeWeights(nodes, edges);

      errors.forEach((error) => {
        toast.error("Validation Error", {
          description: `${error.nodeName}'s outbound edge weights (${error.totalWeight}) exceed its weight (${error.nodeWeight}).`,
          duration: 5000,
        });
      });
    }
  }, [nodes, edges, isAnimatingLayout, setNodes, setEdges]);

  return (
    <div className="w-full h-screen flex" ref={reactFlowWrapper}>
      <GraphCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        isViewOnly={isViewOnly}
      >
        <GraphToolbar
          onAddNode={onAddNode}
          onDelete={onDelete}
          onToggleLayout={toggleLayout}
          onSave={saveConfiguration}
          onLoad={openSavedPanel}
          onToggleViewOnly={toggleViewOnly}
          inputValue={inputValue}
          setInputValue={setInputValue}
          hasNodes={nodes.length > 0}
          hasSelection={!!selectedNode || !!selectedEdge}
          isAnimatingLayout={isAnimatingLayout}
          layoutDirection={layoutDirection}
          isViewOnly={isViewOnly}
        />
      </GraphCanvas>

      <PropertiesPanel
        isOpen={isPanelOpen}
        setIsOpen={setIsPanelOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedNode={selectedNode}
        selectedEdge={selectedEdge}
        updateNodeProperties={updateNodeProperties}
        updateEdgeProperties={updateEdgeProperties}
        nodes={nodes}
        edges={edges}
        isNewEdge={isNewEdge}
        savedConfigurations={savedConfigurations}
        loadConfiguration={loadConfiguration}
        deleteConfiguration={deleteConfiguration}
        searchTerm={inputValue}
      />

      <Toaster
        position="top-center"
        richColors
        expand={true}
        closeButton={true}
      />
    </div>
  );
}
