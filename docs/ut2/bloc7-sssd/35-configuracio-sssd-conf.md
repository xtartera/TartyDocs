---
title: "Configuració de sssd.conf"
tags:
  - ut2
  - sssd
  - diagnostic
---

# :material-shield-account: Configuració de sssd.conf

!!! abstract "Concepte clau"
    `/etc/sssd/sssd.conf` és el fitxer central de SSSD. Conté la URL del servidor LDAP, la base de cerca, i el tipus de proveïdor. Dos errors gairebé universals de primer cop: **oblidar el `chmod 600`** (SSSD no arrenca) i **posar la IP del servidor en lloc de la del laboratori** (SSSD no troba el directori).

=== ":material-notebook-outline: Apunts"

    ## Estructura del fitxer sssd.conf

    `sssd.conf` usa el format INI (seccions entre claudàtors, paràmetres `clau = valor`). Les seccions principals del nostre laboratori:

    | Secció | Contingut |
    |--------|-----------|
    | `[sssd]` | Serveis actius i llista de dominis |
    | `[domain/lafita]` | Configuració del domini LDAP del laboratori |
    | `[nss]` | Opcions per al servei de resolució de noms |
    | `[pam]` | Opcions per al servei d'autenticació |

    ## Configuració completa del laboratori

    ```bash
    sudo nano /etc/sssd/sssd.conf
    ```

    ```ini title="/etc/sssd/sssd.conf"
    [sssd]
    services = nss, pam
    config_file_version = 2
    domains = lafita

    [domain/lafita]
    id_provider = ldap
    auth_provider = ldap
    ldap_uri = ldap://192.168.100.10
    ldap_search_base = dc=lafita,dc=local
    ldap_user_search_base = ou=usuaris,dc=lafita,dc=local
    ldap_group_search_base = ou=grups,dc=lafita,dc=local
    ldap_user_object_class = posixAccount
    ldap_group_object_class = posixGroup
    ldap_tls_reqcert = never
    ldap_id_use_start_tls = false
    cache_credentials = true
    enumerate = true

    [nss]

    [pam]
    ```

    ## Explicació dels paràmetres clau

    | Paràmetre | Valor del laboratori | Per quin motiu |
    |-----------|---------------------|---------------|
    | `domains` | `lafita` | Nom del domini SSSD (no ha de coincidir amb el nom DNS) |
    | `id_provider` | `ldap` | Obté la informació d'usuaris (uid, gid, home) del servidor LDAP |
    | `auth_provider` | `ldap` | Verifica les contrasenyes contra LDAP |
    | `ldap_uri` | `ldap://192.168.100.10` | Adreça IP del servidor OpenLDAP del laboratori |
    | `ldap_search_base` | `dc=lafita,dc=local` | Arrel del directori (igual que `-b` a `ldapsearch`) |
    | `ldap_user_search_base` | `ou=usuaris,...` | Busca usuaris únicament a `ou=usuaris` (no cerca a `ou=proves`) |
    | `ldap_group_search_base` | `ou=grups,...` | Busca grups únicament a `ou=grups` |
    | `ldap_tls_reqcert` | `never` | Desactiva la validació TLS (el laboratori no usa certificats) |
    | `ldap_id_use_start_tls` | `false` | No intenta STARTTLS (connexió sense xifrat, adequada per a lab) |
    | `cache_credentials` | `true` | Guarda credencials a la caché per a funcionament offline |
    | `enumerate` | `true` | Permet `getent passwd` sense filtre (llista tots els usuaris LDAP) |

    !!! info "`ldap_user_search_base` aïlla els usuaris de proves"
        Fixant `ldap_user_search_base = ou=usuaris,dc=lafita,dc=local`, SSSD ignora completament `ou=proves`. Els usuaris `test1`, `test2`, etc. de l'entorn de proves (pàgina 26) no seran visibles per al sistema operatiu. Aquesta és exactament la raó pedagògica per tenir una OU separada de proves.

    ## El pas crític: chmod 600

    !!! danger "SSSD NO arrenca si sssd.conf té permisos incorrectes"
        SSSD verifica que `/etc/sssd/sssd.conf` pertany a `root` i té permisos **exactament** `600` (lectura/escriptura únicament per a root). Si els permisos son `644` o `640`, el servei rebutja iniciar-se amb l'error: `File ownership and permissions check failed`.

        **Sempre que crees o edites `sssd.conf`**:
        ```bash
        sudo chmod 600 /etc/sssd/sssd.conf
        sudo chown root:root /etc/sssd/sssd.conf
        ```

    Per quin motiu SSSD és tan estricte amb els permisos? Perquè `sssd.conf` pot contenir credencials d'administrador en entorns de producció. Si el fitxer fos llegible per altres usuaris, les credencials quedarien exposades.

    ## Aplicació de la configuració

    ```bash
    # 1. Aplica els permisos correctes
    sudo chmod 600 /etc/sssd/sssd.conf
    sudo chown root:root /etc/sssd/sssd.conf

    # 2. Reinicia SSSD per aplicar la nova configuració
    sudo systemctl restart sssd

    # 3. Verifica que el servei funciona
    systemctl status sssd
    ```

    Sortida esperada:
    ```text
    ● sssd.service - System Security Services Daemon
         Loaded: loaded (/lib/systemd/system/sssd.service; enabled)
         Active: active (running) since ...
    ```

    Si l'estat és `failed` en lloc de `active (running)`, consulta els logs:
    ```bash
    journalctl -u sssd -n 30
    ```

    ## Errors de configuració freqüents

    | Error al log | Causa | Solució |
    |-------------|-------|---------|
    | `File ownership and permissions check failed` | Permisos del fitxer incorrectes | `sudo chmod 600 /etc/sssd/sssd.conf` |
    | `[domain/lafita] is not found in config` | El nom del domini a `[sssd] domains =` no coincideix amb `[domain/NOM]` | Assegura't que `domains = lafita` i `[domain/lafita]` usen el mateix nom |
    | `Could not resolve address for ldap://...` | La IP o hostname del servidor LDAP no és accessible | Verifica la IP: `ping 192.168.100.10` |
    | `No such object (32)` | La `ldap_search_base` no existeix al servidor | Verifica que `dc=lafita,dc=local` existeix: `ldapsearch -x -b "" -s base namingContexts` |

    ??? question "Auto-avaluació"

        **1.** Per quin motiu SSSD rebutja iniciar-se si `sssd.conf` té permisos `644`?

        ??? success "Resposta"
            Perquè en entorns de producció, `sssd.conf` pot contenir el paràmetre `ldap_default_authtok` amb la contrasenya de l'admin LDAP en text pla (necessari si el servidor LDAP no permet connexions anònimes). Si el fitxer fos llegible per tots els usuaris (permisos `644`), qualsevol usuari del sistema podria llegir la contrasenya d'admin LDAP. SSSD imposa permisos `600` com a mesura de seguretat obligatòria, independentment de si el fitxer actual conté contrasenyes o no.

        **2.** Per quin motiu especifiquem `ldap_user_search_base = ou=usuaris,dc=lafita,dc=local` en lloc d'usar simplement `ldap_search_base = dc=lafita,dc=local` per a tot?

        ??? success "Resposta"
            Si usem únicament `ldap_search_base = dc=lafita,dc=local`, SSSD cercaria usuaris a **tot** el directori, incloent `ou=proves`. Els usuaris de proves (`uid=test1`, etc.) serien visibles per al sistema operatiu: apareixerien a `getent passwd`, podrien intentar fer login, i autofs podria crear-los directoris home. Limitant la cerca a `ou=usuaris`, aconseguim que els usuaris de proves siguin completament invisibles per al sistema operatiu, tot i existir al directori LDAP.

        **3.** Quina ordre executes per verificar que SSSD ha arrencat correctament després de configurar `sssd.conf`?

        ??? success "Resposta"
            ```bash
            systemctl status sssd
            ```
            La línia `Active: active (running)` confirma que el servei funciona. Si mostra `failed`, cal revisar els logs: `journalctl -u sssd -n 30`. Els errors més habituals son permisos de fitxer incorrectes (`chmod 600`) i IP del servidor LDAP inaccessible (`ping 192.168.100.10`).

