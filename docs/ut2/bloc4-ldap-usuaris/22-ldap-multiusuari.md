---
title: LDAP multiusuari en bloc
tags:
  - ut2
  - ldap
  - ldapadd
---

# :material-account-group: LDAP multiusuari: poblar el directori en bloc

!!! abstract "Concepte clau"
    Un directori LDAP real conté desenes o centenars d'usuaris. En lloc de crear-los un a un, es poblen en **lot** (*batch*): un únic fitxer LDIF amb totes les entrades i una sola crida a `ldapadd`. Aquesta pàgina consolida tot el Bloc 4 en un flux complet de creació multiusuari.

=== ":material-notebook-outline: Apunts"

    ## Flux complet de poblament del directori

    ```mermaid
    flowchart TD
        A["1. Preparació\n(recollir dades dels usuaris)"] --> B["2. Generar hashes\n(slappasswd × N usuaris)"]
        B --> C["3. Crear fitxers LDIF\n(usuaris-base + grups + alumnes)"]
        C --> D["4. Afegir al directori\n(ldapadd × 3 fitxers, en ordre)"]
        D --> E["5. Verificació\n(ldapsearch + ldapwhoami)"]

        style A fill:#1565C0,color:#fff
        style B fill:#6A1B9A,color:#fff
        style C fill:#1B5E20,color:#fff
        style D fill:#E65100,color:#fff
        style E fill:#37474F,color:#fff
    ```

    ## Fitxer LDIF complet del laboratori

    Aquest és el fitxer complet per poblar el directori del laboratori UT2 d'una sola vegada. Crea-lo com a `~/laboratori-complet.ldif`:

    ```ldif title="laboratori-complet.ldif"
    # === OUs base ===
    dn: ou=usuaris,dc=lafita,dc=local
    objectClass: organizationalUnit
    ou: usuaris

    dn: ou=grups,dc=lafita,dc=local
    objectClass: organizationalUnit
    ou: grups

    # === Grup alumnes ===
    dn: cn=alumnes,ou=grups,dc=lafita,dc=local
    objectClass: posixGroup
    cn: alumnes
    gidNumber: 2001
    memberUid: maria.puig
    memberUid: pere.costa
    memberUid: anna.valls

    # === Usuaris ===
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
    userPassword: {SSHA}SUBSTITUEIX_PEL_HASH_REAL

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
    userPassword: {SSHA}SUBSTITUEIX_PEL_HASH_REAL

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
    userPassword: {SSHA}SUBSTITUEIX_PEL_HASH_REAL
    ```

    !!! warning "Substitueix els hash SSHA"
        Cada línia `userPassword: {SSHA}SUBSTITUEIX_PEL_HASH_REAL` s'ha de substituir pel hash real generat amb `slappasswd` (pàgina [18 — slappasswd](18-slappasswd-hash.md)). Si deixes el text `SUBSTITUEIX_PEL_HASH_REAL`, `ldapadd` acceptarà l'entrada però l'autenticació sempre fallarà perquè no serà un hash SSHA vàlid.

    ## Execució: un únic fitxer, una única crida

    Si tens les OUs, grups i usuaris en un sol fitxer LDIF (com `laboratori-complet.ldif`), pots poblar tot el directori amb una sola crida:

    ```bash
    ldapadd -x -D "cn=admin,dc=lafita,dc=local" -W -f ~/laboratori-complet.ldif
    ```

    Sortida esperada:
    ```text
    Enter LDAP Password: 
    adding new entry "ou=usuaris,dc=lafita,dc=local"

    adding new entry "ou=grups,dc=lafita,dc=local"

    adding new entry "cn=alumnes,ou=grups,dc=lafita,dc=local"

    adding new entry "uid=maria.puig,ou=usuaris,dc=lafita,dc=local"

    adding new entry "uid=pere.costa,ou=usuaris,dc=lafita,dc=local"

    adding new entry "uid=anna.valls,ou=usuaris,dc=lafita,dc=local"
    ```

    ## Verificació completa post-poblament

    ```bash
    # 1. Llista tota l'estructura del directori
    ldapsearch -x -b "dc=lafita,dc=local" "(objectClass=*)" dn | grep "^dn:"

    # 2. Comprova els atributs clau dels usuaris
    ldapsearch -x -b "ou=usuaris,dc=lafita,dc=local" "(uid=*)" \
               uid uidNumber gidNumber homeDirectory loginShell

    # 3. Comprova els membres del grup
    ldapsearch -x -b "ou=grups,dc=lafita,dc=local" "(cn=alumnes)" memberUid

    # 4. Valida l'autenticació de cada usuari
    ldapwhoami -x -D "uid=maria.puig,ou=usuaris,dc=lafita,dc=local" -W
    ldapwhoami -x -D "uid=pere.costa,ou=usuaris,dc=lafita,dc=local" -W
    ldapwhoami -x -D "uid=anna.valls,ou=usuaris,dc=lafita,dc=local" -W
    ```

    ## Resets de laboratori: com buidar el directori i tornar a poblar

    En un entorn de laboratori, de vegades cal recomençar des de zero:

    ```bash
    # Opció A: reinstal·la slapd des de zero (elimina tota la BD)
    sudo apt purge slapd
    sudo apt install slapd
    sudo dpkg-reconfigure slapd
    # Torna a poblar des del fitxer laboratori-complet.ldif

    # Opció B: elimina les entrades individualment (ldapdelete, Bloc 5)
    # → Veure pàgina 24-ldapdelete.md
    ```

    L'opció A és la més ràpida per al laboratori. L'opció B és la que s'usa en producció (mai reinstal·les un servidor LDAP de producció per esborrar uns pocs usuaris).

    ## Bones pràctiques per a fitxers LDIF de laboratori

    | Pràctica | Per quin motiu |
    |----------|---------------|
    | Guarda els fitxers LDIF a un directori `~/ldif/` | Pots reutilitzar-los en futures sessions o compartir-los |
    | Versiona els fitxers LDIF amb Git | Permet veure l'evolució del directori i recuperar versions anteriors |
    | Usa noms descriptius: `usuaris-base.ldif`, `grups.ldif`, `alumnes.ldif` | Clar i reutilitzable vs `fitxer1.ldif`, `prova.ldif` |
    | Anota la data i la versió en un comentari al principi del fitxer | Facilita el diagnòstic quan hi ha errors |

    ??? question "Auto-avaluació"

        **1.** Un company t'envia un fitxer LDIF amb 50 usuaris. Com pots comprovar ràpidament que tots els UIDs son únics **abans** d'executar `ldapadd`?

        ??? success "Resposta"
            ```bash
            grep "^uidNumber:" companys-usuaris.ldif | sort | uniq -d
            ```
            Si la sortida és buida, tots els `uidNumber` son únics al fitxer. Si retorna valors, hi ha UIDs duplicats que cal corregir abans d'executar `ldapadd`. Igual per als DNs: `grep "^dn:" companys-usuaris.ldif | sort | uniq -d`.

        **2.** Quina és la diferència entre afegir 3 usuaris en un sol fitxer LDIF vs tres fitxers separats? Hi ha avantatge tècnic?

        ??? success "Resposta"
            Tècnicament el resultat és idèntic: `ldapadd` processa les entrades seqüencialment de totes maneres. L'avantatge d'un sol fitxer és la **conveniència**: una sola crida a `ldapadd`, menys risc d'oblidar un fitxer, i és més fàcil de versionar. L'avantatge de fitxers separats és la **modularitat**: si el fitxer d'usuaris falla, no cal tornar a executar les OUs i grups (que ja existeixen). Al laboratori, la recomanació és mantenir fitxers separats per tipus (OUs, grups, usuaris) però combinar-los en un `laboratori-complet.ldif` per al reset inicial complet.

        **3.** Quin és l'estat del directori si executes `ldapadd -f laboratori-complet.ldif` dues vegades seguides (sense buidar el directori entre les dues execucions)?

        ??? success "Resposta"
            La primera execució crea totes les entrades amb èxit. La segona execució falla en **cada entrada** amb `ldap_add: Already exists (68)`, perquè tots els DNs ja existeixen. No es produeix cap canvi al directori (les entrades existents no es sobreescriuen). El directori queda amb les entrades de la primera execució — és a dir, en bon estat. Si vols modificar una entrada existent, cal `ldapmodify` (Bloc 5), no `ldapadd`.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.7 · Pobla el directori complet del laboratori

    **Objectiu**: créar tota l'estructura del directori (OUs + grup + 3 usuaris) amb un únic fitxer LDIF.

    **Temps estimat**: 30 minuts

    ---

    ### Part A – Prepara el fitxer complet

    ```bash
    mkdir -p ~/ldif
    nano ~/ldif/laboratori-complet.ldif
    ```

    Copia l'estructura de la teoria i substitueix cada `{SSHA}SUBSTITUEIX_PEL_HASH_REAL` pel hash generat a l'Activitat 4.3.

    ### Part B – Pobla el directori

    ```bash
    ldapadd -x -D "cn=admin,dc=lafita,dc=local" -W -f ~/ldif/laboratori-complet.ldif
    ```

    ### Part C – Verificació completa

    ```bash
    ldapsearch -x -b "dc=lafita,dc=local" "(objectClass=*)" dn | grep "^dn:"
    ```

    Has de veure 6 entrades (dc=lafita + ou=usuaris + ou=grups + cn=alumnes + 3 usuaris + cn=admin).

    ### Part D – Valida l'autenticació

    Executa `ldapwhoami` per als tres usuaris. Tots han de retornar el seu DN sense errors.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"OpenLDAP populate directory LDIF bulk add users"`
        - `"ldapadd multiple users LDIF file tutorial"`
        - `"OpenLDAP lab setup users groups complete tutorial"`
