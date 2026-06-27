---
title: Coherència UID/GID
tags:
  - ut2
  - ldap
  - posix
  - seguretat
---

# :material-alert-circle: Coherència UID/GID entre LDAP i el sistema local

!!! abstract "Concepte clau"
    Un **conflicte de UID** es produeix quan un usuari LDAP té el mateix `uidNumber` que un usuari local del sistema. El resultat és impredictible: fitxers que pertanyen a un usuari local apareixen com a propietat de l'usuari LDAP, o els dos comptes es confonen. Prevenir-ho és obligatori.

=== ":material-notebook-outline: Apunts"

    ## Com Linux assigna UIDs

    Linux usa una divisió de rangs de UID per tipus de compte:

    | Rang | Tipus | Exemples |
    |------|-------|---------|
    | `0` | Superusuari | `root` |
    | `1–99` | Comptes estàtiques del sistema | `daemon`, `bin`, `sys` |
    | `100–999` | Comptes de servei (creades per `apt`) | `syslog`, `www-data`, `slapd`, `sssd` |
    | `1000–59999` | Usuaris humans (creats durant la instal·lació) | `ubuntu` (UID 1000), `xavier` |
    | `60000–65534` | Usuaris de propòsit especial | `nobody` |

    !!! danger "El rang 1000–59999 és compartit entre usuaris locals i LDAP"
        Ubuntu crea el primer usuari de la instal·lació amb **UID 1000**. Si assignes `uidNumber: 1000` a un usuari LDAP, col·lidirà amb l'usuari local. Per als usuaris LDAP del laboratori, hem decidit usar **1001, 1002, 1003** per evitar la col·lisió.

    ## Identificació dels UIDs del sistema local

    Abans d'assignar UIDs als usuaris LDAP, comprova quins UIDs ja estan en ús:

    ```bash
    # Veure tots els comptes locals (inclou sistema i usuaris humans)
    cat /etc/passwd

    # Filtrar únicament els usuaris humans (UID >= 1000)
    awk -F: '$3 >= 1000 {print $1, $3}' /etc/passwd
    ```

    Sortida típica en un Ubuntu Server net:
    ```text
    ubuntu 1000
    ```

    Reserva UIDs LDAP a partir de **1001** per no col·lidir amb `ubuntu` (UID 1000).

    ## Identificació dels GIDs del sistema local

    El mateix problema existeix per als GIDs:

    ```bash
    # Veure tots els grups del sistema
    cat /etc/group

    # Filtrar grups amb GID >= 1000
    awk -F: '$3 >= 1000 {print $1, $3}' /etc/group
    ```

    Sortida típica:
    ```text
    ubuntu 1000
    ```

    Per al grup `alumnes` de LDAP, hem assignat **GID 2001** per mantenir distància del rang local.

    ## El problema en detall: col·lisió de UID

    Considera aquest escenari:

    ```text
    /etc/passwd:  ubuntu:x:1000:1000:...:/home/ubuntu:/bin/bash
    LDAP:         uid=maria.puig, uidNumber=1000
    ```

    Quan SSSD integra els usuaris LDAP al sistema, el kernel veu **dos propietaris per al UID 1000**: l'usuari local `ubuntu` i l'usuari LDAP `maria.puig`. Els fitxers creats per `ubuntu` (`ls -la` mostra `1000`) ara apareixeran com a propietat de `maria.puig` i viceversa. L'accés als fitxers és ambigú i pot ser un risc de seguretat.

    ## Com verificar que no hi ha col·lisions

    Un cop SSSD estigui configurat (Bloc 6), pots verificar que els UIDs LDAP no col·lideixen:

    ```bash
    # Consulta els UIDs de tots els usuaris (locals + LDAP via SSSD)
    getent passwd | sort -t: -k3 -n | awk -F: '{print $3, $1}'

    # Cerca duplicats de UID
    getent passwd | awk -F: '{print $3}' | sort -n | uniq -d
    ```

    Si `uniq -d` retorna algun número, hi ha col·lisió — dos comptes comparteixen el mateix UID.

    ## Estratègia del laboratori

    Al laboratori UT2 seguim aquesta assignació de rangs per evitar qualsevol col·lisió:

    | Rang | Ús |
    |------|----|
    | 0–999 | Sistema operatiu (no tocar) |
    | 1000 | Usuari local `ubuntu` (creat durant la instal·lació) |
    | 1001–1003 | Usuaris LDAP del laboratori (maria.puig, pere.costa, anna.valls) |
    | 2001 | GID del grup LDAP `alumnes` |

    Si afegeixes més usuaris LDAP, continua des de 1004, 1005...

    ## Verificació de la coherència dins del propi LDAP

    Els UID/GID han de ser únics **també dins del directori LDAP**:

    ```bash
    # Comprova que no hi ha dos usuaris LDAP amb el mateix uidNumber
    ldapsearch -x -b "ou=usuaris,dc=lafita,dc=local" "(objectClass=posixAccount)" uid uidNumber \
        | grep uidNumber | sort | uniq -d
    ```

    Si la sortida és buida, tots els UID son únics.

    ??? question "Auto-avaluació"

        **1.** Tens dos usuaris LDAP amb `uidNumber: 1002`. Quins problemes pràctics apareixeran?

        ??? success "Resposta"
            Diversos problemes: (1) **Propietat de fitxers ambigua**: si `maria.puig` crea un fitxer (UID 1002), el sistema no pot saber a quin dels dos usuaris pertany — `ls -la` mostrarà un dels dos noms de manera arbitrària. (2) **SSSD pot retornar resultats inconsistents**: `getent passwd 1002` potser retorna l'un o l'altre usuari depenent de quin es retorna primer a la consulta LDAP. (3) **Problemes de login**: quan s'intenta iniciar sessió com a qualsevol dels dos, el sistema pot confondre quin directori home usar. La solució és assignar un `uidNumber` diferent a un dels dos usuaris amb `ldapmodify`.

        **2.** Per quin motiu al laboratori hem triat GID 2001 per al grup `alumnes` en lloc de, per exemple, 1000?

        ??? success "Resposta"
            El GID 1000 ja l'usa el grup `ubuntu` creat durant la instal·lació d'Ubuntu Server. Si el grup LDAP `alumnes` tingués GID 1000, col·lisionaria: els fitxers del grup local `ubuntu` apareixerien com a propietat del grup `alumnes`, i viceversa. Hem triat 2001 per mantenir una separació clara entre els GIDs del sistema (0–1099) i els GIDs dels grups LDAP (2000+), fent-ho evident a primera vista.

        **3.** Un alumne crea un usuari LDAP amb `uidNumber: 33`. Quin podria ser el problema al sistema?

        ??? success "Resposta"
            El UID 33 pertany a `www-data` (el compte de servei del servidor web Apache/Nginx) a Ubuntu. Si l'usuari LDAP té UID 33, quan SSSD l'integri al sistema, el kernel interpretarà que els fitxers de `www-data` (com els fitxers de `/var/www/`) pertanyen a l'usuari LDAP. Si l'usuari LDAP inicia sessió, tindrà accés de lectura/escriptura sobre tots els fitxers de `www-data`, el que pot ser un risc de seguretat. A més, si `www-data` intenta escriure fitxers, el propietari numèric serà 33 i la traducció de nom pot retornar el nom de l'usuari LDAP en lloc de `www-data`. La regla és clara: mai usar UIDs inferiors a 1000 per a usuaris humans (locals o LDAP).

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.6 · Verifica la coherència UID/GID del laboratori

    **Objectiu**: confirmar que no hi ha col·lisions entre els UIDs del sistema i els UIDs LDAP.

    **Temps estimat**: 15 minuts

    ---

    ### Part A – Inventaria els UIDs locals

    ```bash
    awk -F: '$3 >= 1000 && $3 < 60000 {print $3, $1}' /etc/passwd | sort -n
    ```

    Quins UIDs >= 1000 hi ha al sistema? Hi ha `ubuntu` amb UID 1000?

    ### Part B – Inventaria els UIDs LDAP

    ```bash
    ldapsearch -x -b "ou=usuaris,dc=lafita,dc=local" "(objectClass=posixAccount)" uid uidNumber \
        | grep -E "^uid:|^uidNumber:"
    ```

    Quins uidNumbers han de ser 1001, 1002, 1003?

    ### Part C – Cerca duplicats

    ```bash
    # Comprova que no hi ha uidNumbers duplicats al LDAP
    ldapsearch -x -b "ou=usuaris,dc=lafita,dc=local" "(objectClass=posixAccount)" uidNumber \
        | grep uidNumber | sort | uniq -d
    ```

    La sortida ha de ser buida (cap duplicat).

    ### Part D – Comprova els rangs

    Assegura't que cap UID LDAP és inferior a 1001 ni coincideix amb cap UID local del resultat de la Part A.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Linux UID GID conflict LDAP local user"`
        - `"LDAP uidNumber range Linux system user conflict avoid"`
        - `"getent passwd LDAP SSSD uid numbering"`
