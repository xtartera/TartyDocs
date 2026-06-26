---
title: Instal·lació pas a pas de Windows Server 2022
tags:
  - instal·lació
  - windows server
  - virtualbox
  - UT1
---

# :material-numeric-1-box-multiple: Instal·lació pas a pas de Windows Server 2022

!!! abstract "Concepte clau"
    La instal·lació de Windows Server 2022 segueix un procés seqüencial i determinista. Conèixer cada pas i per quin ordre apareix evita errors difícils de revertir, especialment en la tria de l'edició i la creació de la contrasenya d'administrador.

=== ":material-notebook-outline: Apunts"

    ## Prerequisits abans de començar

    Abans d'iniciar la instal·lació, confirma que tens:

    - [ ] ISO de Windows Server 2022 (Evaluation) descarregada
    - [ ] MV creada a VirtualBox amb mínim 2 GB de RAM i 60 GB de disc
    - [ ] ISO muntada a la unitat de CD/DVD virtual de la MV
    - [ ] Mode de xarxa configurat (Xarxa NAT o Adaptador pont)
    - [ ] **Instantània feta** de la MV buida (punt de retorn)

    ## Flux d'instal·lació

    ```mermaid
    graph TD
        A[🖥️ Arrenca MV des de la ISO]
        B[Selecciona idioma i teclat]
        C[Instal·lar ara]
        D[Clau de producte → Ometre]
        E{Selecciona edició}
        F[Standard - Desktop Experience ✅]
        G[Standard - Server Core ⚠️]
        H[Accepta llicència EULA]
        I[Tipus d'instal·lació → Personalitzada]
        J[Crea o selecciona particions]
        K[⏳ Còpia de fitxers ~15 min]
        L[Primer inici → Crea contrasenya Administrador]
        M[✅ Escriptori de Windows Server]

        A --> B --> C --> D --> E
        E --> F --> H
        E --> G
        H --> I --> J --> K --> L --> M
    ```

    ## Passos detallats

    ### Pas 1 – Idioma i teclat

    | Camp | Valor recomanat |
    |------|-----------------|
    | Idioma a instal·lar | Español (España) o English |
    | Format d'hora i moneda | Español (España) |
    | Teclat | Español o Català (si disponible) |

    !!! tip "Tria l'idioma del servidor pensant en el producte final, no en la teva preferència personal. A les empreses catalanes, és habitual instal·lar en castellà o anglès per compatibilitat amb manuals i suport tècnic extern."

    ### Pas 2 – Clau de producte

    Selecciona **"No tinc clau de producte"** o fes clic a **Ometre**. L'edició d'avaluació funciona completament durant 180 dies.

    ### Pas 3 – Selecció d'edició ⚠️ CRÍTIC

    Apareix una llista amb 4 opcions:

    | Opció | Inclou GUI | Al curs |
    |-------|-----------|---------|
    | Windows Server 2022 Standard | **No** (Server Core) | No |
    | **Windows Server 2022 Standard (Desktop Experience)** | **Sí** | **✅ Sí** |
    | Windows Server 2022 Datacenter | No (Server Core) | No |
    | Windows Server 2022 Datacenter (Desktop Experience) | Sí | No cal |

    !!! danger "Si selecciones l'opció sense (Desktop Experience) instal·laràs Server Core. Hauràs de repetir la instal·lació des de zero."

    ### Pas 4 – Tipus d'instal·lació

    Selecciona **"Personalitzada: instal·lar Windows només (avançat)"**. L'opció "Actualitza" és per a migracions des d'una versió anterior.

    ### Pas 5 – Particions

    Si el disc virtual és nou i buit:

    1. Fes clic a **Nou** per crear una partició
    2. Especifica la mida (deixa-la al màxim per una sola partició)
    3. Fes clic a **Aplica** — Windows crearà automàticament les particions de sistema (EFI, MSR, Recuperació)
    4. Selecciona la partició principal i fes clic a **Següent**

    ### Pas 6 – Còpia de fitxers

    L'instal·lador copia els fitxers i reinicia la MV automàticament. Pot tardar entre 10 i 20 minuts depenent del maquinari. **No tanquis la MV**.

    ### Pas 7 – Contrasenya de l'administrador ⚠️ CRÍTIC

    Quan el sistema arrenca per primera vegada, demana la contrasenya del compte `Administrador`. Windows Server 2022 imposa **requisits de complexitat** per defecte:

    - Mínim **12 caràcters** (recomanat)
    - Combinar majúscules + minúscules + números + símbols
    - No pot contenir el nom del compte

    !!! danger "Si oblides la contrasenya d'Administrador i no tens cap altra forma d'accés, hauràs de reinstal·lar el servidor o usar el Mode de Restauració de Serveis de Directori (DSRM). Apunta-la en un lloc segur."

    !!! tip "Per a pràctiques de laboratori, usa una contrasenya que recordis però que compleixi els requisits. Per exemple: `P@ssw0rd2024!` (mai la usis en producció real)."

    ### Pas 8 – Primer inici

    Prem **Ctrl+Alt+Supr** per desbloquejar (a VirtualBox, usa el menú **Entrada → Insereix Ctrl+Alt+Supr**). Introdueix la contrasenya i accediràs a l'escriptori de Windows Server 2022.

    ??? question "Auto-avaluació"

        **1.** Durant la instal·lació, quin tipus d'instal·lació has de seleccionar per a una instal·lació neta (no una actualització)?

        ??? success "Resposta"
            **"Personalitzada: instal·lar Windows només (avançat)"**. L'opció "Actualitza" és per quan ja tens una versió anterior de Windows Server i vols migrar conservant les configuracions i aplicacions.

        **2.** Quins requisits de complexitat ha de complir la contrasenya de l'Administrador a Windows Server 2022?

        ??? success "Resposta"
            Ha de combinar majúscules, minúscules, números i símbols especials, i tenir un mínim de complexitat configurable (per defecte, mínim 6 caràcters però la recomanació és 12+). No pot contenir el nom del compte d'usuari ni el nom del servidor.

        **3.** Per quin motiu és important fer una instantània de VirtualBox **just abans** d'iniciar la instal·lació del SO?

        ??? success "Resposta"
            Si la instal·lació falla a meitat, l'edició seleccionada és incorrecta (Server Core en lloc de Desktop Experience) o s'oblida la contrasenya d'Administrador, es pot tornar a l'estat de MV buida en pocs segons sense haver de recrear tota la màquina virtual des de zero.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 2.4 · Instal·la Windows Server 2022 a VirtualBox

    **Objectiu**: completar la instal·lació de Windows Server 2022 (Desktop Experience) en una MV de VirtualBox.

    **Temps estimat**: 45–60 minuts (inclou temps d'espera de la còpia de fitxers)

    **Prerequisit**: MV creada amb 2–4 GB RAM, 60 GB disc, ISO muntada (veure Activitat 1.4)

    ---

    ### Checklist d'instal·lació

    Completa cada punt i marca'l un cop fet:

    - [ ] **Instantània prèvia** feta a VirtualBox ("Abans de la instal·lació")
    - [ ] Idioma i teclat seleccionats
    - [ ] Clau de producte omesa
    - [ ] Edició seleccionada: **Windows Server 2022 Standard (Desktop Experience)**
    - [ ] Llicència acceptada
    - [ ] Instal·lació personalitzada (no actualització)
    - [ ] Particions creades (1 partició principal al disc virtual)
    - [ ] Còpia de fitxers completada i servidor reiniciat
    - [ ] Contrasenya d'Administrador creada i **apuntada al dossier**
    - [ ] Primer inici a l'escriptori completat
    - [ ] **Instantània post-instal·lació** feta ("WS2022 instal·lat - net")

    ### Documentació obligatòria

    Al teu dossier, inclou:

    1. Captura de la pantalla de selecció d'edició (mostra l'opció triada)
    2. Captura de la pantalla de particions creades
    3. Captura del primer escriptori de Windows Server 2022
    4. Nota de la contrasenya usada (en format emmascarat: `P***w0rd!`)

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Windows Server 2022 installation step by step VirtualBox"`
        - `"instalar Windows Server 2022 maquina virtual paso a paso"`
        - `"Windows Server 2022 evaluation download install"`
