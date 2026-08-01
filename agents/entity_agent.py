"""
Entity Agent - Build knowledge graphs

Features:
- Entity extraction
- Relationship mapping
- Knowledge graph construction
- Semantic connections
- Entity hierarchy
"""

import os
import sys
from typing import List, Dict, Set, Optional
from dataclasses import dataclass, field

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import OPENAI_API_KEY


@dataclass
class Entity:
    """Represents a knowledge entity"""
    name: str
    type: str
    description: str = ""
    synonyms: List[str] = field(default_factory=list)
    related_entities: List[str] = field(default_factory=list)
    properties: Dict[str, str] = field(default_factory=dict)


@dataclass
class KnowledgeGraph:
    """Represents a knowledge graph"""
    root_entity: str
    entities: Dict[str, Entity] = field(default_factory=dict)
    relationships: List[Dict[str, str]] = field(default_factory=list)


class EntityAgent:
    """Agent for entity extraction and knowledge graph building"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or OPENAI_API_KEY
        
    def extract_entities(self, text: str) -> List[Entity]:
        """Extract entities from text"""
        # TODO: Implement NLP entity extraction
        entities = []
        return entities
    
    def classify_entity_type(self, entity_name: str, context: str) -> str:
        """Classify the type of entity"""
        medical_types = [
            "disease", "symptom", "treatment", "diagnosis",
            "medication", "procedure", "anatomy", "organism",
            "test", "specialty"
        ]
        # TODO: Implement entity classification
        return "concept"
    
    def find_relationships(self, entities: List[Entity]) -> List[Dict[str, str]]:
        """Find relationships between entities"""
        relationships = []
        # TODO: Implement relationship extraction
        return relationships
    
    def build_graph(self, topic: str, entities: List[Entity]) -> KnowledgeGraph:
        """Build a knowledge graph from entities"""
        graph = KnowledgeGraph(root_entity=topic)
        
        for entity in entities:
            graph.entities[entity.name] = entity
        
        graph.relationships = self.find_relationships(entities)
        
        return graph
    
    def expand_entity(self, entity_name: str, depth: int = 2) -> KnowledgeGraph:
        """Expand an entity into a knowledge graph"""
        print(f"🔍 Expanding entity: {entity_name}")
        
        # Example for veterinary domain
        example_graphs = {
            "Parvovirus": {
                "type": "virus",
                "related": [
                    ("Virus", "is_a"),
                    ("Perro", "affects"),
                    ("Vacuna", "prevented_by"),
                    ("Diarrea", "causes"),
                    ("Vómito", "causes"),
                    ("Leucopenia", "causes"),
                    ("Deshidratación", "causes"),
                    ("Pronóstico", "has")
                ]
            }
        }
        
        graph = KnowledgeGraph(root_entity=entity_name)
        
        # Add root entity
        graph.entities[entity_name] = Entity(
            name=entity_name,
            type="disease",
            description=f"{entity_name} - entidad principal"
        )
        
        # Add related entities (example logic)
        if entity_name in example_graphs:
            data = example_graphs[entity_name]
            for related_name, relation_type in data["related"]:
                related_entity = Entity(
                    name=related_name,
                    type=self.classify_entity_type(related_name, entity_name),
                    description=f"{related_name} - relacionado con {entity_name}"
                )
                graph.entities[related_name] = related_entity
                
                graph.relationships.append({
                    "from": entity_name,
                    "to": related_name,
                    "relation": relation_type
                })
        
        print(f"✓ Built graph with {len(graph.entities)} entities")
        print(f"✓ Found {len(graph.relationships)} relationships")
        
        return graph
    
    def get_entity_hierarchy(self, entity_name: str) -> List[str]:
        """Get hierarchical structure for an entity"""
        hierarchy = [entity_name]
        # TODO: Implement hierarchy extraction
        return hierarchy
    
    def find_synonyms(self, entity_name: str) -> List[str]:
        """Find synonyms for an entity"""
        # TODO: Implement synonym discovery
        return [entity_name]
    
    def validate_graph(self, graph: KnowledgeGraph) -> bool:
        """Validate knowledge graph consistency"""
        # Check all relationships reference valid entities
        entity_names = set(graph.entities.keys())
        
        for rel in graph.relationships:
            if rel["from"] not in entity_names or rel["to"] not in entity_names:
                return False
        
        return True
    
    def visualize_graph(self, graph: KnowledgeGraph) -> str:
        """Create text visualization of graph"""
        lines = [f"Knowledge Graph: {graph.root_entity}", "=" * 40]
        
        for entity_name, entity in graph.entities.items():
            lines.append(f"\n📌 {entity_name} ({entity.type})")
            if entity.description:
                lines.append(f"   └─ {entity.description}")
            if entity.related_entities:
                lines.append(f"   └─ Related: {', '.join(entity.related_entities[:5])}")
        
        lines.append("\n📊 Relationships:")
        for rel in graph.relationships:
            lines.append(f"   {rel['from']} --[{rel['relation']}]--> {rel['to']}")
        
        return "\n".join(lines)


if __name__ == "__main__":
    # Test the agent
    agent = EntityAgent()
    
    # Build knowledge graph for Parvovirus
    graph = agent.expand_entity("Parvovirus")
    
    print("\n" + "=" * 60)
    print(agent.visualize_graph(graph))
    print("=" * 60)
    
    # Validate graph
    is_valid = agent.validate_graph(graph)
    print(f"\n✅ Graph valid: {is_valid}")
