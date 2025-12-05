from .knowledge_graph import KnowledgeGraph
import networkx as nx

class StudyPlanGenerator:
    def __init__(self, learner_profile, kg_loader, lp_manager):
        self.learner = learner_profile
        self.kg_loader = kg_loader
        self.lp_manager = lp_manager

    def generate_plan(self, learner_id, domain):
        """
        Generates a personalized study plan using Topological Sort + Spaced Repetition.
        
        Algorithm:
        1. Load Knowledge Graph for the domain.
        2. Identify 'Completed' concepts from learner profile.
        3. Identify 'Struggling' concepts (Review Queue) based on interaction history.
        4. Perform Topological Sort to find the valid next steps.
        5. Prioritize Review concepts at the top of the list.
        """
        graph_data = self.kg_loader.load_graph_data(domain)
        if not graph_data:
            return []

        G = self.kg_loader.build_graph(graph_data)
        
        learner = self.lp_manager.get_learner(learner_id)
        completed = set(learner.get('completed_concepts', []))
        
        # 1. Identify Review Candidates (Simple Spaced Repetition)
        # Find concepts that were completed but had high error rates in interactions
        review_candidates = set()
        interaction_log = learner.get('interaction_log', [])
        concept_errors = {}
        
        for log in interaction_log:
            cid = log['concept_id']
            if cid not in concept_errors: concept_errors[cid] = 0
            if not log.get('is_correct', True):
                concept_errors[cid] += 1
        
        for cid, errors in concept_errors.items():
            if cid in completed and errors >= 2: # If completed but had 2+ errors
                review_candidates.add(cid)

        # 2. Topological Sort for New Content
        try:
            topo_order = list(nx.topological_sort(G))
        except nx.NetworkXUnfeasible:
            return [] # Cycle detected

        plan = []
        
        print(f"DEBUG: Completed concepts: {completed}")

        # Add Review Items First
        for concept_id in review_candidates:
            concept_data = next((c for c in graph_data['nodes'] if c['id'] == concept_id), None)
            if concept_data:
                plan.append({
                    **concept_data,
                    "status": "review", # New status for frontend
                    "reason": "High error rate detected previously"
                })

        # Add New Content
        for concept_id in topo_order:
            if concept_id in completed and concept_id not in review_candidates:
                continue # Skip if completed and not for review
            
            concept_data = next((c for c in graph_data['nodes'] if c['id'] == concept_id), None)
            if not concept_data: continue

            # Check prerequisites
            prereqs = set(G.predecessors(concept_id))
            if prereqs.issubset(completed):
                status = "unlocked"
            else:
                status = "locked"
            
            print(f"DEBUG: Concept {concept_id} prereqs: {prereqs}, status: {status}")
            
            # Don't add completed items again unless they were review candidates (handled above)
            if concept_id not in completed:
                 plan.append({
                    **concept_data,
                    "status": status
                })

        return plan
