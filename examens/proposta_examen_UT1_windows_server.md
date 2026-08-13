# Proposta d'examen competencial · UT1 — Windows Server 2022

**Mòdul:** Sistemes Operatius en Xarxa · **Curs:** 2n CFGM SMX
**Durada orientativa:** 2 h · **Puntuació total:** 100 punts

> Examen d'activitats competencials (comprensió i aplicació, no memorització).
> Justifica sempre les teves respostes: es valora el raonament, no només el resultat.

**Nom i cognoms:** ______________________________  **Data:** ____________  **Grup:** ______

---

## Activitats

### 1. Cas pràctic — Dimensionament d'una VM *(4 punts)*
L'institut vol muntar un Windows Server 2022 virtualitzat que farà de Controlador de Domini per a 40 equips d'aula i un servidor de fitxers. Un company proposa crear la VM amb 1 GB de RAM, 1 vCPU i un disc dinàmic de 25 GB.
Indica **quins d'aquests paràmetres consideres insuficients o arriscats i per què**, i proposa una configuració alternativa justificada (RAM, disc, tipus de disc, xarxa). Relaciona cada decisió amb el rol que farà el servidor.

*Criteris de correcció:* identifica com a mínim 3 paràmetres problemàtics amb justificació tècnica lligada al rol de DC + servidor de fitxers; la proposta alternativa és coherent i realista.

---

### 2. Detecció d'errors — Pla de particionament *(5 punts)*
Un tècnic documenta així la instal·lació d'un servidor: *"He creat una única partició de 100 GB formatada en FAT32 per aprofitar tot el disc, i hi he posat el sistema, les dades compartides i els perfils. Com que és un servidor, he desactivat el fitxer de paginació per guanyar espai."*
Localitza **tots els errors o males decisions** d'aquest plantejament i corregeix-los explicant el motiu de cada correcció.

*Criteris de correcció:* detecta el problema de FAT32 vs NTFS, la manca de separació sistema/dades, i el risc de desactivar la paginació; cada correcció ve justificada.

---

