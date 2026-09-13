---
title: Objectius i requisits · Projecte Integrador UT2
icon: material/target
hide:
  - toc
---

# 2 · Objectius i requisits

## Objectiu general

Dissenyar, implementar, verificar i documentar una infraestructura de xarxa basada en GNU/Linux, aplicant criteris professionals d'organització, administració centralitzada i seguretat.

## Requisits generals

La infraestructura haurà de complir, com a mínim, els requisits següents:

- Configurar la xarxa amb **adreçament estàtic al servidor**.
- Implementar un servei **DHCP** funcional per als equips clients.
- Centralitzar els usuaris mitjançant **LDAP**.
- Gestionar els usuaris i grups mitjançant **LDAP Account Manager (LAM)**.
- Crear una estructura d'usuaris i grups coherent amb l'organització escollida.
- Configurar directoris personals compartits utilitzant **NFS**.
- Garantir que cada usuari només pugui accedir al seu directori personal.
- Aplicar, com a mínim, una política de restricció o control sobre els usuaris (horaris, permisos, shell, etc.).
- Implementar un servidor web **Apache**.
- Integrar l'autenticació del servidor web amb LDAP perquè els usuaris accedeixin amb les seves credencials corporatives.
- Configurar **quotes de disc** per limitar l'espai disponible als usuaris.
- Configurar el servidor DHCP incorporant algun mecanisme de control d'accés als dispositius (reserves, filtratge per MAC o equivalent).
- Verificar el correcte funcionament dels serveis des del client Ubuntu Desktop.

## Llibertat de disseny

Hauràs d'escollir el tipus d'organització que vols simular. Alguns exemples possibles:

- Una empresa de desenvolupament de programari.
- Una acadèmia de formació.
- Una clínica privada.
- Una biblioteca.
- Un ajuntament.
- Una empresa de videojocs.
- Un estudi de disseny.
- Qualsevol altra proposta aprovada pel professor.

A partir de l'organització escollida hauràs de definir:

- El nom de l'organització.
- El domini LDAP.
- L'estructura organitzativa (OU).
- Els departaments o equips.
- Els grups d'usuaris.
- Els diferents perfils d'usuari.
- Les polítiques de permisos i d'accés.

No existeix una única solució correcta; es valorarà especialment que les decisions siguin coherents amb l'escenari plantejat.

## Què es valorarà durant el projecte?

Es valorarà especialment la teva capacitat per:

- Fer funcionar correctament tots els serveis implementats.
- Integrar els diferents components entre ells (LDAP, NFS, Apache, DHCP).
- Resoldre incidències de manera autònoma.
- Documentar el projecte amb qualitat tècnica.
- Justificar tècnicament les decisions preses.
- Mantenir la configuració organitzada i neta.
- Explicar i defensar el projecte davant de preguntes.
- Treballar sense seguir un guió pas a pas.

## Recursos disponibles

### Recursos tècnics

| Recurs | Descripció |
|---|---|
| Servidor | Màquina virtual amb Ubuntu Server 24.04 LTS, amb IP fixa assignada. |
| Client | Màquina virtual amb Ubuntu Desktop 24.04 LTS. |
| Configuració personalitzada | Cada alumne disposa del seu propi rang d'IP, hostname (`srv-cognom`) i usuari personal. |
| Xarxa virtual | Infraestructura de xarxa necessària per al desenvolupament del projecte. |

### Consideracions

Durant el projecte serà responsabilitat de cada alumne:

- Personalitzar el `hostname` i treballar sempre amb l'usuari personal creat, mai amb `root` o `ubuntu`.
- Respectar el rang d'IP i el format de domini LDAP assignats, sense reutilitzar dades d'exemple de l'enunciat.
- Mostrar en cada captura el prompt (`usuari@srv-cognom:~$`) que n'identifiqui l'autoria.
- Validar totes les configuracions abans de considerar-les finalitzades, aportant la prova de funcionament corresponent.
- Elaborar una documentació que reflecteixi fidelment la infraestructura desenvolupada.

!!! danger "Penalitzacions directes"
    A banda de la rúbrica, l'enunciat estableix un seguit de **clàusules de penalització directa** per a faltes greus (manca de personalització, domini LDAP erroni, captures sense prompt, imatges "mudes" sense explicació, manca de verificació, plagi...). Consulta l'enunciat complet en PDF per conèixer-ne el detall abans de començar.

---

<div class="grid cards" markdown>

- :material-arrow-left:{ .lg }

    [:octicons-arrow-left-24: Context i encàrrec](01-context-i-encarrec.md){ .md-button }

- :material-arrow-right:{ .lg }

    [:octicons-arrow-right-24: Desenvolupament (5 fases)](03-desenvolupament.md){ .md-button .md-button--primary }

</div>
