---
title: "Lliçó 1.1 - Introducció a Windows Server"
module: Windows Server
tags:
  - teoria
  - activitat
---

# :material-server: Lliçó 1.1 — Introducció a Windows Server i les xarxes client-servidor

=== ":material-book-open: Apunts"

    ## Objectius d'aprenentatge

    En acabar aquesta lliçó seràs capaç de:

    - [ ] Entendre què és un sistema operatiu en xarxa.
    - [ ] Diferenciar un sistema client d'un sistema servidor.
    - [ ] Comprendre el paper de Windows Server dins d'una empresa.
    - [ ] Identificar els principals serveis que ofereix un servidor.
    - [ ] Entendre per què la majoria de servidors actuals són virtuals.

    ---

    ## 1. Què és un sistema operatiu en xarxa?

    Quan utilitzes un ordinador a casa, tota la informació i els programes es
    troben al mateix equip. Si l'ordinador falla, ningú més hi pot accedir.

    En canvi, una empresa necessita que molts usuaris comparteixin recursos de
    manera segura i centralitzada. Per aconseguir-ho s'utilitza un
    **sistema operatiu en xarxa** com **Windows Server**.

    !!! tip "Recorda"
        Windows Server **no** està pensat perquè els usuaris hi treballin directament.
        La seva funció és oferir serveis als ordinadors de la xarxa.

    ---

    ## 2. Arquitectura client-servidor

    ``` mermaid
    flowchart LR
        subgraph Empresa
            WS[🖥️ Windows Server]
            WS --> AD[Active Directory]
            WS --> DNS[DNS]
            WS --> FS[Fitxers]
        end
        subgraph Clients
            C1[💻 Client 1]
            C2[💻 Client 2]
        end
        AD --> C1
        AD --> C2
        DNS --> C1
        DNS --> C2
        FS --> C1
        FS --> C2
    ```

    ---

    ## 3. Serveis principals de Windows Server

    | :material-cog: Servei | :material-information: Funció |
    |-----------------------|-------------------------------|
    | Active Directory (AD DS) | Gestió centralitzada d'usuaris i equips |
    | DNS | Resolució de noms de domini |
    | DHCP | Assignació automàtica d'adreces IP |
    | File Services | Compartició de carpetes i permisos |
    | Print Services | Gestió centralitzada d'impressores |
    | Group Policy (GPO) | Polítiques de seguretat per a tots els equips |

    ---

    ## 4. Virtualització

    La virtualització permet executar **diversos servidors** sobre un únic
    equip físic, cosa que avui és la norma en qualsevol empresa.

    ???+ info "Per què virtualitzar?"
        - :white_check_mark: Reducció de costos de maquinari
        - :white_check_mark: Millor aprofitament dels recursos
        - :white_check_mark: *Snapshots* (punts de restauració ràpida)
        - :white_check_mark: Recuperació davant de fallades
        - :white_check_mark: Entorns de pràctiques senzills de crear i eliminar

    !!! warning "Error habitual"
        No configuris mai el servidor amb **IP dinàmica**. Un servidor sempre necessita
        una adreça IP fixa i coneguda per tots els clients de la xarxa.

    ---

    ## 5. Bones pràctiques inicials

    <div class="grid cards" markdown>

    - :material-ip-network: **IP fixa**

        Assigna sempre una adreça estàtica al servidor.

    - :material-rename-box: **Nom descriptiu**

        Utilitza noms com `SRV-WIN01` per identificar fàcilment l'equip.

    - :material-file-document-edit: **Documentació**

        Registra tots els canvis de configuració que facis.

    - :material-dns: **DNS funcional**

        Comprova sempre que el DNS respon correctament abans de continuar.

    </div>

    ---

    ## Resum

    Un sistema operatiu en xarxa com Windows Server centralitza tots els
    serveis d'una empresa: autenticació (AD), noms (DNS), adreces (DHCP),
    fitxers i impressió. Avui, la majoria de servidors s'executen com a
    màquines virtuals per optimitzar el maquinari i facilitar la gestió i
    la recuperació davant d'incidències.

    ---

    ## :material-help-circle: Autoavaluació

    ??? question "1. Quina diferència hi ha entre un client i un servidor?"
        El **client** és l'equip que sol·licita serveis (ordinador d'un usuari).
        El **servidor** és l'equip que ofereix i gestiona aquests serveis de forma centralitzada.

    ??? question "2. Què és Windows Server i per a qui està pensat?"
        És el sistema operatiu de Microsoft orientat a empreses. Està pensat per a
        administradors de sistemes, no per a usuaris finals.

    ??? question "3. Quins sis serveis principals ofereix Windows Server?"
        AD DS, DNS, DHCP, File Services, Print Services i Group Policy (GPO).

    ??? question "4. Per què és útil la virtualització en un entorn empresarial?"
        Permet estalviar maquinari, fer còpies ràpides (*snapshots*), recuperar-se
        d'errors i crear entorns de prova sense cost addicional.

    ??? question "5. Per quin motiu un servidor ha de tenir IP fixa?"
        Perquè tots els clients de la xarxa han de poder localitzar-lo sempre
        a la mateixa adreça. Si l'adreça canviés, els serveis deixarien de funcionar.

