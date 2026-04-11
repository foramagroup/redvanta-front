"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "opinoor_saved_designs";
const VERSIONS_STORAGE_KEY = "opinoor_design_versions";
const MAX_VERSIONS = 20;

const INITIAL_DESIGNS = [];

function loadDesigns() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* ignore */ }
  return INITIAL_DESIGNS;
}

function loadVersions() {
  try {
    const stored = localStorage.getItem(VERSIONS_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return {};
}

const DesignsContext = createContext({
  designs: INITIAL_DESIGNS,
  addDesign: () => {},
  updateDesign: () => {},
  removeDesign: () => {},
  setDesigns: () => {},
  getDesignById: () => undefined,
  getVersionHistory: () => [],
  pushVersion: () => {},
  restoreVersion: () => {},
});

export const useDesigns = () => useContext(DesignsContext);

export const DesignsProvider = ({ children }) => {
  const [designs, setDesigns] = useState(loadDesigns);
  const [versionMap, setVersionMap] = useState(loadVersions);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
  }, [designs]);

  useEffect(() => {
    localStorage.setItem(VERSIONS_STORAGE_KEY, JSON.stringify(versionMap));
  }, [versionMap]);

  const addDesign = useCallback((design) => {
    setDesigns(prev => [design, ...prev]);
  }, []);

  const updateDesign = useCallback((id, updates) => {
    setDesigns(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, []);

  const removeDesign = useCallback((id) => {
    setDesigns(prev => prev.filter(d => d.id !== id));
    setVersionMap(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const getDesignById = useCallback((id) => {
    return designs.find(d => d.id === id);
  }, [designs]);

  const getVersionHistory = useCallback((designId) => {
    return versionMap[designId] || [];
  }, [versionMap]);

  const pushVersion = useCallback((designId, snapshot) => {
    setVersionMap(prev => {
      const existing = prev[designId] || [];
      const newVersion = {
        timestamp: new Date().toISOString(),
        snapshot,
      };
      const updated = [newVersion, ...existing].slice(0, MAX_VERSIONS);
      return { ...prev, [designId]: updated };
    });
  }, []);

  const restoreVersion = useCallback((designId, version) => {
    setDesigns(prev => prev.map(d =>
      d.id === designId ? { ...d, ...version.snapshot } : d
    ));
  }, []);

  return (
    <DesignsContext.Provider value={{
      designs, addDesign, updateDesign, removeDesign, setDesigns, getDesignById,
      getVersionHistory, pushVersion, restoreVersion,
    }}>
      {children}
    </DesignsContext.Provider>
  );
};
