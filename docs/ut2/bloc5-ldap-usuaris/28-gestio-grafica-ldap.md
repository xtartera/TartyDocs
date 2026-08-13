---
title: Gestió gràfica de LDAP
tags:
  - ut2
  - ldap
  - openldap
  - administracio
---

# :material-account-box-multiple: Gestió gràfica de LDAP

!!! abstract "Concepte clau"
    A més del CLI (`ldapadd`, `ldapmodify`...), el directori LDAP es pot gestionar amb **interfícies gràfiques** com **phpLDAPadmin** (web) o **LAM** (LDAP Account Manager). Són còmodes per visualitzar l'arbre i fer altes ràpides, però el CLI segueix sent el que dóna control total.

=== ":material-notebook-outline: Apunts"

    ## phpLDAPadmin: administració web

    Interfície web que mostra el directori com un arbre navegable.

    ```bash
    sudo apt install phpldapadmin
    ```

    Configuració principal a `/etc/phpldapadmin/config.php`:

    ```php
    $servers->setValue('server','host','127.0.0.1');
    $servers->setValue('server','base',array('dc=lafita,dc=local'));
    $servers->setValue('login','bind_id','cn=admin,dc=lafita,dc=local');
    ```

    Accés: `http://192.168.100.10/phpldapadmin`, autenticant-se com `cn=admin,dc=lafita,dc=local`.

    | Amb phpLDAPadmin pots… | |
    |------------------------|--|
    | Navegar l'arbre (`ou=usuaris`, `ou=grups`) | visualment |
    | Crear usuaris/grups amb plantilles | omplint formularis |
    | Editar atributs (uidNumber, mail...) | sense escriure LDIF |

    !!! warning "Seguretat i compatibilitat"
        - Serveix les credencials per la xarxa: activa **HTTPS**, no HTTP pla.
        - phpLDAPadmin pot donar problemes amb versions de **PHP > 7.2** (funcions obsoletes); en Ubuntu 24.04 pot requerir ajustos o una alternativa.

    ## LAM (LDAP Account Manager): alternativa

    LAM està pensat específicament per gestionar **comptes** (usuaris, grups, màquines) amb assistents, i sol conviure millor amb versions modernes de PHP.

    ## CLI vs GUI: quan usar cada via

    | Situació | Millor eina |
    |----------|-------------|
    | Alta massiva, automatització, scripts | **CLI** (`ldapadd` + LDIF) |
    | Consulta visual, edició puntual, aprenentatge | **GUI** (phpLDAPadmin / LAM) |
    | Diagnòstic i control fi | **CLI** (`ldapsearch`, `ldapwhoami`) |

    !!! tip "Connexió amb la resta del bloc"
        Tot el que fa la GUI, ja ho saps fer per CLI (blocs anteriors). La interfície gràfica és una **capa de comoditat** al damunt del mateix directori: els canvis que hi fas es tradueixen en les mateixes operacions LDAP que faries amb `ldapadd`/`ldapmodify`.

    ??? question "Auto-avaluació"
        **1.** Quin fitxer configura la base i les credencials de phpLDAPadmin?

        ??? success "Resposta"
            `/etc/phpldapadmin/config.php`, on s'indiquen el host del servidor, la base del directori (`dc=lafita,dc=local`) i el DN d'administració per fer el bind.

        **2.** Per a quines tasques és clarament millor el CLI que la GUI?

        ??? success "Resposta"
            Per a altes massives, automatització i scripts (p. ex. importar molts usuaris amb `ldapadd` i fitxers LDIF), i per al diagnòstic fi amb `ldapsearch`/`ldapwhoami`.

        **3.** Quina precaució de seguretat cal amb phpLDAPadmin?

        ??? success "Resposta"
            Activar **HTTPS**, ja que en fer el bind es transmeten les credencials d'administració del directori; amb HTTP pla viatjarien sense xifrar.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 5.28 · Gestiona LDAP visualment

    **Objectiu**: administrar el directori amb una interfície gràfica i comparar-ho amb el CLI.
    **Temps estimat**: 35 minuts · **Modalitat**: individual

    ---

    ### Tasca 1 – Instal·lació

    Instal·la phpLDAPadmin (o LAM) i configura la base `dc=lafita,dc=local`. Accedeix-hi i autentica't com a admin.

    ### Tasca 2 – Alta gràfica

    Crea un usuari nou des de la interfície. A continuació, verifica'l per CLI amb `ldapsearch`.

    ### Tasca 3 – Comparació

    Escriu breument quins avantatges i inconvenients has trobat respecte a fer-ho amb `ldapadd` i un fitxer LDIF.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"phpldapadmin install ubuntu"`
        - `"LDAP Account Manager LAM tutorial"`
        - `"openldap gui management"`
