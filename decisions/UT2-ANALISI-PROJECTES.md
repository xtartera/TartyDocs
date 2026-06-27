# UT2 · Linux Server i LDAP — Anàlisi de projectes (Fases 1–4)

> Generat per Claude a partir dels Projectes 21–26 (PDF "Projectes 21-27 UT2 LDAP i perfils mòvils")
> Metodologia: PROMPT_MESTRE_UT.md v1.0

---

## FASE 1 — Extracció de conceptes per projecte

### Projecte UT2-21 — Preparació del servidor Ubuntu 24.04 per serveis de xarxa

| Activitat | Conceptes extrets |
|-----------|-------------------|
| A1 – Comparativa | Diferències Windows Server vs Ubuntu Server, arquitectura headless |
| A2 – Xarxa | Interfícies `enp0s3`/`enp0s8`, `ip a`, `ip link`, netplan YAML, IP fixa |
| A3 – Configuració base | `hostnamectl`, `/etc/hosts`, gestió de paquets `apt`, SSH remot |
| A4 – Serveis addicionals | `chrony` NTP, `timedatectl`, `ufw` firewall ports 22/389/2049 |

### Projecte UT2-22 — LDAP funcional preparat per integració

| Activitat | Conceptes extrets |
|-----------|-------------------|
| A1 – Conceptes | DN, OU, CN, DC, objectClass, arbre LDAP, comparativa AD vs LDAP |
| A2 – Instal·lació | `slapd`, `ldap-utils`, `dpkg-reconfigure slapd`, domini `dc=lafita,dc=local` |
| A3 – Format LDIF | Sintaxi LDIF, atributs obligatoris, separadors en blanc entre entrades |
| A4 – Atributs POSIX | `uidNumber`, `gidNumber`, `homeDirectory`, `loginShell`, `objectClass` |
| A5 – Objectclasses | `inetOrgPerson`, `posixAccount`, `shadowAccount`, `posixGroup` |
| A6 – Operacions | `slappasswd` SSHA, `ldapadd`, `ldapsearch` filtres, `ldapwhoami` |

### Projecte UT2-23 — LDAP ampliat, validat i preparat per multiusuari

| Activitat | Conceptes extrets |
|-----------|-------------------|
| A1 – Coherència | UID/GID únics, `homeDirectory` correcte, validació amb `ldapsearch` |
| A2 – Multiusuari | Creació de múltiples usuaris en bloc via LDIF |
| A3 – Diagnosi | Errors habituals: `already exists`, `No such object`, `Invalid credentials` |

### Projecte UT2-24 — Laboratori de manipulació LDAP (entorn segur)

| Activitat | Conceptes extrets |
|-----------|-------------------|
| A1 – Modificació | `ldapmodify`, `changetype: modify`, `replace`, `add`, `delete` d'atributs |
| A2 – Eliminació | `ldapdelete`, ordre correcte (fills abans pares) |
| A3 – Entorn segur | Distinció producció vs laboratori, usuaris de prova, rollback |

### Projecte UT2-25 — Integració real de LDAP amb Linux (SSSD)

| Activitat | Conceptes extrets |
|-----------|-------------------|
| A1 – Arquitectura SSSD | NSS + PAM + caché, daemon `sssd`, flux d'autenticació |
| A2 – Instal·lació | `sssd`, `sssd-ldap`, `libnss-sss`, `libpam-sss` |
| A3 – Configuració | `sssd.conf` (domini, `id_provider=ldap`, `auth_provider=ldap`, `enumerate`) |
| A4 – NSS | `/etc/nsswitch.conf`, integració `passwd/group/shadow → sss` |
| A5 – Verificació | `getent passwd`, `id`, `su -`, `sssctl config-check`, `whoami` |

### Projecte UT2-26 — Perfils mòbils multiusuari amb LDAP, SSSD, autofs i NFS

