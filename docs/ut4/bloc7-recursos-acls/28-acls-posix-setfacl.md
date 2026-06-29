---
title: ACLs esteses POSIX (setfacl, getfacl, herència)
tags:
  - ut4
  - acls
  - linux
  - seguretat
---

# :material-shield-key: ACLs esteses POSIX (setfacl, getfacl, herència)

!!! abstract "Concepte clau"
    Les **ACLs POSIX** (Access Control Lists) amplien els permisos Unix estàndard (`rwxrwxrwx`) permetent definir permisos per a **usuaris i grups addicionals** sobre un fitxer o directori. `setfacl` assigna ACLs, `getfacl` les consulta, i les **ACLs per defecte** es propaguen als nous fitxers.

=== ":material-notebook-outline: Apunts"

    ## Limitació dels permisos Unix estàndard

    Els permisos Unix clàssics (`chmod`) únicament permeten definir permisos per a: propietari, grup propietari, i "altres". Amb ACLs, pots afegir permisos per a usuaris i grups addicionals sense canviar el propietari:

    ```
    Permisos Unix:  ana (propietari) → rwx | directors (grup) → r-x | altres → ---
    ACL addicional: marc → rw-    (sense canviar propietari ni grup)
    ACL addicional: @tecnics → rwx
    ```

    ## Comprobar suport ACL al sistema de fitxers

    ```bash
    # Verifica que el FS suporta ACLs (ext4, xfs... sí; vfat... no)
    tune2fs -l /dev/sda1 | grep "Default mount options"
    # o
    mount | grep "acl"

    # En Ubuntu 24.04, ext4 i xfs suporten ACLs per defecte
    ```

    ## setfacl – assignar ACLs

    ```bash
    # Sintaxi: setfacl [opcions] regla fitxer/directori

    # Afegeix permís de lectura i escriptura per a l'usuari marc
    setfacl -m u:marc:rw /srv/samba/tecnics/document.txt

    # Afegeix permisos per a un grup
    setfacl -m g:tecnics:rwx /srv/samba/tecnics/

    # ACL per defecte (s'hereten als fitxers nous del directori)
    setfacl -d -m g:tecnics:rwx /srv/samba/tecnics/

    # Elimina una ACL específica
    setfacl -x u:marc /srv/samba/tecnics/document.txt

    # Elimina totes les ACLs d'un fitxer
    setfacl -b /srv/samba/tecnics/document.txt
    ```

    ## getfacl – consultar ACLs

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
    default:group::r-x
    default:group:tecnics:rwx
    default:mask::rwx
    default:other::---
    ```

    Les línies `default:` son les ACLs per defecte que s'apliquen als **fitxers nous** creats dins el directori.

    ## Herència d'ACLs

    ```bash
    # Estableix ACLs per defecte al directori pare
    setfacl -d -m g:tecnics:rwx /srv/samba/tecnics/

    # Qualsevol fitxer creat dins de /srv/samba/tecnics/
    # heretarà automàticament g:tecnics:rwx
    touch /srv/samba/tecnics/nou-fitxer.txt
    getfacl /srv/samba/tecnics/nou-fitxer.txt
    # Mostrarà: group:tecnics:rwx (heretat)
    ```

    ## Aplica ACLs de forma recursiva

    ```bash
    # Aplica les mateixes ACLs a tots els fitxers i subdirectoris
    setfacl -R -m g:tecnics:rwx /srv/samba/tecnics/

    # Combina recursiu + defecte
    setfacl -R -m g:tecnics:rwx /srv/samba/tecnics/
    setfacl -R -d -m g:tecnics:rwx /srv/samba/tecnics/
    ```

    ## El camp mask

    La `mask` és el màxim de permisos efectius per a usuaris i grups (excepte el propietari). Pots reduir-la per limitar tots els permisos de cop:

    ```bash
    # Limita a lectura màxima per a tots els ACL entries
    setfacl -m mask:r-- /srv/samba/tecnics/fitxer.txt
    # Ara ni g:tecnics:rwx ni u:marc:rw tindran write, malgrat l'ACL ho digui
    ```

    !!! warning "ACLs i còpies de fitxers"
        Quan copies un fitxer amb `cp`, les ACLs NO es copien per defecte. Usa `cp -a` o `cp --preserve=all` per preservar les ACLs. `rsync -a --acls` preserva les ACLs amb rsync.

    !!! tip "ls -l mostra el signe + quan hi ha ACLs"
        `ls -l fitxer.txt` mostra un `+` al final dels permisos quan el fitxer té ACLs addicionals: `-rwxr-x---+`. Sense ACLs, no hi ha el `+`. Quan vegis el `+`, usa `getfacl` per veure les ACLs completes.

    ??? question "Auto-avaluació"
        **1.** Quina és la diferència entre `setfacl -m g:tecnics:rwx` i `setfacl -d -m g:tecnics:rwx`?

        ??? success "Resposta"
            `setfacl -m g:tecnics:rwx` aplica una ACL al **fitxer o directori actual** directament. `setfacl -d -m g:tecnics:rwx` estableix una ACL **per defecte** (default ACL) en un directori: tots els fitxers i subdirectoris **nous** que es creïn dins el directori hereten automàticament aquesta ACL. Les ACLs per defecte únicament s'apliquen a directoris (no a fitxers individuals).

        **2.** Quin signe indica en la sortida de `ls -l` que un fitxer té ACLs addicionals?

        ??? success "Resposta"
            Un signe **`+`** al final de la cadena de permisos: `-rwxr-x---+`. Sense ACLs, la cadena seria `-rwxr-x---` (sense el `+`). Aquest `+` és una indicació visual que hi ha informació addicional de permisos que no es veu amb `ls -l` i que cal consultar amb `getfacl`.

        **3.** Com s'eliminen totes les ACLs d'un directori i els seus continguts de forma recursiva?

        ??? success "Resposta"
            `setfacl -R -b /srv/samba/tecnics/`. L'opció `-b` (remove all) elimina totes les entrades ACL del fitxer/directori (excepte les entrades de propietari, grup i "other" que seguiran aplicant). L'opció `-R` aplica l'operació recursivament a tots els fitxers i subdirectoris.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.28 · ACLs POSIX als recursos Samba

    **Objectiu**: aplicar ACLs esteses als recursos del domini i verificar l'herència.
    **Temps estimat**: 30 minuts
    **Prerequisit**: recursos compartits creats (Activitat 4.27)

    ---

    ### Pas 1 – Comprova les ACLs actuals

    ```bash
    getfacl /srv/samba/tecnics/
    ls -la /srv/samba/tecnics/
    ```

    ### Pas 2 – Afegeix ACLs per al grup tecnics

    ```bash
    setfacl -m g:tecnics:rwx /srv/samba/tecnics/
    setfacl -d -m g:tecnics:rwx /srv/samba/tecnics/
    getfacl /srv/samba/tecnics/
    ```

    ### Pas 3 – Prova la herència

    ```bash
    sudo -u ana touch /srv/samba/tecnics/fitxer-ana.txt
    getfacl /srv/samba/tecnics/fitxer-ana.txt
    ```

    Documenta: el grup `tecnics` té permisos al nou fitxer?

    ### Pas 4 – Comprova que marc (sense grup tecnics) no pot escriure

    ```bash
    sudo -u marc touch /srv/samba/tecnics/fitxer-marc.txt
    # Ha de retornar: Permission denied (marc no és a tecnics)
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"setfacl getfacl Linux ACL tutorial"`
        - `"POSIX ACL default inheritance Linux"`
        - `"Linux extended ACL permissions setfacl explained"`
