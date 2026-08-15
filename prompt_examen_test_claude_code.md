# Prompt per a Claude Code — Generació d'examen tipus test

Copia i enganxa això a Claude Code (ajusta els camps entre claudàtors [ ] abans):

---

Tinc a aquesta carpeta el material de tot el curs, organitzat (o no) per unitats de treball. Vull que generis una **proposta d'examen tipus test per a cada unitat de treball**, amb 40 preguntes per unitat.

**Context:**
- Matèria: [p. ex. Biologia]
- Curs / nivell: [p. ex. 4t ESO]
- Nombre d'unitats de treball: [indica'n el nombre, o digues-li que ho dedueixi ell mateix a partir de la carpeta]

**Primer pas:** Llegeix tots els fitxers de material d'aquesta carpeta i identifica en quantes unitats de treball es divideix el curs i quins continguts clau té cadascuna. Fes-me un breu resum (unitat per unitat) abans de redactar cap pregunta, perquè pugui confirmar-ho o corregir-ho abans de continuar.

**Requisits de l'examen tipus test:**
- Per a **cada unitat de treball**, genera una proposta d'examen independent amb **40 preguntes tipus test**.
- Cada pregunta ha de tenir **4 opcions de resposta (A, B, C, D)**, de les quals **només una és correcta**.
- Les preguntes han de cobrir el contingut de la unitat de manera equilibrada (no concentrar-les totes en el mateix apartat del material).
- Evita preguntes purament memorístiques i literals quan sigui possible; prioritza preguntes que obliguin a entendre, aplicar o distingir conceptes (no calcs de memòria directa del text), sense deixar de cobrir els continguts clau de la unitat.
- Les opcions incorrectes ("distractors") han de ser plausibles i relacionades amb el tema, no absurdes ni òbviament falses, perquè la pregunta tingui valor real de discriminació.

**⚠️ Regla obligatòria sobre la longitud de les opcions (molt important):**
- **La resposta correcta NO pot ser mai, de manera sistemàtica, l'opció més llarga de les 4.** Aquest és un biaix típic que permet als alumnes encertar per longitud sense saber la resposta, i s'ha d'evitar completament.
- Per aconseguir-ho:
  - Redacta les 4 opcions amb una longitud (nombre de paraules/caràcters) similar entre elles sempre que sigui possible.
  - Si per contingut una opció ha de ser més llarga que les altres, **assegura't que no sigui sistemàticament la correcta**: reparteix quina posició (A/B/C/D) i quina llargada té la resposta correcta de manera variada al llarg de les 40 preguntes.
  - Abans de finalitzar cada unitat, revisa el conjunt de 40 preguntes i comprova que la resposta correcta no sigui la més llarga en la majoria de casos. Corregeix-ho si detectes aquest patró.

**Format de cada pregunta:**
- Número de pregunta.
- Enunciat clar i complet.
- Opcions A, B, C i D.
- (No indiquis la resposta correcta al mateix document de l'examen net — veure apartat de solucionari.)

**Solucionari:**
- Genera el **solucionari a part de l'examen net**, en un segon fitxer Markdown, indicant per a cada pregunta la lletra de l'opció correcta i una breu justificació (1-2 línies) de per què és la correcta i, si aporta valor, per què les altres no ho són.
- L'examen net (per a l'alumnat) NO ha de contenir cap indicació de la resposta correcta.

**Format de sortida:**
- Genera **dos fitxers Markdown (.md) descarregables**:
  1. `examen_test_[matèria]_[curs].md` — l'examen net, organitzat amb un títol general del curs i un apartat (## Unitat X — nom de la unitat) per a cada unitat, amb les seves 40 preguntes i opcions A-D.
  2. `solucionari_test_[matèria]_[curs].md` — el solucionari corresponent, amb la mateixa estructura d'unitats i numeració de preguntes.
- Fes servir capçaleres (##, ###) i llistes numerades perquè quedi ben llegible en Markdown.
- Guarda els dos fitxers a la carpeta de sortida.

**Important:** Basa't estrictament en el material proporcionat — no inventis continguts que no hi apareguin. Si per alguna unitat el material és insuficient per arribar a 40 preguntes de qualitat sense repetir-se o forçar contingut no cobert, avisa-m'ho explícitament indicant quantes preguntes de qualitat sí que pots generar per aquella unitat.

---

## Notes d'ús
- Si el material no està ja organitzat per carpetes/unitats, pots indicar-li tu mateix quins fitxers corresponen a quina unitat abans d'enganxar el prompt.
- Amb 40 preguntes per unitat i moltes unitats, els fitxers poden sortir llargs: si prefereixes un .md separat per unitat en lloc d'un de sol, digues-ho explícitament al prompt.
- Si vols, pots demanar-li addicionalment que generi una graella/plantilla de respostes (A/B/C/D per número de pregunta) en un tercer fitxer, útil per a correcció ràpida o lectura òptica.
