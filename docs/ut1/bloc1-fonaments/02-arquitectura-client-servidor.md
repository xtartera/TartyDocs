---
title: Arquitectura client-servidor
tags:
  - fonaments
  - xarxa
  - UT1
---

# :material-lan: Arquitectura client-servidor

!!! abstract "Concepte clau"
    En l'arquitectura client-servidor, un servidor centralitza recursos i serveis que els clients accedeixen a través de la xarxa, eliminant la necessitat de gestionar cada equip per separat.

=== ":material-notebook-outline: Apunts"

    ## El model client-servidor

    L'**arquitectura client-servidor** és el model fonamental de les xarxes informàtiques d'empresa. En lloc que cada ordinador gestioni els seus propis recursos de manera independent, existeix un **servidor** que centralitza:

    - **Autenticació**: qui pot iniciar sessió i amb quins permisos
    - **Fitxers i impressores**: recursos compartits per a tots els usuaris
    - **Polítiques de seguretat**: normes aplicades de manera uniforme
    - **Còpies de seguretat**: protecció centralitzada de les dades

    ## Diagrama del model

    ```mermaid
    graph TD
        SRV[🖥️ Servidor<br/>Windows Server 2022]

        C1[💻 Client 1<br/>Windows 11]
        C2[💻 Client 2<br/>Windows 11]
        C3[💻 Client 3<br/>Windows 11]

        SRV -- "Autenticació (AD)" --> C1
        SRV -- "Fitxers compartits" --> C2
        SRV -- "GPO · Polítiques" --> C3

        C1 & C2 & C3 -- "Peticions" --> SRV
    ```

    ## Tipus de servidors per rol

    Un servidor no és un tipus de màquina: és un **rol**. Una mateixa màquina pot tenir múltiples rols actius alhora:

    | Rol | Funció | Servei Windows Server |
    |-----|--------|-----------------------|
    | **AD DS** | Autenticació i directori corporatiu | Active Directory Domain Services |
    | **DNS** | Traducció de noms a adreces IP | DNS Server |
    | **DHCP** | Assignació automàtica d'IPs als clients | DHCP Server |
    | **File Server** | Carpetes i fitxers compartits | File and Storage Services |
    | **Web** | Allotjament de pàgines i aplicacions web | Internet Information Services (IIS) |
    | **Print** | Impressores compartides en xarxa | Print and Document Services |
    | **Hyper-V** | Virtualització de màquines virtuals | Hyper-V |

    ## Client-servidor vs peer-to-peer

    ```mermaid
    graph LR
        subgraph P2P["Peer-to-peer"]
            direction LR
            P1[💻 PC 1] <--> P2[💻 PC 2]
            P2 <--> P3[💻 PC 3]
            P1 <--> P3
        end

        subgraph CS["Client-servidor"]
            direction TB
            SRV2[🖥️ Servidor]
            CL1[💻 Client 1] --> SRV2
            CL2[💻 Client 2] --> SRV2
            CL3[💻 Client 3] --> SRV2
        end
    ```

    | | Peer-to-peer | Client-servidor |
    |-|:------------:|:---------------:|
    | **Gestió** | Distribuïda (cada PC) | Centralitzada (servidor) |
    | **Seguretat** | Difícil de controlar | Polítiques uniformes |
    | **Escalabilitat** | Fins a ~10 PCs | Centenars o milers |
    | **Cost inicial** | Baix | Alt (llicències i maquinari) |
    | **Cost de gestió** | Alt (tocar cada PC) | Baix (canvi al servidor) |
    | **Exemple típic** | Casa, grup petit | Empresa, escola, hospital |

    !!! tip "Exemple real al Cirvianum"
        Quan inicieu sessió al PC de l'aula, el vostre usuari i contrasenya es verifiquen al servidor d'**Active Directory**, no al PC local. Per això podeu iniciar sessió a qualsevol PC de l'escola i trobar el vostre perfil.

    !!! warning "Error freqüent"
        Confondre el servidor amb "el PC més potent de la sala". La potència del maquinari no defineix si un equip és servidor: és el **rol que té** i el **SO que executa** el que el converteix en servidor.

    ??? question "Auto-avaluació"

        **1.** En un model client-servidor, on s'emmagatzema la informació d'autenticació dels usuaris?

        ??? success "Resposta"
            Al servidor, concretament a **Active Directory Domain Services** que s'executa al controlador de domini. El client no emmagatzema credencials corporatives.

        **2.** Quina diferència hi ha entre un servidor de fitxers i un servidor web?

        ??? success "Resposta"
            Un servidor de fitxers comparteix carpetes per a la xarxa interna via protocol SMB (accés des de l'Explorador de fitxers). Un servidor web publica pàgines accessibles via HTTP/HTTPS, normalment des de qualsevol lloc d'internet.

        **3.** Una PIME amb 8 empleats usa peer-to-peer. Quins problemes pot tenir quan arribi al 15è empleat?

        ??? success "Resposta"
            Dificultats per gestionar permisos de 15 usuaris en múltiples PCs, impossibilitat de tenir una política de contrasenyes uniforme, còpies de seguretat no centralitzades i necessitat d'anar PC per PC per instal·lar programes o fer canvis.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 1.2 · Identifica els servidors del teu entorn

    **Objectiu**: relacionar el model client-servidor amb la infraestructura real de l'escola i el món professional.

    **Temps estimat**: 15 minuts

    ---

    ### Reflexió guiada

    1. Quan encens el PC de l'aula i inicies sessió, quins passos creus que fa el sistema per verificar la teva contrasenya? A quin servidor es connecta?

    2. Si el servidor del centre cau, quins serveis deixen de funcionar immediatament? Quins podrien continuar temporalment?

    3. Llista **3 avantatges concrets** d'usar un servidor centralitzat en una escola amb 400 alumnes i 50 professors.

    4. Indica un servei que uses diàriament fora de l'escola i que funcioni amb model client-servidor (pensa en streaming, jocs online, correu electrònic...).

    ### Esquema a completar

    Dibuixa (a mà o digitalment) un diagrama senzill de la infraestructura de xarxa que creus que té el teu institut. Indica:
    
    - Quants servidors hi pot haver i quins rols tenen
    - Com es connecten els PCs dels alumnes
    - Quin dispositiu gestiona la connexió a internet

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"arquitectura cliente servidor explicado"`
        - `"client server model explained simply"`
        - `"Windows Server roles and features overview"`
        - `"peer to peer vs client server network"`
