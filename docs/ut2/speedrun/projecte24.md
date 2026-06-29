---
title: Projecte 24 · Laboratori LDAP CRUD i diagnòstic
icon: material/linux
hide:
  - toc
---

# Projecte 24 · Laboratori LDAP CRUD i diagnòstic

!!! abstract "De què tracta"
    Practica totes les operacions **CRUD** (Create, Read, Update, Delete) sobre el directori LDAP amb `ldapmodify` i `ldapdelete`. Aprendràs a diagnosticar i resoldre els errors més freqüents del directori en un entorn de proves controlat.

| :material-clock-outline: Durada | :material-account: Modalitat | :material-book-open-variant: Blocs | :material-school: RA avaluats |
|:---:|:---:|:---:|:---:|
| **4–6 hores** | Individual | **UT2 · Bloc 5** | **RA3 · RA4** |

## Objectius

- Modificar atributs d'entrades existents amb `ldapmodify`
- Eliminar entrades del directori amb `ldapdelete`
- Identificar i corregir els errors LDAP més freqüents (codi 17, 19, 32, 68...)
- Treballar en un entorn de proves sense afectar la producció
- Documentar el diagnòstic i la resolució de cada error

## Material necessari

- Directori LDAP amb usuaris i grups creats (Projecte 23)
- Accés SSH al servidor

---

<div class="grid cards" markdown>

- :material-notebook-edit:{ .lg }

    ### Quadern interactiu

    El projecte es desenvolupa íntegrament al **quadern digital**. Completa totes les activitats i documenta les evidències tècniques.

    El quadern es considerarà **APTE** quan totes les activitats hagin estat resoltes i la documentació sigui completa, coherent i suficient.

    [:octicons-arrow-right-24: Obrir el quadern](https://quadern-digital-v11-2.vercel.app/moduls/mp224/unitat_treball2.html?p=4){ .md-button .md-button--primary }

- :material-book-open-page-variant:{ .lg }

    ### Apunts de la UT2

    Revisa els continguts teòrics de la unitat en qualsevol moment. Pots consultar-los mentre treballes el projecte.

    [:octicons-arrow-right-24: Consultar els apunts](../index.md){ .md-button }

</div>

!!! tip "Recomanacions"
    - Documenta cada pas amb captures de pantalla.
    - Justifica les decisions tècniques a les respostes.
    - Treballa en un entorn de proves per evitar afectar les dades de producció.
