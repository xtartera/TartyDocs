---
title: DNS integrat amb Active Directory
tags:
  - ut4
  - active-directory
  - dns
---

# :material-dns: DNS integrat amb Active Directory

!!! abstract "Concepte clau"
    El **DNS integrat amb AD** emmagatzema les zones DNS a la base de dades d'Active Directory (`ntds.dit`), permetent replicació automàtica entre DCs. Conté registres **SRV** que permeten als clients localitzar el DC, el KDC i el servei LDAP automàticament.

=== ":material-notebook-outline: Apunts"

    ## Per quin motiu AD necessita DNS propi

    Active Directory usa DNS per a **service discovery**: els clients no necessiten conèixer la IP del DC; busquen registres SRV al DNS per trobar-lo.

    ```bash
    # Registres SRV que crea AD automàticament:
    _ldap._tcp.ad-cognom.local        SRV  DC:389
    _kerberos._tcp.ad-cognom.local    SRV  DC:88
    _kpasswd._tcp.ad-cognom.local     SRV  DC:464
    _gc._tcp.ad-cognom.local          SRV  DC:3268  (Global Catalog)
    ```

    ## Zones DNS d'Active Directory

    | Zona | Nom | Contingut |
    |------|-----|----------|
    | Forward | `ad-cognom.local` | A records (hostname→IP) + SRV records |
    | Reverse | `10.16.172.in-addr.arpa` | PTR records (IP→hostname) |

    ## DNS integrat a AD vs DNS estàndard

    | Característica | DNS integrat a AD | DNS estàndard |
    |---------------|-----------------|--------------|
    | Emmagatzematge | ntds.dit (AD) | Fitxers de zona (.dns) |
    | Replicació | Automàtica via AD | Manual (zona secundària) |
    | Actualització | Segura (SSEC, autenticada) | Qualsevol client pot registrar |
    | Disponibilitat | Alt (replicació multi-DC) | Depèn de la configuració |

    ## Configuració del client: apuntar al DC

    Tots els clients (Windows i Linux) han d'usar el DC com a servidor DNS:

    ```powershell
    # Windows: configurar DNS
    Set-DnsClientServerAddress -InterfaceAlias "Ethernet" `
        -ServerAddresses "172.16.XXX.10"

    # Verificar
    nslookup ad-cognom.local
    nslookup -type=SRV _ldap._tcp.ad-cognom.local
    ```

    ```bash
    # Ubuntu: /etc/systemd/resolved.conf
    [Resolve]
    DNS=172.16.XXX.10
    Domains=ad-cognom.local

    # Aplica
    sudo systemctl restart systemd-resolved
    resolvectl status

    # Verifica
    nslookup ad-cognom.local 172.16.XXX.10
    ```

    ## Registres A del DC

    Un cop instal·lat, el DC s'autoregistra al DNS:

    ```
    WSRV201.ad-cognom.local    A    172.16.201.10
    ```

    Si el registre no apareix: `ipconfig /registerdns` (Windows) per forçar el registre.

    ## Diagnòstic DNS

    ```powershell
    # Al DC: verifica totes les zones
    Get-DnsServerZone

    # Llista els registres SRV del domini
    Get-DnsServerResourceRecord -ZoneName "ad-cognom.local" -RRType SRV

    # Test complet de DNS
    dcdiag /test:dns /v
    ```

    !!! warning "Error freqüent: client apunta a DNS extern"
        Si el client Windows o Ubuntu apunta a `8.8.8.8` (Google DNS) o al router, no trobarà els registres `_ldap._tcp.ad-cognom.local` i el domain join fallarà amb "Cannot contact the domain". Sempre configurar el DNS del client apuntant al DC.

    ??? question "Auto-avaluació"
        **1.** Quin tipus de registre DNS usa Active Directory per publicar la ubicació del DC?

        ??? success "Resposta"
            Registres **SRV** (Service Records). Definits a RFC 2782, permeten publicar que un servei específic (com `_ldap` o `_kerberos`) es troba en un servidor concret i port. Els clients AD consulten `_ldap._tcp.nom-domini` per trobar el DC sense necessitat de conèixer la seva IP.

        **2.** Quina avantatge té el DNS integrat a AD respecte al DNS estàndard?

        ??? success "Resposta"
            El DNS integrat a AD emmagatzema les zones a **ntds.dit** (la base de dades d'Active Directory), cosa que permet la **replicació automàtica** entre tots els DC del domini. En el DNS estàndard, la replicació s'ha de configurar manualment (zones secundàries). A més, les actualitzacions dinàmiques del DNS integrat a AD estan **autenticades** (Secure DNS Update), evitant que clients no autoritzats registrin noms.

        **3.** Quina ordre PowerShell verifica que els registres SRV s'han creat correctament al DC?

        ??? success "Resposta"
            `Get-DnsServerResourceRecord -ZoneName "ad-cognom.local" -RRType SRV` llista tots els registres SRV de la zona. Alternativament, `dcdiag /test:dns /v` fa una anàlisi completa del DNS integrat a AD i reporta errors si n'hi ha. Des d'un client: `nslookup -type=SRV _ldap._tcp.ad-cognom.local`.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.05 · Verificació del DNS integrat amb AD

    **Objectiu**: verificar que el DNS d'AD funciona i que els clients el troben.
    **Temps estimat**: 20 minuts
    **Prerequisit**: DC Active Directory operatiu (Activitat 4.04)

    ---

    ### Pas 1 – Al DC: explora les zones DNS

    ```powershell
    Get-DnsServerZone
    Get-DnsServerResourceRecord -ZoneName "ad-cognom.local" -RRType SRV | Select-Object Name, RecordData
    ```

    Documenta: quants registres SRV hi ha? Quins serveis publiquen?

    ### Pas 2 – Des del client: verifica la resolució

    Configura el DNS del client apuntant al DC i verifica:

    ```powershell
    # Windows
    nslookup ad-cognom.local
    nslookup WSRV201.ad-cognom.local
    nslookup -type=SRV _ldap._tcp.ad-cognom.local
    ```

    ```bash
    # Ubuntu
    nslookup ad-cognom.local 172.16.XXX.10
    nslookup -type=SRV _ldap._tcp.ad-cognom.local 172.16.XXX.10
    ```

    ### Pas 3 – dcdiag

    ```powershell
    dcdiag /test:dns
    ```

    Tots els tests han de mostrar `passed`. Documenta si algun falla i la causa.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Active Directory DNS SRV records explained"`
        - `"dcdiag DNS test Active Directory"`
        - `"DNS integrated Active Directory zone"`
