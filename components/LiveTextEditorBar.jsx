import { Pencil, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLiveTextEditor } from "@/contexts/LiveTextEditorContext";
import { motion, AnimatePresence } from "framer-motion";

const LiveTextEditorBar = () => {
  const { isEditing, startEditing, saveEdits, cancelEdits } = useLiveTextEditor();

  return (
    <AnimatePresence>
      {isEditing ? (
        <motion.div
          key="editing-bar"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed top-0 left-0 right-0 z-[60] border-b border-primary/30 bg-card/95 backdrop-blur-xl"
        >
          <div className="container mx-auto flex h-10 items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                <Pencil size={12} className="text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">Live Edit Mode</span>
              <span className="text-xs text-muted-foreground ml-1 hidden sm:inline">— Click any text to edit it directly</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={cancelEdits}>
                <X size={14} className="mr-1" /> Cancel
              </Button>
              <Button size="sm" onClick={saveEdits}>
                <Save size={14} className="mr-1" /> Save
              </Button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="edit-btn-bar"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed top-0 left-0 right-0 z-[60] border-b border-border/30 bg-card/90 backdrop-blur-xl"
        >
          <div className="container mx-auto flex h-8 items-center justify-end px-6">
            <Button variant="ghost" size="sm" onClick={startEditing} className="text-xs text-muted-foreground hover:text-primary h-6">
              <Pencil size={12} className="mr-1.5" /> Edit Page
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LiveTextEditorBar;
