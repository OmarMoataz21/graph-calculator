"use client";

import type { MiniMapNodeProps as RFMiniMapNodeProps } from "reactflow";

export default function MiniMapNode({
  x,
  y,
  width,
  height,
  strokeWidth,
}: RFMiniMapNodeProps) {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={5}
      ry={5}
      fill="#94a3b8"
      strokeWidth={strokeWidth}
      className="transition-colors duration-300"
    />
  );
}
