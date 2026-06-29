---
title: Recursos compartits i ACLs POSIX en entorns de domini
tags:
  - ut4
  - samba
  - acls
  - seguretat
---

# :material-folder-key: Recursos compartits i ACLs POSIX en entorns de domini

!!! abstract "Concepte clau"
    En un domini Samba-AD, els **recursos compartits** es controlen per grups del domini via `smb.conf`, i els **permisos es refinen** amb ACLs POSIX (`setfacl`/`getfacl`) o ACLs NTFS emmagatzemades via `vfs objects = acl_xattr`.

=== ":material-notebook-outline: Apunts"

    ## 1 · Recursos compartits al domini Samba

    ### Definició de recursos a smb.conf

    En mode AD DC, els recursos es defineixen directament a `/etc/samba/smb.conf`:

    ```bash
    sudo nano /etc/samba/smb.conf
    ```

    ```ini
    [tecnics]
        comment = Recurs per al grup de tècnics
        path = /srv/samba/tecnics
        valid users = @tecnics
        writable = yes
        browseable = yes

    [comuna]
        comment = Recurs comú per a tots
        path = /srv/samba/comuna
        writable = yes
        browseable = yes
        create mask = 0664
        directory mask = 0775
    ```

    ### Crea els directoris i permisos base

    ```bash
    sudo mkdir -p /srv/samba/{tecnics,comuna}
    sudo chmod 770 /srv/samba/tecnics   # Restringit: propietari + grup
    sudo chmod 777 /srv/samba/comuna    # Obert: qualsevol usuari del domini

    sudo samba-tool testparm
    sudo systemctl restart samba-ad-dc
    ```

    !!! tip "Grups del domini a valid users"
        A Samba-AD DC, `@tecnics` referencia el **grup del domini** (no un grup local Linux). Samba el resol via el directori LDAP intern. Diferent de Samba servidor de fitxers (UT3), on `@grup` referia grups locals de `/etc/group`.

    ### Verificació des del client

    ```bash
    # Des d'un client Linux unit al domini
    smbclient //dc1.libretic.local/tecnics -U ana     # OK (ana és a tecnics)
    smbclient //dc1.libretic.local/tecnics -U clara   # NT_STATUS_ACCESS_DENIED

    # Des de Windows (PowerShell)
    net view \\dc1.libretic.local
    explorer \\dc1.libretic.local\tecnics
    ```

    ---

    ## 2 · ACLs POSIX (setfacl / getfacl)

    Les ACLs POSIX amplien els permisos Unix estàndard permetent definir permisos per a **usuaris i grups addicionals** sense canviar el propietari.

    ### setfacl – assignar ACLs

    ```bash
    # Permís rw per a l'usuari marc
    setfacl -m u:marc:rw /srv/samba/tecnics/document.txt

    # Permís rwx per al grup tecnics
    setfacl -m g:tecnics:rwx /srv/samba/tecnics/

    # ACLs per defecte (herència als fitxers nous del directori)
    setfacl -d -m g:tecnics:rwx /srv/samba/tecnics/

    # Aplica recursivament
    setfacl -R -m g:tecnics:rwx /srv/samba/tecnics/

    # Elimina totes les ACLs d'un fitxer
    setfacl -b /srv/samba/tecnics/document.txt
    ```

    ### getfacl – consultar ACLs

    ```bash
    getfacl /srv/samba/tecnics/
    ```

    Sortida exemple:

    ```
    # file: srv/samba/tecnics/
    # owner: root
    # group: root
    user::rwx
    user:marc:rw-
    group::r-x
    group:tecnics:rwx
    mask::rwx
    other::---
    default:user::rwx
    default:group:tecnics:rwx
    default:mask::rwx
    default:other::---
    ```

    Les línies `default:` s'apliquen als **fitxers nous** creats dins del directori.

    !!! tip "ls -l mostra + quan hi ha ACLs"
        `-rwxr-x---+` — el `+` al final indica que hi ha ACLs addicionals. Usa `getfacl` per veure-les completes.

    !!! warning "cp no copia les ACLs per defecte"
        Usa `cp -a` o `rsync -a --acls` per preservar les ACLs en còpies de fitxers.

    ---

    ## 3 · vfs objects = acl_xattr (ACLs NTFS a Linux)

    ### El problema

    Quan un client Windows aplica ACLs NTFS a un recurs Samba, Samba ha d'emmagatzemar-les al sistema de fitxers Linux. El mòdul `acl_xattr` les guarda com a **atributs estesos** (`xattr`).

    ### Configuració a smb.conf

    ```ini
    [tecnics]
        comment = Recurs tècnics amb ACLs NTFS
        path = /srv/samba/tecnics
        valid users = @tecnics
        writable = yes
        browseable = yes
        vfs objects = acl_xattr
        map acl inherit = yes
        store dos attributes = yes
    ```

    | Paràmetre | Efecte |
    |-----------|--------|
    | `vfs objects = acl_xattr` | Activa el mòdul VFS per a ACLs NTFS en xattr |
    | `map acl inherit = yes` | Propaga les ACLs als fitxers nous (herència NTFS) |
    | `store dos attributes = yes` | Emmagatzema atributs DOS (arxiu, sistema, ocult) en xattr |

    ### Verificació al servidor Linux

    ```bash
    # Comprova que les ACLs NTFS s'han guardat com a xattr
    getfattr -n security.NTACL /srv/samba/tecnics/
    # Retorna dades binàries si el mòdul funciona correctament
    ```

    !!! warning "Sense acl_xattr: les ACLs NTFS es perden"
        Sense `vfs objects = acl_xattr`, les ACLs NTFS que aplica un client Windows no es guarden i desapareixen en el pròxim accés.

    ---

    ## Comparativa de mecanismes d'ACL

    | Mecanisme | Protocol | Eina | Cas d'ús |
    |-----------|----------|------|----------|
    | Permisos Unix (`chmod`) | NFS, local | `chmod`, `chown` | Control bàsic propietari/grup/altres |
    | ACLs POSIX | NFS, local, Samba | `setfacl`, `getfacl` | Permisos granulars per múltiples usuaris/grups |
    | ACLs NTFS via acl_xattr | Samba | `vfs objects = acl_xattr` | Herència NTFS compatible amb clients Windows |

    ??? question "Auto-avaluació"

        **1.** Quina diferència hi ha entre `setfacl -m g:tecnics:rwx` i `setfacl -d -m g:tecnics:rwx`?

        ??? success "Resposta"
            `setfacl -m` aplica l'ACL al **fitxer o directori actual** directament. `setfacl -d -m` estableix una ACL **per defecte** (default ACL): tots els fitxers i subdirectoris *nous* creats dins el directori hereten automàticament aquesta ACL. Les ACLs per defecte únicament s'apliquen a directoris.

        **2.** Quin mòdul Samba permet emmagatzemar ACLs NTFS al sistema de fitxers Linux, i on les desa?

        ??? success "Resposta"
            El mòdul `vfs objects = acl_xattr`. Desa les ACLs NTFS com a **atributs estesos** (`xattr`) del sistema de fitxers, concretament a l'atribut `security.NTACL`. Es pot verificar amb `getfattr -n security.NTACL /ruta`. Requereix un sistema de fitxers amb suport xattr (ext4, xfs — sí; vfat — no).

        **3.** Com es diferencia `@tecnics` a smb.conf entre Samba servidor de fitxers (UT3) i Samba-AD DC (UT4)?

        ??? success "Resposta"
            En Samba **servidor de fitxers** (UT3), `@tecnics` referencia un **grup local Linux** de `/etc/group`. En Samba **AD DC** (UT4), `@tecnics` referencia un **grup del domini Active Directory** integrat a Samba. La sintaxi és idèntica però l'origen és diferent: local vs directori de domini.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.E1 · Recursos compartits i ACLs al domini

    **Objectiu**: crear recursos Samba amb control per grups i refinar permisos amb ACLs POSIX.
    **Temps estimat**: 60 minuts
    **Prerequisit**: DC Samba-AD operatiu amb usuaris i grups creats.

    ---

    ### Pas 1 – Crea els directoris i configura smb.conf

    ```bash
    sudo mkdir -p /srv/samba/{tecnics,comuna}
    sudo chmod 770 /srv/samba/tecnics
    sudo chmod 777 /srv/samba/comuna
    ```

    Afegeix `[tecnics]` i `[comuna]` a `/etc/samba/smb.conf` i reinicia el servei.

    ### Pas 2 – Verifica l'accés des del client Windows

    - Inicia sessió com `ana` (membre de `tecnics`) → accés a `[tecnics]` ✓
    - Inicia sessió com `clara` (no membre de `tecnics`) → accés denegat ✓

    ### Pas 3 – Aplica ACLs POSIX

    ```bash
    setfacl -m g:tecnics:rwx /srv/samba/tecnics/
    setfacl -d -m g:tecnics:rwx /srv/samba/tecnics/
    getfacl /srv/samba/tecnics/
    ```

    ### Pas 4 – Activa acl_xattr

    Afegeix `vfs objects = acl_xattr`, `map acl inherit = yes` a `[tecnics]`, reinicia i verifica amb `getfattr -n security.NTACL`.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"setfacl getfacl Linux ACL tutorial"`
        - `"Samba AD DC shared folder group access"`
        - `"Samba vfs objects acl_xattr NTFS ACL Linux"`
