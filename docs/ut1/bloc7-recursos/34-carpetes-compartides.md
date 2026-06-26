---
title: Carpetes compartides al servidor
tags:
  - SMB
  - recursos compartits
  - servidor
  - UT1
---

# :material-folder-network: Carpetes compartides al servidor

!!! abstract "Concepte clau"
    **Compartir una carpeta** permet que els clients de la xarxa hi accedeixin mitjançant el protocol **SMB** (Server Message Block) usant la ruta UNC `\\servidor\recurs`. El servidor Windows gestiona qui pot accedir-hi i amb quins permisos a través de dos mecanismes superposats: permisos de compartit i permisos NTFS.

=== ":material-notebook-outline: Apunts"

    ## El protocol SMB i les rutes UNC

    **SMB** (Server Message Block) és el protocol que Windows usa per compartir carpetes, impressores i altres recursos en xarxa. Quan accedeixes a `\\SRV-WS2022\Projectes`, el teu PC envia peticions SMB al servidor.

    **Ruta UNC** (Universal Naming Convention):
    ```
    \\NomServidor\NomCompartit
    \\SRV-WS2022\Projectes
    \\10.0.2.10\Projectes      ← també funciona per IP
    ```

    ```mermaid
    graph LR
        C["💻 Client\nPC-AULA01"]
        S["🖥️ Servidor\nSRV-WS2022"]
        F["📁 C:\\Dades\\Projectes\n(carpeta física)"]

        C -->|"SMB\n\\\\SRV-WS2022\\Projectes"| S
        S --> F
    ```

    ## Crear una carpeta compartida via GUI

    **Mètode 1: Explorador de fitxers (ràpid)**

    1. Clic dret a la carpeta → **Propietats → Compartir → Comparteix...**
    2. Afegeix usuaris o grups → tria el permís (**Lectura** / **Lectura+Escriptura**)
    3. Fes clic a **Comparteix**

    **Mètode 2: Server Manager (recomanat per a producció)**

    1. **Server Manager → File and Storage Services → Shares**
    2. → **Tasks → New Share...**
    3. Selecciona **SMB Share – Quick**
    4. Tria la ubicació i el nom de la carpeta compartida
    5. Configura els permisos al pas corresponent

    ## Crear una carpeta compartida via PowerShell

    ```powershell
    # Crear directori i compartir-lo en un sol bloc
    New-Item -ItemType Directory -Path "C:\Dades\Projectes" -Force

    New-SmbShare `
        -Name "Projectes" `
        -Path "C:\Dades\Projectes" `
        -Description "Carpeta de projectes SMX" `
        -FullAccess "CIRVIANUM\Administrador" `
        -ChangeAccess "CIRVIANUM\Alumnes-SMX" `
        -ReadAccess "CIRVIANUM\Professors"

    # Verificar les carpetes compartides actuals
    Get-SmbShare

    # Detall d'una compartida concreta
    Get-SmbShare -Name "Projectes" | Format-List *

    # Veure els permisos de compartit
    Get-SmbShareAccess -Name "Projectes"
    ```

    ## Permisos de compartit (Share Permissions)

    Les carpetes compartides SMB tenen **3 nivells de permís**:

    | Permís | Permet |
    |--------|--------|
    | **Control total** | Llegir, escriure, modificar permisos, eliminar |
    | **Canvi** | Llegir, crear, modificar i eliminar fitxers |
    | **Lectura** | Veure el contingut i executar programes |

    !!! warning "Els permisos de compartit **s'acumulen per grup** però la combinació final entre permisos de compartit i NTFS aplica la **restricció més severa**. Veure C35 per als detalls de la combinació."

    ## Carpetes compartides ocultes

    Afegint `$` al final del nom, la carpeta no apareix quan navegues per `\\servidor` però hi pots accedir sabent el nom:

    ```powershell
    # Crear una compartida oculta (no apareix a la navegació)
    New-SmbShare -Name "Administracio$" -Path "C:\Dades\Admin" -FullAccess "CIRVIANUM\Administrador"

    # Accés directe: \\SRV-WS2022\Administracio$
    ```

    **Compartides administratives per defecte** (creades automàticament per Windows):

    | Nom | Destí | Funció |
    |-----|-------|--------|
    | `C$` | `C:\` | Accés remot a tota la unitat C: |
    | `ADMIN$` | `%SystemRoot%` | Gestió remota del sistema |
    | `IPC$` | — | Comunicació entre processos |

    ## Eliminar una carpeta compartida

    ```powershell
    # Deixa de compartir (no esborra la carpeta del disc)
    Remove-SmbShare -Name "Projectes" -Force

    # Via línia d'ordres clàssica
    net share Projectes /delete
    ```

    ## Verificació via línia d'ordres

    ```cmd
    :: Llista totes les carpetes compartides del servidor
    net share

    :: Accedeix directament des del client
    dir \\SRV-WS2022\Projectes
    ```

    ??? question "Auto-avaluació"

        **1.** Quin protocol usa Windows per accedir a carpetes compartides en xarxa? Quin port TCP usa?

        ??? success "Resposta"
            Windows usa el protocol **SMB** (Server Message Block) per compartir carpetes i impressores. La versió moderna (SMB3) usa el port **TCP 445**. El port 139 (NetBIOS) era usat per SMB1 (obsolet i insegur). Pots verificar la connectivitat amb `Test-NetConnection SRV-WS2022 -Port 445`.

        **2.** Per quin motiu la carpeta compartida `Administracio$` no apareix quan un usuari navega per `\\SRV-WS2022` des de l'Explorador de fitxers?

        ??? success "Resposta"
            El signe `$` al final del nom indica que és una **compartida oculta**. Windows no la mostra a la llista de compartides quan navegues per `\\servidor`, però hi pots accedir directament escrivint la ruta completa `\\SRV-WS2022\Administracio$` a la barra d'adreces. És útil per a compartides administratives que no han de ser visibles als usuaris generals.

        **3.** Un usuari del grup `Professors` intenta crear un fitxer a `\\SRV-WS2022\Projectes` però rep "Accés denegat". El grup `Professors` té permís de **Lectura** al compartit. Pot tenir el problema causa en els permisos de compartit o en els permisos NTFS?

        ??? success "Resposta"
            **Pot tenir la causa en ambdós**. El permís de compartit `Lectura` no permet crear fitxers (només `Canvi` o `Control total` ho permeten). Però fins i tot si s'amplia el permís de compartit, el permís **NTFS** de la carpeta física `C:\Dades\Projectes` podria seguir negant l'escriptura. El resultat final és la **restricció més severa** dels dos sistemes. Cal revisar tant els permisos de compartit com els permisos NTFS.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 7.1 · Crea les carpetes compartides del laboratori

    **Objectiu**: configurar l'estructura de carpetes compartides del Projecte 4.

    **Temps estimat**: 30 minuts

    **Prerequisit**: Grups d'AD creats (Activitat 5.2)

    ---

    ### Estructura a crear

    | Ruta física | Nom compartit | Accés |
    |-------------|--------------|-------|
    | `C:\Dades\Projectes` | `Projectes` | Alumnes-SMX: Canvi |
    | `C:\Dades\Professors` | `Professors$` | Professors: Control total (oculta) |
    | `C:\Dades\Public` | `Public` | Tothom: Lectura |

    ### Part A – Crea l'estructura

    ```powershell
    # Crea els directoris
    "C:\Dades\Projectes","C:\Dades\Professors","C:\Dades\Public" |
        ForEach-Object { New-Item -ItemType Directory -Path $_ -Force }

    # Comparteix-los (adapta els noms de grup si és necessari)
    New-SmbShare -Name "Projectes" -Path "C:\Dades\Projectes" `
        -FullAccess "CIRVIANUM\Administrador" `
        -ChangeAccess "CIRVIANUM\Comercial","CIRVIANUM\TIC","CIRVIANUM\RRHH"

    New-SmbShare -Name "Professors$" -Path "C:\Dades\Professors" `
        -FullAccess "CIRVIANUM\Professors"

    New-SmbShare -Name "Public" -Path "C:\Dades\Public" `
        -ReadAccess "Tothom"
    ```

    ### Part B – Verifica des del client

    Des de `PC-AULA01` amb sessió de `maria.puig`:
    ```cmd
    dir \\SRV-WS2022\Projectes
    dir \\SRV-WS2022\Public
    dir \\SRV-WS2022\       ← apareix Professors$ a la llista?
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Windows Server 2022 shared folder SMB create PowerShell"`
        - `"New-SmbShare PowerShell tutorial"`
        - `"compartir carpeta Windows Server File and Storage Services"`
        - `"SMB share permissions vs NTFS permissions Windows"`
