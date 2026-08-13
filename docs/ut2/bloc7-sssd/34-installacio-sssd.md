---
title: Instal·lació de SSSD
tags:
  - ut2
  - sssd
  - apt
---

# :material-package-variant: Instal·lació de SSSD

!!! abstract "Concepte clau"
    La instal·lació de SSSD requereix tres paquets principals: `sssd` (el servei), `sssd-ldap` (el proveïdor LDAP) i `libpam-sss` (la integració PAM). Sense `libpam-sss`, SSSD resol noms però no pot autenticar logins.

=== ":material-notebook-outline: Apunts"

    ## Paquets necessaris

    | Paquet | Funció |
    |--------|--------|
    | `sssd` | Dimoni principal SSSD |
    | `sssd-ldap` | Proveïdor LDAP per a SSSD (id i auth via LDAP) |
    | `libpam-sss` | Mòdul PAM per a autenticació amb SSSD |
    | `libnss-sss` | Mòdul NSS per a resolució de noms (inclòs amb `sssd`) |
    | `sssd-tools` | Eines de diagnòstic (`sssctl`) |

    ## Instal·lació

    ```bash
    sudo apt update
    sudo apt install -y sssd sssd-ldap libpam-sss sssd-tools
    ```

    Sortida esperada (resum):
    ```text
    The following NEW packages will be installed:
      libpam-sss libnss-sss sssd sssd-common sssd-ldap sssd-tools ...
    Setting up sssd (2.9.x-...) ...
    ```

    ## Verificació de la instal·lació

    ### Estat del servei

    ```bash
    systemctl status sssd
    ```

    !!! warning "SSSD fallarà immediatament després d'instal·lar-se"
        Just després de la instal·lació, SSSD intentarà iniciar-se però fallarà perquè `/etc/sssd/sssd.conf` no existeix encara. Això és **normal** — el servei es configurarà a la pàgina 29.

    Sortida esperada (just instal·lat, sense configurar):
    ```text
    ● sssd.service - System Security Services Daemon
         Loaded: loaded (/lib/systemd/system/sssd.service; enabled)
         Active: failed (Result: exit-code)
    ...
    sssd[...]: No configuration file, SSSD not started.
    ```

    ### Fitxers i directoris creats

    ```bash
    ls /etc/sssd/
    ```
    ```text
    conf.d/
    ```
    (El fitxer `sssd.conf` no existeix yet — el crearàs a la pàgina 29.)

    ```bash
    ls /var/lib/sss/
    ```
    ```text
    db/  deskprofile/  gpo_cache/  mc/  pipes/  pubconf/  run/  secrets/
    ```

    ```bash
    ls /var/log/sssd/
    ```
    ```text
    sssd.log
    ```

    ### Referència de fitxers de SSSD

    | Fitxer / Directori | Propòsit |
    |--------------------|---------|
    | `/etc/sssd/sssd.conf` | Configuració principal (el crearàs a la pàgina 29) |
    | `/etc/sssd/conf.d/` | Configuració addicional per fragments |
    | `/var/lib/sss/db/` | Caché local d'usuaris i grups LDAP |
    | `/var/log/sssd/` | Fitxers de log (un per servei: `sssd_nss.log`, `sssd_pam.log`, etc.) |
    | `/var/lib/sss/pipes/` | Sockets UNIX de comunicació interna |

    ## Verificació dels mòduls instal·lats

    ```bash
    # Comprova que el mòdul NSS de SSSD existeix
    ls /usr/lib/x86_64-linux-gnu/libnss_sss*
    ```
    ```text
    /usr/lib/x86_64-linux-gnu/libnss_sss.so.2
    ```

    ```bash
    # Comprova que el mòdul PAM de SSSD existeix
    ls /usr/lib/x86_64-linux-gnu/security/pam_sss*
    ```
    ```text
    /usr/lib/x86_64-linux-gnu/security/pam_sss.so
    ```

    Si ambdós fitxers existeixen, la instal·lació és completa. El següent pas és crear `/etc/sssd/sssd.conf` (pàgina 29).

    !!! tip "Connexió amb UT1"
        A Windows, integrar un client al domini Active Directory instal·la automàticament els components necessaris quan fas *Join Domain*. A Linux, has d'instal·lar els paquets manualment i configurar-los. El resultat final és equivalent: el sistema pot autenticar usuaris contra un directori central.

    ??? question "Auto-avaluació"

        **1.** Per quin motiu SSSD falla immediatament després d'instal·lar-se?

        ??? success "Resposta"
            Perquè el servei intenta llegir la configuració de `/etc/sssd/sssd.conf` en iniciar-se, però aquest fitxer no existeix just després de la instal·lació. El paquet `sssd` crea el directori `/etc/sssd/` però no crea el fitxer de configuració — és responsabilitat de l'administrador crear-lo amb els paràmetres del seu entorn (domini LDAP, servidor, base de cerca, etc.). Un cop creat el fitxer (pàgina 29), el servei iniciarà correctament.

        **2.** Quina diferència hi ha entre els paquets `sssd-ldap` i `libpam-sss`? Per quin motiu calen els dos?

        ??? success "Resposta"
            `sssd-ldap` és el **proveïdor de backend**: ensenya a SSSD com parlar amb un servidor LDAP per obtenir informació d'usuaris i verificar credencials. Sense ell, SSSD no sabria com consultar OpenLDAP. `libpam-sss` és el **mòdul de frontend PAM**: permet que el sistema d'autenticació Linux (PAM) delegui la verificació de contrasenyes a SSSD. Sense ell, `getent passwd` funcionaria (SSSD veu els usuaris) però `login` i `ssh` fallarien (PAM no podria verificar les contrasenyes via SSSD).

=== ":material-pencil-ruler: Activitat"

    ## Activitat 6.1 · Instal·la i inspecciona SSSD

    **Objectiu**: instal·lar SSSD i verificar els fitxers i mòduls creats.

    **Temps estimat**: 15 minuts

    ---

    ### Part A – Instal·la els paquets

    ```bash
    sudo apt install -y sssd sssd-ldap libpam-sss sssd-tools
    systemctl status sssd
    ```

    Anota: quin missatge d'error dóna SSSD? Per quin motiu?

    ### Part B – Inspecciona els fitxers instal·lats

    ```bash
    ls -la /etc/sssd/
    ls /var/lib/sss/
    ls /var/log/sssd/
    ```

    ### Part C – Verifica els mòduls NSS i PAM

    ```bash
    ls /usr/lib/x86_64-linux-gnu/libnss_sss*
    ls /usr/lib/x86_64-linux-gnu/security/pam_sss*
    ```

    Ambdós fitxers han d'existir. Si no existeixen, la instal·lació no ha estat completa — executa `sudo apt install -y libpam-sss libnss-sss`.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"SSSD install Ubuntu 24.04 LDAP tutorial"`
        - `"apt install sssd-ldap libpam-sss configuration"`
        - `"SSSD Ubuntu Linux LDAP authentication setup"`
