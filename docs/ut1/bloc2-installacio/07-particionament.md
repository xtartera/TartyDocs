---
title: Particionament del disc
tags:
  - instal·lació
  - disc
  - UT1
---

# :material-harddisk: Particionament del disc

!!! abstract "Concepte clau"
    Partir un disc en particions permet separar el sistema operatiu de les dades. En un servidor, aquesta separació és essencial per facilitar les còpies de seguretat, limitar l'impacte d'errors i organitzar l'espai eficientment.

=== ":material-notebook-outline: Apunts"

    ## Què és una partició?

    Una **partició** és una divisió lògica d'un disc físic. El sistema operatiu tracta cada partició com si fos un disc independent, amb la seva pròpia lletra d'unitat i sistema de fitxers.

    ```mermaid
    graph LR
        subgraph Disc["💾 Disc físic: 120 GB"]
            P1["🔵 Partició C:\n60 GB — Sistema"]
            P2["🟢 Partició D:\n50 GB — Dades"]
            P3["⚪ No assignat\n10 GB"]
        end
    ```

    ## Tipus de taula de particions: MBR vs GPT

    Existeixen dos estàndards per organitzar les particions d'un disc:

    | | MBR (Master Boot Record) | GPT (GUID Partition Table) |
    |-|:------------------------:|:--------------------------:|
    | **Màx. discos** | 2 TB | 9,4 ZB (pràcticament il·limitat) |
    | **Màx. particions** | 4 primàries | 128 primàries |
    | **Firmware** | BIOS (llegat) | UEFI (modern) |
    | **Recuperació** | Una còpia de la taula | Còpia de seguretat automàtica |
    | **Recomanat** | Discos antics < 2 TB | **Tot maquinari modern** |

    !!! tip "Al curs"
        VirtualBox crea discos virtuals compatibles amb GPT per defecte quan el firmware de la MV és UEFI. Si la MV usa BIOS, el disc serà MBR. En ambdós casos, l'instal·lador de WS2022 gestiona la taula automàticament.

    ## Esquema de particionament recomanat per al servidor

    L'instal·lador de Windows Server crea automàticament les particions necessàries. Amb un disc de 60 GB, el resultat és:

    | Partició | Mida aprox. | Funció |
    |----------|-------------|--------|
    | **Recuperació** | 499 MB | Entorn de recuperació de Windows (WinRE) |
    | **EFI** | 100 MB | Carregador d'arrencada (UEFI) |
    | **MSR** | 16 MB | Reserva de Microsoft (partició interna) |
    | **Sistema (C:)** | Resta (~59 GB) | Sistema operatiu i aplicacions |

    !!! info "En un entorn de producció real, és habitual separar les dades del sistema:"

        ```
        C:\ → 60 GB  → Sistema operatiu Windows Server
        D:\ → 100 GB → Dades corporatives (NTDS, carpetes compartides)
        E:\ → 50 GB  → Còpies de seguretat locals
        ```

        Al laboratori, amb 60 GB totals, una sola partició C:\ és suficient.

    ## Càlcul de mides de particions

    El Projecte 1 demana calcular particions amb percentatges. El mètode:

    ```
    Disc total: 120 GB

    C:\ (50% per al SO)  = 120 × 0,50 = 60 GB
    D:\ (35% per a dades) = 120 × 0,35 = 42 GB
    E:\ (15% per a logs)  = 120 × 0,15 = 18 GB
    ```

    !!! warning "Error freqüent"
        Assignar tot l'espai a la partició del sistema (`C:\`) no deixa espai per a les dades. Quan `C:\` s'omple completament, el servidor pot deixar de funcionar (AD DS, DHCP, DNS deixen de poder escriure logs i bases de dades). Sempre reserva espai per a dades en una partició separada o amb marge suficient.

    ## Gestió de disc un cop instal·lat

    Per gestionar particions des de Windows Server:

    - **GUI**: `diskmgmt.msc` → Administrador de discos
    - **PowerShell**:

    ```powershell
    # Veure tots els discos i particions
    Get-Disk | Select-Object Number, Size, PartitionStyle

    # Veure espai disponible per unitat
    Get-PSDrive -PSProvider FileSystem | Select-Object Name, Used, Free
    ```

    ??? question "Auto-avaluació"

        **1.** Quin avantatge té GPT sobre MBR en termes de nombre de particions?

        ??? success "Resposta"
            GPT admet fins a **128 particions primàries**, mentre que MBR només permet 4 particions primàries (o 3 primàries + 1 estesa que conté particions lògiques). GPT tampoc té el límit de 2 TB per disc que té MBR.

        **2.** Per quin motiu és recomanable tenir una partició de dades (`D:\`) separada de la del sistema (`C:\`)?

        ??? success "Resposta"
            Si `C:\` s'omple, el servidor pot deixar de funcionar. Separant les dades a `D:\`, un creixement inesperat de fitxers d'usuari no afecta el sistema operatiu. A més, facilita les còpies de seguretat (es pot fer backup de `D:\` de manera independent) i la reinstal·lació del sistema sense perdre les dades.

        **3.** Tens un disc de 80 GB. El teu professor et demana que facis: 60% per al SO, 30% per a dades i 10% de reserva. Quantes GB corresponen a cada partició?

        ??? success "Resposta"
            - Sistema (C:\): 80 × 0,60 = **48 GB**
            - Dades (D:\): 80 × 0,30 = **24 GB**
            - Reserva: 80 × 0,10 = **8 GB**

=== ":material-pencil-ruler: Activitat"

    ## Activitat 2.2 · Càlcul i disseny de particions

    **Objectiu**: dissenyar un esquema de particionament adequat per a un servidor real.

    **Temps estimat**: 20 minuts

    ---

    ### Part A – Càlcul de particions

    Per a cada escenari, calcula la mida de cada partició:

    | Escenari | Disc total | Distribució | C:\ | D:\ | Altres |
    |----------|------------|-------------|-----|-----|--------|
    | Laboratori bàsic | 60 GB | 100% sistema | | — | — |
    | Servidor PIME | 120 GB | 50% SO / 40% dades / 10% logs | | | |
    | Servidor escola | 250 GB | 30% SO / 60% dades / 10% backup | | | |

    ### Part B – Administrador de discos

    A la teva MV de Windows Server, obre `diskmgmt.msc` i documenta:

    1. Quantes particions ha creat automàticament l'instal·lador?
    2. Quina mida té cadascuna i quin és el seu nom o funció?
    3. Quant espai lliure queda a la partició `C:\`?

    ### Part C – Comproba per PowerShell

    Executa les ordres de la secció d'Apunts i comprova que el resultat coincideix amb el que veus a `diskmgmt.msc`. Fes una captura de pantalla de cada resultat.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"particionament disc dur Windows Server instal·lació"`
        - `"MBR vs GPT partitions explained"`
        - `"Windows Server disk management PowerShell"`
        - `"diskpart Windows Server particiones"`
