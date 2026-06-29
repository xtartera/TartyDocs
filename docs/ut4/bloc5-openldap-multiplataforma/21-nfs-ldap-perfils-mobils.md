---
title: NFS + LDAP – perfils mòbils roaming
tags:
  - ut4
  - ldap
  - nfs
  - perfils
---

# :material-home-account: NFS + LDAP – perfils mòbils roaming

!!! abstract "Concepte clau"
    Combinant **NFS** (sistema de fitxers de xarxa) i **LDAP** (directori d'usuaris), s'implementen **perfils mòbils roaming**: el directori home de cada usuari resideix al servidor NFS i es munta automàticament quan l'usuari inicia sessió des de qualsevol client Linux. L'usuari veu sempre els mateixos fitxers.

=== ":material-notebook-outline: Apunts"

    ## Arquitectura NFS + LDAP

    ```mermaid
    graph LR
        SLAPD["OpenLDAP (slapd)\nhomeDirectory: /home/201/director201"]
        NFS["Servidor NFS\n/srv/nfs/homes/201/director201"]
        CLI1["Client Linux #1\n/home/201/director201 (muntat)"]
        CLI2["Client Linux #2\n/home/201/director201 (muntat)"]

        SLAPD -->|"NSS: homeDirectory"| CLI1
        SLAPD -->|"NSS: homeDirectory"| CLI2
        NFS -->|"mount -t nfs"| CLI1
        NFS -->|"mount -t nfs"| CLI2
    ```

    El servidor NFS i el servidor LDAP poden ser la **mateixa màquina** (com al projecte P42).

    ## Configuració al servidor: exportació NFS

    ```bash
    # Instal·la nfs-kernel-server
    sudo apt install -y nfs-kernel-server

    # Crea l'estructura de directoris per grup
    sudo mkdir -p /srv/nfs/homes/201/director201
    sudo mkdir -p /srv/nfs/homes/201/tecnic201
    sudo chown 10001:20001 /srv/nfs/homes/201/director201   # UID:GID de director201
    sudo chown 10002:20002 /srv/nfs/homes/201/tecnic201
    sudo chmod 700 /srv/nfs/homes/201/director201
    sudo chmod 700 /srv/nfs/homes/201/tecnic201

    # Exporta el directori de homes
    echo "/srv/nfs/homes    172.16.100.0/24(rw,sync,no_subtree_check,no_root_squash)" | \
        sudo tee -a /etc/exports

    sudo exportfs -ra
    sudo exportfs -v
    ```

    ## Atribut homeDirectory a LDAP

    El `homeDirectory` de cada usuari LDAP ha d'apuntar a la ruta NFS:

    ```ldif
    dn: uid=director201,ou=usuaris,dc=cognom,dc=local
    ...
    homeDirectory: /home/201/director201
    ```

    ```bash
    # Modifica un usuari existent
    cat > modify-home.ldif << 'EOF'
    dn: uid=director201,ou=usuaris,dc=cognom,dc=local
    changetype: modify
    replace: homeDirectory
    homeDirectory: /home/201/director201
    EOF

    ldapmodify -x -H ldap://localhost \
        -D "cn=admin,dc=cognom,dc=local" -W \
        -f modify-home.ldif
    ```

    ## Configuració al client: autofs per a muntatge automàtic

    ```bash
    sudo apt install -y autofs nfs-common

    # /etc/auto.master — afegeix:
    /home/201    /etc/auto.homes

    # /etc/auto.homes:
    *    -rw,soft,intr    172.16.XXX.20:/srv/nfs/homes/201/&

    # El & s'expandeix al nom del directori demanat
    # Quan accedeix a /home/201/director201:
    #   munta 172.16.XXX.20:/srv/nfs/homes/201/director201

    sudo systemctl restart autofs
    ```

    ## Alternativa: muntatge via /etc/fstab

    Per a entorns senzills sense autofs:

    ```bash
    # /etc/fstab al client
    172.16.XXX.20:/srv/nfs/homes/201    /home/201    nfs    rw,soft,intr,_netdev    0 0

    sudo mkdir -p /home/201
    sudo mount -a
    ```

    ## Verificació del perfil roaming

    ```bash
    # Al client, inicia sessió com a director201
    su - director201

    # Comprova que el home és la ruta NFS
    pwd               # /home/201/director201
    df -h .           # Ha de mostrar el servidor NFS com a origen

    # Crea un fitxer de prova
    echo "roaming test" > ~/test-roaming.txt
    exit

    # Al segon client (o al servidor): comprova que el fitxer hi és
    ls /srv/nfs/homes/201/director201/    # Al servidor NFS
    ```

    !!! warning "no_root_squash: necessari per al primer login"
        Si el directori home NFS no existeix quan l'usuari inicia sessió per primera vegada, cal crear-lo com a root des del servidor. L'opció `no_root_squash` a `/etc/exports` permet que les operacions root del client s'executin com a root al servidor, necessari per a eines com `pam_mkhomedir` que creen el directori home. En producció, crea els directoris home manualment al servidor i usa `root_squash`.

    !!! tip "Cohèrencia UID/GID: la clau de tot"
        El secret dels perfils NFS+LDAP és que el **UID i GID** de l'usuari (definits a LDAP) coincideixin amb la **propietat dels fitxers** al servidor NFS. Si `director201` té UID 10001 a LDAP, el directori `/srv/nfs/homes/201/director201` ha de pertànyer a l'UID 10001 al servidor. Qualsevol inconsistència produirà errors de permís.

    ??? question "Auto-avaluació"
        **1.** Quin avantatge clau ofereix combinar NFS + LDAP per a perfils mòbils respecte a `mkhomedir` local?

        ??? success "Resposta"
            Amb **NFS + LDAP**, el directori home de l'usuari resideix en un **servidor centralitzat** i l'usuari veu **els mateixos fitxers** des de qualsevol client Linux del domini. Amb `mkhomedir` local, el home es crea a cada màquina per separat: si l'usuari inicia sessió en dos equips, té dos homes independents i els fitxers no es sincronitzen. NFS proporciona **mobilitat real** dels perfils.

        **2.** Quina opció de `/etc/exports` és necessària si les eines del client (com `pam_mkhomedir`) necessiten crear directoris com a root al servidor NFS?

        ??? success "Resposta"
            L'opció **`no_root_squash`**. Per defecte, NFS converteix les operacions root del client en operacions del compte `nobody` (root_squash), limitant el que el root del client pot fer al servidor. Amb `no_root_squash`, el root del client opera com a root al servidor. Necessari per a eines que creen directoris homes. En producció, s'evita i es creen els homes manualment al servidor.

        **3.** Com comprova un usuari que el seu directori home és, efectivament, muntat via NFS i no local?

        ??? success "Resposta"
            `df -h ~` (o `df -h /home/201/director201`) mostra l'origen del sistema de fitxers. Si el home és NFS, mostrarà quelcom com `172.16.XXX.20:/srv/nfs/homes/201/director201` com a origen, en comptes d'un dispositiu de disc local (`/dev/sda1`). Alternativament, `mount | grep home` mostra tots els punts de muntatge actius.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.21 · Perfils mòbils NFS + LDAP

    **Objectiu**: implementar perfils mòbils roaming amb NFS i LDAP al projecte P42.
    **Temps estimat**: 40 minuts
    **Prerequisit**: LDAP operatiu (4.17), client PAM/NSS (4.18)

    ---

    ### Pas 1 – Configura el servidor NFS (al servidor)

    ```bash
    sudo apt install -y nfs-kernel-server
    sudo mkdir -p /srv/nfs/homes/201/director201
    sudo chown 10001:20001 /srv/nfs/homes/201/director201
    sudo chmod 700 /srv/nfs/homes/201/director201
    echo "/srv/nfs/homes    172.16.100.0/24(rw,sync,no_subtree_check,no_root_squash)" | sudo tee -a /etc/exports
    sudo exportfs -ra
    ```

    ### Pas 2 – Actualitza homeDirectory a LDAP

    Modifica l'atribut `homeDirectory` de cada usuari per apuntar a `/home/201/usuari`.

    ### Pas 3 – Configura autofs al client

    ```bash
    sudo apt install -y autofs nfs-common
    echo "/home/201    /etc/auto.homes" | sudo tee -a /etc/auto.master
    echo "*    -rw,soft,intr    172.16.XXX.20:/srv/nfs/homes/201/&" | sudo tee /etc/auto.homes
    sudo systemctl restart autofs
    ```

    ### Pas 4 – Login i verifica el perfil roaming

    ```bash
    su - director201
    pwd              # /home/201/director201
    df -h .          # Ha de mostrar el servidor NFS
    echo "test" > ~/roaming.txt
    exit
    # Des d'un segon client, comprova que roaming.txt hi és
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"NFS LDAP roaming home directory Linux tutorial"`
        - `"autofs LDAP home directory Linux setup"`
        - `"NFS home directory Linux domain users"`
