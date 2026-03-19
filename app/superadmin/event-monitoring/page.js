import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { RefreshCw } from "lucide-react";

const events = [
  { ts: "2026-02-26 14:32:01", account: "Urban Bites NYC", event: "review.created", status: "Success", source: "NFC Scan" },
  { ts: "2026-02-26 14:28:44", account: "CloudDine Group", event: "webhook.delivered", status: "Success", source: "API" },
  { ts: "2026-02-26 14:25:12", account: "Glow Beauty Co", event: "sms.sent", status: "Failed", source: "Automation" },
  { ts: "2026-02-26 14:20:33", account: "FreshFit Gym", event: "review.request.sent", status: "Success", source: "Manual" },
  { ts: "2026-02-26 14:18:07", account: "PetPals Clinic", event: "webhook.failed", status: "Failed", source: "Integration" },
  { ts: "2026-02-26 14:15:55", account: "CloudDine Group", event: "review.created", status: "Success", source: "QR Scan" },
];

const EventMonitoring = () => (
  <SuperAdminLayout title="Event Monitoring" subtitle="Platform-wide event tracking">
    <div className="flex flex-wrap gap-3 mb-6">
      <Select><SelectTrigger className="w-44 bg-secondary border-border/50"><SelectValue placeholder="Event Type" /></SelectTrigger>
        <SelectContent><SelectItem value="all">All Events</SelectItem><SelectItem value="review">Review</SelectItem><SelectItem value="webhook">Webhook</SelectItem><SelectItem value="sms">SMS</SelectItem></SelectContent>
      </Select>
      <Select><SelectTrigger className="w-36 bg-secondary border-border/50"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="success">Success</SelectItem><SelectItem value="failed">Failed</SelectItem></SelectContent>
      </Select>
      <Select><SelectTrigger className="w-44 bg-secondary border-border/50"><SelectValue placeholder="Account" /></SelectTrigger>
        <SelectContent><SelectItem value="all">All Accounts</SelectItem></SelectContent>
      </Select>
    </div>

    <Card className="bg-card border-border/50">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead>Timestamp</TableHead><TableHead>Account</TableHead><TableHead>Event</TableHead>
              <TableHead>Status</TableHead><TableHead>Source</TableHead><TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((e, i) => (
              <TableRow key={i} className="border-border/50">
                <TableCell className="font-mono text-xs">{e.ts}</TableCell>
                <TableCell>{e.account}</TableCell>
                <TableCell><code className="text-xs bg-secondary px-2 py-1 rounded">{e.event}</code></TableCell>
                <TableCell>
                  <Badge className={e.status === "Success" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-primary/10 text-primary border-primary/20"}>
                    {e.status}
                  </Badge>
                </TableCell>
                <TableCell>{e.source}</TableCell>
                <TableCell className="flex gap-2">
                  <Sheet>
                    <SheetTrigger asChild><Button size="sm" variant="ghost">View JSON</Button></SheetTrigger>
                    <SheetContent className="bg-card border-border/50">
                      <SheetHeader><SheetTitle>Event Payload</SheetTitle></SheetHeader>
                      <pre className="mt-4 text-xs bg-secondary p-4 rounded-lg overflow-auto max-h-[70vh] text-muted-foreground">
{JSON.stringify({ event: e.event, account: e.account, timestamp: e.ts, source: e.source, status: e.status, payload: { review_id: "rv_" + Math.random().toString(36).slice(2, 10), rating: 5 } }, null, 2)}
                      </pre>
                    </SheetContent>
                  </Sheet>
                  {e.status === "Failed" && <Button size="sm" variant="outline" className="border-primary/30 text-primary"><RefreshCw size={14} className="mr-1" />Retry</Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </SuperAdminLayout>
);

export default EventMonitoring;