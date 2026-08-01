"""
Markdown Utilities

Features:
- Markdown formatting
- Content structuring
"""

from typing import List, Dict


def format_article(title: str, sections: List[Dict]) -> str:
    """Format article in Markdown"""
    content = f"# {title}\n\n"
    
    for section in sections:
        heading = section.get("heading", "")
        level = section.get("level", 2)
        content += f"{'#' * level} {heading}\n\n"
        content += section.get("content", "") + "\n\n"
    
    return content


def add_callout(text: str, callout_type: str = "info") -> str:
    """Add markdown callout/notice"""
    icons = {
        "info": "ℹ️",
        "warning": "⚠️",
        "tip": "💡",
        "important": "📌"
    }
    icon = icons.get(callout_type, "ℹ️")
    return f"\n{icon} **{callout_type.upper()}:** {text}\n"
