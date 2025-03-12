"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NodePropertiesPanel from "../node-properties-panel";
import EdgePropertiesPanel from "../edge-properties-panel";
import SavedConfigurationsPanel from "../saved-configurations-panel";
import type {
  CalculationNode,
  CalculationEdge,
  SavedConfiguration,
} from "@/types/graph";

interface PropertiesPanelProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedNode: CalculationNode | null;
  selectedEdge: CalculationEdge | null;
  updateNodeProperties: (
    id: string,
    data: Partial<CalculationNode["data"]>
  ) => void;
  updateEdgeProperties: (
    id: string,
    data: Partial<CalculationEdge["data"]>
  ) => void;
  nodes: CalculationNode[];
  edges: CalculationEdge[];
  isNewEdge: boolean;
  savedConfigurations: SavedConfiguration[];
  loadConfiguration: (id: string) => void;
  deleteConfiguration: (id: string, name: string) => void;
  searchTerm: string;
}

export default function PropertiesPanel({
  isOpen,
  setIsOpen,
  activeTab,
  setActiveTab,
  selectedNode,
  selectedEdge,
  updateNodeProperties,
  updateEdgeProperties,
  nodes,
  edges,
  isNewEdge,
  savedConfigurations,
  loadConfiguration,
  deleteConfiguration,
  searchTerm,
}: PropertiesPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 350, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="h-screen border-l border-border bg-background overflow-hidden"
        >
          <Card className="border-0 rounded-none h-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings size={18} />
                Properties
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                ×
              </Button>
            </div>
            <CardContent className="p-0">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="node" disabled={!selectedNode}>
                    Node
                  </TabsTrigger>
                  <TabsTrigger value="edge" disabled={!selectedEdge}>
                    Edge
                  </TabsTrigger>
                  <TabsTrigger value="saved">Saved</TabsTrigger>
                </TabsList>
                <TabsContent value="node" className="p-4">
                  {selectedNode && (
                    <NodePropertiesPanel
                      node={selectedNode}
                      updateNodeProperties={updateNodeProperties}
                    />
                  )}
                </TabsContent>
                <TabsContent value="edge" className="p-4">
                  {selectedEdge && (
                    <EdgePropertiesPanel
                      edge={selectedEdge}
                      updateEdgeProperties={updateEdgeProperties}
                      nodes={nodes}
                      edges={edges}
                      isNewEdge={isNewEdge}
                    />
                  )}
                </TabsContent>
                <TabsContent value="saved" className="p-4">
                  <SavedConfigurationsPanel
                    configurations={savedConfigurations}
                    loadConfiguration={loadConfiguration}
                    deleteConfiguration={deleteConfiguration}
                    searchTerm={searchTerm}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
