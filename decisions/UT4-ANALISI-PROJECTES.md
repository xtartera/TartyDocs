# UT4 · Integració de sistemes heterogenis — Anàlisi de projectes (Fases 1–4)

> Generat per Claude a partir dels Projectes 41–43 (PDF "Projecte 41 - Windows AD", "Projecte 42 - OpenLDAP multiplataforma", "Projecte 43 - Samba-AD DC")
> Metodologia: PROMPT_MESTRE_UT.md v1.0

---

## FASE 1 — Extracció de conceptes per projecte

### Projecte 41 — Integració de sistemes heterogenis (Windows AD)

| Activitat | Conceptes extrets |
|-----------|-------------------|
| A1 – Instal·lació DC | Windows Server 2022, AD DS, DNS integrat, IP estàtica, promoció a DC, domini `ad-cognom.local`, `dcpromo`, RSAT |
| A2 – OUs i servidor de fitxers | Unitats Organitzatives (OU2XX), SMB compartit, permisos NTFS, perfils mòbils Windows, `\\WSRV\perfils$` |
| A3 – Client Windows 11 | Unió al domini AD, `netdom join`, verificació amb `whoami /all`, `net user /domain` |
| A4 – Client Ubuntu → AD | `realmd`, `sssd`, `krb5-user`, `adcli`, `oddjob-mkhomedir`, `realm join`, `getent passwd`, login SSH amb compte AD |
| A5 – Backups | Veeam Agent per Windows, PowerShell `Copy-Item`, `Robocopy`, Planificador de tasques Windows |
| A6 – GPOs | Group Policy Management, GPO per OU, desactivar panell control, fons pantalla corporatiu, restricció de dispositius USB |
| A7 – Dossier final P41 | Documentació, diagrama topologia, preguntes de reflexió |

### Projecte 42 — Infraestructura LDAP multiplataforma

| Activitat | Conceptes extrets |
|-----------|-------------------|
| A1 – OpenLDAP instal·lació | `slapd`, base DN `dc=cognom,dc=local`, `ou=usuaris`, `ou=grups`, `ou=equips`, `ldapsearch`, `slapcat` |
| A2 – Client Ubuntu LDAP | PAM, NSS, `libnss-ldapd`, `libpam-ldapd`, `nslcd`, `getent passwd`, `id uid=usuari`, SSH via LDAP |
| A3 – Perfils mòbils NFS | `/home/XXX/usuari`, NFS shares, muntatge via fstab, prefix de grup, roaming homes LDAP+NFS |
| A4 – Windows + pGina | `pGina`, plugin LDAP, configuració `dc=cognom,dc=local`, autenticació Windows amb credencials LDAP |
| A5 – Recursos Samba+NFS | Samba `[lliure]`/`[restringit]`/`[convidats]`, NFS exportats, integració amb grups LDAP |
| A6 – Escenaris de validació | Tests d'autenticació creuada, verificació `getent`, `smbclient`, muntatge NFS des de Windows |
| A7 – Dossier final P42 | Documentació global, taula de serveis actius, preguntes de reflexió |

### Projecte 43 — Controlador de domini Samba multiplataforma

| Activitat | Conceptes extrets |
|-----------|-------------------|
| A1 – Samba DC | `samba-tool domain provision --use-rfc2307 --interactive`, `libretic.local`, `SAMBA_INTERNAL` DNS, `systemctl disable smbd nmbd`, `enable samba-ad-dc`, `wbinfo -u/-g` |
| A2 – Usuaris i grups | `samba-tool user create`, `group add`, `group addmembers`, usuaris `ana/marc/clara`, grups `tecnics/comptabilitat/direccio` |
| A3 – Client Windows | `nslookup dc1.libretic.local`, `ping dc1`, unió al domini LIBRETIC, login `LIBRETIC\ana`, `whoami` |
| A4 – Client Ubuntu | `realmd`, `sssd`, `realm join libretic.local -U Administrador`, `getent passwd`, `pam-auth-update mkhomedir`, login `libretic\ana` |
| A5 – Recursos compartits | `[tecnics]` valid users=@tecnics, `[comuna]` chmod 777, `smbclient //dc1/tecnics -U ana` |
| A5.1 – Perfils (opcional) | `pam_mkhomedir`, `[homes]` a `smb.conf`, `/srv/samba/homes` |
| A5.2 – ACLs (opcional) | `setfacl`/`getfacl`, `vfs objects = acl_xattr`, `map acl inherit = yes` |
| A6 – Dossier final P43 | Documentació, diagrama de domini, preguntes de reflexió |

