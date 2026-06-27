# PROMPT_MESTRE_UT2 — Registre operatiu de la UT2 · Linux Server i LDAP

> **Versió**: 1.0 — Redactat durant la sessió de construcció de UT2 (juny 2026)
> **Ús**: carrega aquest fitxer quan continuïs la UT2 o quan comencis una nova UT sense PDF de projectes propis.
> **Relació amb altres documents**:
> - `PROMPT_MESTRE_UT.md` → metodologia genèrica Fases 1–4 (no tocar)
> - `decisions/UT2-ANALISI-PROJECTES.md` → anàlisi estructurada dels 45 conceptes
> - Aquest fitxer → decisions de criteri, lliçons apreses, patrons de redacció UT2

---

## 1. Context i material de partida

### Font de contingut

Els continguts de UT2 es van extreure del PDF **"Projectes 21-27 UT2 LDAP i perfils mòvils"** que conté 6 projectes:

| Codi | Títol | Bloc/s cobert/s |
|------|-------|----------------|
| P21 | Preparació del servidor Ubuntu 24.04 | Bloc 1 + Bloc 2 |
| P22 | LDAP funcional preparat per integració | Bloc 3 + Bloc 4 (part) |
| P23 | LDAP ampliat, validat i preparat per multiusuari | Bloc 4 (final) |
| P24 | Laboratori de manipulació LDAP (entorn segur) | Bloc 5 |
| P25 | Integració real de LDAP amb Linux (SSSD) | Bloc 6 |
| P26 | Perfils mòbils multiusuari amb LDAP, SSSD, autofs i NFS | Bloc 7 + Bloc 8 + Bloc 9 |

### Topologia del laboratori (fixada per a tota la UT2)

```
Ubuntu Server 24.04 LTS
  enp0s3 → NAT (DHCP, Internet)
  enp0s8 → Xarxa interna 192.168.100.10/24
  hostname: srv-ldap
  domini LDAP: dc=lafita,dc=local
  ou: ou=usuaris, ou=grups
  UID usuaris: 1001, 1002... (mai < 1000)
  Carpeta de perfils: /perfils/<usuari>

Client Ubuntu (si s'usa)
  enp0s8 → 192.168.100.20/24
```

---

## 2. Estructura de UT2 (resultat de les Fases 1–4)

### Resum de blocs

| Bloc | Nom | Fitxers | Dificultat | RA |
|------|-----|---------|-----------|-----|
| 1 | Fonaments Linux | 01–02 | 1 | RA1 |
| 2 | Instal·lació i xarxa | 03–09 | 2–3 | RA1 |
| 3 | LDAP – Conceptes | 10–15 | 3–4 | RA2 |
| 4 | LDAP – Usuaris i grups | 16–22 | 3–5 | RA2 |
| 5 | LDAP – Operacions CRUD | 23–26 | 4–5 | RA2 |
| 6 | SSSD | 27–33 | 3–6 | RA3 |
| 7 | NFS | 34–37 | 3–5 | RA4 |
| 8 | Perfils mòbils | 38–44 | 5–6 | RA4 |
| 9 | Diagnòstic integral | 45 | 6 | RA5 |

**Total: 45 pàgines + index.md**

### Estat de redacció (actualitza aquí)

| Bloc | Pàgines | Estat |
|------|---------|-------|
| Bloc 1 | 01–02 | ✅ Complet |
| Bloc 2 | 03–09 | ✅ Complet |
| Bloc 3 | 10–15 | ✅ Complet |
| Bloc 4 | 16–22 | ✅ Complet |
| Bloc 5 | 23–26 | ✅ Complet |
| Bloc 6 | 27–33 | ✅ Complet |
| Bloc 7 | 34–37 | ✅ Complet |
| Bloc 8 | 38–44 | ✅ Complet |
| Bloc 9 | 45 | ✅ Complet |

---

## 3. Decisions de criteri preses durant la construcció de UT2

### 3.1 Connexions explícites amb UT1

**Decisió**: cada pàgina del Bloc 1 i Bloc 2 inclou una comparativa amb l'equivalent Windows Server de la UT1 (taula o nota). Pàgines posteriors en fan referència puntual quan el concepte té un paral·lel directe.

