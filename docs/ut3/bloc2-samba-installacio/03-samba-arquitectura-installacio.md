---
title: Samba – Arquitectura i instal·lació
tags:
  - ut3
  - samba
---

# :material-server: Samba – Arquitectura i instal·lació

!!! abstract "Concepte clau"
    **Samba** implementa el protocol SMB a Linux. El dimoni `smbd` gestiona les connexions de fitxers i autenticació; `nmbd` resol noms NetBIOS. La instal·lació és via `apt install samba` i el servei escolta al port **445**.

=== ":material-notebook-outline: Apunts"

    ## Arquitectura de Samba

    Samba consta de dos dimonis principals que treballen en paral·lel:

    | Dimoni | Funció | Port |
    |--------|--------|------|
    | `smbd` | Connexions de fitxers, autenticació, permisos | 445, 139 |
    | `nmbd` | Resolució de noms NetBIOS, navegació de xarxa | 137 UDP, 138 UDP |

    ```mermaid
    graph LR
        C["Client Windows/Linux"] -->|"SMB · port 445"| smbd["smbd\n(fitxers + auth)"]
        C -->|"NetBIOS · port 137-138"| nmbd["nmbd\n(noms de xarxa)"]
        smbd --> FS["Sistema de fitxers\n/srv/samba/..."]
        smbd --> DB["Base de dades\npassdb (tdbsam)"]
        subgraph "Ubuntu Server"
            smbd
            nmbd
            FS
            DB
        end
    ```

    ## Instal·lació

    ```bash
    sudo apt update
    sudo apt install samba -y
    ```

    Verificació que els serveis s'han iniciat:

    ```bash
    sudo systemctl status smbd
    sudo systemctl status nmbd
    ```

    Habilitar l'inici automàtic:

    ```bash
    sudo systemctl enable smbd nmbd
    ```

    ## Verificació del port

    ```bash
    ss -tulnp | grep smbd
    ```

    Sortida esperada:

    ```text
    tcp   LISTEN  0  50  0.0.0.0:445  0.0.0.0:*  users:(("smbd",pid=1234,...))
    ```

    ## Estructura de directoris Samba

    Per convenció, els recursos Samba es creen a `/srv/samba/`:

    ```bash
    sudo mkdir -p /srv/samba/public
    sudo mkdir -p /srv/samba/privat
    sudo mkdir -p /srv/samba/alumnes
    ```

    !!! tip "Connexió amb UT1"
        A Windows Server, les carpetes compartides es gestionen des del *Server Manager* o amb `New-SmbShare`. A Ubuntu, la configuració és manual via `/etc/samba/smb.conf`. Tant un com l'altre gestionen permisos a dos nivells: permisos del recurs compartit + permisos del sistema de fitxers.

    ## Firewall

    Si UFW està actiu, cal permetre Samba:

    ```bash
    sudo ufw allow samba
    sudo ufw status
    ```

    Això obre els ports 137, 138 (UDP) i 139, 445 (TCP).

    !!! warning "Error freqüent"
        Instal·lar Samba però no habilitar el servei amb `systemctl enable`. Després d'un reinici, Samba no arrenca i els clients veuen "No s'ha trobat el servidor". Comprova sempre `systemctl is-enabled smbd`.

    ??? question "Auto-avaluació"
        **1.** Quin dimoni de Samba gestiona les connexions de fitxers?

        ??? success "Resposta"
            `smbd`. És el dimoni principal de Samba, responsable de gestionar les connexions dels clients SMB, l'autenticació i l'accés als fitxers. `nmbd` s'ocupa únicament de la resolució de noms NetBIOS.

        **2.** En quin port escolta Samba per a les connexions SMB directes?

        ??? success "Resposta"
            El **port 445** (SMB directe). El port 139 correspon a SMB sobre NetBIOS, que és un mètode antic que molts sistemes moderns ja no requereixen.

        **3.** Quina ordre permet verificar si el dimoni `smbd` s'ha iniciat correctament?

        ??? success "Resposta"
            `sudo systemctl status smbd`. També es pot usar `ss -tulnp | grep smbd` per verificar que escolta al port 445, o `smbclient -L localhost -N` per provar la connexió localment.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.3 · Instal·lació de Samba

    **Objectiu**: instal·lar Samba al servidor Ubuntu i verificar que els dimonis s'han iniciat correctament.
    **Temps estimat**: 20 minuts
    **Prerequisit**: Ubuntu Server 24.04 LTS amb accés SSH

    ---

    ### Pas 1 – Actualitza i instal·la Samba

    ```bash
    sudo apt update && sudo apt install samba -y
    ```

    Documenta la versió instal·lada: `samba --version`

    ### Pas 2 – Verifica els dimonis

    ```bash
    sudo systemctl status smbd nmbd
    ```

    Confirma que tots dos dimonis estan `active (running)`.

    ### Pas 3 – Habilita l'inici automàtic

    ```bash
    sudo systemctl enable smbd nmbd
    ```

    ### Pas 4 – Crea l'estructura de directoris

    ```bash
    sudo mkdir -p /srv/samba/{public,privat,alumnes}
    ls -la /srv/samba/
    ```

    ### Pas 5 – Configura el firewall

    ```bash
    sudo ufw allow samba
    sudo ufw status verbose
    ```

    Captura la sortida i verifica que els ports 137, 138, 139 i 445 apareixen com a permesos.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Install Samba Ubuntu 24.04 file server"`
        - `"Samba smbd nmbd explained"`
        - `"Ubuntu Samba setup step by step 2024"`
