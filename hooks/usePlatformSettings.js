"use client";

import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Hook pour gérer les Platform Settings (SuperAdmin)
 */
export function usePlatformSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/superadmin/general-settings`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to fetch settings');

      const data = await response.json();
      setSettings(data.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Update General Settings
  const updateGeneral = async (data) => {
    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/superadmin/general-settings/general`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update general settings');

      const result = await response.json();
      setSettings(result.data);
      
      toast({
        title: 'Success',
        description: 'General settings updated successfully',
      });

      return result;
    } catch (error) {
      console.error('Error updating general settings:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update general settings',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Update Branding
  const updateBranding = async (data) => {
    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/superadmin/general-settings/branding`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update branding');

      const result = await response.json();
      setSettings(result.data);
      
      toast({
        title: 'Success',
        description: 'Branding updated successfully',
      });

      return result;
    } catch (error) {
      console.error('Error updating branding:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update branding',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Upload Logo
  const uploadLogo = async (file) => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch(`${API_URL}/superadmin/general-settings/logo`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload logo');

      const result = await response.json();
      setSettings(result.data.settings);
      
      toast({
        title: 'Success',
        description: 'Logo uploaded successfully',
      });

      return result;
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload logo',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Update reCAPTCHA
  const updateRecaptcha = async (data) => {
    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/superadmin/general-settings/recaptcha`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update reCAPTCHA');

      const result = await response.json();
      setSettings(result.data);
      
      toast({
        title: 'Success',
        description: 'reCAPTCHA settings updated successfully',
      });

      return result;
    } catch (error) {
      console.error('Error updating reCAPTCHA:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update reCAPTCHA',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Update Maps
  const updateMaps = async (data) => {
    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/superadmin/general-settings/maps`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update Maps');

      const result = await response.json();
      setSettings(result.data);
      
      toast({
        title: 'Success',
        description: 'Maps settings updated successfully',
      });

      return result;
    } catch (error) {
      console.error('Error updating Maps:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update Maps',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Update Platforms
  const updatePlatforms = async (data) => {
    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/superadmin/general-settings/platforms`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update platforms');

      const result = await response.json();
      setSettings(result.data);
      
      toast({
        title: 'Success',
        description: 'Platform links updated successfully',
      });

      return result;
    } catch (error) {
      console.error('Error updating platforms:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update platforms',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Update Security
  const updateSecurity = async (data) => {
    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/superadmin/general-settings/security`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update security');

      const result = await response.json();
      setSettings(result.data);
      
      toast({
        title: 'Success',
        description: 'Security settings updated successfully',
      });

      return result;
    } catch (error) {
      console.error('Error updating security:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update security',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return {
    settings,
    loading,
    saving,
    refresh: fetchSettings,
    updateGeneral,
    updateBranding,
    uploadLogo,
    updateRecaptcha,
    updateMaps,
    updatePlatforms,
    updateSecurity,
  };
}