=== ":material-hammer-wrench: Activitat 1.1.1"

    ## ACTIVITAT 1.1.1 — Instal·lació de Windows Server en VirtualBox

    <div class="grid cards" markdown>

    - :material-clock-outline: **Durada estimada**

        2 hores

    - :material-signal: **Nivell**

        Inicial

    - :material-tools: **Eina**

        Oracle VirtualBox

    </div>

    ---

    ### Objectiu

    Instal·lar Windows Server 2022 en una màquina virtual i configurar els
    paràmetres bàsics inicials.

    ---

    ### Material necessari

    - VirtualBox instal·lat a l'ordinador.
    - ISO de Windows Server 2022 (proporcionada pel professor).
    - Mínim 4 GB de RAM disponible a l'ordinador amfitrió.

    ---

    ### Procediment

    !!! note "Pas 1 — Crear la màquina virtual"
        - Obre VirtualBox → **Nova**
        - Nom: `SRV-WIN01`
        - Tipus: `Microsoft Windows` / Versió: `Windows 2022 (64-bit)`
        - RAM: `2048 MB` mínim (recomanat `4096 MB`)
        - Disc dur: `60 GB` (VDI, expansió dinàmica)

    !!! note "Pas 2 — Configurar la xarxa"
        - Configuració de la MV → **Xarxa**
        - Adaptador 1: **Xarxa NAT** (accés a internet durant la instal·lació)

    !!! note "Pas 3 — Instal·lar Windows Server"
        - Munta la ISO a la unitat òptica virtual
        - Inicia la màquina i segueix l'assistent
        - Selecciona **Windows Server 2022 Standard (Desktop Experience)**
        - Contrasenya de l'administrador: `P@ssw0rd` *(només en entorn de pràctiques)*

    !!! note "Pas 4 — Configuració post-instal·lació"

        ```powershell
        # Canviar el nom del servidor
        Rename-Computer -NewName "SRV-WIN01" -Restart

        # Assignar IP fixa (després del reinici)
        New-NetIPAddress `
            -InterfaceAlias "Ethernet" `
            -IPAddress 192.168.1.10 `
            -PrefixLength 24 `
            -DefaultGateway 192.168.1.1

        Set-DnsClientServerAddress `
            -InterfaceAlias "Ethernet" `
            -ServerAddresses 8.8.8.8
        ```

    ---

    ### Lliurament

    !!! success "Captura de pantalla requerida"
        **Server Manager** amb el nom `SRV-WIN01` visible i la IP fixa configurada.

    ---

    ### Criteris d'avaluació

    | Criteri | Punts |
    |---------|:-----:|
    | MV creada amb els paràmetres correctes | 2 |
    | Windows Server instal·lat correctament | 3 |
    | Nom del servidor configurat (`SRV-WIN01`) | 2 |
    | IP fixa assignada correctament | 3 |
    | **Total** | **10** |

=== ":material-play-circle: Vídeo"

    ## Recursos de vídeo

    !!! info "Pròximament"
        Els vídeos d'aquesta lliçó s'afegiran aviat.

    <!--
    Quan tinguis la URL del vídeo, substitueix ID_VIDEO per l'identificador de YouTube:

    <iframe
      width="100%"
      height="420"
      src="https://www.youtube.com/embed/ID_VIDEO"
      title="Lliçó 1.1 - Introducció a Windows Server"
      frameborder="0"
      allowfullscreen>
    </iframe>
    -->
