---
title: Comparativa Samba / NFS / CUPS
tags:
  - ut3
  - samba
  - nfs
  - cups
---

# :material-swap-horizontal: Comparativa Samba / NFS / CUPS

!!! abstract "Concepte clau"
    Samba, NFS i CUPS no son alternatives sinó tecnologies **complementàries**: Samba per a compartició de fitxers multiplataforma, NFS per a compartició nativa Linux, i CUPS per a gestió d'impressió. Sovint coexisteixen al mateix servidor.

=== ":material-notebook-outline: Apunts"

    ## Taula comparativa global

    | Característica | Samba (SMB) | NFS | CUPS (IPP) |
    |---------------|------------|-----|-----------|
    | **Protocol** | SMB/CIFS | NFS v3/v4 | IPP (HTTP) |
    | **Port principal** | 445 | 2049 | 631 |
    | **Recurs compartit** | Fitxers i impressores | Sistemes de fitxers | Impressores |
    | **Clients compatibles** | Windows, Linux, macOS | Linux, Unix, macOS | Linux, Windows, macOS |
    | **Autenticació** | Usuari + contrasenya | Adreça IP / UID/GID | Usuari + contrasenya (opcional) |
    | **Config. servidor** | `/etc/samba/smb.conf` | `/etc/exports` | `/etc/cups/cupsd.conf` |
    | **Verificació ràpida** | `smbclient -L //servidor` | `showmount -e servidor` | `lpstat -p` |
    | **Rendiment** | Moderat | Alt (kernel) | — |
    | **Integració AD/LDAP** | Nativa (`ldapsam`) | Limitada (UID/GID) | Via PAM/LDAP |

    ## Quan usar cada tecnologia

    ### Usa Samba quan…

    - Hi ha **clients Windows** a la xarxa
    - Necessites **autenticació per usuari** (contrasenyes individuals)
    - Vols integrar amb **Active Directory** o **OpenLDAP** existent
    - Necessites compartir **impressores** amb clients Windows

    ### Usa NFS quan…

    - L'entorn és **homogeni Linux** (tots els clients són Linux/Unix)
    - Necessites **alt rendiment** (NFS treballa a nivell de kernel, Samba no)
    - Implementes **perfils mòbils** Linux (com vam fer a la UT2)
    - El control d'accés per IP és suficient (sense usuaris individuals)

    ### Usa CUPS quan…

    - Necessites un **servidor d'impressió centralitzat** Linux
    - Vols una impressora **PDF virtual** (sense hardware físic)
    - Vols compartir impressores amb clients Windows **sense instal·lar drivers** individuals

    ## Comparativa amb UT1 (Windows Server)

    !!! tip "Conexió amb la UT1"
        A la UT1 vam veure l'equivalent Windows de cada tecnologia. La taula mostra el paral·lelisme:

    | Windows Server (UT1) | Ubuntu Server (UT3) | Diferència clau |
    |---------------------|--------------------|-|
    | Carpetes compartides SMB | Samba | Windows natiu vs. cross-platform Linux |
    | DFS (Distributed File System) | NFS exportfs | Windows clustering vs. Unix simple |
    | `icacls` + NTFS | `chmod` + `valid users` | Heretatge NTFS vs. Unix modes |
    | Windows Print Server | CUPS | GUI Server Manager vs. web port 631 |
    | `net use \\srv\share` | `smbclient //srv/share` | Client Windows vs. client Linux |

    ## Combinació habitual en producció

    ```mermaid
    graph LR
        subgraph Servidor["Ubuntu Server"]
            SMB["Samba\n(fitxers · port 445)"]
            NFS["NFS\n(perfils · port 2049)"]
            CPS["CUPS\n(impressió · port 631)"]
        end
        WC["Clients\nWindows"] -->|SMB| SMB
        LC1["Clients\nLinux"] -->|SMB o NFS| SMB
        LC1 -->|NFS| NFS
        CPS -->|"IPP (via Samba)"| WC
        CPS -->|IPP| LC1
    ```

    En la majoria d'entorns empresarials reals, el mateix servidor Ubuntu ofereix alhora Samba (fitxers per a Windows), NFS (perfils Linux) i CUPS (impressió) als seus clients.

    !!! warning "Error freqüent"
        Intentar usar NFS des de Windows directament sense configuració addicional. Windows no inclou un client NFS funcional per defecte a les edicions estàndard (cal instal·lar un component opcional). En entorns mixtos, **Samba és la solució per als clients Windows**, no NFS.

    ??? question "Auto-avaluació"
        **1.** Quin paràmetre de `/etc/exports` controla quin client pot accedir a una exportació NFS?

        ??? success "Resposta"
            L'adreça IP o el rang de xarxa especificat davant les opcions, per exemple: `/srv/nfs/dades 192.168.100.20(rw,sync)`. NFS no té autenticació per usuari pròpia del protocol; el control és per IP.

        **2.** Per quin motiu Samba i NFS poden coexistir al mateix servidor sense conflicte?

        ??? success "Resposta"
            Perquè usen ports i protocols completament independents. Samba usa el port 445 (SMB) i NFS el 2049. Poden servir fins i tot la mateixa carpeta (exportada per NFS i compartida per Samba), tot i que això requereix un cuidat especial amb els permisos.

        **3.** Quin és l'equivalent a "Carpetes compartides" de Windows Server en Linux?

        ??? success "Resposta"
            **Samba** (per a clients Windows i Linux via SMB/CIFS), o **NFS** (per a clients Linux exclusivament). En entorns mixtos s'usen tots dos en paral·lel: Samba per als Windows, NFS per als Linux.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.2 · Disseny d'arquitectura de compartició

    **Objectiu**: dissenyar l'arquitectura de serveis de compartició per a un escenari real.
    **Temps estimat**: 25 minuts

    ---

    ### Escenari: Institut Cirvianum — Aula SMX

    L'aula d'SMX té:
    - 20 equips Ubuntu 24.04 (alumnes)
    - 5 equips Windows 11 (professors)
    - 1 Ubuntu Server 24.04 (servidor de l'aula)
    - 1 impressora de xarxa connectada al servidor

    ### Pas 1 – Completa la taula de decisions

    | Necessitat | Tecnologia triada | Justificació |
    |-----------|-----------------|-------------|
    | Carpeta `/exercicis` (lectura per a tots) | | |
    | Carpeta `/lliuraments` (escriptura per a alumnes, lectura per a professors) | | |
    | Directoris home dels alumnes (Linux only) | | |
    | Impressora compartida per a tot l'aula | | |

    ### Pas 2 – Indica les ordres d'instal·lació

    Per a cada servei que has triat, escriu l'ordre `apt install` necessària al servidor.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Samba NFS difference Linux file sharing"`
        - `"Linux server Samba NFS CUPS setup"`
        - `"SMB vs NFS performance comparison"`
