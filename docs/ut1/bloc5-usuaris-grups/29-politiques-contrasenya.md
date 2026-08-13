---
title: Polítiques de contrasenya i bloqueig
tags:
  - active directory
  - seguretat
  - GPO
  - UT1
---

# :material-lock-check: Polítiques de contrasenya i bloqueig

!!! abstract "Concepte clau"
    La **Default Domain Policy** inclou la configuració de contrasenya i bloqueig de comptes que s'aplica a **tots** els usuaris del domini. Una política mal configurada permet contrasenyes febles o bloqueja usuaris legítims; una massa restrictiva frustrarà els alumnes als projectes.

=== ":material-notebook-outline: Apunts"

    ## On es configura?

    Les polítiques de contrasenya del domini s'han de configurar a la **Default Domain Policy** (o a una GPO vinculada al domini, no a una UO). Aquesta és la política que afecta tots els usuaris sense excepció.

    ```mermaid
    graph TD
        DDP["🏢 Default Domain Policy\n(vinculada al Domini)"]
        DDP --> PW["🔑 Configuració de contrasenya\n→ S'aplica a TOTS els usuaris"]
        DDP --> LK["🔒 Configuració de bloqueig\n→ S'aplica a TOTS els comptes"]

        GPO2["📁 GPO vinculada a OU=Alumnes\n(restriccions d'escriptori)"]
        GPO2 --> DT["🖥️ Fons, panell de control...\n→ S'aplica NOMÉS als alumnes"]
    ```

    !!! warning "Si vols polítiques de contrasenya **diferents** per a professors i alumnes, necessites **Fine-Grained Password Policies** (PSO), no GPOs per UO. Les polítiques de contrasenya basades en GPO d'UO no funcionen: Windows sempre usa la política del domini per a les contrasenyes."

    ## Paràmetres de contrasenya (Password Policy)

    | Paràmetre | Descripció | Valor recomanat laboratori |
    |-----------|-----------|--------------------------|
    | **Enforce password history** | Nombre de contrasenyes antigues que no es poden reutilitzar | 3 |
    | **Maximum password age** | Dies fins que caduca la contrasenya | 90 dies |
    | **Minimum password age** | Dies mínims abans de poder canviar-la | 1 |
    | **Minimum password length** | Nombre mínim de caràcters | 8 |
    | **Password must meet complexity requirements** | Obliga a combinar majúscules + minúscules + números + símbols | Activat |
    | **Store passwords using reversible encryption** | Guarda les contrasenyes en format reversible (insegur) | **Desactivat sempre** |

    ### Requisits de complexitat (quan activat)

    Windows comprova que la contrasenya compleixi **3 de les 4** condicions:
    - Conté lletres majúscules (A-Z)
    - Conté lletres minúscules (a-z)
    - Conté números (0-9)
    - Conté símbols (`! @ # $ % ^ & * ( ) _ + - =`)

    I a més no pot contenir el nom d'usuari ni el nom complet.

    ## Paràmetres de bloqueig de comptes (Account Lockout Policy)

    | Paràmetre | Descripció | Valor recomanat laboratori |
    |-----------|-----------|--------------------------|
    | **Account lockout threshold** | Intents fallits abans del bloqueig | 5 intents |
    | **Account lockout duration** | Minuts que el compte roman bloquejat (0 = fins que un admin el desbloqueja) | 15 minuts |
    | **Reset account lockout counter after** | Minuts per reiniciar el comptador d'intents | 15 minuts |

    !!! tip "Per al laboratori, usa un llindar de 5 intents i desbloqueig automàtic als 15 minuts. Evita el bloqueig permanent (durada 0) als projectes: si un alumne escriu malament la contrasenya, no et bloquejarà durant tota la pràctica."

    ## Configuració via GPMC

    1. **Server Manager → Tools → Group Policy Management**
    2. Expandeix el domini → clic dret a **Default Domain Policy** → **Edita**
    3. Navega a:
       ```
       Configuració de l'ordinador
       └── Directrius
           └── Configuració de Windows
               └── Configuració de seguretat
                   ├── Polítiques de compte
                   │   ├── Política de contrasenyes  ← aquí
                   │   └── Política de bloqueig de comptes  ← aquí
       ```

    ## Configuració via PowerShell

    ```powershell
    # Veure la política actual del domini
    Get-ADDefaultDomainPasswordPolicy

    # Modificar la política de contrasenya
    Set-ADDefaultDomainPasswordPolicy `
        -Identity "cirvianum.local" `
        -MinPasswordLength 8 `
        -MaxPasswordAge (New-TimeSpan -Days 90) `
        -MinPasswordAge (New-TimeSpan -Days 1) `
        -PasswordHistoryCount 3 `
        -ComplexityEnabled $true `
        -LockoutThreshold 5 `
        -LockoutDuration (New-TimeSpan -Minutes 15) `
        -LockoutObservationWindow (New-TimeSpan -Minutes 15)
    ```

    ## Desbloquejar un compte bloquejat

    ```powershell
    # Verificar si un compte està bloquejat
    Get-ADUser "maria.puig" -Properties LockedOut, BadLogonCount |
        Select-Object Name, LockedOut, BadLogonCount

    # Desbloquejar un compte
    Unlock-ADAccount -Identity "maria.puig"

    # Buscar tots els comptes bloquejats
    Search-ADAccount -LockedOut | Select-Object Name, SamAccountName
    ```

    ??? question "Auto-avaluació"

        **1.** Configures una GPO de política de contrasenya a la UO `Alumnes` per exigir contrasenyes de 12 caràcters. Però els alumnes continuen podent usar contrasenyes de 6 caràcters. Per quin motiu no funciona?

        ??? success "Resposta"
            Les **polítiques de contrasenya** d'Active Directory només s'apliquen quan estan configurades a la **Default Domain Policy** (o en una política vinculada directament al **domini**, no a una UO). Les GPO vinculades a UOs no afecten les polítiques de contrasenya; Windows les ignora per a aquest propòsit específic. Cal modificar la Default Domain Policy o usar Fine-Grained Password Policies (PSO).

        **2.** Un alumne diu que no pot iniciar sessió i que la contrasenya és correcta. Quin cmdlet uses per comprovar si el compte està bloquejat i com el desbloquees?

        ??? success "Resposta"
            Per comprovar: `Get-ADUser "nom.usuari" -Properties LockedOut | Select-Object Name, LockedOut`. Si `LockedOut` és `True`, desbloqueja amb: `Unlock-ADAccount -Identity "nom.usuari"`. Per trobar tots els comptes bloquejats alhora: `Search-ADAccount -LockedOut`.

        **3.** Quin risc de seguretat comporta activar "Store passwords using reversible encryption"?

        ??? success "Resposta"
            Aquesta opció fa que Windows guardi les contrasenyes en un format que **es pot desxifrar** (equivalent a text pla amb una clau coneguda). Si un atacant accedeix a la base de dades NTDS.dit, pot recuperar les contrasenyes en text pla de tots els usuaris, en lloc de només els hashes (que requereixen atacs de força bruta per desxifrar). Mai s'ha d'activar llevat que una aplicació específica ho requereixi.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 5.3 · Configura la política de contrasenya del domini

    **Objectiu**: aplicar la política de seguretat del Projecte 4 al domini `cirvianum.local`.

    **Temps estimat**: 20 minuts

    **Prerequisit**: DC operatiu i GPMC accessible

    ---

    ### Configuració a aplicar (Projecte 4)

    | Paràmetre | Valor |
    |-----------|-------|
    | Longitud mínima | 8 caràcters |
    | Complexitat | Activada |
    | Caducitat màxima | 90 dies |
    | Historial | 3 contrasenyes |
    | Intents fins al bloqueig | 5 |
    | Durada del bloqueig | 15 minuts |

    ### Passos

    1. Obre la **Default Domain Policy** via GPMC i aplica els valors de la taula
    2. Força l'aplicació de la política: `gpupdate /force` des del servidor
    3. Verifica la configuració amb `Get-ADDefaultDomainPasswordPolicy`
    4. **Prova el bloqueig**: des d'un client, intenta iniciar sessió 6 vegades amb una contrasenya incorrecta. Verifica que el compte es bloqueja amb `Get-ADUser -Properties LockedOut`
    5. Desbloqueja el compte amb `Unlock-ADAccount`

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Default Domain Password Policy Windows Server 2022 GPMC"`
        - `"Set-ADDefaultDomainPasswordPolicy PowerShell"`
        - `"Account lockout policy Active Directory configure"`
        - `"Fine-Grained Password Policy Active Directory PSO"`
