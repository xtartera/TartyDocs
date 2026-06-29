---
title: Usuaris i grups de domini (ADUC + PowerShell)
tags:
  - ut4
  - active-directory
  - usuaris
  - grups
---

# :material-account-group: Usuaris i grups de domini (ADUC + PowerShell)

!!! abstract "Concepte clau"
    Els **comptes de domini** d'Active Directory permeten que un usuari iniciï sessió des de qualsevol màquina del domini amb les mateixes credencials. Es gestionen des de **ADUC** (Active Directory Users and Computers) o amb el mòdul PowerShell `ActiveDirectory`.

=== ":material-notebook-outline: Apunts"

    ## Crear usuaris de domini

    ### GUI (ADUC)
    1. Obre **Active Directory Users and Computers**
    2. Navega a la OU de destí (p. ex., `OU=Usuaris,OU=OU201`)
    3. Clic dret → **New → User**
    4. Omple: First name, Last name, User logon name (p. ex., `director201`)
    5. Defineix la contrasenya → **Next → Finish**

    ### PowerShell

    ```powershell
    # Crea un usuari de domini
    New-ADUser `
        -Name "Director 201" `
        -GivenName "Director" `
        -Surname "201" `
        -SamAccountName "director201" `
        -UserPrincipalName "director201@ad-cognom.local" `
        -Path "OU=Usuaris,OU=OU201,DC=ad-cognom,DC=local" `
        -AccountPassword (ConvertTo-SecureString "P@ssw0rd1!" -AsPlainText -Force) `
        -Enabled $true `
        -PasswordNeverExpires $false `
        -ChangePasswordAtLogon $true

    # Verifica
    Get-ADUser -Identity "director201" | Select-Object Name, SamAccountName, Enabled, DistinguishedName
    ```

    ## Crear grups de domini

    ```powershell
    # Grup de seguretat global (el més comú)
    New-ADGroup `
        -Name "GRP-Tecnics" `
        -GroupScope Global `
        -GroupCategory Security `
        -Path "OU=Grups,OU=OU201,DC=ad-cognom,DC=local" `
        -Description "Grup de tècnics informàtics"

    # Afegir membres al grup
    Add-ADGroupMember -Identity "GRP-Tecnics" -Members "tecnic201", "tecnic202"

    # Verificar membres
    Get-ADGroupMember -Identity "GRP-Tecnics" | Select-Object Name, SamAccountName
    ```

    ## Tipus de grups AD

    | Tipus | Àmbit | Ús |
    |-------|-------|-----|
    | **Security Global** | Tot el domini | Control d'accés a recursos del domini |
    | **Security Domain Local** | Únicament al domini local | Permisos a recursos locals |
    | **Security Universal** | Tot el forest | Multi-domini (entorns complexos) |
    | **Distribution** | — | Llistes de correu (no control d'accés) |

    En entorns educatius de laboratori: sempre **Security Global**.

    ## Usuaris especials del projecte P41

    | SamAccountName | Rol | OU destí |
    |---------------|-----|---------|
    | `director201` | Director general | `OU=Usuaris,OU=OU201` |
    | `extern202` | Usuari extern | `OU=Usuaris,OU=OU201` |
    | `tecnic203` | Tècnic IT | `OU=Usuaris,OU=OU201` |

    ## Operacions habituals

    ```powershell
    # Llistar tots els usuaris d'una OU
    Get-ADUser -Filter * -SearchBase "OU=Usuaris,OU=OU201,DC=ad-cognom,DC=local" |
        Select-Object Name, SamAccountName, Enabled

    # Desactivar un compte
    Disable-ADAccount -Identity "extern202"

    # Restablir contrasenya
    Set-ADAccountPassword -Identity "tecnic203" `
        -NewPassword (ConvertTo-SecureString "Nou1P@ss!" -AsPlainText -Force) `
        -Reset

    # Eliminar un usuari
    Remove-ADUser -Identity "extern202" -Confirm:$false
    ```

    !!! tip "UPN vs SamAccountName"
        El **SamAccountName** (`tecnic203`) és el nom d'inici de sessió traditional (màx. 20 caràcters). El **UPN** (`tecnic203@ad-cognom.local`) és l'identificador modern en format email. En Windows moderns, ambdós funcionen; en entorns Linux amb SSSD, sovint cal usar el format UPN.

    !!! warning "Contrasenya per defecte de la GPO"
        La **Default Domain Policy** estableix requisits de contrasenya mínims: longitud, complexitat (majúscules, minúscules, números, caràcters especials). Si la contrasenya de `New-ADUser` no compleix els requisits, el cmdlet falla. Verifica els requisits amb `Get-ADDefaultDomainPasswordPolicy`.

    ??? question "Auto-avaluació"
        **1.** Quina diferència hi ha entre `SamAccountName` i `UserPrincipalName` en Active Directory?

        ??? success "Resposta"
            El **SamAccountName** (`director201`) és el nom d'inici de sessió tradicional usat en entorns pre-Windows 2000 i per al format `DOMINI\usuari`. El **UserPrincipalName** (`director201@ad-cognom.local`) és el format modern en estil email, preferit en autenticació moderna i usat per SSSD a Linux. Ambdós han de ser únics al domini.

        **2.** Quin tipus de grup AD és el més adequat per controlar l'accés a carpetes compartides en un entorn de laboratori amb un sol domini?

        ??? success "Resposta"
            Un grup de tipus **Security Global**. L'àmbit "Global" permet usar el grup per donar permisos a qualsevol recurs del domini, i la categoria "Security" el fa vàlid per a control d'accés. El tipus "Distribution" és per a llistes de correu i no funciona per a permisos.

        **3.** Quina ordre PowerShell llista tots els membres del grup `GRP-Tecnics`?

        ??? success "Resposta"
            `Get-ADGroupMember -Identity "GRP-Tecnics"` o, per veure els camps concrets: `Get-ADGroupMember -Identity "GRP-Tecnics" | Select-Object Name, SamAccountName`. Per veure informació detallada: `Get-ADGroupMember -Identity "GRP-Tecnics" | Get-ADUser | Select-Object Name, SamAccountName, Enabled`.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.07 · Creació d'usuaris i grups de domini

    **Objectiu**: crear els usuaris i grups del projecte P41 i verificar la seva integració al domini.
    **Temps estimat**: 30 minuts
    **Prerequisit**: OUs creades (Activitat 4.06)

    ---

    ### Pas 1 – Crea els usuaris del projecte

    ```powershell
    $path = "OU=Usuaris,OU=OU201,DC=ad-cognom,DC=local"
    $pass = ConvertTo-SecureString "P@ssw0rd1!" -AsPlainText -Force

    New-ADUser -Name "Director 201" -SamAccountName "director201" -Path $path -AccountPassword $pass -Enabled $true -ChangePasswordAtLogon $true
    New-ADUser -Name "Extern 202" -SamAccountName "extern202" -Path $path -AccountPassword $pass -Enabled $true
    New-ADUser -Name "Tecnic 203" -SamAccountName "tecnic203" -Path $path -AccountPassword $pass -Enabled $true
    ```

    ### Pas 2 – Crea els grups

    ```powershell
    $gpPath = "OU=Grups,OU=OU201,DC=ad-cognom,DC=local"
    New-ADGroup -Name "GRP-Directors" -GroupScope Global -GroupCategory Security -Path $gpPath
    New-ADGroup -Name "GRP-Tecnics" -GroupScope Global -GroupCategory Security -Path $gpPath
    Add-ADGroupMember -Identity "GRP-Directors" -Members "director201"
    Add-ADGroupMember -Identity "GRP-Tecnics" -Members "tecnic203"
    ```

    ### Pas 3 – Verifica

    ```powershell
    Get-ADUser -Filter * -SearchBase "OU=Usuaris,OU=OU201,DC=ad-cognom,DC=local" | Select-Object Name, SamAccountName, Enabled
    Get-ADGroupMember "GRP-Tecnics" | Select-Object Name
    ```

    ### Pas 4 – Prova des del client

    Inicia sessió al client Windows com a `AD-COGNOM\director201`. Verifica amb `whoami` i `whoami /groups`.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"New-ADUser PowerShell create domain users"`
        - `"Active Directory Users and Computers ADUC tutorial"`
        - `"New-ADGroup PowerShell security group"`
