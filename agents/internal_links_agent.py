"""
Internal Links Agent - Manage internal linking

Features:
- Link suggestions
- Anchor text optimization
- Related content discovery
- Link structure analysis
"""

import os
import sys
from typing import List, Dict, Optional
from dataclasses import dataclass

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@dataclass
class InternalLink:
    """Represents an internal link"""
    url: str
    anchor_text: str
    title: str
    relevance_score: float


class InternalLinksAgent:
    """Agent for internal linking optimization"""
    
    def __init__(self):
        self.existing_posts = []  # Would be populated from database
        
    def find_related_content(self, topic: str) -> List[Dict]:
        """Find related content for internal linking"""
        related = {
            "Parvovirus": [
                {"url": "/vacunacion-cachorros", "title": "Calendario de Vacunación", "relevance": 0.95},
                {"url": "/sintomas-vomito-perro", "title": "Vómitos en Perros", "relevance": 0.85},
                {"url": "/deshidratacion-canina", "title": "Deshidratación en Perros", "relevance": 0.80},
                {"url": "/inmunidad-perros", "title": "Sistema Inmune Canino", "relevance": 0.75}
            ]
        }
        return related.get(topic, [])
    
    def suggest_anchor_texts(self, target_title: str) -> List[str]:
        """Suggest optimal anchor texts"""
        anchors = {
            "Calendario de Vacunación": [
                "calendario de vacunación completo",
                "guía de vacunas para cachorros",
                "cuándo vacunar a tu perro"
            ],
            "Vómitos en Perros": [
                "síntomas de vómitos",
                "causas del vómito canino",
                "tratamiento para vómitos"
            ]
        }
        return anchors.get(target_title, [target_title.lower()])
    
    def analyze_link_structure(self, url: str) -> Dict:
        """Analyze internal link structure of a page"""
        analysis = {
            "url": url,
            "internal_links_count": 15,
            "external_links_count": 5,
            "orphan_pages": [],
            "link_depth": 2
        }
        return analysis
    
    def get_link_suggestions(self, current_topic: str, content: str) -> List[InternalLink]:
        """Get internal link suggestions for content"""
        print(f"🔗 Finding internal links for: {current_topic}")
        
        related = self.find_related_content(current_topic)
        suggestions = []
        
        for item in related[:4]:
            anchors = self.suggest_anchor_texts(item["title"])
            link = InternalLink(
                url=item["url"],
                anchor_text=anchors[0] if anchors else item["title"],
                title=item["title"],
                relevance_score=item["relevance"]
            )
            suggestions.append(link)
            print(f"   ✓ {link.title} (relevance: {link.relevance_score})")
        
        return suggestions


if __name__ == "__main__":
    agent = InternalLinksAgent()
    suggestions = agent.get_link_suggestions("Parvovirus", "Sample content")
    
    print("\n" + "=" * 60)
    print("INTERNAL LINK SUGGESTIONS")
    print("=" * 60)
    for link in suggestions:
        print(f"\n📌 {link.title}")
        print(f"   URL: {link.url}")
        print(f"   Anchor: {link.anchor_text}")
        print(f"   Relevance: {link.relevance_score}")
    print("=" * 60)