| Activitat | Conceptes extrets |
|-----------|-------------------|
| A1 – NFS servidor | `nfs-kernel-server`, `/etc/exports`, `rw,sync,noatime,root_squash`, `exportfs -ra` |
| A2 – Estructura perfils | `/perfils/usuari`, `chown UID:GID`, `chmod 700`, verificació des del servidor |
| A3 – autofs conceptes | Muntatge dinàmic vs `/etc/fstab`, `--timeout=60`, `--ghost` |
| A4 – auto.master | Mapa principal, punt de muntatge, referència al mapa de detall |
| A5 – auto.home | Mapa dinàmic amb wildcard `*`, opcions NFS |
| A6 – Ubuntu 22.04 vs 24.04 | `pam_mkhomedir` (simple) vs autofs+NFS (complex) |
| A7 – Verificació | Persistència multi-client, aïllament entre usuaris, `showmount -e` |
| A8 – Diagnosi integral | LDAP + SSSD + NFS + autofs, `journalctl`, `sssd_nss.log` |

---

## FASE 2 — Mapa d'aprenentatge

| ID | Concepte | Dificultat | Dependències | Projectes | Diagrama | Pràctica |
|----|----------|------------|--------------|-----------|----------|----------|
| C01 | Diferències Windows Server vs Ubuntu Server | 1 | — | P21 | Sí | No |
| C02 | Arquitectura Ubuntu Server 24.04 (minimal, headless) | 1 | C01 | P21 | Sí | No |
| C03 | Interfícies de xarxa en Linux: `ip link`, `ip a` | 2 | C02 | P21 | No | Sí |
| C04 | Configuració de xarxa amb netplan | 3 | C03 | P21 | No | Sí |
| C05 | Hostname i resolució local (`hostnamectl`, `/etc/hosts`) | 2 | C02 | P21 | No | Sí |
| C06 | Gestió de paquets: `apt update/upgrade/autoremove` | 2 | C02 | P21 | No | Sí |
| C07 | SSH: instal·lació, `systemctl enable`, accés remot | 2 | C06 | P21 | No | Sí |
| C08 | Sincronització horària: `chrony`, `timedatectl`, NTP | 3 | C06 | P21 | No | Sí |
| C09 | Firewall `ufw`: ports SSH/LDAP/NFS | 3 | C06 | P21 | No | Sí |
| C10 | Conceptes LDAP: DN, OU, CN, DC, objectClass, arbre | 3 | — | P22 | Sí | No |
| C11 | Comparativa LDAP vs Active Directory | 3 | C10 | P22 | Sí | No |
| C12 | OpenLDAP: instal·lació (`slapd`, `ldap-utils`) | 3 | C10 | P22 | No | Sí |
| C13 | Configuració base OpenLDAP (`dpkg-reconfigure slapd`) | 4 | C12 | P22 | No | Sí |
| C14 | Format LDIF: sintaxi, dn, atributs, separadors | 3 | C10 | P22 | No | No |
| C15 | `ldapsearch`: consultes bàsiques i filtres | 4 | C13,C14 | P22,P23 | No | Sí |
| C16 | Atributs POSIX: `uidNumber`, `gidNumber`, `homeDirectory` | 4 | C14 | P22 | No | No |
| C17 | objectClasses: `posixAccount`, `shadowAccount`, `posixGroup` | 4 | C16 | P22 | Sí | No |
| C18 | `slappasswd`: generació de hash SSHA | 3 | C13 | P22 | No | Sí |
| C19 | `ldapadd`: creació d'usuaris i grups via LDIF | 4 | C14,C16,C17,C18 | P22 | No | Sí |
| C20 | `ldapwhoami`: validació d'autenticació LDAP | 3 | C19 | P22 | No | Sí |
| C21 | Coherència LDAP: UID/GID únics, homeDirectory correcte | 5 | C16,C19 | P23 | No | Sí |
| C22 | LDAP multiusuari: crear múltiples usuaris en bloc | 4 | C19 | P23 | No | Sí |
| C23 | `ldapmodify`: modificació d'atributs | 5 | C19 | P24 | No | Sí |
| C24 | `ldapdelete`: eliminació d'objectes LDAP | 4 | C19 | P24 | No | Sí |
| C25 | Errors LDAP freqüents i diagnosi | 5 | C15,C19 | P23,P24 | Sí | Sí |
| C26 | Entorn de proves LDAP vs producció | 4 | C19 | P24 | No | No |
| C27 | SSSD: concepte i arquitectura (NSS, PAM, caché) | 5 | C10 | P25 | Sí | No |
| C28 | Instal·lació SSSD | 4 | C27 | P25 | No | Sí |
| C29 | Configuració `sssd.conf` | 6 | C13,C27,C28 | P25 | No | Sí |
| C30 | `/etc/nsswitch.conf`: integració NSS amb `sss` | 4 | C27 | P25 | No | Sí |
| C31 | `getent passwd` / `id`: verificació d'usuaris LDAP | 3 | C29,C30 | P25 | No | Sí |
| C32 | `sssctl config-check`: diagnòstic SSSD | 4 | C29 | P25 | No | Sí |
| C33 | Autenticació real Linux LDAP: `su -`, `whoami` | 4 | C29,C30 | P25 | No | Sí |
| C34 | NFS: conceptes i comparativa amb SMB | 3 | — | P26 | Sí | No |
| C35 | Instal·lació NFS servidor (`nfs-kernel-server`) | 3 | C34 | P26 | No | Sí |
| C36 | `/etc/exports`: opcions (`rw`, `sync`, `root_squash`) | 5 | C35 | P26 | No | Sí |
| C37 | `exportfs -ra` / `showmount -e`: verificació NFS | 4 | C36 | P26 | No | Sí |
| C38 | Estructura de perfils: `/perfils/usuari`, permisos | 5 | C36 | P26 | No | Sí |
| C39 | autofs: concepte vs `/etc/fstab` (muntatge dinàmic) | 5 | C34 | P26 | Sí | No |
| C40 | `/etc/auto.master`: mapa principal autofs | 5 | C39 | P26 | No | Sí |
| C41 | `/etc/auto.home`: mapa dinàmic amb wildcard `*` | 6 | C40 | P26 | No | Sí |
| C42 | Perfils mòbils Linux: Ubuntu 22.04 vs 24.04/26.04 | 6 | C38,C41 | P26 | Sí | No |
| C43 | Persistència i roaming multi-client | 5 | C41,C38 | P26 | No | Sí |
| C44 | Seguretat de perfils: aïllament entre usuaris | 5 | C38 | P26 | No | Sí |
| C45 | Diagnòstic integral: LDAP + SSSD + NFS + autofs | 6 | C25,C32,C37 | P26 | Sí | Sí |

