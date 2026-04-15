// hooks/useSettings.js - CRÉER CE HOOK

import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { get, post, put } from '@/lib/api';

export function useSettings() {
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Charger la subscription
  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await get('/admin/general-settings/subscription');
      if (response?.success) {
        setSubscription(response.data);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les factures
  const fetchInvoices = async (limit = 10) => {
    try {
      const response = await get(`/admin/general-settings/invoices?limit=${limit}`);
      if (response?.success) {
        setInvoices(response.data);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  };

  // Charger les plans disponibles
  const fetchAvailablePlans = async () => {
    try {
      setLoadingPlans(true);
      const response = await get('/admin/general-settings/available-plans');
      if (response?.success) {
        setAvailablePlans(response.data);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoadingPlans(false);
    }
  };

  // Changer de plan
  const changePlan = async (planId, interval = 'monthly') => {
    try {
      const response = await post('/admin/general-settings/change-plan', {
        planId,
        interval,
      });

      if (response?.success) {
        toast({
          title: 'Plan updated',
          description: response.message || 'Your plan has been updated successfully',
        });

        // Rafraîchir les données
        await fetchSubscription();
        return true;
      }
    } catch (error) {
      toast({
        title: 'Plan change failed',
        description: error?.error || error?.message || 'Unable to change plan',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Annuler l'abonnement
  const cancelSubscription = async (reason = '') => {
    try {
      const response = await post('/admin/general-settings/cancel-subscription', {
        cancelReason: reason,
      });

      if (response?.success) {
        toast({
          title: 'Subscription canceled',
          description: response.message || 'Your subscription will be canceled at the end of the billing period',
        });

        await fetchSubscription();
        return true;
      }
    } catch (error) {
      toast({
        title: 'Cancellation failed',
        description: error?.error || error?.message || 'Unable to cancel subscription',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Réactiver l'abonnement
  const reactivateSubscription = async () => {
    try {
      const response = await post('/admin/general-settings/reactivate-subscription');

      if (response?.success) {
        toast({
          title: 'Subscription reactivated',
          description: 'Your subscription has been reactivated successfully',
        });

        await fetchSubscription();
        return true;
      }
    } catch (error) {
      toast({
        title: 'Reactivation failed',
        description: error?.error || error?.message || 'Unable to reactivate subscription',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Charger au montage
  useEffect(() => {
    fetchSubscription();
    fetchInvoices();
  }, []);

  return {
    // État
    subscription,
    invoices,
    availablePlans,
    loading,
    loadingPlans,

    // Méthodes
    fetchSubscription,
    fetchInvoices,
    fetchAvailablePlans,
    changePlan,
    cancelSubscription,
    reactivateSubscription,

    // Helpers
    refresh: () => {
      fetchSubscription();
      fetchInvoices();
    },
  };
}