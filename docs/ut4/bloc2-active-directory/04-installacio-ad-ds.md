---
title: Instal·lació AD DS – Windows Server 2022
tags:
  - ut4
  - active-directory
  - installacio
---

# :material-server-plus: Instal·lació AD DS – Windows Server 2022

!!! abstract "Concepte clau"
    Instal·lar **AD DS** (Active Directory Domain Services) a Windows Server 2022 implica tres fases: configurar la IP estàtica, afegir el rol AD DS via Server Manager, i **promocionar** el servidor a Domain Controller amb `dcpromo` o l'assistent GUI.

=== ":material-notebook-outline: Apunts"

    ## Prerequisits de la instal·lació

    Abans de promoure el servidor a DC:

    | Requisit | Valor recomanat |
    |---------|----------------|
    | IP del servidor | Estàtica (p. ex., `172.16.XXX.10/24`) |
    | DNS del servidor | **Apuntar a ell mateix** (`127.0.0.1` o la seva pròpia IP) |
    | Hostname | Descriptiu, sense espais (`WSRV201`, màx. 15 caràcters NetBIOS) |
    | RAM mínima | 2 GB (4 GB recomanat) |
    | Disc | 60 GB mínim |

    ## Fase 1 – Configurar IP estàtica

    A Windows Server 2022 (GUI):

    1. Obri **Panel de Control → Connexions de xarxa → Propietats → IPv4**
    2. Configura:
       - IP: `172.16.XXX.10`
       - Màscara: `255.255.0.0`
       - Gateway: `172.16.0.1` (o la del laboratori)
       - DNS preferat: **`172.16.XXX.10`** (ell mateix → s'omplirà quan s'instal·li DNS)

    Des de PowerShell (alternativa):

    ```powershell
    # Obtén el nom de la interfície
    Get-NetAdapter

    # Configura IP estàtica
    New-NetIPAddress -InterfaceAlias "Ethernet" `
        -IPAddress "172.16.201.10" `
        -PrefixLength 16 `
        -DefaultGateway "172.16.0.1"

    # Configura DNS (apunta a ell mateix)
    Set-DnsClientServerAddress -InterfaceAlias "Ethernet" `
        -ServerAddresses "172.16.201.10"
    ```

    ## Fase 2 – Instal·lar el rol AD DS

    ```powershell
    # Instal·la AD DS + eines de gestió (RSAT-ADDS)
    Install-WindowsFeature -Name AD-Domain-Services `
        -IncludeManagementTools

    # Verifica que el rol s'ha instal·lat
    Get-WindowsFeature AD-Domain-Services
    ```

    Des de **Server Manager → Manage → Add Roles and Features → Active Directory Domain Services**.

    ## Fase 3 – Promoure a Domain Controller

    ```powershell
    # Promou el servidor a DC (nou forest)
    Install-ADDSForest `
        -DomainName "ad-cognom.local" `
        -DomainNetBIOSName "AD-COGNOM" `
        -InstallDns:$true `
        -SafeModeAdministratorPassword (ConvertTo-SecureString "P@ssw0rd123!" -AsPlainText -Force) `
        -Force:$true
    ```

    Des de GUI: **Server Manager → Notificació groga → Promote this server to a domain controller**:

    ```
    Deployment Configuration → Add a new forest
      Root domain name: ad-cognom.local

    Domain Controller Options:
      Forest functional level: Windows Server 2016
      Domain functional level: Windows Server 2016
      ✓ Domain Name System (DNS) server
      ✓ Global Catalog (GC)
      DSRM password: ****

    DNS Options:
      (ignora l'avís de delegació — és normal en un lab)

    Additional Options:
      NetBIOS domain name: AD-COGNOM

    Paths: (deixa per defecte)

    → Next → Next → Install
    ```

    El servidor es reiniciarà automàticament. Després del reinici, inicia sessió com a `AD-COGNOM\Administrator`.

    ## Verificació post-instal·lació

    ```powershell
    # Comprova que AD DS funciona
    Get-ADDomain

    # Comprova el DC
    Get-ADDomainController

    # Comprova el DNS integrat
    Get-DnsServerZone

    # Llista els registres SRV
    Resolve-DnsName -Type SRV _ldap._tcp.ad-cognom.local
    ```

    ```bash
    # Des d'un client Linux (verificació bàsica)
    nslookup ad-cognom.local 172.16.XXX.10
    ```

    !!! warning "DSRM Password: no oblidis-la!"
        La **Directory Services Restore Mode (DSRM) password** s'estableix durant la promoció. És necessària per recuperar el DC si AD DS no arrenca correctament. Desa-la en un lloc segur; si es perd, recuperar l'AD és molt complex.

    !!! tip "Verificació ràpida: dcdiag"
        Executa `dcdiag /test:dns` per verificar que el DNS del DC és correcte. Tots els tests haurien de sortir `passed`. Si algun falla, revisa la configuració DNS.

    ??? question "Auto-avaluació"
        **1.** Per quin motiu el servidor ha d'apuntar a ell mateix com a DNS primari durant la promoció?

        ??? success "Resposta"
            Durant la promoció a DC, el procés `dcpromo` instal·la i configura el servidor DNS integrat a AD. Si el servidor apuntava a un DNS extern, après de la promoció hauria de canviar el DNS a ell mateix — cosa que pot crear inconsistències. Apuntant a ell mateix des del principi (o a `127.0.0.1` com a DNS preferat), el servidor trobarà el seu propi servei DNS un cop instal·lat.

        **2.** Quina diferència hi ha entre el `DomainName` i el `DomainNetBIOSName` en la promoció AD?

        ??? success "Resposta"
            El `DomainName` és el nom complet DNS del domini (FQDN), com `ad-cognom.local`. El `DomainNetBIOSName` és el nom abreujat compatible amb sistemes legacy (màxim 15 caràcters), com `AD-COGNOM`. El NetBIOS s'usa en contextos antics (pre-Windows 2000) i per iniciar sessió amb el format `DOMINI\usuari`. En entorns moderns, el FQDN té preferència, però el NetBIOS continua funcionant.

        **3.** Quina ordre PowerShell verifica que el DC s'ha configurat correctament?

        ??? success "Resposta"
            `Get-ADDomainController` mostra la informació del DC actual (nom, IP, roles FSMO, etc.). Complementàriament, `dcdiag /test:dns` (des del CMD) verifica que el DNS integrat funciona correctament i que els SRV records s'han creat. `Get-ADDomain` mostra els detalls del domini (nom, nivell funcional, PDC emulator, etc.).

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.04 · Instal·lació d'Active Directory DS

    **Objectiu**: instal·lar i promoure Windows Server 2022 com a DC del domini `ad-cognom.local`.
    **Temps estimat**: 45 minuts
    **Prerequisit**: Windows Server 2022 instal·lat (UT1)

    ---

    ### Pas 1 – Configura la IP estàtica

    Configura la interfície de xarxa interna:
    - IP: `172.16.XXX.10` (substitueix XXX pel teu número de grup)
    - Màscara: `255.255.0.0`
    - DNS: `172.16.XXX.10` (ell mateix)

    Verifica: `ipconfig /all`

    ### Pas 2 – Canvia el hostname

    ```powershell
    Rename-Computer -NewName "WSRV201" -Restart
    ```

    (Reinicia i torna a iniciar sessió)

    ### Pas 3 – Instal·la el rol AD DS

    ```powershell
    Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools
    ```

    Espera fins que es completi (3–5 minuts).

    ### Pas 4 – Promou a Domain Controller

    Des de PowerShell:

    ```powershell
    Install-ADDSForest `
        -DomainName "ad-cognom.local" `
        -DomainNetBIOSName "AD-COGNOM" `
        -InstallDns:$true `
        -SafeModeAdministratorPassword (ConvertTo-SecureString "P@ssw0rd123!" -AsPlainText -Force) `
        -Force:$true
    ```

    El servidor es reiniciarà. Inicia sessió com a `AD-COGNOM\Administrator`.

    ### Pas 5 – Verifica

    ```powershell
    Get-ADDomain
    Get-ADDomainController
    Resolve-DnsName -Type SRV _ldap._tcp.ad-cognom.local
    ```

    Documenta: quin és el FQDN del DC? Quins SRV records han aparegut?

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Windows Server 2022 Active Directory installation step by step"`
        - `"Install-ADDSForest PowerShell promote domain controller"`
        - `"dcdiag verify Active Directory DNS"`
