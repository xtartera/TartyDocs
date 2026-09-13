---
title: Context i encàrrec · Projecte Integrador UT2
icon: material/office-building-outline
hide:
  - toc
---

# 1 · Context i encàrrec

## Situació inicial

Una petita organització t'ha contractat com a administrador/a de sistemes perquè despleguis la seva nova infraestructura informàtica basada en **GNU/Linux**.

L'empresa encara no disposa de servidors ni de cap sistema d'administració centralitzada: fins ara els equips han funcionat de manera aïllada, sense autenticació comuna, sense recursos compartits ni cap política de seguretat homogènia.

Per resoldre-ho, hauràs de dissenyar i implementar una solució funcional utilitzant dues màquines virtuals: **Ubuntu Server 24.04 LTS**, que farà de servidor, i **Ubuntu Desktop 24.04 LTS**, que simularà un equip client de l'organització.

## Fitxa resum del projecte

| Apartat | Informació |
|---|---|
| Client | Organització a definir per tu mateix/a (veure [Objectius i requisits](02-objectius-i-requisits.md)) |
| Sector | Lliure: acadèmia, clínica, biblioteca, ajuntament, estudi de disseny, empresa de programari... |
| Projecte | Disseny i implementació d'una infraestructura de xarxa Linux |
| Situació inicial | Sense servidors ni infraestructura centralitzada. |
| Problema detectat | Manca d'autenticació centralitzada, de recursos compartits segurs i de polítiques d'accés comunes. |
| Rol assignat | Administrador/a de sistemes responsable del disseny, implementació, verificació i documentació de la infraestructura. |
| Infraestructura prevista | Adreçament IP estàtic al servidor, DHCP per als clients, directori LDAP administrat amb LAM, usuaris i grups centralitzats, directoris personals amb NFS, servidor web Apache amb autenticació LDAP, quotes de disc i polítiques de seguretat (UFW, restriccions d'accés). |

## Punt de partida

**No existeix una única solució correcta.** Tu ets qui decideix quina organització simula la infraestructura, quin domini LDAP utilitza i com s'estructuren els usuaris, els grups i els permisos. La responsabilitat d'analitzar les necessitats, prendre les decisions i justificar-les tècnicament és teva.

Al llarg del projecte hauràs de demostrar que ets capaç de treballar amb criteri professional: integrar els serveis de xarxa estudiats durant la unitat, resoldre incidències de manera autònoma i documentar el resultat amb rigor.

## L'encàrrec professional

Se t'ha encarregat el disseny i la implementació d'una infraestructura de xarxa Linux que centralitzi l'autenticació, protegeixi els recursos compartits i ofereixi accés web autenticat als usuaris de l'organització.

La infraestructura haurà de donar resposta als requisits generals del projecte i incorporar totes les decisions de disseny que tu defineixis per a la teva organització.

Per aconseguir-ho hauràs d'escollir un escenari propi, dissenyar l'estructura del directori, implementar els serveis necessaris i demostrar-ne el correcte funcionament des del client.

---

<div class="grid cards" markdown>

- :material-arrow-left:{ .lg }

    [:octicons-arrow-left-24: Tornar a la presentació](index.md){ .md-button }

- :material-arrow-right:{ .lg }

    [:octicons-arrow-right-24: Objectius i requisits](02-objectius-i-requisits.md){ .md-button .md-button--primary }

</div>
