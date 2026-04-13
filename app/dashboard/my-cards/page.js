"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Search, MapPin, MapPinOff } from "lucide-react";

// ─── Static data ──────────────────────────────────────────────

const MOCK_LOCATIONS = [
  { id: 1, name: "Main Restaurant" },
  { id: 2, name: "Bar & Lounge" },
  { id: 3, name: "Terrace" },
  { id: 4, name: "Private Dining" },
];

const INITIAL_CARDS = [
  {
    id: 1,
    uid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    design: "Classic Dark",
    product: "NFC Business Card",
    tagSerial: "NFC-2024-001",
    status: "ACTIVE",
    locationId: 1,
    locationName: "Main Restaurant",
  },
  {
    id: 2,
    uid: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    design: "Premium White",
    product: "NFC Business Card",
    tagSerial: "NFC-2024-002",
    status: "DELIVERED",
    locationId: null,
    locationName: null,
  },
  {
    id: 3,
    uid: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    design: "Classic Dark",
    product: "NFC Review Stand",
    tagSerial: null,
    status: "NOT_PROGRAMMED",
    locationId: null,
    locationName: null,
  },
  {
    id: 4,
    uid: "d4e5f6a7-b8c9-0123-defa-234567890123",
    design: "Rose Gold",
    product: "NFC Business Card",
    tagSerial: "NFC-2024-003",
    status: "ACTIVE",
    locationId: 2,
    locationName: "Bar & Lounge",
  },
  {
    id: 5,
    uid: "e5f6a7b8-c9d0-1234-efab-345678901234",
    design: "Midnight Blue",
    product: "NFC Table Stand",
    tagSerial: "NFC-2024-004",
    status: "SHIPPED",
    locationId: null,
    locationName: null,
  },
];

