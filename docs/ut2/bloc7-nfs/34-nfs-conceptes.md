---
title: "NFS: conceptes i comparativa amb SMB"
tags:
  - ut2
  - nfs
  - linux
---

# :material-folder-network: NFS: el sistema de fitxers de xarxa de Linux

!!! abstract "Concepte clau"
    NFS (*Network File System*) és el protocol estàndard de Linux per compartir carpetes per xarxa. El servidor *exporta* un directori; el client el *munta* i l'usa com si fos local. Als Blocs 7 i 8, NFS exportarà `/perfils/` des del servidor perquè els clients el puguin muntar automàticament via autofs en cada login.

=== ":material-notebook-outline: Apunts"

    ## Què és NFS?

    NFS és un protocol de sistema de fitxers de xarxa creat per Sun Microsystems el 1984. Permet accedir a fitxers d'un servidor remot com si estiguessin al disc local. El sistema operatiu del client gestiona la connexió de manera transparent: els programes no saben si el fitxer és local o remot.

    ### Versions principals

    | Versió | Característiques |
    |--------|-----------------|
    | NFSv3 | Sense estat (*stateless*), UDP o TCP, simple i molt compatible |
    | NFSv4 | Amb estat (*stateful*), sempre TCP, millora seguretat i rendiment, suporta Kerberos |

    Ubuntu 24.04 usa **NFSv4** per defecte però manté compatibilitat amb NFSv3.

    ## Arquitectura: servidor i client

    NFS segueix un model client-servidor clar:

    - **Servidor NFS**: té les dades. Declara quins directoris exporta a `/etc/exports`.
    - **Client NFS**: munta l'exportació remotament amb `mount -t nfs` o via autofs.

    ```mermaid
    flowchart LR
        subgraph Servidor["Servidor (192.168.100.10)"]
            direction TB
            P["/perfils/\nfitxers reals\nmaria.puig, pere.costa..."] --> EXP["nfs-kernel-server\nexporta /perfils"]
        end

        subgraph Client["Client (192.168.100.20)"]
            direction TB
            MNT["/perfils/\n(muntat via NFS)"] --> APP["Aplicació\nAccés transparent"]
        end

        EXP -- "NFS · TCP 2049" --> MNT

        style Servidor fill:#1565C0,color:#fff
        style Client fill:#1B5E20,color:#fff
    ```

    Al nostre laboratori:
    - **Servidor** (`192.168.100.10`): exporta `/perfils/` on resideixen els directoris home dels usuaris LDAP
    - **Client** (`192.168.100.20`): autofs muntarà `/perfils/usuari` en cada login

    ## NFS dins de la pila LDAP+SSSD+NFS+autofs

    NFS és la peça 3 de 4 de la integració completa de perfils mòbils:

    | # | Capa | Component | Funció |
    |----|------|-----------|--------|
    | 1 | Directori | OpenLDAP (slapd) | Emmagatzema usuaris, contrasenyes, `homeDirectory` |
    | 2 | Integració OS | SSSD + NSS + PAM | Fa que Linux "vegi" els usuaris LDAP (Bloc 6) |
    | 3 | **Fitxers compartits** | **NFS** | **Exporta `/perfils/` per xarxa** |
    | 4 | Muntatge automàtic | autofs | Munta `/perfils/usuari` quan l'usuari fa login (Bloc 8) |

    Sense NFS (Bloc 7), autofs (Bloc 8) no tindria res a muntar.

    ## NFS vs SMB/CIFS

    !!! tip "Connexió amb UT1"
        A la UT1, vas compartir carpetes amb **SMB/CIFS** (Windows File Sharing) via Windows Server. NFS és l'equivalent natiu de Linux. Les diferències principals:

    | Aspecte | NFS (Linux) | SMB/CIFS (Windows) |
    |---------|-------------|-------------------|
    | **Protocol** | NFS (TCP 2049) | SMB (TCP 445) |
    | **Autenticació** | Basada en UID/GID (sense usuari/contrasenya) | Basada en nom d'usuari/contrasenya (AD/Kerberos) |
    | **Cas d'ús** | Comparticions Linux↔Linux | Comparticions Windows↔Windows o Windows↔Linux |
    | **Permisos** | Permisos POSIX (UID/GID) | ACLs de Windows (SID) |
    | **Equivalent al lab** | `exportfs` + `/etc/exports` | Carpetes compartides de Windows Server |

    **Implicació important**: NFS no autentica l'usuari per nom — confia en el **UID/GID**. Per tant, el UID de `maria.puig` ha de ser el mateix al servidor i al client (1001 en els dos casos). Gràcies a SSSD (Bloc 6), ambdós consulten el mateix LDAP i obtenen els mateixos UIDs. Aquesta és exactament la raó per la qual hem establert UIDs fixos des del Bloc 4 (pàgina 21).

    ## Ports i serveis NFS

    ```bash
    # Comprova que el port NFS és actiu
    ss -tlnp | grep 2049
    ```

    | Port | Servei |
    |------|--------|
    | TCP 2049 | NFS (principal) |
    | TCP/UDP 111 | rpcbind / portmapper |

    NFSv4 simplifica el firewall respecte a NFSv3: únicament necessita el port **2049/TCP**.

    ??? question "Auto-avaluació"

        **1.** Per quin motiu NFS és imprescindible a la nostra arquitectura? Podríem usar els directoris home locals en comptes d'NFS?

        ??? success "Resposta"
            Podríem usar directoris home locals **si l'usuari sempre es connectés al mateix servidor**. Però l'objectiu dels perfils mòbils és que `maria.puig` trobi el seu directori home independentment de quin client usi. Si fa login al client `192.168.100.20`, el seu directori home ha d'estar accessible — i el client no el té localment. NFS exporta `/perfils/` des del servidor i autofs la munta automàticament al client en cada login.

        **2.** NFS basa els permisos en UID/GID, no en noms d'usuari. Quina implicació té al nostre laboratori?

        ??? success "Resposta"
            El servidor NFS no sap que `maria.puig` (UID 1001) s'ha autenticat — únicament veu que el procés client s'executa amb UID 1001. Per tant, el client ha de tenir el mateix UID 1001 per a `maria.puig` que el servidor. Gràcies a SSSD (Bloc 6), el client obté la informació d'usuaris de LDAP, incloent el UID. Si servidor i client consulten el mateix LDAP, els UIDs seran idèntics i els permisos NFS funcionaran correctament.

        **3.** Quina diferència hi ha entre NFSv3 i NFSv4 pel que fa al firewall?

        ??? success "Resposta"
            NFSv3 usa múltiples ports dinàmics (portmapper, mountd, statd, etc.), cosa que dificulta la configuració del firewall. NFSv4 unifica tot el trànsit al port TCP 2049 (i opcionalment el 111 per rpcbind), simplificant les regles de tallafoc. Per al nostre laboratori (xarxa interna sense restriccions de firewall) la diferència és menor, però en entorns de producció NFSv4 és molt més senzill de gestionar.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 7.1 · Identifica NFS a la pila del laboratori

    **Objectiu**: entendre el paper de NFS dins de l'arquitectura completa del laboratori.

    **Temps estimat**: 10 minuts

    ---

    ### Part A – Diagrama de la pila

    Omple la taula de les 4 capes de la integració completa:

    | Capa | Component | Funció |
    |------|-----------|--------|
    | 1 | ? | Emmagatzema usuaris i contrasenyes |
    | 2 | ? | Fa que Linux vegi els usuaris LDAP |
    | 3 | ? | Comparteix `/perfils/` per xarxa |
    | 4 | ? | Munta automàticament el directori de l'usuari |

    ### Part B – Comparativa NFS vs SMB

    Respon: en quin dels dos protocols (NFS o SMB) l'autenticació es basa en el nom d'usuari/contrasenya? Per quin motiu NFS no ho necessita al nostre laboratori?

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"NFS Network File System Linux explained tutorial"`
        - `"NFS vs SMB CIFS Linux file sharing comparison"`
        - `"NFS server client Ubuntu setup overview"`
