---
title: Desenvolupament · Projecte Integrador UT2
icon: material/rocket-launch-outline
hide:
  - toc
---

# 3 · Desenvolupament del projecte

El projecte es desenvolupa mitjançant **cinc fases consecutives**. Tot i que pots organitzar el teu treball amb certa flexibilitat, es recomana seguir aquest ordre per facilitar la implementació, la verificació i la documentació de la infraestructura.

Cada fase inclou:

- **Objectiu**: què es pretén aconseguir.
- **Tasques**: treball que hauràs de desenvolupar.
- **Evidències**: informació que hauràs d'incorporar a la documentació.
- **Autoverificació**: comprovacions recomanades abans de continuar.

## FASE 0 · Personalització i preparació

**Objectiu.** Deixar l'entorn de treball correctament identificat abans de començar cap configuració.

**Tasques**

- Personalitzar el `hostname` del servidor (`srv-cognom`).
- Crear el teu usuari personal i treballar sempre amb ell (mai amb `root` ni `ubuntu`).
- Comprovar el rang d'IP assignat.

**Evidències a incorporar a la documentació**

- Captura del `hostname` configurat.
- Captura de l'usuari personal creat i del seu prompt.

**Autoverificació**

- [ ] El hostname identifica clarament l'alumne.
- [ ] Treballes amb el teu usuari personal, no amb `root`/`ubuntu`.

## FASE 1 · Disseny de l'organització i de la infraestructura

**Objectiu.** Escollir l'escenari, definir l'organització i planificar l'estructura abans d'implementar res.

**Tasques**

- Escollir el tipus d'organització que simularàs.
- Definir el nom de l'organització i el domini LDAP (format `i-cognom-it.local`).
- Dissenyar l'estructura organitzativa (OU), els departaments, els grups i els perfils d'usuari.
- Planificar l'adreçament IP (estàtic al servidor, DHCP per als clients).

**Evidències a incorporar a la documentació**

- Descripció de l'organització escollida.
- Esquema de xarxa i configuració IP prevista.
- Disseny de l'estructura LDAP (OU, grups, usuaris).
- Justificació de les decisions de disseny.

**Autoverificació**

- [ ] L'organització és coherent amb els serveis que implementaràs.
- [ ] El domini LDAP i l'estructura d'OU estan definits i justificats.

## FASE 2 · Xarxa, DHCP i autenticació LDAP

**Objectiu.** Deixar el servidor connectat i el directori centralitzat operatiu.

**Tasques**

- Configurar l'adreçament estàtic al servidor.
- Implementar el servidor DHCP i afegir un mecanisme de control d'accés (reserves o filtratge per MAC).
- Instal·lar i configurar el servei LDAP.
- Gestionar usuaris i grups mitjançant LDAP Account Manager (LAM).
- Crear l'estructura d'usuaris i grups definida a la Fase 1.

**Evidències a incorporar a la documentació**

- Configuració de xarxa i DHCP.
- Estructura LDAP creada (captures des de LAM o `ldapsearch`).
- Usuaris i grups configurats.

**Autoverificació**

- [ ] El servidor té IP fixa i el client obté IP per DHCP.
- [ ] El directori LDAP respon correctament (`ldapsearch`, `ldapwhoami`).
- [ ] Els usuaris i grups reflecteixen l'estructura dissenyada.

## FASE 3 · Recursos compartits, web i seguretat

**Objectiu.** Implementar els serveis que consumeixen la identitat centralitzada i protegir els recursos.

**Tasques**

- Configurar els directoris personals compartits amb NFS, garantint que cada usuari només accedeixi al seu.
- Aplicar, com a mínim, una política de restricció sobre els usuaris (horaris, permisos, shell...).
- Implementar el servidor web Apache i integrar-hi l'autenticació LDAP.
- Configurar les quotes de disc per usuari.
- Activar i configurar el tallafoc (UFW) i altres polítiques de seguretat.

**Evidències a incorporar a la documentació**

- Configuració de NFS i comprovació dels permisos.
- Configuració d'Apache amb autenticació LDAP.
- Configuració de les quotes de disc.
- Configuració de les polítiques de seguretat (UFW, restriccions).

**Autoverificació**

- [ ] Cada usuari només accedeix al seu directori personal per NFS.
- [ ] L'accés a Apache exigeix credencials LDAP vàlides.
- [ ] Les quotes de disc limiten l'espai correctament.
- [ ] El tallafoc només permet els serveis necessaris.

## FASE 4 · Verificació, documentació i defensa

**Objectiu.** Comprovar el funcionament global de la infraestructura des del client i preparar el lliurament.

**Tasques**

- Verificar des del client Ubuntu Desktop: connectivitat, inici de sessió amb LDAP, muntatge NFS, accés a Apache i comportament de les quotes.
- Redactar la documentació tècnica seguint l'estructura del [lliurament](04-lliurament-i-avaluacio.md).
- Organitzar les evidències i revisar-ne la qualitat (prompt visible, text explicatiu, captures contextualitzades).
- Preparar la defensa oral del projecte.

**Evidències a incorporar a la documentació**

- Captures de totes les verificacions realitzades des del client.
- Problemes trobats i com s'han resolt.
- Conclusions i reflexió final.

**Autoverificació**

- [ ] Tots els serveis s'han verificat des del client, no només des del servidor.
- [ ] Cada captura té text explicatiu previ i mostra el prompt personalitzat.
- [ ] La documentació està completa i llesta per a la defensa oral.

---

<div class="grid cards" markdown>

- :material-arrow-left:{ .lg }

    [:octicons-arrow-left-24: Objectius i requisits](02-objectius-i-requisits.md){ .md-button }

- :material-arrow-right:{ .lg }

    [:octicons-arrow-right-24: Lliurament i avaluació](04-lliurament-i-avaluacio.md){ .md-button .md-button--primary }

</div>
