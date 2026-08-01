"""
Schema Agent - Generate structured data (JSON-LD)

Features:
- Article schema
- MedicalWebPage schema
- FAQ schema
- Breadcrumb schema
- Organization schema
- Author schema
- ImageObject schema
"""

import os
import sys
import json
from typing import List, Dict, Optional
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import OPENAI_API_KEY, SCHEMA_TYPES


class SchemaAgent:
    """Agent for generating structured data schemas"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or OPENAI_API_KEY
        self.schema_types = SCHEMA_TYPES
        
    def generate_article_schema(self, title: str, author: str, date_published: str, 
                                 image_url: str = "") -> Dict:
        """Generate Article schema"""
        schema = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title,
            "author": {
                "@type": "Person",
                "name": author
            },
            "datePublished": date_published,
            "dateModified": datetime.now().isoformat(),
            "description": "",
            "image": image_url if image_url else [],
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": ""
            },
            "publisher": {
                "@type": "Organization",
                "name": "LuisVet",
                "logo": {
                    "@type": "ImageObject",
                    "url": ""
                }
            }
        }
        return schema
    
    def generate_medical_webpage_schema(self, condition: str, signs: List[str], 
                                         treatments: List[str]) -> Dict:
        """Generate MedicalWebPage schema"""
        schema = {
            "@context": "https://schema.org",
            "@type": "MedicalWebPage",
            "name": f"Información sobre {condition}",
            "description": f"Guía médica completa sobre {condition}",
            "audience": {
                "@type": "MedicalAudience",
                "audienceType": "Patients"
            },
            "specialty": {
                "@type": "MedicalSpecialty",
                "name": "Veterinary"
            },
            "reviewedBy": {
                "@type": "Physician",
                "name": "Dr. Veterinario Colegiado"
            },
            "signsOrSymptoms": signs[:5] if signs else [],
            "possibleTreatment": treatments[:5] if treatments else []
        }
        return schema
    
    def generate_faq_schema(self, faqs: List[Dict]) -> Dict:
        """Generate FAQPage schema"""
        schema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs
        }
        return schema
    
    def generate_breadcrumb_schema(self, items: List[Dict]) -> Dict:
        """Generate BreadcrumbList schema"""
        schema = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": []
        }
        
        for i, item in enumerate(items, 1):
            schema["itemListElement"].append({
                "@type": "ListItem",
                "position": i,
                "name": item.get("name", ""),
                "item": item.get("url", "")
            })
        
        return schema
    
    def generate_organization_schema(self, name: str, url: str, logo: str = "") -> Dict:
        """Generate Organization schema"""
        schema = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": name,
            "url": url,
            "logo": logo,
            "sameAs": [],
            "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service"
            }
        }
        return schema
    
    def generate_person_schema(self, name: str, job_title: str, 
                               credentials: str = "") -> Dict:
        """Generate Person/Author schema"""
        schema = {
            "@context": "https://schema.org",
            "@type": "Person",
            "name": name,
            "jobTitle": job_title,
            "credentials": credentials,
            "affiliation": {
                "@type": "Organization",
                "name": "Colegio Oficial de Veterinarios"
            }
        }
        return schema
    
    def generate_image_schema(self, image_url: str, caption: str = "") -> Dict:
        """Generate ImageObject schema"""
        schema = {
            "@context": "https://schema.org",
            "@type": "ImageObject",
            "contentUrl": image_url,
            "caption": caption,
            "representativeOfPage": True
        }
        return schema
    
    def generate_website_schema(self, site_name: str, url: str) -> Dict:
        """Generate WebSite with SearchAction schema"""
        schema = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": site_name,
            "url": url,
            "potentialAction": {
                "@type": "SearchAction",
                "target": f"{url}/search?q={"{search_term_string}"}",
                "query-input": "required name=search_term_string"
            }
        }
        return schema
    
    def generate_complete_schema(self, article_data: Dict, 
                                  additional_schemas: List[str] = None) -> Dict:
        """Generate complete schema graph with all types"""
        schemas_to_generate = additional_schemas or self.schema_types
        
        schema_graph = {
            "@context": "https://schema.org",
            "@graph": []
        }
        
        # Add Article schema
        if "Article" in schemas_to_generate:
            article_schema = self.generate_article_schema(
                title=article_data.get("title", ""),
                author=article_data.get("author", ""),
                date_published=article_data.get("date_published", datetime.now().isoformat()),
                image_url=article_data.get("image_url", "")
            )
            schema_graph["@graph"].append(article_schema)
        
        # Add MedicalWebPage schema
        if "MedicalWebPage" in schemas_to_generate:
            medical_schema = self.generate_medical_webpage_schema(
                condition=article_data.get("condition", ""),
                signs=article_data.get("symptoms", []),
                treatments=article_data.get("treatments", [])
            )
            schema_graph["@graph"].append(medical_schema)
        
        # Add FAQ schema
        if "FAQ" in schemas_to_generate and "faqs" in article_data:
            faq_schema = self.generate_faq_schema(article_data["faqs"])
            schema_graph["@graph"].append(faq_schema)
        
        # Add Breadcrumb schema
        if "BreadcrumbList" in schemas_to_generate:
            breadcrumb_schema = self.generate_breadcrumb_schema([
                {"name": "Inicio", "url": article_data.get("site_url", "/")},
                {"name": "Artículos", "url": f"{article_data.get('site_url', '/')}/articulos"},
                {"name": article_data.get("title", ""), "url": article_data.get("url", "")}
            ])
            schema_graph["@graph"].append(breadcrumb_schema)
        
        # Add Organization schema
        if "Organization" in schemas_to_generate:
            org_schema = self.generate_organization_schema(
                name="LuisVet",
                url=article_data.get("site_url", "")
            )
            schema_graph["@graph"].append(org_schema)
        
        # Add Person schema
        if "Person" in schemas_to_generate:
            person_schema = self.generate_person_schema(
                name=article_data.get("author", "Dr. Veterinario"),
                job_title="Veterinario Colegiado",
                credentials="Nº Colegiado XXXX"
            )
            schema_graph["@graph"].append(person_schema)
        
        # Add WebSite schema
        if "WebSite" in schemas_to_generate:
            website_schema = self.generate_website_schema(
                site_name="LuisVet",
                url=article_data.get("site_url", "")
            )
            schema_graph["@graph"].append(website_schema)
        
        return schema_graph
    
    def validate_schema(self, schema: Dict) -> Dict:
        """Validate schema structure"""
        validation = {
            "valid": True,
            "errors": [],
            "warnings": []
        }
        
        # Basic validation
        if "@context" not in schema:
            validation["valid"] = False
            validation["errors"].append("Missing @context")
        
        if "@type" not in schema and "@graph" not in schema:
            validation["valid"] = False
            validation["errors"].append("Missing @type or @graph")
        
        return validation
    
    def to_json_ld(self, schema: Dict, pretty: bool = True) -> str:
        """Convert schema to JSON-LD string"""
        if pretty:
            return json.dumps(schema, indent=2, ensure_ascii=False)
        return json.dumps(schema, ensure_ascii=False)
    
    def generate_script_tag(self, schema: Dict) -> str:
        """Generate HTML script tag with JSON-LD"""
        json_ld = self.to_json_ld(schema, pretty=True)
        return f"""
<script type="application/ld+json">
{json_ld}
</script>
"""


if __name__ == "__main__":
    # Test the agent
    agent = SchemaAgent()
    
    article_data = {
        "title": "Parvovirus en Perros: Guía Completa",
        "author": "Dr. Juan Pérez",
        "condition": "Parvovirus",
        "symptoms": ["Vómitos", "Diarrea hemorrágica", "Letargo"],
        "treatments": ["Fluidoterapia", "Antieméticos", "Antibióticos"],
        "site_url": "https://luisvet.com"
    }
    
    complete_schema = agent.generate_complete_schema(article_data)
    
    print("\n" + "=" * 60)
    print("SCHEMA GENERATED")
    print("=" * 60)
    print(f"\n📊 Schema types: {len(complete_schema.get('@graph', []))}")
    for schema in complete_schema.get("@graph", []):
        print(f"   • {schema.get('@type', 'Unknown')}")
    
    print("\n" + "=" * 60)
    print("JSON-LD Preview (first 500 chars):")
    print("=" * 60)
    print(agent.to_json_ld(complete_schema)[:500] + "...")
    print("=" * 60)
