---
title: Sincronització horària amb chrony
tags:
  - ut2
  - linux
  - ntp
  - chrony
---

# :material-clock-sync: Sincronització horària amb chrony

!!! abstract "Concepte clau"
    La sincronització horària és **obligatòria** en un servidor que gestiona autenticació. Si l'hora del servidor difereix en més d'uns pocs minuts de la dels clients, LDAP i SSSD deneguen les autenticacions per motius de seguretat. `chrony` és el client NTP per defecte a Ubuntu 24.04.

=== ":material-notebook-outline: Apunts"

    ## Per quin motiu és tan important l'hora?

    Els protocols d'autenticació moderns (Kerberos, LDAP TLS) usen **timestamps** (marques de temps) en els tokens d'autenticació per prevenir atacs de reutilització. Si el rellotge del servidor i el del client difereixen en massa, el servidor considera que el token ha caducat i denegat l'accés.

    A la UT1, vam veure que el **clock skew màxim de Kerberos és de 5 minuts**. A Linux amb SSSD + LDAP, la restricció és similar.

    ## Verificació i configuració de la zona horària

    ```bash
    # Veure la configuració horària actual
    timedatectl

    # Llistar zones horàries disponibles (filtra per Europa)
    timedatectl list-timezones | grep Europe

    # Establir la zona horària correcta
    sudo timedatectl set-timezone Europe/Madrid
    ```

    Sortida de `timedatectl`:
    ```text
    Local time: Fri 2026-06-27 10:30:15 CEST
    Universal time: Fri 2026-06-27 08:30:15 UTC
    RTC time: Fri 2026-06-27 08:30:15
    Time zone: Europe/Madrid (CEST, +0200)
    System clock synchronized: yes
    NTP service: active
    ```

    ## Instal·lació i configuració de chrony

    ```bash
    # Instal·la chrony (normalment ja instal·lat a Ubuntu Server)
    sudo apt install -y chrony

    # Habilita i arrenca el servei
    sudo systemctl enable --now chrony

    # Comprova l'estat de la sincronització
    chronyc tracking
    ```

    Sortida de `chronyc tracking`:
    ```text
    Reference ID    : 51 46 7B A9 (ntp.example.com)
    Stratum         : 3
    Ref time (UTC)  : Fri Jun 27 08:30:14 2026
    System time     : 0.000002345 seconds fast of NTP time
    Last offset     : -0.000001234 seconds
    RMS offset      : 0.000004567 seconds
    Frequency       : 2.345 ppm fast
    Residual freq   : -0.001 ppm
    Skew            : 0.123 ppm
    Root delay      : 0.023456789 seconds
    Root dispersion : 0.000456789 seconds
    Update interval : 64.2 seconds
    Leap status     : Normal
    ```

    El valor clau és `System time`: la desviació respecte al temps NTP real. Ha de ser inferior a uns pocs milisegons.

    ## Verificació dels servidors NTP

    ```bash
    # Veure els servidors NTP configurats i el seu estat
    chronyc sources -v
    ```

    Sortida:
    ```text
    .-- Source mode (^ = server, = = peer, # = local clock)
    / .-- Source state (* = current best, + = combined, - = not combined)
    | / .- Last sample
    |/ /
    MS Name/IP address    Stratum Poll Reach LastRx Last sample
    ==================================================================
    ^* 162.159.200.1       3   6  377    21  +0.345ms[+0.234ms] +/- 4ms
    ```

    L'asterisc `*` indica el servidor NTP actiu.

    ## Configuració del fitxer chrony.conf

    ```bash
    sudo nano /etc/chrony/chrony.conf
    ```

    Configuració bàsica per al laboratori:
    ```text
    # Servidors NTP públics (Ubuntu usa el pool d'Ubuntu per defecte)
    pool ntp.ubuntu.com iburst

    # Permet que la VirtualBox sincronitzi el rellotge del amfitrió
    # (alternativa quan no hi ha Internet)
    # server 10.0.2.2 iburst
    ```

    !!! tip "A VirtualBox sense Internet"
        Si el servidor Ubuntu no té accés a Internet (xarxa completament tancada), pots usar `10.0.2.2` (la porta d'enllaç NAT de VirtualBox) com a servidor NTP — VirtualBox actua com a passarel·la horària cap al rellotge del sistema amfitrió (el teu PC).

    ??? question "Auto-avaluació"

        **1.** `chronyc tracking` mostra `System time: 0.543210 seconds fast of NTP time`. Indica si hi ha un problema i per quin motiu.

        ??? success "Resposta"
            Una desviació de **0,54 segons** és acceptable per a LDAP (la restricció és de l'ordre de minuts, no milisegons). `chrony` la corregirà gradualment sense saltar l'hora. El problema seria si la desviació fos de **5 minuts o més**, on Kerberos denegaria les autenticacions. Per forçar una sincronització immediata: `sudo chronyc makestep`.

        **2.** Per quin motiu a la UT1 vam haver de sincronitzar l'hora del DC i dels clients Windows amb el mateix servidor NTP, i aquí hem de fer el mateix per al servidor Linux?

        ??? success "Resposta"
            És el mateix principi: Kerberos (a Windows) i LDAP+SSSD (a Linux) usen timestamps en els tokens d'autenticació. Si el servidor i el client difereixen en l'hora en més del threshold permès (5 minuts per a Kerberos, valors similars per a LDAP), el servidor rebutja el token perquè considera que podria ser una reproducció d'un token antic (atac de *replay*). La sincronització NTP garanteix que tots els actors parlen del "mateix moment" i els tokens no es considera que hagin caducat.

        **3.** Quin és l'equivalent de `chrony` a Windows Server i on es configura?

        ??? success "Resposta"
            L'equivalent és el servei **Windows Time (W32Time)**, que a la UT1 vam veure que s'activa automàticament quan el servidor es promou a DC. Es configura via `w32tm /config` o via GPO (`Configuració d'equip → Plantilles administratives → Sistema → Servei d'hora de Windows`). Al domini Windows, el DC Primary Domain Controller Emulator (PDCE) és l'autoritat de temps per a tot el domini i sincronitza el seu rellotge amb un servidor NTP extern.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 2.6 · Configura la sincronització horària

    **Objectiu**: assegurar que el servidor Ubuntu usa la zona horària correcta i l'hora sincronitzada.

    **Temps estimat**: 10 minuts

    ---

    ### Part A – Zona horària

    ```bash
    timedatectl
    sudo timedatectl set-timezone Europe/Madrid
    timedatectl
    ```

    La zona horària és ara `Europe/Madrid (CEST, +0200)`?

    ### Part B – Verifica la sincronització NTP

    ```bash
    systemctl status chrony
    chronyc tracking
    chronyc sources
    ```

    El camp `System clock synchronized` de `timedatectl` és `yes`?

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"chrony NTP Ubuntu Server time synchronization"`
        - `"timedatectl timezone Ubuntu Linux configure"`
        - `"NTP time synchronization why important Linux server"`
