# 🐾 LuisVet SEO AI System

Sistema multi-agente para generación de contenido veterinario optimizado para SEO.

## Arquitectura

```
luis-vet-seo-ai/
│
├── app.py                    # Aplicación principal
├── config.py                 # Configuración del sistema
├── requirements.txt          # Dependencias
├── prompts/                  # Prompts para IA
│      ├── seo.txt
│      ├── eeat.txt
│      ├── geo.txt
│      └── blogger.txt
├── agents/                   # Agentes especializados
│      ├── keyword_agent.py
│      ├── serp_agent.py
│      ├── entity_agent.py
│      ├── writer_agent.py
│      ├── eeat_agent.py
│      ├── medical_agent.py
│      ├── geo_agent.py
│      ├── schema_agent.py
│      ├── image_agent.py
│      ├── blogger_agent.py
│      ├── internal_links_agent.py
│      └── update_agent.py
├── utils/                    # Utilidades
│      ├── blogger.py
│      ├── google.py
│      ├── images.py
│      ├── schema.py
│      ├── html.py
│      └── markdown.py
├── data/                     # Datos generados
└── notebooks/                # Notebooks Colab
       └── LuisVet.ipynb
```

## Flujo de Trabajo

```
KEYWORD → SERP → NLP → EEAT → MEDICAL → ARTICLE → HTML → SEO → AEO → GEO → IMAGE → BLOGGER → INDEXING → UPDATE
```

## Instalación

### En Google Colab

```python
!git clone https://github.com/luisarturo88/luis-vet-seo-ai.git
%cd luis-vet-seo-ai
!pip install -r requirements.txt
!python app.py
```

### Local

```bash
git clone https://github.com/luisarturo88/luis-vet-seo-ai.git
cd luis-vet-seo-ai
pip install -r requirements.txt
python app.py
```

## Configuración

Crear archivo `.env` o configurar variables de entorno:

```bash
OPENAI_API_KEY=tu-api-key
GOOGLE_API_KEY=tu-google-api-key
BLOGGER_CREDENTIALS=tus-credenciales
BLOGGER_BLOG_ID=tu-blog-id
```

## Uso

```python
from app import LuisVetSEOAI

# Inicializar
app = LuisVetSEOAI()

# Generar artículo
result = app.generate_article("Parvovirus en perros", auto_publish=False)
```

## Agentes

| Agente | Función |
|--------|---------|
| Keyword | Research, Google Suggest, PAA, dificultad |
| SERP | Análisis de resultados, headers, entidades |
| Entity | Grafo de conocimiento, relaciones |
| Medical | Revisión médica, referencias científicas |
| Writer | Generación de artículos |
| EEAT | Experiencia, expertise, autoridad, confianza |
| GEO | Optimización para IA (ChatGPT, Gemini, etc.) |
| Schema | JSON-LD, datos estructurados |
| Image | Generación y optimización |
| Blogger | Publicación automática |
| Internal Links | Enlazado interno |
| Update | Mantenimiento de contenido |

## Fases de Desarrollo

- ✅ **Fase 1**: Estructura modular y configuración
- 🔄 **Fase 2**: Implementación agentes SEO/SERP
- ⏳ **Fase 3**: Generación contenido, EEAT, GEO
- ⏳ **Fase 4**: Blogger, imágenes, indexación

## Licencia

MIT
