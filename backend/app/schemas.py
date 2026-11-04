from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, field_validator


class TaskStatus(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"


def _required_text(value: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise ValueError("must not be empty")
    return cleaned


def _optional_text(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


def _positive(value: int | None) -> int | None:
    if value is None:
        return None
    if value <= 0:
        raise ValueError("must be positive")
    return value


class ModuleCreate(BaseModel):
    name: str
    code: str
    credits: int

    @field_validator("name", "code")
    @classmethod
    def text_not_blank(cls, value: str) -> str:
        return _required_text(value)

    @field_validator("credits")
    @classmethod
    def credits_positive(cls, value: int) -> int:
        checked = _positive(value)
        assert checked is not None
        return checked


class ModuleUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    credits: int | None = None

    @field_validator("name", "code")
    @classmethod
    def text_not_blank(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return _required_text(value)

    @field_validator("credits")
    @classmethod
    def credits_positive(cls, value: int | None) -> int | None:
        return _positive(value)


class ModuleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    code: str
    credits: int


class TaskCreate(BaseModel):
    title: str
    details: str | None = None
    deadline: datetime
    status: TaskStatus
    estimated_minutes: int
    module_id: int

    @field_validator("title")
    @classmethod
    def title_not_blank(cls, value: str) -> str:
        return _required_text(value)

    @field_validator("details")
    @classmethod
    def details_blank_to_none(cls, value: str | None) -> str | None:
        return _optional_text(value)

    @field_validator("estimated_minutes")
    @classmethod
    def minutes_positive(cls, value: int) -> int:
        checked = _positive(value)
        assert checked is not None
        return checked


class TaskUpdate(BaseModel):
    title: str | None = None
    details: str | None = None
    deadline: datetime | None = None
    status: TaskStatus | None = None
    estimated_minutes: int | None = None
    module_id: int | None = None

    @field_validator("title")
    @classmethod
    def title_not_blank(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return _required_text(value)

    @field_validator("details")
    @classmethod
    def details_blank_to_none(cls, value: str | None) -> str | None:
        return _optional_text(value)

    @field_validator("estimated_minutes")
    @classmethod
    def minutes_positive(cls, value: int | None) -> int | None:
        return _positive(value)


class TaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    details: str | None
    deadline: datetime
    status: TaskStatus
    estimated_minutes: int
    module_id: int
