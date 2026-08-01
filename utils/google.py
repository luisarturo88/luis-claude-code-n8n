"""
Google API Utilities

Features:
- Custom Search API
- Google Suggest
- People Also Ask
"""

import os
import sys
import requests
from typing import List, Dict

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import GOOGLE_API_KEY


def google_search(query: str, num_results: int = 10) -> List[Dict]:
    """Perform Google Custom Search"""
    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "key": GOOGLE_API_KEY,
        "cx": "",  # Custom Search Engine ID
        "q": query,
        "num": min(num_results, 10)
    }
    
    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        return data.get("items", [])
    except Exception as e:
        print(f"Search error: {e}")
        return []


def get_google_suggestions(keyword: str) -> List[str]:
    """Get Google Autocomplete suggestions"""
    url = "http://suggestqueries.google.com/complete/search"
    params = {
        "client": "firefox",
        "q": keyword,
        "hl": "es",
        "gl": "es"
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        return data[1] if len(data) > 1 else []
    except Exception as e:
        print(f"Suggestions error: {e}")
        return []


if __name__ == "__main__":
    # Test
    suggestions = get_google_suggestions("parvovirus en perros")
    print(f"Found {len(suggestions)} suggestions:")
    for s in suggestions[:5]:
        print(f"  - {s}")
