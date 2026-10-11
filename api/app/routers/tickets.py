from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_session
from ..models import STATUSES, Ticket
from ..schemas import Stats, Status, TicketCreate, TicketOut, TicketPage, TicketPatch

router = APIRouter(prefix="/tickets", tags=["tickets"])

SessionDep = Annotated[AsyncSession, Depends(get_session)]


@router.post("", status_code=201, response_model=TicketOut)
async def create_ticket(payload: TicketCreate, session: SessionDep) -> Ticket:
    ticket = Ticket(**payload.model_dump(mode="json"))
    session.add(ticket)
    await session.commit()
    await session.refresh(ticket)
    return ticket


@router.get("", response_model=TicketPage)
async def list_tickets(
    session: SessionDep,
    status: Status | None = None,
    page: Annotated[int, Query(ge=1)] = 1,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
) -> TicketPage:
    stmt = select(Ticket)
    count_stmt = select(func.count()).select_from(Ticket)
    if status is not None:
        stmt = stmt.where(Ticket.status == status.value)
        count_stmt = count_stmt.where(Ticket.status == status.value)

    total = await session.scalar(count_stmt) or 0
    rows = (
        await session.scalars(
            stmt.order_by(Ticket.created_at.desc()).offset((page - 1) * limit).limit(limit)
        )
    ).all()
    total_pages = (total + limit - 1) // limit if total else 0
    return TicketPage(
        data=[TicketOut.model_validate(r) for r in rows],
        page=page,
        limit=limit,
        total=total,
        total_pages=total_pages,
    )


@router.get("/stats", response_model=Stats)
async def ticket_stats(session: SessionDep) -> Stats:
    counts = dict.fromkeys(STATUSES, 0)
    rows = await session.execute(select(Ticket.status, func.count()).group_by(Ticket.status))
    for value, count in rows.all():
        counts[value] = count
    return Stats(**counts)


@router.patch("/{ticket_id}", response_model=TicketOut)
async def update_ticket(ticket_id: UUID, payload: TicketPatch, session: SessionDep) -> Ticket:
    ticket = await session.get(Ticket, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="ticket not found")
    for field, value in payload.model_dump(mode="json", exclude_unset=True).items():
        setattr(ticket, field, value)
    await session.commit()
    await session.refresh(ticket)
    return ticket


@router.delete("/{ticket_id}", status_code=204)
async def delete_ticket(ticket_id: UUID, session: SessionDep) -> None:
    ticket = await session.get(Ticket, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="ticket not found")
    await session.delete(ticket)
    await session.commit()
