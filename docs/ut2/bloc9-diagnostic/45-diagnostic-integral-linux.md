---
title: Diagnòstic integral del sistema Linux
tags:
  - ut2
  - diagnostic
  - linux
  - ldap
  - sssd
  - nfs
  - autofs
  - perfils
  - seguretat
---

# :material-bug-check: Diagnòstic integral del sistema Linux

!!! abstract "Concepte clau"
    El sistema construït a la UT2 té cinc capes seqüencials: **LDAP** (identitat) → **SSSD** (integració amb el SO) → **NFS** (fitxers en xarxa) → **autofs** (muntatge dinàmic) → **permisos POSIX** (aïllament). El diagnòstic segueix sempre el mateix ordre: de la base cap amunt. Si una capa falla, totes les que en depenen fallen en cascada — no té sentit diagnosticar autofs si SSSD no funciona.

=== ":material-notebook-outline: Apunts"

    ## El sistema complet: 5 capes

    ```mermaid
    flowchart TB
        A["Capa 1 · LDAP\nslapd · dc=lafita,dc=local\nIdentitat centralitzada de tots els usuaris"]
        B["Capa 2 · SSSD\n/etc/sssd/sssd.conf\nFa que el SO vegi els usuaris LDAP com a locals"]
        C["Capa 3 · NFS\nnfs-kernel-server · /etc/exports\nExporta /perfils/ per la xarxa (port 2049)"]
        D["Capa 4 · autofs\n/etc/auto.master · /etc/auto.perfils\nMunta /perfils/usuari sota demanda (--ghost)"]
        E["Capa 5 · Permisos POSIX\nchmod 700 · chown UID:GID\nAïlla el directori home de cada usuari"]

        A --> B --> C --> D --> E

        style A fill:#1565C0,color:#fff
        style B fill:#1565C0,color:#fff
        style C fill:#1565C0,color:#fff
        style D fill:#1565C0,color:#fff
        style E fill:#1565C0,color:#fff
    ```

    !!! tip "Regla fonamental"
        **Diagnostica de baix a dalt.** Una capa superior mai funciona si la inferior falla. Comença sempre pel Pas 1 (LDAP) i no avancis fins que cada capa sigui verda.

    ---

    ## Pas 1 — LDAP funciona?

    LDAP és la base del sistema. Si `slapd` no funciona, cap usuari LDAP pot autenticar-se.

    ```bash
    # 1a. Estat del servei
    systemctl status slapd

    # 1b. Connexió anònima (comprova que el servidor LDAP respon)
    ldapwhoami -x -H ldap://localhost
    ```

    ```text
    anonymous
    ```

    ```bash
    # 1c. Comprova que els usuaris existeixen al directori LDAP
    ldapsearch -x -b "ou=usuaris,dc=lafita,dc=local" "(uid=*)" uid homeDirectory
    ```

    ```text
    dn: uid=maria.puig,ou=usuaris,dc=lafita,dc=local
    uid: maria.puig
    homeDirectory: /perfils/maria.puig

    dn: uid=pere.costa,ou=usuaris,dc=lafita,dc=local
    uid: pere.costa
    homeDirectory: /perfils/pere.costa

    dn: uid=anna.valls,ou=usuaris,dc=lafita,dc=local
    uid: anna.valls
    homeDirectory: /perfils/anna.valls
    ```

    !!! warning "Si slapd no arrenca"
        La causa més habitual és que el hostname no es resol. Comprova:
        ```bash
        hostname -f
        # Ha de retornar el FQDN, p. ex.: srv-ldap.lafita.local
        ```
        Si no es resol, `slapd` no pot inicialitzar el certificat TLS intern. Consulta la pàgina **05 · Hostname i resolució**.

    ---

    ## Pas 2 — SSSD funciona?

    SSSD llegeix el directori LDAP i fa que el SO "vegi" els usuaris LDAP com si fossin locals.

    ```bash
    # 2a. Estat del servei
    systemctl status sssd

    # 2b. Valida la sintaxi de sssd.conf
    sssctl config-check

    # 2c. Comprova que el SO reconeix els usuaris LDAP
    getent passwd maria.puig
    ```

    ```text
    maria.puig:x:1001:2001:Maria Puig:/perfils/maria.puig:/bin/bash
    ```

    ```bash
    # 2d. Comprova UID i grups
    id maria.puig
    ```

    ```text
    uid=1001(maria.puig) gid=2001(alumnes) groups=2001(alumnes)
    ```

    !!! warning "Si sssd no arrenca"
        La causa més freqüent és `/etc/sssd/sssd.conf` sense permisos 600. SSSD rebutja explícitament fitxers de configuració accessibles per a altres usuaris:
        ```bash
        sudo chmod 600 /etc/sssd/sssd.conf
        sudo systemctl restart sssd
        ```
        Consulta la pàgina **29 · Configuració de sssd.conf**.

    ```bash
    # 2e. Logs de SSSD per a diagnòstic detallat
    journalctl -u sssd --since "10 minutes ago"
    sudo tail -30 /var/log/sssd/sssd_nss.log
    ```

    ---

    ## Pas 3 — NFS funciona?

    NFS exporta `/perfils/` des del servidor. Sense NFS, autofs no pot muntar els perfils de cap client.

    ```bash
    # 3a. Estat del servei (al servidor)
    systemctl status nfs-kernel-server

    # 3b. Comprova les exportacions actives al kernel
    exportfs -v
    ```

    ```text
    /perfils    192.168.100.0/24(rw,wdelay,no_root_squash,no_subtree_check,sec=sys,rw,secure,no_root_squash,no_all_squash)
    ```

    ```bash
    # 3c. Comprova les exportacions des del servidor
    showmount -e localhost

    # 3d. Comprova les exportacions des del client
    showmount -e 192.168.100.10
    ```

    ```text
    Export list for 192.168.100.10:
    /perfils 192.168.100.0/24
    ```

    !!! danger "Si exportfs -v no mostra /perfils"
        Has modificat `/etc/exports` però no has executat `exportfs -ra`. Els canvis a `/etc/exports` **no s'apliquen mai automàticament**:
        ```bash
        sudo exportfs -ra
        exportfs -v    # ara ha de mostrar /perfils
        ```
        Consulta la pàgina **36 · /etc/exports**.

    ---

    ## Pas 4 — autofs funciona?

    autofs intercepta l'accés a `/perfils/usuari` i dispara el muntatge NFS corresponent.

    ```bash
    # 4a. Estat del servei
    systemctl status autofs

    # 4b. Comprova que /perfils mostra els directoris ghost
    ls /perfils
    ```

    ```text
    maria.puig  pere.costa  anna.valls
    ```

    ```bash
    # 4c. Dispara el muntatge d'un usuari concret
    ls /perfils/maria.puig

    # 4d. Verifica que el muntatge NFS és actiu
    cat /proc/mounts | grep perfils
    ```

    ```text
    192.168.100.10:/perfils/maria.puig /perfils/maria.puig nfs4 rw,relatime,vers=4.2,... 0 0
    ```

    !!! danger "Si ls /perfils és buit"
        Falta `--ghost` a `/etc/auto.master`. Sense `--ghost`, els directoris no apareixen fins que s'accedeix per primera vegada — PAM no els troba en el moment del login i la sessió s'obre a `/`:

        ```bash
        # Contingut correcte de /etc/auto.master
        /perfils    /etc/auto.perfils    --timeout=60 --ghost

        sudo systemctl restart autofs
        ls /perfils    # ara ha de mostrar els directoris
        ```

        Consulta les pàgines **40 · auto.master** i **41 · auto.perfils wildcard**.

    ---

    ## Pas 5 — el perfil complet funciona?

    La prova definitiva: un usuari pot fer login, el directori home és `/perfils/usuari` i pot crear fitxers.

    ```bash
    # 5a. Comprova permisos al servidor
    ls -la /perfils/
    ```

    ```text
    drwxr-xr-x 5 root root  4096 Jun 27 09:00 .
    drwx------  2 1001 2001  4096 Jun 27 10:23 maria.puig
    drwx------  2 1002 2001  4096 Jun 27 10:25 pere.costa
    drwx------  2 1003 2001  4096 Jun 27 10:26 anna.valls
    ```

    ```bash
    # 5b. Login complet
    su - maria.puig
    ```

    ```text
    maria.puig@srv-ldap:~$ pwd
    /perfils/maria.puig
    maria.puig@srv-ldap:~$ id
    uid=1001(maria.puig) gid=2001(alumnes) groups=2001(alumnes)
    ```

    ```bash
    # 5c. Prova d'escriptura al perfil
    echo "Diagnòstic OK: $(date)" > ~/prova-diagnostic.txt
    cat ~/prova-diagnostic.txt
    exit

    # 5d. Verifica al servidor que el fitxer existeix (prova de persistència)
    cat /perfils/maria.puig/prova-diagnostic.txt
    ```

    Si arriba fins aquí sense errors, la pila completa **LDAP + SSSD + NFS + autofs + permisos** funciona correctament.

    ---

    ## Fluxograma de diagnòstic integral

    ```mermaid
    flowchart TD
        A["Problema: usuari LDAP\nno pot fer login"] --> B{"1 · LDAP\nslapd actiu?\nldapwhoami retorna 'anonymous'?"}

        B -->|No| B1["Reinicia slapd\nsudo systemctl restart slapd\nComprova: hostname -f"]
        B -->|Sí| C{"2 · SSSD\ngetent passwd maria.puig\nretorna la línia correcta?"}

        C -->|No| C1["Comprova chmod 600 sssd.conf\nsssctl config-check\ntail /var/log/sssd/sssd_nss.log"]
        C -->|Sí| D{"3 · NFS\nexportfs -v mostra /perfils?\nshowmount -e funciona?"}

        D -->|No| D1["sudo exportfs -ra\nComprova /etc/exports\nsystemctl restart nfs-kernel-server"]
        D -->|Sí| E{"4 · autofs\nls /perfils mostra\nels directoris ghost?"}

        E -->|No| E1["Afegeix --ghost a auto.master\nComprova /etc/auto.perfils\nsudo systemctl restart autofs"]
        E -->|Sí| F{"5 · Permisos\nls -la /perfils mostra\ndrwx------ amb UID:GID?"}

        F -->|No| F1["sudo chmod 700 /perfils/maria.puig\nsudo chown 1001:2001 /perfils/maria.puig"]
        F -->|Sí| G["✅ Pila completa OK\nsu - maria.puig ha de funcionar"]

        style A fill:#B71C1C,color:#fff
        style B1 fill:#E65100,color:#fff
        style C1 fill:#E65100,color:#fff
        style D1 fill:#E65100,color:#fff
        style E1 fill:#E65100,color:#fff
        style F1 fill:#E65100,color:#fff
        style G fill:#1B5E20,color:#fff
    ```

    ---

    ## Script de diagnòstic ràpid

    Guarda aquest script al servidor per reutilitzar-lo quan apareguin problemes:

    ```bash title="diagnostic-ut2.sh"
    #!/bin/bash
    # Diagnòstic integral UT2 · LDAP + SSSD + NFS + autofs

    USUARI="maria.puig"
    SERVIDOR="192.168.100.10"
    BASE="dc=lafita,dc=local"

    sep() { echo "═══════════════════════════════════════"; }

    sep; echo " PAS 1: LDAP"; sep
    systemctl is-active slapd >/dev/null && echo "✅ slapd actiu" || echo "❌ slapd aturat"
    ldapwhoami -x -H ldap://localhost >/dev/null 2>&1 \
        && echo "✅ LDAP respon" || echo "❌ LDAP no respon"
    ldapsearch -x -b "ou=usuaris,$BASE" "(uid=$USUARI)" uid 2>/dev/null | grep -q "uid:" \
        && echo "✅ $USUARI existeix a LDAP" || echo "❌ $USUARI no trobat a LDAP"

    sep; echo " PAS 2: SSSD"; sep
    systemctl is-active sssd >/dev/null && echo "✅ sssd actiu" || echo "❌ sssd aturat"
    getent passwd $USUARI >/dev/null 2>&1 \
        && echo "✅ $USUARI visible al sistema" || echo "❌ $USUARI no visible (SSSD falla)"

    sep; echo " PAS 3: NFS"; sep
    systemctl is-active nfs-kernel-server >/dev/null \
        && echo "✅ nfs-kernel-server actiu" || echo "❌ nfs-kernel-server aturat"
    exportfs -v 2>/dev/null | grep -q "/perfils" \
        && echo "✅ /perfils exportat" || echo "❌ /perfils no exportat → sudo exportfs -ra"
    showmount -e $SERVIDOR 2>/dev/null | grep -q "/perfils" \
        && echo "✅ showmount mostra /perfils" || echo "❌ showmount no mostra /perfils"

    sep; echo " PAS 4: autofs"; sep
    systemctl is-active autofs >/dev/null && echo "✅ autofs actiu" || echo "❌ autofs aturat"
    ls /perfils 2>/dev/null | grep -q "$USUARI" \
        && echo "✅ ghost dirs visibles a /perfils" || echo "❌ /perfils buit → --ghost a auto.master?"
    ls /perfils/$USUARI >/dev/null 2>&1 \
        && echo "✅ muntatge /perfils/$USUARI OK" || echo "❌ muntatge /perfils/$USUARI falla"

    sep; echo " PAS 5: Permisos"; sep
    PERMS=$(stat -c "%a" /perfils/$USUARI 2>/dev/null)
    [ "$PERMS" = "700" ] \
        && echo "✅ permisos 700 correctes" || echo "❌ permisos: $PERMS (esperat: 700)"

    sep; echo " RESULTAT FINAL"; sep
    echo "→ Executa 'su - $USUARI' per al test definitiu"
    ```

    ```bash
    chmod +x diagnostic-ut2.sh
    sudo ./diagnostic-ut2.sh
    ```

    ---

    ## Errors freqüents recapitulats

    | Error | Símptoma | Solució ràpida |
    |-------|---------|----------------|
    | `sssd.conf` sense chmod 600 | SSSD no arrenca; `getent` buida | `sudo chmod 600 /etc/sssd/sssd.conf` |
    | `/etc/exports` sense `exportfs -ra` | `showmount -e` no mostra `/perfils` | `sudo exportfs -ra` |
    | `--ghost` absent de `auto.master` | `ls /perfils` buit; `su -` obre sessió a `/` | Afegeix `--ghost`; `systemctl restart autofs` |
    | UID:GID incorrecte al directori home | `Permission denied` en accedir al home | `sudo chown 1001:2001 /perfils/maria.puig` |
    | `homeDirectory` LDAP apunta a ruta errònia | Sessió s'obre a `/` en comptes de `/perfils/maria.puig` | `ldapmodify` per corregir l'atribut `homeDirectory` |
    | Port 2049 bloquejat pel firewall | `showmount` no respon des del client | `sudo ufw allow from 192.168.100.0/24 to any port 2049` |

    ---

    ## Taula de fitxers i logs de la UT2

    | Capa | Fitxer de configuració | Log / verificació | Pàgina |
    |------|----------------------|-------------------|--------|
    | LDAP | `/etc/ldap/slapd.d/` | `journalctl -u slapd` | 13 |
    | SSSD | `/etc/sssd/sssd.conf` | `/var/log/sssd/sssd_nss.log` | 29 |
    | NSS | `/etc/nsswitch.conf` | `getent passwd maria.puig` | 30 |
    | NFS | `/etc/exports` | `exportfs -v` · `showmount -e` | 36 |
    | autofs (principal) | `/etc/auto.master` | `cat /proc/mounts \| grep autofs` | 40 |
    | autofs (detall) | `/etc/auto.perfils` | `cat /proc/mounts \| grep perfils` | 41 |
    | Permisos | `/perfils/<usuari>/` | `ls -la /perfils/` · `stat` | 44 |

    ??? question "Auto-avaluació"

        **1.** `su - maria.puig` falla amb "Authentication failure". `systemctl status sssd` mostra el servei actiu però `getent passwd maria.puig` no retorna res. Quin pas del protocol cal executar a continuació i per quin motiu?

        ??? success "Resposta"
            Cal anar al **Pas 1 (LDAP)**, no quedar-se al Pas 2. SSSD és actiu però no pot llegir dades del directori — la causa és a la capa inferior. Executa `ldapwhoami -x -H ldap://localhost`: si no respon, `slapd` no funciona. Si respon, comprova que `maria.puig` existeix al directori: `ldapsearch -x -b "ou=usuaris,dc=lafita,dc=local" "(uid=maria.puig)"`. Si l'usuari existeix a LDAP però SSSD no el veu, revisa `/etc/sssd/sssd.conf` (URI del servidor, base DN) i `sssctl config-check`. Finalment: `sudo tail -30 /var/log/sssd/sssd_nss.log`.

        **2.** `getent passwd maria.puig` retorna la línia correcta però `su - maria.puig` obre la sessió al directori `/` en comptes de `/perfils/maria.puig`. Quines dues causes examines i en quin ordre?

        ??? success "Resposta"
            Primera causa a examinar: **`--ghost` absent de `/etc/auto.master`**. PAM comprova si el directori home existeix en el moment del login. Sense `--ghost`, `/perfils/maria.puig` no apareix fins que s'hi accedeix — PAM no el troba i obre la sessió al directori arrel. Comprova: `ls /perfils` (ha de mostrar els directoris); si és buit, afegeix `--ghost` i `systemctl restart autofs`. Segona causa: **`homeDirectory` a LDAP apunta a una ruta incorrecta**. Si l'atribut és `/home/maria.puig` en comptes de `/perfils/maria.puig`, el sistema va al directori incorrecte. Comprova: `ldapsearch -x -b "ou=usuaris,dc=lafita,dc=local" "(uid=maria.puig)" homeDirectory`.

        **3.** El script `diagnostic-ut2.sh` retorna: ✅ LDAP, ✅ SSSD, ❌ `nfs-kernel-server aturat`. Cal executar els passos 4 i 5?

        ??? success "Resposta"
            No. Si NFS és aturat, **els passos 4 i 5 fallaran en cascada** sense informació addicional útil: autofs intenta muntar via NFS i no pot, `/perfils/maria.puig` no és accessible, els permisos existeixen al servidor però el client no hi arriba. Primer repara NFS: `sudo systemctl start nfs-kernel-server`. Si no arrenca, `journalctl -u nfs-kernel-server` mostra el motiu (ports ja ocupats, exports malformats...). Un cop NFS funcioni, torna a executar el diagnòstic complet des del Pas 3. Intentar diagnosticar autofs o permisos amb NFS aturat genera errors confusos que distorsionen el diagnòstic.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 9.1 · Diagnòstic integral de la pila completa

    **Objectiu**: verificar que la pila LDAP + SSSD + NFS + autofs + permisos funciona completament i documentar l'estat de cada capa.

    **Temps estimat**: 45 minuts

    ---

    ### Part A – Protocol de 5 passos

    Executa les ordres de cada pas i omple la taula:

    | Pas | Ordre | Resultat obtingut | ✅ / ❌ |
    |-----|-------|------------------|--------|
    | 1a | `systemctl is-active slapd` | | |
    | 1b | `ldapwhoami -x -H ldap://localhost` | | |
    | 1c | `ldapsearch ... "(uid=maria.puig)" uid homeDirectory` | | |
    | 2a | `systemctl is-active sssd` | | |
    | 2b | `getent passwd maria.puig` | | |
    | 2c | `id maria.puig` | | |
    | 3a | `systemctl is-active nfs-kernel-server` | | |
    | 3b | `exportfs -v` | | |
    | 3c | `showmount -e 192.168.100.10` | | |
    | 4a | `systemctl is-active autofs` | | |
    | 4b | `ls /perfils` | | |
    | 4c | `cat /proc/mounts \| grep perfils` | | |
    | 5a | `ls -la /perfils/` | | |
    | 5b | `su - maria.puig && pwd && id` | | |

    ### Part B – Prova de fallada controlada

    Simula un error a cada capa i verifica que el protocol el detecta:

    ```bash
    # Simula fallada de SSSD
    sudo systemctl stop sssd
    getent passwd maria.puig        # ha de fallar
    sudo systemctl start sssd

    # Simula fallada de NFS
    sudo systemctl stop nfs-kernel-server
    showmount -e localhost           # ha de fallar
    sudo systemctl start nfs-kernel-server
    sudo exportfs -ra

    # Simula fallada d'autofs
    sudo systemctl stop autofs
    ls /perfils/                     # ha d'estar buit o inaccessible
    sudo systemctl start autofs
    ```

    Per a cada fallada, anota:
    - Quin pas del protocol la detecta
    - Quins passos posteriors fallen en cascada i per quin motiu

    ### Part C – Script de diagnòstic

    ```bash
    # Crea el fitxer i executa'l
    nano diagnostic-ut2.sh
    # (enganxa el contingut de la secció Apunts)
    chmod +x diagnostic-ut2.sh
    sudo ./diagnostic-ut2.sh
    ```

    Comprova que la sortida coincideix amb la taula de la Part A.

    ### Part D – Prova final de roaming (prova definitiva de la UT2)

    ```bash
    # Des del client A (o terminal 1)
    su - maria.puig
    echo "UT2 completada: $(date)" > ~/final-ut2.txt
    exit

    # Des del servidor (o terminal 2), comprova persistència
    cat /perfils/maria.puig/final-ut2.txt

    # Repeteix per a pere.costa i anna.valls
    su - pere.costa
    echo "Pere: $(date)" > ~/final-ut2.txt
    exit

    su - anna.valls
    echo "Anna: $(date)" > ~/final-ut2.txt
    exit

    # Verifica aïllament: maria.puig no pot llegir el home de pere.costa
    su - maria.puig -c "cat /perfils/pere.costa/final-ut2.txt"
    # → Permission denied (correcte)
    ```

    Quan tots tres usuaris poden fer login, troben el seu directori home, creen fitxers i estan aïllats entre ells, la UT2 està completament operativa.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Linux LDAP SSSD NFS autofs troubleshooting step by step"`
        - `"OpenLDAP SSSD debug log troubleshooting Ubuntu 24.04"`
        - `"autofs NFS home directory diagnostic flowchart Linux"`
        - `"Linux server administration complete stack verification"`
