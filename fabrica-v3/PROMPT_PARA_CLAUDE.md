# Prompt para pegarle a Claude (Claude Code o claude.ai/code)

Copia todo lo que está dentro del bloque y pégalo como primer mensaje en una sesión nueva de Claude Code con tu repo `luis-claude-code-n8n` abierto.

```
Soy Luis Arturo García, médico veterinario en Ecuador. Tengo una fábrica de blogs en Blogger que corre en n8n con DeepSeek. Mi repo es luisarturo88/luis-claude-code-n8n, rama claude/n8n-blog-factory-seo-9btfgf.

OBJETIVO
Quiero que la fábrica sea autónoma y que un equipo de agentes (un CEO y empleados) me asesore y haga la mayor parte del trabajo, mientras yo solo apruebo. Meta: que cada blog aspire a USD 5.000-10.000/mes. No me prometas ingresos: dime qué es medido y qué es estimado.

LO QUE YA ESTÁ INSTALADO EN EL REPO
- .claude/agents/ : unos 40 agentes del proyecto msitarzewski/agency-agents (MIT) —SEO, AEO, contenido, anuncios de Meta, producto, finanzas, orquestador— más un agente propio llamado "CEO Fábrica de Blogs".
- agentes/agency-agents/ : catálogo completo (330 agentes, playbooks y runbooks de coordinación en strategy/). No se carga solo; sirve para sacar más agentes cuando haga falta.
- fabrica-v3/ : documentación y estado de la fábrica.

LO QUE QUIERO QUE HAGAS, EN ORDEN
1. Lee fabrica-v3/README.md y fabrica-v3/ESTADO_Y_PENDIENTES.md.
2. Verifica que los agentes de .claude/agents/ cargan (lista sus nombres). Si alguno tiene el formato roto, dímelo sin borrarlo.
3. Actúa como "CEO Fábrica de Blogs": revisa mi hoja REGISTRY_BLOGS (pestañas FABRICA, NICHOS, CEO_V3, V3_BORRADORES) y mis flujos n8n que empiezan con "🚀 V3", y dame un informe corto: qué funciona, qué falló, qué falta.
4. Pide opinión a 2 o 3 agentes (por ejemplo SEO, monetización y riesgo) antes de recomendarme algo, y muéstrame si discrepan.
5. Termina con las 3 decisiones concretas que me toca aprobar.

REGLAS
- El autor de todos los blogs es Luis Arturo García. Solo en veterinaria escribo como experto; en finanzas, legal y salud humana el autor es "bloguero" con aviso y fuentes.
- Contenido veterinario con dosis o combinaciones de fármacos: lo reviso yo antes de publicar.
- No publiques ni gastes en anuncios sin mi aprobación explícita.
- No modifiques mis flujos antiguos de n8n. Todo lo nuevo va como flujo nuevo e inactivo hasta que yo apruebe.
- Antes de instalar código de terceros, revísalo y dime qué hace.
- Si algo falla o no tienes acceso, dímelo tal cual; no inventes resultados.
```

## Para instalarlo en otra máquina o repo (si no está ya)
```
git clone https://github.com/msitarzewski/agency-agents
mkdir -p TU_REPO/.claude/agents
cp agency-agents/marketing/marketing-seo-specialist.md TU_REPO/.claude/agents/   # repite con los que quieras
```
Claude Code carga automáticamente los `.md` de `.claude/agents/` del proyecto.

## Nota sobre `auto-co-meta`
`NikitaDmitrieff/auto-co-meta` (MIT) se llama "meta" por *meta-sistema* (una empresa de 14 agentes que se programa a sí misma), **no** por Meta Ads. Para anuncios de Meta (Facebook/Instagram) ya están instalados `paid-media-paid-social-strategist`, `paid-media-creative-strategist` y `paid-media-tracking-specialist`. `auto-co-meta` queda como siguiente candidato después de las pruebas.
