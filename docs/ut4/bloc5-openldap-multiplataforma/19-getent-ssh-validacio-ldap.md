---
title: getent, id i SSH – validació d'autenticació LDAP
tags:
  - ut4
  - ldap
  - linux
  - diagnostic
---

# :material-check-circle: getent, id i SSH – validació d'autenticació LDAP

!!! abstract "Concepte clau"
    La validació de la integració LDAP es fa en tres nivells: **`getent`** comprova que NSS resol els usuaris, **`id`** verifica UID/GID i grups, i un **login SSH** confirma que PAM autentica correctament. Si qualsevol d'aquests tres nivells falla, indica on és el problema.

=== ":material-notebook-outline: Apunts"

    ## Protocol de validació en tres nivells

    ```mermaid
    graph LR
        L1["Nivell 1\ngetent passwd usuari\n→ NSS resol?"] -->|"OK"| L2["Nivell 2\nid usuari\n→ UID/GID correctes?"]
        L2 -->|"OK"| L3["Nivell 3\nSSH / su login\n→ PAM autentica?"]
        L1 -->|"Falla"| E1["Problema: nslcd / nsswitch.conf / LDAP server"]
        L2 -->|"Falla"| E2["Problema: uidNumber/gidNumber mal definits al LDAP"]
        L3 -->|"Falla"| E3["Problema: libpam-ldapd / contrasenya LDAP"]
    ```

    ## Nivell 1: getent – resolució NSS

    ```bash
    # Comprova que el sistema troba l'usuari LDAP
    getent passwd director201
    ```

    Sortida esperada:

    ```
    director201:x:10001:20001:Director 201:/home/201/director201:/bin/bash
    ```

    Si no retorna res → `nsswitch.conf` no té `ldap` o `nslcd` no funciona.

    ```bash
    # Comprova els grups
    getent group directors
    # directors:*:20001:director201,tecnic201

    # Llista tots els usuaris LDAP (pot ser llarg)
    getent passwd | grep -v "^[a-z]" | head -20
    ```

    ## Nivell 2: id – UID/GID i grups

    ```bash
    # Mostra l'UID, GID i tots els grups de l'usuari
    id director201
    ```

    Sortida esperada:

    ```
    uid=10001(director201) gid=20001(directors) groups=20001(directors),20002(tecnics)
    ```

    Si mostra `id: director201: no such user` → l'usuari no és visible via NSS.

    ```bash
    # Comprova un usuari local per comparar
    id ubuntu
    # uid=1000(ubuntu) gid=1000(ubuntu) groups=1000(ubuntu),27(sudo)...
    ```

    ## Nivell 3: SSH i su – autenticació PAM

    ```bash
    # Canvi d'usuari local (prova PAM)
    su - director201
    # Introdueix la contrasenya LDAP

    # Si funciona:
    whoami           # director201
    pwd              # /home/201/director201 (o el fallback si mkhomedir)
    groups           # directors tecnics
    exit

    # Prova SSH remota al mateix client
    ssh director201@localhost
    # Introdueix la contrasenya LDAP
    ```

    ## Diagnòstic si algun nivell falla

    ### Si `getent` no retorna res

    ```bash
    # Comprova nslcd
    sudo systemctl status nslcd
    sudo journalctl -u nslcd --since "5 min ago"

    # Comprova nsswitch.conf
    grep passwd /etc/nsswitch.conf

    # Prova connexió directa al servidor LDAP
    ldapsearch -x -H ldap://172.16.XXX.20 \
        -b "dc=cognom,dc=local" "(uid=director201)"
    ```

    ### Si `id` mostra UID incorrecte

    ```bash
    # Verifica l'atribut uidNumber al servidor
    ldapsearch -x -H ldap://172.16.XXX.20 \
        -b "ou=usuaris,dc=cognom,dc=local" \
        "(uid=director201)" uidNumber gidNumber
    ```

    ### Si el login SSH falla però getent funciona

    ```bash
    # Comprova PAM
    grep -r ldap /etc/pam.d/common-auth
    sudo journalctl -u ssh --since "2 min ago"
    grep -i ldap /var/log/auth.log | tail -20
    ```

    ## Taula de verificació ràpida

    | Comanda | Resultat esperat | Indica |
    |---------|-----------------|--------|
    | `getent passwd director201` | Línia de l'usuari | NSS funciona |
    | `id director201` | UID/GID numèrics | uidNumber i gidNumber correctes |
    | `su - director201` | Login exitós | PAM funciona |
    | `ldapsearch ... (uid=director201)` | Entrada LDAP | Servidor LDAP accessible |
    | `systemctl status nslcd` | `active (running)` | Dimoni nslcd operatiu |

    !!! tip "Logs: on mirar quan falla l'autenticació"
        Els logs d'autenticació es troben a `/var/log/auth.log` (Ubuntu). Quan hi ha un error de login, `tail -20 /var/log/auth.log` mostra el missatge específic. Exemple: `pam_ldap: ldap_simple_bind Can't contact LDAP server` indica que `nslcd` no pot arribar al servidor.

    !!! warning "Caché NSS: pot mostrar dades antigues"
        Si has modificat un usuari al servidor LDAP (canvi de contrasenya, grup, etc.) i el client segueix mostrant les dades antigues, esborra la caché: `sudo nscd -i passwd` (si tens `nscd` instal·lat) o `sudo systemctl restart nslcd`. Sense caché persistent, `getent` consulta sempre el servidor LDAP en temps real.

    ??? question "Auto-avaluació"
        **1.** Si `getent passwd director201` no retorna res però `ldapsearch` sí que troba l'usuari al servidor, on és el problema?

        ??? success "Resposta"
            El problema és en la capa **NSS del client**: o bé `nsswitch.conf` no té `ldap` a la línia `passwd:`, o bé el dimoni `nslcd` no funciona correctament. Cal verificar: `grep passwd /etc/nsswitch.conf` (ha de mostrar `ldap`) i `sudo systemctl status nslcd` (ha d'estar `active (running)`). Si nslcd funciona però `getent` falla, revisa `nslcd.conf` per assegurar que la `uri` i la `base` apunten al servidor correcte.

        **2.** `id director201` retorna `uid=10001(director201)` però `gid=999(nogroup)`. Quin és el problema?

        ??? success "Resposta"
            El `gidNumber=20001` de l'usuari al LDAP no té un grup POSIX definit amb `gidNumber=20001` a `ou=grups`. El sistema no pot resoldre el GID numèric a un nom de grup i usa el grup per defecte. Cal crear el grup al LDAP: `cn=directors,ou=grups,dc=cognom,dc=local` amb `objectClass: posixGroup` i `gidNumber: 20001`.

        **3.** Com es comprova que PAM autentica correctament via LDAP sense fer un login interactiu complet?

        ??? success "Resposta"
            Usant l'eina `pamtester` (si s'instal·la) o inspeccionant `/var/log/auth.log` immediatament després d'un intent de login. Alternativament, `sudo -u director201 -l` no fa login complet però comprova si PAM accepta l'usuari. L'opció més directa és `su - director201` + contrasenya: si el shell s'obre, PAM funciona; si no, els logs de `/var/log/auth.log` mostren el missatge d'error exacte.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.19 · Validació integral de la integració LDAP

    **Objectiu**: verificar els tres nivells (NSS, UID/GID, autenticació SSH) de la integració LDAP.
    **Temps estimat**: 20 minuts
    **Prerequisit**: client LDAP configurat (Activitat 4.18)

    ---

    ### Pas 1 – Validació NSS

    ```bash
    getent passwd director201
    getent group directors
    ```

    Documenta la sortida completa.

    ### Pas 2 – Validació UID/GID

    ```bash
    id director201
    ```

    Comprova que `uidNumber` i `gidNumber` coincideixen amb els valors al servidor LDAP.

    ### Pas 3 – Validació SSH

    ```bash
    su - director201
    whoami
    pwd
    groups
    exit
    ```

    ### Pas 4 – Escenari de diagnòstic

    Atura temporalment `nslcd`:

    ```bash
    sudo systemctl stop nslcd
    getent passwd director201   # Hauria de fallar
    sudo systemctl start nslcd
    getent passwd director201   # Hauria de tornar a funcionar
    ```

    Documenta el missatge d'error quan nslcd no funciona.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"getent passwd LDAP Linux verify user"`
        - `"id command Linux LDAP UID GID groups"`
        - `"auth.log PAM LDAP authentication troubleshoot"`
