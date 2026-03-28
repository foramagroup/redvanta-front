"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const visibleModules = ["Accounts", "Billing", "Pricing", "Integrations", "Events", "Security", "Analytics"];
const visiblePermissions = ["View", "Edit", "Delete", "Impersonate", "Refund", "Suspend"];
const isVisiblePermissionEntry = (entry) =>
  visibleModules.includes(entry.module?.name) && visiblePermissions.includes(entry.permission?.name);

const getRolePermissionsMap = (role) => {
  const entries = role?.rolepermission || role?.rolePermissions || [];
  return entries.reduce((acc, item) => {
    const moduleName = item.module?.name;
    const permissionName = item.permission?.name;

    if (!moduleName || !permissionName) return acc;
    if (!acc[moduleName]) acc[moduleName] = [];
    acc[moduleName].push(permissionName);
    return acc;
  }, {});
};

export default function RolesPermissions() {
  const { t } = useLanguage();
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState({});
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRolePermissions, setNewRolePermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiBase}/api/superadmin/role-settings`, {
          credentials: "include",
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload.message || "Failed to load roles");
        }

        if (!active) return;

        const nextRoles = payload.roles || [];
        const nextModules = (payload.modules || []).filter((item) => visibleModules.includes(item.name));
        const nextPermissions = (payload.permissions || []).filter((item) => visiblePermissions.includes(item.name));
        const initialRole = nextRoles[0]?.name || "";

        setRoles(nextRoles);
        setModules(nextModules);
        setPermissions(nextPermissions);
        setSelectedRole(initialRole);
        setSelectedPermissions(getRolePermissionsMap(nextRoles[0]));
        setNewRolePermissions({});
      } catch (error) {
        if (!active) return;
        setRoles([]);
        setModules([]);
        setPermissions([]);
        setSelectedRole("");
        setSelectedPermissions({});
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const role = roles.find((item) => item.name === selectedRole);
    setSelectedPermissions(getRolePermissionsMap(role));
  }, [roles, selectedRole]);

  const togglePermission = (scope, moduleName, permissionName) => {
    const setter = scope === "new" ? setNewRolePermissions : setSelectedPermissions;

    setter((current) => {
      const currentPerms = current[moduleName] || [];
      const exists = currentPerms.includes(permissionName);

      return {
        ...current,
        [moduleName]: exists
          ? currentPerms.filter((item) => item !== permissionName)
          : [...currentPerms, permissionName],
      };
    });
  };

  const buildPermissionPayload = (permissionMap, baseRole = null) => {
    const hiddenEntries = (baseRole?.rolepermission || baseRole?.rolePermissions || [])
      .filter((entry) => !isVisiblePermissionEntry(entry))
      .map((entry) => ({
        moduleId: Number(entry.moduleId),
        permissionId: Number(entry.permissionId),
      }));

    const visibleEntries = modules.flatMap((moduleItem) => {
      const names = permissionMap[moduleItem.name] || [];
      return names
        .map((permissionName) => {
          const permissionItem = permissions.find((item) => item.name === permissionName);
          if (!permissionItem) return null;

          return {
            moduleId: moduleItem.id,
            permissionId: permissionItem.id,
          };
        })
        .filter(Boolean);
    });

    return [...hiddenEntries, ...visibleEntries];
  };

  const refreshSelectedRole = (nextRoles, roleName) => {
    const currentRole = nextRoles.find((item) => item.name === roleName) || nextRoles[0];
    setSelectedRole(currentRole?.name || "");
    setSelectedPermissions(getRolePermissionsMap(currentRole));
  };

  const handleSavePermissions = async () => {
    const role = roles.find((item) => item.name === selectedRole);
    if (!role) return;

    try {
      setSaving(true);
      await fetch(`${apiBase}/api/superadmin/role-settings/permissions`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleId: role.id,
          permissions: buildPermissionPayload(selectedPermissions, role),
        }),
      });

      const refreshed = await fetch(`${apiBase}/api/superadmin/role-settings`, {
        credentials: "include",
      });
      const payload = await refreshed.json().catch(() => ({}));
      if (!refreshed.ok) {
        throw new Error(payload.message || "Failed to refresh roles");
      }

      setRoles(payload.roles || []);
      refreshSelectedRole(payload.roles || [], selectedRole);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;

    try {
      setSaving(true);
      const response = await fetch(`${apiBase}/api/superadmin/role-settings`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRoleName.trim(),
          permissions: buildPermissionPayload(newRolePermissions),
        }),
      });
      const createdRole = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(createdRole.message || "Failed to create role");
      }

      const nextRoles = [createdRole, ...roles];
      setRoles(nextRoles);
      setSelectedRole(createdRole.name);
      setSelectedPermissions(getRolePermissionsMap(createdRole));
      setNewRoleName("");
      setNewRolePermissions({});
      setShowAddRole(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SuperAdminLayout title={t("sa.roles_title")} subtitle={t("sa.roles_subtitle")}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border/50 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{t("sa.roles_roles")}</CardTitle>
            <Button size="sm" variant="outline" className="border-border/50 text-xs" onClick={() => setShowAddRole(true)}>
              <Plus size={12} className="mr-1" />
              {t("sa.roles_new")}
            </Button>
          </CardHeader>
          <CardContent className="space-y-1 p-4 pt-0">
            {(roles || []).map((role) => (
              <button
                key={role.id || role.name}
                onClick={() => setSelectedRole(role.name)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedRole === role.name ? "bg-primary/10 text-primary border-glow" : "text-muted-foreground hover:bg-secondary"}`}
              >
                {role.name}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">{t("sa.roles_permissions")} - {selectedRole}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">{t("sa.roles_module")}</th>
                    {permissions.map((permission) => (
                      <th key={permission.id || permission.name} className="text-center py-3 px-2 text-muted-foreground font-medium">
                        {permission.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modules.map((moduleItem) => (
                    <tr key={moduleItem.id || moduleItem.name} className="border-b border-border/50">
                      <td className="py-3 px-2 font-medium">{moduleItem.name}</td>
                      {permissions.map((permission) => {
                        const perms = selectedPermissions[moduleItem.name] || [];
                        const checked = perms.includes(permission.name);

                        return (
                          <td key={permission.id || permission.name} className="text-center py-3 px-2">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => togglePermission("current", moduleItem.name, permission.name)}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button className="mt-6" disabled={!selectedRole || saving || loading} onClick={handleSavePermissions}>
              {t("sa.roles_save")}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddRole} onOpenChange={setShowAddRole}>
        <DialogContent className="bg-card border-border/50 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("sa.roles_create_title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("sa.roles_role_name")}</Label>
              <Input
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="mt-1 bg-secondary border-border/50"
                placeholder={t("sa.roles_name_placeholder")}
              />
            </div>
            <div>
              <Label className="mb-3 block">{t("sa.roles_default_perms")}</Label>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">{t("sa.roles_module")}</th>
                      {permissions.map((permission) => (
                        <th key={permission.id || permission.name} className="text-center py-2 px-2 text-muted-foreground font-medium text-xs">
                          {permission.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map((moduleItem) => (
                      <tr key={moduleItem.id || moduleItem.name} className="border-b border-border/50">
                        <td className="py-2 px-2 font-medium text-xs">{moduleItem.name}</td>
                        {permissions.map((permission) => {
                          const checked = (newRolePermissions[moduleItem.name] || []).includes(permission.name);

                          return (
                            <td key={permission.id || permission.name} className="text-center py-2 px-2">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => togglePermission("new", moduleItem.name, permission.name)}
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
            <Button variant="outline" onClick={() => setShowAddRole(false)}>
              {t("sa.roles_cancel")}
            </Button>
            <Button onClick={handleCreateRole} disabled={saving || !newRoleName.trim()}>
              {t("sa.roles_create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
}
