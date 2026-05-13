# Estrategia de Nichos y Keywords
## Sistema de Producción Industrial — Guía Operativa

---

## Jerarquía de Prioridad (por RPM estimado)

```
TIER 1 — RPM $20-80 USD  →  PRIORITY=1 en pipeline
TIER 2 — RPM $8-20 USD   →  PRIORITY=2 en pipeline  
TIER 3 — RPM $2-8 USD    →  PRIORITY=3 en pipeline
```

---

## TIER 1 — Nichos de Alto RPM (Inglés)

### insurance
**RPM estimado:** $35-80 USD
**Volumen de búsqueda:** enorme
**Competencia:** alta — compensar con long-tail

Títulos de alta conversión:
```
"best [type] insurance 2025"
"how much does [type] insurance cost"
"[type] insurance for [audience]: complete guide"
"is [type] insurance worth it"
"[type] insurance requirements by state"
"cheapest [type] insurance companies"
```

Keywords de oro:
```
auto insurance quotes, life insurance cost, health insurance marketplace,
home insurance calculator, renters insurance cheap, business insurance quote,
car insurance for seniors, commercial auto insurance, umbrella insurance,
liability insurance for small business
```

### legal-us
**RPM estimado:** $40-75 USD
**Keywords de máximo valor:**
```
wrongful termination, sue employer, employment lawyer,
personal injury settlement, workers compensation, social security disability,
mesothelioma attorney, car accident lawyer, slip and fall attorney
```

### finance-us
**RPM estimado:** $25-60 USD
**Keywords de alto valor:**
```
best credit cards 2025, personal loan rates, mortgage calculator,
debt consolidation, balance transfer credit card, refinance mortgage,
best savings account rates, investment for beginners
```

---

## TIER 2 — Nichos Mixtos (Español e Inglés)

### seguros (español)
**RPM estimado:** $10-20 USD
**Audiencia objetivo:** Colombia, México, España, Argentina

Keywords principales:
```
seguro de vida barato, comparar seguros de auto, seguro médico privado,
seguro de hogar, SOAT Colombia, seguro obligatorio Ecuador,
seguro de vida familiar, contratar seguro online
```

### finanzas (español)
**RPM estimado:** $8-15 USD

Keywords principales:
```
cómo invertir en bolsa, mejores fondos de inversión, préstamos personales,
tarjeta de crédito sin anualidad, ahorro para jubilación,
fintech Ecuador, billetera digital, criptomonedas para principiantes
```

### saas / ia / automatización
**RPM estimado:** $9-18 USD

Keywords principales:
```
herramientas de IA para negocios, automatizar Excel, ChatGPT para empresas,
mejor CRM gratis, software de contabilidad, Zapier vs Make,
n8n tutorial, automatización de marketing, herramientas SEO gratis
```

---

## TIER 3 — Nichos Veterinarios (Español, Volumen)

**Estrategia:** alto volumen, monetización con afiliados Amazon más que AdSense

### veterinary
**RPM estimado:** $3-6 USD
**Compensación:** volumen alto (5+ artículos/día), afiliados pet-supplies

Clusters de contenido (agrupar para interlinking):

**Cluster: Enfermedades comunes**
```
síntomas de parvovirus en perros
cómo saber si mi perro tiene moquillo
leishmaniasis en perros: síntomas y tratamiento
toxoplasmosis en gatos: riesgo para embarazadas
sarna en perros: tipos y tratamiento
```

**Cluster: Alimentación**
```
mejor comida para perro adulto
dieta barf para perros: guía completa
alimentos prohibidos para gatos
cuánto debe comer un perro según su peso
```

**Cluster: Primeros auxilios**
```
qué hacer si mi perro no quiere comer
mi perro vomitó: cuándo preocuparse
convulsiones en perros: qué hacer en casa
mi gato tiene diarrea: causas y remedios
```

