---
title: Atributs POSIX
tags:
  - ut2
  - ldap
  - posix
---

# :material-account-details: Atributs POSIX dels usuaris LDAP

!!! abstract "Concepte clau"
    Els **atributs POSIX** (`uidNumber`, `gidNumber`, `homeDirectory`, `loginShell`) són els que permeten que un usuari LDAP pugui iniciar sessió en un sistema Linux. Sense ells, l'usuari existeix al directori però el sistema operatiu no el reconeix.

=== ":material-notebook-outline: Apunts"

    ## Per quin motiu Linux necessita atributs numèrics?

    Linux identifica els usuaris i grups **sempre de forma numèrica** internament. Quan executes `ls -la`, el kernel consulta el UID del fitxer i el tradueix a nom d'usuari via NSS. Si LDAP proporciona `uidNumber: 1001` i `uid: maria.puig`, el sistema pot fer la traducció en els dos sentits.

    !!! tip "Connexió amb UT1"
        A Active Directory, l'equivalent numèric és el **SID** (*Security Identifier*), que Windows usa internament. La diferència és que el SID és un identificador complex i global; el UID POSIX és un simple nombre enter que ha de ser únic dins del sistema.

    ## Atributs obligatoris per a `posixAccount`

    | Atribut | Tipus | Exemple | Descripció |
    |---------|-------|---------|-----------|
    | `uid` | Text | `maria.puig` | Nom d'usuari (equivalent a `/etc/passwd`) |
    | `uidNumber` | Enter ≥ 1000 | `1001` | UID numèric únic al sistema |
    | `gidNumber` | Enter ≥ 1000 | `2001` | GID del grup principal |
    | `homeDirectory` | Ruta absoluta | `/perfils/maria.puig` | Directori personal de l'usuari |
    | `loginShell` | Ruta absoluta | `/bin/bash` | Shell que s'executa en fer login |
    | `cn` | Text | `Maria Puig` | Nom complet (obligatori per `inetOrgPerson`) |

    ## Atributs opcionals habituals

    | Atribut | Exemple | Descripció |
    |---------|---------|-----------|
    | `sn` | `Puig` | Cognoms (obligatori per `inetOrgPerson`) |
    | `mail` | `maria.puig@lafita.local` | Correu electrònic |
    | `telephoneNumber` | `+34 93 000 00 01` | Telèfon |
    | `description` | `Alumna grup A` | Descripció lliure |
    | `userPassword` | `{SSHA}abc123...` | Hash de la contrasenya (genera `slappasswd`) |

    ## Valors concrets del laboratori UT2

    | Usuari | `uid` | `uidNumber` | `gidNumber` | `homeDirectory` |
    |--------|-------|------------|------------|----------------|
    | Maria Puig | `maria.puig` | `1001` | `2001` | `/perfils/maria.puig` |
    | Pere Costa | `pere.costa` | `1002` | `2001` | `/perfils/pere.costa` |
    | Anna Valls | `anna.valls` | `1003` | `2001` | `/perfils/anna.valls` |

    !!! warning "homeDirectory és `/perfils/`, no `/home/`"
        Al laboratori de la UT2, els directoris home van a `/perfils/` (muntat via NFS i autofs al Bloc 7–8), **no** a `/home/`. Si poses `/home/maria.puig`, el perfil mòbil no funcionarà. Comprova sempre aquest valor als fitxers LDIF.

    ## Comparació: usuari LDAP vs usuari local (`/etc/passwd`)

    Un usuari al fitxer `/etc/passwd` d'un sistema Linux té exactament els mateixos camps:

    ```text
    # Format de /etc/passwd:
    # nom:x:UID:GID:nom_complet:home:shell
    maria.puig:x:1001:2001:Maria Puig:/perfils/maria.puig:/bin/bash
    ```

    Comparació directa:

    | Camp `/etc/passwd` | Atribut LDAP | Exemple |
    |-------------------|-------------|---------|
    | `nom` | `uid` | `maria.puig` |
    | `x` (contrasenya) | `userPassword` | `{SSHA}...` |
    | `UID` | `uidNumber` | `1001` |
    | `GID` | `gidNumber` | `2001` |
    | `nom_complet` | `cn` | `Maria Puig` |
    | `home` | `homeDirectory` | `/perfils/maria.puig` |
    | `shell` | `loginShell` | `/bin/bash` |

    LDAP és, en essència, una versió de `/etc/passwd` emmagatzemada en un directori centralitzat accessible per xarxa.

    ## Shells disponibles al servidor

    ```bash
    # Llista les shells vàlides al servidor
    cat /etc/shells
    ```

    Sortida típica:
    ```text
    /bin/sh
    /bin/bash
    /usr/bin/bash
    /bin/rbash
    /usr/bin/rbash
    /usr/bin/sh
    /bin/dash
    /usr/bin/dash
    ```

    Per als usuaris del laboratori, usa sempre `/bin/bash`. Si un usuari ha de tenir accés restringit (no pot executar res arbitrari), pots usar `/bin/rbash` (*restricted bash*) o `/usr/sbin/nologin` per desactivar l'accés interactiu.

    ??? question "Auto-avaluació"

        **1.** Per quin motiu el `uidNumber` dels usuaris LDAP ha de ser **≥ 1000** i no, per exemple, `50`?

        ??? success "Resposta"
            A Linux, els UIDs de l'1 al 999 estan reservats per a **comptes de sistema** (root=0, daemon=1, syslog=104, etc.). Si assignes `uidNumber: 50` a un usuari LDAP, podria coincidir amb un compte de sistema existent al servidor (per exemple, `www-data` té UID 33 a Ubuntu). Quan SSSD integrés l'usuari LDAP al sistema, es produiria una col·lisió de UID i el comportament seria impredictible. A Ubuntu, els UIDs d'usuaris humans comencen a 1000 (el primer usuari creat durant la instal·lació rep UID 1000). Per a LDAP, convé usar 1001+ per no col·lisionar amb aquest usuari local.

        **2.** Quina és la diferència entre l'atribut `uid` i l'atribut `uidNumber`?

        ??? success "Resposta"
            `uid` és el **nom d'usuari en text** (ex: `maria.puig`) — és el que l'usuari escriu per iniciar sessió i el que apareix als permisos de fitxers. `uidNumber` és el **número enter** intern que Linux usa internament per a les operacions de sistema de fitxers i control d'accés. Quan executes `ls -la`, el kernel veu `uidNumber: 1001` i consulta NSS (via SSSD) per saber que correspon a `uid: maria.puig`. Tots dos han de ser únics i estar sincronitzats.

        **3.** Un alumne crea un usuari LDAP amb `homeDirectory: /home/pere.costa`. Quan s'integri amb SSSD i autofs (Bloc 6–8), quin problema apareixerà?

        ??? success "Resposta"
            Al laboratori de UT2, els directoris home dels usuaris LDAP estan a `/perfils/` (NFS exportat des del servidor, muntat dinàmicament per autofs). Si `homeDirectory` apunta a `/home/pere.costa`, el sistema intentarà muntar el perfil a `/home/` en lloc de `/perfils/`. Com que autofs espera que el prefix sigui `/perfils/`, no farà cap muntatge, el directori home no existirà, i l'usuari no podrà iniciar sessió correctament (o iniciarà sessió a un directori temporal). Cal corregir l'atribut: `ldapmodify` amb `changetype: modify` i `replace: homeDirectory`.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.1 · Identificació d'atributs POSIX

    **Objectiu**: preparar les dades dels atributs POSIX per als tres usuaris del laboratori.

    **Temps estimat**: 10 minuts (preparació, sense ordinador)

    ---

    ### Part A – Completa la taula d'atributs

    Per a l'usuari `anna.valls`, omple tots els atributs necessaris:

    | Atribut | Valor |
    |---------|-------|
    | `dn` | ? |
    | `objectClass` (tots 3) | ? |
    | `uid` | ? |
    | `uidNumber` | ? |
    | `gidNumber` | ? |
    | `cn` | ? |
    | `sn` | ? |
    | `homeDirectory` | ? |
    | `loginShell` | ? |

    ### Part B – Comprova les shells del servidor

    ```bash
    cat /etc/shells
    ```

    Quines shells estan disponibles? `/bin/bash` hi és?

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"POSIX attributes LDAP uidNumber gidNumber explained"`
        - `"Linux UID GID user system explained passwd file"`
        - `"OpenLDAP posixAccount attributes tutorial"`