=== ":material-pencil-ruler: Activitat"

    ## Activitat 6.2 · Crea i valida sssd.conf

    **Objectiu**: crear la configuració de SSSD per al laboratori i verificar que el servei arrenca.

    **Temps estimat**: 20 minuts

    ---

    ### Part A – Crea sssd.conf

    ```bash
    sudo nano /etc/sssd/sssd.conf
    ```

    Copia el contingut de la configuració del laboratori que veus a la secció *Apunts*.

    ### Part B – Aplica permisos i reinicia

    ```bash
    sudo chmod 600 /etc/sssd/sssd.conf
    sudo chown root:root /etc/sssd/sssd.conf
    sudo systemctl restart sssd
    systemctl status sssd
    ```

    El servei ha d'estar `active (running)`. Si falla, executa:
    ```bash
    journalctl -u sssd -n 30
    ```

    ### Part C – Prova intencional d'error de permisos

    ```bash
    # Canvia els permisos a 644 (incorrecte)
    sudo chmod 644 /etc/sssd/sssd.conf
    sudo systemctl restart sssd
    systemctl status sssd

    # Observa l'error. Ara corregeix-ho:
    sudo chmod 600 /etc/sssd/sssd.conf
    sudo systemctl restart sssd
    systemctl status sssd
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"sssd.conf LDAP configuration Ubuntu tutorial"`
        - `"SSSD chmod 600 permission denied fix"`
        - `"OpenLDAP SSSD integration sssd.conf example"`
