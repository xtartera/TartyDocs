# UT3 · Compartició de recursos — Anàlisi de projectes (Fases 1–4)

> Generat per Claude a partir dels Projectes 31–33 (PDF "Projecte 31 - Samba", "Projecte 32 - NFS", "Projecte 33 - CUPS")
> Metodologia: PROMPT_MESTRE_UT.md v1.0

---

## FASE 1 — Extracció de conceptes per projecte

### Projecte 31 — Samba: Compartició de fitxers SMB

| Activitat | Conceptes extrets |
|-----------|-------------------|
| A1 – Instal·lació | `apt install samba`, dimonis `smbd`/`nmbd`, port 445, `systemctl enable/start smbd`, verificació d'estat |
| A2 – Accés lliure | Secció `[share]` a `smb.conf`, `guest ok = yes`, `browseable = yes`, `path`, `chmod 777`, `smbclient -L` |
| A3 – Accés restringit | `valid users`, `write list`, autenticació SMB, `smbpasswd -a`, comptes Samba separats dels Unix |
| A4 – Control per grups | `valid users = @grup`, `write list = @grup`, integració grups Linux, `create mask`, `directory mask` |
| A5 – Quotes d'espai | `dfree command`, simulació d'espai disponible via script, casos d'ús empresarials |
| A6 – Límit de mida fitxer | `max file size`, restricció per carpeta compartida, registre d'errors quan se supera |
| A7 – Multiusuari | Accés concurrent, `force user`, `force group`, bloqueig de fitxers, `strict locking` |
| A8 – Integració LDAP | `passdb backend = ldapsam`, `ldap suffix`, `ldap admin dn`, `smbpasswd` en LDAP vs local |
| A9 – Comparativa NFS vs Samba | Protocols (SMB vs NFS), autenticació, multiplataforma, casos d'ús, rendiment |
| A10 – Config. avançada | `interfaces`, `bind interfaces only`, `netbios name`, variables de substitució `%u`, `%m` |
| A11 – Dossier final P31 | Documentació global, preguntes de reflexió, diagrama de la configuració |

### Projecte 32 — NFS: Sistema de fitxers de xarxa

| Activitat | Conceptes extrets |
|-----------|-------------------|
| A1 – Instal·lació servidor | `apt install nfs-kernel-server`, `/etc/exports`, `exportfs -rav`, `showmount -e localhost` |
| A2 – Client: validació | `apt install nfs-common`, `mount -t nfs`, `df -h`, `umount`, verificació de lectura/escriptura |
| A3 – Accés restringit IP | `/etc/exports` amb IP específica `192.168.x.y(rw,sync)`, control per rang de xarxa |
| A4 – Muntatge automàtic | `/etc/fstab` entrada NFS, `mount -a`, persistència entre reinicis, opcions `_netdev` |
| A5 – Multiusuari simultani | Accés concurrent NFS, bloqueig de fitxers (opcional amb `lockd`), coherència de dades |
| A6 – Seguretat UFW | `ufw allow from`, ports NFS (111 rpcbind, 2049 nfs), `ufw status verbose` |
| A7 – Opcions de seguretat muntatge | `noexec`, `nosuid`, `ro`, opcions del client, seguretat per defecte |
| A8 – NFS vs Samba | Comparativa completa: protocols, auth, plataformes, ús domèstic vs empresarial |
| A9 – Control d'espai | Monitoratge espai exportat, `df -h`, limitació de quotes (native NFS sense quotes) |
| A10 – UID/GID i squash | `all_squash`, `anonuid`, `anongid`, `no_root_squash`, sincronització UID client-servidor |
| A11 – Dossier final P32 | Documentació, diagrama de la topologia, preguntes de reflexió |

### Projecte 33 — CUPS: Gestió d'impressió en xarxa

