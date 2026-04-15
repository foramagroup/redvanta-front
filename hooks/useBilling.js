// hooks/useBilling.js

import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { get, post } from '@/lib/api';

export function useBilling() {
  const [overview, setOverview] = useState(null);
  const [usageHistory, setUsageHistory] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [availableAddons, setAvailableAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAddons, setLoadingAddons] = useState(false);

  // Charger overview initial
  const fetchOverview = async () => {
    try {
      setLoading(true);
      const response = await get('/admin/billing/overview');
      if (response?.success && response?.data) {
        setOverview(response.data);
      }
    } catch (error) {
      toast({
        title: 'Error loading billing data',
        description: error?.message || 'Unable to load billing information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger historique usage
  const fetchUsageHistory = async (days = 30) => {
    try {
      const response = await get(`/admin/billing/usage-history?days=${days}`);
      if (response?.success && response?.data) {
        setUsageHistory(response.data);
      }
    } catch (error) {
      console.error('Error loading usage history:', error);
    }
  };

  // Charger invoices
  const fetchInvoices = async () => {
    try {
      const response = await get('/admin/billing/invoices');
      if (response?.success && response?.data) {
        setInvoices(response.data);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  };

  // Charger add-ons disponibles
  const fetchAvailableAddons = async () => {
    try {
      setLoadingAddons(true);
      const response = await get('/admin/billing/addons/available');
      if (response?.success && response?.data) {
        setAvailableAddons(response.data);
      }
    } catch (error) {
      console.error('Error loading available addons:', error);
    } finally {
      setLoadingAddons(false);
    }
  };

  // Activer un add-on
  const activateAddon = async (addonId) => {
    try {
      const response = await post(`/admin/billing/addons/${addonId}/activate`);
      
      if (response?.success) {
        toast({
          title: 'Add-on activated',
          description: response.message || 'Add-on successfully activated',
        });
        
        // Rafraîchir les données
        await Promise.all([
          fetchOverview(),
          fetchAvailableAddons(),
        ]);
        
        return true;
      }
    } catch (error) {
      toast({
        title: 'Activation failed',
        description: error?.message || 'Unable to activate add-on',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Désactiver un add-on
  const deactivateAddon = async (addonId) => {
    try {
      const response = await post(`/admin/billing/addons/${addonId}/deactivate`);
      
      if (response?.success) {
        toast({
          title: 'Add-on deactivated',
          description: response.message || 'Add-on successfully deactivated',
        });
        
        // Rafraîchir les données
        await Promise.all([
          fetchOverview(),
          fetchAvailableAddons(),
        ]);
        
        return true;
      }
    } catch (error) {
      toast({
        title: 'Deactivation failed',
        description: error?.message || 'Unable to deactivate add-on',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Exporter usage
  const exportUsage = async (startDate = null, endDate = null) => {
    try {
      const response = await post('/admin/billing/export-usage', {
        startDate,
        endDate,
      });
      
      // Créer un lien de téléchargement
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `usage-export-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Export successful',
        description: 'Usage data exported to CSV',
      });
      
      return true;
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error?.message || 'Unable to export usage data',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Charger toutes les données au montage
  useEffect(() => {
    fetchOverview();
    fetchUsageHistory();
    fetchInvoices();
  }, []);

  return {
    // État
    overview,
    usageHistory,
    invoices,
    availableAddons,
    loading,
    loadingAddons,
    
    // Méthodes
    fetchOverview,
    fetchUsageHistory,
    fetchInvoices,
    fetchAvailableAddons,
    activateAddon,
    deactivateAddon,
    exportUsage,
    
    // Helpers
    refresh: () => {
      fetchOverview();
      fetchUsageHistory();
      fetchInvoices();
    },
  };
}