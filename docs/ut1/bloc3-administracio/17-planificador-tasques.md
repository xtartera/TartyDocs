---
title: Planificador de tasques
tags:
  - administració
  - automatització
  - UT1
---

# :material-calendar-clock: Planificador de tasques

!!! abstract "Concepte clau"
    El **Planificador de tasques** (`taskschd.msc`) permet executar scripts, programes o eines de manera automàtica en resposta a una hora, un event del sistema o una condició. És la base de l'automatització de manteniment en servidors Windows.

=== ":material-notebook-outline: Apunts"

    ## Estructura d'una tasca programada

    Una tasca programada té tres parts obligatòries:

    ```mermaid
    graph LR
        T[📋 Tasca programada]
        T --> TR[Disparador\nTrigger\n¿Quan?]
        T --> AC[Acció\nAction\n¿Què?]
        T --> CO[Condicions\nConditions\n¿Sota quines condicions?]

        TR --> TR1[Cada dia a les 02:00h]
        TR --> TR2[Quan arrenca el sistema]
        TR --> TR3[Quan apareix event ID 1521]

        AC --> AC1[Executa un script .ps1]
        AC --> AC2[Inicia un programa .exe]

        CO --> CO1[Només si el PC està inactiu]
        CO --> CO2[Només si hi ha corrent]
    ```

    ## Disparadors disponibles

    | Disparador | Descripció | Ús típic |
    |-----------|------------|---------|
    | **En un horari** | Diàriament, setmanalment, una vegada | Còpies de seguretat nocturnes |
    | **En iniciar el sistema** | Quan Windows arrenca | Iniciar serveis personalitzats |
    | **En iniciar sessió** | Quan un usuari inicia sessió | Scripts d'entorn d'usuari |
    | **En un event** | Quan apareix un ID d'event concret | Resposta automàtica a errors |
    | **En inactivitat** | Quan el PC porta X temps sense activitat | Desfragmentació, escaneig |

    ## Accions disponibles

    | Acció | Descripció |
    |-------|-----------|
    | **Inicia un programa** | Executa un `.exe`, `.bat`, `.ps1` o qualsevol executable |
    | **Envia un email** | Obsolet a Windows Server 2022 (usa scripts PowerShell amb Send-MailMessage) |
    | **Mostra un missatge** | Obsolet a Windows Server 2022 |

    ## Crear una tasca via GUI

    1. Obre `taskschd.msc` → Biblioteca del Planificador de tasques
    2. **Acció** → **Crear tasca bàsica** (per a tasques simples) o **Crear tasca** (avançat)
    3. Pestanya **General**: nom, descripció, seguretat
        - "Executa tant si l'usuari ha iniciat sessió com si no"
        - "Executar amb els privilegis més alts"
    4. Pestanya **Disparadors**: quan s'activa
    5. Pestanya **Accions**: què executa
    6. Pestanya **Condicions**: quan pot o no executar-se
    7. Pestanya **Configuració**: límit de temps, reinici si falla

    ## Crear una tasca via PowerShell

    ```powershell
    # Exemple: executa un script de neteja cada dia a les 03:00h
    $accio = New-ScheduledTaskAction `
        -Execute "powershell.exe" `
        -Argument "-NonInteractive -File C:\Scripts\neteja.ps1"

    $disparador = New-ScheduledTaskTrigger `
        -Daily -At "03:00"

    $configuracio = New-ScheduledTaskSettingsSet `
        -ExecutionTimeLimit (New-TimeSpan -Hours 1) `
        -RestartCount 3 `
        -RestartInterval (New-TimeSpan -Minutes 5)

    Register-ScheduledTask `
        -TaskName "Neteja Nocturna" `
        -Action $accio `
        -Trigger $disparador `
        -Settings $configuracio `
        -RunLevel Highest `
        -User "SYSTEM"
    ```

    ## Gestió de tasques existents

    ```powershell
    # Llistar totes les tasques del sistema
    Get-ScheduledTask | Select-Object TaskName, State, TaskPath

    # Executar una tasca manualment (per provar-la)
    Start-ScheduledTask -TaskName "Neteja Nocturna"

    # Veure l'historial d'una tasca (activa el registre primer)
    Get-ScheduledTaskInfo -TaskName "Neteja Nocturna"

    # Eliminar una tasca
    Unregister-ScheduledTask -TaskName "Neteja Nocturna" -Confirm:$false
    ```

    !!! tip "Per veure l'historial d'execucions d'una tasca a la GUI: selecciona la tasca → pestanya **Historial**. Si la pestanya és buida, activa el registre: **Acció → Habilita l'historial de totes les tasques**."

    !!! warning "Les tasques que executen scripts PowerShell necessiten que la política d'execució (`ExecutionPolicy`) permeti scripts. Usa l'argument `-ExecutionPolicy Bypass` a la línia de PowerShell.exe per evitar bloquejos sense canviar la política global del sistema."

    ??? question "Auto-avaluació"

        **1.** Quina diferència hi ha entre un disparador "En un horari" i un disparador "En un event"?

        ??? success "Resposta"
            El disparador **"En un horari"** s'activa en un moment concret (hora, dia de la setmana, data). El disparador **"En un event"** s'activa quan el Visor d'Esdeveniments registra un event específic (definit per Log + ID). El segon és molt útil per automatitzar respostes a errors: per exemple, enviar un email quan apareix l'event 1521 de perfil mòbil.

        **2.** Per quin motiu s'ha de marcar "Executa tant si l'usuari ha iniciat sessió com si no" en tasques de servidor?

        ??? success "Resposta"
            Un servidor pot estar en funcionament sense que cap administrador tingui sessió oberta. Si la tasca és "Executa només quan l'usuari ha iniciat sessió", les còpies de seguretat nocturnes, els scripts de manteniment o les comprovacions de salut no s'executarien quan ningú estigués connectat, que és precisament el moment en el qual s'han de fer.

        **3.** Quin paràmetre de `powershell.exe` hauries d'afegir a l'acció d'una tasca per evitar bloquejos per la política d'execució sense canviar-la globalment?

        ??? success "Resposta"
            `-ExecutionPolicy Bypass`. L'acció quedaria: `powershell.exe -NonInteractive -ExecutionPolicy Bypass -File C:\Scripts\meuescript.ps1`. Bypass anul·la la restricció únicament per a aquella instància de PowerShell, sense modificar la política global del servidor.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.7 · Crea una tasca de manteniment automàtic

    **Objectiu**: crear una tasca programada que generi un informe diari de l'estat del servidor.

    **Temps estimat**: 30 minuts

    ---

    ### Part A – Crea l'script

    Crea el fitxer `C:\Scripts\informe-diari.ps1` amb el contingut:

    ```powershell
    $data = Get-Date -Format "yyyy-MM-dd_HH-mm"
    $fitxer = "C:\Informes\informe-$data.txt"

    New-Item -ItemType Directory -Path "C:\Informes" -Force | Out-Null

    $contingut = @"
    === Informe diari del servidor ===
    Data: $(Get-Date)
    Servidor: $env:COMPUTERNAME

    CPU actual: $((Get-Counter "\Processor(_Total)\% Processor Time").CounterSamples.CookedValue.ToString("F1"))%
    RAM lliure: $([math]::Round((Get-Counter "\Memory\Available MBytes").CounterSamples.CookedValue/1024,2)) GB
    Disc C: lliure: $([math]::Round((Get-PSDrive C).Free/1GB,2)) GB

    Serveis aturats:
    $(Get-Service | Where-Object {$_.Status -eq 'Stopped'} | Select-Object Name, DisplayName | Format-Table -AutoSize | Out-String)
    "@

    $contingut | Out-File -FilePath $fitxer -Encoding utf8
    Write-Host "Informe guardat a $fitxer"
    ```

    ### Part B – Crea la tasca programada

    1. Usa el Planificador de tasques (GUI o PowerShell) per crear una tasca que:
        - S'executi **cada dia a les 08:00h**
        - Executi l'script `C:\Scripts\informe-diari.ps1`
        - S'executi amb privilegis d'administrador
        - Funcioni tant si hi ha sessió oberta com si no

    ### Part C – Prova i verifica

    1. Executa la tasca manualment des del Planificador de tasques
    2. Comprova que s'ha creat un fitxer a `C:\Informes\`
    3. Obre el fitxer i verifica que conté la informació correcta

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Task Scheduler Windows Server 2022 tutorial"`
        - `"Register-ScheduledTask PowerShell tutorial"`
        - `"Windows Task Scheduler run PowerShell script"`