| Activitat | Conceptes extrets |
|-----------|-------------------|
| A1 – Instal·lació | `apt install cups cups-pdf`, `systemctl enable/start cups`, port 631, grup `lpadmin`, `adduser` |
| A2 – Interfície web | `http://localhost:631`, panell d'administració, afegir impressora, gestionar impressores |
| A3 – Impressora PDF virtual | `cups-pdf`, directori de sortida `/var/spool/cups-pdf/<usuari>/`, proves d'impressió a PDF |
| A4 – Impressió des del client | `lp -d printer file`, `lpstat -p`, protocol IPP, impressió remota bàsica, `lpr` |
| A5 – Restriccions per grups | `AllowGroup lpadmin`, `/etc/cups/cupsd.conf`, directives `<Location>`, `RequireAuth` |
| A6 – Gestió de la cua | `lpq`, `lpstat -p -o`, `cancel jobID`, `lprm`, prioritat de treballs d'impressió |
| A7 – Compartició en xarxa | `Listen 0.0.0.0:631`, `Browsing On`, `BrowseLocalProtocols DNSSD`, `Allow @LOCAL` |
| A8 – PPD i URI d'impressora | Fitxers PPD (PostScript Printer Description), URIs `ipp://`, `socket://`, `usb://`, `cups-pdf:/` |
| A9 – Dossier final P33 | Documentació bàsica i preguntes de reflexió |
| A10 (avançat) – Autenticació LDAP | `AuthType Basic`, `DefaultAuthType`, integració CUPS amb LDAP via PAM, `pam_ldap` |
| A11 (avançat) – SSL/TLS | Certificats CUPS, `ServerCertificate`, `ServerKey`, HTTPS per a la interfície d'administració |
| A12 (avançat) – PyKota/quotes | Sistema de quotes d'impressió, comptes de pàgines, `pkusers`, `pkturnkey`, integració CUPS |
| A13 (avançat) – Scripts d'automatització | Scripts `lpadmin -p`, gestió programàtica d'impressores, addició/eliminació automatitzada |
| A14 (avançat) – Compartició Windows | Samba + CUPS: secció `[printers]` a `smb.conf`, `printcap name = cups`, Windows printer sharing |
| A15 (avançat) – Config. avançada | Polítiques d'impressió, `MaxJobs`, rotació de logs CUPS, `LogLevel debug` |

---

## FASE 2 — Mapa d'aprenentatge

### Conceptes únics identificats (30 conceptes)

| ID | Concepte | Dificultat | Dependències | Projectes | Diagrama | Pràctica |
|----|----------|-----------|--------------|-----------|----------|----------|
| **C01** | Protocols de compartició (SMB, NFS, IPP) | 1 | — | P31, P32, P33 | Sí | No |
| **C02** | Comparativa Samba / NFS / CUPS | 2 | C01 | P31, P32, P33 | Sí | No |
| **C03** | Samba: arquitectura i instal·lació | 3 | C01 | P31 | Sí | Sí |
| **C04** | smb.conf: estructura i seccions | 3 | C03 | P31 | No | Sí |
| **C05** | Samba: accés lliure (guest ok) | 3 | C04 | P31 | No | Sí |
| **C06** | Samba: accés restringit (valid users) | 4 | C04, C05 | P31 | No | Sí |
| **C07** | Samba: control per grups Linux | 4 | C06 | P31 | No | Sí |
| **C08** | smbpasswd: usuaris Samba | 4 | C06 | P31 | No | Sí |
| **C09** | Samba: permisos compostos (mask, force user) | 5 | C07, C08 | P31 | No | Sí |
| **C10** | Samba: quotes i límits de fitxer | 5 | C09 | P31 | No | Sí |
| **C11** | Samba: integració amb LDAP | 6 | C08, UT2-LDAP | P31 | Sí | Sí |
| **C12** | NFS: arquitectura i conceptes | 2 | C01 | P32 | Sí | No |
| **C13** | NFS: instal·lació del servidor | 3 | C12 | P32 | No | Sí |
| **C14** | /etc/exports: opcions d'exportació | 3 | C13 | P32 | No | Sí |
| **C15** | exportfs i showmount | 3 | C14 | P32 | No | Sí |
| **C16** | NFS client: muntatge manual | 3 | C15 | P32 | No | Sí |
| **C17** | NFS client: muntatge persistent (/etc/fstab) | 4 | C16 | P32 | No | Sí |
| **C18** | NFS: control d'accés per IP | 4 | C14 | P32 | No | Sí |
| **C19** | NFS: opcions de seguretat (noexec, nosuid) | 4 | C17 | P32 | No | Sí |
| **C20** | NFS: UFW i ports de servei | 4 | C18 | P32 | No | Sí |
| **C21** | NFS: all_squash, anonuid, anongid | 5 | C18, C19 | P32 | No | Sí |
| **C22** | CUPS: arquitectura i instal·lació | 3 | C01 | P33 | Sí | Sí |
| **C23** | CUPS: interfície web (port 631) | 3 | C22 | P33 | No | Sí |
| **C24** | CUPS: impressora PDF virtual | 4 | C23 | P33 | No | Sí |
| **C25** | CUPS: ordres d'impressió (lp, lpq, cancel) | 4 | C23 | P33 | No | Sí |
| **C26** | CUPS: compartició en xarxa | 4 | C25 | P33 | No | Sí |
| **C27** | CUPS: restriccions per grups (cupsd.conf) | 5 | C26 | P33 | No | Sí |
| **C28** | CUPS: PPD i URI d'impressora | 4 | C23 | P33 | No | Sí |
| **C29** | CUPS: integració Samba–Windows | 6 | C11, C27 | P31, P33 | Sí | Sí |
| **C30** | Diagnòstic integral UT3 | 7 | C11, C21, C27 | P31, P32, P33 | Sí | Sí |

