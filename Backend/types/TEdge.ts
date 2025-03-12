import TEdgeData from "./TEdgeData.ts";

type TEdge = {
  id: string;
  source: string;
  target: string;
  type: string;
  animated?: boolean;
  markerEnd?: { type: string };
  interactionWidth?: number;
  data: TEdgeData;
};
export default TEdge;
