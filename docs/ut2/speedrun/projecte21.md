---
title: Projecte 21 · Instal·lació Ubuntu Server 24.04
icon: material/linux
hide:
  - toc
---

# Projecte 21 · Instal·lació Ubuntu Server 24.04

!!! abstract "De què tracta"
    Desplega **Ubuntu Server 24.04 LTS** en entorn virtualitzat des de zero. Configuraràs la xarxa amb netplan, gestionaràs paquets amb apt, establiràs l'accés remot via SSH i securitzaràs el servidor amb ufw.

| :material-clock-outline: Durada | :material-account: Modalitat | :material-book-open-variant: Blocs | :material-school: RA avaluats |
|:---:|:---:|:---:|:---:|
| **4–6 hores** | Individual | **UT2 · Blocs 1–2** | **RA1** |

## Objectius

- Instal·lar Ubuntu Server 24.04 LTS en una màquina virtual VirtualBox
- Configurar una IP fixa amb netplan
- Establir el hostname i la resolució local
- Gestionar paquets amb apt (instal·lació, actualització)
- Configurar l'accés remot per SSH
- Protegir el servidor amb el firewall ufw

## Material necessari

- VirtualBox instal·lat al teu equip
- ISO d'Ubuntu Server 24.04 LTS
- Mínim 2 GB de RAM disponibles
- Disc virtual de 20 GB

---

<div class="grid cards" markdown>

- :material-notebook-edit:{ .lg }

    ### Quadern interactiu

    El projecte es desenvolupa íntegrament al **quadern digital**. Completa totes les activitats i documenta les evidències tècniques.

    El quadern es considerarà **APTE** quan totes les activitats hagin estat resoltes i la documentació sigui completa, coherent i suficient.

    [:octicons-arrow-right-24: Obrir el quadern](https://quadern-digital-v11-2.vercel.app/moduls/mp224/unitat_treball2.html?p=1){ .md-button .md-button--primary }

- :material-book-open-page-variant:{ .lg }

    ### Apunts de la UT2

    Revisa els continguts teòrics de la unitat en qualsevol moment. Pots consultar-los mentre treballes el projecte.

    [:octicons-arrow-right-24: Consultar els apunts](../index.md){ .md-button }

</div>

!!! tip "Recomanacions"
    - Documenta cada pas amb captures de pantalla.
    - Justifica les decisions tècniques a les respostes.
    - Comprova la connectivitat del servidor abans de finalitzar.
