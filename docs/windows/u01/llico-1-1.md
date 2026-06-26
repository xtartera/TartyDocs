---
title: "Lliçó 1.1 - Introducció a Windows Server i a les xarxes client-servidor"
module: Windows Server
tags:
  - teoria
  - activitat
---

# Lliçó 1.1 - Introducció a Windows Server i a les xarxes client-servidor

=== "Apunts"

    ## Objectius d'aprenentatge

    En acabar aquesta lliçó seràs capaç de:

    - Entendre què és un sistema operatiu en xarxa.
    - Diferenciar un sistema client d'un sistema servidor.
    - Comprendre el paper de Windows Server dins d'una empresa.
    - Identificar els principals serveis que ofereix un servidor.
    - Entendre per què avui dia la majoria de servidors són virtuals.

    ---

    ## 1. Què és un sistema operatiu en xarxa?

    Quan utilitzes un ordinador a casa, normalment tota la informació i els
    programes es troben al mateix equip. Si aquest ordinador deixa de
    funcionar, ningú més hi pot accedir.

    En canvi, una empresa necessita que molts usuaris comparteixin
    informació, impressores, aplicacions i recursos de manera segura. Per
    aconseguir-ho s'utilitza un **sistema operatiu en xarxa**, com **Windows
    Server**, que centralitza els serveis i facilita l'administració.

    !!! tip "Recorda"
        Windows Server no està pensat perquè els usuaris hi treballin directament.
        La seva funció és oferir serveis als ordinadors de la xarxa.

    ---

    ## 2. Arquitectura client-servidor

    ``` mermaid
    flowchart TD
        WS[Windows Server] --> AD[Active Directory]
        WS --> DNS[DNS]
        WS --> FS[Fitxers]
        AD --> C1[Client 1]
        AD --> C2[Client 2]
        DNS --> C1
        DNS --> C2
        FS --> C1
        FS --> C2
    ```

    ---

    ## 3. Què és Windows Server?

    Windows Server és el sistema operatiu de Microsoft orientat a empreses.

    | Servei | Funció |
    |--------|--------|
    | Active Directory | Gestió centralitzada d'usuaris i equips |
    | DNS | Resolució de noms de domini |
    | DHCP | Assignació automàtica d'adreces IP |
    | Fitxers | Compartició de carpetes i permisos |
    | Impressió | Gestió centralitzada d'impressores |
    | GPO | Polítiques de seguretat per a tots els equips |

    ---

    ## 4. Virtualització

    La virtualització permet executar diversos servidors sobre un mateix
    equip físic.

    **Avantatges:**

    - Reducció de costos de maquinari.
    - Millor aprofitament dels recursos.
    - Possibilitat de fer *snapshots* (punts de restauració).
    - Recuperació ràpida davant de fallades.
    - Facilitat per crear entorns de pràctiques.

    !!! warning "Error habitual"
        No configuris mai el servidor amb IP dinàmica. Un servidor sempre ha de tenir IP fixa.

    ---

    ## 5. Bones pràctiques

    - Assignar IP fixa al servidor.
    - Posar un nom descriptiu a l'equip (ex. `SRV-WIN01`).
    - Documentar tots els canvis de configuració.
    - Comprovar sempre que el servei DNS funciona correctament.

    ---

    ## Resum

    Un sistema operatiu en xarxa com Windows Server permet centralitzar
    els serveis d'una empresa: autenticació, DNS, DHCP, fitxers i
    impressió. La majoria de servidors actuals s'executen sobre màquines
    virtuals per optimitzar el maquinari i facilitar la gestió.

    ---

    ## Autoavaluació

    1. Quina diferència hi ha entre un client i un servidor?
    2. Què és Windows Server i per a qui està pensat?
    3. Quins sis serveis principals ofereix Windows Server?
    4. Per què és útil la virtualització en un entorn empresarial?
    5. Per quin motiu un servidor ha de tenir IP fixa?

=== "Activitat 1.1.1"

    ## ACTIVITAT 1.1.1 — Instal·lació de Windows Server en VirtualBox

    **Durada estimada:** 2 hores  
    **Nivell:** Inicial

    ---

    ### Objectiu

    Instal·lar Windows Server 2022 en una màquina virtual i configurar els
    paràmetres bàsics inicials.

    ---

    ### Material necessari

    - VirtualBox instal·lat a l'ordinador.
    - ISO de Windows Server 2022 (proporcionada pel professor).
    - Mínim 4 GB de RAM disponible.

    ---

    ### Procediment

    **1. Crear la màquina virtual**

    - Obre VirtualBox i fes clic a **Nova**.
    - Nom: `SRV-WIN01`
    - Tipus: `Microsoft Windows`
    - Versió: `Windows 2022 (64-bit)`
    - RAM: `2048 MB` mínim (recomanat 4096 MB)
    - Disc dur: `60 GB` (VDI, expansió dinàmica)

    **2. Configurar la xarxa**

    - A la configuració de la MV, ves a **Xarxa**.
    - Adaptador 1: **Xarxa NAT** (per tenir accés a internet durant la instal·lació).

    **3. Instal·lar Windows Server**

    - Munta la ISO a la unitat òptica virtual.
    - Inicia la màquina i segueix l'assistent d'instal·lació.
    - Selecciona **Windows Server 2022 Standard (Desktop Experience)**.
    - Estableix la contrasenya de l'administrador: `P@ssw0rd` (entorn de pràctiques).

    **4. Configuració inicial post-instal·lació**

    ```powershell
    # Canviar el nom del servidor
    Rename-Computer -NewName "SRV-WIN01" -Restart

    # Assignar IP fixa (després del reinici)
    New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 192.168.1.10 -PrefixLength 24 -DefaultGateway 192.168.1.1
    Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses 8.8.8.8
    ```

    ---

    ### Lliurament

    Captura de pantalla del **Server Manager** amb el nom `SRV-WIN01` visible i la IP fixa configurada.

    ---

    ### Criteris d'avaluació

    | Criteri | Punts |
    |---------|-------|
    | MV creada amb els paràmetres correctes | 2 |
    | Windows Server instal·lat correctament | 3 |
    | Nom del servidor configurat | 2 |
    | IP fixa assignada | 3 |
    | **Total** | **10** |

=== "Vídeo"

    ## Recursos de vídeo

    !!! info "Pròximament"
        Els vídeos d'aquesta lliçó s'afegiran aviat.

    <!-- Per incrustar un vídeo de YouTube, utilitza:
    <iframe width="100%" height="400"
    src="https://www.youtube.com/embed/ID_DEL_VIDEO"
    frameborder="0" allowfullscreen></iframe>
    -->
