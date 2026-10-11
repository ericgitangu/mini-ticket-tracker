"use client";

import { useOptimistic, useState, useTransition } from "react";

import { updateStatusAction } from "@/app/actions";
import { STATUSES, type Status } from "@/lib/api/types";
import { statusMeta } from "./badges";

export function StatusSelect({ id, status }: { id: string; status: Status }) {
  const [optimistic, setOptimistic] = useOptimistic(status);
  const [isPending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  function onChange(next: Status) {
    setFailed(false);
    startTransition(async () => {
      setOptimistic(next);
      const result = await updateStatusAction(id, next);
      if (!result.ok) setFailed(true);
    });
  }

  const meta = statusMeta(optimistic);
  return (
    <select
      aria-label="Change status"
      value={optimistic}
      disabled={isPending}
      onChange={(event) => onChange(event.target.value as Status)}
      className="rounded-md border px-2.5 py-1 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-jade/50 disabled:opacity-60"
      style={{
        color: meta.color,
        borderColor: failed
          ? "var(--color-prio-high)"
          : `color-mix(in oklab, ${meta.color} 35%, transparent)`,
        backgroundColor: `color-mix(in oklab, ${meta.color} 8%, transparent)`,
      }}
    >
      {STATUSES.map((option) => (
        <option key={option} value={option}>
          {statusMeta(option).label}
        </option>
      ))}
    </select>
  );
}
