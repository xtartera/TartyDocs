---
title: Projecte 42 · OpenLDAP multiplataforma
icon: material/account-network
hide:
  - toc
---

# Projecte 42 · OpenLDAP multiplataforma

!!! abstract "De què tracta"
    Desplega un servidor **OpenLDAP** complet i protegit amb TLS, integra un client Ubuntu amb SSSD i un client **Windows 11 amb pGina**, implementa perfils mòbils amb NFSv4, comparteix recursos amb Samba controlats per grups LDAP, i tanca el cicle amb còpies de seguretat i una auditoria funcional de tota la infraestructura.

| :material-clock-outline: Durada | :material-account: Modalitat | :material-book-open-variant: Blocs | :material-school: RA avaluats |
|:---:|:---:|:---:|:---:|
| **12–14 hores** | Individual | **Bloc 1 (transversal, amplia UT2)** | **RA4 · RA5 · RA6** |

## Objectius

- Instal·lar i configurar un servidor **OpenLDAP** a Ubuntu Server, amb estructura, grups i usuaris
- Integrar un client Ubuntu amb OpenLDAP mitjançant **SSSD**
- Protegir el servei LDAP amb **TLS** i una Autoritat de Certificació pròpia
- Implementar **perfils mòbils amb NFSv4** i validar-los des de diversos equips
- Compartir recursos amb **Samba** controlats per grups LDAP
- Integrar un client **Windows 11** amb OpenLDAP mitjançant **pGina**
- Definir una estratègia de còpies de seguretat i recuperació de la infraestructura LDAP
- Auditar funcionalment tota la infraestructura desplegada

## Material necessari

- Ubuntu Server 24.04 LTS — servidor OpenLDAP, NFS i Samba (host multifunció)
- Ubuntu Desktop 24.04 LTS — com a mínim 2 clients, per validar que el perfil mòbil és realment mòbil
- Windows 11 Pro — client integrat amb OpenLDAP via pGina
- Accés SSH al servidor

!!! tip "Relació amb la UT2"
    Aquest projecte parteix dels fonaments d'**OpenLDAP** treballats a la UT2 (estructura del directori, usuaris i grups POSIX, SSSD) i els porta a un escenari de la UT4: protecció amb TLS, perfils mòbils amb NFSv4, compartició amb Samba controlada per LDAP i, sobretot, la integració d'un client **Windows** contra un directori natiu de Linux — el sentit invers del que fas al Bloc 3 (Ubuntu contra AD de Windows). No hi ha una pàgina de bloc dedicada a aquest projecte: totes les activitats i explicacions estan al quadern interactiu.

---

<div class="grid cards" markdown>

- :material-notebook-edit:{ .lg }

    ### Quadern interactiu

    El projecte es desenvolupa íntegrament al **quadern digital**. Completa totes les activitats i documenta les evidències tècniques.

    El quadern es considerarà **APTE** quan totes les activitats hagin estat resoltes i la documentació sigui completa, coherent i suficient.

    [:octicons-arrow-right-24: Obrir el quadern](https://quadern-digital-v11-2.vercel.app/moduls/mp224/unitat_treball4.html?id=p42){ .md-button .md-button--primary }

- :material-book-open-page-variant:{ .lg }

    ### Apunts de la UT4

    Revisa els continguts teòrics de la unitat en qualsevol moment. Pots consultar-los mentre treballes el projecte.

    [:octicons-arrow-right-24: Consultar els apunts](../index.md){ .md-button }

</div>

!!! tip "Recomanacions"
    - Fes servir el mateix servidor per a OpenLDAP, NFS i Samba: no hi ha servidors separats en aquest projecte, tot recau sobre el mateix host.
    - Valida el perfil mòbil des de **dos clients Ubuntu diferents** amb el mateix usuari LDAP, no només des d'un.
    - Documenta cada pas de la configuració TLS: sense la CA instal·lada al client, SSSD rebutjarà la connexió xifrada.
