"use client";

import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function useCardTemplates() {
  const [templates, setTemplates] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    platform: 'all',
    isActive: 'all',
    search: ''
  });

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (filters.platform !== 'all') params.append('platform', filters.platform);
      if (filters.isActive !== 'all') params.append('isActive', filters.isActive);
      if (filters.search) params.append('search', filters.search);
      const response = await fetch(
        `${API_URL}/superadmin/card-templates?${params}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch templates');

      const data = await response.json();
      setTemplates(data.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load templates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/superadmin/card-templates/stats`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
    fetchStats();
  }, [fetchTemplates, fetchStats]);

  // Create template
  const createTemplate = async (templateData) => {
    try {
      const response = await fetch(`${API_URL}/superadmin/card-templates`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) throw new Error('Failed to create template');

      const data = await response.json();
      toast({
        title: 'Success',
        description: 'Template created successfully',
      });

      await fetchTemplates();
      await fetchStats();
      return data;
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Update template
  const updateTemplate = async (id, updates) => {
    try {
      const response = await fetch(`${API_URL}/superadmin/card-templates/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update template');

      const data = await response.json();
      toast({
        title: 'Success',
        description: 'Template updated successfully',
      });

      await fetchTemplates();
      return data;
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Delete template
  const deleteTemplate = async (id) => {
    try {
      const response = await fetch(`${API_URL}/superadmin/card-templates/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to delete template');

      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      });

      await fetchTemplates();
      await fetchStats();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Duplicate template
  const duplicateTemplate = async (id) => {
    try {
      const response = await fetch(`${API_URL}/superadmin/card-templates/${id}/duplicate`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to duplicate template');

      toast({
        title: 'Success',
        description: 'Template duplicated successfully',
      });

      await fetchTemplates();
      await fetchStats();
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Toggle template
  const toggleTemplate = async (id) => {
    try {
      const response = await fetch(`${API_URL}/superadmin/card-templates/${id}/toggle`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to toggle template');

      await fetchTemplates();
    } catch (error) {
      console.error('Error toggling template:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return {
    templates,
    stats,
    loading,
    filters,
    updateFilters,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    toggleTemplate,
    refresh: fetchTemplates,
  };
}