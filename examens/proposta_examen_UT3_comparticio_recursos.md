# Proposta d'examen competencial · UT3 — Compartició de recursos (Samba · NFS · CUPS)

**Mòdul:** Sistemes Operatius en Xarxa · **Curs:** 2n CFGM SMX
**Durada orientativa:** 2 h · **Puntuació total:** 100 punts

> Examen d'activitats competencials (comprensió i aplicació, no memorització).
> Justifica sempre les teves respostes: es valora el raonament, no només el resultat.

**Nom i cognoms:** ______________________________  **Data:** ____________  **Grup:** ______

---

## Activitats

### 1. Comparació crítica — Samba vs NFS *(5 punts)*
Un centre ha de compartir carpetes que faran servir **clients Windows i Linux barrejats**. Compara **Samba** i **NFS** segons: compatibilitat amb cada client, model de permisos i autenticació, i facilitat de configuració. **Recomana** quina solució faries servir per a aquest escenari mixt i defensa-la reconeixent-ne els límits.

*Criteris de correcció:* comparació correcta (SMB multiplataforma vs NFS natiu Unix); recomanació coherent amb el parc mixt i honesta amb els contres.

---

### 2. Detecció d'errors — Secció de `smb.conf` *(6 punts)*
Un tècnic vol un recurs privat només per al grup `professorat`, però qualsevol usuari hi entra. Aquesta és la seva secció:

```ini
[claustre]
   path = /srv/samba/claustre
   guest ok = yes
   read only = no
   valid users = professorat
```

Localitza els **errors o incoherències** i corregeix la secció perquè el comportament sigui el desitjat (accés restringit al grup). Explica cada canvi.

*Criteris de correcció:* detecta la contradicció `guest ok = yes` amb l'accés restringit i la sintaxi del grup (`@professorat`); la secció corregida és coherent.

---

### 3. Cas pràctic — Del recurs lliure al recurs per grups *(6 punts)*
Has de configurar tres recursos Samba: un **públic de només lectura** per a documents comuns, un de **lectura/escriptura per al grup `alumnes`**, i un de **privat per a `direccio`**. Descriu com plantejaries cada recurs (paràmetres clau de cada secció) i quins usuaris/grups de sistema i de Samba necessites. No cal el fitxer complet: es valora el disseny i la justificació.

*Criteris de correcció:* diferencia correctament els 3 nivells d'accés amb els paràmetres adequats (`guest ok`, `valid users`, `read only`); relaciona usuaris de sistema i de Samba.

---

### 4. Cas pràctic — `smbpasswd` i la doble identitat *(5 punts)*
Un usuari existeix al sistema Linux (`getent passwd` el troba) però no pot connectar-se al recurs Samba amb la seva contrasenya. Explica **per què** pot passar això, quin paper té `smbpasswd`, i per què Samba manté una base de contrasenyes pròpia diferent de la del sistema.

*Criteris de correcció:* explica que el compte de sistema i el compte Samba són bases separades; `smbpasswd -a` per donar-lo d'alta a Samba.

---

### 5. Detecció d'errors — Permisos amb màscares *(6 punts)*
En un recurs compartit, es vol que els fitxers nous quedin amb permisos `660` i les carpetes `770`, però l'administrador es queixa que "cada usuari crea fitxers que els altres del grup no poden modificar". La secció té:

```ini
   create mask = 0600
   directory mask = 0700
   force group = alumnes
```

Explica per què passa el problema descrit i corregeix les màscares perquè el grup pugui treballar sobre els fitxers dels companys. Justifica els valors nous.

*Criteris de correcció:* relaciona `create mask = 0600` amb la manca de permís de grup; proposa `0660`/`0770` i explica el paper de `force group`.

---

### 6. Redacció per a un públic concret — Explica NFS *(4 punts)*
Escriu una explicació breu (8-10 línies) de **què és NFS i què permet fer** dirigida a un alumne de 1r que només ha fet servir carpetes compartides de Windows. Fes servir una comparació entenedora, sense dir res tècnicament fals.