**Total: 45 conceptes** en 6 projectes, 9 blocs pedagògics.

---

## FASE 3 — Matriu de traçabilitat

| ID | Concepte | P21 | P22 | P23 | P24 | P25 | P26 | RA | Fitxer MD |
|----|----------|-----|-----|-----|-----|-----|-----|----|-----------|
| C01 | Windows vs Ubuntu Server | ✓ | — | — | — | — | — | RA1 | 01-windows-vs-linux-server.md |
| C02 | Arquitectura Ubuntu 24.04 | ✓ | — | — | — | — | — | RA1 | 02-arquitectura-ubuntu-server.md |
| C03 | Interfícies de xarxa Linux | ✓ | — | — | — | — | — | RA1 | 03-interficies-xarxa-linux.md |
| C04 | netplan IP fixa | ✓ | — | — | — | — | — | RA1 | 04-netplan-ip-fixa.md |
| C05 | Hostname i resolució local | ✓ | — | — | — | — | — | RA1 | 05-hostname-resolucio.md |
| C06 | Gestió paquets apt | ✓ | — | — | — | — | — | RA1 | 06-gestio-paquets-apt.md |
| C07 | SSH accés remot | ✓ | — | — | — | — | — | RA1 | 07-ssh-acces-remot.md |
| C08 | Sincronització horària | ✓ | — | — | — | — | — | RA1 | 08-sincronitzacio-horaria.md |
| C09 | Firewall ufw | ✓ | — | — | — | — | — | RA1 | 09-firewall-ufw.md |
| C10 | Conceptes LDAP | — | ✓ | — | — | — | — | RA2 | 10-conceptes-ldap.md |
| C11 | LDAP vs Active Directory | — | ✓ | — | — | — | — | RA2 | 11-ldap-vs-active-directory.md |
| C12 | Instal·lació OpenLDAP | — | ✓ | — | — | — | — | RA2 | 12-installacio-openldap.md |
| C13 | Configuració base LDAP | — | ✓ | — | — | — | — | RA2 | 13-configuracio-base-ldap.md |
| C14 | Format LDIF | — | ✓ | — | — | — | — | RA2 | 14-format-ldif.md |
| C15 | ldapsearch consultes | — | ✓ | ✓ | — | — | — | RA2 | 15-ldapsearch-consultes.md |
| C16 | Atributs POSIX | — | ✓ | — | — | — | — | RA2 | 16-atributs-posix.md |
| C17 | objectClasses POSIX | — | ✓ | — | — | — | — | RA2 | 17-objectclasses-posix.md |
| C18 | slappasswd hash SSHA | — | ✓ | — | — | — | — | RA2 | 18-slappasswd-hash.md |
| C19 | ldapadd usuaris i grups | — | ✓ | — | — | — | — | RA2 | 19-ldapadd-usuaris-grups.md |
| C20 | ldapwhoami validació | — | ✓ | — | — | — | — | RA2 | 20-ldapwhoami-validacio.md |
| C21 | Coherència UID/GID | — | — | ✓ | — | — | — | RA2 | 21-coherencia-uid-gid.md |
| C22 | LDAP multiusuari | — | — | ✓ | — | — | — | RA2 | 22-ldap-multiusuari.md |
| C23 | ldapmodify | — | — | — | ✓ | — | — | RA2 | 23-ldapmodify.md |
| C24 | ldapdelete | — | — | — | ✓ | — | — | RA2 | 24-ldapdelete.md |
| C25 | Errors LDAP freqüents | — | — | ✓ | ✓ | — | — | RA2 | 25-errors-ldap-frequents.md |
| C26 | Entorn proves LDAP | — | — | — | ✓ | — | — | RA2 | 26-entorn-proves-ldap.md |
| C27 | SSSD conceptes | — | — | — | — | ✓ | — | RA3 | 27-sssd-conceptes.md |
| C28 | Instal·lació SSSD | — | — | — | — | ✓ | — | RA3 | 28-installacio-sssd.md |
| C29 | sssd.conf | — | — | — | — | ✓ | — | RA3 | 29-configuracio-sssd-conf.md |
| C30 | nsswitch.conf | — | — | — | — | ✓ | — | RA3 | 30-nsswitch-conf.md |
| C31 | getent / id verificació | — | — | — | — | ✓ | — | RA3 | 31-getent-id-verificacio.md |
| C32 | sssctl config-check | — | — | — | — | ✓ | — | RA3 | 32-sssctl-diagnostic.md |
| C33 | Autenticació real su - | — | — | — | — | ✓ | — | RA3 | 33-autenticacio-real-linux.md |
| C34 | NFS conceptes | — | — | — | — | — | ✓ | RA4 | 34-nfs-conceptes.md |
| C35 | Instal·lació NFS servidor | — | — | — | — | — | ✓ | RA4 | 35-installacio-nfs-servidor.md |
| C36 | /etc/exports | — | — | — | — | — | ✓ | RA4 | 36-etc-exports.md |
| C37 | exportfs / showmount | — | — | — | — | — | ✓ | RA4 | 37-exportfs-showmount.md |
| C38 | Estructura perfils Linux | — | — | — | — | — | ✓ | RA4 | 38-estructura-perfils-linux.md |
| C39 | autofs conceptes | — | — | — | — | — | ✓ | RA4 | 39-autofs-conceptes.md |
| C40 | auto.master | — | — | — | — | — | ✓ | RA4 | 40-auto-master.md |
| C41 | auto.home wildcard | — | — | — | — | — | ✓ | RA4 | 41-auto-home-wildcard.md |
| C42 | Perfils Ubuntu 22.04 vs 24.04 | — | — | — | — | — | ✓ | RA4 | 42-perfils-ubuntu22-vs-24.md |
| C43 | Persistència roaming | — | — | — | — | — | ✓ | RA4 | 43-persistencia-roaming.md |
| C44 | Seguretat de perfils | — | — | — | — | — | ✓ | RA4 | 44-seguretat-perfils.md |
| C45 | Diagnòstic integral Linux | — | — | — | — | — | ✓ | RA5 | 45-diagnostic-integral-linux.md |

