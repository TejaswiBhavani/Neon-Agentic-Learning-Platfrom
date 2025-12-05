from .rl_agent import RLAgent

class InterventionEngine:
    def __init__(self):
        self.rl_agent = RLAgent()

    def get_intervention(self, affective_state, current_concept):
        # Use RL Agent to choose action based on state
        action = self.rl_agent.choose_action(affective_state)
        
        # Map RL actions to intervention objects
        if action == "hint":
            return {"type": "hint", "message": "Here is a hint to help you...", "action": "show_hint"}
        elif action == "visual_aid":
            return {
                "type": "visual_aid",
                "message": f"Here is a visual diagram for {current_concept}.",
                "action": "show_visual"
            }
        elif action == "break":
            return {
                "type": "break",
                "message": "You've been working hard! Take a 5-minute break.",
                "action": "suggest_break"
            }
        elif action == "mind_game":
            return {
                "type": "mind_game",
                "message": "Feeling tired? Let's play a quick mind game to refocus!",
                "action": "start_game"
            }
        elif action == "video":
            return {
                "type": "video",
                "message": "Let's take a moment to relax with a short video.",
                "action": "play_video"
            }
        elif action == "easier_problem":
            return {
                "type": "easier_problem",
                "message": "Let's try a simpler example first.",
                "action": "decrease_difficulty"
            }
        return None

    def get_recommendation(self, risk_score, current_domain):
        if risk_score > 70:
            return {
                "action": "Review Foundations",
                "reason": "High risk of dropout detected. Strengthening basics is recommended.",
                "target": "beginner_concepts"
            }
        elif risk_score > 40:
            return {
                "action": "Practice More",
                "reason": "You're doing okay, but a bit more practice will help solidify concepts.",
                "target": "practice_problems"
            }
        else:
            return {
                "action": "Advance to Next Level",
                "reason": "Great performance! You are ready for more advanced topics.",
                "target": "advanced_concepts"
            }
