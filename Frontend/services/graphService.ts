const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseURL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined");
}
export const listAllGraphs = async (): Promise<any[]> => {
  try {
    const response = await fetch(baseURL);

    if (!response.ok) {
      throw new Error("Failed to fetch graphs list");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching graphs list:", error);
    throw error;
  }
};

export const saveGraphData = async (data: {
  nodes: any[];
  edges: any[];
  name: string;
}): Promise<void> => {
  try {
    const response = await fetch(baseURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to save graph data");
    }
    return response.json();
  } catch (error) {
    console.error("Error saving graph data:", error);
    throw error;
  }
};

export const loadGraph = async (graphId: string): Promise<any> => {
  try {
    const response = await fetch(`${baseURL}/${graphId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch graph data");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching graph data:", error);
    throw error;
  }
};

export const deleteGraph = async (graphId: string): Promise<void> => {
  const response = await fetch(`${baseURL}/${graphId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete graph");
  }
};
