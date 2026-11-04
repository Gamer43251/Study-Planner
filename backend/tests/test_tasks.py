MODULE = {
    "name": "Cloud Application Development",
    "code": "CAD",
    "credits": 10,
}


def create_module(client, **overrides):
    response = client.post("/modules", json={**MODULE, **overrides})
    assert response.status_code == 201, response.text
    return response.json()


def task_payload(module_id, **overrides):
    payload = {
        "title": "Write API tests",
        "details": "Cover validation and CRUD",
        "deadline": "2026-11-20T17:00:00Z",
        "status": "todo",
        "estimated_minutes": 90,
        "module_id": module_id,
    }
    payload.update(overrides)
    return payload


def create_task(client, module_id, **overrides):
    response = client.post("/tasks", json=task_payload(module_id, **overrides))
    assert response.status_code == 201, response.text
    return response.json()


def test_create_list_get_update_and_delete_task(client):
    module = create_module(client)
    created = create_task(client, module["id"])
    assert created["title"] == "Write API tests"
    assert created["status"] == "todo"
    assert created["estimated_minutes"] == 90
    assert created["module_id"] == module["id"]

    listed = client.get("/tasks")
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    fetched = client.get(f"/tasks/{created['id']}")
    assert fetched.status_code == 200
    assert fetched.json()["details"] == "Cover validation and CRUD"

    updated = client.patch(
        f"/tasks/{created['id']}",
        json={"status": "in_progress", "estimated_minutes": 45},
    )
    assert updated.status_code == 200
    assert updated.json()["status"] == "in_progress"
    assert updated.json()["estimated_minutes"] == 45
    assert updated.json()["title"] == "Write API tests"

    deleted = client.delete(f"/tasks/{created['id']}")
    assert deleted.status_code == 204
    assert client.get(f"/tasks/{created['id']}").status_code == 404


def test_details_are_optional(client):
    module = create_module(client)
    payload = task_payload(module["id"])
    del payload["details"]
    response = client.post("/tasks", json=payload)
    assert response.status_code == 201
    assert response.json()["details"] is None


def test_list_tasks_filters_by_module(client):
    first = create_module(client)
    second = create_module(client, name="Security", code="SEC")
    create_task(client, first["id"], title="First task")
    create_task(client, second["id"], title="Second task")

    response = client.get("/tasks", params={"module_id": first["id"]})
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["title"] == "First task"


def test_reject_blank_title(client):
    module = create_module(client)
    response = client.post("/tasks", json=task_payload(module["id"], title="  "))
    assert response.status_code == 422


def test_reject_missing_deadline(client):
    module = create_module(client)
    payload = task_payload(module["id"])
    del payload["deadline"]
    assert client.post("/tasks", json=payload).status_code == 422


def test_reject_unknown_status(client):
    module = create_module(client)
    response = client.post("/tasks", json=task_payload(module["id"], status="later"))
    assert response.status_code == 422


def test_reject_non_positive_minutes(client):
    module = create_module(client)
    assert client.post(
        "/tasks", json=task_payload(module["id"], estimated_minutes=0)
    ).status_code == 422
    assert client.post(
        "/tasks", json=task_payload(module["id"], estimated_minutes=-5)
    ).status_code == 422


def test_reject_task_for_missing_module(client):
    response = client.post("/tasks", json=task_payload(999))
    assert response.status_code == 422


def test_deleting_module_deletes_its_tasks(client):
    module = create_module(client)
    task = create_task(client, module["id"])
    assert client.delete(f"/modules/{module['id']}").status_code == 204
    assert client.get(f"/tasks/{task['id']}").status_code == 404
    assert client.get("/tasks").json() == []


def test_missing_task_returns_404(client):
    assert client.get("/tasks/999").status_code == 404
    assert client.patch("/tasks/999", json={"title": "Nope"}).status_code == 404
    assert client.delete("/tasks/999").status_code == 404


def test_patch_rejects_bad_status_and_unknown_module(client):
    module = create_module(client)
    task = create_task(client, module["id"])
    assert client.patch(
        f"/tasks/{task['id']}", json={"status": "done-ish"}
    ).status_code == 422
    assert client.patch(f"/tasks/{task['id']}", json={"module_id": 999}).status_code == 422