---

## FASE 2 — Mapa d'aprenentatge

### Conceptes únics identificats (30 conceptes)

| ID | Concepte | Dificultat | Dependències | Projectes | Diagrama | Pràctica |
|----|----------|-----------|--------------|-----------|----------|----------|
| **C01** | Sistemes heterogenis: conceptes i protocols | 1 | — | P41, P42, P43 | Sí | No |
| **C02** | Comparativa AD / OpenLDAP / Samba-AD DC | 2 | C01 | P41, P42, P43 | Sí | No |
| **C03** | Active Directory: arquitectura i components | 3 | C01 | P41 | Sí | No |
| **C04** | AD DS: instal·lació i promoció a DC | 4 | C03 | P41 | No | Sí |
| **C05** | DNS integrat amb AD (zones i SRV records) | 4 | C04 | P41 | No | Sí |
| **C06** | Unitats Organitzatives (OUs) i delegació | 3 | C04 | P41 | No | Sí |
| **C07** | Usuaris i grups de domini (ADUC + PowerShell) | 3 | C06 | P41 | No | Sí |
| **C08** | GPOs: Group Policy Management | 4 | C07 | P41 | Sí | Sí |
| **C09** | GPOs: restriccions pràctiques (panell, USB, escriptori) | 4 | C08 | P41 | No | Sí |
| **C10** | Carpetes compartides i perfils mòbils Windows | 4 | C07, UT1-C34 | P41 | No | Sí |
| **C11** | Backups: Veeam Agent + PowerShell + Robocopy | 3 | C07 | P41 | No | Sí |
| **C12** | Windows 11 Pro: unió al domini AD | 3 | C05 | P41 | No | Sí |
| **C13** | Ubuntu → AD: realmd i realm join | 5 | C05, UT2-SSSD | P41 | No | Sí |
| **C14** | sssd.conf per a Active Directory | 5 | C13 | P41 | No | Sí |
| **C15** | Kerberos a Linux (krb5-user, kinit, klist) | 4 | C13 | P41 | Sí | Sí |
| **C16** | oddjob-mkhomedir: home dirs automàtiques | 3 | C14 | P41 | No | Sí |
| **C17** | OpenLDAP multiplataforma: DIT i OUs per entorn real | 3 | UT2-C10 | P42 | No | Sí |
| **C18** | PAM + NSS: Ubuntu LDAP client (libnss-ldapd, nslcd) | 5 | C17 | P42 | Sí | Sí |
| **C19** | getent, id i SSH: validació d'autenticació LDAP | 4 | C18 | P42 | No | Sí |
| **C20** | pGina: autenticació Windows via OpenLDAP | 4 | C17 | P42 | No | Sí |
| **C21** | NFS + LDAP: perfils mòbils roaming | 5 | C18, UT3-NFS | P42 | No | Sí |
| **C22** | Samba 4 AD DC: arquitectura i diferències amb Windows AD | 4 | C03, C01 | P43 | Sí | No |
| **C23** | samba-tool domain provision: configuració inicial | 5 | C22 | P43 | No | Sí |
| **C24** | samba-tool: gestió d'usuaris i grups | 4 | C23 | P43 | No | Sí |
| **C25** | Clients Windows → Samba-AD DC (domain join) | 4 | C23 | P43 | No | Sí |
| **C26** | Ubuntu → Samba-AD DC (realm join + sssd) | 5 | C23, C14 | P43 | No | Sí |
| **C27** | Recursos compartits al domini Samba ([tecnics], [comuna]) | 4 | C24 | P43 | No | Sí |
| **C28** | ACLs esteses POSIX (setfacl, getfacl, herència) | 5 | C27 | P43 | Sí | Sí |
| **C29** | vfs objects = acl_xattr (ACLs NTFS a Linux via Samba) | 5 | C28 | P43 | No | Sí |
| **C30** | Diagnòstic integral UT4 (AD + LDAP + Samba-AD) | 7 | C14, C19, C26, C29 | P41, P42, P43 | Sí | Sí |

### Agrupació en blocs pedagògics