### Agrupació en blocs pedagògics

| Bloc | Nom | Conceptes | Fitxers | RA |
|------|-----|-----------|---------|----|
| 1 | Conceptes de compartició | C01, C02 | 01–02 | RA3 |
| 2 | Samba: instal·lació | C03, C04, C05 | 03–05 | RA4 |
| 3 | Samba: control d'accés | C06, C07, C08 | 06–08 | RA4 |
| 4 | Samba: gestió avançada | C09, C10, C11 | 09–11 | RA4, RA5, RA6 |
| 5 | NFS: servidor | C12, C13, C14, C15 | 12–15 | RA4 |
| 6 | NFS: client i seguretat | C16, C17, C18, C19, C20, C21 | 16–21 | RA4, RA5 |
| 7 | CUPS: instal·lació i impressió | C22, C23, C24, C25 | 22–25 | RA4 |
| 8 | CUPS: compartició i gestió | C26, C27, C28, C29 | 26–29 | RA4, RA6 |
| 9 | Diagnòstic integral | C30 | 30 | RA5 |

---

## FASE 3 — Matriu de traçabilitat

| ID | Concepte | P31 | P32 | P33 | RA | Fitxer MD |
|----|----------|-----|-----|-----|----|-----------|
| C01 | Protocols compartició (SMB/NFS/IPP) | A1 | A1 | A1 | RA3 | 01-conceptes-comparticio-recursos.md |
| C02 | Comparativa Samba/NFS/CUPS | A9 | A8 | — | RA3 | 02-comparativa-samba-nfs-cups.md |
| C03 | Samba: arquitectura i instal·lació | A1 | — | — | RA4 | 03-samba-arquitectura-installacio.md |
| C04 | smb.conf: estructura i seccions | A1,A2 | — | — | RA4 | 04-smb-conf-estructura.md |
| C05 | Samba: accés lliure (guest ok) | A2 | — | — | RA4 | 05-samba-acces-lliure.md |
| C06 | Samba: accés restringit (valid users) | A3 | — | — | RA4 | 06-samba-acces-restringit.md |
| C07 | Samba: control per grups Linux | A4 | — | — | RA4 | 07-samba-acces-grups.md |
| C08 | smbpasswd: usuaris Samba | A3,A4 | — | — | RA4 | 08-smbpasswd-usuaris.md |
| C09 | Samba: permisos compostos | A4,A7 | — | — | RA4 | 09-samba-permisos-mascara.md |
| C10 | Samba: quotes i límits de fitxer | A5,A6 | — | — | RA5 | 10-samba-quotes-limits.md |
| C11 | Samba: integració LDAP | A8 | — | — | RA6 | 11-samba-integracio-ldap.md |
| C12 | NFS: arquitectura i conceptes | — | A1 | — | RA4 | 12-nfs-arquitectura-conceptes.md |
| C13 | NFS: instal·lació del servidor | — | A1 | — | RA4 | 13-nfs-servidor-installacio.md |
| C14 | /etc/exports: opcions d'exportació | — | A1,A3 | — | RA4 | 14-etc-exports-opcions.md |
| C15 | exportfs i showmount | — | A1 | — | RA4 | 15-exportfs-showmount.md |
| C16 | NFS client: muntatge manual | — | A2 | — | RA4 | 16-nfs-client-muntatge-manual.md |
| C17 | NFS client: /etc/fstab persistent | — | A4 | — | RA4 | 17-nfs-muntatge-fstab.md |
| C18 | NFS: control d'accés per IP | — | A3 | — | RA4 | 18-nfs-control-acces-ip.md |
| C19 | NFS: opcions de seguretat (noexec, nosuid) | — | A7 | — | RA5 | 19-nfs-opcions-seguretat.md |
| C20 | NFS: UFW i ports de servei | — | A6 | — | RA5 | 20-nfs-ufw-ports.md |
| C21 | NFS: all_squash, anonuid, anongid | — | A10 | — | RA5 | 21-nfs-all-squash-uid-gid.md |
| C22 | CUPS: arquitectura i instal·lació | — | — | A1 | RA4 | 22-cups-arquitectura-installacio.md |
| C23 | CUPS: interfície web (port 631) | — | — | A2 | RA4 | 23-cups-interficie-web.md |
| C24 | CUPS: impressora PDF virtual | — | — | A3 | RA4 | 24-cups-impressora-pdf-virtual.md |
| C25 | CUPS: ordres d'impressió | — | — | A4,A6 | RA4 | 25-cups-ordres-impressio.md |
| C26 | CUPS: compartició en xarxa | — | — | A7 | RA4 | 26-cups-comparticio-xarxa.md |
| C27 | CUPS: restriccions per grups | — | — | A5 | RA4 | 27-cups-restriccions-grups.md |
| C28 | CUPS: PPD i URI d'impressora | — | — | A8 | RA4 | 28-cups-ppd-uri.md |
| C29 | CUPS: Samba–Windows printing | A10 (adv.) | — | A14 (adv.) | RA6 | 29-cups-samba-windows.md |
| C30 | Diagnòstic integral UT3 | A11 | A11 | A9 | RA5 | 30-diagnostic-integral-ut3.md |

