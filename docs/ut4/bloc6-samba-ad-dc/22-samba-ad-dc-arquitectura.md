---
title: Samba 4 AD DC – arquitectura i diferències amb Windows AD
tags:
  - ut4
  - samba
  - active-directory
---

# :material-server-network: Samba 4 AD DC – arquitectura i diferències amb Windows AD

!!! abstract "Concepte clau"
    **Samba 4** pot actuar com a **controlador de domini compatible amb Active Directory**. Implementa els mateixos protocols (Kerberos, LDAP, DNS, SMB) que un DC de Windows Server, permetent que clients Windows i Linux s'uneixin al domini sense necessitat de llicències Microsoft.

=== ":material-notebook-outline: Apunts"

    ## Com Samba-AD DC emula Windows AD

    ```mermaid
    graph TD
        subgraph "Windows Server 2022 DC"
            WS_KRB["KDC (Kerberos)\nport 88"]
            WS_LDAP["LDAP (AD)\nport 389"]
            WS_DNS["DNS integrat\nport 53"]
            WS_SMB["SMB (SYSVOL, Netlogon)\nport 445"]
        end
        subgraph "Samba 4 AD DC (Ubuntu)"
            S_KRB["MIT/Heimdal Kerberos\nport 88"]
            S_LDAP["LDB/LDAP (Samba)\nport 389"]
            S_DNS["SAMBA_INTERNAL DNS\nport 53"]
            S_SMB["smbd (SYSVOL)\nport 445"]
        end
        CLIENT["Client Windows/Linux"] -->|"Mateixos protocols"| WS_KRB
        CLIENT -->|"Mateixos protocols"| S_KRB
    ```

    Samba implementa els mateixos protocols que Windows AD → els clients no noten la diferència.

    ## Diferències entre Samba-AD DC i Windows AD

    | Característica | Windows Server AD | Samba-AD DC |
    |---------------|-----------------|------------|
    | Llicència | Propietari (CAL) | GPL v3 (gratis) |
    | GPOs | Complet (GPMC GUI) | Parcial (fitxers LDIF, sense GUI nativa) |
    | Replicació multi-DC | Nativa (AD Replication) | Possible però complexa |
    | GUI d'administració | ADUC, GPMC, RSAT | Eines CLI (`samba-tool`) o RSAT Windows remot |
    | RSAT des de Windows | Natiu | Compatible (via RSAT apuntant al Samba DC) |
    | Suport RFC2307 | Parcial | Complet (`--use-rfc2307`) |
    | Estabilitat | Alta (Microsoft) | Alta (4.x), certs problemes en multi-DC |

    ## Serveis actius en Samba-AD DC

    Quan Samba funciona com a AD DC, **`smbd` i `nmbd` NO s'usen**:

    | Servei | Samba AD DC | Samba servidor fitxers |
    |--------|-------------|----------------------|
    | `samba-ad-dc` | ✓ ACTIU | ✗ |
    | `smbd` | ✗ DESACTIVAT | ✓ ACTIU |
    | `nmbd` | ✗ DESACTIVAT | ✓ ACTIU |
    | `winbind` | Integrat a samba-ad-dc | Opcional |

    ```bash
    sudo systemctl disable --now smbd nmbd winbind
    sudo systemctl enable --now samba-ad-dc
    ```

    ## Estructura del domini Samba-AD

    ```
    libretic.local (domini FQDN)
    ├── NetBIOS: LIBRETIC
    ├── DC hostname: dc1.libretic.local
    ├── IP: 172.16.XXX.10 (estàtica)
    ├── DNS: SAMBA_INTERNAL (port 53)
    ├── KDC: Heimdal/MIT Kerberos (port 88)
    ├── LDAP: port 389
    └── SYSVOL: /var/lib/samba/sysvol/
    ```

    ## Limitacions a tenir en compte

    1. **Una sola DC recomanada** per a entorns educatius: Samba multi-DC és complex
    2. **GPOs**: es poden crear però no hi ha GUI nativa; cal usar RSAT des de Windows
    3. **DFS (Distributed File System)**: no completament implementat a Samba 4
    4. **Versió**: cal Samba 4.x (disponible a Ubuntu 24.04 via `apt`)

    !!! tip "RSAT des de Windows: gestió de Samba-AD com si fos Windows AD"
        Des d'un client Windows unit al domini Samba, pots instal·lar **RSAT** (Remote Server Administration Tools) i usar **ADUC**, **GPMC**, etc. per gestionar el Samba DC com si fos un DC de Windows. Samba és prou compatible perquè RSAT funcioni per a les operacions habituals.

    !!! warning "No barrejar modes de Samba"
        Un servidor Ubuntu no pot ser **alhora** Samba AD DC i Samba servidor de fitxers (mode UT3). Són modes incompatibles: un usa `samba-ad-dc`, l'altre usa `smbd`. Si vols compartir fitxers des del DC, configura recursos directament a `smb.conf` de Samba-AD.

    ??? question "Auto-avaluació"
        **1.** Per quin motiu `smbd` i `nmbd` han d'estar desactivats quan Samba funciona com a AD DC?

        ??? success "Resposta"
            En mode **AD DC**, el servei `samba-ad-dc` ja inclou la funcionalitat SMB (per a SYSVOL i Netlogon), Kerberos, LDAP i DNS de forma integrada. `smbd` i `nmbd` són els serveis del mode **servidor de fitxers** (UT3) i entrarien en conflicte amb les funcions integrades de `samba-ad-dc`, especialment pel que fa a ports (445 SMB) i a la gestió del nom NetBIOS.

        **2.** Quina és la limitació principal de Samba-AD DC respecte a Windows AD en entorns educatius?

        ??? success "Resposta"
            La **gestió de GPOs**. Samba-AD DC suporta GPOs (les emmagatzema a SYSVOL i les serveix als clients), però no té una GUI d'administració nativa com la GPMC de Windows. Per crear i editar GPOs cal usar el **GPMC de Windows** via RSAT apuntant al Samba DC, o eines CLI. Això és menys accessible en entorns on no es disposa de clients Windows.

        **3.** On emmagatzema Samba-AD DC la base de dades equivalent a `ntds.dit` de Windows?

        ??? success "Resposta"
            Samba-AD DC usa una base de dades pròpia en format **LDB** (LDAP Database), emmagatzemada a `/var/lib/samba/private/sam.ldb` i fitxers relacionats a `/var/lib/samba/private/`. SYSVOL es troba a `/var/lib/samba/sysvol/`. Per fer backup: `sudo samba-tool domain backup offline --targetdir=/tmp/backup`.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.22 · Exploració de l'arquitectura Samba-AD DC

    **Objectiu**: identificar els components d'un DC Samba i comparar-los amb Windows AD.
    **Temps estimat**: 20 minuts
    **Modalitat**: conceptual + comparativa

    ---

    ### Tasca 1 – Taula comparativa

    Omple la taula comparant Windows Server AD i Samba-AD DC per als aspectes: port Kerberos, port LDAP, arxiu de base de dades, GUI d'administració, cost de llicències.

    ### Tasca 2 – Diagrama de ports

    Dibuixa un diagrama que mostri els ports oberts en un Samba-AD DC (88, 389, 445, 53) i quin servei els gestiona.

    ### Tasca 3 – Si ja tens Samba-AD DC instal·lat

    ```bash
    sudo systemctl status samba-ad-dc
    sudo systemctl status smbd   # Ha d'estar inactiu o desactivat
    ls /var/lib/samba/private/   # Explorar la base de dades
    ls /var/lib/samba/sysvol/    # Explorar SYSVOL
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Samba 4 Active Directory Domain Controller tutorial"`
        - `"Samba AD DC vs Windows Server Active Directory comparison"`
        - `"samba-tool domain provision Ubuntu"`
