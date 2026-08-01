"""
Writer Agent - Generate complete articles

Features:
- Full article generation
- SEO-optimized content
- Natural language flow
- Header structure
- Internal linking suggestions
- Call-to-action placement
"""

import os
import sys
from typing import List, Dict, Optional
from dataclasses import dataclass, field

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import OPENAI_API_KEY, MIN_CONTENT_LENGTH, MAX_CONTENT_LENGTH


@dataclass
class Article:
    """Represents a generated article"""
    title: str
    meta_description: str
    slug: str
    introduction: str
    sections: List[Dict] = field(default_factory=list)
    conclusion: str = ""
    call_to_action: str = ""
    word_count: int = 0
    reading_time: int = 0


class WriterAgent:
    """Agent for article generation"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or OPENAI_API_KEY
        self.min_length = MIN_CONTENT_LENGTH
        self.max_length = MAX_CONTENT_LENGTH
        
    def generate_title(self, keyword: str, serp_data: Dict = None) -> str:
        """Generate SEO-optimized title"""
        # TODO: Implement AI-powered title generation
        return f"Guía Completa sobre {keyword}"
    
    def generate_meta_description(self, content: str, keyword: str) -> str:
        """Generate meta description (150-160 characters)"""
        # TODO: Implement meta description generation
        return f"Descubre todo sobre {keyword}. Información completa y actualizada."[:160]
    
    def generate_slug(self, title: str) -> str:
        """Generate URL-friendly slug"""
        slug = title.lower()
        slug = slug.replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u")
        slug = slug.replace(" ", "-").replace("ñ", "n")
        import re
        slug = re.sub(r'[^a-z0-9-]', '', slug)
        return slug[:60]
    
    def generate_introduction(self, keyword: str, intent: str) -> str:
        """Generate engaging introduction"""
        introductions = {
            "informational": f"""
¿Buscas información sobre **{keyword}**? Has llegado al lugar indicado. 
En esta guía completa, te explicaremos todo lo que necesitas saber, 
basándonos en evidencia científica y experiencia veterinaria comprobada.
""",
            "commercial": f"""
Si estás considerando opciones relacionadas con **{keyword}**, es importante 
tomar una decisión informada. Hemos analizado las mejores alternativas 
disponibles para ayudarte a elegir la opción correcta.
""",
            "transactional": f"""
¿Necesitas **{keyword}** ahora? Te proporcionamos toda la información 
que necesitas para tomar la mejor decisión, incluyendo precios, 
características y recomendaciones de expertos.
"""
        }
        return introductions.get(intent, introductions["informational"]).strip()
    
    def generate_section(self, heading: str, outline: Dict, data: Dict) -> str:
        """Generate a single section"""
        # TODO: Implement section generation with AI
        return f"\n\n## {heading}\n\nContenido de la sección..."
    
    def generate_outline(self, keyword: str, serp_insights: Dict, entities: List) -> List[Dict]:
        """Generate article outline based on SERP analysis"""
        outline = [
            {"level": 2, "title": f"¿Qué es {keyword}?"},
            {"level": 2, "title": "Síntomas principales"},
            {"level": 2, "title": "Causas y factores de riesgo"},
            {"level": 2, "title": "Diagnóstico"},
            {"level": 2, "title": "Tratamiento disponible"},
            {"level": 2, "title": "Prevención"},
            {"level": 2, "title": "Cuándo acudir al veterinario"},
            {"level": 2, "title": "Preguntas frecuentes"}
        ]
        return outline
    
    def generate_conclusion(self, main_points: List[str]) -> str:
        """Generate conclusion"""
        conclusion = """

## Conclusiones

En resumen, es fundamental estar informado sobre este tema para poder 
actuar de manera rápida y efectiva. Recuerda que la prevención y la 
atención temprana son clave para el bienestar de tu mascota.

Si tienes alguna duda o sospechas que tu perro puede estar afectado, 
no dudes en consultar con tu veterinario de confianza.
"""
        return conclusion.strip()
    
    def generate_call_to_action(self, topic: str) -> str:
        """Generate call-to-action"""
        ctas = [
            "📞 ¿Necesitas ayuda profesional? Contacta con nuestro equipo de veterinarios.",
            "💬 Comparte este artículo con otros dueños de perros para ayudar a más mascotas.",
            "🔔 Suscríbete a nuestro boletín para recibir consejos veterinarios semanales.",
            "📅 Agenda una cita preventiva hoy mismo."
        ]
        return "\n\n".join(ctas)
    
    def calculate_reading_time(self, word_count: int) -> int:
        """Calculate estimated reading time in minutes"""
        return max(1, word_count // 200)
    
    def write_article(self, 
                      keyword: str, 
                      serp_data: Dict = None, 
                      medical_data: Dict = None,
                      entities: List = None) -> Article:
        """Generate complete article"""
        print(f"✍️ Writing article for: {keyword}")
        
        # Generate title
        title = self.generate_title(keyword, serp_data)
        print(f"   ✓ Title: {title}")
        
        # Generate outline
        outline = self.generate_outline(keyword, serp_data or {}, entities or [])
        print(f"   ✓ Outline: {len(outline)} sections")
        
        # Generate introduction
        intent = serp_data.get("intent", "informational") if serp_data else "informational"
        introduction = self.generate_introduction(keyword, intent)
        
        # Generate sections
        sections = []
        for section in outline:
            section_content = self.generate_section(
                section["title"],
                section,
                medical_data or {}
            )
            sections.append({
                "heading": section["title"],
                "level": section["level"],
                "content": section_content
            })
        
        # Generate full content (placeholder)
        full_content = introduction
        for section in sections:
            full_content += section["content"]
        
        conclusion = self.generate_conclusion([s["heading"] for s in sections])
        full_content += conclusion
        
        # Calculate word count
        word_count = len(full_content.split())
        
        # Generate meta description
        meta_description = self.generate_meta_description(full_content, keyword)
        
        # Generate slug
        slug = self.generate_slug(title)
        
        # Generate CTA
        cta = self.generate_call_to_action(keyword)
        
        article = Article(
            title=title,
            meta_description=meta_description,
            slug=slug,
            introduction=introduction,
            sections=sections,
            conclusion=conclusion,
            call_to_action=cta,
            word_count=word_count,
            reading_time=self.calculate_reading_time(word_count)
        )
        
        print(f"   ✓ Word count: {article.word_count}")
        print(f"   ✓ Reading time: {article.reading_time} min")
        print(f"   ✓ Slug: {article.slug}")
        
        return article


if __name__ == "__main__":
    # Test the agent
    agent = WriterAgent()
    article = agent.write_article("Parvovirus en perros")
    
    print("\n" + "=" * 60)
    print("ARTICLE GENERATED")
    print("=" * 60)
    print(f"\n📝 Title: {article.title}")
    print(f"📄 Meta: {article.meta_description}")
    print(f"🔗 Slug: {article.slug}")
    print(f"📊 Word count: {article.word_count}")
    print(f"⏱️ Reading time: {article.reading_time} min")
    print(f"\n📑 Sections: {len(article.sections)}")
    for section in article.sections:
        print(f"   • {section['heading']}")
    print("=" * 60)
