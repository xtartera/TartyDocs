---
title: Projecte 31 · Compartició amb Samba
icon: material/folder-network
hide:
  - toc
---

# Projecte 31 · Compartició amb Samba

!!! abstract "De què tracta"
    Configura un servidor **Samba** complet a Ubuntu Server: des de la instal·lació fins a la gestió d'accés lliure, restringit i per grups. Implementa controls de seguretat amb `valid users`, `write list` i `smbpasswd`, i experimenta amb quotes d'espai i límits de fitxer.

| :material-clock-outline: Durada | :material-account: Modalitat | :material-book-open-variant: Blocs | :material-school: RA avaluats |
|:---:|:---:|:---:|:---:|
| **8–10 hores** | Individual | **UT3 · Blocs 1–4** | **RA4 · RA5 · RA6** |

## Objectius

- Instal·lar i configurar Samba a Ubuntu Server 24.04
- Crear recursos compartits amb accés lliure (`guest ok`) i restringit (`valid users`)
- Gestionar el control d'accés per grups Linux amb `@grup`
- Crear i gestionar usuaris Samba amb `smbpasswd`
- Aplicar màscares de permisos i configurar `force user`
- Limitar la mida dels fitxers pujats i simular quotes d'espai

## Material necessari

- Servidor Ubuntu 24.04 LTS (pot reutilitzar-se de la UT2)
- Client Linux o Windows per verificar l'accés als recursos compartits
- Accés SSH al servidor

---

<div class="grid cards" markdown>

- :material-notebook-edit:{ .lg }

    ### Quadern interactiu

    El projecte es desenvolupa íntegrament al **quadern digital**. Completa totes les activitats i documenta les evidències tècniques.

    El quadern es considerarà **APTE** quan totes les activitats hagin estat resoltes i la documentació sigui completa, coherent i suficient.

    [:octicons-arrow-right-24: Obrir el quadern](#){ .md-button .md-button--primary }

- :material-book-open-page-variant:{ .lg }

    ### Apunts de la UT3

    Revisa els continguts teòrics de la unitat en qualsevol moment. Pots consultar-los mentre treballes el projecte.

    [:octicons-arrow-right-24: Consultar els apunts](../index.md){ .md-button }

</div>

!!! tip "Recomanacions"
    - Després de cada canvi a `smb.conf`, verifica la sintaxi amb `testparm` i reinicia `smbd`.
    - Recorda que l'usuari ha d'existir tant a Linux (`adduser`) com a Samba (`smbpasswd -a`).
    - Documenta cada configuració amb captures de pantalla des del client.
