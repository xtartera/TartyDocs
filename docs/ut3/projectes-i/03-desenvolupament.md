---
title: Desenvolupament · Projecte Integrador UT3
icon: material/rocket-launch-outline
hide:
  - toc
---

# 3 · Desenvolupament del projecte

El projecte es desenvolupa mitjançant **11 activitats consecutives**. Cada activitat inclou el treball a realitzar i les evidències que hauràs d'incorporar al dossier tècnic per validar-la.

## Activitat 1 · Anàlisi de necessitats i disseny

Analitza les necessitats de l'empresa abans de començar la implementació. Defineix l'esquema de xarxa, els equips, l'adreçament IP, els usuaris i grups, l'estructura de directoris i els recursos que necessitarà cada departament.

Per cada recurs indica qui l'utilitzarà, quin nivell d'accés necessita (R / RW), des de quins clients s'hi accedirà, si ha d'estar disponible de manera persistent i quin protocol proposes (Samba / NFS).

**Evidències**: esquema de xarxa amb servidor, clients, IP i serveis previstos · taula d'usuaris i grups proposats · arbre o esquema dels directoris · taula de recursos completada · justificació breu de les decisions més importants.

## Activitat 2 · Usuaris, grups, directoris i permisos

Implementa l'estructura definida. Has de disposar, com a mínim, d'un perfil amb accés ampli, un perfil amb accés limitat i un perfil al qual se li denegui l'accés a algun recurs. Aplica permisos Unix coherents i utilitza ACL quan la política d'accés no es pugui resoldre adequadament només amb propietari, grup i altres.

**Evidències**: creació correcta dels usuaris i grups i la seva pertinença · estructura final de directoris amb propietaris i permisos · ACL aplicades (si escau) · proves funcionals amb els tres perfils (accés ampli, limitat i denegat) · explicació de per què els permisos implementats compleixen la política prevista.

## Activitat 3 · Implementació de Samba i NFS

Implementa els recursos compartits dissenyats fent servir obligatòriament Samba i NFS: com a mínim 3 recursos compartits, almenys 1 Samba, almenys 1 NFS, almenys 1 amb accés restringit; accés des d'un client Linux i un client Windows quan correspongui; persistència dels muntatges definits com a permanents.

Selecciona almenys un recurs (o dos d'equivalents) i analitza què implicaria oferir-lo mitjançant Samba o NFS.

**Evidències**: fragments rellevants de `smb.conf` i `/etc/exports` · verificació dels serveis actius i dels recursos publicats · accés funcional des dels clients previstos · prova de lectura i escriptura en almenys un recurs Samba i un NFS · prova d'accés denegat a un usuari no autoritzat · prova de comportaments diferents entre usuaris · verificació dels muntatges persistents després d'un reinici · taula de l'Activitat 1 actualitzada amb la decisió definitiva i justificació Samba/NFS.

## Activitat 4 · Laboratori d'identitat i permisos NFS: UID/GID

Investiga experimentalment com NFS interpreta la propietat dels fitxers. Consulta els UID i GID d'usuaris rellevants al servidor i al client, crea fitxers des dels dos sistemes i observa'n el propietari. Si l'entorn ho permet, provoca de manera controlada una discrepància d'UID o GID, observa el resultat i després restableix una configuració coherent.

**Evidències**: UID/GID dels usuaris al servidor i al client · fitxer creat des del client NFS i propietari observat als dos costats · resultat amb identitats coherents · resultat d'una discrepància controlada (si s'ha fet) · explicació tècnica de la relació UID/GID–permisos NFS · validació final del recurs.

## Activitat 5 · Integració d'una impressora compartida

Integra una impressora mitjançant CUPS (física o PDF virtual) per demostrar que la infraestructura també pot compartir un recurs d'impressió.

**Evidències**: servei CUPS operatiu i impressora publicada · client configurat per utilitzar-la · treball d'impressió enviat des del client · evidència que el treball s'ha processat correctament · justificació breu de l'avantatge de centralitzar aquest recurs.

## Activitat 6 · Laboratori: NFS, SMB i CIFS com a destinació de còpies

Observa que una mateixa ubicació remota pot oferir possibilitats diferents segons el protocol i la manera com el sistema hi accedeix:

- **NFS muntat**: munta un espai NFS al client Linux i genera-hi directament un arxiu de còpia amb `tar`.
- **Samba amb `smbclient`**: accedeix a un espai Samba equivalent amb `smbclient`, transfereix un `.tar`, consulta'l, recupera'l, canvia'l de nom i elimina'l. Comprova si `tar` pot utilitzar directament una ruta SMB.
- **Samba muntat amb CIFS**: munta el recurs amb CIFS i repeteix la creació directa d'un arxiu amb `tar` al punt de muntatge, comparant-ne el comportament.

