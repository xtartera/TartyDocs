# Proposta d'examen competencial · UT2 — Linux Server i LDAP

**Mòdul:** Sistemes Operatius en Xarxa · **Curs:** 2n CFGM SMX
**Durada orientativa:** 2 h · **Puntuació total:** 100 punts

> Examen d'activitats competencials (comprensió i aplicació, no memorització).
> Justifica sempre les teves respostes: es valora el raonament, no només el resultat.

**Nom i cognoms:** ______________________________  **Data:** ____________  **Grup:** ______

---

## Activitats

### 1. Detecció d'errors — Configuració de xarxa amb netplan *(5 punts)*
Un alumne configura la IP fixa d'un Ubuntu Server amb aquest `netplan` i es queixa que "no li funciona el DNS ni surt a internet":

```yaml
network:
  version: 2
  ethernets:
    ens33:
      dhcp4: true
      addresses: [192.168.100.10/24]
      gateway4: 192.168.100.1
```

Localitza **tots els errors** d'aquesta configuració i reescriu-la correctament, explicant cada correcció.

*Criteris de correcció:* detecta el conflicte `dhcp4: true` + IP estàtica, la manca de `nameservers`, i (segons versió) l'ús obsolet de `gateway4`; la versió corregida és coherent.

---

### 2. Cas pràctic — Assegurar l'accés SSH *(5 punts)*
Acabes d'instal·lar un servidor que administraràs remotament per SSH des de la teva estació de treball. Descriu **quines mesures aplicaries** per fer aquest accés segur i pràctic alhora (autenticació, comptes, firewall) i justifica cadascuna pensant en un entorn real d'institut.

*Criteris de correcció:* proposa mesures raonades (claus vs contrasenya, evitar root directe, ufw obrint només el port necessari) amb justificació.

---

### 3. Comparació crítica — LDAP vs Active Directory *(5 punts)*
Has de triar un servei de directori per a un centre que treballa exclusivament amb Linux. Compara **OpenLDAP** i **Active Directory** segons: plataforma, cost, integració amb clients Linux, complexitat i serveis inclosos (DNS, Kerberos, GPO). **Decideix quina solució recomanes** per a aquest cas i defensa-la reconeixent què hi perds.

*Criteris de correcció:* comparació amb criteris rellevants i correctes; recomanació coherent amb l'escenari (100 % Linux) i honesta amb els contres.

---

### 4. Detecció d'errors — Fitxer LDIF *(6 punts)*
Un company vol crear un usuari amb aquest LDIF i li dóna error en fer `ldapadd`:

```ldif
dn: uid=mmarti,ou=usuaris,dc=institut,dc=local
objectClass: inetOrgPerson
uid: mmarti
cn: Maria Martí
sn: Martí
uidNumber: 1001
homeDirectory: /home/mmarti
```

Troba els **errors o mancances** que impedeixen que aquest usuari sigui un compte POSIX vàlid i corregeix el LDIF explicant què hi falta i per què.

*Criteris de correcció:* detecta la manca de `objectClass: posixAccount` (i shell), la manca de `gidNumber`, `loginShell`; explica per què són obligatoris per a un compte POSIX funcional.

---

### 5. Cas pràctic — Coherència UID/GID *(5 punts)*
Crees l'usuari `jlopez` a OpenLDAP amb `uidNumber: 5000`, però resulta que a la màquina servidor ja existeix un usuari local amb UID 5000. Explica **quins problemes de seguretat i de permisos** pot provocar aquesta coincidència i com dissenyaries un rang d'UID/GID per evitar-ho en tot el desplegament.

*Criteris de correcció:* explica que el sistema identifica per número, no per nom (risc de suplantació de propietat de fitxers); proposa reservar rangs separats.

---

### 6. Interpretació de sortida — `getent` i `id` *(5 punts)*
Després de configurar SSSD, executes:

```
$ getent passwd jlopez
jlopez:*:5000:5000:Joan Lopez:/home/jlopez:/bin/bash
$ id jlopez
uid=5000(jlopez) gid=5000(jlopez) groups=5000(jlopez)
```

