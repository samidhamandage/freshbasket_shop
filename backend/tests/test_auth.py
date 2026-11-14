import pytest
import uuid

def test_health_check(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}

def test_login_demo_admin(client):
    res = client.post("/api/auth/login", json={
        "email": "admin@freshbasket.com",
        "password": "admin123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "ADMIN"
    assert data["user"]["email"] == "admin@freshbasket.com"

def test_register_validation_name_failure(client):
    res = client.post("/api/auth/register", json={
        "name": "John123",
        "email": f"test_{uuid.uuid4().hex[:6]}@example.com",
        "password": "Password@123"
    })
    assert res.status_code == 400
    assert "Full Name must contain only alphabetic letters and spaces" in res.text

def test_register_validation_password_failure(client):
    res = client.post("/api/auth/register", json={
        "name": "John Doe",
        "email": f"test_{uuid.uuid4().hex[:6]}@example.com",
        "password": "password"  # no uppercase, no number, no special char
    })
    assert res.status_code == 400

def test_register_and_auto_login_success(client):
    unique_email = f"py_user_{uuid.uuid4().hex[:6]}@example.com"
    res = client.post("/api/auth/register", json={
        "name": "Python Tester",
        "email": unique_email,
        "password": "Valid@Password123"
    })
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["name"] == "Python Tester"
    assert data["user"]["email"] == unique_email
    assert data["user"]["role"] == "USER"

    # Verify duplicate email is rejected
    dup_res = client.post("/api/auth/register", json={
        "name": "Another Tester",
        "email": unique_email,
        "password": "Valid@Password123"
    })
    assert dup_res.status_code == 400
