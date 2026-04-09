"use client";

import { useEffect, useMemo, useState } from "react";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Search, Link2, Unlink, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { get, patch, post } from "@/lib/api";

const EMPTY_STATS = {
  total: 0,
  assigned: 0,
  unassigned: 0,
  active: 0,
};

const NFCCardsPage = () => {
  const [cards, setCards] = useState([]);
  const [tags, setTags] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [assignModal, setAssignModal] = useState(null);
  const [selectedTagId, setSelectedTagId] = useState("");
  const [unassignModal, setUnassignModal] = useState(null);

  const availableTags = useMemo(() => tags.filter((tag) => tag.status === "NEW"), [tags]);

  const loadCards = async () => {
    const response = await get("/api/superadmin/nfc-cards", {
      filter,
      search,
      page: 1,
      limit: 100,
    });
    return Array.isArray(response?.data) ? response.data : [];
  };

  const loadStats = async () => {
    const response = await get("/api/superadmin/nfc-cards/stats");
    return response?.data || EMPTY_STATS;
  };

  const loadTags = async () => {
    const response = await get("/api/superadmin/nfc-tags", {
      status: "NEW",
      page: 1,
      limit: 100,
    });
    return Array.isArray(response?.data) ? response.data : [];
  };

  const refreshData = async () => {
    const [nextCards, nextStats, nextTags] = await Promise.all([loadCards(), loadStats(), loadTags()]);
    setCards(nextCards);
    setStats(nextStats);
    setTags(nextTags);
  };

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      try {
        setLoading(true);
        const [nextCards, nextStats, nextTags] = await Promise.all([loadCards(), loadStats(), loadTags()]);
        if (cancelled) return;
        setCards(nextCards);
        setStats(nextStats);
        setTags(nextTags);
      } catch (error) {
        if (!cancelled) {
          toast({
            title: "NFC Cards",
            description: error?.message || error?.error || "Unable to load NFC cards.",
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
  }, [filter, search]);

  const handleAssign = async () => {
    if (!assignModal || !selectedTagId) return;

    try {
      setSubmitting(true);
      await post("/api/superadmin/nfc-cards/assign", {
        cardId: assignModal.id,
        tagId: Number(selectedTagId),
      });
      await refreshData();
      toast({
        title: "NFC Cards",
        description: "Tag assigned successfully.",
      });
      setAssignModal(null);
      setSelectedTagId("");
    } catch (error) {
      toast({
        title: "NFC Cards",
        description: error?.message || error?.error || "Unable to assign tag.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassign = async () => {
    if (!unassignModal) return;

    try {
      setSubmitting(true);
      await patch(`/api/superadmin/nfc-cards/${unassignModal.id}/unassign`);
      await refreshData();
      toast({
        title: "NFC Cards",
        description: "Tag unassigned successfully.",
      });
      setUnassignModal(null);
    } catch (error) {
      toast({
        title: "NFC Cards",
        description: error?.message || error?.error || "Unable to unassign tag.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SuperAdminLayout title="NFC Cards" subtitle="Manage digital cards and tag assignments">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by UID, user, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cards</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Cards", value: stats.total, color: "text-foreground" },
            { label: "Assigned", value: stats.assigned, color: "text-yellow-500" },
            { label: "Unassigned", value: stats.unassigned, color: "text-red-500" },
            { label: "Active", value: stats.active, color: "text-green-500" },
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
                <TableHead>UID</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="hidden lg:table-cell">Design</TableHead>
                <TableHead className="hidden lg:table-cell">Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>NFC Tag</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    <Loader2 size={18} className="mx-auto mb-2 animate-spin" />
                    Loading cards...
                  </TableCell>
                </TableRow>
              ) : cards.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    No cards found
                  </TableCell>
                </TableRow>
              ) : (
                cards.map((card) => (
                  <TableRow key={card.id}>
                    <TableCell className="font-mono text-xs">{card.uid}</TableCell>
                    <TableCell className="font-medium">{card.userName}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{card.locationName}</TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">{card.designName}</TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">{card.productName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${card.active ? "bg-green-500" : "bg-red-500"}`} />
                        <span className="text-xs">{card.active ? "Active" : "Inactive"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {card.tagSerial ? (
                        <Badge variant="secondary" className="font-mono text-[10px]">
                          {card.tagSerial}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-red-500/30 text-[10px] text-red-500">
                          Unassigned
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!card.tagId ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setAssignModal(card);
                              setSelectedTagId("");
                            }}
                            className="gap-1 text-xs"
                          >
                            <Link2 size={14} /> Assign
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setUnassignModal(card)}
                            className="gap-1 text-xs text-destructive hover:text-destructive"
                          >
                            <Unlink size={14} /> Unassign
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          title="View payload"
                          onClick={() => window.open(card.payload, "_blank", "noopener,noreferrer")}
                        >
                          <ExternalLink size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!assignModal} onOpenChange={() => {
        setAssignModal(null);
        setSelectedTagId("");
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign NFC Tag</DialogTitle>
            <DialogDescription>
              Select an available NFC tag to assign to card <span className="font-mono font-bold">{assignModal?.uid}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="mb-1 text-sm text-muted-foreground">Card Owner</p>
              <p className="font-medium">{assignModal?.userName} - {assignModal?.locationName}</p>
            </div>
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Available Tags ({availableTags.length})</p>
              {availableTags.length > 0 ? (
                <Select value={selectedTagId} onValueChange={setSelectedTagId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tag..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags.map((tag) => (
                      <SelectItem key={tag.id} value={String(tag.id)}>
                        <span className="font-mono">{tag.tagSerial}</span>
                        <span className="ml-2 text-xs text-muted-foreground">Added {tag.createdAt}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-destructive">No available tags. Add new tags first.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignModal(null)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={!selectedTagId || submitting}>Assign Tag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!unassignModal} onOpenChange={() => setUnassignModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unassign NFC Tag</DialogTitle>
            <DialogDescription>
              Remove the NFC tag from card <span className="font-mono font-bold">{unassignModal?.uid}</span>? The tag will be returned to available inventory.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnassignModal(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleUnassign} disabled={submitting}>Unassign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default NFCCardsPage;
