---
title: Boscos, arbres i dominis
tags:
  - ut1
  - active-directory
  - windows
---

# :material-forest: Boscos, arbres i dominis

!!! abstract "Concepte clau"
    Active Directory s'organitza jeràrquicament: un **domini** és la unitat bàsica; diversos dominis amb un espai de noms continu formen un **arbre**; i un o més arbres formen un **bosc** (*forest*), el contenidor de seguretat més alt d'AD.

=== ":material-notebook-outline: Apunts"

    ## Els tres nivells

    | Nivell | Què és | Exemple |
    |--------|--------|---------|
    | **Domini** | Unitat d'administració i seguretat amb el seu propi directori | `institut.local` |
    | **Arbre** | Conjunt de dominis amb espai de noms **continu** (domini pare + fills) | `institut.local`, `fp.institut.local` |
    | **Bosc** | Conjunt d'un o més arbres; límit de seguretat màxim | `institut.local` + `altrecentre.local` |

    ```mermaid
    graph TD
        F["Bosc (forest)"]
        F --> T1["Arbre 1\ninstitut.local"]
        F --> T2["Arbre 2\naltrecentre.local"]
        T1 --> D1["institut.local\n(domini arrel)"]
        D1 --> D2["fp.institut.local\n(domini fill)"]
        D1 --> D3["eso.institut.local\n(domini fill)"]
        T2 --> D4["altrecentre.local"]
    ```

    ## Domini: la unitat bàsica

    Un **domini** té:

    - El seu propi directori d'usuaris, grups i equips.
    - Les seves polítiques (GPO) i el seu controlador (DC).
    - Un espai de noms DNS (p. ex. `institut.local`).

    A la resta de la UT1 treballem sempre amb **un únic domini** — el cas més habitual en un institut. Aquest capítol és el "mapa gran" per situar-lo.

    ## Arbre: dominis amb noms continus

    Quan una organització creix, pot crear **dominis fills** que hereten el nom del pare (`fp.institut.local`). Comparteixen un espai de noms continu i, automàticament, **relacions de confiança** entre ells (ho veuràs al capítol següent).

    ## Bosc: el límit de seguretat

    El **bosc** és el contenidor superior. Tots els dominis d'un mateix bosc comparteixen:

    - Un **esquema** comú (definició dels tipus d'objecte).
    - Un **catàleg global** (índex de tots els objectes del bosc per fer cerques ràpides).
    - Relacions de confiança transitives entre tots els dominis.

    !!! info "Catàleg global"
        El **catàleg global** (Global Catalog) és una còpia parcial de tots els objectes del bosc que permet cercar-los sense conèixer en quin domini són. És el que fa possible, per exemple, trobar un usuari de qualsevol domini des d'una sola consulta.

    !!! tip "Cap a la UT4"
        Entendre dominis, arbres i boscos és la base per a la **UT4 · Integració de sistemes heterogenis**, on connectarem mons diferents (Windows i Linux) i on Samba pot actuar com a controlador d'un domini compatible amb AD. Les **relacions de confiança** (capítol següent) són el mecanisme que permet que usuaris d'un domini accedeixin a recursos d'un altre.

    ??? question "Auto-avaluació"
        **1.** Quina diferència hi ha entre un arbre i un bosc a Active Directory?

        ??? success "Resposta"
            Un **arbre** és un conjunt de dominis amb un espai de noms **continu** (un domini pare i els seus fills, p. ex. `institut.local` i `fp.institut.local`). Un **bosc** és el contenidor superior que agrupa un o més arbres, que poden tenir espais de noms **diferents**, compartint esquema i catàleg global.

        **2.** Per a què serveix el catàleg global?

        ??? success "Resposta"
            És un índex parcial de tots els objectes del bosc que permet cercar-los ràpidament sense saber en quin domini es troben, facilitant cerques i inicis de sessió a tot el bosc.

        **3.** En el cas típic d'un institut, quants dominis sols necessitar?

        ??? success "Resposta"
            Normalment **un de sol**. L'estructura de múltiples dominis, arbres i boscos té sentit en organitzacions grans o amb necessitats d'aïllament administratiu; per a un institut, un únic domini és el més habitual i senzill de mantenir.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.21 · Dibuixa l'estructura

    **Objectiu**: representar la jerarquia d'AD d'una organització.
    **Temps estimat**: 25 minuts · **Modalitat**: individual

    ---

    ### Tasca 1 – Cas d'un institut

    Dibuixa l'estructura AD d'un institut amb un únic domini `institut.local`. Indica què conté (usuaris, grups, DC, GPO).

    ### Tasca 2 – Creixement

    Imagina que l'institut es fusiona amb un centre de formació que té el seu propi domini `fp.local`. Dibuixa com quedaria el **bosc** i explica quina relació hi hauria entre els dos dominis.

    ### Tasca 3 – Justificació

    Explica per què, per a un sol institut, no cal muntar diversos dominis.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"active directory forest tree domain explained"`
        - `"global catalog active directory"`
        - `"AD domain vs forest vs tree"`
