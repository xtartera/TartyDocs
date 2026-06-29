---
title: Ubuntu → AD – realmd i realm join
tags:
  - ut4
  - active-directory
  - linux
  - realmd
---

# :material-linux: Ubuntu → AD – realmd i realm join

!!! abstract "Concepte clau"
    **realmd** és l'eina Linux que automatitza la integració amb un domini Active Directory. Detecta el domini via DNS, instal·la els paquets necessaris (`sssd`, `krb5-user`, `adcli`) i executa el **realm join** — l'equivalent al domain join de Windows.

=== ":material-notebook-outline: Apunts"

    ## Paquets necessaris

    ```bash
    sudo apt install -y realmd sssd sssd-tools adcli \
        krb5-user packagekit samba-common-bin oddjob oddjob-mkhomedir
    ```

    | Paquet | Funció |
    |--------|--------|
    | `realmd` | Descobreix el domini i executa el join |
    | `sssd` | Autenticació i NSS contra AD |
    | `adcli` | Crea el compte d'equip a l'AD |
    | `krb5-user` | Implementació Kerberos per a Linux |
    | `oddjob-mkhomedir` | Crea el directori home en el primer login |
    | `samba-common-bin` | Eines Samba (winbind, net) |

    ## Prerequisits de xarxa

    ```bash
    # DNS ha d'apuntar al DC
    resolvectl status   # o cat /etc/resolv.conf

    # Configura si cal (Ubuntu 24.04 amb systemd-resolved)
    # Edita /etc/systemd/resolved.conf:
    [Resolve]
    DNS=172.16.XXX.10
    Domains=ad-cognom.local

    sudo systemctl restart systemd-resolved

    # Verifica resolució
    nslookup ad-cognom.local
    realm discover ad-cognom.local
    ```

    ## Descoberta del domini

    ```bash
    realm discover ad-cognom.local
    ```

    Sortida esperada:

    ```
    ad-cognom.local
      type: kerberos
      realm-name: AD-COGNOM.LOCAL
      domain-name: ad-cognom.local
      configured: no
      server-software: active-directory
      client-software: sssd
      required-package: sssd-tools
      required-package: adcli
      required-package: packagekit
    ```

    Si no mostra res: el DNS no resol el domini. Verifica la configuració DNS.

    ## Unió al domini (realm join)

    ```bash
    # Unió bàsica (com a Administrator)
    sudo realm join ad-cognom.local -U Administrator

    # Unió especificant la OU de destinació
    sudo realm join ad-cognom.local -U Administrator \
        --computer-ou="OU=Equips,OU=OU201,DC=ad-cognom,DC=local"
    ```

    Introdueix la contrasenya del compte Administrator quan es demani.

    ## Verificació del join

    ```bash
    # Verifica que el domini està configurat
    realm list

    # Comprova que l'equip s'ha registrat a l'AD (al DC):
    Get-ADComputer -Filter {Name -eq "UBUNTU-CLIENT"} | Select-Object Name, DistinguishedName
    ```

    Sortida de `realm list`:

    ```
    ad-cognom.local
      type: kerberos
      realm-name: AD-COGNOM.LOCAL
      domain-name: ad-cognom.local
      configured: kerberos-member
      server-software: active-directory
      client-software: sssd
      login-formats: %U@ad-cognom.local
      login-policy: allow-realm-logins
    ```

    ## Primer login amb compte AD

    ```bash
    # Canvia d'usuari a un compte AD
    su - director201@ad-cognom.local

    # O inicia sessió via SSH
    ssh director201@ad-cognom.local@172.16.XXX.20
    # (username@domini@IP_del_client)

    # Verifica identitat
    whoami
    id director201@ad-cognom.local
    ```

    !!! warning "El realm join crea un compte d'equip a l'AD"
        Quan executes `realm join`, `adcli` crea un objecte `Computer` al contenidor `CN=Computers` (o a la OU especificada amb `--computer-ou`). Si vols desfer el join: `sudo realm leave ad-cognom.local`. Això elimina el compte d'equip de l'AD i torna Ubuntu a estat local.

    !!! tip "Format d'usuari per al login"
        Per defecte, `realm join` configura el format `usuari@ad-cognom.local`. Pots usar `director201@ad-cognom.local` al login. Si vols el format `AD-COGNOM\director201` (Windows-style), cal modificar `sssd.conf` (veure pàgina 14).

    ??? question "Auto-avaluació"
        **1.** Quin paquet és responsable de descobrir el domini AD via DNS i executar el join?

        ??? success "Resposta"
            **realmd** (`realm discover` + `realm join`). realmd actua com a orquestrador: descobreix el domini via DNS (buscant els SRV records de `_ldap._tcp.ad-cognom.local`), configura automàticament sssd.conf i krb5.conf, i usa `adcli` per crear el compte d'equip a l'AD durant el join. Sense realmd, hauries de configurar tot manualment.

        **2.** Per quin motiu cal configurar el DNS del client Ubuntu apuntant al DC abans de fer `realm join`?

        ??? success "Resposta"
            `realm discover` usa DNS per trobar el domini: busca els registres `_ldap._tcp.ad-cognom.local` (SRV record) per localitzar el DC. Si el DNS apunta a un servidor extern (com `8.8.8.8`), no trobarà aquests registres interns i el discover fallarà amb `"No such realm found"`. A més, Kerberos (port 88) necessita resoldre el nom del DC per obtenir tickets. El DNS al DC és un prerequisit imprescindible.

        **3.** Quina opció de `realm join` permet col·locar el compte d'equip directament a una OU específica?

        ??? success "Resposta"
            L'opció `--computer-ou="OU=Equips,OU=OU201,DC=ad-cognom,DC=local"`. Sense aquesta opció, el compte d'equip va al contenidor per defecte `CN=Computers`. Especificant la OU, l'equip rebrà les GPOs aplicades a aquella OU des del primer moment (si hi ha GPOs configurades per a equips Linux — tot i que les GPOs de Windows no s'apliquen a Linux; serveix per a organització visual al ADUC).

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.13 · realm join d'Ubuntu a Active Directory

    **Objectiu**: unir un client Ubuntu Desktop al domini AD amb `realm join`.
    **Temps estimat**: 30 minuts
    **Prerequisit**: DC AD operatiu, Ubuntu Desktop 24.04

    ---

    ### Pas 1 – Instal·la els paquets

    ```bash
    sudo apt install -y realmd sssd sssd-tools adcli krb5-user \
        packagekit samba-common-bin oddjob oddjob-mkhomedir
    ```

    ### Pas 2 – Configura el DNS

    Edita `/etc/systemd/resolved.conf` i afegeix:
    ```
    DNS=172.16.XXX.10
    Domains=ad-cognom.local
    ```
    ```bash
    sudo systemctl restart systemd-resolved
    nslookup ad-cognom.local
    ```

    ### Pas 3 – Descobreix el domini

    ```bash
    realm discover ad-cognom.local
    ```

    Documenta la sortida completa.

    ### Pas 4 – Uneix al domini

    ```bash
    sudo realm join ad-cognom.local -U Administrator \
        --computer-ou="OU=Equips,OU=OU201,DC=ad-cognom,DC=local"
    ```

    ### Pas 5 – Verifica i login

    ```bash
    realm list
    id director201@ad-cognom.local
    su - director201@ad-cognom.local
    whoami
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Ubuntu join Active Directory domain realmd sssd"`
        - `"realm join Active Directory Ubuntu 22.04 24.04"`
        - `"Linux realm discover domain controller"`
