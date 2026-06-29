---
title: Projecte 33 · Gestió d'impressió CUPS
icon: material/printer
hide:
  - toc
---

# Projecte 33 · Gestió d'impressió CUPS

!!! abstract "De què tracta"
    Instal·la i configura **CUPS** a Ubuntu Server per a la gestió d'impressió en xarxa. Configura una impressora PDF virtual, habilita la impressió remota, restringeix l'accés per grups i gestiona la cua d'impressió. Opcionalment, integra CUPS amb Samba per compartir impressores amb Windows.

| :material-clock-outline: Durada | :material-account: Modalitat | :material-book-open-variant: Blocs | :material-school: RA avaluats |
|:---:|:---:|:---:|:---:|
| **6–8 hores** | Individual | **UT3 · Blocs 7–8** | **RA4 · RA5 · RA6** |

## Objectius

- Instal·lar CUPS i `cups-pdf` a Ubuntu Server 24.04
- Afegir l'usuari d'administració al grup `lpadmin`
- Gestionar impressores des de la interfície web (port 631)
- Configurar la impressora PDF virtual i verificar la sortida a `/var/spool/cups-pdf/`
- Imprimir des del client amb `lp` i gestionar la cua amb `lpq` i `cancel`
- Habilitar la compartició en xarxa editant `cupsd.conf`
- Restringir l'accés a grups Linux amb `AllowGroup`

## Material necessari

- Servidor Ubuntu 24.04 LTS (pot reutilitzar-se dels projectes anteriors)
- Client Linux per verificar la impressió remota
- Accés SSH al servidor

---

<div class="grid cards" markdown>

- :material-notebook-edit:{ .lg }

    ### Quadern interactiu

    El projecte es desenvolupa íntegrament al **quadern digital**. Completa totes les activitats i documenta les evidències tècniques.

    El quadern es considerarà **APTE** quan totes les activitats hagin estat resoltes i la documentació sigui completa, coherent i suficient.

    [:octicons-arrow-right-24: Obrir el quadern](https://quadern-digital-v11-2.vercel.app/moduls/mp224/unitat_treball3.html?p=3){ .md-button .md-button--primary }

- :material-book-open-page-variant:{ .lg }

    ### Apunts de la UT3

    Revisa els continguts teòrics de la unitat en qualsevol moment. Pots consultar-los mentre treballes el projecte.

    [:octicons-arrow-right-24: Consultar els apunts](../index.md){ .md-button }

</div>

!!! tip "Recomanacions"
    - Si la interfície web no és accessible des del client, comprova que `Listen` a `cupsd.conf` no sigui `localhost:631`.
    - L'usuari ha d'estar al grup `lpadmin` per accedir a l'administració de CUPS.
    - Verifica que el PDF generat apareix a `/var/spool/cups-pdf/<usuari>/` i no a `/root/`.
