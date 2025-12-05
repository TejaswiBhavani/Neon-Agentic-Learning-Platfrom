import requests

BASE_URL = "http://localhost:5000/api"

def test_flow():
    # 1. Signup
    print("Signing up...")
    signup_data = {
        "name": "Plan Tester",
        "email": "plantest@example.com",
        "password": "password",
        "dob": "1990-01-01"
    }
    try:
        requests.post(f"{BASE_URL}/auth/signup", json=signup_data)
    except:
        pass # Ignore if already exists

    # 2. Login
    print("Logging in...")
    login_data = {"email": "plantest@example.com", "password": "password"}
    res = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if res.status_code != 200:
        print("Login failed:", res.text)
        return
    
    token = res.json()['token']
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Generate Plan
    print("Generating plan...")
    res = requests.post(f"{BASE_URL}/study-plans/generate", headers=headers)
    print("Plan Response:", res.status_code)
    print(res.json())

if __name__ == "__main__":
    test_flow()
