---
title: SpeedRun P44 · Dossier de preguntes UT4
tags:
  - ut4
  - speedrun
  - avaluacio
---

# :material-lightning-bolt: SpeedRun P44 · Dossier de preguntes UT4

!!! abstract "Dossier d'avaluació"
    Recull de preguntes de comprensió i reflexió per al dossier final de la UT4. Cobreix els tres projectes (P41, P42, P43) i les competències transversals de diagnòstic.

---

## Bloc A · Active Directory (P41)

### Preguntes conceptuals

**A1.** Explica la diferència entre un **Forest**, un **Domain** i una **OU** a Active Directory. Posa un exemple jeràrquic del projecte P41.

**A2.** Quins dos registres DNS SRV es creen automàticament quan s'instal·la AD DS? Quin és el propòsit de cadascun?

**A3.** Per quin motiu s'usa el paràmetre `-SafeModeAdministratorPassword` a `Install-ADDSForest`? En quin escenari s'utilitza aquesta contrasenya?

**A4.** Explica l'ordre LSDOU en l'aplicació de GPOs. Si una GPO de Lloc (`L`) i una GPO d'OU (`OU`) configuren la mateixa política amb valors contraris, quina guanya? Per quin motiu?

**A5.** Quin és el propòsit del paràmetre `use_fully_qualified_names = False` a `sssd.conf`? Com canvia el format del nom d'usuari al login?

### Preguntes procedimentals

**A6.** Documenta, pas a pas amb captures, el procés d'unió d'un equip Windows 11 al domini `ad-cognom.local`. Inclou: configuració DNS, domain join, primer login.

**A7.** Crea una GPO que bloqi l'accés al Panell de Control per als usuaris de l'OU `Usuaris-UT4`. Documenta la configuració a GPMC i verifica-la amb `gpresult /r`.

---

## Bloc B · OpenLDAP multiplataforma (P42)

### Preguntes conceptuals

**B1.** Explica la diferència entre **PAM** i **NSS** en la integració Linux-LDAP. Quin problema resol cadascun?

**B2.** Quins atributs POSIX **obligatoris** ha de tenir un usuari LDAP per poder iniciar sessió a Ubuntu? Per quin motiu cadascun és necessari?

**B3.** Explica com funciona **autofs** per muntar perfils mòbils. Quin és el paper del caràcter `*` a `/etc/auto.homes`?

**B4.** Quin és el **DN Pattern** que s'usa a pGina per a un usuari `director201` a l'OU `usuaris` del domini `cognom.local`? Explica per quin motiu s'usa `%u`.

**B5.** Quin és el risc de tenir **UID/GID inconsistents** entre el servidor NFS i els clients? Quin avantatge ofereix LDAP per evitar aquest problema?

### Preguntes procedimentals

**B6.** Documenta el contingut complet de `/etc/nslcd.conf` per connectar al servidor LDAP `172.16.XXX.20` amb base DN `dc=cognom,dc=local`. Inclou la modificació de `nsswitch.conf`.

**B7.** Un usuari LDAP no pot fer login via SSH. Descriu el protocol de diagnòstic de 4 passos que seguiries (consultar `getent`, `id`, `nslcd`, `/var/log/auth.log`).

---

## Bloc C · Samba-AD DC (P43)

### Preguntes conceptuals

**C1.** Quines tres diferències principals hi ha entre **Samba servidor de fitxers** (UT3) i **Samba com a AD DC** (UT4)?

**C2.** Per quin motiu cal desactivar `smbd` i `nmbd` abans d'activar `samba-ad-dc`? Quina ordre confirma que tots dos estan inactius?

**C3.** Quin és el propòsit del paràmetre `--use-rfc2307` a `samba-tool domain provision`? Com afecta els clients Linux?

**C4.** Explica la diferència entre `vfs objects = acl_xattr` i els permisos Unix estàndard (`chmod`). En quin context és necessari `acl_xattr`?

**C5.** Un client Windows fa domain join a un DC Samba-AD i obté `"clock skew too great"`. Identifica la causa i proposa la solució al client Windows i al servidor Linux.

### Preguntes procedimentals

**C6.** Documenta les ordres completes per crear els usuaris `ana`, `marc`, `clara` i el grup `tecnics` amb `samba-tool`. Inclou UIDs RFC2307.

**C7.** Explica, amb les ordres corresponents, com verificar que el recurs `[tecnics]` nega l'accés a `clara` (membre de `comptabilitat`) des d'un client Linux. Quin missatge d'error esperes?

---

## Bloc D · Diagnòstic transversal

**D1.** Compara les tres solucions de directori estudiades (Windows AD, OpenLDAP, Samba-AD DC) segons: implementació, cost llicències, integració Linux, administració Windows RSAT.

**D2.** Un administrador ha de decidir entre Windows AD i Samba-AD DC per a una empresa amb 50 usuaris, pressupost limitat i clients Windows i Linux. Quina recomanaries? Justifica-ho.

**D3.** Completa la taula de ports i el seu ús en l'autenticació de domini:

| Port | Protocol | Servei | Diagnòstic |
|------|---------|--------|-----------|
| 53 | | | |
| 88 | | | |
| 389 | | | |
| 445 | | | |

**D4.** Descriu el **protocol d'autenticació Kerberos** en tres passos (TGT, TGS, Service Ticket). Utilitza un exemple concret: l'usuari `ana` fa login a un client Windows del domini `libretic.local`.

---

!!! info "Quadern del projecte"
    El quadern oficial amb les rúbriques d'avaluació, criteris de correcció i entrega a: [#](#)

!!! tip "Consell per al dossier"
    Cada resposta procedimental ha d'incloure **captures de pantalla** de les ordres i les seves sortides. Les respostes sense evidència visual no seran comptabilitzades. Per a les preguntes conceptuals, usa les teves pròpies paraules: copia/enganxa de les pàgines d'apunts penalitza la nota.
