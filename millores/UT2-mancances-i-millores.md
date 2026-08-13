# UT2 · Linux Server i LDAP — Mancances i propostes de millora

> Anàlisi comparativa entre el material local (TartyDocs · UT2) i el manual de referència [SOX de Sergi Coll](https://sergi-coll.gitbook.io/sox) (UF2).
> Objectiu: detectar buits i proposar un índex evolucionat que mantingui el que ja tenim i hi afegeixi les novetats.

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

- **Bloc 1 · Fonaments Linux** — (01–02) sense canvis
- **Bloc 2 · Instal·lació i xarxa** — (03–09) sense canvis
- **[NOU] Bloc · Administració bàsica de Linux**
    - **[NOU] Gestió d'arxius i permisos** — navegació, `chmod`/`chown`, permisos octals, propietat
    - **[NOU] Usuaris i grups locals** — `adduser`, `usermod`, `passwd`, `chage`, `/etc/passwd`, `/etc/shadow`, `sudoers`
    - **[NOU] Introducció als scripts de bash** — shebang, permisos, cometes, variables, condicions i bucles
    - **[NOU] Automatització amb cron** — `crontab`, format dels 5 camps, exemples pràctics *(enllaç al Planificador de UT1)*
    - **[NOU] Administració web** — Webmin (i, opcional, monitoratge gràfic tipus Cockpit)
- **Bloc 3 · LDAP – Conceptes** — (10–15) sense canvis
- **Bloc 4 · LDAP – Usuaris i grups** — (16–22)
    - **[NOU] Gestió gràfica de LDAP** — phpLDAPadmin (web) i LAT/LAM (client)
- **Bloc 5 · LDAP – Operacions CRUD** — (23–26) sense canvis
- **Bloc 6 · SSSD** — (27–33) sense canvis
- **Bloc 7 · NFS** — (34–37) sense canvis
- **Bloc 8 · Perfils mòbils** — (38–44) sense canvis
- **Bloc 9 · Diagnòstic** — (45) sense canvis
- **SpeedRun**
    - Projectes existents
    - **[NOU] Projecte · Administració bàsica + automatització** (usuari local → script → cron)

**Resum de feina nova a UT2:** un bloc nou d'administració bàsica de Linux (5 capítols) + gestió gràfica de LDAP + 1 projecte SpeedRun. És la UT prioritària per créixer.
