---
title: Instal·lació del servidor NFS
tags:
  - ut2
  - nfs
---

# :material-server-network: Instal·lació del servidor NFS

!!! abstract "Concepte clau"
    Per exportar `/perfils/` per xarxa instal·la `nfs-kernel-server` al servidor (`192.168.100.10`). El servei arrenca immediatament però sense exportar res — la configuració real és al fitxer `/etc/exports` (pàgina 36).

=== ":material-notebook-outline: Apunts"

    ## Instal·lació

    ```bash
    sudo apt install -y nfs-kernel-server
    ```

    El paquet instal·la automàticament `nfs-common` (biblioteques compartides client/servidor) i activa el servei:

    ```bash
    systemctl status nfs-kernel-server
    ```

    Sortida esperada:
    ```text
    ● nfs-server.service - NFS server and services
         Loaded: loaded (/usr/lib/systemd/system/nfs-server.service; enabled; preset: enabled)
         Active: active (running) since ...
    ```

    Comprova els ports oberts:
    ```bash
    ss -tlnp | grep -E '2049|111'
    ```

    ```text
    LISTEN  0  64  0.0.0.0:2049  0.0.0.0:*
    LISTEN  0  64  0.0.0.0:111   0.0.0.0:*
    ```

    El port **2049** (NFS) i el **111** (rpcbind) han d'estar escoltant.

    ## Fitxers instal·lats

    | Fitxer | Propòsit |
    |--------|---------|
    | `/etc/exports` | Llista de directoris exportats (principal fitxer de configuració) |
    | `/etc/nfs.conf` | Configuració avançada del dimoni NFS |
    | `/etc/default/nfs-kernel-server` | Opcions d'inici del servei |
    | `/var/lib/nfs/etab` | Taula d'exports actius (generada per `exportfs`) |
    | `/var/lib/nfs/rmtab` | Taula de clients muntats |

    `/etc/exports` és l'únic fitxer que modificaràs al laboratori. Els altres rarament es toquen.

    ## Preparació del directori /perfils

    El directori `/perfils/` ha d'existir al servidor **abans** d'exportar-lo:

    ```bash
    # Crea el directori arrel de perfils (si no existeix del Bloc 6)
    sudo mkdir -p /perfils

    # Propietat root:root, permisos 755
    sudo chown root:root /perfils
    sudo chmod 755 /perfils
    ```

    !!! info "Subdirectoris dels usuaris"
        Els subdirectoris `/perfils/maria.puig`, `/perfils/pere.costa`, `/perfils/anna.valls` que vas crear manualment al Bloc 6 (pàgina 33) continuen existint. Al Bloc 8, autofs els gestionarà automàticament. Per ara, mantén-los tal qual.

    ## Gestió del servei

    ```bash
    # Arrencar
    sudo systemctl start nfs-kernel-server

    # Aturar
    sudo systemctl stop nfs-kernel-server

    # Reiniciar (necessari si modifiques /etc/nfs.conf)
    sudo systemctl restart nfs-kernel-server

    # Recarregar exports (sense reiniciar — veure pàgina 36)
    sudo exportfs -ra
    ```

    !!! warning "Quan reiniciar i quan usar exportfs -ra"
        Si modifiques `/etc/exports`, **NO cal reiniciar** el servei — n'hi ha prou amb `sudo exportfs -ra`. Reiniciar el servei és més abrupte: talla les connexions de clients actius. Usa `exportfs -ra` per aplicar canvis en calent.

    ## NFS al client: nfs-common i autofs

    Si tens el client Ubuntu (`192.168.100.20`), instal·la els paquets necessaris:

    ```bash
    # Al client (192.168.100.20)
    sudo apt install -y nfs-common autofs
    ```

    | Paquet | Propòsit |
    |--------|---------|
    | `nfs-common` | Suport per muntar sistemes NFS (client) |
    | `autofs` | Dimoni de muntatge automàtic (Bloc 8) |

    !!! info "Ubuntu 24.04 i NFSv4"
        Ubuntu 24.04 usa NFSv4 per defecte. `nfs-common` instal·la suport per a NFSv3 i NFSv4; la versió es negocia automàticament entre client i servidor. En un entorn de laboratori amb tots dos a Ubuntu 24.04, s'usarà NFSv4.

    ## Verificació de connectivitat

    Des del client, comprova que el servidor NFS és accessible:

    ```bash
    # Des del client (192.168.100.20)
    ping -c 3 192.168.100.10

    # Comprova que el port NFS és accessible
    nc -zv 192.168.100.10 2049
    ```

    Sortida esperada de `nc`:
    ```text
    Connection to 192.168.100.10 2049 port [tcp/nfs] succeeded!
    ```

    Si `nc` falla, comprova al servidor:
    ```bash
    # Al servidor: estat del servei
    systemctl status nfs-kernel-server

    # Al servidor: estat del firewall
    sudo ufw status
    ```

    ??? question "Auto-avaluació"

        **1.** Quina diferència hi ha entre `systemctl restart nfs-kernel-server` i `exportfs -ra`? Quan uses cadascun?

        ??? success "Resposta"
            `systemctl restart nfs-kernel-server` atura i torna a arrencar tot el servei NFS: talla les connexions de clients actius, elimina tots els exports i reinicialitza. Usa'l si has modificat `/etc/nfs.conf` o si el servei ha fallat. `exportfs -ra` (*re-export all*) rellegeix `/etc/exports` i actualitza les exportacions actives sense interrompre les connexions existents. Usa'l sempre que modifiquis `/etc/exports` — és l'ordre correcta per aplicar canvis en calent.

        **2.** Per quin motiu `/perfils` (directori arrel) té permisos 755 en comptes de 700?

        ??? success "Resposta"
            `/perfils` és el directori arrel que NFS exporta. Necessita permisos 755 (`rwxr-xr-x`) perquè el sistema i autofs puguin llistar el seu contingut i accedir als subdirectoris. Cada subdirectori d'usuari (`/perfils/maria.puig`) té permisos 700 (`rwx------`) per protegir la privacitat — únicament el propietari (UID 1001) hi pot accedir. El directori arrel ha de ser travessable per root (que és el procés que crea els muntatges autofs).

=== ":material-pencil-ruler: Activitat"

    ## Activitat 7.2 · Instal·la i verifica el servidor NFS

    **Objectiu**: tenir el servei NFS instal·lat i actiu al servidor.

    **Temps estimat**: 15 minuts

    ---

    ### Part A – Instal·lació

    ```bash
    sudo apt install -y nfs-kernel-server
    systemctl status nfs-kernel-server
    ```

    Verifica que el servei és `active (running)`.

    ### Part B – Ports

    ```bash
    ss -tlnp | grep -E '2049|111'
    ```

    Confirma que el port 2049 (NFS) i el 111 (rpcbind) estan escoltant.

    ### Part C – Directori /perfils

    ```bash
    ls -la /perfils/
    ```

    Confirma que `/perfils/` existeix i que els subdirectoris dels usuaris (del Bloc 6) continuen amb la propietat correcta.

    ### Part D – Client (si en tens un)

    Des del client `192.168.100.20`:
    ```bash
    sudo apt install -y nfs-common autofs
    nc -zv 192.168.100.10 2049
    ```

    Ha de mostrar `succeeded`.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"NFS server Ubuntu 24.04 install nfs-kernel-server"`
        - `"apt install nfs-kernel-server Ubuntu setup"`
        - `"NFS server ports 2049 rpcbind Ubuntu verify"`
