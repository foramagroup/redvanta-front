"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";

const LiveTextEditorContext = createContext({
  isEditing: false,
  startEditing: () => {},
  saveEdits: () => {},
  cancelEdits: () => {},
});

export const useLiveTextEditor = () => useContext(LiveTextEditorContext);

export const LiveTextEditorProvider = ({ children }) => {
  const [isEditing, setIsEditing] = useState(false);
  const snapshotRef = useRef("");

  const startEditing = useCallback(() => {
    // Snapshot the current page HTML for cancel/restore
    const main = document.getElementById("live-text-editor-root");
    if (main) snapshotRef.current = main.innerHTML;
    setIsEditing(true);
  }, []);

  const saveEdits = useCallback(() => {
    // In a real implementation, you'd persist changes here
    setIsEditing(false);
    snapshotRef.current = "";
  }, []);

  const cancelEdits = useCallback(() => {
    const main = document.getElementById("live-text-editor-root");
    if (main && snapshotRef.current) {
      main.innerHTML = snapshotRef.current;
    }
    setIsEditing(false);
    snapshotRef.current = "";
  }, []);

  return (
    <LiveTextEditorContext.Provider value={{ isEditing, startEditing, saveEdits, cancelEdits }}>
      {children}
    </LiveTextEditorContext.Provider>
  );
};
