import requests
import json
import os

class AIAssistant:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
        
        self.system_prompt = """
        You are the "Neon Guide", an intelligent AI assistant embedded within the "AI Learning System" application.
        Your goal is to help users navigate the app, understand features, and answer basic learning questions.

        Application Structure & Features:
        1. **Dashboard** (/): The main hub. Shows the "Personalized Study Plan", "Knowledge Graph" (visualizing progress), and "Current Progress" stats.
        2. **AI Tutor** (/tutor): The core learning engine. Users can enter a topic (or click one from the plan) to get a generated lesson with images and quizzes. It adapts to their emotional state.
        3. **Progress** (/progress): Detailed analytics of their learning journey.
        4. **Settings** (/settings): User preferences.

        Capabilities:
        - **Navigation**: If a user asks "Go to settings" or "Where is the tutor?", provide the path (e.g., "/settings") in your response strictly as a JSON action if possible, or just describe it.
        - **Q&A**: Answer general questions about the app or brief learning questions.
        - **Tone**: Helpful, encouraging, futuristic, and concise.

        Response Format:
        You must return a JSON object:
        {
            "message": "Your text response here...",
            "action": "navigate" | "none",
            "target": "/path/to/route" (if action is navigate)
        }
        Do not include markdown formatting like ```json. Just the raw JSON string.
        """

    def chat(self, user_message, context=None):
        prompt = f"""
        {self.system_prompt}

        User Message: "{user_message}"
        Context: {context or 'No specific context'}

        Response:
        """
        
        url = f"{self.base_url}?key={self.api_key}"
        headers = {'Content-Type': 'application/json'}
        data = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        
        try:
            response = requests.post(url, headers=headers, json=data)
            response.raise_for_status()
            result = response.json()
            text = result['candidates'][0]['content']['parts'][0]['text']
            
            # Clean up markdown if present
            # Robust JSON extraction
            start = text.find('{')
            end = text.rfind('}') + 1
            if start != -1 and end != -1:
                json_str = text[start:end]
                return json.loads(json_str)
            else:
                raise ValueError(f"No JSON found in response: {text}")
        except Exception as e:
            print(f"Assistant Error: {e}")
            return {
                "message": "I'm having trouble connecting to my neural network. Please try again.",
                "action": "none"
            }
