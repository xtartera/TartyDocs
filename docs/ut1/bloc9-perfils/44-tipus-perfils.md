---
title: Tipus de perfils d'usuari
tags:
  - perfils
  - usuaris
  - Active Directory
  - UT1
---

# :material-account-box: Tipus de perfils d'usuari

!!! abstract "Concepte clau"
    Un **perfil d'usuari** és el conjunt de configuracions personalitzades associades a un compte: escriptori, documents, configuració d'aplicacions i variables d'entorn. A Windows existeixen tres tipus: **local**, **itinerant (mòbil)** i **obligatori**. En un domini, els perfils mòbils permeten que l'usuari trobi el seu entorn des de qualsevol PC de l'organització.

=== ":material-notebook-outline: Apunts"

    ## Comparativa dels tres tipus de perfil

    | Tipus | On es guarda | Persistència | Ús típic |
    |-------|-------------|-------------|---------|
    | **Local** | `C:\Users\nom` al PC local | Només al PC on es va crear | Usuaris que sempre usen el mateix PC |
    | **Mòbil (Roaming)** | Servidor (`\\SRV\Perfils\nom.V6`) | Accessible des de qualsevol PC del domini | **El que configurem al curs** |
    | **Obligatori** | Servidor (en mode read-only) | L'usuari no pot desar canvis | Quioscos, punts d'informació |

    ## Perfil local

    ```mermaid
    graph LR
        U["👤 maria.puig\ninici sessió PC-AULA01"]
        P1["📁 C:\\Users\\maria.puig\n(PC-AULA01)"]
        P2["📁 C:\\Users\\maria.puig\n(PC-AULA02) — NO existeix"]

        U -->|"Crea perfil local"| P1
        U -.->|"❌ No hi ha perfil"| P2
    ```

    Si l'usuari canvia de PC, Windows crea un perfil local nou des de zero: l'escriptori i els documents de l'altre PC no hi són.

    ## Perfil mòbil (Roaming Profile)

    ```mermaid
    graph LR
        SRV["🖥️ Servidor\n\\\\SRV\\Perfils\\maria.puig.V6"]

        U1["👤 maria.puig\nPC-AULA01"]
        U2["👤 maria.puig\nPC-AULA02"]

        U1 -->|"Sincronitza en inici/tancament"| SRV
        U2 -->|"Sincronitza en inici/tancament"| SRV
    ```

    El perfil es **descarrega** del servidor en iniciar sessió i es **puja** de nou al tancar-la. L'usuari veu el mateix escriptori, documents i configuració des de qualsevol PC del domini.

    ## Perfil obligatori (Mandatory Profile)

    - Funciona com un perfil mòbil però el fitxer `NTUSER.DAT` es reanomena `NTUSER.MAN`
    - L'usuari pot fer canvis durant la sessió, però en tancar sessió **no es desen**
    - En el pròxim inici de sessió, rep exactament el mateix perfil base
    - Útil per a quioscos, aules d'autoservei, punts de registre

    ## Ubicació del perfil local

    ```powershell
    # Veure els perfils locals existents en un PC
    Get-ChildItem "C:\Users" | Select-Object Name, LastWriteTime

    # Veure informació detallada dels perfils via WMI
    Get-WmiObject Win32_UserProfile |
        Select-Object LocalPath, LastUseTime, Special |
        Where-Object {$_.Special -eq $false}
    ```

    ## Contingut d'un perfil d'usuari

    | Carpeta / Fitxer | Contingut |
    |-----------------|-----------|
    | `Desktop\` | Contingut de l'escriptori |
    | `Documents\` | Carpeta Documents de l'usuari |
    | `AppData\Roaming\` | Configuració d'aplicacions (sincronitzada al perfil mòbil) |
    | `AppData\Local\` | Dades locals d'aplicacions (NO sincronitzada) |
    | `AppData\LocalLow\` | Dades locals de baix privilegi (NO sincronitzada) |
    | `NTUSER.DAT` | Fitxer del Registre de l'usuari (`HKEY_CURRENT_USER`) |

    !!! tip "Només `AppData\Roaming` es sincronitza amb el servidor en un perfil mòbil. `AppData\Local` queda sempre al PC local. Algunes aplicacions desen la configuració a `Local` i no es conserva en canviar de PC."

    ??? question "Auto-avaluació"

        **1.** Un alumne ha personalitzat el seu escriptori al PC-AULA01 (perfil local). El dia següent s'asseu al PC-AULA02. Troba el seu escriptori personalitzat? Per quin motiu?

        ??? success "Resposta"
            **No**. Amb un perfil **local**, la configuració de l'escriptori es desa a `C:\Users\maria.puig` del **PC-AULA01**. Al PC-AULA02, Windows crea un perfil nou des de zero (des del perfil per defecte). Per mantenir la personalització entre PCs cal usar un **perfil mòbil**, que es desa al servidor i es descarrega a qualsevol PC on l'usuari iniciï sessió.

        **2.** Quin fitxer dins del perfil conté la configuració del Registre de l'usuari (`HKEY_CURRENT_USER`)?

        ??? success "Resposta"
            **`NTUSER.DAT`**, ubicat a l'arrel del perfil (`C:\Users\maria.puig\NTUSER.DAT`). Windows carrega aquest fitxer com a part del Registre en iniciar la sessió de l'usuari. En un perfil obligatori, es reanomena a `NTUSER.MAN` per indicar que és de lectura única.

        **3.** Quin és el problema principal de sincronitzar `AppData\Local` als perfils mòbils?

        ??? success "Resposta"
            `AppData\Local` pot contenir **centenars de megabytes** de caché, fitxers temporals d'aplicació i dades locals (navegadors, actualitzacions, compilats...). Sincronitzar-la alenteix enormement l'inici i tancament de sessió i consumeix molt espai al servidor. Per això, per disseny, `AppData\Local` **no se sincronitza** als perfils mòbils estàndard. Si alguna aplicació desa configuració important a `Local`, pot ser necessari redirigir-la o usar una solució alternativa.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 9.1 · Identifica els perfils existents al laboratori

    **Objectiu**: explorar els perfils d'usuari locals abans de configurar perfils mòbils.

    **Temps estimat**: 15 minuts

    **Prerequisit**: Client W11 unit al domini, sessió com a `maria.puig`

    ---

    ### Part A – Identifica el perfil local actual

    Al client `PC-AULA01`:

    ```powershell
    Get-ChildItem "C:\Users" | Select-Object Name, LastWriteTime
    Get-WmiObject Win32_UserProfile | Select-Object LocalPath, LastUseTime, Special
    ```

    1. Quants perfils hi ha? Quin és el de `maria.puig`?
    2. Quin tipus de perfil és (Local, Roaming, Especial)?
    3. Quan va ser l'últim ús?

    ### Part B – Explora el contingut del perfil

    ```cmd
    dir C:\Users\maria.puig /a
    ```

    Identifica les carpetes `AppData\Roaming`, `AppData\Local`, `Desktop`, `Documents`, `NTUSER.DAT`.

    Quina mida té la carpeta `AppData\Local` vs `AppData\Roaming`?

    ```powershell
    # Mida de les subcarpetes AppData
    Get-ChildItem "C:\Users\maria.puig\AppData" |
        ForEach-Object {
            $mida = (Get-ChildItem $_.FullName -Recurse -ErrorAction SilentlyContinue |
                     Measure-Object -Property Length -Sum).Sum
            [PSCustomObject]@{Carpeta=$_.Name; MidaMB=[math]::Round($mida/1MB,1)}
        }
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"roaming profiles vs local profiles Windows Server explained"`
        - `"Windows user profile types local roaming mandatory"`
        - `"NTUSER.DAT registry hive user profile"`
        - `"AppData Roaming vs Local Windows difference"`
