from datetime import datetime
import json
from models import db, Interaction

class InteractionLogger:
    def __init__(self, learner_profile_manager):
        # lp_manager is kept for compatibility if needed, but we write to DB directly
        self.lp_manager = learner_profile_manager

    def log_interaction(self, learner_id, interaction_data):
        """
        interaction_data: {
            "concept_id": str,
            "action": str (e.g., "submit_answer", "view_concept"),
            "is_correct": bool,
            "response_time_ms": int,
            "timestamp": isoformat str (optional)
        }
        """
        new_interaction = Interaction(
            user_id=learner_id,
            concept_id=interaction_data.get('concept_id'),
            action=interaction_data.get('action'),
            is_correct=interaction_data.get('is_correct', False),
            response_time_ms=interaction_data.get('response_time_ms', 0),
            timestamp=datetime.utcnow(), # Use server time
            details=json.dumps({k:v for k,v in interaction_data.items() if k not in ['concept_id', 'action', 'is_correct', 'response_time_ms']})
        )
        
        db.session.add(new_interaction)
        db.session.commit()
        
        return new_interaction.to_dict()
