from flask import Flask, jsonify, request
from flask_cors import CORS
import jwt
import os
from dotenv import load_dotenv

load_dotenv()
import datetime
from functools import wraps

from modules.learner_profile import LearnerProfile
from modules.knowledge_graph import KnowledgeGraph
from modules.study_plan_generator import StudyPlanGenerator
from modules.interaction_logger import InteractionLogger
from modules.affective_analyzer import AffectiveAnalyzer
from modules.intervention_engine import InterventionEngine

from models import db, User, Interaction, EmotionalFeedback

app = Flask(__name__)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'})

app.config['SECRET_KEY'] = 'your_secret_key_here'
# PostgreSQL Connection
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:root123@localhost:5433/ai_learning_system'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Create tables within app context
with app.app_context():
    db.create_all()

# Auth Decorator REMOVED

# Helper to get a default user for now
def get_default_user():
    # 1. Try fetching by ID
    user = lp_manager.get_learner("guest_user")
    if user:
        return user

    # 2. Try fetching by Email (in case it exists with a different ID)
    user = lp_manager.get_learner_by_email("guest@example.com")
    if user:
        return user

    # 3. Create if doesn't exist
    try:
        return lp_manager.create_learner({
            "id": "guest_user", 
            "name": "Guest", 
            "email": "guest@example.com", 
            "password": "guest"
        })
    except Exception as e:
        print(f"Error creating guest user: {e}")
        return None

from modules.ai_tutor import AITutor
from modules.assistant import AIAssistant

# Initialize Modules
# We pass 'db' to LearnerProfile to use models
lp_manager = LearnerProfile(db)
interaction_logger = InteractionLogger(lp_manager)
affective_analyzer = AffectiveAnalyzer()
intervention_engine = InterventionEngine()
ai_tutor = AITutor(api_key=os.getenv("GEMINI_API_KEY"))
assistant = AIAssistant(api_key=os.getenv("GEMINI_API_KEY"))

# Create default guest user on startup
with app.app_context():
    try:
        if not lp_manager.get_learner("guest_user"):
             lp_manager.create_learner({"name": "Guest", "email": "guest@example.com", "password": "guest"})
    except Exception as e:
        print(f"Guest user setup warning: {e}")

@app.route('/api/tutor/content', methods=['POST'])
def get_tutor_content():
    current_user = get_default_user()
    data = request.json
    topic = data.get('topic')
    if not topic:
        return jsonify({'message': 'Topic is required'}), 400
    
    content = ai_tutor.generate_content(topic, current_user.get('skill_level', 'intermediate'))
    return jsonify({'content': content})

@app.route('/api/tutor/quiz', methods=['POST'])
def get_tutor_quiz():
    data = request.json
    content = data.get('content')
    if not content:
        return jsonify({'message': 'Content is required'}), 400
    
    quiz = ai_tutor.generate_quiz(content)
    return jsonify({'quiz': quiz})

@app.route('/api/tutor/evaluate', methods=['POST'])
def evaluate_tutor_quiz():
    data = request.json
    content = data.get('content')
    user_answers = data.get('user_answers')
    quiz_questions = data.get('quiz_questions')
    
    if not all([content, user_answers, quiz_questions]):
        return jsonify({'message': 'Missing data for evaluation'}), 400
    
    feedback = ai_tutor.evaluate_quiz(content, user_answers, quiz_questions)
    return jsonify({'feedback': feedback})

@app.route('/api/feedback', methods=['POST'])
def save_feedback():
    current_user = get_default_user()
    data = request.json
    
    emotion = data.get('emotion')
    topic = data.get('topic')
    note = data.get('note', '')
    
    if not emotion or not topic:
        return jsonify({'message': 'Emotion and topic are required'}), 400
        
    feedback = EmotionalFeedback(
        user_id=current_user['id'],
        topic=topic,
        emotion=emotion,
        note=note
    )
    
    try:
        db.session.add(feedback)
        db.session.commit()
        return jsonify({'message': 'Feedback saved successfully', 'id': feedback.id})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error saving feedback', 'error': str(e)}), 500

# --- Learner Routes ---
@app.route('/api/learners/<learner_id>', methods=['GET'])
def get_learner(learner_id):
    current_user = get_default_user()
    # Dynamic Analysis
    risk_score = affective_analyzer.get_risk_score(current_user['interaction_log'])
    recommendation = intervention_engine.get_recommendation(risk_score, current_user['current_domain'])
    
    response = current_user.copy()
    response['risk_score'] = risk_score
    response['recommendation'] = recommendation
    
    return jsonify(response)

@app.route('/api/learners/<learner_id>/switch-domain', methods=['POST'])
def switch_domain(learner_id):
    data = request.get_json()
    new_domain = data.get('domain')
    lp_manager.update_learner(learner_id, {'current_domain': new_domain})
    return jsonify({'message': f'Switched to {new_domain}'})

@app.route('/api/domains', methods=['GET'])
def get_domains():
    return jsonify([
        {"id": "Programming Basics", "name": "Programming Basics"},
        {"id": "Mathematics Basics", "name": "Mathematics Basics"},
        {"id": "Data Science", "name": "Data Science Fundamentals"}
    ])

# --- Study Plan Routes ---
@app.route('/api/study-plans/generate', methods=['POST'])
def generate_plan():
    current_user = get_default_user()
    try:
        # Always generate fresh based on current state
        # Pass dependencies: learner_profile, kg_loader (KnowledgeGraph instance), lp_manager
        print(f"DEBUG: Requesting plan for user {current_user['id']} domain {current_user['current_domain']}")
        kg_loader = KnowledgeGraph(current_user['current_domain'])
        generator = StudyPlanGenerator(current_user, kg_loader, lp_manager)
        plan = generator.generate_plan(current_user['id'], current_user['current_domain'])
        return jsonify(plan)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'message': 'Internal Server Error', 'error': str(e), 'trace': traceback.format_exc()}), 500

@app.route('/api/domains/<domain>/graph/visualization', methods=['GET'])
def get_graph_viz(domain):
    try:
        kg = KnowledgeGraph(domain)
        return jsonify(kg.to_json())
    except ValueError as e:
        return jsonify({'message': str(e)}), 404
from modules.question_bank import QuestionBank
question_bank = QuestionBank()

@app.route('/api/questions/<concept_id>', methods=['GET'])
def get_question(concept_id):
    question = question_bank.get_question(concept_id)
    return jsonify(question)

@app.route('/api/learners/<learner_id>/settings', methods=['PUT'])
def update_settings(learner_id):
    data = request.get_json()
    # Update allowed fields
    allowed_fields = ['name', 'email', 'learning_goal', 'skill_level', 'theme', 'notifications']
    updates = {k: v for k, v in data.items() if k in allowed_fields}
    
    lp_manager.update_learner(learner_id, updates)
    return jsonify({'message': 'Settings updated successfully', 'user': lp_manager.get_learner(learner_id)})

@app.route('/api/learners/<learner_id>/progress', methods=['GET'])
def get_progress(learner_id):
    stats = progress_manager.get_progress_stats(learner_id)
    return jsonify(stats)

@app.route('/api/learners/<learner_id>/badges', methods=['GET'])
def get_badges(learner_id):
    badges = progress_manager.get_badges(learner_id)
    return jsonify(badges)

@app.route('/api/assistant/chat', methods=['POST'])
def chat_assistant():
    data = request.json
    message = data.get('message')
    context = data.get('context')
    
    if not message:
        return jsonify({'error': 'Message required'}), 400
        
    response = assistant.chat(message, context)
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
