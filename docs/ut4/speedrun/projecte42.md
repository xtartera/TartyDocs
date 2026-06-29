---
title: Projecte 42 · OpenLDAP multiplataforma
icon: material/linux
hide:
  - toc
---

# Projecte 42 · OpenLDAP multiplataforma

!!! abstract "De què tracta"
    Desplega un servidor **OpenLDAP** a Ubuntu i integra-hi clients Linux (via PAM+NSS) i clients Windows (via pGina). Implementa perfils mòbils amb NFS i autofs, i comparteix recursos amb Samba autenticat contra LDAP.

| :material-clock-outline: Durada | :material-account: Modalitat | :material-book-open-variant: Blocs | :material-school: RA avaluats |
|:---:|:---:|:---:|:---:|
| **10–12 hores** | Individual | **UT4 · Blocs 1, 5** | **RA4 · RA5 · RA6** |

## Objectius

- Instal·lar i configurar OpenLDAP (`slapd`) amb estructura DIT multiplataforma
- Crear usuaris POSIX amb els atributs necessaris per a l'autenticació Linux
- Integrar clients Ubuntu via PAM+NSS (`libnss-ldapd`, `libpam-ldapd`, `nslcd`)
- Configurar pGina a Windows per autenticar contra LDAP
- Implementar perfils mòbils amb NFS i autofs (`/etc/auto.master`, `/etc/auto.homes`)
- Verificar l'autenticació amb `getent`, `id` i SSH

## Material necessari

- Servidor Ubuntu 24.04 LTS — servidor LDAP + NFS (mínim 2 GB RAM)
- Client Ubuntu 24.04 LTS — client PAM+NSS
- Client Windows 10/11 — per a pGina
- Accés SSH als servidors

---

<div class="grid cards" markdown>

- :material-notebook-edit:{ .lg }

    ### Quadern interactiu

    El projecte es desenvolupa íntegrament al **quadern digital**. Completa totes les activitats i documenta les evidències tècniques.

    El quadern es considerarà **APTE** quan totes les activitats hagin estat resoltes i la documentació sigui completa, coherent i suficient.

    [:octicons-arrow-right-24: Obrir el quadern](https://quadern-digital-v11-2.vercel.app/moduls/mp224/unitat_treball4.html?p=2){ .md-button .md-button--primary }

- :material-book-open-page-variant:{ .lg }

    ### Apunts de la UT4

    Revisa els continguts teòrics de la unitat en qualsevol moment. Pots consultar-los mentre treballes el projecte.

    [:octicons-arrow-right-24: Consultar els apunts](../index.md){ .md-button }

</div>

!!! tip "Recomanacions"
    - Assegura't que els UIDs i GIDs LDAP coincideixen entre el servidor NFS i tots els clients. Les inconsistències fan que els fitxers del home NFS apareguin com a propietat d'un número desconegut.
    - Verifica amb `getent passwd usuari` i `id usuari` abans d'intentar el login SSH.
    - A pGina, usa el botó "Simulate" per confirmar la configuració LDAP abans del primer login real.
