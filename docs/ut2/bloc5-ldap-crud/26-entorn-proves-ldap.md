---
title: Entorn de proves LDAP
tags:
  - ut2
  - ldap
  - diagnostic
---

# :material-flask: Entorn de proves LDAP

!!! abstract "Concepte clau"
    Un **entorn de proves** LDAP és una OU separada (`ou=proves`) on pots crear, modificar i eliminar entrades sense afectar els usuaris reals del laboratori. Permet experimentar amb `ldapmodify` i `ldapdelete` de manera segura, i és el lloc on practicar els casos d'error de la pàgina anterior.

=== ":material-notebook-outline: Apunts"

    ## Per quin motiu cal un entorn de proves?

    Al laboratori, el directori LDAP conté els tres usuaris reals que SSSD (Bloc 6), NFS i autofs (Blocs 7–8) usaran per autenticar logins. Si practiques operacions destructives sobre `ou=usuaris`, pots trencar la integració de tot el sistema.

    L'entorn de proves permet:
    - Provar la sintaxi de fitxers LDIF sense risc
    - Practicar `ldapmodify` i `ldapdelete` lliurement
    - Simular errors i aprendre a diagnosticar-los
    - Fer demos sense afectar els usuaris de producció

    ## Estructura de l'entorn de proves

    ```
    dc=lafita,dc=local
    ├── ou=usuaris          ← usuaris reals (no tocar)
    ├── ou=grups            ← grups reals (no tocar)
    └── ou=proves           ← entorn de proves (tot és temporal)
        ├── uid=test1
        └── uid=test2
    ```

    ## Creació de l'entorn de proves

    ```ldif title="proves-base.ldif"
    dn: ou=proves,dc=lafita,dc=local
    objectClass: organizationalUnit
    ou: proves
    description: Entorn de proves temporal - es pot eliminar

    dn: uid=test1,ou=proves,dc=lafita,dc=local
    objectClass: inetOrgPerson
    objectClass: posixAccount
    objectClass: shadowAccount
    uid: test1
    cn: Usuari Test 1
    sn: Test
    uidNumber: 9001
    gidNumber: 9001
    homeDirectory: /tmp/test1
    loginShell: /bin/bash
    userPassword: {SSHA}PlaceholderHash1
    ```

    !!! info "UIDs de proves: 9001+"
        Per als usuaris de l'entorn de proves usa UIDs a partir de 9001, molt allunyats del rang 1001–1003 dels usuaris reals. Així mai hi haurà col·lisió si oblidem eliminar algun usuari de proves.

    ```bash
    ldapadd -x -D "cn=admin,dc=lafita,dc=local" -W -f ~/ldif/proves-base.ldif
    ```

    ## Exercicis de pràctica a l'entorn de proves

    ### Pràctica 1: cicle create → modify → delete complet

    ```bash
    # 1. Crea un usuari de proves
    ldapadd -x -D "cn=admin,dc=lafita,dc=local" -W -f ~/ldif/proves-base.ldif

    # 2. Afegeix un atribut nou
    cat > /tmp/add-mail.ldif << 'EOF'
    dn: uid=test1,ou=proves,dc=lafita,dc=local
    changetype: modify
    add: mail
    mail: test1@lafita.local
    EOF
    ldapmodify -x -D "cn=admin,dc=lafita,dc=local" -W -f /tmp/add-mail.ldif

    # 3. Verifica
    ldapsearch -x -b "ou=proves,dc=lafita,dc=local" "(uid=test1)" mail

    # 4. Modifica'l
    cat > /tmp/mod-shell.ldif << 'EOF'
    dn: uid=test1,ou=proves,dc=lafita,dc=local
    changetype: modify
    replace: loginShell
    loginShell: /bin/sh
    EOF
    ldapmodify -x -D "cn=admin,dc=lafita,dc=local" -W -f /tmp/mod-shell.ldif

    # 5. Elimina'l
    ldapdelete -x -D "cn=admin,dc=lafita,dc=local" -W \
               "uid=test1,ou=proves,dc=lafita,dc=local"
    ```

    ### Pràctica 2: prova errors intencionals

    ```bash
    # Prova error 65: objectClass sense atribut obligatori
    cat > /tmp/error-test.ldif << 'EOF'
    dn: uid=errortest,ou=proves,dc=lafita,dc=local
    objectClass: inetOrgPerson
    objectClass: posixAccount
    uid: errortest
    cn: Error Test
    sn: Test
    uidNumber: 9002
    gidNumber: 9002
    # homeDirectory INTENCIONALMENT ABSENT → error 65
    loginShell: /bin/bash
    EOF
    ldapadd -x -D "cn=admin,dc=lafita,dc=local" -W -f /tmp/error-test.ldif
    # → Hauria de retornar Object class violation (65)

    # Prova error 68: entrada duplicada
    ldapadd -x -D "cn=admin,dc=lafita,dc=local" -W -f ~/ldif/proves-base.ldif
    ldapadd -x -D "cn=admin,dc=lafita,dc=local" -W -f ~/ldif/proves-base.ldif
    # → La segona crida hauria de retornar Already Exists (68)
    ```

    ## Reset de l'entorn de proves

    ```bash
    # Elimina tots els usuaris de proves
    ldapdelete -x -D "cn=admin,dc=lafita,dc=local" -W \
               "uid=test1,ou=proves,dc=lafita,dc=local"

    # Elimina la OU de proves
    ldapdelete -x -D "cn=admin,dc=lafita,dc=local" -W \
               "ou=proves,dc=lafita,dc=local"

    # Verifica que ha desaparegut
    ldapsearch -x -b "dc=lafita,dc=local" -s one "(objectClass=*)" ou
    ```

    ## Resum del cicle CRUD complet del Bloc 5

    Havent completat el Bloc 5, tens domini sobre les quatre operacions del directori:

    | Operació | Eina | LDIF necessari? | Exemple del laboratori |
    |----------|------|----------------|----------------------|
    | **Crear** | `ldapadd` | Sí (entrada completa) | Afegir `ou=usuaris`, grup `alumnes`, tres usuaris |
    | **Llegir** | `ldapsearch` | No (filtres a la línia) | `ldapsearch -x -b "..." "(uid=*)"` |
    | **Modificar** | `ldapmodify` | Sí (`changetype: modify`) | Canviar contrasenya, afegir mail, corregir homeDir |
    | **Eliminar** | `ldapdelete` | No (DN a la línia) | `ldapdelete ... "uid=anna.valls,..."` |

    !!! tip "Connexió amb UT1"
        A Active Directory feies les mateixes operacions CRUD des de la GUI *Active Directory Users and Computers* (crear usuari, restablir contrasenya, eliminar compte) o via PowerShell (`New-ADUser`, `Set-ADUser`, `Remove-ADUser`). Ara fas exactament el mateix amb `ldapadd`, `ldapmodify` i `ldapdelete`, però des de la línia d'ordres i amb fitxers LDIF de text pla.

    ??? question "Auto-avaluació"

        **1.** Per quin motiu convé tenir una `ou=proves` separada en lloc de simplement crear els usuaris de prova dins de `ou=usuaris`?

        ??? success "Resposta"
            Si crees usuaris de proves a `ou=usuaris`, SSSD (configurat al Bloc 6) els veurà com a usuaris legítims i els integrarà al sistema. Els clients podran intentar fer login amb comptes de proves, podran aparèixer a `getent passwd`, i si autofs (Bloc 8) genera directoris home automàticament, es crearan carpetes innecessàries a `/perfils/`. A `ou=proves`, els usuaris existeixen al directori però, si el filtre SSSD apunta únicament a `ou=usuaris`, seran completament invisibles per al sistema operatiu. La separació és una bona pràctica d'aïllament.

        **2.** Has practicat modificar i eliminar usuaris a `ou=proves`. Quina ordre emet per verificar que l'entorn de proves està completament net (sense cap entrada) abans de fer el reset?

        ??? success "Resposta"
            ```bash
            ldapsearch -x -b "ou=proves,dc=lafita,dc=local" "(objectClass=*)" dn
            ```
            Si retorna únicament l'entrada `ou=proves` (sense entrades filles), la OU ja es pot eliminar amb `ldapdelete`. Si retorna entrades d'usuaris de proves, cal eliminar-los primer. El compte de resultats al final (`# numEntries: N`) indica quants objectes queden a la OU.

        **3.** Compara el flux de treball LDAP del Bloc 5 (`ldapadd → ldapmodify → ldapdelete`) amb l'equivalent a la UT1 a Active Directory. Quines diferències importants hi ha?

        ??? success "Resposta"
            Diferències clau: (1) **Interfície**: AD usa GUI gràfica (ADUC) o PowerShell; LDAP usa CLI amb fitxers LDIF de text pla. (2) **Transaccions**: AD és transaccional (les operacions que falla reverteix tot el canvi); LDAP bàsic no ho és (si un `ldapadd` de 5 entrades falla a la 3a, les dues primeres ja estan escrites). (3) **Auditoria**: AD integra registres d'auditoria automàtics; a OpenLDAP cal configurar el mòdul `auditlog` manualment. (4) **Comoditat**: crear un usuari amb tots els atributs POSIX per LDIF requereix uns 10–12 atributs escrits manualment; l'assistent d'AD ho fa amb formulari. (5) **Portabilitat**: els fitxers LDIF son text pla versionable amb Git; les operacions AD son gestos de GUI no fàcilment repetibles.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 5.4 · Consolida el CRUD complet

    **Objectiu**: executar el cicle complet create→read→update→delete sobre l'entorn de proves.

    **Temps estimat**: 30 minuts

    ---

    ### Part A – Crea l'entorn de proves

    ```bash
    ldapadd -x -D "cn=admin,dc=lafita,dc=local" -W -f ~/ldif/proves-base.ldif
    ldapsearch -x -b "ou=proves,dc=lafita,dc=local" "(objectClass=*)" dn
    ```

    ### Part B – Modifica `test1` (almenys 3 operacions)

    1. Canvia el `loginShell` de `/bin/bash` a `/bin/sh`
    2. Afegeix l'atribut `mail: test1@lafita.local`
    3. Canvia la `userPassword` (genera un hash nou amb `slappasswd`)

    Verifica cada canvi amb `ldapsearch`.

    ### Part C – Prova errors controlats

    Intenta provocar almenys dos errors de la taula de la pàgina 25:
    - Error 65 (falta atribut obligatori)
    - Error 68 (entrada duplicada)

    Anota el missatge exacte de cada error.

    ### Part D – Reset i verificació final

    Elimina tots els usuaris de proves, elimina `ou=proves`, i verifica que el directori únicament conté les OUs reals i els tres usuaris del laboratori:

    ```bash
    ldapsearch -x -b "dc=lafita,dc=local" "(objectClass=*)" dn | grep "^dn:"
    ```

    Ha de mostrar exactament: `dc=lafita,dc=local`, `cn=admin`, `ou=usuaris`, `ou=grups`, `cn=alumnes`, i els tres usuaris.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"OpenLDAP test environment setup tutorial"`
        - `"LDAP CRUD operations practice tutorial create modify delete"`
        - `"OpenLDAP organizational unit test safe practice"`
