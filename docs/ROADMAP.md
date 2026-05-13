# ROADMAP — Fábrica Industrial de Contenido SEO
## De 0 a Libertad Financiera: Plan Exacto por Fases

---

## ESTADO ACTUAL (Fase 1 completada)

| Componente | Estado |
|---|---|
| VPS Contabo + Docker + n8n | ✅ Operativo |
| 01_MASTER_SCHEDULER | ✅ Listo para importar |
| 02_AI_CONTENT_GENERATOR | ✅ Actualizado con CTAs |
| 04_BLOGGER_PUBLISHER | ✅ Listo para importar |
| 05_LOCK_WATCHDOG | ✅ Listo para importar |
| Google Sheets CONTENT_PIPELINE | ✅ Schema definido |
| NICHE_CONFIG | ✅ Template listo |
| Documentación maestra | ✅ Completa |

---

## ANÁLISIS DE GAPS: Lo que falta para ingresos reales

```
FASE 1 ─ PRODUCCIÓN     [██████████] 100% completa
FASE 2 ─ MONETIZACIÓN   [███░░░░░░░]  30% (afiliados+CTAs base listos, falta Telegram/Digital)
FASE 3 ─ DISTRIBUCIÓN   [░░░░░░░░░░]   0%
FASE 4 ─ SEO AVANZADO   [░░░░░░░░░░]   0%
FASE 5 ─ MULTINICHO     [██░░░░░░░░]  20% (estructura lista, falta ejecución)
FASE 6 ─ MONOPOLIO      [░░░░░░░░░░]   0%
```

---

## FASE 2 — MONETIZACIÓN (AHORA, Semana 1-2)

### Prioridad de construcción por impacto en ingresos:

| # | Workflow | Impacto | Dificultad | Status |
|---|---|---|---|---|
| 1 | `02_AI_CONTENT_GENERATOR` (v2 con CTAs) | 🔥🔥🔥 Alto | Bajo | **CONSTRUIDO** |
| 2 | `06_AFFILIATE_INJECTOR` | 🔥🔥🔥 Alto | Medio | **CONSTRUIDO** |
| 3 | `07_MONETIZATION_INJECTOR` | 🔥🔥 Medio | Bajo | **CONSTRUIDO** |
| 4 | `08_TELEGRAM_BROADCASTER` | 🔥🔥 Medio | Bajo | **CONSTRUIDO** |
| 5 | `09_DIGITAL_PRODUCT_LINKER` | 🔥🔥 Medio | Bajo | Próxima sesión |
| 6 | `10_WHATSAPP_BROADCASTER` | 🔥 Bajo | Medio | Fase 3 |

### Qué produce cada workflow:

```
02_AI_CONTENT_GENERATOR v2:
  → Cada artículo incluye automáticamente:
    - Bloque de productos Amazon (con placeholders de links)
    - CTA Telegram con tu link de canal
    - Bloque lead magnet (ebook/checklist del nicho)
    - CTA final hacia producto digital o afiliado
  → Zero costo adicional (mismo llamado DeepSeek)
  → Impacto: 100% de artículos monetizados desde el día 1

06_AFFILIATE_INJECTOR:
  → Lee posts PUBLISHED sin afiliados
  → Busca keywords de tu AFFILIATE_LINKS sheet
  → Inyecta links Amazon reales en el HTML del post
  → Actualiza el post en Blogger via API PATCH
  → Resultado: comisiones Amazon en cada post publicado

07_MONETIZATION_INJECTOR:
  → Inyecta bloques HTML hardcodeados por nicho:
    - Banner de canal Telegram
    - Botón de WhatsApp
    - Cuadro de "producto recomendado" con link Hotmart/Gumroad
    - Script de lead magnet (popup o inline)
  → No requiere DeepSeek, es puro HTML

08_TELEGRAM_BROADCASTER:
  → Cada artículo publicado → post automático en tu canal
  → Formato: Emoji + Título + Resumen (2 líneas) + URL + Hashtags
  → Construye audiencia pasiva que genera tráfico de vuelta
```

