---
title: Windows Server vs Ubuntu Server
tags:
  - ut2
  - linux
  - fonaments
---

# :material-swap-horizontal: Windows Server vs Ubuntu Server

!!! abstract "Concepte clau"
    **Windows Server** i **Ubuntu Server** resolen el mateix problema — gestionar recursos en xarxa — però amb filosofies oposades: entorn gràfic centralitzat vs línia d'ordres modular. Conèixer les diferències et permet triar la tecnologia adequada i entendre per quin motiu el món empresarial utilitza tots dos.

=== ":material-notebook-outline: Apunts"

    ## Dues filosofies d'administració

    ```mermaid
    graph LR
        subgraph WS["Windows Server"]
            GUI["Interfície gràfica\n(Server Manager, ADUC,\nGPMC, DNS Manager...)"]
            PS["PowerShell\n(opcional però potent)"]
        end

        subgraph US["Ubuntu Server"]
            CLI["Línia d'ordres\n(bash, ssh, apt, systemctl...)"]
            Conf["Fitxers de configuració\n(/etc/*, YAML, LDIF...)"]
        end

        WS -->|"Administrador\nha de fer clic"| E["Entorn empresarial"]
        US -->|"Administrador\nescriu ordres"| E
    ```

    A la pràctica, els dos sistemes poden gestionar-se completament des de la línia d'ordres. La diferència és que Windows **ofereix** la GUI, mentre que Ubuntu **no la necessita**.

    ## Comparativa general

    | Característica | Windows Server 2022 | Ubuntu Server 24.04 LTS |
    |---------------|--------------------|-----------------------|
    | **Llicència** | De pagament (per nucli + CAL) | Gratuïta (open source) |
    | **Interfície** | GUI per defecte (Server Manager) | Línia d'ordres per defecte |
    | **Administració remota** | RDP (escriptori remot), RSAT | SSH (`ssh usuari@ip`) |
    | **Gestió de paquets** | MSI, Windows Update | `apt` (APT/dpkg) |
    | **Servei de directori** | Active Directory DS | OpenLDAP, FreeIPA... |
    | **Autenticació** | Kerberos (integrat en AD) | PAM + SSSD + LDAP |
    | **Compartició de fitxers** | SMB/CIFS (natiu) | NFS (natiu), Samba (SMB) |
    | **Perfils mòbils** | `.V6` via GPO | autofs + NFS |
    | **Monitoratge** | Visor d'Esdeveniments | `journalctl`, logs a `/var/log` |
    | **Automatització** | PowerShell | bash, Python, Ansible... |
    | **Quota de mercat** | ~70% en entorns corporatius | Dominant en servidors web/núvol |

    ## Quan usar cada un?

    | Escenari | Tria recomanada | Per quin motiu |
    |---------|----------------|---------------|
    | Empresa amb Office 365, SharePoint | Windows Server | Integració nativa amb l'ecosistema Microsoft |
    | Servidor web, base de dades, núvol | Ubuntu Server | Cost zero, rendiment alt, comunitat enorme |
    | Entorn mix (molt habitual) | Tots dos | Interoperabilitat via Samba/SSSD |
    | Laboratori escolar amb pressupost limitat | Ubuntu Server | Gratuït, molts recursos d'aprenentatge |
    | CFGM SMX — mòdul SOX | Tots dos (UT1 + UT2) | Conèixer les dues plataformes |

    ## Les cinc diferències clau que has de tenir clares

    1. **Gestió d'usuaris**: a Windows, els usuaris del domini viuen a Active Directory (base de dades propietària). A Linux, viuen a OpenLDAP (protocol estàndard, fitxers LDIF).

    2. **Autenticació**: a Windows, el client parla Kerberos directament amb el DC. A Linux, el client usa **SSSD** com a intermediari entre PAM i el servidor LDAP.

    3. **Perfils mòbils**: a Windows, el DC copia el perfil al PC en l'inici de sessió (sufix `.V6`). A Linux, el directori home es **munta per xarxa** (NFS + autofs) sense copiar res localment.

    4. **Permisos**: Windows usa NTFS/ACL (GUI o `icacls`). Linux usa permisos POSIX (`chmod`, `chown`) amb UID/GID numèrics.

    5. **Configuració**: a Windows, la configuració es fa via GUI o Registry. A Linux, gairebé tot és un **fitxer de text** a `/etc/` (netplan, sssd.conf, exports, auto.master...).

    !!! tip "L'enfocament correcte"
        No hi ha un sistema millor. Un administrador de sistemes professional ha de dominar tots dos. En aquesta unitat partirem dels conceptes que ja coneixes de la UT1 (Windows Server) per entendre l'equivalent Linux, identificant les analogies i les diferències.

    ??? question "Auto-avaluació"

        **1.** A la UT1 vas configurar els perfils mòbils amb una GPO i el sufix `.V6`. A Ubuntu, quin mecanisme fa la funció equivalent i quina és la diferència principal de funcionament?

        ??? success "Resposta"
            A Ubuntu els perfils mòbils s'implementen amb **autofs + NFS**: en lloc de copiar el perfil al PC local en iniciar sessió (com fa Windows), el directori home de l'usuari es **munta per xarxa** directament des del servidor NFS quan l'usuari hi accedeix. La diferència principal és que no hi ha còpia local: l'usuari sempre treballa directament al servidor, cosa que elimina el pic de tràfic en l'inici/tancament de sessió, però requereix connexió de xarxa en tot moment.

        **2.** Quin és l'equivalent Ubuntu de l'Active Directory DNS integrat que vas configurar a la UT1?

        ??? success "Resposta"
            OpenLDAP **no inclou DNS integrat** (a diferència de l'AD DS, que porta el seu propi servei DNS). A Ubuntu, el DNS és independent i es gestiona separadament (normalment amb `bind9` o el servidor DHCP/DNS del router). Per a la resolució de noms dels clients LDAP, s'utilitza el fitxer `/etc/hosts` en entorns petits, o `bind9` en producció. Aquesta és una diferència important: l'AD integra directori + DNS + Kerberos en un sol servei, mentre que Linux separa cada servei.

        **3.** Per quin motiu Ubuntu Server no inclou interfície gràfica per defecte, si Windows Server sí que en té?

        ??? success "Resposta"
            Ubuntu Server s'instal·la sense GUI per **eficiència**: la interfície gràfica consumeix RAM, CPU i espai en disc que, en un servidor, és preferible destinar als serveis. Un servidor Ubuntu típic consumeix menys de 512 MB de RAM en repòs, mentre que Windows Server amb GUI pot necessitar 2–4 GB. A més, la majoria d'administradors Linux gestionen els servidors via **SSH** des del seu propi ordinador, de manera que la GUI al servidor seria redundant. Windows Server també permet instal·lar-se en mode "Core" (sense GUI) per les mateixes raons.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 1.1 · Comparativa entre Windows Server i Ubuntu Server

    **Objectiu**: identificar les equivalències funcionals entre els dos sistemes operatius de servidor.

    **Temps estimat**: 20 minuts (sense ordinador)

    ---

    ### Part A – Completa la taula d'equivalències

    A la UT1 vas treballar amb Windows Server. Omple la columna "Equivalent Linux" per a cada element de Windows:

    | Element Windows | Equivalent Linux | Notes |
    |----------------|-----------------|-------|
    | Active Directory DS | | |
    | Group Policy (GPO) | | |
    | `net use Z: \\srv\share` | | |
    | Carpeta de perfil `.V6` | | |
    | `icacls` | | |
    | Visor d'Esdeveniments | | |
    | `gpresult /r` | | |
    | `nltest /dsgetdc:` | | |

    ### Part B – Debat

    Respon a les preguntes següents amb 2–3 línies cadascuna:

    1. Una empresa necessita integrar 50 ordinadors amb Windows 11 en un domini i gestionar els usuaris des d'un servidor. Quin sistema tries per al servidor i per quin motiu?
    2. Una empresa de hosting web necessita un servidor per allotjar 200 llocs web WordPress. Quin sistema tries i per quin motiu?
    3. Quin sistema creus que és més segur? Justifica la teva resposta.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Windows Server vs Linux Server comparison 2024"`
        - `"Ubuntu Server vs Windows Server which is better"`
        - `"Linux server administration basics for beginners"`
        - `"Active Directory vs OpenLDAP differences explained"`
