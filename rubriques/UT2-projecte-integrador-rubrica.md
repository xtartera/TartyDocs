# Rúbrica completa · Projecte Integrador Obert UT2

> Extreta de `UT2 P2 Projecte Integrador v2 Obert VFinal.odt`. **No es publica al manual** (GitHub Pages) — és una eina de correcció d'ús intern del professorat. La versió resumida per a l'alumnat (blocs i pesos) és a [`docs/ut2/projectes-i/04-lliurament-i-avaluacio.md`](../docs/ut2/projectes-i/04-lliurament-i-avaluacio.md).

## Estructura i ponderació

La rúbrica s'organitza en tres blocs i 16 ítems. La primera taula descriu qualitativament els nivells 1, 4, 7 i 10. La segona conserva exactament els mateixos ítems, però substitueix els descriptors pels punts ponderats que es poden introduir directament en una rúbrica de Moodle. La puntuació màxima és de 1.000 punts i la nota final s'obté dividint el total entre 100.

| Bloc | Nombre d'ítems | Punts màxims | Pes final |
|---|---|---|---|
| A. Disseny i planificació | 3 | 200 | 20 % |
| B. Implementació tècnica | 8 | 500 | 50 % |
| C. Documentació tècnica | 5 | 300 | 30 % |

## Rúbrica 1 · Descriptors de gradació

| Bloc | Codi i ítem | 1 → Insuficient | 4 → Bàsic | 7 → Correcte | 10 → Excel·lent |
|---|---|---|---|---|---|
| A. Disseny i planificació | A1 · Definició de l'organització | No es defineix l'organització o és incoherent. | Organització definida de forma molt simple. | Organització coherent amb els serveis implementats. | Organització molt ben contextualitzada, realista i completament coherent. |
| A. Disseny i planificació | A2 · Disseny de la infraestructura | No existeix una planificació clara dels serveis. | Defineix parcialment la xarxa o l'estructura LDAP. | Presenta una arquitectura completa i coherent. | Arquitectura molt ben estructurada, escalable i totalment justificada. |
| A. Disseny i planificació | A3 · Justificació tècnica | No justifica les decisions preses. | Les justificacions són superficials. | Justifica adequadament les decisions tècniques principals. | Totes les decisions estan argumentades amb criteris tècnics i de gestió. |
| B. Implementació tècnica | B1 · Configuració inicial del servidor | El servidor no és funcional. | El servidor funciona però presenta errors de configuració. | Servidor correctament configurat i operatiu. | Configuració robusta, ordenada i completament funcional. |
| B. Implementació tècnica | B2 · Xarxa i servei DHCP | El servei no funciona. | El servei funciona parcialment o amb errors. | Configuració correcta del DHCP amb les funcionalitats requerides. | Configuració completa, ben documentada i totalment integrada amb la xarxa. |
| B. Implementació tècnica | B3 · Servei LDAP i LAM | El directori no és funcional. | El directori funciona parcialment o presenta errors d'estructura. | Directori correctament implementat i gestionat amb LAM. | Estructura molt ben organitzada i adaptada a les necessitats de l'organització. |
| B. Implementació tècnica | B4 · Gestió d'usuaris i grups | No s'han creat correctament els usuaris o grups. | Usuaris creats amb errors o estructura poc coherent. | Usuaris, grups i permisos correctament configurats. | Gestió completa, coherent i adaptada a l'escenari plantejat. |
| B. Implementació tècnica | B5 · Perfils mòbils NFS | No funciona el servei o els perfils no són accessibles. | El servei funciona parcialment. | Els perfils funcionen correctament des del client. | Integració completa, amb persistència i permisos correctes. |
| B. Implementació tècnica | B6 · Apache i autenticació LDAP | No funciona l'accés autenticat. | El servei web funciona però sense integració correcta. | L'autenticació LDAP funciona correctament. | Integració completa i totalment funcional entre Apache i LDAP. |
| B. Implementació tècnica | B7 · Quotes de disc | No estan configurades. | Configuració parcial o incorrecta. | Quotes correctament implementades i verificades. | Quotes completament funcionals i adaptades als diferents usuaris o grups. |
| B. Implementació tècnica | B8 · Polítiques de seguretat | No s'aplica cap política de seguretat. | S'aplica alguna restricció però és incompleta. | Les restriccions requerides funcionen correctament. | Les polítiques de seguretat estan ben integrades i justificades. |
| C. Documentació tècnica | C1 · Estructura del document | Document desorganitzat o incomplet. | Inclou la majoria dels apartats però amb mancances. | Document ben estructurat amb portada, índex i conclusions. | Document amb estructura professional i molt fàcil de seguir. |
| C. Documentació tècnica | C2 · Qualitat de les evidències | Captures insuficients o poc llegibles. | Evidències correctes però poc contextualitzades. | Captures clares, ordenades i relacionades amb el text. | Evidències excel·lents, molt ben seleccionades i perfectament contextualitzades. |
| C. Documentació tècnica | C3 · Explicacions tècniques | Es limita a mostrar captures o ordres. | Explicacions superficials. | Explica què ha fet i per què. | Les explicacions demostren domini tècnic i capacitat d'anàlisi. |
| C. Documentació tècnica | C4 · Verificació dels serveis | No es demostra el funcionament dels serveis. | Només es verifica parcialment. | Tots els serveis principals estan verificats. | Les verificacions són completes, variades i demostren la integració del sistema. |
| C. Documentació tècnica | C5 · Conclusions i reflexió | No inclou conclusions. | Conclusions molt breus o poc rellevants. | Reflexiona sobre el treball realitzat i les dificultats trobades. | Presenta una reflexió crítica, madura i ben argumentada sobre el projecte. |

