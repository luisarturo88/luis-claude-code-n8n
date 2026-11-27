# Fábrica V3 · Blogs autónomos con IA

Sistema nuevo que convive con la fábrica pequeña. No modifica ningún flujo existente: todo lo V3 son flujos nuevos, con nombre `🚀 V3 · ...`, y se activan solo cuando tú lo decides.

## Hoja única: REGISTRY_BLOGS (`1Vq8TuyqI22C3_Ffth-GsGdDRuXfHORpdAGOiowLxIpk`)
- Filas sin color = fábrica pequeña (como hasta hoy).
- Filas con color de fondo = recomendadas por la fábrica V3. Se reconocen porque `NICHO_ID` empieza con `V3-`.
- Regla de color (una sola vez): en NICHOS, Formato > Formato condicional > rango `A2:V1000` > fórmula personalizada `=LEFT($C2,3)="V3-"` > fondo verde claro.
- Tú apruebas escribiendo `SI` en `ELEGIR` y pegando el `BLOG_ID` de Blogger. El flujo horario existente (`🔭 INVESTIGADOR DE NICHOS`, segunda mitad) los pasa a FABRICA.

## Flujos
| Flujo | Estado | Qué hace |
|---|---|---|
| `🚀 V3 · Investigador de mercado IA` (`me2hx2R4oYtw3eU0`) | creado, inactivo | Cada lunes: DeepSeek propone 24 nichos de alto valor (cualquier idioma), valida demanda con búsquedas reales de Google, puntúa y deja los 10 mejores en NICHOS. Avisa por Telegram. |
| `🚀 V3 · CEO semanal` | por construir | Lee FABRICA, NICHOS y rendimiento por blog. Un panel de agentes (SEO, contenido, monetización, riesgo) propone qué escalar, pausar o cambiar; tú apruebas. |
| `🚀 V3 · Constructor de blog` | por construir | Al aprobar un nicho: páginas legales, plantilla, silos de temas y plan de 90 días. |
| `🚀 V3 · Redactor calidad alta` | por construir | Artículo SEO + AEO + rich snippets + nivel humano, con revisor automático antes de programar. |

## Reglas de calidad y honestidad
- Los potenciales de ingresos son estimaciones, nunca promesas. Un blog nuevo suele tardar 6-12 meses en posicionar.
- `AUTOR_TIPO = experto` solo en veterinaria y afines. En finanzas, legal o salud humana el autor es `bloguero`.
- Todo contenido veterinario con dosis o combinaciones de fármacos pasa por revisión del médico veterinario antes de publicarse.
- Validar los mejores candidatos con Ahrefs / Keyword Tool antes de crear el blog.

## Credenciales usadas (ya existentes en n8n)
Google Sheets, DeepSeek (`deepSeekApi`), Telegram `@articulosblogbot`, Blogger.