---

## FASE 4 — Índex complet del manual

### Estructura de carpetes

```
docs/ut3/
├── index.md                                    ← Presentació UT3 (taula blocs, mapa mermaid, SpeedRun grid)
├── bloc1-conceptes/
│   ├── 01-conceptes-comparticio-recursos.md
│   └── 02-comparativa-samba-nfs-cups.md
├── bloc2-samba-installacio/
│   ├── 03-samba-arquitectura-installacio.md
│   ├── 04-smb-conf-estructura.md
│   └── 05-samba-acces-lliure.md
├── bloc3-samba-acces/
│   ├── 06-samba-acces-restringit.md
│   ├── 07-samba-acces-grups.md
│   └── 08-smbpasswd-usuaris.md
├── bloc4-samba-avanzat/
│   ├── 09-samba-permisos-mascara.md
│   ├── 10-samba-quotes-limits.md
│   └── 11-samba-integracio-ldap.md
├── bloc5-nfs-servidor/
│   ├── 12-nfs-arquitectura-conceptes.md
│   ├── 13-nfs-servidor-installacio.md
│   ├── 14-etc-exports-opcions.md
│   └── 15-exportfs-showmount.md
├── bloc6-nfs-client-seguretat/
│   ├── 16-nfs-client-muntatge-manual.md
│   ├── 17-nfs-muntatge-fstab.md
│   ├── 18-nfs-control-acces-ip.md
│   ├── 19-nfs-opcions-seguretat.md
│   ├── 20-nfs-ufw-ports.md
│   └── 21-nfs-all-squash-uid-gid.md
├── bloc7-cups-installacio/
│   ├── 22-cups-arquitectura-installacio.md
│   ├── 23-cups-interficie-web.md
│   ├── 24-cups-impressora-pdf-virtual.md
│   └── 25-cups-ordres-impressio.md
├── bloc8-cups-comparticio/
│   ├── 26-cups-comparticio-xarxa.md
│   ├── 27-cups-restriccions-grups.md
│   ├── 28-cups-ppd-uri.md
│   └── 29-cups-samba-windows.md
├── bloc9-diagnostic/
│   └── 30-diagnostic-integral-ut3.md
└── speedrun/
    ├── projecte31.md
    ├── projecte32.md
    ├── projecte33.md
    └── projecte34.md                          ← Dossier de preguntes (opcional)
```

**Total: 30 pàgines de contingut + index.md + 4 SpeedRun = 35 fitxers**

### Navegació mkdocs.yml (proposta)

