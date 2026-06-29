---
title: Recursos compartits al domini Samba ([tecnics], [comuna])
tags:
  - ut4
  - samba
  - active-directory
  - recursos
---

# :material-folder-network: Recursos compartits al domini Samba

!!! abstract "Concepte clau"
    En un DC Samba-AD, es poden definir **recursos compartits** a `smb.conf` que apliquen control d'accés basat en **grups del domini**. `valid users = @tecnics` limita l'accés als membres del grup `tecnics` del domini, usant Kerberos per autenticar.

=== ":material-notebook-outline: Apunts"

    ## Recursos del projecte P43

    El projecte P43 defineix dos recursos principals:

    | Recurs | Accés | Grup |
    |--------|-------|------|
    | `[tecnics]` | Restringit | Grup `tecnics` del domini |
    | `[comuna]` | Obert (tots) | Qualsevol usuari del domini |

    ## Configuració de smb.conf en Samba-AD DC

    En mode AD DC, Samba usa el `smb.conf` generat per `domain provision`. Els recursos es defineixen directament en aquest fitxer:

    ```bash
    sudo nano /etc/samba/smb.conf
    ```

    Afegeix al final:

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

    ## Crea els directoris i assigna permisos

    ```bash
    # Crea els directoris
    sudo mkdir -p /srv/samba/tecnics
    sudo mkdir -p /srv/samba/comuna

    # Propietat: root (o grup del domini si RFC2307 actiu)
    sudo chown root:root /srv/samba/tecnics
    sudo chmod 770 /srv/samba/tecnics

    sudo chown root:root /srv/samba/comuna
    sudo chmod 777 /srv/samba/comuna
    ```

    ## Reinicia Samba i verifica

    ```bash
    sudo samba-tool testparm
    sudo systemctl restart samba-ad-dc
    sudo systemctl status samba-ad-dc
    ```

    ## Accés des del client Windows

    ```powershell
    # Explora els recursos del DC
    net view \\dc1.libretic.local

    # Accedeix al recurs compartit (autenticat via Kerberos)
    explorer \\dc1.libretic.local\tecnics

    # Verifica accés des d'un membre del grup:
    # Inicia sessió com ana (membre de tecnics) → accés OK
    # Inicia sessió com clara (membre de comptabilitat, no tecnics) → accés denegat
    ```

    ## Accés des del client Linux (smbclient)

    ```bash
    # Llista els recursos del DC
    smbclient -L //dc1.libretic.local -U ana

    # Accedeix al recurs [tecnics] com a ana
    smbclient //dc1.libretic.local/tecnics -U ana

    # Dins de smbclient:
    # smb: \> ls
    # smb: \> put fitxer.txt
    # smb: \> exit

    # Prova accés com a clara (membre de comptabilitat, no tecnics)
    smbclient //dc1.libretic.local/tecnics -U clara
    # Ha de retornar: NT_STATUS_ACCESS_DENIED
    ```

    ## Muntatge del recurs a Linux

    ```bash
    # Muntatge temporal
    sudo mount -t cifs //dc1.libretic.local/tecnics /mnt/tecnics \
        -o username=ana,password=contrasenya,domain=LIBRETIC

    # Verificació
    ls /mnt/tecnics

    # Desmunta
    sudo umount /mnt/tecnics
    ```

    !!! tip "Grups del domini a valid users"
        A Samba-AD DC, `valid users = @tecnics` referencia el grup `tecnics` del domini (no un grup local Linux). Samba resol el grup via el directori LDAP intern. En Samba servidor de fitxers (UT3), `@grup` referenciava grups locals Linux; en Samba-AD DC, referencia grups del domini.

    !!! warning "testparm no valida la sintaxi en mode AD DC"
        En mode AD DC, `samba-tool testparm` verifica la sintaxi de `smb.conf` però pot no reportar tots els errors. Comprova sempre els logs: `sudo journalctl -u samba-ad-dc --since "5 min ago"` si un recurs no apareix o no és accessible.

    ??? question "Auto-avaluació"
        **1.** Com es diferencia la referència a un grup a `valid users` entre Samba servidor de fitxers (UT3) i Samba-AD DC (UT4)?

        ??? success "Resposta"
            En Samba **servidor de fitxers** (UT3), `@tecnics` referencia un **grup local Linux** (definit a `/etc/group`). En Samba **AD DC**, `@tecnics` referencia un **grup del domini** (definit al directori Active Directory integrat a Samba). La sintaxi és la mateixa, però l'origen del grup és diferent: local vs directori de domini.

        **2.** Quina ordre verifica des d'un client Linux que un recurs Samba és accessible amb les credencials correctes?

        ??? success "Resposta"
            `smbclient //dc1.libretic.local/tecnics -U ana`. Si l'accés és correcte, mostra el prompt `smb: \>`. Si l'accés és denegat, retorna `NT_STATUS_ACCESS_DENIED`. Per llistar tots els recursos sense autenticar (o com a convidat): `smbclient -L //dc1.libretic.local -N`.

        **3.** Per quin motiu `[comuna]` usa permisos `chmod 777` mentre `[tecnics]` usa `chmod 770`?

        ??? success "Resposta"
            `[comuna]` és un recurs d'accés obert per a **tots els usuaris del domini**, per tant el directori necessita permisos d'escriptura per a qualsevol (`chmod 777`). `[tecnics]` és un recurs restringit al grup `tecnics`; el directori necessita que el propietari i el grup puguin llegir/escriure, però que "altres" no hi tinguin accés (`chmod 770`, permisos per a propietari i grup, cap per a "altres"). La combinació amb `valid users = @tecnics` a Samba i els permisos Unix `770` dona una doble capa de seguretat.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.27 · Recursos compartits al domini Samba

    **Objectiu**: crear i verificar els recursos `[tecnics]` i `[comuna]` al DC Samba.
    **Temps estimat**: 30 minuts
    **Prerequisit**: DC Samba operatiu, usuaris i grups creats (Activitats 4.23–4.24)

    ---

    ### Pas 1 – Crea els directoris

    ```bash
    sudo mkdir -p /srv/samba/{tecnics,comuna}
    sudo chmod 770 /srv/samba/tecnics
    sudo chmod 777 /srv/samba/comuna
    ```

    ### Pas 2 – Modifica smb.conf

    Afegeix `[tecnics]` i `[comuna]` a `/etc/samba/smb.conf`.

    ### Pas 3 – Reinicia i verifica

    ```bash
    sudo systemctl restart samba-ad-dc
    ```

    ### Pas 4 – Test des del client Windows

    ```powershell
    net view \\dc1.libretic.local
    # Accedeix com ana a [tecnics] → OK
    # Accedeix com clara a [tecnics] → Denegat
    ```

    ### Pas 5 – Test des del client Linux

    ```bash
    smbclient //dc1.libretic.local/tecnics -U ana
    smbclient //dc1.libretic.local/tecnics -U clara  # NT_STATUS_ACCESS_DENIED
    smbclient //dc1.libretic.local/comuna -U ana      # OK
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Samba AD DC shared folder group access"`
        - `"smbclient access Samba share Linux"`
        - `"smb.conf valid users group Samba domain"`
