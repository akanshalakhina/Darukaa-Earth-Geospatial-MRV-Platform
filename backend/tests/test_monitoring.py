def test_monitoring_constellation(client):
    response = client.get("/api/v1/monitoring/constellation")
    assert response.status_code == 200
    satellites = response.json()
    assert len(satellites) >= 4
    names = [s["satellite_name"] for s in satellites]
    assert any("Sentinel-2" in n for n in names)


def test_monitoring_alerts(client):
    response = client.get("/api/v1/monitoring/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert isinstance(alerts, list)


def test_monitoring_overview(client):
    response = client.get("/api/v1/monitoring/overview")
    assert response.status_code == 200
    overview = response.json()
    assert "active_satellites" in overview
    assert "total_alerts_last_30d" in overview
    assert "critical_alerts_count" in overview
    assert "recent_alerts" in overview
