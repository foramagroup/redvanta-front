"use client";

import { useEffect, useState } from "react";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const RolesPermissions = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState({});
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRolePermissions, setNewRolePermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const buildPermissionMap = (items = []) => {
    const map = {};

    items.forEach((item) => {
      const moduleName = item.module?.name;
      const permissionName = item.permission?.name;

      if (!moduleName || !permissionName) return;
      if (!map[moduleName]) map[moduleName] = [];
      if (!map[moduleName].includes(permissionName)) {
        map[moduleName].push(permissionName);
      }
    });

    return map;
  };

  const loadRolesData = async (preferredRoleId = null) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${apiBase}/api/superadmin/role-settings`, {
        credentials: "include",
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to load roles");
      }

      const nextRoles = Array.isArray(payload?.roles) ? payload.roles : [];
      const nextModules = Array.isArray(payload?.modules) ? payload.modules : [];
      const nextPermissions = Array.isArray(payload?.permissions) ? payload.permissions : [];

      setRoles(nextRoles);
      setModules(nextModules);
      setPermissions(nextPermissions);

      if (nextRoles.length > 0) {
        const roleId = preferredRoleId && nextRoles.some((role) => role.id === preferredRoleId)
          ? preferredRoleId
          : selectedRoleId && nextRoles.some((role) => role.id === selectedRoleId)
            ? selectedRoleId
            : nextRoles[0].id;
        setSelectedRoleId(roleId);

        const selectedRole = nextRoles.find((role) => role.id === roleId);
        setSelectedPermissions(buildPermissionMap(selectedRole?.rolePermissions));
      } else {
        setSelectedRoleId(null);
        setSelectedPermissions({});
      }
    } catch (err) {
      setError(err.message || "Failed to load roles");
      setRoles([]);
      setModules([]);
      setPermissions([]);
      setSelectedRoleId(null);
      setSelectedPermissions({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRolesData();
  }, []);

  const selectedRole = roles.find((role) => role.id === selectedRoleId) || null;

  const openCreateRole = () => {
    setNewRoleName("");
    setNewRolePermissions({});
    setShowAddRole(true);
  };

  const handleRoleSelect = (role) => {
    setSelectedRoleId(role.id);
    setSelectedPermissions(buildPermissionMap(role.rolePermissions));
  };

  const togglePermissionMapValue = (setter, moduleName, permissionName) => {
    setter((current) => {
      const currentValues = current[moduleName] || [];
      const exists = currentValues.includes(permissionName);

      return {
        ...current,
        [moduleName]: exists
          ? currentValues.filter((item) => item !== permissionName)
          : [...currentValues, permissionName],
      };
    });
  };

  const buildPermissionPayload = (permissionMap) => {
    const moduleByName = new Map(modules.map((module) => [module.name, module.id]));
    const permissionByName = new Map(permissions.map((permission) => [permission.name, permission.id]));
    const data = [];

    Object.entries(permissionMap).forEach(([moduleName, permissionNames]) => {
      const moduleId = moduleByName.get(moduleName);
      if (!moduleId) return;

      permissionNames.forEach((permissionName) => {
        const permissionId = permissionByName.get(permissionName);
        if (!permissionId) return;

        data.push({ moduleId, permissionId });
      });
    });

    return data;
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`${apiBase}/api/superadmin/role-settings/permissions`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roleId: selectedRole.id,
          permissions: buildPermissionPayload(selectedPermissions),
        }),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to save permissions");
      }

      await loadRolesData();
      toast({ title: "Permissions updated" });
    } catch (err) {
      setError(err.message || "Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRole = async () => {
    setError("");

    if (!newRoleName.trim()) {
      setError("Please enter a role name.");
      return;
    }

    setCreating(true);

    try {
      const res = await fetch(`${apiBase}/api/superadmin/role-settings`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newRoleName.trim(),
          permissions: buildPermissionPayload(newRolePermissions),
        }),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to create role");
      }

      setShowAddRole(false);
      setNewRoleName("");
      setNewRolePermissions({});
      await loadRolesData(payload?.id || null);
      toast({ title: "Role created" });
    } catch (err) {
      setError(err.message || "Failed to create role");
    } finally {
      setCreating(false);
    }
  };

  return (
    <SuperAdminLayout title={t("sa.roles_title")} subtitle={t("sa.roles_subtitle")}>
      {error ? (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border/50 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{t("sa.roles_roles")}</CardTitle>
            <Button size="sm" variant="outline" className="border-border/50 text-xs" onClick={openCreateRole}>
              <Plus size={12} className="mr-1" />
              {t("sa.roles_new")}
            </Button>
          </CardHeader>
          <CardContent className="space-y-1 p-4 pt-0">
            {loading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">Loading roles...</div>
            ) : roles.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">No roles found.</div>
            ) : roles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedRoleId === role.id ? "bg-primary/10 text-primary border-glow" : "text-muted-foreground hover:bg-secondary"}`}
              >
                {role.name}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">{t("sa.roles_permissions")} - {selectedRole?.name || "-"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">{t("sa.roles_module")}</th>
                    {permissions.map((permission) => (
                      <th key={permission.id} className="text-center py-3 px-2 text-muted-foreground font-medium">{permission.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modules.map((module) => (
                    <tr key={module.id} className="border-b border-border/50">
                      <td className="py-3 px-2 font-medium">{module.name}</td>
                      {permissions.map((permission) => {
                        const activePermissions = selectedPermissions[module.name] || [];
                        return (
                          <td key={permission.id} className="text-center py-3 px-2">
                            <Checkbox
                              checked={activePermissions.includes(permission.name)}
                              disabled={!selectedRole || saving}
                              onCheckedChange={() => togglePermissionMapValue(setSelectedPermissions, module.name, permission.name)}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button className="mt-6" disabled={!selectedRole || saving} onClick={handleSavePermissions}>
              {saving ? "Saving..." : t("sa.roles_save")}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddRole} onOpenChange={setShowAddRole}>
        <DialogContent className="bg-card border-border/50 sm:max-w-md">
          <DialogHeader><DialogTitle>{t("sa.roles_create_title")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>{t("sa.roles_role_name")}</Label><Input value={newRoleName} disabled={creating} onChange={(e) => setNewRoleName(e.target.value)} className="mt-1 bg-secondary border-border/50" placeholder={t("sa.roles_name_placeholder")} /></div>
            <div>
              <Label className="mb-3 block">{t("sa.roles_default_perms")}</Label>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">{t("sa.roles_module")}</th>
                      {permissions.map((permission) => (
                        <th key={permission.id} className="text-center py-2 px-2 text-muted-foreground font-medium text-xs">{permission.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map((module) => (
                      <tr key={module.id} className="border-b border-border/50">
                        <td className="py-2 px-2 font-medium text-xs">{module.name}</td>
                        {permissions.map((permission) => {
                          const activePermissions = newRolePermissions[module.name] || [];
                          return (
                            <td key={permission.id} className="text-center py-2 px-2">
                              <Checkbox
                                checked={activePermissions.includes(permission.name)}
                                disabled={creating}
                                onCheckedChange={() => togglePermissionMapValue(setNewRolePermissions, module.name, permission.name)}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRole(false)} disabled={creating}>{t("sa.roles_cancel")}</Button>
            <Button onClick={handleCreateRole} disabled={creating}>{creating ? "Saving..." : t("sa.roles_create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default RolesPermissions;
