---
title: Errors LDAP freqüents
tags:
  - ut2
  - ldap
  - diagnostic
---

# :material-bug-check: Errors LDAP freqüents i com solucionar-los

!!! abstract "Concepte clau"
    Els errors LDAP segueixen un sistema de **codis numèrics** estandarditzats (RFC 4511). Saber interpretar el codi i el missatge permet diagnosticar ràpidament si el problema és de credencials, de sintaxi LDIF, d'estructura del directori o de connectivitat.

=== ":material-notebook-outline: Apunts"

    ## Taula de referència: errors més habituals

    | Codi | Nom estàndard | Missatge `ldap_utils` | Causa habitual | Solució |
    |------|--------------|----------------------|----------------|---------|
    | **0** | Success | *(sense error)* | — | L'operació ha tingut èxit |
    | **16** | No Such Attribute | `ldap_modify: No such attribute` | `replace` o `delete` d'un atribut que no existeix a l'entrada | Usa `add` per afegir atributs nous; verifica amb `ldapsearch` quins atributs té l'entrada |
    | **17** | Undefined Attribute Type | `ldap_add: Undefined attribute type` | Atribut desconegut per l'esquema (error tipogràfic, ex: `userpassword` en lloc de `userPassword`) | Revisa el nom exacte de l'atribut; LDAP és sensible a majúscules als valors però no als noms d'atributs |
    | **20** | Attribute Or Value Exists | `ldap_add: Attribute or value exists` | Intentes afegir un valor que ja existeix | Usa `replace` en lloc de `add`, o elimina el valor existent primer |
    | **32** | No Such Object | `ldap_add: No such object` / `ldap_bind: No such object` | El DN de destinació no existeix (OU mare no creada, o DN incorrecte) | Crea la OU/contenidor primer; verifica el DN amb `ldapsearch` |
    | **34** | Invalid DN Syntax | `ldap_add: Invalid DN syntax` | El DN té un format incorrecte (coma extra, espai incorrecte, etc.) | Revisa la sintaxi del DN: `uid=usuari,ou=usuaris,dc=domini,dc=local` |
    | **48** | Inappropriate Authentication | `ldap_bind: Inappropriate authentication` | Intentes autenticació SASL sense `-x`, o configuració incorrecta | Afegeix `-x` per autenticació simple |
    | **49** | Invalid Credentials | `ldap_bind: Invalid credentials` | Contrasenya incorrecta per al DN especificat | Verifica la contrasenya; si és un usuari nou, el hash SSHA pot ser incorrecte |
    | **50** | Insufficient Access Rights | `ldap_add: Insufficient access rights` | L'usuari autenticat no té permisos per fer l'operació | Usa `cn=admin` per operacions d'escriptura |
    | **53** | Unwilling To Perform | `ldap_bind: Server is unwilling to perform` | L'usuari no té `userPassword` o està desactivat | Afegeix `userPassword` via `ldapmodify` |
    | **64** | Naming Violation | `ldap_add: Naming violation` | El RDN de l'entrada no coincideix amb l'atribut nomenador | `uid=maria.puig,...` però sense `uid: maria.puig` al LDIF |
    | **65** | Object Class Violation | `ldap_add: Object class violation` | Falta un atribut obligatori per a la objectClass declarada | Revisa quins atributs son obligatoris per a cada objectClass |
    | **66** | Not Allowed On Non-leaf | `ldap_delete: Not allowed on non-leaf` | Intentes eliminar una OU/entrada que té fills | Elimina primer tots els fills |
    | **68** | Already Exists | `ldap_add: Already exists` | Intentes afegir una entrada que ja existeix | Usa `ldapmodify` per modificar-la, o elimina-la i torna a afegir |
    | **-1** | Can't Contact LDAP Server | `ldap_sasl_bind: Can't contact LDAP server` | El servidor no és accessible (slapd aturat, port 389 bloquejat, IP incorrecta) | `systemctl status slapd`, `ss -tulpn \| grep 389`, `ufw status` |

    ## Errors de sintaxi LDIF (no codis LDAP)

    Alguns errors es produeixen **abans** d'enviar la petició al servidor, durant la lectura del fitxer LDIF:

    | Missatge | Causa | Solució |
    |---------|-------|---------|
    | `ldif_read_file: missing value on line N` | Línia sense valor o format `atribut:valor` sense espai | Afegeix l'espai: `atribut: valor` |
    | `ldif_read_file: no lines in LDIF` | Fitxer buit o únicament comentaris | Verifica que el fitxer té contingut |
    | `additional info: value of naming attribute 'uid' is not present in entry` | El RDN (`uid=X`) no té el corresponent atribut `uid: X` al cos de l'entrada | Afegeix `uid: X` al fitxer LDIF |
    | `additional info: no structuralObjectClass operational attribute` | Falta la objectClass estructural principal | Afegeix almenys una objectClass estructural (ex: `inetOrgPerson`) |

    ## Diagnòstic pas a pas

    Quan una operació LDAP falla, segueix aquest ordre:

    ```mermaid
    flowchart TD
        A["Error en una operació LDAP"] --> B{"Codi -1?"}
        B -->|Sí| C["Problema de connectivitat:\nsystemctl status slapd\nss -tulpn | grep 389\nufw status"]
        B -->|No| D{"Codi 49?"}
        D -->|Sí| E["Contrasenya incorrecta:\nverifica la contrasenya\no el hash SSHA"]
        D -->|No| F{"Codi 32?"}
        F -->|Sí| G["DN no existeix:\ncrea les OUs primer\no verifica el DN exacte"]
        F -->|No| H{"Codi 65?"}
        H -->|Sí| I["Falta atribut obligatori:\nrevisa la objectClass\ni els seus atributs requerits"]
        H -->|No| J["Consulta la taula d'errors\namb el codi concret"]

        style A fill:#B71C1C,color:#fff
        style C fill:#1565C0,color:#fff
        style E fill:#E65100,color:#fff
        style G fill:#1B5E20,color:#fff
        style I fill:#6A1B9A,color:#fff
    ```

    ## Activar el log detallat de slapd

    Per a errors difícils de diagnosticar, pots augmentar el nivell de log de `slapd`:

    ```bash
    # Veure els logs de slapd en temps real
    journalctl -u slapd -f

    # Veure els últims 100 missatges
    journalctl -u slapd -n 100

    # Activar el log de depuració (molt verbós, únicament per a diagnòstic)
    sudo slapd -d 256 -F /etc/ldap/slapd.d   # mode interactiu, per a tests
    ```

    ## Casos concrets del laboratori i solucions

    ### "Afegeixo un usuari però `ldapwhoami` retorna error 53"

    Causa: l'usuari s'ha afegit sense `userPassword` al LDIF.

    ```bash
    # Comprova si l'usuari té userPassword
    ldapsearch -x -D "cn=admin,dc=lafita,dc=local" -W \
               -b "dc=lafita,dc=local" "(uid=maria.puig)" userPassword
    # Si no apareix l'atribut userPassword, cal afegir-lo:

    slappasswd   # genera hash
    ```

    ```ldif
    dn: uid=maria.puig,ou=usuaris,dc=lafita,dc=local
    changetype: modify
    add: userPassword
    userPassword: {SSHA}HashGenerat
    ```

    ### "ldapsearch retorna resultats però SSSD no troba l'usuari"

    Causa habitual: SSSD no és configurat correctament (Bloc 6), però si el problema és LDAP:

    ```bash
    # Comprova que els atributs POSIX son presents
    ldapsearch -x -b "dc=lafita,dc=local" "(uid=maria.puig)" \
               uidNumber gidNumber homeDirectory loginShell objectClass
    ```

    Si `uidNumber` o `homeDirectory` no apareixen, l'usuari no té `posixAccount` com a objectClass.

    ### "El homeDirectory apunta a `/home/` en lloc de `/perfils/`"

    ```ldif
    dn: uid=pere.costa,ou=usuaris,dc=lafita,dc=local
    changetype: modify
    replace: homeDirectory
    homeDirectory: /perfils/pere.costa
    ```

    ??? question "Auto-avaluació"

        **1.** `ldapadd` retorna el codi 65 (*Object class violation*) per a un usuari. Quins atributs has d'afegir per solucionar-ho, suposant que uses `inetOrgPerson + posixAccount + shadowAccount`?

        ??? success "Resposta"
            El codi 65 indica que falta algun atribut obligatori. Per a la combinació `inetOrgPerson + posixAccount + shadowAccount`, els atributs obligatoris son: de `inetOrgPerson`: `cn` (Common Name) i `sn` (Surname); de `posixAccount`: `uid`, `uidNumber`, `gidNumber`, `homeDirectory` i `cn` (ja heretat). Revisa el fitxer LDIF i assegura't que tots cinc hi son: `uid`, `cn`, `sn`, `uidNumber`, `gidNumber`, `homeDirectory`. El `loginShell` és tècnicament opcional però molt recomanable.

        **2.** Tens un error -1 (*Can't contact LDAP server*) quan executes `ldapsearch` des del client. Descriu els tres primers passos de diagnòstic.

        ??? success "Resposta"
            (1) **Comprova si `slapd` funciona al servidor**: `systemctl status slapd` al servidor Ubuntu. Si està `inactive` o `failed`, arrenca'l: `sudo systemctl start slapd`. (2) **Comprova que el port 389 escolta**: `ss -tulpn | grep 389` al servidor. Ha d'aparèixer `slapd` escoltant a `0.0.0.0:389`. (3) **Comprova el firewall**: `sudo ufw status` — el port 389/tcp ha d'estar a la llista `ALLOW`. Si el problema persisteix, verifica la connectivitat de xarxa bàsica: `ping 192.168.100.10` des del client.

        **3.** Per quin motiu el codi 50 (*Insufficient Access Rights*) apareix quan intentes afegir usuaris autenticant-te com a un usuari regular en lloc de l'admin?

        ??? success "Resposta"
            OpenLDAP configura per defecte una ACL (*Access Control List*) que únicament permet **escriure** al directori (`ldapadd`, `ldapmodify`, `ldapdelete`) al compte `cn=admin,dc=lafita,dc=local`. Els usuaris regulars del directori (com `uid=maria.puig`) poden, per defecte, llegir-se a ells mateixos (per canviar la seva pròpia contrasenya) i fer cerques bàsiques, però no crear ni eliminar entrades d'altres. El codi 50 és la resposta del servidor quan les ACLs prohibeixen l'operació sol·licitada. Solució: sempre usa `-D "cn=admin,dc=lafita,dc=local"` per a operacions d'escriptura.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 5.3 · Diagnòstic d'errors LDAP

    **Objectiu**: reconèixer i solucionar errors LDAP habituals de forma sistemàtica.

    **Temps estimat**: 20 minuts

    ---

    ### Part A – Provoca i diagnostica errors coneguts

    **Error 32**: intenta afegir un usuari a una OU que no existeix.

    ```bash
    # Primer elimina la OU d'usuaris
    ldapdelete -x -D "cn=admin,dc=lafita,dc=local" -W \
               "uid=maria.puig,ou=usuaris,dc=lafita,dc=local"
    # (elimina tots els usuaris primer si cal)
    ldapdelete -x -D "cn=admin,dc=lafita,dc=local" -W \
               "ou=usuaris,dc=lafita,dc=local"

    # Ara intenta afegir directament un usuari sense la OU
    ldapadd -x -D "cn=admin,dc=lafita,dc=local" -W -f ~/ldif/alumnes.ldif
    # → Ha de retornar error 32
    ```

    Quin és el missatge exacte? Com ho soluciones?

    **Error 49**: intenta autenticar-te amb una contrasenya incorrecta.

    ```bash
    ldapwhoami -x -D "cn=admin,dc=lafita,dc=local" -w contrasenya_incorrecta
    # → Error 49
    ```

    ### Part B – Identifica errors en fitxers LDIF

    Crea un fitxer LDIF intencionalment erroni (falta la línia en blanc entre entrades, o falta un atribut obligatori) i observa quin missatge retorna `ldapadd`.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"LDAP error codes explained troubleshooting guide"`
        - `"OpenLDAP common errors fix tutorial"`
        - `"ldap_bind invalid credentials 49 no such object 32 fix"`
