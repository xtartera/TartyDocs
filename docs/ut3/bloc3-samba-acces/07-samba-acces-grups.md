---
title: Samba – Accés per grups Linux
tags:
  - ut3
  - samba
---

# :material-account-group: Samba – Accés per grups Linux

!!! abstract "Concepte clau"
    Samba usa la notació `@grup` a les directives `valid users` i `write list` per delegar el control d'accés als grups Linux. Afegir o treure un usuari del grup Linux afecta immediatament l'accés al recurs Samba, sense tocar `smb.conf`.

=== ":material-notebook-outline: Apunts"

    ## Notació @grup

    En lloc de llistar usuaris individualment, pots referenciar grups Linux:

    ```ini
    [alumnes]
        path = /srv/samba/alumnes
        browseable = yes
        valid users = @alumnes
        write list = @alumnes
        create mask = 0664
        directory mask = 0775
        comment = Carpeta del grup alumnes
    ```

    Aquí `@alumnes` fa referència al grup Linux `alumnes`. Tots els membres del grup podran llegir i escriure.

    ## Creació del grup i assignació d'usuaris

    ```bash
    # Crea el grup Linux
    sudo groupadd alumnes

    # Afegeix usuaris al grup
    sudo usermod -aG alumnes maria.puig
    sudo usermod -aG alumnes pere.costa
    sudo usermod -aG alumnes anna.valls

    # Verifica membres del grup
    getent group alumnes
    ```

    ## Permisos del directori

    El directori ha de permetre accés al grup:

    ```bash
    sudo mkdir -p /srv/samba/alumnes
    sudo chown root:alumnes /srv/samba/alumnes
    sudo chmod 770 /srv/samba/alumnes
    ```

    ## Combinació de grups i usuaris individuals

    Pots barrejar usuaris individuals i grups a la mateixa directiva:

    ```ini
    [projectes]
        path = /srv/samba/projectes
        browseable = yes
        valid users = @alumnes @professors director
        write list = @professors director
        read only = yes
    ```

    En aquest exemple:
    - Alumnes, professors i director → poden llegir
    - Professors i director → poden escriure

    ## Avantatge del control per grups

    ```mermaid
    graph LR
        subgraph "Sense grups (per usuaris)"
            A1["valid users = maria.puig\n     pere.costa anna.valls\n     joan.mas ..."]
        end
        subgraph "Amb grups (recomanat)"
            A2["valid users = @alumnes"]
            G["Grup 'alumnes'\n(gestió independent)"]
            A2 --> G
        end
    ```

    Amb grups, quan s'incorpora un alumne nou, **només cal afegir-lo al grup Linux** (`usermod -aG alumnes nouAlumne`). No cal tocar `smb.conf` ni reiniciar `smbd`.

    !!! tip "Connexió amb UT1"
        A Windows Server i AD, la gestió de permisos per grups de seguretat és equivalent: s'assignen permisos al grup, no als usuaris individuals. A Samba, el mecanisme és el mateix però usant grups Unix amb `@grup`.

    !!! warning "Error freqüent"
        Afegir l'usuari al grup però no tancar i tornar a obrir la sessió Samba. Linux actualitza les pertinences de grup en el moment del login; una sessió Samba ja activa **no reflecteix el canvi** fins que l'usuari es desconnecta i reconnecta.

    ??? question "Auto-avaluació"
        **1.** Quina ordre afegeix l'usuari `anna.valls` al grup `alumnes` sense treure'l dels seus grups actuals?

        ??? success "Resposta"
            `sudo usermod -aG alumnes anna.valls`. L'opció `-aG` afegeix (`-a`) al grup especificat (`-G`) sense eliminar-lo dels altres grups. Si s'usa `-G` sense `-a`, l'usuari queda **només** al grup especificat i perd les pertinences anteriors.

        **2.** Per quin motiu és recomanable usar `@grup` en lloc de llistar usuaris individuals a `valid users`?

        ??? success "Resposta"
            Escalabilitat i mantenibilitat. Amb grups, afegir o treure membres **no requereix modificar `smb.conf`** ni reiniciar `smbd`. En entorns amb molts usuaris (aules, empreses), gestionar la llista manual d'usuaris a `smb.conf` és propens a errors i oblit.

        **3.** Quina ordre permet verificar els membres d'un grup Linux?

        ??? success "Resposta"
            `getent group nomGrup`. Mostra el nom del grup, la contrasenya (normalment `x`), el GID i la llista de membres. Per exemple: `getent group alumnes` → `alumnes:x:1001:maria.puig,pere.costa,anna.valls`.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.7 · Recurs compartit per grups

    **Objectiu**: configurar un recurs Samba accessible per grup, verificar l'efecte d'afegir/treure membres.
    **Temps estimat**: 35 minuts

    ---

    ### Pas 1 – Crea el grup i assigna membres

    ```bash
    sudo groupadd alumnes
    sudo usermod -aG alumnes maria.puig
    sudo usermod -aG alumnes pere.costa
    getent group alumnes
    ```

    ### Pas 2 – Crea el directori amb permisos de grup

    ```bash
    sudo mkdir -p /srv/samba/alumnes
    sudo chown root:alumnes /srv/samba/alumnes
    sudo chmod 770 /srv/samba/alumnes
    ```

    ### Pas 3 – Configura smb.conf

    ```ini
    [alumnes]
        path = /srv/samba/alumnes
        browseable = yes
        valid users = @alumnes
        write list = @alumnes
        create mask = 0664
        directory mask = 0775
        comment = Carpeta del grup alumnes
    ```

    ### Pas 4 – Reinicia i prova

    ```bash
    testparm && sudo systemctl restart smbd
    ```

    Prova l'accés com a `maria.puig` i com a `anna.valls` (que **no** és al grup). Documenta el resultat.

    ### Pas 5 – Afegeix `anna.valls` al grup i torna a provar

    ```bash
    sudo usermod -aG alumnes anna.valls
    ```

    Reconnecta com a `anna.valls` i verifica que ara té accés, **sense haver tocat `smb.conf`**.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Samba group permissions @group smb.conf"`
        - `"Linux groupadd usermod groups tutorial"`
        - `"Samba file sharing groups Ubuntu"`
