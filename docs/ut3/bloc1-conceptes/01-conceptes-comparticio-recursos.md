---
title: Protocols de compartició de recursos
tags:
  - ut3
  - samba
  - nfs
  - cups
---

# :material-folder-network: Protocols de compartició de recursos

!!! abstract "Concepte clau"
    La **compartició de recursos** permet que diversos equips d'una xarxa accedeixin a fitxers, carpetes i impressores ubicats en un servidor centralitzat, sense còpies locals. Els tres protocols principals a Linux són **SMB** (Samba), **NFS** i **IPP** (CUPS).

=== ":material-notebook-outline: Apunts"

    ## Què és la compartició de recursos?

    En un entorn de xarxa, un **servidor de recursos** posa a disposició dels clients:

    - **Fitxers i carpetes**: els clients accedeixen com si fossin unitats locals
    - **Impressores**: els clients envien treballs a una impressora remota sense tenir-la connectada físicament
    - **Dades compartides**: diverses persones treballen sobre els mateixos fitxers de manera concurrent

    Sense compartició de recursos, cada equip hauria de tenir còpies locals de tots els fitxers, cosa que genera inconsistències i malgasta espai.

    ## Els tres protocols de la UT3

    ### SMB / CIFS — Samba

    **SMB** (Server Message Block) és el protocol de compartició de fitxers de Microsoft Windows. **Samba** és la implementació de SMB per a Linux, que permet a Ubuntu actuar com a servidor de fitxers compatible amb Windows.

    - Port: **445** (SMB directe) i 139 (NetBIOS legacy)
    - Compatible amb: Windows, Linux (via `smbclient`), macOS
    - Autenticació: usuaris i contrasenyes pròpies de Samba (o integrats amb LDAP)
    - Casos d'ús: entorns mixtos Windows+Linux, aules d'informàtica, oficines

    ### NFS — Network File System

    **NFS** és el protocol estàndard Unix/Linux per exportar sistemes de fitxers via xarxa. A diferència de Samba, no té una interfície gràfica d'administració i el control d'accés es basa en IPs, no en usuaris amb contrasenya.

    - Port: **2049** (NFS) i 111 (rpcbind)
    - Compatible amb: Linux, Unix, macOS (limitat per a Windows)
    - Autenticació: per adreça IP; control per UID/GID
    - Casos d'ús: servidors Linux homogenis, perfils mòbils, clústers

    ### IPP — CUPS

    **IPP** (Internet Printing Protocol) és el protocol d'impressió en xarxa que usa **CUPS** (Common UNIX Printing System). CUPS gestiona les impressores i les cues d'impressió, i les comparteix via IPP.

    - Port: **631** (IPP via HTTP)
    - Compatible amb: Linux, macOS, Windows (via drivers IPP)
    - Casos d'ús: gestió centralitzada d'impressores, impressió remota, impressores virtuals PDF

    ## Diagrama: arquitectura de compartició

    ```mermaid
    graph TD
        subgraph Servidor["Ubuntu Server 24.04 · 192.168.100.10"]
            S["Samba\n(SMB · port 445)"]
            N["NFS\n(port 2049)"]
            C["CUPS\n(IPP · port 631)"]
        end
        subgraph Clients
            W["Client Windows"]
            L["Client Linux"]
            P["Impressió"]
        end
        W -->|"smbclient / net use"| S
        L -->|"smbclient / mount -t cifs"| S
        L -->|"mount -t nfs"| N
        W -->|"IPP driver"| C
        L -->|"lp / lpr"| C
        C --> P
    ```

    ## Context del laboratori (ServiNet360)

    !!! tip "Escenari de l'empresa"
        **ServiNet360** és una empresa de serveis TI que disposa d'un Ubuntu Server centralitzat. Els tècnics (Linux) i els administratius (Windows) necessiten accedir als mateixos recursos. El servidor ha de parlar ambdós idiomes: SMB per als Windows i NFS per als Linux.

    | Recurs | Tecnologia | Usuaris |
    |--------|-----------|---------|
    | Carpeta de projectes (R/W per a tots) | Samba | Windows + Linux |
    | Carpeta d'informes (R/W per a tècnics, RO per a rest) | Samba | Windows + Linux |
    | Perfils d'usuari Linux | NFS | Linux |
    | Impressora PDF de departament | CUPS | Linux + Windows |

    !!! warning "Error freqüent"
        Confondre els ports de NFS i Samba: **Samba usa el 445**, **NFS el 2049**. Si el firewall bloqueja el port equivocat, el servei no serà accessible i no hi haurà cap missatge d'error al client (timeout silenciós).

    ??? question "Auto-avaluació"
        **1.** Quin protocol de compartició de fitxers és el més adequat per a un entorn on els clients són exclusivament Linux?

        ??? success "Resposta"
            NFS, perquè no requereix instal·lació de cap programari addicional als clients Linux, és natiu i té menys sobrecàrrega que Samba en entorns homogenis Linux.

        **2.** En quin port escolta el servei CUPS per defecte?

        ??? success "Resposta"
            El port **631** (protocol IPP, que funciona sobre HTTP).

        **3.** Quina diferència hi ha entre el control d'accés de Samba i el de NFS?

        ??? success "Resposta"
            Samba usa **usuaris amb contrasenya** (base de dades `tdbsam` o LDAP). NFS usa **adreces IP** com a mecanisme de control d'accés; no hi ha autenticació d'usuari pròpia del protocol (el control es fa per UID/GID del sistema operatiu client).

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.1 · Identificació de protocols de compartició

    **Objectiu**: identificar quin protocol de compartició és el més adequat per a cada escenari real.
    **Temps estimat**: 20 minuts
    **Prerequisit**: llegir els apunts d'aquesta pàgina

    ---

    ### Pas 1 – Analitza els escenaris

    Per a cada escenari de la taula, indica quin protocol (Samba, NFS, CUPS o combinació) és el més adequat i justifica la resposta.

    | Escenari | Protocol recomanat | Justificació |
    |----------|-------------------|-------------|
    | 20 equips Windows que han d'accedir a una carpeta de projectes compartida | | |
    | Servidor Linux que exporta els directoris `/home` per a clients Linux | | |
    | Impressora connectada a un servidor Linux que han d'usar equips Windows i Linux | | |
    | Aula d'informàtica amb 15 Ubuntu i 5 Windows que han de llegir documents de l'empresa | | |
    | Clúster HPC amb 50 nodes Linux que comparteixen el directori de dades `/data` | | |

    ### Pas 2 – Diagrama de la teva proposta

    Dissenya el diagrama de xarxa per a l'aula de l'escenari 4 (15 Ubuntu + 5 Windows). Indica quins serveis cal instal·lar al servidor i quins protocols usa cada tipus de client.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Samba vs NFS Linux file sharing comparison"`
        - `"Network File System NFS explained"`
        - `"SMB protocol explained simply"`
        - `"CUPS Linux printing server tutorial"`
