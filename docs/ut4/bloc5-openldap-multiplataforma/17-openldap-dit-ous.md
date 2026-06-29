---
title: OpenLDAP multiplataforma – DIT i OUs per entorn real
tags:
  - ut4
  - ldap
  - openldap
---

# :material-sitemap: OpenLDAP multiplataforma – DIT i OUs per entorn real

!!! abstract "Concepte clau"
    En un entorn multiplataforma, l'arbre DIT d'OpenLDAP s'organitza en **OUs funcionals**: `ou=usuaris`, `ou=grups`, `ou=equips`. Afegir clients Windows (pGina) i Linux (PAM/NSS) requereix atributs POSIX complets i una política d'UID/GID consistent per evitar conflictes de permisos.

=== ":material-notebook-outline: Apunts"

    ## Revisió de l'arbre DIT per a entorn multiplataforma

    ```mermaid
    graph TD
        ROOT["dc=cognom,dc=local"]
        ROOT --> OU_U["ou=usuaris"]
        ROOT --> OU_G["ou=grups"]
        ROOT --> OU_E["ou=equips"]
        OU_U --> U1["uid=director201\nuidNumber=10001\ngidNumber=20001"]
        OU_U --> U2["uid=tecnic201\nuidNumber=10002\ngidNumber=20002"]
        OU_G --> G1["cn=directors\ngidNumber=20001"]
        OU_G --> G2["cn=tecnics\ngidNumber=20002"]
        OU_E --> E1["cn=cli-linux-201\nhostName=ubuntu-client"]
    ```

    ## Instal·lació i configuració bàsica (review UT2)

    ```bash
    sudo apt install -y slapd ldap-utils

    # Reconfigura (estableix base DN i admin password)
    sudo dpkg-reconfigure slapd
    # Organisation name: cognom
    # DNS domain name: cognom.local
    # Admin password: ****
    # Database backend: MDB
    # Remove DB when slapd is purged: No
    # Move old DB: Yes

    # Verifica
    ldapsearch -x -H ldap://localhost -b "dc=cognom,dc=local" -D "cn=admin,dc=cognom,dc=local" -W
    ```

    ## Estructura LDIF de l'arbre DIT

    ```ldif
    # OUs principals
    dn: ou=usuaris,dc=cognom,dc=local
    objectClass: organizationalUnit
    ou: usuaris

    dn: ou=grups,dc=cognom,dc=local
    objectClass: organizationalUnit
    ou: grups

    dn: ou=equips,dc=cognom,dc=local
    objectClass: organizationalUnit
    ou: equips
    ```

    ```bash
    # Carrega les OUs
    ldapadd -x -H ldap://localhost \
        -D "cn=admin,dc=cognom,dc=local" -W \
        -f ous.ldif
    ```

    ## Atributs POSIX obligatoris per a entorn multiplataforma

    Per a que Linux reconegui els usuaris LDAP, cada `uid` ha de tenir:

    | Atribut | Valor exemple | Necessitat |
    |---------|--------------|-----------|
    | `objectClass` | `inetOrgPerson`, `posixAccount`, `shadowAccount` | Autenticació Linux |
    | `uid` | `director201` | Nom d'usuari |
    | `uidNumber` | `10001` | UID únic al sistema |
    | `gidNumber` | `20001` | GID del grup primari |
    | `homeDirectory` | `/home/201/director201` | Directori home (P42: per grup) |
    | `loginShell` | `/bin/bash` | Shell d'inici de sessió |
    | `userPassword` | `{SSHA}...` | Hash SSHA (via `slappasswd`) |

    ## Exemple d'usuari LDIF complet

    ```ldif
    dn: uid=director201,ou=usuaris,dc=cognom,dc=local
    objectClass: inetOrgPerson
    objectClass: posixAccount
    objectClass: shadowAccount
    cn: Director 201
    sn: 201
    uid: director201
    uidNumber: 10001
    gidNumber: 20001
    homeDirectory: /home/201/director201
    loginShell: /bin/bash
    userPassword: {SSHA}HASH_AQUI

    dn: cn=directors,ou=grups,dc=cognom,dc=local
    objectClass: posixGroup
    cn: directors
    gidNumber: 20001
    memberUid: director201
    ```

    ## Verificació de l'arbre

    ```bash
    # Llista tot l'arbre
    ldapsearch -x -H ldap://localhost -b "dc=cognom,dc=local" -D "cn=admin,dc=cognom,dc=local" -W

    # Cerca un usuari concret
    ldapsearch -x -H ldap://localhost \
        -b "ou=usuaris,dc=cognom,dc=local" \
        "(uid=director201)"

    # Exporta tot l'arbre (backup LDAP)
    sudo slapcat -l backup-ldap.ldif
    ```

    !!! tip "UID/GID consistents entre clients"
        En un entorn multiplataforma, és **crític** que el `uidNumber` de cada usuari sigui el **mateix** a totes les màquines. Si el servidor NFS té l'usuari `director201` amb UID 10001, el client Linux que munta el directori NFS ha de tenir el mateix UID — sinó els permisos dels fitxers fallaran (veure UT3 Bloc 6, `all_squash`). LDAP amb PAM/NSS garanteix la coherència.

    !!! warning "Prefix de home dir per grup (P42)"
        Al projecte P42, el directori home usa un prefix de grup: `/home/XXX/usuari` (on XXX és el número de grup). Exemple: `/home/201/director201`. Configura `homeDirectory` a LDIF amb aquest format. El servidor NFS haurà d'exportar `/home/201/` i els clients Linux muntaran automàticament via autofs.

    ??? question "Auto-avaluació"
        **1.** Quins tres objectClass ha de tenir un usuari LDAP per poder iniciar sessió en un client Linux?

        ??? success "Resposta"
            **`inetOrgPerson`** (dades bàsiques: `cn`, `sn`, `mail`), **`posixAccount`** (atributs de compte Unix: `uidNumber`, `gidNumber`, `homeDirectory`, `loginShell`) i **`shadowAccount`** (gestió de contrasenya i expiració: `shadowLastChange`, `shadowMax`, etc.). Sense `posixAccount`, el client Linux no pot mapar l'usuari LDAP a un UID/GID del sistema operatiu.

        **2.** Per quin motiu és important que el `uidNumber` d'un usuari LDAP sigui el mateix a tots els clients Linux?

        ??? success "Resposta"
            El sistema de fitxers Linux (i NFS) usa el **UID numèric** (no el nom d'usuari) per determinar la propietat dels fitxers. Si un client té `director201` com UID 10001 i un altre el té com UID 10050, un fitxer creat pel primer semblarà propietat d'un usuari desconegut al segon. LDAP amb NSS garanteix que tots els clients veuen el mateix UID per a cada usuari.

        **3.** Quina ordre fa un backup complet del directori LDAP en format LDIF?

        ??? success "Resposta"
            `sudo slapcat -l backup-ldap.ldif`. `slapcat` exporta **tota** la base de dades OpenLDAP en format LDIF (incloent metadades internes que `ldapsearch` no mostra). Per restaurar: `sudo slapadd -l backup-ldap.ldif`. Cal que el servei `slapd` estigui **aturat** durant la restauració.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.17 · Estructura DIT multiplataforma amb LDIF

    **Objectiu**: crear l'arbre DIT del projecte P42 amb OUs i usuaris amb atributs POSIX complets.
    **Temps estimat**: 30 minuts
    **Prerequisit**: slapd instal·lat (UT2)

    ---

    ### Pas 1 – Crea les OUs

    Crea `ous.ldif` amb les OUs `usuaris`, `grups`, `equips` i carrega-les:

    ```bash
    ldapadd -x -H ldap://localhost -D "cn=admin,dc=cognom,dc=local" -W -f ous.ldif
    ```

    ### Pas 2 – Crea els usuaris amb atributs POSIX

    Per a cada usuari del teu grup (p.ex., `director201`, `tecnic201`):
    - `uidNumber`: 10001, 10002, ...
    - `gidNumber`: 20001, 20002, ...
    - `homeDirectory`: `/home/201/usuari`

    ### Pas 3 – Crea els grups

    Crea grups `directors` i `tecnics` amb els `memberUid` corresponents.

    ### Pas 4 – Verifica

    ```bash
    ldapsearch -x -H ldap://localhost -b "dc=cognom,dc=local" -D "cn=admin,dc=cognom,dc=local" -W "(objectClass=posixAccount)" uid uidNumber gidNumber homeDirectory
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"OpenLDAP DIT structure LDIF tutorial Ubuntu"`
        - `"posixAccount LDAP Linux attributes explained"`
        - `"slapcat backup OpenLDAP LDIF"`
