---
title: Ubuntu → Samba-AD DC (realm join + sssd)
tags:
  - ut4
  - samba
  - active-directory
  - linux
  - sssd
---

# :material-linux: Ubuntu → Samba-AD DC (realm join + sssd)

!!! abstract "Concepte clau"
    Un client **Ubuntu** s'uneix al domini Samba-AD DC exactament igual que a un DC de Windows: usant `realm join`. Des de la perspectiva del client Linux, Samba-AD és indistingible d'un Active Directory real. SSSD es configura automàticament per a l'autenticació Kerberos.

=== ":material-notebook-outline: Apunts"

    ## El procés és idèntic al d'Active Directory Windows

    Integrar Ubuntu a Samba-AD DC segueix els mateixos passos que per a Windows AD (pàgines 13–16):

    1. Configura DNS apuntant al DC Samba
    2. `realm discover libretic.local`
    3. `realm join libretic.local -U Administrator`
    4. Ajusta `sssd.conf`
    5. Activa `oddjob-mkhomedir`

    ## Prerequisits i instal·lació

    ```bash
    sudo apt install -y realmd sssd sssd-tools adcli \
        krb5-user samba-common-bin oddjob oddjob-mkhomedir

    # Configura DNS al client (apunta al DC Samba)
    # /etc/systemd/resolved.conf:
    # DNS=172.16.XXX.10
    # Domains=libretic.local
    sudo systemctl restart systemd-resolved

    # Verifica
    nslookup libretic.local
    nslookup dc1.libretic.local
    nslookup -type=SRV _ldap._tcp.libretic.local
    ```

    ## Descoberta i unió al domini

    ```bash
    # Descobreix el domini Samba-AD
    realm discover libretic.local
    ```

    Sortida esperada (Samba es presenta com a Active Directory):

    ```
    libretic.local
      type: kerberos
      realm-name: LIBRETIC.LOCAL
      domain-name: libretic.local
      configured: no
      server-software: active-directory
      client-software: sssd
    ```

    ```bash
    # Uneix al domini
    sudo realm join libretic.local -U Administrator
    # Introdueix la contrasenya del compte Administrator del DC Samba
    ```

    ## sssd.conf generat automàticament

    ```bash
    cat /etc/sssd/sssd.conf
    ```

    ```ini
    [sssd]
    domains = libretic.local
    services = nss, pam

    [domain/libretic.local]
    id_provider = ad
    auth_provider = ad
    access_provider = ad
    ad_domain = libretic.local
    krb5_realm = LIBRETIC.LOCAL
    realmd_tags = manages-system joined-with-adcli
    cache_credentials = True
    use_fully_qualified_names = True
    fallback_homedir = /home/%u@%d
    default_shell = /bin/bash
    ```

    ## Ajust de sssd.conf (simplifica el login)

    ```bash
    sudo nano /etc/sssd/sssd.conf
    ```

    ```ini
    use_fully_qualified_names = False
    fallback_homedir = /home/%u
    ```

    ```bash
    sudo systemctl restart sssd
    ```

    ## Activa oddjob-mkhomedir

    ```bash
    sudo systemctl enable --now oddjobd
    sudo pam-auth-update --enable mkhomedir
    ```

    ## Verificació

    ```bash
    # Comprova que l'usuari és visible
    id ana
    # uid=10001(ana) gid=10001(ana) groups=10001(ana),XXXXX(tecnics@libretic.local)

    getent passwd ana

    # Login
    su - ana
    whoami      # ana
    groups      # ana tecnics domain users

    # Via SSH
    ssh ana@172.16.XXX.YYY   # IP del client Ubuntu
    ```

    ## Diferències respecte a Windows AD

    En termes pràctics per al client Ubuntu, no hi ha diferències rellevants:

    | Aspecte | Windows AD | Samba-AD DC |
    |---------|-----------|------------|
    | `realm discover` | `server-software: active-directory` | `server-software: active-directory` |
    | Kerberos | Funciona | Funciona (heimdal/mit integrat) |
    | sssd.conf | Idèntic | Idèntic |
    | `id` / `getent` | Igual | Igual |
    | SSSD logs | Igual | Igual |

    !!! warning "Versió de Samba: 4.x recomanat"
        Samba versions anteriors a 4.x no suporten completament el mode AD DC. Ubuntu 24.04 inclou Samba 4.19+ per defecte. Verifica: `samba --version`.

    !!! tip "wbinfo des del client"
        Des del client Ubuntu unit al domini Samba-AD, pots usar `wbinfo` per verificar la connectivitat al DC:
        ```bash
        wbinfo -P   # Ping al DC via winbind
        wbinfo -u   # Llista usuaris del domini
        ```

    ??? question "Auto-avaluació"
        **1.** Des del punt de vista d'un client Ubuntu, quina diferència hi ha entre unir-se a un DC de Windows Server AD i a un DC Samba-AD?

        ??? success "Resposta"
            Pràcticament **cap diferència**. `realm discover` identifica tots dos com a `server-software: active-directory`. El procés de `realm join`, la configuració de `sssd.conf`, Kerberos, `getent`, `id` i el login funcionen de forma idèntica. Samba-AD DC implementa els mateixos protocols (Kerberos RFC 4120, LDAP, DNS SRV records, SMB) que Windows Server AD, de manera que els clients no noten la diferència.

        **2.** Quin missatge de `realm discover libretic.local` confirma que Samba-AD DC s'ha configurat correctament?

        ??? success "Resposta"
            La línia `server-software: active-directory` confirma que Samba s'ha configurat com a DC compatible amb AD. Si mostres `server-software: samba` o similars, indica un mode diferent (servidor de fitxers). La línia `configured: kerberos-member` (després del join) confirma que el client s'ha unit al domini correctament.

        **3.** Com es verifica que un usuari `ana` del domini Samba-AD pertany al grup `tecnics` des del client Linux?

        ??? success "Resposta"
            `id ana` mostra l'UID, GID i tots els grups de l'usuari, incloent els grups de domini. La sortida hauria de mostrar `groups=... XXXXX(tecnics@libretic.local)`. Alternativament, `groups ana` llista únicament els noms de grup. Si `tecnics` no apareix, verifica amb `sudo samba-tool group listmembers tecnics` al DC per confirmar que `ana` és membre.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.26 · Ubuntu al domini Samba-AD DC

    **Objectiu**: unir un client Ubuntu al domini `libretic.local` de Samba-AD DC i verificar l'autenticació.
    **Temps estimat**: 30 minuts
    **Prerequisit**: DC Samba operatiu amb usuaris (Activitats 4.23, 4.24)

    ---

    ### Pas 1 – Instal·la i configura DNS

    ```bash
    sudo apt install -y realmd sssd sssd-tools adcli krb5-user oddjob oddjob-mkhomedir
    # DNS: apunta al DC Samba (172.16.XXX.10)
    nslookup libretic.local
    ```

    ### Pas 2 – Descobreix i uneix

    ```bash
    realm discover libretic.local
    sudo realm join libretic.local -U Administrator
    ```

    ### Pas 3 – Ajusta sssd.conf

    ```ini
    use_fully_qualified_names = False
    fallback_homedir = /home/%u
    ```
    ```bash
    sudo systemctl restart sssd
    sudo pam-auth-update --enable mkhomedir
    sudo systemctl enable --now oddjobd
    ```

    ### Pas 4 – Verifica

    ```bash
    id ana
    getent passwd ana
    su - ana
    whoami
    groups
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Ubuntu join Samba 4 Active Directory realm join"`
        - `"sssd Samba AD domain Linux client"`
        - `"realm join Samba Ubuntu 24.04"`
