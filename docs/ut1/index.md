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
| **Bloc 1** | Fonaments | 01–05 | SO escriptori vs xarxa, arquitectura client-servidor, serveis Windows Server, virtualització, requisits de maquinari |
| **Bloc 2** | Instal·lació | 06–10 | Modes d'instal·lació, particionament, sistemes de fitxers NTFS/ReFS, instal·lació pas a pas, configuració inicial |
| **Bloc 3** | Administració | 11–19 | Server Manager, rols i característiques, PowerShell bàsic, monitoratge de recursos, Visor d'Esdeveniments, manteniment, planificador de tasques, unattend.xml, verificació de connectivitat |
| **Bloc 4** | Active Directory | 20–24 | Conceptes AD, unitats organitzatives (UO), instal·lació AD DS, promoció a DC, DNS integrat en AD |
| **Bloc 5** | Usuaris i grups | 25–29 | Gestió d'usuaris i grups AD, polítiques de contrasenya, restriccions horàries, PowerShell per AD |
| **Bloc 6** | Clients al domini | 30–33 | Unió de clients Windows 11, configuració DNS al client, validació de la integració, gpresult |
| **Bloc 7** | Recursos compartits | 34–38 | Carpetes compartides, permisos NTFS, herència de permisos, icacls, muntatge de carpetes de xarxa |
| **Bloc 8** | GPO | 39–43 | Conceptes GPO, Default Domain Policy, GPO per UO, GPO de restriccions, gpupdate |
| **Bloc 9** | Perfils mòbils | 44–49 | Tipus de perfils, carpeta per a perfils, configuració de perfils mòbils, sufix .V6, permisos NTFS en perfils, redirecció de carpetes |
| **Bloc 10** | Diagnòstic | 50–52 | Auditoria d'accés, diagnòstic de perfils, PowerShell de diagnòstic |

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


**[:octicons-arrow-right-24: Obrir projecte](speedrun/)**