---

## FASE 3 — DISTRIBUCIÓN (Semana 3-4)

| Workflow | Plataforma | Acción |
|---|---|---|
| `11_FACEBOOK_POSTER` | Facebook Page | Post con imagen + título + link |
| `12_PINTEREST_PINNER` | Pinterest | Pin con imagen + descripción SEO |
| `13_REEL_SCRIPT_GENERATOR` | Instagram/TikTok | Script + subtítulos para reels |
| `14_YOUTUBE_DESCRIPTION_GEN` | YouTube | Descripción + tags para videos |

### Estrategia de distribución sin crear contenido nuevo:
```
ARTÍCULO PUBLICADO (1 pieza de contenido)
       │
       ├─→ Telegram: resumen 200 chars + link
       ├─→ Facebook: post con extracto + link
       ├─→ Pinterest: imagen destacada + descripción SEO
       └─→ Guión de reel: 5 puntos clave en 60 segundos

Cada artículo = 4 piezas de distribución social automatizadas
72 artículos/día = 288 piezas de contenido social/día
```

---

## FASE 4 — SEO AVANZADO (Mes 2)

| Workflow | Función |
|---|---|
| `15_INTERLINK_BUILDER` | Encuentra posts relacionados → inyecta links internos |
| `16_CLUSTER_DETECTOR` | Detecta canibalización y agrupa por cluster semántico |
| `17_FAQ_SCHEMA_INJECTOR` | Inyecta FAQ schema JSON-LD en posts existentes |
| `18_META_OPTIMIZER` | Revisa titles y descriptions vs CTR real (Search Console) |
| `19_TOPICAL_MAP_BUILDER` | Genera mapa de tópicos faltantes en cada nicho |

### Modelo SEO: Topical Authority por Nicho
```
Para dominar un nicho en Google:
1. Artículo pilar (2000+ palabras, keyword principal)
2. 5-10 artículos satélite (long-tail del cluster)
3. FAQ schema en todos los posts
4. Interlinks bidireccionales
5. Actualización del pilar cada 3 meses

Tiempo para topical authority: 3-6 meses con 50+ artículos/nicho
```

---

## FASE 5 — FÁBRICA MULTINICHO (Mes 2-3)

### Arquitectura de blogs por tier de RPM:

```
TIER 1 — Inglés, RPM $35-80
  Blog: insurance-guides-[domain].blogspot.com
  Blog: legal-help-us-[domain].blogspot.com
  Blog: finance-advisor-[domain].blogspot.com
  → 3 artículos/día por blog
  → Meta: $500-2000/mes por blog en 6-9 meses

TIER 2 — Español, RPM $8-20
  Blog: seguros-comparados-[domain].blogspot.com
  Blog: finanzas-ecuador-[domain].blogspot.com
  Blog: tecnologia-ia-[domain].blogspot.com
  → 3 artículos/día por blog
  → Meta: $100-500/mes por blog en 3-6 meses

TIER 3 — Español veterinario, RPM $3-8
  Blog: veterinario-online-[domain].blogspot.com
  Blog: hurones-mascotas-[domain].blogspot.com
  Blog: bulldogs-y-razas-[domain].blogspot.com
  → 5-10 artículos/día por blog (volumen)
  → Meta: $50-200/mes por blog (compensado con afiliados)
```

### Estimación de ingresos (conservadora):
```
Mes 3: 2 blogs activos × $50/mes = $100
Mes 6: 8 blogs activos × $150/mes promedio = $1,200
Mes 9: 20 blogs × $300/mes promedio = $6,000
Mes 12: 40 blogs × $400/mes promedio = $16,000
```

---

## FASE 6 — SISTEMA DE MONOPOLIO (Mes 4+)

### Workflows de inteligencia y expansión automática:

| Workflow | Función |
|---|---|
| `20_KEYWORD_OPPORTUNITY_FINDER` | Busca keywords con bajo KD y alto volumen vía Ahrefs/SerpAPI |
| `21_NICHE_EVALUATOR` | Evalúa nuevos nichos por RPM estimado y competencia |
| `22_BLOG_SPAWNER` | Crea nuevo blog en Blogger automáticamente + lo agrega al pipeline |
| `23_CANNIBALIZATION_DETECTOR` | Detecta artículos que compiten entre sí y los corrige |
| `24_PERFORMANCE_RANKER` | Ordena artículos por tráfico → prioriza actualización de top performers |

---

## CUELLO DE BOTELLA CRÍTICO: Alimentar el Pipeline

**El mayor riesgo del sistema no es técnico — es quedarse sin PENDING.**

Con 72 artículos/día, necesitas 2,160 títulos/mes. Para escalar a 10 blogs:
- 21,600 títulos/mes
- Imposible generar manualmente

### Solución: `25_TITLE_FACTORY`
```
Cron: diario
Función:
  1. Lee NICHE_CONFIG para nichos activos
  2. Por cada nicho, llama DeepSeek con:
     "Dame 50 títulos SEO únicos y sin repetición para el nicho [X].
      Enfócate en long-tail, intención informacional.
      Formato JSON: [{title, keywords, priority}]"
  3. Verifica que los títulos no existan ya en CONTENT_PIPELINE (anti-canibalización)
  4. Inserta automáticamente en CONTENT_PIPELINE con STATUS=PENDING

Costo: ~$0.01 USD por 50 títulos (mínimo)
Resultado: pipeline siempre lleno sin intervención manual
```

**Este workflow es el más importante para la escala industrial.**

---

## DEPENDENCIAS Y ORDEN CORRECTO DE CONSTRUCCIÓN

```
Semana 1:
  ✅ 01_MASTER_SCHEDULER
  ✅ 02_AI_CONTENT_GENERATOR (v2 con CTAs)
  ✅ 04_BLOGGER_PUBLISHER
  ✅ 05_LOCK_WATCHDOG
  ✅ 06_AFFILIATE_INJECTOR
  ✅ 07_MONETIZATION_INJECTOR
  ✅ 08_TELEGRAM_BROADCASTER

Semana 2:
  → 25_TITLE_FACTORY (crítico para escala)
  → 09_DIGITAL_PRODUCT_LINKER
  → 11_FACEBOOK_POSTER

Semana 3-4:
  → 15_INTERLINK_BUILDER
  → 17_FAQ_SCHEMA_INJECTOR
  → 12_PINTEREST_PINNER
  → 13_REEL_SCRIPT_GENERATOR

Mes 2:
  → 16_CLUSTER_DETECTOR
  → 18_META_OPTIMIZER
  → 19_TOPICAL_MAP_BUILDER

Mes 3+:
  → 20_KEYWORD_OPPORTUNITY_FINDER
  → 22_BLOG_SPAWNER
  → 24_PERFORMANCE_RANKER
```

---

## MÉTRICAS DE ÉXITO POR FASE

| Métrica | Semana 1 | Mes 1 | Mes 3 | Mes 6 | Mes 12 |
|---|---|---|---|---|---|
| Artículos/día | 72 | 72-200 | 300+ | 500+ | 1000+ |
| Blogs activos | 1-2 | 3-5 | 8-12 | 20-30 | 50+ |
| Ingresos AdSense | $0 | $0-10 | $50-200 | $500-2000 | $5000+ |
| Ingresos Afiliados | $0-5 | $20-100 | $100-400 | $300-1000 | $2000+ |
| Suscriptores Telegram | 0 | 50-200 | 500-2000 | 5000+ | 20000+ |
| Total ingresos | ~$0 | $20-110 | $150-600 | $800-3000 | $7000+ |

---

*Roadmap vivo — actualizar con cada fase completada*
*Versión 1.0 — Mayo 2026*
