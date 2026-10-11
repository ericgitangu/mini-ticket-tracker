import { Card } from "@/components/ui/card";
import type { Ticket } from "@/lib/api/types";
import { PriorityBadge } from "./badges";
import { StatusSelect } from "./status-select";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function TicketList({ tickets }: { tickets: Ticket[] }) {
  if (tickets.length === 0) {
    return (
      <Card className="border-dashed px-5 py-10 text-center text-sm text-muted-foreground">
        No tickets yet. Create the first one above.
      </Card>
    );
  }

  return (
    <Card className="gap-0 divide-y overflow-hidden p-0">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{ticket.title}</p>
            {ticket.description ? (
              <p className="mt-0.5 truncate text-sm text-muted-foreground">{ticket.description}</p>
            ) : null}
            <p className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="font-mono">{ticket.id.slice(0, 8)}</span>
              <span className="h-3 w-px bg-border" />
              <span>{formatDate(ticket.created_at)}</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <PriorityBadge priority={ticket.priority} />
            <StatusSelect id={ticket.id} status={ticket.status} />
          </div>
        </div>
      ))}
    </Card>
  );
}
