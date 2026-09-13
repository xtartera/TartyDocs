# Rúbrica completa · Projecte Integrador Obert UT3

> Extreta de `Projecte_integrador_UT3_V3_recursos_compartits.odt`. **No es publica al manual** (GitHub Pages) — és una eina de correcció d'ús intern del professorat. La versió resumida per a l'alumnat (blocs i pesos) és a [`docs/ut3/projectes-i/04-lliurament-i-avaluacio.md`](../docs/ut3/projectes-i/04-lliurament-i-avaluacio.md).

## Estructura i ponderació

| Bloc | Nombre d'ítems | Punts màxims | Pes final |
|---|---|---|---|
| A. Disseny i planificació | 3 | 200 | 20 % |
| B. Implementació tècnica | 8 | 500 | 50 % |
| C. Documentació, validació i competència tècnica | 5 | 300 | 30 % |

## Rúbrica 1 · Descriptors de gradació

| Bloc | Codi i ítem | 1 → Insuficient | 4 → Bàsic | 7 → Correcte | 10 → Excel·lent |
|---|---|---|---|---|---|
| A. Disseny i planificació | A1 · Anàlisi de necessitats i recursos | No identifica adequadament necessitats, usuaris o recursos. | Identifica els elements principals però amb mancances o poca coherència. | Defineix correctament usuaris, grups, recursos i necessitats d'accés. | Anàlisi completa, realista i perfectament adaptada a l'organització. |
| A. Disseny i planificació | A2 · Disseny de la infraestructura | No existeix una planificació clara. | Disseny parcial de xarxa, directoris o recursos. | Arquitectura completa i coherent amb servidor, clients, recursos i serveis. | Arquitectura molt ben estructurada, escalable i coherent amb totes les necessitats. |
| A. Disseny i planificació | A3 · Decisions Samba/NFS i justificació tècnica | No justifica l'elecció dels protocols. | Justificacions superficials o basades principalment en el tipus de client. | Selecciona Samba/NFS adequadament i justifica les decisions principals. | Analitza críticament les alternatives i argumenta totes les decisions segons accés, clients, permisos, persistència i ús. |
| B. Implementació tècnica | B1 · Usuaris, grups, permisos i ACL | Estructura incorrecta o accessos no controlats. | Usuaris i permisos funcionen parcialment o presenten incoherències. | Usuaris, grups, permisos i ACL correctament implementats i verificats. | Política d'accés completa, ordenada i adaptada als diferents perfils, amb proves positives i negatives. |
| B. Implementació tècnica | B2 · Recursos compartits Samba | Samba no funciona o els recursos no són accessibles. | Recursos parcialment funcionals o amb errors de permisos/configuració. | Recursos Samba correctament publicats, accessibles i restringits segons el disseny. | Implementació robusta, coherent, persistent quan correspon i perfectament integrada amb clients i permisos. |
| B. Implementació tècnica | B3 · Recursos compartits NFS i persistència | NFS no funciona o els recursos no es poden muntar. | Muntatge funcional però amb errors de permisos, exportació o persistència. | NFS correctament configurat, muntat, verificat i persistent quan correspon. | Configuració completa, segura i coherent, amb permisos, exportacions i persistència perfectament justificats. |
| B. Implementació tècnica | B4 · Identitat i permisos NFS – UID/GID | No comprèn ni comprova la relació UID/GID. | Identifica UID/GID però l'anàlisi o les proves són incompletes. | Demostra correctament la relació UID/GID–propietat–permisos. | Provoca, analitza i resol una discrepància controlada i n'explica tècnicament les conseqüències. |
| B. Implementació tècnica | B5 · Integració CUPS | No s'implementa o no funciona. | Servei o impressora parcialment funcional. | Impressora publicada i utilitzable correctament des d'un client. | Integració completa, correctament validada i coherent amb l'escenari. |
| B. Implementació tècnica | B6 · Laboratori NFS–SMB–CIFS | No completa les proves o no diferencia els mecanismes d'accés. | Realitza part de les proves però amb conclusions superficials. | Completa NFS, `smbclient` i CIFS i explica correctament les diferències observades. | Compara amb profunditat els tres mecanismes, relacionant muntatge, operacions, permisos, UID/GID, `tar` i restauració. |
| B. Implementació tècnica | B7 · Còpies amb `tar` i restauració | Les còpies no funcionen o no es diferencien els tipus. | Implementa parcialment completa/incremental/diferencial o presenta errors de restauració. | Implementa i verifica completa, incremental i diferencial i restaura correctament dades. | Sistema completament funcional, amb canvis verificables, restauració demostrada i política de còpies tècnicament argumentada. |
| B. Implementació tècnica | B8 · Protecció i servei transversal | No implementa les mesures requerides. | UFW o la segona mesura/servei funcionen parcialment. | UFW, segona mesura de seguretat i servei transversal funcionen correctament. | Mesures i servei perfectament integrats, restringits, verificats i justificats segons les necessitats de la infraestructura. |
| C. Documentació, validació i competència tècnica | C1 · Estructura i qualitat del dossier | Document desorganitzat, incomplet o difícil de seguir. | Conté la majoria dels apartats però amb mancances o redundàncies. | Dossier ordenat, complet i coherent amb les activitats. | Documentació professional, sintètica, molt clara i fàcilment reproduïble per un altre tècnic. |
| C. Documentació, validació i competència tècnica | C2 · Qualitat de les evidències | Evidències insuficients, il·legibles o que no demostren el funcionament. | Evidències correctes però poc contextualitzades o incompletes. | Evidències clares, representatives i relacionades amb les verificacions. | Evidències excel·lentment seleccionades, contextualitzades i suficients per demostrar funcionament i restriccions. |
| C. Documentació, validació i competència tècnica | C3 · Explicacions i justificació tècnica | Es limita a captures o comandes sense explicació. | Explicacions superficials. | Explica correctament què ha fet, per què i quin resultat obté. | Demostra domini tècnic, capacitat d'anàlisi i relaciona les decisions amb el comportament observat. |
| C. Documentació, validació i competència tècnica | C4 · Validació i diagnosi d'incidències | No valida globalment el sistema ni documenta una incidència. | Validació parcial o diagnosi poc estructurada. | Realitza proves positives/negatives i diagnostica correctament una incidència real. | Validació completa i sistemàtica; diagnosi rigorosa basada en hipòtesis, comprovacions, causa, solució i revalidació. |
| C. Documentació, validació i competència tècnica | C5 · Microauditoria pràctica, autonomia i validació d'autoria | No sap localitzar ni explicar les configuracions principals. No pot realitzar una modificació senzilla ni verificar-ne el resultat, fins i tot amb ajuda. Respostes incoherents amb la infraestructura presentada. | Reconeix parcialment les configuracions i pot realitzar alguna modificació senzilla amb ajuda. Verificació incompleta o necessita suport per interpretar el resultat. | Explica correctament les decisions principals, realitza de manera autònoma una modificació pràctica no preparada i verifica l'efecte esperat. Sap justificar què ha fet i per què. | Demostra domini global de la infraestructura. Resol amb autonomia una modificació o incidència no preparada, selecciona les eines de diagnosi adequades, verifica el resultat, reverteix el canvi si cal i justifica tècnicament les decisions preses. |

