---
title: "exportfs i showmount: verificació NFS"
tags:
  - ut2
  - nfs
  - diagnostic
---

# :material-check-decagram: exportfs i showmount: verificació NFS

!!! abstract "Concepte clau"
    `exportfs` gestiona les exportacions NFS actives: aplica canvis de `/etc/exports` sense reiniciar el servei i mostra l'estat actual. `showmount` consulta un servidor NFS per veure quines exportacions ofereix. Junts, son les eines de verificació essencials per confirmar que NFS funciona correctament al servidor i des del client.

=== ":material-notebook-outline: Apunts"

    ## exportfs

    `exportfs` (*export filesystem*) actualitza la taula de sistemes de fitxers exportats del kernel:

    | Opció | Significat |
    |-------|-----------|
    | `-r` / `-ra` | Re-export all: rellegeix `/etc/exports` i actualitza les exportacions |
    | `-v` | Verbose: mostra les exportacions actives amb les opcions detallades |
    | `-a` | Exporta tots els directoris de `/etc/exports` |
    | `-u HOST:DIR` | Unexport: deixa d'exportar un directori a un client concret |
    | `-f` | Flush: buidar la taula d'exportacions del kernel |

    ### Aplicar canvis de /etc/exports

    ```bash
    sudo exportfs -ra
    ```

    Executa'l **sempre** que modifiquis `/etc/exports`. Rellegeix el fitxer i notifica el kernel sense interrompre connexions actives.

    ### Veure les exportacions actives

    ```bash
    sudo exportfs -v
    ```

    Sortida esperada:
    ```text
    /perfils      	192.168.100.0/24(sync,wdelay,hide,no_subtree_check,sec=sys,rw,secure,no_root_squash,no_all_squash)
    ```

    NFS afegeix algunes opcions per defecte (`wdelay`, `hide`, `sec=sys`) que no has especificat a `/etc/exports` però que el servidor aplica internament. Les opcions rellevants son les que has definit tu: `rw`, `sync`, `no_subtree_check`, `no_root_squash`.

    ### Eliminar una exportació temporalment

    ```bash
    # Deixa d'exportar /perfils al client 192.168.100.20
    sudo exportfs -u 192.168.100.20:/perfils

    # Torna a aplicar tots els exports de /etc/exports
    sudo exportfs -ra
    ```

    ## showmount

    `showmount` consulta la informació de muntatge d'un servidor NFS:

    | Opció | Significat |
    |-------|-----------|
    | `-e HOST` | Mostra les exportacions (*export list*) del servidor |
    | `-a HOST` | Mostra tots els clients que han muntat alguna exportació |
    | `-d HOST` | Mostra els directoris que algun client ha muntat |

    ### Verificació al servidor

    ```bash
    showmount -e localhost
    ```

    ```text
    Export list for localhost:
    /perfils 192.168.100.0/24
    ```

    ### Verificació des del client

    ```bash
    # Des del client (192.168.100.20)
    showmount -e 192.168.100.10
    ```

    ```text
    Export list for 192.168.100.10:
    /perfils 192.168.100.0/24
    ```

    Si `showmount -e 192.168.100.10` falla des del client:
    1. Comprova connectivitat: `ping 192.168.100.10`
    2. Comprova que NFS és actiu al servidor: `systemctl status nfs-kernel-server`
    3. Comprova que els exports estan aplicats: `sudo exportfs -ra` (al servidor)

    ## Prova de muntatge manual

    Abans de configurar autofs (Bloc 8), pots verificar que NFS funciona amb un muntatge manual des del client:

    ```bash
    # Al client (192.168.100.20)
    sudo mkdir -p /mnt/test-nfs
    sudo mount -t nfs 192.168.100.10:/perfils /mnt/test-nfs
    ```

    Verifica el muntatge:
    ```bash
    df -h | grep nfs
    ```

    ```text
    192.168.100.10:/perfils   ...   /mnt/test-nfs
    ```

    Comprova que els fitxers son accessibles:
    ```bash
    ls -la /mnt/test-nfs/
    ```

    Ha de mostrar els directoris `/perfils/maria.puig`, `/perfils/pere.costa`, `/perfils/anna.valls` amb UID i GID correctes (1001, 1002, 1003 — resolts per SSSD).

    Desmunta quan hagis acabat:
    ```bash
    sudo umount /mnt/test-nfs
    ```

    !!! info "Ubuntu 22.04 vs 24.04: muntatge estàtic vs autofs"
        A Ubuntu 22.04, molts tutorials usaven `/etc/fstab` per muntar NFS permanentment al client. A Ubuntu 24.04, la solució recomanada és **autofs** (Bloc 8): munta el directori automàticament quan l'usuari hi accedeix i el desmunta quan deixa d'usar-lo. La pàgina 42 explica la diferència en detall.

    ## Flux complet del Bloc 7

    ```mermaid
    sequenceDiagram
        participant A as Admin
        participant E as /etc/exports
        participant X as exportfs
        participant K as Kernel NFS
        participant C as Client NFS

        A->>E: sudo nano /etc/exports<br/>/perfils 192.168.100.0/24(rw,...)
        A->>X: sudo exportfs -ra
        X->>E: llegeix /etc/exports
        X->>K: actualitza taula d'exports
        K-->>A: exportació activa

        C->>K: showmount -e 192.168.100.10
        K-->>C: /perfils 192.168.100.0/24

        C->>K: mount -t nfs 192.168.100.10:/perfils /mnt
        K-->>C: sistema de fitxers muntat
    ```

    ## Resum d'ordres NFS

    | Ordre | On s'executa | Funció |
    |-------|-------------|--------|
    | `sudo exportfs -ra` | Servidor | Aplica canvis de `/etc/exports` |
    | `sudo exportfs -v` | Servidor | Mostra exports actius amb opcions |
    | `showmount -e localhost` | Servidor | Verifica exports des del servidor |
    | `showmount -e 192.168.100.10` | Client | Verifica exports des del client |
    | `sudo mount -t nfs 192.168.100.10:/perfils /mnt` | Client | Munta manualment l'exportació NFS |
    | `df -h \| grep nfs` | Client | Verifica que el muntatge és actiu |
    | `sudo umount /mnt` | Client | Desmunta l'exportació |

    ??? question "Auto-avaluació"

        **1.** `showmount -e localhost` no mostra `/perfils` tot i que `/etc/exports` és correcte. Quins dos passos comproves i en quin ordre?

        ??? success "Resposta"
            (1) **Comprova si has executat `exportfs -ra`**: `showmount -e` consulta les exportacions actives al kernel, no el contingut de `/etc/exports`. Si no has executat `exportfs -ra` després d'editar el fitxer, el kernel no sap res de la nova exportació. Executa `sudo exportfs -ra` i torna a provar. (2) **Comprova l'estat del servei**: `systemctl status nfs-kernel-server`. Si no és `active (running)`, `showmount` no obtindrà resposta. Reinicia el servei si cal.

        **2.** Des del client, `showmount -e 192.168.100.10` retorna `clnt_create: RPC: Program not registered`. Quina és la causa i com ho resolus?

        ??? success "Resposta"
            L'error indica que el servei NFS no està actiu al servidor o que `rpcbind` (portmapper) no registra el servei NFS. Causes i solucions: (1) El servei NFS no funciona al servidor: `sudo systemctl start nfs-kernel-server`. (2) `rpcbind` no funciona correctament: `sudo systemctl restart rpcbind` (al servidor). (3) El firewall del servidor bloqueja el port 111 (rpcbind) o 2049 (NFS): `sudo ufw status` al servidor.

        **3.** Explica la diferència entre `exportfs -u 192.168.100.20:/perfils` i eliminar la línia de `/etc/exports`.

        ??? success "Resposta"
            `exportfs -u 192.168.100.20:/perfils` deixa d'exportar immediatament `/perfils` al client `192.168.100.20` però **no modifica `/etc/exports`**. Si executes `exportfs -ra` posteriorment, l'exportació tornarà perquè la línia continua al fitxer. Eliminar la línia de `/etc/exports` és permanent: després de `exportfs -ra`, l'exportació desapareix definitivament. Usa `exportfs -u` per a proves temporals o per desconnectar un client específic; modifica `/etc/exports` per a canvis permanents.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 7.4 · Verifica i prova NFS complet

    **Objectiu**: verificar les exportacions NFS i fer una prova de muntatge manual.

    **Temps estimat**: 20 minuts

    ---

    ### Part A – Verificació al servidor

    ```bash
    sudo exportfs -v
    showmount -e localhost
    ```

    Comprova que `/perfils` apareix exportada amb les opcions correctes (`rw`, `sync`, `no_root_squash`).

    ### Part B – Verificació des del client

    Des de `192.168.100.20`:
    ```bash
    showmount -e 192.168.100.10
    ```

    Ha de mostrar `/perfils 192.168.100.0/24`.

    ### Part C – Muntatge manual de prova

    Al client:
    ```bash
    sudo mkdir -p /mnt/test-nfs
    sudo mount -t nfs 192.168.100.10:/perfils /mnt/test-nfs
    df -h | grep nfs
    ls -la /mnt/test-nfs/
    ```

    Verifica que veus els directoris dels usuaris LDAP amb UID i GID correctes.

    ### Part D – Prova d'accés com a usuari LDAP

    ```bash
    # Crea un fitxer de prova com a maria.puig (si SSSD funciona al client)
    su - maria.puig -c "echo 'Hola des de NFS!' > /mnt/test-nfs/maria.puig/prova-nfs.txt"

    # Verifica el fitxer al servidor
    cat /perfils/maria.puig/prova-nfs.txt
    ```

    El fitxer creat al client via NFS ha d'aparèixer directament al servidor.

    ### Part E – Desmuntatge

    ```bash
    sudo umount /mnt/test-nfs
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"exportfs showmount NFS Linux verification commands"`
        - `"mount NFS share Ubuntu client test manual mount"`
        - `"NFS troubleshooting showmount exportfs Ubuntu 24.04"`
