---
title: samba-tool – gestió d'usuaris i grups
tags:
  - ut4
  - samba
  - active-directory
---

# :material-account-cog: samba-tool – gestió d'usuaris i grups

!!! abstract "Concepte clau"
    **samba-tool** és la CLI d'administració de Samba-AD DC. Permet crear usuaris (`user create`), grups (`group add`), afegir membres (`group addmembers`), canviar contrasenyes (`user setpassword`) i verificar l'estat del domini. Equivalent a `New-ADUser` i `New-ADGroup` de PowerShell.

=== ":material-notebook-outline: Apunts"

    ## Gestió d'usuaris

    ```bash
    # Crea un usuari
    sudo samba-tool user create ana \
        --given-name="Ana" \
        --surname="Martí" \
        --mail-address="ana@libretic.local" \
        --login-shell="/bin/bash" \
        --home-directory="/home/ana" \
        --uid-number=10001 \
        --gid-number=10001

    # Crea altres usuaris del P43
    sudo samba-tool user create marc --given-name="Marc" --surname="Puig" --uid-number=10002 --gid-number=10002
    sudo samba-tool user create clara --given-name="Clara" --surname="Valls" --uid-number=10003 --gid-number=10003
    ```

    Nota: `--uid-number` i `--gid-number` requereixen que s'hagi proveït el domini amb `--use-rfc2307`.

    ## Llistar i cercar usuaris

    ```bash
    # Llista tots els usuaris del domini
    sudo samba-tool user list

    # Informació detallada d'un usuari
    sudo samba-tool user show ana

    # Des de l'API LDAP (alternativa)
    ldapsearch -H ldap://localhost -b "DC=libretic,DC=local" \
        -D "administrator@libretic.local" -W \
        "(sAMAccountName=ana)"
    ```

    ## Gestió de grups

    ```bash
    # Crea grups del projecte P43
    sudo samba-tool group add tecnics \
        --description="Grup de tècnics"
    sudo samba-tool group add comptabilitat
    sudo samba-tool group add direccio

    # Llista els grups
    sudo samba-tool group list

    # Afegeix membres al grup
    sudo samba-tool group addmembers tecnics ana,marc
    sudo samba-tool group addmembers comptabilitat clara

    # Verifica els membres del grup
    sudo samba-tool group listmembers tecnics
    ```

    ## Gestió de contrasenyes

    ```bash
    # Canvia la contrasenya d'un usuari
    sudo samba-tool user setpassword ana --newpassword="NouP@ss1!"

    # Força el canvi de contrasenya en el pròxim login
    sudo samba-tool user setexpiry ana --days=0

    # Desactiva un compte
    sudo samba-tool user disable marc

    # Activa un compte
    sudo samba-tool user enable marc
    ```

    ## Informació del domini

    ```bash
    # Informació general del domini
    sudo samba-tool domain info 127.0.0.1

    # Estat de la replicació (si hi ha múltiples DC)
    sudo samba-tool drs showrepl

    # Verifica els SRV DNS
    sudo samba-tool dns serverinfo 127.0.0.1

    # Nivell funcional del domini
    sudo samba-tool domain level show
    ```

    ## wbinfo: verificació via winbind

    ```bash
    # Llista usuaris via winbind
    sudo wbinfo -u

    # Llista grups via winbind
    sudo wbinfo -g

    # Comprova les credencials d'un usuari
    sudo wbinfo --authenticate=LIBRETIC/ana%contrasenya

    # Converteix SID a nom
    sudo wbinfo --sid-to-name S-1-5-21-XXXXX

    # Info de l'usuari
    sudo wbinfo -i ana
    ```

    !!! tip "samba-tool vs RSAT"
        `samba-tool` és potent però funciona per CLI. Per a una gestió visual, instal·la **RSAT** a un client Windows unit al domini Samba: `Active Directory Users and Computers` (ADUC), `Group Policy Management` (GPMC) i altres eines gràfiques funcionaran amb el Samba DC com si fos un DC de Windows.

    !!! warning "uid-number en comptes RFC2307"
        Si el domini va ser proveït amb `--use-rfc2307`, pots assignar `--uid-number` i `--gid-number` als usuaris. Sense aquesta opció, Samba-AD no emmagatzema UIDs POSIX i els clients Linux necessitaran `ldap_id_mapping = True` a sssd.conf (on SSSD genera UIDs automàticament). Per a la integració amb NFS (que usa UIDs reals), és millor RFC2307 amb UIDs explícits.

    ??? question "Auto-avaluació"
        **1.** Quina ordre `samba-tool` crea el grup `tecnics` i afegeix l'usuari `ana` com a membre?

        ??? success "Resposta"
            `sudo samba-tool group add tecnics` per crear el grup. `sudo samba-tool group addmembers tecnics ana` per afegir `ana` com a membre. Pots afegir múltiples membres en una sola ordre: `sudo samba-tool group addmembers tecnics ana,marc,pere`.

        **2.** Per quin motiu cal especificar `--uid-number` en `samba-tool user create` en un domini proveït amb `--use-rfc2307`?

        ??? success "Resposta"
            Quan el domini s'ha proveït amb `--use-rfc2307`, la base de dades Samba emmagatzema atributs POSIX (RFC 2307) per als comptes: `uidNumber`, `gidNumber`, `homeDirectory`, `loginShell`. Especificant `--uid-number`, assignes un UID numèric fix a l'usuari que els clients Linux usaran. Sense especificar-lo, l'usuari no tindrà `uidNumber` i SSSD haurà de generar-lo dinàmicament (`ldap_id_mapping = True`), cosa que pot crear inconsistències entre clients.

        **3.** Quina diferència hi ha entre `samba-tool user list` i `wbinfo -u`?

        ??? success "Resposta"
            `samba-tool user list` consulta directament la **base de dades Samba (LDB)** i llista els usuaris del directori. `wbinfo -u` consulta a través del servei **winbind**, que actua com a intermediari entre el sistema Linux i el domini. `wbinfo` reflecteix el que veurien els clients, mentre que `samba-tool` mostra les dades internes del DC. Diferència pràctica: `wbinfo` inclou el prefix de domini (`LIBRETIC\ana`); `samba-tool` mostra el `sAMAccountName` sol (`ana`).

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.24 · Usuaris i grups amb samba-tool

    **Objectiu**: crear els usuaris i grups del projecte P43 al domini libretic.local.
    **Temps estimat**: 25 minuts
    **Prerequisit**: DC Samba operatiu (Activitat 4.23)

    ---

    ### Pas 1 – Crea els usuaris

    ```bash
    sudo samba-tool user create ana --given-name="Ana" --uid-number=10001 --gid-number=10001
    sudo samba-tool user create marc --given-name="Marc" --uid-number=10002 --gid-number=10002
    sudo samba-tool user create clara --given-name="Clara" --uid-number=10003 --gid-number=10003
    ```

    ### Pas 2 – Crea els grups i afegeix membres

    ```bash
    sudo samba-tool group add tecnics
    sudo samba-tool group add comptabilitat
    sudo samba-tool group add direccio
    sudo samba-tool group addmembers tecnics ana,marc
    sudo samba-tool group addmembers comptabilitat clara
    ```

    ### Pas 3 – Verifica

    ```bash
    sudo samba-tool user list
    sudo samba-tool group list
    sudo samba-tool group listmembers tecnics
    sudo wbinfo -u
    sudo wbinfo -g
    ```

    Documenta la sortida de cada ordre.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"samba-tool user create group add tutorial"`
        - `"wbinfo samba domain users groups"`
        - `"Samba AD DC user management CLI"`
