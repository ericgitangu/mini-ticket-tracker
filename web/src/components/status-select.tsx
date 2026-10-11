"use client";

import { useOptimistic, useState, useTransition } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <Select value={optimistic} onValueChange={(value) => onChange(value as Status)} disabled={isPending}>
      <SelectTrigger
        aria-label="Change status"
        className="w-[9.5rem] font-medium"
        style={{
          color: meta.color,
          borderColor: failed
            ? "var(--color-prio-high)"
            : `color-mix(in oklab, ${meta.color} 35%, transparent)`,
          backgroundColor: `color-mix(in oklab, ${meta.color} 8%, transparent)`,
        }}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((option) => (
          <SelectItem key={option} value={option}>
            {statusMeta(option).label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
