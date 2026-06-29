---
title: Diagnòstic integral UT3 (Samba + NFS + CUPS)
tags:
  - ut3
  - diagnostic
  - samba
  - nfs
  - cups
---

# :material-stethoscope: Diagnòstic integral UT3 (Samba + NFS + CUPS)

!!! abstract "Concepte clau"
    Diagnosticar un problema de compartició de recursos requereix un **protocol sistemàtic**: verificar que el servei funciona, que els ports estan oberts, que el firewall no bloqueja, que els permisos (Linux + servei) són correctes i que la configuració és vàlida. Cada servei (Samba, NFS, CUPS) té les seves eines específiques.

=== ":material-notebook-outline: Apunts"

    ## Protocol de diagnòstic general

    ```mermaid
    graph TD
        P["Problema de compartició"] --> S1{"Servei actiu?"}
        S1 -->|No| FIX1["systemctl start/restart\nsystemctl enable"]
        S1 -->|Sí| S2{"Port obert?"}
        S2 -->|No| FIX2["ss -tulnp | grep PORT\nufw allow PORT"]
        S2 -->|Sí| S3{"Firewall bloqueja?"}
        S3 -->|Sí| FIX3["ufw allow from IP\nufw status"]
        S3 -->|No| S4{"Configuració vàlida?"}
        S4 -->|No| FIX4["Validació específica\n(testparm/exportfs -v/cupsd -t)"]
        S4 -->|Sí| S5{"Permisos fitxers?"}
        S5 -->|No| FIX5["chmod / chown\nls -la"]
        S5 -->|Sí| LOG["Revisa els logs\n/var/log/samba / /var/log/cups"]
    ```

    ## Diagnòstic Samba

    ### 1. Verificació del servei

    ```bash
    sudo systemctl status smbd nmbd
    sudo systemctl is-active smbd
    ```

    ### 2. Ports oberts

    ```bash
    ss -tulnp | grep -E "445|139"
    ```

    Esperat: `smbd` escoltant al port 445 i 139.

    ### 3. Validació de la configuració

    ```bash
    testparm -s
    testparm -s /etc/samba/smb.conf 2>&1 | grep -i error
    ```

    Cap error → configuració sintàcticament correcta.

    ### 4. Llistar recursos compartits

    ```bash
    # Sense autenticació (guests)
    smbclient -L //localhost -N

    # Amb autenticació
    smbclient -L //localhost -U maria.puig
    ```

    ### 5. Connexió de prova

    ```bash
    smbclient //localhost/nom-share -U maria.puig
    # Dins: ls, put fitxer, get fitxer
    ```

    ### 6. Usuaris Samba

    ```bash
    pdbedit -L
    pdbedit -L -v -u maria.puig
    ```

    ### 7. Permisos del directori

    ```bash
    ls -la /srv/samba/
    # Necessita: chmod 770 o 775, chown user:grup adequat
    ```

    ### 8. Logs Samba

    ```bash
    sudo tail -50 /var/log/samba/log.smbd
    sudo tail -50 /var/log/samba/log.nmbd
    # Log per connexió:
    sudo tail -30 /var/log/samba/log.192.168.100.20
    ```

    ### Taula d'errors Samba freqüents

    | Error al client | Causa probable | Solució |
    |-----------------|---------------|---------|
    | `NT_STATUS_ACCESS_DENIED` | Permisos Linux o Samba incorrectes | `chmod`/`chown` + revisar `valid users` |
    | `NT_STATUS_LOGON_FAILURE` | Contrasenya Samba incorrecta | `smbpasswd -a usuari` |
    | `NT_STATUS_BAD_NETWORK_NAME` | Share no existeix o mal escrit | `testparm -s` + revisar nom de secció |
    | No apareix a la xarxa | `nmbd` no funciona o firewall | `systemctl start nmbd` + `ufw allow samba` |
    | `NT_STATUS_CONNECTION_REFUSED` | `smbd` no funciona o port 445 tancat | `systemctl start smbd` + `ss -tulnp` |

    ---

    ## Diagnòstic NFS

    ### 1. Verificació del servei

    ```bash
    sudo systemctl status nfs-kernel-server
    sudo systemctl is-active nfs-kernel-server
    ```

    ### 2. Ports oberts

    ```bash
    ss -tulnp | grep -E "2049|111"
    rpcinfo -p | grep -E "nfs|mountd|portmapper"
    ```

    ### 3. Exports actius

    ```bash
    exportfs -v
    # Mostra: /srv/nfs/compartit  192.168.100.20(rw,sync,no_subtree_check)
    ```

    Si no mostra res → `sudo exportfs -ra` per recarregar `/etc/exports`.

    ### 4. Connexió des del client

    ```bash
    # Des del client
    showmount -e 192.168.100.10
    sudo mount -t nfs 192.168.100.10:/srv/nfs/compartit /mnt/test
    ls /mnt/test
    sudo umount /mnt/test
    ```

    ### 5. Firewall

    ```bash
    sudo ufw status | grep -E "2049|111"
    nc -zv 192.168.100.10 2049  # Des del client
    ```

    ### 6. Logs NFS

    ```bash
    sudo journalctl -u nfs-kernel-server --since "1 hour ago"
    sudo journalctl -u nfs-mountd --since "1 hour ago"
    dmesg | grep -i nfs
    ```

    ### Taula d'errors NFS freqüents

    | Error al client | Causa probable | Solució |
    |-----------------|---------------|---------|
    | `mount.nfs: access denied` | IP no autoritzada a `/etc/exports` | Afegir IP a exports + `exportfs -ra` |
    | `mount.nfs: Connection refused` | `nfs-kernel-server` no funciona o port 2049 tancat | `systemctl start nfs-kernel-server` |
    | `mount.nfs: No route to host` | Firewall bloqueja el port | `ufw allow from IP to any port 2049` |
    | Muntat però no es pot escriure | `ro` a exports o permisos Unix | Canvia a `rw` + `chmod`/`chown` |
    | `stale file handle` | El servidor ha reiniciat o el directori ha canviat | `umount -f /mnt/punt` + tornar a muntar |

    ---

    ## Diagnòstic CUPS

    ### 1. Verificació del servei

    ```bash
    sudo systemctl status cups
    sudo systemctl is-active cups
    ```

    ### 2. Port obert

    ```bash
    ss -tulnp | grep 631
    ```

    Esperat: `cupsd` escoltant al port 631 (127.0.0.1 o 0.0.0.0 si xarxa activa).

    ### 3. Impressores disponibles

    ```bash
    lpstat -p
    lpstat -v
    ```

    ### 4. Validació de la configuració

    ```bash
    sudo cupsd -t
    # "cupsd.conf is OK" si no hi ha errors
    ```

    ### 5. Impressió de prova

    ```bash
    lp -d PDF /etc/hostname
    lpq -P PDF
    ls /var/spool/cups-pdf/$(whoami)/
    ```

    ### 6. Logs CUPS

    ```bash
    sudo tail -50 /var/log/cups/error_log
    sudo tail -50 /var/log/cups/access_log
    ```

    ### Taula d'errors CUPS freqüents

    | Error | Causa probable | Solució |
    |-------|---------------|---------|
    | `403 Forbidden` a la web | Usuari no a `lpadmin` o restricció Location | `usermod -aG lpadmin $USER` + logout/login |
    | Impressora "parada" | Error de backend o permís | `sudo cupsenable PDF` + `cat error_log` |
    | PDF no apareix a `/var/spool/cups-pdf/` | Imprès com a root o directori incorrecte | Evita `sudo lp`; comprova `cupsd.conf → Out` |
    | No accessible des de la xarxa | `Listen localhost:631` o firewall | `Listen 0.0.0.0:631` + `ufw allow port 631` |
    | `client-error-not-found` | Impressora no existeix amb aquest nom | `lpstat -p` per verificar el nom exacte |

    ---

    ## Diagnòstic integral: matriu de ports i serveis

    | Servei | Dimoni | Port(s) | Verificació ràpida |
    |--------|--------|---------|-------------------|
    | Samba | `smbd` | 445, 139 | `smbclient -L //srv -N` |
    | Samba (resolució noms) | `nmbd` | 137, 138 UDP | `nmblookup srv-comparticio` |
    | NFS | `nfs-kernel-server` | 2049, 111 | `showmount -e 192.168.100.10` |
    | CUPS | `cupsd` | 631 | `lpstat -h 192.168.100.10 -p` |

    ## Script de diagnòstic ràpid UT3

    Desa aquest script al servidor per fer una verificació ràpida de tots els serveis:

    ```bash
    #!/bin/bash
    echo "=== DIAGNÒSTIC UT3 - $(date) ==="
    echo ""
    for SVC in smbd nmbd nfs-kernel-server cups; do
        STATUS=$(systemctl is-active $SVC 2>/dev/null)
        echo "[$STATUS] $SVC"
    done
    echo ""
    echo "=== PORTS ==="
    ss -tulnp | grep -E "445|139|2049|111|631" | awk '{print $5, $7}'
    echo ""
    echo "=== EXPORTS NFS ==="
    exportfs -v 2>/dev/null || echo "(cap export actiu)"
    echo ""
    echo "=== IMPRESSORES CUPS ==="
    lpstat -p 2>/dev/null || echo "(cups no funciona)"
    ```

    Desa com `/usr/local/bin/diag-ut3.sh` i executa amb `sudo bash /usr/local/bin/diag-ut3.sh`.

    !!! tip "Metodologia de diagnòstic: de fora cap a dins"
        Sempre comença per la capa exterior (xarxa → firewall → servei → configuració → permisos → logs). Si el client no pot connectar, primer verifica amb `nc -zv IP PORT` que el port és accessible. Si el port és obert però la connexió falla, revisa la configuració del servei. Si la configuració sembla correcta però falla, revisa els permisos del sistema de fitxers.

    !!! warning "No reiniciïs el servei com a primera acció"
        Reiniciar el servei pot esborrar informació valuosa dels logs. Primer **llegeix els logs** (`/var/log/samba/log.smbd`, `/var/log/cups/error_log`, `journalctl`), comprèn l'error, aplica la correcció i _llavors_ reinicia.

    ??? question "Auto-avaluació"
        **1.** Un usuari no pot connectar a un recurs Samba i el log mostra `NT_STATUS_LOGON_FAILURE`. Quin és el problema i com es soluciona?

        ??? success "Resposta"
            `NT_STATUS_LOGON_FAILURE` indica que les **credencials Samba** de l'usuari no són correctes (Samba té la seva pròpia base de dades de contrasenyes, separada del sistema Linux). La solució és reinicialitzar la contrasenya Samba: `sudo smbpasswd -a nom-usuari`. Si l'usuari ja existia a Samba però ha oblidat la contrasenya: `sudo smbpasswd nom-usuari`.

        **2.** Un client Linux executa `mount -t nfs 192.168.100.10:/srv/nfs/dades /mnt/nfs` i rep `mount.nfs: access denied`. Quines tres causes possibles cal investigar i en quin ordre?

        ??? success "Resposta"
            1. **IP no a `/etc/exports`**: comprova `exportfs -v` i verifica que la IP del client (192.168.100.20) apareix a les opcions de l'export. Si no hi és, afegeix-la i executa `exportfs -ra`.
            2. **Opció `ro` quan el client intenta escriure**: si l'export és `(ro,...)` i el client intenta muntar en mode escriptura, es rebutja. Canvia a `(rw,...)` + `exportfs -ra`.
            3. **Firewall al servidor**: comprova `nc -zv 192.168.100.10 2049` des del client. Si falla, `sudo ufw allow from 192.168.100.0/24 to any port 2049`.

        **3.** Un usuari envia un treball d'impressió a CUPS però el PDF no apareix a `/var/spool/cups-pdf/`. Quin és l'error més probable?

        ??? success "Resposta"
            L'error més probable és que el treball s'ha enviat amb `sudo lp -d PDF ...` en lloc de `lp -d PDF ...`. Quan s'usa `sudo`, el treball es processa com a `root` i el PDF es desa a `/var/spool/cups-pdf/root/` en lloc de `/var/spool/cups-pdf/nom-usuari/`. Solució: no usar `sudo` per imprimir, o buscar el PDF a `/var/spool/cups-pdf/root/`.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.30 · Diagnòstic integral UT3

    **Objectiu**: identificar i resoldre errors deliberats en els tres serveis de compartició.
    **Temps estimat**: 60 minuts
    **Modalitat**: l'instructor introdueix errors deliberats als serveis; l'alumnat els diagnostica i resol.

    ---

    ### Escenari A — Samba no accessible

    L'instructor executa: `sudo systemctl stop smbd`

    L'alumnat ha de:
    1. Identificar que Samba no funciona
    2. Identificar la causa (servei aturat)
    3. Solucionar i verificar

    ```bash
    # Diagnòstic
    smbclient -L //192.168.100.10 -N  # Connection refused
    sudo systemctl status smbd        # inactive (dead)

    # Solució
    sudo systemctl start smbd
    sudo systemctl status smbd        # active (running)
    smbclient -L //192.168.100.10 -N  # Funciona
    ```

    ### Escenari B — NFS no exporta

    L'instructor afegeix un espai incorrecte a `/etc/exports`: `192.168.100.20 (rw,...)` en lloc de `192.168.100.20(rw,...)`.

    L'alumnat ha de:
    1. Detectar que `showmount -e` no mostra exports
    2. Diagnosticar el fitxer `/etc/exports`
    3. Corregir l'error i tornar a exportar

    ```bash
    # Diagnòstic
    showmount -e 192.168.100.10         # (buit)
    exportfs -v                         # (buit)
    cat /etc/exports                    # Veu l'espai incorrecte

    # Solució: elimina l'espai entre IP i (opcions)
    # ERROR:    192.168.100.20 (rw,sync,no_subtree_check)
    # CORRECTE: 192.168.100.20(rw,sync,no_subtree_check)
    sudo systemctl restart nfs-kernel-server
    exportfs -v  # Ara mostra l'export
    ```

    ### Escenari C — CUPS no imprimeix

    L'instructor executa: `sudo cupsdisable PDF`

    L'alumnat ha de:
    1. Detectar que la impressora PDF està desactivada
    2. Trobar la causa
    3. Reactivar la impressora

    ```bash
    # Diagnòstic
    lp -d PDF /etc/hostname
    lpstat -p PDF           # "printer PDF is stopped"
    lpq -P PDF              # "disabled"

    # Solució
    sudo cupsenable PDF
    lpstat -p PDF           # "printer PDF is idle"
    lp -d PDF /etc/hostname # Ara funciona
    ```

    ### Punt de reflexió

    Omple la taula:

    | Escenari | Primer símptoma observat | Ordre de diagnòstic usada | Solució aplicada |
    |----------|------------------------|--------------------------|-----------------|
    | A - Samba | | | |
    | B - NFS | | | |
    | C - CUPS | | | |

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Linux Samba NFS CUPS troubleshooting guide"`
        - `"diagnose Samba access denied NT_STATUS"`
        - `"NFS mount access denied troubleshoot Ubuntu"`
        - `"CUPS printer stopped error_log Linux"`
