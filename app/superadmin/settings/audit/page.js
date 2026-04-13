"use client";

import { useEffect, useState } from "react";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const pageSize = 20;

const formatDate = (value) => {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
};

const AuditLogs = () => {
  const { t } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadLogs = async (nextPage = page) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${apiBase}/superadmin/audit-log-settings?page=${nextPage}&pageSize=${pageSize}`, {
        credentials: "include",
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to load audit logs");
      }

      setLogs(Array.isArray(payload?.data) ? payload.data : []);
      setTotal(Number(payload?.total || 0));
      setPage(Number(payload?.page || nextPage));
    } catch (err) {
      setError(err.message || "Failed to load audit logs");
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(1);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <SuperAdminLayout title={t("sa.audit_title")} subtitle={t("sa.audit_subtitle")}>
      {error ? (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
          {error}
        </div>
      ) : null}

      <Card className="bg-card border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>{t("sa.audit_timestamp")}</TableHead><TableHead>{t("sa.audit_admin")}</TableHead><TableHead>{t("sa.audit_action")}</TableHead>
                <TableHead>{t("sa.audit_target")}</TableHead><TableHead className="hidden lg:table-cell">{t("sa.audit_metadata")}</TableHead><TableHead className="hidden md:table-cell">{t("sa.audit_ip")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-border/50">
                  <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">Loading audit logs...</TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow className="border-border/50">
                  <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">No audit logs found.</TableCell>
                </TableRow>
              ) : logs.map((log) => (
                <TableRow key={log.id} className="border-border/50">
                  <TableCell className="font-mono text-xs">{formatDate(log.createdAt)}</TableCell>
                  <TableCell>{log.admin?.name || log.admin?.email || "-"}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell className="font-medium">{log.target || "-"}</TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{log.metadata || "-"}</TableCell>
                  <TableCell className="hidden md:table-cell font-mono text-xs">{log.ip || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>Page {page} / {totalPages}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={loading || page <= 1} onClick={() => loadLogs(page - 1)}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={loading || page >= totalPages} onClick={() => loadLogs(page + 1)}>
            Next
          </Button>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default AuditLogs;