**Motiu**: els alumnes van acabar la UT1. Anclar el nou coneixement en el que ja saben accelera l'aprenentatge.

**Com aplicar-ho**: quan escriguis una pàgina LDAP, NFS o autofs, pregunta't "quin era l'equivalent a la UT1?" i incloue'l en una nota, admonició `!!! tip` o columna de taula.

### 3.2 Ubuntu 22.04 vs 24.04 — nota pedagògica obligatòria

**Decisió**: la pàgina `42-perfils-ubuntu22-vs-24.md` explica en detall la diferència. Totes les pàgines dels Blocs 7 i 8 que impliquen NFS o autofs han de fer referència a aquesta diferència en una admonició `!!! info`.

**Context tècnic**:
- Ubuntu 22.04: `pam_mkhomedir` + `/etc/fstab` (mount estàtic) → simple, el home es crea sol
- Ubuntu 24.04: autofs + NFS (mount dinàmic) → complex, requereix auto.master + auto.home
- Ubuntu 26.04: no publicat a juny 2026; comportament esperat equivalent a 24.04

**Per quin motiu importa pedagògicament**: si un alumne busca tutorials a Internet sobre perfils mòbils Linux i troba tutorials de 22.04, el procediment és diferent i pot confondre'l. Hem d'anticipar-ho.

### 3.3 Nomenclatura dels fitxers LDIF als exemples

**Decisió**: als exemples de codi, els fitxers LDIF s'anomenen amb un nom descriptiu:
- `usuaris-base.ldif` → estructura de ou=usuaris i ou=grups
- `alumnes.ldif` → usuaris de prova
- `modifica-uid.ldif` → exemple ldapmodify

**Motiu**: evitar noms genèrics com `fitxer.ldif` o `prova.ldif` que no ajuden l'alumne a entendre el propòsit del fitxer.

### 3.4 Valors concrets de laboratori

**Decisió**: tots els exemples de codi usen valors concrets del laboratori (no valors genèrics com `<NOM>` o `[DOMINI]`):

| Element | Valor del laboratori |
|---------|---------------------|
| Domini LDAP | `dc=lafita,dc=local` |
| Admin LDAP | `cn=admin,dc=lafita,dc=local` |
| OU d'usuaris | `ou=usuaris,dc=lafita,dc=local` |
| OU de grups | `ou=grups,dc=lafita,dc=local` |
| Usuaris exemple | `maria.puig`, `pere.costa`, `anna.valls` (els mateixos que UT1) |
| UID usuaris | 1001, 1002, 1003 |
| GID grup alumnes | 2001 |
| Carpeta perfils | `/perfils` |
| Servidor | `192.168.100.10` |

**Motiu**: els alumnes han de poder copiar les ordres i executar-les sense substituir res. Si han de substituir `[DOMINI]` per `lafita.local`, cometen errors de sintaxi.

### 3.5 Seqüència de les ordres LDAP

**Decisió**: les pàgines de Bloc 4 i 5 presenten les ordres LDAP en aquest ordre fix:

```
slappasswd → ldapadd → ldapsearch → ldapwhoami → ldapmodify → ldapdelete
```

**Motiu**: és l'ordre lògic d'ús: primer crees (hash de contrasenya, afegir), després consultes (search, whoami), i finalment modifiques/elimines. L'alumne mai modifica el que no ha creat prèviament.

### 3.6 Errors freqüents extrets dels projectes

Els errors habituals identificats als PDF i que **han d'aparèixer a les pàgines corresponents**:

| Error | Pàgina on apareix |
|-------|-------------------|
| UID/GID en conflicte amb usuaris locals del sistema | 21-coherencia-uid-gid.md |
| `sssd.conf` sense `chmod 600` — SSSD no arrenca | 29-configuracio-sssd-conf.md |
| `/etc/exports` modificat però sense `exportfs -ra` | 36-etc-exports.md |
| autofs sense `--ghost`: la carpeta sembla no existir | 41-auto-home-wildcard.md |
| Diferència de comportament 22.04 vs 24.04 amb pam_mkhomedir | 42-perfils-ubuntu22-vs-24.md |
| `ldapadd` amb separadors de línia incorrectes (espai mancat) | 14-format-ldif.md |
| `slapd` no arrenca si el hostname no es resol | 05-hostname-resolucio.md |

