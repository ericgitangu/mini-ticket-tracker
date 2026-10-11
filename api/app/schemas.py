from datetime import datetime
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator


class Status(StrEnum):
    open = "open"
    in_progress = "in_progress"
    closed = "closed"


class Priority(StrEnum):
    low = "low"
    medium = "medium"
    high = "high"


class TicketCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    status: Status = Status.open
    priority: Priority = Priority.medium


class TicketPatch(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    status: Status | None = None
    priority: Priority | None = None

    @model_validator(mode="after")
    def require_one_field(self) -> "TicketPatch":
        if not self.model_fields_set:
            raise ValueError("provide at least one field to update")
        return self


class TicketOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    description: str | None
    status: Status
    priority: Priority
    created_at: datetime
    updated_at: datetime


class TicketPage(BaseModel):
    data: list[TicketOut]
    page: int
    limit: int
    total: int
    total_pages: int


class Stats(BaseModel):
    open: int
    in_progress: int
    closed: int
