---
title: "ldapadd: creació d'usuaris i grups"
tags:
  - ut2
  - ldap
  - ldapadd
---

# :material-account-plus: ldapadd: creació d'entrades al directori

!!! abstract "Concepte clau"
    **`ldapadd`** afegeix entrades al directori LDAP llegint un fitxer LDIF. Requereix autenticació com a admin i s'ha d'executar en l'ordre correcte: primer les OUs, després els grups, finalment els usuaris. Afegir un usuari a una OU que no existeix causa error.

=== ":material-notebook-outline: Apunts"

    ## Sintaxi

    ```bash
    ldapadd -x -D "cn=admin,dc=lafita,dc=local" -W -f fitxer.ldif
    ```

    | Opció | Significat |
    |-------|-----------|
    | `-x` | Autenticació simple (*simple bind*) |
    | `-D DN` | DN del compte amb el qual t'autentiques (admin) |
    | `-W` | Demana la contrasenya interactivament |
    | `-f FITXER` | Fitxer LDIF que conté les entrades a afegir |
    | `-H URI` | URI del servidor (opcional si `/etc/ldap/ldap.conf` ja té `URI`) |

    ## Ordre d'execució obligatori

    ```mermaid
    graph LR
        A["1. OUs\n(usuaris-base.ldif)"] --> B["2. Grups\n(grups.ldif)"]
        B --> C["3. Usuaris\n(alumnes.ldif)"]

    ```

    No pots afegir un usuari a `ou=usuaris` si aquesta OU no existeix. No pots referenciar `gidNumber: 2001` si el grup no existeix (tècnicament, LDAP no valida la referència, però el sistema pot comportar-se incorrectament).

    ## Pas 1: Afegir les OUs base

    ```bash
    ldapadd -x -D "cn=admin,dc=lafita,dc=local" -W -f ~/usuaris-base.ldif
    ```

    Contingut de `usuaris-base.ldif`:
    ```ldif
    dn: ou=usuaris,dc=lafita,dc=local
    objectClass: organizationalUnit
    ou: usuaris

    dn: ou=grups,dc=lafita,dc=local
    objectClass: organizationalUnit
    ou: grups
    ```

    Sortida esperada:
    ```text
    Enter LDAP Password: 
    adding new entry "ou=usuaris,dc=lafita,dc=local"

    adding new entry "ou=grups,dc=lafita,dc=local"
    ```

    ## Pas 2: Afegir el grup d'alumnes

    ```bash
    ldapadd -x -D "cn=admin,dc=lafita,dc=local" -W -f ~/grups.ldif
    ```

    Contingut de `grups.ldif`:
    ```ldif
    dn: cn=alumnes,ou=grups,dc=lafita,dc=local
    objectClass: posixGroup
    cn: alumnes
    gidNumber: 2001
    memberUid: maria.puig
    memberUid: pere.costa
    memberUid: anna.valls
    ```

    Sortida esperada:
    ```text
    Enter LDAP Password: 
    adding new entry "cn=alumnes,ou=grups,dc=lafita,dc=local"
    ```

    ## Pas 3: Afegir els usuaris

    ```bash
    ldapadd -x -D "cn=admin,dc=lafita,dc=local" -W -f ~/alumnes.ldif
    ```

    Sortida esperada:
    ```text
    Enter LDAP Password: 
    adding new entry "uid=maria.puig,ou=usuaris,dc=lafita,dc=local"

    adding new entry "uid=pere.costa,ou=usuaris,dc=lafita,dc=local"

    adding new entry "uid=anna.valls,ou=usuaris,dc=lafita,dc=local"
    ```

    ## Verificació post-addició

    ```bash
    # Comprova que les OUs existeixen
    ldapsearch -x -b "dc=lafita,dc=local" -s one "(objectClass=organizationalUnit)" ou

    # Comprova que els usuaris existeixen
    ldapsearch -x -b "ou=usuaris,dc=lafita,dc=local" "(objectClass=posixAccount)" uid cn uidNumber

    # Comprova que el grup existeix
    ldapsearch -x -b "ou=grups,dc=lafita,dc=local" "(objectClass=posixGroup)" cn gidNumber memberUid
    ```

    ## Errors freqüents

    | Error | Missatge | Causa | Solució |
    |-------|---------|-------|---------|
    | OU no existeix | `ldap_add: No such object (32)` | Intentes afegir un usuari a `ou=usuaris` que no existeix | Afegeix les OUs primer |
    | Entrada duplicada | `ldap_add: Already exists (68)` | L'entrada ja existeix al directori | Usa `ldapmodify` per modificar-la, o `ldapdelete` + `ldapadd` |
    | Credencials incorrectes | `ldap_bind: Invalid credentials (49)` | Contrasenya d'admin incorrecta | Verifica la contrasenya definida a `dpkg-reconfigure` |
    | Violació d'objectClass | `ldap_add: Object class violation (65)` | Falta un atribut obligatori | Revisa que `uid`, `uidNumber`, `gidNumber`, `homeDirectory`, `cn` hi siguin tots |
    | Sintaxi LDIF incorrecta | `ldif_read_file: missing value on line N` | Falta espai després dels `:` o línia en blanc entre entrades | Revisa la sintaxi del fitxer |

    !!! warning "Error 32: l'OU no existeix"
        L'error `ldap_add: No such object (32)` quan afegeixes usuaris significa que la OU de destinació (`ou=usuaris`) no s'ha creat encara. Executa primer `ldapadd -f usuaris-base.ldif`, i després torna a intentar afegir els usuaris.

    ??? question "Auto-avaluació"

        **1.** Intentes executar `ldapadd -f alumnes.ldif` però retorna `ldap_add: No such object (32)` per a la primera entrada. Quina és la causa i com ho soluciones?

        ??? success "Resposta"
            L'error indica que la OU de destinació (`ou=usuaris,dc=lafita,dc=local`) no existeix al directori. `ldapadd` no pot afegir l'usuari a un contenidor que no hi és. La solució és executar primer `ldapadd -f usuaris-base.ldif` per crear les OUs (`ou=usuaris` i `ou=grups`). Un cop creades, `ldapadd -f alumnes.ldif` funcionarà.

        **2.** Per quin motiu `ldapadd` demana la contrasenya de l'admin i no la de qualsevol usuari?

        ??? success "Resposta"
            Per defecte, OpenLDAP configura una ACL (*Access Control List*) que permet **llegir** el directori de manera anònima, però **escriure** (afegir, modificar, eliminar entrades) únicament al compte admin (`cn=admin,dc=lafita,dc=local`). Altres usuaris LDAP podrien tenir permisos d'escriptura si es configurés una ACL específica, però a la configuració per defecte del laboratori, només l'admin pot fer canvis estructurals.

        **3.** Has executat `ldapadd -f alumnes.ldif` i dues de les tres entrades s'han afegit correctament, però la tercera ha fallat amb error. Quin estat ha quedat el directori?

        ??? success "Resposta"
            Les dues primeres entrades **sí** han estat afegides al directori. `ldapadd` no és transaccional: processa les entrades una a una i, si falla a la tercera, les dues primeres ja estan escrites i no es fan enrere. Si intentes tornar a executar `ldapadd -f alumnes.ldif`, les dues primeres fallaran amb `Already exists (68)` i la tercera fallarà amb el seu error original. Solució: corregir l'error a la tercera entrada del fitxer LDIF i afegir **únicament** aquesta tercera entrada (o bé `ldapdelete` de les dues primeres i tornar a executar el fitxer sencer).

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.4 · Pobla el directori LDAP

    **Objectiu**: afegir les OUs, el grup i els tres usuaris al directori LDAP del servidor.

    **Temps estimat**: 25 minuts

    ---

    ### Part A – Afegeix les OUs

    ```bash
    ldapadd -x -D "cn=admin,dc=lafita,dc=local" -W -f ~/usuaris-base.ldif
    ```

    Verifica:
    ```bash
    ldapsearch -x -b "dc=lafita,dc=local" -s one "(objectClass=*)"
    ```

    ### Part B – Afegeix el grup

    ```bash
    ldapadd -x -D "cn=admin,dc=lafita,dc=local" -W -f ~/grups.ldif
    ```

    ### Part C – Afegeix els usuaris

    ```bash
    ldapadd -x -D "cn=admin,dc=lafita,dc=local" -W -f ~/alumnes.ldif
    ```

    ### Part D – Verificació completa

    ```bash
    # Llista tot el directori
    ldapsearch -x -b "dc=lafita,dc=local" "(objectClass=*)" dn

    # Comprova els usuaris
    ldapsearch -x -b "ou=usuaris,dc=lafita,dc=local" "(uid=*)" uid uidNumber homeDirectory
    ```

    Quants resultats retorna? Hi ha les tres entrades de usuaris?

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"ldapadd tutorial OpenLDAP add users groups LDIF"`
        - `"OpenLDAP add organizational unit user Ubuntu tutorial"`
        - `"ldapadd error no such object fix LDAP"`
