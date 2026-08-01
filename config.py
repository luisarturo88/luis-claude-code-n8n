"""
Configuration file for LuisVet SEO AI System
"""

import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent.absolute()

# API Keys (load from environment variables)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
BLOGGER_CREDENTIALS = os.getenv("BLOGGER_CREDENTIALS", "")

# Paths
PROMPTS_DIR = BASE_DIR / "prompts"
AGENTS_DIR = BASE_DIR / "agents"
UTILS_DIR = BASE_DIR / "utils"
DATA_DIR = BASE_DIR / "data"
NOTEBOOKS_DIR = BASE_DIR / "notebooks"

# SEO Settings
DEFAULT_LANGUAGE = "es"
TARGET_COUNTRY = "ES"
MAX_KEYWORDS = 20
MIN_CONTENT_LENGTH = 1500
MAX_CONTENT_LENGTH = 3000

# Agent Settings
SERP_RESULTS_COUNT = 10
MAX_RETRIES = 3
TIMEOUT_SECONDS = 30

# Blogger Settings
BLOGGER_BLOG_ID = os.getenv("BLOGGER_BLOG_ID", "")
AUTO_PUBLISH = False
DRAFT_MODE = True

# Image Settings
GENERATE_IMAGES = True
IMAGE_STYLE = "professional"
IMAGE_FORMAT = "webp"

# Schema Settings
ENABLE_SCHEMA = True
SCHEMA_TYPES = [
    "Article",
    "MedicalWebPage",
    "FAQ",
    "BreadcrumbList",
    "Organization",
    "Person",
    "ImageObject"
]

# Logging
LOG_LEVEL = "INFO"
LOG_FILE = DATA_DIR / "system.log"
