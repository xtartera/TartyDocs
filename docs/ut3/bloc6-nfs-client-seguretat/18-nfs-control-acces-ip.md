---
title: NFS – Control d'accés per IP
tags:
  - ut3
  - nfs
---

# :material-ip-network: NFS – Control d'accés per IP

!!! abstract "Concepte clau"
    NFS restringeix l'accés per **adreça IP o rang de xarxa** directament a `/etc/exports`. És el mecanisme principal de seguretat de NFS: si una IP no apareix a `/etc/exports`, no pot muntar l'exportació, independentment de quin usuari intenti fer-ho.

=== ":material-notebook-outline: Apunts"

    ## Formats de definició de client a /etc/exports

    `/etc/exports` accepta diverses formes de specif·icar els clients autoritzats:

    | Format | Exemple | Significat |
    |--------|---------|-----------|
    | IP concreta | `192.168.100.20` | Un sol client |
    | Rang CIDR | `192.168.100.0/24` | Tota la subxarxa /24 |
    | Hostname | `client-linux.local` | Per nom d'host (requereix DNS) |
    | Wildcard `*` | `*` | Qualsevol client (**PERILLÓS**) |
    | Domini | `*.lafita.local` | Tots els hosts del domini |

    ## Exemples de control d'accés per IP

    ### Accés limitat a un client concret

    ```
    /srv/nfs/dades   192.168.100.20(rw,sync,no_subtree_check)
    ```

    Només el client `192.168.100.20` pot muntar `/srv/nfs/dades`. Qualsevol altre IP rebrà un error en intentar muntar.

    ### Accés per rang de xarxa

    ```
    /srv/nfs/dades   192.168.100.0/24(rw,sync,no_subtree_check)
    ```

    Tots els clients de la xarxa `192.168.100.0/24` (`192.168.100.1` fins a `.254`) poden muntar.

    ### Permisos diferenciats per client

    ```
    /srv/nfs/dades   192.168.100.20(rw,sync,no_subtree_check)
    /srv/nfs/dades   192.168.100.0/24(ro,sync,no_subtree_check)
    ```

    El client `.20` té R/W; la resta de la xarxa, R/O.

    ```mermaid
    graph LR
        S["Servidor NFS\n192.168.100.10"] -->|"rw · /srv/nfs/dades"| C1["Client .20"]
        S -->|"ro · /srv/nfs/dades"| C2["Client .21-.254"]
        S -.->|"❌ denegat"| C3["Client 10.0.0.5\n(xarxa externa)"]
    ```

    ## Verificació del control per IP

    Al servidor, comprova les exportacions actives:

    ```bash
    sudo exportfs -v
    showmount -e localhost
    ```

    Des d'un client **autoritzat**:

    ```bash
    showmount -e 192.168.100.10   # Ha de mostrar les exportacions
    sudo mount -t nfs 192.168.100.10:/srv/nfs/dades /mnt/dades  # Ha d'anar bé
    ```

    Des d'un client **no autoritzat** (simulació):

    ```bash
    # Des d'una IP no inclosa a /etc/exports
    sudo mount -t nfs 192.168.100.10:/srv/nfs/dades /mnt/dades
    # Error esperat: mount.nfs: access denied by server while mounting
    ```

    ## Logs d'accés NFS al servidor

    Quan un client no autoritzat intenta connectar, el servidor ho registra:

    ```bash
    sudo journalctl -u nfs-server --since "5 minutes ago"
    # o
    sudo tail -f /var/log/syslog | grep nfs
    ```

    !!! warning "Error freqüent"
        Usar `*` com a client a `/etc/exports` per "provar ràpid". Això **obri l'exportació a qualsevol host de la xarxa** (i fins i tot d'internet si el firewall no filtra el port 2049). Sempre especifica IPs concretes o rangs CIDR mínims necessaris.

    ??? question "Auto-avaluació"
        **1.** Com s'especifica a `/etc/exports` que només el client `192.168.100.30` pot muntar `/srv/nfs/backup` en mode de sols lectura?

        ??? success "Resposta"
            `/srv/nfs/backup   192.168.100.30(ro,sync,no_subtree_check)`. Nota: sense espai entre la IP i els parèntesis de les opcions.

        **2.** Quin missatge d'error veu el client quan intenta muntar una exportació i la seva IP no està autoritzada?

        ??? success "Resposta"
            `mount.nfs: access denied by server while mounting 192.168.100.10:/srv/nfs/dades`. El servidor rebutja la petició de muntatge perquè la IP del client no coincideix amb cap entrada de `/etc/exports`.

        **3.** Com es pot donar accés de lectura/escriptura a un client concret i accés de sols lectura a la resta de la subxarxa?

        ??? success "Resposta"
            Dues línies al `/etc/exports` per a la mateixa exportació:
            ```
            /srv/nfs/dades   192.168.100.20(rw,sync,no_subtree_check)
            /srv/nfs/dades   192.168.100.0/24(ro,sync,no_subtree_check)
            ```
            NFS aplica la regla **més específica** primer; el client `.20` coincideix amb la primera línia (rw) i els altres de la subxarxa, amb la segona (ro).

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.18 · Control d'accés per IP

    **Objectiu**: configurar /etc/exports amb restriccions per IP i verificar l'accés diferencial.
    **Temps estimat**: 30 minuts

    ---

    ### Pas 1 – Configura accés diferenciat

    Al servidor, edita `/etc/exports`:

    ```
    /srv/nfs/dades   192.168.100.20(rw,sync,no_subtree_check)
    /srv/nfs/backup  192.168.100.0/24(ro,sync,no_subtree_check)
    ```

    Aplica:

    ```bash
    sudo exportfs -ra
    showmount -e localhost
    ```

    ### Pas 2 – Verifica des del client autoritzat (.20)

    ```bash
    # Ha de permetre R/W a /srv/nfs/dades
    sudo mount -t nfs 192.168.100.10:/srv/nfs/dades /mnt/dades
    echo "escriptura" | sudo tee /mnt/dades/prova.txt
    ```

    ### Pas 3 – Simula accés no autoritzat

    Si tens un tercer equip o pots canviar la IP del client temporalment, intenta muntar des d'una IP no autoritzada i documenta l'error.

    ### Pas 4 – Prova la distinció rw/ro

    Munta `/srv/nfs/backup` (accés ro per a la xarxa /24):

    ```bash
    sudo mount -t nfs 192.168.100.10:/srv/nfs/backup /mnt/backup
    ls /mnt/backup  # Ha de funcionar
    sudo touch /mnt/backup/test.txt  # Ha de fallar amb "Read-only file system"
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"NFS exports IP access control Linux"`
        - `"etc/exports restrict IP NFS server"`
        - `"NFS security access denied Linux tutorial"`
