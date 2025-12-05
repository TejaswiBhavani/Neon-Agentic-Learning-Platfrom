import networkx as nx
import json
import os

class KnowledgeGraph:
    def __init__(self, domain):
        self.domain = domain
        self.graph = nx.DiGraph()
        self.nodes_data = {}
        self.load_graph()

    def load_graph(self):
        self.graph = self.build_graph(self.load_graph_data(self.domain))
        # Populate nodes_data
        for node in self.graph.nodes(data=True):
            self.nodes_data[node[0]] = node[1]

    def load_graph_data(self, domain):
        # Determine path to mock data
        base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        file_path = os.path.join(base_path, 'data', 'mock_data', f'{domain.lower().replace(" ", "_")}_graph.json')
        
        if not os.path.exists(file_path):
            # Fallback for "programming" or "mathematics" short names
            if "prog" in domain.lower():
                file_path = os.path.join(base_path, 'data', 'mock_data', 'programming_graph.json')
            elif "math" in domain.lower():
                file_path = os.path.join(base_path, 'data', 'mock_data', 'mathematics_graph.json')
            elif "data" in domain.lower():
                file_path = os.path.join(base_path, 'data', 'mock_data', 'data_science_graph.json')
            else:
                return None # Return None instead of raising error for safer handling

        with open(file_path, 'r') as f:
            data = json.load(f)
            # Normalize data structure
            if 'concepts' in data and 'nodes' not in data:
                data['nodes'] = data['concepts']
            return data

    def build_graph(self, data):
        G = nx.DiGraph()
        if not data: return G
        
        # Handle "nodes" and "edges" format (Programming Graph)
        if 'nodes' in data:
            for node in data.get('nodes', []):
                G.add_node(node['id'], **node)
            for edge in data.get('edges', []):
                G.add_edge(edge['source'], edge['target'])
        
        # Handle "concepts" and "prerequisites" format (Data Science/Math Graph)
        elif 'concepts' in data:
            for concept in data.get('concepts', []):
                # Add node
                G.add_node(concept['id'], **concept)
                # Add edges from prerequisites
                for prereq in concept.get('prerequisites', []):
                    G.add_edge(prereq, concept['id'])
            
        return G

    def get_topological_sort(self):
        if not nx.is_directed_acyclic_graph(self.graph):
            raise ValueError("Graph contains cycles, cannot perform topological sort.")
        return list(nx.topological_sort(self.graph))

    def get_node_details(self, node_id):
        return self.nodes_data.get(node_id)

    def to_json(self):
        return nx.node_link_data(self.graph)
