---
title: Projecte 44 · NFS multiplataforma
icon: material/folder-network
hide:
  - toc
---

# Projecte 44 · NFS multiplataforma

!!! abstract "De què tracta"
    Desplega **NFS en un entorn heterogeni**: configura Windows Server 2022 com a servidor NFS per a clients Ubuntu, i Ubuntu com a servidor NFS per a clients Windows. Verifica el muntatge bidireccional i la gestió de permisos entre sistemes.

| :material-clock-outline: Durada | :material-account: Modalitat | :material-book-open-variant: Blocs | :material-school: RA avaluats |
|:---:|:---:|:---:|:---:|
| **8–10 hores** | Individual | **UT4 · Bloc 2** | **RA4 · RA5** |

## Objectius

- Instal·lar i configurar *Server for NFS* a Windows Server 2022
- Muntar recursos NFS de WS2022 des d'un client Ubuntu (`/etc/fstab`)
- Instal·lar i configurar `nfs-kernel-server` a Ubuntu
- Muntar recursos NFS d'Ubuntu des d'un client Windows (*Client for NFS*)
- Gestionar permisos i opcions d'exportació (`/etc/exports`)

## Material necessari

- Windows Server 2022 (VM) — servidor NFS
- Ubuntu 24.04 LTS (VM) — servidor NFS i client NFS
- Windows 10/11 Pro (VM) — client NFS
- Accés SSH als servidors Ubuntu

---

<div class="grid cards" markdown>

- :material-notebook-edit:{ .lg }

    ### Quadern interactiu

    El projecte es desenvolupa íntegrament al **quadern digital**. Completa totes les activitats i documenta les evidències tècniques.

    El quadern es considerarà **APTE** quan totes les activitats hagin estat resoltes i la documentació sigui completa, coherent i suficient.

    [:octicons-arrow-right-24: Obrir el quadern](#){ .md-button .md-button--primary }

- :material-book-open-page-variant:{ .lg }

    ### Apunts de la UT4

    Revisa els continguts teòrics de la unitat en qualsevol moment. Pots consultar-los mentre treballes el projecte.

    [:octicons-arrow-right-24: Consultar els apunts](../index.md){ .md-button }

</div>

!!! tip "Recomanacions"
    - Verifica sempre la connectivitat bàsica (`ping`) entre les màquines **abans** d'intentar muntar via NFS.
    - Comprova el firewall dels dos costats: el port **2049 (NFS)** i el **111 (portmapper)** han d'estar oberts.
    - Usa `showmount -e <IP_servidor>` des del client per confirmar que el servidor exporta correctament abans de muntar.
