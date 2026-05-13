#!/usr/bin/env python3
"""
bulk_fill_pipeline.py
Carga masiva de títulos al CONTENT_PIPELINE de Google Sheets.
Uso: python3 bulk_fill_pipeline.py

Requiere: pip install google-auth google-auth-oauthlib google-api-python-client
"""

import json
from datetime import datetime

# ── CONFIGURACIÓN ────────────────────────────────────────────────────────────
SPREADSHEET_ID = "18BQ8BjfTvVa56R5FjWyBuvcGR8vVlz0rx-hwAVBdPug"
SHEET_NAME = "CONTENT_PIPELINE"

# Artículos a cargar — editar esta lista
# Formato: (titulo, nicho, keywords_csv, blog_id, idioma, prioridad)
ARTICLES = [
    # === NICHO: Veterinario ===
    ("Signos de dolor en perros: cómo saber si tu perro sufre", "veterinary", "dolor en perros, signos de dolor perro, perro enfermo", "TU_BLOG_ID", "es", 3),
    ("Vacunas para gatos: calendario completo y obligatorias", "veterinary", "vacunas gatos, calendario vacunación gatos, gato vacuna", "TU_BLOG_ID", "es", 3),
    ("Parásitos internos en perros: síntomas y tratamiento", "veterinary", "parásitos perros, lombrices perros, desparasitar perro", "TU_BLOG_ID", "es", 3),
    ("Alimentación correcta del gato adulto", "veterinary", "alimentación gatos, comida gato adulto, dieta gatos", "TU_BLOG_ID", "es", 3),
    ("Cómo saber si mi perro tiene fiebre sin termómetro", "veterinary", "fiebre en perros, temperatura normal perro, perro con fiebre", "TU_BLOG_ID", "es", 3),

    # === NICHO: Hurones ===
    ("Enfermedades comunes del hurón: guía completa", "hurones", "enfermedades huron, hurón enfermo, salud hurones", "TU_BLOG_ID", "es", 3),
    ("Qué comen los hurones: dieta óptima", "hurones", "alimentación hurones, comida para hurones, dieta hurón", "TU_BLOG_ID", "es", 3),
    ("Jaula ideal para hurones: tamaño y accesorios", "hurones", "jaula hurones, habitáculo huron, espacio hurón", "TU_BLOG_ID", "es", 3),

    # === NICHO: Seguros (Tier 1) ===
    ("Seguros de vida para familias: guía completa 2025", "seguros", "seguro de vida familia, seguro vida Ecuador, seguro vida", "TU_BLOG_ID_FINANZAS", "es", 1),
    ("Seguro médico privado vs IESS: diferencias y costos", "seguros", "seguro medico privado, IESS vs seguro privado, salud privada Ecuador", "TU_BLOG_ID_FINANZAS", "es", 1),

    # === NICHO: Insurance EN (Tier 1 máximo) ===
    ("Best cheap car insurance 2025: top companies compared", "insurance", "cheap car insurance, best car insurance 2025, affordable auto insurance", "TU_BLOG_ID_EN", "en", 1),
    ("How much does homeowners insurance cost in 2025", "insurance", "homeowners insurance cost, home insurance price, house insurance", "TU_BLOG_ID_EN", "en", 1),
    ("Life insurance for seniors over 60: complete guide", "insurance", "life insurance seniors, over 60 life insurance, senior life insurance", "TU_BLOG_ID_EN", "en", 1),
    ("Small business liability insurance: what you need to know", "insurance", "small business liability insurance, business insurance, commercial insurance", "TU_BLOG_ID_EN", "en", 1),

    # === NICHO: Legal US (Tier 1 máximo RPM) ===
    ("Wrongful termination: what are your rights as an employee", "legal-us", "wrongful termination, employee rights, wrongful dismissal", "TU_BLOG_ID_EN", "en", 1),
    ("How to sue your employer for discrimination: step by step", "legal-us", "sue employer discrimination, employment discrimination lawsuit, workplace discrimination", "TU_BLOG_ID_EN", "en", 1),
]
# ─────────────────────────────────────────────────────────────────────────────


def generate_rows(articles, start_row=2):
    """Genera las filas para insertar en Google Sheets."""
    rows = []
    for i, (title, niche, keywords, blog_id, language, priority) in enumerate(articles):
        row_number = start_row + i
        rows.append([
            row_number,   # A: ROW_NUMBER
            "PENDING",    # B: STATUS
            "FALSE",      # C: LOCK
            "",           # D: LOCK_TIMESTAMP
            title,        # E: TITLE
            niche,        # F: NICHE
            keywords,     # G: KEYWORDS
            blog_id,      # H: BLOG_ID
            language,     # I: LANGUAGE
            priority,     # J: PRIORITY
            "",           # K: HTML_CONTENT
            "",           # L: TOKENS_USED
            "",           # M: GENERATED_AT
            "",           # N: PUBLISHED_URL
            "",           # O: POST_ID
            "",           # P: PUBLISHED_AT
            "FALSE",      # Q: AFFILIATE_INJECTED
            "FALSE",      # R: SOCIAL_DISTRIBUTED
            "FALSE",      # S: INTERLINKS_ADDED
            "",           # T: ERROR_MESSAGE
            "0",          # U: RETRY_COUNT
        ])
    return rows


def print_csv_preview(rows):
    """Imprime las filas como CSV para verificación."""
    headers = [
        "ROW_NUMBER", "STATUS", "LOCK", "LOCK_TIMESTAMP", "TITLE", "NICHE",
        "KEYWORDS", "BLOG_ID", "LANGUAGE", "PRIORITY", "HTML_CONTENT",
        "TOKENS_USED", "GENERATED_AT", "PUBLISHED_URL", "POST_ID",
        "PUBLISHED_AT", "AFFILIATE_INJECTED", "SOCIAL_DISTRIBUTED",
        "INTERLINKS_ADDED", "ERROR_MESSAGE", "RETRY_COUNT"
    ]
    print(",".join(headers))
    for row in rows:
        print(",".join([f'"{str(v)}"' if "," in str(v) else str(v) for v in row]))


if __name__ == "__main__":
    rows = generate_rows(ARTICLES, start_row=2)
    print(f"=== {len(rows)} artículos generados ===\n")
    print_csv_preview(rows)
    print(f"\n=== Para cargar: copia el CSV de arriba y pégalo en Google Sheets ===")
    print(f"O usa la API de Google Sheets para insertar programáticamente.")
    print(f"\nDistribución por prioridad:")
    p1 = sum(1 for a in ARTICLES if a[5] == 1)
    p3 = sum(1 for a in ARTICLES if a[5] == 3)
    print(f"  Tier 1 (alto RPM): {p1} artículos")
    print(f"  Tier 3 (volumen):  {p3} artículos")
    print(f"\nDistribución por idioma:")
    en = sum(1 for a in ARTICLES if a[4] == "en")
    es = sum(1 for a in ARTICLES if a[4] == "es")
    print(f"  Inglés: {en} artículos")
    print(f"  Español: {es} artículos")
