---
title: vfs objects = acl_xattr (ACLs NTFS a Linux via Samba)
tags:
  - ut4
  - samba
  - acls
  - seguretat
---

# :material-shield-half-full: vfs objects = acl_xattr (ACLs NTFS a Linux via Samba)

!!! abstract "Concepte clau"
    El mòdul VFS **acl_xattr** permet que Samba emmagatzemi les ACLs esteses Windows (NTFS-like) en **atributs estesos** (`xattr`) del sistema de fitxers Linux. Combinat amb `map acl inherit = yes`, permet que les ACLs s'heretin als nous fitxers com a un DC Windows real.

=== ":material-notebook-outline: Apunts"

    ## El problema: ACLs NTFS vs ACLs POSIX

    | | ACLs NTFS (Windows) | ACLs POSIX (Linux) |
    |-|---------------------|-------------------|
    | Herència | Automàtica i granular | Manual (ACLs per defecte) |
    | Granularitat | Molt alta (Allow/Deny per operació) | Mitjana (rwx per usuari/grup) |
    | Emmagatzematge | Metadades NTFS | Kernel VFS + xattr |
    | Suport Samba | Via acl_xattr | Natiu |

    Quan un client Windows copia fitxers a un recurs Samba i vol aplicar ACLs NTFS, Samba ha d'emmagatzemar-les d'alguna manera al sistema de fitxers Linux. El mòdul `acl_xattr` usa **atributs estesos** (xattr) per guardar les ACLs NTFS.

    ## Prerequisits del sistema de fitxers

    El sistema de fitxers on es troben els recursos Samba ha de suportar **xattr**:

    ```bash
    # Ext4: suport xattr per defecte a Ubuntu 24.04
    # XFS: suport xattr per defecte
    # ZFS: suport xattr (cal activar amb setattr)
    # tmpfs / vfat: NO suporten xattr

    # Verifica: intent d'escriure un xattr
    setfattr -n user.test -v "prova" /srv/samba/tecnics/
    getfattr -n user.test /srv/samba/tecnics/
    ```

    ## Configuració de smb.conf: acl_xattr

    ```bash
    sudo nano /etc/samba/smb.conf
    ```

    ```ini
    [tecnics]
        comment = Recurs tècnics amb ACLs NTFS
        path = /srv/samba/tecnics
        valid users = @tecnics
        writable = yes
        browseable = yes
        # Mòdul VFS per a ACLs NTFS
        vfs objects = acl_xattr
        map acl inherit = yes
        store dos attributes = yes
    ```

    ## Paràmetres clau

    | Paràmetre | Valor | Efecte |
    |-----------|-------|--------|
    | `vfs objects = acl_xattr` | — | Activa el mòdul VFS per emmagatzemar ACLs NTFS en xattr |
    | `map acl inherit = yes` | — | Propaga les ACLs als fitxers nous (herència NTFS) |
    | `store dos attributes = yes` | — | Emmagatzema atributs DOS (arxiu, sistema, ocult) en xattr |

    ## Permisos del directori: `acl_xattr` necessita control total

    ```bash
    # El directori base ha de tenir permisos permissius:
    # Samba gestiona el control d'accés via ACLs NTFS, no via permisos Unix
    sudo chmod 777 /srv/samba/tecnics
    # O:
    sudo chown root:"Domain Admins" /srv/samba/tecnics
    sudo chmod 770 /srv/samba/tecnics
    ```

    ## Verificació: ACLs NTFS des de Windows

    Amb un client Windows unit al domini:

    1. Obre l'explorador → `\\dc1.libretic.local\tecnics`
    2. Clic dret a una carpeta → **Propietats → Seguretat**
    3. Hauries de veure les ACLs NTFS amb els grups del domini
    4. Fes clic a **Edita...** per afegir grups i permisos

    ```powershell
    # Comprova les ACLs NTFS des de PowerShell
    Get-Acl \\dc1.libretic.local\tecnics | Format-List
    ```

    ## Verificació: atributs xattr al servidor Linux

    ```bash
    # Comprova els atributs estesos guardats per Samba
    getfattr -n security.NTACL /srv/samba/tecnics/
    # Mostrarà dades binàries (les ACLs NTFS codificades)

    # Llista tots els xattr d'un fitxer
    getfattr -d /srv/samba/tecnics/document.txt
    ```

    !!! warning "Sense acl_xattr: les ACLs NTFS es perden"
        Sense el mòdul `vfs objects = acl_xattr`, les ACLs NTFS que un client Windows aplica a un recurs Samba **no es guarden**: la propera vegada que s'accedeix al fitxer, les ACLs hauran desaparegut. Amb `acl_xattr`, es guarden com a atribut estès `security.NTACL` i persisten.

    !!! tip "acl_xattr vs posix_eadb"
        Hi ha dos mòduls principals per a ACLs exteses a Samba: `acl_xattr` (emmagatzema en xattr natius del FS) i `posix_eadb` (emmagatzema en una base de dades TDB separada). `acl_xattr` és la recomanació actual per a Samba-AD DC en Linux amb ext4/xfs.

    ??? question "Auto-avaluació"
        **1.** Quin problema resol el mòdul `vfs objects = acl_xattr` en Samba?

        ??? success "Resposta"
            Permet que Samba **emmagatzemi les ACLs NTFS** (que apliquen els clients Windows) al sistema de fitxers Linux usant **atributs estesos** (xattr). Sense aquest mòdul, les ACLs NTFS aplicades per clients Windows no es guarden i desapareixen en el pròxim accés. Amb `acl_xattr`, les ACLs es persisten com a `security.NTACL` al xattr del fitxer o directori.

        **2.** Quin és el propòsit de `map acl inherit = yes` a smb.conf?

        ??? success "Resposta"
            `map acl inherit = yes` fa que Samba **propagui les ACLs NTFS** als fitxers i carpetes nous creats dins d'un directori (herència), replicant el comportament NTFS de Windows. Sense aquest paràmetre, cada fitxer nou no hereda les ACLs del directori pare i els usuaris han d'establir-les manualment per a cada fitxer.

        **3.** Com es comprova que les ACLs NTFS s'estan emmagatzemant correctament com a atributs estesos?

        ??? success "Resposta"
            `getfattr -n security.NTACL /ruta/del/fitxer` mostra el valor de l'atribut estès `security.NTACL` si existeix. Si retorna dades (en format binari/base64), les ACLs s'estan emmagatzemant correctament. Si retorna `No such attribute`, el mòdul `acl_xattr` no està actiu o el sistema de fitxers no suporta xattr.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.29 · vfs objects = acl_xattr a Samba

    **Objectiu**: activar `acl_xattr` al recurs `[tecnics]` i verificar la persistència d'ACLs NTFS.
    **Temps estimat**: 25 minuts
    **Prerequisit**: DC Samba amb recurs [tecnics] (Activitat 4.27)

    ---

    ### Pas 1 – Modifica smb.conf

    Afegeix al bloc `[tecnics]`:

    ```ini
    vfs objects = acl_xattr
    map acl inherit = yes
    store dos attributes = yes
    ```

    ```bash
    sudo systemctl restart samba-ad-dc
    ```

    ### Pas 2 – Des del client Windows: aplica ACLs NTFS

    1. Obre `\\dc1.libretic.local\tecnics`
    2. Crea una carpeta → Clic dret → Propietats → Seguretat
    3. Afegeix el grup `LIBRETIC\tecnics` amb permisos de Modificació
    4. Tanca la finestra

    ### Pas 3 – Verifica al servidor Linux

    ```bash
    getfattr -d /srv/samba/tecnics/
    getfattr -n security.NTACL /srv/samba/tecnics/
    ```

    Has de veure l'atribut `security.NTACL` amb dades.

    ### Pas 4 – Comprova la herència

    Des del client Windows: crea un nou fitxer dins la carpeta. Comprova (Propietats → Seguretat) que ha heretat les ACLs del pare.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Samba vfs objects acl_xattr NTFS ACL Linux"`
        - `"Samba extended attributes xattr ACL"`
        - `"Samba map acl inherit Windows ACL Linux"`
