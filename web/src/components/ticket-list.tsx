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
      <div className="mt-4 rounded-md border border-dashed border-hairline bg-surface px-5 py-10 text-center text-sm text-muted">
        No tickets yet. Create the first one above.
      </div>
    );
  }

  return (
    <ul className="mt-4 divide-y divide-hairline overflow-hidden rounded-md border border-hairline bg-surface">
      {tickets.map((ticket) => (
        <li
          key={ticket.id}
          className="flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-stone/60"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{ticket.title}</p>
            {ticket.description ? (
              <p className="mt-0.5 truncate text-sm text-muted">{ticket.description}</p>
            ) : null}
            <p className="mt-2 flex items-center gap-3 text-xs text-muted">
              <span className="font-mono">{ticket.id.slice(0, 8)}</span>
              <span className="h-3 w-px bg-hairline" />
              <span>{formatDate(ticket.created_at)}</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <PriorityBadge priority={ticket.priority} />
            <StatusSelect id={ticket.id} status={ticket.status} />
          </div>
        </li>
      ))}
    </ul>
  );
}