---

## 4. Patrons de redacció específics per a contingut Linux/LDAP

### 4.1 Estructura d'una pàgina de comanda LDAP (Blocs 3–5)

```markdown
# :material-[icona]: [Nom de la comanda]

!!! abstract "Concepte clau"
    [Frase de ≤25 paraules: QUÈ fa + PER QUÈ s'usa]

=== "Apunts"
    ## Sintaxi

    ```bash
    [comanda] [opcions habituals]
    ```

    ## Opcions principals

    | Opció | Significat |
    |-------|-----------|
    | `-x` | ... |

    ## Exemple bàsic

    ```bash
    [exemple mínim que funciona al laboratori]
    ```

    ## Exemple avançat / cas real

    ```bash
    [exemple amb opcions addicionals]
    ```

    ## Verificació del resultat

    ```text
    [sortida esperada a la consola]
    ```

    !!! warning "Error freqüent"
        [L'error que cometen gairebé tots + per quin motiu]

=== "Activitat"
    ## Activitat [N].[M] · [Títol descriptiu]
    [...]

=== "Vídeo"
    [...]
```

### 4.2 Icones recomanades per a UT2

| Icona Material | Ús recomanat |
|---------------|-------------|
| `:material-linux:` | Pàgines generals Linux |
| `:material-server:` | Servidor Ubuntu |
| `:material-ip-network:` | Xarxa, netplan |
| `:material-ethernet:` | Interfícies de xarxa |
| `:material-package-variant:` | apt, paquets |
| `:material-ssh:` | SSH |
| `:material-clock-sync:` | NTP, chrony |
| `:material-wall-fire:` | Firewall, ufw |
| `:material-account-key:` | LDAP, autenticació |
| `:material-database:` | Directori LDAP |
| `:material-text-box-code:` | Format LDIF |
| `:material-magnify:` | ldapsearch |
| `:material-account-plus:` | ldapadd |
| `:material-account-edit:` | ldapmodify |
| `:material-account-remove:` | ldapdelete |
| `:material-check-decagram:` | ldapwhoami, verificació |
| `:material-shield-account:` | SSSD |
| `:material-file-tree:` | /etc/nsswitch.conf |
| `:material-folder-network:` | NFS |
| `:material-server-network:` | NFS servidor |
| `:material-folder-sync:` | autofs, perfils mòbils |
| `:material-home-account:` | Directori home, perfils |
| `:material-lock-check:` | Permisos, chmod, chown |
| `:material-bug-check:` | Diagnòstic |
| `:material-swap-horizontal:` | Comparativa (Linux vs Windows) |

### 4.3 Tags a usar per a UT2

```yaml
tags:
  - ut2
  - linux          # pàgines generals Linux
  - ubuntu         # Ubuntu específic
  - ldap           # qualsevol pàgina LDAP
  - openldap       # instal·lació/configuració OpenLDAP
  - ldif           # format LDIF
  - posix          # atributs/objectclasses POSIX
  - sssd           # SSSD
  - nfs            # NFS
  - autofs         # autofs
  - perfils        # perfils mòbils
  - xarxa          # netplan, ip, ufw
  - apt            # gestió de paquets
  - ssh            # SSH
  - ntp            # sincronització horària
  - seguretat      # permisos, ufw
  - diagnostic     # pàgines de diagnòstic
  - active-directory  # comparatives amb AD (si escau)
```

---

## 5. Seqüència d'escriptura recomanada

Segueix l'ordre de blocs. Dins de cada bloc, escriu les pàgines en ordre numèric.

**Prerequisit**: llegir els PDF dels projectes corresponents al bloc que escrius.

