---
title: Projecte 41 · Windows Server 2022 Active Directory
icon: material/microsoft-windows
hide:
  - toc
---

# Projecte 41 · Windows Server 2022 Active Directory

!!! abstract "De què tracta"
    Desplega un domini **Active Directory** complet amb Windows Server 2022: instal·la AD DS, crea l'estructura d'OUs, usuaris i grups, uneix clients Windows i Linux al domini, configura GPOs i implementa perfils mòbils i còpies de seguretat.

| :material-clock-outline: Durada | :material-account: Modalitat | :material-book-open-variant: Blocs | :material-school: RA avaluats |
|:---:|:---:|:---:|:---:|
| **10–12 hores** | Individual | **UT4 · Blocs 1–4** | **RA4 · RA5 · RA6** |

## Objectius

- Instal·lar AD DS i promoure un DC amb Windows Server 2022
- Crear OUs, usuaris i grups de domini amb PowerShell
- Unir clients Windows 11 i Ubuntu 24.04 al domini
- Configurar GPOs per aplicar restriccions als usuaris
- Implementar perfils mòbils i carpetes d'inici al servidor
- Realitzar còpies de seguretat amb Robocopy i tasques programades

## Material necessari

- Windows Server 2022 (VM) — mínim 4 GB RAM, 80 GB disc
- Windows 11 Pro (VM) — client del domini
- Ubuntu 24.04 LTS (VM) — client Linux del domini
- Accés a PowerShell amb permisos d'administrador

---

<div class="grid cards" markdown>

- :material-notebook-edit:{ .lg }

    ### Quadern interactiu

    El projecte es desenvolupa íntegrament al **quadern digital**. Completa totes les activitats i documenta les evidències tècniques.

    El quadern es considerarà **APTE** quan totes les activitats hagin estat resoltes i la documentació sigui completa, coherent i suficient.

    [:octicons-arrow-right-24: Obrir el quadern](https://quadern-digital-v11-2.vercel.app/moduls/mp224/unitat_treball4.html?p=1){ .md-button .md-button--primary }

- :material-book-open-page-variant:{ .lg }

    ### Apunts de la UT4

    Revisa els continguts teòrics de la unitat en qualsevol moment. Pots consultar-los mentre treballes el projecte.

    [:octicons-arrow-right-24: Consultar els apunts](../index.md){ .md-button }

</div>

!!! tip "Recomanacions"
    - Verifica `dcdiag /test:dns` abans d'unir cap client al domini. Un DNS malconfigurat fa fallar tot el procés.
    - Recorda que els perfils mòbils a Windows 11 usen el sufix `.V6` a la carpeta del servidor.
    - Documenta cada pas amb captures de pantalla i justifica les decisions tècniques.
