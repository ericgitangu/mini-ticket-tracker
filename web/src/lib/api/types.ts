import type { components } from "./schema";

export type Ticket = components["schemas"]["TicketOut"];
export type TicketPage = components["schemas"]["TicketPage"];
export type Stats = components["schemas"]["Stats"];
export type NewTicket = components["schemas"]["TicketCreate"];
export type TicketPatch = components["schemas"]["TicketPatch"];

export type Status = Ticket["status"];
export type Priority = Ticket["priority"];

export const STATUSES: Status[] = ["open", "in_progress", "closed"];
export const PRIORITIES: Priority[] = ["low", "medium", "high"];
