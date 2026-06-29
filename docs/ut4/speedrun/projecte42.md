---
title: Projecte 42 · Samba com a AD DC (libretic.local)
icon: material/server-network
hide:
  - toc
---

# Projecte 42 · Samba com a AD DC (libretic.local)

!!! abstract "De què tracta"
    Desplega **Samba 4 com a Active Directory Domain Controller** del domini `libretic.local`. Crea usuaris i grups amb `samba-tool`, uneix clients Windows i Linux al domini, i configura recursos compartits amb control d'accés per grups i ACLs esteses.

| :material-clock-outline: Durada | :material-account: Modalitat | :material-book-open-variant: Blocs | :material-school: RA avaluats |
|:---:|:---:|:---:|:---:|
| **12–14 hores** | Individual | **UT4 · Blocs 1, 6, 7** | **RA4 · RA5 · RA6** |

## Objectius

- Desplegar Samba-AD DC amb `samba-tool domain provision --use-rfc2307`
- Crear usuaris (ana, marc, clara) i grups (tecnics, comptabilitat, direccio) al domini
- Unir un client Windows 11 al domini `LIBRETIC` i verificar el login
- Unir un client Ubuntu amb `realm join` + SSSD i verificar `id` i SSH
- Crear recursos compartits `[tecnics]` i `[comuna]` amb `valid users = @grup`
- Aplicar ACLs POSIX (`setfacl`) i ACLs NTFS via `vfs objects = acl_xattr`

## Material necessari

- Ubuntu 24.04 LTS — DC Samba (mínim 2 GB RAM, hostname `dc1.libretic.local`)
- Windows 11 Pro — client del domini LIBRETIC
- Ubuntu 24.04 LTS — client Linux del domini
- Accés SSH al servidor DC

---

<div class="grid cards" markdown>

- :material-notebook-edit:{ .lg }

    ### Quadern interactiu

    El projecte es desenvolupa íntegrament al **quadern digital**. Completa totes les activitats i documenta les evidències tècniques.

    El quadern es considerarà **APTE** quan totes les activitats hagin estat resoltes i la documentació sigui completa, coherent i suficient.

    [:octicons-arrow-right-24: Obrir el quadern](https://quadern-digital-v11-2.vercel.app/moduls/mp224/unitat_treball4.html?p=3){ .md-button .md-button--primary }

- :material-book-open-page-variant:{ .lg }

    ### Apunts de la UT4

    Revisa els continguts teòrics de la unitat en qualsevol moment. Pots consultar-los mentre treballes el projecte.

    [:octicons-arrow-right-24: Consultar els apunts](../index.md){ .md-button }

</div>

!!! tip "Recomanacions"
    - Desactiva `smbd` i `nmbd` **abans** d'activar `samba-ad-dc`. Tots dos serveis en conflicte impediran l'arrencada del DC.
    - Verifica sempre els SRV records amb `host -t SRV _ldap._tcp.libretic.local 127.0.0.1` just després del provision.
    - La sincronització horària és crítica: Kerberos rebutja tickets amb més de 5 minuts de diferència.
