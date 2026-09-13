---
title: Projecte Integrador · UT2
icon: material/domain
hide:
  - toc
---

# Projecte Integrador · UT2

*Disseny i implementació d'una infraestructura de xarxa Linux amb LDAP, NFS i Apache*

!!! abstract "De què tracta"
    Projecte obert de síntesi de la UT2: **dissenya, implementa i documenta** una infraestructura de xarxa basada en **Ubuntu Server 24.04 LTS** i **Ubuntu Desktop 24.04 LTS** per a una organització fictícia que tu mateix defineixes. A diferència dels quaderns interactius, aquí no hi ha un procediment pas a pas — ets tu qui pren i justifica les decisions tècniques.

| :material-clock-outline: Modalitat | :material-book-open-variant: Blocs | :material-school: RA avaluats | :material-presentation: Defensa |
|:---:|:---:|:---:|:---:|
| Individual | **UT2 completa** | **RA1–RA5** | Oral, davant del professor |

[:material-file-pdf-box: Descarrega l'enunciat del projecte (PDF)](Projecte_Obert_Integrador_UT2.pdf){ .md-button .md-button--primary }

## Missió del projecte

Una petita organització t'ha contractat com a administrador/a de sistemes perquè despleguis la seva nova infraestructura informàtica basada en GNU/Linux. L'empresa encara no disposa de servidors ni d'una infraestructura centralitzada, així que hauràs de dissenyar-la i implementar-la des de zero utilitzant dues màquines virtuals: **Ubuntu Server 24.04 LTS** (servidor) i **Ubuntu Desktop 24.04 LTS** (client).

### El repte

L'objectiu és demostrar que ets capaç d'integrar els diferents serveis de xarxa estudiats durant la unitat —autenticació centralitzada, recursos compartits, servei web i polítiques de seguretat—, prenent decisions tècniques justificades i resolent de manera autònoma els problemes que apareguin durant la implantació. **No existeix una única solució correcta**: es valorarà especialment que les decisions siguin coherents amb l'escenari que tu mateix proposis.

### Què hauràs de lliurar

- La infraestructura completament funcional (servidor i client).
- La documentació tècnica amb el disseny, la configuració i les justificacions.
- Les evidències (captures) que demostrin el correcte funcionament de tots els serveis.
- La defensa oral del projecte davant del professor.

La qualitat tècnica de la infraestructura i la qualitat de la documentació tenen pesos diferenciats dins de l'avaluació final, però totes dues són imprescindibles.

---

## Estructura del projecte

<div class="grid cards" markdown>

- :material-office-building-outline:{ .lg }

    ### 1 · Context i encàrrec

    L'organització fictícia, la situació inicial i l'encàrrec professional que rebs.

    [:octicons-arrow-right-24: Veure context i encàrrec](01-context-i-encarrec.md){ .md-button .md-button--primary }

- :material-target:{ .lg }

    ### 2 · Objectius i requisits

    Requisits generals, llibertat de disseny i què hauràs de definir per a la teva organització.

    [:octicons-arrow-right-24: Veure objectius i requisits](02-objectius-i-requisits.md){ .md-button .md-button--primary }

- :material-rocket-launch-outline:{ .lg }

    ### 3 · Desenvolupament (5 fases)

    El nucli del projecte: disseny, LDAP, recursos compartits, web amb autenticació i validació.

    [:octicons-arrow-right-24: Veure les 5 fases](03-desenvolupament.md){ .md-button .md-button--primary }

- :material-clipboard-check-outline:{ .lg }

    ### 4 · Lliurament i avaluació

    Lliurables, defensa oral i com s'avaluarà el projecte (RA, CA i rúbrica).

    [:octicons-arrow-right-24: Veure lliurament i avaluació](04-lliurament-i-avaluacio.md){ .md-button .md-button--primary }

</div>

!!! tip "Recomanacions"
    - Personalitza des del primer moment: hostname propi (`srv-cognom`), usuari propi, rang d'IP assignat. No treballis mai com a `root` o `ubuntu`.
    - No mostris cap servei per acabat sense la seva prova de verificació (ping, `ldapsearch`, obtenció d'IP per DHCP...).
    - Justifica cada decisió tècnica: no n'hi ha prou que "funcioni".

!!! warning "Important"
    Aquest projecte **no consisteix a reproduir les pràctiques del curs**, sinó a aplicar els coneixements adquirits per construir una infraestructura funcional adaptada a un escenari propi.
