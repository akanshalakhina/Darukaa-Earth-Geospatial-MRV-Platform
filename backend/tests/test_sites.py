def test_list_sites_geojson(client):
    response = client.get("/api/v1/sites?as_geojson=true")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert "features" in data
    assert len(data["features"]) >= 5
    feature = data["features"][0]
    assert feature["type"] == "Feature"
    assert "geometry" in feature
    assert feature["geometry"]["type"] == "Polygon"
    assert "properties" in feature
    assert "area_hectares" in feature["properties"]
    assert "centroid_lat" in feature["properties"]
    assert "centroid_lng" in feature["properties"]


def test_create_site_from_polygon(client):
    # Polygon in Costa Rica: coordinates [lng, lat]
    polygon_coords = [
        [-83.550, 8.520],
        [-83.520, 8.525],
        [-83.515, 8.490],
        [-83.545, 8.485],
        [-83.550, 8.520],
    ]
    payload = {
        "project_id": 1,
        "name": "Osa Peninsula Jaguar Corridor Parcel",
        "code": "CR-OSA-01",
        "habitat_type": "Pacific Lowland Rainforest",
        "elevation_m": 120.0,
        "carbon_density_tco2e_per_ha": 290.0,
        "canopy_cover_pct": 91.5,
        "species_richness": 260,
        "soil_organic_carbon_pct": 5.8,
        "threat_level": "Low",
        "monitoring_status": "Active Satellite Scan",
        "geometry": {
            "type": "Polygon",
            "coordinates": [polygon_coords],
        },
    }

    response = client.post("/api/v1/sites", json=payload)
    assert response.status_code == 201
    site = response.json()
    assert site["name"] == payload["name"]
    assert site["code"] == "CR-OSA-01"
    # Verify geodesic area and centroid were automatically computed
    assert site["area_hectares"] > 0
    assert 8.48 <= site["centroid_lat"] <= 8.53
    assert -83.56 <= site["centroid_lng"] <= -83.51

    site_id = site["id"]

    # Retrieve site analytics snapshots
    analytics_res = client.get(f"/api/v1/sites/{site_id}/analytics")
    assert analytics_res.status_code == 200
    snapshots = analytics_res.json()
    assert len(snapshots) >= 1
    assert "ndvi" in snapshots[0]

    # Clean up site
    del_res = client.delete(f"/api/v1/sites/{site_id}")
    assert del_res.status_code == 200


def test_invalid_polygon_rejected(client):
    payload = {
        "project_id": 1,
        "name": "Broken Polygon Site",
        "code": "BRK-01",
        "geometry": {
            "type": "LineString",  # Invalid type
            "coordinates": [[0, 0], [1, 1]],
        },
    }
    response = client.post("/api/v1/sites", json=payload)
    assert response.status_code in [422, 400]
