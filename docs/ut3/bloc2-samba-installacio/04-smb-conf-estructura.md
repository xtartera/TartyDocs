---
title: smb.conf – Estructura i seccions
tags:
  - ut3
  - samba
---

# :material-file-cog: smb.conf – Estructura i seccions

!!! abstract "Concepte clau"
    `smb.conf` és el fitxer de configuració central de Samba. S'organitza en **seccions** delimitades per `[nom]`: la secció `[global]` per als paràmetres generals i una secció per a cada recurs compartit. Cada canvi requereix reiniciar `smbd`.

=== ":material-notebook-outline: Apunts"

    ## Localització i còpia de seguretat

    ```bash
    ls /etc/samba/smb.conf
    sudo cp /etc/samba/smb.conf /etc/samba/smb.conf.bak
    ```

    Sempre fes una còpia de seguretat abans de modificar `smb.conf`.

    ## Estructura general

    ```ini
    [global]
        # Paràmetres que afecten tot el servidor Samba
        workgroup = WORKGROUP
        server string = Servidor Samba %v
        log file = /var/log/samba/log.%m
        max log size = 1000

    [nom-del-recurs]
        # Paràmetres d'un recurs compartit concret
        path = /srv/samba/nom-del-recurs
        browseable = yes
        ...
    ```

    ## Secció [global]

    Paràmetres habituals de la secció `[global]`:

    | Paràmetre | Valor típic | Funció |
    |-----------|------------|--------|
    | `workgroup` | `WORKGROUP` | Grup de treball o domini Windows |
    | `server string` | `Samba Server %v` | Descripció que veuen els clients |
    | `log file` | `/var/log/samba/log.%m` | Fitxer de log per client (`%m` = hostname) |
    | `map to guest` | `Bad User` | Usuaris desconeguts → compte `nobody` |
    | `security` | `user` | Mode d'autenticació (user = per usuari) |

    ## Seccions de recursos compartits

    Cada recurs compartit es declara amb `[nom-del-recurs]`:

    ```ini
    [public]
        path = /srv/samba/public
        browseable = yes
        writable = yes
        guest ok = yes
        comment = Carpeta pública
    ```

    ### Directives fonamentals d'un recurs

    | Directiva | Valors | Funció |
    |-----------|--------|--------|
    | `path` | ruta absoluta | Directori del sistema de fitxers que es comparteix |
    | `browseable` | `yes` / `no` | Si apareix a la llista de recursos (`smbclient -L`) |
    | `writable` | `yes` / `no` | Permet escriptura (equivalent a `read only = no`) |
    | `guest ok` | `yes` / `no` | Permet accés sense autenticació |
    | `valid users` | `usuari @grup` | Llista d'usuaris o grups autoritzats |
    | `write list` | `usuari @grup` | Qui pot escriure (dins de `valid users`) |
    | `comment` | text lliure | Descripció del recurs |
    | `create mask` | p.ex. `0664` | Màscara de permisos per a fitxers nous |
    | `directory mask` | p.ex. `0775` | Màscara de permisos per a carpetes noves |

    ## Validació i recàrrega

    Abans d'aplicar canvis, verifica la sintaxi:

    ```bash
    testparm
    ```

    Sortida esperada (sense errors):

    ```text
    Load smb config files from /etc/samba/smb.conf
    Loaded services file OK.
    ```

    Aplica els canvis reiniciant `smbd`:

    ```bash
    sudo systemctl restart smbd
    ```

    !!! warning "Error freqüent"
        Modificar `smb.conf` i no reiniciar `smbd`. Els canvis **no s'apliquen** fins que el dimoni no es reinicia o es fa `sudo smbcontrol smbd reload`. Si la configuració nova no funciona, el primer que cal comprovar és si `smbd` s'ha reiniciat.

    ## Seqüència de canvis a smb.conf

    ```
    1. Edita smb.conf
       ↓
    2. Valida sintaxi: testparm
       ↓ (si hi ha errors, torna a editar)
    3. Reinicia: sudo systemctl restart smbd
       ↓
    4. Prova la connexió: smbclient -L //localhost -N
    ```

    ??? question "Auto-avaluació"
        **1.** Quina ordre verifica la sintaxi de `smb.conf` sense reiniciar Samba?

        ??? success "Resposta"
            `testparm`. Llegeix `smb.conf`, reporta errors de sintaxi i mostra la configuració efectiva (amb els valors per defecte inclosos). Cal executar-la sempre abans de reiniciar `smbd`.

        **2.** Quina secció de `smb.conf` afecta tot el servidor Samba?

        ??? success "Resposta"
            La secció `[global]`. Conté paràmetres com `workgroup`, `security`, `log file` i `map to guest` que s'apliquen a tots els recursos compartits.

        **3.** Quin és el nom de fitxer de la còpia de seguretat que es recomana fer abans de modificar `smb.conf`?

        ??? success "Resposta"
            No hi ha un nom estàndard obligatori, però la convenció habitual és afegir el sufix `.bak`: `sudo cp /etc/samba/smb.conf /etc/samba/smb.conf.bak`. Això permet revertir si la configuració nova trenca el servei.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.4 · Exploració de smb.conf

    **Objectiu**: entendre l'estructura de `smb.conf` i crear un primer recurs compartit bàsic.
    **Temps estimat**: 25 minuts

    ---

    ### Pas 1 – Fes una còpia de seguretat

    ```bash
    sudo cp /etc/samba/smb.conf /etc/samba/smb.conf.bak
    ```

    ### Pas 2 – Explora el fitxer original

    ```bash
    sudo cat /etc/samba/smb.conf | grep -v "^#\|^;\|^$"
    ```

    Identifica les seccions presents per defecte i quins paràmetres estan actius.

    ### Pas 3 – Afegeix un recurs compartit bàsic

    Obre `smb.conf` amb l'editor:

    ```bash
    sudo nano /etc/samba/smb.conf
    ```

    Afegeix al final del fitxer:

    ```ini
    [public]
        path = /srv/samba/public
        browseable = yes
        writable = yes
        guest ok = yes
        comment = Carpeta pública de prova
    ```

    ### Pas 4 – Valida i reinicia

    ```bash
    testparm
    sudo systemctl restart smbd
    ```

    ### Pas 5 – Verifica des del client

    Des d'un altre terminal (o client Linux):

    ```bash
    smbclient -L //192.168.100.10 -N
    ```

    El recurs `public` ha d'aparèixer a la llista.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"smb.conf configuration tutorial Linux"`
        - `"Samba testparm verify configuration"`
        - `"Samba shared folder smb.conf example"`
