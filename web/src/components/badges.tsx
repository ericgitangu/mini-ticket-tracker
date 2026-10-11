import { Badge } from "@/components/ui/badge";
import type { Priority, Status } from "@/lib/api/types";

const STATUS_META: Record<Status, { label: string; color: string }> = {
  open: { label: "Open", color: "var(--color-status-open)" },
  in_progress: { label: "In progress", color: "var(--color-status-progress)" },
  closed: { label: "Closed", color: "var(--color-status-closed)" },
};

const PRIORITY_META: Record<Priority, { label: string; color: string }> = {
  low: { label: "Low", color: "var(--color-prio-low)" },
  medium: { label: "Medium", color: "var(--color-prio-medium)" },
  high: { label: "High", color: "var(--color-prio-high)" },
};

export const statusMeta = (status: Status) => STATUS_META[status];
export const priorityMeta = (priority: Priority) => PRIORITY_META[priority];

export function PriorityBadge({ priority }: { priority: Priority }) {
  const meta = PRIORITY_META[priority];
  return (
    <Badge
      variant="outline"
      className="gap-1.5 font-medium"
      style={{
        color: meta.color,
        borderColor: `color-mix(in oklab, ${meta.color} 35%, transparent)`,
        backgroundColor: `color-mix(in oklab, ${meta.color} 10%, transparent)`,
      }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
      {meta.label}
    </Badge>
  );
}
