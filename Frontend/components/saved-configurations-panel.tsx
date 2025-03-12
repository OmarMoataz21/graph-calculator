"use client";

import { Button } from "@/components/ui/button";
import { FolderOpen, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SavedConfiguration } from "@/types/graph";

interface SavedConfigurationsPanelProps {
  configurations: SavedConfiguration[];
  loadConfiguration: (id: string) => void;
  deleteConfiguration: (id: string, name: string) => void;
  searchTerm: string;
}

export default function SavedConfigurationsPanel({
  configurations,
  loadConfiguration,
  deleteConfiguration,
  searchTerm,
}: SavedConfigurationsPanelProps) {
  const filteredConfigurations = configurations.filter((config) =>
    config.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      {searchTerm && (
        <div className="bg-muted/30 p-3 rounded-md">
          <p className="text-sm">
            Showing results for:{" "}
            <span className="font-medium">{searchTerm}</span>
          </p>
        </div>
      )}

      {configurations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No saved configurations yet.</p>
          <p className="text-sm mt-1">
            Save your current graph to see it here.
          </p>
        </div>
      ) : filteredConfigurations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No configurations match your search.</p>
        </div>
      ) : (
        <div className="space-y-2 mt-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
          <AnimatePresence>
            {filteredConfigurations.map((config) => (
              <motion.div
                key={config._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="border rounded-md p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{config.name}</h3>
                  <div className="text-xs text-muted-foreground">
                    {config.nodesCount} nodes, {config.edgesCount} edges
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 flex items-center gap-1"
                    onClick={() => loadConfiguration(config._id)}
                  >
                    <FolderOpen size={14} />
                    Load
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => deleteConfiguration(config._id, config.name)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
