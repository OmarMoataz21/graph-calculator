"use client";

import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { validateEdgeWeightChange } from "@/lib/graph-utils";
import type { CalculationNode, CalculationEdge } from "@/types/graph";

interface EdgePropertiesPanelProps {
  edge: CalculationEdge;
  updateEdgeProperties: (
    id: string,
    data: Partial<CalculationEdge["data"]>
  ) => void;
  nodes: CalculationNode[];
  edges: CalculationEdge[];
  isNewEdge?: boolean;
}

export default function EdgePropertiesPanel({
  edge,
  updateEdgeProperties,
  nodes,
  edges,
  isNewEdge = false,
}: EdgePropertiesPanelProps) {
  const [weight, setWeight] = useState(edge.data?.weight || 1);
  const [sourceNode, setSourceNode] = useState<CalculationNode | null>(null);
  const [targetNode, setTargetNode] = useState<CalculationNode | null>(null);
  const weightInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const source = nodes.find((n) => n.id === edge.source) || null;
    const target = nodes.find((n) => n.id === edge.target) || null;
    setSourceNode(source);
    setTargetNode(target);
  }, [edge, nodes]);

  useEffect(() => {
    setWeight(edge.data?.weight || 1);
  }, [edge]);

  // Auto-focus on weight input when a new edge is created
  useEffect(() => {
    if (isNewEdge && weightInputRef.current) {
      weightInputRef.current.focus();
      weightInputRef.current.select();
    }
  }, [isNewEdge]);

  const applyChanges = () => {
    const newWeight = Number.parseFloat(weight.toString());

    // Validate weight is positive
    if (newWeight <= 0) {
      toast.error("Invalid Weight", {
        description: "Edge weight must be greater than zero.",
        duration: 3000,
      });
      return;
    }

    // Validate that the new weight doesn't exceed the source node's weight capacity
    if (
      !validateEdgeWeightChange(edge.source, edge.id, newWeight, nodes, edges)
    ) {
      toast.error("Invalid Weight", {
        description: `This weight would cause ${sourceNode?.data.label}'s outbound edge weights to exceed its weight capacity.`,
        duration: 3000,
      });
      return;
    }

    // Try to update the edge properties
    updateEdgeProperties(edge.id, {
      weight: newWeight,
    });

    toast.success("Edge Updated", {
      description: "Edge properties have been updated successfully.",
      duration: 2000,
    });
  };

  // Calculate edge emissions based on the formula
  const calculateEmissions = () => {
    if (!sourceNode) return 0;

    const edgeWeight = Number.parseFloat(weight.toString()) || 1;
    const sourceWeight = sourceNode.data.weight || 0;
    const sourceEmissions =
      sourceNode.data.totalEmissions || sourceNode.data.emissions || 0;

    if (edgeWeight <= 0) return 0;
    // Correct formula: (source node's weight / edge weight) × source node's emissions
    return (sourceWeight / edgeWeight) * sourceEmissions;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      <div className="bg-muted/50 p-3 rounded-md">
        <h3 className="text-sm font-medium mb-2">Connection</h3>
        <div className="flex items-center justify-between text-sm">
          <div className="font-medium">
            {sourceNode?.data.label || "Source"}
          </div>
          <div className="text-muted-foreground">→</div>
          <div className="font-medium">
            {targetNode?.data.label || "Target"}
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="edge-weight" className="text-sm font-medium">
          Edge Weight
        </Label>
        <Input
          id="edge-weight"
          type="number"
          min="0.1"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(Number.parseFloat(e.target.value))}
          className="mt-1"
          ref={weightInputRef}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Weight determines how much of the source node's emissions flow through
          this edge.
        </p>
      </div>

      {sourceNode && (
        <div className="bg-muted/30 p-3 rounded-md">
          <h3 className="text-sm font-medium mb-2">Calculation Preview</h3>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>Source Weight:</span>
              <span>{sourceNode.data.weight}</span>
            </div>
            <div className="flex justify-between">
              <span>Source Total Emissions:</span>
              <span>
                {sourceNode.data.totalEmissions || sourceNode.data.emissions}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Edge Weight:</span>
              <span>{weight}</span>
            </div>
            <div className="border-t my-1 pt-1 flex justify-between font-medium">
              <span>Edge Emissions:</span>
              <span>{calculateEmissions().toFixed(2)}</span>
            </div>
            <div className="text-xs mt-2 text-muted-foreground">
              Formula: (Source Weight / Edge Weight) × Source Total Emissions
            </div>
          </div>
        </div>
      )}

      <Button onClick={applyChanges} className="mt-2">
        Apply Changes
      </Button>
    </motion.div>
  );
}
