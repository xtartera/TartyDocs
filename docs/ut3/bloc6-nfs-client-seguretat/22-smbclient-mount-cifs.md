---
title: Accés a comparticions SMB des de Linux
tags:
  - ut3
  - samba
  - cifs
  - windows
---

# :material-folder-network-outline: Accés a comparticions SMB des de Linux

!!! abstract "Concepte clau"
    Un client **Linux** pot consumir carpetes compartides per **SMB/CIFS** (des d'un servidor Samba o Windows) amb `smbclient` (accés tipus FTP) o muntant-les al sistema de fitxers amb `mount -t cifs`. Fins ara hem estat el *servidor* Samba; ara aprenem a ser-ne el *client*.

=== ":material-notebook-outline: Apunts"

    ## On encaixa

    Als blocs anteriors hem muntat un servidor **Samba** que comparteix carpetes cap a clients Windows. Aquí tanquem el cercle: **accedir a un recurs SMB des d'un client Linux**, tant si el serveix Samba com un Windows.

    ```mermaid
    graph LR
        S["Servidor SMB\n(Samba o Windows)\n//SRV/dades"] -->|"SMB/CIFS (445)"| L["Client Linux\nsmbclient / mount -t cifs"]
    ```

    ## Paquets necessaris

    ```bash
    sudo apt install smbclient cifs-utils
    ```

    | Paquet | Serveix per a |
    |--------|---------------|
    | `smbclient` | Accés interactiu tipus FTP |
    | `cifs-utils` | Muntar recursos amb `mount -t cifs` |

    ## Opció A — `smbclient` (interactiu)

    ```bash
    smbclient -L //192.168.100.10 -U maria.puig      # llistar recursos
    smbclient //192.168.100.10/dades -U maria.puig   # entrar-hi
    ```

    Dins la sessió `smb: \>`: `ls`, `get fitxer`, `put fitxer`, `cd`, `exit`.

    ## Opció B — Muntar amb `mount -t cifs`

    ```bash
    sudo mkdir -p /mnt/dades
    sudo mount -t cifs //192.168.100.10/dades /mnt/dades \
      -o username=maria.puig,uid=$(id -u),gid=$(id -g)
    ```

    !!! warning "Les opcions `uid`/`gid` són crítiques"
        Sense `uid=`/`gid=`, els fitxers muntats poden aparèixer com a propietat de `root` i l'usuari no els podrà treballar. Recorda: SMB no transmet la identitat POSIX, s'assigna en muntar.

    ## Muntatge persistent segur (`/etc/fstab`)

    Fitxer de credencials (permisos `600`, mai la contrasenya a `fstab`):

    ```bash
    # /etc/smb-credentials
    username=maria.puig
    password=LaContrasenya
    ```

    ```bash
    sudo chmod 600 /etc/smb-credentials
    ```

    ```text
    //192.168.100.10/dades  /mnt/dades  cifs  credentials=/etc/smb-credentials,uid=1000,gid=1000,_netdev  0  0
    ```

    | Opció | Per a què |
    |-------|-----------|
    | `credentials=` | Usuari/contrasenya en un fitxer protegit |
    | `uid`/`gid` | Propietat local dels fitxers |
    | `_netdev` | Espera la xarxa abans de muntar |

    !!! tip "Comparació amb NFS (aquesta mateixa UT)"
        Ja saps muntar recursos **NFS** (blocs anteriors). CIFS és l'equivalent per accedir a comparticions **SMB/Windows**: mateix concepte de muntatge (`mount`, `/etc/fstab`), però protocol i autenticació diferents.

    !!! warning "Error freqüent"
        `mount error(13): Permission denied` → usuari/contrasenya incorrectes o cal indicar el **domini** (`domain=...`). `mount error(115)` → sovint problema de xarxa cap al servidor.

    ??? question "Auto-avaluació"
        **1.** Quina diferència pràctica hi ha entre `smbclient` i `mount -t cifs`?

        ??? success "Resposta"
            `smbclient` obre una sessió interactiva tipus FTP (ordres `get`/`put`) sense integrar el recurs al sistema de fitxers; `mount -t cifs` **munta** el recurs com una carpeta local accessible per qualsevol aplicació.

        **2.** Per què cal indicar `uid`/`gid` en muntar un recurs CIFS?

        ??? success "Resposta"
            Perquè el protocol SMB no transmet la identitat POSIX. Amb `uid`/`gid` s'assigna el propietari local dels fitxers muntats; sense elles, poden quedar com a `root` i l'usuari no els podria modificar.

        **3.** Com evites exposar la contrasenya en un muntatge persistent?

        ??? success "Resposta"
            Amb un fitxer de credencials (`credentials=/etc/smb-credentials`) amb permisos `600`, en lloc de posar la contrasenya directament a `/etc/fstab`.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 6.22 · Client SMB des de Linux

    **Objectiu**: accedir a una compartició SMB des d'un client Ubuntu.
    **Temps estimat**: 35 minuts · **Modalitat**: individual

    ---

    ### Tasca 1 – Accés interactiu

    Instal·la `smbclient` i `cifs-utils`. Llista els recursos del servidor amb `smbclient -L` i puja un fitxer a `dades` amb `put`.

    ### Tasca 2 – Muntatge persistent

    Crea un fitxer de credencials `600`, afegeix l'entrada a `/etc/fstab` amb `uid`/`gid` i `_netdev`, i munta amb `sudo mount -a`.

    ### Tasca 3 – Propietat

    Comprova amb `ls -la /mnt/dades` la propietat dels fitxers. Explica què passaria sense `uid`/`gid`.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"mount smb share linux cifs fstab"`
        - `"smbclient tutorial linux"`
        - `"cifs credentials file secure mount"`
