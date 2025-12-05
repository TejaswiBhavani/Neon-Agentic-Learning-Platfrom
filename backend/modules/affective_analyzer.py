from datetime import datetime

class AffectiveAnalyzer:
    def __init__(self):
        pass

    def analyze_state(self, interaction_log):
        """
        Advanced Affective State Detection using Weighted Scoring.
        
        Analyzes the last N interactions to determine the learner's current emotional state.
        Uses a weighted combination of:
        - Error Rate (Weight: 0.5)
        - Response Latency (Weight: 0.3)
        - Idle Time (Weight: 0.2)
        """
        if not interaction_log:
            return "neutral"

        recent_logs = interaction_log[-5:] # Analyze last 5 interactions
        
        # 1. Calculate Error Rate Score (0-1)
        incorrect_count = sum(1 for log in recent_logs if not log.get('is_correct', True))
        error_rate = incorrect_count / len(recent_logs)
        
        # 2. Calculate Latency Score (Normalized)
        # Assume average expected time is 30s (30000ms). >60s is high latency.
        avg_latency = sum(log.get('response_time_ms', 0) for log in recent_logs) / len(recent_logs)
        latency_score = min(avg_latency / 60000, 1.0) # Cap at 1.0 (60s)

        # 3. Detect Boredom/Fatigue (Fast clicking + High Errors OR Very Long Idle)
        # (Simplified here as just high latency for now, but could be expanded)
        
        # Weighted Decision Logic
        # High Error + High Latency = Struggling
        # High Error + Low Latency = Confused (Guessing)
        # Low Error + High Latency = Fatigued (Slow but correct)
        # Low Error + Low Latency = Engaged (Flow state)

        if error_rate > 0.6:
            if latency_score > 0.7:
                return "struggling" # Hard problem, getting it wrong
            else:
                return "confused" # Fast guessing, getting it wrong
        
        if error_rate < 0.2:
            if latency_score > 0.8:
                return "fatigued" # Doing well but very slow/bored
            elif latency_score < 0.5:
                return "engaged" # Flow state
            
        return "neutral"

    def get_risk_score(self, interaction_log):
        if not interaction_log:
            return 0
        
        recent_logs = interaction_log[-10:] # Look at last 10
        
        # Factors increasing risk
        struggle_count = sum(1 for log in recent_logs if not log.get('is_correct', True))
        fatigue_indicators = 0 # Placeholder for more complex logic
        
        # Simple heuristic: Risk is proportional to error rate
        risk = (struggle_count / len(recent_logs)) * 100
        
        # Cap at 100
        return min(round(risk), 100)
