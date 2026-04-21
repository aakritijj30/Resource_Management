"""
Tests for authentication endpoints.
"""
import pytest
from services.auth_service import hash_password
from models.user import User, RoleEnum
from tests.conftest import TestingSession


def seed_user(db, email="test@example.com", password="testpass", role=RoleEnum.employee):
    user = User(
        email=email,
        full_name="Test User",
        hashed_password=hash_password(password),
        role=role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_login_success(client, db):
    seed_user(db, email="auth_test@example.com", password="password123")
    resp = client.post("/auth/login", json={"email": "auth_test@example.com", "password": "password123"})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["role"] == "employee"


def test_login_wrong_password(client, db):
    seed_user(db, email="auth_test2@example.com", password="correctpass")
    resp = client.post("/auth/login", json={"email": "auth_test2@example.com", "password": "wrongpass"})
    assert resp.status_code == 401


def test_login_unknown_email(client):
    resp = client.post("/auth/login", json={"email": "nobody@example.com", "password": "x"})
    assert resp.status_code == 401


def test_get_me_authenticated(client, db):
    seed_user(db, email="me_test@example.com", password="pass")
    token_resp = client.post("/auth/login", json={"email": "me_test@example.com", "password": "pass"})
    token = token_resp.json()["access_token"]
    resp = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == "me_test@example.com"


def test_get_me_unauthenticated(client):
    resp = client.get("/auth/me")
    assert resp.status_code in (401, 403)
