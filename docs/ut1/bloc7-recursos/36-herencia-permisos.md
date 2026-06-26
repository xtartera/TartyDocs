---
title: Herència de permisos NTFS
tags:
  - NTFS
  - herència
  - permisos
  - UT1
---

# :material-source-branch: Herència de permisos NTFS

!!! abstract "Concepte clau"
    Per defecte, les subcarpetes i fitxers **hereten** els permisos de la carpeta pare. Trencar l'herència permet crear permisos específics per a una subcarpeta sense afectar la resta de l'arbre. Entendre quan trencar-la (i quan no) és clau per a un disseny correcte de permisos.

=== ":material-notebook-outline: Apunts"

    ## Com funciona l'herència

    ```mermaid
    graph TD
        P["📁 C:\\Dades\\Projectes\nNTFS: Comercial = Modificació"]
        S1["📁 Projecte-A\n(hereta: Comercial = Modificació)"]
        S2["📁 Projecte-B\n(hereta: Comercial = Modificació)"]
        F1["📄 informe.docx\n(hereta: Comercial = Modificació)"]

        P --> S1 --> F1
        P --> S2
    ```

    Els permisos **heretats** apareixen en gris (no editables directament) a la interfície gràfica. Els permisos **explícits** (assignats directament) apareixen en negre.

    ## Visualitzar la font dels permisos

    ```powershell
    # Veure tots els permisos amb origen (heretat / explícit)
    (Get-Acl "C:\Dades\Projectes").Access |
        Select-Object IdentityReference, FileSystemRights,
                      IsInherited, InheritanceFlags, PropagationFlags |
        Format-Table -AutoSize
    ```

    El camp **`IsInherited`**:
    - `True` = permís heretat de la carpeta pare
    - `False` = permís explícit (assignat directament)

    ## Trencar l'herència

    Usa el trencament quan una subcarpeta necessita permisos **completament independents** del pare. Exemple: carpetes personals d'usuaris on cada alumne només pot accedir a la seva.

    **Via GUI:**
    1. Clic dret a la subcarpeta → **Propietats → Seguretat → Opcions avançades**
    2. Fes clic a **Deshabilita l'herència**
    3. Windows pregunta: **Converteix els permisos heretats en permisos explícits** (còpia els actuals) o **Suprimeix tots els permisos heretats** (comença des de zero)

    **Via PowerShell:**
    ```powershell
    $acl = Get-Acl "C:\Dades\Personal\maria.puig"

    # Trenca l'herència i conserva els permisos existents com a explícits
    $acl.SetAccessRuleProtection($true, $true)

    # Trenca l'herència i esborra tots els permisos heretats (comença net)
    # $acl.SetAccessRuleProtection($true, $false)

    Set-Acl "C:\Dades\Personal\maria.puig" $acl
    ```

    ## Restaurar l'herència

    ```powershell
    $acl = Get-Acl "C:\Dades\Personal\maria.puig"

    # Restaura l'herència (els permisos explícits es mantenen)
    $acl.SetAccessRuleProtection($false, $false)

    Set-Acl "C:\Dades\Personal\maria.puig" $acl
    ```

    ## Cas pràctic: carpetes personals d'alumnes

    Un escenari típic: `C:\Dades\Personal` conté una subcarpeta per a cada alumne, i cada alumne només ha d'accedir a la seva.

    ```mermaid
    graph TD
        P["📁 C:\\Dades\\Personal\nAdministrador = Control total\n(herència bloquejada a fills)"]
        M["📁 maria.puig\nÚnicament: maria.puig = Modificació\n❌ NO hereta del pare"]
        A["📁 anna.valls\nÚnicament: anna.valls = Modificació\n❌ NO hereta del pare"]

        P --> M
        P --> A
    ```

    Script per crear carpetes personals amb herència trencada:

    ```powershell
    $alumnes = @("maria.puig", "pere.costa", "anna.valls")
    $basePath = "C:\Dades\Personal"

    foreach ($alumne in $alumnes) {
        $ruta = Join-Path $basePath $alumne
        New-Item -ItemType Directory -Path $ruta -Force

        $acl = Get-Acl $ruta

        # Trenca l'herència i esborra els permisos heretats
        $acl.SetAccessRuleProtection($true, $false)

        # Afegeix permís d'administrador
        $admin = New-Object System.Security.AccessControl.FileSystemAccessRule(
            "BUILTIN\Administrators", "FullControl",
            "ContainerInherit,ObjectInherit", "None", "Allow")
        $acl.AddAccessRule($admin)

        # Afegeix permís de l'alumne propietari
        $owner = New-Object System.Security.AccessControl.FileSystemAccessRule(
            "CIRVIANUM\$alumne", "Modify",
            "ContainerInherit,ObjectInherit", "None", "Allow")
        $acl.AddAccessRule($owner)

        Set-Acl $ruta $acl
        Write-Host "✅ Carpeta personal creada: $ruta"
    }
    ```

    ??? question "Auto-avaluació"

        **1.** Una carpeta `C:\Dades\Projectes` té el grup `Alumnes` amb permís `Modificació`. Crees una subcarpeta `Confidencial` i vols que **cap alumne** hi accedeixi. Quin és el procés correcte?

        ??? success "Resposta"
            1. Clic dret a `Confidencial` → **Propietats → Seguretat → Opcions avançades → Deshabilita l'herència**
            2. Tria **"Suprimeix tots els permisos heretats"** (comença des de zero)
            3. Afegeix **únicament** `Administrators → Control total`
            El grup `Alumnes` no tindrà cap permís sobre `Confidencial`, tot i que en té a la carpeta pare.

        **2.** Quina diferència hi ha entre un permís **heretat** i un permís **explícit** en la interfície gràfica?

        ??? success "Resposta"
            A la pestanya **Seguretat → Opcions avançades**, els permisos **heretats** mostren la columna "Heretat de" amb la ruta de la carpeta d'origen, i al diàleg d'edició apareixen en **gris** (no es poden modificar directament). Els permisos **explícits** no mostren origen i apareixen en **negre** (editables directament). Per modificar un permís heretat, cal trencar l'herència primer o modificar-lo a la carpeta pare.

        **3.** Quan tries "Converteix els permisos heretats en permisos explícits" en lloc de "Suprimeix tots els permisos heretats", quin és el resultat pràctic?

        ??? success "Resposta"
            **"Converteix"** fa una **còpia** dels permisos heretats i els torna explícits: la subcarpeta queda amb els mateixos permisos que tenia però ara independents del pare. Pots modificar-los sense afectar el pare ni els germans. **"Suprimeix"** elimina tots els permisos heretats i deixa la carpeta sense cap permís (excepte el del propietari). Usa "Converteix" quan vols partir d'un estat base i afinar; usa "Suprimeix" quan vols un conjunt de permisos completament nou.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 7.3 · Crea carpetes personals amb herència trencada

    **Objectiu**: configurar carpetes personals on cada alumne accedeix únicament a la seva.

    **Temps estimat**: 30 minuts

    **Prerequisit**: Usuaris d'AD creats (Activitat 5.1)

    ---

    ### Part A – Executa l'script de carpetes personals

    Adapta i executa l'script de la secció d'Apunts per als teus 3-4 alumnes de laboratori.

    Verifica el resultat:
    ```powershell
    # Comprova els permisos de cada carpeta
    Get-ChildItem "C:\Dades\Personal" | ForEach-Object {
        Write-Host "`n=== $($_.Name) ==="
        (Get-Acl $_.FullName).Access |
            Select-Object IdentityReference, FileSystemRights, IsInherited
    }
    ```

    ### Part B – Verifica l'aïllament

    1. Inicia sessió com a `maria.puig` al client
    2. Navega a `\\SRV-WS2022\Personal\maria.puig` → **ha de funcionar**
    3. Intenta accedir a `\\SRV-WS2022\Personal\anna.valls` → **ha de donar "Accés denegat"**
    4. Documenta els missatges d'error obtinguts

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"NTFS permissions inheritance disable Windows Server"`
        - `"SetAccessRuleProtection PowerShell NTFS inheritance"`
        - `"home folders Active Directory Windows Server personal"`
        - `"NTFS inherited vs explicit permissions explained"`
