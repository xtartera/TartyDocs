---
title: Projecte 3 · Gestió avançada d'usuaris, grups i recursos
icon: material/microsoft-windows
hide:
  - toc
---

# Projecte 3 · Gestió avançada d'usuaris, grups i recursos

!!! abstract "De què tracta"
    Aprofundeix en la gestió d'usuaris i grups AD, la configuració de **permisos NTFS** granulars i la compartició de recursos corporatius. Treballaràs tant des de la interfície gràfica com des de PowerShell i `icacls`.

| :material-clock-outline: Durada | :material-account: Modalitat | :material-book-open-variant: Blocs | :material-school: RA avaluats |
|:---:|:---:|:---:|:---:|
| **4–6 hores** | Individual | **UT1 · Blocs 5–7** | **RA3 · RA4** |

## Objectius

- Gestionar usuaris i grups de forma avançada (polítiques de contrasenya, restriccions horàries)
- Configurar carpetes compartides amb permisos NTFS granulars
- Aplicar herència de permisos i entendre la combinació NTFS + compartició
- Gestionar permisos per línia de comandes amb `icacls`
- Muntar unitats de xarxa des dels clients Windows 11
- Automatitzar tasques AD amb PowerShell

## Material necessari

- Domini Active Directory funcional (Projecte 2)
- Almenys un client Windows 11 unit al domini
- Espai de disc per a les carpetes compartides

---

<div class="grid cards" markdown>

- :material-notebook-edit:{ .lg }

    ### Quadern interactiu

    El projecte es desenvolupa íntegrament al **quadern digital**. Completa totes les activitats i documenta les evidències tècniques.

    El quadern es considerarà **APTE** quan totes les activitats hagin estat resoltes i la documentació sigui completa, coherent i suficient.

    [:octicons-arrow-right-24: Obrir el quadern](https://quadern-digital-v11-2.vercel.app/moduls/mp224/unitat_treball1.html?p=3){ .md-button .md-button--primary }

- :material-book-open-page-variant:{ .lg }

    ### Apunts de la UT1

    Revisa els continguts teòrics de la unitat en qualsevol moment. Pots consultar-los mentre treballes el projecte.

    [:octicons-arrow-right-24: Consultar els apunts](../index.md){ .md-button }

</div>

!!! tip "Recomanacions"
    - Documenta cada pas amb captures de pantalla.
    - Justifica les decisions tècniques a les respostes.
    - Comprova el correcte funcionament dels permisos des del client.
