from uuid import uuid4


async def test_create_ticket_applies_defaults(client):
    response = await client.post("/tickets", json={"title": "Login button is broken"})

    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "Login button is broken"
    assert body["status"] == "open"
    assert body["priority"] == "medium"
    assert body["id"]
    assert body["created_at"]


async def test_create_ticket_requires_title(client):
    response = await client.post("/tickets", json={"description": "missing a title"})

    assert response.status_code == 422


async def test_list_filters_by_status_and_paginates(client):
    for i in range(3):
        await client.post("/tickets", json={"title": f"open {i}", "status": "open"})
    await client.post("/tickets", json={"title": "done", "status": "closed"})

    response = await client.get("/tickets", params={"status": "open", "page": 1, "limit": 2})

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 3
    assert body["total_pages"] == 2
    assert len(body["data"]) == 2
    assert all(ticket["status"] == "open" for ticket in body["data"])


async def test_patch_updates_fields_and_handles_errors(client):
    created = (await client.post("/tickets", json={"title": "needs triage"})).json()

    updated = await client.patch(
        f"/tickets/{created['id']}", json={"status": "in_progress", "priority": "high"}
    )
    assert updated.status_code == 200
    assert updated.json()["status"] == "in_progress"
    assert updated.json()["priority"] == "high"

    missing = await client.patch(f"/tickets/{uuid4()}", json={"status": "closed"})
    assert missing.status_code == 404

    invalid = await client.patch(f"/tickets/{created['id']}", json={"status": "archived"})
    assert invalid.status_code == 422


async def test_stats_counts_by_status(client):
    await client.post("/tickets", json={"title": "a", "status": "open"})
    await client.post("/tickets", json={"title": "b", "status": "open"})
    await client.post("/tickets", json={"title": "c", "status": "closed"})

    response = await client.get("/tickets/stats")

    assert response.status_code == 200
    assert response.json() == {"open": 2, "in_progress": 0, "closed": 1}


async def test_patch_edits_title_and_description(client):
    created = (await client.post("/tickets", json={"title": "typo in titel"})).json()

    updated = await client.patch(
        f"/tickets/{created['id']}",
        json={"title": "Typo in title", "description": "now with detail"},
    )

    assert updated.status_code == 200
    assert updated.json()["title"] == "Typo in title"
    assert updated.json()["description"] == "now with detail"


async def test_delete_ticket(client):
    created = (await client.post("/tickets", json={"title": "temporary"})).json()

    deleted = await client.delete(f"/tickets/{created['id']}")
    assert deleted.status_code == 204

    listed = await client.get("/tickets")
    assert all(ticket["id"] != created["id"] for ticket in listed.json()["data"])

    missing = await client.delete(f"/tickets/{created['id']}")
    assert missing.status_code == 404
