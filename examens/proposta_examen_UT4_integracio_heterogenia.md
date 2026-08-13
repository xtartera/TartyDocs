# Proposta d'examen competencial · UT4 — Integració de sistemes heterogenis

**Mòdul:** Sistemes Operatius en Xarxa · **Curs:** 2n CFGM SMX
**Durada orientativa:** 2 h · **Puntuació total:** 100 punts

> Examen d'activitats competencials (comprensió i aplicació, no memorització).
> Per la naturalesa **integradora** de la UT4, moltes activitats connecten amb continguts de UT1 (Windows/AD), UT2 (Linux/LDAP) i UT3 (compartició).
> Justifica sempre les teves respostes: es valora el raonament, no només el resultat.

**Nom i cognoms:** ______________________________  **Data:** ____________  **Grup:** ______

---

## Activitats

### 1. Comparació crítica — AD vs OpenLDAP vs Samba-AD DC *(6 punts)*
Un centre ha de triar la solució de directori per a un entorn **mixt Windows + Linux**. Compara **Active Directory (Windows)**, **OpenLDAP** i **Samba com a AD DC** segons: clients que autentiquen de forma nativa, cost de llicència, serveis inclosos (Kerberos, DNS, GPO) i complexitat. **Recomana** una solució per a un institut amb els dos mons i defensa-la.

*Criteris de correcció:* comparació correcta de les tres opcions amb criteris rellevants; recomanació justificada per a l'entorn heterogeni.

---

### 2. Cas pràctic — Unir un Ubuntu a un domini AD *(6 punts)*
Tens un Windows Server 2022 amb Active Directory ja funcional i vols que un client **Ubuntu 24.04** s'hi uneixi i que els usuaris del domini hi puguin iniciar sessió. Descriu **l'estratègia i els components** que necessites (realmd, SSSD, Kerberos, oddjob-mkhomedir) i quin paper fa cadascun. No cal la sintaxi exacta: es valora entendre el flux.

*Criteris de correcció:* identifica correctament el paper de `realm join`, SSSD (autenticació), Kerberos (tiquets) i oddjob-mkhomedir (creació de home); flux coherent.

---

### 3. Detecció d'errors — Falla la unió per DNS *(5 punts)*
Un tècnic intenta `realm join institut.local` des d'Ubuntu i falla dient que no troba el domini. Comproves que el `/etc/resolv.conf` del client apunta a `8.8.8.8`. Explica **per què això impedeix la unió**, connectant-ho amb el que ja saps del DNS integrat en AD (registres SRV), i indica la correcció.

*Criteris de correcció:* relaciona el DNS del client amb la localització del DC via SRV; correcció (DNS→DC) justificada. *(Connexió amb UT1.)*

---

### 4. Cas pràctic — Kerberos i el desfasament horari *(5 punts)*
Després d'unir l'Ubuntu al domini, l'usuari no pot autenticar-se i als registres apareixen errors relacionats amb Kerberos. Sospites de l'hora. Explica **per què Kerberos és sensible al rellotge**, quin marge de diferència sol tolerar i com solucionaries el desfasament al client Linux.

*Criteris de correcció:* explica el rebuig de tiquets per desfasament (protecció anti-replay), el marge típic (~5 min) i la sincronització NTP.

---

### 5. Interpretació de sortida — `getent passwd` amb usuaris de domini *(5 punts)*
Des de l'Ubuntu unit al domini executes `getent passwd usuari@institut.local` i retorna una línia amb UID, home i shell. Explica **què et confirma** això sobre la integració i què encara *no* et garanteix (per exemple, que la home existeixi físicament o que l'usuari pugui iniciar sessió gràficament).

*Criteris de correcció:* interpreta que la resolució d'identitat funciona però distingeix-ho de l'autenticació efectiva i de l'existència real de la home. *(Connexió amb UT2.)*

---

### 6. Cas pràctic — `oddjob-mkhomedir` i la primera sessió *(4 punts)*
Un usuari de domini inicia sessió per primer cop en un client Linux i es queixa que "no té carpeta personal". Explica quin component s'encarrega de **crear la home la primera vegada**, per què cal activar-lo explícitament i què passaria si no estigués configurat.

*Criteris de correcció:* identifica `oddjob-mkhomedir`/`pam_mkhomedir` i el seu paper; explica el símptoma sense aquest component.

---

### 7. Comparació crítica — Client Linux al domini AD vs Samba com a DC *(6 punts)*
Compara dues estratègies per donar servei a un entorn mixt: **(A)** mantenir un Windows Server com a AD i unir-hi els Linux, o **(B)** muntar **Samba com a AD DC** i unir-hi Windows i Linux. Valora avantatges i inconvenients de cada opció (cost, dependència de Windows, compatibilitat, manteniment) i digues en quin context triaries cadascuna.

