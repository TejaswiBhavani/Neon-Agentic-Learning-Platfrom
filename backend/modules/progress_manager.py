from datetime import datetime, timedelta

class ProgressManager:
    def __init__(self, learner_profile_manager):
        self.lp_manager = learner_profile_manager

    def get_progress_stats(self, learner_id):
        learner = self.lp_manager.get_learner(learner_id)
        if not learner:
            return None

        completed_count = len(learner.get('completed_concepts', []))
        
        # Calculate total time spent from interaction log
        total_time_ms = sum(log.get('response_time_ms', 0) for log in learner.get('interaction_log', []))
        total_minutes = round(total_time_ms / 60000, 1)

        return {
            "completed_concepts": completed_count,
            "total_minutes_learned": total_minutes,
            "streak_days": self._calculate_streak(learner)
        }

    def _calculate_streak(self, learner):
        # Simple streak calculation based on interaction timestamps
        dates = set()
        for log in learner.get('interaction_log', []):
            if 'timestamp' in log:
                dt = datetime.fromisoformat(log['timestamp'])
                dates.add(dt.date())
        
        if not dates:
            return 0

        sorted_dates = sorted(list(dates), reverse=True)
        streak = 0
        today = datetime.now().date()
        
        # Check if learned today or yesterday to keep streak alive
        if sorted_dates[0] == today or sorted_dates[0] == today - timedelta(days=1):
            streak = 1
            current = sorted_dates[0]
            for i in range(1, len(sorted_dates)):
                if sorted_dates[i] == current - timedelta(days=1):
                    streak += 1
                    current = sorted_dates[i]
                else:
                    break
        return streak

    def get_badges(self, learner_id):
        learner = self.lp_manager.get_learner(learner_id)
        stats = self.get_progress_stats(learner_id)
        badges = []

        # Badge Logic
        if stats['completed_concepts'] >= 1:
            badges.append({"id": "first_step", "name": "First Step", "icon": "🌱", "description": "Completed your first concept"})
        
        if stats['completed_concepts'] >= 5:
            badges.append({"id": "high_five", "name": "High Five", "icon": "🖐️", "description": "Completed 5 concepts"})

        if stats['streak_days'] >= 3:
            badges.append({"id": "on_fire", "name": "On Fire", "icon": "🔥", "description": "3-day learning streak"})

        if stats['total_minutes_learned'] >= 60:
            badges.append({"id": "dedicated", "name": "Dedicated", "icon": "clock", "description": "Learned for over 1 hour"})

        return badges
