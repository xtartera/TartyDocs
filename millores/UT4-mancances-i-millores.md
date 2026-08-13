# UT4 · Integració de sistemes heterogenis — Mancances i propostes de millora

> Anàlisi comparativa entre el material local (TartyDocs · UT4) i el manual de referència [SOX de Sergi Coll](https://sergi-coll.gitbook.io/sox) (UF4).
> Objectiu: detectar buits i proposar un índex evolucionat que mantingui el que ja tenim i hi afegeixi les novetats.

> **✅ ESTAT: IMPLEMENTAT (2026-08-13).** Aquest pla s'ha aplicat i **publicat** a la UT4 (commit `6cb6f9f`). Es va desenvolupar primer com a UT5 de proves i, un cop validada, es va fusionar amb la UT4 conservant el contingut existent. Aquest document es manté com a **registre històric** del procés. Únic pendent: els 2 projectes SpeedRun nous (vegeu més avall).

---

## Enfocament de la unitat (eix central)

L'**eix central de la UT4** és **entendre els sistemes operatius heterogenis** a través de la **connexió entre Windows i Linux en tots dos sentits**, i sobretot les **particularitats i dificultats** que hi apareixen: el mapatge d'identitats (UID/GID ↔ SID), la traducció de permisos (NTFS ↔ POSIX ↔ ACLs), les diferències d'autenticació (Kerberos, SSSD, PAM) i la interoperabilitat de protocols (SMB/CIFS ↔ NFS) i de noms (DNS).

Aquesta comprensió s'assoleix amb **la primera part** de la unitat (compartició i domini creuats Windows↔Linux). Només **després**, i com a **alternativa**, s'introdueix **Samba com a AD DC** (muntar el propi controlador de domini compatible). L'objectiu pedagògic no és muntar un producte concret, sinó que l'alumne entengui *per què* la convivència de mons és difícil i *com* es resol.

---

## 1. Estat del material (abans → després de la fusió)

**Abans:** 6 blocs / ~14 pàgines (la UT més curta), amb la integració tractada de forma dispersa.

**Després (publicat):** 6 blocs reorganitzats / 23 pàgines + índex + 4 SpeedRun, amb l'eix Windows↔Linux i un capítol propi de dificultats. Blocs finals:

- Bloc 1 · **Fonaments de la heterogeneïtat** (+ particularitats i dificultats)
- Bloc 2 · **Compartició creuada** (+ client SMB des de Linux, + mapatge d'identitats i permisos)
- Bloc 3 · **Autenticació creuada** (realmd/SSSD/Kerberos/oddjob)
- Bloc 4 · **Samba com a AD DC (alternativa)** (provisió, domini, usuaris/grups, perfils mòbils, RSAT, comparativa)
- Bloc 5 · Recursos i ACLs · Bloc 6 · Diagnòstic integral

---

## 2. Mancances detectades (i com s'han resolt)

| # | Mancança | Prioritat | Estat |
|---|----------|:---------:|:-----:|
| 1 | **Fil explícit de "particularitats i dificultats"** de la heterogeneïtat (SID↔UID/GID, NTFS↔POSIX↔ACL, autenticació, protocols). | Alta | ✅ Fet — nou capítol Bloc 1 |
| 2 | **Accés a comparticions Windows des de Linux** (`smbclient`, `mount -t cifs`, `/etc/fstab`). | Alta | ✅ Fet — nou capítol Bloc 2 |
| 3 | **Administració completa de Samba AD DC** (usuaris/grups, domini, perfils mòbils, RSAT). | Mitjana | ✅ Fet — Bloc 4 ampliat |

> **Nota sobre Zentyal:** descartat definitivament. És un producte de nínxol (Development Edition d'autosuport) i enganxa l'alumne a una GUI concreta en comptes de consolidar els fonaments transferibles. L'alternativa "controlador de domini propi" la cobreix **Samba AD DC**, tractat directament.

---

## 3. Propostes de millora — totes aplicades

1. ✅ **Primera part com a nucli conceptual** — la compartició i el domini creuats deixen clar què és un entorn heterogeni i quines friccions té.
2. ✅ **Capítol transversal de "particularitats i dificultats"** (identitats, permisos, autenticació, protocols).
3. ✅ **Compartició bidireccional completa** — afegit el sentit Windows → Linux com a client (`smbclient`/`mount.cifs`).
4. ✅ **Samba AD DC com a alternativa, no com a eix** — detallat (provisió, domini, usuaris, perfils mòbils, RSAT) però situat després de la integració.
5. ✅ **Fil comparatiu** — capítol final de comparativa d'estratègies (unir Linux a AD de Windows vs Samba AD DC).
6. 🔲 **SpeedRun nous** — *pendent*: encara no s'han creat els 2 projectes proposats (vegeu secció 4).

---

## 4. Índex desenvolupat (estructura publicada)

Llegenda: *(sense marca)* = ja existent · **[FET]** = desenvolupat en la fusió · **🔲** = pendent.

### Part A — Fonaments de la heterogeneïtat *(eix central)*

- **Bloc 1 · Fonaments de la heterogeneïtat**
    - Anatomia d'una infraestructura heterogènia (00)
    - Sistemes heterogenis (01)
    - Comparativa AD / LDAP / Samba-AD (02)
    - **[FET] Particularitats i dificultats de la integració** (03)

### Part B — Connexió Windows ↔ Linux en tots dos sentits *(nucli pràctic)*

- **Bloc 2 · Compartició creuada**
    - NFS · WS2022 com a servidor → Ubuntu client (01)
    - NFS · Ubuntu servidor → Windows client (02)
    - **[FET] Accés a comparticions Windows des de Linux** (03)
    - **[FET] Mapatge d'identitats i permisos** en la compartició creuada (04)
- **Bloc 3 · Autenticació creuada**
    - Ubuntu → AD: `realmd` (01) · `sssd.conf` per a AD (02) · Kerberos a Linux (03) · `oddjob-mkhomedir` (04)

### Part C — Alternativa: el nostre propi controlador de domini

- **Bloc 4 · Samba com a AD DC** *(alternativa)*
    - Arquitectura i preparació (01)
    - **[FET] Instal·lació i provisió del domini** (02)
    - **[FET] Configuració del domini** — DNS intern, Kerberos, NTP (03)
    - **[FET] Gestió d'usuaris i grups del domini** (04)
    - Windows 11 → Samba AD DC (05)
    - Ubuntu 24.04 → Samba AD DC (06)
    - **[FET] Perfils mòbils al domini Samba AD** (07)
    - **[FET] Administració remota amb RSAT** (08)
    - **[FET] Comparativa d'estratègies** (09)

### Part D — Recursos i tancament

- **Bloc 5 · Recursos i ACLs** (01) · **Bloc 6 · Diagnòstic integral** (01)
- **SpeedRun**
    - Projectes existents (41, 42, 44, 45)
    - 🔲 **[PENDENT] Projecte · Connexió heterogènia** (compartir i autenticar Windows↔Linux en tots dos sentits)
    - 🔲 **[PENDENT] Projecte (opcional) · Samba AD DC**

**Resultat:** capítol d'eix conceptual + compartició bidireccional tancada + Samba AD DC ampliat com a alternativa, tot publicat. **Sense Zentyal.** Queden pendents únicament els 2 projectes SpeedRun.

---

## Prioritat global entre unitats (actualitzada)

1. **UT2** — més mancances (administració bàsica de Linux: usuaris locals, bash, cron, web, GUI LDAP). *(pendent)*
2. **UT3** — eix de seguretat i client SMB des de Linux. *(pendent)*
3. **UT1** — la més completa; només relacions de confiança i boscos. *(pendent)*
4. ~~**UT4**~~ — ✅ **fet i publicat** (aquest document).
