import requests
import json
import os

class AITutor:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

    def _call_gemini(self, prompt):
        url = f"{self.base_url}?key={self.api_key}"
        headers = {'Content-Type': 'application/json'}
        data = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        import time
        retries = 5
        base_delay = 2
        for attempt in range(retries):
            try:
                response = requests.post(url, headers=headers, json=data)
                response.raise_for_status()
                result = response.json()
                with open('debug_tutor.log', 'w') as f:
                    f.write(json.dumps(result, indent=2))
                # Extract text from response
                text = result['candidates'][0]['content']['parts'][0]['text']
                # Clean up potential markdown code blocks
                lines = text.split('\n')
                if lines[0].strip().startswith("```"):
                    lines = lines[1:]
                if lines[-1].strip() == "```":
                    lines = lines[:-1]
                return "\n".join(lines).strip()
            except requests.exceptions.HTTPError as e:
                if e.response.status_code == 429:
                    delay = base_delay * (2 ** attempt)
                    print(f"Rate limit hit, retrying in {delay} seconds...")
                    time.sleep(delay)
                    continue
                with open('debug_tutor.log', 'a') as f:
                    f.write(f"\nError: {str(e)}")
                if 'response' in locals():
                    print(f"Response Status: {response.status_code}")
                    print(f"Response Body: {response.text}")
                return None
            except Exception as e:
                with open('debug_tutor.log', 'a') as f:
                    f.write(f"\nError: {str(e)}")
                return None
        return None

    def generate_content(self, topic, difficulty_level='intermediate'):
        """
        Generates educational content for a given topic.
        """
        prompt = f"""
        You are an expert AI Tutor. Create a comprehensive, structured lesson on the topic: "{topic}".
        Target Audience: {difficulty_level} level learner.

        Format requirements:
        1. Use clear Markdown structure with headers (#, ##, ###).
        2. Start with an engaging Introduction.
        3. Break down the topic into Key Concepts.
        4. Use bullet points and code blocks where appropriate.
        5. Include 2-3 relevant images to illustrate key points. 
           - Embed them directly using this Markdown format: ![Image Description](https://image.pollinations.ai/prompt/Image%20Description?width=800&height=400&nologo=true&model=flux)
           - Replace "Image Description" with a specific, descriptive prompt for the image (e.g., "Diagram of a binary tree", "Portrait of Isaac Newton").
           - URL encode the description in the link if possible, or keep it simple.
        6. End with a Summary and a "Further Reading" section.

        Make the content visually appealing and easy to digest.
        """
        content = self._call_gemini(prompt)
        return content if content else "Sorry, I couldn't generate content at this time. Please try again."

    def generate_quiz(self, content):
        """
        Generates a 5-question quiz based on the provided content.
        """
        prompt = f"""
        Based on the following content, create a 5-question multiple-choice quiz.
        
        Content:
        {content}
        
        Output format must be a strictly valid JSON array of objects, like this:
        [
            {{
                "id": 1,
                "question": "Question text here?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_answer": "Option A"
            }}
        ]
        Do not include any markdown formatting (like ```json) in the response, just the raw JSON string.
        """
        response_text = self._call_gemini(prompt)
        if not response_text:
            return []
            
        try:
            return json.loads(response_text)
        except Exception as e:
            print(f"Error parsing quiz JSON: {e}")
            return []

    def evaluate_quiz(self, content, user_answers, quiz_questions):
        """
        Evaluates the user's quiz answers and provides feedback.
        user_answers: dict of {question_id: selected_option}
        """
        prompt = f"""
        You are an AI Tutor. A user just took a quiz on the following content.
        
        Content:
        {content}
        
        Quiz Questions & Correct Answers:
        {json.dumps(quiz_questions)}
        
        User's Answers:
        {json.dumps(user_answers)}
        
        Please evaluate the quiz and return a STRICT JSON object with this structure:
        {{
            "score": <int, number of correct answers>,
            "total": <int, total questions>,
            "summary": "<string, brief encouraging summary>",
            "next_steps": "<string, specific recommendation on what to review or learn next>",
            "results": [
                {{
                    "id": <int, question id>,
                    "question": "<string>",
                    "user_answer": "<string>",
                    "correct_answer": "<string>",
                    "is_correct": <boolean>,
                    "explanation": "<string, brief explanation of why the answer is correct/incorrect>"
                }}
            ]
        }}
        Do not include any markdown formatting (like ```json) in the response, just the raw JSON string.
        """
        response_text = self._call_gemini(prompt)
        if not response_text:
            return None
            
        try:
            return json.loads(response_text)
        except Exception as e:
            print(f"Error parsing evaluation JSON: {e}")
            return None
