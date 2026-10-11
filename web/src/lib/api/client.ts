import "server-only";

import type { NewTicket, Stats, Status, Ticket, TicketPage, TicketPatch } from "./types";

const BASE = process.env.API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    body: string,
  ) {
    super(body || `request failed with ${status}`);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    cache: "no-store",
    headers: { "content-type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export function listTickets(
  query: { status?: Status; page?: number; limit?: number } = {},
): Promise<TicketPage> {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return request<TicketPage>(`/tickets${qs ? `?${qs}` : ""}`);
}

export const getStats = () => request<Stats>("/tickets/stats");

export const createTicket = (body: NewTicket) =>
  request<Ticket>("/tickets", { method: "POST", body: JSON.stringify(body) });

export const patchTicket = (id: string, body: TicketPatch) =>
  request<Ticket>(`/tickets/${id}`, { method: "PATCH", body: JSON.stringify(body) });

export const deleteTicket = (id: string) =>
  request<void>(`/tickets/${id}`, { method: "DELETE" });
