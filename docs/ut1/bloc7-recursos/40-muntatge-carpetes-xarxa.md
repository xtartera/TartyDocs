---
title: Muntatge de carpetes de xarxa
tags:
  - xarxa
  - unitats
  - GPO
  - UT1
---

# :material-network-pos: Muntatge de carpetes de xarxa

!!! abstract "Concepte clau"
    Els clients poden accedir a carpetes compartides connectant-les com a **unitats de xarxa** (ex: `Z:`) per fer-les aparèixer com si fossin discs locals. Via **GPO de preferències**, el servidor pot assignar automàticament unitats de xarxa a tots els usuaris en iniciar sessió, sense cap configuració manual al client.

=== ":material-notebook-outline: Apunts"

    ## Mètodes d'accés a carpetes compartides

    | Mètode | Persistència | Automatisme | Ús típic |
    |--------|-------------|-------------|---------|
    | Ruta UNC directa `\\srv\recurs` | No persistent | Manual | Accés puntual |
    | **`net use`** (cmd) | Opcional | Manual | Scripts, automatització |
    | GUI "Connecta unitat de xarxa" | Persistent | Manual | Usuaris individuals |
    | **GPO Preferències – Drive Maps** | Persistent | Automàtic | Tots els usuaris del domini |
    | `New-PSDrive` (PowerShell) | No persistent | Manual | Scripts PowerShell |

    ## `net use` — línia d'ordres clàssica

    ```cmd
    :: Connectar la carpeta Projectes com a unitat Z:
    net use Z: \\SRV-WS2022\Projectes

    :: Connexió persistent (es manté entre reinicis)
    net use Z: \\SRV-WS2022\Projectes /persistent:yes

    :: Connexió amb credencials explícites
    net use Z: \\SRV-WS2022\Projectes /user:CIRVIANUM\maria.puig P@ssw0rd!

    :: Desconnectar una unitat
    net use Z: /delete

    :: Desconnectar totes les unitats de xarxa
    net use * /delete /yes

    :: Veure les connexions actuals
    net use
    ```

    ## GUI – Connecta unitat de xarxa (Windows 11)

    1. **Explorador de fitxers → Aquest equip → Connecta unitat de xarxa**
    2. Tria la lletra (`Z:`)
    3. Escriu la ruta: `\\SRV-WS2022\Projectes`
    4. Marca **"Reconnecta en iniciar sessió"** per fer-la persistent
    5. Fes clic a **Finalitza**

    ## PowerShell

    ```powershell
    # Munta la carpeta com a unitat Z: (no persistent, dura la sessió PS)
    New-PSDrive -Name "Z" -PSProvider FileSystem `
                -Root "\\SRV-WS2022\Projectes" -Persist

    # Veure les unitats de xarxa muntades
    Get-PSDrive -PSProvider FileSystem

    # Desmunta la unitat
    Remove-PSDrive -Name "Z"
    ```

    ## GPO Preferències – Drive Maps (mètode recomanat per al domini)

    La forma correcta d'assignar unitats de xarxa en un domini és via **GPO de preferències**. Les unitats s'assignen automàticament quan l'usuari inicia sessió, sense cap acció manual.

    **Configuració:**

    1. Obre **Group Policy Management** → crea o edita una GPO vinculada a la UO d'usuaris
    2. Navega a:
       ```
       Configuració d'usuari
       └── Preferències
           └── Configuració de Windows
               └── Assignació de unitats
       ```
    3. Clic dret → **Nou → Unitat assignada**
    4. Configura:
       - **Acció**: `Actualitza` (crea si no existeix, actualitza si existeix)
       - **Ubicació**: `\\SRV-WS2022\Projectes`
       - **Lletra d'unitat**: `Z`
       - **Etiqueta**: `Projectes`
       - **Reconnecta**: activat

    ### Filtrar per grup (Item-Level Targeting)

    A la pestanya **Comú**, pots activar **"Defineix el nivell d'element de destinació"** per aplicar la unitat de xarxa **només a un grup específic**:

    - Alumnes `Comercial` → unitat `Z:` → `\\SRV-WS2022\Projectes\Comercial`
    - Professors → unitat `Z:` → `\\SRV-WS2022\Professors$`

    ```mermaid
    graph TD
        GPO["🗂️ GPO: Unitats-Xarxa\n(vinculada a OU=Alumnes)"]

        GPO --> M1["📁 Z: → \\\\SRV-WS2022\\Projectes\n🎯 Filtre: tots els usuaris d'Alumnes"]
        GPO --> M2["📁 H: → \\\\SRV-WS2022\\Personal\\%USERNAME%\n🎯 Filtre: tots els usuaris"]

        U1["👤 maria.puig\nConnecta en iniciar sessió"]
        U2["👤 anna.valls\nConnecta en iniciar sessió"]

        M1 --> U1
        M1 --> U2
        M2 --> U1
        M2 --> U2
    ```

    ### La variable `%USERNAME%`

    A la ruta UNC pots usar la variable `%USERNAME%` per crear rutes dinàmiques per a carpetes personals:

    ```
    \\SRV-WS2022\Personal\%USERNAME%
    ```

    Quan `maria.puig` inicia sessió, la unitat apunta a `\\SRV-WS2022\Personal\maria.puig`. No cal crear una GPO per a cada alumne.

    ## Verificació

    ```cmd
    :: Veure les unitats de xarxa actuals
    net use

    :: Veure des de PowerShell
    Get-PSDrive -PSProvider FileSystem

    :: Verificar que la GPO ha aplicat les unitats
    gpresult /r | findstr "Unitats\|Drive"
    ```

    ??? question "Auto-avaluació"

        **1.** Quin avantatge té configurar les unitats de xarxa via GPO de preferències en lloc de deixar que cada usuari les connecti manualment?

        ??? success "Resposta"
            Via GPO, les unitats s'assignen **automàticament** a tots els usuaris del grup en iniciar sessió, sense cap acció per part seva. Elimina el problema de "l'alumne no sap com connectar la carpeta", assegura que tots els usuaris del grup veuen exactament les mateixes unitats, i es pot actualitzar centralment (canviar la ruta o la lletra) des del servidor sense tocar cap client.

        **2.** Quin és l'avantatge de usar `%USERNAME%` a la ruta UNC de la unitat de xarxa?

        ??? success "Resposta"
            `%USERNAME%` és una variable d'entorn que Windows substitueix automàticament pel nom d'inici de sessió de l'usuari actual. Amb una sola entrada de GPO — `\\SRV-WS2022\Personal\%USERNAME%` — cada alumne veu la seva pròpia carpeta personal: `maria.puig` veu `\\SRV-WS2022\Personal\maria.puig`, `anna.valls` veu `\\SRV-WS2022\Personal\anna.valls`. No cal crear una entrada diferent per a cada usuari.

        **3.** Una unitat de xarxa connectada amb `net use Z: \\SRV-WS2022\Projectes` desapareix quan l'usuari reinicia el PC. Com la fas persistent?

        ??? success "Resposta"
            Afegint el paràmetre `/persistent:yes`: `net use Z: \\SRV-WS2022\Projectes /persistent:yes`. Alternativament, des de la GUI, marca l'opció **"Reconnecta en iniciar sessió"** en crear la connexió. La solució correcta per a entorns de domini és assignar la unitat via **GPO de preferències**, que és automàtica, centralitzada i no depèn que l'usuari l'hagi configurat mai manualment.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 7.5 · Assigna unitats de xarxa via GPO

    **Objectiu**: configurar l'assignació automàtica d'unitats de xarxa per als alumnes del domini.

    **Temps estimat**: 30 minuts

    **Prerequisit**: Carpetes compartides creades (Activitat 7.1), client W11 unit al domini

    ---

    ### Part A – Prova manual amb `net use`

    Des del client `PC-AULA01` amb sessió de `maria.puig`:

    ```cmd
    net use Z: \\SRV-WS2022\Projectes
    dir Z:
    net use Z: /delete
    ```

    Documenta: pots llegir i crear fitxers a `Z:`? Els permisos funcionen correctament?

    ### Part B – Configura la GPO de unitats de xarxa

    Al servidor, crea una nova GPO `Unitats-Alumnes` vinculada a `OU=Alumnes`:

    1. Afegeix una unitat `Z:` → `\\SRV-WS2022\Projectes`
    2. Afegeix una unitat `H:` → `\\SRV-WS2022\Personal\%USERNAME%`
    3. Acció: `Actualitza` a les dues

    ### Part C – Verifica al client

    1. Al client, executa `gpupdate /force`
    2. Tanca sessió i torna a iniciar-la com a `maria.puig`
    3. Obre l'**Explorador de fitxers**: apareixen les unitats `Z:` i `H:`?
    4. Executa `net use` per confirmar les connexions actives
    5. Comprova que `H:` apunta a `\\SRV-WS2022\Personal\maria.puig`

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"map network drive GPO Group Policy Preferences Windows Server"`
        - `"drive maps group policy preferences item level targeting"`
        - `"net use map network drive Windows persistent"`
        - `"carpetas de red GPO preferencias unidades Windows Server 2022"`
