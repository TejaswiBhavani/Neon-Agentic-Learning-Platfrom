from models import User, Interaction
import json
import uuid
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, date

class LearnerProfile:
    def __init__(self, db):
        self.db = db

    def calculate_age(self, dob_str):
        if not dob_str: return 25
        try:
            born = datetime.strptime(dob_str, "%Y-%m-%d").date()
            today = date.today()
            return today.year - born.year - ((today.month, today.day) < (born.month, born.day))
        except ValueError:
            return 25

    def create_learner(self, data):
        # Check if email exists
        if User.query.filter_by(email=data['email']).first():
            raise ValueError("Email already registered")

        # Calculate Age and Skill Level
        dob = data.get('dob')
        age = self.calculate_age(dob) if dob else 25
        
        if age < 13:
            skill_level = 'beginner'
            initial_domain = 'Mathematics Basics'
        elif age < 18:
            skill_level = 'intermediate'
            initial_domain = 'Programming Basics'
        else:
            skill_level = 'advanced'
            initial_domain = 'Data Science Fundamentals'

        new_user = User(
            id=data.get('id', str(uuid.uuid4())),
            name=data['name'],
            email=data['email'],
            password_hash=generate_password_hash(data['password']),
            dob=dob,
            age=age,
            skill_level=skill_level,
            learning_goal=data.get('learning_goal', ''),
            preferred_style=data.get('preferred_style', 'visual'),
            current_domain=data.get('current_domain', initial_domain),
            completed_concepts='[]'
        )
        
        self.db.session.add(new_user)
        self.db.session.commit()
        return new_user.to_dict()

    def get_learner(self, learner_id):
        user = User.query.get(learner_id)
        if user:
            user_dict = user.to_dict()
            # Fetch interactions
            interactions = Interaction.query.filter_by(user_id=learner_id).all()
            user_dict['interaction_log'] = [i.to_dict() for i in interactions]
            return user_dict
        return None

    def get_learner_by_email(self, email):
        user = User.query.filter_by(email=email).first()
        return user.to_dict() if user else None

    def validate_login(self, email, password):
        user = User.query.filter_by(email=email).first()
        if user and check_password_hash(user.password_hash, password):
            return user.to_dict()
        return None

    def update_learner(self, learner_id, updates):
        user = User.query.get(learner_id)
        if user:
            for key, value in updates.items():
                if key == 'completed_concepts':
                    user.completed_concepts = json.dumps(value)
                elif hasattr(user, key):
                    setattr(user, key, value)
            self.db.session.commit()
            return self.get_learner(learner_id) # Return full dict with interactions
        return None
