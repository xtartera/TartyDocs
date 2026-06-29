---
title: exportfs i showmount
tags:
  - ut3
  - nfs
---

# :material-console: exportfs i showmount

!!! abstract "Concepte clau"
    `exportfs -ra` aplica els canvis de `/etc/exports` **sense reiniciar el servei NFS**. `showmount -e` llista les exportacions actives des del servidor o des del client, i és l'eina principal per verificar que les exportacions estan disponibles.

=== ":material-notebook-outline: Apunts"

    ## exportfs — gestió de les exportacions actives

    `exportfs` és l'eina per gestionar les exportacions NFS en temps real, sense necessitat de reiniciar `nfs-server`.

    ### Opcions principals

    | Opció | Funció |
    |-------|--------|
    | `exportfs -ra` | Re-llegeix `/etc/exports` i actualitza totes les exportacions (**la més usada**) |
    | `exportfs -v` | Llista totes les exportacions actives amb totes les opcions efectives |
    | `exportfs -u client:/ruta` | Des-exporta un directori (el treu de la llista activa) |
    | `exportfs -a` | Exporta tots els directoris de `/etc/exports` |

    ### Exemple: aplicar un canvi a /etc/exports

    ```bash
    # 1. Edita /etc/exports
    sudo nano /etc/exports

    # 2. Aplica sense reiniciar el servei
    sudo exportfs -ra

    # 3. Verifica el resultat
    sudo exportfs -v
    ```

    Sortida de `exportfs -v`:

    ```text
    /srv/nfs/dades
                192.168.100.0/24(sync,wdelay,hide,no_subtree_check,sec=sys,rw,secure,root_squash,no_all_squash)
    /srv/nfs/backup
                192.168.100.20(sync,wdelay,hide,no_subtree_check,sec=sys,ro,secure,root_squash,no_all_squash)
    ```

    !!! tip "Opcions per defecte visibles"
        `exportfs -v` mostra **totes** les opcions actives, incloses les que no has especificat explícitament (com `root_squash`, `wdelay`, `secure`...). És útil per entendre el comportament real de l'exportació.

    ## showmount — verificació des de servidor i client

    `showmount` és l'eina de consulta: permet veure les exportacions disponibles i els clients que estan muntant-les.

    ### Des del servidor (auto-consulta)

    ```bash
    showmount -e localhost
    showmount -e 127.0.0.1
    ```

    Sortida:

    ```text
    Export list for localhost:
    /srv/nfs/dades  192.168.100.0/24
    /srv/nfs/backup 192.168.100.20
    ```

    ### Des del client (consulta remota)

    ```bash
    # Desde el client (192.168.100.20)
    showmount -e 192.168.100.10
    ```

    Si el servidor és accessible i les exportacions estan actives, mostra la mateixa llista.

    ### Opcions de showmount

    | Opció | Funció |
    |-------|--------|
    | `showmount -e servidor` | Llista les exportacions del servidor |
    | `showmount -a servidor` | Llista tots els clients muntats amb la ruta que munten |
    | `showmount -d servidor` | Llista els directoris muntats per algun client |

    ## Seqüència completa de posada en marxa NFS

    ```bash
    # Al servidor

    # 1. Instal·la
    sudo apt install nfs-kernel-server -y

    # 2. Crea el directori
    sudo mkdir -p /srv/nfs/dades
    sudo chown nobody:nogroup /srv/nfs/dades

    # 3. Edita /etc/exports
    echo "/srv/nfs/dades 192.168.100.0/24(rw,sync,no_subtree_check)" | sudo tee -a /etc/exports

    # 4. Aplica
    sudo exportfs -ra

    # 5. Verifica
    showmount -e localhost
    ```

    !!! warning "Error freqüent"
        Modificar `/etc/exports` però no fer `exportfs -ra`. El servei continua exportant la configuració anterior. L'error clàssic: el client no veu l'exportació nova o segueix veient una exportació que ja s'ha eliminat. Recorda sempre: **exportfs -ra després de cada canvi a /etc/exports**.

    ??? question "Auto-avaluació"
        **1.** Quina ordre aplica els canvis de `/etc/exports` sense reiniciar el servei NFS?

        ??? success "Resposta"
            `sudo exportfs -ra`. L'opció `-r` re-exporta tots els directoris (re-read `/etc/exports`) i `-a` afecta totes les exportacions. Equivalent a `exportfs -r` + `exportfs -a`.

        **2.** Quina diferència hi ha entre `showmount -e` i `exportfs -v`?

        ??? success "Resposta"
            `showmount -e` mostra la llista d'exportacions i els clients autoritzats (similar a la vista d'un client extern). `exportfs -v` mostra les exportacions amb **totes les opcions efectives** (incloses les per defecte), útil per al diagnòstic detallat. `showmount -e` és la verificació ràpida; `exportfs -v` és la verificació tècnica detallada.

        **3.** Quina ordre mostra quins clients estan muntat activament una exportació NFS?

        ??? success "Resposta"
            `showmount -a servidor`. Llista tots els parells `client:ruta-muntada` actius. Útil per saber qui està connectat en un moment determinat.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.15 · exportfs i showmount

    **Objectiu**: practicar l'ús de `exportfs` i `showmount` per gestionar i verificar exportacions NFS.
    **Temps estimat**: 20 minuts

    ---

    ### Pas 1 – Aplica la configuració actual

    ```bash
    sudo exportfs -ra
    sudo exportfs -v
    ```

    Documenta totes les opcions efectives que mostra `exportfs -v`.

    ### Pas 2 – Verifica des del servidor

    ```bash
    showmount -e localhost
    ```

    ### Pas 3 – Verifica des del client

    ```bash
    # Des del client (192.168.100.20)
    showmount -e 192.168.100.10
    ```

    Ha de mostrar la mateixa llista d'exportacions. Si no funciona, comprova el firewall al servidor.

    ### Pas 4 – Des-exporta temporalment i comprova

    ```bash
    # Des-exporta /srv/nfs/backup
    sudo exportfs -u 192.168.100.20:/srv/nfs/backup

    # Verifica que ja no apareix
    showmount -e localhost

    # Torna a exportar
    sudo exportfs -ra
    showmount -e localhost
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"exportfs ra command NFS Linux"`
        - `"showmount NFS Linux tutorial"`
        - `"NFS verify exports showmount exportfs"`
