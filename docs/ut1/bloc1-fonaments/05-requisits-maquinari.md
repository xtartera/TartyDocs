---
title: Requisits de maquinari de Windows Server 2022
tags:
  - fonaments
  - maquinari
  - UT1
---

# :material-memory: Requisits de maquinari de Windows Server 2022

!!! abstract "Concepte clau"
    Abans d'instal·lar Windows Server cal verificar que el maquinari (físic o virtual) compleix els requisits mínims de Microsoft. Ignorar-los pot provocar instal·lacions fallides o un rendiment molt deficient.

=== ":material-notebook-outline: Apunts"

    ## Requisits oficials de Microsoft

    Microsoft publica els requisits mínims i recomanats per a Windows Server 2022:

    | Component | Mínim | Recomanat (curs) |
    |-----------|-------|-----------------|
    | **Processador** | 1,4 GHz · 64 bits · compatible EM64T | 2+ nuclis · 2+ GHz |
    | **RAM** | 512 MB (Server Core) · 2 GB (Desktop Experience) | **4 GB** |
    | **Disc** | 32 GB | **60 GB** |
    | **Xarxa** | Adaptador Gigabit Ethernet | Qualsevol compatible VirtualBox |
    | **Pantalla** | 800 × 600 | 1024 × 768 o superior |
    | **Firmware** | BIOS o UEFI | UEFI recomanat |

    !!! warning "Requisit de RAM crític"
        El mínim oficial de 512 MB és per a **Server Core** (sense GUI). Si instal·les **Desktop Experience** (el mode que usem al curs), el mínim puja a **2 GB**. Amb menys de 2 GB la instal·lació pot fallar o el sistema serà extremadament lent.

    ## Per què 60 GB de disc?

    El mínim de 32 GB és just per al SO. En producció real cal espai per a:

    | Ús | Espai aproximat |
    |----|----------------|
    | Sistema operatiu | ~20 GB |
    | Actualitzacions acumulades | ~5–10 GB |
    | Fitxers de paginació | = Mida RAM |
    | Active Directory (NTDS) | ~1–5 GB (creix amb el temps) |
    | Fitxers temporals i logs | ~2–5 GB |
    | **Total recomanat** | **60 GB com a mínim** |

    ## Requisits per al nostre laboratori (VirtualBox)

    La màquina virtual que creem simula maquinari físic. VirtualBox exposa els recursos reals del PC amfitrió a la MV:

    ```mermaid
    graph LR
        subgraph Amfitrió["🖥️ PC Amfitrió (exemple)"]
            HA[CPU: Intel i5 · 4 nuclis\nRAM: 16 GB\nDisc: SSD 512 GB]
        end
        subgraph MV["💻 MV Windows Server 2022"]
            MA[CPU virtual: 2 nuclis\nRAM virtual: 4 GB\nDisc virtual: 60 GB]
        end
        HA -- "VirtualBox assigna" --> MA
    ```

    ### Recomanació per al PC de l'aula

    | Recurs | PC amfitrió mínim | MV Windows Server |
    |--------|-------------------|-------------------|
    | **CPU** | 4 nuclis (físics) | 2 nuclis virtuals |
    | **RAM** | 8 GB | 4 GB assignats |
    | **Disc lliure** | 80 GB | Disc virtual 60 GB |

    !!! info "Als PCs dels laboratoris Isard del centre, les MV ja estan preconfigurades amb els recursos adequats."

    ## Verificació de compatibilitat

    Abans d'instal·lar, pots verificar el maquinari des de Windows:

    ```powershell
    # Informació del processador
    Get-WmiObject Win32_Processor | Select-Object Name, NumberOfCores, MaxClockSpeed

    # RAM instal·lada
    Get-WmiObject Win32_ComputerSystem | Select-Object TotalPhysicalMemory

    # Espai en disc
    Get-PSDrive C | Select-Object Used, Free
    ```

    !!! tip "A la màquina virtual, pots veure els recursos assignats a **Configuració → Sistema** (CPU i RAM) i **Configuració → Emmagatzematge** (disc)."

    ??? question "Auto-avaluació"

        **1.** Quin és el mínim de RAM per instal·lar Windows Server 2022 en mode Desktop Experience?

        ??? success "Resposta"
            **2 GB** (2048 MB). El requisit de 512 MB s'aplica únicament al mode Server Core sense interfície gràfica. Per al curs, es recomanen **4 GB** per tenir un rendiment acceptable.

        **2.** Per quin motiu no és suficient el mínim de 32 GB de disc en un entorn real?

        ??? success "Resposta"
            El SO ocupa uns 20 GB i les actualitzacions acumulades pot afegir 5–10 GB més. A més, la base de dades d'Active Directory (NTDS.dit), els fitxers de paginació i els logs del sistema requereixen espai addicional. En un servidor de producció, 60 GB és el mínim recomanable.

        **3.** Tens un PC amfitrió amb 8 GB de RAM. Vols crear **2 màquines virtuals**: un servidor (4 GB) i un client Windows 11 (2 GB). Quanta RAM quedarà per al SO amfitrió? Serà suficient?

        ??? success "Resposta"
            8 GB − 4 GB − 2 GB = **2 GB** per al SO amfitrió. Pot ser just si el SO amfitrió és Windows 10/11: podria ser funcional però lent. Es recomana tenir com a mínim 12–16 GB al PC amfitrió per córrer dues VMs còmodament.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 1.5 · Auditoria de maquinari del PC de l'aula

    **Objectiu**: verificar que el PC del laboratori compleix els requisits per al nostre laboratori virtual.

    **Temps estimat**: 15 minuts

    ---

    ### Part A – Inventari del PC amfitrió

    Des del PC de l'aula, recull la informació següent:

    | Component | Valor trobat |
    |-----------|-------------|
    | Model de processador | |
    | Nombre de nuclis físics | |
    | RAM total instal·lada | |
    | Espai lliure al disc C: | |
    | Versió del SO amfitrió | |

    Eines per obtenir-ho:
    - **Gestor de tasques** → pestanya Rendiment
    - `msinfo32` → des de la finestra Executar
    - `dxdiag` → per a informació general

    ### Part B – Calcula els recursos disponibles

    Amb les dades recollides, calcula:

    1. Quants nuclis virtuals pots assignar al Windows Server sense que el PC amfitrió quedi sense recursos?
    2. Quanta RAM pots assignar a la MV deixant almenys 4 GB per al SO amfitrió?
    3. Tens espai lliure suficient per als 60 GB del disc virtual de la MV?

    ### Part C – Configuració de la MV

    A VirtualBox, configura la MV de Windows Server 2022 amb els valors que has calculat. Fes una captura de pantalla de la pantalla **Configuració → Sistema** mostrant el resum de recursos assignats.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Windows Server 2022 system requirements"`
        - `"VirtualBox como asignar RAM y CPU maquina virtual"`
        - `"requisitos hardware Windows Server 2022 español"`