**Evidències**: creació real d'un `.tar` directament sobre NFS i consulta del contingut · operacions sobre el backup mitjançant `smbclient` · prova de l'ús d'una ruta SMB directament amb `tar` i explicació del resultat · muntatge CIFS i creació real d'un `.tar` al punt de muntatge · taula comparativa (forma d'accés, escriptura directa amb `tar`, operacions, permisos/propietari, UID/GID observats, restauració) · restauració d'un fitxer des de NFS i des de Samba/CIFS · conclusió sobre la diferència entre un client de protocol i un recurs muntat al sistema de fitxers.

## Activitat 7 · Còpies completa, incremental i diferencial amb tar

Selecciona dades representatives dels recursos compartits i/o configuracions importants del servidor i implementa:

- **Completa**: conté totes les dades seleccionades.
- **Incremental**: després de produir canvis, conté els canvis respecte de l'estat anterior de la cadena.
- **Diferencial**: representa els canvis acumulats respecte de la còpia completa de referència.
- **Restauració**: simula la pèrdua o modificació d'un fitxer i recupera'l amb la còpia o combinació adequada.

**Evidències**: dades seleccionades i justificació · procediment o comandes utilitzades · contingut verificat de les tres còpies · canvis introduïts entre còpies · mida real dels arxius generats · taula comparativa (què conté, mida, què cal per restaurar, avantatge/inconvenient) · eliminació o alteració controlada d'un fitxer · restauració i verificació de les dades recuperades · proposta argumentada de política de còpies per a l'empresa.

*Ampliació opcional*: segona incremental i/o diferencial, automatització, planificació, compressió, rotació o registre de les execucions.

## Activitat 8 · Protecció de la infraestructura

Configura obligatòriament **UFW** perquè el servidor només exposi els serveis necessaris als orígens adequats. Afegeix una segona mesura de seguretat: enduriment SSH o política de contrasenyes amb requisits mínims coherents. Les mesures no han d'impedir el funcionament legítim de Samba, NFS, CUPS i la resta de serveis necessaris.

**Evidències**: regles UFW implementades i estat final del tallafoc · prova positiva d'un accés autoritzat · prova negativa d'un accés que hagi de quedar restringit · configuració de la segona mesura seleccionada · prova funcional que en demostri l'aplicació · explicació de com aquestes mesures protegeixen la infraestructura desplegada.

## Activitat 9 · Servei transversal de transferència de fitxers

Integra preferentment un servei **SFTP** que permeti transferir fitxers de manera segura, i analitza breument en què es diferencia el seu ús del dels recursos Samba i NFS. També es pot proposar una alternativa (com Apache) sempre que se'n justifiqui prèviament la utilitat i la relació amb la infraestructura.

**Evidències**: servei seleccionat i justificació · servei operatiu i configuració principal · prova funcional des d'un client · pujada i descàrrega d'un fitxer (SFTP) · comparació breu entre SFTP i els recursos Samba/NFS.

## Activitat 10 · Validació global i diagnosi

Dissenya una bateria final de proves que cobreixi Samba, NFS, permisos/UID-GID, persistència, CUPS, còpies/restauració, UFW/seguretat i el servei transversal, indicant per cadascun la prova, el resultat esperat, el resultat obtingut i l'evidència.

Documenta també almenys una **incidència tècnica real** seguint l'esquema: símptoma → hipòtesis → comprovacions → causa → solució → validació.

**Evidències**: taula de validació completada · proves positives i negatives representatives · verificació després d'un reinici quan sigui rellevant · prova final de restauració · diagnosi completa d'una incidència real · confirmació que la implementació final respon al disseny (o justificació dels canvis introduïts).

## Activitat 11 · Dossier tècnic i microauditoria

El dossier tècnic es construeix progressivament amb les evidències de les activitats anteriors: context i necessitats, disseny de xarxa, usuaris/grups/permisos, mapa de recursos i justificació Samba/NFS, configuracions i persistència, UID/GID, CUPS, laboratori NFS/SMB/CIFS, còpies i restauració, seguretat, servei transversal, validació i incidència, conclusions i possibles millores.

En finalitzar, el professor podrà realitzar una **microauditoria pràctica** breu: modificar un permís, crear o adaptar un usuari, comprovar un muntatge, justificar Samba o NFS, verificar una regla de seguretat o recuperar un fitxer.

**Evidències**: dossier tècnic complet, ordenat i sense duplicacions innecessàries · annexos amb els fitxers de configuració rellevants · coherència entre disseny, implementació i proves · execució correcta i explicació tècnica de la verificació o modificació sol·licitada durant la microauditoria.

---

<div class="grid cards" markdown>

- :material-arrow-left:{ .lg }

    [:octicons-arrow-left-24: Objectius i requisits](02-objectius-i-requisits.md){ .md-button }

- :material-arrow-right:{ .lg }

    [:octicons-arrow-right-24: Lliurament i avaluació](04-lliurament-i-avaluacio.md){ .md-button .md-button--primary }

</div>
