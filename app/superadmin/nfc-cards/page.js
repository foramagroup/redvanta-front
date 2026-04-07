"use client";

import { useState, useMemo } from "react";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Search, Link2, Unlink, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const MOCK_TAGS = [
  { id: "tag-1", tagSerial: "NFC-A1B2C3D4", status: "NEW", createdAt: "2026-03-20" },
  { id: "tag-2", tagSerial: "NFC-E5F6G7H8", status: "NEW", createdAt: "2026-03-21" },
  { id: "tag-3", tagSerial: "NFC-I9J0K1L2", status: "NEW", createdAt: "2026-03-22" },
  { id: "tag-4", tagSerial: "NFC-M3N4O5P6", status: "ASSIGNED", createdAt: "2026-03-18", assignedCardId: "card-1" },
  { id: "tag-5", tagSerial: "NFC-Q7R8S9T0", status: "PROGRAMMED", createdAt: "2026-03-15", assignedCardId: "card-2" },
  { id: "tag-6", tagSerial: "NFC-U1V2W3X4", status: "DEFECTIVE", createdAt: "2026-03-10" },
  { id: "tag-7", tagSerial: "NFC-Y5Z6A7B8", status: "NEW", createdAt: "2026-03-25" },
];

const MOCK_CARDS = [
  { id: "card-1", uid: "rv-card-001", userId: "u1", userName: "Bella's Kitchen", locationId: "l1", locationName: "Downtown", designId: "d1", designName: "Minimal Dark", productId: "p1", productName: "Classic NFC Card", tagId: "tag-4", payload: "https://review.redvanta.com/rv-card-001", active: true, createdAt: "2026-03-15" },
  { id: "card-2", uid: "rv-card-002", userId: "u2", userName: "Mario's Pizza", locationId: "l2", locationName: "Main St", designId: "d2", designName: "Bold Red", productId: "p2", productName: "Premium NFC Card", tagId: "tag-5", payload: "https://review.redvanta.com/rv-card-002", active: true, createdAt: "2026-03-16" },
  { id: "card-3", uid: "rv-card-003", userId: "u3", userName: "Zen Spa", locationId: "l3", locationName: "Uptown", designId: "d3", designName: "Corporate", productId: "p1", productName: "Classic NFC Card", tagId: null, payload: "https://review.redvanta.com/rv-card-003", active: true, createdAt: "2026-03-18" },
  { id: "card-4", uid: "rv-card-004", userId: "u1", userName: "Bella's Kitchen", locationId: "l4", locationName: "Airport", designId: "d1", designName: "Minimal Dark", productId: "p3", productName: "Metal NFC Card", tagId: null, payload: "https://review.redvanta.com/rv-card-004", active: false, createdAt: "2026-03-20" },
  { id: "card-5", uid: "rv-card-005", userId: "u4", userName: "Cloud Café", locationId: "l5", locationName: "Tech Park", designId: "d4", designName: "Light", productId: "p2", productName: "Premium NFC Card", tagId: null, payload: "https://review.redvanta.com/rv-card-005", active: true, createdAt: "2026-03-22" },
];

const NFCCardsPage = () => {
  const [cards, setCards] = useState(MOCK_CARDS);
  const [tags, setTags] = useState(MOCK_TAGS);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [assignModal, setAssignModal] = useState(null);
  const [selectedTagId, setSelectedTagId] = useState("");
  const [unassignModal, setUnassignModal] = useState(null);

  const availableTags = useMemo(() => tags.filter(t => t.status === "NEW"), [tags]);

  const filtered = useMemo(() => {
    let list = cards;
    if (filter === "assigned") list = list.filter(c => c.tagId);
    if (filter === "unassigned") list = list.filter(c => !c.tagId);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.uid.toLowerCase().includes(q) ||
        c.userName.toLowerCase().includes(q) ||
        c.locationName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [cards, filter, search]);

  const getLinkedTag = (tagId) => tags.find((t) => t.id === tagId);

  const handleAssign = () => {
    if (!assignModal || !selectedTagId) return;
    const tag = tags.find(t => t.id === selectedTagId);
    if (!tag || tag.status !== "NEW") {
      toast.error("Tag is not available for assignment");
      return;
    }
    setCards(prev => prev.map(c => c.id === assignModal.id ? { ...c, tagId: selectedTagId } : c));
    setTags(prev => prev.map(t => t.id === selectedTagId ? { ...t, status: "ASSIGNED", assignedCardId: assignModal.id } : t));
    toast.success(`Tag ${tag.tagSerial} assigned to ${assignModal.uid}`);
    setAssignModal(null);
    setSelectedTagId("");
  };

  const handleUnassign = () => {
    if (!unassignModal || !unassignModal.tagId) return;
    const tagId = unassignModal.tagId;
    setCards(prev => prev.map(c => c.id === unassignModal.id ? { ...c, tagId: null } : c));
    setTags(prev => prev.map(t => t.id === tagId ? { ...t, status: "NEW", assignedCardId: null } : t));
    toast.success("Tag unassigned successfully");
    setUnassignModal(null);
  };

  return (
    <SuperAdminLayout title="NFC Cards" subtitle="Manage digital cards and tag assignments">
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by UID, user, location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
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

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Cards", value: cards.length, color: "text-foreground" },
            { label: "Assigned", value: cards.filter(c => c.tagId).length, color: "text-yellow-500" },
            { label: "Unassigned", value: cards.filter(c => !c.tagId).length, color: "text-red-500" },
            { label: "Active", value: cards.filter(c => c.active).length, color: "text-green-500" },
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
              {filtered.map(card => {
                const linkedTag = getLinkedTag(card.tagId);
                return (
                  <TableRow key={card.id}>
                    <TableCell className="font-mono text-xs">{card.uid}</TableCell>
                    <TableCell className="font-medium">{card.userName}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{card.locationName}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">{card.designName}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">{card.productName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${card.active ? "bg-green-500" : "bg-red-500"}`} />
                        <span className="text-xs">{card.active ? "Active" : "Inactive"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {linkedTag ? (
                        <Badge variant="secondary" className="font-mono text-[10px]">
                          {linkedTag.tagSerial}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-500 border-red-500/30 text-[10px]">
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
                            onClick={() => { setAssignModal(card); setSelectedTagId(""); }}
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
                        <Button size="icon" variant="ghost" className="h-8 w-8" title="View payload">
                          <ExternalLink size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    No cards found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Assign Modal */}
      <Dialog open={!!assignModal} onOpenChange={() => { setAssignModal(null); setSelectedTagId(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign NFC Tag</DialogTitle>
            <DialogDescription>
              Select an available NFC tag to assign to card <span className="font-mono font-bold">{assignModal?.uid}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Card Owner</p>
              <p className="font-medium">{assignModal?.userName} — {assignModal?.locationName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Available Tags ({availableTags.length})</p>
              {availableTags.length > 0 ? (
                <Select value={selectedTagId} onValueChange={setSelectedTagId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tag..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags.map(tag => (
                      <SelectItem key={tag.id} value={tag.id}>
                        <span className="font-mono">{tag.tagSerial}</span>
                        <span className="text-muted-foreground ml-2 text-xs">Added {tag.createdAt}</span>
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
            <Button onClick={handleAssign} disabled={!selectedTagId}>Assign Tag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unassign Confirmation */}
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
            <Button variant="destructive" onClick={handleUnassign}>Unassign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};


export default NFCCardsPage;
