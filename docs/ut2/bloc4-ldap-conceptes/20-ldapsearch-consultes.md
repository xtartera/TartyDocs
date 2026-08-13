---
title: "ldapsearch: consultes i filtres"
tags:
  - ut2
  - ldap
  - ldapsearch
---

# :material-magnify: ldapsearch: consultes al directori

!!! abstract "Concepte clau"
    **`ldapsearch`** és l'eina principal per consultar un directori LDAP des de la línia d'ordres. Permet cercar entrades per qualsevol atribut, filtrar resultats i verificar que el directori conté el que s'espera. És la primera eina que uses per comprovar si una operació LDAP ha funcionat.

=== ":material-notebook-outline: Apunts"

    ## Sintaxi bàsica

    ```bash
    ldapsearch [opcions] [filtre] [atributs]
    ```

    ## Opcions principals

    | Opció | Significat | Exemple |
    |-------|-----------|---------|
    | `-x` | Autenticació simple (*simple bind*) en lloc de SASL | Sempre necessari per a ús bàsic |
    | `-b BASE` | Base DN des d'on iniciar la cerca | `-b "dc=lafita,dc=local"` |
    | `-H URI` | URI del servidor LDAP | `-H ldap://localhost` |
    | `-D BINDDN` | DN amb el qual t'autentiques | `-D "cn=admin,dc=lafita,dc=local"` |
    | `-W` | Demana la contrasenya interactivament (recomanat) | Evita escriure la contrasenya a la línia |
    | `-w PASS` | Contrasenya en text a la línia (menys segur) | `-w ldap1234` |
    | `-s SCOPE` | Abast de la cerca | `-s base`, `-s one`, `-s sub` (per defecte) |
    | `-LLL` | Sortida en format LDIF net (sense comentaris) | Útil per redirigir a fitxers |

    ## Àmbits de cerca (`-s`)

    | Àmbit | Significat |
    |-------|-----------|
    | `base` | Consulta únicament l'entrada de la base DN (no descendents) |
    | `one` | Consulta els fills directes de la base DN (un nivell) |
    | `sub` | Consulta tota la subarbore sota la base DN (per defecte) |

    ## Filtres LDAP

    Els filtres van entre parèntesis i segueixen la sintaxi `(atribut=valor)`:

    | Filtre | Cerca |
    |--------|-------|
    | `(objectClass=*)` | Totes les entrades (qualsevol objectClass) |
    | `(uid=maria.puig)` | L'entrada on `uid` és exactament `maria.puig` |
    | `(uid=*)` | Entrades que tinguin l'atribut `uid` (qualsevol valor) |
    | `(uid=m*)` | Entrades on `uid` comença per `m` (wildcard) |
    | `(objectClass=posixAccount)` | Tots els usuaris amb compte POSIX |
    | `(&(objectClass=posixAccount)(uidNumber>=1000))` | Usuaris POSIX amb UID ≥ 1000 |

    ## Consultes freqüents al laboratori

    ### Consulta anònima (sense contrasenya) — verifica si el servidor respon

    ```bash
    ldapsearch -x -b "dc=lafita,dc=local" "(objectClass=*)"
    ```

    Sortida esperada (directori buit, només l'entrada arrel):
    ```text
    # lafita.local
    dn: dc=lafita,dc=local
    objectClass: top
    objectClass: dcObject
    objectClass: organization
    o: lafita
    dc: lafita
    ```

    ### Llista tots els usuaris (un cop afegits)

    ```bash
    ldapsearch -x -b "ou=usuaris,dc=lafita,dc=local" "(objectClass=posixAccount)" uid cn uidNumber
    ```

    Sortida esperada:
    ```text
    # maria.puig, usuaris, lafita.local
    dn: uid=maria.puig,ou=usuaris,dc=lafita,dc=local
    uid: maria.puig
    cn: Maria Puig
    uidNumber: 1001

    # pere.costa, usuaris, lafita.local
    dn: uid=pere.costa,ou=usuaris,dc=lafita,dc=local
    uid: pere.costa
    cn: Pere Costa
    uidNumber: 1002

    # anna.valls, usuaris, lafita.local
    dn: uid=anna.valls,ou=usuaris,dc=lafita,dc=local
    uid: anna.valls
    cn: Anna Valls
    uidNumber: 1003
    ```

    ### Cerca un usuari específic

    ```bash
    ldapsearch -x -b "dc=lafita,dc=local" "(uid=maria.puig)"
    ```

    ### Consulta autenticada com a admin

    ```bash
    ldapsearch -x -b "dc=lafita,dc=local" \
               -D "cn=admin,dc=lafita,dc=local" -W \
               "(objectClass=*)"
    ```

    ### Consulta des d'un client remot (no el servidor)

    ```bash
    ldapsearch -x -H ldap://192.168.100.10 \
               -b "dc=lafita,dc=local" \
               "(uid=*)" uid cn
    ```

    ## Limitar els atributs retornats

    Per defecte, `ldapsearch` retorna tots els atributs. Pots especificar quins vols al final:

    ```bash
    # Retorna només uid, cn i uidNumber
    ldapsearch -x -b "dc=lafita,dc=local" "(uid=*)" uid cn uidNumber

    # Retorna cap atribut, únicament els DNs
    ldapsearch -x -b "dc=lafita,dc=local" "(uid=*)" 1.1
    ```

    ## Sortida LDIF neta amb `-LLL`

    ```bash
    ldapsearch -x -LLL -b "dc=lafita,dc=local" "(uid=*)" uid cn
    ```

    L'opció `-LLL` elimina els comentaris i el capçalera de la sortida, ideal per redirigir a fitxers o processar amb scripts.

    ??? question "Auto-avaluació"

        **1.** Explica la diferència entre `ldapsearch -s base -b "dc=lafita,dc=local"` i `ldapsearch -s sub -b "dc=lafita,dc=local"`.

        ??? success "Resposta"
            `-s base` retorna **únicament l'entrada** `dc=lafita,dc=local` (l'arrel del directori), sense cap fill ni descendent. Útil per verificar si el directori existeix o quines dades conté l'arrel. `-s sub` (per defecte) retorna **tota la subarbore** a partir de `dc=lafita,dc=local`: l'arrel, les OUs (`ou=usuaris`, `ou=grups`), els usuaris, els grups... tot. La majoria de les cerques reals usen `-s sub`.

        **2.** Escriu l'ordre `ldapsearch` per buscar a `dc=lafita,dc=local` tots els usuaris que tinguin `uidNumber` >= 1001, retornant únicament els atributs `uid` i `cn`.

        ??? success "Resposta"
            ```bash
            ldapsearch -x -b "dc=lafita,dc=local" \
                       "(&(objectClass=posixAccount)(uidNumber>=1001))" \
                       uid cn
            ```
            El filtre `(&(...)(...))`  és l'AND de dos filtres: la entrada ha de tenir `objectClass=posixAccount` I el `uidNumber` ha de ser >= 1001. Si s'omet el filtre per objectClass, podria coincidir amb qualsevol entrada que tingui un atribut `uidNumber` (poc freqüent però possible).

        **3.** Executes `ldapsearch -x -b "dc=lafita,dc=local" "(uid=*)"` i la sortida és buida (0 resultats). El servidor `slapd` funciona. Quines causes possibles hi ha?

        ??? success "Resposta"
            Les causes més habituals: (1) Encara no has afegit usuaris al directori — si acabes d'instal·lar `slapd`, el directori està buit excepte l'entrada arrel i l'admin (que no té atribut `uid`). (2) Els usuaris estan a una OU diferent: prova amb un filtre menys restrictiu `"(objectClass=*)"` per veure totes les entrades. (3) El domini base és incorrecte: verifica amb `ldapsearch -x -b "" -s base namingContexts` quin és el domini base real del servidor.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.6 · Consultes al directori amb ldapsearch

    **Objectiu**: familiaritzar-se amb les opcions de `ldapsearch` consultant el directori base del laboratori.

    **Temps estimat**: 20 minuts

    ---

    ### Part A – Consulta bàsica anònima

    ```bash
    ldapsearch -x -b "dc=lafita,dc=local" "(objectClass=*)"
    ```

    Quantes entrades retorna? Quins DNs hi apareixen?

    ### Part B – Consulta l'arrel del directori (scope base)

    ```bash
    ldapsearch -x -b "dc=lafita,dc=local" -s base "(objectClass=*)"
    ```

    Observa la diferència amb el resultat de la Part A.

    ### Part C – Consulta autenticada com a admin

    ```bash
    ldapsearch -x -b "dc=lafita,dc=local" \
               -D "cn=admin,dc=lafita,dc=local" -W \
               "(objectClass=*)"
    ```

    Veus alguna diferència respecte a la consulta anònima? (Normalment no: el directori bàsic és llegible sense autenticació, però en entorns de producció les ACLs restringeixen l'accés anònim.)

    ### Part D – Consulta des del client (si en tens un)

    Des d'un Ubuntu client (192.168.100.20), instal·la les eines i fes una consulta remota:

    ```bash
    # Al client
    sudo apt install -y ldap-utils
    ldapsearch -x -H ldap://192.168.100.10 \
               -b "dc=lafita,dc=local" "(objectClass=*)"
    ```

    Si la consulta funciona des del client, el servidor LDAP és accessible per xarxa.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"ldapsearch tutorial Linux LDAP query examples"`
        - `"ldapsearch filter syntax LDAP search examples"`
        - `"OpenLDAP ldapsearch Ubuntu command line tutorial"`
