import random
import json
import os

class RLAgent:
    def __init__(self):
        self.q_table = {} # State -> {Action: Value}
        self.actions = ["hint", "visual_aid", "break", "mind_game", "video", "easier_problem"]
        self.learning_rate = 0.1
        self.discount_factor = 0.9
        self.epsilon = 0.2 # Exploration rate
        
        self.base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.model_path = os.path.join(self.base_path, 'data', 'rl_model.json')
        self.load_model()

    def get_state_key(self, affective_state):
        return affective_state

    def choose_action(self, state):
        state_key = self.get_state_key(state)
        
        if state_key not in self.q_table:
            self.q_table[state_key] = {a: 0.0 for a in self.actions}

        # Epsilon-greedy strategy
        if random.random() < self.epsilon:
            return random.choice(self.actions)
        
        # Exploit: Choose max Q-value
        return max(self.q_table[state_key], key=self.q_table[state_key].get)

    def learn(self, state, action, reward, next_state):
        state_key = self.get_state_key(state)
        next_state_key = self.get_state_key(next_state)
        
        if state_key not in self.q_table:
            self.q_table[state_key] = {a: 0.0 for a in self.actions}
        if next_state_key not in self.q_table:
            self.q_table[next_state_key] = {a: 0.0 for a in self.actions}

        current_q = self.q_table[state_key][action]
        max_next_q = max(self.q_table[next_state_key].values())
        
        # Q-Learning Update Rule
        new_q = current_q + self.learning_rate * (reward + self.discount_factor * max_next_q - current_q)
        self.q_table[state_key][action] = new_q
        
        self.save_model()

    def load_model(self):
        if os.path.exists(self.model_path):
            with open(self.model_path, 'r') as f:
                self.q_table = json.load(f)

    def save_model(self):
        with open(self.model_path, 'w') as f:
            json.dump(self.q_table, f)