---

## FASE 4 — Índex complet

```
docs/ut2/
├── index.md
├── bloc1-fonaments/
│   ├── 01-windows-vs-linux-server.md       [C01] dif.1
│   └── 02-arquitectura-ubuntu-server.md    [C02] dif.1
├── bloc2-installacio/
│   ├── 03-interficies-xarxa-linux.md       [C03] dif.2
│   ├── 04-netplan-ip-fixa.md               [C04] dif.3
│   ├── 05-hostname-resolucio.md            [C05] dif.2
│   ├── 06-gestio-paquets-apt.md            [C06] dif.2
│   ├── 07-ssh-acces-remot.md               [C07] dif.2
│   ├── 08-sincronitzacio-horaria.md        [C08] dif.3
│   └── 09-firewall-ufw.md                  [C09] dif.3
├── bloc3-ldap-conceptes/
│   ├── 10-conceptes-ldap.md                [C10] dif.3
│   ├── 11-ldap-vs-active-directory.md      [C11] dif.3
│   ├── 12-installacio-openldap.md          [C12] dif.3
│   ├── 13-configuracio-base-ldap.md        [C13] dif.4
│   ├── 14-format-ldif.md                   [C14] dif.3
│   └── 15-ldapsearch-consultes.md          [C15] dif.4
├── bloc4-ldap-usuaris/
│   ├── 16-atributs-posix.md                [C16] dif.4
│   ├── 17-objectclasses-posix.md           [C17] dif.4
│   ├── 18-slappasswd-hash.md               [C18] dif.3
│   ├── 19-ldapadd-usuaris-grups.md         [C19] dif.4
│   ├── 20-ldapwhoami-validacio.md          [C20] dif.3
│   ├── 21-coherencia-uid-gid.md            [C21] dif.5
│   └── 22-ldap-multiusuari.md              [C22] dif.4
├── bloc5-ldap-crud/
│   ├── 23-ldapmodify.md                    [C23] dif.5
│   ├── 24-ldapdelete.md                    [C24] dif.4
│   ├── 25-errors-ldap-frequents.md         [C25] dif.5
│   └── 26-entorn-proves-ldap.md            [C26] dif.4
├── bloc6-sssd/
│   ├── 27-sssd-conceptes.md                [C27] dif.5
│   ├── 28-installacio-sssd.md              [C28] dif.4
│   ├── 29-configuracio-sssd-conf.md        [C29] dif.6
│   ├── 30-nsswitch-conf.md                 [C30] dif.4
│   ├── 31-getent-id-verificacio.md         [C31] dif.3
│   ├── 32-sssctl-diagnostic.md             [C32] dif.4
│   └── 33-autenticacio-real-linux.md       [C33] dif.4
├── bloc7-nfs/
│   ├── 34-nfs-conceptes.md                 [C34] dif.3
│   ├── 35-installacio-nfs-servidor.md      [C35] dif.3
│   ├── 36-etc-exports.md                   [C36] dif.5
│   └── 37-exportfs-showmount.md            [C37] dif.4
├── bloc8-perfils-mobils/
│   ├── 38-estructura-perfils-linux.md      [C38] dif.5
│   ├── 39-autofs-conceptes.md              [C39] dif.5
│   ├── 40-auto-master.md                   [C40] dif.5
│   ├── 41-auto-home-wildcard.md            [C41] dif.6
│   ├── 42-perfils-ubuntu22-vs-24.md        [C42] dif.6
│   ├── 43-persistencia-roaming.md          [C43] dif.5
│   └── 44-seguretat-perfils.md             [C44] dif.5
└── bloc9-diagnostic/
    └── 45-diagnostic-integral-linux.md     [C45] dif.6
```

