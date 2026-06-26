---
title: Configuració inicial del servidor
tags:
  - instal·lació
  - xarxa
  - configuració
  - UT1
---

# :material-tune: Configuració inicial del servidor

!!! abstract "Concepte clau"
    Just després de la instal·lació, el servidor necessita una configuració bàsica obligatòria: nom, IP estàtica, zona horària i actualitzacions. Sense IP estàtica, tots els serveis que depenguin de la seva adreça (AD, DNS, perfils...) fallaran de manera imprevisible.

=== ":material-notebook-outline: Apunts"

    ## Per quin ordre configures el servidor?

    L'ordre de configuració importa. Alguns canvis (com canviar el nom) requereixen reinici, i fer-los en l'ordre incorrecte pot implicar reiniciar dues vegades innecessàriament.

    ```mermaid
    graph LR
        A[1️⃣ Canvia el nom\ndel servidor] --> B[🔄 Reinicia]
        B --> C[2️⃣ Assigna\nIP estàtica]
        C --> D[3️⃣ Configura\nzona horària]
        D --> E[4️⃣ Activa\nActualitzacions]
        E --> F[5️⃣ Instantània\n✅ Servidor base]
    ```

    ## 1. Canviar el nom del servidor

    Windows Server s'instal·la amb un nom generat aleatòriament (ex: `WIN-K3J2H7P`). Cal canviar-lo per un nom descriptiu **abans** d'instal·lar cap rol, perquè el nom del servidor queda enregistrat a Active Directory i canviar-lo posteriorment és complex.

    **Convenció de noms recomanada per al laboratori:**

    | Funció | Nom exemple |
    |--------|-------------|
    | Servidor principal | `SRV-WS2022` o `DC01` |
    | Controlador de domini | `DC01-[domini]` |
    | Servidor de fitxers | `FS01` |

    **Via GUI** (Server Manager):
    1. Server Manager → Servidor local → Fes clic al nom actual
    2. Canvia a → escriu el nou nom → Reinicia ara

    **Via PowerShell**:
    ```powershell
    Rename-Computer -NewName "SRV-WS2022" -Restart
    ```

    ## 2. Assignar IP estàtica

    !!! danger "IP dinàmica al servidor = trenca tots els serveis"
        Si el servidor obté la IP per DHCP, cada vegada que s'apaga i s'encén pot tenir una IP diferent. Active Directory, DNS, els clients i els perfils mòbils apunten a una IP concreta. Si canvia, deixa de funcionar tot.

    **Valors per al laboratori** (ajusta la xarxa NAT de VirtualBox):

    | Paràmetre | Valor exemple |
    |-----------|---------------|
    | Adreça IP | `10.0.2.10` |
    | Màscara | `255.255.255.0` (/24) |
    | Porta d'enllaç | `10.0.2.2` (gateway VirtualBox NAT) |
    | DNS preferit | `10.0.2.10` (el mateix servidor, un cop instal·lat AD/DNS) |
    | DNS alternatiu | `8.8.8.8` (durant la instal·lació inicial, abans del DNS propi) |

    !!! tip "Un cop instal·lat el rol DNS (Projecte 2), canvia el DNS preferit del servidor a la seva pròpia IP (`127.0.0.1` o la IP estàtica). Deixa `8.8.8.8` com a alternatiu."

    **Via GUI**:
    1. Obre el **Centre de xarxes i recursos compartits** → Canvia la configuració de l'adaptador
    2. Clic dret a l'adaptador → Propietats → Protocol Internet versió 4 (TCP/IPv4) → Propietats
    3. Omple els valors i confirma

    **Via PowerShell**:
    ```powershell
    # Identifica el nom de l'adaptador
    Get-NetAdapter

    # Assigna IP estàtica (substitueix "Ethernet" pel nom real de l'adaptador)
    New-NetIPAddress -InterfaceAlias "Ethernet" `
        -IPAddress "10.0.2.10" `
        -PrefixLength 24 `
        -DefaultGateway "10.0.2.2"

    # Configura DNS
    Set-DnsClientServerAddress -InterfaceAlias "Ethernet" `
        -ServerAddresses "10.0.2.10","8.8.8.8"
    ```

    ## 3. Zona horària

    La diferència horària entre el servidor i els clients pot impedir la unió al domini (Kerberos rebutja sol·licituds amb més de 5 minuts de diferència).

    ```powershell
    # Comprova la zona horària actual
    Get-TimeZone

    # Canvia a la zona horària de Madrid (CET/CEST)
    Set-TimeZone -Id "Romance Standard Time"
    ```

    ## 4. Actualitzacions de Windows

    Aplica les actualitzacions crítiques **abans** d'instal·lar rols. Un servidor desactualitzat és vulnerable.

    ```powershell
    # Instal·la el mòdul de Windows Update
    Install-Module PSWindowsUpdate -Force

    # Cerca i instal·la totes les actualitzacions
    Get-WindowsUpdate -Install -AcceptAll -AutoReboot
    ```

    !!! tip "Després d'aplicar actualitzacions importants, fes una **nova instantània** a VirtualBox: 'WS2022 - Actualitzat i configurat'."

    ## sconfig: l'eina tot-en-un

    `sconfig` és una eina de text interactiva que cobreix tots els passos anteriors des d'una sola interfície:

    ```text
    ===============================================================================
    Configuració del servidor
    ===============================================================================
     1) Pertinença al domini/grup de treball:    WORKGROUP
     2) Nom de l'ordinador:                      WIN-K3J2H7P
     3) Afegeix un administrador local
     4) Configura l'actualització remota         Desactivat
     5) Configuració de Windows Update            Descàrrega i instal·lació autom.
     6) Descarrega e instal·la actualitzacions
     7) Habilita l'Escriptori remot
     8) Configuració de xarxa
     9) Configuració de data i hora
    10) Configuració de la telemetria
    11) Tanca sessió
    12) Reinicia el servidor
    13) Tanca el servidor
    14) Torna a una aplicació de la línia d'ordres
    ===============================================================================
    ```

    ??? question "Auto-avaluació"

        **1.** Per quin motiu és imprescindible configurar una IP estàtica al servidor **abans** d'instal·lar Active Directory?

        ??? success "Resposta"
            Active Directory registra la IP del controlador de domini a la base de dades DNS i als clients. Si el servidor usa DHCP, la seva IP pot canviar en qualsevol reinici. Tots els clients i serveis que depenguin d'aquella IP deixarien de funcionar: la unió al domini, l'autenticació d'usuaris i els perfils mòbils fallarien.

        **2.** Quina és la porta d'enllaç (gateway) que VirtualBox assigna a les xarxes NAT?

        ??? success "Resposta"
            En una xarxa NAT de VirtualBox, la porta d'enllaç és sempre **x.x.x.2** de la subxarxa configurada. Per defecte, la subxarxa NAT és `10.0.2.0/24` i la gateway és **`10.0.2.2`**.

        **3.** Quina relació té la zona horària del servidor amb la unió al domini dels clients?

        ??? success "Resposta"
            El protocol **Kerberos** (usat per Active Directory per a l'autenticació) rebutja sol·licituds si hi ha una diferència horària superior a **5 minuts** entre el client i el servidor. Si les zones horàries no coincideixen, els clients no podran unir-se al domini ni autenticar-se.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 2.5 · Configura el servidor base

    **Objectiu**: aplicar la configuració inicial obligatòria al servidor recen instal·lat.

    **Temps estimat**: 30 minuts

    **Prerequisit**: Windows Server 2022 instal·lat (Activitat 2.4)

    ---

    ### Checklist de configuració

    Completa cada pas en ordre i fes una captura de pantalla com a evidència:

    - [ ] **Nom del servidor** canviat a `SRV-WS2022` (o el nom acordat amb el professor)
    - [ ] Servidor **reiniciat** per aplicar el nou nom
    - [ ] **IP estàtica** configurada (documenta els valors a la taula següent)
    - [ ] **Zona horària** configurada a `Romance Standard Time` (Madrid/Barcelona)
    - [ ] Comprovat amb `ping 8.8.8.8` que hi ha connectivitat a internet
    - [ ] **Instantània** feta: "SRV-WS2022 - Configurat base"

    ### Taula de valors de xarxa (completa-la)

    | Paràmetre | Valor configurat |
    |-----------|-----------------|
    | Nom del servidor | |
    | Adreça IP | |
    | Màscara de subxarxa | |
    | Porta d'enllaç | |
    | DNS preferit | |
    | DNS alternatiu | |

    ### Verificació per PowerShell

    Executa les ordres següents i inclou les captures al dossier:

    ```powershell
    # Nom del servidor
    $env:COMPUTERNAME

    # Configuració de xarxa
    Get-NetIPConfiguration

    # Zona horària
    Get-TimeZone

    # Prova de connectivitat
    Test-Connection 8.8.8.8 -Count 2
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Windows Server 2022 configuracion inicial IP estatica"`
        - `"rename Windows Server PowerShell Rename-Computer"`
        - `"sconfig Windows Server 2022 initial configuration"`
        - `"Windows Server 2022 static IP configuration"`