const STATUS_CONFIG = {
  NOT_PROGRAMMED: { label: "Not Programmed", color: "bg-orange-500/10 text-orange-500 border-orange-500/30", dot: "bg-orange-500" },
  PRINTED:        { label: "Printed",         color: "bg-blue-500/10 text-blue-500 border-blue-500/30",     dot: "bg-blue-500" },
  SHIPPED:        { label: "Shipped",          color: "bg-purple-500/10 text-purple-500 border-purple-500/30", dot: "bg-purple-500" },
  DELIVERED:      { label: "Delivered",        color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30", dot: "bg-yellow-500" },
  ACTIVE:         { label: "Active",           color: "bg-green-500/10 text-green-500 border-green-500/30",  dot: "bg-green-500" },
  DISABLED:       { label: "Disabled",         color: "bg-red-500/10 text-red-500 border-red-500/30",       dot: "bg-red-500" },
};

// ─── Page ─────────────────────────────────────────────────────

const MyCardsPage = () => {
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Assign modal
  const [assignModal, setAssignModal] = useState(null); // card object
  const [selectedLocationId, setSelectedLocationId] = useState("");

  // Unassign modal
  const [unassignModal, setUnassignModal] = useState(null); // card object

  // ── Stats ──────────────────────────────────────────────────
  const total      = cards.length;
  const active     = cards.filter((c) => c.status === "ACTIVE").length;
  const assigned   = cards.filter((c) => c.locationId !== null).length;
  const unassigned = cards.filter((c) => c.locationId === null).length;

  // ── Filtered list ──────────────────────────────────────────
  const filtered = cards.filter((card) => {
    const matchSearch =
      !search ||
      card.uid.toLowerCase().includes(search.toLowerCase()) ||
      card.design.toLowerCase().includes(search.toLowerCase()) ||
      card.product.toLowerCase().includes(search.toLowerCase()) ||
      (card.tagSerial || "").toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "assigned"   && card.locationId !== null) ||
      (statusFilter === "unassigned" && card.locationId === null) ||
      card.status === statusFilter;

    return matchSearch && matchStatus;
  });

  // ── Handlers ───────────────────────────────────────────────
  const handleAssignLocation = () => {
    if (!assignModal || !selectedLocationId) return;
    const loc = MOCK_LOCATIONS.find((l) => l.id === Number(selectedLocationId));
    setCards((prev) =>
      prev.map((c) =>
        c.id === assignModal.id
          ? { ...c, locationId: loc.id, locationName: loc.name }
          : c
      )
    );
    setAssignModal(null);
    setSelectedLocationId("");
  };

  const handleUnassignLocation = () => {
    if (!unassignModal) return;
    setCards((prev) =>
      prev.map((c) =>
        c.id === unassignModal.id
          ? { ...c, locationId: null, locationName: null }
          : c
      )
    );
    setUnassignModal(null);
  };

  const availableLocations = MOCK_LOCATIONS.filter(
    (loc) => assignModal && loc.id !== assignModal.locationId
  );

  return (
    <DashboardLayout title="My Cards" subtitle="Manage your NFC cards and location assignments">
      <div className="space-y-6">

        {/* ── Filters ── */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by UID, design, product, tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cards</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="SHIPPED">Shipped</SelectItem>
              <SelectItem value="NOT_PROGRAMMED">Not Programmed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Cards", value: total,     color: "text-foreground" },
            { label: "Active",      value: active,    color: "text-green-500" },
            { label: "Assigned",    value: assigned,  color: "text-yellow-500" },
            { label: "Unassigned",  value: unassigned,color: "text-red-500" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-border/50 bg-card p-4">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* ── Table ── */}
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>UID</TableHead>
                <TableHead className="hidden md:table-cell">Design</TableHead>
                <TableHead className="hidden lg:table-cell">Product</TableHead>
                <TableHead>NFC Tag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    No cards found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((card) => {
                  const cfg = STATUS_CONFIG[card.status] || STATUS_CONFIG.NOT_PROGRAMMED;
                  return (
                    <TableRow key={card.id}>
                      {/* UID */}
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">
                          {card.uid.slice(0, 8)}…
                        </span>
                        {card.locationName && (
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                            <MapPin size={10} /> {card.locationName}
                          </p>
                        )}
                      </TableCell>

                      {/* Design */}
                      <TableCell className="hidden text-sm md:table-cell">
                        {card.design}
                      </TableCell>

                      {/* Product */}
                      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                        {card.product}
                      </TableCell>

                      {/* NFC Tag */}
                      <TableCell>
                        {card.tagSerial ? (
                          <Badge variant="secondary" className="font-mono text-[10px]">
                            {card.tagSerial}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-red-500/30 text-[10px] text-red-500">
                            No tag
                          </Badge>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge variant="outline" className={cfg.color}>
                          <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {card.locationId ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setUnassignModal(card)}
                              className="gap-1 text-xs text-destructive hover:text-destructive"
                            >
                              <MapPinOff size={14} /> Unassign location
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => { setAssignModal(card); setSelectedLocationId(""); }}
                              className="gap-1 text-xs"
                            >
                              <MapPin size={14} /> Assign location
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

      {/* ── Assign location modal ── */}
      <Dialog open={!!assignModal} onOpenChange={(open) => { if (!open) { setAssignModal(null); setSelectedLocationId(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign a location to your card</DialogTitle>
            <DialogDescription>
              Card <span className="font-mono font-semibold">{assignModal?.uid?.slice(0, 8)}…</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Available Locations ({availableLocations.length})
            </p>
            {availableLocations.length > 0 ? (
              <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {availableLocations.map((loc) => (
                    <SelectItem key={loc.id} value={String(loc.id)}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-destructive">No locations available.</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setAssignModal(null); setSelectedLocationId(""); }}>
              Cancel
            </Button>
            <Button
              disabled={!selectedLocationId}
              onClick={handleAssignLocation}
            >
              <MapPin size={14} className="mr-2" /> Assign location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Unassign location modal ── */}
      <Dialog open={!!unassignModal} onOpenChange={(open) => { if (!open) setUnassignModal(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unassign location</DialogTitle>
            <DialogDescription>
              Remove <span className="font-semibold">{unassignModal?.locationName}</span> from card{" "}
              <span className="font-mono font-semibold">{unassignModal?.uid?.slice(0, 8)}…</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnassignModal(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleUnassignLocation}>
              <MapPinOff size={14} className="mr-2" /> Unassign location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MyCardsPage;
