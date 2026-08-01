"""
HTML Utilities

Features:
- Markdown to HTML conversion
- HTML cleaning
- Tag formatting
"""

import re
from typing import Dict, List


def markdown_to_html(markdown: str) -> str:
    """Convert Markdown to HTML"""
    html = markdown
    
    # Headers
    html = re.sub(r'^###### (.*$)', r'<h6>\1</h6>', html, flags=re.MULTILINE)
    html = re.sub(r'^##### (.*$)', r'<h5>\1</h5>', html, flags=re.MULTILINE)
    html = re.sub(r'^#### (.*$)', r'<h4>\1</h4>', html, flags=re.MULTILINE)
    html = re.sub(r'^### (.*$)', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.*$)', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^# (.*$)', r'<h1>\1</h1>', html, flags=re.MULTILINE)
    
    # Bold and italic
    html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\*(.*?)\*', r'<em>\1</em>', html)
    
    # Links
    html = re.sub(r'\[(.*?)\]\((.*?)\)', r'<a href="\2">\1</a>', html)
    
    # Lists
    html = re.sub(r'^- (.*$)', r'<li>\1</li>', html, flags=re.MULTILINE)
    html = re.sub(r'(<li>.*?</li>)', r'<ul>\1</ul>', html, flags=re.DOTALL)
    
    return html


def clean_html(html: str) -> str:
    """Clean and sanitize HTML"""
    # Remove dangerous tags
    dangerous_tags = ['script', 'iframe', 'object', 'embed']
    for tag in dangerous_tags:
        html = re.sub(f'<{tag}[^>]*>.*?</{tag}>', '', html, flags=re.IGNORECASE | re.DOTALL)
    
    return html


def add_table_of_contents(html: str) -> str:
    """Add table of contents to HTML"""
    toc = "<nav><h2>Tabla de Contenidos</h2><ul>"
    
    headings = re.findall(r'<h([23])>(.*?)</h\1>', html)
    for level, text in headings:
        slug = text.lower().replace(' ', '-').replace('á', 'a')
        toc += f'<li><a href="#{slug}">{text}</a></li>'
    
    toc += "</ul></nav>"
    
    # Insert after first paragraph
    html = html.replace('</p>', '</p>' + toc, 1)
    
    return html


if __name__ == "__main__":
    test_md = """# Title

## Section 1

Some **bold** and *italic* text.

- Item 1
- Item 2
"""
    print(markdown_to_html(test_md))
