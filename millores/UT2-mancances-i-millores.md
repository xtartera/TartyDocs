# UT2 · Linux Server i LDAP — Mancances i propostes de millora

> Anàlisi comparativa entre el material local (TartyDocs · UT2) i el manual de referència [SOX de Sergi Coll](https://sergi-coll.gitbook.io/sox) (UF2).
> Objectiu: detectar buits i proposar un índex evolucionat que mantingui el que ja tenim i hi afegeixi les novetats.

> **✅ ESTAT: IMPLEMENTAT (2026-08-13).** Aplicat i **publicat** (commit `41cbadb`). S'ha afegit el nou **Bloc 3 · Administració bàsica de Linux** (permisos, usuaris/grups locals, bash, cron, administració web) i el capítol **Gestió gràfica de LDAP**, amb renumeració global neta. UT2 passa de 45 a 51 pàgines. Document mantingut com a **registre històric**. Únic pendent: el projecte SpeedRun nou (vegeu més avall).

---

## 1. Estat actual del material (què ja tenim)

UT2 té **9 blocs / ~45 pàgines**, molt sòlida en la part de directori:

- Fonaments (Windows vs Ubuntu, arquitectura Ubuntu 24.04).
- Instal·lació i xarxa: `netplan` (IP fixa), hostname/resolució, `apt`, SSH, sincronització horària, `ufw`.
- **OpenLDAP** en profunditat: conceptes, LDIF, `ldapsearch`, atributs/objectClasses POSIX, `slappasswd`, coherència UID/GID.
- CRUD LDAP (`ldapmodify`, `ldapdelete`, errors freqüents, entorn de proves).
- **SSSD** (sssd.conf, nsswitch, `getent`/`id`, `sssctl`, autenticació real).
- NFS i **perfils mòbils** amb `autofs` (wildcard, roaming), diagnòstic integral.
- Projectes **SpeedRun** guiats.

---

## 2. Mancances detectades (ho cobreix la referència, aquí no)

Aquesta és la UT amb **més mancances**, totes de "administració Linux clàssica" que el material actual dóna per sabuda i salta directament a LDAP.

| # | Mancança | A la referència (UF2) | Prioritat |
|---|----------|----------------------|:---------:|
| 1 | **Gestió d'usuaris i grups locals** (`adduser`, `usermod -aG`, `passwd`, `chage`, `/etc/passwd`, `/etc/shadow`, `/etc/group`, `sudoers`). | Sí (pràctic) | **Alta** |
| 2 | **Gestió d'arxius i permisos bàsics** de Linux (navegació, `chmod`/`chown`, propietat, permisos octals) com a base abans de NFS/LDAP. | Sí | **Alta** |
| 3 | **Scripts de bash** (shebang `#!/bin/bash`, `chmod +x`, cometes, variables, paràmetres, condicions, bucles). | Sí (parcial, seccions incompletes) | **Alta** |
| 4 | **Automatització de tasques amb cron/crontab** (`crontab -e`, format dels 5 camps, exemples). Equivalent Linux del Planificador de Windows. | Sí | **Alta** |
| 5 | **Administració web i monitoratge gràfic**: Webmin (port 10000), Ntopng, Nagios, Cacti. | Sí | Mitjana |
| 6 | **Gestió gràfica de LDAP**: phpLDAPadmin (web) i LAT/LAM (client). | Sí | Mitjana |

---

## 3. Propostes de millora del material actual

1. **Crear un bloc previ d'administració bàsica de Linux** abans d'entrar a LDAP: usuaris locals, permisos i bash. Això dóna la base que ara falta i fa que el salt a LDAP sigui menys abrupte.
2. **Afegir cron** com a capítol propi i enllaçar-lo explícitament amb el "Planificador de tasques" de la UT1 (paral·lelisme Windows↔Linux, coherent amb la taula comparativa que ja tens a la portada de UT1).
3. **Oferir la doble via CLI + GUI a LDAP**: mantenir tota la potència del CLI (que ja tens i és el punt fort) i afegir un capítol de phpLDAPadmin com a alternativa visual, remarcant que el CLI és el que dóna control real.
4. **Incloure un capítol d'administració web** (Webmin) i, opcionalment, una eina de monitoratge gràfic (Cockpit seria una alternativa més moderna que Nagios/Cacti; valorar quina encaixa millor amb Ubuntu 24.04).
5. **Bash orientat a l'administració**: enfocar els scripts a tasques reals del mòdul (còpies, comprovacions de serveis, altes massives d'usuaris) en lloc de bash genèric — així connecta amb l'automatització i amb LDAP.
6. **Autoavaluació i SpeedRun**: afegir un projecte SpeedRun d'"administració bàsica + automatització" (usuari local → script → cron).

---

## 4. Índex proposat a desenvolupar

Llegenda: *(sense marca)* = ja existent · **[NOU]** = capítol a crear · **[MILLORA]** = capítol existent a ampliar.

Llegenda actualitzada: *(sense marca)* = ja existent · **[FET]** = desenvolupat · **🔲** = pendent.

- **Bloc 1 · Fonaments Linux** — (01–02) sense canvis
- **Bloc 2 · Instal·lació i xarxa** — (03–09) sense canvis
- **[FET] Bloc 3 · Administració bàsica de Linux** (10–14)
    - **[FET] Gestió d'arxius i permisos** (10)
    - **[FET] Usuaris i grups locals** (11)
    - **[FET] Introducció als scripts de bash** (12)
    - **[FET] Automatització amb cron** (13) *(enllaç al Planificador de UT1)*
    - **[FET] Administració web** — Webmin/Cockpit (14)
- **Bloc 4 · LDAP – Conceptes** — (15–20) *(renumerat)*
- **Bloc 5 · LDAP – Usuaris i grups** — (21–27)
    - **[FET] Gestió gràfica de LDAP** — phpLDAPadmin i LAM (28)
- **Bloc 6 · LDAP – Operacions CRUD** — (29–32) *(renumerat)*
- **Bloc 7 · SSSD** — (33–39) *(renumerat)*
- **Bloc 8 · NFS** — (40–43) *(renumerat)*
- **Bloc 9 · Perfils mòbils** — (44–50) *(renumerat)*
- **Bloc 10 · Diagnòstic** — (51) *(renumerat)*
- **SpeedRun**
    - Projectes existents (21–27)
    - 🔲 **[PENDENT] Projecte · Administració bàsica + automatització** (usuari local → script → cron)

**Resum de feina nova a UT2:** ✅ **Fet** el bloc nou d'administració bàsica de Linux (5 capítols) + gestió gràfica de LDAP, amb renumeració neta. Queda pendent només el projecte SpeedRun nou.
