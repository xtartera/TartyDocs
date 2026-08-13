---
title: Carpeta compartida per a perfils mòbils
tags:
  - perfils mòbils
  - SMB
  - permisos
  - UT1
---

# :material-folder-account: Carpeta compartida per a perfils mòbils

!!! abstract "Concepte clau"
    Abans de configurar perfils mòbils cal crear una **carpeta compartida al servidor** on s'emmagatzemaran els perfils de tots els usuaris. Els permisos d'aquesta carpeta han de seguir un esquema molt específic: `Everyone = Control total` al compartit, i permisos NTFS restringits perquè cada usuari accedeixi **únicament** a la seva subcarpeta.

=== ":material-notebook-outline: Apunts"

    ## Estructura de la carpeta de perfils

    ```
    C:\Perfils\                     ← Carpeta arrel (compartida com "Perfils")
    ├── maria.puig.V6\              ← Perfil de maria.puig (creat automàticament per Windows)
    │   ├── Desktop\
    │   ├── Documents\
    │   ├── AppData\Roaming\
    │   └── NTUSER.DAT
    ├── pere.costa.V6\              ← Perfil de pere.costa
    └── anna.valls.V6\              ← Perfil de anna.valls
    ```

    El sufix `.V6` l'afegeix Windows automàticament per a Windows 10/11. No cal crear les subcarpetes manualment: Windows les crea en el primer inici de sessió de l'usuari.

    ## Crear la carpeta compartida (servidor)

    ```powershell
    # 1. Crea la carpeta arrel de perfils
    New-Item -ItemType Directory -Path "C:\Perfils" -Force

    # 2. Comparteix la carpeta
    New-SmbShare `
        -Name "Perfils" `
        -Path "C:\Perfils" `
        -FullAccess "Tothom"  # Control total al compartit per a tothom

    # 3. Verifica la compartida
    Get-SmbShare -Name "Perfils"
    ```

    !!! warning "El permís de compartit ha de ser `Control total` per a `Tothom` (o `Everyone`). L'accés real es controla exclusivament via **permisos NTFS** a les subcarpetes individuals. Si el compartit és més restrictiu, Windows no podrà crear ni accedir als perfils."

    ## Configuració NTFS de la carpeta arrel

    Els permisos NTFS de `C:\Perfils` han de seguir un esquema específic que permet a Windows crear les subcarpetes de perfil automàticament:

    | Principal | Permisos NTFS | S'aplica a |
    |-----------|--------------|-----------|
    | `SYSTEM` | Control total | Aquesta carpeta, subcarpetes i fitxers |
    | `Administrators` | Control total | Aquesta carpeta, subcarpetes i fitxers |
    | `Creator Owner` | Control total | Únicament subcarpetes i fitxers (no a la carpeta arrel) |
    | `Tothom` (Everyone) | Llegir i executar + Crear carpetes | Únicament aquesta carpeta |

    ```powershell
    # Configura els permisos NTFS de la carpeta arrel de perfils
    $ruta = "C:\Perfils"
    $acl = Get-Acl $ruta

    # Elimina l'herència i comença des de zero
    $acl.SetAccessRuleProtection($true, $false)

    # SYSTEM: Control total (carpeta + fills)
    $acl.AddAccessRule((New-Object System.Security.AccessControl.FileSystemAccessRule(
        "NT AUTHORITY\SYSTEM","FullControl","ContainerInherit,ObjectInherit","None","Allow")))

    # Administrators: Control total (carpeta + fills)
    $acl.AddAccessRule((New-Object System.Security.AccessControl.FileSystemAccessRule(
        "BUILTIN\Administrators","FullControl","ContainerInherit,ObjectInherit","None","Allow")))

    # Creator Owner: Control total (únicament fills, no la carpeta arrel)
    $acl.AddAccessRule((New-Object System.Security.AccessControl.FileSystemAccessRule(
        "CREATOR OWNER","FullControl","ContainerInherit,ObjectInherit","InheritOnly","Allow")))

    # Tothom: Llegir + Crear carpetes (únicament la carpeta arrel)
    $acl.AddAccessRule((New-Object System.Security.AccessControl.FileSystemAccessRule(
        "Everyone","ReadAndExecute, CreateDirectories","None","None","Allow")))

    Set-Acl $ruta $acl
    Write-Host "✅ Permisos NTFS configurats a C:\Perfils"
    ```

    ### Per quin motiu `Creator Owner` amb `InheritOnly`?

    Quan un usuari inicia sessió per primera vegada i Windows crea la seva subcarpeta de perfil (`maria.puig.V6`), el propietari de la nova carpeta és l'usuari. El permís `Creator Owner` (amb `InheritOnly`) fa que la carpeta hereti `Control total` **per al seu propietari**, de manera que cada usuari té control total de la seva pròpia carpeta de perfil, sense que cap altre usuari hi pugui accedir.

    ## Verificació

    ```powershell
    # Verifica els permisos NTFS resultants
    (Get-Acl "C:\Perfils").Access |
        Select-Object IdentityReference, FileSystemRights, InheritanceFlags, PropagationFlags |
        Format-Table -AutoSize

    # Comprova la compartida
    Get-SmbShareAccess -Name "Perfils"
    ```

    ??? question "Auto-avaluació"

        **1.** Per quin motiu el permís de compartit de la carpeta `Perfils` ha de ser `Control total` per a `Tothom`, si volem que cada usuari accedeixi únicament al seu propi perfil?

        ??? success "Resposta"
            El permís de compartit és el **primer filtre** que Windows aplica. Si el compartit és `Lectura` o `Canvi`, Windows no podrà crear les subcarpetes de perfil ni escriure els fitxers en el primer inici de sessió. L'aïllament entre perfils d'usuaris el proporcionen els **permisos NTFS** de les subcarpetes individuals (via `Creator Owner`), no el compartit. Donar `Control total` al compartit i gestionar l'accés via NTFS és la pràctica estàndard de Microsoft.

        **2.** Quin és el paper del permís `Creator Owner` als permisos NTFS de la carpeta arrel `C:\Perfils`?

        ??? success "Resposta"
            `Creator Owner` és un principal especial que Windows resol dinàmicament: quan un usuari **crea** un objecte (fitxer o carpeta), ell esdevé el propietari (`Owner`) d'aquell objecte i hereta els permisos de `Creator Owner`. Amb `Creator Owner = FullControl, InheritOnly`, quan Windows crea la carpeta `maria.puig.V6` (el propietari és `maria.puig`), la carpeta rep automàticament `Control total` per a `maria.puig`. Cada usuari té control total de la seva carpeta sense cap configuració manual per a cada usuari.

        **3.** Cal crear manualment la carpeta `C:\Perfils\maria.puig.V6` al servidor abans que l'usuari iniciï sessió?

        ??? success "Resposta"
            **No**. Windows crea la carpeta de perfil **automàticament** en el primer inici de sessió de l'usuari, sempre que la carpeta arrel `C:\Perfils` tingui els permisos correctes (`Everyone` amb permís de `Crear carpetes`). Si les subcarpetes es creen manualment, el propietari serà l'Administrador (no l'usuari) i els permisos `Creator Owner` no funcionaran correctament.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 9.2 · Crea la carpeta de perfils mòbils al servidor

    **Objectiu**: preparar la carpeta compartida per als perfils mòbils del laboratori.

    **Temps estimat**: 25 minuts

    **Prerequisit**: Rol File Services instal·lat, sessió com a Administrador al servidor

    ---

    ### Part A – Crea i comparteix la carpeta

    ```powershell
    New-Item -ItemType Directory -Path "C:\Perfils" -Force
    New-SmbShare -Name "Perfils" -Path "C:\Perfils" -FullAccess "Tothom"
    ```

    Verifica des del client:
    ```cmd
    dir \\SRV-WS2022\Perfils
    ```

    ### Part B – Configura els permisos NTFS

    Executa l'script de permisos NTFS de la secció d'Apunts.

    Verifica el resultat:
    ```powershell
    (Get-Acl "C:\Perfils").Access |
        Select-Object IdentityReference, FileSystemRights, InheritanceFlags, PropagationFlags |
        Format-Table -AutoSize
    ```

    Completa la taula al dossier amb els 4 principals i els seus permisos.

    ### Part C – Comprova que `Tothom` pot crear subcarpetes

    Des del client `PC-AULA01` amb sessió de `maria.puig`:
    ```cmd
    mkdir \\SRV-WS2022\Perfils\prova-permis
    ```

    Funciona? Si funciona, elimina la carpeta de prova:
    ```cmd
    rmdir \\SRV-WS2022\Perfils\prova-permis
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"roaming profiles shared folder permissions Windows Server"`
        - `"Creator Owner NTFS permissions roaming profiles"`
        - `"configure roaming profiles share folder NTFS"`
        - `"perfils mòbils carpeta compartida permisos Windows Server 2022"`
