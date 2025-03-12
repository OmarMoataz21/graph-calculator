"use client";

import type React from "react";

import dagre from "dagre";
import type { CalculationNode, CalculationEdge } from "@/types/graph";

export function getLayoutedElements(
  nodes: CalculationNode[],
  edges: CalculationEdge[],
  direction: "TB" | "LR" = "TB"
) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const spacing =
    direction === "TB"
      ? { rankdir: direction, ranksep: 150, nodesep: 100 }
      : { rankdir: direction, ranksep: 250, nodesep: 250 }; // Increased spacing for horizontal layout

  dagreGraph.setGraph(spacing);

  // Set nodes with increased dimensions to account for labels
  nodes.forEach((node) => {
    // Using larger dimensions to account for edge labels
    const width = 200;
    const height = 120;
    dagreGraph.setNode(node.id, { width, height });
  });

  // Set edges
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Get new node positions with adjusted centering
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      // Store the original position for animation
      position: node.position,
      // Store the target position in a separate property
      targetPosition: {
        x: nodeWithPosition.x - 100, // Center the node (half of width)
        y: nodeWithPosition.y - 60, // Center the node (half of height)
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

// Animate nodes to their target positions
export function animateNodesLayout(
  layoutedNodes: CalculationNode[],
  setNodes: (updater: (nodes: CalculationNode[]) => CalculationNode[]) => void,
  setIsAnimatingLayout: (isAnimating: boolean) => void,
  animationRef: React.MutableRefObject<number | null>
) {
  setIsAnimatingLayout(true);

  // Start time for the animation
  const startTime = Date.now();
  const duration = 800; // Animation duration in ms

  // Animation function
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function for smooth animation
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const easedProgress = easeOutCubic(progress);

    // Update node positions based on animation progress
    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        const targetNode = layoutedNodes.find((n) => n.id === node.id);

        if (targetNode && "targetPosition" in targetNode) {
          const startX = node.position.x;
          const startY = node.position.y;
          const targetX = (targetNode as any).targetPosition.x;
          const targetY = (targetNode as any).targetPosition.y;

          // Calculate interpolated position
          const x = startX + (targetX - startX) * easedProgress;
          const y = startY + (targetY - startY) * easedProgress;

          return {
            ...node,
            position: { x, y },
          };
        }

        return node;
      })
    );

    // Continue animation if not complete
    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      // Animation complete
      setIsAnimatingLayout(false);
      animationRef.current = null;

      // Fit view after animation completes
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 50);
    }
  };

  // Start animation
  if (animationRef.current) {
    cancelAnimationFrame(animationRef.current);
  }
  animationRef.current = requestAnimationFrame(animate);
}
