---
title: NFS · Windows Server 2022 com a servidor
tags:
  - ut4
  - nfs
  - windows-server
---

# :material-microsoft-windows: NFS · Windows Server 2022 com a servidor

!!! abstract "Concepte clau"
    **NFS** (*Network File System*) és el protocol Unix/Linux per compartir sistemes de fitxers en xarxa. Windows Server 2022 inclou un **servidor NFS natiu** (via la funció *Services for NFS*) que permet que clients Ubuntu muntin carpetes Windows directament sense Samba.

=== ":material-notebook-outline: Apunts"

    ## Per a què serveix NFS en un entorn heterogeni?

    NFS permet compartir carpetes entre sistemes operatius de manera transparent. En un entorn heterogeni:

    | Escenari | Protocol recomanat |
    |----------|-------------------|
    | Windows → Windows | SMB/CIFS |
    | Linux → Linux | NFS |
    | **Windows Server → Linux** | **NFS** (Server for NFS) |
    | Linux → Windows | NFS (Client for NFS) o SMB |

    ## Instal·lació del rol Server for NFS a WS2022

    Des de **Server Manager**:

    ```
    Manage → Add Roles and Features
    → File and Storage Services
      → File and iSCSI Services
        → [✓] Server for NFS
    ```

    O amb PowerShell:

    ```powershell
    Install-WindowsFeature FS-NFS-Service -IncludeManagementTools
    # Verifica la instal·lació
    Get-WindowsFeature FS-NFS-Service
    ```

    ## Crear i configurar un recurs NFS

    ### Via GUI (Server Manager)

    1. **Server Manager → File and Storage Services → Shares**
    2. **Tasks → New Share...**
    3. Tria **NFS Share - Quick**
    4. Selecciona la carpeta a compartir (ex: `C:\compartits\linux`)
    5. Nom del recurs: `linux`
    6. **Authentication**: selecciona `No server authentication (AUTH_SYS)`
    7. **Share permissions**: afegeix el rang IP dels clients (ex: `192.168.1.0/24`, permisos `Read-Write`)

    ### Via PowerShell

    ```powershell
    # Crea la carpeta
    New-Item -ItemType Directory -Path "C:\compartits\linux" -Force

    # Crea el recurs NFS
    New-NfsShare -Name "linux" `
                 -Path "C:\compartits\linux" `
                 -Authentication "Sys" `
                 -AllowRootAccess $true

    # Afegeix permís d'accés per a la xarxa
    Grant-NfsSharePermission -Name "linux" `
                             -ClientName "192.168.1.0/24" `
                             -ClientType "host" `
                             -Permission "ReadWrite" `
                             -AllowRootAccess $true

    # Verifica el recurs
    Get-NfsShare -Name "linux"
    ```

    ## Permisos NTFS del directori

    Els permisos NFS i els permisos NTFS s'apliquen conjuntament. Per simplicitat al laboratori:

    ```powershell
    # Dona control total a "Tots" (lax per a laboratori)
    $acl = Get-Acl "C:\compartits\linux"
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
        "Everyone", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow"
    )
    $acl.SetAccessRule($rule)
    Set-Acl "C:\compartits\linux" $acl
    ```

    ## Muntar el recurs NFS al client Ubuntu

    Al client Ubuntu 24.04:

    ```bash
    # Instal·la el client NFS
    sudo apt install nfs-common -y

    # Crea el punt de muntatge
    sudo mkdir -p /mnt/ws2022

    # Muntatge temporal (verifica la connexió)
    sudo mount -t nfs 192.168.1.10:/linux /mnt/ws2022

    # Verifica el muntatge
    df -h /mnt/ws2022
    ls /mnt/ws2022

    # Desmunta
    sudo umount /mnt/ws2022
    ```

    ## Muntatge permanent via /etc/fstab

    ```bash
    sudo nano /etc/fstab
    ```

    Afegeix al final:

    ```
    192.168.1.10:/linux  /mnt/ws2022  nfs  defaults,_netdev  0  0
    ```

    ```bash
    # Verifica la sintaxi i munta tot el que hi ha al fstab
    sudo mount -a
    df -h | grep ws2022
    ```

    ## Verificació des del servidor Windows

    ```powershell
    # Llista les connexions NFS actives
    Get-NfsServerStat

    # Llista els recursos NFS publicats
    Get-NfsShare

    # Veu qui és connectat
    Get-NfsSession
    ```

    !!! warning "UID/GID a AUTH_SYS"
        En mode `AUTH_SYS` (sense Kerberos), NFS transmet el UID i GID del client Linux tal qual. Windows pot no tenir un mapeig per a aquests IDs, cosa que pot resultar en permisos inesperats. Per a producció, usa `Kerberos` com a autenticació NFS. Per al laboratori, `AUTH_SYS` és suficient.

    !!! tip "Comprova que el servei NFS escolta"
        `netstat -an | findstr :2049` al Windows Server hauria de mostrar el port 2049 (NFS) en escolta. Si no apareix, el servei *Server for NFS* no ha arrencat correctament.

    ??? question "Auto-avaluació"

        **1.** Quina diferència hi ha entre compartir una carpeta via NFS i via Samba des de Windows Server?

        ??? success "Resposta"
            **Samba (SMB/CIFS)** usa el protocol nadiu de Windows, optimitzat per a clients Windows. **NFS** usa el protocol Unix/Linux, natiu per a clients Linux/Unix. Des d'Ubuntu, muntar via NFS és més senzill (sense necessitat de credencials SMB), mentre que des de Windows, SMB és la solució natural. En un entorn heterogeni, NFS és la millor opció quan els clients principals són Linux.

        **2.** Quin servei de Windows cal instal·lar per publicar carpetes via NFS?

        ??? success "Resposta"
            **Server for NFS**, que forma part del rol *File and Storage Services* → *File and iSCSI Services*. Es pot instal·lar via Server Manager o amb `Install-WindowsFeature FS-NFS-Service -IncludeManagementTools`. Sense aquest servei, Windows no pot actuar com a servidor NFS.

        **3.** Quina línia cal afegir a `/etc/fstab` per muntar permanentment el recurs NFS `192.168.1.10:/linux` a `/mnt/ws2022`?

        ??? success "Resposta"
            `192.168.1.10:/linux  /mnt/ws2022  nfs  defaults,_netdev  0  0`. L'opció `_netdev` indica al sistema que esperi que la xarxa estigui disponible abans de muntar el recurs (evita errors d'arrencada si el servidor NFS no és accessible immediatament).

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.B1 · NFS Windows Server 2022 → Ubuntu

    **Objectiu**: publicar una carpeta des de WS2022 via NFS i muntar-la des d'Ubuntu.
    **Temps estimat**: 45 minuts

    ---

    ### Pas 1 – Instal·la Server for NFS al WS2022

    ```powershell
    Install-WindowsFeature FS-NFS-Service -IncludeManagementTools
    ```

    ### Pas 2 – Crea i publica el recurs NFS

    ```powershell
    New-Item -ItemType Directory -Path "C:\compartits\linux" -Force
    New-NfsShare -Name "linux" -Path "C:\compartits\linux" -Authentication "Sys" -AllowRootAccess $true
    Grant-NfsSharePermission -Name "linux" -ClientName "192.168.1.0/24" -ClientType "host" -Permission "ReadWrite" -AllowRootAccess $true
    ```

    ### Pas 3 – Instal·la el client NFS a Ubuntu

    ```bash
    sudo apt install nfs-common -y
    sudo mkdir -p /mnt/ws2022
    ```

    ### Pas 4 – Munta i verifica

    ```bash
    sudo mount -t nfs 192.168.1.10:/linux /mnt/ws2022
    df -h /mnt/ws2022
    touch /mnt/ws2022/prova.txt
    ls /mnt/ws2022
    ```

    ### Pas 5 – Muntatge permanent

    Afegeix la línia al `/etc/fstab` i verifica amb `sudo mount -a`.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Windows Server 2022 NFS server setup"`
        - `"NFS share Windows Server Ubuntu client mount"`
        - `"Server for NFS Windows PowerShell configure"`
