---
title: "SSSD: conceptes i arquitectura"
tags:
  - ut2
  - sssd
  - linux
---

# :material-shield-account: SSSD: conceptes i arquitectura

!!! abstract "Concepte clau"
    **SSSD** (*System Security Services Daemon*) és el servei que connecta Linux amb un directori LDAP. Sense SSSD, Linux no sap qui és `maria.puig`. Amb SSSD configurat, qualsevol ordre del sistema (`id`, `getent`, `su`, `ssh`) pot resoldre usuaris LDAP exactament igual que els usuaris locals.

=== ":material-notebook-outline: Apunts"

    ## Per quin motiu cal SSSD?

    Al Bloc 5 vam poder fer `ldapwhoami -x -D "uid=maria.puig,..."` i verificar que l'usuari existeix al directori. Però si executes:

    ```bash
    id maria.puig
    ```

    obtens:
    ```text
    id: 'maria.puig': no such user
    ```

    Linux no coneix `maria.puig` perquè els usuaris LDAP no estan al fitxer `/etc/passwd`. **SSSD** resol aquest problema: actua de pont entre el sistema operatiu Linux i el directori LDAP, de manera que Linux tracta els usuaris LDAP com si fossin locals.

    ## Arquitectura de SSSD

    ```mermaid
    flowchart TD
        U["Usuari al terminal\nlogin: maria.puig"] --> PAM
        U --> NSS

        subgraph "Sistema Linux"
            PAM["PAM\npam_sss.so\nAutenticació de contrasenya"]
            NSS["NSS\nnss_sss.so\nResolució uid / gid / nom"]
            SSSD["SSSD\nsssd.service\n/etc/sssd/sssd.conf"]
            CACHE["Caché local\n/var/lib/sss/db/"]
        end

        subgraph "Servidor de directori"
            SLAPD["slapd · OpenLDAP\n192.168.100.10:389"]
            DIT["dc=lafita,dc=local\nou=usuaris · ou=grups"]
        end

        PAM -->|pam_sss.so| SSSD
        NSS -->|nss_sss.so| SSSD
        SSSD <-->|"ldap://192.168.100.10"| SLAPD
        SLAPD --- DIT
        SSSD <--> CACHE

    ```

    SSSD té dos rols principals:

    | Rol | Mecanisme | Funció |
    |-----|-----------|--------|
    | **Resolució de noms** | NSS (`nss_sss.so`) | Respon a `id`, `getent passwd`, `getent group` — converteix uid/gid LDAP en noms reconeguts per Linux |
    | **Autenticació** | PAM (`pam_sss.so`) | Verifica la contrasenya quan un usuari fa login (comprova el `userPassword` del directori LDAP) |

    ## La caché: funcionament sense xarxa

    SSSD guarda els resultats de les consultes LDAP a una caché local (`/var/lib/sss/db/`). Avantatges:

    - **Rendiment**: no cal anar al servidor LDAP en cada operació
    - **Disponibilitat offline**: si el servidor LDAP cau momentàniament, els usuaris que ja han fet login poden continuar treballant
    - **Reducció de càrrega**: evita milers de consultes LDAP repetides

    !!! info "La caché pot ser un problema durant la configuració"
        Si modifiques el directori LDAP (afegeixes un usuari, canvies una contrasenya) i `getent` no reflecteix el canvi, és perquè SSSD té el resultat antic a la caché. La solució és `sssctl cache-expire -E` (pàgina 32).

    ## Comparativa: autenticació directa LDAP vs SSSD

    | Aspecte | Autenticació directa LDAP | SSSD |
    |---------|--------------------------|------|
    | **Integració amb Linux** | No — `id maria.puig` no funciona | Sí — el sistema veu l'usuari com a local |
    | **Login via terminal/SSH** | No possible sense configuració extra | Sí, funciona automàticament |
    | **Caché offline** | No | Sí |
    | **Gestió de grups** | Manual | Automàtica via `posixGroup` |
    | **Configuració** | Múltiples fitxers (PAM, NSS, ldap.conf) | Un sol fitxer: `sssd.conf` |
    | **Ús recomanat** | Scripts puntuals d'administració | Integració completa del sistema |

    ## Seqüència del que fareu al Bloc 6

    ```mermaid
    flowchart LR
        A["28\nInstal·lar\nSSSD"] --> B["29\nConfigurar\nsssd.conf"]
        B --> C["30\nActualitzar\nnsswitch.conf"]
        C --> D["31\nVerificar\namb getent i id"]
        D --> E["32\nDiagnòstic\namb sssctl"]
        E --> F["33\nLogin real\nam maria.puig"]

    ```

    !!! tip "Connexió amb UT1"
        A Windows Server, integrar un client al domini Active Directory és equivalent a "unir-se al domini" (*Join Domain*). Linux no té aquest concepte natiu, però SSSD fa la mateixa funció: ensenya al sistema operatiu a consultar un directori central per resoldre usuaris i grups. La diferència és que a Windows ho fas amb un clic (*System Properties → Computer Name → Change*); a Linux ho fas editant `sssd.conf` i `nsswitch.conf`.

    ??? question "Auto-avaluació"

        **1.** Explica per quin motiu `id maria.puig` falla abans de configurar SSSD, tot i que l'usuari existeix al directori LDAP.

        ??? success "Resposta"
            Perquè Linux resol els noms d'usuari consultant el fitxer `/etc/passwd` (i altres fonts configurades a `/etc/nsswitch.conf`). Sense SSSD, el sistema no sap que ha de consultar LDAP. `ldapsearch` funciona perquè és una eina específica per parlar amb servidors LDAP, però les ordres del sistema (`id`, `getent`, `login`) usen el mecanisme NSS, que per defecte només consulta fitxers locals. SSSD afegeix `sss` a NSS com a font addicional d'informació d'usuaris.

        **2.** Quins dos rols té SSSD al sistema Linux? Quin mecanisme usa cadascun?

        ??? success "Resposta"
            (1) **Resolució de noms** via NSS (`nss_sss.so`): quan el sistema pregunta "qui és l'usuari 1001?" o "existeix maria.puig?", NSS delega la consulta a SSSD, que consulta LDAP i retorna el resultat. (2) **Autenticació** via PAM (`pam_sss.so`): quan un usuari intenta fer login, PAM crida SSSD que verifica la contrasenya contra el `userPassword` del directori LDAP. Sense el rol NSS, l'usuari no seria visible al sistema. Sense el rol PAM, el login seria rebutjat tot i que l'usuari existís.

        **3.** Un usuari LDAP fa login correctament a les 9h. A les 10h, el servidor LDAP cau. Pot l'usuari continuar treballant a la sessió oberta? Pot un altre usuari LDAP fer login nou?

        ??? success "Resposta"
            L'usuari que ja té sessió oberta **pot continuar treballant**: la sessió Linux ja està establerta i no depèn de LDAP per operar. Un altre usuari que intenti fer login nou **pot o no pot**, depenent de si SSSD té les credencials a la caché (`cache_credentials = true`). Si ha fet login prèviament i la caché és vàlida, pot autenticar-se offline. Si mai ha fet login abans (no hi ha caché), el login falla fins que el servidor LDAP es restaura.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 6.0 · Reflexió prèvia a la configuració

    **Objectiu**: entendre per quin motiu SSSD és necessari i anticipar els passos de configuració.

    **Temps estimat**: 10 minuts

    ---

    Abans d'instal·lar res, executa les ordres següents al servidor i anota els resultats:

    ```bash
    # Prova 1: Linux coneix maria.puig?
    id maria.puig

    # Prova 2: el directori LDAP la conté?
    ldapsearch -x -b "ou=usuaris,dc=lafita,dc=local" "(uid=maria.puig)" uid cn

    # Prova 3: SSSD ja funciona?
    systemctl status sssd
    ```

    Respon:

    1. La **Prova 1** falla però la **Prova 2** té èxit. Explica per quin motiu.
    2. Quins passos caldrà fer per aconseguir que la Prova 1 també funcioni?

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"SSSD Linux LDAP integration architecture explained"`
        - `"how SSSD works PAM NSS Linux authentication"`
        - `"SSSD vs direct LDAP authentication Linux"`
