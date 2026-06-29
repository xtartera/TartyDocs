---
title: Samba – Accés lliure (guest ok)
tags:
  - ut3
  - samba
---

# :material-account-off: Samba – Accés lliure (guest ok)

!!! abstract "Concepte clau"
    L'accés lliure (`guest ok = yes`) permet que qualsevol usuari s'hi connecti **sense introduir contrasenya**. El sistema mapeja la connexió al compte `nobody`. És útil per a carpetes públiques de lectura, però perillós si s'activa l'escriptura sense restriccions addicionals.

=== ":material-notebook-outline: Apunts"

    ## Configuració d'un recurs públic

    A `smb.conf`, la secció `[global]` ha d'incloure:

    ```ini
    [global]
        ...
        map to guest = Bad User
    ```

    Aquesta directiva fa que els usuaris desconeguts (o que fallen l'autenticació) siguin tractats com a "convidats" (`nobody`).

    Després, la secció del recurs:

    ```ini
    [public]
        path = /srv/samba/public
        browseable = yes
        writable = yes
        guest ok = yes
        comment = Carpeta pública
    ```

    ## Permisos del sistema de fitxers

    !!! warning "Permisos de la carpeta"
        Samba necessita que la carpeta del sistema de fitxers sigui accessible per al compte `nobody`. Si `guest ok = yes` però la carpeta té permisos restrictius (`chmod 700 root:root`), l'accés fallarà igualment.

    Per permetre lectura i escriptura a qualsevol:

    ```bash
    sudo chmod 777 /srv/samba/public
    # o bé, més controlat:
    sudo chown nobody:nogroup /srv/samba/public
    sudo chmod 775 /srv/samba/public
    ```

    ## Verificació amb smbclient

    Des del client Linux, sense contrasenya (`-N`):

    ```bash
    # Llista els recursos disponibles
    smbclient -L //192.168.100.10 -N

    # Connecta al recurs public
    smbclient //192.168.100.10/public -N
    ```

    Sortida esperada de `smbclient -L`:

    ```text
    Sharename       Type      Comment
    ---------       ----      -------
    public          Disk      Carpeta pública
    IPC$            IPC       IPC Service (Samba 4.x)
    ```

    Un cop connectat, pots usar ordres com `ls`, `put fitxer.txt`, `get fitxer.txt` i `exit`.

    ## Diferència entre accés lliure i anònim

    | Concepte | guest ok = yes | Autenticat |
    |---------|---------------|-----------|
    | Contrasenya | No requerida | Sí |
    | Compte efectiu | `nobody` | Compte Samba de l'usuari |
    | Permisos aplicats | Permisos de `nobody` al FS | Permisos de l'usuari al FS |
    | Cas d'ús | Recursos públics | Recursos privats o de grup |

    !!! tip "Connexió amb UT1"
        A Windows Server, l'equivalent seria una carpeta compartida amb permisos "Everyone" = Lectura/Escriptura. L'accés anonymous als recursos SMB és equivalent a `guest ok = yes` a Samba.

    ??? question "Auto-avaluació"
        **1.** Quina directiva de `[global]` és necessària perquè `guest ok = yes` funcioni correctament amb usuaris desconeguts?

        ??? success "Resposta"
            `map to guest = Bad User`. Sense aquesta directiva, un usuari desconegut rep un error d'autenticació en lloc de ser tractat com a convidat. Amb `Bad User`, els usuaris que no existeixen a la base de dades Samba es redirigeixen automàticament al compte `nobody`.

        **2.** Quins permisos de sistema de fitxers necessita la carpeta per permetre escriptura als convidats?

        ??? success "Resposta"
            La carpeta ha de ser accessible i escrivible per al compte `nobody`. Dues opcions habituals: `sudo chmod 777 /srv/samba/public` (permissiu) o `sudo chown nobody:nogroup /srv/samba/public && sudo chmod 775` (més controlat). Samba comprova dos nivells: els permisos del recurs a `smb.conf` **i** els permisos del sistema de fitxers.

        **3.** Quina opció de `smbclient` permet connectar-se sense introduir contrasenya?

        ??? success "Resposta"
            L'opció `-N` (de "no password"). Sense aquesta opció, `smbclient` demana una contrasenya interactivament; prement Enter sense escriure res també funciona en recursos `guest ok`.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.5 · Recurs públic amb accés lliure

    **Objectiu**: configurar un recurs Samba accessible sense contrasenya i verificar l'accés des del client.
    **Temps estimat**: 30 minuts
    **Prerequisit**: Samba instal·lat (Activitat 3.3) i `smb.conf` explorat (Activitat 3.4)

    ---

    ### Pas 1 – Crea el directori

    ```bash
    sudo mkdir -p /srv/samba/public
    sudo chmod 777 /srv/samba/public
    ```

    ### Pas 2 – Configura smb.conf

    Afegeix a la secció `[global]`:

    ```ini
    map to guest = Bad User
    ```

    Afegeix la secció del recurs:

    ```ini
    [public]
        path = /srv/samba/public
        browseable = yes
        writable = yes
        guest ok = yes
        comment = Carpeta pública
    ```

    ### Pas 3 – Valida i reinicia

    ```bash
    testparm
    sudo systemctl restart smbd
    ```

    ### Pas 4 – Verifica des del client

    ```bash
    # Des del client Linux (192.168.100.20)
    smbclient -L //192.168.100.10 -N
    smbclient //192.168.100.10/public -N
    ```

    Un cop connectat, crea un fitxer de prova:

    ```text
    smb: \> put /tmp/prova.txt prova.txt
    smb: \> ls
    smb: \> exit
    ```

    ### Pas 5 – Verifica al servidor

    ```bash
    ls -la /srv/samba/public/
    ```

    El fitxer `prova.txt` ha d'aparèixer amb propietari `nobody`.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Samba guest access smb.conf Linux"`
        - `"smbclient tutorial Linux connect share"`
        - `"Ubuntu Samba public folder no password"`