| Bloc | Nom | Conceptes | Fitxers | RA |
|------|-----|-----------|---------|----|
| 1 | Conceptes d'integració | C01, C02 | 01–02 | RA2 |
| 2 | Active Directory | C03, C04, C05, C06, C07 | 03–07 | RA3, RA4 |
| 3 | GPO i recursos Windows | C08, C09, C10, C11 | 08–11 | RA4, RA5 |
| 4 | Linux al domini Windows AD | C12, C13, C14, C15, C16 | 12–16 | RA4 |
| 5 | OpenLDAP multiplataforma | C17, C18, C19, C20, C21 | 17–21 | RA3, RA4 |
| 6 | Samba com a AD DC | C22, C23, C24, C25, C26 | 22–26 | RA3, RA4 |
| 7 | Recursos compartits i ACLs | C27, C28, C29, C30 | 27–30 | RA4, RA5, RA6 |

---

## FASE 3 — Matriu de traçabilitat

| ID | Concepte | P41 | P42 | P43 | RA | Fitxer MD |
|----|----------|-----|-----|-----|----|-----------|
| C01 | Sistemes heterogenis: conceptes i protocols | A1 | A1 | A1 | RA2 | 01-sistemes-heterogenis-conceptes.md |
| C02 | Comparativa AD / OpenLDAP / Samba-AD DC | A7 | A7 | A6 | RA2 | 02-comparativa-ad-ldap-samba.md |
| C03 | Active Directory: arquitectura i components | A1 | — | — | RA3 | 03-active-directory-arquitectura.md |
| C04 | AD DS: instal·lació i promoció a DC | A1 | — | — | RA4 | 04-installacio-ad-ds.md |
| C05 | DNS integrat amb AD | A1 | — | — | RA4 | 05-dns-integrat-ad.md |
| C06 | Unitats Organitzatives (OUs) | A2 | — | — | RA4 | 06-unitats-organitzatives.md |
| C07 | Usuaris i grups de domini | A2 | — | — | RA4 | 07-usuaris-grups-domini.md |
| C08 | GPOs: Group Policy Management | A6 | — | — | RA4 | 08-gpo-group-policy-management.md |
| C09 | GPOs: restriccions pràctiques | A6 | — | — | RA4 | 09-gpo-restriccions.md |
| C10 | Carpetes compartides i perfils mòbils Windows | A2 | — | — | RA4 | 10-carpetes-compartides-perfils-windows.md |
| C11 | Backups: Veeam + PowerShell | A5 | — | — | RA5 | 11-backups-veeam-powershell.md |
| C12 | Windows 11 Pro: unió al domini AD | A3 | — | A3 | RA4 | 12-windows11-unio-domini.md |
| C13 | Ubuntu → AD: realmd i realm join | A4 | — | A4 | RA4 | 13-ubuntu-ad-realmd.md |
| C14 | sssd.conf per a Active Directory | A4 | — | A4 | RA4 | 14-sssd-active-directory.md |
| C15 | Kerberos a Linux (krb5-user, kinit, klist) | A4 | — | — | RA4 | 15-kerberos-linux.md |
| C16 | oddjob-mkhomedir: home dirs automàtiques | A4 | — | A4 | RA4 | 16-oddjob-mkhomedir.md |
| C17 | OpenLDAP multiplataforma: DIT i OUs | — | A1 | — | RA3 | 17-openldap-dit-ous.md |
| C18 | PAM + NSS: Ubuntu LDAP client | — | A2 | — | RA4 | 18-pam-nss-ldap-client.md |
| C19 | getent, id i SSH: validació LDAP | — | A2,A6 | — | RA4 | 19-getent-ssh-validacio-ldap.md |
| C20 | pGina: autenticació Windows via LDAP | — | A4 | — | RA4 | 20-pgina-windows-ldap.md |
| C21 | NFS + LDAP: perfils mòbils roaming | — | A3 | — | RA4 | 21-nfs-ldap-perfils-mobils.md |
| C22 | Samba 4 AD DC: arquitectura | — | — | A1 | RA3 | 22-samba-ad-dc-arquitectura.md |
| C23 | samba-tool domain provision | — | — | A1 | RA4 | 23-samba-tool-provision.md |
| C24 | samba-tool: gestió d'usuaris i grups | — | — | A2 | RA4 | 24-samba-tool-usuaris-grups.md |
| C25 | Clients Windows → Samba-AD DC | — | — | A3 | RA4 | 25-windows-samba-ad-dc.md |
| C26 | Ubuntu → Samba-AD DC | — | — | A4 | RA4 | 26-ubuntu-samba-ad-dc.md |
| C27 | Recursos compartits al domini Samba | — | A5 | A5 | RA4 | 27-recursos-compartits-domini.md |
| C28 | ACLs esteses POSIX | — | — | A5.2 | RA4 | 28-acls-posix-setfacl.md |
| C29 | vfs objects = acl_xattr | — | — | A5.2 | RA5 | 29-vfs-acl-xattr-samba.md |
| C30 | Diagnòstic integral UT4 | A7 | A7 | A6 | RA5 | 30-diagnostic-integral-ut4.md |