### hurones
**RPM estimado:** $4-7 USD (nicho especializado, menos competencia)

Clusters:
```
Cluster: Salud
  enfermedades más comunes del hurón
  insulinoma en hurones: síntomas y tratamiento
  linfoma en hurones: diagnóstico y pronóstico
  desparasitación de hurones: calendario

Cluster: Cuidados
  jaula perfecta para hurones
  juguetes para hurones: qué comprar
  cómo bañar a un hurón correctamente
  cuántas horas duerme un hurón

Cluster: Alimentación
  qué comen los hurones en la naturaleza
  mejores marcas de comida para hurones
  frutas que puede comer un hurón
  suplementos para hurones
```

### bulldogs / chinchillas / exotic-pets
**Mismo enfoque:** clusters de contenido + afiliados Amazon específicos

---

## Estrategia de Interlinking por Cluster

Cada cluster debe tener:
1. **Artículo pilar** (1500-2000 palabras, keyword principal)
2. **3-5 artículos satélite** (800-1200 palabras, long-tail)
3. Todos los satélites enlazan al pilar
4. El pilar enlaza a los satélites relevantes

```
Artículo pilar: "Enfermedades del hurón: guía completa" 
  → satélite 1: "Insulinoma en hurones"
  → satélite 2: "Linfoma en hurones"  
  → satélite 3: "Desparasitación de hurones"
  → satélite 4: "Adrenal en hurones"
```

**Implementación en pipeline:**
- Campo `CLUSTER_ID` en CONTENT_PIPELINE (futuro)
- 10_INTERLINK_BUILDER agrupa por cluster y añade links

---

## Plantilla de Títulos por Intención de Búsqueda

### Informacional (mayor volumen)
```
"Cómo [acción] [objeto]"
"Qué es [término]"
"Síntomas de [enfermedad/problema]"
"Guía completa de [tema]"
"Todo lo que necesitas saber sobre [tema]"
```

### Comparacional (alta conversión AdSense)
```
"[Producto A] vs [Producto B]: cuál elegir en 2025"
"Mejores [categoría] de [año]: comparativa"
"[X] alternativas a [producto popular]"
```

### Transaccional (máxima conversión afiliados)
```
"Dónde comprar [producto] barato"
"Mejor [producto] para [uso específico]"
"[Producto] recomendado por veterinarios"
```

---

## Volumen de Producción Óptimo por Nicho

| Nicho | Artículos/semana | Prioridad | Meta posts totales para AdSense |
|---|---|---|---|
| insurance (EN) | 5-7 | 1 | 50+ (para postular AdSense) |
| legal-us (EN) | 3-5 | 1 | 50+ |
| seguros (ES) | 3-5 | 1 | 30+ |
| finanzas (ES) | 3-5 | 2 | 30+ |
| veterinary (ES) | 7-14 | 3 | 100+ |
| hurones (ES) | 3-5 | 3 | 50+ |
| ia/saas (ES) | 3-5 | 2 | 30+ |

**Nota sobre AdSense:** Se necesitan ~50 artículos de calidad + dominio activo 6 meses para aprobación. Blogs en inglés con nichos premium tienen aprobación más rápida.

---

## Afiliados Amazon por Nicho

| Nicho | Categoría Amazon | Comisión |
|---|---|---|
| veterinary | Pet Supplies | 4-8% |
| hurones | Small Animals | 4-8% |
| bulldogs | Dog Supplies | 4-8% |
| finanzas | Books, Software | 4-5% |
| ia/saas | Electronics, Software | 2-8% |
| legal-us | Books | 4% |

**Keywords de afiliado de alto valor (veterinary):**
```
"mejor comida para [raza]" → comida premium ($50-80/unidad)
"antipulgas para perros" → productos antiparasitarios ($20-40)
"suplementos para [condición]" → suplementos ($30-60)
"collar GPS para perros" → tecnología ($50-150) 
```
