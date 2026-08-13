# UT4 · Integració de sistemes heterogenis — Mancances i propostes de millora

> Anàlisi comparativa entre el material local (TartyDocs · UT4) i el manual de referència [SOX de Sergi Coll](https://sergi-coll.gitbook.io/sox) (UF4).
> Objectiu: detectar buits i proposar un índex evolucionat que mantingui el que ja tenim i hi afegeixi les novetats.

---

## Enfocament de la unitat (eix central)

L'**eix central de la UT4** és **entendre els sistemes operatius heterogenis** a través de la **connexió entre Windows i Linux en tots dos sentits**, i sobretot les **particularitats i dificultats** que hi apareixen: el mapatge d'identitats (UID/GID ↔ SID), la traducció de permisos (NTFS ↔ POSIX ↔ ACLs), les diferències d'autenticació (Kerberos, SSSD, PAM) i la interoperabilitat de protocols (SMB/CIFS ↔ NFS) i de noms (DNS).

Aquesta comprensió s'ha d'assolir amb **la primera part** de la unitat (compartició i domini creuats Windows↔Linux). Només **després**, i com a **alternativa**, s'introdueix **Samba com a AD DC** (muntar el propi controlador de domini compatible). L'objectiu pedagògic no és muntar un producte concret, sinó que l'alumne entengui *per què* la convivència de mons és difícil i *com* es resol.

---

## 1. Estat actual del material (què ja tenim)

UT4 té **6 blocs / ~14 pàgines** (la més curta):

- Conceptes: anatomia d'una infraestructura heterogènia, sistemes heterogenis, comparativa AD/LDAP/Samba-AD.
- NFS multiplataforma (WS2022 servidor ↔ Ubuntu client, i a la inversa).
- **Ubuntu al domini AD** de Windows: `realmd`, SSSD per a AD, Kerberos, `oddjob-mkhomedir`.
- **Samba com a AD DC**: arquitectura i provisió, unió de Windows 11 i Ubuntu.
- Recursos i **ACLs POSIX** (`setfacl`), diagnòstic integral.
- Projectes SpeedRun.

---

## 2. Mancances detectades (ho cobreix la referència, aquí no)

| # | Mancança | A la referència (UF4) | Prioritat |
|---|----------|----------------------|:---------:|
| 1 | **Fil explícit de "particularitats i dificultats" de la heterogeneïtat**: mapatge UID/GID ↔ SID, permisos NTFS ↔ POSIX ↔ ACL, autenticació creuada, interoperabilitat de protocols. Ara apareix dispers, no com a eix. | Implícit | **Alta** |
| 2 | **Accés a comparticions Windows des de Linux** com a client (`smbclient`, `mount -t cifs`/`cifs-utils`, `/etc/fstab`). Tanca el cercle bidireccional de compartició. | Sí (pràctic) | **Alta** |
| 3 | **Administració completa de Samba AD DC** (com a *alternativa*): usuaris/grups amb `samba-tool`, configuració del domini, perfils mòbils, administració amb RSAT. | Sí | Mitjana |

> **Nota sobre Zentyal:** la referència inclou un tema de Zentyal com a controlador de domini. **Es descarta** per a TartyDocs: és un producte de nínxol (Development Edition d'autosuport) i enganxa l'alumne a una GUI concreta en comptes de consolidar els fonaments transferibles. Si es vol una alternativa "controlador de domini propi", ja la cobreix **Samba AD DC**, tractat directament.

---

## 3. Propostes de millora del material actual

1. **Reforçar la primera part com a nucli conceptual**: la compartició i el domini creuats Windows↔Linux han de deixar clar *què és* un entorn heterogeni i *quines friccions* té. És on l'alumne ha d'entendre el tema.
2. **Afegir un capítol transversal de "particularitats i dificultats"** que reculli, amb exemples, els punts de fricció recurrents: identitats (UID/GID ↔ SID i `--use-rfc2307`), permisos (NTFS vs POSIX vs ACLs), autenticació (Kerberos, rellotge, DNS) i protocols (SMB vs NFS). Aquest capítol és el que dona sentit a tota la UT.
3. **Completar la compartició bidireccional**: ja tens Linux servint cap a Windows (Samba/NFS) i NFS multiplataforma; falta el sentit **Windows → Linux com a client** (`smbclient`/`mount.cifs`). Amb això queden els dos sentits ben tancats.
4. **Situar Samba AD DC com a alternativa, no com a eix**: mantenir-lo detallat (instal·lació, domini, usuaris, perfils mòbils, RSAT) però **després** d'haver entès la integració, presentat com "i si volem el nostre propi controlador de domini compatible?".
5. **Fil comparatiu**: tancar la unitat confrontant les estratègies d'integració (unir Linux a un AD de Windows vs muntar un Samba AD DC) segons cost, dependència i dificultat.
6. **SpeedRun i avaluació**: un projecte centrat en la *connexió* de mons (compartir i autenticar en tots dos sentits) i un altre, opcional, de Samba AD DC.

---

## 4. Índex proposat a desenvolupar

Llegenda: *(sense marca)* = ja existent · **[NOU]** = capítol a crear · **[MILLORA]** = capítol existent a ampliar.

### Part A — Fonaments de la heterogeneïtat *(eix central)*

- **Bloc 1 · Conceptes d'integració**
    - Anatomia d'una infraestructura heterogènia (00)
    - Sistemes heterogenis (01)
    - Comparativa AD / LDAP / Samba-AD (02)
    - **[NOU] Particularitats i dificultats de la integració** — identitats (UID/GID ↔ SID), permisos (NTFS ↔ POSIX ↔ ACL), autenticació (Kerberos/DNS/rellotge), protocols (SMB ↔ NFS)

### Part B — Connexió Windows ↔ Linux en tots dos sentits *(nucli pràctic)*

- **Bloc 2 · Compartició creuada de recursos**
    - NFS · WS2022 com a servidor → Ubuntu client (01)
    - NFS · Ubuntu servidor → Windows client (02)
    - **[NOU] Accés a comparticions Windows des de Linux** — `smbclient`, `mount -t cifs`, `cifs-utils`, `/etc/fstab`
    - **[MILLORA] Mapatge d'identitats i permisos** en la compartició creuada (fil de dificultats aplicat)
- **Bloc 3 · Autenticació creuada: Ubuntu al domini AD de Windows**
    - Ubuntu → AD: `realmd` (01)
    - `sssd.conf` per a AD (02)
    - Kerberos a Linux (03)
    - `oddjob-mkhomedir` (04)

### Part C — Alternativa: el nostre propi controlador de domini

- **Bloc 4 · Samba com a AD DC** *(alternativa, després d'entendre la integració)*
    - Arquitectura i preparació (01)
    - **[MILLORA] Instal·lació i provisió del domini** — `samba-tool domain provision --use-rfc2307`, gestió de serveis, verificació (SRV, `wbinfo`)
    - **[NOU] Configuració del domini** — DNS intern, Kerberos, NTP, salut del DC
    - **[NOU] Gestió d'usuaris i grups del domini** — `samba-tool user`/`group`, polítiques de contrasenya
    - Windows 11 → Samba AD DC (02)
    - Ubuntu 24.04 → Samba AD DC (03)
    - **[NOU] Perfils mòbils al domini Samba AD**
    - **[NOU] Administració remota amb RSAT** des de Windows
    - **[NOU] Comparativa d'estratègies** — unir Linux a AD de Windows vs muntar Samba AD DC

### Part D — Recursos i tancament

- **Bloc 5 · Recursos i ACLs** — (01) sense canvis
- **Bloc 6 · Diagnòstic integral** — (01) sense canvis
- **SpeedRun**
    - Projectes existents
    - **[NOU] Projecte · Connexió heterogènia** (compartir i autenticar Windows↔Linux en tots dos sentits)
    - **[NOU] Projecte (opcional) · Samba AD DC**

**Resum de feina nova a UT4:** un capítol clau de "particularitats i dificultats" (eix conceptual) + tancar la compartició bidireccional (client SMB des de Linux) + ampliar Samba AD DC com a *alternativa*. **Sense Zentyal.** La primera part (Parts A i B) és la que ha de deixar clar l'objectiu; Samba AD DC (Part C) queda com a extensió.

---

## Prioritat global entre unitats (suggeriment)

1. **UT2** — més mancances (administració bàsica de Linux: usuaris locals, bash, cron, web, GUI LDAP).
2. **UT4** — reforçar la connexió Windows↔Linux i les seves dificultats (eix), i després Samba AD DC com a alternativa; a més és la més curta.
3. **UT3** — eix de seguretat i client SMB des de Linux.
4. **UT1** — la més completa; només relacions de confiança i boscos.
