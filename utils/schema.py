"""
Schema Utilities

Features:
- JSON-LD generation
- Schema validation
"""

import json
from typing import Dict, List


def generate_json_ld(schema_type: str, data: Dict) -> str:
    """Generate JSON-LD structured data"""
    schema = {
        "@context": "https://schema.org",
        "@type": schema_type,
        **data
    }
    return json.dumps(schema, indent=2, ensure_ascii=False)


def validate_schema(schema: Dict) -> Dict:
    """Validate schema structure"""
    errors = []
    
    if "@context" not in schema:
        errors.append("Missing @context")
    
    if "@type" not in schema and "@graph" not in schema:
        errors.append("Missing @type or @graph")
    
    return {
        "valid": len(errors) == 0,
        "errors": errors
    }
