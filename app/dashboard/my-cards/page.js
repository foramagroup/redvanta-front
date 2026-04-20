"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Search, MapPin, MapPinOff, Loader2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { get, patch } from "@/lib/api";

const STATUS_CONFIG = {
  NOT_PROGRAMMED: { label: "Not Programmed", color: "bg-orange-500/10 text-orange-500 border-orange-500/30", dot: "bg-orange-500" },
  PRINTED: { label: "Printed", color: "bg-blue-500/10 text-blue-500 border-blue-500/30", dot: "bg-blue-500" },
  SHIPPED: { label: "Shipped", color: "bg-purple-500/10 text-purple-500 border-purple-500/30", dot: "bg-purple-500" },
  DELIVERED: { label: "Delivered", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30", dot: "bg-yellow-500" },
  ACTIVE: { label: "Active", color: "bg-green-500/10 text-green-500 border-green-500/30", dot: "bg-green-500" },
  DISABLED: { label: "Disabled", color: "bg-red-500/10 text-red-500 border-red-500/30", dot: "bg-red-500" },
};

const MyCardsPage = () => {
  const [cards, setCards] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, assigned: 0, unassigned: 0 });
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [assignModal, setAssignModal] = useState(null);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [unassignModal, setUnassignModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const params = { status: statusFilter };
      if (search) params.search = search;

      const cardsResponse = await get("/admin/nfc-cards", params);

      if (cardsResponse.success) {
        setCards(cardsResponse.data.cards);
        setStats(cardsResponse.data.stats);
      }
    } catch (error) {
      console.error("Error loading cards:", error);
      toast({
        title: "Error",
        description: "Failed to load NFC cards",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ NOUVELLE FONCTION - Charger les locations quand on ouvre le modal
  const loadLocations = async () => {
    try {
      setLoadingLocations(true);
      const response = await get("/admin/nfc-cards/locations/available");

      if (response.success) {
        setLocations(response.data.locations || []);
      }
    } catch (error) {
      console.error("Error loading locations:", error);
      toast({
        title: "Error",
        description: "Failed to load locations",
        variant: "destructive"
      });
      setLocations([]);
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleSearch = () => {
    loadData();
  };

  // ✅ MODIFIÉ - Charger les locations quand on ouvre le modal
  const openAssignModal = (card) => {
    setAssignModal(card);
    setSelectedLocationId("");
    loadLocations(); // Charger les locations
  };

  const handleAssignLocation = async () => {
    if (!assignModal || !selectedLocationId) return;

    try {
      setSubmitting(true);
      const response = await patch(`/admin/nfc-cards/${assignModal.id}/assign`, {
        locationId: parseInt(selectedLocationId)
      });

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Card assigned successfully"
        });
        setAssignModal(null);
        setSelectedLocationId("");
        loadData();
      }
    } catch (error) {
      console.error("Error assigning card:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.error || "Failed to assign card",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassignLocation = async () => {
    if (!unassignModal) return;

    try {
      setSubmitting(true);
      const response = await patch(`/admin/nfc-cards/${unassignModal.id}/unassign`);

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Card unassigned successfully"
        });
        setUnassignModal(null);
        loadData();
      }
    } catch (error) {
      console.error("Error unassigning card:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.error || "Failed to unassign card",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Filtrer les locations disponibles (actives + pas la location actuelle de la carte)
  const availableLocations = locations.filter(
    (loc) => loc.active && (!assignModal?.location || loc.id !== assignModal.location.id)
  );

  if (loading) {
    return (
      <DashboardLayout title="My Cards" subtitle="Manage your NFC cards">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Cards" subtitle="Manage your NFC cards and location assignments">
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by UID, tag serial, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Cards", value: stats.total, color: "text-foreground" },
            { label: "Active", value: stats.active, color: "text-green-500" },
            { label: "Assigned", value: stats.assigned, color: "text-yellow-500" },
            { label: "Unassigned", value: stats.unassigned, color: "text-red-500" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-border/50 bg-card p-4">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
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
              {cards.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    No cards found
                  </TableCell>
                </TableRow>
              ) : (
                cards.map((card) => {
                  const cfg = STATUS_CONFIG[card.status] || STATUS_CONFIG.NOT_PROGRAMMED;
                  return (
                    <TableRow key={card.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <span className="font-mono text-xs text-muted-foreground block">
                            {card.uid.slice(0, 8)}…
                          </span>
                          {card.location ? (
                            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <MapPin size={10} className="text-green-500" /> 
                              {card.location.name}
                            </p>
                          ) : (
                            <p className="flex items-center gap-1 text-[11px] text-red-500">
                              <MapPinOff size={10} /> Unassigned
                            </p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="hidden text-sm md:table-cell">
                        {card.design?.templateName ? (
                          <div className="space-y-0.5">
                            <p className="font-medium text-sm">{card.design.templateName}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {card.design.cardModel} • {card.design.orientation}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                        {card.product?.name || "—"}
                      </TableCell>

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

                      <TableCell>
                        <Badge variant="outline" className={cfg.color}>
                          <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {card.location ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setUnassignModal(card)}
                              className="gap-1 text-xs text-destructive hover:text-destructive"
                            >
                              <MapPinOff size={14} /> 
                              <span className="hidden sm:inline">Unassign</span>
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openAssignModal(card)} // ✅ MODIFIÉ
                              className="gap-1 text-xs"
                            >
                              <MapPin size={14} /> 
                              <span className="hidden sm:inline">Assign</span>
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

      {/* ── Assign Modal ── */}
      <Dialog
        open={!!assignModal}
        onOpenChange={(open) => {
          if (!open) {
            setAssignModal(null);
            setSelectedLocationId("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign a location to your card</DialogTitle>
            <DialogDescription>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">UID:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {assignModal?.uid?.slice(0, 16)}...
                  </span>
                </div>
                
                {assignModal?.design?.templateName && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Design:</span>
                    <span className="font-medium text-foreground">
                      {assignModal.design.templateName}
                    </span>
                  </div>
                )}
                
                {assignModal?.product?.name && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Product:</span>
                    <span className="font-medium text-foreground">
                      {assignModal.product.name}
                    </span>
                  </div>
                )}
                
                {assignModal?.tagSerial && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">NFC Tag:</span>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {assignModal.tagSerial}
                    </Badge>
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <p className="text-sm font-medium text-foreground">
              Select a location
            </p>

            {loadingLocations ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading locations...</span>
              </div>
            ) : availableLocations.length > 0 ? (
              <>
                <p className="text-xs text-muted-foreground">
                  {availableLocations.length} location{availableLocations.length > 1 ? 's' : ''} available
                </p>
                <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLocations.map((loc) => (
                      <SelectItem key={loc.id} value={String(loc.id)}>
                        <div className="flex flex-col items-start py-1">
                          <span className="font-medium">{loc.name}</span>
                          {loc.address && (
                            <span className="text-xs text-muted-foreground">
                              {loc.address}
                            </span>
                          )}
                          {loc.googleRating && (
                            <span className="text-xs text-muted-foreground">
                              ⭐ {loc.googleRating} ({loc.googleReviewCount} reviews)
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            ) : (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">No locations available</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Please create a location first before assigning cards.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAssignModal(null);
                setSelectedLocationId("");
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              disabled={!selectedLocationId || submitting || loadingLocations} 
              onClick={handleAssignLocation}
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <MapPin size={14} className="mr-2" /> Assign location
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Unassign Modal ── */}
      <Dialog 
        open={!!unassignModal} 
        onOpenChange={(open) => !open && setUnassignModal(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unassign location</DialogTitle>
            <DialogDescription>
              <div className="space-y-3 pt-3">
                <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Card UID:</span>
                    <span className="font-mono font-semibold text-foreground">
                      {unassignModal?.uid?.slice(0, 16)}...
                    </span>
                  </div>
                  
                  {unassignModal?.product?.name && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Product:</span>
                      <span className="font-medium text-foreground">
                        {unassignModal.product.name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-2 text-sm">
                  <MapPin size={16} className="text-destructive mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">
                      Current Location: <span className="text-destructive">{unassignModal?.location?.name}</span>
                    </p>
                    {unassignModal?.location?.address && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {unassignModal.location.address}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  Are you sure you want to remove this location assignment?
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setUnassignModal(null)} 
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleUnassignLocation} 
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  Unassigning...
                </>
              ) : (
                <>
                  <MapPinOff size={14} className="mr-2" /> Unassign location
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MyCardsPage;