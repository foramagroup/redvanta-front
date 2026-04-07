"use client";

import { useState, useMemo } from "react";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Search, Plus, Cpu, CheckCircle2, AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const INITIAL_TAGS = [
  { id: "tag-1", tagSerial: "NFC-A1B2C3D4", status: "NEW", createdAt: "2026-03-20" },
  { id: "tag-2", tagSerial: "NFC-E5F6G7H8", status: "NEW", createdAt: "2026-03-21" },
  { id: "tag-3", tagSerial: "NFC-I9J0K1L2", status: "NEW", createdAt: "2026-03-22" },
  { id: "tag-4", tagSerial: "NFC-M3N4O5P6", status: "ASSIGNED", createdAt: "2026-03-18", assignedCardId: "card-1" },
  { id: "tag-5", tagSerial: "NFC-Q7R8S9T0", status: "PROGRAMMED", createdAt: "2026-03-15", assignedCardId: "card-2" },
  { id: "tag-6", tagSerial: "NFC-U1V2W3X4", status: "DEFECTIVE", createdAt: "2026-03-10" },
  { id: "tag-7", tagSerial: "NFC-Y5Z6A7B8", status: "NEW", createdAt: "2026-03-25" },
  { id: "tag-8", tagSerial: "NFC-C9D0E1F2", status: "NEW", createdAt: "2026-03-26" },
  { id: "tag-9", tagSerial: "NFC-G3H4I5J6", status: "PROGRAMMED", createdAt: "2026-03-12", assignedCardId: "card-3" },
  { id: "tag-10", tagSerial: "NFC-K7L8M9N0", status: "ASSIGNED", createdAt: "2026-03-19", assignedCardId: "card-5" },
];

