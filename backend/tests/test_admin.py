def test_admin_stats_unauthorized_without_token(client):
    res = client.get("/api/admin/stats")
    assert res.status_code == 401

def test_admin_stats_with_admin_token(client):
    # Log in as admin
    login_res = client.post("/api/auth/login", json={
        "email": "admin@freshbasket.com",
        "password": "admin123"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    res = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert "totalRevenue" in data
    assert "totalOrders" in data
    assert "totalUsers" in data
    assert "totalProducts" in data
    assert "monthlyRevenue" in data
    assert isinstance(data["monthlyRevenue"], list)
    assert len(data["monthlyRevenue"]) == 6

def test_admin_inventory_endpoints(client):
    login_res = client.post("/api/auth/login", json={
        "email": "admin@freshbasket.com",
        "password": "admin123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    low_res = client.get("/api/admin/inventory/low-stock", headers=headers)
    assert low_res.status_code == 200
    assert isinstance(low_res.json(), list)

    best_res = client.get("/api/admin/inventory/best-sellers", headers=headers)
    assert best_res.status_code == 200
    assert isinstance(best_res.json(), list)