*Criteris de correcció:* explicació correcta i entenedora amb comparació adequada; res tècnicament erroni.

---

### 7. Cas pràctic — Muntatge NFS persistent *(5 punts)*
Vols que un client Linux munti automàticament, en cada arrencada, un recurs NFS del servidor a `/mnt/dades`. Explica com ho faries perquè sigui **persistent**, què has de tenir en compte perquè l'arrencada no es pengi si el servidor no està disponible, i com ho verificaries.

*Criteris de correcció:* proposa entrada a `/etc/fstab` amb opcions adequades (p. ex. muntatge tou/`_netdev`), i verificació amb `mount`/`showmount`.

---

### 8. Interpretació de sortida — `showmount -e` *(4 punts)*
Des d'un client executes `showmount -e 192.168.100.10` i obtens:

```
Export list for 192.168.100.10:
/srv/public   *
/srv/perfils  192.168.100.0/24
```

Interpreta què t'està dient aquesta sortida sobre **qui pot muntar cada recurs** i quines implicacions de seguretat hi veus en el recurs `/srv/public`.

*Criteris de correcció:* interpreta correctament l'abast de cada export; identifica el risc de `*` (qualsevol client).

---

### 9. Detecció d'errors — Seguretat d'un export NFS *(5 punts)*
Un tècnic exporta una carpeta amb `rw,no_root_squash` "perquè no doni problemes de permisos". Explica **per què `no_root_squash` és perillós**, què fa exactament, i quina configuració (p. ex. `all_squash` amb `anonuid`/`anongid`, o `root_squash`) seria més adequada segons el cas. Justifica-ho.

*Criteris de correcció:* explica el risc que el root del client actuï com a root al servidor; proposa alternatives segures justificades.

---

### 10. Cas pràctic — Firewall i ports de NFS *(4 punts)*
Després de configurar NFS, els clients no poden muntar el recurs tot i que `showmount` local funciona al servidor. Sospites del firewall. Explica **quins ports/serveis** intervenen en NFS i com ho comprovaries i obriries amb `ufw`, raonant per què NFS necessita més d'un port.

*Criteris de correcció:* menciona ports NFS (2049) i el portmapper (111)/rpcbind; explica per què i com obrir-los amb ufw.

---

### 11. Postura argumentada — `all_squash` per a tothom *(4 punts)*
Un company proposa configurar **tots** els exports NFS amb `all_squash` "per seguretat, així ningú té privilegis". Posiciona't: és sempre bona idea? Argumenta en quins casos és encertat i en quins provocaria problemes (p. ex. carpetes personals amb propietat per usuari).

*Criteris de correcció:* matisa que `all_squash` és útil per a recursos anònims/comuns però trenca la propietat individual; posició argumentada.

---

### 12. Cas pràctic — Instal·lar i provar CUPS *(5 punts)*
Has de posar en marxa un servidor d'impressió amb CUPS i validar-lo **sense tenir cap impressora física**. Explica com ho faries servir una impressora PDF virtual per fer les proves, com accediries a l'administració, i com comprovaries que una impressió s'ha processat correctament.

*Criteris de correcció:* menciona la interfície web (port 631), la impressora PDF virtual per provar i la verificació de la cua/treball (`lpstat`).

---

### 13. Interpretació de sortida — Cua d'impressió *(4 punts)*
Executes `lpstat -p -d` i veus una impressora en estat `disabled` amb treballs encuats i sense impressora per defecte definida. Interpreta què està passant, per què els documents no surten, i quins passos faries per resoldre-ho.

*Criteris de correcció:* interpreta l'estat `disabled` i la cua retinguda; proposa reactivar la impressora i definir-ne una per defecte.

---

### 14. Cas pràctic — Restringir una impressora per grup *(5 punts)*
Direcció vol que **només el grup `professorat`** pugui imprimir a la impressora de la sala de professors, i que l'alumnat no hi tingui accés. Explica com plantejaries aquesta restricció a CUPS i com la verificaries provant amb dos usuaris diferents.