---

## FASE 4 — Índex complet del manual

### Estructura de carpetes

```
docs/ut4/
├── index.md                                         ← Presentació UT4 (taula blocs, mapa mermaid, SpeedRun grid)
├── bloc1-conceptes/
│   ├── 01-sistemes-heterogenis-conceptes.md
│   └── 02-comparativa-ad-ldap-samba.md
├── bloc2-active-directory/
│   ├── 03-active-directory-arquitectura.md
│   ├── 04-installacio-ad-ds.md
│   ├── 05-dns-integrat-ad.md
│   ├── 06-unitats-organitzatives.md
│   └── 07-usuaris-grups-domini.md
├── bloc3-gpo-recursos-windows/
│   ├── 08-gpo-group-policy-management.md
│   ├── 09-gpo-restriccions.md
│   ├── 10-carpetes-compartides-perfils-windows.md
│   └── 11-backups-veeam-powershell.md
├── bloc4-linux-ad/
│   ├── 12-windows11-unio-domini.md
│   ├── 13-ubuntu-ad-realmd.md
│   ├── 14-sssd-active-directory.md
│   ├── 15-kerberos-linux.md
│   └── 16-oddjob-mkhomedir.md
├── bloc5-openldap-multiplataforma/
│   ├── 17-openldap-dit-ous.md
│   ├── 18-pam-nss-ldap-client.md
│   ├── 19-getent-ssh-validacio-ldap.md
│   ├── 20-pgina-windows-ldap.md
│   └── 21-nfs-ldap-perfils-mobils.md
├── bloc6-samba-ad-dc/
│   ├── 22-samba-ad-dc-arquitectura.md
│   ├── 23-samba-tool-provision.md
│   ├── 24-samba-tool-usuaris-grups.md
│   ├── 25-windows-samba-ad-dc.md
│   └── 26-ubuntu-samba-ad-dc.md
├── bloc7-recursos-acls/
│   ├── 27-recursos-compartits-domini.md
│   ├── 28-acls-posix-setfacl.md
│   ├── 29-vfs-acl-xattr-samba.md
│   └── 30-diagnostic-integral-ut4.md
└── speedrun/
    ├── projecte41.md
    ├── projecte42.md
    ├── projecte43.md
    └── projecte44.md
```

**Total: 30 pàgines de contingut + index.md + 4 SpeedRun = 35 fitxers**

### Navegació mkdocs.yml (proposta)

