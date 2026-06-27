---
title: Arquitectura Ubuntu Server 24.04
tags:
  - ut2
  - linux
  - ubuntu
  - fonaments
---

# :material-server: Arquitectura Ubuntu Server 24.04 LTS

!!! abstract "Concepte clau"
    Ubuntu Server 24.04 LTS (*Noble Numbat*) és una distribució **headless** (sense GUI) optimitzada per a servidors. La sigla LTS (*Long-Term Support*) garanteix suport de seguretat i manteniment durant **5 anys** (fins a 2029), cosa que el fa adequat per a entorns de producció i laboratoris escolars.

=== ":material-notebook-outline: Apunts"

    ## Diagrama d'arquitectura del laboratori UT2

    ```mermaid
    graph TD
        subgraph VirtualBox["VirtualBox (amfitrió Windows 11)"]
            subgraph SRV["Ubuntu Server 24.04 LTS\n192.168.100.10/24"]
                LDAP["slapd\n(OpenLDAP)"]
                SSSD["sssd\n(auth daemon)"]
                NFS["nfs-kernel-server\n(exports /perfils)"]
                AUTO["autofs\n(muntatge dinàmic)"]
            end
            subgraph CLI1["Ubuntu Desktop / client 1\n192.168.100.20/24"]
                SSSD2["sssd-client"]
                MNT["Punt de muntatge\n/home/usuari → NFS"]
            end
        end

        SRV <-->|"Xarxa interna\nenp0s8"| CLI1
        SRV <-->|"NAT enp0s3\n(Internet)"| INT["Internet"]
    ```

    ## Característiques clau de la versió 24.04 LTS

    | Característica | Detall |
    |---------------|--------|
    | **Versió del kernel** | Linux 6.8 |
    | **Systemd** | 255.4 (gestió de serveis, logs) |
    | **Python** | 3.12 |
    | **OpenSSH** | 9.6p1 |
    | **Suport** | Fins a abril 2029 (5 anys) |
    | **Arquitectures** | x86_64, ARM64, RISC-V |
    | **Instal·lació mínima** | ~2 GB disc, 1 GB RAM |

    ## Estructura del sistema de fitxers Linux

    | Directori | Contingut | Equivalent Windows |
    |-----------|-----------|-------------------|
    | `/` | Arrel del sistema | `C:\` |
    | `/etc` | Fitxers de configuració | Registry + `C:\Windows\System32` |
    | `/var` | Dades variables (logs, bases de dades) | `C:\ProgramData` |
    | `/home` | Directoris d'usuari | `C:\Users` |
    | `/opt` | Programari de tercers | `C:\Program Files` |
    | `/usr` | Programes del sistema | `C:\Windows\System32` |
    | `/var/log` | Logs del sistema | Visor d'Esdeveniments |
    | `/tmp` | Fitxers temporals | `C:\Windows\Temp` |

    ## Gestió de serveis amb systemctl

    A Ubuntu, tots els serveis (LDAP, NFS, SSH, autofs...) es gestionen amb `systemctl`:

    ```bash
    # Estat d'un servei
    systemctl status slapd

    # Iniciar / aturar / reiniciar
    systemctl start slapd
    systemctl stop slapd
    systemctl restart slapd

    # Habilitar/deshabilitar a l'inici del sistema
    systemctl enable slapd
    systemctl disable slapd

    # Recarregar configuració sense reiniciar (quan és possible)
    systemctl reload slapd
    ```

    ## Consulta de logs amb journalctl

    ```bash
    # Tots els logs del sistema (des del darrer arrencar)
    journalctl -b

    # Logs d'un servei específic en temps real
    journalctl -u slapd -f

    # Logs de les últimes 2 hores
    journalctl --since "2 hours ago"

    # Logs d'error i superior
    journalctl -p err
    ```

    !!! tip "Equivalent al Visor d'Esdeveniments"
        `journalctl` és l'equivalent Linux al Visor d'Esdeveniments de Windows. La diferència és que `journalctl` agrupa **tots** els serveis en un sol lloc (el `systemd journal`), mentre que el Visor d'Esdeveniments separa per canals (Aplicació, Sistema, Seguretat...).

    ## Les dues interfícies de xarxa del laboratori

    Al laboratori, el servidor Ubuntu tindrà **dues interfícies de xarxa** VirtualBox:

    | Interfície | Nom Linux | Configuració | Funció |
    |-----------|-----------|-------------|--------|
    | Adaptador 1 | `enp0s3` | NAT (DHCP automàtic) | Accés a Internet (per instal·lar paquets) |
    | Adaptador 2 | `enp0s8` | Xarxa interna IP fixa `192.168.100.10/24` | Comunicació amb els clients |

    !!! warning "El nom de les interfícies pot variar"
        El nom `enp0s3` / `enp0s8` depèn del maquinari virtual. A la teva màquina pot ser `ens3`, `eth0` o un altre nom. Usa `ip link` per veure els noms reals de les teves interfícies abans de configurar netplan.

    ## Diferències entre Ubuntu 22.04, 24.04 i 26.04

    | Versió | LTS fins | Novetat rellevant per a UT2 |
    |--------|---------|----------------------------|
    | **22.04** (Jammy) | Abril 2027 | `pam_mkhomedir` crea el home automàticament en el primer login |
    | **24.04** (Noble) | Abril 2029 | autofs + NFS necessari per a perfils mòbils; `pam_mkhomedir` no és suficient |
    | **26.04** (futura) | — | Prevista l'abril 2026. Comportament esperat equivalent a 24.04 |

    Aquesta diferència entre 22.04 i 24.04 és important: el Projecte 26 és significativament més complex del que hauria estat amb Ubuntu 22.04. La pàgina [Perfils Ubuntu 22.04 vs 24.04](../bloc8-perfils-mobils/42-perfils-ubuntu22-vs-24.md) ho explica en detall.

    ??? question "Auto-avaluació"

        **1.** Quin és el directori equivalent a `C:\Users` en Ubuntu Server, i com és que en un servidor de laboratori sovint és buit o conté pocs directoris?

        ??? success "Resposta"
            El directori equivalent és **`/home`**. En un servidor Ubuntu amb perfils mòbils, `/home` pot estar buit o ser un punt de muntatge NFS perquè els directoris home dels usuaris LDAP **no s'emmagatzemen localment**: via autofs es munten des del servidor NFS quan l'usuari hi accedeix. Per als usuaris locals del sistema (no LDAP), sí que hi hauria carpetes a `/home`.

        **2.** Vols veure en temps real si el servei `slapd` (OpenLDAP) mostra errors mentre proves de crear un usuari LDAP. Quina ordre uses?

        ??? success "Resposta"
            ```bash
            journalctl -u slapd -f
            ```
            El paràmetre `-u slapd` filtra pel servei OpenLDAP i `-f` (*follow*) mostra les noves línies en temps real. És l'equivalent a mantenir el Visor d'Esdeveniments obert al canal corresponent mentre es reprodueix el problema.

        **3.** Quin és el motiu que Ubuntu Server usa `systemctl` per gestionar tots els serveis (slapd, nfs, autofs, sssd...) en lloc de scripts d'inici individuals com en versions antigues de Linux?

        ??? success "Resposta"
            **systemd** és el sistema d'inici i gestió de serveis que substitueix els antics scripts SysV (`/etc/init.d/`). Els avantatges principals per a l'administrador: (1) **arrencada paral·lela** dels serveis (més ràpid que l'arrencada seqüencial); (2) **gestió de dependències** (si `slapd` depèn de la xarxa, systemd ho gestiona sol); (3) **logs centralitzats** al journal (en lloc de fitxers dispersos); (4) **sintaxi unificada** per a tots els serveis amb `systemctl`. La transició va completar-se a Ubuntu 15.04 (2015).

=== ":material-pencil-ruler: Activitat"

    ## Activitat 1.2 · Primera exploració del servidor Ubuntu

    **Objectiu**: familiaritzar-se amb l'entorn Ubuntu Server i les ordres bàsiques d'exploració.

    **Temps estimat**: 25 minuts

    **Prerequisit**: Ubuntu Server 24.04 instal·lat i amb accés per SSH o consola

    ---

    ### Part A – Informació del sistema

    Executa les ordres següents i anota el resultat al teu dossier:

    ```bash
    # Versió del sistema operatiu
    lsb_release -a

    # Versió del kernel
    uname -r

    # Nom del host
    hostname

    # Ús de la memòria RAM
    free -h

    # Ús del disc
    df -h /

    # Temps d'activitat del servidor
    uptime
    ```

    ### Part B – Explorar el sistema de fitxers

    ```bash
    # Llista el contingut de l'arrel
    ls /

    # Llista els fitxers de configuració principals
    ls /etc/ | head -30

    # Veu quins serveis estan actius ara mateix
    systemctl list-units --type=service --state=running
    ```

    Quants serveis actius hi ha? Anota'n 5 que reconeixis.

    ### Part C – Gestió de serveis (prèvia a la instal·lació de LDAP)

    ```bash
    # Comprova l'estat del servei SSH (ha d'estar actiu)
    systemctl status ssh

    # Mira els últims logs del sistema
    journalctl -b --no-pager | tail -20
    ```

    El servei SSH està actiu (`active (running)`)? Si no, activa'l:
    ```bash
    sudo systemctl enable --now ssh
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Ubuntu Server 24.04 LTS installation guide step by step"`
        - `"Ubuntu Server filesystem structure explained beginners"`
        - `"systemctl systemd tutorial Ubuntu Server"`
        - `"journalctl log analysis Ubuntu Linux"`
