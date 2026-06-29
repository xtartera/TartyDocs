---
title: NFS – all_squash, anonuid, anongid
tags:
  - ut3
  - nfs
  - seguretat
---

# :material-account-convert: NFS – all_squash, anonuid, anongid

!!! abstract "Concepte clau"
    `all_squash` mapeja **tots** els usuaris del client (inclòs root) a un usuari anònim al servidor. `anonuid` i `anongid` especifiquen l'UID/GID d'aquest usuari anònim. Permet control·lar col·lectivament qui és el propietari dels fitxers creats via NFS, independentment de quin usuari del client els crea.

=== ":material-notebook-outline: Apunts"

    ## El problema de UID/GID en NFS

    NFS no autentica usuaris: confia cegament en els UID/GID que envia el client. Si el client té `maria.puig` amb UID 1001 i el servidor té un usuari diferent amb UID 1001, les operacions de fitxers s'atribuiran a l'usuari equivocat al servidor.

    ```mermaid
    graph LR
        subgraph Client["Client · 192.168.100.20"]
            U1["maria.puig · UID 1001"]
        end
        subgraph Servidor["Servidor · 192.168.100.10"]
            F["/srv/nfs/dades"]
            U2["joan.mas · UID 1001"]
        end
        U1 -->|"crea fitxer\nUID 1001"| F
        F -->|"propietari vist\ncom..."| U2
    ```

    El fitxer creat per `maria.puig` al client apareix com a propietat de `joan.mas` al servidor (si ambdós tenen UID 1001). Confusió garantida.

    ## Les tres opcions de squash

    | Opció `/etc/exports` | Comportament |
    |---------------------|-------------|
    | `root_squash` | Root del client → `nobody` al servidor. Resta d'usuaris: UID/GID sense modificar. **Per defecte.** |
    | `no_root_squash` | Root del client → root al servidor. **Perillós.** |
    | `all_squash` | Tots els usuaris del client → `nobody` (o anonuid/anongid) al servidor |

    ## all_squash + anonuid + anongid

    ```
    /srv/nfs/dades   192.168.100.0/24(rw,sync,all_squash,anonuid=2001,anongid=2001,no_subtree_check)
    ```

    Amb aquesta configuració:

    1. Qualsevol usuari del client (UID 1001, 1002, root...) → mapejat a UID 2001 al servidor
    2. El servidor veu tots els fitxers com a propietat de l'UID 2001
    3. Cal que l'UID 2001 existeixi al servidor o tingui permisos sobre el directori

    ### Creació de l'usuari anònim al servidor

    ```bash
    # Crea un usuari per als accesos NFS anònims
    sudo adduser --uid 2001 --no-create-home --disabled-login nfs-client
    sudo groupmod -g 2001 nfs-client

    # Assigna la carpeta al nou usuari
    sudo chown nfs-client:nfs-client /srv/nfs/dades
    sudo chmod 770 /srv/nfs/dades
    ```

    ## Sincronització de UID/GID (sense all_squash)

    Quan **no** uses `all_squash`, el client i el servidor han de tenir els **mateixos UID/GID** per als usuaris que compartiran fitxers:

    | Element | Client | Servidor |
    |---------|--------|---------|
    | `maria.puig` | UID 1001 | UID 1001 ✅ |
    | `pere.costa` | UID 1002 | UID 1002 ✅ |
    | `alumnes` (grup) | GID 2001 | GID 2001 ✅ |

    Si els UID no coincideixen, els permisos seran incorrectes. En entorns amb LDAP (UT2), els UID/GID es gestionen centralment i la sincronització és automàtica.

    ## Verificació

    ```bash
    # Al servidor: verifica les opcions actives
    sudo exportfs -v

    # Al client: crea un fitxer i comprova el propietari al servidor
    # (des del client)
    echo "prova" | sudo tee /mnt/nfs/dades/prova-squash.txt

    # (al servidor)
    ls -la /srv/nfs/dades/prova-squash.txt
    # Ha de mostrar propietari nfs-client (UID 2001)
    ```

    !!! warning "Error freqüent"
        El client crea fitxers però no pot llegir-los o modificar-los després. Causa habitual: UID/GID incompatibles entre client i servidor. El fitxer queda propietat d'un UID sense correspondència. Solució: sincronitzar UID/GID via LDAP, o usar `all_squash` + `anonuid`/`anongid` per a accés col·lectiu.

    ??? question "Auto-avaluació"
        **1.** Quina diferència hi ha entre `root_squash` i `all_squash`?

        ??? success "Resposta"
            `root_squash` (per defecte) únicament mapeja l'usuari **root** del client a `nobody` al servidor; els altres usuaris conserven el seu UID/GID. `all_squash` mapeja **tots** els usuaris del client (inclòs root) a l'usuari anònim (`nobody` o l'especificat per `anonuid`/`anongid`).

        **2.** Quin UID tindrà un fitxer creat per `maria.puig` (UID 1001) al client, si l'exportació té `all_squash,anonuid=2001`?

        ??? success "Resposta"
            L'UID **2001**. `all_squash` mapeja qualsevol UID del client a l'UID anònim. `anonuid=2001` especifica que l'UID anònim és el 2001. Per tant, el fitxer apareixerà al servidor com a propietat de l'usuari amb UID 2001 (p. ex. `nfs-client`), independentment de qui el creï al client.

        **3.** Per quin motiu en entorns sense LDAP és important que els UID dels usuaris coincideixin entre el client NFS i el servidor?

        ??? success "Resposta"
            NFS transmet el UID/GID del client tal qual, sense autenticar-lo. El servidor interpreta aquell UID com el propietari al seu propi sistema de fitxers. Si l'UID 1001 al client és `maria.puig` però al servidor l'UID 1001 és `joan.mas`, els fitxers creats per `maria.puig` al client apareixeran com a propietat de `joan.mas` al servidor, causant problemes de permisos i confusió.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.21 · all_squash i anonuid/anongid

    **Objectiu**: configurar `all_squash` amb un usuari anònim fix i verificar que tots els fitxers creats via NFS pertanyen al mateix UID.
    **Temps estimat**: 35 minuts

    ---

    ### Pas 1 – Crea l'usuari anònim al servidor

    ```bash
    sudo adduser --uid 2001 --no-create-home --disabled-login nfs-anon
    sudo chown nfs-anon:nfs-anon /srv/nfs/dades
    sudo chmod 770 /srv/nfs/dades
    ```

    ### Pas 2 – Configura /etc/exports amb all_squash

    ```
    /srv/nfs/dades   192.168.100.0/24(rw,sync,all_squash,anonuid=2001,anongid=2001,no_subtree_check)
    ```

    ```bash
    sudo exportfs -ra
    sudo exportfs -v
    ```

    ### Pas 3 – Munta al client i crea fitxers amb diferents usuaris

    ```bash
    sudo mount -t nfs 192.168.100.10:/srv/nfs/dades /mnt/nfs/dades

    # Com a root
    sudo bash -c 'echo "fitxer root" > /mnt/nfs/dades/root.txt'

    # Com a maria.puig
    su - maria.puig -c 'echo "fitxer maria" > /mnt/nfs/dades/maria.txt'
    ```

    ### Pas 4 – Verifica al servidor

    ```bash
    ls -la /srv/nfs/dades/
    ```

    Tots els fitxers han de mostrar `nfs-anon` (UID 2001) com a propietari, independentment de qui els hagi creat al client.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"NFS all_squash anonuid anongid explained"`
        - `"NFS UID GID squash mapping Linux"`
        - `"NFS root_squash vs all_squash Linux"`
