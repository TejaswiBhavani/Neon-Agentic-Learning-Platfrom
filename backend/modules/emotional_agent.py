import random
import json
import requests
import os

class EmotionalAgent:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
        
        self.games = [
            {"id": "reaction", "name": "Quick Reaction", "type": "reaction", "duration": 60},
            {"id": "pattern", "name": "Pattern Match", "type": "pattern", "duration": 60},
            {"id": "memory", "name": "Memory Flip", "type": "memory", "duration": 60},
            {"id": "color", "name": "Color Click", "type": "color", "duration": 60},
        ]

    def _call_gemini(self, prompt):
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
            return result['candidates'][0]['content']['parts'][0]['text']
        except Exception as e:
            print(f"Gemini Error: {e}")
            return None

    def get_response(self, emotion, topic):
        """
        Determines the appropriate intervention or response based on emotion.
        Returns a dict with 'type', 'content', and 'metadata'.
        """
        if emotion == 'exhausted': # Frustrated 😫
            game = random.choice(self.games)
            return {
                "type": "game",
                "content": f"Let's take a quick break with a {game['name']} game!",
                "metadata": game
            }

        elif emotion == 'tired': # Tired 🥱
            prompt = f"""
            Write a very short, simple manga-style story (max 200 words) related to the topic: "{topic}".
            Characters: A wise sensei and a curious student.
            Tone: Calm, relaxing, and encouraging.
            Format: Narrative text, no script format.
            Goal: Explain one key concept of the topic gently through the story.
            """
            story = self._call_gemini(prompt) or "Once upon a time, a learner took a well-deserved break..."
            return {
                "type": "story",
                "content": story,
                "metadata": {"title": f"The Tale of {topic}"}
            }

        elif emotion == 'good': # Good 🙂
            prompt = f"""
            Generate a short, encouraging fun fact or appreciation message about learning "{topic}".
            Tone: Friendly and supportive. Max 1 sentence.
            """
            message = self._call_gemini(prompt) or "You're doing great! Keep it up."
            return {
                "type": "message",
                "content": message.strip(),
                "metadata": {"style": "supportive"}
            }

        elif emotion == 'happy': # Happy 😃
            prompt = f"""
            Generate a simple, fun bonus challenge question about "{topic}".
            Format: Just the question.
            """
            challenge = self._call_gemini(prompt) or f"Can you explain {topic} to a 5-year-old?"
            return {
                "type": "challenge",
                "content": challenge.strip(),
                "metadata": {"difficulty": "easy"}
            }

        elif emotion == 'enthusiastic': # Enthusiastic 🤩
            prompt = f"""
            Generate a thought-provoking advanced concept extension or mini-challenge related to "{topic}".
            Tone: Exciting and challenging. Max 2 sentences.
            """
            challenge = self._call_gemini(prompt) or f"Ready to dive deeper into {topic}?"
            return {
                "type": "challenge",
                "content": challenge.strip(),
                "metadata": {"difficulty": "hard", "reward": "Expert Badge"}
            }

        return {
            "type": "none",
            "content": "",
            "metadata": {}
        }