Explica **què et confirma cada sortida** sobre la integració LDAP+SSSD i què *no* et garanteix encara (per exemple, sobre l'autenticació real o el muntatge de la home).

*Criteris de correcció:* interpreta que NSS resol l'usuari (resolució de nom↔UID) però que això no prova per si sol l'autenticació PAM ni l'existència de la home.

---

### 7. Detecció d'errors — `sssd.conf` i `nsswitch.conf` *(6 punts)*
Un tècnic diu: *"He configurat el `sssd.conf` però `getent passwd usuariLDAP` no retorna res, tot i que `ldapsearch` sí que troba l'usuari."*
Explica **quina peça del sistema probablement està mal configurada** i per què `ldapsearch` funciona però `getent` no. Indica què revisaries a `nsswitch.conf` i quina eina de diagnòstic de SSSD faries servir.

*Criteris de correcció:* relaciona que `ldapsearch` va directe al directori però `getent` depèn de NSS→SSSD; apunta a `nsswitch.conf` (passwd/group: sss) i a `sssctl config-check`.

---

### 8. Redacció per a un públic concret — Què és LDAP *(4 punts)*
Escriu una explicació breu (8-10 línies) de **què és un directori LDAP i per a què serveix en una xarxa** dirigida a un usuari sense coneixements tècnics (p. ex. un membre de l'equip directiu). Fes servir una analogia i evita l'argot, però sense dir res tècnicament fals.

*Criteris de correcció:* explicació entenedora i correcta amb analogia adequada (agenda/directori centralitzat); res tècnicament erroni.

---

### 9. Cas pràctic — Hash de contrasenya amb `slappasswd` *(4 punts)*
Un company vol posar la contrasenya dels usuaris LDAP escrivint-la **en text pla** dins del fitxer LDIF perquè "és més ràpid". Explica per què això és una mala pràctica, què fa `slappasswd`, i com incorporaries el resultat correctament al LDIF.

*Criteris de correcció:* justifica el risc del text pla; explica el hash SSHA generat per `slappasswd` i el seu ús a `userPassword`.

---

### 10. Postura argumentada — Un únic usuari compartit per a l'aula *(4 punts)*
Un professor proposa que tots els alumnes d'una aula facin servir **el mateix usuari LDAP compartit** per simplificar. Posiciona't sobre aquesta idea considerant traçabilitat, seguretat, perfils i permisos. Proposa una alternativa si la rebutges.

*Criteris de correcció:* pren posició clara amb arguments (pèrdua de traçabilitat, col·lisió de perfils); alternativa raonada.

---

### 11. Cas pràctic — Operació CRUD amb `ldapmodify` *(5 punts)*
Un usuari es canvia de departament i cal actualitzar el seu `gidNumber` i el seu `homeDirectory` al directori. Explica **com ho faries** (quina ordre i quina mena de fitxer/entrada necessites) sense esborrar i tornar a crear l'usuari, i quins efectes secundaris hauries de vigilar (per exemple, sobre els fitxers de la seva home antiga).

*Criteris de correcció:* proposa `ldapmodify` amb un LDIF de tipus `changetype: modify`/`replace`; preveu l'impacte sobre propietat de fitxers.

---

### 12. Interpretació d'error — Missatge d'`ldapadd` *(5 punts)*
En fer `ldapadd`, obtens: `ldap_add: Invalid syntax (21) additional info: objectClass: value #1 invalid per syntax`.
Explica **com interpretes aquest error**, quines 2 causes típiques pot tenir i com ho depuraries. No cal saber la solució exacta de memòria: es valora el mètode de diagnòstic.

*Criteris de correcció:* interpreta que hi ha un valor/objectClass mal escrit o un esquema no carregat; proposa un mètode de depuració ordenat.

---

### 13. Mapa conceptual — Autenticació d'un usuari LDAP a Linux *(6 punts)*
Fes un esquema que mostri **què passa quan un usuari LDAP inicia sessió per SSH** en un client Linux integrat: intervenció de PAM, NSS, SSSD i el servidor OpenLDAP, i on entra la resolució de nom vs la validació de contrasenya. Justifica per escrit l'ordre i el paper de cada component.

*Criteris de correcció:* distingeix clarament NSS (resolució) de PAM (autenticació) amb SSSD com a intermediari cap a LDAP; justificació coherent.

---

### 14. Cas pràctic — Perfils mòbils amb autofs *(6 punts)*
Vols que la carpeta personal de qualsevol usuari LDAP es munti automàticament per NFS quan inicia sessió, sense haver de definir una línia per a cada usuari. Explica **l'estratègia amb autofs** (paper d'`auto.master` i del mapa amb comodí `*`) i què representa el símbol `&` en la ruta del servidor. Indica un avantatge clar respecte a muntar-ho tot per `/etc/fstab`.

*Criteris de correcció:* explica el comodí `*` i la substitució `&`; justifica el muntatge sota demanda enfront de fstab (escalabilitat, recursos).

---

### 15. Detecció d'errors — `/etc/exports` del servidor NFS *(5 punts)*
Al servidor NFS trobes aquesta línia a `/etc/exports` i els clients es queixen que "poden llegir però no escriure" i que "qualsevol IP de la xarxa hi entra":

```
/srv/perfils 192.168.100.0/24(ro,sync)
```

Identifica què caldria canviar perquè els clients puguin **escriure** i per **limitar** millor qui hi accedeix, i explica què fa cada opció que proposis. Recorda l'ordre a executar després del canvi.

*Criteris de correcció:* canvia `ro`→`rw`, ajusta l'abast/opcions de seguretat i recorda `exportfs -ra`; explica les opcions.

---

### 16. Comparació crítica — Ubuntu 22.04 vs 24.04 en perfils mòbils *(5 punts)*
El material remarca diferències de comportament dels perfils mòbils entre Ubuntu 22.04 i 24.04. Explica **per què és important tenir en compte la versió del client** en un desplegament de perfils/roaming i quins problemes pot generar barrejar versions. Proposa com ho gestionaries en un parc amb versions mixtes.

*Criteris de correcció:* justifica l'impacte de la versió del SO en el comportament del perfil; proposa una gestió realista (homogeneïtzar o documentar diferències).

---

### 17. Role-play — Administrador Linux davant una incidència *(5 punts)*
Ets l'administrador. Un usuari et diu: *"Puc iniciar sessió al servidor però quan entro em posa a `/` i no trobo els meus fitxers."* Redacta **la resposta que li donaries** i, tot seguit, el **procés de diagnòstic** que seguiries (pensa en la home, el muntatge NFS/autofs i els permisos).

*Criteris de correcció:* resposta correcta a l'usuari + diagnòstic tècnic coherent (home no muntada/inexistent, autofs, permisos).

---

### 18. Cas pràctic — Sincronització horària *(4 punts)*
En un desplegament amb autenticació centralitzada, per què és important que el servidor i els clients tinguin **l'hora sincronitzada**? Explica quins problemes concrets pot causar un rellotge desajustat i com ho garantiries a Ubuntu Server.

*Criteris de correcció:* relaciona el desajust horari amb errors d'autenticació/registres; menciona NTP/`systemd-timesyncd` o `timedatectl`.

---

### 19. Connexió entre blocs — De la instal·lació al login real *(6 punts)*
Encadena, en ordre, **tots els blocs de la UT2 que han d'estar correctes** perquè un usuari LDAP pugui, finalment, iniciar sessió per SSH i trobar la seva home muntada: xarxa, resolució de noms, OpenLDAP, SSSD i NFS/autofs. Per a cada baula, digues què passaria si fallés (efecte concret sobre l'usuari).