## Rúbrica 2 · Puntuació ponderada per a Moodle

| Bloc | Codi i ítem | Màxim | Nivell 1 | Nivell 4 | Nivell 7 | Nivell 10 |
|---|---|---|---|---|---|---|
| A. Disseny i planificació (200 punts) | A1 · Anàlisi de necessitats i recursos | 50 | 5 | 20 | 35 | 50 |
| A. Disseny i planificació (200 punts) | A2 · Disseny de la infraestructura | 70 | 7 | 28 | 49 | 70 |
| A. Disseny i planificació (200 punts) | A3 · Decisions Samba/NFS i justificació | 80 | 8 | 32 | 56 | 80 |
| B. Implementació tècnica (500 punts) | B1 · Usuaris, grups, permisos i ACL | 60 | 6 | 24 | 42 | 60 |
| B. Implementació tècnica (500 punts) | B2 · Samba | 80 | 8 | 32 | 56 | 80 |
| B. Implementació tècnica (500 punts) | B3 · NFS i persistència | 80 | 8 | 32 | 56 | 80 |
| B. Implementació tècnica (500 punts) | B4 · UID/GID i permisos NFS | 50 | 5 | 20 | 35 | 50 |
| B. Implementació tècnica (500 punts) | B5 · CUPS | 30 | 3 | 12 | 21 | 30 |
| B. Implementació tècnica (500 punts) | B6 · NFS–SMB–CIFS | 80 | 8 | 32 | 56 | 80 |
| B. Implementació tècnica (500 punts) | B7 · `tar`: completa/incremental/diferencial/restauració | 80 | 8 | 32 | 56 | 80 |
| B. Implementació tècnica (500 punts) | B8 · UFW + seguretat + servei transversal | 40 | 4 | 16 | 28 | 40 |
| C. Documentació, validació i competència (300 punts) | C1 · Estructura i qualitat del dossier | 40 | 4 | 16 | 28 | 40 |
| C. Documentació, validació i competència (300 punts) | C2 · Qualitat de les evidències | 60 | 6 | 24 | 42 | 60 |
| C. Documentació, validació i competència (300 punts) | C3 · Explicacions i justificació tècnica | 60 | 6 | 24 | 42 | 60 |
| C. Documentació, validació i competència (300 punts) | C4 · Validació i diagnosi | 80 | 8 | 32 | 56 | 80 |
| C. Documentació, validació i competència (300 punts) | C5 · Microauditoria i autonomia | 60 | 6 | 24 | 42 | 60 |

