import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_api():
    # 1. Signup
    print("Testing Signup...")
    signup_data = {
        "name": "Test User 2",
        "email": "test2@example.com",
        "password": "password123"
    }
    try:
        res = requests.post(f"{BASE_URL}/auth/signup", json=signup_data)
        print(f"Signup Status: {res.status_code}")
        print(res.json())
    except Exception as e:
        print(f"Signup Failed: {e}")

    # 2. Login
    print("\nTesting Login...")
    login_data = {
        "email": "test2@example.com",
        "password": "password123"
    }
    token = None
    try:
        res = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"Login Status: {res.status_code}")
        data = res.json()
        print(data)
        token = data.get('token')
    except Exception as e:
        print(f"Login Failed: {e}")

    if token:
        headers = {"Authorization": f"Bearer {token}"}
        
        # 3. Generate Plan
        print("\nTesting Study Plan Generation...")
        try:
            res = requests.post(f"{BASE_URL}/study-plans/generate", headers=headers)
            print(f"Plan Status: {res.status_code}")
            print(f"Plan Items: {len(res.json())}")
        except Exception as e:
            print(f"Plan Generation Failed: {e}")

        # 4. Log Interaction
        print("\nTesting Interaction Logging...")
        interaction_data = {
            "concept_id": "prog_c1",
            "action": "submit_answer",
            "is_correct": False,
            "response_time_ms": 5000
        }
        try:
            res = requests.post(f"{BASE_URL}/interactions", json=interaction_data, headers=headers)
            print(f"Interaction Status: {res.status_code}")
            print(res.json())
        except Exception as e:
            print(f"Interaction Failed: {e}")

if __name__ == "__main__":
    test_api()
