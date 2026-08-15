# Prompt per a Claude Code — Generació d'examen escrit competencial

Copia i enganxa això a Claude Code (ajusta els camps entre claudàtors [ ] abans):

---

Tinc a aquesta carpeta el material de tot el curs, organitzat (o no) per unitats de treball. Vull que generis una **proposta d'examen per a cada unitat de treball**, amb 20 preguntes/activitats per unitat.

**Context:**
- Matèria: [p. ex. Biologia]
- Curs / nivell: [p. ex. 4t ESO]
- Nombre d'unitats de treball: [indica'n el nombre, o digues-li que ho dedueixi ell mateix a partir de la carpeta]

**Primer pas:** Llegeix tots els fitxers de material d'aquesta carpeta i identifica en quantes unitats de treball es divideix el curs i quins continguts clau té cadascuna. Fes-me un breu resum (unitat per unitat) abans de redactar cap pregunta, perquè pugui confirmar-ho o corregir-ho abans de continuar.

**Requisits de la proposta d'examen:**
- Per a **cada unitat de treball**, genera una proposta d'examen independent amb **20 preguntes/activitats**.
- NO vull un examen tipus test amb opcions ni preguntes de pregunta-resposta directa/memorística com a base general.
- **Proporció**: la majoria de les 20 preguntes (aprox. 14-16) han de ser competencials/originals (veure tipus més avall). La resta (aprox. 4-6) poden ser preguntes més tradicionals i directes (definicions clau, càlculs bàsics, identificacions), per assegurar que es cobreixen els continguts mínims de la unitat.
- **Per a cada pregunta indica**:
  - Enunciat complet.
  - Puntuació orientativa.
  - Nivell de dificultat (bàsic / mitjà / avançat).
  - Objectiu d'aprenentatge o competència que avalua (una frase curta).
- Vull activitats **originals i competencials** per a la majoria de preguntes, que avaluïn comprensió i aplicació, no memòria. Reparteix-les combinant diversos d'aquests tipus (no cal fer-les servir totes a cada unitat, però busca varietat):
  1. Cas pràctic / situació problema nova (no vista al material) on calgui aplicar el contingut.
  2. Detecció d'errors: un text o exercici resolt amb errors amagats que l'alumne ha de trobar i corregir justificant per què.
  3. Comparació crítica entre dues fonts, teories o solucions, valorant quina és més sòlida.
  4. Redacció adreçada a un públic concret (explicar un concepte a un infant, en un article, en una carta...).
  5. Mapa conceptual o esquema amb justificació escrita de les connexions triades.
  6. Postura i defensa argumentada sobre una afirmació discutible del tema.
  7. Role-play escrit (respondre com un personatge o professional relacionat amb el contingut).
  8. Interpretació de dades/gràfic/font primària no vista prèviament.
  9. Connexió entre dos blocs de contingut diferents del temari.

- Al final de cada unitat, inclou també una **pauta de correcció general** (rúbrica breu) per a les 20 preguntes en conjunt.

**Solucionari:**
- Genera el **solucionari a part de l'examen net**, en un segon fitxer Markdown, amb la resposta model o criteris detallats de correcció per a cada pregunta (organitzat també per unitats).
- L'examen net (per a l'alumnat) NO ha de contenir cap resposta ni pista de la solució.

**Format de sortida:**
- Genera **dos fitxers Markdown (.md) descarregables**:
  1. `proposta_examens_[matèria]_[curs].md` — l'examen net, organitzat amb un títol general del curs i un apartat (## Unitat X — nom de la unitat) per a cada unitat, amb les seves 20 preguntes (enunciat, puntuació, dificultat i objectiu/competència).
  2. `solucionari_[matèria]_[curs].md` — el solucionari corresponent, amb la mateixa estructura d'unitats i numeració de preguntes, per facilitar-ne la correcció.
- Fes servir capçaleres (##, ###), llistes numerades per a les preguntes i taules si calen, perquè quedi ben llegible en Markdown.
- Guarda els dos fitxers a la carpeta de sortida.

**Important:** Basa't estrictament en el material proporcionat — no inventis continguts que no hi apareguin. Si per alguna unitat el material és insuficient per arribar a 20 preguntes de qualitat, avisa-m'ho explícitament indicant quantes preguntes de qualitat sí que pots generar per aquella unitat, en comptes d'omplir amb preguntes febles, repetitives o de contingut no cobert al material.

---

## Notes d'ús
- Si el material no està ja organitzat per carpetes/unitats, pots indicar-li tu mateix quins fitxers corresponen a quina unitat abans d'enganxar el prompt.
- Amb 20 preguntes per unitat i moltes unitats, els fitxers poden sortir llargs: si prefereixes un .md separat per unitat en lloc d'un de sol, digues-ho explícitament al prompt.
