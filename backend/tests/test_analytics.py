def test_analytics_overview(client):
    response = client.get("/api/v1/analytics/overview")
    assert response.status_code == 200
    data = response.json()
    assert "total_projects" in data
    assert data["total_projects"] >= 4
    assert "total_hectares" in data
    assert "total_carbon_tco2e" in data
    assert "monthly_carbon_trends" in data
    assert len(data["monthly_carbon_trends"]) == 12
    assert "biodiversity_radar" in data
    assert len(data["biodiversity_radar"]["taxa"]) == 6
    assert "biome_breakdown" in data
    assert len(data["biome_breakdown"]) >= 3


def test_recent_activities(client):
    response = client.get("/api/v1/analytics/activities")
    assert response.status_code == 200
    activities = response.json()
    assert len(activities) >= 1
    assert "title" in activities[0]
    assert "action_type" in activities[0]
