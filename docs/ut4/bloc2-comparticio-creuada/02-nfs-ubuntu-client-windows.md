---
title: NFS · Ubuntu servidor → Windows client
tags:
  - ut4
  - nfs
  - ubuntu
  - windows
---

# :material-linux: NFS · Ubuntu com a servidor → Windows com a client

!!! abstract "Concepte clau"
    Ubuntu actua com a **servidor NFS** exportant carpetes via `/etc/exports`. Windows 10/11 i Windows Server inclouen un **client NFS natiu** (*Client for NFS*) que permet muntar-les com a unitats de xarxa, sense instal·lar software de tercers.

=== ":material-notebook-outline: Apunts"

    ## Instal·lació del servidor NFS a Ubuntu

    ```bash
    sudo apt update
    sudo apt install nfs-kernel-server -y

    # Comprova que el servei ha arrencat
    sudo systemctl status nfs-kernel-server
    sudo systemctl enable nfs-kernel-server
    ```

    ## Configuració de les exportacions: /etc/exports

    ```bash
    # Crea la carpeta a exportar
    sudo mkdir -p /srv/nfs/compartit
    sudo chown nobody:nogroup /srv/nfs/compartit
    sudo chmod 777 /srv/nfs/compartit

    # Edita el fitxer d'exports
    sudo nano /etc/exports
    ```

    Contingut de `/etc/exports`:

    ```
    # Sintaxi: ruta  xarxa/màscara(opcions)

    # Exporta per a tota la subxarxa 192.168.1.0/24
    /srv/nfs/compartit  192.168.1.0/24(rw,sync,no_subtree_check,no_root_squash)
    ```

    | Opció | Significat |
    |-------|-----------|
    | `rw` | Lectura i escriptura |
    | `sync` | Escriure al disc abans de confirmar al client |
    | `no_subtree_check` | Millora el rendiment, evita problemes amb fitxers moguts |
    | `no_root_squash` | L'usuari root del client manté privilegis root al servidor |
    | `root_squash` | (alternativa) Root del client → `nobody` al servidor (més segur) |

    ```bash
    # Aplica els canvis sense reiniciar
    sudo exportfs -ra

    # Verifica les exportacions actives
    sudo exportfs -v
    ```

    ## Instal·lació del client NFS a Windows

    ### Windows 10/11 Pro i Enterprise

    ```
    Configuració → Aplicacions → Funcions opcionals → Afegir una funció
    → Cerca: "Client for NFS" → Instal·la
    ```

    O amb PowerShell (com a Administrador):

    ```powershell
    Enable-WindowsOptionalFeature -Online -FeatureName ServicesForNFS-ClientOnly -All
    # Reinicia si és necessari
    ```

    ### Windows Server 2022

    ```powershell
    Install-WindowsFeature NFS-Client
    ```

    ## Muntar el recurs NFS des de Windows

    ```cmd
    :: Muntatge temporal (des de cmd com a Administrador)
    mount \\192.168.1.20\srv\nfs\compartit Z:

    :: Alternativa amb la barra de l'explorador:
    :: \\192.168.1.20\srv\nfs\compartit
    ```

    O amb PowerShell:

    ```powershell
    # Muntatge com a unitat de xarxa
    New-PSDrive -Name "Z" -PSProvider FileSystem `
                -Root "\\192.168.1.20\srv\nfs\compartit" `
                -Persist

    # Verifica
    Get-PSDrive Z
    dir Z:\
    ```

    ## Muntatge permanent a Windows

    Per fer el muntatge persistent entre reinicis:

    ```cmd
    :: Usa la lletra d'unitat i l'opció /persistent:yes
    mount -o anon \\192.168.1.20\srv\nfs\compartit Z:
    ```

    O via GUI: **Explorador → Aquest equip → Connecta a una unitat de xarxa** → introdueix `\\192.168.1.20\srv\nfs\compartit`.

    ## Verificació des del servidor Ubuntu

    ```bash
    # Comprova les connexions NFS actives
    sudo showmount -a

    # Comprova qui ha muntat els recursos
    cat /proc/fs/nfsd/clients 2>/dev/null || nfsstat -m

    # Verifica les exportacions actives
    showmount -e localhost
    ```

    ## Tall de foc (UFW)

    ```bash
    # Permet NFS (port 2049)
    sudo ufw allow from 192.168.1.0/24 to any port 2049
    sudo ufw allow from 192.168.1.0/24 to any port 111

    sudo ufw reload
    sudo ufw status
    ```

    !!! warning "UID/GID i permisos entre sistemes"
        Els UID/GID de Linux i els SID de Windows no coincideixen. En mode `AUTH_SYS` (anònim), Windows accedeix com a UID `nobody` (-2 o 65534). Configura `no_root_squash` i permisos `chmod 777` al directori exportat per permetre escriptura des de Windows en entorns de laboratori. Per a producció, usa NFSv4 amb Kerberos.

    !!! tip "Usa showmount per diagnosticar"
        `showmount -e 192.168.1.20` des del client Windows (instal·lat el client NFS) o des d'Ubuntu permet veure les exportacions disponibles al servidor. Si no retorna res, comprova el firewall i el servei `nfs-kernel-server`.

    ??? question "Auto-avaluació"

        **1.** Quin fitxer de configuració controla les carpetes que Ubuntu exporta via NFS?

        ??? success "Resposta"
            `/etc/exports`. Cada línia defineix una exportació amb la sintaxi `ruta xarxa(opcions)`. Després de modificar-lo, cal aplicar els canvis amb `sudo exportfs -ra` (sense reiniciar el servei) o `sudo systemctl restart nfs-kernel-server`.

        **2.** Quina diferència hi ha entre `root_squash` i `no_root_squash` a `/etc/exports`?

        ??? success "Resposta"
            `root_squash` (opció per defecte) transforma l'usuari root del client en `nobody` al servidor, impedint que un client root tingui privilegis al servidor NFS. `no_root_squash` permet que el root del client actuï com a root al servidor, útil per a muntatges de sistemes o laboratoris, però perillós en producció perquè qualsevol client amb accés root pot modificar qualsevol fitxer del recurs.

        **3.** Quina ordre Windows (cmd) munta el recurs NFS `\\192.168.1.20\srv\nfs\compartit` com a unitat `Z:`?

        ??? success "Resposta"
            `mount \\192.168.1.20\srv\nfs\compartit Z:`. Requereix que el **Client for NFS** estigui instal·lat i que s'executi des d'una consola amb permisos d'Administrador. Alternativament, des de PowerShell: `New-PSDrive -Name "Z" -PSProvider FileSystem -Root "\\192.168.1.20\srv\nfs\compartit" -Persist`.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.B2 · NFS Ubuntu servidor → Windows client

    **Objectiu**: publicar una carpeta des d'Ubuntu via NFS i muntar-la des de Windows.
    **Temps estimat**: 45 minuts

    ---

    ### Pas 1 – Configura el servidor NFS a Ubuntu

    ```bash
    sudo apt install nfs-kernel-server -y
    sudo mkdir -p /srv/nfs/compartit
    sudo chown nobody:nogroup /srv/nfs/compartit
    sudo chmod 777 /srv/nfs/compartit
    ```

    Afegeix a `/etc/exports`:
    ```
    /srv/nfs/compartit  192.168.1.0/24(rw,sync,no_subtree_check,no_root_squash)
    ```

    ```bash
    sudo exportfs -ra
    sudo showmount -e localhost
    ```

    ### Pas 2 – Instal·la el Client for NFS a Windows

    ```powershell
    Enable-WindowsOptionalFeature -Online -FeatureName ServicesForNFS-ClientOnly -All
    ```

    ### Pas 3 – Munta el recurs des de Windows

    ```cmd
    mount \\192.168.1.20\srv\nfs\compartit Z:
    dir Z:\
    ```

    ### Pas 4 – Verifica des del servidor Ubuntu

    ```bash
    sudo showmount -a
    ```

    Documenta quins clients han muntat el recurs.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Ubuntu NFS server Windows client mount"`
        - `"Client for NFS Windows 10 setup"`
        - `"/etc/exports NFS Linux configuration"`
