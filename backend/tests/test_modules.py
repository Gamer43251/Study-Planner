MODULE = {
    "name": "Cloud Application Development",
    "code": "CAD",
    "credits": 10,
}


def create_module(client, **overrides):
    response = client.post("/modules", json={**MODULE, **overrides})
    assert response.status_code == 201, response.text
    return response.json()


def test_create_list_get_update_and_delete_module(client):
    created = create_module(client)
    assert created["name"] == MODULE["name"]
    assert created["code"] == "CAD"
    assert created["credits"] == 10
    assert created["id"]

    listed = client.get("/modules")
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    fetched = client.get(f"/modules/{created['id']}")
    assert fetched.status_code == 200
    assert fetched.json()["code"] == "CAD"

    updated = client.patch(
        f"/modules/{created['id']}",
        json={"name": "Security Fundamentals"},
    )
    assert updated.status_code == 200
    assert updated.json()["name"] == "Security Fundamentals"
    assert updated.json()["credits"] == 10

    deleted = client.delete(f"/modules/{created['id']}")
    assert deleted.status_code == 204
    assert client.get(f"/modules/{created['id']}").status_code == 404
    assert client.get("/modules").json() == []


def test_reject_blank_module_name(client):
    response = client.post("/modules", json={**MODULE, "name": "   "})
    assert response.status_code == 422


def test_reject_blank_module_code(client):
    response = client.post("/modules", json={**MODULE, "code": ""})
    assert response.status_code == 422


def test_reject_non_positive_credits(client):
    assert client.post("/modules", json={**MODULE, "credits": 0}).status_code == 422
    assert client.post("/modules", json={**MODULE, "credits": -2}).status_code == 422


def test_reject_missing_module_fields(client):
    response = client.post("/modules", json={"name": "Cloud"})
    assert response.status_code == 422


def test_missing_module_returns_404(client):
    assert client.get("/modules/999").status_code == 404
    assert client.patch("/modules/999", json={"name": "Nope"}).status_code == 404
    assert client.delete("/modules/999").status_code == 404


def test_patch_rejects_non_positive_credits(client):
    module = create_module(client)
    response = client.patch(f"/modules/{module['id']}", json={"credits": 0})
    assert response.status_code == 422
