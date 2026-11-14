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
