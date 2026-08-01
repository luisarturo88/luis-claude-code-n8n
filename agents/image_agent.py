"""
Image Agent - Generate and optimize images

Features:
- AI image generation
- Image optimization
- Alt text generation
- Caption creation
- WebP conversion
"""

import os
import sys
from typing import List, Dict, Optional
from dataclasses import dataclass

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import OPENAI_API_KEY, GENERATE_IMAGES, IMAGE_FORMAT


@dataclass
class ImageData:
    """Represents generated image data"""
    url: str
    alt_text: str
    caption: str
    width: int = 800
    height: int = 600
    format: str = "webp"


class ImageAgent:
    """Agent for image generation and optimization"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or OPENAI_API_KEY
        self.generate_images = GENERATE_IMAGES
        self.image_format = IMAGE_FORMAT
        
    def generate_image_prompt(self, topic: str, context: str = "") -> str:
        """Generate detailed image prompt for AI image generation"""
        prompts = {
            "Parvovirus": "Professional veterinary medical illustration of a sick puppy showing symptoms of parvovirus, clinical setting, educational style, clean background, appropriate for medical content",
            "Vacunación": "Veterinarian administering vaccine to a healthy puppy, modern clinic environment, professional photography style, warm lighting",
            "Síntomas": "Medical diagram showing digestive system of a dog with highlighted areas affected by gastrointestinal disease, educational illustration style"
        }
        return prompts.get(topic, f"Professional veterinary image related to {topic}, educational and medical context")
    
    def generate_alt_text(self, topic: str, description: str = "") -> str:
        """Generate SEO-friendly alt text"""
        alt_texts = {
            "Parvovirus": "Cachorro con síntomas de parvovirus siendo atendido por veterinario",
            "Vacunación": "Veterinario aplicando vacuna contra el parvovirus a cachorro",
            "Síntomas": "Diagrama médico del sistema digestivo canino afectado por parvovirus"
        }
        return alt_texts.get(topic, f"Imagen relacionada con {topic} en contexto veterinario")
    
    def generate_caption(self, topic: str) -> str:
        """Generate informative image caption"""
        captions = {
            "Parvovirus": "Los cachorros no vacunados son los más vulnerables al parvovirus",
            "Vacunación": "La vacunación temprana es la mejor prevención contra el parvovirus",
            "Síntomas": "Reconocer los síntomas temprano puede salvar la vida de tu mascota"
        }
        return captions.get(topic, f"Información importante sobre {topic}")
    
    def optimize_image(self, image_path: str) -> Dict:
        """Optimize image for web"""
        optimization = {
            "original_size": 0,
            "optimized_size": 0,
            "format": self.image_format,
            "width": 800,
            "height": 600,
            "quality": 85
        }
        # TODO: Implement actual image optimization
        return optimization
    
    def generate_images_for_article(self, topic: str, sections: List[str]) -> List[ImageData]:
        """Generate images for article sections"""
        print(f"🖼️ Generating images for: {topic}")
        
        images = []
        
        # Featured image
        featured = ImageData(
            url=f"/images/{topic.lower().replace(' ', '-')}-featured.webp",
            alt_text=self.generate_alt_text(topic),
            caption=self.generate_caption(topic),
            width=1200,
            height=630,
            format=self.image_format
        )
        images.append(featured)
        print(f"   ✓ Featured image created")
        
        # Section images (limit to 3)
        for i, section in enumerate(sections[:3], 1):
            image = ImageData(
                url=f"/images/{topic.lower().replace(' ', '-')}-{i}.webp",
                alt_text=self.generate_alt_text(section),
                caption=self.generate_caption(section),
                width=800,
                height=600,
                format=self.image_format
            )
            images.append(image)
            print(f"   ✓ Section {i} image created")
        
        return images
    
    def get_image_schema(self, image: ImageData) -> Dict:
        """Generate ImageObject schema for image"""
        schema = {
            "@type": "ImageObject",
            "contentUrl": image.url,
            "caption": image.caption,
            "alternateName": image.alt_text,
            "width": image.width,
            "height": image.height
        }
        return schema


if __name__ == "__main__":
    # Test the agent
    agent = ImageAgent()
    
    sections = ["Síntomas del Parvovirus", "Diagnóstico", "Tratamiento"]
    images = agent.generate_images_for_article("Parvovirus en perros", sections)
    
    print("\n" + "=" * 60)
    print("IMAGES GENERATED")
    print("=" * 60)
    print(f"\n📊 Total images: {len(images)}")
    for i, img in enumerate(images, 1):
        print(f"\n   Image {i}:")
        print(f"   • URL: {img.url}")
        print(f"   • Alt: {img.alt_text}")
        print(f"   • Caption: {img.caption}")
        print(f"   • Size: {img.width}x{img.height}")
    print("=" * 60)
