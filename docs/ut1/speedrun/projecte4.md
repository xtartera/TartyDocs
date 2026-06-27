---
title: Projecte 4 · GPOs i Roaming Profiles
icon: material/microsoft-windows
hide:
  - toc
---

# Projecte 4 · GPOs i Roaming Profiles

!!! abstract "De què tracta"
    Implementa **polítiques de grup (GPO)** i configura perfils mòbils per gestionar de forma centralitzada el comportament dels clients del domini. Aprendràs a aplicar polítiques globals i per UO, i a validar-les amb les eines de diagnòstic.

| :material-clock-outline: Durada | :material-account: Modalitat | :material-book-open-variant: Blocs | :material-school: RA avaluats |
|:---:|:---:|:---:|:---:|
| **5–7 hores** | Individual | **UT1 · Blocs 8–9** | **RA4 · RA5** |

## Objectius

- Crear i aplicar GPO globals (Default Domain Policy)
- Crear GPO específiques per Unitat Organitzativa
- Configurar perfils mòbils (.V6) des de les propietats d'usuari AD
- Validar la replicació de polítiques amb `gpupdate` i `gpresult`
- Solucionar problemes de GPO amb RSOP
- Organitzar clients i usuaris en UO per a una aplicació de polítiques efectiva

## Material necessari

- Domini Active Directory amb usuaris i grups creats (Projecte 3)
- Almenys un client Windows 11 unit al domini
- Servidor de fitxers per a la carpeta de perfils

---

<div class="grid cards" markdown>

- :material-notebook-edit:{ .lg }

    ### Quadern interactiu

    El projecte es desenvolupa íntegrament al **quadern digital**. Completa totes les activitats i documenta les evidències tècniques.

    El quadern es considerarà **APTE** quan totes les activitats hagin estat resoltes i la documentació sigui completa, coherent i suficient.

    [:octicons-arrow-right-24: Obrir el quadern](https://quadern-digital-v11-2.vercel.app/moduls/mp224/unitat_treball1.html?p=4){ .md-button .md-button--primary }

- :material-book-open-page-variant:{ .lg }

    ### Apunts de la UT1

    Revisa els continguts teòrics de la unitat en qualsevol moment. Pots consultar-los mentre treballes el projecte.

    [:octicons-arrow-right-24: Consultar els apunts](../index.md){ .md-button }

</div>

!!! tip "Recomanacions"
    - Documenta cada pas amb captures de pantalla.
    - Justifica les decisions tècniques a les respostes.
    - Verifica que els perfils es carreguen correctament des de dos clients diferents.
