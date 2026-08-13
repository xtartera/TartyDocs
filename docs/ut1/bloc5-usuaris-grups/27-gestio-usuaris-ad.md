---
title: Creació i gestió d'usuaris AD
tags:
  - active directory
  - usuaris
  - UT1
---

# :material-account-multiple: Creació i gestió d'usuaris AD

!!! abstract "Concepte clau"
    Els **usuaris d'Active Directory** representen persones reals i els hi permeten autenticar-se al domini. Cada usuari té atributs clau (nom d'inici de sessió, UPN, descripció) i opcions de compte que controlen el seu comportament (contrasenya, estat, horari).

=== ":material-notebook-outline: Apunts"

    ## Atributs principals d'un usuari AD

    | Atribut | Nom tècnic | Exemple | Notes |
    |---------|-----------|---------|-------|
    | **Nom complet** | `displayName` | `Xavier Tartera Roca` | Com apareix al directori |
    | **Nom d'inici de sessió** | `sAMAccountName` | `xavier.tartera` | ≤ 20 caràcters, sense espais |
    | **UPN** | `userPrincipalName` | `xavier.tartera@cirvianum.local` | Format email, únic al bosc |
    | **Descripció** | `description` | `Professor SMX` | Opcional però recomanat |
    | **Departament** | `department` | `Informàtica` | Útil per filtrar |
    | **Contrasenya** | `unicodePwd` (hash) | — | Mai visible en text pla |

    ### Convenció de noms (Projecte 3)

    El Projecte 3 estableix la convenció `nom.cognom` per al `sAMAccountName`:

    | Persona | sAMAccountName | UPN |
    |---------|---------------|-----|
    | Maria Puig Garcia | `maria.puig` | `maria.puig@cirvianum.local` |
    | Pere Costa Valls | `pere.costa` | `pere.costa@cirvianum.local` |

    !!! tip "Si dos usuaris tenen el mateix nom i cognom, afegeix el segon cognom o un número: `maria.puig2`. Estableix la convenció **abans** de crear usuaris i mantín-la consistentment."

    ## Opcions de compte importants

    | Opció | Funció | Quan usar-la |
    |-------|--------|-------------|
    | **L'usuari ha de canviar la contrasenya en el pròxim inici de sessió** | Força el canvi | Sempre en comptes nous |
    | **L'usuari no pot canviar la contrasenya** | Bloqueja el canvi | Comptes de servei |
    | **La contrasenya no caduca** | Desactiva la caducitat | Comptes de servei (no usuaris humans) |
    | **El compte està desactivat** | Impedeix l'inici de sessió | Empleats en baixa, vacances llargues |

    !!! warning "No eliminis usuaris que han de tornar (baixes temporals, excedències). **Desactiva'ls**. Eliminar un usuari esborra el seu SID únic i tots els permisos associats; restaurar-lo no restaura els permisos."

    ## Creació via ADUC (GUI)

    1. **Server Manager → Tools → Active Directory Users and Computers**
    2. Navega a la UO de destí (ex: `OU=SMX-1,OU=Alumnes`)
    3. Clic dret → **Nou → Usuari**
    4. Omple: Nom, Cognoms, Nom d'inici de sessió (`nom.cognom`)
    5. Contrasenya inicial + marca **"Ha de canviar la contrasenya..."**
    6. Fes clic a **Finalitza**

    ## Creació via PowerShell

    ```powershell
    # Crear un usuari bàsic
    New-ADUser `
        -Name "Maria Puig" `
        -GivenName "Maria" `
        -Surname "Puig" `
        -SamAccountName "maria.puig" `
        -UserPrincipalName "maria.puig@cirvianum.local" `
        -Path "OU=SMX-1,OU=Alumnes,DC=cirvianum,DC=local" `
        -AccountPassword (ConvertTo-SecureString "P@ssw0rd!" -AsPlainText -Force) `
        -ChangePasswordAtLogon $true `
        -Enabled $true `
        -Description "Alumna SMX-1"

    # Modificar atributs d'un usuari existent
    Set-ADUser -Identity "maria.puig" `
        -Department "SMX" `
        -Title "Alumna"

    # Desactivar un compte
    Disable-ADAccount -Identity "maria.puig"

    # Activar un compte
    Enable-ADAccount -Identity "maria.puig"

    # Buscar usuaris per filtre
    Get-ADUser -Filter {Department -eq "SMX"} |
        Select-Object Name, SamAccountName, Enabled
    ```

    ## Gestió del cicle de vida d'un usuari

    ```mermaid
    graph LR
        A[👤 Alta\nNew-ADUser\nEnabled=true] --> B[✅ Actiu\ninici de sessió normal]
        B --> C[⏸️ Baixa temporal\nDisable-ADAccount]
        C --> B
        B --> D[🗑️ Baixa definitiva\nRemove-ADUser]
        C --> D
    ```

    ??? question "Auto-avaluació"

        **1.** Quina diferència hi ha entre el `sAMAccountName` i el `userPrincipalName` (UPN)?

        ??? success "Resposta"
            El **`sAMAccountName`** és el nom d'inici de sessió clàssic (`maria.puig`), usat per a la compatibilitat amb sistemes antics i el format `DOMINI\usuari`. El **UPN** (`maria.puig@cirvianum.local`) és el nom en format email, únic a tot el bosc AD i preferit per als inicis de sessió moderns. Tots dos permeten autenticar-se, però el UPN és l'estàndard actual.

        **2.** Per quin motiu és millor **desactivar** un compte en lloc d'eliminar-lo quan un empleat marxa temporalment?

        ??? success "Resposta"
            Cada compte d'usuari té un **SID** (Security Identifier) únic que identifica l'usuari als permisos de tots els recursos (carpetes, impressores, aplicacions). Si elimines i recrees el compte, el nou SID serà diferent i **tots els permisos individuals hauran de reconfigurar-se**. Desactivant el compte, el SID es conserva i quan l'usuari torna, tots els seus permisos segueixen intactes.

        **3.** Quin paràmetre de `New-ADUser` estableix la contrasenya inicial de forma segura (sense escriure-la en text pla al codi)?

        ??? success "Resposta"
            `-AccountPassword (Read-Host -AsSecureString "Contrasenya")` demana la contrasenya interactivament com a `SecureString`. En scripts automatitzats s'usa `ConvertTo-SecureString "text" -AsPlainText -Force`, però es recomana guardar la contrasenya en un gestor de credencials i no al codi font.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 5.1 · Crea els usuaris del laboratori

    **Objectiu**: crear els comptes d'usuari per als Projectes 3 i 4 seguint la convenció `nom.cognom`.

    **Temps estimat**: 30 minuts

    **Prerequisit**: UOs creades (Activitat 4.2), domini operatiu

    ---

    ### Part A – Crea usuaris via ADUC

    Crea manualment (via GUI) els usuaris següents, col·locant-los a la UO correcta:

    | Nom complet | sAMAccountName | UO destí | Descripció |
    |-------------|---------------|----------|-----------|
    | Xavier Tartera | `xavier.tartera` | `OU=Professors` | Professor SMX |
    | Maria Puig | `maria.puig` | `OU=SMX-1,OU=Alumnes` | Alumna SMX-1 |
    | Pere Costa | `pere.costa` | `OU=SMX-1,OU=Alumnes` | Alumne SMX-1 |
    | Anna Valls | `anna.valls` | `OU=SMX-2,OU=Alumnes` | Alumna SMX-2 |

    Per a tots: contrasenya `P@ssw0rd!` i marca **"Ha de canviar la contrasenya en el pròxim inici de sessió"**.

    ### Part B – Crea usuaris via PowerShell

    Crea 3 usuaris addicionals a `OU=SMX-1,OU=Alumnes` amb el cmdlet `New-ADUser`. Tria els noms.

    ### Part C – Verifica

    ```powershell
    # Llista tots els usuaris de la UO Alumnes
    Get-ADUser -Filter * -SearchBase "OU=Alumnes,DC=cirvianum,DC=local" |
        Select-Object Name, SamAccountName, Enabled, DistinguishedName |
        Format-Table -AutoSize
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Active Directory create users ADUC Windows Server 2022"`
        - `"New-ADUser PowerShell crear usuario Active Directory"`
        - `"Active Directory user account options explained"`
