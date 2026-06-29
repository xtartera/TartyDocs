---
title: sssd.conf per a Active Directory
tags:
  - ut4
  - active-directory
  - sssd
  - linux
---

# :material-cog: sssd.conf per a Active Directory

!!! abstract "Concepte clau"
    Després del `realm join`, **sssd.conf** és el fitxer de configuració que controla com Ubuntu es comunica amb l'Active Directory. Defineix el backend (`ad`), el format del login, la creació de homes, i els permisos d'accés. `realm join` el genera automàticament, però sovint cal ajustar-lo.

=== ":material-notebook-outline: Apunts"

    ## sssd.conf generat per realm join

    Ubicació: `/etc/sssd/sssd.conf` (permisos: `600`, propietari: `root`)

    Contingut típic generat per `realm join`:

    ```ini
    [sssd]
    domains = ad-cognom.local
    config_file_version = 2
    services = nss, pam

    [domain/ad-cognom.local]
    default_shell = /bin/bash
    krb5_store_password_if_offline = True
    cache_credentials = True
    krb5_realm = AD-COGNOM.LOCAL
    realmd_tags = manages-system joined-with-adcli
    id_provider = ad
    fallback_homedir = /home/%u@%d
    ad_domain = ad-cognom.local
    use_fully_qualified_names = True
    ldap_id_mapping = True
    access_provider = ad
    ```

    ## Paràmetres clau i el seu efecte

    | Paràmetre | Valor típic | Efecte |
    |-----------|------------|--------|
    | `id_provider` | `ad` | Usa l'Active Directory com a backend d'usuaris/grups |
    | `fallback_homedir` | `/home/%u@%d` | Ruta del home dir: p.ex., `/home/director201@ad-cognom.local` |
    | `use_fully_qualified_names` | `True` | El login requereix `usuari@domini`; `False` permet `usuari` soles |
    | `cache_credentials` | `True` | Guarda credencials en caché (permet login offline) |
    | `ldap_id_mapping` | `True` | SSSD genera UIDs/GIDs localment (no cal RFC2307) |
    | `access_provider` | `ad` | Control d'accés via grups AD |

    ## Ajustos habituals

    ### Simplificar el format de login (sense domini)

    Per permetre `director201` en lloc de `director201@ad-cognom.local`:

    ```ini
    [domain/ad-cognom.local]
    use_fully_qualified_names = False
    fallback_homedir = /home/%u
    ```

    ### Limitar l'accés a un grup AD

    Per permetre el login únicament als membres del grup `GRP-Tecnics`:

    ```ini
    [domain/ad-cognom.local]
    access_provider = simple
    simple_allow_groups = GRP-Tecnics@ad-cognom.local
    ```

    ### Canviar el directori home per defecte

    ```ini
    fallback_homedir = /home/%d/%u
    # Crea: /home/ad-cognom.local/director201
    ```

    ## Reiniciar i verificar SSSD

    ```bash
    # Aplica els canvis
    sudo systemctl restart sssd

    # Comprova l'estat
    sudo systemctl status sssd

    # Neteja la caché (necessari si els canvis no prenen efecte)
    sudo sssctl cache-expire -E
    sudo systemctl restart sssd

    # Diagnòstic
    sudo sssctl config-check
    ```

    ## Verificació d'identitat

    ```bash
    # Busca l'usuari a l'AD via SSSD
    id director201@ad-cognom.local

    # Amb use_fully_qualified_names = False
    id director201

    # Sortida esperada:
    # uid=1234567890(director201@ad-cognom.local) gid=1234567890(domain users@ad-cognom.local) groups=...

    # Resolució de nom d'usuari
    getent passwd director201@ad-cognom.local
    ```

    !!! warning "Permisos de sssd.conf"
        El fitxer `/etc/sssd/sssd.conf` ha de tenir permisos **600** (lectura/escriptura únicament per root). Si els permisos són incorrectes, sssd refusa carregar el fitxer i el servei no arrenca. `sudo chmod 600 /etc/sssd/sssd.conf` i `sudo chown root:root /etc/sssd/sssd.conf`.

    !!! tip "Cache SSSD: accelera els logins repetits"
        SSSD guarda en caché les credencials i la informació d'usuaris. Això permet el login offline (sense xarxa) si `cache_credentials = True`. La caché es troba a `/var/lib/sss/db/`. Per buidar-la i forçar una reconsulta a l'AD: `sudo sssctl cache-expire -E`.

    ??? question "Auto-avaluació"
        **1.** Quin efecte té el paràmetre `use_fully_qualified_names = False` a sssd.conf?

        ??? success "Resposta"
            Amb `True` (per defecte), el login requereix el format complet `director201@ad-cognom.local`. Canviant a `False`, l'usuari pot iniciar sessió amb simplement `director201`. Això és més còmode per a l'usuari però pot crear ambigüitats si hi ha usuaris locals i de domini amb el mateix nom (en aquest cas, SSSD usa l'ordre definit a `/etc/nsswitch.conf`).

        **2.** Com es limita l'accés SSH al client Linux únicament als membres d'un grup AD?

        ??? success "Resposta"
            Configurant `access_provider = simple` i `simple_allow_groups = GRP-Tecnics@ad-cognom.local` a la secció `[domain/...]` de `sssd.conf`. Reinicia sssd: `sudo systemctl restart sssd`. Ara únicament els membres del grup `GRP-Tecnics` de l'AD podran iniciar sessió al sistema Linux. Usuaris d'AD que no pertanyin al grup rebran `Access denied`.

        **3.** Quin ordre esborra la caché d'SSSD i força una nova consulta a l'AD?

        ??? success "Resposta"
            `sudo sssctl cache-expire -E` marca totes les entrades de la caché com a expirades. Combinant amb `sudo systemctl restart sssd`, SSSD reconnecta a l'AD i torna a carregar tots els comptes. Útil quan s'ha creat o modificat un usuari a l'AD i el canvi no es reflecteix al client Linux.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.14 · Configuració de sssd.conf per a AD

    **Objectiu**: ajustar sssd.conf per simplificar el login i limitar l'accés per grup.
    **Temps estimat**: 25 minuts
    **Prerequisit**: realm join completat (Activitat 4.13)

    ---

    ### Pas 1 – Explora el sssd.conf generat

    ```bash
    sudo cat /etc/sssd/sssd.conf
    ```

    Documenta els valors actuals de: `fallback_homedir`, `use_fully_qualified_names`, `access_provider`.

    ### Pas 2 – Simplifica el login

    Edita `/etc/sssd/sssd.conf`:

    ```ini
    use_fully_qualified_names = False
    fallback_homedir = /home/%u
    ```

    ```bash
    sudo systemctl restart sssd
    id director201   # Ara sense @domini
    ```

    ### Pas 3 – Limita l'accés al grup GRP-Tecnics

    ```ini
    access_provider = simple
    simple_allow_groups = GRP-Tecnics@ad-cognom.local
    ```

    ```bash
    sudo systemctl restart sssd
    # Prova: director201 (hauria de poder logar)
    # Prova: extern202 (hauria de ser rebutjat, no és a GRP-Tecnics)
    su - director201   # GRP-Tecnics → OK
    su - extern202     # No GRP-Tecnics → Access denied
    ```

    ### Pas 4 – Diagnòstic

    ```bash
    sudo sssctl config-check
    sudo journalctl -u sssd --since "5 min ago"
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"sssd.conf Active Directory Ubuntu configuration"`
        - `"sssd use_fully_qualified_names AD Linux"`
        - `"SSSD simple_allow_groups restrict access Active Directory"`
