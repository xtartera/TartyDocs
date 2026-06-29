---
title: Backups – Veeam Agent + PowerShell + Robocopy
tags:
  - ut4
  - active-directory
  - backups
  - powershell
---

# :material-backup-restore: Backups – Veeam Agent + PowerShell + Robocopy

!!! abstract "Concepte clau"
    La **còpia de seguretat** en entorns Windows AD és crítica: si es perd el DC, es perd el directori. **Veeam Agent** fa còpies de baremetal, **PowerShell + Robocopy** copien dades específiques, i el **Planificador de tasques** automatitza les còpies periòdicament.

=== ":material-notebook-outline: Apunts"

    ## Estratègia de backup en un entorn AD

    ```mermaid
    graph TD
        DC["DC / Servidor de fitxers"] -->|"Backup baremetal"| VEEAM["Veeam Agent\n(imatge completa)"]
        DC -->|"Còpia de dades"| PS["PowerShell\nCopy-Item / Robocopy"]
        PS -->|"Desti"| NAS["NAS / Carpeta xarxa\n\\\\NAS\\backups"]
        TASK["Planificador de tasques\nScheduled Task"] -->|"Executa"| PS
        TASK -->|"Executa"| VEEAM
    ```

    ## Veeam Agent for Windows (Free Edition)

    Veeam Agent fa **còpies de baremetal**: captura tot el disc o volums concrets, permetent la restauració completa del sistema.

    ### Instal·lació i configuració bàsica

    1. Descarrega **Veeam Agent for Microsoft Windows FREE** (des del web oficial)
    2. Instal·la al servidor o client
    3. Configura el treball de backup:
       - **Job Type**: Entire Computer o Volume Level Backup
       - **Destination**: carpeta de xarxa o disc extern
       - **Schedule**: diari, setmanal, etc.

    ### Verificació

    ```powershell
    # Veeam té CLI (VeeamAgentCmd)
    "C:\Program Files\Veeam\Endpoint Backup\VeeamAgentCmd.exe" -startbackup -job "NomDelJob"
    ```

    ## PowerShell: Copy-Item per a còpies de dades

    Per a còpies de directoris específics (dades d'usuaris, carpetes compartides):

    ```powershell
    # Còpia simple de directori
    $origen = "C:\Perfils"
    $desti  = "\\WSRV201\Backups$\Perfils_$(Get-Date -Format 'yyyyMMdd')"

    Copy-Item -Path $origen -Destination $desti -Recurse -Force

    # Amb log d'errors
    Copy-Item -Path $origen -Destination $desti -Recurse -Force `
        -ErrorAction Continue 2>> "C:\Logs\backup-errors.log"
    ```

    ## Robocopy: còpia robusta per a grans volums

    **Robocopy** (Robust File Copy) és l'eina recomanada per a còpies de dades en entorns Windows:

    ```powershell
    # Sintaxi bàsica
    robocopy "C:\Perfils" "\\NAS\Backups\Perfils" /MIR /LOG:"C:\Logs\robocopy.log"

    # Flags comuns:
    # /MIR   → Mirror (copia, esborrada si no és a l'origen, manté estructura)
    # /R:3   → 3 reintents per fitxer que falla
    # /W:10  → 10 segons d'espera entre reintents
    # /LOG   → Desa el log al fitxer indicat
    # /NP    → No progress (output menys verbós)
    # /XA:H  → Exclou fitxers ocults

    # Exemple complet
    robocopy "C:\Dades" "\\NAS\Backups\Dades" /MIR /R:3 /W:10 /LOG:"C:\Logs\backup.log" /NP
    ```

    ## Automatitzar amb el Planificador de tasques

    ```powershell
    # Crea un script de backup
    $scriptPath = "C:\Scripts\backup-dades.ps1"
    $scriptContent = @"
    robocopy "C:\Perfils" "\\NAS\Backups\Perfils_$(Get-Date -Format 'yyyyMMdd')" /MIR /LOG:"C:\Logs\backup.log"
    "@
    $scriptContent | Out-File -FilePath $scriptPath -Encoding UTF8

    # Crea la tasca programada
    $action  = New-ScheduledTaskAction -Execute "powershell.exe" `
        -Argument "-NonInteractive -File $scriptPath"
    $trigger = New-ScheduledTaskTrigger -Daily -At "02:00"

    Register-ScheduledTask -TaskName "BackupDiari" `
        -Action $action `
        -Trigger $trigger `
        -RunLevel Highest `
        -User "SYSTEM"

    # Verifica
    Get-ScheduledTask -TaskName "BackupDiari"
    ```

    ## Backup específic d'Active Directory (ntdsutil)

    ```powershell
    # Backup del System State (inclou ntds.dit, SYSVOL, registre)
    wbadmin start systemstatebackup -backuptarget:"\\NAS\Backups" -quiet
    ```

    !!! warning "Mai copiar ntds.dit directament"
        La base de dades `ntds.dit` és un fitxer en ús constant. Copiar-la directament (amb `Copy-Item` o `robocopy`) produirà una còpia corrupta. Sempre usa `wbadmin` o Veeam per fer backup del System State, que fa un snapshot consistent del fitxer.

    !!! tip "Regla 3-2-1 de backup"
        Mantén **3** còpies de les dades, en **2** tipus de suport diferent, amb **1** còpia fora del lloc principal (offsite). Per exemple: còpia local (disk intern) + còpia a NAS + còpia a cloud (Azure Backup, OneDrive).

    ??? question "Auto-avaluació"
        **1.** Per quin motiu no es pot copiar `ntds.dit` directament amb `robocopy`?

        ??? success "Resposta"
            `ntds.dit` és la base de dades d'Active Directory i el servei `NTDS` el té obert i bloquejat en tot moment. Copiar-lo directament produiria una còpia **inconsistent** (com copiar un fitxer Excel mentre algú el modifica: la còpia pot estar a mig guardar). Per fer un backup consistent cal usar `wbadmin start systemstatebackup` o Veeam, que fan un snapshot del volum o fan servir l'API VSS (Volume Shadow Copy Service).

        **2.** Quina diferència hi ha entre `Copy-Item` i `Robocopy` per a còpies de grans volums?

        ??? success "Resposta"
            `Copy-Item` és un cmdlet PowerShell simple que no té mecanismes de reintent ni registre. Si falla en mig d'una còpia gran, s'atura sense reintentar. **Robocopy** és específic per a còpies robustes: gestiona reintents (`/R:`), té modes d'espera (`/W:`), pot fer còpies mirall (`/MIR`), genera logs detallats (`/LOG`) i és molt més eficient amb fitxers grans o connexions inestables. Per a còpies de dades d'empresa, sempre `Robocopy`.

        **3.** Quina ordre PowerShell crea una tasca programada que executa un script cada dia a les 2:00?

        ??? success "Resposta"
            ```powershell
            $action  = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-File C:\Scripts\backup.ps1"
            $trigger = New-ScheduledTaskTrigger -Daily -At "02:00"
            Register-ScheduledTask -TaskName "BackupDiari" -Action $action -Trigger $trigger -User "SYSTEM" -RunLevel Highest
            ```

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.11 · Script de backup automatitzat

    **Objectiu**: crear un script PowerShell de backup i programar-lo al Planificador de tasques.
    **Temps estimat**: 30 minuts

    ---

    ### Pas 1 – Crea el directori de destinació

    ```powershell
    New-Item -Path "C:\Backups" -ItemType Directory
    ```

    ### Pas 2 – Crea l'script de backup

    Desa com `C:\Scripts\backup-perfils.ps1`:

    ```powershell
    $data   = Get-Date -Format "yyyyMMdd-HHmm"
    $origen = "C:\Perfils"
    $desti  = "C:\Backups\Perfils_$data"
    $log    = "C:\Logs\backup_$data.log"

    New-Item -Path "C:\Logs" -ItemType Directory -Force | Out-Null
    robocopy $origen $desti /MIR /R:3 /W:5 /LOG:$log /NP
    Write-Host "Backup completat: $desti"
    ```

    ### Pas 3 – Executa manualment i verifica

    ```powershell
    & "C:\Scripts\backup-perfils.ps1"
    ls "C:\Backups"
    ```

    ### Pas 4 – Programa la tasca

    ```powershell
    $action  = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NonInteractive -File C:\Scripts\backup-perfils.ps1"
    $trigger = New-ScheduledTaskTrigger -Daily -At "23:00"
    Register-ScheduledTask -TaskName "BackupPerfils" -Action $action -Trigger $trigger -User "SYSTEM" -RunLevel Highest
    ```

    Verifica: `Get-ScheduledTask -TaskName "BackupPerfils"`

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Veeam Agent Windows free backup tutorial"`
        - `"robocopy Windows backup script tutorial"`
        - `"PowerShell scheduled task backup automation"`
