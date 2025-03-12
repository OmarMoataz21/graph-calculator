import mongoose from "mongoose";
import { TNode, TEdge, TGraph, TNodeData, TEdgeData } from "../types/index.ts";

const nodeDataSchema = new mongoose.Schema<TNodeData>({
  label: { type: String, required: true },
  manualEmissions: { type: Number, required: true },
  totalEmissions: { type: Number, required: true },
  weight: { type: Number, required: true },
});

const edgeDataSchema = new mongoose.Schema<TEdgeData>({
  weight: { type: Number, required: true },
  emissions: { type: Number, required: true },
});

const nodeSchema = new mongoose.Schema<TNode>({
  id: { type: String, required: true },
  type: { type: String, required: true },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  data: { type: nodeDataSchema, required: true },
  width: { type: Number },
  height: { type: Number },
  selected: { type: Boolean, default: false },
  positionAbsolute: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  dragging: { type: Boolean, default: false },
});

const edgeSchema = new mongoose.Schema<TEdge>({
  id: { type: String, required: true },
  source: { type: String, required: true },
  target: { type: String, required: true },
  type: { type: String, required: true },
  animated: { type: Boolean, default: false },
  markerEnd: { type: Object, required: false },
  interactionWidth: { type: Number },
  data: { type: edgeDataSchema, required: true },
});

const graphSchema = new mongoose.Schema<TGraph>(
  {
    name: { type: String, required: true },
    nodes: [nodeSchema],
    edges: [edgeSchema],
  },
  { timestamps: true }
);

export const Graph = mongoose.model<TGraph>("Graph", graphSchema);
