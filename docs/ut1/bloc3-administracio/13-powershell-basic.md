---
title: PowerShell bàsic d'administració
tags:
  - administració
  - powershell
  - UT1
---

# :material-powershell: PowerShell bàsic d'administració

!!! abstract "Concepte clau"
    **PowerShell** és l'intèrpret d'ordres i llenguatge de scripts de Microsoft. A diferència del `cmd.exe` clàssic, treballa amb **objectes** (no text), la qual cosa permet filtrar, ordenar i processar resultats de manera molt més potent. Al curs l'usem de manera progressiva: primer per verificar configuracions, després per automatitzar tasques.

=== ":material-notebook-outline: Apunts"

    ## PowerShell vs cmd.exe

    | | cmd.exe | PowerShell |
    |-|:-------:|:----------:|
    | **Output** | Text pla | Objectes .NET |
    | **Pipeline** | Text | Objectes amb propietats |
    | **Scripts** | .bat / .cmd | .ps1 |
    | **Gestió de rols** | No | `Install-WindowsFeature` |
    | **AD DS** | No (net user, limitat) | `New-ADUser`, `Get-ADUser`... |
    | **Recomanat** | Compatibilitat llegat | **Administració modern** |

    ## Estructura d'un cmdlet

    Totes les ordres de PowerShell segueixen la convenció `Verb-Nom`:

    ```
    Get-Service          → Obté informació de serveis
    Start-Service        → Inicia un servei
    Stop-Service         → Atura un servei
    New-ADUser           → Crea un usuari d'AD
    Set-NetIPAddress     → Configura una adreça IP
    ```

    Els verbs més comuns: `Get`, `Set`, `New`, `Remove`, `Start`, `Stop`, `Enable`, `Disable`, `Test`, `Install`.

    ## Ordres essencials per a l'administració

    ### Ajuda i descobriment

    ```powershell
    # Ajuda d'un cmdlet específic
    Get-Help Get-Service -Full
    Get-Help Get-Service -Examples

    # Cercar cmdlets per nom parcial
    Get-Command *ADUser*
    Get-Command -Verb Get -Noun *Net*

    # Explorar propietats d'un objecte
    Get-Service | Get-Member
    ```

    ### Serveis

    ```powershell
    # Veure tots els serveis
    Get-Service

    # Filtrar per nom
    Get-Service -Name "DNS"
    Get-Service | Where-Object {$_.Status -eq "Running"}

    # Iniciar / Aturar / Reiniciar
    Start-Service -Name "DNS"
    Stop-Service -Name "DNS"
    Restart-Service -Name "DNS"
    ```

    ### Processos

    ```powershell
    # Veure processos en execució
    Get-Process

    # Ordenar per ús de CPU
    Get-Process | Sort-Object CPU -Descending | Select-Object -First 10

    # Aturar un procés
    Stop-Process -Name "notepad"
    ```

    ### Xarxa

    ```powershell
    # Configuració de xarxa
    Get-NetIPConfiguration
    Get-NetAdapter

    # Prova de connectivitat
    Test-Connection 8.8.8.8 -Count 3
    Test-NetConnection 10.0.2.10 -Port 445
    ```

    ### Sistema de fitxers

    ```powershell
    # Navegar i llistar
    Get-ChildItem C:\Windows
    Get-ChildItem C:\ -Recurse -Filter "*.log"

    # Crear / Eliminar
    New-Item -ItemType Directory -Path "C:\Dades\Logs"
    Remove-Item "C:\Temp\fitxer.txt"

    # Copiar / Moure
    Copy-Item "C:\origen\fitxer.txt" "D:\desti\"
    Move-Item "C:\origen\" "D:\desti\"
    ```

    ## El pipeline: la potència de PowerShell

    El símbol `|` passa l'output d'una ordre com a input de la següent, però passant **objectes** complets, no text:

    ```powershell
    # Obtén els 5 processos que consumeixen més RAM
    Get-Process |
        Sort-Object WorkingSet -Descending |
        Select-Object Name, WorkingSet -First 5

    # Exporta serveis en execució a un CSV
    Get-Service |
        Where-Object {$_.Status -eq "Running"} |
        Export-Csv "C:\Informes\serveis.csv" -NoTypeInformation
    ```

    ## Variables

    ```powershell
    $nom = "SRV-WS2022"
    $ip = "10.0.2.10"
    $serveis = Get-Service

    Write-Host "El servidor $nom té la IP $ip"
    ```

    ## Política d'execució de scripts

    Per defecte, Windows Server no permet executar scripts `.ps1`. Cal canviar la política:

    ```powershell
    # Veure la política actual
    Get-ExecutionPolicy

    # Permetre scripts signats localment (recomanat per a entorns de producció)
    Set-ExecutionPolicy RemoteSigned

    # Permetre tots els scripts (laboratori, mai en producció)
    Set-ExecutionPolicy Unrestricted
    ```

    !!! warning "Mai usis `Set-ExecutionPolicy Unrestricted` en un servidor de producció. Permet executar qualsevol script, incloent els maliciosos."

    ??? question "Auto-avaluació"

        **1.** Quina és la convenció de nomenclatura dels cmdlets de PowerShell?

        ??? success "Resposta"
            La convenció és **Verb-Nom** (en anglès). El verb indica l'acció (`Get`, `Set`, `New`, `Remove`...) i el nom indica sobre quin element s'actua (`Service`, `ADUser`, `NetIPAddress`...). Exemples: `Get-Service`, `New-ADUser`, `Set-NetIPAddress`.

        **2.** Quina diferència hi ha entre `Get-Process | Select-Object Name` i `Get-Process | Select-Object Name -First 5`?

        ??? success "Resposta"
            La primera mostra el nom de **tots** els processos. La segona afegeix `-First 5` per mostrar només els **5 primers** resultats. `Select-Object` pot filtrar propietats (columnes) i limitar el nombre de resultats.

        **3.** Per quin motiu cal executar `Set-ExecutionPolicy RemoteSigned` abans de poder executar scripts `.ps1` propis?

        ??? success "Resposta"
            Per seguretat, Windows Server bloqueja l'execució de scripts per defecte (`Restricted`). `RemoteSigned` permet executar scripts locals sense signar i scripts descarregats d'internet només si estan signats digitalment. Sense canviar aquesta política, qualsevol intent d'executar un `.ps1` genera un error de seguretat.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.3 · Primeres ordres PowerShell

    **Objectiu**: familiaritzar-se amb els cmdlets bàsics i el pipeline de PowerShell.

    **Temps estimat**: 30 minuts

    **Prerequisit**: Windows Server 2022 configurat

    ---

    ### Part A – Descobriment

    Executa les ordres i documenta el que retornen:

    ```powershell
    Get-Command | Measure-Object        # Quants cmdlets hi ha en total?
    Get-Command -Verb "Get" | Measure-Object  # Quants cmdlets Get- hi ha?
    Get-Help Rename-Computer -Examples  # Mostra exemples de Rename-Computer
    ```

    ### Part B – Serveis i processos

    1. Llista els serveis **aturats** del servidor
    2. Mostra els 5 processos que usen més memòria (WorkingSet)
    3. Exporta la llista de serveis en execució a `C:\Informes\serveis-actius.csv`

    ```powershell
    # Crea primer la carpeta si no existeix
    New-Item -ItemType Directory -Path "C:\Informes" -Force
    ```

    ### Part C – Pipeline i filtres

    Escriu una sola línia de PowerShell per a cada tasca:

    1. Mostra el nom i l'estat de tots els serveis que **comencin per "Win"**
    2. Compta quants processos hi ha en execució en total
    3. Guarda el nom del servidor en una variable i mostra'l per pantalla

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"PowerShell para principiantes Windows Server español"`
        - `"PowerShell pipeline explained simply"`
        - `"Get-Help Get-Command Get-Member PowerShell tutorial"`
        - `"PowerShell cmdlets administracion Windows Server"`
