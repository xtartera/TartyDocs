---
title: Diagnòstic integral UT4 (AD + LDAP + Samba-AD)
tags:
  - ut4
  - diagnostic
  - active-directory
  - ldap
  - samba
---

# :material-stethoscope: Diagnòstic integral UT4 (AD + LDAP + Samba-AD)

!!! abstract "Concepte clau"
    Diagnosticar un problema d'integració de sistemes requereix un **protocol sistemàtic**: verificar que el servei de directori funciona, que el DNS resol els noms correctament, que Kerberos pot obtenir tickets, que NSS resol els usuaris, i que l'autenticació PAM funciona. Cada solució (AD, LDAP, Samba-AD) té les seves eines específiques.

=== ":material-notebook-outline: Apunts"

    ## Protocol de diagnòstic general UT4

    ```mermaid
    graph TD
        P["Problema d'integració"] --> D1{"DNS resol\nel domini?"}
        D1 -->|No| F1["nslookup domini\nComprueba servidor DNS\n(apuntar al DC)"]
        D1 -->|Sí| D2{"KDC accessible?\n(port 88)"}
        D2 -->|No| F2["nc -zv DC 88\nFirewall? Samba-AD actiu?\nsmbd/nmbd conflicte?"]
        D2 -->|Sí| D3{"kinit funciona?"}
        D3 -->|No| F3["Credencials correctes?\nkrb5.conf correcte?\nRellotge sincronitzat?"]
        D3 -->|Sí| D4{"getent passwd\nfunciona?"}
        D4 -->|No| F4["sssd/nslcd actiu?\nnsswitch.conf té ldap?\nsssd.conf correcte?"]
        D4 -->|Sí| D5{"Login SSH\nfunciona?"}
        D5 -->|No| F5["PAM configurat?\npam-auth-update?\n/var/log/auth.log"]
        D5 -->|Sí| OK["Integració OK ✓"]
    ```

    ## Diagnòstic: Active Directory (Windows Server)

    ```powershell
    # Al DC: estat dels serveis
    Get-Service ADWS, KDC, Netlogon, DNS | Select-Object Name, Status

    # Comprova el DC
    dcdiag /test:dns
    dcdiag /test:connectivity

    # Al client Windows: aplica GPOs i comprova
    gpupdate /force
    gpresult /r

    # Al client Ubuntu: verifica la integració
    realm list
    sudo sssctl domain-status ad-cognom.local
    sudo journalctl -u sssd --since "5 min ago"
    ```

    ## Diagnòstic: OpenLDAP multiplataforma

    ```bash
    # Al servidor: estat slapd
    sudo systemctl status slapd
    sudo journalctl -u slapd --since "10 min ago"

    # Connexió directa al servidor LDAP
    ldapsearch -x -H ldap://172.16.XXX.20 \
        -b "dc=cognom,dc=local" "(uid=director201)"

    # Al client Ubuntu: estat nslcd
    sudo systemctl status nslcd
    sudo journalctl -u nslcd --since "10 min ago"

    # Resolució d'usuaris
    getent passwd director201
    id director201

    # Logs d'autenticació
    sudo tail -30 /var/log/auth.log
    ```

    ## Diagnòstic: Samba-AD DC

    ```bash
    # Al DC Samba: estat del servei
    sudo systemctl status samba-ad-dc
    sudo journalctl -u samba-ad-dc --since "10 min ago"

    # Verifica el DNS intern
    host -t SRV _ldap._tcp.libretic.local 127.0.0.1
    host -t SRV _kerberos._tcp.libretic.local 127.0.0.1

    # Verifica Kerberos
    kinit administrator@LIBRETIC.LOCAL
    klist

    # Llista usuaris i grups
    sudo wbinfo -u
    sudo wbinfo -g
    sudo samba-tool user list

    # Test de recursos
    smbclient -L //localhost -U administrator
    ```

    ## Taula d'errors freqüents UT4

    | Error | Solució de directori | Causa probable | Solució |
    |-------|---------------------|---------------|---------|
    | `cannot contact the domain` | AD / Samba-AD | DNS no apunta al DC | `Set-DnsClientServerAddress` / `resolved.conf` |
    | `clock skew too great` | AD / Samba-AD (Kerberos) | Rellotge desfassat >5 min | `w32tm /resync` / `systemctl restart systemd-timesyncd` |
    | `getent passwd usuari` buit | LDAP (nslcd) | nslcd no funciona o nsswitch.conf | `systemctl restart nslcd` + verifica nsswitch.conf |
    | `NT_STATUS_ACCESS_DENIED` | Samba (tots) | Permisos Unix o ACL Samba | `chmod`/`chown` + verifica `valid users` |
    | `realm join: No such realm` | AD / Samba-AD (realmd) | DNS no resol el domini | Verifica DNS + `realm discover domini` |
    | `kinit: Cannot contact KDC` | Kerberos (tots) | Port 88 inaccessible o krb5.conf incorrecte | `nc -zv DC 88` + revisa `/etc/krb5.conf` |
    | `id: usuari: no such user` | LDAP / AD | NSS no resol l'usuari | `sssctl cache-expire -E` + `systemctl restart sssd` |
    | Login pGina: `Invalid credentials` | OpenLDAP (pGina) | DN Pattern incorrecte o contrasenya | Verifica `uid=%u,ou=usuaris,dc=...` |

    ## Matriu de ports i serveis UT4

    | Servei | Port | Protocol | Diagnòstic |
    |--------|------|---------|-----------|
    | DNS (AD/Samba) | 53 | TCP/UDP | `nslookup domini` |
    | Kerberos (AD/Samba) | 88 | TCP/UDP | `nc -zv DC 88` / `kinit user@REALM` |
    | LDAP | 389 | TCP | `ldapsearch -x -H ldap://DC -b "base"` |
    | SMB (SYSVOL) | 445 | TCP | `smbclient -L //DC -N` |
    | LDAPS | 636 | TCP | `nc -zv DC 636` |
    | OpenLDAP | 389 | TCP | `nc -zv LDAP-SRV 389` |

    ## Script de diagnòstic ràpid UT4

    ```bash
    #!/bin/bash
    # diag-ut4.sh — Diagnòstic ràpid d'integració de sistemes heterogenis

    echo "=== DIAGNÒSTIC UT4 - $(date) ==="

    # Detecta la solució de directori activa
    SOLUTIO="desconeguda"
    systemctl is-active samba-ad-dc &>/dev/null && SOLUTIO="Samba-AD DC"
    systemctl is-active slapd &>/dev/null && SOLUTIO="OpenLDAP"
    systemctl is-active sssd &>/dev/null && SOLUTIO="SSSD (AD o LDAP)"

    echo "Solució detectada: $SOLUTIO"
    echo ""

    # Serveis comuns
    echo "=== SERVEIS ==="
    for SVC in slapd samba-ad-dc sssd nslcd oddjobd; do
        STATUS=$(systemctl is-active $SVC 2>/dev/null)
        [ "$STATUS" = "active" ] && echo "[OK  ] $SVC" || echo "[--- ] $SVC (inactive)"
    done

    echo ""
    echo "=== DNS ==="
    for FQDN in ad-cognom.local libretic.local cognom.local; do
        RESULT=$(nslookup $FQDN 2>/dev/null | grep "Address" | tail -1)
        [ -n "$RESULT" ] && echo "[OK] $FQDN → $RESULT" || echo "[??] $FQDN (no resol)"
    done

    echo ""
    echo "=== USUARIS (getent) ==="
    getent passwd | grep -v "^[a-z]" | head -5 | awk -F: '{print "[OK] " $1 " (uid=" $3 ")"}'

    echo ""
    echo "=== KERBEROS ==="
    klist 2>/dev/null && echo "[OK] Tickets Kerberos actius" || echo "[??] Sense tickets Kerberos (normal si no s'ha fet kinit)"
    ```

    Desa a `/usr/local/bin/diag-ut4.sh` i executa amb `bash /usr/local/bin/diag-ut4.sh`.

    !!! tip "Logs: on mirar per solució"
        | Solució | Log principal |
        |---------|-------------|
        | Active Directory (Ubuntu client) | `journalctl -u sssd` / `/var/log/auth.log` |
        | OpenLDAP (servidor) | `journalctl -u slapd` |
        | OpenLDAP (client nslcd) | `journalctl -u nslcd` / `/var/log/auth.log` |
        | Samba-AD DC | `journalctl -u samba-ad-dc` |
        | pGina (Windows) | Visor d'Esdeveniments Windows → Aplicació → pGina |
        | Kerberos | `/var/log/krb5.log` (si existe) o `KRB5_TRACE=/dev/stderr kinit ...` |

    !!! warning "L'ordre de diagnòstic importa"
        Sempre comença per **DNS** (la capa inferior). Si el DNS no funciona, cap altra capa funcionarà: Kerberos no trobarà el KDC, `realm discover` fallarà, `getent` no resoldrà usuaris. Un error de DNS es manifesta de moltes formes diferents a les capes superiors.

    ??? question "Auto-avaluació"
        **1.** Un client Ubuntu no pot fer `realm join libretic.local` i mostra `"No such realm found"`. Quines dues causes cal investigar primer?

        ??? success "Resposta"
            1. **DNS**: `nslookup libretic.local` ha de resoldre a la IP del DC Samba. Si falla, el client no pot descobrir el domini. Solució: configurar `/etc/systemd/resolved.conf` amb `DNS=IP_del_DC Domains=libretic.local`. 2. **`realm discover libretic.local`**: si DNS funciona, prova `realm discover` per veure si detecta el domini. Si retorna buit, pot ser que el servei Samba-AD DC no estigui actiu al servidor (`sudo systemctl status samba-ad-dc`).

        **2.** Un usuari intenta login SSH al client Ubuntu i obté `Access denied` tot i que `getent passwd usuari` funciona correctament. Quins tres llocs comprovaries?

        ??? success "Resposta"
            1. **`/var/log/auth.log`**: mostra el motiu exacte del rebuig PAM (p.ex., `pam_sss: user not permitted` si hi ha `simple_allow_groups` configurada). 2. **`sssd.conf`**: verifica `access_provider` i `simple_allow_groups` — potser l'usuari no pertany al grup autoritzat. 3. **`/etc/pam.d/common-auth`**: verifica que `pam_sss.so` (o `pam_ldap.so`) apareix a la cadena PAM correctament.

        **3.** `kinit administrator@LIBRETIC.LOCAL` falla amb `"clock skew too great"`. Quina és la solució al client Ubuntu i per quin motiu passa?

        ??? success "Resposta"
            Kerberos requereix que el rellotge del client i el servidor no difereixi més de **5 minuts**. Si la diferència és major, el KDC rebutja els tickets per prevenir atacs de replay (un ticket interceptat podria usar-se moltes hores). Solució al client Ubuntu: `sudo systemctl restart systemd-timesyncd` per sincronitzar el rellotge via NTP. Si no hi ha accés a internet, configura el servidor com a font NTP: `timedatectl set-ntp true`.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.30 · Diagnòstic integral UT4

    **Objectiu**: identificar i resoldre errors deliberats en els tres tipus d'integració de sistemes.
    **Temps estimat**: 60 minuts
    **Modalitat**: l'instructor introdueix errors deliberats; l'alumnat els diagnostica i resol.

    ---

    ### Escenari A – AD o Samba-AD: domain join falla

    L'instructor atura el servei DNS al DC (o desconfigura el DNS al client).

    L'alumnat ha de:
    1. Identificar que el DNS és el problema
    2. Verificar: `nslookup domini`
    3. Solucionar i verificar

    ### Escenari B – OpenLDAP: `getent passwd` no funciona

    L'instructor atura `nslcd` al client.

    ```bash
    # Diagnòstic
    getent passwd director201   # No retorna res
    sudo systemctl status nslcd  # inactive

    # Solució
    sudo systemctl start nslcd
    getent passwd director201   # Ara funciona
    ```

    ### Escenari C – Kerberos: kinit falla per desfasament horari

    L'instructor canvia l'hora del DC o del client (>5 minuts de diferència).

    ```bash
    # Diagnòstic
    kinit administrator@LIBRETIC.LOCAL
    # kinit: Clock skew too great while getting initial credentials

    # Diagnòstic: diferència horària
    date                    # Hora del client
    # Compara amb l'hora del DC

    # Solució
    sudo timedatectl set-ntp true
    sudo systemctl restart systemd-timesyncd
    timedatectl status
    ```

    ### Punt de reflexió

    Omple la taula:

    | Escenari | Primer símptoma | Eina de diagnòstic usada | Solució |
    |----------|----------------|--------------------------|---------|
    | A – Domain join | | | |
    | B – getent | | | |
    | C – Kerberos | | | |

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Active Directory troubleshooting Linux client sssd"`
        - `"Kerberos clock skew kinit troubleshoot"`
        - `"LDAP nslcd getent troubleshoot Ubuntu"`
        - `"Samba AD DC troubleshooting wbinfo"`