*Criteris de correcció:* compara les dues arquitectures amb criteris rellevants; associa cada opció a un context adequat.

---

### 8. Cas pràctic — Provisionar un Samba AD DC *(6 punts)*
Vols muntar un domini nou amb **Samba com a AD DC** sobre Ubuntu. Descriu els **passos clau de l'estratègia**: la provisió del domini, per què s'han de desactivar `smbd`/`nmbd` i activar `samba-ad-dc`, i com verificaries que el DC funciona (usuaris/grups i registres de DNS). No cal la sintaxi exacta.

*Criteris de correcció:* menciona `samba-tool domain provision` (amb rfc2307), el canvi de serveis, i verificació amb `samba-tool user list`/`wbinfo` i SRV records.

---

### 9. Detecció d'errors — Serveis en conflicte al DC Samba *(5 punts)*
Un tècnic ha provisionat el Samba AD DC però el servei no arrenca. Descobreixes que té `smbd`, `nmbd` **i** `samba-ad-dc` tots habilitats. Explica **per què això provoca el conflicte**, quin és el comportament correcte, i com ho deixaries ben configurat.

*Criteris de correcció:* explica que en mode AD DC el dimoni `samba-ad-dc` integra els serveis i que `smbd`/`nmbd` han d'estar deshabilitats; correcció clara.

---

### 10. Cas pràctic — Client Windows 11 al domini Samba *(5 punts)*
Tens un Samba AD DC (`libretic.local`) i vols unir-hi un **Windows 11**. Descriu què has de comprovar al client abans d'unir-lo (DNS, connectivitat, resolució del domini) i com validaries després que la unió i el login de domini funcionen. Connecta-ho amb el procés d'unió que ja coneixes de UT1.

*Criteris de correcció:* comprovacions prèvies (DNS→DC, `nslookup`/`ping`) i validació post-unió (login `DOMINI\usuari`, `whoami`). *(Connexió amb UT1.)*

---

### 11. Cas pràctic — Client Ubuntu al domini Samba *(5 punts)*
Ara vols unir un **Ubuntu** al mateix Samba AD DC. Explica com l'estratègia s'assembla i en què es diferencia respecte a unir-lo a un AD de Windows (UT4, activitat 2): quins components reutilitzes (realmd/SSSD/Kerberos) i què canvia pel fet que el DC sigui Samba.

*Criteris de correcció:* reconeix que el procés client és anàleg (realmd/SSSD) independentment que el DC sigui Windows o Samba; matisos correctes.

---

### 12. Cas pràctic — NFS multiplataforma (WS2022 → Ubuntu) *(5 punts)*
Vols compartir per **NFS** una carpeta d'un **Windows Server 2022** perquè un client **Ubuntu** la munti. Descriu l'estratègia (rol *Server for NFS* al Windows, muntatge al client) i quins problemes de permisos/propietat (UID/GID) hauries de preveure en aquest pont Windows↔Linux.

*Criteris de correcció:* menciona el rol NFS a Windows i el muntatge a Linux; preveu el mapatge d'identitats UID/GID entre mons. *(Connexió amb UT3.)*

---

### 13. Cas pràctic — NFS multiplataforma (Ubuntu → Windows) *(5 punts)*
Ara al revés: un **Ubuntu** exporta per NFS i un **Windows** ha de muntar-ho amb *Client for NFS*. Explica què necessites a cada extrem i per què la gestió de permisos i identitats és el punt més delicat d'aquesta integració.

*Criteris de correcció:* identifica `nfs-kernel-server` + export a Ubuntu i *Client for NFS* a Windows; justifica el repte d'identitats. *(Connexió amb UT3.)*

---

### 14. Detecció d'errors — ACLs POSIX en recursos de domini *(6 punts)*
En un recurs compartit del domini es vol que el grup `tecnics` tingui accés d'escriptura i que els permisos s'heretin als fitxers nous, però només es fan servir permisos Unix bàsics (`chmod 770`) i el propietari/grup no coincideix amb el que caldria. Explica **per què els permisos Unix bàsics es queden curts** en aquest cas i quin mecanisme (ACLs POSIX amb `setfacl`/`getfacl` i herència) resoldria el problema.

*Criteris de correcció:* justifica la limitació de `chmod` per a permisos granulars/heretats; proposa ACLs POSIX i l'herència adequada. *(Connexió amb UT3.)*

---

