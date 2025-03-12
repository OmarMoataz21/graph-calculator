"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { CalculationNode } from "@/types/graph";

interface NodePropertiesPanelProps {
  node: CalculationNode;
  updateNodeProperties: (
    id: string,
    data: Partial<CalculationNode["data"]>
  ) => void;
}

export default function NodePropertiesPanel({
  node,
  updateNodeProperties,
}: NodePropertiesPanelProps) {
  const [label, setLabel] = useState(node.data.label || "");
  const [weight, setWeight] = useState(node.data.weight || 0);
  const [manualEmissions, setManualEmissions] = useState(
    node.data.manualEmissions || 0
  );
  const [totalEmissions, setTotalEmissions] = useState(
    node.data.totalEmissions || node.data.emissions || 0
  );

  // Update local state when selected node changes
  useEffect(() => {
    setLabel(node.data.label || "");
    setWeight(node.data.weight || 0);
    setManualEmissions(node.data.manualEmissions || 0);
    setTotalEmissions(node.data.totalEmissions || node.data.emissions || 0);
  }, [node]);

  const applyChanges = () => {
    // Validate weight is positive
    if (Number(weight) <= 0) {
      toast.error("Invalid Weight", {
        description: "Node weight must be greater than zero.",
        duration: 3000,
      });
      return;
    }

    // Validate manual emissions is non-negative
    if (Number(manualEmissions) < 0) {
      toast.error("Invalid Emissions", {
        description: "Manual emissions cannot be negative.",
        duration: 3000,
      });
      return;
    }

    // Try to update the node properties
    updateNodeProperties(node.id, {
      label,
      weight: Number.parseFloat(weight.toString()),
      manualEmissions: Number.parseFloat(manualEmissions.toString()),
      emissions: Number.parseFloat(manualEmissions.toString()),
      totalEmissions: Number.parseFloat(totalEmissions.toString()),
    });

    toast.success("Node Updated", {
      description: "Node properties have been updated successfully.",
      duration: 2000,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      <div>
        <Label htmlFor="node-label" className="text-sm font-medium">
          Node Name
        </Label>
        <Input
          id="node-label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="node-weight" className="text-sm font-medium">
          Weight
        </Label>
        <Input
          id="node-weight"
          type="number"
          min="0.1"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(Number.parseFloat(e.target.value))}
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Total weight available for distribution through edges.
        </p>
      </div>

      <div>
        <Label htmlFor="manual-emissions" className="text-sm font-medium">
          Manual Emissions
        </Label>
        <Input
          id="manual-emissions"
          type="number"
          min="0"
          step="0.1"
          value={manualEmissions}
          onChange={(e) =>
            setManualEmissions(Number.parseFloat(e.target.value))
          }
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Emissions directly produced by this node.
        </p>
      </div>

      <div>
        <Label
          htmlFor="total-emissions"
          className="text-sm font-medium text-muted-foreground"
        >
          Total Emissions
        </Label>
        <Input
          id="total-emissions"
          type="number"
          value={totalEmissions}
          disabled
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Sum of manual emissions plus all incoming edge emissions. This value
          is calculated automatically.
        </p>
      </div>

      <Button onClick={applyChanges} className="mt-2">
        Apply Changes
      </Button>
    </motion.div>
  );
}
