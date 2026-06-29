---
title: Projecte 23 · LDAP ampliat i gestió multiusuari
icon: material/linux
hide:
  - toc
---

# Projecte 23 · LDAP ampliat i gestió multiusuari

!!! abstract "De què tracta"
    Amplia el directori LDAP amb **múltiples usuaris i grups POSIX**, garanteix la coherència `UID/GID` i practica la gestió avançada d'una estructura multiusuari real. Aprendràs a mantenir un directori net i coherent a mesura que creix.

| :material-clock-outline: Durada | :material-account: Modalitat | :material-book-open-variant: Blocs | :material-school: RA avaluats |
|:---:|:---:|:---:|:---:|
| **4–6 hores** | Individual | **UT2 · Blocs 4–5** | **RA3** |

## Objectius

- Ampliar el directori amb nous usuaris POSIX i grups de seguretat
- Garantir la coherència dels atributs `uidNumber` i `gidNumber`
- Organitzar usuaris en Unitats Organitzatives
- Gestionar múltiples usuaris simultàniament amb fitxers LDIF
- Validar l'estructura completa amb `ldapsearch` i `ldapwhoami`

## Material necessari

- OpenLDAP instal·lat i configurat amb directori base (Projecte 22)
- Accés SSH al servidor

---

<div class="grid cards" markdown>

- :material-notebook-edit:{ .lg }

    ### Quadern interactiu

    El projecte es desenvolupa íntegrament al **quadern digital**. Completa totes les activitats i documenta les evidències tècniques.

    El quadern es considerarà **APTE** quan totes les activitats hagin estat resoltes i la documentació sigui completa, coherent i suficient.

    [:octicons-arrow-right-24: Obrir el quadern](https://quadern-digital-v11-2.vercel.app/moduls/mp224/unitat_treball2.html?p=3){ .md-button .md-button--primary }

- :material-book-open-page-variant:{ .lg }

    ### Apunts de la UT2

    Revisa els continguts teòrics de la unitat en qualsevol moment. Pots consultar-los mentre treballes el projecte.

    [:octicons-arrow-right-24: Consultar els apunts](../index.md){ .md-button }

</div>

!!! tip "Recomanacions"
    - Documenta cada pas amb captures de pantalla.
    - Justifica les decisions tècniques a les respostes.
    - Comprova la coherència UID/GID de tots els usuaris creats.
