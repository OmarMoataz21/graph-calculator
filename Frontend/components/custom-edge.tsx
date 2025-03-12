"use client";

import { type EdgeProps, EdgeLabelRenderer, getBezierPath } from "reactflow";
import { motion } from "framer-motion";
import type { CalculationEdgeData } from "@/types/graph";

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  style = {},
  selected,
  interactionWidth = 20, // Width of the interaction area
}: EdgeProps<CalculationEdgeData> & { interactionWidth?: number }) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* Invisible wider path for better interaction */}
      <path
        id={`${id}-interaction`}
        d={edgePath}
        strokeWidth={interactionWidth}
        stroke="transparent"
        fill="none"
        strokeLinecap="round"
        className="react-flow__edge-interaction"
      />

      <path
        id={id}
        style={style}
        className={`react-flow__edge-path ${
          selected ? "stroke-primary stroke-[3px]" : "stroke-[#b1b1b7]"
        }`}
        d={edgePath}
        markerEnd={markerEnd}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "none",
            zIndex: 1000,
          }}
          className="edge-label-container"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`px-2 py-1 rounded-md text-xs whitespace-nowrap ${
              selected
                ? "bg-primary text-primary-foreground"
                : "bg-background/80 shadow-sm border"
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="font-medium">Weight: {data?.weight || 1}</div>
              <div className="text-xs">
                Emissions: {(data?.emissions || 0).toFixed(2)}
              </div>
            </div>
          </motion.div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
