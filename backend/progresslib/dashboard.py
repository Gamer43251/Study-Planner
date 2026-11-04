from datetime import date, datetime, timedelta


def _as_date(value):
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    if isinstance(value, str):
        text = value.replace("Z", "+00:00")
        if "T" in text:
            return datetime.fromisoformat(text).date()
        return date.fromisoformat(text)
    raise TypeError(f"Unsupported deadline: {value!r}")


def _summary(item):
    return {
        "id": item["id"],
        "title": item["title"],
        "module_id": item["module_id"],
        "deadline": item["day"].isoformat(),
        "estimated_minutes": item["estimated_minutes"],
    }


def build_dashboard(modules, tasks, today: date) -> dict:
    """Summarise open work from plain module and task records.

    `today` is injected so the same records produce the same result in tests.
    A task is overdue when it is not done and its calendar date is before today.
    The next seven days are today through the sixth day after today.
    """
    normalized = [
        {
            "id": task["id"],
            "title": task["title"],
            "module_id": task["module_id"],
            "status": task["status"],
            "estimated_minutes": task["estimated_minutes"],
            "day": _as_date(task["deadline"]),
        }
        for task in tasks
    ]
    completed = [task for task in normalized if task["status"] == "done"]
    open_tasks = [task for task in normalized if task["status"] != "done"]
    due_end = today + timedelta(days=6)
    overdue = [task for task in open_tasks if task["day"] < today]
    due_soon = [task for task in open_tasks if today <= task["day"] <= due_end]

    module_rows = []
    for module in modules:
        owned = [task for task in normalized if task["module_id"] == module["id"]]
        owned_open = [task for task in owned if task["status"] != "done"]
        owned_done = len(owned) - len(owned_open)
        module_rows.append(
            {
                "module_id": module["id"],
                "name": module["name"],
                "completion_ratio": (owned_done / len(owned)) if owned else 0.0,
                "overdue_count": sum(1 for task in owned_open if task["day"] < today),
                "remaining_minutes": sum(task["estimated_minutes"] for task in owned_open),
            }
        )

    weekly_load = []
    for index in range(4):
        start = today + timedelta(days=7 * index)
        end = start + timedelta(days=6)
        weekly_load.append(
            {
                "week_index": index,
                "start": start.isoformat(),
                "estimated_minutes": sum(
                    task["estimated_minutes"]
                    for task in open_tasks
                    if start <= task["day"] <= end
                ),
            }
        )

    total = len(normalized)
    return {
        "completion_ratio": (len(completed) / total) if total else 0.0,
        "total_tasks": total,
        "completed_tasks": len(completed),
        "overdue_tasks": [_summary(task) for task in sorted(overdue, key=lambda task: (task["day"], task["id"]))],
        "due_within_7_days": [_summary(task) for task in sorted(due_soon, key=lambda task: (task["day"], task["id"]))],
        "modules": module_rows,
        "weekly_load": weekly_load,
    }
