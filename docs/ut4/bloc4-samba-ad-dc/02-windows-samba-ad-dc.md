---
title: Clients Windows → Samba-AD DC (domain join)
tags:
  - ut4
  - samba
  - windows
  - active-directory
---

# :material-microsoft-windows: Clients Windows → Samba-AD DC (domain join)

!!! abstract "Concepte clau"
    Un client **Windows 10/11 Pro** pot unir-se al domini Samba-AD DC exactament com ho faria amb un DC de Windows Server. El procés és idèntic: configurar DNS apuntant al DC Samba, verificar resolució i executar el domain join. El client no distingeix entre Windows AD i Samba-AD.

=== ":material-notebook-outline: Apunts"

    ## Prerequisits al client Windows

    | Requisit | Valor | Verificació |
    |---------|-------|------------|
    | DNS primari | IP del DC Samba (`172.16.XXX.10`) | `nslookup libretic.local` |
    | Resolució del DC | `dc1.libretic.local` → IP correcta | `ping dc1.libretic.local` |
    | Connectivitat porta 88 | KDC Kerberos | `Test-NetConnection dc1.libretic.local -Port 88` |
    | Windows 11 Pro/Enterprise | Home no suporta domain join | Comprova a Configuració → Sobre |

    ## Verificació de prerequisits

    ```powershell
    # 1. Configura DNS apuntant al DC Samba
    Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses "172.16.XXX.10"

    # 2. Verifica resolució DNS
    nslookup libretic.local
    nslookup dc1.libretic.local
    nslookup -type=SRV _ldap._tcp.libretic.local

    # 3. Comprova connectivitat als ports clau
    Test-NetConnection dc1.libretic.local -Port 88   # Kerberos
    Test-NetConnection dc1.libretic.local -Port 389  # LDAP
    Test-NetConnection dc1.libretic.local -Port 445  # SMB (SYSVOL)
    ```

    ## Domain Join a Samba-AD DC

    ```powershell
    # Mètode 1: PowerShell
    Add-Computer -DomainName "libretic.local" `
        -Credential (Get-Credential) `
        -Restart

    # Mètode 2: GUI
    # Clic dret a "Aquest PC" → Propietats → Canvia la configuració
    # → Canvia... → Domini: libretic.local
    # → Usuari: Administrator, Password: (password del DC Samba)
    ```

    ## Verificació post-domain-join

    ```powershell
    # Reinicia i inicia sessió com a LIBRETIC\ana (o ana@libretic.local)

    # Comprova l'usuari actual
    whoami
    # LIBRETIC\ana

    # Comprova els grups de domini
    whoami /groups
    # Ha de mostrar: LIBRETIC\tecnics, Domain Users, etc.

    # Verifica la informació d'usuari al domini
    net user ana /domain

    # Verifica que l'equip és al domini
    (Get-WmiObject Win32_ComputerSystem).Domain
    # libretic.local
    ```

    ## Accés a recursos compartits del DC

    Samba-AD DC comparteix `NETLOGON` i `SYSVOL` per defecte:

    ```powershell
    # Explora els recursos del DC
    net view \\dc1.libretic.local

    # Accedeix a SYSVOL (autenticat automàticament per Kerberos)
    explorer \\dc1.libretic.local\sysvol\
    ```

    Per a recursos Samba addicionals (com `[tecnics]`, `[comuna]`), veure pàgina 27.

    ## Diagnòstic de domain join fallida

    | Error | Causa | Solució |
    |-------|-------|---------|
    | `cannot contact the domain` | DNS no resol el domini | `Set-DnsClientServerAddress` al DC Samba |
    | `logon failure` | Contrasenya incorrecta o compte inexistent | Verifica amb `samba-tool user list` |
    | `clock skew too great` | Diferència horària > 5 min | Sincronitza l'hora: `w32tm /resync` |
    | `access denied joining domain` | Quota de comptes d'equip | `samba-tool user setexpiry administrator` |

    !!! warning "Sincronització horària: crític per a Kerberos"
        Kerberos requereix que el rellotge del client i el servidor no difereixi més de **5 minuts**. Si la diferència és major, el domain join falla amb `"clock skew too great"`. Al client Windows: `w32tm /resync /force`. Al DC Samba: `sudo systemctl enable --now systemd-timesyncd`.

    !!! tip "Diferència entre ana@libretic.local i LIBRETIC\ana"
        Tots dos formats son vàlids per a iniciar sessió. El format `LIBRETIC\ana` (NetBIOS) és el tradicional (pre-Windows 2000). El format `ana@libretic.local` (UPN) és el modern. En cas de problemes amb un format, prova l'altre.

    ??? question "Auto-avaluació"
        **1.** Un client Windows no pot fer domain join a Samba-AD DC i mostra `"cannot contact the domain"`. Quins dos passos de verificació fas primer?

        ??? success "Resposta"
            1. `nslookup libretic.local` al client: ha de resoldre a la IP del DC Samba. Si falla, el DNS del client no apunta al DC. Solució: `Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses "172.16.XXX.10"`. 2. `nslookup -type=SRV _ldap._tcp.libretic.local`: ha de retornar el SRV record. Si el DNS resol el domini però no els SRV records, hi ha un problema amb la configuració DNS de Samba (verifica que `SAMBA_INTERNAL` DNS funciona correctament).

        **2.** Per quin motiu Kerberos falla si el rellotge del client difereix més de 5 minuts del DC?

        ??? success "Resposta"
            Kerberos usa **timestamps** (marques de temps) per prevenir atacs de **replay**: un ticket té una finestra de validesa molt estreta (±5 minuts). Si el rellotge del client difereix molt del servidor, els tickets que el client envia ja estaran "expirats" des del punt de vista del KDC, que els rebutjarà amb `clock skew too great`. Aquesta és una mesura de seguretat intencional de Kerberos.

        **3.** Quina diferència hi ha en el `whoami` quan un usuari inicia sessió via pGina (LDAP) versus domain join (Samba-AD)?

        ??? success "Resposta"
            Amb **pGina** (autenticació LDAP sense domain join): `whoami` mostra `NOM-EQUIP\usuari` (compte local temporal creat per pGina). Amb **domain join** a Samba-AD: `whoami` mostra `LIBRETIC\ana` (sessió de domini real). La diferència és fonamental: amb domain join, l'usuari té una identitat de domini reconeguda per tot el domini; amb pGina, és una sessió local aïllada.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.25 · Domain join de Windows al Samba-AD DC

    **Objectiu**: unir un client Windows 10/11 al domini `libretic.local` de Samba-AD DC.
    **Temps estimat**: 25 minuts
    **Prerequisit**: DC Samba operatiu (Activitat 4.23), usuaris creats (Activitat 4.24)

    ---

    ### Pas 1 – Configura DNS al client

    ```powershell
    Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses "172.16.XXX.10"
    nslookup dc1.libretic.local
    nslookup -type=SRV _ldap._tcp.libretic.local
    ```

    ### Pas 2 – Domain join

    ```powershell
    Add-Computer -DomainName "libretic.local" -Credential LIBRETIC\Administrator -Restart
    ```

    ### Pas 3 – Inicia sessió com a usuari de domini

    Reinicia. Inicia sessió com a `LIBRETIC\ana` (contrasenya creada a l'activitat 4.24).

    ### Pas 4 – Verifica

    ```powershell
    whoami
    whoami /groups
    net user ana /domain
    (Get-WmiObject Win32_ComputerSystem).Domain
    ```

    Documenta: apareix `LIBRETIC\tecnics` als grups? Per quin motiu?

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Windows 10 11 join Samba 4 domain"`
        - `"Samba Active Directory domain join Windows client"`
        - `"Add-Computer domain join Samba Linux"`
