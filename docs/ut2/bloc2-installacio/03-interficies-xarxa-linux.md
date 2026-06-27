---
title: Interfícies de xarxa en Linux
tags:
  - ut2
  - linux
  - xarxa
---

# :material-ethernet: Interfícies de xarxa en Linux

!!! abstract "Concepte clau"
    A Linux, les interfícies de xarxa s'anomenen `enp0s3`, `enp0s8`, `eth0`... en funció del maquinari. Les eines `ip link` i `ip a` (del paquet `iproute2`) permeten consultar el seu estat i configuració. Conèixer-les és el primer pas per configurar la xarxa del servidor.

=== ":material-notebook-outline: Apunts"

    ## Nomenclatura de les interfícies

    Des d'Ubuntu 15.10, Linux usa la nomenclatura **Predictable Network Interface Names** (noms previsibles):

    | Format | Exemples | Significa |
    |--------|---------|-----------|
    | `en` + `p` + `N` + `s` + `N` | `enp0s3`, `enp0s8` | Ethernet, bus PCI, ranura |
    | `eth0`, `eth1` | (format antic) | Ethernet genèric |
    | `lo` | `lo` | Loopback (127.0.0.1) |
    | `wl` + ... | `wlp2s0` | Wireless (Wi-Fi) |

    Al laboratori VirtualBox, les dues interfícies solen ser `enp0s3` i `enp0s8`, però **comprova sempre el nom real** amb `ip link` al teu sistema.

    ## Eines principals de xarxa

    ### `ip link` — estat de les interfícies

    ```bash
    ip link
    ```

    Sortida típica:

    ```text
    1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN
        link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    2: enp0s3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP
        link/ether 08:00:27:ab:cd:ef brd ff:ff:ff:ff:ff:ff
    3: enp0s8: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP
        link/ether 08:00:27:12:34:56 brd ff:ff:ff:ff:ff:ff
    ```

    Fixat en `state UP` (interfície activa) vs `state DOWN` (interfície inactiva).

    ### `ip a` — adreces IP actuals

    ```bash
    ip a
    # Forma abreviada de: ip address show
    ```

    ```text
    2: enp0s3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP
        inet 10.0.2.15/24 brd 10.0.2.255 scope global dynamic enp0s3
    3: enp0s8: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP
        inet 192.168.100.10/24 brd 192.168.100.255 scope global enp0s8
    ```

    La clau és el camp `inet`: adreça IP i màscara en format CIDR (`/24` = `255.255.255.0`).

    ### `ip route` — taula d'encaminament

    ```bash
    ip route
    ```

    ```text
    default via 10.0.2.2 dev enp0s3 proto dhcp
    10.0.2.0/24 dev enp0s3 proto kernel
    192.168.100.0/24 dev enp0s8 proto kernel
    ```

    La ruta `default` indica per on surten els paquets cap a Internet (la porta d'enllaç, gateway).

    ## Comparativa d'eines de xarxa

    | Eina moderna (recomanada) | Eina antiga (obsoleta) | Funció |
    |--------------------------|----------------------|--------|
    | `ip link` | `ifconfig` | Llistar interfícies |
    | `ip a` | `ifconfig -a` | Veure adreces IP |
    | `ip route` | `route -n` | Taula d'encaminament |
    | `ss -tulpn` | `netstat -tulpn` | Ports oberts |
    | `ip link set enp0s8 up` | `ifconfig enp0s8 up` | Activar interfície |

    !!! warning "No uses `ifconfig` ni `netstat` en Ubuntu 24.04"
        Aquestes eines formen part del paquet `net-tools`, que **no s'instal·la per defecte** a Ubuntu 24.04. Si les tries, obtindràs `command not found`. Usa sempre les eines del paquet `iproute2` (`ip`, `ss`), que sí que venen instal·lades.

    ## Verificació de connectivitat

    ```bash
    # Ping a la porta d'enllaç (comprova xarxa local)
    ping -c 4 10.0.2.2

    # Ping a Internet (comprova resolució DNS + connectivitat)
    ping -c 4 8.8.8.8

    # Resolució DNS
    nslookup google.com
    # o bé:
    dig google.com +short
    ```

    ??? question "Auto-avaluació"

        **1.** Executes `ip a` i veus que `enp0s8` té `state UP` però no té cap adreça `inet`. Quin és el problema i com el resoldreus?

        ??? success "Resposta"
            La interfície `enp0s8` està activa a nivell físic (cable connectat, porta encesa), però **no té adreça IP assignada**. Pot ser que netplan no l'hagi configurat, que el fitxer YAML tingui un error de sintaxi, o que el servei `systemd-networkd` no hagi aplicat la configuració. Solució: revisa el fitxer de configuració netplan a `/etc/netplan/*.yaml`, corregeix errors si n'hi ha, i aplica amb `sudo netplan apply`. Torna a comprovar amb `ip a`.

        **2.** Quin és l'equivalent de `ip route` per veure la porta d'enllaç predeterminada, i per quin motiu és important per al servidor de laboratori?

        ??? success "Resposta"
            `ip route` mostra la taula d'encaminament, inclosa la ruta `default via X.X.X.X dev enp0s3`. La porta d'enllaç és important perquè defineix per on surten els paquets destinats a xarxes que el servidor no coneix directament. Al laboratori, la interfície `enp0s3` (NAT) té la porta d'enllaç cap a Internet (per instal·lar paquets via `apt`), mentre que `enp0s8` (xarxa interna) no té porta d'enllaç perquè és una xarxa tancada.

        **3.** Per quin motiu Ubuntu 24.04 LTS no inclou `ifconfig` per defecte, si durant anys ha sigut l'eina estàndard de Linux?

        ??? success "Resposta"
            `ifconfig` forma part del paquet `net-tools`, que porta anys sense manteniment actiu (el darrer commit significatiu va ser el 2001). Les eines del paquet `iproute2` (`ip`, `ss`, `tc`...) suporten protocols moderns com **IPv6**, **VLANs**, **tunnels** i **policy routing** que `ifconfig` no pot gestionar. Ubuntu va decidir no instal·lar-lo per defecte a partir de la versió 17.10 per empènyer els administradors a aprendre les eines modernes. Es pot instal·lar amb `sudo apt install net-tools`, però no es recomana.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 2.1 · Explorar les interfícies de xarxa del servidor

    **Objectiu**: identificar les interfícies de xarxa disponibles i el seu estat.

    **Temps estimat**: 15 minuts

    **Prerequisit**: Ubuntu Server instal·lat amb dues interfícies de xarxa a VirtualBox

    ---

    ### Part A – Inventari de xarxa

    Executa les ordres i completa la taula:

    ```bash
    ip link
    ip a
    ip route
    ```

    | Interfície | Estat (`UP`/`DOWN`) | Adreça IP | Màscara | Observacions |
    |-----------|-------------------|-----------|---------|--------------|
    | `lo` | | 127.0.0.1 | /8 | Loopback |
    | `enp0s3` | | | | |
    | `enp0s8` | | | | |

    ### Part B – Connectivitat

    ```bash
    # Comprova accés a Internet via enp0s3 (NAT)
    ping -c 3 8.8.8.8

    # Comprova resolució de noms
    ping -c 3 google.com
    ```

    Internet és accessible? Si no, anota el missatge d'error.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"ip command Linux networking tutorial ip addr ip route"`
        - `"Linux network interfaces explained enp0s3 eth0 Ubuntu"`
        - `"iproute2 vs net-tools ifconfig Linux modern"`
