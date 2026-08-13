---
title: Seguretat i aïllament de perfils
tags:
  - ut2
  - perfils
  - seguretat
---

# :material-lock-check: Seguretat i aïllament de perfils

!!! abstract "Concepte clau"
    La seguretat dels perfils mòbils descansa sobre tres capes: els **permisos POSIX** (700) que aïllen cada directori home, el **model UID/GID de NFS** que garanteix que únicament l'usuari correcte hi pot accedir, i les **opcions de `/etc/exports`** que limiten quins clients poden muntar l'exportació. Per al laboratori educatiu, aquesta configuració és suficient; per a producció, cal afegir NFSv4 + Kerberos.

=== ":material-notebook-outline: Apunts"

    ## Capa 1: permisos POSIX del directori home

    Cada directori de perfil ha de tenir permisos 700 i propietat de l'UID de l'usuari:

    ```bash
    # Verificació al servidor
    ls -la /perfils/
    ```

    Sortida esperada:
    ```text
    drwxr-xr-x  5 root     root     4096 Jun 27 10:00 .
    drwxr-xr-x  3 root     root     4096 Jun 27 09:00 ..
    drwx------  2 1001     2001     4096 Jun 27 10:23 maria.puig
    drwx------  2 1002     2001     4096 Jun 27 10:25 pere.costa
    drwx------  2 1003     2001     4096 Jun 27 10:26 anna.valls
    ```

    Permisos 700 (`drwx------`):
    - **Propietari** (UID 1001): pot llegir, escriure i entrar al directori
    - **Grup** (GID 2001): **cap** permís
    - **Altres**: **cap** permís

    Comprova que els permisos son correctes:
    ```bash
    stat /perfils/maria.puig
    ```

    ```text
    Access: (0700/drwx------)  Uid: ( 1001/ maria.puig)   Gid: ( 2001/  alumnes)
    ```

    Si els permisos son incorrectes, corregeix-los:
    ```bash
    sudo chmod 700 /perfils/maria.puig
    sudo chown 1001:2001 /perfils/maria.puig
    ```

    ## Capa 2: el model de seguretat de NFS (UID/GID)

    NFS **no autentica usuaris per nom** — confia en el UID/GID del procés client:

    ```mermaid
    flowchart LR
        C["Client: processo de maria.puig\nUID=1001, GID=2001"] -- "NFS: llegeix /perfils/maria.puig" --> S["Servidor: comprova permisos\n/perfils/maria.puig: 700, owner=1001"]
        S --> OK["UID 1001 = propietari\n✅ Accés permès"]

        C2["Client: procés de pere.costa\nUID=1002, GID=2001"] -- "NFS: llegeix /perfils/maria.puig" --> S2["Servidor: comprova permisos\n/perfils/maria.puig: 700, owner=1001"]
        S2 --> NOK["UID 1002 ≠ propietari\n❌ Permission denied"]

    ```

    **Implicació important**: si un atacant aconseguís crear un procés amb UID 1001 en qualsevol client autoritzat, podria accedir als fitxers de `maria.puig`. Per això, la seguretat del client és tan important com la del servidor.

    ## Capa 3: restricció de clients a /etc/exports

    L'opció de client a `/etc/exports` limita quins hosts poden muntar l'exportació:

    ```text title="/etc/exports"
    /perfils    192.168.100.0/24(rw,sync,no_subtree_check,no_root_squash)
    ```

    `192.168.100.0/24` significa que únicament els hosts de la xarxa interna del laboratori poden muntar `/perfils/`. Un host extern no pot muntar l'exportació.

    Comprova que el firewall reforça aquesta restricció:
    ```bash
    # Al servidor: limita NFS a la xarxa interna
    sudo ufw allow from 192.168.100.0/24 to any port 2049
    sudo ufw deny 2049
    sudo ufw reload
    ```

    ## Verificació de l'aïllament

    ### Test 1: pere.costa no pot accedir al home de maria.puig

    ```bash
    su - pere.costa
    cat /perfils/maria.puig/.bashrc
    ```

    ```text
    cat: /perfils/maria.puig/.bashrc: Permission denied
    ```

    NFS nega l'accés perquè `pere.costa` (UID 1002) no és el propietari de `/perfils/maria.puig` (UID 1001).

    ### Test 2: root al client pot llegir tot amb no_root_squash

    !!! warning "no_root_squash i les seves implicacions de seguretat"
        Amb `no_root_squash`, el root del client té accés de root als fitxers del servidor:

        ```bash
        # Com a root al client — POT accedir a qualsevol perfil
        sudo ls /perfils/maria.puig/
        sudo cat /perfils/maria.puig/.bashrc
        ```

        Això és un risc en entorns de producció. Per al laboratori és acceptable perquè:
        - Tots els clients son màquines de laboratori sota control
        - No hi ha accés exterior a la xarxa 192.168.100.0/24
        - autofs necessita root per crear els punts de muntatge

    ### Test 3: verifica que hosts externs no poden muntar

    ```bash
    # Des d'un host de fora de 192.168.100.0/24
    showmount -e 192.168.100.10
    ```

    ```text
    clnt_create: RPC: Port mapper failure - Unable to receive: errno 113 (No route to host)
    # O: Access denied
    ```

    ## Resum de mesures de seguretat del laboratori

    | Mesura | Fitxer | Eficàcia |
    |--------|--------|---------|
    | Permisos 700 als homes | Servidor (`chmod 700`) | Aïllament entre usuaris |
    | Propietat correcta UID:GID | Servidor (`chown`) | Permisos POSIX correctes |
    | Restricció de xarxa a `/etc/exports` | `/etc/exports` | Únicament clients de 192.168.100.0/24 |
    | Firewall al servidor | `ufw` | Reforça la restricció de xarxa |

    ## Per a entorns de producció: NFSv4 + Kerberos

    !!! info "Seguretat en producció: sec=krb5"
        En un entorn de producció real, la configuració del laboratori no és suficient perquè:
        - `no_root_squash` permet que un root de client llegeixi qualsevol perfil
        - Qualsevol procés amb un UID falsificat pot accedir als fitxers

        La solució de producció és **NFSv4 amb Kerberos** (`sec=krb5`): NFS autentica criptogràficament cada usuari independentment del UID, de manera que fins i tot root del client no pot accedir a fitxers d'altres usuaris sense les credencials Kerberos. Aquesta configuració requereix un servidor Kerberos (MIT Kerberos o Active Directory) i escapa de l'abast d'aquest laboratori.

    ??? question "Auto-avaluació"

        **1.** `pere.costa` intenta llegir un fitxer de `maria.puig` executant `cat /perfils/maria.puig/notes.txt`. Quines tres capes de seguretat comproven l'accés i quina li nega finalment?

        ??? success "Resposta"
            (1) **autofs** intercep l'accés a `/perfils/maria.puig` i dispara el muntatge NFS — no comprova permisos, únicament munta. (2) **NFS (kernel)** transporta la petició al servidor amb el UID/GID del procés client (UID 1002 de `pere.costa`). (3) **Sistema de fitxers del servidor** comprova els permisos POSIX de `/perfils/maria.puig`: propietat UID 1001, permisos 700. Com que UID 1002 no és el propietari i els permisos de "grup" i "altres" son 000, el sistema **nega l'accés** i retorna `Permission denied`. La capa que nega finalment és el sistema de fitxers del servidor (permisos POSIX).

        **2.** Per quin motiu canviar els permisos de `/perfils/maria.puig` a 755 seria un error de seguretat greu?

        ??? success "Resposta"
            Permisos 755 (`rwxr-xr-x`) significarien que qualsevol usuari del sistema (grup i altres) pot llistar i llegir el contingut del directori home. En un entorn LDAP+NFS, això vol dir que `pere.costa` (o qualsevol usuari autenticat des de qualsevol client) podria llegir els fitxers de `maria.puig`: documents personals, configuració, historial de comandes, claus SSH, etc. Els directoris home han de ser sempre 700 per garantir la privacitat dels usuaris.

        **3.** Un company proposa usar `all_squash` a `/etc/exports` en comptes de `no_root_squash`. Quines implicacions té per al laboratori?

        ??? success "Resposta"
            `all_squash` remapa **tots** els usuaris (no únicament root) a `nobody:nogroup`. Amb `all_squash`, `maria.puig` (UID 1001) seria tractada com `nobody` (UID 65534) al servidor — i `nobody` no és el propietari de `/perfils/maria.puig` (UID 1001). El resultat: cap usuari LDAP podria llegir ni escriure el seu propi directori home, ja que el servidor veuria `nobody` en comptes de l'UID correcte. `all_squash` és útil per a exportacions públiques de lectura (tots els usuaris veuen els mateixos fitxers com a `nobody`), no per a directoris home individuals.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 8.7 · Verifica l'aïllament de seguretat

    **Objectiu**: confirmar que els permisos aïllen correctament els perfils de cada usuari.

    **Temps estimat**: 20 minuts

    ---

    ### Part A – Verifica els permisos al servidor

    ```bash
    ls -la /perfils/
    stat /perfils/maria.puig
    stat /perfils/pere.costa
    stat /perfils/anna.valls
    ```

    Confirma que cada directori és 700 i té el UID:GID correcte.

    ### Part B – Prova l'aïllament entre usuaris

    ```bash
    su - pere.costa
    cat /perfils/maria.puig/.bashrc
    # Ha de retornar: Permission denied
    ls /perfils/anna.valls/
    # Ha de retornar: Permission denied
    exit
    ```

    ### Part C – Prova la restricció de no_root_squash

    Com a root al client:
    ```bash
    sudo cat /perfils/maria.puig/.bashrc
    # Com a root (no_root_squash): POT llegir — documenta per quin motiu és un risc
    ```

    ### Part D – Simula un accés extern (opcional)

    Si tens accés a un host fora de la xarxa 192.168.100.0/24:
    ```bash
    showmount -e 192.168.100.10
    # Ha de fallar o no mostrar exportacions
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"NFS security permissions UID GID Linux explained"`
        - `"no_root_squash security risk NFS production"`
        - `"NFS Kerberos sec=krb5 production security"`
