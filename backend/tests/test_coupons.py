def test_validate_valid_coupon(client):
    res = client.post("/api/coupons/validate", json={
        "code": "FRESH10",
        "subtotal": 2500.0
    })
    assert res.status_code == 200
    data = res.json()
    assert data["valid"] is True
    assert data["discount"] == 250.0  # 10% of 2500

def test_validate_invalid_coupon(client):
    res = client.post("/api/coupons/validate", json={
        "code": "NONEXISTENT999",
        "subtotal": 500.0
    })
    assert res.status_code == 200
    data = res.json()
    assert data["valid"] is False
    assert "Invalid or expired" in data["message"]

def test_validate_formatted_percentage_coupon(client):
    res = client.post("/api/coupons/validate", json={
        "code": "A1B2C3",
        "subtotal": 1500.0
    })
    assert res.status_code == 200
    data = res.json()
    assert data["valid"] is True
    assert data["discount"] == 150.0  # 10% of 1500
    assert "10% off" in data["message"]

def test_validate_formatted_fixed_coupon(client):
    res = client.post("/api/coupons/validate", json={
        "code": "P8Q2R1",
        "subtotal": 1000.0
    })
    assert res.status_code == 200
    data = res.json()
    assert data["valid"] is True
    assert data["discount"] == 200.0
    assert "₹200.0 off" in data["message"] or "₹200 off" in data["message"]

def test_validate_formatted_case_insensitive(client):
    res = client.post("/api/coupons/validate", json={
        "code": "x2y5z7",
        "subtotal": 1000.0
    })
    assert res.status_code == 200
    data = res.json()
    assert data["valid"] is True
    assert data["discount"] == 150.0  # 15% of 1000

def test_validate_formatted_min_order(client):
    res = client.post("/api/coupons/validate", json={
        "code": "A1B2C3",
        "subtotal": 200.0  # minOrder is 500
    })
    assert res.status_code == 200
    data = res.json()
    assert data["valid"] is False
    assert "Minimum order" in data["message"]
