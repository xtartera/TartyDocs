---
title: Virtualització – hipervisors
tags:
  - fonaments
  - virtualització
  - VirtualBox
  - UT1
---

# :material-layers: Virtualització – hipervisors

!!! abstract "Concepte clau"
    La virtualització permet executar múltiples sistemes operatius de manera simultània sobre un sol maquinari físic, aïllats entre si. Al curs usem **VirtualBox** (hipervisor de tipus 2) per crear entorns de pràctiques sense necessitat de maquinari dedicat.

=== ":material-notebook-outline: Apunts"

    ## Què és la virtualització?

    La **virtualització** és la tècnica que permet crear una representació virtual (simulada) de recursos de maquinari: processadors, memòria, discos, targetes de xarxa... La màquina virtual resultant es comporta exactament com un ordinador físic real, però s'executa com un programa dins d'un ordinador amfitrió.

    ```mermaid
    graph TD
        subgraph Físic["🖥️ Maquinari físic (amfitrió)"]
            HW[CPU · RAM · Disc · Xarxa]
        end
        subgraph Hipervisor["Hipervisor (gestor de VMs)"]
            VM1[💻 MV1\nWindows Server 2022]
            VM2[💻 MV2\nWindows 11]
            VM3[💻 MV3\nUbuntu Server]
        end
        HW --> VM1
        HW --> VM2
        HW --> VM3
    ```

    ## Tipus d'hipervisors

    Existeixen dos tipus d'hipervisors, classificats per la seva posició respecte al maquinari:

    ### Hipervisor de Tipus 1 (Bare-metal)

    S'instal·la **directament sobre el maquinari**, sense sistema operatiu amfitrió. Té accés directe als recursos físics, cosa que ofereix el millor rendiment.

    - **Exemples**: VMware ESXi, Microsoft Hyper-V (mode dedicat), Proxmox VE, Citrix XenServer
    - **Ús**: Centres de dades, entorns de producció empresarial

    ### Hipervisor de Tipus 2 (Hosted)

    S'instal·la com una **aplicació dins d'un SO amfitrió** (Windows, macOS, Linux). Depèn del SO amfitrió per accedir al maquinari, cosa que introdueix una capa de latència però facilita l'ús.

    - **Exemples**: Oracle VirtualBox, VMware Workstation, Parallels Desktop
    - **Ús**: Desenvolupament, aprenentatge, proves, laboratoris com el nostre

    ```mermaid
    graph LR
        subgraph T1["Tipus 1 (Bare-metal)"]
            direction TB
            HW1[Maquinari]
            H1[Hipervisor]
            V1[VM1]
            V2[VM2]
            HW1 --> H1 --> V1
            H1 --> V2
        end

        subgraph T2["Tipus 2 (Hosted)"]
            direction TB
            HW2[Maquinari]
            OS2[SO amfitrió]
            H2[VirtualBox]
            V3[VM1]
            V4[VM2]
            HW2 --> OS2 --> H2 --> V3
            H2 --> V4
        end
    ```

    ## VirtualBox al curs

    **Oracle VirtualBox** és l'hipervisor que usem al curs. És **gratuït i de codi obert**, disponible per a Windows, macOS i Linux.

    ### Modes de xarxa a VirtualBox

    La configuració de xarxa és crítica per als nostres projectes:

    | Mode | La MV pot comunicar-se amb... | Ús recomanat |
    |------|-------------------------------|--------------|
    | **NAT** | Internet (via amfitrió), no amb altres MV | Actualitzar SO |
    | **Xarxa NAT** | Internet + altres MV del mateix grup | Labs multi-VM |
    | **Adaptador pont** | Xarxa física real de l'escola | Connexió real a la xarxa |
    | **Xarxa interna** | Només altres MV, sense accés exterior | Labs aïllats |
    | **Sol amfitrió** | Amfitrió i altres MV, sense internet | Connexió amfitrió-MV |

    !!! tip "Configuració recomanada per al curs"
        Usa **Xarxa NAT** amb un nom de grup compartit entre el servidor i els clients. Permet que les màquines es vegin entre elles i tinguin accés a internet si cal.

    ### Instantànies (snapshots)

    Les **instantànies** guarden l'estat exacte d'una MV en un moment donat. Pots tornar a un estat anterior si comets un error durant les pràctiques.

    !!! warning "Recomanació important"
        **Fes una instantània abans de cada projecte important.** Si l'instal·lació d'AD DS o la configuració de GPO falla i queda el sistema en un estat inconsistent, podràs recuperar-te en 30 segons.

    ??? question "Auto-avaluació"

        **1.** Quina diferència hi ha entre un hipervisor de Tipus 1 i un de Tipus 2?

        ??? success "Resposta"
            El Tipus 1 (bare-metal) s'instal·la directament sobre el maquinari sense SO amfitrió, oferint millor rendiment. El Tipus 2 (hosted) s'instal·la com una aplicació dins d'un SO amfitrió; és menys eficient però molt més fàcil d'usar per a aprenentatge.

        **2.** Quin mode de xarxa de VirtualBox s'ha de configurar per permetre que el servidor i els clients virtuals es vegin entre ells?

        ??? success "Resposta"
            **Xarxa NAT** (NAT Network) amb el mateix nom de grup per a totes les MV. Permet comunicació interna entre VMs i accés a internet via NAT.

        **3.** Per quin motiu és important fer una instantània (snapshot) **abans** d'instal·lar el rol Active Directory?

        ??? success "Resposta"
            La instal·lació d'AD DS i la promoció a DC fan canvis profunds i difícils de revertir al sistema. Si alguna cosa falla (nom de domini incorrecte, DSRM oblidat...), una instantània permet tornar al punt anterior sense haver de reinstal·lar tot el servidor.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 1.4 · Crea la teva primera màquina virtual

    **Objectiu**: instal·lar VirtualBox i crear una MV buida configurada per al projecte.

    **Temps estimat**: 30 minuts

    **Prerequisit**: VirtualBox instal·lat (o entorn Isard del centre disponible)

    ---

    ### Pas 1 – Instal·la VirtualBox

    Descarrega VirtualBox des del lloc oficial del fabricant (virtualbox.org). Instal·la també el **VirtualBox Extension Pack** per tenir suport USB 3.0 i altres millores.

    ### Pas 2 – Crea una MV per a Windows Server 2022

    1. Obre VirtualBox → **Nova**
    2. Nom: `WS2022-Server`, Tipus: `Microsoft Windows`, Versió: `Windows 2022 (64-bit)`
    3. **RAM**: mínimo 2048 MB (recomanat 4096 MB)
    4. **Disc virtual**: 60 GB, format VDI, assignació dinàmica
    5. A **Configuració → Xarxa**: canvia a **Xarxa NAT**, nom `LaboratoriUT1`

    ### Pas 3 – Fes una instantània

    Sense cap SO instal·lat, fes la primera instantània: **"MV buida – configuració inicial"**. Serveix com a punt de retorn si alguna cosa va malament durant la instal·lació.

    ### Pas 4 – Reflexió

    1. Quanta RAM té el teu ordinador físic? Quanta en dediques a la MV? Quin percentatge és?
    2. Per quin motiu s'usa assignació dinàmica i no mida fixa per al disc virtual?
    3. Quina diferència hi hauria si configuressis la xarxa en mode **Adaptador pont** en lloc de **Xarxa NAT**?

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"VirtualBox 7 tutorial principiantes español"`
        - `"tipos de hipervisores tipo 1 tipo 2 diferencias"`
        - `"VirtualBox NAT network configuracion"`
        - `"VirtualBox snapshots instantaneas como usar"`
