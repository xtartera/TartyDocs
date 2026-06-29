---
title: NFS Client – Muntatge manual
tags:
  - ut3
  - nfs
---

# :material-folder-sync: NFS Client – Muntatge manual

!!! abstract "Concepte clau"
    El client NFS usa `mount -t nfs servidor:/ruta /punt-de-muntatge` per accedir a una exportació remota. El directori remot apareix al client com si fos local. El paquet `nfs-common` és necessari al client per usar el protocol NFS.

=== ":material-notebook-outline: Apunts"

    ## Instal·lació al client

    ```bash
    sudo apt install nfs-common -y
    ```

    `nfs-common` proporciona les eines del costat client:
    - `mount.nfs` — muntar exportacions NFS
    - `showmount` — consultar exportacions disponibles
    - `rpcinfo` — informació sobre serveis RPC

    ## Verificació prèvia al muntatge

    Abans de muntar, verifica que les exportacions del servidor estan disponibles:

    ```bash
    showmount -e 192.168.100.10
    ```

    Sortida esperada:

    ```text
    Export list for 192.168.100.10:
    /srv/nfs/dades  192.168.100.0/24
    ```

    ## Creació del punt de muntatge

    ```bash
    sudo mkdir -p /mnt/nfs/dades
    ```

    El punt de muntatge ha d'existir abans de muntar.

    ## Muntatge manual

    ```bash
    sudo mount -t nfs 192.168.100.10:/srv/nfs/dades /mnt/nfs/dades
    ```

    ### Opcions habituals de muntatge

    ```bash
    # Muntatge amb opcions explícites
    sudo mount -t nfs -o rw,sync,hard,intr 192.168.100.10:/srv/nfs/dades /mnt/nfs/dades
    ```

    | Opció | Funció |
    |-------|--------|
    | `rw` | Lectura i escriptura (si el servidor ho permet) |
    | `ro` | Sols lectura |
    | `sync` | Operacions síncrones |
    | `hard` | Reintenta indefinidament si el servidor no respon (recomanat) |
    | `soft` | Falla amb error si el servidor no respon (pot corrompre dades) |
    | `intr` | Permet interrompre operacions pendents amb Ctrl+C |
    | `noexec` | No permet executar binaris de l'exportació |
    | `nosuid` | Ignora bits SUID/SGID |

    ## Verificació del muntatge

    ```bash
    # Llista els sistemes de fitxers muntats
    df -h | grep nfs

    # Verifica el punt de muntatge
    mount | grep nfs

    # Comprova que pots llegir i escriure
    ls /mnt/nfs/dades
    echo "prova" | sudo tee /mnt/nfs/dades/test.txt
    cat /mnt/nfs/dades/test.txt
    ```

    Sortida de `df -h`:

    ```text
    Filesystem                     Size  Used Avail Use% Mounted on
    192.168.100.10:/srv/nfs/dades   20G  1.2G   19G   6% /mnt/nfs/dades
    ```

    ## Desmuntatge

    ```bash
    sudo umount /mnt/nfs/dades
    ```

    Si el sistema diu "target is busy", hi ha un procés que usa el punt de muntatge:

    ```bash
    # Identifica qui usa el muntatge
    sudo lsof /mnt/nfs/dades
    sudo fuser -m /mnt/nfs/dades
    ```

    !!! tip "Connexió amb UT2"
        A la UT2 (Bloc 8, autofs) el muntatge NFS era **automàtic** (autofs muntava `/perfils/usuari` quan l'usuari iniciava sessió). En la UT3 practiquem primer el **muntatge manual** (`mount -t nfs`) per entendre el mecanisme abans de automatitzar-lo.

    !!! warning "Error freqüent"
        El muntatge falla amb `mount.nfs: Connection refused` si el port 2049 del servidor està bloquejat per UFW. Comprova sempre el firewall al servidor **abans** d'intentar muntar des del client.

    ??? question "Auto-avaluació"
        **1.** Quina ordre munta la carpeta `/srv/nfs/dades` del servidor `192.168.100.10` al directori local `/mnt/dades`?

        ??? success "Resposta"
            `sudo mount -t nfs 192.168.100.10:/srv/nfs/dades /mnt/dades`. El format és: `mount -t nfs servidor:/ruta-remota /punt-local`. El punt de muntatge (`/mnt/dades`) ha d'existir prèviament.

        **2.** Quina diferència hi ha entre les opcions de muntatge `hard` i `soft`?

        ??? success "Resposta"
            `hard` (recomanat): si el servidor NFS no respon, el client espera indefinidament fins que recuperi la connexió. `soft`: si el servidor no respon, l'operació falla amb error d'I/O. `soft` pot causar corrupció de dades si el servidor torna a respondre més tard; `hard` és més segur però pot "congelar" el client si el servidor cau permanentment.

        **3.** Com es verifica que un muntatge NFS és actiu i funcional?

        ??? success "Resposta"
            Tres mètodes: (1) `df -h | grep nfs` — mostra l'espai disponible del sistema de fitxers remot; (2) `mount | grep nfs` — mostra el punt de muntatge actiu amb les seves opcions; (3) `ls /mnt/punt-de-muntatge` — comprova l'accés real als fitxers.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.16 · Muntatge manual NFS

    **Objectiu**: muntar una exportació NFS des del client i verificar l'accés de lectura i escriptura.
    **Temps estimat**: 25 minuts
    **Prerequisit**: Activitat 3.15 completada (exportació activa al servidor)

    ---

    ### Pas 1 – Instal·la nfs-common al client

    ```bash
    sudo apt install nfs-common -y
    ```

    ### Pas 2 – Verifica les exportacions disponibles

    ```bash
    showmount -e 192.168.100.10
    ```

    ### Pas 3 – Crea el punt de muntatge i munta

    ```bash
    sudo mkdir -p /mnt/nfs/dades
    sudo mount -t nfs 192.168.100.10:/srv/nfs/dades /mnt/nfs/dades
    ```

    ### Pas 4 – Verifica el muntatge

    ```bash
    df -h | grep nfs
    mount | grep nfs
    ls /mnt/nfs/dades
    ```

    ### Pas 5 – Prova escriptura i lectura

    ```bash
    echo "fitxer de prova des del client" | sudo tee /mnt/nfs/dades/client-test.txt
    cat /mnt/nfs/dades/client-test.txt

    # Verifica al servidor que el fitxer hi és
    # (des del servidor): ls -la /srv/nfs/dades/
    ```

    ### Pas 6 – Desmunta

    ```bash
    sudo umount /mnt/nfs/dades
    df -h | grep nfs  # No ha d'aparèixer
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"mount NFS Linux client Ubuntu tutorial"`
        - `"nfs-common mount command options Linux"`
        - `"NFS client setup Ubuntu mount shared folder"`