```yaml
- "UT3 · Compartició de recursos":
    - Presentació: ut3/index.md
    - "Bloc 1 · Conceptes":
        - "Protocols de compartició": ut3/bloc1-conceptes/01-conceptes-comparticio-recursos.md
        - "Comparativa Samba / NFS / CUPS": ut3/bloc1-conceptes/02-comparativa-samba-nfs-cups.md
    - "Bloc 2 · Samba: instal·lació":
        - "Arquitectura i instal·lació": ut3/bloc2-samba-installacio/03-samba-arquitectura-installacio.md
        - "smb.conf: estructura": ut3/bloc2-samba-installacio/04-smb-conf-estructura.md
        - "Accés lliure (guest ok)": ut3/bloc2-samba-installacio/05-samba-acces-lliure.md
    - "Bloc 3 · Samba: control d'accés":
        - "Accés restringit (valid users)": ut3/bloc3-samba-acces/06-samba-acces-restringit.md
        - "Accés per grups Linux": ut3/bloc3-samba-acces/07-samba-acces-grups.md
        - "smbpasswd: usuaris Samba": ut3/bloc3-samba-acces/08-smbpasswd-usuaris.md
    - "Bloc 4 · Samba: gestió avançada":
        - "Permisos compostos (mask, force)": ut3/bloc4-samba-avanzat/09-samba-permisos-mascara.md
        - "Quotes i límits de fitxer": ut3/bloc4-samba-avanzat/10-samba-quotes-limits.md
        - "Integració Samba + LDAP": ut3/bloc4-samba-avanzat/11-samba-integracio-ldap.md
    - "Bloc 5 · NFS: servidor":
        - "NFS: arquitectura i conceptes": ut3/bloc5-nfs-servidor/12-nfs-arquitectura-conceptes.md
        - "NFS: instal·lació del servidor": ut3/bloc5-nfs-servidor/13-nfs-servidor-installacio.md
        - "/etc/exports: opcions": ut3/bloc5-nfs-servidor/14-etc-exports-opcions.md
        - "exportfs i showmount": ut3/bloc5-nfs-servidor/15-exportfs-showmount.md
    - "Bloc 6 · NFS: client i seguretat":
        - "Muntatge manual NFS": ut3/bloc6-nfs-client-seguretat/16-nfs-client-muntatge-manual.md
        - "Muntatge persistent (/etc/fstab)": ut3/bloc6-nfs-client-seguretat/17-nfs-muntatge-fstab.md
        - "Control d'accés per IP": ut3/bloc6-nfs-client-seguretat/18-nfs-control-acces-ip.md
        - "Opcions de seguretat (noexec, nosuid)": ut3/bloc6-nfs-client-seguretat/19-nfs-opcions-seguretat.md
        - "UFW i ports NFS": ut3/bloc6-nfs-client-seguretat/20-nfs-ufw-ports.md
        - "all_squash, anonuid, anongid": ut3/bloc6-nfs-client-seguretat/21-nfs-all-squash-uid-gid.md
    - "Bloc 7 · CUPS: instal·lació":
        - "CUPS: arquitectura i instal·lació": ut3/bloc7-cups-installacio/22-cups-arquitectura-installacio.md
        - "Interfície web (port 631)": ut3/bloc7-cups-installacio/23-cups-interficie-web.md
        - "Impressora PDF virtual": ut3/bloc7-cups-installacio/24-cups-impressora-pdf-virtual.md
        - "Ordres d'impressió": ut3/bloc7-cups-installacio/25-cups-ordres-impressio.md
    - "Bloc 8 · CUPS: compartició":
        - "Compartició en xarxa": ut3/bloc8-cups-comparticio/26-cups-comparticio-xarxa.md
        - "Restriccions per grups": ut3/bloc8-cups-comparticio/27-cups-restriccions-grups.md
        - "PPD i URI d'impressora": ut3/bloc8-cups-comparticio/28-cups-ppd-uri.md
        - "Samba + Windows printing": ut3/bloc8-cups-comparticio/29-cups-samba-windows.md
    - "Bloc 9 · Diagnòstic":
        - "Diagnòstic integral UT3": ut3/bloc9-diagnostic/30-diagnostic-integral-ut3.md
    - "SpeedRun · Projectes":
        - "Projecte 31 · Samba": ut3/speedrun/projecte31.md
        - "Projecte 32 · NFS": ut3/speedrun/projecte32.md
        - "Projecte 33 · CUPS": ut3/speedrun/projecte33.md
        - "Projecte 34 · Dossier preguntes": ut3/speedrun/projecte34.md
```

### Verificació creuada (checklist Fase 4)

