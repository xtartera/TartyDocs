---
title: Diagnòstic de perfils mòbils
tags:
  - perfils mòbils
  - diagnòstic
  - Visor d'esdeveniments
  - UT1
---

# :material-stethoscope: Diagnòstic de perfils mòbils

!!! abstract "Concepte clau"
    Els perfils mòbils fallen per raons molt concretes i repetitives: ruta incorrecta, permisos insuficients, sessions simultànies o perfil corrupte. Conèixer els **Event IDs clau** del canal `User Profiles` i el **flux de diagnòstic** permet resoldre el 90% dels incidents en menys de 5 minuts.

=== ":material-notebook-outline: Apunts"

    ## Flux de diagnòstic pas a pas

    ```mermaid
    graph TD
        S["❓ Problema amb el perfil mòbil"]

        S --> A["1️⃣ Mira el Visor d'esdeveniments\n(canal User Profiles)\nQuin Event ID apareix?"]

        A --> E1521["📛 Event 1521\nNo s'ha pogut accedir\na la ruta del perfil"]
        A --> E1509["📛 Event 1509\nConflicte de sessió\nsimultània"]
        A --> E1525["📛 Event 1525\nError en pujar el\nperfil al tancar sessió"]
        A --> E1500["✅ Event 1500\nPerfil carregat bé\n(el problema és altre)"]

        E1521 --> R1["Comprova:\n- Ruta de perfil a ADUC\n- Carpeta existeix al servidor\n- Permisos NTFS de C:\\Perfils"]
        E1509 --> R2["Comprova:\n- L'usuari no té altra\n  sessió oberta"]
        E1525 --> R3["Comprova:\n- Espai lliure al servidor\n- Permisos d'escriptura\n- Fitxers bloquejats"]
    ```

    ## Event IDs del canal User Profiles

    | Event ID | Tipus | Descripció | Causa habitual |
    |----------|-------|-----------|---------------|
    | **1500** | Info | Perfil mòbil carregat correctament | — |
    | **1501** | Info | S'usa el perfil local (no hi ha perfil mòbil configurat) | Normal per a usuaris sense perfil mòbil |
    | **1502** | Info | Perfil mòbil sincronitzat correctament en tancar sessió | — |
    | **1505** | Avís | S'usa un perfil temporal per a aquesta sessió | Perfil corrupte o inaccessible |
    | **1509** | Error | No s'ha pogut copiar el perfil mòbil: conflicte d'usuari | L'usuari ja té una sessió activa en un altre PC |
    | **1521** | Error | No s'ha pogut accedir a la ruta del perfil mòbil | Ruta incorrecta, carpeta inexistent o permisos insuficients |
    | **1524** | Avís | No s'ha pogut descarregar el perfil mòbil | Error xarxa en carregar |
    | **1525** | Error | Error en pujar el perfil al servidor en tancar sessió | Disc del servidor ple, permisos insuficients o fitxers bloquejats |

    ## Llegir el canal User Profiles al Visor

    **Via GUI:**

    ```
    Visor d'esdeveniments → Registres d'aplicacions i serveis
    → Microsoft → Windows → User Profile Service → Operational
    ```

    **Via PowerShell:**

    ```powershell
    # Últims 20 events del canal User Profiles (últimes 24 h)
    Get-WinEvent -FilterHashtable @{
        LogName   = 'Microsoft-Windows-User Profile Service/Operational'
        StartTime = (Get-Date).AddHours(-24)
    } -MaxEvents 20 |
        Select-Object TimeCreated, Id, LevelDisplayName, Message |
        Format-Table -Wrap

    # Filtra únicament errors i avisos
    Get-WinEvent -FilterHashtable @{
        LogName = 'Microsoft-Windows-User Profile Service/Operational'
        Level   = 2,3  # 2=Error, 3=Avís
    } -MaxEvents 10 | Select-Object TimeCreated, Id, Message
    ```

    ## Diagnòstic específic per Event ID

    ### Event 1521 — No s'ha pogut accedir a la ruta de perfil

    ```powershell
    # 1. Comprova la ruta de perfil configurada a ADUC
    Get-ADUser "maria.puig" -Properties ProfilePath | Select-Object Name, ProfilePath

    # 2. Comprova que la carpeta existeix al servidor
    Test-Path "\\SRV-WS2022\Perfils\maria.puig"
    # (Nota: la carpeta real és maria.puig.V6, però la ruta ha de ser sense .V6)

    # 3. Comprova els permisos NTFS de la carpeta arrel
    (Get-Acl "C:\Perfils").Access |
        Select-Object IdentityReference, FileSystemRights | Format-Table

    # 4. Comprova que la carpeta compartida és accessible
    Get-SmbShare -Name "Perfils"
    Test-NetConnection SRV-WS2022 -Port 445
    ```

    ### Event 1509 — Conflicte de sessió simultània

    ```powershell
    # Veure les sessions actives de l'usuari al domini
    # (al DC, com a Administrador)
    query session /server:SRV-WS2022

    # Veure les sessions de xarxa obertes al servidor de fitxers
    Get-SmbSession | Where-Object {$_.ClientUserName -like "*maria.puig*"}

    # Tancar sessions de xarxa penjades de l'usuari
    Get-SmbSession | Where-Object {$_.ClientUserName -like "*maria.puig*"} |
        Close-SmbSession -Force
    ```

    ### Event 1525 — Error en pujar el perfil

    ```powershell
    # Comprova l'espai lliure al disc del servidor
    Get-PSDrive C | Select-Object Name, Used, Free

    # Comprova la mida del perfil problemàtic
    $perfil = "C:\Perfils\maria.puig.V6"
    (Get-ChildItem $perfil -Recurse -ErrorAction SilentlyContinue |
     Measure-Object -Property Length -Sum).Sum / 1MB

    # Busca fitxers bloquejats al perfil
    openfiles /query /fo TABLE | findstr "maria"
    ```

    ## Perfil corrupte: restaurar des de còpia

    Si el perfil és corrupte (Event 1505 recurrent), el procés de recuperació és:

    ```powershell
    # 1. Copia de seguretat del perfil corrupte
    Copy-Item "C:\Perfils\maria.puig.V6" "C:\Backup\maria.puig.V6.backup" -Recurse

    # 2. Elimina el perfil corrupte (l'usuari ha d'estar desconnectat)
    Remove-Item "C:\Perfils\maria.puig.V6" -Recurse -Force

    # 3. El pròxim inici de sessió crearà un perfil nou des de zero
    # (l'usuari perdrà la configuració però no els Documents si estan redirigits)
    ```

    !!! warning "Eliminar la carpeta de perfil elimina **tota la configuració d'aplicacions** de l'usuari (AppData\\Roaming): configuració de l'Outlook, favorits del navegador, etc. Si els Documents estan redirigits, els fitxers es conserven. Informa l'usuari abans de procedir."

    ??? question "Auto-avaluació"

        **1.** Un usuari rep "S'ha carregat un perfil temporal" en iniciar sessió. Quin Event ID busques al Visor i quines causes comproves?

        ??? success "Resposta"
            Busques l'**Event 1505** (perfil temporal usat) i l'**Event 1521** (no s'ha pogut accedir a la ruta de perfil). Les causes a comprovar per ordre: (1) ruta de perfil configurada a ADUC (`Get-ADUser -Properties ProfilePath`); (2) la carpeta `maria.puig.V6` existeix al servidor (`Test-Path`); (3) els permisos NTFS de `C:\Perfils` permeten a l'usuari crear-hi carpetes; (4) la compartida `Perfils` és accessible des del client (`Test-NetConnection SRV -Port 445`).

        **2.** L'Event 1509 apareix repetidament per a `anna.valls`. Quin és el problema i com el resoleus?

        ??? success "Resposta"
            L'Event 1509 indica que `anna.valls` té **dues sessions obertes simultàniament**: el perfil mòbil ja l'ha obert un PC, i un segon PC intenta obrir-lo també. Windows només permet una sessió activa amb perfil mòbil alhora. La solució és: (1) localitzar les sessions actives amb `query session` o `Get-SmbSession`; (2) tancar la sessió antiga (penjada o oblidada) amb `Close-SmbSession -Force`; (3) indicar a l'usuari que tanqui sempre la sessió en acabar, en lloc d'apagar directament el PC.

        **3.** Elimines la carpeta de perfil `C:\Perfils\pere.costa.V6` per resoldre un perfil corrupte. Quines dades de l'usuari es perden i quines es conserven (assumint que `Documents` està redirigit)?

        ??? success "Resposta"
            **Es perden**: tota la configuració d'aplicacions (`AppData\Roaming`): signatures d'Outlook, favorits del navegador, perfils d'aplicació, configuració de l'escriptori, dreceres personalitzades. **Es conserven**: tots els fitxers de `Documents`, `Imatges` i altres carpetes redirigides al servidor via GPO de redirecció de carpetes (ja que no estan dins del perfil mòbil sinó a `C:\Usuaris\pere.costa`). Aquesta és una raó addicional per combinar perfils mòbils amb redirecció de carpetes.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 10.2 · Simula i diagnostica errors de perfil mòbil

    **Objectiu**: practicar el diagnòstic de les incidències més freqüents amb perfils mòbils.

    **Temps estimat**: 35 minuts

    **Prerequisit**: Perfils mòbils actius, Visor d'esdeveniments accessible

    ---

    ### Part A – Simula un Event 1521

    1. A ADUC, canvia la ruta de perfil de `maria.puig` a una ruta inexistent: `\\SRV-WS2022\Perfils\ruta-incorrecta\maria.puig`
    2. Al client, inicia sessió com a `maria.puig`
    3. Al Visor d'esdeveniments (canal User Profiles), localitza l'Event 1521
    4. Quin missatge exacte mostra?
    5. Restaura la ruta correcta a ADUC

    ### Part B – Simula un Event 1525

    1. Al servidor, nega temporalment permisos d'escriptura a `C:\Perfils\maria.puig.V6` per a `maria.puig`
    2. Inicia sessió com a `maria.puig`, fes algun canvi i tanca la sessió
    3. Localitza l'Event 1525 al Visor
    4. Restaura els permisos correctes

    ### Part C – Script de diagnòstic automàtic

    ```powershell
    # Script de diagnòstic de perfils — executa al servidor
    param([string]$Usuari = "maria.puig")

    Write-Host "`n=== Diagnòstic de perfil: $Usuari ===" -ForegroundColor Cyan

    $ad = Get-ADUser $Usuari -Properties ProfilePath
    Write-Host "[AD] Ruta de perfil: $($ad.ProfilePath)"

    $ruta = "C:\Perfils\$Usuari.V6"
    Write-Host "[Carpeta] Existeix $ruta : $(Test-Path $ruta)"

    if (Test-Path $ruta) {
        $mida = (Get-ChildItem $ruta -Recurse -EA SilentlyContinue |
                 Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "[Mida] $([math]::Round($mida,1)) MB"
    }

    Write-Host "`n[Events últimes 2h]:"
    Get-WinEvent -FilterHashtable @{
        LogName   = 'Microsoft-Windows-User Profile Service/Operational'
        StartTime = (Get-Date).AddHours(-2)
    } -MaxEvents 5 -EA SilentlyContinue |
        Where-Object {$_.Message -like "*$Usuari*"} |
        Select-Object TimeCreated, Id, Message | Format-Table -Wrap
    ```

    Executa'l per a `maria.puig` i documenta el resultat al dossier.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"roaming profile error 1521 1509 fix Windows Server"`
        - `"User Profile Service event log Operational Windows"`
        - `"roaming profile temporary profile fix Active Directory"`
        - `"diagnose roaming profile issues Event Viewer Windows 11"`
