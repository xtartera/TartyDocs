---
title: Configuració del domini Samba AD
tags:
  - ut4
  - samba
  - active-directory
  - dns
  - kerberos
---

# :material-cog-sync: Configuració del domini Samba AD

!!! abstract "Concepte clau"
    Un cop provisionat, el domini necessita un **DNS** ben configurat (zones, reenviadors), **Kerberos** operatiu i el **temps sincronitzat**. Són els tres pilars sobre els quals s'aguanta tota l'autenticació.

=== ":material-notebook-outline: Apunts"

    ## DNS intern: consultes i registres

    Samba porta el seu propi servidor DNS. S'administra amb `samba-tool dns`:

    ```bash
    # Llistar la zona directa del domini
    sudo samba-tool dns query 127.0.0.1 lafita.local @ ALL -U administrator

    # Afegir un registre A per a un servidor de fitxers
    sudo samba-tool dns add 127.0.0.1 lafita.local fitxers A 192.168.100.11 -U administrator
    ```

    !!! tip "Reenviador cap a Internet"
        Perquè els clients del domini també resolguin noms externs, es configura un **forwarder** al DNS de Samba (p. ex. `8.8.8.8`) a `/etc/samba/smb.conf` dins de `[global]`:

        ```ini
        dns forwarder = 8.8.8.8
        ```

    ## Kerberos: comprovació

    ```bash
    kinit administrator@LAFITA.LOCAL   # demana la contrasenya
    klist                              # mostra el TGT i la caducitat
    ```

    | Ordre | Funció |
    |-------|--------|
    | `kinit` | Obté un tiquet (TGT) |
    | `klist` | Mostra els tiquets actius i la caducitat |
    | `kdestroy` | Elimina els tiquets |

    ## Temps: NTP servit pel DC

    En un domini, el DC sol ser també la **font horària**. Amb `chrony`:

    ```bash
    sudo apt install chrony
    ```

    ```mermaid
    graph TD
        NTP["Font NTP externa\n(pool.ntp.org)"] --> DC["DC Samba\n(chrony)"]
        DC --> C1["Clients Windows"]
        DC --> C2["Clients Linux"]
    ```

    !!! warning "Per què importa tant"
        Si els clients no sincronitzen amb el DC, apareixerà el clàssic error de Kerberos per desfasament (>5 min) i no podran iniciar sessió. El temps **no és opcional** en un domini.

    ## Salut del domini

    ```bash
    # Comprovació general del DC
    sudo samba-tool dbcheck --cross-ncs

    # Nivell funcional del domini
    sudo samba-tool domain level show
    ```

    ??? question "Auto-avaluació"
        **1.** Quin paràmetre permet que els clients del domini resolguin noms d'Internet a través del DNS de Samba?

        ??? success "Resposta"
            `dns forwarder` a la secció `[global]` de `smb.conf`, que reenvia les consultes que no són del domini cap a un DNS extern (p. ex. `8.8.8.8`).

        **2.** Per què el DC acostuma a ser la font horària del domini?

        ??? success "Resposta"
            Perquè Kerberos exigeix que client i DC coincideixin en l'hora (marge ~5 min). Centralitzant el temps al DC, tots els clients queden sincronitzats amb la mateixa referència i s'eviten errors d'autenticació.

        **3.** Amb quina ordre obtens i comproves un tiquet Kerberos de l'administrador?

        ??? success "Resposta"
            `kinit administrator@LAFITA.LOCAL` per obtenir-lo i `klist` per comprovar que existeix i veure'n la caducitat.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.C2 · Afina el domini

    **Objectiu**: deixar el DNS, Kerberos i el temps a punt.
    **Temps estimat**: 40 minuts · **Modalitat**: individual

    ---

    ### Tasca 1 – DNS

    Afegeix un registre A `fitxers.lafita.local` i comprova'l amb `host fitxers.lafita.local 127.0.0.1`. Configura el `dns forwarder` i verifica que resols `google.com`.

    ### Tasca 2 – Kerberos

    Obté un TGT amb `kinit` i mostra'l amb `klist`. Anota la data de caducitat.

    ### Tasca 3 – Temps

    Configura `chrony` i comprova amb `chronyc sources` que el DC té una font horària vàlida.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"samba-tool dns manage records"`
        - `"samba ad dc time sync chrony kerberos"`
        - `"kinit klist kerberos linux"`
