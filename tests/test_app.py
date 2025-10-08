# main/tests/test_app.py
import pytest

def test_average_normal(appmod):
    assert appmod.average([2, 4, 6]) == 4

def test_average_empty_raises(appmod):
    with pytest.raises(ValueError):
        appmod.average([])

def test_root_route(client):
    r = client.get("/")
    assert r.status_code == 200
    assert "Regular Snails" in r.data.decode()

def test_luca_route(client):
    r = client.get("/luca")
    assert r.status_code == 200
    assert "Luca" in r.data.decode()

def test_luca_json(client):
    r = client.get("/luca.json")
    assert r.status_code == 200
    assert r.get_json() == {"ok": True, "owner": "Luca", "team": "Regular Snails"}