**Total**: 45 fitxers de contingut + index.md = **46 fitxers**

---

## Recomanacions pedagògiques

### 1. Dependències crítiques (no es poden saltar)

- **C04 (netplan)** → prerequisit per a tot (sense IP fixa res funciona)
- **C13 (dpkg-reconfigure slapd)** → prerequisit per a tots els blocs LDAP
- **C29 (sssd.conf)** → prerequisit per a autenticació real; sense SSSD, NFS i autofs no serveixen de res
- **C36 (/etc/exports)** → prerequisit per a autofs; sense exportació NFS no hi ha perfils

### 2. Concepte clau de la UT

**C41 (auto.home amb wildcard)**: és el punt de màxima dificultat i síntesi de la UT. Requereix que LDAP, SSSD, NFS i autofs funcionin simultàniament. Si l'alumne aconsegueix que el wildcard `*` munti automàticament el directori home de cada usuari LDAP, ha integrat tots els sistemes correctament.

### 3. Errors habituals identificats als projectes

1. **UID/GID en conflicte**: no comprovar que el `uidNumber` no coincideix amb un usuari local del sistema (ids < 1000 reservats).
2. **`sssd.conf` amb permisos incorrectes**: el fitxer ha de tenir `chmod 600` i `chown root:root` o SSSD no arrenca.
3. **`/etc/exports` sense `exportfs -ra`**: la configuració no s'aplica fins que no s'executa `exportfs -ra` o es reinicia el servei.
4. **autofs ghost**: sense `--ghost`, la carpeta de muntatge no apareix fins que s'hi accedeix, confusió típica en verificar.
5. **Diferència de versió Ubuntu**: en 22.04 `pam_mkhomedir` crea el home automàticament; en 24.04 cal autofs+NFS, i els alumnes esperen el comportament simple.