**TOTAL PROJECTE: 1.000 punts** (100 / 400 / 700 / 1.000 als nivells 1/4/7/10 respectivament). **Nota final = punts totals / 100**.

## Ponderació dels Resultats d'Aprenentatge

> Aquesta ponderació expressa el pes curricular dels RA **dins d'aquest projecte concret**. No modifica la ponderació global dels RA del mòdul.

| Resultat d'Aprenentatge | Justificació | Ponderació |
|---|---|---|
| RA1. Instal·la sistemes operatius en xarxa | El projecte parteix d'un servidor i clients ja disponibles i no té com a objectiu principal la instal·lació del SO. Només es treballen indirectament aspectes de configuració i connectivitat. | 0 % |
| RA2. Gestiona usuaris i grups de sistemes operatius en xarxa | Creació i gestió d'usuaris i grups, pertinences, perfils d'accés i aplicació de permisos associats als diferents recursos corporatius. | 15 % |
| RA3. Realitza tasques de gestió sobre dominis | No s'implementa cap domini ni servei de directori. Aquest RA no forma part dels objectius avaluables del projecte. | 0 % |
| RA4. Gestiona els recursos compartits del sistema | Nucli principal del projecte: Samba, NFS, directoris compartits, permisos Unix i ACL, CUPS, nivells d'accés i protecció dels recursos. | 35 % |
| RA5. Realitza tasques de monitoratge i ús del sistema operatiu en xarxa | Comprovació dels serveis, interpretació de configuracions, diagnosi d'incidències, còpies i restauració, validació global i microauditoria. | 15 % |
| RA6. Realitza tasques d'integració de sistemes operatius lliures i propietaris | Altre gran eix del projecte: servidor Linux, clients Linux i Windows, Samba/NFS/CIFS, accés heterogeni als recursos, CUPS i verificació dels serveis des de diferents sistemes operatius. | 35 % |
| **Total** | | **100 %** |

## Relació entre ítems i RA (punts)

| Bloc / Ítem | RA2 | RA4 | RA5 | RA6 | Total |
|---|---|---|---|---|---|
| A1 Anàlisi de necessitats i recursos | 10 | 20 | – | 20 | 50 |
| A2 Disseny de la infraestructura | – | 30 | – | 40 | 70 |
| A3 Decisions Samba/NFS i justificació | – | 40 | – | 40 | 80 |
| B1 Usuaris, grups, permisos i ACL | 40 | 20 | – | – | 60 |
| B2 Recursos compartits Samba | – | 40 | – | 40 | 80 |
| B3 Recursos compartits NFS i persistència | – | 40 | – | 40 | 80 |
| B4 Identitat i permisos NFS – UID/GID | 20 | 20 | 10 | – | 50 |
| B5 Integració CUPS | – | 15 | – | 15 | 30 |
| B6 Laboratori NFS–SMB–CIFS | – | 30 | 10 | 40 | 80 |
| B7 Còpies amb `tar` i restauració | – | 20 | 50 | 10 | 80 |
| B8 Protecció i servei transversal | – | 20 | 10 | 10 | 40 |
| C1 Estructura i qualitat del dossier | – | – | 40 | – | 40 |
| C2 Qualitat de les evidències | – | – | 40 | 20 | 60 |
| C3 Explicacions i justificació tècnica | – | 20 | 20 | 20 | 60 |
| C4 Validació i diagnosi | – | 20 | 50 | 10 | 80 |
| C5 Microauditoria i autonomia | – | 15 | 20 | 25 | 60 |
| **TOTAL** | **70** | **350** | **250** | **330** | **1.000** |

