---
title: Manteniment del sistema
tags:
  - administració
  - manteniment
  - UT1
---

# :material-tools: Manteniment del sistema

!!! abstract "Concepte clau"
    El manteniment preventiu d'un servidor inclou netejar espai en disc, verificar la integritat del sistema de fitxers, aplicar actualitzacions i crear punts de restauració. Un servidor que no es manté acumula problemes que acaben causant caigudes imprevisibles.

=== ":material-notebook-outline: Apunts"

    ## Per què fer manteniment?

    ```mermaid
    graph LR
        M[🔧 Manteniment regular]
        M --> A[Neteja de disc\n→ espai alliberat]
        M --> B[Verificació FS\n→ errors corregits]
        M --> C[Actualitzacions\n→ vulnerabilitats tancades]
        M --> D[Punts de restauració\n→ recuperació ràpida]
    ```

    ## 1. Neteja de disc (`cleanmgr`)

    La neteja de disc elimina fitxers temporals, arxius de registre antics, miniatures en caché i fitxers d'actualitzacions ja instal·lades.

    **Via GUI**: Cerca `Neteja de disc` → Selecciona la unitat `C:\` → Tria les categories a eliminar → **Neteja fitxers del sistema** per incloure fitxers de Windows Update antics.

    **Via PowerShell / cmd**:
    ```powershell
    # Neteja silenciosa (sense diàleg)
    cleanmgr /sagerun:1 /d C
    ```

    Espai habitual recuperat: entre 2 i 15 GB en servidors que porten mesos sense netejar.

    ## 2. Verificació del sistema de fitxers (`chkdsk`)

    Detecta i corregeix errors al sistema de fitxers NTFS: clústers defectuosos, errors d'índex, fitxers orfes.

    ```cmd
    # Verificació sense reparació (pot executar-se en línia)
    chkdsk C: /scan

    # Verificació completa amb reparació (requereix reinici per a C:\)
    chkdsk C: /f /r
    ```

    !!! warning "L'opció `/f /r` sobre `C:\` no s'executa immediatament: s'agenda per al pròxim reinici perquè el sistema no pot comprovar la partició activa mentre s'usa."

    **Via PowerShell**:
    ```powershell
    Repair-Volume -DriveLetter C -Scan
    Repair-Volume -DriveLetter C -OfflineScanAndFix
    ```

    ## 3. Verificador de fitxers del sistema (SFC)

    `sfc /scannow` verifica i repara els fitxers del sistema operatiu que s'hagin corromput o modificat:

    ```cmd
    sfc /scannow
    ```

    Si SFC troba problemes i no els pot reparar, usa DISM per reparar la imatge del SO:

    ```cmd
    DISM /Online /Cleanup-Image /RestoreHealth
    ```

    ## 4. Punts de restauració

    Els punts de restauració permeten tornar el servidor a un estat anterior si una actualització o canvi de configuració trenca alguna cosa.

    ```powershell
    # Crear un punt de restauració manual
    Checkpoint-Computer -Description "Pre-instal·lació AD DS" -RestorePointType "MODIFY_SETTINGS"

    # Llistar punts de restauració existents
    Get-ComputerRestorePoint
    ```

    !!! info "A VirtualBox, les **instantànies** (snapshots) cobreixen la mateixa funció que els punts de restauració però de manera més completa (inclouen RAM i disc sencer). Al laboratori, usa les instantànies de VirtualBox en lloc dels punts de restauració de Windows."

    ## 5. Actualitzacions de Windows

    ```powershell
    # Requereix el mòdul PSWindowsUpdate (instal·la'l una vegada)
    Install-Module -Name PSWindowsUpdate -Force

    # Cerca actualitzacions disponibles
    Get-WindowsUpdate

    # Instal·la totes les actualitzacions crítiques
    Install-WindowsUpdate -Category "Critical Updates" -AcceptAll -AutoReboot
    ```

    ### Configuració de Windows Update via Group Policy

    En entorns de domini, les actualitzacions es gestionen centralment via GPO per evitar que els servidors es reiniciïn en horari de feina.

    ## Calendari de manteniment recomanat

    | Freqüència | Tasca |
    |-----------|-------|
    | **Diàriament** | Revisar el Visor d'Esdeveniments (errors nous) |
    | **Setmanalment** | Comprovar espai en disc; revisar el rendiment |
    | **Mensualment** | Aplicar actualitzacions; netejar disc; verificar còpies de seguretat |
    | **Trimestralment** | `chkdsk` i `sfc /scannow`; revisar polítiques de seguretat |
    | **Anualment** | Revisar maquinari; planificar renovació si >5 anys |

    ??? question "Auto-avaluació"

        **1.** Per quin motiu `chkdsk C: /f /r` no s'executa immediatament sinó en el pròxim reinici?

        ??? success "Resposta"
            La partició `C:\` és la partició del sistema activa. Windows no pot comprovar ni reparar una partició que s'està usant en aquell moment (els fitxers estan oberts i el SO els modifica constantment). La verificació s'agenda per al pròxim reinici, quan el sistema es carrega en una fase pre-Windows on la partició C:\ encara no està muntada per l'SO.

        **2.** Quina diferència hi ha entre `sfc /scannow` i `DISM /Online /Cleanup-Image /RestoreHealth`?

        ??? success "Resposta"
            `sfc /scannow` usa fitxers de la caché local de Windows per reparar fitxers corruptes del sistema. `DISM /Online /Cleanup-Image /RestoreHealth` connecta a Windows Update per descarregar una còpia neta dels fitxers i reparar la imatge del sistema operatiu, cosa que funciona fins i tot quan la caché local de SFC també està danyada.

        **3.** En quin cas preferiràs usar una instantània de VirtualBox en lloc d'un punt de restauració de Windows?

        ??? success "Resposta"
            Les **instantànies de VirtualBox** capturen l'estat complet de la màquina virtual (disc + RAM + configuració de la MV). Els **punts de restauració de Windows** només cobreixen fitxers del sistema i el registre, no la configuració de VirtualBox ni l'estat de la RAM. Per als laboratoris, les instantànies de VirtualBox són més completes i fiables.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.6 · Manteniment preventiu del servidor

    **Objectiu**: aplicar les tasques de manteniment bàsiques al servidor del laboratori.

    **Temps estimat**: 30 minuts

    ---

    ### Checklist de manteniment

    Completa cada tasca i documenta el resultat:

    - [ ] **Espai en disc** abans: ___ GB lliures a C:\
    - [ ] Executa **Neteja de disc** i documenta quant espai has alliberat: ___ MB/GB
    - [ ] **Espai en disc** després: ___ GB lliures a C:\
    - [ ] Executa `sfc /scannow`. Resultat: cap error / errors detectats / errors reparats
    - [ ] Crea un punt de restauració amb descripció: "Post-configuració inicial - [data]"
    - [ ] Verifica que el punt de restauració existeix amb `Get-ComputerRestorePoint`
    - [ ] Fes una **instantània** de VirtualBox: "SRV-WS2022 - Manteniment completat"

    ### Documentació

    Inclou captures de pantalla de:
    1. L'eina de Neteja de disc mostrant el resultat
    2. El resultat de `sfc /scannow` a la consola
    3. El resultat de `Get-ComputerRestorePoint`

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Windows Server 2022 maintenance tasks best practices"`
        - `"sfc scannow DISM Windows Server reparar sistema"`
        - `"chkdsk Windows Server schedule boot"`
        - `"PSWindowsUpdate PowerShell Windows Update"`
