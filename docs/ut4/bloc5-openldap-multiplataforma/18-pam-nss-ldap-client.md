---
title: PAM + NSS – Ubuntu LDAP client (libnss-ldapd, nslcd)
tags:
  - ut4
  - ldap
  - pam
  - nss
  - linux
---

# :material-account-lock: PAM + NSS – Ubuntu LDAP client (libnss-ldapd, nslcd)

!!! abstract "Concepte clau"
    Per autenticar usuaris LDAP a Ubuntu sense SSSD, s'usen **libnss-ldapd** (consulta la base d'usuaris LDAP via NSS) i **libpam-ldapd** (autentica via PAM). El dimoni **nslcd** gestiona les connexions al servidor LDAP. Alternativa lleugera a SSSD per a entorns OpenLDAP simples.

=== ":material-notebook-outline: Apunts"

    ## Arquitectura PAM + NSS + nslcd

    ```mermaid
    graph LR
        LOGIN["Login (SSH / GDM / su)"]
        LOGIN -->|"Autenticació"| PAM["PAM\n(libpam-ldapd)"]
        LOGIN -->|"Resolució usuari"| NSS["NSS\n(libnss-ldapd)"]
        PAM -->|"Consulta"| NSLCD["nslcd\n(dimoni LDAP)"]
        NSS -->|"Consulta"| NSLCD
        NSLCD -->|"LDAP port 389"| SLAPD["slapd\n(servidor LDAP)"]
    ```

    ## Instal·lació

    ```bash
    sudo apt install -y libnss-ldapd libpam-ldapd ldap-utils nslcd
    ```

    Durant la instal·lació, l'assistent `debconf` demana:
    - **LDAP server URI**: `ldap://172.16.XXX.20/`
    - **LDAP search base**: `dc=cognom,dc=local`
    - **NSS services to configure**: marca `passwd`, `group`, `shadow`

    ## Configuració: /etc/nslcd.conf

    ```bash
    sudo nano /etc/nslcd.conf
    ```

    ```ini
    # URL del servidor LDAP
    uri ldap://172.16.XXX.20/

    # Base de cerca
    base dc=cognom,dc=local

    # Compte per a les consultes (o anònim si LDAP ho permet)
    # binddn cn=admin,dc=cognom,dc=local
    # bindpw contrasenya_admin

    # Filtre per a usuaris
    filter passwd (objectClass=posixAccount)
    filter group  (objectClass=posixGroup)
    filter shadow (objectClass=shadowAccount)
    ```

    ```bash
    # Reinicia nslcd
    sudo systemctl restart nslcd
    sudo systemctl status nslcd
    ```

    ## Configuració: /etc/nsswitch.conf

    ```bash
    sudo nano /etc/nsswitch.conf
    ```

    Modifica les línies per afegir `ldap`:

    ```
    passwd:         files systemd ldap
    group:          files systemd ldap
    shadow:         files ldap
    ```

    L'ordre importa: primer mira `files` (locals: `/etc/passwd`, `/etc/group`), si no troba busca a `ldap`.

    ## Configuració PAM: /etc/pam.d/

    ```bash
    # Activa pam-ldapd via pam-auth-update
    sudo pam-auth-update
    # Marca: LDAP Authentication
    # Marca: Create home directory on login
    ```

    Comprova `/etc/pam.d/common-auth`:

    ```
    auth    sufficient  pam_ldap.so
    auth    required    pam_unix.so nullok_secure try_first_pass
    ```

    ## Verificació

    ```bash
    # Verifica que NSS resol usuaris LDAP
    getent passwd director201
    # Sortida: director201:x:10001:20001:Director 201:/home/201/director201:/bin/bash

    getent group directors
    # Sortida: directors:*:20001:director201

    # Verifica l'autenticació
    su - director201   # Introdueix la contrasenya LDAP

    # O via SSH
    ssh director201@localhost
    ```

    !!! warning "nslcd vs SSSD: no usar els dos alhora"
        `nslcd` (libnss-ldapd) i `sssd` fan la mateixa funció (consultes NSS/PAM a LDAP) però de forma diferent. **No instal·lis els dos alhora**: produiran conflictes a `nsswitch.conf` i comportaments imprevisibles. Per a entorns amb AD usa SSSD; per a OpenLDAP simple pots usar nslcd o SSSD (tots dos suporten OpenLDAP).

    !!! tip "ldap-utils per a verificació del servidor"
        `ldap-utils` (`ldapsearch`, `ldapadd`, etc.) permet verificar que el servidor LDAP és accessible des del client **abans** de configurar PAM/NSS:
        ```bash
        ldapsearch -x -H ldap://172.16.XXX.20 -b "dc=cognom,dc=local" "(uid=director201)"
        ```
        Si `ldapsearch` funciona però `getent passwd` no, el problema és a la configuració `nsswitch.conf` o `nslcd.conf`.

    ??? question "Auto-avaluació"
        **1.** Quin és el paper de `nslcd` en l'arquitectura PAM + NSS + LDAP?

        ??? success "Resposta"
            `nslcd` (Name Service LDAP Connection Daemon) és el **dimoni intermediari** que gestiona les connexions al servidor LDAP en nom de PAM (`libpam-ldapd`) i NSS (`libnss-ldapd`). Mantén una connexió persistent al servidor LDAP, gestiona la caché de resultats i tradueix les consultes NSS/PAM a consultes LDAP. Sense nslcd en funcionament, ni `getent passwd` ni l'autenticació LDAP funcionaran.

        **2.** Quina línia de `/etc/nsswitch.conf` fa que el sistema busqui primer als fitxers locals i, si no troba l'usuari, al LDAP?

        ??? success "Resposta"
            `passwd: files systemd ldap`. L'ordre determina la seqüència de cerca: primer `/etc/passwd` (`files`), després el servei systemd-userd (`systemd`), i finalment el servidor LDAP (`ldap`). Això permet que els usuaris locals (`root`, `ubuntu`, etc.) funcionin sempre, fins i tot si el servidor LDAP no és accessible.

        **3.** Quina diferència principal hi ha entre usar SSSD i usar libnss-ldapd + libpam-ldapd?

        ??? success "Resposta"
            **SSSD** és més modern i complet: suporta múltiples backends (AD, LDAP, Kerberos), té caché avançada, suporta offline login, i es configura de forma unificada via `sssd.conf`. **libnss-ldapd + libpam-ldapd** (via nslcd) és més lleuger i directe: menys configuració per a entorns OpenLDAP simples, però sense caché robusta ni suport per a backends AD/Kerberos. Per a entorns amb Active Directory, SSSD és imprescindible; per a OpenLDAP simple, tots dos funcionen.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.18 · Client LDAP Ubuntu amb PAM + NSS

    **Objectiu**: configurar un client Ubuntu per autenticar usuaris OpenLDAP via libnss-ldapd i libpam-ldapd.
    **Temps estimat**: 35 minuts
    **Prerequisit**: servidor OpenLDAP operatiu amb usuaris POSIX (Activitat 4.17)

    ---

    ### Pas 1 – Instal·la els paquets al client

    ```bash
    sudo apt install -y libnss-ldapd libpam-ldapd ldap-utils nslcd
    ```

    Configura durant la instal·lació:
    - URI: `ldap://172.16.XXX.20/`
    - Base: `dc=cognom,dc=local`
    - NSS: `passwd group shadow`

    ### Pas 2 – Verifica nslcd

    ```bash
    sudo systemctl status nslcd
    cat /etc/nslcd.conf
    ```

    ### Pas 3 – Comprova nsswitch.conf

    ```bash
    grep -E "^(passwd|group|shadow)" /etc/nsswitch.conf
    ```

    Ha de mostrar `ldap` al final de cada línia.

    ### Pas 4 – Verifica la resolució d'usuaris

    ```bash
    getent passwd director201
    getent group directors
    ```

    ### Pas 5 – Login com a usuari LDAP

    ```bash
    su - director201
    whoami
    pwd
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"libnss-ldapd libpam-ldapd Ubuntu LDAP client setup"`
        - `"nslcd configuration Ubuntu OpenLDAP"`
        - `"nsswitch.conf LDAP Linux explained"`
