---
title: Accés a comparticions Windows des de Linux
tags:
  - ut5
  - samba
  - windows
  - heterogenis
  - cifs
---

# :material-folder-network-outline: Accés a comparticions Windows des de Linux

!!! abstract "Concepte clau"
    Un client **Linux** pot consumir carpetes compartides de **Windows** (protocol SMB/CIFS) amb `smbclient` (com un FTP) o muntant-les al sistema de fitxers amb `mount -t cifs`. Tanca el cercle: fins ara compartíem de Linux cap a Windows; ara anem de Windows cap a Linux.

=== ":material-notebook-outline: Apunts"

    ## On encaixa aquest capítol

    A la UT3 i a la resta de la UT5 hem compartit **de Linux cap a Windows** (Samba, NFS). Aquí fem el sentit contrari: **accedir a un recurs SMB de Windows des d'un client Linux**. És la peça que faltava per tenir la compartició realment **bidireccional**.

    ```mermaid
    graph LR
        W["Windows Server\nCarpeta compartida SMB\n\\\\SRV\\dades"] -->|"SMB/CIFS (445)"| L["Client Linux\nsmbclient / mount -t cifs"]
    ```

    ## Paquets necessaris

    ```bash
    sudo apt update
    sudo apt install smbclient cifs-utils
    ```

    | Paquet | Per a què serveix |
    |--------|-------------------|
    | `smbclient` | Accés interactiu tipus FTP a recursos SMB |
    | `cifs-utils` | Permet **muntar** recursos SMB amb `mount -t cifs` |

    ## Opció A — Explorar i accedir amb `smbclient`

    Llistar els recursos compartits d'un servidor:

    ```bash
    smbclient -L //192.168.100.10 -U maria.puig
    ```

    Connectar-se a un recurs concret (sessió interactiva):

    ```bash
    smbclient //192.168.100.10/dades -U maria.puig
    ```

    Dins de la sessió `smb: \>` pots fer servir `ls`, `get fitxer`, `put fitxer`, `cd`, `exit` — com un client FTP.

    | Opció | Significat |
    |-------|-----------|
    | `-L` | Llista els recursos (browse) |
    | `-U usuari` | Usuari amb què autenticar-se |
    | `//IP/recurs` | Ruta UNC en format Unix (barres normals) |

    ## Opció B — Muntar el recurs amb `mount -t cifs`

    Muntatge puntual a `/mnt/dades`:

    ```bash
    sudo mkdir -p /mnt/dades
    sudo mount -t cifs //192.168.100.10/dades /mnt/dades \
      -o username=maria.puig,uid=$(id -u),gid=$(id -g)
    ```

    !!! warning "Fricció d'identitats (repàs del capítol de dificultats)"
        Les opcions `uid=` i `gid=` són **crítiques**: sense elles, els fitxers muntats poden aparèixer com a propietat de `root` i l'usuari no els podrà treballar. És l'exemple pràctic del mapatge SID↔UID/GID.

    ## Muntatge persistent amb `/etc/fstab`

    Per no exposar la contrasenya, es desa en un fitxer de credencials protegit:

    ```bash
    # /etc/smb-credentials  (permisos 600!)
    username=maria.puig
    password=LaContrasenya
    domain=LAFITA
    ```

    ```bash
    sudo chmod 600 /etc/smb-credentials
    ```

    Entrada a `/etc/fstab`:

    ```text
    //192.168.100.10/dades  /mnt/dades  cifs  credentials=/etc/smb-credentials,uid=1000,gid=1000,_netdev  0  0
    ```

    | Opció fstab | Per a què |
    |-------------|-----------|
    | `credentials=` | Fitxer amb usuari/contrasenya (evita posar-los en clar) |
    | `uid=/gid=` | Assigna la propietat local dels fitxers |
    | `_netdev` | Espera la xarxa abans de muntar (evita penjar l'arrencada) |

    !!! danger "Seguretat"
        Mai posis la contrasenya directament a `/etc/fstab` (és llegible per tothom). Usa sempre un fitxer de credencials amb permisos `600`.

    ## Verificació

    ```bash
    mount | grep cifs
    ls -la /mnt/dades
    ```

    !!! warning "Error freqüent"
        `mount error(13): Permission denied` sol indicar usuari/contrasenya incorrectes o que el recurs exigeix el **domini** (`domain=LAFITA`). `mount error(115)` sovint és de xarxa/DNS cap al servidor.

    ??? question "Auto-avaluació"
        **1.** Quina diferència pràctica hi ha entre `smbclient` i `mount -t cifs`?

        ??? success "Resposta"
            `smbclient` obre una sessió **interactiva** tipus FTP (ordres `get`/`put`) sense integrar el recurs al sistema de fitxers. `mount -t cifs` **munta** el recurs com una carpeta local, de manera que qualsevol aplicació hi accedeix com si fos local.

        **2.** Per què són importants les opcions `uid=`/`gid=` en muntar un recurs CIFS?

        ??? success "Resposta"
            Perquè determinen **quin usuari/grup local és el propietari** dels fitxers muntats. Sense elles, poden quedar com a `root` i l'usuari no els podria modificar. És la mitigació concreta de la fricció d'identitats SID↔UID/GID.

        **3.** Com evites exposar la contrasenya en un muntatge persistent per `/etc/fstab`?

        ??? success "Resposta"
            Amb un **fitxer de credencials** (`credentials=/etc/smb-credentials`) amb permisos `600`, en comptes de posar `username`/`password` directament a `/etc/fstab`, que és llegible per qualsevol usuari.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 5.B1 · De Windows a Linux

    **Objectiu**: accedir a una carpeta compartida de Windows des d'un client Ubuntu, primer de forma interactiva i després muntada.
    **Temps estimat**: 40 minuts · **Modalitat**: individual

    ---

    ### Tasca 1 – Preparació

    1. Al servidor Windows, comparteix una carpeta `dades` i dóna-hi permís a `maria.puig`.
    2. A l'Ubuntu client, instal·la `smbclient` i `cifs-utils`.

    ### Tasca 2 – Accés interactiu

    1. Llista els recursos del servidor amb `smbclient -L`.
    2. Connecta't a `dades` i puja-hi un fitxer amb `put`. Documenta la sortida.

    ### Tasca 3 – Muntatge persistent

    1. Crea un fitxer de credencials amb permisos `600`.
    2. Afegeix l'entrada a `/etc/fstab` amb `uid`/`gid` i `_netdev`.
    3. Munta amb `sudo mount -a` i comprova amb `ls -la /mnt/dades` que la propietat és correcta.

    ### Tasca 4 – Reflexió

    Explica què hauria passat amb la propietat dels fitxers si no haguessis posat `uid=`/`gid=`. Relaciona-ho amb el capítol de particularitats i dificultats.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"mount windows share on linux cifs fstab"`
        - `"smbclient tutorial linux"`
        - `"cifs credentials file fstab secure"`
