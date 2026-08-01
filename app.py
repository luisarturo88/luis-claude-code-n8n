"""
LuisVet SEO AI - Main Application

Multi-agent SEO content generation system for veterinary content.
"""

import os
import sys
from typing import Dict, List, Optional

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import (
    BASE_DIR,
    PROMPTS_DIR,
    AGENTS_DIR,
    DATA_DIR,
    LOG_LEVEL
)

# Import agents
from agents.keyword_agent import KeywordAgent
from agents.serp_agent import SERPAgent
from agents.entity_agent import EntityAgent
from agents.medical_agent import MedicalAgent
from agents.writer_agent import WriterAgent
from agents.eeat_agent import EEATAgent
from agents.geo_agent import GEOAgent
from agents.schema_agent import SchemaAgent
from agents.image_agent import ImageAgent
from agents.blogger_agent import BloggerAgent
from agents.internal_links_agent import InternalLinksAgent
from agents.update_agent import UpdateAgent


class LuisVetSEOAI:
    """Main application orchestrator"""
    
    def __init__(self):
        # Initialize all agents
        self.keyword_agent = KeywordAgent()
        self.serp_agent = SERPAgent()
        self.entity_agent = EntityAgent()
        self.medical_agent = MedicalAgent()
        self.writer_agent = WriterAgent()
        self.eeat_agent = EEATAgent()
        self.geo_agent = GEOAgent()
        self.schema_agent = SchemaAgent()
        self.image_agent = ImageAgent()
        self.blogger_agent = BloggerAgent()
        self.internal_links_agent = InternalLinksAgent()
        self.update_agent = UpdateAgent()
        
        print("✅ LuisVet SEO AI System initialized")
        print(f"   📁 Base directory: {BASE_DIR}")
        print(f"   📝 Prompts directory: {PROMPTS_DIR}")
        print(f"   🤖 Agents directory: {AGENTS_DIR}")
        
    def generate_article(self, keyword: str, auto_publish: bool = False) -> Dict:
        """Complete article generation workflow"""
        print("\n" + "=" * 60)
        print(f"🚀 GENERATING ARTICLE: {keyword}")
        print("=" * 60)
        
        # Phase 1: Keyword Research
        print("\n📊 PHASE 1: Keyword Research")
        keyword_data = self.keyword_agent.research(keyword)
        
        # Phase 2: SERP Analysis
        print("\n🔍 PHASE 2: SERP Analysis")
        serp_results = self.serp_agent.analyze(keyword)
        serp_insights = self.serp_agent.get_insights(serp_results) if serp_results else {}
        
        # Phase 3: Entity Extraction
        print("\n🕸️ PHASE 3: Knowledge Graph")
        entity_graph = self.entity_agent.expand_entity(keyword.split()[0] if keyword else "topic")
        
        # Phase 4: Medical Review
        print("\n🏥 PHASE 4: Medical Content")
        medical_content = self.medical_agent.generate_medical_content(keyword.split()[0] if keyword else "topic")
        
        # Phase 5: Article Writing
        print("\n✍️ PHASE 5: Article Generation")
        article = self.writer_agent.write_article(
            keyword=keyword,
            serp_data={"intent": "informational", **serp_insights},
            medical_data={
                "symptoms": medical_content.differential_diagnosis,
                "treatments": medical_content.treatment_options
            },
            entities=list(entity_graph.entities.keys())
        )
        
        # Phase 6: EEAT Enhancement
        print("\n🎯 PHASE 6: EEAT Optimization")
        eeat_enhancement = self.eeat_agent.enhance_content(article.introduction, keyword)
        
        # Phase 7: GEO Optimization
        print("\n🤖 PHASE 7: GEO Optimization")
        geo_optimization = self.geo_agent.optimize_for_ai(article.introduction, keyword)
        
        # Phase 8: Schema Generation
        print("\n📋 PHASE 8: Structured Data")
        schema_data = {
            "title": article.title,
            "author": "Dr. Veterinario",
            "condition": keyword,
            "symptoms": medical_content.differential_diagnosis[:5],
            "treatments": medical_content.treatment_options[:5],
            "faqs": geo_optimization.faqs,
            "site_url": "https://luisvet.com"
        }
        complete_schema = self.schema_agent.generate_complete_schema(schema_data)
        print(f"   ✓ Generated {len(complete_schema.get('@graph', []))} schema types")
        
        # Phase 9: Image Generation
        print("\n🖼️ PHASE 9: Images")
        section_titles = [s["heading"] for s in article.sections]
        images = self.image_agent.generate_images_for_article(keyword, section_titles)
        
        # Phase 10: Internal Links
        print("\n🔗 PHASE 10: Internal Linking")
        internal_links = self.internal_links_agent.get_link_suggestions(
            keyword, 
            article.introduction
        )
        
        # Phase 11: Publishing (optional)
        if auto_publish:
            print("\n📝 PHASE 11: Publishing to Blogger")
            publish_data = {
                "title": article.title,
                "content": article.introduction,
                "topic": keyword,
                "slug": article.slug,
                "meta_description": article.meta_description,
                "images": [{"url": img.url} for img in images]
            }
            result = self.blogger_agent.publish_article(publish_data)
        else:
            result = {"status": "draft", "message": "Article ready for review"}
        
        # Compile final output
        output = {
            "article": {
                "title": article.title,
                "slug": article.slug,
                "word_count": article.word_count,
                "reading_time": article.reading_time,
                "sections": len(article.sections)
            },
            "seo": {
                "keyword": keyword,
                "intent": "informational",
                "related_keywords": len(keyword_data[0].related_keywords) if keyword_data else 0
            },
            "medical": {
                "references": len(medical_content.scientific_references),
                "treatments": len(medical_content.treatment_options)
            },
            "geo": {
                "ai_readiness": self.geo_agent.get_ai_readiness_score("")["overall"],
                "faqs": len(geo_optimization.faqs),
                "direct_answers": len(geo_optimization.direct_answers)
            },
            "schema": {
                "types": len(complete_schema.get("@graph", [])),
                "valid": True
            },
            "images": len(images),
            "internal_links": len(internal_links),
            "publish_status": result
        }
        
        print("\n" + "=" * 60)
        print("✅ ARTICLE GENERATION COMPLETE")
        print("=" * 60)
        print(f"\n📄 Title: {output['article']['title']}")
        print(f"📊 Word count: {output['article']['word_count']}")
        print(f"⏱️ Reading time: {output['article']['reading_time']} min")
        print(f"🔍 SEO score: {output['geo']['ai_readiness']}/100")
        print(f"🏥 Medical references: {output['medical']['references']}")
        print(f"📋 Schema types: {output['schema']['types']}")
        print(f"🖼️ Images: {output['images']}")
        print(f"🔗 Internal links: {output['internal_links']}")
        print(f"📌 Status: {output['publish_status']['status']}")
        print("=" * 60)
        
        return output


def main():
    """Main entry point"""
    print("\n" + "=" * 60)
    print("🐾 LUISVET SEO AI SYSTEM")
    print("   Multi-Agent Veterinary Content Generator")
    print("=" * 60)
    
    # Initialize system
    app = LuisVetSEOAI()
    
    # Example usage
    keyword = "Parvovirus en perros"
    result = app.generate_article(keyword, auto_publish=False)
    
    return result


if __name__ == "__main__":
    main()
