---
title: Lliurament i avaluació · Projecte Integrador UT2
icon: material/clipboard-check-outline
hide:
  - toc
---

# 4 · Lliurament i avaluació

## Lliurables

El projecte haurà d'incloure tres elements:

### 1. Documentació tècnica

La documentació haurà d'explicar:

- Descripció de l'organització escollida.
- Disseny de la infraestructura i esquema de xarxa.
- Configuració IP.
- Explicació dels serveis implementats.
- Justificació de les decisions preses.
- Problemes trobats i com s'han resolt.

### 2. Evidències

Cal aportar captures de pantalla que demostrin el correcte funcionament dels serveis. Com a mínim han de mostrar:

- DHCP funcionant.
- Estructura LDAP.
- Usuaris i grups.
- Connexió d'un usuari.
- Muntatge dels directoris NFS.
- Accés correcte als perfils.
- Funcionament de les quotes.
- Autenticació LDAP a Apache.
- Funcionament dels serveis des del client Ubuntu Desktop.

### 3. Defensa del projecte

Hauràs de presentar el teu treball davant del professor, demostrant el funcionament de la infraestructura i responent preguntes sobre les decisions tècniques adoptades.

!!! note "Recomanacions generals"
    Es valora la capacitat de síntesi: una documentació de poques pàgines amb contingut dens és millor que un document llarg ple de buits i imatges gegants. Cada captura ha d'anar precedida d'un text que expliqui què s'està fent, i ha de mostrar el prompt (`usuari@srv-cognom:~$`) que n'identifica l'autoria.

## Com s'avaluarà el projecte?

Es valorarà especialment:

- Funcionament correcte dels serveis.
- Integració entre els diferents components.
- Autonomia en la resolució dels problemes.
- Qualitat de la documentació.
- Justificació tècnica de les decisions.
- Organització i netedat de la configuració.
- Capacitat d'explicar i defensar el projecte.
- Capacitat de treballar sense seguir un guió pas a pas.

La qualificació final s'obté a partir de tres blocs:

| Bloc d'avaluació | Què es valora? | Pes |
|---|---|---|
| A. Disseny i planificació | Definició de l'organització, disseny de la infraestructura i justificació de les decisions tècniques. | 20 % |
| B. Implementació tècnica | Configuració del servidor, xarxa i DHCP, LDAP i LAM, usuaris i grups, perfils NFS, Apache amb LDAP, quotes de disc i polítiques de seguretat. | 50 % |
| C. Documentació tècnica | Estructura del document, qualitat de les evidències, explicacions tècniques, verificació dels serveis i conclusions. | 30 % |

### Nivells de la rúbrica

Cada criteri d'avaluació pot obtenir un dels quatre nivells següents:

| Nivell | Significat |
|---|---|
| 1 | El criteri no s'ha assolit o presenta errors importants. |
| 4 | El criteri s'ha assolit de forma bàsica, però necessita millores significatives. |
| 7 | El criteri s'ha assolit correctament i compleix els requisits del projecte. |
| 10 | El criteri s'ha assolit amb un nivell de qualitat tècnica i documental excel·lent. |

La rúbrica es distribueix en 3 blocs (**A. Disseny i planificació**, **B. Implementació tècnica**, **C. Documentació tècnica**) i 16 ítems concrets, sobre una puntuació màxima de 1.000 punts.

!!! info "Rúbrica completa"
    La rúbrica detallada, ítem per ítem, amb els descriptors de cada nivell i la seva puntuació Moodle, és una eina de correcció del professorat i no es publica en aquest manual. Consulta-la a Moodle o demana-la al professor si la necessites per preparar el lliurament.

!!! danger "Clàusules de penalització directa"
    A banda de la rúbrica, l'enunciat estableix penalitzacions directes per faltes greus que no depenen dels barems: manca de personalització de l'Activitat 0, domini LDAP erroni, incompliment del rang de xarxa assignat, captures sense prompt identificable, imatges sense text explicatiu, manca de verificació d'una activitat, maquetació descuidada, incoherències tècniques entre captures i text, o plagi. El detall complet és a l'enunciat en PDF.

## Resultats d'Aprenentatge treballats

Aquest projecte contribueix al desenvolupament i a l'avaluació dels Resultats d'Aprenentatge (RA) del mòdul MP04 – Sistemes Operatius en Xarxa:

| Resultat d'Aprenentatge | Pes | Justificació |
|---|---|---|
| RA1. Instal·la sistemes operatius en xarxa | 20 % | Instal·lació, configuració inicial, actualització, xarxa i connectivitat del servidor. |
| RA2. Gestiona usuaris i grups | 25 % | Creació i administració d'usuaris, grups, perfils mòbils i gestió amb LAM. |
| RA3. Gestiona dominis | 30 % | Nucli del projecte: LDAP, estructura del directori, administració del domini i autenticació. |
| RA4. Gestiona recursos compartits | 20 % | NFS, permisos, quotes, accés als recursos compartits i control d'accés. |
| RA5. Monitoratge i ús del sistema | 5 % | Verificacions, comprovacions dels serveis, manteniment i documentació tècnica. |
| **Total** | **100 %** | RA6 (Integració de sistemes operatius) no s'avalua: el projecte només utilitza Ubuntu Server i Ubuntu Desktop, sense entorn heterogeni. |

## Correspondència amb els Criteris d'Avaluació (CA)

| Ítem del projecte | RA | CA relacionats |
|---|---|---|
| Definició de l'organització | RA3 | 3.1, 3.2 |
| Disseny de la infraestructura | RA3 | 3.5, 3.6, 3.7 |
| Justificació tècnica | RA3 | 3.7, 3.8 |
| Configuració inicial del servidor | RA1 | 1.5, 1.7, 1.8, 1.9 |
| Configuració de xarxa i DHCP | RA1 | 1.9 |
| LDAP i LAM | RA3 | 3.4, 3.5, 3.6, 3.8 |
| Gestió d'usuaris i grups | RA2 | 2.1, 2.4, 2.5, 2.6, 2.9 |
| Perfils mòbils amb NFS | RA2, RA4 | 2.2, 2.8, 4.2, 4.3, 4.6 |
| Apache amb autenticació LDAP | RA3, RA4 | 3.8, 4.6 |
| Quotes de disc | RA4 | 4.2, 4.3, 4.6 |
| Polítiques de seguretat | RA2, RA4 | 2.2, 2.5, 4.1, 4.6 |
| Documentació, evidències, explicacions, verificacions i conclusions | RA5 | 5.3, 5.4, 5.6 |

Un mateix criteri d'avaluació pot ser treballat en diferents fases del projecte i quedar evidenciat mitjançant diverses activitats o proves de verificació; la qualificació no es determina a partir d'una única activitat, sinó del conjunt d'evidències aportades al llarg del desenvolupament del projecte.

---

<div class="grid cards" markdown>

- :material-arrow-left:{ .lg }

    [:octicons-arrow-left-24: Desenvolupament (5 fases)](03-desenvolupament.md){ .md-button }

- :material-home:{ .lg }

    [:octicons-arrow-right-24: Tornar a la presentació](index.md){ .md-button .md-button--primary }

</div>