*Criteris de correcció:* encadena correctament les dependències entre blocs; per a cada baula descriu un símptoma coherent de fallada.

---

### 20. Cas pràctic — Muntatge d'un entorn de proves LDAP *(5 punts)*
Vols poder provar operacions LDAP (crear, modificar, esborrar) sense por de fer malbé el directori de producció. Descriu **com muntaries un entorn de proves** i quines precaucions prendries (dades de mostra, còpies, verificació amb `ldapsearch`/`ldapwhoami`) abans d'aplicar canvis en real.

*Criteris de correcció:* proposa un entorn aïllat amb dades de prova i verificació; esmenta còpia/seguretat abans de tocar producció.

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
- L'ús correcte de la **terminologia tècnica** (LDIF, POSIX, UID/GID, NSS, PAM, SSSD, autofs, NFS...) suma; l'ús erroni resta.
- En les activitats de **detecció d'errors**, cal *identificar* l'error **i** *corregir-lo justificant-ho*: trobar-lo sense corregir val la meitat.
- En les activitats amb **fitxers de configuració** (netplan, LDIF, exports, sssd.conf), es valora la sintaxi plausible i la comprensió de cada directiva, no la memorització exacta.
- La còpia literal dels apunts sense aplicació al cas es considera resposta memorística i no obté la màxima.
