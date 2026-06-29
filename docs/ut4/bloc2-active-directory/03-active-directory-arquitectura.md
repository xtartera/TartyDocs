---
title: Active Directory – arquitectura i components
tags:
  - ut4
  - active-directory
  - ad
---

# :material-domain: Active Directory – arquitectura i components

!!! abstract "Concepte clau"
    **Active Directory** és el servei de directori de Microsoft basat en LDAP i Kerberos. S'organitza en **Forest → Domain → DC**. El **Domain Controller (DC)** emmagatzema la base de dades de comptes (`ntds.dit`) i actua com a **KDC** per a Kerberos.

=== ":material-notebook-outline: Apunts"

    ## Jerarquia d'Active Directory

    ```mermaid
    graph TD
        F["Forest\n(límit de seguretat superior)"]
        F --> D1["Domain\nad-cognom.local"]
        D1 --> DC["Domain Controller (DC)\nWSRV2XX"]
        D1 --> OU1["OU=Departaments"]
        OU1 --> OU2["OU=Tecnics"]
        OU1 --> OU3["OU=Administracio"]
        OU2 --> U1["Usuari: tecnic201"]
        OU3 --> U2["Usuari: admin201"]
        DC --> KDC["KDC (Kerberos)\nport 88"]
        DC --> DNS["DNS integrat\nport 53"]
        DC --> LDAP["LDAP Directory\nport 389"]
    ```

    ## Components principals

    | Component | Funció | Fitxer / Servei |
    |-----------|--------|----------------|
    | **ntds.dit** | Base de dades AD (comptes, grups, GPOs, etc.) | `C:\Windows\NTDS\ntds.dit` |
    | **SYSVOL** | Carpeta compartida amb GPOs i scripts d'inici de sessió | `C:\Windows\SYSVOL` |
    | **KDC** | Kerberos Key Distribution Center (gestió de tickets) | Part del servei AD DS |
    | **DNS integrat** | Resol noms del domini; emmagatzema SRV records per localitzar el DC | Servei DNS de Windows Server |
    | **FSMO roles** | Operació de rols únics (PDC Emulator, RID Master, etc.) | Configurat al primer DC |

    ## Terminologia essencial

    | Terme | Definició |
    |-------|----------|
    | **Forest** | Límit de seguretat superior; pot contenir múltiples dominis |
    | **Domain** | Unitat administrativa principal; `ad-cognom.local` |
    | **DC** | Servidor que emmagatzema i serveix el directori AD |
    | **KDC** | Servei Kerberos integrat al DC; emet TGT i Service Tickets |
    | **OU** | Unitat Organitzativa; contenidor per a comptes i polítiques |
    | **GPO** | Group Policy Object; conjunt de polítiques que s'apliquen a OUs |
    | **SYSVOL** | Carpeta compartida automàticament per tots els DC del domini |
    | **SRV record** | Registre DNS especial que permet als clients localitzar el DC |
    | **FSMO** | Flexible Single Master Operation; rols únics al domini |

    ## SRV records: com els clients troben el DC

    Quan un client busca el DC del domini `ad-cognom.local`, consulta els registres SRV al DNS:

    ```
    _kerberos._tcp.ad-cognom.local    → DC port 88
    _ldap._tcp.ad-cognom.local        → DC port 389
    _kpasswd._tcp.ad-cognom.local     → DC port 464
    ```

    Per això **configurar el DNS al client apuntant al DC** és obligatori abans de fer el domain join.

    ## Ports clau d'Active Directory

    | Servei | Port | Protocol |
    |--------|------|---------|
    | DNS | 53 | TCP/UDP |
    | Kerberos | 88 | TCP/UDP |
    | LDAP | 389 | TCP |
    | LDAPS | 636 | TCP |
    | SMB (SYSVOL) | 445 | TCP |
    | RPC dinàmic | 49152–65535 | TCP |

    !!! warning "El DNS és la peça crítica"
        El 90% dels errors en entorns AD provenen d'una configuració DNS incorrecta. El DC ha d'estar configurat com a **servidor DNS primari** (apuntant a ell mateix) i els clients han d'usar el DC com a DNS. Si `nslookup ad-cognom.local` no resol, el domain join fallarà.

    !!! tip "ntds.dit: mai copiar directament"
        La base de dades `ntds.dit` no es pot copiar mentre el servei AD DS està actiu (el fitxer és bloquejat). Per fer backup cal usar `ntdsutil` o Windows Server Backup, que creen una còpia consistent.

    ??? question "Auto-avaluació"
        **1.** Quin és el fitxer que conté la base de dades d'Active Directory i on es troba?

        ??? success "Resposta"
            El fitxer és **`ntds.dit`** i es troba a `C:\Windows\NTDS\ntds.dit`. Conté tots els objectes del domini: comptes d'usuari, grups, equips, GPOs i polítiques. Té un mecanisme de log de transaccions similar a una base de dades relacional per garantir la integritat.

        **2.** Per quin motiu els registres DNS de tipus SRV són imprescindibles en un entorn AD?

        ??? success "Resposta"
            Els **SRV records** permeten als clients localitzar automàticament el DC del domini sense necessitat de conèixer la seva IP. Quan un client vol unir-se al domini `ad-cognom.local`, consulta `_ldap._tcp.ad-cognom.local` per trobar el servidor LDAP (port 389) i `_kerberos._tcp.ad-cognom.local` per al KDC (port 88). Sense SRV records, el domain join falla perquè el client no pot descobrir el DC.

        **3.** Quin és el paper de SYSVOL en un entorn Active Directory?

        ??? success "Resposta"
            **SYSVOL** és una carpeta compartida automàticament per tots els DC del domini (via SMB, `\\domini\SYSVOL`). Emmagatzema les **GPOs** (polítiques de grup) i els **scripts d'inici de sessió** (`logon scripts`). Quan un client s'uneix al domini i rep GPOs, les descarrega de SYSVOL. En entorns multi-DC, SYSVOL es replica entre tots els DC mitjançant DFS-R.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.03 · Exploració d'una instal·lació AD

    **Objectiu**: identificar els components AD en un DC ja instal·lat.
    **Temps estimat**: 20 minuts
    **Prerequisit**: DC Windows Server 2022 operatiu (Activitat 4.04)

    ---

    ### Tasca 1 – Verificació de serveis AD

    Al DC, obre PowerShell com a administrador i executa:

    ```powershell
    # Estat del servei AD DS
    Get-Service ADWS, KDC, Netlogon, DNS | Select-Object Name, Status

    # Confirma que ntds.dit existeix
    Test-Path "C:\Windows\NTDS\ntds.dit"

    # Llista els registres SRV del domini
    Resolve-DnsName -Type SRV _ldap._tcp.ad-cognom.local
    Resolve-DnsName -Type SRV _kerberos._tcp.ad-cognom.local
    ```

    ### Tasca 2 – Explorar SYSVOL

    ```powershell
    # Contingut de SYSVOL
    Get-ChildItem "C:\Windows\SYSVOL\sysvol\" -Recurse | Select-Object FullName
    ```

    Documenta: quines carpetes hi ha? Quins fitxers conté la carpeta `Policies`?

    ### Tasca 3 – Des del client

    Des d'un client Windows o Linux, comprova que la resolució DNS funciona:

    ```powershell
    # Windows
    nslookup ad-cognom.local
    nslookup -type=SRV _ldap._tcp.ad-cognom.local
    ```

    ```bash
    # Linux
    nslookup ad-cognom.local IP-DC
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Active Directory architecture explained Forest Domain DC"`
        - `"NTDS.dit Active Directory database explained"`
        - `"Kerberos KDC Active Directory how it works"`
