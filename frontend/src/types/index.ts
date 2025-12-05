export interface Learner {
    id: string;
    name: string;
    email: string;
    skill_level: string;
    learning_goal: string;
    current_domain: string;
    completed_concepts: string[];
    interaction_log: any[];
    risk_score?: number;
    recommendation?: {
        action: string;
        reason: string;
        target: string;
    };
}

export interface Concept {
    id: string;
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    time_estimate: number;
    status: 'locked' | 'unlocked' | 'completed' | 'review';
    prerequisites: string[];
}

export interface Interaction {
    concept_id: string;
    action: string;
    is_correct?: boolean;
    response_time_ms?: number;
}

export interface AffectiveStateResponse {
    state: 'engaged' | 'confused' | 'struggling' | 'fatigued' | 'neutral';
}

export interface Intervention {
    type: 'hint' | 'easier_problem' | 'break' | 'challenge';
    message: string;
    action: string;
}
