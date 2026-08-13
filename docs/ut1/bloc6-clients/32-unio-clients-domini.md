---
title: Unió de clients Windows 11 al domini
tags:
  - domini
  - clients
  - Windows 11
  - UT1
---

# :material-laptop-account: Unió de clients Windows 11 al domini

!!! abstract "Concepte clau"
    Unir un client Windows 11 al domini crea un compte d'equip a Active Directory i permet que els usuaris del domini iniciïn sessió des d'aquell PC. Requereix que el client pugui **resoldre el nom del domini via DNS** — sense això, la unió falla sempre.

=== ":material-notebook-outline: Apunts"

    ## Prerequisits abans d'unir-se

    ```mermaid
    graph LR
        A["✅ 1. Client i servidor\nen la mateixa xarxa\n(ping IP del DC)"]
        B["✅ 2. DNS del client\napunta al DC\n(no a 8.8.8.8)"]
        C["✅ 3. El client pot resoldre\nel nom del domini\nnslookup cirvianum.local"]
        D["✅ 4. Nom de PC\ndescriptiu\n(PC-AULA01)"]
        E["🔗 Unió al domini"]

        A --> B --> C --> D --> E
    ```

    !!! danger "El 80% dels errors de unió al domini es deuen al DNS del client. **Comprova sempre que el DNS preferit del client és la IP del DC abans de fer qualsevol altra cosa.**"

    ## Procés d'unió via GUI

    **Mètode 1: Configuració del sistema**

    1. Clic dret a **Inici → Sistema** (o `Win + Pause`)
    2. → **Canvia el nom del PC (avançat)**  
       *(o Configuració → Sistema → Informació → Canvia el nom)*
    3. → Pestanya **Nom de l'ordinador** → **Canvia...**
    4. Selecciona **Domini** i escriu: `cirvianum.local`
    5. Escriu les credencials d'un administrador del domini
    6. **Reinicia el client**

    **Mètode 2: Configuració de Windows 11 (nou)**

    1. **Configuració → Comptes → Accés a la feina o escola**
    2. → **Connecta** → **Uneix aquest dispositiu a un domini d'Active Directory local**
    3. Escriu: `cirvianum.local` → **Següent**
    4. Credencials d'administrador → **D'acord**
    5. **Reinicia**

    ## Procés d'unió via PowerShell

    ```powershell
    # Unió al domini (demana credencials de forma segura)
    Add-Computer -DomainName "cirvianum.local" -Restart

    # Unió al domini indicant credencials i UO destí
    $cred = Get-Credential "CIRVIANUM\Administrador"
    Add-Computer `
        -DomainName "cirvianum.local" `
        -Credential $cred `
        -OUPath "OU=Equips-Aula,OU=Equips,DC=cirvianum,DC=local" `
        -Restart

    # Verificar que el client s'ha unit correctament (sense reinici)
    (Get-WmiObject Win32_ComputerSystem).Domain
    ```

    ## Què passa durant la unió?

    ```mermaid
    sequenceDiagram
        participant C as 💻 Client W11
        participant DC as 🖥️ DC (cirvianum.local)

        C->>DC: Contacta via DNS → troba el DC
        C->>DC: Autentifica administrador (Kerberos)
        DC-->>C: Credencials vàlides ✅
        DC->>DC: Crea compte d'equip CN=PC-AULA01
        DC-->>C: Confirmació d'unió
        C->>C: 🔄 Reinicia
        C->>DC: Primer inici de sessió de domini
        DC-->>C: Aplicació de GPO + perfil
    ```

    Quan la unió té èxit, a Active Directory apareix un nou objecte de tipus **Equip** al contenidor `Computers` (o a la UO especificada).

    ## Primer inici de sessió al domini

    Després del reinici, a la pantalla d'inici de sessió:

    - Usuari: `CIRVIANUM\maria.puig` o simplement `maria.puig@cirvianum.local`
    - Contrasenya: la contrasenya del compte de domini

    !!! tip "Si el client mostra 'Iniciar sessió en: NOM-PC' en lloc del domini, fes clic a **'Canvia d'usuari'** i escriu el nom d'usuari amb el prefix del domini: `CIRVIANUM\maria.puig`."

    ## Errors freqüents i solucions

    | Error | Causa | Solució |
    |-------|-------|---------|
    | `No s'ha pogut trobar el domini` | DNS del client no apunta al DC | Canvia DNS preferit a IP del DC |
    | `No s'han pogut contactar els controladors de domini` | Firewall o problema de xarxa | `ping IP_DC`, revisa regles de firewall |
    | `Nom d'usuari o contrasenya incorrectes` | Credencials de l'admin del domini errònies | Verifica usuari i contrasenya al DC |
    | `El nom de l'ordinador ja existeix` | Un PC amb el mateix nom ja és al domini | Canvia el nom del PC client o elimina el compte d'equip vell |

    ??? question "Auto-avaluació"

        **1.** Quin és el primer prerequisit que has de verificar abans d'intentar unir un Windows 11 al domini?

        ??? success "Resposta"
            Que el **DNS preferit del client apunti a la IP del DC** (`10.0.2.10`), no a `8.8.8.8` ni al router. Sense DNS correcte, el client no pot resoldre el nom del domini (`cirvianum.local`) i l'assistent de unió falla immediatament. Verifica amb `nslookup cirvianum.local` al client.

        **2.** On apareix el compte d'equip a Active Directory després d'una unió exitosa?

        ??? success "Resposta"
            Al contenidor **`Computers`** del domini per defecte, o a la UO especificada amb el paràmetre `-OUPath` si s'ha usat PowerShell. Des d'ADUC, pots moure'l posteriorment a la UO `Equips-Aula` per aplicar-hi GPO específiques d'equip.

        **3.** Quin paràmetre de `Add-Computer` permet col·locar el compte d'equip directament a la UO correcta en el moment de la unió?

        ??? success "Resposta"
            El paràmetre `-OUPath` seguit del Distinguished Name de la UO destí. Per exemple: `-OUPath "OU=Equips-Aula,OU=Equips,DC=cirvianum,DC=local"`. Evita haver de moure el compte d'equip manualment a ADUC després de la unió.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 6.1 · Uneix el client Windows 11 al domini

    **Objectiu**: completar la unió d'un client Windows 11 al domini `cirvianum.local`.

    **Temps estimat**: 30 minuts

    **Prerequisit**: DC operatiu, client W11 en xarxa, DNS configurat (Activitat 6.2 primer)

    ---

    ### Checklist pre-unió

    Verifica des del client **abans** d'intentar la unió:

    ```cmd
    :: 1. Connectivitat al DC
    ping 10.0.2.10

    :: 2. Resolució del domini via DNS
    nslookup cirvianum.local

    :: 3. Confirma que el DNS preferit és el DC
    ipconfig /all
    ```

    | Comprovació | Resultat esperat | OK? |
    |-------------|-----------------|-----|
    | `ping 10.0.2.10` | Respostes rebudes | |
    | `nslookup cirvianum.local` | Resol a `10.0.2.10` | |
    | DNS preferit a `ipconfig /all` | `10.0.2.10` (no `8.8.8.8`) | |

    ### Unió

    1. Canvia el nom del PC a `PC-AULA01` (reinicia si cal)
    2. Uneix-te al domini `cirvianum.local` via GUI o PowerShell
    3. Reinicia el client
    4. Inicia sessió com a `maria.puig` amb contrasenya `P@ssw0rd!`
    5. Documenta el primer inici de sessió (captura de l'escriptori mostrant el nom d'usuari)

    ### Verifica al servidor

    ```powershell
    # Comprova que el compte d'equip existeix al domini
    Get-ADComputer -Filter {Name -like "PC-AULA*"} |
        Select-Object Name, DistinguishedName
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"unir Windows 11 dominio Active Directory paso a paso"`
        - `"Add-Computer PowerShell join domain Windows 11"`
        - `"Windows 11 join Active Directory domain VirtualBox"`
