---
title: Desenvolupament · Projecte Integrador UT3
icon: material/rocket-launch-outline
hide:
  - toc
---

# 3 · Desenvolupament del projecte

El projecte es desenvolupa mitjançant **11 activitats consecutives**. Cada activitat inclou:

- **Objectiu**: què es pretén aconseguir.
- **Evidències**: informació que hauràs d'incorporar al dossier tècnic per validar-la.
- **Autoverificació**: comprovacions recomanades abans de continuar.

## Activitat 1 · Anàlisi de necessitats i disseny

**Objectiu.** Analitzar les necessitats de l'empresa abans de començar la implementació. Defineix l'esquema de xarxa, els equips, l'adreçament IP, els usuaris i grups, l'estructura de directoris i els recursos que necessitarà cada departament.

Per cada recurs indica qui l'utilitzarà, quin nivell d'accés necessita (R / RW), des de quins clients s'hi accedirà, si ha d'estar disponible de manera persistent i quin protocol proposes (Samba / NFS).

**Evidències a incorporar al dossier**

- Esquema de xarxa amb servidor, clients, IP i serveis previstos.
- Taula d'usuaris i grups proposats.
- Arbre o esquema dels directoris.
- Taula de recursos completada.
- Justificació breu de les decisions més importants.

**Autoverificació**

- [ ] Has identificat les necessitats de cada departament.
- [ ] La taula de recursos indica accés, clients, persistència i protocol per a cadascun.

## Activitat 2 · Usuaris, grups, directoris i permisos

**Objectiu.** Implementar l'estructura definida. Has de disposar, com a mínim, d'un perfil amb accés ampli, un perfil amb accés limitat i un perfil al qual se li denegui l'accés a algun recurs. Aplica permisos Unix coherents i utilitza ACL quan la política d'accés no es pugui resoldre adequadament només amb propietari, grup i altres.

**Evidències a incorporar al dossier**

- Creació correcta dels usuaris i grups i la seva pertinença.
- Estructura final de directoris amb propietaris i permisos.
- ACL aplicades, si escau.
- Proves funcionals amb els tres perfils (accés ampli, limitat i denegat).
- Explicació de per què els permisos implementats compleixen la política prevista.

**Autoverificació**

