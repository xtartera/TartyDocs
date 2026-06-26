---
title: Server Manager
tags:
  - administració
  - server manager
  - UT1
---

# :material-view-dashboard: Server Manager

!!! abstract "Concepte clau"
    **Server Manager** és el tauler central d'administració de Windows Server. Des d'aquí s'instal·len rols, es monitora l'estat del servidor i es llancen totes les eines de gestió, sense necessitat d'obrir cap menú addicional.

=== ":material-notebook-outline: Apunts"

    ## Què és Server Manager?

    **Server Manager** s'obre automàticament cada vegada que inicies sessió a Windows Server. És el punt de partida per a qualsevol tasca administrativa: instal·lar serveis, comprovar alertes, accedir a eines com ADUC o GPMC, i gestionar múltiples servidors des d'una sola consola.

    ## Zones del tauler

    ```mermaid
    graph TD
        SM[🖥️ Server Manager]
        SM --> D[Tauler - Dashboard\nresum i alertes]
        SM --> LS[Servidor local\nIP · nom · estat de serveis]
        SM --> AS[Tots els servidors\nadministració remota]
        SM --> R[Nodes per rol\nAD DS · DNS · File Services...]
        SM --> T[Menú Eines - Tools\nADUC · GPMC · DNS · Event Viewer...]
    ```

    ### Tauler (Dashboard)

    La pàgina inicial mostra un resum visual amb:

    - **Esdeveniments**: errors i advertències recents dels logs del sistema
    - **Serveis**: serveis aturats que haurien d'estar en execució
    - **Rendiment**: alertes de CPU o memòria elevades
    - **Resultat BPA** (Best Practices Analyzer): recomanacions de Microsoft

    ### Servidor local

    Mostra la configuració actual del servidor: nom, IP, zona horària, estat del firewall, Remote Desktop, Windows Update. Des d'aquí pots canviar qualsevol d'aquests valors fent clic directament sobre ells.

    ### Nodes per rol

    Quan instal·les un rol (AD DS, DNS, File Services...), apareix un node nou al panell esquerre amb informació específica d'aquell servei. Per exemple, el node **File and Storage Services** mostra els volums, carpetes compartides i discos.

    ### Menú Eines (Tools)

    El menú **Tools** de la barra superior dóna accés directe a totes les consoles d'administració (MMC snap-ins):

    | Eina | Funció |
    |------|--------|
    | **Active Directory Users and Computers** | Gestió d'usuaris, grups i UO |
    | **Group Policy Management** | Creació i gestió de GPO |
    | **DNS Manager** | Zones i registres DNS |
    | **DHCP** | Àmbits i reserves DHCP |
    | **Event Viewer** | Logs del sistema |
    | **Task Scheduler** | Tasques programades |
    | **Computer Management** | Discos, serveis, usuaris locals |

    ## Afegir rols i característiques

    El flux estàndard per instal·lar qualsevol servei nou:

    ```mermaid
    graph LR
        A[Server Manager\n→ Gestiona] --> B[Afegir rols i\ncaracterístiques]
        B --> C[Instal·lació\nbasada en rol]
        C --> D[Selecciona servidor]
        D --> E[Marca el rol]
        E --> F[Característiques\naddicionals - opcional]
        F --> G[✅ Instal·la]
    ```

    !!! tip "Gestió de múltiples servidors"
        Server Manager pot administrar **servidors remots** afegint-los al pool amb **Gestiona → Afegir servidors**. Des d'un sol punt pots monitorar i configurar tots els servidors de la xarxa.

    ??? question "Auto-avaluació"

        **1.** Quina secció de Server Manager mostra les alertes d'errors i advertències recents?

        ??? success "Resposta"
            La secció **Tauler (Dashboard)**, concretament el quadre d'**Esdeveniments**, que agrega els errors i advertències dels logs Application, System i Security del Visor d'Esdeveniments.

        **2.** On trobes, dins de Server Manager, l'eina per gestionar usuaris i grups d'Active Directory?

        ??? success "Resposta"
            Al menú **Eines (Tools)** → **Active Directory Users and Computers** (ADUC). Aquesta opció apareix un cop instal·lat i configurat el rol AD DS.

        **3.** Per quin motiu Server Manager s'obre automàticament en iniciar sessió a Windows Server?

        ??? success "Resposta"
            Perquè Windows Server és un sistema orientat a l'administració, no a l'ús personal. L'obertura automàtica recorda que l'administrador ha de revisar l'estat del servidor regularment. Es pot desactivar des de **Gestiona → Propietats del Server Manager**.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.1 · Explora Server Manager

    **Objectiu**: identificar les zones principals de Server Manager i les eines accessibles.

    **Temps estimat**: 20 minuts

    **Prerequisit**: Windows Server 2022 configurat (Activitat 2.5)

    ---

    ### Part A – Mapa de Server Manager

    Obre Server Manager i completa la taula:

    | Secció | Informació que mostra | Una cosa que pots fer des d'aquí |
    |--------|-----------------------|----------------------------------|
    | Tauler | | |
    | Servidor local | | |
    | Tots els servidors | | |

    ### Part B – Menú Eines

    Llista **5 eines** del menú Tools. Per a cadascuna indica:

    1. Nom de l'eina
    2. Per a quin rol o funció s'usa
    3. En quin moment del curs la farem servir

    ### Part C – Prova d'alerta

    1. Atura manualment el servei **Windows Time** des de `services.msc`.
    2. Torna al Dashboard de Server Manager. Quant tarda a aparèixer l'alerta?
    3. Torna a iniciar el servei. L'alerta desapareix immediatament?

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Server Manager Windows Server 2022 overview"`
        - `"Server Manager dashboard tutorial explicado"`
        - `"Windows Server 2022 tools menu administration"`
