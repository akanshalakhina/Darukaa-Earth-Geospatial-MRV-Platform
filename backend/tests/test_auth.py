def test_login_success(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "demo@darukaa.earth", "password": "Darukaa2025!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "demo@darukaa.earth"


def test_login_invalid_password(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "demo@darukaa.earth", "password": "WrongPassword!"},
    )
    assert response.status_code == 401


def test_register_new_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newauditor@darukaa.earth",
            "password": "Password123!",
            "full_name": "Test Carbon Auditor",
            "role": "Carbon Auditor",
            "organization": "SGS Verra Audit",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newauditor@darukaa.earth"
    assert data["role"] == "Carbon Auditor"


def test_get_current_user_profile(client):
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "demo@darukaa.earth", "password": "Darukaa2025!"},
    )
    token = login_res.json()["access_token"]

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["email"] == "demo@darukaa.earth"
