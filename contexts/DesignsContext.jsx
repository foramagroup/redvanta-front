"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "redvanta_saved_designs";
const VERSIONS_STORAGE_KEY = "redvanta_design_versions";
const MAX_VERSIONS = 20;

const INITIAL_DESIGNS = [
  {
    id: "d-1", name: "Bella's Main Card", businessName: "Bella's Italian Kitchen",
    template: "Crimson Noir", templateColor1: "#B91C1C", templateColor2: "#0D0D0D",
    orientation: "landscape", model: "Premium", status: "active",
    linkedCard: "CARD-00421", createdAt: "2025-01-15", updatedAt: "2025-02-20",
    frontInstructions: "Tap your phone here", backInstructions: "Scan QR to leave a review"
  },
  {
    id: "d-2", name: "Summit Dental Portrait", businessName: "Summit Dental Care",
    template: "Midnight Gold", templateColor1: "#1E1B4B", templateColor2: "#0F172A",
    orientation: "portrait", model: "Metal", status: "active",
    linkedCard: "CARD-00422", createdAt: "2025-01-20", updatedAt: "2025-03-01",
    frontInstructions: "Hold phone near card", backInstructions: "Scan to review us"
  },
  {
    id: "d-3", name: "Auto Service Draft", businessName: "Elite Auto Service",
    template: "Arctic Fire", templateColor1: "#FFFFFF", templateColor2: "#F1F5F9",
    orientation: "landscape", model: "Classic", status: "draft",
    linkedCard: null, createdAt: "2025-02-10", updatedAt: "2025-02-10",
    frontInstructions: "Tap NFC to start", backInstructions: "Leave us a review"
  },
  {
    id: "d-4", name: "Old Branding Design", businessName: "Bella's Italian Kitchen",
    template: "Emerald Dark", templateColor1: "#064E3B", templateColor2: "#0D0D0D",
    orientation: "landscape", model: "Classic", status: "archived",
    linkedCard: null, createdAt: "2024-11-05", updatedAt: "2024-12-01",
    frontInstructions: "Tap here", backInstructions: "Scan QR code"
  },
  {
    id: "d-5", name: "Bella's Table Stand", businessName: "Bella's Italian Kitchen",
    template: "Onyx Orbit", templateColor1: "#0A0A0A", templateColor2: "#1A1A1A",
    orientation: "portrait", model: "Premium", status: "draft",
    linkedCard: null, createdAt: "2025-03-01", updatedAt: "2025-03-05",
    frontInstructions: "Scan to review", backInstructions: "Thank you for visiting"
  },
];

function loadDesigns() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