- [x] Tots els conceptes de la Fase 2 (C01–C30) tenen un fitxer assignat
- [x] Els fitxers estan ordenats per dificultat creixent dins de cada bloc
- [x] Els blocs estan ordenats per ordre pedagògic (Samba → NFS → CUPS → diagnòstic)
- [x] El nom de cada fitxer és descriptiu i en kebab-case sense accents
- [x] Cap fitxer supera els 40 caràcters de nom

---

## Recomanacions pedagògiques

### Dependències crítiques

| Dependent | Prerequisit | Descripció |
|-----------|-------------|------------|
| C11 (Samba+LDAP) | UT2 Blocs 3–4 | L'alumne ha de tenir OpenLDAP funcional amb usuaris POSIX |
| C21 (all_squash) | C16, C17 | Cal entendre el muntatge NFS abans del control UID/GID |
| C29 (CUPS+Samba) | C11, C27 | Combina coneixements Samba i CUPS — fer al final |
| C30 (diagnòstic) | C11, C21, C27 | Diagnòstic integral: cal haver fet tot el curs |

### Conceptes clau de la unitat

1. **smb.conf** (C04): és el fitxer de configuració central de Samba. Tota la complexitat de la compartició passa per entendre la seva sintaxi de seccions.
2. **/etc/exports** (C14): equivalent a smb.conf per a NFS. L'alumne tendeix a confondre les opcions de cada costat (servidor vs client).
3. **UID/GID i all_squash** (C21): concepte crític per a NFS multiusuari. Si els UID/GID no coincideixen entre client i servidor, els permisos fallen silenciosament.

### Errors habituals dels alumnes

| Error | Origen | Pàgina |
|-------|--------|--------|
| Canvien smb.conf però no reinicien `smbd` | Oblit `systemctl restart smbd` | 04-smb-conf-estructura.md |
| Creen usuari Linux però obliden `smbpasswd -a` | Confusió comptes Linux vs Samba | 08-smbpasswd-usuaris.md |
| Canvien /etc/exports però no fan `exportfs -ra` | Igual que a UT2 Bloc 7 | 14-etc-exports-opcions.md |
| Munten NFS amb UID diferent al servidor → accés denegat | No sincronitzen UID/GID | 21-nfs-all-squash-uid-gid.md |
| No afegeixen l'usuari al grup `lpadmin` → CUPS nega accés | Oblit del grup d'administració | 22-cups-arquitectura-installacio.md |
| Obren port 631 però `Listen` és `localhost` → no arriba del client | Confusió listen vs firewall | 26-cups-comparticio-xarxa.md |

### Seqüència setmanal estimada

| Setmana | Blocs | Projecte | Hores |
|---------|-------|---------|-------|
| 1–2 | Blocs 1–2 | P31 (inicio) | 4–6 h |
| 3–4 | Blocs 3–4 | P31 (complet) | 4–6 h |
| 5–6 | Blocs 5–6 | P32 (complet) | 6–8 h |
| 7–8 | Blocs 7–8 | P33 (complet) | 6–8 h |
| 9 | Bloc 9 | P34 (dossier) | 3–5 h |

### Relació amb UT1 i UT2

| UT1 (Windows Server) | UT2 (Linux Server) | UT3 (Compartició) |
|---------------------|-------------------|--------------------|
| Carpetes compartides SMB | NFS bàsic (Bloc 7) | Samba avançat + NFS avançat |
| `net use` / GPO Drive Maps | autofs + NFS | `/etc/fstab` + muntatge automàtic |
| `icacls` / permisos NTFS | `chmod` / `chown` | `valid users`, `AllowGroup`, `anonuid` |
| Impressió via Windows Print | — | CUPS + integració Samba-Windows |
| AD + Kerberos | LDAP + SSSD | Samba passdb backend = ldapsam |

---

## Topologia del laboratori (UT3)

```
Ubuntu Server 24.04 LTS (Samba + NFS + CUPS)
  enp0s3 → NAT (DHCP, Internet)
  enp0s8 → Xarxa interna 192.168.100.10/24
  hostname: srv-comparticio
  Carpeta Samba: /srv/samba/<share>/
  Carpeta NFS:   /srv/nfs/<export>/
  CUPS:          http://192.168.100.10:631

Client Ubuntu 24.04 LTS (o Windows per a CUPS+Samba)
  enp0s8 → 192.168.100.20/24
```

---

## Historial de sessions

| Data | Sessió | Tasques completades |
|------|--------|-------------------|
| 2026-06-29 | Sessió 1 | Anàlisi PDF P31–P33, Fases 1–4, proposta 30 pàgines (9 blocs), awaiting user validation |
