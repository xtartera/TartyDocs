---
title: Monitoratge de recursos del servidor
tags:
  - administració
  - monitoratge
  - rendiment
  - UT1
---

# :material-chart-line: Monitoratge de recursos del servidor

!!! abstract "Concepte clau"
    Monitorar els recursos (CPU, RAM, disc, xarxa) permet detectar colls d'ampolla abans que provoquin caigudes del servidor. Windows Server inclou tres eines progressivament més detallades: **Administrador de tasques**, **Monitor de recursos** i **Monitor de rendiment**.

=== ":material-notebook-outline: Apunts"

    ## Per què monitorar el servidor?

    Un servidor sense monitoratge és un servidor que un dia fallarà de manera inesperada. El monitoratge permet:

    - Detectar processos que consumeixen massa recursos
    - Planificar l'ampliació de maquinari abans de necessitar-la
    - Correlacionar esdeveniments de rendiment amb errors als logs
    - Demostrar als clients el nivell de servei (SLA)

    ## Les tres eines de monitoratge

    ```mermaid
    graph LR
        TM["📊 Administrador\nde tasques\ntaskmgr.exe\n(bàsic i ràpid)"]
        RM["📈 Monitor de\nrecursos\nresmon.exe\n(detallat i en temps real)"]
        PM["📉 Monitor de\nrendiment\nperfmon.exe\n(historial i alertes)"]

        TM -->|"Necessito més detall"| RM
        RM -->|"Necessito historial"| PM
    ```

    ## Administrador de tasques (`taskmgr`)

    Obre'l amb `Ctrl+Shift+Esc` o clic dret a la barra de tasques.

    ### Pestanyes principals

    | Pestanya | Informació disponible |
    |----------|-----------------------|
    | **Processos** | Llista de processos amb CPU, RAM, disc i xarxa per procés |
    | **Rendiment** | Gràfiques en temps real de CPU, RAM, disc i xarxa |
    | **Serveis** | Estat de tots els serveis (iniciar/aturar des d'aquí) |
    | **Detalls** | Vista avançada de processos amb PID i prioritat |

    ### Valors d'alerta orientatius

    | Recurs | Normal | Atenció | Crític |
    |--------|--------|---------|--------|
    | **CPU** | < 60% | 60–85% | > 85% sostingut |
    | **RAM** | < 70% | 70–85% | > 85% (pagina a disc) |
    | **Disc** | < 60% | 60–85% | > 85% ús sostingut |
    | **Xarxa** | < 50% | 50–80% | > 80% (saturació) |

    ## Monitor de recursos (`resmon`)

    Obre'l des del Taskbar → Cerca → "Monitor de recursos" o des del Taskbar de rendiment del Gestor de tasques.

    Mostra en temps real:
    - **CPU**: cada procés i quin nucli usa
    - **Memòria**: memòria física, en ús, disponible i en espera
    - **Disc**: operacions de lectura/escriptura per fitxer i procés
    - **Xarxa**: connexions TCP actives per procés i IP remota

    !!! tip "El Monitor de recursos és molt útil per diagnosticar quin procés concret genera trànsit de xarxa inusual o accés intens al disc."

    ## Monitor de rendiment (`perfmon`)

    L'eina més potent. Permet:

    - **Comptadors en temps real**: afegir mètriques específiques (ex: AD DS → LDAP searches/sec)
    - **Conjunts de recollida de dades**: gravar mètriques durant hores o dies
    - **Alertes**: notificar per email o event quan una mètrica supera un llindar
    - **Informes**: generar informes HTML dels conjunts gravats

    ### Comptadors útils per al curs

    ```powershell
    # Comprovar l'ús de CPU des de PowerShell (alternativa a perfmon)
    Get-Counter "\Processor(_Total)\% Processor Time" -SampleInterval 2 -MaxSamples 5

    # Comprovar RAM disponible
    Get-Counter "\Memory\Available MBytes"

    # Comprovar temps de resposta del disc
    Get-Counter "\PhysicalDisk(_Total)\Avg. Disk sec/Read"
    ```

    ## Monitoratge per PowerShell

    ```powershell
    # Resum ràpid de CPU i RAM
    $cpu = (Get-Counter "\Processor(_Total)\% Processor Time").CounterSamples.CookedValue
    $ramTotal = (Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB
    $ramLliure = (Get-Counter "\Memory\Available MBytes").CounterSamples.CookedValue / 1024

    Write-Host "CPU: $([math]::Round($cpu,1))%"
    Write-Host "RAM total: $([math]::Round($ramTotal,1)) GB"
    Write-Host "RAM lliure: $([math]::Round($ramLliure,1)) GB"
    ```

    ??? question "Auto-avaluació"

        **1.** Quina diferència hi ha entre l'Administrador de tasques i el Monitor de recursos?

        ??? success "Resposta"
            L'**Administrador de tasques** dona una visió general i ràpida del consum de CPU, RAM, disc i xarxa per procés. El **Monitor de recursos** és molt més detallat: mostra connexions TCP per procés, fitxers oberts, operacions de disc per fitxer concret i activitat de xarxa per adreça remota.

        **2.** Si el servidor té una CPU al 95% durant 10 minuts, quin pas hauries de fer primer per diagnosticar el problema?

        ??? success "Resposta"
            Obrir l'**Administrador de tasques → pestanya Processos** i ordenar per CPU descendent per identificar quin procés consumeix més recursos. Si necessites més detall (per exemple, si és un procés de sistema que agrupa subprocessos), passar al **Monitor de recursos → pestanya CPU** per veure el detall per procés i fil.

        **3.** Per a quin cas usaries el Monitor de rendiment en lloc de l'Administrador de tasques?

        ??? success "Resposta"
            Per situacions que no passen en el moment de la revisió: un servidor que va lent només a les 8h del matí quan entren tots els usuaris, o que cada divendres a la nit consumeix molt de disc. El **Monitor de rendiment** pot gravar dades durant hores i generar un informe posterior, cosa que l'Administrador de tasques no pot fer.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.4 · Analitza el rendiment del servidor

    **Objectiu**: usar les tres eines de monitoratge i interpretar els resultats.

    **Temps estimat**: 30 minuts

    **Prerequisit**: Windows Server 2022 amb algun rol instal·lat

    ---

    ### Part A – Administrador de tasques

    1. Obre `taskmgr` i ves a la pestanya **Rendiment**
    2. Documenta els valors actuals de CPU, RAM, Disc i Xarxa en una taula
    3. Obre 5 finestres del navegador simultàniament. Com canvien els valors?

    ### Part B – Monitor de recursos

    1. Des de la pestanya Rendiment del Taskbar, fes clic a **"Obre el Monitor de recursos"**
    2. A la pestanya **Xarxa → Connexions TCP**, identifica quines connexions té obertes el servidor
    3. A la pestanya **Disc**, quin procés genera més activitat de lectura?

    ### Part C – PowerShell

    Executa l'script de monitoratge de la secció d'Apunts i documenta els resultats.

    Afegeix-hi una línia que mostri l'espai lliure al disc `C:\`:

    ```powershell
    $disc = Get-PSDrive C
    Write-Host "Disc C: lliure: $([math]::Round($disc.Free/1GB,2)) GB"
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Windows Server 2022 Task Manager performance monitoring"`
        - `"Resource Monitor Windows Server tutorial"`
        - `"Performance Monitor perfmon Windows Server counters"`
        - `"PowerShell Get-Counter monitoreo rendimiento"`
