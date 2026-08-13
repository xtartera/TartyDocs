---
title: Permisos NTFS a les subcarpetes de perfil
tags:
  - NTFS
  - perfils mòbils
  - seguretat
  - UT1
---

# :material-shield-account-outline: Permisos NTFS a les subcarpetes de perfil

!!! abstract "Concepte clau"
    Quan Windows crea la carpeta de perfil d'un usuari al servidor, aplica automàticament uns **permisos NTFS molt restrictius**: únicament l'usuari propietari i el SYSTEM hi tenen accés. Ni tan sols els Administradors del domini hi poden accedir per defecte. Saber com accedir i quan és legítim modificar-los és clau per a la gestió i el diagnòstic.

=== ":material-notebook-outline: Apunts"

    ## Permisos per defecte d'una subcarpeta de perfil

    Quan Windows crea `C:\Perfils\maria.puig.V6`, aplica automàticament:

    | Principal | Permisos NTFS |
    |-----------|--------------|
    | `NT AUTHORITY\SYSTEM` | Control total |
    | `CIRVIANUM\maria.puig` | Control total |
    | `BUILTIN\Administrators` | **❌ Cap accés** (per defecte) |

    !!! warning "Per defecte, els **Administradors no poden accedir** a les subcarpetes de perfil d'un usuari. Si un administrador intenta obrir `C:\Perfils\maria.puig.V6`, rep 'Accés denegat'. Això és **comportament intencionat** per protegir la privacitat dels perfils."

    ## Com accedir a una subcarpeta de perfil com a Administrador

    **Opció 1: Prendre la propietat (Take Ownership)**

    ```cmd
    :: Pren la propietat de la carpeta
    takeown /f "C:\Perfils\maria.puig.V6" /r /d s

    :: Afegeix permisos d'Administrador
    icacls "C:\Perfils\maria.puig.V6" /grant "BUILTIN\Administrators:(OI)(CI)F" /t
    ```

    !!! danger "Prendre la propietat d'una carpeta de perfil **trenca la sincronització** del perfil mòbil. Fes-ho únicament per diagnòstic o emergència, i restaura els permisos originals immediatament després."

    **Opció 2: Via GPMC — afegir Administrators als permisos de perfil (recomanat)**

    Via GPO es pot configurar que Windows afegeixi els Administradors a les subcarpetes de perfil en el moment de la seva creació:

    ```
    Configuració d'equip
    └── Plantilles administratives → Sistema → Perfils d'usuari
        → Afegeix el grup d'Administradors a les carpetes de perfil d'usuari: Activada
    ```

    Amb aquesta GPO activa, Windows crea les subcarpetes de perfil amb `Administrators = Control total` des del primer moment.

    ## Verificació dels permisos d'una subcarpeta

    ```powershell
    # Veure els permisos de la carpeta de perfil de maria.puig
    # (Executa com a SYSTEM o amb privilegis elevats)
    $ruta = "C:\Perfils\maria.puig.V6"

    try {
        (Get-Acl $ruta).Access |
            Select-Object IdentityReference, FileSystemRights, IsInherited |
            Format-Table -AutoSize
    } catch {
        Write-Warning "Accés denegat a: $ruta (comportament normal sense la GPO d'Administradors)"
    }
    ```

    ## Quota de disc per als perfils

    Per evitar que els perfils mòbils ocupin tot l'espai del servidor, es pot aplicar una **quota de disc** per usuari:

    **Via File Server Resource Manager (FSRM):**

    ```powershell
    # Instal·la FSRM si no és instal·lat
    Install-WindowsFeature FS-Resource-Manager -IncludeManagementTools

    # Crea una plantilla de quota de 500 MB per carpeta
    New-FsrmQuotaTemplate `
        -Name "Quota-Perfils-500MB" `
        -Size 500MB `
        -SoftLimit $false  # Hard limit: impedeix superar la quota

    # Aplica la quota a la carpeta de perfils
    New-FsrmQuota `
        -Path "C:\Perfils" `
        -Template "Quota-Perfils-500MB" `
        -AutoQuota  # Aplica la quota a cada subcarpeta automàticament
    ```

    **Via Propietats del disc → Quota:**

    La gestió de quotes bàsica (sense FSRM) es pot fer des de les **Propietats de la unitat C: → Quota**.

    ## Bones pràctiques de gestió de perfils

    | Pràctica | Raó |
    |---------|-----|
    | Activa la GPO "Afegeix Administrators a carpetes de perfil" | Permet diagnòstic sense `takeown` destructiu |
    | Aplica quotes de disc als perfils (500 MB–1 GB) | Evita que un usuari ompli el disc del servidor |
    | Excloure `AppData\Local` de la sincronització | Redueix la mida del perfil i millora el rendiment |
    | Monitoritza la mida dels perfils mensualment | Detecta creixements anòmals a temps |
    | Fes còpies de seguretat de la carpeta `C:\Perfils` | Els perfils contenen dades importants dels usuaris |

    ??? question "Auto-avaluació"

        **1.** Un administrador rep el missatge "Accés denegat" en intentar obrir `C:\Perfils\pere.costa.V6`. Quin és el motiu? És un error o comportament normal?

        ??? success "Resposta"
            És **comportament normal i intencionat**. Per defecte, Windows aplica permisos molt restrictius a les carpetes de perfil: únicament el propietari (`pere.costa`) i `SYSTEM` hi tenen accés. Fins i tot `Administrators` en queda exclòs per protegir la privacitat de l'usuari. Per permetre l'accés administratiu, cal activar la GPO `Configuració d'equip → Plantilles administratives → Sistema → Perfils d'usuari → Afegeix el grup d'Administradors a les carpetes de perfil d'usuari`.

        **2.** Quin risc comporta usar `takeown` per accedir a la carpeta de perfil d'un usuari?

        ??? success "Resposta"
            `takeown` canvia el **propietari** de la carpeta de `maria.puig` a `Administrators`. Quan Windows intenta sincronitzar el perfil en el pròxim tancament de sessió, detecta que el propietari ha canviat i pot **no sincronitzar el perfil correctament** o generar conflictes de permisos. A més, `takeown + icacls /grant Administrators:F` afegeix permisos d'administrador que trenquen l'aïllament entre perfils. Usa `takeown` únicament en emergències i restaura immediatament els permisos originals.

        **3.** Per quin motiu és recomanable aplicar una quota de disc als perfils mòbils?

        ??? success "Resposta"
            Sense quota, un usuari podria desar fitxers grans (vídeos, ISO) als seus `Documents` o `Escriptori`, que formen part del perfil mòbil i s'emmagatzemen al servidor. Un sol usuari podria omplir el disc del servidor i impedir que tots els altres usuaris iniciïn sessió (no tindrien espai per sincronitzar el perfil). La quota limita l'espai màxim de cada perfil (ex: 500 MB) i evita aquest risc.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 9.5 · Configura permisos i quota de perfils

    **Objectiu**: activar l'accés d'administrador als perfils i configurar una quota bàsica.

    **Temps estimat**: 25 minuts

    **Prerequisit**: Perfils mòbils actius (Activitat 9.3), carpetes `.V6` existents al servidor

    ---

    ### Part A – Activa la GPO d'Administrators als perfils

    Crea o edita una GPO vinculada a `OU=Equips-Aula` (Configuració d'equip):

    ```
    Configuració d'equip → Plantilles administratives → Sistema → Perfils d'usuari
    → Afegeix el grup d'Administradors a les carpetes de perfil d'usuari: Activada
    ```

    Aplica: `gpupdate /force /boot` al client, reinicia i inicia sessió com a `maria.puig` (per crear la carpeta amb els nous permisos).

    Comprova al servidor:
    ```powershell
    (Get-Acl "C:\Perfils\maria.puig.V6").Access |
        Select-Object IdentityReference, FileSystemRights
    ```

    Ara apareix `BUILTIN\Administrators`?

    ### Part B – Verifica la mida dels perfils

    ```powershell
    Get-ChildItem "C:\Perfils" | ForEach-Object {
        $mida = (Get-ChildItem $_.FullName -Recurse -ErrorAction SilentlyContinue |
                 Measure-Object -Property Length -Sum).Sum
        [PSCustomObject]@{Perfil=$_.Name; MidaMB=[math]::Round($mida/1MB,2)}
    } | Sort-Object MidaMB -Descending | Format-Table -AutoSize
    ```

    Quin perfil ocupa més espai?

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"roaming profile folder permissions NTFS Administrators access"`
        - `"GPO add administrators to roaming profile folders"`
        - `"takeown icacls user profile folder Windows Server"`
        - `"FSRM quota disk roaming profiles Windows Server 2022"`
