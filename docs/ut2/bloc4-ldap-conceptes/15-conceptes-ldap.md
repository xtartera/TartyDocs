---
title: Conceptes LDAP
tags:
  - ut2
  - ldap
  - active-directory
---

# :material-account-key: Conceptes LDAP

!!! abstract "Concepte clau"
    **LDAP** (*Lightweight Directory Access Protocol*) és un protocol estàndard per accedir a un **directori** — una base de dades jeràrquica optimitzada per a consultes d'autenticació i informació d'usuaris. Active Directory (UT1) és una implementació de LDAP; OpenLDAP és l'equivalent de codi obert per a Linux.

=== ":material-notebook-outline: Apunts"

    ## Què és un directori?

    Un **directori** és un tipus especial de base de dades, optimitzat per a **moltes lectures i poques escriptures**. Es comporta com un arbre jeràrquic on cada node és una entrada (objecte) amb atributs.

    A la UT1, el **Active Directory Domain Services** era el directori de Windows. OpenLDAP és l'equivalent per a sistemes Linux i mixtos.

    !!! tip "Connexió amb UT1"
        Active Directory **és** LDAP (més Kerberos, més DNS, més GPO). Quan a la UT1 configuraves usuaris a l'AD, internament el DC emmagatzemava les dades en format LDAP. OpenLDAP és exactament el mateix protocol, sense la capa gràfica de Windows.

    ## L'arbre LDAP: DIT

    El directori s'organitza com un **DIT** (*Directory Information Tree*):

    ```mermaid
    graph TD
        A["dc=lafita,dc=local"] --> B["ou=usuaris"]
        A --> C["ou=grups"]
        A --> D["cn=admin"]
        B --> E["uid=maria.puig"]
        B --> F["uid=pere.costa"]
        B --> G["uid=anna.valls"]
        C --> H["cn=alumnes"]

    ```

    ## Components del DN (Distinguished Name)

    Cada entrada de l'arbre s'identifica amb un **DN** (*Distinguished Name*) únic:

    ```text
    uid=maria.puig,ou=usuaris,dc=lafita,dc=local
    ```

    | Component | Significat | Exemple |
    |-----------|-----------|---------|
    | `dc=` | *Domain Component* — un fragment del nom de domini | `dc=lafita`, `dc=local` |
    | `ou=` | *Organizational Unit* — contenidor lògic de grups d'objectes | `ou=usuaris`, `ou=grups` |
    | `cn=` | *Common Name* — nom d'un objecte (grup, recurs, admin) | `cn=admin`, `cn=alumnes` |
    | `uid=` | *User ID* — identificador únic d'un usuari | `uid=maria.puig` |

    !!! info "Llegir el DN de dreta a esquerra"
        El DN es llegeix de dreta a esquerra, de més general a més específic: primer el domini (`dc=lafita,dc=local`), després la unitat organitzativa (`ou=usuaris`), finalment l'entrada concreta (`uid=maria.puig`). És com una adreça postal: país → ciutat → carrer → número.

    ## Objectes i objectClasses

    Cada entrada LDAP pertany a una o més **objectClasses** (classes d'objecte) que defineixen quins atributs pot tenir:

    | objectClass | Tipus d'objecte | Atributs principals |
    |-------------|----------------|---------------------|
    | `organizationalUnit` | Contenidor OU | `ou` |
    | `inetOrgPerson` | Persona/usuari (dades personals) | `cn`, `sn`, `mail`, `uid` |
    | `posixAccount` | Compte del sistema Unix | `uid`, `uidNumber`, `gidNumber`, `homeDirectory`, `loginShell` |
    | `posixGroup` | Grup del sistema Unix | `cn`, `gidNumber`, `memberUid` |
    | `shadowAccount` | Gestió de contrasenya (caducitat) | `userPassword`, `shadowLastChange` |

    !!! tip "objectClass és acumulatiu"
        Un usuari pot tenir múltiples objectClasses a la vegada. A la UT2 crearàs usuaris amb `inetOrgPerson` + `posixAccount` + `shadowAccount` alhora, per tenir tant les dades personals com els atributs de sistema Unix necessaris per fer login.

    ## Atributs clau dels usuaris LDAP

    | Atribut | Exemple | Funció |
    |---------|---------|--------|
    | `uid` | `maria.puig` | Nom d'usuari (text) |
    | `uidNumber` | `1001` | UID numèric del sistema |
    | `gidNumber` | `2001` | GID del grup principal |
    | `cn` | `Maria Puig` | Nom complet |
    | `sn` | `Puig` | Cognoms |
    | `homeDirectory` | `/perfils/maria.puig` | Directori home |
    | `loginShell` | `/bin/bash` | Shell per defecte |
    | `userPassword` | `{SSHA}...` | Hash de la contrasenya (SSHA) |

    ??? question "Auto-avaluació"

        **1.** Quin és el DN complet de l'usuari `pere.costa` a l'arbre LDAP del laboratori?

        ??? success "Resposta"
            `uid=pere.costa,ou=usuaris,dc=lafita,dc=local`

            Components: `uid=pere.costa` (identificador de l'usuari) + `ou=usuaris` (unitat organitzativa on es troba) + `dc=lafita,dc=local` (domini base).

        **2.** Per quin motiu LDAP és "lightweight" (lleuger) comparant-lo amb una base de dades relacional com MySQL?

        ??? success "Resposta"
            LDAP és "lleuger" respecte al DAP original (*Directory Access Protocol*, X.500) que era molt més complex i pesat. Respecte a SQL: LDAP no suporta joins, transaccions complexes ni escriptures massives, però és molt eficient en lectures i autenticació. Un servidor LDAP pot respondre milers de consultes d'autenticació per segon amb recursos mínims. La "lleugeresa" és en complexitat de protocol i consum de recursos, no en funcionalitats generals de base de dades.

        **3.** Explica per quin motiu un usuari LDAP necessita la objectClass `posixAccount` per poder iniciar sessió en un sistema Linux.

        ??? success "Resposta"
            Linux identifica els usuaris numèricament: per iniciar sessió, el sistema necessita conèixer el `uidNumber`, el `gidNumber`, el `homeDirectory` (on es crearà la sessió) i el `loginShell` (quin intèrpret d'ordres s'executarà). Aquests atributs estan definits per l'estàndard **POSIX** i els proporciona la objectClass `posixAccount`. Sense ella, l'usuari pot existir a LDAP per a altres usos (autenticació web, per exemple), però no pot iniciar una sessió en un terminal Linux.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.1 · Identifica els components DN del laboratori

    **Objectiu**: comprendre l'estructura de l'arbre LDAP del laboratori abans d'instal·lar res.

    **Temps estimat**: 15 minuts (teòric, sense ordinador)

    ---

    ### Part A – Construeix els DN

    Donats els elements del laboratori, escriu el DN complet per a cada cas:

    | Objecte | DN complet |
    |---------|-----------|
    | L'arrel del domini | `dc=lafita,dc=local` |
    | La OU d'usuaris | ? |
    | L'administrador LDAP | ? |
    | L'usuari `anna.valls` | ? |
    | El grup `alumnes` | ? |

    ### Part B – Identifica els atributs

    Per a l'usuari `pere.costa` (UID=1002, GID=2001), quins valors tindrien els atributs:
    - `uidNumber` →
    - `homeDirectory` →
    - `loginShell` →
    - `objectClass` (enumera'ls tots els que necessitarà per fer login) →

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"LDAP explained beginners tutorial directory service"`
        - `"LDAP vs Active Directory difference comparison"`
        - `"OpenLDAP tutorial Ubuntu distinguished name DN explained"`