## Rúbrica 2 · Puntuació ponderada per a Moodle

| Bloc | Codi i ítem | Màxim | Nivell 1 | Nivell 4 | Nivell 7 | Nivell 10 |
|---|---|---|---|---|---|---|
| A. Disseny i planificació (200 punts) | A1 · Definició de l'organització | 60 | 6 | 24 | 42 | 60 |
| A. Disseny i planificació (200 punts) | A2 · Disseny de la infraestructura | 80 | 8 | 32 | 56 | 80 |
| A. Disseny i planificació (200 punts) | A3 · Justificació de les decisions tècniques | 60 | 6 | 24 | 42 | 60 |
| B. Implementació tècnica (500 punts) | B1 · Configuració inicial del servidor | 50 | 5 | 20 | 35 | 50 |
| B. Implementació tècnica (500 punts) | B2 · Configuració de xarxa i DHCP | 80 | 8 | 32 | 56 | 80 |
| B. Implementació tècnica (500 punts) | B3 · LDAP i LDAP Account Manager | 100 | 10 | 40 | 70 | 100 |
| B. Implementació tècnica (500 punts) | B4 · Gestió d'usuaris i grups | 60 | 6 | 24 | 42 | 60 |
| B. Implementació tècnica (500 punts) | B5 · Perfils mòbils amb NFS | 80 | 8 | 32 | 56 | 80 |
| B. Implementació tècnica (500 punts) | B6 · Apache amb autenticació LDAP | 70 | 7 | 28 | 49 | 70 |
| B. Implementació tècnica (500 punts) | B7 · Quotes de disc | 30 | 3 | 12 | 21 | 30 |
| B. Implementació tècnica (500 punts) | B8 · Polítiques de seguretat | 30 | 3 | 12 | 21 | 30 |
| C. Documentació tècnica (300 punts) | C1 · Estructura i organització del document | 50 | 5 | 20 | 35 | 50 |
| C. Documentació tècnica (300 punts) | C2 · Qualitat de les evidències | 70 | 7 | 28 | 49 | 70 |
| C. Documentació tècnica (300 punts) | C3 · Explicacions tècniques | 80 | 8 | 32 | 56 | 80 |
| C. Documentació tècnica (300 punts) | C4 · Verificació dels serveis | 60 | 6 | 24 | 42 | 60 |
| C. Documentació tècnica (300 punts) | C5 · Conclusions i reflexió | 40 | 4 | 16 | 28 | 40 |