```yaml
- "UT4 · Integració de sistemes heterogenis":
    - Presentació: ut4/index.md
    - "Bloc 1 · Conceptes d'integració":
        - "Sistemes heterogenis": ut4/bloc1-conceptes/01-sistemes-heterogenis-conceptes.md
        - "Comparativa AD / LDAP / Samba-AD": ut4/bloc1-conceptes/02-comparativa-ad-ldap-samba.md
    - "Bloc 2 · Active Directory":
        - "Arquitectura AD": ut4/bloc2-active-directory/03-active-directory-arquitectura.md
        - "Instal·lació AD DS": ut4/bloc2-active-directory/04-installacio-ad-ds.md
        - "DNS integrat amb AD": ut4/bloc2-active-directory/05-dns-integrat-ad.md
        - "Unitats Organitzatives": ut4/bloc2-active-directory/06-unitats-organitzatives.md
        - "Usuaris i grups de domini": ut4/bloc2-active-directory/07-usuaris-grups-domini.md
    - "Bloc 3 · GPO i recursos Windows":
        - "GPO: Group Policy Management": ut4/bloc3-gpo-recursos-windows/08-gpo-group-policy-management.md
        - "GPO: restriccions pràctiques": ut4/bloc3-gpo-recursos-windows/09-gpo-restriccions.md
        - "Carpetes compartides i perfils": ut4/bloc3-gpo-recursos-windows/10-carpetes-compartides-perfils-windows.md
        - "Backups: Veeam + PowerShell": ut4/bloc3-gpo-recursos-windows/11-backups-veeam-powershell.md
    - "Bloc 4 · Linux al domini AD":
        - "Windows 11: unió al domini": ut4/bloc4-linux-ad/12-windows11-unio-domini.md
        - "Ubuntu → AD: realmd": ut4/bloc4-linux-ad/13-ubuntu-ad-realmd.md
        - "sssd.conf per a AD": ut4/bloc4-linux-ad/14-sssd-active-directory.md
        - "Kerberos a Linux": ut4/bloc4-linux-ad/15-kerberos-linux.md
        - "oddjob-mkhomedir": ut4/bloc4-linux-ad/16-oddjob-mkhomedir.md
    - "Bloc 5 · OpenLDAP multiplataforma":
        - "OpenLDAP: DIT i OUs": ut4/bloc5-openldap-multiplataforma/17-openldap-dit-ous.md
        - "PAM + NSS: client LDAP": ut4/bloc5-openldap-multiplataforma/18-pam-nss-ldap-client.md
        - "getent i SSH: validació LDAP": ut4/bloc5-openldap-multiplataforma/19-getent-ssh-validacio-ldap.md
        - "pGina: Windows via LDAP": ut4/bloc5-openldap-multiplataforma/20-pgina-windows-ldap.md
        - "NFS + LDAP: perfils mòbils": ut4/bloc5-openldap-multiplataforma/21-nfs-ldap-perfils-mobils.md
    - "Bloc 6 · Samba com a AD DC":
        - "Samba AD DC: arquitectura": ut4/bloc6-samba-ad-dc/22-samba-ad-dc-arquitectura.md
        - "samba-tool domain provision": ut4/bloc6-samba-ad-dc/23-samba-tool-provision.md
        - "samba-tool: usuaris i grups": ut4/bloc6-samba-ad-dc/24-samba-tool-usuaris-grups.md
        - "Windows → Samba-AD DC": ut4/bloc6-samba-ad-dc/25-windows-samba-ad-dc.md
        - "Ubuntu → Samba-AD DC": ut4/bloc6-samba-ad-dc/26-ubuntu-samba-ad-dc.md
    - "Bloc 7 · Recursos i ACLs":
        - "Recursos compartits al domini": ut4/bloc7-recursos-acls/27-recursos-compartits-domini.md
        - "ACLs POSIX (setfacl/getfacl)": ut4/bloc7-recursos-acls/28-acls-posix-setfacl.md
        - "vfs objects = acl_xattr": ut4/bloc7-recursos-acls/29-vfs-acl-xattr-samba.md
        - "Diagnòstic integral UT4": ut4/bloc7-recursos-acls/30-diagnostic-integral-ut4.md
    - "SpeedRun · Projectes":
        - "Projecte 41 · Windows AD": ut4/speedrun/projecte41.md
        - "Projecte 42 · OpenLDAP": ut4/speedrun/projecte42.md
        - "Projecte 43 · Samba-AD DC": ut4/speedrun/projecte43.md
        - "Projecte 44 · Dossier preguntes": ut4/speedrun/projecte44.md
```

### Verificació creuada (checklist Fase 4)

- [x] Tots els conceptes de la Fase 2 (C01–C30) tenen un fitxer assignat
- [x] Els fitxers estan ordenats per dificultat creixent dins de cada bloc
- [x] Els blocs segueixen la progressió pedagògica (W-AD → clients AD → OpenLDAP → Samba-AD → ACLs)
- [x] El nom de cada fitxer és descriptiu i en kebab-case sense accents
- [x] Cap fitxer supera els 40 caràcters de nom

---

## Recomanacions pedagògiques

### Dependències crítiques

| Dependent | Prerequisit | Descripció |
|-----------|-------------|------------|
| C04–C07 (AD DS) | UT1 Blocs 4–5 | L'alumne ha vist AD bàsic a UT1; UT4 aprofundeix en desplegament i GPOs |
| C13–C16 (Ubuntu→AD) | UT2 Bloc 6 (SSSD) | Cal entendre SSSD per configurar-lo per a AD en lloc de LDAP |
| C17–C21 (LDAP mult.) | UT2 Blocs 3–4 | Construeix sobre el LDAP de UT2 afegint PAM, pGina i perfils NFS |
| C21 (NFS+LDAP) | UT3 Blocs 5–6 (NFS) | Cal entendre NFS (UT3) per implementar perfils roaming |
| C22–C26 (Samba-AD) | C03 (arquitectura AD) | Samba-AD DC replica l'AD de Windows: cal conèixer l'AD primer |
| C28–C29 (ACLs) | C27 (recursos domini) | ACLs esteses són configuració avançada sobre recursos compartits |
| C30 (diagnòstic) | C14, C19, C26, C29 | Diagnòstic integral: cal haver fet tots els blocs anteriors |