## Correspondència amb els RA i CA oficials

| Ítem del projecte | RA | CA relacionats | Justificació curricular |
|---|---|---|---|
| A1. Anàlisi de necessitats i recursos | RA4, RA6 | 4.2; 6.1, 6.3 | Identifica quins recursos s'han de compartir, amb quins usuaris, condicions d'accés i sistemes operatius, en un entorn heterogeni. |
| A2. Disseny de la infraestructura | RA4, RA6 | 4.2, 4.6; 6.1, 6.3, 6.8 | Planificar els recursos compartits, els clients, els protocols i els nivells de seguretat necessaris. |
| A3. Decisions Samba/NFS i justificació | RA4, RA6 | 4.2, 4.6; 6.1, 6.3 | Selecciona i justifica Samba o NFS segons necessitats, clients, accés, persistència i seguretat. |
| B1. Usuaris, grups, permisos i ACL | RA2, RA4 | 2.1, 2.4, 2.5, 2.6, 2.9; 4.1, 4.3, 4.6 | Es creen i gestionen comptes i grups, se'n defineixen pertinences i s'apliquen permisos Unix i ACL. |
| B2. Recursos compartits Samba | RA4, RA6 | 4.2, 4.3, 4.6; 6.1, 6.3, 6.4, 6.5, 6.8, 6.9 | Configura recursos Samba, estableix permisos i nivells de seguretat, verifica l'accés des dels sistemes previstos. |
| B3. Recursos compartits NFS i persistència | RA4, RA6 | 4.2, 4.3, 4.6; 6.3, 6.4, 6.5, 6.8, 6.9 | Configura NFS, estableix permisos, realitza muntatges des dels clients i en comprova la persistència. |
| B4. Identitat i permisos NFS – UID/GID | RA2, RA4, RA5 | 2.1, 2.9; 4.3, 4.6; 5.3, 5.6 | Investiga la relació entre identitat, UID/GID, propietat i permisos, i diagnostica discrepàncies entre servidor i client. |
| B5. Integració CUPS | RA4, RA6 | 4.4; 6.3, 6.4, 6.6, 6.9 | Comparteix una impressora en xarxa i comprova que els clients poden utilitzar-la correctament. |
| B6. Laboratori NFS–SMB–CIFS | RA4, RA5, RA6 | 4.2, 4.3, 4.6; 5.3, 5.6; 6.1, 6.3, 6.4, 6.5, 6.9 | Compara experimentalment mecanismes d'accés a recursos remots i interpreta les diferències entre client de protocol i recurs muntat. |
| B7. Còpies amb `tar` i restauració | RA4, RA5, RA6 | 4.2, 4.3; 5.4, 5.5, 5.6; 6.5, 6.9 | Protegeix dades mitjançant còpies completa, incremental i diferencial, i executa una restauració funcional. |
| B8. Protecció i servei transversal | RA4, RA5, RA6 | 4.6; 5.4, 5.6; 6.3, 6.4, 6.8, 6.9 | UFW i la mesura addicional estableixen nivells de seguretat; el servei transversal amplia la infraestructura. |
| C1. Estructura i qualitat del dossier | RA5 | 5.6 | Evidencia la capacitat d'interpretar i descriure de manera coherent la configuració del sistema desplegat. |
| C2. Qualitat de les evidències | RA5, RA6 | 5.3, 5.6; 6.9 | Demostra de manera verificable el comportament dels serveis, recursos i accessos implementats. |
| C3. Explicacions i justificació tècnica | RA4, RA5, RA6 | 4.2, 4.6; 5.4, 5.6; 6.1, 6.3 | Interpreta, explica i justifica les decisions relatives a recursos, protocols, configuracions i mecanismes de seguretat. |
| C4. Validació i diagnosi | RA4, RA5, RA6 | 4.6; 5.3, 5.4, 5.6; 6.2, 6.5, 6.8, 6.9 | Verifica funcionament, connectivitat, permisos, seguretat i capacitat de manteniment mitjançant proves i diagnosi. |
| C5. Microauditoria i autonomia | RA4, RA5, RA6 | 4.3, 4.6; 5.4, 5.6; 6.5, 6.8, 6.9 | Comprova la capacitat d'interpretar una infraestructura real, modificar-ne un element, verificar-ne el resultat i justificar l'actuació. |
