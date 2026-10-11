"use client";

import { useActionState, useEffect, useRef } from "react";

import { createTicketAction } from "@/app/actions";
import { PRIORITIES } from "@/lib/api/types";
import { priorityMeta } from "./badges";

const FIELD =
  "w-full rounded-md border border-hairline bg-surface px-3 py-2 text-sm outline-none placeholder:text-muted/70 focus-visible:border-jade focus-visible:ring-2 focus-visible:ring-jade/40";

export function NewTicketForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createTicketAction, {
    ok: false,
    error: null,
  });

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-md border border-hairline bg-surface p-5"
      aria-label="New ticket"
    >
      <h2 className="font-display text-sm font-semibold">New ticket</h2>
      <div className="mt-4 space-y-3">
        <input
          name="title"
          className={FIELD}
          placeholder="What needs attention?"
          maxLength={200}
          required
        />
        <textarea
          name="description"
          className={`${FIELD} resize-none`}
          placeholder="Add detail (optional)"
          rows={2}
        />
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-muted">
            Priority
            <select
              name="priority"
              defaultValue="medium"
              className="rounded-md border border-hairline bg-surface px-2.5 py-1.5 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-jade/40"
            >
              {PRIORITIES.map((option) => (
                <option key={option} value={option}>
                  {priorityMeta(option).label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-jade px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-jade-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Creating…" : "Create ticket"}
          </button>
        </div>
        {state.error ? (
          <p className="text-sm" style={{ color: "var(--color-prio-high)" }}>
            {state.error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
