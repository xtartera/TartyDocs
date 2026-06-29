---
title: Carpetes compartides i perfils mòbils Windows
tags:
  - ut4
  - active-directory
  - perfils
  - samba
---

# :material-folder-home: Carpetes compartides i perfils mòbils Windows

!!! abstract "Concepte clau"
    Els **perfils mòbils** de Windows AD permeten que un usuari conservi el seu escriptori, documents i configuració en qualsevol equip del domini. El perfil es desa en una **carpeta compartida al servidor** i es sincronitza a cada inici i tancament de sessió.

=== ":material-notebook-outline: Apunts"

    ## Arquitectura dels perfils mòbils Windows

    ```mermaid
    graph LR
        DC["DC (WSRV201)"]
        DC -->|"\\WSRV201\Perfils$\director201"| SHARE["Recurs compartit\n(SMB, permisos NTFS)"]
        CLI1["Client W11 #1"] -->|"Carrega perfil\nen inici sessió"| SHARE
        CLI2["Client W11 #2"] -->|"Carrega perfil\nen inici sessió"| SHARE
    ```

    ## Pas 1 – Crear la carpeta compartida al servidor

    ```powershell
    # Crea el directori per als perfils
    New-Item -Path "C:\Perfils" -ItemType Directory

    # Comparteix el directori (amb $ = recurs ocult)
    New-SmbShare -Name "Perfils$" `
        -Path "C:\Perfils" `
        -FullAccess "Everyone"

    # Assigna permisos NTFS (seguretat)
    $acl = Get-Acl "C:\Perfils"
    # Elimina herència
    $acl.SetAccessRuleProtection($true, $false)
    # Afegeix SYSTEM i Administrators amb control total
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule("SYSTEM","FullControl","ContainerInherit,ObjectInherit","None","Allow")
    $acl.AddAccessRule($rule)
    $rule2 = New-Object System.Security.AccessControl.FileSystemAccessRule("Administrators","FullControl","ContainerInherit,ObjectInherit","None","Allow")
    $acl.AddAccessRule($rule2)
    # Afegeix Users: Create folders/Append data a la carpeta pare
    $rule3 = New-Object System.Security.AccessControl.FileSystemAccessRule("Domain Users","CreateDirectories","None","None","Allow")
    $acl.AddAccessRule($rule3)
    Set-Acl "C:\Perfils" $acl
    ```

    ## Pas 2 – Configurar la ruta del perfil a ADUC

    ```powershell
    # Assigna la ruta de perfil mòbil a l'usuari
    Set-ADUser -Identity "director201" `
        -ProfilePath "\\WSRV201\Perfils$\director201"

    # Verifica
    Get-ADUser -Identity "director201" -Properties ProfilePath | Select-Object Name, ProfilePath
    ```

    Des de GUI (ADUC):
    1. Doble clic a l'usuari → **Profile** tab
    2. **Profile path**: `\\WSRV201\Perfils$\%username%`

    ## Carpetes personals (Home Folder)

    A més del perfil mòbil, es pot assignar una **carpeta personal** (Home Folder / unitat de xarxa):

    ```powershell
    # Crea la carpeta home al servidor
    New-Item -Path "C:\Homes\director201" -ItemType Directory

    # Comparteix
    New-SmbShare -Name "Homes$" -Path "C:\Homes" -FullAccess "Everyone"

    # Assigna la Home Folder i connecta-la com a H:
    Set-ADUser -Identity "director201" `
        -HomeDirectory "\\WSRV201\Homes$\director201" `
        -HomeDrive "H:"
    ```

    Quan l'usuari inicia sessió, Windows munta automàticament la unitat `H:`.

    ## Permisos NTFS recomanats per a perfils

    | Carpeta | Usuari/Grup | Permisos |
    |---------|-------------|---------|
    | `C:\Perfils` (pare) | SYSTEM | Control total |
    | `C:\Perfils` (pare) | Administrators | Control total |
    | `C:\Perfils` (pare) | Domain Users | Crear subcarpetes |
    | `C:\Perfils\director201` | director201 | Control total (auto) |

    Windows crea automàticament la subcarpeta de l'usuari amb els permisos adequats quan l'usuari inicia sessió per primera vegada.

    !!! warning "Perfils mòbils i rendiment de xarxa"
        Cada vegada que l'usuari inicia o tanca sessió, Windows sincronitza tot el perfil (incloent `AppData`). Si el perfil és gran (>500 MB), la sincronització pot ser molt lenta. Considera combinar perfils mòbils amb **Folder Redirection** (GPO) per moure `Desktop` i `Documents` a la xarxa sense sincronitzar tot el perfil.

    !!! tip "Sufix .V6"
        Windows 11 afegeix automàticament el sufix `.V6` a les carpetes de perfil per diferenciar-les de versions anteriors (`.V2` per a Vista, `.V5` per a W10). La carpeta real serà `\\WSRV201\Perfils$\director201.V6`. Quan configures la ruta a ADUC, no hi posis el sufix; Windows l'afegeix sol.

    ??? question "Auto-avaluació"
        **1.** Per quin motiu la carpeta compartida de perfils s'anomena `Perfils$` (amb el símbol `$`)?

        ??? success "Resposta"
            El **`$`** al final del nom fa que el recurs compartit sigui **ocult**: no apareixerà a "Xarxa" o a `\\servidor\` quan un usuari navega pels recursos de xarxa. Continua sent accessible si es coneix la ruta exacta (`\\WSRV201\Perfils$`). S'usa per a recursos d'administració que no han de ser visibles a l'explorador.

        **2.** Quin és el sufix que Windows 11 afegeix automàticament a les carpetes de perfil mòbil?

        ??? success "Resposta"
            **.V6** (de "version 6", corresponent a Windows 10/11). Windows afegeix el sufix automàticament per evitar conflictes entre versions: si un usuari alternava entre Windows 7 (perfil sense sufix o `.V2`) i Windows 10/11 (`.V6`), els perfils no es barrejarien i cada versió del SO tindria el seu propi perfil.

        **3.** Quina diferència hi ha entre un perfil mòbil i una carpeta personal (Home Folder)?

        ??? success "Resposta"
            El **perfil mòbil** sincronitza tot l'entorn de l'usuari (escriptori, `AppData`, configuració de les aplicacions) entre tots els equips del domini. La **carpeta personal** (Home Folder) és simplement una unitat de xarxa (`H:`) que apunta a un directori al servidor, per desar fitxers de treball. El perfil mòbil és l'equivalent a portar tot l'escriptori a la motxilla; la Home Folder és com tenir un arxivador compartit al servidor.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.10 · Perfils mòbils Windows

    **Objectiu**: configurar perfils mòbils per als usuaris del domini i verificar la sincronització.
    **Temps estimat**: 35 minuts

    ---

    ### Pas 1 – Crea i comparteix la carpeta de perfils

    ```powershell
    New-Item -Path "C:\Perfils" -ItemType Directory
    New-SmbShare -Name "Perfils$" -Path "C:\Perfils" -FullAccess "Everyone"
    ```

    ### Pas 2 – Assigna la ruta de perfil als usuaris

    ```powershell
    $users = @("director201", "tecnic203")
    foreach ($u in $users) {
        Set-ADUser -Identity $u -ProfilePath "\\WSRV201\Perfils$\$u"
    }
    ```

    ### Pas 3 – Verifica als clients

    Inicia sessió com a `director201` al client Windows.

    - Comprova: s'ha creat `C:\Perfils\director201.V6` al servidor?
    - Crea un fitxer a l'escriptori → tanca sessió → inicia sessió en un altre equip → el fitxer hi és?

    ### Pas 4 – Documenta

    Omple la taula:

    | Usuari | Ruta de perfil | Carpeta creada al servidor | Sincronització OK? |
    |--------|---------------|--------------------------|-------------------|
    | director201 | | | |
    | tecnic203 | | | |

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Windows Server roaming profiles setup Active Directory"`
        - `"Set-ADUser ProfilePath PowerShell"`
        - `"Windows 11 roaming profile V6 suffix"`