### 4. Progressió CLI

```
apt (gest. paquets) → ip/netplan (xarxa) → ldapadd/ldapsearch (LDAP) 
→ sssd/getent (integració) → exportfs/showmount (NFS) → automount (autofs)
```

### 5. Seqüència setmanal estimada

| Setmana | Bloc | Projecte |
|---------|------|---------|
| 1 | Bloc 1 + Bloc 2 | P21 |
| 2 | Bloc 3 | P22 (part 1) |
| 3 | Bloc 4 + Bloc 5 | P22 (part 2) + P23 + P24 |
| 4 | Bloc 6 | P25 |
| 5 | Bloc 7 + Bloc 8 | P26 |
| 6 | Bloc 9 | Síntesi + diagnòstic |

---

## Nota sobre Ubuntu 22.04 vs 24.04 vs 26.04

| Versió | Perfils mòbils | Complexitat |
|--------|---------------|-------------|
| **Ubuntu 22.04 LTS** | `pam_mkhomedir` crea home automàticament en el primer login | Baixa |
| **Ubuntu 24.04 LTS** | autofs + NFS: cal `auto.master` + `auto.home` + wildcard `*` | Alta |
| **Ubuntu 26.04 LTS** | No publicat a juny 2026. Previsiblament equivalent a 24.04 (mateixa base systemd + PAM). Confirmar quan surti. |

Pàgina dedicada: `42-perfils-ubuntu22-vs-24.md`
