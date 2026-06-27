---
title: Estructura de perfils mòbils Linux
tags:
  - ut2
  - perfils
  - linux
---

# :material-home-account: Estructura de perfils mòbils Linux

!!! abstract "Concepte clau"
    Un **perfil mòbil** (*roaming profile*) permet que un usuari trobi el seu directori home — amb tots els seus fitxers — independentment de quin client usi per fer login. A Linux, això s'aconsegueix combinant LDAP (identitat), SSSD (integració), NFS (fitxers per xarxa) i autofs (muntatge automàtic). El Bloc 8 construeix la peça final d'aquesta pila.

=== ":material-notebook-outline: Apunts"

    ## Què és un perfil mòbil?

    Sense perfils mòbils, el directori home d'un usuari existeix únicament al client on va fer login per primera vegada. Si l'usuari canvia de client, comença de zero — sense els seus fitxers, configuració ni historial.

    Amb perfils mòbils:
    - **`maria.puig`** fa login al **client A** → troba `/perfils/maria.puig` amb tots els seus fitxers
    - **`maria.puig`** fa login al **client B** → troba exactament el mateix `/perfils/maria.puig`
    - Els fitxers son els mateixos perquè resideixen al **servidor**, no al client

    !!! tip "Connexió amb UT1"
        A Windows Server (UT1), els perfils mòbils s'anomenen *Roaming Profiles* i s'activen amb una política de grup (GPO) que apunta el perfil de l'usuari a una carpeta compartida SMB (`\\servidor\perfils$\%username%`). A Linux, el mecanisme és equivalent: LDAP apunta el `homeDirectory` a `/perfils/usuari` (en comptes d'`/home/usuari`), NFS exporta `/perfils` i autofs fa el muntatge automàtic.

    ## Els 5 components de la pila completa

    ```mermaid
    flowchart TD
        LDAP["1. OpenLDAP\nusuari: maria.puig\nuid=1001\nhomeDirectory: /perfils/maria.puig"] --> SSSD
        SSSD["2. SSSD + NSS + PAM\nresol maria.puig → UID 1001\nautentica contrasenya"] --> PAM
        PAM["3. Login (su / ssh)\nPAM verifica credencials\nobre sessió a /perfils/maria.puig"] --> AUTOFS
        AUTOFS["4. autofs\ndetecta accés a /perfils/maria.puig\nmunta NFS automàticament"] --> NFS
        NFS["5. NFS\n192.168.100.10:/perfils/maria.puig\n→ /perfils/maria.puig al client"]

        style LDAP fill:#1565C0,color:#fff
        style SSSD fill:#6A1B9A,color:#fff
        style PAM fill:#4A148C,color:#fff
        style AUTOFS fill:#1B5E20,color:#fff
        style NFS fill:#E65100,color:#fff
    ```

    ## Estructura de directoris al servidor

    Al servidor (`192.168.100.10`), la carpeta `/perfils/` conté un subdirectori per a cada usuari LDAP:

    ```text
    /perfils/
    ├── maria.puig/          (propietat: 1001:2001, permisos: 700)
    │   ├── .bashrc
    │   ├── .bash_history
    │   └── documents/
    ├── pere.costa/           (propietat: 1002:2001, permisos: 700)
    └── anna.valls/           (propietat: 1003:2001, permisos: 700)
    ```

    Cada subdirectori és propietat de l'usuari corresponent (UID LDAP) i inaccessible per als altres usuaris (permisos 700).

    ## El paper de homeDirectory a LDAP

    L'atribut `homeDirectory` a LDAP és el que connecta la identitat de l'usuari amb la seva carpeta de perfil:

    ```ldif
    dn: uid=maria.puig,ou=usuaris,dc=lafita,dc=local
    ...
    homeDirectory: /perfils/maria.puig
    loginShell: /bin/bash
    ```

    Quan `maria.puig` fa login:
    1. PAM obté el `homeDirectory` de LDAP via SSSD: `/perfils/maria.puig`
    2. autofs intercepta l'accés a `/perfils/maria.puig` i munta el directori via NFS
    3. La sessió s'obre al directori home correcte

    **El client no té còpia local dels fitxers** — accedeix directament al servidor via NFS en temps real.

    ## Flux complet del login amb perfil mòbil

    ```mermaid
    sequenceDiagram
        participant U as Usuari (client)
        participant PAM as PAM
        participant SSSD as SSSD
        participant LDAP as OpenLDAP
        participant AUTOFS as autofs
        participant NFS as NFS (servidor)

        U->>PAM: login: maria.puig / contrasenya
        PAM->>SSSD: autentica maria.puig
        SSSD->>LDAP: bind: uid=maria.puig, contrasenya
        LDAP-->>SSSD: bind OK + homeDirectory=/perfils/maria.puig
        SSSD-->>PAM: autenticació OK
        PAM->>AUTOFS: accedeix a /perfils/maria.puig
        AUTOFS->>NFS: munta 192.168.100.10:/perfils/maria.puig
        NFS-->>AUTOFS: sistema de fitxers muntat
        AUTOFS-->>PAM: /perfils/maria.puig disponible
        PAM-->>U: sessió oberta a /perfils/maria.puig
    ```

    ## Estat actual vs objectiu del Bloc 8

    Al final del Bloc 6, tenies directoris `/perfils/` creats manualment al servidor. Al Bloc 7, has configurat NFS per exportar-los. Al Bloc 8:

    | Cosa | Bloc 6 | Bloc 8 (final) |
    |------|--------|----------------|
    | `/perfils/` al servidor | Creat manualment | Exportat per NFS |
    | Accés al client | No hi havia (tot local) | Muntat automàticament per autofs |
    | Login des de client 2 | Falla (directori no existeix) | Funciona (perfil mòbil) |
    | Crear home manualment | Sí, cada vegada | No cal — autofs ho fa |

    ??? question "Auto-avaluació"

        **1.** Quin atribut LDAP indica al sistema on és el directori home d'un usuari? On es va definir aquest atribut?

        ??? success "Resposta"
            L'atribut `homeDirectory` (de l'objectClass `posixAccount`) indica la ruta del directori home. Es va definir al LDIF de creació d'usuaris al Bloc 4 (pàgina 19): `homeDirectory: /perfils/maria.puig`. SSSD llegeix aquest atribut de LDAP i el proporciona al sistema operatiu quan un procés consulta la informació de l'usuari.

        **2.** Sense autofs, com hauria de configurar-se el client perquè `maria.puig` pogués fer login i trobar el seu directori home? Quins inconvenients té?

        ??? success "Resposta"
            Sense autofs, caldria muntar `/perfils` manualment o via `/etc/fstab` al client. Inconvenients: (1) el muntatge és permanent i ocupa recursos de xarxa fins i tot quan cap usuari és actiu; (2) si el servidor NFS cau, el client pot quedar bloquejat intentant accedir a un punt de muntatge "penjat" (*stale mount*); (3) cal configurar `/etc/fstab` en cada client manualment. autofs resol els tres problemes: munta sota demanda, desmunta automàticament en inactivitat i la configuració és centralitzada.

        **3.** Per quin motiu els permisos de `/perfils/maria.puig` son 700 i no 755?

        ??? success "Resposta"
            Permisos 700 (`rwx------`) signifiquen que únicament el propietari (UID 1001, `maria.puig`) pot llegir, escriure i executar contingut dins del directori. Amb permisos 755, `pere.costa` (o qualsevol usuari del sistema) podria llistar i llegir els fitxers de `maria.puig`. Un directori home és privat per definició — conté fitxers de configuració, documents personals i potencialment credencials. Els permisos 700 garanteixen l'aïllament entre usuaris.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 8.1 · Analitza l'estructura de perfils del laboratori

    **Objectiu**: entendre l'estructura completa de la pila de perfils mòbils.

    **Temps estimat**: 10 minuts

    ---

    ### Part A – Verifica la base

    Al servidor, comprova l'estat actual de `/perfils/`:

    ```bash
    ls -la /perfils/
    ```

    Confirma que existeixen els tres subdirectoris amb propietats UID:GID correctes (1001:2001, 1002:2001, 1003:2001).

    ### Part B – Omple el diagrama de la pila

    Per a cada component, indica quin fitxer de configuració clau s'ha configurat en blocs anteriors:

    | Component | Fitxer de configuració |
    |-----------|----------------------|
    | OpenLDAP | ? |
    | SSSD | ? |
    | NFS (exportació) | ? |
    | autofs (Bloc 8) | ? (pendent) |

    ### Part C – Reflexió

    Explica per quin motiu `homeDirectory: /perfils/maria.puig` (en comptes de `/home/maria.puig`) és important per a l'arquitectura de perfils mòbils del laboratori.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Linux roaming profiles LDAP NFS autofs explained"`
        - `"homeDirectory LDAP posixAccount Linux home directory"`
        - `"NFS autofs home directory Linux setup overview"`
