---
title: Objectius i requisits · Projecte Integrador UT3
icon: material/target
hide:
  - toc
---

# 2 · Objectius i requisits

## Objectiu general

Planificar, implementar, validar i documentar una infraestructura corporativa de compartició de recursos per a Pyrenees Outdoor Group, aplicant criteris professionals de seguretat i administració de sistemes Linux.

## Objectius específics

En finalitzar aquest projecte hauràs de ser capaç de:

- Planificar una infraestructura corporativa de compartició de recursos.
- Gestionar usuaris, grups, permisos Unix i ACL quan siguin necessàries.
- Decidir i justificar quan utilitzar Samba i quan NFS.
- Implementar recursos compartits i validar-los des de clients Linux i Windows.
- Comprendre la persistència dels muntatges i el comportament dels UID/GID en NFS.
- Integrar una impressora compartida mitjançant CUPS.
- Experimentar les diferències entre NFS, SMB i CIFS com a formes d'accés a recursos remots.
- Crear i restaurar còpies completa, incremental i diferencial amb `tar`.
- Protegir la infraestructura amb mesures bàsiques de seguretat.
- Integrar de manera coherent un servei transversal de xarxa.
- Diagnosticar incidències i validar globalment la solució.

## Escenari mínim

| Element | Requisit |
|---|---|
| Servidor | 1 servidor Linux |
| Clients | 1 client Linux i 1 client Windows |
| Impressió | 1 impressora compartida (física o PDF virtual) |
| Usuaris | Entre 8 i 20, distribuïts entre Administració, Comercial, Logística i Informàtica |

La distribució exacta d'usuaris, els grups, l'adreçament IP, l'estructura de directoris i la major part de les decisions tècniques les hauràs de definir tu.

## Requisits generals de la infraestructura

Com a mínim, la infraestructura ha de complir:

- Un perfil amb accés ampli, un amb accés limitat i un al qual se li denegui l'accés a algun recurs.
- Permisos Unix coherents, complementats amb ACL quan la política d'accés no es pugui resoldre només amb propietari/grup/altres.
- Com a mínim 3 recursos compartits: almenys 1 amb Samba, almenys 1 amb NFS i almenys 1 amb accés restringit.
- Accés funcional des d'un client Linux i un client Windows quan correspongui.
- Persistència dels muntatges Linux definits com a permanents.
- Una impressora integrada amb CUPS i utilitzable des d'un client.
- Còpies completa, incremental i diferencial amb `tar`, amb restauració demostrada.
- UFW configurat perquè el servidor només exposi els serveis necessaris, més una segona mesura de seguretat (enduriment SSH o política de contrasenyes).
- Un servei transversal de transferència de fitxers (preferentment SFTP).

## Què es valorarà durant el projecte?

Es valorarà especialment la teva capacitat per:

- Fer funcionar correctament tots els serveis implementats.
- Integrar els diferents components (Samba, NFS, CUPS, còpies, seguretat).
- Diagnosticar i resoldre incidències reals.
- Justificar tècnicament les decisions Samba/NFS i la resta de configuracions.
- Documentar el projecte amb qualitat tècnica i evidències representatives.
- Defensar i demostrar la infraestructura durant la microauditoria final.

!!! danger "Microauditoria d'autoria"
    Cada alumne haurà de mostrar i demostrar el funcionament de la infraestructura muntada, sobre la qual se li faran preguntes de validació del servei i d'autoria. No poder-les respondre és motiu de penalització directa (vegeu [Lliurament i avaluació](04-lliurament-i-avaluacio.md)).

---

<div class="grid cards" markdown>

- :material-arrow-left:{ .lg }

    [:octicons-arrow-left-24: Context i encàrrec](01-context-i-encarrec.md){ .md-button }

- :material-arrow-right:{ .lg }

    [:octicons-arrow-right-24: Desenvolupament (11 activitats)](03-desenvolupament.md){ .md-button .md-button--primary }

</div>
