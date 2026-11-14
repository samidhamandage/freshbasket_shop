def test_create_order_unauthorized(client):
    client.cookies.clear()
    res = client.post("/api/orders", json={
        "items": [],
        "shipping": {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "9876543210",
            "address": "123 Green Street",
            "city": "Mumbai",
            "state": "Maharashtra",
            "zip": "400001"
        },
        "subtotal": 100.0,
        "deliveryFee": 0.0,
        "discount": 0.0,
        "total": 100.0
    })
    assert res.status_code == 401

def test_get_orders_authenticated(client):
    login_res = client.post("/api/auth/login", json={
        "email": "admin@freshbasket.com",
        "password": "admin123"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    res = client.get("/api/orders", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    orders = res.json()
    assert isinstance(orders, list)
    if len(orders) > 0:
        o = orders[0]
        assert "id" in o
        assert "status" in o
        assert "total" in o
