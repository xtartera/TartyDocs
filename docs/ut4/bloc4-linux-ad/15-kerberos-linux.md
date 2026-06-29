---
title: Kerberos a Linux – krb5-user, kinit, klist
tags:
  - ut4
  - active-directory
  - kerberos
  - linux
---

# :material-key-chain: Kerberos a Linux – krb5-user, kinit, klist

!!! abstract "Concepte clau"
    **Kerberos** és el protocol d'autenticació d'Active Directory. A Linux, el paquet `krb5-user` proporciona les eines de línia d'ordres: `kinit` obté un ticket d'autenticació del KDC, `klist` el llista, i `kdestroy` l'elimina. Sense Kerberos, la integració amb AD no és possible.

=== ":material-notebook-outline: Apunts"

    ## Configuració de Kerberos: /etc/krb5.conf

    Quan `realm join` s'executa correctament, configura `/etc/krb5.conf` automàticament:

    ```ini
    [libdefaults]
        default_realm = AD-COGNOM.LOCAL
        dns_lookup_realm = false
        dns_lookup_kdc = true
        ticket_lifetime = 24h
        renew_lifetime = 7d
        forwardable = true

    [realms]
        AD-COGNOM.LOCAL = {
            kdc = WSRV201.ad-cognom.local
            admin_server = WSRV201.ad-cognom.local
        }

    [domain_realm]
        .ad-cognom.local = AD-COGNOM.LOCAL
        ad-cognom.local = AD-COGNOM.LOCAL
    ```

    ## Obtenir un ticket Kerberos (kinit)

    ```bash
    # Obté un Ticket Granting Ticket (TGT) per a l'usuari
    kinit director201@AD-COGNOM.LOCAL
    # Introdueix la contrasenya

    # O de forma no interactiva (per a scripts)
    echo "contrasenya" | kinit director201@AD-COGNOM.LOCAL
    ```

    ## Verificar els tickets actius (klist)

    ```bash
    klist
    ```

    Sortida esperada:

    ```
    Ticket cache: FILE:/tmp/krb5cc_1000
    Default principal: director201@AD-COGNOM.LOCAL

    Valid starting     Expires            Service principal
    06/29/26 10:00:00  06/30/26 10:00:00  krbtgt/AD-COGNOM.LOCAL@AD-COGNOM.LOCAL
            renew until 07/06/26 10:00:00
    ```

    - **krbtgt**: el TGT (Ticket Granting Ticket) — confirma l'autenticació bàsica
    - **Valid starting / Expires**: validesa del ticket (per defecte 10 hores, renovable fins a 7 dies)

    ## Verificar que el KDC és accessible

    ```bash
    # Comprova la connexió al KDC (port 88)
    nc -zv 172.16.XXX.10 88
    # o:
    kinit -V director201@AD-COGNOM.LOCAL   # Mode verbós: mostra el KDC contactat
    ```

    ## Eliminar els tickets (kdestroy)

    ```bash
    kdestroy
    klist   # No hauria de mostrar cap ticket
    ```

    ## Renovar un ticket expirat

    ```bash
    # Renova el TGT actual (si encara és renovable)
    kinit -R

    # Verifica
    klist
    ```

    ## Kerberos i SSSD: integració automàtica

    Quan un usuari inicia sessió via PAM (login, SSH), SSSD obté automàticament un TGT Kerberos i el desa al cache del sistema. No cal fer `kinit` manualment. SSSD gestiona la renovació dels tickets en segon pla.

    ```bash
    # Comprova els tickets SSSD (com a root)
    sudo ls /var/lib/sss/db/
    # Els fitxers .ldb contenen la caché d'SSSD (no llegible directament)
    ```

    !!! warning "Realm en majúscules"
        A `/etc/krb5.conf`, el realm de Kerberos ha d'estar en **MAJÚSCULES**: `AD-COGNOM.LOCAL` (no `ad-cognom.local`). És un requisit del protocol Kerberos. Els errors de majúscules/minúscules produeixen `kinit: Cannot contact any KDC for realm 'ad-cognom.local'`.

    !!! tip "kinit per a proves de diagnòstic"
        `kinit` és una excel·lent eina de diagnòstic: si funciona (obté el TGT), vol dir que la xarxa, el DNS, el KDC i les credencials de l'usuari estan bé. Si falla, el missatge d'error indica exactament on és el problema (xarxa, credencials, configuració de realm, etc.).

    ??? question "Auto-avaluació"
        **1.** Quin és el propòsit del TGT (Ticket Granting Ticket) en Kerberos?

        ??? success "Resposta"
            El **TGT** és un ticket emès pel KDC que demostra que l'usuari s'ha autenticat correctament. No dóna accés a cap servei directament, però permet obtenir **Service Tickets** (ST) per a serveis concrets (SMB, NFS, LDAP) sense tornar a introduir la contrasenya. El TGT és com una sessió Kerberos: mentre és vàlid (típicament 10 hores), l'usuari pot accedir a tots els serveis del domini sense reautenticar-se.

        **2.** Per quin motiu el realm a `/etc/krb5.conf` ha d'estar en majúscules?

        ??? success "Resposta"
            El **protocol Kerberos** distingeix entre majúscules i minúscules en els noms de realm. Per convenció i per compatibilitat entre implementacions (MIT Kerberos, Heimdal, Microsoft), el realm es representa sempre en **MAJÚSCULES**. Active Directory usa `AD-COGNOM.LOCAL` (majúscules), i si el client Linux configura `ad-cognom.local` (minúscules), el KDC el tracta com un realm diferent i rebutja la petició.

        **3.** Com es verifica, desde la línia d'ordres, que el client Linux pot obtenir un ticket Kerberos del DC?

        ??? success "Resposta"
            `kinit director201@AD-COGNOM.LOCAL` + contrasenya. Si té èxit, `klist` mostra el TGT amb les dates de validesa. Si falla, el missatge d'error indica el problema: `"Cannot contact any KDC"` → problema de xarxa o DNS; `"Client not found in Kerberos database"` → l'usuari no existeix al domini; `"Pre-authentication failed"` → contrasenya incorrecta.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.15 · Tickets Kerberos a Linux

    **Objectiu**: obtenir, verificar i gestionar tickets Kerberos des de la línia d'ordres a Ubuntu.
    **Temps estimat**: 20 minuts
    **Prerequisit**: realm join completat (Activitat 4.13)

    ---

    ### Pas 1 – Explora la configuració de Kerberos

    ```bash
    cat /etc/krb5.conf
    ```

    Documenta: quin és el `default_realm`? Quin és el servidor KDC?

    ### Pas 2 – Obté un ticket

    ```bash
    kinit director201@AD-COGNOM.LOCAL
    ```

    ### Pas 3 – Verifica el ticket

    ```bash
    klist
    ```

    Documenta: quan caduca el TGT? Quan és renovable?

    ### Pas 4 – Comprova la connexió al KDC

    ```bash
    nc -zv 172.16.XXX.10 88
    ```

    ### Pas 5 – Elimina el ticket i verifica

    ```bash
    kdestroy
    klist
    ```

    Documenta el missatge de `klist` quan no hi ha tickets.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Kerberos kinit klist Linux tutorial"`
        - `"krb5-user Linux Active Directory authentication"`
        - `"Kerberos TGT ticket explained Linux"`
