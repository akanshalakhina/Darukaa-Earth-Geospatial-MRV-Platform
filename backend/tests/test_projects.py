def test_list_projects(client):
    response = client.get("/api/v1/projects")
    assert response.status_code == 200
    projects = response.json()
    assert len(projects) >= 4
    first = projects[0]
    assert "name" in first
    assert "slug" in first
    assert "total_sites" in first
    assert "total_hectares" in first


def test_filter_projects_by_biome(client):
    response = client.get("/api/v1/projects?biome=Mangrove%20/%20Coastal%20Wetland")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert "Mangrove" in data[0]["biome"]


def test_create_project(client):
    payload = {
        "name": "Madagascar Baobab Restoration Corridor",
        "description": "Landscape-scale restoration of dry deciduous forest and baobab woodlands.",
        "project_type": "Afforestation / Reforestation",
        "standard": "Plan Vivo",
        "status": "Draft",
        "country": "Madagascar",
        "region": "Menabe",
        "biome": "Tropical Dry Deciduous Forest",
        "estimated_annual_tco2e": 14500.0,
        "target_biodiversity_score": 89.0,
        "budget": 750000.0,
        "developer_name": "Madagascar Flora Fauna",
    }
    response = client.post("/api/v1/projects", json=payload)
    assert response.status_code == 201
    created = response.json()
    assert created["name"] == payload["name"]
    assert "slug" in created
    project_id = created["id"]

    # Retrieve created project
    get_res = client.get(f"/api/v1/projects/{project_id}")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == payload["name"]

    # Update created project
    update_res = client.put(f"/api/v1/projects/{project_id}", json={"status": "Active"})
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "Active"

    # Delete project
    del_res = client.delete(f"/api/v1/projects/{project_id}")
    assert del_res.status_code == 200
