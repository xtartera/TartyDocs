---
title: Windows Server 2022 – serveis principals
tags:
  - fonaments
  - windows server
  - UT1
---

# :material-server: Windows Server 2022 – serveis principals

!!! abstract "Concepte clau"
    Windows Server 2022 és el sistema operatiu de servidor de Microsoft. Proporciona rols i característiques per gestionar identitats, fitxers, web, virtualització i més, tot des d'una interfície centralitzada.

=== ":material-notebook-outline: Apunts"

    ## Què és Windows Server?

    **Windows Server** és la família de sistemes operatius de Microsoft dissenyada per a entorns d'empresa. A diferència de Windows 11, no s'usa com a estació de treball personal, sinó com a plataforma per executar **serveis i rols** que donen suport a tota la infraestructura de la xarxa.

    La versió actual és **Windows Server 2022**, publicada el 2021, amb suport fins al 2031.

    ## Edicions de Windows Server 2022

    | Edició | Per a qui | Virtualització |
    |--------|-----------|----------------|
    | **Essentials** | PIMES fins a 25 usuaris | No inclosa |
    | **Standard** | Empreses mitjanes | 2 màquines virtuals |
    | **Datacenter** | Grans centres de dades | Il·limitades |

    !!! info "A l'aula usem la versió d'**avaluació (180 dies)** de Standard, que és totalment funcional."

    ## Serveis principals (rols)

    Un **rol** és una funció específica que el servidor pot realitzar. S'instal·len des del **Server Manager** i es poden afegir o treure en qualsevol moment.

    ```mermaid
    mindmap
      root((Windows Server 2022))
        Identitat
          AD DS
          AD CS
          AD FS
        Xarxa
          DNS Server
          DHCP Server
          Remote Access
        Fitxers
          File and Storage Services
          DFS
          iSCSI
        Web
          IIS
          Web Application Proxy
        Virtualització
          Hyper-V
          Containers
        Gestió
          Windows Admin Center
          RSAT
    ```

    ### Rols que treballarem al curs

    | Rol | Abreviació | Funció al curs |
    |-----|-----------|----------------|
    | **Active Directory Domain Services** | AD DS | Gestió centralitzada d'usuaris, grups i polítiques |
    | **DNS Server** | DNS | Resolució de noms al domini |
    | **DHCP Server** | DHCP | Assignació d'IPs als clients (opcional) |
    | **File and Storage Services** | FSS | Carpetes compartides i permisos NTFS |
    | **Print and Document Services** | PDS | Impressores en xarxa (UT3) |

    ## Server Core vs Desktop Experience

    Windows Server pot instal·lar-se en dos modes:

    | | **Server Core** | **Desktop Experience** |
    |-|:---------------:|:----------------------:|
    | **Interfície** | Només línia d'ordres | GUI completa (com Windows) |
    | **Consum RAM** | ~1 GB menys | Estàndard |
    | **Seguretat** | Superfície d'atac reduïda | Més components instal·lats |
    | **Ús al curs** | Opcional (avançat) | **Mode principal** |

    !!! tip "Al curs usem Desktop Experience perquè és més visual i facilita l'aprenentatge. En producció real, moltes empreses prefereixen Server Core per seguretat."

    ## Eines d'administració

    - **Server Manager**: tauler central per instal·lar rols i monitorar l'estat del servidor
    - **Active Directory Users and Computers (ADUC)**: gestió d'usuaris i grups
    - **Group Policy Management Console (GPMC)**: creació i gestió de GPO
    - **Windows Admin Center**: interfície web moderna (opció avançada)
    - **PowerShell**: automatització i administració per línia d'ordres

    ??? question "Auto-avaluació"

        **1.** Quina diferència hi ha entre Windows 11 Pro i Windows Server 2022 Standard?

        ??? success "Resposta"
            Windows 11 Pro és un SO d'escriptori per a un usuari, amb límit de connexions i sense Active Directory. Windows Server 2022 Standard és un SO de servidor que permet múltiples connexions simultànies, inclou AD DS, DNS, DHCP, Hyper-V i molts altres rols d'empresa.

        **2.** Quin rol de Windows Server s'utilitza per gestionar usuaris, contrasenyes i polítiques de manera centralitzada?

        ??? success "Resposta"
            **Active Directory Domain Services (AD DS)**. És el rol principal del servidor de domini i el que permet crear un entorn de xarxa gestionat centralment.

        **3.** Per quin motiu una empresa gran preferiria la versió **Datacenter** en lloc de **Standard**?

        ??? success "Resposta"
            Perquè **Datacenter** permet un nombre il·limitat de màquines virtuals amb Hyper-V, mentre que Standard només en permet 2. En un centre de dades amb desenes de VMs, Datacenter és econòmicament més eficient.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 1.3 · Investigació sobre Windows Server 2022

    **Objectiu**: familiaritzar-se amb les característiques oficials de Windows Server 2022.

    **Temps estimat**: 20 minuts

    ---

    ### Part A – Investigació guiada

    Accedeix a **learn.microsoft.com** i busca "What's new in Windows Server 2022". Respon:

    1. Quines són les 3 àrees principals de millora de WS2022 respecte a WS2019?
    2. Fins a quin any té suport oficial Windows Server 2022?
    3. Quina és la diferència entre el suport "Mainstream" i "Extended"?

    ### Part B – Comparativa d'edicions

    Crea una taula comparativa amb les edicions **Essentials**, **Standard** i **Datacenter** incloent:
    
    - Nombre màxim d'usuaris o CPUs
    - Llicències de virtualització incloses
    - Preu aproximat (cerca-ho)
    - Escenari recomanat d'ús

    ### Part C – Reflexió

    Si gestionessis la infraestructura d'una escola amb 300 alumnes i 40 professors, quina edició de Windows Server triaries i per quins motius?

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Windows Server 2022 overview features"`
        - `"Windows Server 2022 roles and features explained"`
        - `"Server Core vs Desktop Experience Windows Server"`
        - `"introduccion Windows Server 2022 español"`
