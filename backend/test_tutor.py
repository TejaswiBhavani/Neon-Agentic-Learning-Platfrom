import requests
import json

BASE_URL = 'http://localhost:5000/api'

def test_tutor():
    # 1. Signup/Login to get token
    email = "tutor_test@example.com"
    password = "password123"
    
    # Try login first
    res = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    if res.status_code != 200:
        # Signup if login fails
        res = requests.post(f"{BASE_URL}/auth/signup", json={
            "name": "Tutor Test",
            "email": email,
            "password": password,
            "age": 25
        })
        # Login again
        res = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    
    if res.status_code != 200:
        print("Login failed")
        return

    token = res.json()['token']
    headers = {'Authorization': f'Bearer {token}'}

    # 2. Request Content
    print("Requesting content for 'Python Lists'...")
    res = requests.post(f"{BASE_URL}/tutor/content", json={"topic": "Python Lists"}, headers=headers)
    
    print(f"Status Code: {res.status_code}")
    print(f"Response: {res.text}")

if __name__ == "__main__":
    test_tutor()
