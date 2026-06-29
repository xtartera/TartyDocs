---
title: Projecte 32 · Compartició amb NFS
icon: material/server-network
hide:
  - toc
---

# Projecte 32 · Compartició amb NFS

!!! abstract "De què tracta"
    Desplega un servidor **NFS** a Ubuntu Server, exporta directoris amb control d'accés per IP i configura clients per muntar les exportacions de forma manual i persistent. Treballa la seguretat amb UFW, opcions de muntatge (`noexec`, `nosuid`) i la gestió de UID/GID amb `all_squash`.

| :material-clock-outline: Durada | :material-account: Modalitat | :material-book-open-variant: Blocs | :material-school: RA avaluats |
|:---:|:---:|:---:|:---:|
| **8–10 hores** | Individual | **UT3 · Blocs 5–6** | **RA3 · RA4 · RA5** |

## Objectius

- Instal·lar i configurar `nfs-kernel-server` a Ubuntu Server
- Definir exportacions a `/etc/exports` amb opcions de seguretat
- Aplicar `exportfs -rav` i verificar amb `showmount -e`
- Muntar exportacions des d'un client Linux (`mount -t nfs`)
- Configurar el muntatge persistent via `/etc/fstab` amb `_netdev`
- Implementar control d'accés per IP i opcions `noexec`, `nosuid`
- Entendre i configurar `all_squash`, `anonuid` i `anongid`

## Material necessari

- Servidor Ubuntu 24.04 LTS (pot reutilitzar-se del Projecte 31)
- Client Ubuntu 24.04 LTS per verificar el muntatge NFS
- Accés SSH a ambdós equips

---

<div class="grid cards" markdown>

- :material-notebook-edit:{ .lg }

    ### Quadern interactiu

    El projecte es desenvolupa íntegrament al **quadern digital**. Completa totes les activitats i documenta les evidències tècniques.

    El quadern es considerarà **APTE** quan totes les activitats hagin estat resoltes i la documentació sigui completa, coherent i suficient.

    [:octicons-arrow-right-24: Obrir el quadern](https://quadern-digital-v11-2.vercel.app/moduls/mp224/unitat_treball3.html?p=2){ .md-button .md-button--primary }

- :material-book-open-page-variant:{ .lg }

    ### Apunts de la UT3

    Revisa els continguts teòrics de la unitat en qualsevol moment. Pots consultar-los mentre treballes el projecte.

    [:octicons-arrow-right-24: Consultar els apunts](../index.md){ .md-button }

</div>

!!! tip "Recomanacions"
    - Recorda fer `exportfs -ra` després de cada canvi a `/etc/exports`, sense reiniciar el servei.
    - Si els UID/GID no coincideixen entre client i servidor, els permisos fallarà silenciosament.
    - Comprova els ports oberts amb `ufw status verbose` i `ss -tulnp | grep -E '111|2049'`.
