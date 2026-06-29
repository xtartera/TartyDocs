---
title: Comparativa AD / OpenLDAP / Samba-AD DC
tags:
  - ut4
  - active-directory
  - ldap
  - samba
---

# :material-compare: Comparativa AD / OpenLDAP / Samba-AD DC

!!! abstract "Concepte clau"
    **Active Directory**, **OpenLDAP** i **Samba-AD DC** són les tres solucions principals de directori corporatiu. Cadascuna té el seu cas d'ús: AD és l'estàndard empresarial Windows, OpenLDAP és flexible i multiplataforma, i Samba-AD combina la compatibilitat AD amb el codi obert Linux.

=== ":material-notebook-outline: Apunts"

    ## Taula comparativa principal

    | Característica | Active Directory | OpenLDAP | Samba-AD DC |
    |---------------|-----------------|---------|------------|
    | **Plataforma** | Windows Server | Linux (qualsevol distro) | Linux (Ubuntu, Debian...) |
    | **Llicència** | Propietari (CAL) | GPL / OpenLDAP License | GPL v3 |
    | **Protocol LDAP** | LDAPv3 | LDAPv3 | LDAPv3 |
    | **Kerberos** | Natiu (integrat) | No (auth simple) | Natiu (compatible AD) |
    | **DNS integrat** | Sí (zones AD) | No (extern) | Sí (SAMBA_INTERNAL o BIND9) |
    | **GPOs** | Sí (complet) | No | Sí (compatible) |
    | **Clients Windows** | Natiu | Via pGina | Natiu (domain join) |
    | **Clients Linux** | realmd + sssd | sssd o libnss-ldapd | realmd + sssd |
    | **Complexitat** | Mitjana | Baixa–Mitjana | Alta |
    | **Escalabilitat** | Alta (multi-DC, sites) | Mitjana (replicació manual) | Mitjana (1 DC pràctic) |
    | **Cas d'ús típic** | Empresa amb infraestructura Windows | Entorn mixt sense Windows o amb pGina | Alt. gratuïta a AD en entorn Linux |

    ## Flux d'autenticació per solució

    ```mermaid
    graph LR
        subgraph "Active Directory"
            W1["Client W11"] -->|"Kerberos\nport 88"| AD["Windows DC\nad-cognom.local"]
            L1["Ubuntu"] -->|"realmd + sssd\nKerberos"| AD
        end
        subgraph "OpenLDAP"
            W2["Windows"] -->|"pGina\nLDAP port 389"| LDAP["Ubuntu\n(slapd)"]
            L2["Ubuntu"] -->|"nslcd + PAM\nLDAP port 389"| LDAP
        end
        subgraph "Samba-AD DC"
            W3["Client W11"] -->|"Kerberos\nport 88"| SAMBA["Ubuntu\n(samba-ad-dc)\nlibretic.local"]
            L3["Ubuntu"] -->|"realm join\n+ sssd"| SAMBA
        end
    ```

    ## Quan usar cada solució

    ### Active Directory
    - **Quan**: l'empresa ja té infraestructura Windows o té pressupost per a llicències Microsoft
    - **Avantatges**: integració total amb W10/W11, GPOs completes, suport oficial, RSAT per administrar remotament
    - **Limitació**: requereix llicències Windows Server + CAL per usuari

    ### OpenLDAP
    - **Quan**: entorn majoritàriament Linux o mixte sense necessitat de GPOs; pressupost limitat
    - **Avantatges**: lleuger, configurable, molt estable, suportat per totes les distribucions Linux
    - **Limitació**: no té Kerberos natiu (auth simple menys segura), gestió per línia d'ordres (`ldapadd`, `ldapmodify`), clients Windows necessiten pGina

    ### Samba-AD DC
    - **Quan**: es vol compatibilitat AD (domain join de Windows) sense pagar llicències Microsoft
    - **Avantatges**: gratuït, compatible al 100% amb domain join de Windows i Linux, suporta GPOs
    - **Limitació**: més complex de configurar, recomanable un sol DC en entorns educatius, documentació menys accessible

    ## Eines d'administració

    | Tasca | Active Directory | OpenLDAP | Samba-AD DC |
    |-------|-----------------|---------|------------|
    | Crear usuari | ADUC GUI / `New-ADUser` | `ldapadd` + LDIF | `samba-tool user create` |
    | Crear grup | ADUC GUI / `New-ADGroup` | `ldapadd` + LDIF | `samba-tool group add` |
    | Verificar usuaris | `net user /domain` | `ldapsearch` | `wbinfo -u` |
    | Politiques | GPMC (GUI) | No disponible | `samba-tool gpo` |
    | Backup DC | `ntdsutil` | `slapcat` | `samba-tool domain backup` |

    !!! tip "Connexió amb UT1 i UT2"
        A **UT1** ja vam desplegar Active Directory des de zero (instal·lació AD DS, promoció a DC). A **UT2** vam configurar OpenLDAP amb `slapd` i SSSD per a clients Linux. A UT4 ampliem les dues solucions i hi afegim Samba-AD DC com a tercera opció.

    !!! warning "Samba-AD DC ≠ Samba compartició de fitxers"
        Samba té dos modes d'ús: **servidor de fitxers** (UT3, amb `smbd`) i **controlador de domini AD** (UT4, amb `samba-ad-dc`). Quan Samba funciona com a AD DC, el servei `smbd` i `nmbd` estan desactivats i el servei és `samba-ad-dc`. Són configuracions incompatibles en el mateix servidor.

    ??? question "Auto-avaluació"
        **1.** Quina diferència fonamental hi ha entre OpenLDAP i Active Directory quant a autenticació?

        ??? success "Resposta"
            **Active Directory** usa **Kerberos** com a protocol d'autenticació: les contrasenyes mai viatgen per la xarxa, es basen en tickets de temps limitat emesos pel KDC (el DC). **OpenLDAP** fa autenticació **LDAP simple** (`ldap_bind`): el client envia l'usuari i la contrasenya xifrats (si hi ha TLS) al servidor LDAP. Kerberos és considerablement més segur i eficient en entorns grans.

        **2.** Per quin motiu cal instal·lar pGina a un client Windows per autenticar-se contra OpenLDAP?

        ??? success "Resposta"
            Windows no suporta autenticació LDAP simple de forma nativa per al login d'escriptori: el mecanisme d'autenticació de Windows espera un **DC Windows** (AD) o un **DC Samba-AD** compatible. **pGina** és un plugin de login per a Windows que intercepta el procés d'autenticació i el redirigeix a un servidor LDAP, permetent que usuaris LDAP iniciïn sessió a Windows sense unir el PC a un domini.

        **3.** En quin cas triaries Samba-AD DC en lloc d'Active Directory?

        ??? success "Resposta"
            Triaria **Samba-AD DC** quan: (1) no hi ha pressupost per a llicències Windows Server + CAL, (2) el servidor és Linux i es vol mantenir tot l'entorn en codi obert, (3) es necessita compatibilitat amb domain join de Windows (cosa que OpenLDAP no ofereix sense pGina), i (4) l'escala és petita–mitjana (1 sol DC). En entorns grans amb molts DC o necessitat de GPOs complexes, Active Directory segueix sent la millor opció.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.02 · Elecció de solució de directori

    **Objectiu**: aplicar criteris tècnics per triar la solució de directori adequada a cada escenari.
    **Temps estimat**: 25 minuts

    ---

    ### Escenaris

    Per a cada escenari, indica quina solució triaries (AD / OpenLDAP / Samba-AD DC) i raona la tria:

    **Escenari A** — PIME de 15 empleats, tots amb Windows 10 Pro, servidor Windows Server 2022, pressupost per a llicències.

    **Escenari B** — Institut educatiu amb 30 ordinadors Ubuntu Desktop, 1 servidor Ubuntu Server, pressupost zero per a llicències. Només necessiten login unificat a Linux.

    **Escenari C** — Empresa de 50 persones amb mescla de Windows i Linux, sense pressupost per a llicències Windows Server, però necessiten que els clients Windows puguin fer domain join i accedir a recursos compartits autenticats.

    **Escenari D** — Cooperativa amb 10 treballadors, alguns amb Windows i altres amb Linux, que vol centralitzar els comptes però té poca experiència tècnica.

    ### Reflexió final

    Quina de les tres solucions és **més complexa** d'instal·lar i configurar? Per quin motiu?

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Active Directory vs OpenLDAP comparison"`
        - `"Samba Active Directory Domain Controller setup"`
        - `"pGina Windows LDAP authentication tutorial"`
