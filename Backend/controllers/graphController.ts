import { Request, Response } from "express";
import { Graph } from "../models/graphModel.ts";
import { TNode, TEdge, TGraph } from "../types/index.ts";

const validateGraph = (name: string, nodes: TNode[], edges: TEdge[]): void => {
  if (!name.trim()) {
    throw new Error("Graph name cannot be empty");
  }
  if (!Array.isArray(nodes) || nodes.length === 0) {
    throw new Error("Nodes cannot be empty");
  }
  for (const node of nodes) {
    const totalEdgeWeight = edges
      .filter((edge) => edge.source.toString() === node.id.toString())
      .reduce((sum, edge) => sum + edge.data.weight, 0);

    if (totalEdgeWeight > node.data.weight) {
      throw new Error(
        `Node ${node.data.label} has outbound edges exceeding its weight`
      );
    }
  }
  validateEmissions(nodes, edges);
  if (isCyclic(nodes, edges)) {
    throw new Error("Graph cannot be cyclic");
  }
};

const validateEmissions = (nodes: TNode[], edges: TEdge[]): void => {
  const nodeEmissions = new Map<string, number>();

  nodes.forEach((node) => {
    nodeEmissions.set(node.id.toString(), node.data.totalEmissions);
  });

  edges.forEach((edge) => {
    const sourceNode = nodes.find(
      (n) => n.id.toString() === edge.source.toString()
    );
    const targetNode = nodes.find(
      (n) => n.id.toString() === edge.target.toString()
    );
    if (!sourceNode || !targetNode) {
      throw new Error(`Source or Target node ${edge.source} not found`);
    }

    const emissionContribution =
      (sourceNode.data.weight / edge.data.weight) *
      sourceNode.data.totalEmissions;

    nodeEmissions.set(
      edge.target.toString(),
      targetNode.data.manualEmissions + emissionContribution
    );
  });

  nodes.forEach((node) => {
    if (node.data.totalEmissions !== nodeEmissions.get(node.id.toString())) {
      throw new Error(
        `Emission calculation mismatch for node ${node.data.label}`
      );
    }
  });
};

const isCyclic = (nodes: TNode[], edges: TEdge[]): boolean => {
  const adjacencyList = new Map<string, string[]>();
  nodes.forEach((node) => adjacencyList.set(node.id.toString(), []));
  edges.forEach((edge) =>
    adjacencyList.get(edge.source.toString())?.push(edge.target.toString())
  );

  const visited = new Set<string>();
  const recStack = new Set<string>();

  const dfs = (node: string): boolean => {
    if (recStack.has(node)) return true;
    if (visited.has(node)) return false;

    visited.add(node);
    recStack.add(node);

    for (const neighbor of adjacencyList.get(node) || []) {
      if (dfs(neighbor)) return true;
    }

    recStack.delete(node);
    return false;
  };

  for (const node of nodes) {
    if (!visited.has(node.id.toString()) && dfs(node.id.toString())) {
      return true;
    }
  }
  return false;
};

export const createGraph = async (
  req: Request<{}, {}, TGraph>,
  res: Response
): Promise<void> => {
  try {
    const { nodes, edges, name } = req.body;
    validateGraph(name, nodes, edges);
    const graph = new Graph({ name, nodes, edges });
    await graph.save();
    res.status(201).json({
      _id: graph._id,
      name: graph.name,
      nodesCount: graph.nodes.length,
      edgesCount: graph.edges.length,
    });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const getGraphs = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const graphs = await Graph.find({}, "name nodes edges").lean().exec();
    const response = graphs.map((graph) => ({
      _id: graph._id,
      name: graph.name,
      nodesCount: graph.nodes.length,
      edgesCount: graph.edges.length,
    }));
    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getGraphById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const graph = await Graph.findById(id);
    if (!graph) {
      res.status(404).json({ error: "Graph not found" });
      return;
    }
    res.status(200).json(graph);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const updateGraph = async (
  req: Request<
    { id: string },
    {},
    { nodes: TNode[]; edges: TEdge[]; name: string }
  >,
  res: Response
): Promise<void> => {
  try {
    const { nodes, edges, name } = req.body;
    validateGraph(name, nodes, edges);

    const graph = await Graph.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!graph) {
      res.status(404).json({ error: "Graph not found" });
      return;
    }
    res.json(graph);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const deleteGraph = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const graph = await Graph.findByIdAndDelete(req.params.id);
    if (!graph) {
      res.status(404).json({ error: "Graph not found" });
      return;
    }
    res.json({ message: "Graph deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