### 3. Comparació crítica — Server Core vs Experiència d'escriptori *(5 punts)*
Has d'instal·lar un DC que estarà en producció durant anys. Compara les dues modalitats d'instal·lació (Server Core i Experiència d'escriptori) segons: superfície d'atac, consum de recursos, facilitat d'administració i manteniment. **Decideix quina triaries per a aquest cas concret i defensa la tria** reconeixent també els inconvenients de la teva opció.

*Criteris de correcció:* compara amb almenys 3 criteris rellevants; la decisió és argumentada i admet els contres.

---

### 4. Cas pràctic — Disseny d'unitats organitzatives *(6 punts)*
L'Institut Montseny té: professorat, alumnat de 1r i de 2n, i equips d'aula i de despatxos. Volen aplicar polítiques diferents a alumnat i professorat, i restringir els equips d'aula.
Dissenya una **estructura d'UOs** raonada per a aquest centre i explica per què l'organitzes així pensant en la futura aplicació de GPO i la delegació d'administració. Pots representar-la com a arbre.

*Criteris de correcció:* l'estructura permet aplicar polítiques diferenciades de forma neta; es justifica la separació d'usuaris i equips i es preveu la delegació.

---

### 5. Interpretació de sortida — `gpresult /r` *(5 punts)*
Un alumne es queixa que no se li aplica el fons de pantalla corporatiu. Executes `gpresult /r` al seu equip i observes que la GPO "Fons corporatiu" apareix a l'apartat de **GPO denegades (filtratge: Denegat)**.
Explica **què t'indica aquesta sortida**, quines 2-3 causes probables pot tenir i com ho verificaries pas a pas.

*Criteris de correcció:* interpreta correctament el filtratge denegat (àmbit/seguretat/UO); proposa causes plausibles i una via de comprovació ordenada.

---

### 6. Detecció d'errors — Permisos NTFS i compartició *(5 punts)*
Es comparteix una carpeta `Departaments`. A **Compartir** s'ha posat *Tothom → Control total*; a **Seguretat (NTFS)** el grup `Alumnes` té *Modificar*. Un professor conclou: *"Com que a compartir tothom té control total, els alumnes podran esborrar qualsevol fitxer de la carpeta des de la xarxa."*
Digues si la conclusió és **correcta o no i per què**, explicant com es combinen els permisos de compartició i els NTFS quan s'accedeix per xarxa.

*Criteris de correcció:* explica que preval el permís més restrictiu entre els dos conjunts; conclou correctament que el límit real és *Modificar*.

---

### 7. Cas pràctic — `icacls` per línia de comandes *(5 punts)*
Necessites que la carpeta `D:\Comptabilitat` doni **control total al grup `Comptables`**, **lectura al grup `Direccio`** i **cap accés a la resta**, i que els permisos s'heretin als subelements.
Escriu les ordres `icacls` que faries servir i explica què fa cada opció que utilitzis. Indica també com verificaries després que ha quedat ben aplicat.

*Criteris de correcció:* ordres sintàcticament plausibles amb `/grant`, herència i, si cal, `/inheritance`; explica cada part i la verificació.

---

### 8. Redacció per a un públic concret — Explica què és una GPO *(4 punts)*
Escriu un paràgraf (màx. 8-10 línies) per explicar **què és una GPO i per a què serveix** a un alumne de 1r que encara no ha vist Active Directory. Fes servir una analogia quotidiana i evita l'argot innecessari, però sense dir res tècnicament fals.

*Criteris de correcció:* explicació correcta i entenedora, amb analogia adequada; res tècnicament erroni.

---

### 9. Postura argumentada — Contrasenyes que no caduquen mai *(4 punts)*
Un professor demana que la seva contrasenya de domini **no caduqui mai** perquè està cansat de canviar-la. Posiciona't sobre aquesta petició des del punt de vista de l'administrador: **l'acceptaries, la rebutjaries o buscaries una alternativa?** Argumenta-ho relacionant-ho amb les polítiques de contrasenya del domini i el risc de seguretat.

*Criteris de correcció:* pren una posició clara i la defensa amb criteris de seguretat; valora alternatives (longitud, MFA, excepcions controlades).

---

### 10. Role-play — Tècnic de suport davant un usuari bloquejat *(5 punts)*
Ets el tècnic de suport. Una professora et diu: *"No puc entrar al meu ordinador, diu que la meva sessió no està disponible ara."* Saps que té restriccions horàries configurades.
Redacta **el que li respondries** (explicant-li què passa sense tecnicismes) i, a continuació, **el diagnòstic tècnic** que faries tu per confirmar-ho i, si cal, corregir-ho.

*Criteris de correcció:* resposta empàtica i correcta a la usuària + diagnòstic tècnic coherent amb restriccions horàries (verificació a ADUC/PowerShell).

---

### 11. Cas pràctic — Automatització amb PowerShell *(6 punts)*
T'arriba un full de càlcul amb 30 alumnes nous (nom, cognom, UO de destí). Explica **l'estratègia** que faries servir per crear-los tots a Active Directory sense fer-ho un per un a la interfície gràfica. No cal un script perfecte: indica quins cmdlets faries servir, quines dades necessites i quins problemes vigilaries (contrasenyes inicials, noms duplicats, UO correcta).

*Criteris de correcció:* proposa un flux basat en import de dades + `New-ADUser` en bucle; preveu els riscos citats.

---

### 12. Interpretació de dades — Visor d'Esdeveniments *(5 punts)*
Al Visor d'Esdeveniments de seguretat veus, en 2 minuts, **múltiples esdeveniments 4625 (error d'inici de sessió)** per al mateix usuari des del mateix equip, seguits d'un **4624 (inici correcte)**.
Interpreta què pot estar passant, si t'hauria de preocupar i quines accions prendries. Diferencia entre una causa benigna i una de sospitosa.

*Criteris de correcció:* interpreta 4625/4624 correctament; distingeix oblit de contrasenya vs possible atac de força bruta i proposa accions proporcionades.

---

### 13. Mapa conceptual — Del client al recurs compartit *(6 punts)*
Dibuixa un esquema/mapa conceptual que mostri **tot el recorregut** quan un client Windows 11 unit al domini accedeix a una carpeta compartida del servidor: intervenció del DNS, autenticació (Kerberos), permisos de compartició i NTFS, i perfil de l'usuari. Acompanya'l d'una **justificació escrita** de per què has connectat els elements en aquest ordre.

*Criteris de correcció:* el mapa inclou DNS, autenticació, doble permís i perfil en un ordre coherent; la justificació explica les dependències.

---

### 14. Cas pràctic — Perfils mòbils i el sufix `.V6` *(5 punts)*
Es configuren perfils mòbils per a l'alumnat. En provar-ho amb dos clients Windows 11, veus que al servidor apareix la carpeta `alumne1.V6`. Un company pregunta per què no es diu simplement `alumne1`.
Explica **què és el sufix `.V6`**, per què apareix i quina relació té amb la versió del sistema operatiu client. Indica què passaria si barreges clients amb versions de perfil diferents.

*Criteris de correcció:* explica el versionat del perfil lligat a la versió de Windows i el risc d'incompatibilitat entre versions.

---

