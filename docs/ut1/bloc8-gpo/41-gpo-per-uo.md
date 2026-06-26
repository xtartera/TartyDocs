---
title: GPO per Unitat Organitzativa
tags:
  - GPO
  - UO
  - administració
  - UT1
---

# :material-folder-cog: GPO per Unitat Organitzativa

!!! abstract "Concepte clau"
    Les GPOs vinculades a **Unitats Organitzatives** permeten aplicar configuracions específiques a un subconjunt d'usuaris o equips. Una GPO a `OU=Alumnes` afecta tots els alumnes; una GPO a `OU=SMX-1` afecta únicament els alumnes de primer. Aquesta especificitat és el que fa les GPOs útils per al control diferenciat de l'aula.

=== ":material-notebook-outline: Apunts"

    ## Crear i vincular una GPO a una UO

    **Via GPMC:**

    1. Obre **Group Policy Management** (`gpmc.msc`)
    2. Expandeix `cirvianum.local` → navega a la UO destí (ex: `OU=Alumnes`)
    3. Clic dret a la UO → **Crea una GPO en aquest domini i vincla-la aquí...**
    4. Escriu el nom de la GPO (ex: `Restriccions-Alumnes`)
    5. Clic dret a la GPO nova → **Edita** per configurar-la

    **Via PowerShell:**

    ```powershell
    # Crear una nova GPO
    New-GPO -Name "Restriccions-Alumnes" -Comment "GPO per a la OU Alumnes"

    # Vincular la GPO a la UO
    New-GPLink `
        -Name "Restriccions-Alumnes" `
        -Target "OU=Alumnes,DC=cirvianum,DC=local" `
        -LinkEnabled Yes

    # Veure les GPOs vinculades a una UO
    Get-GPInheritance -Target "OU=Alumnes,DC=cirvianum,DC=local"
    ```

    ## Herència entre UOs

    ```mermaid
    graph TD
        DOM["🏢 Domini: cirvianum.local\nGPO: Default-Domain-Policy\nGPO: Unitats-Xarxa"]

        OU_A["📁 OU=Alumnes\nGPO: Restriccions-Alumnes\n(hereta les del domini)"]

        OU_S1["📁 OU=SMX-1\nGPO: Desktop-SMX1\n(hereta les d'Alumnes i Domini)"]

        OU_S2["📁 OU=SMX-2\n(hereta les d'Alumnes i Domini,\nno té GPO pròpia)"]

        DOM --> OU_A --> OU_S1
        OU_A --> OU_S2
    ```

    Un alumne de `OU=SMX-1` rep, per ordre d'aplicació:
    1. `Default-Domain-Policy` (Domini)
    2. `Unitats-Xarxa` (Domini)
    3. `Restriccions-Alumnes` (OU=Alumnes)
    4. `Desktop-SMX1` (OU=SMX-1) ← **guanya en cas de conflicte**

    ## Ordre de prioritat entre múltiples GPOs a la mateixa UO

    Si una UO té múltiples GPOs vinculades, l'ordre de la llista determina la prioritat. La **posició 1 és la de major prioritat**.

    ```
    OU=Alumnes
    └── GPOs vinculades (per ordre de prioritat):
        1. Desktop-Alumnes     ← prioritat màxima
        2. Restriccions-Alumnes
        3. Unitats-Xarxa-Alumnes ← prioritat mínima
    ```

    Per canviar l'ordre a GPMC: selecciona la UO → pestanya **Linked Group Policy Objects** → usa les fletxes per moure les GPOs amunt o avall.

    ## Desactivar una GPO o el seu vincle

    ```powershell
    # Desactivar el vincle (la GPO existeix però no s'aplica a la UO)
    Set-GPLink -Name "Restriccions-Alumnes" `
               -Target "OU=Alumnes,DC=cirvianum,DC=local" `
               -LinkEnabled No

    # Desactivar completament la GPO (no s'aplica en cap lloc)
    (Get-GPO -Name "Restriccions-Alumnes").GpoStatus = "AllSettingsDisabled"

    # Desactivar únicament la part d'usuari o d'equip
    (Get-GPO -Name "Restriccions-Alumnes").GpoStatus = "ComputerSettingsDisabled"
    (Get-GPO -Name "Restriccions-Alumnes").GpoStatus = "UserSettingsDisabled"
    ```

    !!! tip "Desactivar la part de **Configuració de l'usuari** en una GPO que només conté **Configuració de l'ordinador** (o viceversa) millora el rendiment: Windows no processa la part buida."

    ## Filtre de seguretat

    Per aplicar una GPO **únicament als membres d'un grup** (sense filtrar per UO):

    1. Selecciona la GPO a GPMC
    2. Pestanya **Àmbit → Filtre de seguretat**
    3. Elimina `Usuaris autenticats` (que inclou tothom)
    4. Afegeix el grup específic (ex: `Comercial`)

    ```powershell
    # Establir el filtre de seguretat via PowerShell
    # Primer elimina el permís de "Usuaris autenticats"
    Set-GPPermission -Name "Restriccions-Alumnes" `
        -TargetName "Authenticated Users" `
        -TargetType Group `
        -PermissionLevel None

    # Afegeix el permís al grup desitjat
    Set-GPPermission -Name "Restriccions-Alumnes" `
        -TargetName "CIRVIANUM\Alumnes-SMX" `
        -TargetType Group `
        -PermissionLevel GpoApply
    ```

    ??? question "Auto-avaluació"

        **1.** Tens dues GPOs vinculades a `OU=Alumnes`: `Restriccions-A` (posició 1) configura el fons de pantalla negre; `Restriccions-B` (posició 2) el configura blanc. Quin color veu l'alumne?

        ??? success "Resposta"
            L'alumne veu el fons **negre**. La posició 1 a la llista de GPOs vinculades és la de **major prioritat** (s'aplica l'última). En l'ordre d'aplicació LSDOU, les GPOs d'una mateixa UO s'apliquen de menor a major prioritat (posició 2 primer, posició 1 al final), i l'última en aplicar-se guanya. Per tant, `Restriccions-A` (posició 1) sobreescriu `Restriccions-B` (posició 2).

        **2.** Vols que la GPO `Desktop-Professors` no s'apliqui durant el cap de setmana mentre fas proves. Com la desactives temporalment sense eliminar-la?

        ??? success "Resposta"
            Desactiva el **vincle** (no la GPO): a GPMC, selecciona `OU=Professors`, pestanya `Linked Group Policy Objects`, clic dret a `Desktop-Professors → Vincle activat` (desactiva la marca). Alternativament: `Set-GPLink -Name "Desktop-Professors" -Target "OU=Professors,DC=cirvianum,DC=local" -LinkEnabled No`. Quan vulguis tornar-la a activar, simplement reactiva el vincle.

        **3.** Per quin motiu val la pena desactivar la "Configuració d'usuari" en una GPO que només conté configuració d'ordinador?

        ??? success "Resposta"
            Quan Windows aplica una GPO en l'inici de sessió, processa **totes dues branques** (Configuració de l'ordinador i de l'usuari), tot i que una d'elles estigui buida. Desactivant la branca buida, Windows l'omet i redueix lleugerament el temps d'aplicació de les GPOs. En dominis amb moltes GPOs o molts clients, aquesta optimització pot ser notable.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 8.3 · Crea una GPO per a la OU d'Alumnes

    **Objectiu**: crear la GPO base per als alumnes i vincular-la correctament.

    **Temps estimat**: 25 minuts

    **Prerequisit**: GPMC, OU=Alumnes existent

    ---

    ### Part A – Crea la GPO

    ```powershell
    # Crea la GPO
    New-GPO -Name "Restriccions-Alumnes" -Comment "Restriccions escriptori per a alumnes SMX"

    # Vincula-la a OU=Alumnes
    New-GPLink -Name "Restriccions-Alumnes" `
               -Target "OU=Alumnes,DC=cirvianum,DC=local" `
               -LinkEnabled Yes
    ```

    ### Part B – Verifica l'herència

    ```powershell
    # Veure les GPOs que reben els alumnes de SMX-1
    Get-GPInheritance -Target "OU=SMX-1,OU=Alumnes,DC=cirvianum,DC=local"
    ```

    Documenta la llista de GPOs que apareix en ordre d'aplicació.

    ### Part C – Comprova l'efecte

    Al client, amb sessió de `maria.puig`, executa `gpresult /r`:

    1. Apareix `Restriccions-Alumnes` a la llista de GPOs aplicades?
    2. Si no apareix, per quin motiu? (revisa el filtre de seguretat i el vincle)

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"GPO link organizational unit Windows Server GPMC"`
        - `"New-GPO New-GPLink PowerShell Active Directory"`
        - `"Group Policy inheritance OU Windows Server tutorial"`
        - `"GPO security filtering authenticated users group"`
