import requests
import json

BASE_URL = 'http://localhost:5000/api'

def test_quiz():
    # 1. Signup/Login to get token
    email = "tutor_test@example.com"
    password = "password123"
    
    # Try login
    res = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    if res.status_code != 200:
        print("Login failed")
        return

    token = res.json()['token']
    headers = {'Authorization': f'Bearer {token}'}

    # 2. Request Quiz
    print("Requesting quiz for 'Python Lists'...")
    # We provide some dummy content context
    content = "Python lists are mutable sequences, typically used to store collections of homogeneous items."
    
    res = requests.post(f"{BASE_URL}/tutor/quiz", json={"content": content}, headers=headers)
    
    print(f"Status Code: {res.status_code}")
    print(f"Response: {res.text}")

if __name__ == "__main__":
    test_quiz()
