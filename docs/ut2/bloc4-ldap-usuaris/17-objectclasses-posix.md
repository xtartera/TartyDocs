---
title: objectClasses POSIX
tags:
  - ut2
  - ldap
  - posix
---

# :material-layers-triple: objectClasses dels usuaris LDAP

!!! abstract "Concepte clau"
    Una **objectClass** defineix quins atributs pot (o ha de) tenir una entrada LDAP. Un usuari de laboratori combina tres objectClasses: `inetOrgPerson` (dades personals), `posixAccount` (compte Linux) i `shadowAccount` (contrasenya). Entendre per quin motiu cal cada una és clau per no cometre errors als fitxers LDIF.

=== ":material-notebook-outline: Apunts"

    ## Jerarquia d'objectClasses

    Les objectClasses s'hereten en cadena. `inetOrgPerson` ja conté les anteriors:

    ```mermaid
    graph TD
        top["top\n(abstract)"] --> person["person\ncn, sn obligatoris"]
        person --> orgPerson["organizationalPerson\n+ title, ou..."]
        orgPerson --> inetOrg["inetOrgPerson\n+ uid, mail, telephoneNumber..."]
        top --> posix["posixAccount\nuidNumber, gidNumber,\nhomeDirectory, loginShell"]
        top --> shadow["shadowAccount\nuserPassword, shadowLastChange..."]
        top --> posixG["posixGroup\ngidNumber, memberUid"]

    ```

    ## Les tres objectClasses dels usuaris UT2

    ### `inetOrgPerson` — dades personals

    | Atribut | Obligatori? | Exemple |
    |---------|------------|---------|
    | `cn` | Sí | `Maria Puig` |
    | `sn` | Sí | `Puig` |
    | `uid` | No (però necessari) | `maria.puig` |
    | `mail` | No | `maria.puig@lafita.local` |

    ### `posixAccount` — compte del sistema Linux

    | Atribut | Obligatori? | Exemple |
    |---------|------------|---------|
    | `uid` | Sí | `maria.puig` |
    | `uidNumber` | Sí | `1001` |
    | `gidNumber` | Sí | `2001` |
    | `homeDirectory` | Sí | `/perfils/maria.puig` |
    | `loginShell` | No (però recomanat) | `/bin/bash` |
    | `cn` | Sí (ja heretat) | `Maria Puig` |

    !!! warning "Atributs obligatoris de `posixAccount`"
        Si en un fitxer LDIF oblides algun dels obligatoris (`uid`, `uidNumber`, `gidNumber`, `homeDirectory`, `cn`), `ldapadd` retorna `ldap_add: Object class violation (65)`. Revisa sempre que tots cinc siguin presents.

    ### `shadowAccount` — gestió de contrasenya

    | Atribut | Obligatori? | Exemple |
    |---------|------------|---------|
    | `userPassword` | No (però necessari) | `{SSHA}abc...` |
    | `shadowLastChange` | No | `19900` (dies des de 1970-01-01) |
    | `shadowMax` | No | `99999` (dies màxims de validesa) |
    | `shadowWarning` | No | `7` (dies d'avís abans de caducitat) |

    Per al laboratori, únicament usarem `userPassword`. Els camps de caducitat els deixarem buits.

    ## La objectClass per a grups: `posixGroup`

    Els grups LDAP que Linux reconeix usen `posixGroup`:

    | Atribut | Obligatori? | Exemple |
    |---------|------------|---------|
    | `cn` | Sí | `alumnes` |
    | `gidNumber` | Sí | `2001` |
    | `memberUid` | No (però necessari) | `maria.puig` (repetit per cada membre) |

    Exemple complet d'una entrada de grup:
    ```ldif
    dn: cn=alumnes,ou=grups,dc=lafita,dc=local
    objectClass: posixGroup
    cn: alumnes
    gidNumber: 2001
    memberUid: maria.puig
    memberUid: pere.costa
    memberUid: anna.valls
    ```

    !!! info "memberUid referencia el `uid`, no el DN"
        A diferència d'AD (on els membres d'un grup s'especifiquen pel seu DN complet), `posixGroup` usa l'atribut `uid` en text pla. Si l'usuari s'anomena `maria.puig` (atribut `uid`), el membre del grup ha de ser `memberUid: maria.puig`.

    ## Combinació d'objectClasses en una entrada d'usuari

    Un usuari típic del laboratori combina les tres:

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
    userPassword: {SSHA}HASH_AQUI
    ```

    ## Per quin motiu cal `top` implícitament?

    Totes les objectClasses hereten de `top` (la raíz de la jerarquia). No cal declarar-la explícitament perquè totes les altres ja hi hereten. Si veus fitxers LDIF antics amb `objectClass: top` explícita, és redundant però no causa errors.

    ??? question "Auto-avaluació"

        **1.** Intentes afegir un usuari amb `objectClass: posixAccount` però sense `objectClass: inetOrgPerson`. Quins atributs no podràs usar?

        ??? success "Resposta"
            Sense `inetOrgPerson` no podràs usar atributs com `sn` (cognoms), `mail`, `telephoneNumber`, ni molts altres atributs de dades personals. A més, la combinació `posixAccount` sense `inetOrgPerson` és inusual i pot crear conflictes: `posixAccount` té `cn` obligatòria, però sense la jerarquia `person > organizationalPerson > inetOrgPerson`, alguns servidors LDAP estrictes poden rebutjar l'entrada per l'estructura d'herència d'objectClasses. La combinació estàndard és sempre `inetOrgPerson` + `posixAccount` + `shadowAccount`.

        **2.** Quina és la diferència entre `memberUid` de `posixGroup` i com AD gestiona la pertinença a grups?

        ??? success "Resposta"
            `posixGroup` usa `memberUid` amb el **valor text del `uid`** (`memberUid: maria.puig`). Active Directory usa l'atribut `member` amb el **DN complet** de l'usuari (`member: CN=Maria Puig,OU=Alumnes,DC=lafita,DC=local`). Usar UIDs és més simple però menys robust: si canvies el nom d'usuari (`uid`) d'una persona, cal actualitzar manualment `memberUid` a tots els grups on sigui membre. AD, usant DNs, actualitza automàticament les referències quan es reanomena un objecte.

        **3.** Explica per quin motiu un usuari pot pertànyer a múltiples objectClasses a la vegada, quan normalment els objectes d'un sistema informàtic pertanyen a una sola classe.

        ??? success "Resposta"
            LDAP usa el concepte de **classes estructurals i auxiliars**: `inetOrgPerson` és l'objectClass estructural (defineix el "tipus principal" de l'entrada), mentre que `posixAccount` i `shadowAccount` actuen com a classes auxiliars que afegeixen atributs addicionals. Aquesta arquitectura permet combinar atributs de múltiples estàndards (RFC 2798 per a `inetOrgPerson`, RFC 2307 per a POSIX) sense redefinir tot el model. És equivalent a les interfaces en programació orientada a objectes: una classe pot implementar múltiples interfícies alhora.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.2 · Identifica objectClasses en una entrada LDIF

    **Objectiu**: donat un fitxer LDIF, identificar quines objectClasses i atributs obligatoris hi ha.

    **Temps estimat**: 10 minuts (teòric)

    ---

    ### Part A – Analitza aquesta entrada LDIF

    ```ldif
    dn: uid=joan.garcia,ou=usuaris,dc=lafita,dc=local
    objectClass: inetOrgPerson
    objectClass: posixAccount
    uid: joan.garcia
    cn: Joan Garcia
    sn: Garcia
    uidNumber: 1004
    gidNumber: 2001
    homeDirectory: /perfils/joan.garcia
    loginShell: /bin/bash
    ```

    Preguntes:
    1. Quines objectClasses hi ha?
    2. Quina objectClass hi falta per poder establir contrasenya?
    3. Quin atribut obligatori de `posixAccount` falta?

    ### Part B – Identifica l'atribut erroni

    ```ldif
    dn: cn=professors,ou=grups,dc=lafita,dc=local
    objectClass: posixGroup
    cn: professors
    gidNumber: 3001
    member: uid=joan.garcia,ou=usuaris,dc=lafita,dc=local
    ```

    Quin error hi ha a l'atribut de pertinença al grup? Com s'hauria d'escriure correctament?

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"LDAP objectClass explained inetOrgPerson posixAccount"`
        - `"OpenLDAP schema objectclass auxiliary structural"`
        - `"posixGroup memberUid LDAP group tutorial"`