*Criteris de correcció:* proposa restricció d'accés per usuaris/grups permesos a la impressora; verificació amb usuari permès i no permès.

---

### 15. Comparació crítica — PPD vs URI *(4 punts)*
En configurar una impressora de xarxa, sovint has de definir un **PPD** i una **URI**. Explica quina informació aporta cadascun (què descriu el PPD i què identifica la URI) i per què **tots dos** són necessaris. Posa un exemple de URI segons el tipus de connexió.

*Criteris de correcció:* distingeix el paper del PPD (capacitats/controlador) del de la URI (ubicació/protocol); exemple coherent (`ipp://`, `smb://`...).

---

### 16. Cas pràctic — Impressió des de Windows via Samba *(5 punts)*
Vols que els clients **Windows** puguin imprimir a una impressora gestionada per un servidor **Linux amb CUPS**. Explica l'estratègia per compartir aquesta impressora cap a Windows (paper de Samba en aquesta integració) i quins requisits ha de complir el client per poder-la fer servir.

*Criteris de correcció:* explica la compartició CUPS+Samba cap a clients Windows i els requisits (controlador/point-and-print, permisos).

---

### 17. Mapa conceptual — Els tres serveis de la UT3 *(6 punts)*
Fes un mapa conceptual que relacioni **Samba, NFS i CUPS**: quin tipus de recurs comparteix cadascun, amb quins clients encaixa millor i quins elements comuns tenen (autenticació, permisos, xarxa/firewall). Acompanya'l d'una justificació escrita de les connexions i diferències.

*Criteris de correcció:* el mapa situa correctament cada servei (fitxers SMB / fitxers NFS / impressió), amb clients i elements comuns; justificació coherent.

---

### 18. Detecció d'errors — Diagnòstic mal enfocat *(5 punts)*
Un alumne no pot muntar un recurs NFS i decideix reinstal·lar tot el sistema operatiu del client. Critica aquesta manera de procedir i proposa un **protocol de diagnòstic ordenat** (de la comprovació més senzilla a la més complexa: connectivitat, exports, firewall, permisos) abans d'arribar a mesures dràstiques.

*Criteris de correcció:* argumenta per què reinstal·lar és desproporcionat; proposa una seqüència de diagnòstic lògica i incremental.

---

### 19. Connexió entre blocs — Samba integrat amb LDAP *(6 punts)*
Relaciona el que has après a la **UT2 (LDAP)** amb la **UT3 (Samba)**: quin avantatge té integrar Samba amb un directori LDAP en lloc de gestionar usuaris Samba de forma local amb `smbpasswd`? Explica què es guanya en un centre amb molts usuaris i quins requisits de coherència (usuaris/grups) cal mantenir.

*Criteris de correcció:* justifica la centralització d'identitats (un sol lloc d'usuaris) enfront de la gestió local; menciona la coherència amb els comptes LDAP.

---

### 20. Cas pràctic integrador — Disseny complet per a un departament *(5 punts)*
El departament d'informàtica necessita: una carpeta comuna de lectura per a tothom, una carpeta de treball d'escriptura per al grup, i una impressora compartida. Dissenya la **solució global** indicant quins serveis (Samba/NFS/CUPS) faries servir per a cada necessitat i per què, i com garantiries els permisos coherents entre ells.

*Criteris de correcció:* tria justificada de servei per a cada necessitat; coherència de permisos i usuaris entre els serveis.

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
- L'ús correcte de la **terminologia tècnica** (SMB/Samba, NFS, CUPS, `valid users`, màscares, `all_squash`, PPD, URI, IPP...) suma; l'ús erroni resta.
- En les activitats de **detecció d'errors**, cal *identificar* l'error **i** *corregir-lo justificant-ho*: trobar-lo sense corregir val la meitat.
- En les activitats amb **fitxers de configuració** (`smb.conf`, `/etc/exports`), es valora la sintaxi plausible i la comprensió de cada directiva, no la memorització exacta.
- La còpia literal dels apunts sense aplicació al cas es considera resposta memorística i no obté la màxima.
