---
title: Projecte 5 · Perfils mòbils amb Active Directory
icon: material/microsoft-windows
hide:
  - toc
---

# Projecte 5 · Perfils mòbils amb Active Directory

!!! abstract "De què tracta"
    Configura **perfils mòbils complets** amb redirecció de carpetes i permisos NTFS adequats per a un entorn corporatiu. Verificaràs el comportament del sufix `.V6` en clients Windows 11 i aprendràs a diagnosticar els problemes habituals.

| :material-clock-outline: Durada | :material-account: Modalitat | :material-book-open-variant: Blocs | :material-school: RA avaluats |
|:---:|:---:|:---:|:---:|
| **5–7 hores** | Individual | **UT1 · Bloc 9** | **RA5** |

## Objectius

- Configurar la carpeta compartida per als perfils al servidor de fitxers
- Assignar el camí de perfil mòbil a les propietats d'usuari AD
- Configurar la redirecció de carpetes (Documents, Escriptori) per GPO
- Establir permisos NTFS correctes per garantir l'aïllament entre usuaris
- Verificar el comportament del sufix `.V6` en clients Windows 11
- Diagnosticar problemes habituals amb perfils mòbils

## Material necessari

- Domini Active Directory funcional amb GPO configurades (Projecte 4)
- Servidor de fitxers amb espai suficient per als perfils
- Almenys dos clients Windows 11 per verificar el roaming

---

<div class="grid cards" markdown>

- :material-notebook-edit:{ .lg }

    ### Quadern interactiu

    El projecte es desenvolupa íntegrament al **quadern digital**. Completa totes les activitats i documenta les evidències tècniques.

    El quadern es considerarà **APTE** quan totes les activitats hagin estat resoltes i la documentació sigui completa, coherent i suficient.

    [:octicons-arrow-right-24: Obrir el quadern](https://quadern-digital-v11-2.vercel.app/moduls/mp224/unitat_treball1.html?p=5){ .md-button .md-button--primary }

- :material-book-open-page-variant:{ .lg }

    ### Apunts de la UT1

    Revisa els continguts teòrics de la unitat en qualsevol moment. Pots consultar-los mentre treballes el projecte.

    [:octicons-arrow-right-24: Consultar els apunts](../index.md){ .md-button }

</div>

!!! tip "Recomanacions"
    - Documenta cada pas amb captures de pantalla.
    - Justifica les decisions tècniques a les respostes.
    - Comprova que el perfil es replica correctament entre dos clients.
