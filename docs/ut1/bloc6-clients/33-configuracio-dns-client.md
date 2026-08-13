---
title: Configuració DNS al client
tags:
  - DNS
  - clients
  - xarxa
  - UT1
---

# :material-dns: Configuració DNS al client

!!! abstract "Concepte clau"
    El client Windows ha d'apuntar al **DNS del DC** per poder trobar el domini i autenticar-se. Configurar el DNS incorrectament (usant `8.8.8.8` o el router) és la causa número 1 dels errors de unió al domini i d'autenticació fallida.

=== ":material-notebook-outline: Apunts"

    ## Per què el DNS del client és tan important?

    Quan un client vol unir-se o autenticar-se al domini `cirvianum.local`, fa una consulta DNS:

    > "Quina és la IP del servidor que gestiona `cirvianum.local`?"

    - Si el DNS és `8.8.8.8` (Google): **no sap res** de dominis privats → error
    - Si el DNS és el router: **tampoc sap** de dominis AD privats → error
    - Si el DNS és el DC (`10.0.2.10`): **coneix el domini** → connecta correctament

    ```mermaid
    graph LR
        C["💻 Client\nDNS: 8.8.8.8"]
        G["🌐 Google DNS\n(8.8.8.8)"]
        DC["🖥️ DC\n10.0.2.10"]

        C -->|"cirvianum.local?"| G
        G -->|"❌ No ho conec"| C

        C2["💻 Client\nDNS: 10.0.2.10"]
        C2 -->|"cirvianum.local?"| DC
        DC -->|"✅ És aquí: 10.0.2.10"| C2
    ```

    ## Configuració recomanada per al laboratori

    | Paràmetre | Valor |
    |-----------|-------|
    | **DNS preferit** | `10.0.2.10` (IP del DC) |
    | **DNS alternatiu** | `8.8.8.8` (per a resolució externa) |

    El DNS alternatiu permet que el client resolgui noms d'internet (`google.com`, `microsoft.com`) quan el DC no els coneix directament, sempre que el DC tingui reenviadors configurats.

    ## Configuració via GUI (Windows 11)

    1. **Configuració → Xarxa i Internet → Ethernet → [Adaptador] → Edita**
    2. O bé: `Tauler de control → Centre de xarxes → Canvia la configuració de l'adaptador`
    3. Clic dret a l'adaptador → **Propietats**
    4. Selecciona **Protocol Internet versió 4 (TCP/IPv4)** → **Propietats**
    5. Marca **Usa les adreces de servidor DNS següents**:
        - Servidor DNS preferit: `10.0.2.10`
        - Servidor DNS alternatiu: `8.8.8.8`
    6. **D'acord** → **D'acord**

    ## Configuració via PowerShell

    ```powershell
    # Identifica el nom de l'adaptador de xarxa
    Get-NetAdapter | Select-Object Name, Status, MacAddress

    # Configura els servidors DNS (substitueix "Ethernet" pel nom real)
    Set-DnsClientServerAddress `
        -InterfaceAlias "Ethernet" `
        -ServerAddresses "10.0.2.10","8.8.8.8"

    # Verifica la configuració
    Get-DnsClientServerAddress -InterfaceAlias "Ethernet"
    ```

    ## Verificació de la resolució DNS

    Després de configurar el DNS, verifica que el client pot resoldre correctament el domini:

    ```cmd
    :: Verifica configuració actual
    ipconfig /all

    :: Resol el nom del domini
    nslookup cirvianum.local

    :: Resol el nom específic del DC
    nslookup SRV-WS2022.cirvianum.local

    :: Verifica els registres SRV del DC (localitza el controlador)
    nslookup -type=SRV _ldap._tcp.cirvianum.local
    ```

    **Sortida correcta de `nslookup cirvianum.local`:**
    ```text
    Servidor:  SRV-WS2022.cirvianum.local
    Address:   10.0.2.10

    Nombre:    cirvianum.local
    Address:   10.0.2.10
    ```

    **Sortida incorrecta (DNS apunta a 8.8.8.8):**
    ```text
    Servidor:  dns.google
    Address:   8.8.8.8

    *** dns.google no pot trobar cirvianum.local: Non-existent domain
    ```

    ## Esborra la caché DNS si cal

    Si el client ha tingut configuracions de DNS anteriors, pot tenir entrades en caché que causen conflictes:

    ```powershell
    # Esborra la caché DNS del client
    Clear-DnsClientCache

    # Verifica que la caché és buida
    Get-DnsClientCache
    ```

    !!! warning "Canvi freqüent d'error: el client resol `cirvianum.local` correctament però la unió falla igualment. En aquest cas, el problema no és el DNS sinó el **Firewall del DC** que bloqueja els ports necessaris (135, 389, 445). Verifica amb `Test-NetConnection 10.0.2.10 -Port 389`."

    ??? question "Auto-avaluació"

        **1.** Un client té DNS preferit `192.168.1.1` (el router domèstic). Pot resoldre `google.com` però no `cirvianum.local`. Per quin motiu?

        ??? success "Resposta"
            El router (`192.168.1.1`) coneix els servidors DNS d'internet i pot resoldre noms públics com `google.com`. Però el domini privat `cirvianum.local` **no existeix a internet**: és un domini intern que només el DC (`10.0.2.10`) coneix. El router no té cap informació sobre `cirvianum.local` i retorna "Non-existent domain". Solució: canviar el DNS preferit a `10.0.2.10`.

        **2.** Quin registre DNS comproves per verificar que el DC s'ha registrat correctament com a servidor LDAP del domini?

        ??? success "Resposta"
            El registre **SRV** `_ldap._tcp.cirvianum.local`. Es verifica amb `nslookup -type=SRV _ldap._tcp.cirvianum.local`. Si retorna el nom del DC i el port 389, el DNS d'Active Directory funciona correctament. Si no troba el registre, AD DS no s'ha registrat bé al DNS o el DNS del client no apunta al DC.

        **3.** Per quin motiu el DNS alternatiu es configura a `8.8.8.8` i no deixar-lo buit?

        ??? success "Resposta"
            El DC coneix el domini intern (`cirvianum.local`) però per resoldre noms d'internet necessita **reenviadors DNS** configurats. Si el DC no té reenviadors, o falla momentàniament, el DNS alternatiu `8.8.8.8` permet al client continuar resolent noms d'internet. Deixar-lo buit fa que el client perdi connectivitat a internet si el DC no pot reenviar consultes externes.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 6.2 · Configura el DNS al client Windows 11

    **Objectiu**: configurar el DNS del client perquè apunti al DC i verificar la resolució del domini.

    **Temps estimat**: 15 minuts

    **Nota**: fes aquesta activitat **abans** de la 6.1 (unió al domini).

    ---

    ### Part A – Configura el DNS

    Al client Windows 11 (MV), configura:

    - DNS preferit: `10.0.2.10` (IP del teu DC)
    - DNS alternatiu: `8.8.8.8`

    Usa la GUI o PowerShell (ambdues mètodes al dossier amb captura).

    ### Part B – Verifica la resolució

    Executa les quatre ordres de verificació de la secció d'Apunts i documenta la sortida:

    | Ordre | Resultat obtingut | Correcte? |
    |-------|------------------|-----------|
    | `ipconfig /all` (camp DNS) | | |
    | `nslookup cirvianum.local` | | |
    | `nslookup SRV-WS2022.cirvianum.local` | | |
    | `nslookup -type=SRV _ldap._tcp.cirvianum.local` | | |

    ### Part C – Prova la diferència

    1. Canvia temporalment el DNS a `8.8.8.8`
    2. Executa `nslookup cirvianum.local` → documenta l'error
    3. Torna a configurar el DNS a `10.0.2.10`
    4. Esborra la caché amb `Clear-DnsClientCache` i torna a provar

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"configurar DNS Windows 11 Active Directory dominio"`
        - `"nslookup SRV records Active Directory verify"`
        - `"Set-DnsClientServerAddress PowerShell Windows"`
        - `"DNS client configuration join domain Windows"`