### 15. Interpretació — Diagnòstic d'un login que falla *(5 punts)*
Un usuari de domini no pot iniciar sessió en un client Linux integrat. Tens accés a eines com `realm list`, `klist`, `getent` i els registres de SSSD. Explica **en quin ordre** faries servir aquestes comprovacions i què t'indicaria cadascuna per anar acotant si el problema és de unió, de resolució, de tiquets Kerberos o de home.

*Criteris de correcció:* proposa una seqüència de diagnòstic lògica associant cada eina a una capa del problema.

---

### 16. Mapa conceptual — Anatomia d'una infraestructura heterogènia *(6 punts)*
Dibuixa un mapa que integri tots els elements d'un entorn heterogeni de centre: **DC (AD o Samba-AD), DNS, Kerberos, clients Windows i Linux, recursos compartits (SMB/NFS) i impressió**. Marca les dependències crítiques (què necessita què) i justifica per escrit per què el DNS i l'hora són elements transversals a tot el sistema.

*Criteris de correcció:* el mapa integra els elements amb dependències correctes; destaca DNS i sincronització horària com a transversals. *(Connexió amb UT1–UT3.)*

---

### 17. Postura argumentada — Migrar de Windows AD a Samba AD DC *(5 punts)*
La direcció es planteja **substituir el Windows Server (AD) per un Samba AD DC** per estalviar llicències. Posiciona't com a tècnic: quins arguments a favor i en contra plantejaries? Considera cost, compatibilitat amb el parc actual, corba d'aprenentatge i suport. Dóna una recomanació final matisada.

*Criteris de correcció:* argumenta a favor i en contra de forma equilibrada; recomanació coherent i matisada, no dogmàtica.

---

### 18. Redacció per a un públic concret — Informe a direcció *(5 punts)*
Redacta un breu informe (10-12 línies) **per a l'equip directiu** (perfil no tècnic) explicant què és una "infraestructura de sistemes heterogenis" i quins beneficis i riscos té per al centre integrar Windows i Linux sota un mateix directori. Ha de ser entenedor però rigorós.

*Criteris de correcció:* llenguatge adequat al públic directiu, correcte tècnicament; equilibri entre beneficis i riscos.

---

### 19. Role-play — Consultor davant un centre indecís *(5 punts)*
Ets un consultor extern. El centre et diu: *"Tenim meitat Windows i meitat Linux, i cada món va pel seu compte; volem unificar la gestió d'usuaris però sense gastar gaire."* Redacta la **resposta i proposta** que els donaries, justificant l'arquitectura que recomanes i el perquè, i anticipant una objecció que et podrien fer.

*Criteris de correcció:* proposta coherent amb el requisit (unificació + baix cost), ben justificada, i anticipa una objecció realista.

---

### 20. Cas pràctic integrador — Diagnòstic integral de tot l'entorn *(5 punts)*
Després de muntar tot l'entorn heterogeni (DC, clients Windows i Linux, recursos compartits), vols fer una **verificació integral** que tot funciona de punta a punta. Descriu un **pla de proves** que cobreixi: resolució de noms, autenticació de domini des dels dos tipus de client, accés a un recurs compartit i impressió. Per a cada prova, indica què esperaries veure si tot va bé.

*Criteris de correcció:* pla de proves complet i ordenat que cobreix les capes citades; per a cada prova, un resultat esperat concret. *(Connexió amb UT1–UT3.)*

---

## Pauta de correcció general (rúbrica)

| Nivell | Descripció | % de la puntuació de cada activitat |
|--------|-----------|:-----------------------------------:|
| **Excel·lent** | Resposta tècnicament correcta i completa, ben justificada, amb terminologia precisa i decisions raonades; integra bé continguts de diferents unitats. | 90–100 % |
| **Notable** | Resposta majoritàriament correcta amb justificació adequada; petites imprecisions o algun aspecte poc desenvolupat. | 70–89 % |
| **Suficient** | Idea central correcta però justificació pobra, incompleta o amb algun error conceptual no greu. | 50–69 % |
| **Insuficient** | Resposta incorrecta, només memorística, sense justificar, o amb errors conceptuals greus. | 0–49 % |

**Criteris transversals aplicables a tot l'examen:**
- Es valora especialment la **capacitat d'integrar** coneixements de UT1–UT3 en escenaris heterogenis.
- Es valora el **raonament i la justificació** per sobre del resultat final.
- L'ús correcte de la **terminologia tècnica** (realmd, SSSD, Kerberos/KDC, Samba AD DC, `samba-tool`, DNS/SRV, ACLs POSIX...) suma; l'ús erroni resta.
- En les activitats de **detecció d'errors**, cal *identificar* l'error **i** *corregir-lo justificant-ho*: trobar-lo sense corregir val la meitat.
- La còpia literal dels apunts sense aplicació al cas es considera resposta memorística i no obté la màxima.