const STATUS_CONFIG = {
  NEW: { label: "New", color: "bg-green-500/10 text-green-500 border-green-500/30", dot: "bg-green-500" },
  ASSIGNED: { label: "Assigned", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30", dot: "bg-yellow-500" },
  PROGRAMMED: { label: "Programmed", color: "bg-blue-500/10 text-blue-500 border-blue-500/30", dot: "bg-blue-500" },
  DEFECTIVE: { label: "Defective", color: "bg-red-500/10 text-red-500 border-red-500/30", dot: "bg-red-500" },
};

const NFCTagsPage = () => {
  const [tags, setTags] = useState(INITIAL_TAGS);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [newSerial, setNewSerial] = useState("");
  const [bulkCount, setBulkCount] = useState(1);
  const [programModal, setProgramModal] = useState(null);
  const [defectModal, setDefectModal] = useState(null);

  const filtered = useMemo(() => {
    let list = tags;
    if (statusFilter !== "all") list = list.filter(t => t.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t => t.tagSerial.toLowerCase().includes(q));
    }
    return list;
  }, [tags, statusFilter, search]);

  const stats = useMemo(() => ({
    total: tags.length,
    new: tags.filter(t => t.status === "NEW").length,
    assigned: tags.filter(t => t.status === "ASSIGNED").length,
    programmed: tags.filter(t => t.status === "PROGRAMMED").length,
    defective: tags.filter(t => t.status === "DEFECTIVE").length,
  }), [tags]);

  const handleAddTags = () => {
    if (bulkCount === 1 && !newSerial.trim()) {
      toast({
        title: "Invalid serial",
        description: "Enter a tag serial number",
        variant: "destructive",
      });
      return;
    }
    const existing = new Set(tags.map(t => t.tagSerial));
    if (bulkCount === 1) {
      if (existing.has(newSerial.trim())) {
        toast({
          title: "Duplicate serial",
          description: "Serial number already exists",
          variant: "destructive",
        });
        return;
      }
      setTags(prev => [...prev, {
        id: `tag-${Date.now()}`,
        tagSerial: newSerial.trim(),
        status: "NEW",
        createdAt: new Date().toISOString().split("T")[0],
      }]);
      toast({
        title: "Tag added",
        description: `Tag ${newSerial.trim()} added`,
      });
    } else {
      const newTags = [];
      for (let i = 0; i < bulkCount; i++) {
        const serial = `NFC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        if (!existing.has(serial)) {
          newTags.push({
            id: `tag-${Date.now()}-${i}`,
            tagSerial: serial,
            status: "NEW",
            createdAt: new Date().toISOString().split("T")[0],
          });
          existing.add(serial);
        }
      }
      setTags(prev => [...prev, ...newTags]);
      toast({
        title: "Inventory updated",
        description: `${newTags.length} tags added to inventory`,
      });
    }
    setAddModal(false);
    setNewSerial("");
    setBulkCount(1);
  };

  const handleMarkProgrammed = () => {
    if (!programModal) return;
    if (programModal.status !== "ASSIGNED") {
      toast({
        title: "Invalid status",
        description: "Only ASSIGNED tags can be marked as PROGRAMMED",
        variant: "destructive",
      });
      return;
    }
    setTags(prev => prev.map(t => t.id === programModal.id ? { ...t, status: "PROGRAMMED" } : t));
    toast({
      title: "Tag programmed",
      description: `Tag ${programModal.tagSerial} marked as programmed`,
    });
    setProgramModal(null);
  };

  const handleMarkDefective = () => {
    if (!defectModal) return;
    setTags(prev => prev.map(t => t.id === defectModal.id ? { ...t, status: "DEFECTIVE", assignedCardId: null } : t));
    toast({
      title: "Tag marked defective",
      description: `Tag ${defectModal.tagSerial} marked as defective`,
    });
    setDefectModal(null);
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
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by serial number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
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

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: "Total", value: stats.total, color: "text-foreground" },
            { label: "New", value: stats.new, color: "text-green-500" },
            { label: "Assigned", value: stats.assigned, color: "text-yellow-500" },
            { label: "Programmed", value: stats.programmed, color: "text-blue-500" },
            { label: "Defective", value: stats.defective, color: "text-red-500" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-border/50 bg-card p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
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
              {filtered.map(tag => {
                const cfg = STATUS_CONFIG[tag.status];
                return (
                  <TableRow key={tag.id}>
                    <TableCell className="font-mono text-sm font-medium">{tag.tagSerial}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cfg.color}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1.5`} />
                        {cfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-xs font-mono">
                      {tag.assignedCardId || "—"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-xs">
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
                          >
                            <AlertTriangle size={14} /> Defective
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    No tags found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Tags Modal */}
      <Dialog open={addModal} onOpenChange={setAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add NFC Tags</DialogTitle>
            <DialogDescription>Add new NFC tags to inventory. Enter a serial manually or generate in bulk.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Mode</label>
              <Select value={bulkCount === 1 ? "single" : "bulk"} onValueChange={v => setBulkCount(v === "single" ? 1 : 10)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Tag</SelectItem>
                  <SelectItem value="bulk">Bulk Generate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {bulkCount === 1 ? (
              <div>
                <label className="text-sm font-medium mb-1.5 block">Tag Serial</label>
                <Input
                  placeholder="e.g. NFC-XXXX..."
                  value={newSerial}
                  onChange={e => setNewSerial(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium mb-1.5 block">Quantity</label>
                <Input
                  type="number"
                  min={2}
                  max={100}
                  value={bulkCount}
                  onChange={e => setBulkCount(Math.max(2, Math.min(100, parseInt(e.target.value) || 2)))}
                />
                <p className="text-xs text-muted-foreground mt-1">Serials will be auto-generated</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddTags}>
              {bulkCount === 1 ? "Add Tag" : `Generate ${bulkCount} Tags`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark Programmed Modal */}
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
            <Button onClick={handleMarkProgrammed} className="gap-1">
              <CheckCircle2 size={16} /> Confirm Programmed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark Defective Modal */}
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
            <Button variant="destructive" onClick={handleMarkDefective} className="gap-1">
              <Trash2 size={16} /> Mark Defective
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default NFCTagsPage;
