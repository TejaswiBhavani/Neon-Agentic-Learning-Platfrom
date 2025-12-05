from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    dob = db.Column(db.String(10), nullable=True)
    age = db.Column(db.Integer, nullable=True)
    skill_level = db.Column(db.String(20), default='beginner')
    learning_goal = db.Column(db.String(200), nullable=True)
    preferred_style = db.Column(db.String(20), default='visual')
    current_domain = db.Column(db.String(50), default='Programming Basics')
    completed_concepts = db.Column(db.Text, default='[]') # Stored as JSON string
    theme = db.Column(db.String(20), default='dark')
    notifications = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "dob": self.dob,
            "age": self.age,
            "skill_level": self.skill_level,
            "learning_goal": self.learning_goal,
            "preferred_style": self.preferred_style,
            "current_domain": self.current_domain,
            "completed_concepts": json.loads(self.completed_concepts) if self.completed_concepts else [],
            "theme": self.theme,
            "notifications": self.notifications,
            "interaction_log": [] # Fetched separately usually, but kept for compatibility
        }

class Interaction(db.Model):
    __tablename__ = 'interactions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    concept_id = db.Column(db.String(50), nullable=False)
    action = db.Column(db.String(50), nullable=False)
    is_correct = db.Column(db.Boolean, default=False)
    response_time_ms = db.Column(db.Integer, default=0)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    details = db.Column(db.Text, nullable=True) # JSON string for extra details

    def to_dict(self):
        return {
            "concept_id": self.concept_id,
            "action": self.action,
            "is_correct": self.is_correct,
            "response_time_ms": self.response_time_ms,
            "timestamp": self.timestamp.isoformat(),
            "details": json.loads(self.details) if self.details else {}
        }

class EmotionalFeedback(db.Model):
    __tablename__ = 'emotional_feedback'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    topic = db.Column(db.String(200), nullable=False)
    emotion = db.Column(db.String(50), nullable=False)
    note = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "topic": self.topic,
            "emotion": self.emotion,
            "note": self.note,
            "timestamp": self.timestamp.isoformat()
        }
