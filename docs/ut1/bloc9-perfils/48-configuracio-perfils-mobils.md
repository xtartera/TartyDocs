---
title: Configuració de perfils mòbils
tags:
  - perfils mòbils
  - Active Directory
  - GPO
  - UT1
---

# :material-account-arrow-right: Configuració de perfils mòbils

!!! abstract "Concepte clau"
    Un perfil mòbil s'activa apuntant la **ruta del perfil** (`\\servidor\Perfils\%username%`) a la fitxa de l'usuari a ADUC o via GPO. En el primer inici de sessió, Windows crea la carpeta de perfil al servidor i la sincronitza en cada inici i tancament de sessió.

=== ":material-notebook-outline: Apunts"

    ## Mètode 1: Fitxa de l'usuari a ADUC (per usuari individual)

    1. Obre **Active Directory Users and Computers**
    2. Doble clic a l'usuari → pestanya **Perfil**
    3. A **Ruta del perfil**, escriu: `\\SRV-WS2022\Perfils\%username%`
    4. Fes clic a **D'acord**

    !!! tip "Usa **`%username%`** (no el nom literal de l'usuari). ADUC substitueix automàticament `%username%` pel `sAMAccountName` de cada usuari. D'aquesta manera pots copiar la configuració entre usuaris sense modificar la ruta."

    **Via PowerShell (un usuari):**

    ```powershell
    Set-ADUser -Identity "maria.puig" `
        -ProfilePath "\\SRV-WS2022\Perfils\maria.puig"
    ```

    **Via PowerShell (tots els usuaris d'una UO):**

    ```powershell
    Get-ADUser -Filter * -SearchBase "OU=Alumnes,DC=cirvianum,DC=local" |
        ForEach-Object {
            Set-ADUser -Identity $_ `
                -ProfilePath "\\SRV-WS2022\Perfils\$($_.SamAccountName)"
            Write-Host "✅ Perfil mòbil assignat a: $($_.SamAccountName)"
        }
    ```

    ## Mètode 2: GPO (recomanat per a grups d'usuaris)

    Via GPO pots assignar la ruta de perfil a tots els usuaris d'una UO sense modificar cada compte individualment:

    ```
    Configuració d'usuari
    └── Plantilles administratives
        └── Sistema → Perfils d'usuari
            → Establir la ruta de perfil per a tots els usuaris que inicien sessió en aquest equip
            → Valor: \\SRV-WS2022\Perfils\%USERNAME%
    ```

    !!! warning "La configuració de **ruta de perfil via GPO** (`Configuració d'usuari → Sistema → Perfils d'usuari`) s'aplica a tots els usuaris que inicien sessió als equips afectats per la GPO, no als usuaris de la UO. Assegura't que la GPO és a la UO d'equips, no d'usuaris."

    ## Flux de la primera sessió amb perfil mòbil

    ```mermaid
    sequenceDiagram
        participant C as 💻 PC-AULA01
        participant DC as 🖥️ DC
        participant SRV as 📁 Servidor Perfils

        C->>DC: Autenticació de maria.puig ✅
        DC-->>C: Ruta de perfil: \\SRV\Perfils\maria.puig
        C->>SRV: Existeix \\SRV\Perfils\maria.puig.V6?
        SRV-->>C: ❌ No existeix (primer inici de sessió)
        C->>SRV: Crea la carpeta maria.puig.V6
        C->>C: Copia el perfil per defecte com a base
        Note over C: Sessió disponible (perfil nou)
        Note over C: L'usuari treballa...
        C->>SRV: Tancament de sessió → puja els canvis
    ```

    ## Flux de sessions posteriors

    ```mermaid
    sequenceDiagram
        participant C as 💻 PC-AULA02
        participant SRV as 📁 Servidor Perfils

        C->>SRV: Descarrega \\SRV\Perfils\maria.puig.V6
        Note over C: Sessió amb perfil sincronitzat
        Note over C: L'usuari treballa...
        C->>SRV: Tancament sessió → puja els canvis
        Note over SRV: Perfil actualitzat per a la propera sessió
    ```

    ## Verificar la ruta de perfil assignada

    ```powershell
    # Veure la ruta de perfil d'un usuari
    Get-ADUser "maria.puig" -Properties ProfilePath |
        Select-Object Name, SamAccountName, ProfilePath

    # Veure la ruta de perfil de tots els usuaris d'una UO
    Get-ADUser -Filter * -SearchBase "OU=Alumnes,DC=cirvianum,DC=local" `
               -Properties ProfilePath |
        Select-Object Name, SamAccountName, ProfilePath | Format-Table
    ```

    ## Errors freqüents en la configuració inicial

    | Error | Causa probable | Solució |
    |-------|---------------|---------|
    | Perfil temporal en cada inici | Ruta de perfil incorrecta o sense accés | Verifica la ruta i els permisos de `C:\Perfils` |
    | "No s'ha pogut carregar el perfil d'usuari" | La carpeta de perfil no existeix i `Tothom` no pot crear-la | Revisa els permisos NTFS de la carpeta arrel |
    | El perfil és molt lent en carregar | AppData molt gran o xarxa lenta | Exclou `AppData\Local` amb GPO o redirecciona carpetes |
    | ID d'event 1509 al Visor | Conflicte de perfils entre dues sessions simultànies | Un usuari no pot tenir dues sessions obertes alhora amb perfil mòbil |

    ??? question "Auto-avaluació"

        **1.** Configures el perfil mòbil de `maria.puig` amb la ruta `\\SRV-WS2022\Perfils\maria.puig`. Al primer inici de sessió, es crea la carpeta `maria.puig.V6` o `maria.puig`?

        ??? success "Resposta"
            Es crea la carpeta **`maria.puig.V6`**. Windows afegeix automàticament el sufix `.V6` a la carpeta de perfil per a Windows 10 i 11 (versió 6 del format de perfil). La ruta que configures a ADUC (`\\SRV-WS2022\Perfils\maria.puig`) és la **ruta base** sense sufix; Windows afegeix el sufix automàticament. Per això, a la configuració de la ruta de perfil, no has d'afegir `.V6` manualment.

        **2.** Quin avantatge té usar `%username%` a la ruta de perfil en lloc del nom de l'usuari literal?

        ??? success "Resposta"
            `%username%` és una **variable** que Windows (i ADUC) substitueix automàticament pel `sAMAccountName` de l'usuari. Pots posar la mateixa ruta `\\SRV-WS2022\Perfils\%username%` a tots els usuaris d'un sol script: cadascú apuntarà a la seva pròpia subcarpeta. Sense la variable, hauries d'escriure la ruta literalment per a cada usuari (`\\SRV-WS2022\Perfils\maria.puig`, `\\SRV-WS2022\Perfils\pere.costa`...).

        **3.** Quin ID d'event al Visor d'esdeveniments indica que hi ha un conflicte perquè l'usuari té dues sessions obertes alhora?

        ??? success "Resposta"
            L'**Event ID 1509** al canal `Microsoft-Windows-User Profiles Service` indica que Windows no ha pogut sincronitzar el perfil perquè ja hi ha una sessió activa d'un altre PC que ha obert el perfil. Amb perfils mòbils, un usuari no hauria de tenir dues sessions actives simultàniament al mateix domini, ja que pot provocar pèrdua de dades si les dues sessions fan canvis concurrents i el servidor ha de decidir quina versió del perfil és la definitiva.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 9.3 · Assigna i verifica els perfils mòbils

    **Objectiu**: configurar perfils mòbils per als alumnes del laboratori i verificar la sincronització.

    **Temps estimat**: 30 minuts

    **Prerequisit**: Carpeta `C:\Perfils` compartida i amb permisos correctes (Activitat 9.2)

    ---

    ### Part A – Assigna la ruta de perfil via PowerShell

    ```powershell
    Get-ADUser -Filter * -SearchBase "OU=Alumnes,DC=cirvianum,DC=local" |
        ForEach-Object {
            Set-ADUser -Identity $_ `
                -ProfilePath "\\SRV-WS2022\Perfils\$($_.SamAccountName)"
            Write-Host "✅ $($_.SamAccountName) → \\SRV-WS2022\Perfils\$($_.SamAccountName)"
        }
    ```

    Verifica:
    ```powershell
    Get-ADUser -Filter * -SearchBase "OU=Alumnes,DC=cirvianum,DC=local" `
               -Properties ProfilePath |
        Select-Object Name, ProfilePath
    ```

    ### Part B – Primer inici de sessió amb perfil mòbil

    Al client `PC-AULA01`, tanca la sessió actual i inicia com a `maria.puig`:

    1. Espera que carregui la sessió (pot trigar una mica la primera vegada)
    2. Crea un fitxer a l'escriptori: `prova-perfil-mobil.txt`
    3. Tanca la sessió

    Al servidor, comprova:
    ```powershell
    Get-ChildItem "C:\Perfils"
    ```
    Ha aparegut la carpeta `maria.puig.V6`?

    ### Part C – Verifica la sincronització entre PCs

    Al client `PC-AULA02` (si en tens un), inicia sessió com a `maria.puig`:
    - Apareix `prova-perfil-mobil.txt` a l'escriptori?

    Si no tens un segon PC, simula-ho: tanca sessió al `PC-AULA01`, esborra el perfil local de `maria.puig` (`C:\Users\maria.puig`) i torna a iniciar sessió. El fitxer de l'escriptori ha de seguir existint (s'ha recuperat del servidor).

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"configure roaming profiles Active Directory Windows Server 2022"`
        - `"Set-ADUser ProfilePath PowerShell roaming profile"`
        - `"roaming profiles first logon Windows 11 domain"`
        - `"perfils mòbils Active Directory configuració pràctica"`
