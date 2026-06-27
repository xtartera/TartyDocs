---
title: UT1 · Windows Server
hide:
  - toc
tags:
  - ut1
  - windows
  - active-directory
  - gpo
---

# :material-microsoft-windows: UT1 · Windows Server

!!! abstract "Presentació de la unitat"
    En aquesta unitat treballem amb **Windows Server 2022** com a plataforma de serveis de xarxa corporativa. Aprendrem a instal·lar i administrar un servidor Windows, a gestionar identitats centralitzades amb **Active Directory Domain Services (AD DS)**, a aplicar polítiques de grup (**GPO**) i a implementar **perfils mòbils** — la base conceptual que ens permetrà comparar-la, bloc a bloc, amb l'equivalent Linux a la UT2.

## Blocs de la unitat

| Bloc | Títol | Pàgines | Contingut principal |
|------|-------|:-------:|---------------------|
| **Bloc 1** | [Fonaments](bloc1-fonaments/01-so-escriptori-vs-xarxa.md) | 01–05 | SO escriptori vs xarxa, arquitectura client-servidor, serveis Windows Server, virtualització, requisits de maquinari |
| **Bloc 2** | [Instal·lació](bloc2-installacio/06-modes-installacio.md) | 06–10 | Modes d'instal·lació, particionament, sistemes de fitxers NTFS/ReFS, instal·lació pas a pas, configuració inicial |
| **Bloc 3** | [Administració](bloc3-administracio/11-server-manager.md) | 11–19 | Server Manager, rols i característiques, PowerShell bàsic, monitoratge de recursos, Visor d'Esdeveniments, manteniment, planificador de tasques, unattend.xml, verificació de connectivitat |
| **Bloc 4** | [Active Directory](bloc4-active-directory/20-conceptes-ad.md) | 20–24 | Conceptes AD, unitats organitzatives (UO), instal·lació AD DS, promoció a DC, DNS integrat en AD |
| **Bloc 5** | [Usuaris i grups](bloc5-usuaris-grups/25-gestio-usuaris-ad.md) | 25–29 | Gestió d'usuaris i grups AD, polítiques de contrasenya, restriccions horàries, PowerShell per AD |
| **Bloc 6** | [Clients al domini](bloc6-clients/30-unio-clients-domini.md) | 30–33 | Unió de clients Windows 11, configuració DNS al client, validació de la integració, gpresult |
| **Bloc 7** | [Recursos compartits](bloc7-recursos/34-carpetes-compartides.md) | 34–38 | Carpetes compartides, permisos NTFS, herència de permisos, icacls, muntatge de carpetes de xarxa |
| **Bloc 8** | [GPO](bloc8-gpo/39-gpo-conceptes.md) | 39–43 | Conceptes GPO, Default Domain Policy, GPO per UO, GPO de restriccions, gpupdate |
| **Bloc 9** | [Perfils mòbils](bloc9-perfils/44-tipus-perfils.md) | 44–49 | Tipus de perfils, carpeta per a perfils, configuració de perfils mòbils, sufix .V6, permisos NTFS en perfils, redirecció de carpetes |
| **Bloc 10** | [Diagnòstic](bloc10-monitoratge/50-auditoria-acces.md) | 50–52 | Auditoria d'accés, diagnòstic de perfils, PowerShell de diagnòstic |

**Total: 52 pàgines**

## Mapa de la unitat

```mermaid
graph LR
    B1["Bloc 1\nFonaments"] --> B2["Bloc 2\nInstal·lació"]
    B2 --> B3["Bloc 3\nAdministració"]
    B3 --> B4["Bloc 4\nActive\nDirectory"]
    B4 --> B5["Bloc 5\nUsuaris\ni grups"]
    B5 --> B6["Bloc 6\nClients\nal domini"]
    B6 --> B7["Bloc 7\nRecursos\ncompartits"]
    B7 --> B8["Bloc 8\nGPO"]
    B8 --> B9["Bloc 9\nPerfils\nmòbils"]
    B9 --> B10["Bloc 10\nDiagnòstic"]
    click B1 "bloc1-fonaments/01-so-escriptori-vs-xarxa/" "Obrir Bloc 1"
    click B2 "bloc2-installacio/06-modes-installacio/" "Obrir Bloc 2"
    click B3 "bloc3-administracio/11-server-manager/" "Obrir Bloc 3"
    click B4 "bloc4-active-directory/20-conceptes-ad/" "Obrir Bloc 4"
    click B5 "bloc5-usuaris-grups/25-gestio-usuaris-ad/" "Obrir Bloc 5"
    click B6 "bloc6-clients/30-unio-clients-domini/" "Obrir Bloc 6"
    click B7 "bloc7-recursos/34-carpetes-compartides/" "Obrir Bloc 7"
    click B8 "bloc8-gpo/39-gpo-conceptes/" "Obrir Bloc 8"
    click B9 "bloc9-perfils/44-tipus-perfils/" "Obrir Bloc 9"
    click B10 "bloc10-monitoratge/50-auditoria-acces/" "Obrir Bloc 10"
```

