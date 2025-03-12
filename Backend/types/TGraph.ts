import TNode from "./TNode.ts";
import TEdge from "./TEdge.ts";

type TGraph = {
  name: string;
  nodes: TNode[];
  edges: TEdge[];
};
export default TGraph;
