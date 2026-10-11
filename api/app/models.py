import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, String, Text, Uuid, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

STATUSES = ("open", "in_progress", "closed")
PRIORITIES = ("low", "medium", "high")


class Base(DeclarativeBase):
    pass


class Ticket(Base):
    __tablename__ = "tickets"
    __table_args__ = (
        CheckConstraint(f"status IN {STATUSES}", name="ck_tickets_status"),
        CheckConstraint(f"priority IN {PRIORITIES}", name="ck_tickets_priority"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, default=None)
    status: Mapped[str] = mapped_column(String(20), default="open")
    priority: Mapped[str] = mapped_column(String(20), default="medium")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
