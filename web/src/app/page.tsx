import { Suspense } from "react";

import { getStats, listTickets } from "@/lib/api/client";
import { NewTicketForm } from "@/components/new-ticket-form";
import { QueueBar } from "@/components/queue-bar";
import { TicketList } from "@/components/ticket-list";

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <header>
        <h1 className="font-display text-xl font-semibold tracking-tight">Ticket Tracker</h1>
        <p className="mt-1 text-sm text-muted">Triage and track support tickets.</p>
      </header>

      <Suspense fallback={<QueueSkeleton />}>
        <Dashboard />
      </Suspense>
    </main>
  );
}

async function Dashboard() {
  const [page, stats] = await Promise.all([listTickets({ limit: 50 }), getStats()]);

  return (
    <>
      <QueueBar stats={stats} />

      <div className="mt-10">
        <NewTicketForm />
      </div>

      <div className="mt-10">
        <h2 className="font-display text-sm font-semibold text-muted">Tickets</h2>
        <TicketList tickets={page.data} />
      </div>
    </>
  );
}

function QueueSkeleton() {
  return (
    <div className="mt-8 animate-pulse">
      <div className="h-10 w-full rounded-md border border-hairline bg-surface" />
      <div className="mt-4 h-6 w-64 rounded bg-hairline" />
    </div>
  );
}
