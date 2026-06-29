---
title: Format LDIF
tags:
  - ut2
  - ldap
  - ldif
---

# :material-text-box-code: Format LDIF

!!! abstract "Concepte clau"
    **LDIF** (*LDAP Data Interchange Format*) és el format de text per definir i modificar entrades LDAP. Tots els comandaments (`ldapadd`, `ldapmodify`, `ldapdelete`) llegeixen fitxers LDIF. Dominar la seva sintaxi és imprescindible: un error d'espai pot fer fallar tota l'operació.

=== ":material-notebook-outline: Apunts"

    ## Estructura d'una entrada LDIF

    Un fitxer LDIF conté una o més **entrades** separades per una **línia en blanc**:

    ```ldif
    dn: uid=maria.puig,ou=usuaris,dc=lafita,dc=local
    objectClass: inetOrgPerson
    objectClass: posixAccount
    objectClass: shadowAccount
    uid: maria.puig
    cn: Maria Puig
    sn: Puig
    uidNumber: 1001
    gidNumber: 2001
    homeDirectory: /perfils/maria.puig
    loginShell: /bin/bash
    userPassword: {SSHA}abc123...
    ```

    ### Regles de sintaxi obligatòries

    | Regla | Exemple correcte | Error freqüent |
    |-------|-----------------|----------------|
    | `dn:` ha de ser la **primera línia** de cada entrada | `dn: uid=maria.puig,...` | Posar `objectClass:` abans de `dn:` |
    | Format: `atribut: valor` (amb **un espai** després dels dos punts) | `uid: maria.puig` | `uid:maria.puig` (sense espai) |
    | Entrades separades per **exactament una línia en blanc** | `\n\n` entre entrades | Dues línies en blanc, o cap |
    | Cap **espai al final de línia** (trailing space) | `uid: maria.puig` | `uid: maria.puig ` (espai invisible) |
    | Línies llargues es **continuen** amb un espai a l'inici | `userPassword: {SSHA}` seguida de ` abc...` | Trencar una línia sense el prefix espai |

    !!! warning "L'error més freqüent: falta de línia en blanc entre entrades"
        Si tens dues entrades consecutives sense línia en blanc entre elles, `ldapadd` les interpreta com una única entrada i retorna `ldap_add: Object class violation`. Sempre que facis copy-paste de fitxers LDIF, comprova que hi hagi exactament una línia en blanc entre cada entrada.

    ## Exemple: fitxer per crear les OUs base

    ```ldif title="usuaris-base.ldif"
    dn: ou=usuaris,dc=lafita,dc=local
    objectClass: organizationalUnit
    ou: usuaris

    dn: ou=grups,dc=lafita,dc=local
    objectClass: organizationalUnit
    ou: grups
    ```

    Fixa't en la línia en blanc entre les dues entrades.

    ## Exemple: fitxer per crear un grup POSIX

    ```ldif title="grups.ldif"
    dn: cn=alumnes,ou=grups,dc=lafita,dc=local
    objectClass: posixGroup
    cn: alumnes
    gidNumber: 2001
    ```

    ## Exemple: fitxer per crear tres usuaris

    ```ldif title="alumnes.ldif"
    dn: uid=maria.puig,ou=usuaris,dc=lafita,dc=local
    objectClass: inetOrgPerson
    objectClass: posixAccount
    objectClass: shadowAccount
    uid: maria.puig
    cn: Maria Puig
    sn: Puig
    uidNumber: 1001
    gidNumber: 2001
    homeDirectory: /perfils/maria.puig
    loginShell: /bin/bash
    userPassword: {SSHA}HASH_AQUI

    dn: uid=pere.costa,ou=usuaris,dc=lafita,dc=local
    objectClass: inetOrgPerson
    objectClass: posixAccount
    objectClass: shadowAccount
    uid: pere.costa
    cn: Pere Costa
    sn: Costa
    uidNumber: 1002
    gidNumber: 2001
    homeDirectory: /perfils/pere.costa
    loginShell: /bin/bash
    userPassword: {SSHA}HASH_AQUI

    dn: uid=anna.valls,ou=usuaris,dc=lafita,dc=local
    objectClass: inetOrgPerson
    objectClass: posixAccount
    objectClass: shadowAccount
    uid: anna.valls
    cn: Anna Valls
    sn: Valls
    uidNumber: 1003
    gidNumber: 2001
    homeDirectory: /perfils/anna.valls
    loginShell: /bin/bash
    userPassword: {SSHA}HASH_AQUI
    ```

    !!! info "El valor `userPassword` es genera amb `slappasswd`"
        El camp `userPassword: {SSHA}...` no es pot inventar — és un hash criptogràfic. A la pàgina [18 — slappasswd](../bloc4-ldap-usuaris/18-slappasswd-hash.md) aprendràs a generar-lo. Per ara, els fitxers LDIF que crees al Bloc 3 no inclouran `userPassword`.

    ## Valors en Base64

    Si un valor conté caràcters especials, no-ASCII o comença per espai, LDIF el codifica en **Base64** amb doble dos-punts:

    ```ldif
    # Valor normal
    cn: Maria Puig

    # Valor codificat en Base64 (si conté accents o caràcters especials)
    description:: TWFyw61hIFB1aWc=
    ```

    Per al laboratori, tots els valors seran ASCII simple i no caldrà Base64.

    ## Eines útils per validar LDIF

    ```bash
    # Valida la sintaxi d'un fitxer LDIF sense aplicar els canvis
    # (requereix el paquet 'ldap-utils')
    ldapmodify -x -D "cn=admin,dc=lafita,dc=local" -W \
               -f fitxer.ldif --dry-run
    ```

    ??? question "Auto-avaluació"

        **1.** Tens aquest fitxer LDIF i `ldapadd` retorna error. Troba l'error i corregeix-lo:

        ```ldif
        dn: ou=usuaris,dc=lafita,dc=local
        objectClass: organizationalUnit
        ou: usuaris
        dn: ou=grups,dc=lafita,dc=local
        objectClass: organizationalUnit
        ou: grups
        ```

        ??? success "Resposta"
            Falta una **línia en blanc** entre les dues entrades. El fitxer correcte és:
            ```ldif
            dn: ou=usuaris,dc=lafita,dc=local
            objectClass: organizationalUnit
            ou: usuaris

            dn: ou=grups,dc=lafita,dc=local
            objectClass: organizationalUnit
            ou: grups
            ```
            Sense la línia en blanc, `ldapadd` interpreta les dues entrades com una sola i retorna un error d'objectClass o de DN invàlid.

        **2.** Per quin motiu s'usa `{SSHA}` i no la contrasenya en text clar al camp `userPassword`?

        ??? success "Resposta"
            Emmagatzemar contrasenyes en text clar seria un risc de seguretat crític: qualsevol que pogués llegir la base de dades LDAP (un fitxer de backup, un log, un accés no autoritzat) obtindria totes les contrasenyes. `{SSHA}` (*Salted SHA-1*) és un hash unidireccional: permet verificar si una contrasenya és correcta (computant el hash del que l'usuari introdueix i comparant-lo) sense emmagatzemar la contrasenya original. El "salt" afegit evita atacs de taula de hash predefinida (*rainbow tables*).

        **3.** Un fitxer LDIF per crear un usuari inclou `objectClass: inetOrgPerson`, `objectClass: posixAccount` i `objectClass: shadowAccount`. Per quin motiu calen les tres i no n'hi ha prou amb una?

        ??? success "Resposta"
            Cada objectClass aporta atributs específics que es necessiten per a finalitats diferents: `inetOrgPerson` aporta els atributs de persona (cn, sn, mail) i és el tipus d'objecte base estàndard per a persones en LDAP. `posixAccount` aporta els atributs necessaris per al login en sistemes Unix/Linux (uidNumber, gidNumber, homeDirectory, loginShell) — sense ella, l'usuari no pot iniciar sessió. `shadowAccount` aporta la gestió de contrasenya (userPassword, caducitat) — sense ella, no es pot establir contrasenya. Les tres juntes defineixen un usuari complet que pot existir a l'organització, iniciar sessió a Linux i tenir contrasenya pròpia.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.5 · Crea els fitxers LDIF base del laboratori

    **Objectiu**: preparar els fitxers LDIF per a les OUs i el grup d'alumnes (sense aplicar-los encara).

    **Temps estimat**: 20 minuts

    ---

    ### Part A – Crea el fitxer per a les OUs

    ```bash
    nano ~/usuaris-base.ldif
    ```

    Contingut:
    ```ldif
    dn: ou=usuaris,dc=lafita,dc=local
    objectClass: organizationalUnit
    ou: usuaris

    dn: ou=grups,dc=lafita,dc=local
    objectClass: organizationalUnit
    ou: grups
    ```

    ### Part B – Crea el fitxer per al grup

    ```bash
    nano ~/grups.ldif
    ```

    Contingut:
    ```ldif
    dn: cn=alumnes,ou=grups,dc=lafita,dc=local
    objectClass: posixGroup
    cn: alumnes
    gidNumber: 2001
    ```

    ### Part C – Valida visualment els fitxers

    ```bash
    cat ~/usuaris-base.ldif
    cat ~/grups.ldif
    ```

    Comprova que: (1) hi ha línia en blanc entre entrades, (2) cada atribut té un espai després dels dos punts, (3) no hi ha espais al final de cap línia.

    !!! info "No aplicis els fitxers LDIF encara"
        Aplicar fitxers LDIF requereix `ldapadd`, que aprendràs a la pàgina [19 — ldapadd](../bloc4-ldap-usuaris/19-ldapadd-usuaris-grups.md). Per ara, prepara els fitxers i verifica la seva sintaxi visualment.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"LDIF format tutorial OpenLDAP explained"`
        - `"LDAP LDIF file syntax add user example"`
        - `"OpenLDAP ldif objectClass posixAccount inetOrgPerson"`
