---
title: "getent i id: verificació d'usuaris LDAP"
tags:
  - ut2
  - sssd
  - ldap
---

# :material-check-decagram: getent i id: verificació d'usuaris LDAP

!!! abstract "Concepte clau"
    `getent` (*get entries*) consulta les bases de dades NSS del sistema. Amb SSSD i NSS configurats, `getent passwd maria.puig` ha de retornar la mateixa informació que `ldapsearch` però en el format de `/etc/passwd`. Si `getent` funciona, la integració LDAP→SSSD→NSS és correcta.

=== ":material-notebook-outline: Apunts"

    ## getent: sintaxi i bases de dades

    ```bash
    getent BASE [CLAU]
    ```

    | Base | Consulta | Fitxer equivalent |
    |------|---------|------------------|
    | `passwd` | Usuaris | `/etc/passwd` |
    | `group` | Grups | `/etc/group` |
    | `shadow` | Contrasenyes | `/etc/shadow` |
    | `hosts` | Resolució de noms | `/etc/hosts` + DNS |

    ## Verificació d'un usuari LDAP

    ```bash
    getent passwd maria.puig
    ```

    Sortida esperada:
    ```text
    maria.puig:x:1001:2001:Maria Puig:/perfils/maria.puig:/bin/bash
    ```

    Format de la sortida (idèntic a `/etc/passwd`):

    ```
    uid : contrasenya : UID : GID : GECOS (nom complet) : homeDirectory : loginShell
    maria.puig : x : 1001 : 2001 : Maria Puig : /perfils/maria.puig : /bin/bash
    ```

    La `x` a la posició de contrasenya indica que la contrasenya real és a `/etc/shadow` (o en el nostre cas, verificada per SSSD via LDAP).

    ## Verificació dels tres usuaris del laboratori

    ```bash
    getent passwd maria.puig
    getent passwd pere.costa
    getent passwd anna.valls
    ```

    Sortides esperades:
    ```text
    maria.puig:x:1001:2001:Maria Puig:/perfils/maria.puig:/bin/bash
    pere.costa:x:1002:2001:Pere Costa:/perfils/pere.costa:/bin/bash
    anna.valls:x:1003:2001:Anna Valls:/perfils/anna.valls:/bin/bash
    ```

    ## Llista tots els usuaris LDAP

    ```bash
    # Requereix enumerate = true a sssd.conf
    getent passwd | grep -v ":[0-9]\{1,3\}:[0-9]\{1,3\}:"
    ```

    O més específic: cerca usuaris amb UID ≥ 1000 (usuaris LDAP del laboratori):
    ```bash
    getent passwd | awk -F: '$3 >= 1000 && $3 < 65534'
    ```

    Sortida esperada:
    ```text
    maria.puig:x:1001:2001:Maria Puig:/perfils/maria.puig:/bin/bash
    pere.costa:x:1002:2001:Pere Costa:/perfils/pere.costa:/bin/bash
    anna.valls:x:1003:2001:Anna Valls:/perfils/anna.valls:/bin/bash
    ```

    !!! info "`enumerate = true` és necessari per llistar tots els usuaris"
        Sense `enumerate = true` a `sssd.conf`, `getent passwd` (sense argument) no retorna els usuaris LDAP. Però `getent passwd maria.puig` (amb nom concret) sí que funciona. Per a ús en producció, `enumerate = false` és millor rendiment; per a laboratori, `enumerate = true` facilita la verificació.

    ## Verificació de grups LDAP

    ```bash
    getent group alumnes
    ```

    Sortida esperada:
    ```text
    alumnes:x:2001:maria.puig,pere.costa,anna.valls
    ```

    ```bash
    # Llista tots els grups amb GID ≥ 2000
    getent group | awk -F: '$3 >= 2000'
    ```

    ## La comanda id: visió completa d'un usuari

    `id` mostra l'UID, GID principal i tots els grups als quals pertany un usuari:

    ```bash
    id maria.puig
    ```

    Sortida esperada:
    ```text
    uid=1001(maria.puig) gid=2001(alumnes) groups=2001(alumnes)
    ```

    Si `id` retorna el nom correcte (no únicament el número), significa que tant l'usuari com el grup s'han resolt correctament via SSSD.

    ## Comparativa getent vs ldapsearch

    | Aspecte | `getent passwd maria.puig` | `ldapsearch ... "(uid=maria.puig)"` |
    |---------|--------------------------|-------------------------------------|
    | **Eina** | Comanda del sistema (sempre disponible) | Eina LDAP específica (`ldap-utils`) |
    | **Font de dades** | NSS → SSSD → LDAP (o caché) | Directament al servidor LDAP |
    | **Format de sortida** | Format `/etc/passwd` | Format LDIF amb tots els atributs |
    | **Atributs que mostra** | UID, GID, home, shell | Tots els atributs LDAP |
    | **Indica integració** | Sí — si funciona, NSS+SSSD+LDAP son correctes | No — funciona fins i tot si SSSD no està configurat |
    | **Ús** | Verificació d'integració del sistema | Diagnòstic del directori LDAP |

    ## Diagnòstic: getent falla però ldapsearch funciona

    Si `ldapsearch` retorna l'usuari però `getent` no:

    ```mermaid
    flowchart TD
        A["getent passwd maria.puig\nno retorna res"] --> B{"systemctl status sssd\n= active?"}
        B -->|No| C["Revisa sssd.conf\ni chmod 600\n→ pàgina 29"]
        B -->|Sí| D{"grep sss /etc/nsswitch.conf\nmostra passwd:...sss?"}
        D -->|No| E["Afegeix sss a nsswitch.conf\n→ pàgina 30"]
        D -->|Sí| F{"sssctl config-check\nmostra errors?"}
        F -->|Sí| G["Corregeix els errors\nde sssd.conf\n→ pàgina 32"]
        F -->|No| H["sssctl cache-expire -E\ni torna a provar getent"]

        style A fill:#B71C1C,color:#fff
        style C fill:#1565C0,color:#fff
        style E fill:#1B5E20,color:#fff
        style G fill:#6A1B9A,color:#fff
    ```

    ??? question "Auto-avaluació"

        **1.** `getent passwd maria.puig` retorna `maria.puig:x:1001:2001:Maria Puig:/perfils/maria.puig:/bin/bash`. Identifica cadascun dels camps i explica d'on prové cada valor.

        ??? success "Resposta"
            - `maria.puig` → atribut `uid` de LDAP
            - `x` → marca que la contrasenya s'emmagatzema xifrada (a LDAP és `userPassword: {SSHA}...`)
            - `1001` → atribut `uidNumber` de LDAP (objectClass `posixAccount`)
            - `2001` → atribut `gidNumber` de LDAP (objectClass `posixAccount`)
            - `Maria Puig` → atribut `cn` (*Common Name*) de LDAP
            - `/perfils/maria.puig` → atribut `homeDirectory` de LDAP
            - `/bin/bash` → atribut `loginShell` de LDAP

        **2.** `getent passwd | awk -F: '$3 >= 1000 && $3 < 65534'` retorna únicament l'usuari local que vas crear manualment, però no els usuaris LDAP. Quina és la causa probable?

        ??? success "Resposta"
            La causa més probable és `enumerate = false` a `/etc/sssd/sssd.conf`. Sense `enumerate = true`, SSSD no lliura els usuaris LDAP quan es fa una cerca sense argument (com `getent passwd` sense nom específic). La solució és afegir `enumerate = true` a la secció `[domain/lafita]` de `sssd.conf` i reiniciar SSSD: `sudo systemctl restart sssd`. Alternativament, consultes específiques com `getent passwd maria.puig` funcionen sempre, independentment del valor d'`enumerate`.

        **3.** `id maria.puig` retorna `uid=1001 gid=2001 groups=2001` (sense noms, únicament números). Quina informació indica que SSSD **no** funciona correctament?

        ??? success "Resposta"
            Quan `id` mostra únicament números sense noms (en lloc de `uid=1001(maria.puig) gid=2001(alumnes)`), indica que Linux ha obtingut els números UID/GID però no pot resoldre'ls a noms. Això pot passar si SSSD és parcialment funcional: ha donat la informació d'UID/GID però la resolució inversa (número → nom) falla. La causa habitual és que `sss` falta a la línia `group` de `nsswitch.conf` — el sistema no sap on buscar el nom del grup 2001.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 6.4 · Verifica la integració LDAP amb getent i id

    **Objectiu**: comprovar que els tres usuaris LDAP son visibles per al sistema operatiu.

    **Temps estimat**: 15 minuts

    ---

    ### Part A – Verifica els tres usuaris

    ```bash
    getent passwd maria.puig
    getent passwd pere.costa
    getent passwd anna.valls
    ```

    Cada comanda ha de retornar una línia amb el format de `/etc/passwd`. Comprova que:
    - L'UID és el correcte (1001, 1002, 1003)
    - El `homeDirectory` és `/perfils/USUARI` (no `/home/USUARI`)
    - El `loginShell` és `/bin/bash`

    ### Part B – Verifica el grup

    ```bash
    getent group alumnes
    id maria.puig
    ```

    El grup `alumnes` ha de tenir GID 2001 i els tres usuaris com a membres.

    ### Part C – Llista tots els usuaris LDAP

    ```bash
    getent passwd | awk -F: '$3 >= 1000 && $3 < 65534'
    ```

    Ha de mostrar únicament els tres usuaris LDAP del laboratori.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"getent passwd LDAP users SSSD Linux verification"`
        - `"id command Linux LDAP user groups check"`
        - `"getent group SSSD posixGroup LDAP Ubuntu"`
