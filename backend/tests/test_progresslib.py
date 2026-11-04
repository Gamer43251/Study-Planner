from datetime import date

import pytest

from progresslib import build_dashboard

TODAY = date(2026, 11, 4)
MODULES = [
    {"id": 1, "name": "Cloud"},
    {"id": 2, "name": "Security"},
]


def task(**overrides):
    payload = {
        "id": 1,
        "title": "Task",
        "module_id": 1,
        "status": "todo",
        "deadline": TODAY,
        "estimated_minutes": 30,
    }
    payload.update(overrides)
    return payload


def test_no_tasks_reports_zero_without_dividing_by_zero():
    result = build_dashboard(MODULES, [], TODAY)

    assert result["completion_ratio"] == 0.0
    assert result["total_tasks"] == 0
    assert result["completed_tasks"] == 0
    assert result["overdue_tasks"] == []
    assert result["due_within_7_days"] == []
    assert result["modules"] == [
        {
            "module_id": 1,
            "name": "Cloud",
            "completion_ratio": 0.0,
            "overdue_count": 0,
            "remaining_minutes": 0,
        },
        {
            "module_id": 2,
            "name": "Security",
            "completion_ratio": 0.0,
            "overdue_count": 0,
            "remaining_minutes": 0,
        },
    ]
    assert [week["start"] for week in result["weekly_load"]] == [
        "2026-11-04",
        "2026-11-11",
        "2026-11-18",
        "2026-11-25",
    ]
    assert [week["estimated_minutes"] for week in result["weekly_load"]] == [0, 0, 0, 0]


def test_completion_overdue_boundary_and_weekly_load():
    tasks = [
        task(id=1, title="Done yesterday", status="done", deadline=date(2026, 11, 3), estimated_minutes=10),
        task(id=2, title="Overdue", status="todo", deadline=date(2026, 11, 3), estimated_minutes=20),
        task(id=3, title="Today", status="in_progress", deadline=date(2026, 11, 4), estimated_minutes=30),
        task(id=4, title="Edge of week", status="todo", deadline=date(2026, 11, 10), estimated_minutes=40),
        task(id=5, title="Next week", status="todo", deadline=date(2026, 11, 11), estimated_minutes=50, module_id=2),
        task(id=6, title="Outside four weeks", status="todo", deadline=date(2026, 12, 2), estimated_minutes=99, module_id=2),
        task(id=7, title="Unknown module", status="todo", deadline=date(2026, 11, 5), estimated_minutes=15, module_id=99),
    ]

    result = build_dashboard(MODULES, tasks, TODAY)

    assert result["total_tasks"] == 7
    assert result["completed_tasks"] == 1
    assert result["completion_ratio"] == pytest.approx(1 / 7)
    assert [item["id"] for item in result["overdue_tasks"]] == [2]
    assert result["overdue_tasks"][0]["deadline"] == "2026-11-03"
    assert [item["id"] for item in result["due_within_7_days"]] == [3, 7, 4]

    cloud = result["modules"][0]
    assert cloud["completion_ratio"] == pytest.approx(0.25)
    assert cloud["overdue_count"] == 1
    assert cloud["remaining_minutes"] == 90

    security = result["modules"][1]
    assert security["completion_ratio"] == 0.0
    assert security["overdue_count"] == 0
    assert security["remaining_minutes"] == 149
    assert [week["estimated_minutes"] for week in result["weekly_load"]] == [85, 50, 0, 0]


def test_deadline_today_is_not_overdue():
    result = build_dashboard([], [task(id=8, deadline=TODAY)], TODAY)

    assert result["overdue_tasks"] == []
    assert result["due_within_7_days"][0]["id"] == 8
    assert result["modules"] == []


def test_all_done_tasks_leave_no_open_work():
    tasks = [
        task(id=1, status="done", estimated_minutes=25),
        task(id=2, status="done", estimated_minutes=35, module_id=2),
    ]

    result = build_dashboard(MODULES, tasks, TODAY)

    assert result["completion_ratio"] == 1.0
    assert result["overdue_tasks"] == []
    assert result["due_within_7_days"] == []
    assert result["modules"][0]["remaining_minutes"] == 0
    assert result["modules"][1]["completion_ratio"] == 1.0
    assert [week["estimated_minutes"] for week in result["weekly_load"]] == [0, 0, 0, 0]


def test_iso_deadline_uses_the_calendar_date():
    result = build_dashboard(
        [{"id": 1, "name": "Cloud"}],
        [task(deadline="2026-11-03T23:30:00Z")],
        TODAY,
    )

    assert result["overdue_tasks"][0]["deadline"] == "2026-11-03"
    assert result["due_within_7_days"] == []
