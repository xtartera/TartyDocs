---
title: UT2 · Linux Server i LDAP
hide:
  - toc
tags:
  - ut2
  - linux
  - ldap
---

# :material-linux: UT2 · Linux Server i LDAP

!!! abstract "Presentació de la unitat"
    En aquesta unitat treballem amb **Ubuntu Server 24.04 LTS** com a plataforma de serveis de xarxa. Aprendrem a administrar un servidor Linux, a gestionar identitats amb **OpenLDAP**, a integrar l'autenticació amb **SSSD**, i a implementar **perfils mòbils** mitjançant NFS i autofs — l'equivalent Linux del que vam fer amb Active Directory i Windows Server a la UT1.

## Blocs de la unitat

| Bloc | Títol | Projecte | Contingut principal |
|------|-------|---------|---------------------|
| **Bloc 1** | [Fonaments Linux](bloc1-fonaments/01-windows-vs-linux-server.md) | P21 | Comparativa Windows/Linux, arquitectura Ubuntu Server |
| **Bloc 2** | [Instal·lació i xarxa](bloc2-installacio/03-interficies-xarxa-linux.md) | P21 | netplan, apt, SSH, ufw, chrony |
| **Bloc 3** | [LDAP – Conceptes](bloc3-ldap-conceptes/10-conceptes-ldap.md) | P22 | Estructura LDAP, OpenLDAP, LDIF, ldapsearch |
| **Bloc 4** | [LDAP – Usuaris i grups](bloc4-ldap-usuaris/16-atributs-posix.md) | P22–P23 | Atributs POSIX, ldapadd, ldapwhoami |
| **Bloc 5** | [LDAP – Operacions CRUD](bloc5-ldap-crud/23-ldapmodify.md) | P23–P24 | ldapmodify, ldapdelete, errors freqüents |
| **Bloc 6** | [SSSD](bloc6-sssd/27-sssd-conceptes.md) | P25 | Integració LDAP-Linux, nsswitch, getent |
| **Bloc 7** | [NFS](bloc7-nfs/34-nfs-conceptes.md) | P26 | Servidor NFS, /etc/exports, exportfs |
| **Bloc 8** | [Perfils mòbils](bloc8-perfils-mobils/38-estructura-perfils-linux.md) | P26 | autofs, auto.master, auto.home, Ubuntu 22 vs 24 |
| **Bloc 9** | [Diagnòstic](bloc9-diagnostic/45-diagnostic-integral-linux.md) | P26 | Diagnòstic integral LDAP+SSSD+NFS+autofs |

## Mapa de la unitat

```mermaid
graph LR
    B1["Bloc 1\nFonaments Linux"] --> B2["Bloc 2\nInstal·lació\ni xarxa"]
    B2 --> B3["Bloc 3\nLDAP\nConceptes"]
    B3 --> B4["Bloc 4\nLDAP\nUsuaris"]
    B4 --> B5["Bloc 5\nLDAP\nCRUD"]
    B5 --> B6["Bloc 6\nSSSD"]
    B6 --> B7["Bloc 7\nNFS"]
    B7 --> B8["Bloc 8\nPerfils\nmòbils"]
    B8 --> B9["Bloc 9\nDiagnòstic"]
    click B1 "bloc1-fonaments/01-windows-vs-linux-server/" "Obrir Bloc 1"
    click B2 "bloc2-installacio/03-interficies-xarxa-linux/" "Obrir Bloc 2"
    click B3 "bloc3-ldap-conceptes/10-conceptes-ldap/" "Obrir Bloc 3"
    click B4 "bloc4-ldap-usuaris/16-atributs-posix/" "Obrir Bloc 4"
    click B5 "bloc5-ldap-crud/23-ldapmodify/" "Obrir Bloc 5"
    click B6 "bloc6-sssd/27-sssd-conceptes/" "Obrir Bloc 6"
    click B7 "bloc7-nfs/34-nfs-conceptes/" "Obrir Bloc 7"
    click B8 "bloc8-perfils-mobils/38-estructura-perfils-linux/" "Obrir Bloc 8"
    click B9 "bloc9-diagnostic/45-diagnostic-integral-linux/" "Obrir Bloc 9"
```

