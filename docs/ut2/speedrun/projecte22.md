---
title: Projecte 22 · Creació d'un directori LDAP
icon: material/linux
hide:
  - toc
---

# Projecte 22 · Creació d'un directori LDAP amb fitxers LDIF

!!! abstract "De què tracta"
    Instal·la **OpenLDAP**, configura la base del directori i crea l'estructura d'usuaris i grups POSIX amb fitxers LDIF. Treballaràs amb `ldapadd`, `ldapsearch` i `ldapwhoami` per gestionar i validar el directori.

| :material-clock-outline: Durada | :material-account: Modalitat | :material-book-open-variant: Blocs | :material-school: RA avaluats |
|:---:|:---:|:---:|:---:|
| **5–7 hores** | Individual | **UT2 · Blocs 3–4** | **RA2 · RA3** |

## Objectius

- Instal·lar i configurar OpenLDAP (slapd) en Ubuntu Server 24.04
- Definir el DN base del directori corporatiu
- Crear fitxers LDIF amb l'estructura d'Unitats Organitzatives
- Afegir usuaris i grups POSIX amb atributs `uidNumber` i `gidNumber`
- Validar les entrades amb `ldapsearch` i `ldapwhoami`
- Entendre la diferència entre OpenLDAP i Active Directory

## Material necessari

- Ubuntu Server 24.04 funcional amb IP fixa i SSH (Projecte 21)
- Accés root o usuari amb sudo
- Editor de text per redactar fitxers LDIF

---

<div class="grid cards" markdown>

- :material-notebook-edit:{ .lg }

    ### Quadern interactiu

    El projecte es desenvolupa íntegrament al **quadern digital**. Completa totes les activitats i documenta les evidències tècniques.

    El quadern es considerarà **APTE** quan totes les activitats hagin estat resoltes i la documentació sigui completa, coherent i suficient.

    [:octicons-arrow-right-24: Obrir el quadern](https://quadern-digital-v11-2.vercel.app/moduls/mp224/unitat_treball2.html?p=2){ .md-button .md-button--primary }

- :material-book-open-page-variant:{ .lg }

    ### Apunts de la UT2

    Revisa els continguts teòrics de la unitat en qualsevol moment. Pots consultar-los mentre treballes el projecte.

    [:octicons-arrow-right-24: Consultar els apunts](../index.md){ .md-button }

</div>

!!! tip "Recomanacions"
    - Documenta cada pas amb captures de pantalla.
    - Justifica les decisions tècniques a les respostes.
    - Verifica cada entrada LDAP amb `ldapsearch` abans de continuar.
