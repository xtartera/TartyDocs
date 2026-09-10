---
title: Lliurament i avaluació · Projecte Integrador UT1
icon: material/clipboard-check-outline
hide:
  - toc
---

# 4 · Lliurament i avaluació

## Producte final: el dossier tècnic

El dossier tècnic és el document que recull tot el procés de desenvolupament del projecte. La seva finalitat és descriure la infraestructura implantada, justificar les decisions tècniques adoptades i demostrar, mitjançant evidències objectives, que la solució compleix els requisits establerts.

Per facilitar una presentació homogènia, es recomana seguir la següent estructura:

| Apartat | Contingut mínim |
|---|---|
| 1. Portada | Identificació del projecte i de l'autor. |
| 2. Índex | Relació dels apartats del document. |
| 3. Introducció | Presentació del projecte, objectius i context. |
| 4. Disseny de la infraestructura | Proposta tècnica i justificació de les decisions adoptades. |
| 5. Implantació | Desenvolupament dels serveis configurats i incidències més rellevants. |
| 6. Validació | Proves de funcionament i evidències que demostrin el correcte funcionament de la infraestructura. |
| 7. Auditoria i propostes de millora | Valoració crítica del projecte i possibles ampliacions o millores. |
| 8. Conclusions | Reflexió final sobre el treball desenvolupat. |
| 9. Annexos | Informació complementària, scripts, captures addicionals o altres documents de suport. |

!!! note "Recomanacions generals"
    El dossier ha de presentar una estructura clara i ordenada, amb un llenguatge tècnic adequat, incloent únicament la informació necessària per comprendre la infraestructura desenvolupada. Les captures de pantalla i les evidències han d'estar contextualitzades i relacionades amb les configuracions o validacions que es volen documentar.

    L'objectiu final és elaborar un document tècnic que permeti a qualsevol administrador comprendre la infraestructura implantada i facilitar-ne el manteniment futur.

## Com s'avaluarà el projecte?

L'avaluació no es basa únicament en el funcionament de la infraestructura. També es valora la qualitat del treball desenvolupat, la justificació de les decisions tècniques, la documentació presentada i la manera de treballar durant tot el projecte.

La qualificació final s'obté a partir de tres blocs:

| Bloc d'avaluació | Què es valora? | Pes |
|---|---|---|
| Documentació i planificació | Qualitat del dossier, planificació inicial, justificació de les decisions tècniques, presentació de les evidències i qualitat general de la documentació. | 30 % |
| Implantació tècnica | Configuració correcta de la infraestructura, desplegament dels serveis, compliment dels requisits del projecte i funcionament global de la solució implementada. | 50 % |
| Validació i competència professional | Comprovació del funcionament dels serveis, resolució d'incidències, autonomia, organització del treball i qualitat final del projecte. | 20 % |

### Què es tindrà especialment en compte?

- Que la infraestructura compleixi tots els requisits plantejats.
- Que les decisions tècniques estiguin justificades.
- Que les configuracions siguin coherents i funcionals.
- Que les proves de validació demostrin el correcte funcionament dels serveis.
- Que el dossier tècnic sigui clar, ordenat i professional.
- Que les captures de pantalla i les evidències siguin suficients i estiguin ben contextualitzades.
- Que el projecte reflecteixi autonomia, iniciativa i una metodologia de treball adequada.

### Nivells de la rúbrica

Cada criteri d'avaluació pot obtenir un dels quatre nivells següents:

| Nivell | Significat |
|---|---|
| 1 | El criteri no s'ha assolit o presenta errors importants. |
| 4 | El criteri s'ha assolit parcialment, però necessita millores significatives. |
| 7 | El criteri s'ha assolit correctament i compleix els requisits del projecte. |
| 10 | El criteri s'ha assolit amb un nivell de qualitat tècnica i documental excel·lent. |

La rúbrica es distribueix en 3 grans blocs (**A. Qualitat del document**, **B. Implantació tècnica**, **C. Validació i competència professional**) i 34 ítems concrets, sobre una puntuació màxima de 1.000 punts.

!!! info "Rúbrica completa"
    La rúbrica detallada, ítem per ítem, amb els descriptors de cada nivell i la seva puntuació Moodle, és una eina de correcció del professorat i no es publica en aquest manual. Consulta-la a Moodle o demana-la al professor si la necessites per preparar el lliurament.

## Resultats d'Aprenentatge treballats

Aquest projecte contribueix al desenvolupament i a l'avaluació dels Resultats d'Aprenentatge (RA) del mòdul MP04 – Sistemes Operatius en Xarxa:

| Resultat d'Aprenentatge | Pes | Justificació |
|---|---|---|
| RA1. Instal·la i configura sistemes operatius en xarxa | 10 % | Correspon a la preparació inicial de la infraestructura (instal·lació, configuració bàsica del servidor i preparació de l'entorn de treball). |
| RA2. Administra serveis de directori | 35 % | Nucli del projecte: implantació i administració d'Active Directory, Unitats Organitzatives, usuaris, grups i equips, i administració centralitzada del domini. |
| RA3. Administra recursos compartits i polítiques de gestió | 25 % | Recursos compartits, permisos NTFS, unitats de xarxa, GPO i gestió dels perfils d'usuari. |
| RA4. Administra els serveis de xarxa | 20 % | Configuració i verificació de DNS, DHCP, integració dels clients i administració amb PowerShell. |
| RA5. Manté i documenta la infraestructura | 10 % | Transversal durant tot el projecte: validació, resolució d'incidències, documentació tècnica i dossier final. |
| **Total** | **100 %** | La suma de tots els RA representa la totalitat de la qualificació del projecte. |

## Correspondència amb els Criteris d'Avaluació (CA)

| Resultat d'Aprenentatge | Criteris d'Avaluació treballats | Aplicació dins del projecte |
|---|---|---|
| RA1 | 1.1 · 1.2 · 1.3 · 1.4 | Instal·lació i configuració inicial del servidor, preparació de la infraestructura i configuració bàsica del sistema. |
| RA2 | 2.1 · 2.2 · 2.3 · 2.4 · 2.5 | Implantació i administració del domini, Active Directory, Unitats Organitzatives, usuaris, grups i equips. |
| RA3 | 3.1 · 3.2 · 3.3 · 3.4 · 3.5 | Configuració de recursos compartits, permisos, unitats de xarxa, perfils d'usuari i polítiques de grup. |
| RA4 | 4.1 · 4.2 · 4.3 · 4.4 | Configuració dels serveis de xarxa, integració dels clients, validació funcional i administració mitjançant PowerShell. |
| RA5 | 5.1 · 5.2 · 5.3 | Resolució d'incidències, documentació tècnica, validació final i auditoria de la infraestructura. |

Un mateix criteri d'avaluació pot ser treballat en diferents fases del projecte i quedar evidenciat mitjançant diverses activitats o proves de validació; la qualificació no es determina a partir d'una única activitat, sinó del conjunt d'evidències aportades al llarg del desenvolupament del projecte.

---

<div class="grid cards" markdown>

- :material-arrow-left:{ .lg }

    [:octicons-arrow-left-24: Desenvolupament (6 fases)](03-desenvolupament.md){ .md-button }

- :material-home:{ .lg }

    [:octicons-arrow-right-24: Tornar a la presentació](index.md){ .md-button .md-button--primary }

</div>