```
Bloc 3 (10–15): Llegeix P22 sencer
  → Escriu 10, 11 (comparativa, conceptes)
  → Escriu 12, 13 (instal·lació, dpkg-reconfigure)
  → Escriu 14, 15 (LDIF, ldapsearch)

Bloc 4 (16–22): Llegeix P22 (final) + P23
  → Escriu 16, 17 (atributs, objectclasses — teoria)
  → Escriu 18 (slappasswd)
  → Escriu 19, 20 (ldapadd, ldapwhoami)
  → Escriu 21, 22 (coherència UID/GID, multiusuari)

Bloc 5 (23–26): Llegeix P24
  → Escriu 23, 24 (ldapmodify, ldapdelete)
  → Escriu 25 (errors freqüents — pàgina clau)
  → Escriu 26 (entorn de proves)

Bloc 6 (27–33): Llegeix P25 sencer
  → Escriu 27 (SSSD conceptes — important el diagrama d'arquitectura)
  → Escriu 28, 29, 30 (instal·lació, sssd.conf, nsswitch)
  → Escriu 31, 32, 33 (getent, sssctl, autenticació)

Bloc 7 (34–37): Llegeix P26 (primera part)
  → Escriu 34, 35 (NFS conceptes, instal·lació)
  → Escriu 36, 37 (exports, exportfs)

Bloc 8 (38–44): Llegeix P26 (segona part) — el bloc clau de la UT
  → Escriu 38 (estructura de perfils)
  → Escriu 39, 40, 41 (autofs conceptes, auto.master, auto.home)
  → Escriu 42 (comparativa 22.04 vs 24.04 — pàgina pedagògicament crítica)
  → Escriu 43, 44 (persistència, seguretat)

Bloc 9 (45): Síntesi de tot
  → Escriu 45 (diagnòstic integral)
```

---

## 6. Contingut que pot faltar (P27 no inclòs al PDF)

El títol del PDF era "Projectes 21-27" però el PDF contenia fins al P26. El **P27** (si existeix) no va ser proporcionat. Si el tens, probablement cobreixi:
- Validació final del sistema complet (LDAP + SSSD + NFS + autofs)
- Troubleshooting avançat
- Pot pertànyer al Bloc 9 (diagnòstic) o ser un projecte de validació final

Quan el tinguis, aplica les Fases 1–4 del PROMPT_MESTRE_UT.md i integra els nous conceptes a l'índex existent o crea pàgines noves.

---

## 7. Lliçons per a UT3 i UT4 (quan el material és escàs)

### Si no tens PDF de projectes

Quan no disposes de projectes PDF, la font alternativa per a les Fases 1–4 és:
1. **Currículum oficial**: busca els RA/CA del mòdul MP04-0224 al BOE/DOGC
2. **Projectes anteriors**: demana a l'usuari quines pràctiques ha fet en cursos anteriors
3. **Estàndard de mercat**: per a SAMBA (UT3) o interoperabilitat (UT4), usa els manuals oficials com a font de conceptes

### Seqüència mínima per generar contingut sense projectes

```
1. Demana a l'usuari: "quines pràctiques fem en aquesta UT?"
   → Anota el llistat d'activitats (substitueix el PDF)
2. Aplica Fase 1 a partir de les activitats descrites
3. Fes les Fases 2–4 com sempre
4. Verifica amb l'usuari l'índex resultant
5. Escriu contingut
```

### Dependències tècniques a recordar per a UT3/UT4

| UT | Prerequisits de les anteriors |
|----|------------------------------|
| **UT3 · SAMBA** | Necessita Ubuntu Server (UT2 Blocs 1–2) + conceptes NFS (UT2 Bloc 7) + AD DS (UT1 Bloc 4) |
| **UT4 · Heterogenis** | Necessita tot UT1 (AD) + UT2 (LDAP/SSSD) + UT3 (SAMBA) |

---

## 8. Referència ràpida: fitxers de configuració de UT2

| Fitxer | Servei | Pàgina de referència |
|--------|--------|---------------------|
| `/etc/netplan/*.yaml` | Xarxa | 04-netplan-ip-fixa.md |
| `/etc/hosts` | Resolució local | 05-hostname-resolucio.md |
| `/etc/ldap/ldap.conf` | Client LDAP (global) | 29-configuracio-sssd-conf.md |
| `/etc/slapd.conf` (antic) / `/etc/ldap/slapd.d/` | OpenLDAP | 13-configuracio-base-ldap.md |
| `/etc/sssd/sssd.conf` | SSSD | 29-configuracio-sssd-conf.md |
| `/etc/nsswitch.conf` | NSS | 30-nsswitch-conf.md |
| `/etc/exports` | NFS exportacions | 36-etc-exports.md |
| `/etc/auto.master` | autofs mapa principal | 40-auto-master.md |
| `/etc/auto.home` | autofs mapa dinàmic | 41-auto-home-wildcard.md |
| `/var/log/syslog` | Logs generals | 45-diagnostic-integral-linux.md |
| `/var/log/sssd/sssd_nss.log` | Logs SSSD | 45-diagnostic-integral-linux.md |

