---
title: Lliurament i avaluació · Projecte Integrador UT3
icon: material/clipboard-check-outline
hide:
  - toc
---

# 4 · Lliurament i avaluació

## Resultat final esperat

La infraestructura final ha de mostrar **Samba i NFS** com a nucli de la compartició de recursos. **CUPS** i les còpies de seguretat han de complementar aquesta infraestructura, mentre que **UFW**, la mesura de seguretat addicional i el servei transversal han d'aportar una integració coherent amb altres àmbits del cicle.

No es valorarà únicament que la configuració funcioni. També es valorarà la capacitat de decidir, justificar, demostrar amb evidències, diagnosticar incidències i explicar les diferències entre les tecnologies utilitzades.

!!! danger "Microauditoria d'autoria"
    Cada alumne haurà de mostrar i demostrar el funcionament de la infraestructura muntada, sobre la qual se li faran preguntes de validació del servei i d'autoria.

## El dossier tècnic

El dossier tècnic (Activitat 11) es construeix progressivament amb les evidències de totes les activitats. No cal repetir captures ni proves ja documentades: organitza-les perquè un altre tècnic pugui entendre, revisar i reproduir la infraestructura.

!!! note "Recomanacions generals"
    No cal aportar una captura per cada comanda executada. Selecciona evidències que demostrin inequívocament el resultat, contextualitza-les amb un text explicatiu i mantén la coherència entre el que expliques i el que mostres.

## Com s'avaluarà el projecte?

Es valorarà especialment:

- Funcionament correcte dels serveis (Samba, NFS, CUPS, còpies, UFW, servei transversal).
- Integració entre els diferents components.
- Justificació tècnica de les decisions, en especial Samba vs. NFS.
- Qualitat de la documentació i de les evidències.
- Capacitat de diagnosticar i resoldre incidències reals.
- Autonomia i competència demostrada durant la microauditoria pràctica.

La qualificació final s'obté a partir de tres blocs:

| Bloc d'avaluació | Què es valora? | Pes |
|---|---|---|
| A. Disseny i planificació | Anàlisi de necessitats i recursos, disseny de la infraestructura, decisions Samba/NFS i justificació tècnica. | 20 % |
| B. Implementació tècnica | Usuaris/grups/permisos/ACL, Samba, NFS i persistència, UID/GID, CUPS, laboratori NFS-SMB-CIFS, còpies amb `tar`, UFW i servei transversal. | 50 % |
| C. Documentació, validació i competència tècnica | Estructura del dossier, qualitat de les evidències, explicacions i justificació tècnica, validació i diagnosi, microauditoria i autonomia. | 30 % |

### Nivells de la rúbrica

Cada criteri d'avaluació pot obtenir un dels quatre nivells següents:

| Nivell | Significat |
|---|---|
| 1 | El criteri no s'ha assolit o presenta errors importants. |
| 4 | El criteri s'ha assolit de forma bàsica, però necessita millores significatives. |
| 7 | El criteri s'ha assolit correctament i compleix els requisits del projecte. |
| 10 | El criteri s'ha assolit amb un nivell de qualitat tècnica i documental excel·lent. |

La rúbrica es distribueix en 3 blocs (**A. Disseny i planificació**, **B. Implementació tècnica**, **C. Documentació, validació i competència tècnica**) i 16 ítems concrets, sobre una puntuació màxima de 1.000 punts.

!!! info "Rúbrica completa"
    La rúbrica detallada, ítem per ítem, amb els descriptors de cada nivell i la seva puntuació Moodle, és una eina de correcció del professorat i no es publica en aquest manual. Consulta-la a Moodle o demana-la al professor si la necessites per preparar el lliurament.

## Resultats d'Aprenentatge treballats

Aquest projecte contribueix al desenvolupament i a l'avaluació dels Resultats d'Aprenentatge (RA) del mòdul MP04 – Sistemes Operatius en Xarxa. La ponderació expressa el pes curricular dels RA **dins d'aquest projecte concret** i no modifica la ponderació global dels RA del mòdul:

| Resultat d'Aprenentatge | Pes | Justificació |
|---|---|---|
| RA1. Instal·la sistemes operatius en xarxa | 0 % | El projecte parteix d'un servidor i clients ja disponibles; no té com a objectiu la instal·lació del sistema operatiu. |
| RA2. Gestiona usuaris i grups | 15 % | Creació i gestió d'usuaris i grups, pertinences, perfils d'accés i permisos associats als recursos corporatius. |
| RA3. Gestiona dominis | 0 % | No s'implementa cap domini ni servei de directori en aquest projecte. |
| RA4. Gestiona recursos compartits | 35 % | Nucli principal del projecte: Samba, NFS, directoris compartits, permisos Unix i ACL, CUPS, nivells d'accés i protecció dels recursos. |
| RA5. Monitoratge i ús del sistema | 15 % | Comprovació dels serveis, interpretació de configuracions, diagnosi d'incidències, còpies i restauració, validació global i microauditoria. |
| RA6. Integració de sistemes operatius | 35 % | L'altre gran eix del projecte: servidor Linux, clients Linux i Windows, Samba/NFS/CIFS, accés heterogeni als recursos, CUPS. |
| **Total** | **100 %** | |

## Correspondència amb els Criteris d'Avaluació (CA)

| Ítem del projecte | RA | CA relacionats |
|---|---|---|
| Anàlisi de necessitats i recursos | RA4, RA6 | 4.2; 6.1, 6.3 |
| Disseny de la infraestructura | RA4, RA6 | 4.2, 4.6; 6.1, 6.3, 6.8 |
| Decisions Samba/NFS i justificació | RA4, RA6 | 4.2, 4.6; 6.1, 6.3 |
| Usuaris, grups, permisos i ACL | RA2, RA4 | 2.1, 2.4, 2.5, 2.6, 2.9; 4.1, 4.3, 4.6 |
| Recursos compartits Samba | RA4, RA6 | 4.2, 4.3, 4.6; 6.1, 6.3, 6.4, 6.5, 6.8, 6.9 |
| Recursos compartits NFS i persistència | RA4, RA6 | 4.2, 4.3, 4.6; 6.3, 6.4, 6.5, 6.8, 6.9 |
| Identitat i permisos NFS – UID/GID | RA2, RA4, RA5 | 2.1, 2.9; 4.3, 4.6; 5.3, 5.6 |
| Integració CUPS | RA4, RA6 | 4.4; 6.3, 6.4, 6.6, 6.9 |
| Laboratori NFS–SMB–CIFS | RA4, RA5, RA6 | 4.2, 4.3, 4.6; 5.3, 5.6; 6.1, 6.3, 6.4, 6.5, 6.9 |
| Còpies amb `tar` i restauració | RA4, RA5, RA6 | 4.2, 4.3; 5.4, 5.5, 5.6; 6.5, 6.9 |
| Protecció i servei transversal | RA4, RA5, RA6 | 4.6; 5.4, 5.6; 6.3, 6.4, 6.8, 6.9 |
| Estructura i qualitat del dossier | RA5 | 5.6 |
| Qualitat de les evidències | RA5, RA6 | 5.3, 5.6; 6.9 |
| Explicacions i justificació tècnica | RA4, RA5, RA6 | 4.2, 4.6; 5.4, 5.6; 6.1, 6.3 |
| Validació i diagnosi | RA4, RA5, RA6 | 4.6; 5.3, 5.4, 5.6; 6.2, 6.5, 6.8, 6.9 |
| Microauditoria i autonomia | RA4, RA5, RA6 | 4.3, 4.6; 5.4, 5.6; 6.5, 6.8, 6.9 |

Un mateix criteri d'avaluació pot ser treballat en diferents activitats i quedar evidenciat mitjançant diverses proves; la qualificació no es determina a partir d'una única activitat, sinó del conjunt d'evidències aportades al llarg del desenvolupament del projecte.

---

<div class="grid cards" markdown>

- :material-arrow-left:{ .lg }

    [:octicons-arrow-left-24: Desenvolupament (11 activitats)](03-desenvolupament.md){ .md-button }

- :material-home:{ .lg }

    [:octicons-arrow-right-24: Tornar a la presentació](index.md){ .md-button .md-button--primary }

</div>
