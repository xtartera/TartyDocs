---
title: ldapmodify
tags:
  - ut2
  - ldap
  - ldapmodify
---

# :material-account-edit: ldapmodify: modificació d'entrades LDAP

!!! abstract "Concepte clau"
    **`ldapmodify`** modifica entrades que ja existeixen al directori LDAP. Usa un format LDIF estès amb `changetype: modify` i les operacions `replace`, `add` i `delete` per canviar atributs individuals sense tocar la resta de l'entrada.

=== ":material-notebook-outline: Apunts"

    ## Sintaxi

    ```bash
    ldapmodify -x -D "cn=admin,dc=lafita,dc=local" -W -f canvis.ldif
    ```

    Les opcions son idèntiques a `ldapadd`. La diferència és el contingut del fitxer LDIF: en lloc de crear entrades noves, descriu **canvis** sobre entrades existents.

    ## Format LDIF per a modificacions

    Un fitxer de modificació té sempre l'estructura:

    ```ldif
    dn: DN_de_l_entrada_a_modificar
    changetype: modify
    OPERACIÓ: atribut
    atribut: nou_valor
    ```

    Les tres operacions possibles:

    | Operació | Funció |
    |----------|--------|
    | `replace: atribut` | Substitueix el valor actual de l'atribut |
    | `add: atribut` | Afegeix un nou valor a l'atribut (o crea'l si no existia) |
    | `delete: atribut` | Elimina l'atribut (o un valor concret d'un atribut multivalor) |

    Quan s'encadenen múltiples operacions en una sola entrada, se separen amb un guió `-` en una línia:

    ```ldif
    dn: uid=maria.puig,ou=usuaris,dc=lafita,dc=local
    changetype: modify
    replace: loginShell
    loginShell: /bin/sh
    -
    add: mail
    mail: maria.puig@lafita.local
    ```

    ## Exemples del laboratori

    ### Canviar la contrasenya d'un usuari

    ```bash
    # Pas 1: genera el nou hash
    slappasswd
    # → {SSHA}NovaHashAqui
    ```

    ```ldif title="canvi-contrasenya.ldif"
    dn: uid=maria.puig,ou=usuaris,dc=lafita,dc=local
    changetype: modify
    replace: userPassword
    userPassword: {SSHA}NovaHashAqui
    ```

    ```bash
    ldapmodify -x -D "cn=admin,dc=lafita,dc=local" -W -f canvi-contrasenya.ldif
    ```

    Verifica:
    ```bash
    ldapwhoami -x -D "uid=maria.puig,ou=usuaris,dc=lafita,dc=local" -W
    # Introdueix la nova contrasenya — ha de retornar el DN
    ```

    ### Corregir el homeDirectory d'un usuari

    Si un usuari té `/home/` en lloc de `/perfils/`:

    ```ldif title="corregeix-home.ldif"
    dn: uid=pere.costa,ou=usuaris,dc=lafita,dc=local
    changetype: modify
    replace: homeDirectory
    homeDirectory: /perfils/pere.costa
    ```

    ### Afegir un atribut que no existia

    ```ldif title="afegeix-mail.ldif"
    dn: uid=anna.valls,ou=usuaris,dc=lafita,dc=local
    changetype: modify
    add: mail
    mail: anna.valls@lafita.local
    ```

    ### Eliminar un atribut

    ```ldif title="elimina-mail.ldif"
    dn: uid=anna.valls,ou=usuaris,dc=lafita,dc=local
    changetype: modify
    delete: mail
    ```

    Si l'atribut és multivalor i vols eliminar únicament un valor concret:

    ```ldif
    dn: cn=alumnes,ou=grups,dc=lafita,dc=local
    changetype: modify
    delete: memberUid
    memberUid: pere.costa
    ```

    (sense especificar el valor, s'eliminarien **tots** els `memberUid`)

    ### Afegir un usuari a un grup existent

    ```ldif title="afegeix-membre.ldif"
    dn: cn=alumnes,ou=grups,dc=lafita,dc=local
    changetype: modify
    add: memberUid
    memberUid: nou.alumne
    ```

    ### Múltiples operacions en una sola crida

    ```ldif title="actualitza-usuari.ldif"
    dn: uid=maria.puig,ou=usuaris,dc=lafita,dc=local
    changetype: modify
    replace: loginShell
    loginShell: /bin/bash
    -
    replace: homeDirectory
    homeDirectory: /perfils/maria.puig
    -
    add: mail
    mail: maria.puig@lafita.local
    ```

    !!! warning "El guió `-` és obligatori entre operacions"
        Quan encadenes múltiples operacions `replace`/`add`/`delete` en una sola entrada, cada bloc s'ha de separar per una línia que conté únicament un guió `-`. Si oblides el guió, `ldapmodify` retorna un error de sintaxi LDIF.

    ## Verificació de la modificació

    ```bash
    # Comprova els atributs modificats
    ldapsearch -x -b "dc=lafita,dc=local" "(uid=maria.puig)" loginShell homeDirectory mail
    ```

    ??? question "Auto-avaluació"

        **1.** Vols canviar el `loginShell` de `pere.costa` de `/bin/bash` a `/bin/sh`. Escriu el fitxer LDIF complet i la crida a `ldapmodify`.

        ??? success "Resposta"
            Fitxer `canvi-shell.ldif`:
            ```ldif
            dn: uid=pere.costa,ou=usuaris,dc=lafita,dc=local
            changetype: modify
            replace: loginShell
            loginShell: /bin/sh
            ```
            Crida:
            ```bash
            ldapmodify -x -D "cn=admin,dc=lafita,dc=local" -W -f canvi-shell.ldif
            ```
            Verificació: `ldapsearch -x -b "dc=lafita,dc=local" "(uid=pere.costa)" loginShell`

        **2.** Quina és la diferència entre `replace: mail` i `delete: mail` seguit de `add: mail`?

        ??? success "Resposta"
            El resultat final és el mateix si l'atribut és monovalor: el valor queda substituït. La diferència importa quan l'atribut és **multivalor** (pot tenir múltiples valors, com `memberUid` d'un grup). `replace: mail` elimina **tots** els valors existents i posa el nou. `delete: mail` + `add: mail` permet eliminar únicament un valor concret i afegir un altre. Per a atributs monovalor com `loginShell` o `homeDirectory`, usa sempre `replace` — és més clar i directe.

        **3.** Executes `ldapmodify -f canvis.ldif` però retorna `ldap_modify: No such attribute (16)`. Quina és la causa i com ho soluciones?

        ??? success "Resposta"
            L'error 16 indica que intentes modificar (amb `replace` o `delete`) un atribut que **no existeix** a l'entrada. Per exemple, fas `replace: mail` però l'usuari no té l'atribut `mail` al directori. Solució: usa `add: mail` en lloc de `replace: mail` per afegir un atribut que no existia, o verifica prèviament amb `ldapsearch` quins atributs té l'entrada.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 5.1 · Modifica les entrades del laboratori

    **Objectiu**: practicar les tres operacions de modificació LDAP sobre els usuaris existents.

    **Temps estimat**: 25 minuts

    ---

    ### Part A – Canvia la contrasenya de `maria.puig`

    ```bash
    slappasswd   # genera nou hash
    nano ~/ldif/canvi-contrasenya.ldif   # crea el fitxer amb replace: userPassword
    ldapmodify -x -D "cn=admin,dc=lafita,dc=local" -W -f ~/ldif/canvi-contrasenya.ldif
    ldapwhoami -x -D "uid=maria.puig,ou=usuaris,dc=lafita,dc=local" -W
    ```

    ### Part B – Afegeix correu electrònic als tres usuaris

    Crea `~/ldif/afegeix-mail.ldif` amb tres blocs (un per usuari, separats per línia en blanc) usant `add: mail`.

    ### Part C – Elimina el correu d'`anna.valls`

    ```ldif
    dn: uid=anna.valls,ou=usuaris,dc=lafita,dc=local
    changetype: modify
    delete: mail
    ```

    Verifica amb `ldapsearch -x -b "dc=lafita,dc=local" "(uid=anna.valls)" mail` que ja no té l'atribut.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"ldapmodify tutorial replace add delete attribute LDAP"`
        - `"OpenLDAP modify user attribute changetype modify"`
        - `"ldapmodify change password LDAP slappasswd tutorial"`
