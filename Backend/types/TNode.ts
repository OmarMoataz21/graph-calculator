import TNodeData from "./TNodeData.ts";

type TNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: TNodeData;
  width?: number;
  height?: number;
  dragging?: boolean;
  selected?: boolean;
  positionAbsolute?: { x: number; y: number };
};
export default TNode;
