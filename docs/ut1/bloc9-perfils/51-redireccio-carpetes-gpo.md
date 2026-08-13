---
title: Redirecció de carpetes via GPO
tags:
  - GPO
  - redirecció
  - carpetes
  - UT1
---

# :material-folder-arrow-right: Redirecció de carpetes via GPO

!!! abstract "Concepte clau"
    La **redirecció de carpetes** (Folder Redirection) fa que les carpetes especials de l'usuari (`Documents`, `Escriptori`, `AppData\Roaming`) apuntin a una ruta del servidor en lloc del perfil local. Combinada amb els perfils mòbils, redueix dràsticament la mida del perfil i fa les dades de l'usuari **sempre accessibles des de qualsevol PC**, fins i tot si el perfil mòbil falla.

=== ":material-notebook-outline: Apunts"

    ## Perfil mòbil vs Redirecció de carpetes

    | Característica | Perfil mòbil | Redirecció de carpetes |
    |---------------|-------------|----------------------|
    | On es desen les dades | Dins del perfil (copiat al servidor) | Directament al servidor (no al perfil) |
    | Sincronització | En inici i tancament de sessió | Immediata (cada desar) |
    | Mida del perfil | Gran (inclou Documents, Escriptori...) | Molt petita (el perfil ja no conté les carpetes redirigides) |
    | Disponibilitat offline | Sí (còpia local caché) | Amb Offline Files activat |
    | Impacte en la xarxa | Pic en inici/tancament | Distribuït al llarg de la sessió |

    !!! tip "La combinació óptima és **perfils mòbils + redirecció de carpetes**: el perfil conté configuració (petita), i les carpetes de dades (`Documents`, `Escriptori`) van directament al servidor sense passar pel procés de sincronització del perfil."

    ## Carpetes que es poden redirigir

    | Carpeta | Ruta original | Ruta redirigida típica |
    |---------|--------------|----------------------|
    | **Documents** | `C:\Users\nom\Documents` | `\\SRV\Usuaris\nom\Documents` |
    | **Escriptori** | `C:\Users\nom\Desktop` | `\\SRV\Usuaris\nom\Desktop` |
    | **AppData (Roaming)** | `C:\Users\nom\AppData\Roaming` | `\\SRV\Usuaris\nom\AppData\Roaming` |
    | **Imatges** | `C:\Users\nom\Pictures` | `\\SRV\Usuaris\nom\Pictures` |
    | **Favorits** | `C:\Users\nom\Favorites` | `\\SRV\Usuaris\nom\Favorites` |
    | **Descàrregues** | `C:\Users\nom\Downloads` | *(no recomanat redirigir)* |

    ## Configuració via GPMC

    1. Crea o edita una GPO vinculada a `OU=Alumnes`
    2. Navega a:
       ```
       Configuració d'usuari
       └── Directrius
           └── Configuració de Windows
               └── Redirecció de carpetes
                   └── Documents  (clic dret → Propietats)
       ```
    3. **Configuració**: `Bàsica — Redirigeix les carpetes de tothom a la mateixa ubicació`
    4. **Ubicació de la carpeta de destinació**: `Crea una carpeta per a cada usuari a la ruta arrel`
    5. **Ruta arrel**: `\\SRV-WS2022\Usuaris`

    Amb aquesta configuració, Windows crea automàticament:
    ```
    \\SRV-WS2022\Usuaris\
    ├── maria.puig\
    │   └── Documents\
    ├── pere.costa\
    │   └── Documents\
    ```

    ### Pestanya "Configuració" de la redirecció

    | Opció | Recomanació |
    |-------|------------|
    | **Concedeix a l'usuari drets exclusius sobre Documents** | Activada (cada usuari accedeix únicament als seus) |
    | **Mou el contingut de Documents a la nova ubicació** | Activada (migra les dades actuals) |
    | **Aplica la directiva de redirecció a SO anteriors a Windows** | Opcional |

    ## Configuració de la carpeta compartida `Usuaris`

    Abans de configurar la GPO, cal crear i compartir la carpeta al servidor:

    ```powershell
    # Crea la carpeta arrel d'usuaris
    New-Item -ItemType Directory -Path "C:\Usuaris" -Force

    # Comparteix-la
    New-SmbShare -Name "Usuaris" -Path "C:\Usuaris" -FullAccess "Tothom"

    # Permisos NTFS (igual que la carpeta de perfils: Creator Owner + Tothom)
    $ruta = "C:\Usuaris"
    $acl = Get-Acl $ruta
    $acl.SetAccessRuleProtection($true, $false)

    $acl.AddAccessRule((New-Object System.Security.AccessControl.FileSystemAccessRule(
        "NT AUTHORITY\SYSTEM","FullControl","ContainerInherit,ObjectInherit","None","Allow")))
    $acl.AddAccessRule((New-Object System.Security.AccessControl.FileSystemAccessRule(
        "BUILTIN\Administrators","FullControl","ContainerInherit,ObjectInherit","None","Allow")))
    $acl.AddAccessRule((New-Object System.Security.AccessControl.FileSystemAccessRule(
        "CREATOR OWNER","FullControl","ContainerInherit,ObjectInherit","InheritOnly","Allow")))
    $acl.AddAccessRule((New-Object System.Security.AccessControl.FileSystemAccessRule(
        "Everyone","ReadAndExecute, CreateDirectories","None","None","Allow")))

    Set-Acl $ruta $acl
    Write-Host "✅ Carpeta Usuaris configurada"
    ```

    ## Verificació de la redirecció activa

    Desprès de `gpupdate /force` i nou inici de sessió, al client:

    ```powershell
    # Comprova on apunten les carpetes especials
    [Environment]::GetFolderPath("MyDocuments")
    [Environment]::GetFolderPath("Desktop")
    ```

    Sortida esperada si la redirecció funciona:
    ```text
    \\SRV-WS2022\Usuaris\maria.puig\Documents
    \\SRV-WS2022\Usuaris\maria.puig\Desktop
    ```

    ```cmd
    :: Verifica via cmd
    echo %USERPROFILE%
    dir "%USERPROFILE%\Documents"
    ```

    ## Errors freqüents de redirecció

    | Error | Causa | Solució |
    |-------|-------|---------|
    | La carpeta no es redirigeix | La GPO no s'aplica a l'usuari | `gpresult /r` per verificar |
    | "Accés denegat" en redirigir | Permisos insuficients a `C:\Usuaris` | Revisa NTFS i compartit |
    | El perfil carrega lent | `AppData\Roaming` redirigida sense Offline Files | No redirigeixis `AppData` si no tens Offline Files |
    | La carpeta Documents apareix buida | Els fitxers antics no s'han mogut | Activa "Mou el contingut" a la configuració de redirecció |

    ??? question "Auto-avaluació"

        **1.** Quin avantatge principal té la redirecció de la carpeta `Documents` respecte a tenir-la dins del perfil mòbil?

        ??? success "Resposta"
            La **redirecció directa** fa que els fitxers de `Documents` es llegeixin i escriguin **directament al servidor** durant la sessió, sense necessitat de copiar-los tots al PC local en iniciar sessió ni pujar-los al tancar. Amb el perfil mòbil sense redirecció, tots els `Documents` es copien al PC local en l'inici de sessió i es pugen al servidor en el tancament: si un usuari té 2 GB de documents, cada inici de sessió tarda molt. La redirecció elimina aquest pic de tràfic.

        **2.** Quins permisos NTFS s'han de configurar a la carpeta arrel `C:\Usuaris` per garantir que cada usuari accedeixi únicament a la seva subcarpeta?

        ??? success "Resposta"
            El mateix esquema que la carpeta de perfils: `SYSTEM = FullControl`, `Administrators = FullControl`, `Creator Owner = FullControl (InheritOnly)`, `Everyone = ReadAndExecute + CreateDirectories (only this folder)`. El permís `Creator Owner` amb `InheritOnly` fa que quan Windows crea la subcarpeta `maria.puig` (propietari = `maria.puig`), la carpeta hereti automàticament `FullControl` per a `maria.puig`, aïllant-la de la resta d'usuaris.

        **3.** Un usuari tenia documents a `C:\Users\pere.costa\Documents` (perfil local). Actives la redirecció de carpetes. Els documents antics apareixeran a la nova ubicació?

        ??? success "Resposta"
            **Sí, si actives l'opció "Mou el contingut de Documents a la nova ubicació"** a la configuració de la GPO de redirecció. Amb aquesta opció activada, en el primer inici de sessió, Windows mou automàticament tot el contingut de l'antiga carpeta `Documents` a la nova ruta al servidor. Si l'opció no està activada, els fitxers existents queden al PC local i la nova carpeta redirigida comença buida.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 9.6 · Configura la redirecció de la carpeta Documents

    **Objectiu**: redirigir la carpeta `Documents` dels alumnes al servidor via GPO.

    **Temps estimat**: 35 minuts

    **Prerequisit**: Carpeta `C:\Usuaris` compartida, GPO `Restriccions-Alumnes` existent

    ---

    ### Part A – Crea la carpeta compartida al servidor

    Executa l'script de configuració de `C:\Usuaris` de la secció d'Apunts.

    Verifica:
    ```powershell
    Get-SmbShare -Name "Usuaris"
    (Get-Acl "C:\Usuaris").Access | Select-Object IdentityReference, FileSystemRights
    ```

    ### Part B – Configura la GPO de redirecció

    A GPMC, edita la GPO `Restriccions-Alumnes` (o crea una GPO `Redireccio-Documents`):

    1. `Configuració d'usuari → Directrius → Configuració de Windows → Redirecció de carpetes → Documents`
    2. Configuració: **Bàsica** → `Crea una carpeta per a cada usuari`
    3. Ruta arrel: `\\SRV-WS2022\Usuaris`
    4. Opcions:
       - ✅ Concedeix a l'usuari drets exclusius
       - ✅ Mou el contingut de Documents a la nova ubicació

    ### Part C – Verifica la redirecció

    Al client:
    ```cmd
    gpupdate /force
    ```

    Tanca sessió i torna a iniciar-la com a `maria.puig`. Executa:

    ```powershell
    [Environment]::GetFolderPath("MyDocuments")
    ```

    Apunta a `\\SRV-WS2022\Usuaris\maria.puig\Documents`?

    Crea un fitxer a `Documents`, tanca sessió, i comprova al servidor que el fitxer és a `C:\Usuaris\maria.puig\Documents`.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"folder redirection GPO Windows Server 2022 configure"`
        - `"folder redirection vs roaming profiles difference"`
        - `"redirecció carpetes GPO Documents Windows Server"`
        - `"Folder Redirection Group Policy Preferences setup tutorial"`
