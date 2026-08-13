---
title: Relacions de confiança
tags:
  - ut1
  - active-directory
  - windows
  - seguretat
---

# :material-handshake: Relacions de confiança

!!! abstract "Concepte clau"
    Una **relació de confiança** (*trust*) permet que els usuaris d'un domini s'autentiquin i accedeixin a recursos d'**un altre domini**. És el mecanisme que fa que diversos dominis puguin col·laborar sense duplicar comptes.

=== ":material-notebook-outline: Apunts"

    ## Per a què serveixen

    Sense confiança, cada domini és una illa: un usuari de `institut.local` no podria accedir a una carpeta de `fp.local`. Amb una relació de confiança, **sí** — mantenint cada domini el seu propi directori.

    ```mermaid
    graph LR
        U["Usuari de\ninstitut.local"] -->|"confiança"| D2["Recurs a\nfp.local"]
    ```

    ## Direccionalitat: qui confia en qui

    | Tipus | Comportament |
    |-------|--------------|
    | **Unidireccional** | El domini A confia en B (els usuaris de B accedeixen a recursos d'A), però **no** a l'inrevés |
    | **Bidireccional** | Tots dos dominis confien mútuament; els usuaris d'un accedeixen als recursos de l'altre i viceversa |

    ```mermaid
    graph LR
        A["Domini A"] -->|"confia en"| B["Domini B"]
        B -.->|"NO confia en (unidireccional)"| A
    ```

    !!! warning "La confiança no és el permís"
        Que A confiï en B **no** dóna accés automàtic: només permet que els usuaris de B siguin *reconeguts* a A. Després, cal **assignar permisos** (NTFS, pertinença a grups) als usuaris/grups de B sobre els recursos concrets d'A. Confiança = "et reconec"; permís = "et deixo entrar aquí".

    ## Transitivitat: la confiança es propaga?

    | Tipus | Comportament |
    |-------|--------------|
    | **Transitiva** | Si A confia en B i B confia en C, **A confia en C** automàticament |
    | **No transitiva** | La confiança val **només** entre els dos dominis directament relacionats |

    !!! info "Confiança automàtica dins d'un bosc"
        Els dominis d'un mateix **bosc** tenen entre ells relacions de confiança **bidireccionals i transitives creades automàticament** en afegir cada domini. Per això, dins d'un bosc, tots els dominis es reconeixen sense configuració manual. Les confiances manuals s'usen sobretot **entre boscos diferents** o amb dominis externs.

    ## Quan cal configurar-ne una manualment

    - Connectar dos **boscos** independents (p. ex. dos centres que es fusionen).
    - Confiar amb un domini **extern** (una altra organització).
    - Escenaris de migració o col·laboració temporal.

    !!! tip "Cap a la UT4"
        A la **UT4** veuràs entorns heterogenis on Windows i Linux comparteixen identitats. Les relacions de confiança són el concepte anàleg dins del món AD: permeten que identitats d'un domini siguin vàlides en un altre. Entendre-les aquí et prepara per a la integració entre sistemes.

    ??? question "Auto-avaluació"
        **1.** Quina diferència hi ha entre una confiança unidireccional i una de bidireccional?

        ??? success "Resposta"
            En una **unidireccional**, només un domini confia en l'altre (els usuaris del domini confiat accedeixen als recursos del que confia, però no a l'inrevés). En una **bidireccional**, tots dos dominis confien mútuament i els usuaris de cadascun poden accedir als recursos de l'altre.

        **2.** Tenir una relació de confiança amb un domini dóna accés automàtic als seus recursos?

        ??? success "Resposta"
            No. La confiança només fa que els usuaris de l'altre domini siguin **reconeguts**. Perquè accedeixin a un recurs concret, cal **assignar-los permisos** (NTFS, grups) sobre aquell recurs. Confiança i permís són coses diferents.

        **3.** Per què normalment no cal configurar confiances manuals dins d'un mateix bosc?

        ??? success "Resposta"
            Perquè els dominis d'un mateix bosc tenen relacions de confiança **bidireccionals i transitives creades automàticament**. Les confiances manuals s'usen sobretot entre boscos diferents o amb dominis externs.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.22 · Dissenya la confiança

    **Objectiu**: raonar quin tipus de relació de confiança cal en diferents supòsits.
    **Temps estimat**: 30 minuts · **Modalitat**: individual o parelles

    ---

    ### Tasca 1 – Supòsits

    Per a cada cas, indica **quin tipus** de confiança (unidireccional/bidireccional, transitiva o no) proposaries i per què:

    1. Dos instituts que es fusionen i volen que tot el personal accedeixi als recursos de tots dos centres.
    2. Un institut que vol donar accés temporal als seus recursos a una empresa externa, sense que la seva gent pugui entrar a la de l'empresa.
    3. Dos dominis fills del mateix bosc.

    ### Tasca 2 – Confiança vs permís

    Explica, amb un exemple, per què establir una confiança no és suficient perquè un usuari accedeixi a una carpeta compartida de l'altre domini.

    ### Tasca 3 – Diagrama

    Dibuixa una relació **unidireccional** entre dos dominis marcant clarament la direcció del flux d'autenticació.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"active directory trust relationships explained"`
        - `"one way vs two way trust active directory"`
        - `"transitive trust active directory forest"`
