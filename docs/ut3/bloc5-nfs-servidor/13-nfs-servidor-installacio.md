---
title: NFS – Instal·lació del servidor
tags:
  - ut3
  - nfs
---

# :material-server-network: NFS – Instal·lació del servidor

!!! abstract "Concepte clau"
    El paquet `nfs-kernel-server` instal·la el servei NFS al servidor Ubuntu. Un cop instal·lat, el servei és gestionat per `systemctl` i les exportacions es defineixen a `/etc/exports`.

=== ":material-notebook-outline: Apunts"

    ## Instal·lació

    ```bash
    sudo apt update
    sudo apt install nfs-kernel-server -y
    ```

    Verificació de l'estat:

    ```bash
    sudo systemctl status nfs-kernel-server
    ```

    Sortida esperada:

    ```text
    ● nfs-server.service - NFS server and services
         Loaded: loaded (/lib/systemd/system/nfs-server.service; enabled; ...)
         Active: active (running) ...
    ```

    Habilitar a l'inici:

    ```bash
    sudo systemctl enable nfs-kernel-server
    ```

    ## Creació dels directoris d'exportació

    Per convenció, les exportacions NFS es creen a `/srv/nfs/`:

    ```bash
    sudo mkdir -p /srv/nfs/dades
    sudo mkdir -p /srv/nfs/backup
    sudo chown nobody:nogroup /srv/nfs/dades
    sudo chmod 755 /srv/nfs/dades
    ```

    !!! tip "Directori /srv/nfs vs. /home"
        A la UT2 (Bloc 7 i 8) exportàvem `/perfils` per als perfils mòbils. En la UT3 usem `/srv/nfs/` com a ubicació estàndard per a exportacions generals. Ambdós funcionen; és una qüestió de convenció i organització.

    ## Verificació del port NFS

    ```bash
    ss -tulnp | grep -E '2049|111'
    ```

    Sortida esperada:

    ```text
    tcp  LISTEN  0  64  0.0.0.0:2049  0.0.0.0:*
    tcp  LISTEN  0  64  0.0.0.0:111   0.0.0.0:*
    ```

    ## rpcinfo — verificació dels serveis RPC

    ```bash
    rpcinfo -p localhost
    ```

    Sortida (extracte):

    ```text
    program vers proto   port  service
    100000    4   tcp    111  portmapper
    100003    3   tcp   2049  nfs
    100003    4   tcp   2049  nfs
    100005    1   tcp  44321  mountd
    ```

    ## Seqüència de posada en marxa

    ```
    1. apt install nfs-kernel-server
       ↓
    2. Crea directoris: mkdir -p /srv/nfs/dades
       ↓
    3. Edita /etc/exports (pàgina 14)
       ↓
    4. Aplica: exportfs -rav (pàgina 15)
       ↓
    5. Verifica: showmount -e localhost
    ```

    !!! warning "Error freqüent"
        El servei s'instal·la com `nfs-kernel-server` però el nom de la unitat systemd és `nfs-server.service`. Tant `systemctl status nfs-kernel-server` com `systemctl status nfs-server` funcionen gràcies als àlies, però si escrius `systemctl status nfs-kernel-server.service` (amb `.service`) pot no trobar-lo. Usa `nfs-server` per consistència.

    ??? question "Auto-avaluació"
        **1.** Quina ordre instal·la el servei NFS al servidor Ubuntu?

        ??? success "Resposta"
            `sudo apt install nfs-kernel-server -y`. El paquet inclou el dimoni NFS del kernel, les eines de gestió (`exportfs`, `showmount`) i la configuració de `rpcbind`.

        **2.** Quina ordre verifica que el servei NFS escolta al port 2049?

        ??? success "Resposta"
            `ss -tulnp | grep 2049`. Alternativament, `rpcinfo -p localhost | grep nfs` mostra els serveis NFS registrats al portmapper amb els seus ports.

        **3.** A quin directori es recomana crear les carpetes d'exportació NFS per convenció?

        ??? success "Resposta"
            `/srv/nfs/` és la convenció recomanada per al sistema de fitxers jeràrquic Unix. `/srv/` conté dades per a serveis del sistema (HTTP, NFS, FTP...). Crear `/srv/nfs/dades`, `/srv/nfs/backup`, etc. és clar i organitzat.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.13 · Instal·lació NFS servidor

    **Objectiu**: instal·lar el servei NFS i preparar els directoris d'exportació.
    **Temps estimat**: 20 minuts

    ---

    ### Pas 1 – Instal·la NFS al servidor

    ```bash
    sudo apt update && sudo apt install nfs-kernel-server -y
    ```

    ### Pas 2 – Verifica l'estat

    ```bash
    sudo systemctl status nfs-server
    sudo systemctl is-enabled nfs-server
    ```

    ### Pas 3 – Crea els directoris d'exportació

    ```bash
    sudo mkdir -p /srv/nfs/{dades,backup,alumnes}
    sudo chown nobody:nogroup /srv/nfs/dades /srv/nfs/backup
    sudo chmod 755 /srv/nfs/dades /srv/nfs/backup
    ls -la /srv/nfs/
    ```

    ### Pas 4 – Verifica ports i RPC

    ```bash
    ss -tulnp | grep -E '2049|111'
    rpcinfo -p localhost
    ```

    Documenta els ports oberts i els serveis RPC disponibles.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"NFS server Ubuntu 24.04 setup"`
        - `"nfs-kernel-server install configure Ubuntu"`
        - `"rpcbind rpcinfo NFS Linux explained"`