**Nota final = punts totals / 1000** (equivalent a la nota sobre 10 multiplicant per 10, o directament sobre 100 si el criteri d'avaluació ho demana).

## Clàusules de penalització directa

Faltes greus que no depenen dels barems, sinó que són motiu de devolució o penalització directa:

| # | Infracció detectada | Penalització |
|---|---|---|
| 1 | Manca d'Activitat 0: no haver personalitzat el hostname (`srv-cognom`) o treballar amb l'usuari `root`/`ubuntu` en lloc del personal creat. | -2 punts |
| 2 | Domini LDAP erroni: utilitzar `tecnosolucions.cat` o un domini que no segueixi el format `i-cognom-it.local` assignat a la taula. | -2 punts |
| 3 | Incompliment de xarxa: utilitzar un tercer octet o IPs de clients diferents als assignats. | -1,5 punts |
| 4 | Prompt invisible/anònim: captures on no aparegui clarament el prompt `usuari@srv-cognom:~$` que identifiqui l'autoria. | -2 punts (global) |
| 5 | Imatges "mudes": captures sense un text explicatiu previ que indiqui què s'està fent o configurant. | -1,5 punts |
| 6 | Segrest d'espai: captures de pantalla completa per mostrar només un parell de línies de text. | -1 punt (global) |
| 7 | Manca de verificació: finalitzar una activitat sense mostrar la prova de funcionament (ping, `ldapsearch`, IP per DHCP...). | Activitat: 0p |
| 8 | Maquetació descuidada: fulls en blanc, salts de pàgina incoherents o imatges que canvien de mida constantment. | -3 punts |
| 9 | Incoherència tècnica: dades a les captures (IP, nom) que no coincideixin amb el text de l'informe. | -1 punt |
| 10 | Qualitat visual: imatges borroses, retallades o amb text de terminal il·legible. | -1 punt |
| 11 | Rutes incorrectes: no utilitzar les rutes de fitxers indicades a l'enunciat o inventar directoris de configuració. | -1 punt |
| 12 | Plagi o IA sense adaptar: captures de companys o textos generats per IA que mantinguin dades d'exemple de l'enunciat original. | 0 directe (suspens) |

## Ponderació dels Resultats d'Aprenentatge

| Resultat d'Aprenentatge | Justificació | Ponderació |
|---|---|---|
| RA1. Instal·la sistemes operatius en xarxa | Instal·lació, configuració inicial, actualització, xarxa i connectivitat del servidor. | 20 % |
| RA2. Gestiona usuaris i grups | Creació i administració d'usuaris, grups, perfils mòbils i gestió amb LAM. | 25 % |
| RA3. Gestiona dominis | Nucli del projecte: LDAP, estructura del directori, administració del domini i autenticació. | 30 % |
| RA4. Gestiona recursos compartits | NFS, permisos, quotes, accés als recursos compartits i control d'accés. | 20 % |
| RA5. Monitoratge i ús del sistema | Verificacions, comprovacions dels serveis, manteniment i documentació tècnica. | 5 % |
| RA6. Integració de sistemes operatius | No s'avalua perquè el projecte només utilitza Ubuntu Server i Ubuntu Desktop i no hi ha un entorn heterogeni. | 0 % |
| **Total** | | **100 %** |

## Relació entre ítems i RA (punts)

| Bloc / Ítem | RA1 | RA2 | RA3 | RA4 | RA5 | Total |
|---|---|---|---|---|---|---|
| A1 Organització | 10 | | 20 | | | 30 |
| A2 Arquitectura | 20 | | 30 | | | 50 |
| A3 Justificació | 10 | | 10 | | | 20 |
| B1 Instal·lació servidor | 50 | | | | | 50 |
| B2 Xarxa + DHCP | 40 | | | | | 40 |
| B3 LDAP + LAM | | 30 | 70 | | | 100 |
| B4 Usuaris i grups | | 60 | | 20 | | 80 |
| B5 Perfils NFS | | 40 | | 40 | | 80 |
| B6 Apache + LDAP | | | 40 | 30 | | 70 |
| B7 Quotes | | | | 30 | | 30 |
| B8 Seguretat | | 20 | | 10 | | 30 |
| C1 Documentació | | | | | 10 | 10 |
| C2 Evidències | | | | | 20 | 20 |
| C3 Explicacions | | | | | 20 | 20 |
| C4 Verificacions | 10 | 10 | 10 | 10 | 20 | 60 |
| C5 Conclusions | | | | | 20 | 20 |

## Correspondència amb els RA i CA oficials

| Ítem del projecte | RA | CA relacionats | Justificació curricular |
|---|---|---|---|
| A1. Definició de l'organització | RA3 | 3.1, 3.2 | Identifica la funció del servei de directori, el concepte de domini i defineix l'estructura organitzativa que posteriorment implementarà. |
| A2. Disseny de la infraestructura | RA3 | 3.5, 3.6, 3.7 | El disseny de l'arbre LDAP, les OU, els grups i el model administratiu implica planificar i analitzar l'estructura d'un servei de directori. |
| A3. Justificació tècnica | RA3 | 3.7, 3.8 | La justificació de les decisions adoptades evidencia la comprensió de l'estructura del domini i l'ús de les eines d'administració. |
| B1. Configuració inicial del servidor | RA1 | 1.5, 1.7, 1.8, 1.9 | Instal·lació, configuració inicial, actualització del sistema i comprovació de la connectivitat del servidor. |
| B2. Configuració de xarxa i DHCP | RA1 | 1.9 | La configuració de la xarxa i del servei DHCP garanteix la connectivitat del servidor i dels equips client. |
| B3. LDAP i LAM | RA3 | 3.4, 3.5, 3.6, 3.8 | Instal·la, configura i administra un servei de directori mitjançant les eines pròpies del domini. |
| B4. Gestió d'usuaris i grups | RA2 | 2.1, 2.4, 2.5, 2.6, 2.9 | Es creen i gestionen usuaris, grups, pertinences i eines d'administració pròpies del sistema. |
| B5. Perfils mòbils amb NFS | RA2, RA4 | 2.2, 2.8, 4.2, 4.3, 4.6 | Integra la gestió dels perfils d'usuari amb la compartició segura dels directoris personals mitjançant NFS. |
| B6. Apache amb autenticació LDAP | RA3, RA4 | 3.8, 4.6 | Es fa ús del servei de directori per autenticar usuaris i es defineixen mecanismes de control d'accés als recursos. |
| B7. Quotes de disc | RA4 | 4.2, 4.3, 4.6 | Es gestionen els recursos compartits establint límits i permisos sobre l'espai disponible pels usuaris. |
| B8. Polítiques de seguretat | RA2, RA4 | 2.2, 2.5, 4.1, 4.6 | Les restriccions d'accés, permisos i polítiques de seguretat afecten tant la gestió dels usuaris com la protecció dels recursos compartits. |
| C1. Estructura del document | RA5 | 5.6 | Evidencia la interpretació i comprensió de la configuració del sistema desplegat. |
| C2. Evidències | RA5 | 5.3, 5.6 | Les verificacions i captures mostren l'observació del funcionament dels serveis i la interpretació de la seva configuració. |
| C3. Explicacions tècniques | RA5 | 5.4, 5.6 | Demostren la capacitat de mantenir, interpretar i documentar la configuració dels serveis implementats. |
| C4. Verificació dels serveis | RA5 | 5.3, 5.4, 5.6 | Evidencien la capacitat de verificar, interpretar i mantenir el sistema. |
| C5. Conclusions | RA5 | 5.6 | La reflexió final posa de manifest la comprensió global del sistema desplegat i la seva configuració. |
