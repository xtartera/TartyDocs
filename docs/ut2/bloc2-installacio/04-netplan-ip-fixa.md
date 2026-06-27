---
title: "netplan: configuració d'IP fixa"
tags:
  - ut2
  - linux
  - xarxa
  - netplan
---

# :material-ip-network: netplan: configuració d'IP fixa

!!! abstract "Concepte clau"
    **netplan** és la capa d'abstracció de xarxa que usa Ubuntu des de la versió 17.10. La configuració es fa en fitxers **YAML** a `/etc/netplan/`. Un error de sintaxi YAML (espais mal posats, guions incorrectes) impedeix que la xarxa arrenqui. La IP fixa de `enp0s8` és el prerequisit de **tot** el que ve després.

=== ":material-notebook-outline: Apunts"

    ## Arquitectura de netplan

    ```mermaid
    graph LR
        YAML["/etc/netplan/\n*.yaml\n(configuració)"]
        NP["netplan apply"]
        SND["systemd-networkd\n(backend servidor)"]
        NM["NetworkManager\n(backend escriptori)"]

        YAML --> NP --> SND
        NP --> NM
    ```

    Ubuntu Server usa `systemd-networkd` com a backend. Ubuntu Desktop usa `NetworkManager`. La mateixa sintaxi YAML funciona per als dos.

    ## Fitxer de configuració del laboratori

    A Ubuntu 24.04, el fitxer de netplan es troba normalment a:
    ```
    /etc/netplan/50-cloud-init.yaml
    ```
    o pot tenir un nom diferent com `01-netcfg.yaml`. Comprova el nom exacte amb:
    ```bash
    ls /etc/netplan/
    ```

    ### Configuració per al laboratori UT2

    ```yaml
    network:
      version: 2
      renderer: networkd
      ethernets:
        enp0s3:
          dhcp4: true          # NAT — Internet (adreça automàtica)
        enp0s8:
          dhcp4: false         # Xarxa interna — IP fixa
          addresses:
            - 192.168.100.10/24
          nameservers:
            addresses:
              - 8.8.8.8
              - 1.1.1.1
    ```

    !!! danger "Sintaxi YAML: els espais SÓN importants"
        YAML usa **espais** (mai tabuladors) per a la indentació. Un nivell = 2 espais. Si uses un tabulador o un nombre incorrecte d'espais, netplan retornarà un error críptic. Usa un editor que mostri els espais (com `nano` amb `set tabsize 2`).

    ## Aplicar la configuració

    ```bash
    # Valida la sintaxi YAML sense aplicar (comprova errors)
    sudo netplan generate

    # Aplica la configuració (reinicia les interfícies afectades)
    sudo netplan apply

    # Verifica que la IP s'ha assignat
    ip a show enp0s8
    ```

    Sortida esperada després de `netplan apply`:
    ```text
    3: enp0s8: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
        inet 192.168.100.10/24 brd 192.168.100.255 scope global enp0s8
    ```

    ## Editar el fitxer netplan de manera segura

    ```bash
    # Edita el fitxer (substitueix el nom exacte del teu)
    sudo nano /etc/netplan/50-cloud-init.yaml
    ```

    Desa (`Ctrl+O`, `Enter`) i surt (`Ctrl+X`).

    Aplica i verifica:
    ```bash
    sudo netplan apply
    ip a
    ping -c 2 192.168.100.10   # Ping a tu mateix
    ```

    ## Errors freqüents

    | Error | Causa | Solució |
    |-------|-------|---------|
    | `Invalid YAML` o `mapping values are not allowed` | Tabuladors en lloc d'espais | Substitueix tots els `Tab` per espais |
    | `enp0s8` no apareix al fitxer | Nom incorrecte de la interfície | Comprova el nom real amb `ip link` |
    | La IP no s'aplica però no hi ha errors | `renderer: networkd` no actiu | `sudo systemctl enable --now systemd-networkd` |
    | No es pot editar el fitxer | El fitxer pertany a `cloud-init` | Deshabilita cloud-init o crea un fitxer nou |

    ### Deshabilitar cloud-init per a la configuració de xarxa

    Si Ubuntu va ser instal·lat amb cloud-init (màquines al núvol o certes ISOs), el fitxer de netplan és generat automàticament i els canvis manuals es sobreescriuen. Desactiva-ho:

    ```bash
    # Crea el fitxer que indica a cloud-init que no gestioni la xarxa
    sudo bash -c 'echo "network: {config: disabled}" > /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg'
    ```

    Ara pots editar lliurement `/etc/netplan/*.yaml`.

    ??? question "Auto-avaluació"

        **1.** Apliques `netplan apply` i obtens l'error `Error in network definition`. Com identifiques exactament on és l'error al fitxer YAML?

        ??? success "Resposta"
            L'error de `netplan apply` normalment inclou el número de línia i la columna on ha detectat el problema (ex: `line 7, column 4`). Pots usar `sudo netplan generate` per obtenir el missatge complet. A més, pots validar el fitxer YAML amb `python3 -c "import yaml; yaml.safe_load(open('/etc/netplan/50-cloud-init.yaml'))"` que mostra exactament on falla la sintaxi YAML. El motiu més habitual és un tabulador en lloc d'espais o una indentació incorrecta.

        **2.** Per quin motiu poses la IP `192.168.100.10/24` a `enp0s8` en lloc de a `enp0s3`? Explica el rol de cadascuna al laboratori.

        ??? success "Resposta"
            `enp0s3` (Adaptador 1, NAT) és la connexió del servidor cap a Internet via VirtualBox. Funciona en mode NAT, la IP la dona VirtualBox automàticament (normalment `10.0.2.15`). Aquesta interfície permet instal·lar paquets amb `apt`, però els clients de la xarxa interna **no hi accedeixen**. `enp0s8` (Adaptador 2, Xarxa interna) és la connexió cap als clients Ubuntu. Li posem una IP fixa (`192.168.100.10`) perquè els clients LDAP, NFS i autofs necessiten una adreça estable i coneguda per configurar els seus fitxers de client. Si la IP canviés (per DHCP), tots els clients deixarien de funcionar.

        **3.** Quina és la diferència entre `netplan apply` i reiniciar el sistema (`reboot`) per aplicar canvis de xarxa?

        ??? success "Resposta"
            `netplan apply` aplica els canvis de xarxa **sense reiniciar**, de manera no disruptiva: atura i reinicia únicament les interfícies afectades pels canvis. Això és fonamental en un servidor de producció on no pots permetre't aturar els serveis actius. `reboot` reinicia tot el sistema, cosa que atura tots els serveis, sessions SSH i connexions. Per als canvis de xarxa a Ubuntu Server, sempre s'usa `netplan apply` (o `systemctl restart systemd-networkd`), mai `reboot`.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 2.2 · Configura la IP fixa del servidor

    **Objectiu**: assignar l'adreça `192.168.100.10/24` a la interfície de xarxa interna.

    **Temps estimat**: 20 minuts

    **Prerequisit**: Ubuntu Server amb dues interfícies de xarxa a VirtualBox (NAT + Xarxa interna)

    ---

    ### Part A – Identifica les interfícies

    ```bash
    ip link
    ```

    Anota el nom de les dues interfícies (no assumeixis que són `enp0s3` i `enp0s8`):
    - Interfície 1 (NAT, connectada a Internet): ___________
    - Interfície 2 (Xarxa interna, per a clients): ___________

    ### Part B – Edita la configuració netplan

    ```bash
    ls /etc/netplan/
    sudo nano /etc/netplan/[NOM-DEL-FITXER].yaml
    ```

    Escriu la configuració de la secció d'Apunts (substituint `enp0s3`/`enp0s8` pels noms reals).

    ### Part C – Aplica i verifica

    ```bash
    sudo netplan apply
    ip a
    ```

    Comprova:
    - [ ] `enp0s3` (o el nom equivalent) té una IP de la xarxa `10.0.2.x` (NAT)
    - [ ] `enp0s8` (o el nom equivalent) té exactament `192.168.100.10/24`
    - [ ] `ping -c 2 8.8.8.8` funciona (Internet accessible via enp0s3)

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"netplan Ubuntu Server static IP configuration 24.04"`
        - `"Ubuntu Server 22.04 24.04 static IP netplan yaml"`
        - `"netplan apply troubleshooting Ubuntu"`
