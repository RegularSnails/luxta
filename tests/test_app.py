import pytest
from flask import session
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SECRET_KEY'] = 'test_secret'
    with app.test_client() as client:
        with app.app_context():
            yield client

def test_login_success(client):
    response = client.post('/login', data={
        'username': 'alex',
        'password': 'password123'
    }, follow_redirects=True)

    assert response.status_code == 200
    assert b'Login successful!' in response.data
    with client.session_transaction() as sess:
        assert sess['username'] == 'alex'

def test_login_failure(client):
    response = client.post('/login', data={
        'username': 'alex',
        'password': 'wrongpassword'
    }, follow_redirects=True)

    assert response.status_code == 200
    assert b'Invalid credentials' in response.data
    with client.session_transaction() as sess:
        assert 'username' not in sess