def test_dashboard_endpoint_uses_the_library(client):
    module = client.post(
        "/modules",
        json={"name": "Cloud Application Development", "code": "CAD", "credits": 10},
    ).json()
    client.post(
        "/tasks",
        json={
            "title": "Finished reading",
            "deadline": "2026-11-03T12:00:00Z",
            "status": "done",
            "estimated_minutes": 10,
            "module_id": module["id"],
        },
    )
    client.post(
        "/tasks",
        json={
            "title": "Overdue worksheet",
            "deadline": "2026-11-03T12:00:00Z",
            "status": "todo",
            "estimated_minutes": 20,
            "module_id": module["id"],
        },
    )

    response = client.get("/dashboard", params={"today": "2026-11-04"})

    assert response.status_code == 200
    body = response.json()
    assert body["total_tasks"] == 2
    assert body["completed_tasks"] == 1
    assert body["overdue_tasks"][0]["title"] == "Overdue worksheet"
    assert body["modules"][0]["name"] == "Cloud Application Development"
    assert body["modules"][0]["remaining_minutes"] == 20
    assert len(body["weekly_load"]) == 4