- [ ] Els tres perfils (ampli, limitat, denegat) es comporten com estava previst.
- [ ] Les ACL aplicades (si n'hi ha) resolen casos que els permisos Unix bàsics no cobrien.

## Activitat 3 · Implementació de Samba i NFS

**Objectiu.** Implementar els recursos compartits dissenyats fent servir obligatòriament Samba i NFS.

Requisits mínims:

- Com a mínim 3 recursos compartits.
- Almenys 1 recurs Samba i almenys 1 recurs NFS.
- Almenys 1 recurs amb accés restringit.
- Accés des d'un client Linux i un client Windows quan correspongui.
- Persistència dels muntatges definits com a permanents.

Selecciona almenys un recurs (o dos d'equivalents) i analitza què implicaria oferir-lo mitjançant Samba o NFS.

**Evidències a incorporar al dossier**

- Fragments rellevants de `smb.conf` i `/etc/exports`.
- Verificació dels serveis actius i dels recursos publicats.
- Accés funcional des dels clients previstos.
- Prova de lectura i escriptura en almenys un recurs Samba i un NFS.
- Prova d'accés denegat a un usuari no autoritzat.
- Prova de comportaments diferents entre usuaris.
- Verificació dels muntatges persistents després d'un reinici.
- Taula de l'Activitat 1 actualitzada amb la decisió definitiva i justificació Samba/NFS.

**Autoverificació**

- [ ] Hi ha almenys un recurs Samba, un NFS i un amb accés restringit.
- [ ] Els muntatges persistents sobreviuen a un reinici.
- [ ] Pots justificar per què cada recurs és Samba o NFS i no l'altre.

## Activitat 4 · Laboratori d'identitat i permisos NFS: UID/GID

**Objectiu.** Investigar experimentalment com NFS interpreta la propietat dels fitxers. Consulta els UID i GID d'usuaris rellevants al servidor i al client, crea fitxers des dels dos sistemes i observa'n el propietari. Si l'entorn ho permet, provoca de manera controlada una discrepància d'UID o GID, observa el resultat i després restableix una configuració coherent.

**Evidències a incorporar al dossier**

- UID/GID dels usuaris seleccionats al servidor i al client.
- Fitxer creat des del client NFS i propietari observat al client i al servidor.
- Resultat de la prova amb identitats coherents.
- Resultat d'una discrepància controlada, si s'ha realitzat.
- Explicació tècnica de la relació entre UID/GID i permisos NFS.
- Validació final que el recurs torna a funcionar segons la política prevista.

**Autoverificació**

- [ ] Saps explicar per què un mateix UID pot significar usuaris diferents al servidor i al client.
- [ ] El recurs ha tornat a un estat coherent després de la prova controlada.

## Activitat 5 · Integració d'una impressora compartida

**Objectiu.** Integrar una impressora mitjançant CUPS (física o PDF virtual) per demostrar que la infraestructura també pot compartir un recurs d'impressió.

**Evidències a incorporar al dossier**

- Servei CUPS operatiu i impressora publicada.
- Client configurat per utilitzar-la.
- Treball d'impressió enviat des del client.
- Evidència que el treball s'ha processat correctament.
- Justificació breu de l'avantatge de centralitzar aquest recurs.

**Autoverificació**

- [ ] El client imprimeix sense necessitat de configuració addicional al servidor.
- [ ] El treball d'impressió es pot verificar (fitxer generat, cua, o equivalent).

## Activitat 6 · Laboratori: NFS, SMB i CIFS com a destinació de còpies

**Objectiu.** Observar que una mateixa ubicació remota pot oferir possibilitats diferents segons el protocol i la manera com el sistema hi accedeix.

- **NFS muntat**: munta un espai NFS al client Linux i genera-hi directament un arxiu de còpia amb `tar`.
- **Samba amb `smbclient`**: accedeix a un espai Samba equivalent amb `smbclient`, transfereix un `.tar`, consulta'l, recupera'l, canvia'l de nom i elimina'l. Comprova si `tar` pot utilitzar directament una ruta SMB.
- **Samba muntat amb CIFS**: munta el recurs amb CIFS i repeteix la creació directa d'un arxiu amb `tar` al punt de muntatge, comparant-ne el comportament.

**Evidències a incorporar al dossier**

- Creació real d'un `.tar` directament sobre NFS i consulta del contingut.
- Operacions sobre el backup mitjançant `smbclient`.
- Prova de l'ús d'una ruta SMB directament amb `tar` i explicació del resultat.
- Muntatge CIFS i creació real d'un `.tar` al punt de muntatge.
- Taula comparativa (forma d'accés, escriptura directa amb `tar`, operacions, permisos/propietari, UID/GID observats, restauració).
- Restauració d'un fitxer des de NFS i des de Samba/CIFS.
- Conclusió sobre la diferència entre un client de protocol i un recurs muntat al sistema de fitxers.

**Autoverificació**

- [ ] La taula comparativa reflecteix diferències reals observades, no suposicions.
- [ ] Saps explicar per què `tar` no pot escriure directament sobre una ruta `smbclient`.

## Activitat 7 · Còpies completa, incremental i diferencial amb tar

**Objectiu.** Seleccionar dades representatives dels recursos compartits i/o configuracions importants del servidor i implementar:

- **Completa**: conté totes les dades seleccionades.
- **Incremental**: després de produir canvis, conté els canvis respecte de l'estat anterior de la cadena.
- **Diferencial**: representa els canvis acumulats respecte de la còpia completa de referència.
- **Restauració**: simula la pèrdua o modificació d'un fitxer i recupera'l amb la còpia o combinació adequada.

*Ampliació opcional*: segona incremental i/o diferencial, automatització, planificació, compressió, rotació o registre de les execucions.

**Evidències a incorporar al dossier**

- Dades seleccionades per protegir i justificació.
- Procediment o comandes utilitzades.
- Contingut verificat de cadascuna de les tres còpies.
- Canvis introduïts entre còpies, suficients per demostrar-ne les diferències.
- Mida real dels arxius generats.
- Taula comparativa (què conté, mida, què cal per restaurar, avantatge/inconvenient).
- Eliminació o alteració controlada d'un fitxer.
- Restauració i verificació de les dades recuperades.
- Proposta argumentada de política de còpies per a l'empresa.

**Autoverificació**

- [ ] Les tres còpies (completa, incremental, diferencial) contenen exactament el que haurien de contenir.
- [ ] La restauració recupera correctament el fitxer eliminat o alterat.

## Activitat 8 · Protecció de la infraestructura

**Objectiu.** Configurar obligatòriament **UFW** perquè el servidor només exposi els serveis necessaris als orígens adequats. Afegeix una segona mesura de seguretat: enduriment SSH o política de contrasenyes amb requisits mínims coherents. Les mesures no han d'impedir el funcionament legítim de Samba, NFS, CUPS i la resta de serveis necessaris.

**Evidències a incorporar al dossier**

- Regles UFW implementades i estat final del tallafoc.
- Prova positiva d'un accés autoritzat.
- Prova negativa d'una connexió o accés que hagi de quedar restringit.
- Configuració de la segona mesura seleccionada.
- Prova funcional que demostri que la segona mesura s'aplica.
- Explicació de com aquestes mesures protegeixen concretament la infraestructura desplegada.

**Autoverificació**

- [ ] Samba, NFS i CUPS continuen funcionant amb el tallafoc actiu.
- [ ] Hi ha una prova positiva i una de negativa per a cada mesura aplicada.

## Activitat 9 · Servei transversal de transferència de fitxers

**Objectiu.** Integrar preferentment un servei **SFTP** que permeti transferir fitxers de manera segura, i analitzar breument en què es diferencia el seu ús del dels recursos Samba i NFS. També es pot proposar una alternativa (com Apache) sempre que se'n justifiqui prèviament la utilitat i la relació amb la infraestructura.

**Evidències a incorporar al dossier**

- Servei seleccionat i justificació.
- Servei operatiu i configuració principal.
- Prova funcional des d'un client.
- Pujada i descàrrega d'un fitxer (SFTP).
- Comparació breu entre SFTP i els recursos Samba/NFS des del punt de vista de la necessitat que resolen.

**Autoverificació**

- [ ] El servei transversal funciona de manera independent de Samba i NFS.
- [ ] Saps explicar quina necessitat cobreix aquest servei que Samba/NFS no cobreixen.

## Activitat 10 · Validació global i diagnosi

**Objectiu.** Dissenyar una bateria final de proves que cobreixi Samba, NFS, permisos/UID-GID, persistència, CUPS, còpies/restauració, UFW/seguretat i el servei transversal, indicant per cadascun la prova, el resultat esperat, el resultat obtingut i l'evidència.

Documenta també almenys una **incidència tècnica real** seguint l'esquema: símptoma → hipòtesis → comprovacions → causa → solució → validació.

**Evidències a incorporar al dossier**

- Taula de validació completada.
- Evidències representatives de les proves positives i negatives.
- Verificació després d'un reinici quan sigui rellevant.
- Prova final de restauració.
- Diagnosi completa d'una incidència real.
- Confirmació que la implementació final respon al disseny, o justificació dels canvis introduïts.

**Autoverificació**

- [ ] La taula de validació cobreix tots els serveis implementats, no només els més senzills.
- [ ] La incidència documentada segueix l'esquema símptoma → hipòtesis → comprovacions → causa → solució → validació.

## Activitat 11 · Dossier tècnic i microauditoria

**Objectiu.** Construir progressivament el dossier tècnic amb les evidències de les activitats anteriors, organitzat perquè un altre tècnic pugui entendre, revisar i reproduir la infraestructura: context i necessitats, disseny de xarxa, usuaris/grups/permisos, mapa de recursos i justificació Samba/NFS, configuracions i persistència, UID/GID, CUPS, laboratori NFS/SMB/CIFS, còpies i restauració, seguretat, servei transversal, validació i incidència, conclusions i possibles millores.

En finalitzar, el professor podrà realitzar una **microauditoria pràctica** breu: modificar un permís, crear o adaptar un usuari, comprovar un muntatge, justificar Samba o NFS, verificar una regla de seguretat o recuperar un fitxer.

**Evidències a incorporar al dossier**

- Dossier tècnic complet, ordenat i sense duplicacions innecessàries.
- Annexos amb els fitxers de configuració rellevants.
- Coherència entre disseny, implementació i proves.
- Execució correcta i explicació tècnica de la verificació o modificació sol·licitada durant la microauditoria.

**Autoverificació**

- [ ] No cal repetir captures ni proves ja documentades en activitats anteriors.
- [ ] Podries respondre, sense preparació prèvia, a una pregunta sobre qualsevol part de la infraestructura.

---

<div class="grid cards" markdown>

- :material-arrow-left:{ .lg }

    [:octicons-arrow-left-24: Objectius i requisits](02-objectius-i-requisits.md){ .md-button }

- :material-arrow-right:{ .lg }

    [:octicons-arrow-right-24: Lliurament i avaluació](04-lliurament-i-avaluacio.md){ .md-button .md-button--primary }

</div>
