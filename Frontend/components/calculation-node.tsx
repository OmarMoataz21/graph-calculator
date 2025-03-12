"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { motion } from "framer-motion";
import type { CalculationNodeData } from "@/types/graph";

function CalculationNode({ data, selected }: NodeProps<CalculationNodeData>) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`px-4 py-3 shadow-md rounded-lg min-w-[180px] ${
        selected
          ? "ring-2 ring-primary ring-offset-2 bg-primary/5"
          : "bg-background"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-primary/80"
      />
      <div className="flex flex-col gap-1">
        <div className="font-semibold text-center border-b pb-1 mb-1">
          {data.label}
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
          <div className="text-muted-foreground">Weight:</div>
          <div className="font-medium text-right">{data.weight}</div>

          <div className="text-muted-foreground">Manual Emissions:</div>
          <div className="font-medium text-right">{data.manualEmissions}</div>

          <div className="text-muted-foreground">Total Emissions:</div>
          <div className="font-medium text-right">
            {(data.totalEmissions || data.emissions || 0).toFixed(2)}
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-primary/80"
      />
    </motion.div>
  );
}

export default memo(CalculationNode);
