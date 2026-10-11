"use server";

import { revalidatePath } from "next/cache";

import { createTicket, deleteTicket, patchTicket } from "@/lib/api/client";
import type { Priority, Status } from "@/lib/api/types";

export type CreateState = { ok: boolean; error: string | null };

export async function createTicketAction(
  _prev: CreateState,
  formData: FormData,
): Promise<CreateState> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priority = String(formData.get("priority") ?? "medium") as Priority;

  if (!title) return { ok: false, error: "Add a title to create the ticket." };

  try {
    await createTicket({ title, description: description || null, status: "open", priority });
  } catch {
    return { ok: false, error: "Could not create the ticket. Try again." };
  }

  revalidatePath("/");
  return { ok: true, error: null };
}

export async function updateStatusAction(id: string, status: Status): Promise<{ ok: boolean }> {
  try {
    await patchTicket(id, { status });
  } catch {
    return { ok: false };
  }
  revalidatePath("/");
  return { ok: true };
}

export async function updateTicketAction(
  id: string,
  patch: { title?: string; description?: string | null; priority?: Priority },
): Promise<{ ok: boolean; error: string | null }> {
  try {
    await patchTicket(id, patch);
  } catch {
    return { ok: false, error: "Could not save your changes. Try again." };
  }
  revalidatePath("/");
  return { ok: true, error: null };
}

export async function deleteTicketAction(id: string): Promise<{ ok: boolean }> {
  try {
    await deleteTicket(id);
  } catch {
    return { ok: false };
  }
  revalidatePath("/");
  return { ok: true };
}