### 15. Detecció d'errors — Redirecció de carpetes per GPO *(5 punts)*
Un tècnic configura la redirecció de "Documents" cap a `\\SERVIDOR\perfils\%username%\Documents`, però posa a la carpeta del servidor només permisos NTFS de *Lectura* per al grup `Alumnes` i oblida marcar l'opció de concedir a l'usuari drets exclusius sobre la seva carpeta.
Identifica els **problemes** que provocarà aquesta configuració i corregeix-los.

*Criteris de correcció:* detecta que amb només lectura no es podran desar documents i el risc de privadesa entre usuaris; proposa els permisos correctes.

---

### 16. Comparació crítica — Perfil local vs perfil mòbil *(5 punts)*
Per a les aules d'informàtica, valora si és millor fer servir **perfils locals** o **perfils mòbils**. Compara'ls segons: experiència de l'alumne entre equips, càrrega de xarxa i servidor, temps d'inici de sessió i manteniment. **Recomana una opció** per al context d'aules amb molts alumnes rotatius i justifica-la.

*Criteris de correcció:* comparació amb criteris rellevants; recomanació coherent amb el context (molts usuaris, molts equips).

---

### 17. Connexió entre blocs — DNS, AD i unió al domini *(6 punts)*
Un client Windows 11 no aconsegueix unir-se al domini: dóna un error que no troba el domini. Comproves que el client té una IP correcta però el seu DNS apunta al router (8.8.8.8), no al servidor.
Explica **per què això impedeix la unió al domini**, connectant el paper del DNS integrat en AD (registres SRV) amb el procés de localització del Controlador de Domini. Indica la correcció.

*Criteris de correcció:* relaciona correctament DNS integrat + registres SRV + localització del DC; la correcció (apuntar el DNS al DC) està ben justificada.

---

### 18. Cas pràctic — Estratègia de manteniment i tasques programades *(5 punts)*
Vols que cada nit a les 2:00 el servidor faci una còpia d'una carpeta crítica i registri si ha anat bé. Descriu **l'estratègia** amb el Planificador de tasques: quin desencadenant, quina acció, amb quin compte s'executaria i com comprovaries l'endemà que la tasca es va executar correctament.

*Criteris de correcció:* desencadenant horari + acció (script/robocopy) + compte adequat + verificació via historial/registre.

---

### 19. Postura argumentada — Un sol DC per a tot el centre *(4 punts)*
La direcció, per estalviar, vol tenir **un únic Controlador de Domini** per a tot l'institut. Argumenta si això és una bona idea o no, considerant disponibilitat, punt únic de fallada i recuperació. Proposa una alternativa si creus que cal.

*Criteris de correcció:* identifica el risc de punt únic de fallada; argumenta i proposa (segon DC) de forma proporcionada al context.

---

### 20. Cas pràctic integrador — Auditoria d'un accés no autoritzat *(5 punts)*
Sospites que algú ha accedit a la carpeta `Direccio` sense permís. Descriu **com ho investigaries de principi a fi**: què hauries d'haver activat prèviament (auditoria d'accés a objectes), on ho consultaries i com relacionaries la informació amb usuaris i permisos NTFS per treure conclusions.

*Criteris de correcció:* menciona l'activació prèvia de l'auditoria, la consulta al Visor d'Esdeveniments i la correlació amb permisos/usuaris; raonament coherent.

---

## Pauta de correcció general (rúbrica)

| Nivell | Descripció | % de la puntuació de cada activitat |
|--------|-----------|:-----------------------------------:|
| **Excel·lent** | Resposta tècnicament correcta i completa, ben justificada, amb terminologia precisa i decisions raonades. | 90–100 % |
| **Notable** | Resposta majoritàriament correcta amb justificació adequada; petites imprecisions o algun aspecte poc desenvolupat. | 70–89 % |
| **Suficient** | Idea central correcta però justificació pobra, incompleta o amb algun error conceptual no greu. | 50–69 % |
| **Insuficient** | Resposta incorrecta, només memorística, sense justificar, o amb errors conceptuals greus. | 0–49 % |

**Criteris transversals aplicables a tot l'examen:**
- Es valora el **raonament i la justificació** per sobre del resultat final.
- L'ús correcte de la **terminologia tècnica** (AD DS, GPO, NTFS, UO, Kerberos, DNS/SRV...) suma; l'ús erroni resta.
- En les activitats de **detecció d'errors**, cal *identificar* l'error **i** *corregir-lo justificant-ho*: trobar-lo sense corregir val la meitat.
- La còpia literal dels apunts sense aplicació al cas es considera resposta memorística i no obté la màxima.
- Coherència i claredat en l'expressió escrita.
