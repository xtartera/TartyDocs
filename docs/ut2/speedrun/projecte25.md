---
title: Projecte 25 · Integració LDAP amb SSSD
icon: material/linux
hide:
  - toc
---

# Projecte 25 · Integració LDAP amb SSSD i autenticació Linux

!!! abstract "De què tracta"
    Integra el directori LDAP amb el sistema Linux mitjançant **SSSD** i PAM. Configuraràs `nsswitch.conf`, verificaràs la resolució d'usuaris amb `getent` i `id`, i validaràs l'autenticació real al sistema — l'equivalent Linux del que fa el DC amb Kerberos a Windows.

| :material-clock-outline: Durada | :material-account: Modalitat | :material-book-open-variant: Blocs | :material-school: RA avaluats |
|:---:|:---:|:---:|:---:|
| **5–7 hores** | Individual | **UT2 · Bloc 6** | **RA4 · RA5** |

## Objectius

- Instal·lar i configurar SSSD per integrar LDAP amb Linux
- Configurar `sssd.conf` amb els paràmetres del domini LDAP
- Modificar `nsswitch.conf` per a la resolució d'usuaris i grups
- Verificar la integració amb `getent passwd`, `getent group` i `id`
- Validar l'autenticació real d'usuaris LDAP al sistema Linux
- Diagnosticar problemes amb `sssctl config-check` i `journalctl`

## Material necessari

- Servidor Ubuntu amb OpenLDAP funcional i usuaris POSIX (Projectes 22–23)
- Accés SSH al servidor

---

<div class="grid cards" markdown>

- :material-notebook-edit:{ .lg }

    ### Quadern interactiu

    El projecte es desenvolupa íntegrament al **quadern digital**. Completa totes les activitats i documenta les evidències tècniques.

    El quadern es considerarà **APTE** quan totes les activitats hagin estat resoltes i la documentació sigui completa, coherent i suficient.

    [:octicons-arrow-right-24: Obrir el quadern](https://quadern-digital-v11-2.vercel.app/moduls/mp224/unitat_treball2.html?p=5){ .md-button .md-button--primary }

- :material-book-open-page-variant:{ .lg }

    ### Apunts de la UT2

    Revisa els continguts teòrics de la unitat en qualsevol moment. Pots consultar-los mentre treballes el projecte.

    [:octicons-arrow-right-24: Consultar els apunts](../index.md){ .md-button }

</div>

!!! tip "Recomanacions"
    - Documenta cada pas amb captures de pantalla.
    - Justifica les decisions tècniques a les respostes.
    - Verifica que `getent passwd` retorna els usuaris LDAP abans de provar l'autenticació.
