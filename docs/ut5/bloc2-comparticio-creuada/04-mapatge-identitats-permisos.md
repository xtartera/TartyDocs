---
title: Mapatge d'identitats i permisos en la compartició creuada
tags:
  - ut5
  - heterogenis
  - seguretat
  - acls
  - samba
---

# :material-account-convert: Mapatge d'identitats i permisos en la compartició creuada

!!! abstract "Concepte clau"
    Quan un fitxer creua la frontera Windows↔Linux, el sistema ha de decidir **qui n'és el propietari** i **quins permisos té** a l'altre món. Aquest capítol aplica les dificultats teòriques a casos reals de compartició.

=== ":material-notebook-outline: Apunts"

    ## El problema, en una imatge

    ```mermaid
    graph LR
        W["Windows\nusuari = SID\npermisos = NTFS"] <-->|"frontera\n(Samba / NFS)"| L["Linux\nusuari = UID/GID\npermisos = POSIX/ACL"]
    ```

    A la frontera cal respondre dues preguntes:

    1. **Identitat**: a quin UID/GID de Linux correspon aquest usuari de Windows (i a l'inrevés)?
    2. **Permisos**: com es tradueixen els drets NTFS a permisos POSIX/ACL, i viceversa?

    ## Cas 1 — Compartir de Linux a Windows amb Samba

    Samba resol el mapatge d'identitats amb el subsistema **idmap**. Dues estratègies habituals:

    | Estratègia | Quan usar-la | Idea |
    |------------|--------------|------|
    | **`ad` backend + rfc2307** | Domini AD/Samba-AD amb atributs POSIX | Llegeix `uidNumber`/`gidNumber` del directori → **coherent a tot arreu** |
    | **`rid` / autogenerat** | Sense atributs POSIX al directori | Calcula l'UID a partir del RID del SID → cal el **mateix rang a tots els servidors** |

    Per preservar permisos rics estil Windows sobre fitxers Linux, Samba usa:

    ```ini
    [dades]
       path = /srv/dades
       vfs objects = acl_xattr
       map acl inherit = yes
    ```

    !!! tip "Per què `acl_xattr`"
        Emmagatzema les ACL estil Windows en atributs estesos del sistema de fitxers Linux, de manera que els permisos definits des de Windows (amb l'explorador o RSAT) **es conserven** encara que el POSIX bàsic no els sabria representar.

    ## Cas 2 — Compartir de Windows a Linux (CIFS)

    Quan un client Linux munta un recurs SMB de Windows, **no hereta** els SID: assigna la propietat segons les opcions de muntatge.

    ```bash
    sudo mount -t cifs //192.168.100.10/dades /mnt/dades \
      -o credentials=/etc/smb-credentials,uid=1000,gid=1000,file_mode=0640,dir_mode=0750
    ```

    | Opció | Efecte |
    |-------|--------|
    | `uid`/`gid` | Propietari local dels fitxers muntats |
    | `file_mode`/`dir_mode` | Permisos POSIX aparents dels fitxers/carpetes |

    ## Cas 3 — NFS entre mons

    A NFS el mapatge és per **número** (UID/GID). Si el UID 1000 de Windows/Ubuntu no és la mateixa persona als dos extrems, es produeix una confusió de propietat. Mitigacions:

    | Mesura | Efecte |
    |--------|--------|
    | UID/GID **coherents** (directori amb rfc2307) | Cada persona té el mateix número arreu |
    | `all_squash` + `anonuid`/`anongid` | Tothom accedeix com un usuari anònim concret (recursos comuns) |
    | `root_squash` (per defecte) | El root del client **no** és root al servidor |

    ## Taula-resum de traduccions

    | Element | Windows | Linux | Pont |
    |---------|---------|-------|------|
    | Identitat | SID | UID/GID | idmap (Samba) · rfc2307 · opcions `uid=` (CIFS) |
    | Permisos rics | NTFS ACL | ACL POSIX | `acl_xattr` · `setfacl` |
    | Permisos bàsics | — | `rwx` propietari/grup/altres | `file_mode`/`dir_mode` |
    | Propietat NFS | — | UID/GID numèric | rfc2307 · `all_squash` |

    !!! warning "Símptoma clàssic i causa"
        *"Els fitxers apareixen com de `nobody`/`root` o no els puc modificar"* → gairebé sempre és un **mapatge d'identitats** mal resolt (idmap, `uid=`, o UID/GID incoherents), no un problema de xarxa.

    ??? question "Auto-avaluació"
        **1.** Per què el backend idmap `ad` amb rfc2307 dóna més coherència que un mapatge autogenerat?

        ??? success "Resposta"
            Perquè llegeix els `uidNumber`/`gidNumber` **emmagatzemats al directori**, iguals per a tots els clients. El mapatge autogenerat calcula l'UID localment i pot **divergir** entre servidors si no comparteixen exactament la mateixa configuració de rangs.

        **2.** Quin paràmetre de Samba fa que es conservin els permisos estil Windows sobre fitxers Linux?

        ??? success "Resposta"
            `vfs objects = acl_xattr` (sovint amb `map acl inherit = yes`), que desa les ACL estil Windows en atributs estesos del sistema de fitxers Linux.

        **3.** En muntar un recurs CIFS, com controles els permisos aparents dels fitxers a Linux?

        ??? success "Resposta"
            Amb les opcions `file_mode` i `dir_mode` (a més de `uid`/`gid` per a la propietat), ja que el recurs CIFS no aporta permisos POSIX propis.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 5.B2 · Segueix el rastre de la propietat

    **Objectiu**: observar com canvia la propietat i els permisos d'un fitxer que creua la frontera.
    **Temps estimat**: 35 minuts · **Modalitat**: parelles

    ---

    ### Tasca 1 – De Linux a Windows

    1. Crea un fitxer a `/srv/dades` propietat de `maria.puig` (Linux).
    2. Accedeix-hi des de Windows i mira qui apareix com a propietari i quins permisos hi ha. Documenta-ho.

    ### Tasca 2 – De Windows a Linux

    1. Munta `//SRV/dades` a `/mnt/dades` **sense** `uid=/gid=`. Mira la propietat amb `ls -la`.
    2. Torna a muntar-ho **amb** `uid=$(id -u),gid=$(id -g)`. Compara.

    ### Tasca 3 – Conclusió

    Explica, amb les teves paraules, en quin moment exacte s'ha "traduït" la identitat i quins paràmetres han determinat el resultat.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"samba idmap ad rfc2307 configuration"`
        - `"samba acl_xattr windows permissions linux"`
        - `"nfs all_squash root_squash explained"`
