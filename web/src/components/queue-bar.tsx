import type { Stats, Status } from "@/lib/api/types";
import { statusMeta } from "./badges";

const ORDER: Status[] = ["open", "in_progress", "closed"];

export function QueueBar({ stats }: { stats: Stats }) {
  const total = stats.open + stats.in_progress + stats.closed;

  return (
    <section className="mt-8">
      <div className="flex h-10 w-full overflow-hidden rounded-md border border-hairline bg-surface">
        {total === 0 ? (
          <div className="flex w-full items-center justify-center text-sm text-muted">
            The queue is empty
          </div>
        ) : (
          ORDER.map((key) => {
            const value = stats[key];
            if (!value) return null;
            const meta = statusMeta(key);
            return (
              <div
                key={key}
                style={{ flexGrow: value, backgroundColor: meta.color }}
                title={`${meta.label}: ${value}`}
              />
            );
          })
        )}
      </div>
      <dl className="mt-4 flex flex-wrap gap-x-10 gap-y-3">
        {ORDER.map((key) => {
          const meta = statusMeta(key);
          return (
            <div key={key} className="flex items-baseline gap-2">
              <span
                className="h-2.5 w-2.5 self-center rounded-full"
                style={{ backgroundColor: meta.color }}
              />
              <dd className="font-display text-2xl font-semibold tabular-nums">{stats[key]}</dd>
              <dt className="text-sm text-muted">{meta.label}</dt>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
