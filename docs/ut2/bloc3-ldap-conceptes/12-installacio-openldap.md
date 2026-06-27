---
title: Instal·lació d'OpenLDAP
tags:
  - ut2
  - ldap
  - openldap
  - apt
---

# :material-database: Instal·lació d'OpenLDAP (slapd)

!!! abstract "Concepte clau"
    **slapd** (*Stand-alone LDAP Daemon*) és el servei OpenLDAP que escolta al port 389. S'instal·la amb `apt install slapd ldap-utils`: `slapd` és el servidor i `ldap-utils` conté les eines client (`ldapsearch`, `ldapadd`, `ldapmodify`, etc.).

=== ":material-notebook-outline: Apunts"

    ## Components que s'instal·len

    | Paquet | Contingut | Funció |
    |--------|-----------|--------|
    | `slapd` | Servei `slapd` | Servidor LDAP, escolta al port 389 |
    | `ldap-utils` | `ldapsearch`, `ldapadd`, `ldapmodify`, `ldapdelete`, `ldapwhoami` | Eines client per consultar i gestionar el directori |

    !!! tip "Connexió amb UT1"
        Instal·lar `slapd` és equivalent a afegir el rol **Active Directory Domain Services** a Windows Server — és el pas que converteix el servidor en un directori. La diferència és que AD DS requereix una GUI i un assistent llarg; `slapd` s'instal·la en una sola ordre de terminal.

    ## Prerequisit: hostname configurat

    Abans d'instal·lar `slapd`, el hostname ha d'estar correctament configurat. OpenLDAP l'usa per generar el nom del domini per defecte:

    ```bash
    # Comprova el hostname actual
    hostname -f
    # Ha de mostrar: srv-ldap.lafita.local
    ```

    Si no és correcte, configura'l primer (pàgina [05 — Hostname i resolució local](../bloc2-installacio/05-hostname-resolucio.md)).

    !!! warning "slapd usa el hostname per al domini base per defecte"
        Si el hostname és `ubuntu` o `localhost` en el moment d'instal·lar `slapd`, el domini per defecte serà `dc=ubuntu` o `dc=localhost`. Podràs corregir-ho amb `dpkg-reconfigure slapd` (pàgina següent), però és millor tenir el hostname correcte des del principi.

    ## Instal·lació

    ```bash
    # Actualitza la llista de paquets (sempre primer)
    sudo apt update

    # Instal·la el servidor LDAP i les eines client
    sudo apt install -y slapd ldap-utils
    ```

    Durant la instal·lació, `apt` mostra un diàleg interactiu que demana la **contrasenya de l'administrador LDAP** (`cn=admin,dc=lafita,dc=local`). Introdueix la contrasenya que vulguis — la pots canviar més tard.

    !!! danger "Anota la contrasenya d'admin LDAP"
        La contrasenya que introdueixes aquí és la del compte `cn=admin,dc=lafita,dc=local`. Sense ella no podràs afegir ni modificar entrades al directori. Si la perds, hauràs de reconfigurar `slapd` des de zero.

    ## Verificació de la instal·lació

    ```bash
    # Comprova que slapd s'ha iniciat correctament
    systemctl status slapd
    ```

    Sortida esperada:
    ```text
    ● slapd.service - LSB: OpenLDAP standalone server (Lightweight Directory Access Protocol)
         Loaded: loaded (/etc/init.d/slapd; generated)
         Active: active (running) since ...
    ```

    ```bash
    # Comprova que el port 389 està a l'escolta
    ss -tulpn | grep 389
    ```

    Sortida esperada:
    ```text
    tcp  LISTEN  0  128  0.0.0.0:389  0.0.0.0:*  users:(("slapd",pid=...,fd=...))
    ```

    ```bash
    # Primera prova: consulta anònima a la base del directori
    ldapsearch -x -b "" -s base namingContexts
    ```

    Sortida esperada:
    ```text
    # extended LDIF
    #
    # LDAPv3
    # base <> with scope baseObject
    # filter: (objectclass=*)
    # requesting: namingContexts
    #

    #
    dn:
    namingContexts: dc=lafita,dc=local

    # search result
    search: 2
    result: 0 Success
    ```

    La línia `namingContexts: dc=lafita,dc=local` confirma que el directori ja coneix el domini base.

    ## Estructura de fitxers creada per slapd

    ```bash
    # Directori de configuració (OLC — On-Line Configuration)
    ls /etc/ldap/slapd.d/

    # Base de dades LDAP (backend MDB)
    ls /var/lib/ldap/

    # Fitxer de configuració del client LDAP global
    cat /etc/ldap/ldap.conf
    ```

    | Ruta | Contingut |
    |------|-----------|
    | `/etc/ldap/slapd.d/` | Configuració del servidor en format LDIF (OLC) |
    | `/var/lib/ldap/` | Base de dades MDB (fitxers binaris `data.mdb`) |
    | `/etc/ldap/ldap.conf` | Configuració del client LDAP (URI del servidor, base DN) |

    ## Gestió del servei

    ```bash
    # Atura el servei
    sudo systemctl stop slapd

    # Arrenca el servei
    sudo systemctl start slapd

    # Reinicia (aplica canvis de configuració)
    sudo systemctl restart slapd

    # Habilita l'inici automàtic en arrencar el servidor
    sudo systemctl enable slapd

    # Veure els últims missatges del log
    journalctl -u slapd -n 50
    ```

    ??? question "Auto-avaluació"

        **1.** Has instal·lat `slapd` però `systemctl status slapd` mostra `failed`. Quins serien els primers passos per diagnosticar l'error?

        ??? success "Resposta"
            (1) Mira el log detallat: `journalctl -u slapd -n 50` — habitualment indica el motiu exacte de la fallada. (2) Els motius més habituals en una instal·lació nova: el hostname no es resol correctament (comprova `/etc/hosts`), o hi ha un port 389 ja ocupat per un altre procés (`ss -tulpn | grep 389`). (3) Si la configuració ha quedat corrupta, la solució nuclear és `sudo apt purge slapd && sudo apt install slapd` (purge elimina tots els fitxers de configuració i permet recomençar des de zero).

        **2.** Per quin motiu `ldap-utils` és un paquet separat de `slapd`?

        ??? success "Resposta"
            La separació segueix el principi Unix de separació de rols: `slapd` és el servidor (s'instal·la als servidors LDAP) i `ldap-utils` conté els clients (es pot instal·lar als clients que consulten el directori). Un client Ubuntu que volem connectar a LDAP amb SSSD no necessita `slapd` (no és un servidor), però sí `ldap-utils` per fer proves de connectivitat amb `ldapsearch`. La separació evita instal·lar programari innecessari.

        **3.** La sortida de `ldapsearch -x -b "" -s base namingContexts` mostra `namingContexts: dc=ubuntu,dc=local` en lloc de `dc=lafita,dc=local`. Quin és el motiu i com ho soluciones?

        ??? success "Resposta"
            El motiu és que `slapd` s'ha instal·lat quan el hostname era `ubuntu` (el nom per defecte d'Ubuntu) en lloc de `srv-ldap.lafita.local`. El domini base per defecte es deriva del hostname en el moment de la instal·lació. La solució és `sudo dpkg-reconfigure slapd` (pàgina [13 — Configuració base d'OpenLDAP](13-configuracio-base-ldap.md)), que permet canviar el domini sense reinstal·lar.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.3 · Instal·la OpenLDAP al servidor

    **Objectiu**: instal·lar `slapd` i verificar que el directori base és `dc=lafita,dc=local`.

    **Temps estimat**: 20 minuts

    ---

    ### Part A – Prerequisit: comprova el hostname

    ```bash
    hostname -f
    # Ha de mostrar: srv-ldap.lafita.local
    ```

    Si no és correcte, torna a la pàgina [05 — Hostname i resolució local](../bloc2-installacio/05-hostname-resolucio.md).

    ### Part B – Instal·lació

    ```bash
    sudo apt update
    sudo apt install -y slapd ldap-utils
    ```

    Quan aparegui el diàleg de contrasenya, introdueix `ldap1234` (o la contrasenya que indiqui el professor).

    ### Part C – Verificació

    ```bash
    systemctl status slapd
    ss -tulpn | grep 389
    ldapsearch -x -b "" -s base namingContexts
    ```

    Comprova que la sortida de `ldapsearch` mostra `namingContexts: dc=lafita,dc=local`.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"install OpenLDAP Ubuntu Server slapd tutorial"`
        - `"slapd install Ubuntu 24.04 step by step"`
        - `"ldap-utils ldapsearch Ubuntu test connection"`
