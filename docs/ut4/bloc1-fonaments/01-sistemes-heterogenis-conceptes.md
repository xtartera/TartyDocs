---
title: Sistemes heterogenis – conceptes i protocols
tags:
  - ut4
  - conceptes
  - ad
  - ldap
---

# :material-lan-connect: Sistemes heterogenis – conceptes i protocols

!!! abstract "Concepte clau"
    Un **sistema heterogeni** combina màquines i sistemes operatius de fabricants diferents (Windows, Linux, macOS) que han de compartir autenticació, fitxers i impressores. Els protocols clau són **LDAP**, **Kerberos**, **SMB** i **NFS**.

=== ":material-notebook-outline: Apunts"

    ## Què és un entorn heterogeni?

    Un entorn homogeni té tots els clients i servidors del mateix fabricant (p. ex., tot Windows). Un entorn **heterogeni** barreja sistemes operatius:

    ```mermaid
    graph TD
        DC["Servidor de directori\n(AD / LDAP / Samba-AD)"]
        DC --> W["Clients Windows\n(W10, W11)"]
        DC --> L["Clients Linux\n(Ubuntu Desktop)"]
        DC --> M["Clients macOS\n(Opcional)"]
        DC --> SERV["Servidors\n(Ubuntu Server)"]
    ```

    El repte principal: **autenticació unificada** — un sol compte d'usuari que funcioni a qualsevol màquina del domini.

    ## Protocols fonamentals d'integració

    | Protocol | Capa | Funció | Port |
    |----------|------|--------|------|
    | **LDAP** | Aplicació | Directori d'usuaris i grups | 389 (389s LDAPS) |
    | **Kerberos** | Autenticació | Tickets d'autenticació sense transmissió de contrasenya | 88 UDP/TCP |
    | **DNS** | Xarxa | Resolució de noms del domini (crítica per a AD) | 53 |
    | **SMB/CIFS** | Aplicació | Compartició de fitxers i impressores | 445 |
    | **NFS** | Aplicació | Compartició de fitxers Linux | 2049 |
    | **PAM** | Sistema | Interfície d'autenticació a Linux | — |
    | **NSS** | Sistema | Base de dades de comptes a Linux (`passwd`, `group`) | — |

    ## Tres solucions de directori

    | Solució | Plataforma base | Autenticació | Clau |
    |---------|----------------|-------------|------|
    | **Active Directory** | Windows Server 2022 | Kerberos + LDAP | Estàndard empresarial Microsoft |
    | **OpenLDAP** | Ubuntu Server | LDAP simple | Flexible, codi obert, sense Kerberos natiu |
    | **Samba-AD DC** | Ubuntu Server | Kerberos + LDAP (compatible AD) | AD sense llicències Microsoft |

    ## El paper de Kerberos

    Kerberos substitueix l'enviament de contrasenyes per **tickets** de temps limitat:

    ```mermaid
    sequenceDiagram
        participant C as Client
        participant KDC as KDC (DC)
        participant S as Servei (SMB/NFS)
        C->>KDC: 1. AS-REQ (usuari + timestamp xifrat)
        KDC-->>C: 2. TGT (Ticket Granting Ticket)
        C->>KDC: 3. TGS-REQ (TGT + servei demanat)
        KDC-->>C: 4. ST (Service Ticket)
        C->>S: 5. ST → accés al servei
        S-->>C: 6. Accés concedit
    ```

    La contrasenya **mai no viatja per la xarxa**. Això fa Kerberos molt més segur que LDAP simple.

    ## SSSD: el pont universal a Linux

    **SSSD** (System Security Services Daemon) és el servei Linux que permet connectar-se a qualsevol backend de directori (AD, LDAP, Samba-AD) usant la mateixa interfície PAM/NSS:

    ```
    Client Linux
       ├── PAM → SSSD → AD / LDAP / Samba-AD
       └── NSS → SSSD → resolució de noms d'usuari
    ```

    !!! tip "Connexió amb UT2"
        A UT2 configuràvem SSSD per connectar Ubuntu a OpenLDAP. A UT4 usem el **mateix SSSD** però apuntant a Active Directory o Samba-AD DC. La configuració és diferent però el concepte és idèntic.

    !!! warning "DNS: requisit crític"
        En entorns AD (Windows o Samba), el **DNS és obligatori**. Sense resolució correcta del nom del DC, el domain join falla. Sempre comprova primer que `nslookup dc1.domini.local` resol correctament abans d'intentar unir-se al domini.

    ??? question "Auto-avaluació"
        **1.** Quina diferència fonamental hi ha entre un entorn homogeni i un d'heterogeni?

        ??? success "Resposta"
            Un entorn **homogeni** té tots els sistemes del mateix fabricant (p. ex., tots Windows amb AD). Un entorn **heterogeni** combina sistemes de fabricants o famílies diferents (Windows + Linux + macOS) que han de compartir autenticació, fitxers i impressores. El repte principal és establir un únic punt d'autenticació que entenguin tots els sistemes.

        **2.** Per quin motiu Kerberos és més segur que enviar la contrasenya per la xarxa?

        ??? success "Resposta"
            Kerberos usa un sistema de **tickets de temps limitat** emesos pel KDC (Key Distribution Center). El client mai envia la contrasenya als servidors de servei: en lloc d'això, presenta un ticket que demostra que s'ha autenticat prèviament. Si un atacant intercepta el tràfic, només obté un ticket temporal que caduca en pocs minuts o hores, no la contrasenya real.

        **3.** Quins tres serveis actuen junts a Linux per autenticar usuaris contra un directori remot?

        ??? success "Resposta"
            **PAM** (Pluggable Authentication Modules) gestiona el procés d'autenticació al sistema; **NSS** (Name Service Switch) resol noms d'usuari i grups a partir de bases de dades externes; i **SSSD** actua com a intermediari entre PAM/NSS i el directori remot (AD, LDAP o Samba-AD), gestionant la caché i la comunicació amb el servidor.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.01 · Mapa conceptual de la UT4

    **Objectiu**: identificar els components principals d'un entorn heterogeni i les relacions entre ells.
    **Temps estimat**: 20 minuts
    **Modalitat**: individual

    ---

    ### Tasca 1 – Taula de protocols

    Omple la taula sense consultar els apunts:

    | Protocol | Port | Funció principal |
    |----------|------|-----------------|
    | LDAP | | |
    | Kerberos | | |
    | DNS | | |
    | SMB | | |
    | NFS | | |

    ### Tasca 2 – Comparativa de solucions

    Per a cada afirmació, indica si és veritat (V) o falsedat (F) i justifica:

    1. OpenLDAP usa Kerberos nativament per a l'autenticació. (V/F)
    2. Samba-AD DC és compatible amb clients Windows que s'uneixen a un domini AD. (V/F)
    3. SSSD a Linux pot connectar-se tant a AD com a OpenLDAP usant la mateixa eina. (V/F)
    4. En un entorn AD, el DNS és opcional si es coneix la IP del DC. (V/F)

    ### Tasca 3 – Diagrama

    Dibuixa (a paper o digitalment) un diagrama que mostri com un client Windows i un client Ubuntu s'autentiquen contra un DC Active Directory. Inclou: client, DC, KDC i els passos de Kerberos.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"heterogeneous network environment Windows Linux integration"`
        - `"Kerberos authentication explained simply"`
        - `"LDAP vs Active Directory differences"`
        - `"SSSD Linux authentication AD LDAP"`
