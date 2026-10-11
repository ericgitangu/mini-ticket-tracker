"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createTicketAction } from "@/app/actions";
import { PRIORITIES } from "@/lib/api/types";
import { priorityMeta } from "./badges";

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
    <Card className="p-5">
      <form ref={formRef} action={formAction} aria-label="New ticket" className="space-y-3">
        <h2 className="font-display text-sm font-semibold">New ticket</h2>
        <Input name="title" placeholder="What needs attention?" maxLength={200} required />
        <Textarea
          name="description"
          placeholder="Add detail (optional)"
          rows={2}
          className="resize-none"
        />
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="priority" className="text-muted-foreground">
              Priority
            </Label>
            <Select name="priority" defaultValue="medium">
              <SelectTrigger id="priority" className="w-[7.5rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {priorityMeta(option).label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : <Plus />}
            {isPending ? "Creating" : "Create ticket"}
          </Button>
        </div>
        {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      </form>
    </Card>
  );
}
