"use client";

import { Panel } from "reactflow";
import {
  Plus,
  Save,
  FolderOpen,
  Trash2,
  LayoutGrid,
  Search,
  Lock,
  Unlock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface GraphToolbarProps {
  onAddNode: () => void;
  onDelete: () => void;
  onToggleLayout: () => void;
  onSave: () => void;
  onLoad: () => void;
  onToggleViewOnly: () => void;
  inputValue: string;
  setInputValue: (name: string) => void;
  hasNodes: boolean;
  hasSelection: boolean;
  isAnimatingLayout: boolean;
  layoutDirection: "TB" | "LR";
  isViewOnly: boolean;
}

export default function GraphToolbar({
  onAddNode,
  onDelete,
  onToggleLayout,
  onSave,
  onLoad,
  onToggleViewOnly,
  inputValue,
  setInputValue,
  hasNodes,
  hasSelection,
  isAnimatingLayout,
  layoutDirection,
  isViewOnly,
}: GraphToolbarProps) {
  return (
    <>
      <Panel position="top-left" className="flex gap-2 z-10">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onAddNode}
            className="flex items-center gap-2"
            size="sm"
            disabled={isViewOnly}
          >
            <Plus size={16} />
            Add Node
          </Button>
        </motion.div>

        {hasSelection && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={onDelete}
              variant="destructive"
              className="flex items-center gap-2"
              size="sm"
              disabled={isViewOnly}
            >
              <Trash2 size={16} />
              Delete
            </Button>
          </motion.div>
        )}

        {hasNodes && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onToggleLayout}
              variant="outline"
              className="flex items-center gap-2"
              size="sm"
              disabled={isAnimatingLayout || isViewOnly}
            >
              <LayoutGrid size={16} />
              {layoutDirection === "TB" ? "Vertical" : "Horizontal"} Layout
            </Button>
          </motion.div>
        )}

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onToggleViewOnly}
            variant={isViewOnly ? "default" : "secondary"}
            className="flex items-center gap-2"
            size="sm"
          >
            {isViewOnly ? <Unlock size={16} /> : <Lock size={16} />}
            {isViewOnly ? "Unlock" : "Lock"}
          </Button>
        </motion.div>
      </Panel>

      <Panel position="top-right" className="flex gap-2 z-10">
        <div className="flex items-center gap-2 bg-background/90 p-3 rounded-lg shadow-md border">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Configuration name"
              className="pl-8 w-64 h-9"
              disabled={isViewOnly}
            />
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onSave}
              variant="secondary"
              className="flex items-center gap-2"
              size="sm"
              disabled={isViewOnly}
            >
              <Save size={16} />
              Save
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onLoad}
              variant="outline"
              className="flex items-center gap-2"
              size="sm"
              disabled={isViewOnly}
            >
              <FolderOpen size={16} />
              Load
            </Button>
          </motion.div>
        </div>
      </Panel>
    </>
  );
}
