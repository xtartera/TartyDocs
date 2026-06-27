---
title: Firewall ufw
tags:
  - ut2
  - linux
  - seguretat
  - ufw
---

# :material-wall-fire: Firewall ufw

!!! abstract "Concepte clau"
    **ufw** (*Uncomplicated Firewall*) és la capa de configuració simplificada del firewall de Linux (`iptables`/`nftables`). Al servidor LDAP del laboratori, cal obrir els ports **22** (SSH), **389** (LDAP) i **2049** (NFS) perquè els clients s'hi puguin connectar.

=== ":material-notebook-outline: Apunts"

    ## Ports que cal obrir al servidor UT2

    | Port | Protocol | Servei | Per a |
    |------|---------|--------|-------|
    | 22 | TCP | SSH | Administració remota |
    | 389 | TCP | LDAP | Consultes LDAP dels clients (SSSD) |
    | 636 | TCP | LDAPS | LDAP sobre TLS (opcional, seguretat augmentada) |
    | 2049 | TCP/UDP | NFS | Accés als perfils mòbils (autofs) |
    | 111 | TCP/UDP | rpcbind | Necessari per a NFS |

    ## Ordres bàsiques de ufw

    ```bash
    # Habilita el firewall
    sudo ufw enable

    # Deshabilita el firewall
    sudo ufw disable

    # Veure l'estat i les regles actives
    sudo ufw status verbose

    # Permetre un port específic (TCP)
    sudo ufw allow 389/tcp

    # Permetre un servei per nom (usa /etc/services)
    sudo ufw allow ssh

    # Denegar un port
    sudo ufw deny 23/tcp   # Telnet — bloqueja

    # Eliminar una regla
    sudo ufw delete allow 389/tcp

    # Restablir totes les regles (torna al punt de partida)
    sudo ufw reset
    ```

    ## Configuració per al laboratori UT2

    ```bash
    # Comprova l'estat inicial (per defecte és inactive)
    sudo ufw status

    # Afegeix les regles necessàries ABANS d'activar el firewall
    # (important: SSH primer, per no quedar-te sense accés remot)
    sudo ufw allow ssh            # port 22
    sudo ufw allow ldap           # port 389 (LDAP sense TLS)
    sudo ufw allow 2049/tcp       # NFS
    sudo ufw allow 111/tcp        # rpcbind (necessari per NFS)
    sudo ufw allow 111/udp

    # Activa el firewall
    sudo ufw enable

    # Comprova les regles actives
    sudo ufw status verbose
    ```

    Sortida esperada:
    ```text
    Status: active
    Logging: on (low)
    Default: deny (incoming), allow (outgoing), disabled (routed)

    To               Action  From
    --               ------  ----
    22/tcp           ALLOW IN  Anywhere
    389/tcp          ALLOW IN  Anywhere
    2049/tcp         ALLOW IN  Anywhere
    111/tcp          ALLOW IN  Anywhere
    111/udp          ALLOW IN  Anywhere
    ```

    !!! danger "Afegeix SSH ABANS d'activar ufw"
        Si actives `ufw enable` sense haver afegit la regla de SSH, **perds l'accés remot immediament** i has d'accedir físicament a la consola del servidor per corregir-ho. Afegeix sempre les regles necessàries **abans** de `ufw enable`.

    ## Verificació de ports oberts

    ```bash
    # Veure quins ports estan escoltant (sense ufw)
    ss -tulpn

    # Veure els ports oberts des de l'exterior (cal nmap al client)
    # nmap -sT 192.168.100.10
    ```

    Sortida de `ss -tulpn` (extracte):
    ```text
    Netid State  Recv-Q Send-Q Local Address:Port   Process
    tcp   LISTEN 0      128    0.0.0.0:22           sshd
    tcp   LISTEN 0      128    0.0.0.0:389          slapd
    tcp   LISTEN 0      128    0.0.0.0:2049         nfsd
    ```

    ??? question "Auto-avaluació"

        **1.** Actives `ufw` però SSSD dels clients no pot connectar al servidor LDAP. El port 389 no estava a les regles de ufw. Quin missatge d'error pots esperar als clients i com ho soluciones?

        ??? success "Resposta"
            Al client, `getent passwd` retorna buit i `journalctl -u sssd` mostra errors com `Connection refused` o `LDAP server is not reachable`. La solució és obrir el port al servidor: `sudo ufw allow ldap` (equivalent a `sudo ufw allow 389/tcp`). Comprova amb `sudo ufw status` que la regla s'ha afegit, i reinicia SSSD al client: `sudo systemctl restart sssd`.

        **2.** Per quin motiu és important obrir el port `111/tcp` i `111/udp` a més del `2049` per a NFS?

        ??? success "Resposta"
            El port 111 és el **rpcbind** (*Remote Procedure Call binder*). NFS usa RPC per comunicar-se, i rpcbind actua com a "directori de serveis": el client primer contacta el rpcbind del servidor (port 111) per preguntar quin port usa NFS realment. Si el port 111 està bloquejat, el client no pot descobrir el servei NFS i la connexió falla, fins i tot si el port 2049 és accessible. En NFS4 (la versió moderna), rpcbind és menys crític, però per compatibilitat és recomanable obrir-lo.

        **3.** Quina és la política per defecte de `ufw` quan s'activa (`ufw enable`)? Per quin motiu és aquesta política i no la contrària?

        ??? success "Resposta"
            La política per defecte és **denegar tot el tràfic entrant** (`deny incoming`) i **permetre tot el tràfic sortint** (`allow outgoing`). Això segueix el principi de **menor privilegi**: un servidor nou comença bloquejant-ho tot i l'administrador obre explícitament els ports que necessita. La política contrària (permetre-ho tot per defecte) seria un risc de seguretat: qualsevol servei que s'instal·li al servidor (fins i tot accidentalment) quedaria accessible des de la xarxa sense que l'administrador en fos conscient.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 2.7 · Configura el firewall del servidor

    **Objectiu**: obrir únicament els ports necessaris per al laboratori UT2.

    **Temps estimat**: 15 minuts

    ---

    ### Part A – Configura les regles

    ```bash
    # Assegura't de tenir la regla SSH activa PRIMER
    sudo ufw allow ssh

    # Ports LDAP i NFS
    sudo ufw allow ldap
    sudo ufw allow 2049/tcp
    sudo ufw allow 111/tcp
    sudo ufw allow 111/udp

    # Activa el firewall
    sudo ufw enable

    # Verifica
    sudo ufw status verbose
    ```

    ### Part B – Test de connectivitat

    Des del PC client (o des d'una altra MV):
    ```bash
    # Comprova que el port SSH és accessible
    nc -zv 192.168.100.10 22

    # Comprova que el port LDAP és accessible
    nc -zv 192.168.100.10 389
    ```

    (`nc` = netcat, pot ser que calgui instal·lar-lo: `sudo apt install netcat`)

    Anota si cada port és accessible o `Connection refused`.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"ufw firewall Ubuntu tutorial allow deny rules"`
        - `"Ubuntu Server firewall setup ufw beginner guide"`
        - `"ufw allow port Ubuntu LDAP NFS SSH"`
