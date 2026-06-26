---
title: DNS integrat amb Active Directory
tags:
  - active directory
  - DNS
  - xarxa
  - UT1
---

# :material-dns: DNS integrat amb Active Directory

!!! abstract "Concepte clau"
    Active Directory **depèn completament de DNS** per funcionar. Quan promous un servidor a DC, el DNS s'instal·la automàticament i crea una zona integrada amb AD. Si el DNS falla o els clients apunten a un DNS incorrecte, no poden trobar el DC i no s'autentiquen.

=== ":material-notebook-outline: Apunts"

    ## Per què AD necessita DNS?

    Active Directory usa DNS per respondre preguntes fonamentals:

    - "On és el controlador de domini del domini `cirvianum.local`?"
    - "Quin servidor gestiona l'autenticació Kerberos?"
    - "On puc trobar el servei LDAP?"

    Aquestes preguntes es responen amb **registres SRV** al DNS, que els clients consulten automàticament quan s'uneixen o inicien sessió al domini.

    ```mermaid
    sequenceDiagram
        participant C as 💻 Client Windows 11
        participant DNS as 🌐 DNS (al DC)
        participant DC as 🖥️ DC (cirvianum.local)

        C->>DNS: On és el DC de cirvianum.local?
        DNS-->>C: DC és a 10.0.2.10 (registre SRV + A)
        C->>DC: Sol·licita autenticació Kerberos
        DC-->>C: Tiquet d'autenticació concedit ✅
    ```

    ## Zones DNS creades automàticament

    Quan el servidor es promou a DC amb DNS integrat, es creen dues zones automàticament:

    | Zona | Tipus | Funció |
    |------|-------|--------|
    | **`cirvianum.local`** | Zona de cerca directa (Forward) | Tradueix noms → IP |
    | **`10.0.2.in-addr.arpa`** | Zona de cerca inversa (Reverse) | Tradueix IP → nom |

    ### Registres automàtics de la zona `cirvianum.local`

    | Tipus | Nom | Valor | Funció |
    |-------|-----|-------|--------|
    | **A** | `SRV-WS2022` | `10.0.2.10` | Adreça IP del servidor |
    | **SRV** | `_ldap._tcp` | `SRV-WS2022.cirvianum.local` | Localitza el servei LDAP (AD) |
    | **SRV** | `_kerberos._tcp` | `SRV-WS2022.cirvianum.local` | Localitza el servei Kerberos |
    | **SRV** | `_gc._tcp` | `SRV-WS2022.cirvianum.local` | Localitza el Global Catalog |

    ## DNS integrat vs. DNS estàndard

    El DNS del DC usa **zones integrades amb Active Directory** (AD-integrated zones):

    | | DNS estàndard | DNS integrat amb AD |
    |-|:------------:|:-------------------:|
    | **Emmagatzematge** | Fitxers .dns | Base de dades AD (NTDS.dit) |
    | **Replicació** | Manual (zona secundària) | Automàtica entre DCs |
    | **Seguretat** | Qualsevol pot crear registres | Només membres del domini |
    | **Actualitzacions dinàmiques** | Opcional | Segures (autenticades) |

    ## Gestió del DNS via eina gràfica

    **Server Manager → Tools → DNS Manager**:

    ```
    📁 SRV-WS2022
    ├── 📁 Zones de cerca directa
    │   └── 📁 cirvianum.local
    │       ├── 🔵 (mateixa carpeta) → registre SOA
    │       ├── 🔵 SRV-WS2022 → 10.0.2.10 (A)
    │       └── 📁 _tcp
    │           ├── 🔵 _ldap → SRV-WS2022.cirvianum.local
    │           └── 🔵 _kerberos → SRV-WS2022.cirvianum.local
    └── 📁 Zones de cerca inversa
        └── 📁 10.0.2.x Subnet
            └── 🔵 10 → SRV-WS2022.cirvianum.local (PTR)
    ```

    ## Configuració DNS als clients

    !!! danger "Error crític — el DNS del client ha d'apuntar al DC"
        Quan un client Windows 11 s'uneix al domini `cirvianum.local`, el seu **servidor DNS preferit ha de ser la IP del DC** (`10.0.2.10`), **no** `8.8.8.8` ni el router.

        Si el DNS del client apunta a `8.8.8.8`:
        - `8.8.8.8` no coneix el domini `cirvianum.local`
        - El client no pot trobar el DC
        - La unió al domini falla amb l'error "no s'ha pogut trobar el domini"

    Configuració correcta al client:

    | Paràmetre | Valor |
    |-----------|-------|
    | DNS preferit | `10.0.2.10` (IP del DC) |
    | DNS alternatiu | `8.8.8.8` (per a resolució externa) |

    ## Verificació del DNS post-promoció

    ```powershell
    # Al servidor DC: verifica els registres SRV
    Resolve-DnsName -Name "_ldap._tcp.cirvianum.local" -Type SRV

    # Al servidor DC: verifica el registre A del servidor
    Resolve-DnsName -Name "SRV-WS2022.cirvianum.local" -Type A

    # Al client: verifica que pot trobar el DC
    nslookup cirvianum.local 10.0.2.10

    # Al client: verifica els registres SRV del DC
    nslookup -type=SRV _ldap._tcp.cirvianum.local
    ```

    ## Reenviadors DNS (Forwarders)

    Els **reenviadors** permeten que el DNS del DC resolgui noms externs (google.com, microsoft.com) reenviant les consultes a servidors DNS d'internet:

    **Via DNS Manager**:
    1. Clic dret al servidor DNS → **Propietats**
    2. Pestanya **Reenviadors** → **Edita**
    3. Afegeix `8.8.8.8` (Google) i `1.1.1.1` (Cloudflare)

    ```powershell
    # Via PowerShell
    Set-DnsServerForwarder -IPAddress "8.8.8.8","1.1.1.1"
    Get-DnsServerForwarder
    ```

    ??? question "Auto-avaluació"

        **1.** Un client Windows 11 té el DNS configurat a `8.8.8.8`. Intenta unir-se al domini `cirvianum.local` i obté l'error "no s'ha pogut trobar el domini". Quin és el problema i com el soluciones?

        ??? success "Resposta"
            El problema és que `8.8.8.8` (DNS de Google) **no coneix el domini privat `cirvianum.local`**. El client no pot trobar el DC perquè no pot resoldre el nom del domini. Solució: canvia el DNS preferit del client a la **IP del DC** (`10.0.2.10`). El DNS integrat del DC sí que coneix el domini i retornarà l'adreça del controlador.

        **2.** Quin tipus de registre DNS usa Active Directory per anunciar on es troben els seus serveis (LDAP, Kerberos)?

        ??? success "Resposta"
            Registres **SRV** (Service). Aquests registres indiquen el nom del servidor i el port que proporciona un servei concret. Per exemple, `_ldap._tcp.cirvianum.local` apunta al DC que ofereix el servei LDAP al port 389. Els clients Windows els consulten automàticament en iniciar sessió.

        **3.** Per quin motiu les zones DNS "integrades amb AD" són més segures que les zones DNS estàndard?

        ??? success "Resposta"
            Les zones integrades amb AD emmagatzemen les dades al directori (NTDS.dit) en lloc de fitxers .dns, la qual cosa permet **actualitzacions dinàmiques segures**: només els membres autenticats del domini poden crear o modificar registres DNS. En zones estàndard, qualsevol equip pot crear registres (DNS spoofing). A més, la replicació és automàtica entre tots els DCs, sense configuració addicional.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.5 · Verifica i configura el DNS del domini

    **Objectiu**: verificar que els registres DNS s'han creat correctament i que els clients poden resoldre el nom del domini.

    **Temps estimat**: 25 minuts

    **Prerequisit**: DC promogut i domini `cirvianum.local` operatiu (Activitat 4.4)

    ---

    ### Part A – Exploració al DNS Manager

    1. Obre **DNS Manager** des de Tools a Server Manager
    2. Expandeix **Zones de cerca directa → cirvianum.local**
    3. Documenta els registres que hi ha:
        - Registres de tipus A (quants? quins noms?)
        - Registres de tipus SRV (cerca a `_tcp`)
        - Registres NS i SOA (qui és l'autor i el nameserver?)

    ### Part B – Verificació per línea d'ordres

    Al **servidor DC**, executa:

    ```powershell
    # Verifica registres SRV
    Resolve-DnsName "_ldap._tcp.cirvianum.local" -Type SRV
    Resolve-DnsName "_kerberos._tcp.cirvianum.local" -Type SRV

    # Verifica registre del servidor
    Resolve-DnsName "SRV-WS2022.cirvianum.local"
    ```

    Al **client Windows 11** (amb DNS configurat al DC):

    ```cmd
    nslookup cirvianum.local
    nslookup SRV-WS2022.cirvianum.local
    ```

    ### Part C – Configura els reenviadors

    Afegeix `8.8.8.8` i `1.1.1.1` com a reenviadors DNS i verifica que des del servidor pots resoldre `google.com` amb `nslookup google.com`.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Active Directory DNS integration explained"`
        - `"DNS SRV records Active Directory how they work"`
        - `"Windows Server DNS Manager tutorial zones records"`
        - `"DNS forwarders Windows Server configuration"`