---

## 9. Ordres de diagnòstic de referència (Bloc 9)

Quan escriguis el Bloc 9, usa aquestes ordres com a esquelet:

```bash
# ── LDAP ───────────────────────────────
systemctl status slapd
ldapwhoami -x -H ldap://localhost
ldapsearch -x -b "dc=lafita,dc=local" "(uid=*)" uid

# ── SSSD ───────────────────────────────
systemctl status sssd
sssctl config-check
getent passwd maria.puig
id maria.puig
journalctl -u sssd --since "1 hour ago"
cat /var/log/sssd/sssd_nss.log | tail -50

# ── NFS ────────────────────────────────
systemctl status nfs-kernel-server
exportfs -v
showmount -e localhost
showmount -e 192.168.100.10    # des del client

# ── autofs ─────────────────────────────
systemctl status autofs
automount -f --verbose         # mode debug
ls /home/                       # ha de mostrar les carpetes ghost

# ── Seqüència de diagnòstic complet ────
# 1. LDAP ok?  → ldapwhoami -x
# 2. SSSD ok?  → getent passwd maria.puig
# 3. NFS ok?   → showmount -e 192.168.100.10
# 4. autofs ok? → ls /home/maria.puig
# 5. Perfil ok? → ls -la /home/maria.puig
```

---

## 10. Historial de sessions

| Data | Sessió | Tasques completades |
|------|--------|-------------------|
| 2026-06 | Sessió 1 | Anàlisi PDF P21–P26, proposta 45 blocs (Fases 1–4) |
| 2026-06 | Sessió 2 | decisions/UT2-ANALISI-PROJECTES.md, mkdocs.yml actualitzat, stubs 01–45, contingut Blocs 1+2 (pàgines 01–09) |
| 2026-06 | Sessió 3 | PROMPT_MESTRE_UT2.md creat, contingut Bloc 3 (pàgines 10–15: conceptes LDAP, LDAP vs AD, instal·lació slapd, dpkg-reconfigure, format LDIF, ldapsearch) |
| 2026-06 | Sessió 4 | Contingut Bloc 4 (pàgines 16–22: atributs POSIX, objectClasses, slappasswd, ldapadd, ldapwhoami, coherència UID/GID, multiusuari) |
| 2026-06 | Sessió 5 | Contingut Bloc 5 (pàgines 23–26: ldapmodify, ldapdelete, errors LDAP freqüents, entorn de proves) |
| 2026-06 | Sessió 6 | Contingut Bloc 6 (pàgines 27–33: SSSD conceptes+arquitectura, instal·lació, sssd.conf+chmod600, nsswitch.conf, getent+id, sssctl, login real) |
| 2026-06 | Sessió 7 | Contingut Bloc 7 (pàgines 34–37: NFS conceptes+comparativa SMB, instal·lació nfs-kernel-server, /etc/exports+no_root_squash+error exportfs-ra, exportfs+showmount+muntatge manual) |
| 2026-06 | Sessió 8 | Contingut Bloc 8 (pàgines 38–44: estructura perfils mòbils+flux complet, autofs conceptes+ghost+timeout, auto.master+error-ghost-crític, auto.perfils+wildcard+&+diagnòstic, comparativa 22.04 vs 24.04, persistència roaming multi-client, seguretat permisos 700+UID/GID+no_root_squash) |
| 2026-06 | Sessió 9 | Contingut Bloc 9 (pàgina 45: diagnòstic integral 5 capes LDAP→SSSD→NFS→autofs→POSIX, protocol de 5 passos amb ordres concretes, fluxograma mermaid complet, script diagnostic-ut2.sh reutilitzable, taula d'errors freqüents recapitulada, taula de fitxers+logs de la UT2, activitat de fallada controlada+prova final roaming) — UT2 completament redactada |
