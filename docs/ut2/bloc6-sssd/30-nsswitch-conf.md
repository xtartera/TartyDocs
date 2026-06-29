---
title: "/etc/nsswitch.conf"
tags:
  - ut2
  - sssd
  - linux
---

# :material-file-tree: /etc/nsswitch.conf: resolució de noms del sistema

!!! abstract "Concepte clau"
    `/etc/nsswitch.conf` (*Name Service Switch*) indica a Linux on buscar la informació d'usuaris, grups i altres recursos del sistema. Afegint `sss` a les línies `passwd` i `group`, Linux sabrà que ha de consultar SSSD (i per tant LDAP) a més dels fitxers locals.

=== ":material-notebook-outline: Apunts"

    ## Quin és el paper de NSS?

    Quan Linux necessita resoldre un nom d'usuari — per exemple, per mostrar `ls -la` o per autenticar un login — consulta el fitxer `/etc/nsswitch.conf` per saber **on** buscar. Sense NSS, el sistema sempre miraria únicament `/etc/passwd`.

    NSS permet tenir múltiples fonts de dades:

    | Font NSS | On busca |
    |---------|---------|
    | `files` | `/etc/passwd`, `/etc/group`, `/etc/shadow` |
    | `sss` | SSSD (que consulta LDAP) |
    | `systemd` | Usuaris del sistema gestionats per systemd |
    | `ldap` | Directament LDAP (sense SSSD — no recomanat) |
    | `nis` | NIS/NIS+ (antiga tecnologia, gairebé en desús) |

    L'ordre de les fonts importa: Linux les consulta d'esquerra a dreta i s'atura quan troba el resultat.

    ## Estat inicial a Ubuntu 24.04

    ```bash
    cat /etc/nsswitch.conf
    ```

    ```text title="/etc/nsswitch.conf (per defecte a Ubuntu 24.04)"
    passwd:         files systemd
    group:          files systemd
    shadow:         files
    gshadow:        files

    hosts:          files mdns4_minimal [NOTFOUND=return] dns
    networks:       files

    protocols:      db files
    services:       db files
    ethers:         db files
    rpc:            db files

    netgroup:       nis
    ```

    Les línies rellevants per a la integració LDAP son `passwd`, `group` i `shadow`.

    ## Modificació necessària: afegir `sss`

    Edita el fitxer i afegeix `sss` al final de les línies `passwd`, `group` i `shadow`:

    ```bash
    sudo nano /etc/nsswitch.conf
    ```

    Canvis a fer:

    | Línia | Valor original | Valor nou |
    |-------|---------------|----------|
    | `passwd` | `files systemd` | `files systemd sss` |
    | `group` | `files systemd` | `files systemd sss` |
    | `shadow` | `files` | `files sss` |

    ```text title="/etc/nsswitch.conf (modificat per SSSD)"
    passwd:         files systemd sss
    group:          files systemd sss
    shadow:         files sss

    hosts:          files mdns4_minimal [NOTFOUND=return] dns
    networks:       files
    ...
    ```

    !!! info "No cal reiniciar cap servei"
        A diferència de `sssd.conf`, els canvis a `/etc/nsswitch.conf` s'apliquen **immediatament** sense reiniciar cap servei. NSS és consultat en temps real en cada crida del sistema.

    ## L'ordre de consulta importa

    Amb `passwd: files systemd sss`, el sistema consulta en aquest ordre:

    ```mermaid
    flowchart LR
        Q["getent passwd\nmaria.puig"] --> F["files\n/etc/passwd"]
        F -->|"No trobat"| S["systemd\nusuaris systemd"]
        S -->|"No trobat"| SS["sss\nSSSD → LDAP"]
        SS -->|"Trobat!"| R["uid=1001\ngid=2001\n/perfils/maria.puig"]
        F -->|"Trobat"| R2["Resultat immediat\n(usuaris locals)"]

    ```

    Els usuaris locals (`root`, `www-data`, etc.) es troben a `files` i **mai** arriben a consultar SSSD. Únicament els usuaris que no existeixen localment (com `maria.puig`) acaben consultats a LDAP via SSSD.

    ## Verificació ràpida

    ```bash
    # Verifica que els canvis han tingut efecte
    getent passwd maria.puig
    ```

    Sortida esperada si tot funciona:
    ```text
    maria.puig:x:1001:2001:Maria Puig:/perfils/maria.puig:/bin/bash
    ```

    Si no retorna res, comprova:
    1. Que SSSD funciona: `systemctl status sssd`
    2. Que `sss` apareix a la línia `passwd` de `/etc/nsswitch.conf`
    3. Que el servidor LDAP és accessible: `ldapsearch -x -b "ou=usuaris,dc=lafita,dc=local" "(uid=maria.puig)"`

    !!! tip "Connexió amb UT1"
        A Windows, la resolució de noms és gestionada pel servei Netlogon i el protocol Kerberos de manera transparent. L'equivalent a `/etc/nsswitch.conf` seria la configuració DNS del domini i la política de grup que indica als clients on autenticar-se. A Linux, el mecanisme és explícit i configurable fitxer per fitxer.

    ??? question "Auto-avaluació"

        **1.** A `/etc/nsswitch.conf` tens `passwd: files sss`. Linux busca `maria.puig`. Quina font consulta primer? I si `maria.puig` existís tant a `/etc/passwd` com a LDAP?

        ??? success "Resposta"
            Linux consulta primer `files` (és a dir, `/etc/passwd`). Si `maria.puig` **no** es troba a `/etc/passwd`, consulta la font `sss` (SSSD → LDAP). Si `maria.puig` **existís** a ambdós llocs, Linux usaria la informació de `/etc/passwd` (la primera font que troba el resultat), ignorant completament la de LDAP. Per aquest motiu, és important que no hi hagi usuaris duplicats entre el fitxer local i el directori LDAP — exactament el que explica la pàgina de coherència UID/GID (pàgina 21).

        **2.** Afegeixes `sss` a `/etc/nsswitch.conf` però `getent passwd maria.puig` no retorna res. Anomena tres causes possibles i com verificar cadascuna.

        ??? success "Resposta"
            (1) **SSSD no funciona**: verifica amb `systemctl status sssd`. Si és `failed`, revisa la configuració de `sssd.conf` (pàgina 29). (2) **`sss` no apareix a la línia `passwd`**: verifica amb `grep passwd /etc/nsswitch.conf`. Potser has editat una línia equivocada o oblidat desar el fitxer. (3) **El servidor LDAP no és accessible**: verifica amb `ldapsearch -x -b "ou=usuaris,dc=lafita,dc=local" "(uid=maria.puig)"`. Si `ldapsearch` tampoc funciona, el problema és de connectivitat de xarxa o LDAP (pàgina 25, error -1).

        **3.** Per quin motiu NO es recomana usar `ldap` directament a `nsswitch.conf` (sense SSSD)?

        ??? success "Resposta"
            Sense SSSD com a intermediari: (1) **Sense caché**: cada operació del sistema que resolgui un nom d'usuari (fins i tot `ls -la`) faria una consulta directa al servidor LDAP — molt ineficient i fràgil. (2) **Sense offline**: si el servidor LDAP cau un instant, cap operació pot resoldre noms d'usuari. (3) **Sense gestió de credencials**: la integració PAM (autenticació de login) cal configurar-la per separat manualment. SSSD centralitza totes aquestes funcions, gestiona la caché, el reintent de connexió i la integració PAM de manera cohesionada.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 6.3 · Configura NSS per a SSSD

    **Objectiu**: modificar `/etc/nsswitch.conf` i verificar la resolució de noms LDAP.

    **Temps estimat**: 15 minuts

    ---

    ### Part A – Edita nsswitch.conf

    ```bash
    # Primer, fes una còpia de seguretat
    sudo cp /etc/nsswitch.conf /etc/nsswitch.conf.bak

    # Edita el fitxer
    sudo nano /etc/nsswitch.conf
    ```

    Afegeix `sss` a les línies `passwd`, `group` i `shadow`.

    ### Part B – Verifica la resolució

    ```bash
    # Usuari LDAP (ha d'aparèixer ara)
    getent passwd maria.puig

    # Usuari local (ha de continuar funcionant)
    getent passwd root

    # Grup LDAP
    getent group alumnes
    ```

    ### Part C – Restaura i compara

    ```bash
    # Restaura la còpia de seguretat temporalment
    sudo cp /etc/nsswitch.conf.bak /etc/nsswitch.conf

    # Comprova que maria.puig ja no es resol
    getent passwd maria.puig

    # Torna a la configuració correcta
    sudo cp /etc/nsswitch.conf /etc/nsswitch.conf.bak
    sudo nano /etc/nsswitch.conf   # afegeix sss de nou
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"nsswitch.conf Linux LDAP SSSD configuration explained"`
        - `"Name Service Switch Linux files sss tutorial"`
        - `"getent passwd SSSD LDAP users resolve"`
