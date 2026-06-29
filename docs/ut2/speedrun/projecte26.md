---
title: Projecte 26 · Perfils mòbils amb NFS i autofs
icon: material/linux
hide:
  - toc
---

# Projecte 26 · Perfils mòbils amb LDAP, SSSD, NFS i autofs

!!! abstract "De què tracta"
    Implementa un sistema complet de **perfils mòbils Linux**: servidor NFS per als directoris home, autofs per al muntatge automàtic i SSSD per a l'autenticació. És l'equivalent Linux dels perfils mòbils `.V6` de Windows Server — amb autofs fent el rol de les GPO Drive Maps.

| :material-clock-outline: Durada | :material-account: Modalitat | :material-book-open-variant: Blocs | :material-school: RA avaluats |
|:---:|:---:|:---:|:---:|
| **6–8 hores** | Individual | **UT2 · Blocs 7–9** | **RA4 · RA5** |

## Objectius

- Configurar un servidor NFS i exportar el directori `/home`
- Instal·lar i configurar autofs amb `auto.master` i `auto.home`
- Usar el wildcard `*` a `auto.home` per al muntatge dinàmic
- Integrar NFS amb SSSD per a l'autenticació i el muntatge automàtic
- Verificar el roaming de perfils entre sessions i clients
- Diagnosticar problemes de muntatge amb `journalctl` i `showmount`

## Material necessari

- Servidor Ubuntu amb LDAP + SSSD funcionals (Projecte 25)
- Almenys un client Linux per verificar el roaming
- Espai de disc suficient per als perfils dels usuaris

---

<div class="grid cards" markdown>

- :material-notebook-edit:{ .lg }

    ### Quadern interactiu

    El projecte es desenvolupa íntegrament al **quadern digital**. Completa totes les activitats i documenta les evidències tècniques.

    El quadern es considerarà **APTE** quan totes les activitats hagin estat resoltes i la documentació sigui completa, coherent i suficient.

    [:octicons-arrow-right-24: Obrir el quadern](https://quadern-digital-v11-2.vercel.app/moduls/mp224/unitat_treball2.html?p=6){ .md-button .md-button--primary }

- :material-book-open-page-variant:{ .lg }

    ### Apunts de la UT2

    Revisa els continguts teòrics de la unitat en qualsevol moment. Pots consultar-los mentre treballes el projecte.

    [:octicons-arrow-right-24: Consultar els apunts](../index.md){ .md-button }

</div>

!!! tip "Recomanacions"
    - Documenta cada pas amb captures de pantalla.
    - Justifica les decisions tècniques a les respostes.
    - Comprova que el perfil es munta i desmunta correctament en iniciar i tancar sessió.
