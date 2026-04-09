"use client";

import { useEffect, useState } from "react";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Search, Plus, Cpu, CheckCircle2, AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { get, patch, post } from "@/lib/api";

const STATUS_CONFIG = {
  NEW: { label: "New", color: "bg-green-500/10 text-green-500 border-green-500/30", dot: "bg-green-500" },
  ASSIGNED: { label: "Assigned", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30", dot: "bg-yellow-500" },
  PROGRAMMED: { label: "Programmed", color: "bg-blue-500/10 text-blue-500 border-blue-500/30", dot: "bg-blue-500" },
  DEFECTIVE: { label: "Defective", color: "bg-red-500/10 text-red-500 border-red-500/30", dot: "bg-red-500" },
};

const EMPTY_STATS = {
  total: 0,
  NEW: 0,
  ASSIGNED: 0,
  PROGRAMMED: 0,
  DEFECTIVE: 0,
};

const NFCTagsPage = () => {
  const [tags, setTags] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [newSerial, setNewSerial] = useState("");
  const [bulkCount, setBulkCount] = useState(1);
  const [programModal, setProgramModal] = useState(null);
  const [defectModal, setDefectModal] = useState(null);

  const loadStats = async () => {
    const response = await get("/api/superadmin/nfc-tags/stats");
    return response?.data || EMPTY_STATS;
  };

  const loadTags = async () => {
    const response = await get("/api/superadmin/nfc-tags", {
      status: statusFilter,
      search,
      page: 1,
      limit: 100,
    });
    return Array.isArray(response?.data) ? response.data : [];
  };

  const refreshData = async () => {
    const [nextTags, nextStats] = await Promise.all([loadTags(), loadStats()]);
    setTags(nextTags);
    setStats(nextStats);
  };

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      try {
        setLoading(true);
        const [nextTags, nextStats] = await Promise.all([loadTags(), loadStats()]);
        if (cancelled) return;
        setTags(nextTags);
        setStats(nextStats);
      } catch (error) {
        if (!cancelled) {
          toast({
            title: "NFC Tags",
            description: error?.message || error?.error || "Unable to load NFC tags.",
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    boot();

    return () => {
      cancelled = true;
    };
  }, [search, statusFilter]);

  const handleAddTags = async () => {
    if (bulkCount === 1 && !newSerial.trim()) {
      toast({
        title: "Invalid serial",
        description: "Enter a tag serial number",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      if (bulkCount === 1) {
        await post("/api/superadmin/nfc-tags", { tagSerial: newSerial.trim() });
        toast({
          title: "Tag added",
          description: `Tag ${newSerial.trim()} added`,
        });
      } else {
        await post("/api/superadmin/nfc-tags", { count: bulkCount });
        toast({
          title: "Inventory updated",
          description: `${bulkCount} tags added to inventory`,
        });
      }

      await refreshData();
      setAddModal(false);
      setNewSerial("");
      setBulkCount(1);
    } catch (error) {
      toast({
        title: "NFC Tags",
        description: error?.message || error?.error || "Unable to create tags.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (tag, status) => {
    try {
      setSubmitting(true);
      await patch(`/api/superadmin/nfc-tags/${tag.id}/status`, { status });
      await refreshData();
      return true;
    } catch (error) {
      toast({
        title: "NFC Tags",
        description: error?.message || error?.error || "Unable to update tag status.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkProgrammed = async () => {
    if (!programModal) return;
    if (programModal.status !== "ASSIGNED") {
      toast({
        title: "Invalid status",
        description: "Only ASSIGNED tags can be marked as PROGRAMMED",
        variant: "destructive",
      });
      return;
    }

    const ok = await updateStatus(programModal, "PROGRAMMED");
    if (ok) {
      toast({
        title: "Tag programmed",
        description: `Tag ${programModal.tagSerial} marked as programmed`,
      });
      setProgramModal(null);
    }
  };

  const handleMarkDefective = async () => {
    if (!defectModal) return;
    const ok = await updateStatus(defectModal, "DEFECTIVE");
    if (ok) {
      toast({
        title: "Tag marked defective",
        description: `Tag ${defectModal.tagSerial} marked as defective`,
      });
      setDefectModal(null);
    }
  };

  return (
    <SuperAdminLayout
      title="NFC Tags Inventory"
      subtitle="Manage physical NFC tag hardware"
      headerAction={
        <Button onClick={() => setAddModal(true)} className="gap-2">
          <Plus size={16} /> Add Tags
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by serial number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="ASSIGNED">Assigned</SelectItem>
              <SelectItem value="PROGRAMMED">Programmed</SelectItem>
              <SelectItem value="DEFECTIVE">Defective</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {[
            { label: "Total", value: stats.total, color: "text-foreground" },
            { label: "New", value: stats.NEW, color: "text-green-500" },
            { label: "Assigned", value: stats.ASSIGNED, color: "text-yellow-500" },
            { label: "Programmed", value: stats.PROGRAMMED, color: "text-blue-500" },
            { label: "Defective", value: stats.DEFECTIVE, color: "text-red-500" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-border/50 bg-card p-4">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-border/50 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serial Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Linked Card</TableHead>
                <TableHead className="hidden sm:table-cell">Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    <Loader2 size={18} className="mx-auto mb-2 animate-spin" />
                    Loading tags...
                  </TableCell>
                </TableRow>
              ) : tags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    No tags found
                  </TableCell>
                </TableRow>
              ) : (
                tags.map((tag) => {
                  const cfg = STATUS_CONFIG[tag.status] || STATUS_CONFIG.NEW;
                  return (
                    <TableRow key={tag.id}>
                      <TableCell className="font-mono text-sm font-medium">{tag.tagSerial}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cfg.color}>
                          <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden font-mono text-xs text-muted-foreground sm:table-cell">
                        {tag.assignedCardId || tag.cardUid || "—"}
                      </TableCell>
                      <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                        {tag.createdAt}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {tag.status === "ASSIGNED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setProgramModal(tag)}
                              className="gap-1 text-xs"
                              disabled={submitting}
                            >
                              <Cpu size={14} /> Program
                            </Button>
                          )}
                          {tag.status !== "DEFECTIVE" && tag.status !== "PROGRAMMED" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDefectModal(tag)}
                              className="gap-1 text-xs text-destructive hover:text-destructive"
                              disabled={submitting}
                            >
                              <AlertTriangle size={14} /> Defective
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={addModal} onOpenChange={setAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add NFC Tags</DialogTitle>
            <DialogDescription>
              Add new NFC tags to inventory. Enter a serial manually or generate in bulk.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Mode</label>
              <Select value={bulkCount === 1 ? "single" : "bulk"} onValueChange={(value) => setBulkCount(value === "single" ? 1 : 10)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Tag</SelectItem>
                  <SelectItem value="bulk">Bulk Generate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {bulkCount === 1 ? (
              <div>
                <label className="mb-1.5 block text-sm font-medium">Tag Serial</label>
                <Input
                  placeholder="e.g. NFC-XXXX..."
                  value={newSerial}
                  onChange={(e) => setNewSerial(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <label className="mb-1.5 block text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  min={2}
                  max={100}
                  value={bulkCount}
                  onChange={(e) => setBulkCount(Math.max(2, Math.min(100, parseInt(e.target.value, 10) || 2)))}
                />
                <p className="mt-1 text-xs text-muted-foreground">Serials will be auto-generated</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddTags} disabled={submitting}>
              {bulkCount === 1 ? "Add Tag" : `Generate ${bulkCount} Tags`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!programModal} onOpenChange={() => setProgramModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Programmed</DialogTitle>
            <DialogDescription>
              Confirm that tag <span className="font-mono font-bold">{programModal?.tagSerial}</span> has been encoded with NFC data?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProgramModal(null)}>Cancel</Button>
            <Button onClick={handleMarkProgrammed} className="gap-1" disabled={submitting}>
              <CheckCircle2 size={16} /> Confirm Programmed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!defectModal} onOpenChange={() => setDefectModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Defective</DialogTitle>
            <DialogDescription>
              Mark tag <span className="font-mono font-bold">{defectModal?.tagSerial}</span> as defective? This will remove any card assignment.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDefectModal(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleMarkDefective} className="gap-1" disabled={submitting}>
              <Trash2 size={16} /> Mark Defective
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default NFCTagsPage;