### Errors habituals dels alumnes

| Error | Origen | Pàgina |
|-------|--------|--------|
| Obliden configurar DNS al client (apuntar al DC) | Sense DNS el domain join falla sense missatge clar | 05-dns-integrat-ad.md |
| Confonen realm join amb domani join (Windows) | Terminologia diferent per a la mateixa operació | 13-ubuntu-ad-realmd.md |
| sssd.conf: fallback_homedir incorrecte → home no es crea | Cal `oddjob-mkhomedir` actiu | 16-oddjob-mkhomedir.md |
| pGina: base DN mal escrit → no troba usuaris | `dc=cognom,dc=local` vs `cognom.local` | 20-pgina-windows-ldap.md |
| samba-tool domain provision: NetBIOS massa llarg | Màxim 15 caràcters per a NetBIOS domain name | 23-samba-tool-provision.md |
| setfacl no té efecte si `vfs objects = acl_xattr` no és actiu | Les ACLs POSIX no es propaguen sense el mòdul VFS | 29-vfs-acl-xattr-samba.md |

### Seqüència setmanal estimada

| Setmana | Blocs | Projecte | Hores |
|---------|-------|---------|-------|
| 1–2 | Blocs 1–2 | P41 (inicio) | 4–6 h |
| 3–4 | Blocs 3–4 | P41 (complet) | 6–8 h |
| 5–6 | Bloc 5 | P42 (complet) | 6–8 h |
| 7–8 | Bloc 6 | P43 (complet) | 6–8 h |
| 9 | Bloc 7 | P44 (dossier) | 3–5 h |

### Relació amb UT1, UT2 i UT3

| UT1 (Windows Server) | UT2 (Linux Server) | UT3 (Compartició) | UT4 (Integració) |
|---------------------|-------------------|--------------------|-----------------|
| AD DS bàsic | LDAP bàsic | Samba+LDAP | AD avançat + Samba-AD DC |
| GPO bàsiques | SSSD per LDAP | — | SSSD per AD, GPO avançades |
| Carpetes compartides NTFS | NFS bàsic | NFS avançat | NFS perfils roaming LDAP |
| Clients W11 al domini | Clients Ubuntu LDAP | — | Clients multi-plataforma |
| — | — | — | pGina: Windows → LDAP |

---

## Topologia del laboratori (UT4)

### Projecte 41 — Windows Active Directory

```
Windows Server 2022 (DC)
  IP: 172.16.XXX.10 (estàtica)
  hostname: WSRV2XX (GrupA) / WSRV3XX (GrupB)
  Rol: AD DS + DNS
  Domini: ad-cognom.local

Windows 11 Pro (client)
  IP: DHCP (s'uneix al domini)
  hostname: CLI-WIN-XXX

Ubuntu Desktop (client Linux)
  IP: DHCP
  Paquets: realmd, sssd, krb5-user, adcli, oddjob-mkhomedir
```

### Projecte 42 — OpenLDAP multiplataforma

```
Ubuntu Server 24.04 (LDAP + NFS + Samba)
  IP: 172.16.XXX.20
  hostname: LSRVXXX
  Serveis: slapd, nfs-kernel-server, smbd
  Base DN: dc=cognom,dc=local

Ubuntu Desktop (client Linux)
  Paquets: libnss-ldapd, libpam-ldapd, nslcd, nfs-common

Windows (client Windows)
  Aplicació: pGina (plugin LDAP)
```

### Projecte 43 — Samba-AD DC

```
Ubuntu Server 24.04 (Samba-AD DC)
  IP: estàtica
  hostname: dc1
  Domini: libretic.local
  Servei: samba-ad-dc (Samba 4.19+)
  DNS intern: SAMBA_INTERNAL

Windows 10/11 (client)
  Domini: LIBRETIC

Ubuntu Desktop (client Linux)
  Paquets: realmd, sssd, sssd-tools, krb5-user
```

---

## Historial de sessions

| Data | Sessió | Tasques completades |
|------|--------|-------------------|
| 2026-06-29 | Sessió 1 | Anàlisi PDF P41–P43, Fases 1–4, proposta 30 pàgines (7 blocs), stub files creats |