## Cap a la UT2: l'equivalent Linux

Cada concepte d'aquesta unitat té el seu paral·lel a la **UT2 · Linux Server i LDAP**. Reconèixer els equivalents accelera l'aprenentatge de les eines Linux:

| UT1 · Windows Server | UT2 · Ubuntu Server 24.04 |
|---------------------|--------------------------|
| Active Directory Domain Services (AD DS) | OpenLDAP |
| Compte d'usuari AD (`samAccountName`) | Usuari POSIX LDAP (`uid`, `uidNumber`) |
| Grup de seguretat AD | Grup POSIX (`posixGroup`, `gidNumber`) |
| Autenticació Kerberos (integrada en AD) | Autenticació via SSSD + PAM |
| Perfils mòbils `.V6` (compartit SMB) | Perfils via autofs + NFS |
| `net use` / GPO Drive Maps | autofs amb wildcard `*` |
| Permisos NTFS (`icacls`) | Permisos POSIX (`chmod` / `chown`) |
| DNS integrat en AD DS | `/etc/hosts` + `hostname` + resolució local |
| Server Manager (GUI) | `systemctl` + `apt` + `journalctl` |


---

## SpeedRun · Projectes interactius

Aplica els continguts de la UT1 amb projectes pràctics al quadern digital. Cada projecte té activitats guiades, autodesat automàtic i exportació en PDF.

<div class="grid cards" markdown>

- :material-rocket-launch:{ .lg }

    ### Projecte 1 · Instal·lació WS

    Desplega Windows Server 2022 en entorn virtualitzat des de zero.

    :material-clock-outline: 4–6 h &nbsp;·&nbsp; Blocs 1–3 &nbsp;·&nbsp; RA1, RA5

    [:octicons-arrow-right-24: Veure el projecte](speedrun/projecte1.md){ .md-button .md-button--primary }

- :material-domain:{ .lg }

    ### Projecte 2 · Active Directory

    Instal·la AD DS i promou el servidor a Controlador de Domini.

    :material-clock-outline: 4–6 h &nbsp;·&nbsp; Blocs 3–4 &nbsp;·&nbsp; RA2, RA3

    [:octicons-arrow-right-24: Veure el projecte](speedrun/projecte2.md){ .md-button .md-button--primary }

- :material-account-group:{ .lg }

    ### Projecte 3 · Usuaris i recursos

    Gestiona usuaris avançats, permisos NTFS i carpetes compartides.

    :material-clock-outline: 4–6 h &nbsp;·&nbsp; Blocs 5–7 &nbsp;·&nbsp; RA3, RA4

    [:octicons-arrow-right-24: Veure el projecte](speedrun/projecte3.md){ .md-button .md-button--primary }

- :material-shield-key:{ .lg }

    ### Projecte 4 · GPOs i perfils

    Aplica polítiques de grup globals i per UO, i configura perfils mòbils.

    :material-clock-outline: 5–7 h &nbsp;·&nbsp; Blocs 8–9 &nbsp;·&nbsp; RA4, RA5

    [:octicons-arrow-right-24: Veure el projecte](speedrun/projecte4.md){ .md-button .md-button--primary }

- :material-home-account:{ .lg }

    ### Projecte 5 · Perfils mòbils

    Configura el roaming complet amb redirecció de carpetes i sufix .V6.

    :material-clock-outline: 5–7 h &nbsp;·&nbsp; Bloc 9 &nbsp;·&nbsp; RA5

    [:octicons-arrow-right-24: Veure el projecte](speedrun/projecte5.md){ .md-button .md-button--primary }

- :material-trophy:{ .lg }

    ### Projecte integrador

    Implanta una infraestructura AD completa per a l'Institut Montseny.

    :material-clock-outline: 8–10 h &nbsp;·&nbsp; UT1 completa &nbsp;·&nbsp; RA1–RA5

    [:octicons-arrow-right-24: Veure el projecte](speedrun/projecte6.md){ .md-button .md-button--primary }

- :material-help-box:{ .lg }

    ### Projecte 7 · Dossier de preguntes

    Consolida i avalua els coneixements teòrics de tota la unitat per blocs.

    :material-clock-outline: 3–5 h &nbsp;·&nbsp; UT1 completa &nbsp;·&nbsp; RA1–RA5

    [:octicons-arrow-right-24: Veure el projecte](speedrun/projecte7.md){ .md-button .md-button--primary }

</div>