---

## SpeedRun · Projectes interactius

Aplica els continguts de la UT2 amb projectes pràctics al quadern digital. Cada projecte té activitats guiades, autodesat automàtic i exportació en PDF.

<div class="grid cards" markdown>

- :material-ubuntu:{ .lg }

    ### Projecte 21 · Instal·lació Ubuntu

    Desplega Ubuntu Server 24.04 LTS en entorn virtualitzat des de zero.

    :material-clock-outline: 4–6 h &nbsp;·&nbsp; Blocs 1–2 &nbsp;·&nbsp; RA1

    [:octicons-arrow-right-24: Veure el projecte](speedrun/projecte21.md){ .md-button .md-button--primary }

- :material-file-tree:{ .lg }

    ### Projecte 22 · LDAP amb LDIF

    Instal·la OpenLDAP i crea usuaris i grups POSIX amb fitxers LDIF.

    :material-clock-outline: 5–7 h &nbsp;·&nbsp; Blocs 3–4 &nbsp;·&nbsp; RA2, RA3

    [:octicons-arrow-right-24: Veure el projecte](speedrun/projecte22.md){ .md-button .md-button--primary }

- :material-account-multiple:{ .lg }

    ### Projecte 23 · LDAP multiusuari

    Amplia el directori amb múltiples usuaris i grups garantint la coherència UID/GID.

    :material-clock-outline: 4–6 h &nbsp;·&nbsp; Blocs 4–5 &nbsp;·&nbsp; RA3

    [:octicons-arrow-right-24: Veure el projecte](speedrun/projecte23.md){ .md-button .md-button--primary }

- :material-database-edit:{ .lg }

    ### Projecte 24 · LDAP CRUD

    Practica totes les operacions CRUD i diagnostica errors freqüents del directori.

    :material-clock-outline: 4–6 h &nbsp;·&nbsp; Bloc 5 &nbsp;·&nbsp; RA3, RA4

    [:octicons-arrow-right-24: Veure el projecte](speedrun/projecte24.md){ .md-button .md-button--primary }

- :material-shield-account:{ .lg }

    ### Projecte 25 · SSSD

    Integra LDAP amb el sistema Linux via SSSD i valida l'autenticació real.

    :material-clock-outline: 5–7 h &nbsp;·&nbsp; Bloc 6 &nbsp;·&nbsp; RA4, RA5

    [:octicons-arrow-right-24: Veure el projecte](speedrun/projecte25.md){ .md-button .md-button--primary }

- :material-home-account:{ .lg }

    ### Projecte 26 · Perfils mòbils

    Implementa perfils mòbils complets amb NFS, autofs i SSSD.

    :material-clock-outline: 6–8 h &nbsp;·&nbsp; Blocs 7–9 &nbsp;·&nbsp; RA4, RA5

    [:octicons-arrow-right-24: Veure el projecte](speedrun/projecte26.md){ .md-button .md-button--primary }

- :material-help-box:{ .lg }

    ### Projecte 27 · Dossier de preguntes

    Consolida i avalua els coneixements teòrics de tota la unitat per blocs.

    :material-clock-outline: 3–5 h &nbsp;·&nbsp; UT2 completa &nbsp;·&nbsp; RA1–RA5

    [:octicons-arrow-right-24: Veure el projecte](speedrun/projecte27.md){ .md-button .md-button--primary }

</div>

---

## Relació amb la UT1

| UT1 (Windows Server) | UT2 (Linux / Ubuntu) |
|---------------------|---------------------|
| Active Directory DS | OpenLDAP |
| Usuaris AD (`samAccountName`) | Usuaris POSIX (`uid`, `uidNumber`) |
| Grups de seguretat AD | Grups POSIX (`posixGroup`) |
| Inici de sessió via Kerberos | Autenticació via SSSD + PAM |
| Perfils mòbils `.V6` | Perfils via autofs + NFS |
| `net use` / GPO Drive Maps | autofs amb wildcard `*` |
| `icacls` / NTFS | `chmod` / `chown` |
