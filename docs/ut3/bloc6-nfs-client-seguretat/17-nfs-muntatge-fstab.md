---
title: NFS – Muntatge persistent (/etc/fstab)
tags:
  - ut3
  - nfs
---

# :material-file-cog: NFS – Muntatge persistent (/etc/fstab)

!!! abstract "Concepte clau"
    `/etc/fstab` automatitza el muntatge NFS a cada reinici del client. L'opció `_netdev` és imprescindible: indica al sistema que esperi la xarxa abans de muntar, evitant errors d'arrencada si el servidor no és accessible immediatament.

=== ":material-notebook-outline: Apunts"

    ## Format de l'entrada NFS a /etc/fstab

    ```
    servidor:/ruta   punt-de-muntatge   nfs   opcions   0   0
    ```

    Exemple concret:

    ```
    192.168.100.10:/srv/nfs/dades   /mnt/nfs/dades   nfs   rw,sync,hard,intr,_netdev   0   0
    ```

    ### Camps de /etc/fstab

    | Camp | Valor exemple | Funció |
    |------|--------------|--------|
    | Dispositiu | `192.168.100.10:/srv/nfs/dades` | Servidor i ruta remota |
    | Punt de muntatge | `/mnt/nfs/dades` | Directori local on es munta |
    | Tipus | `nfs` o `nfs4` | Protocol de sistema de fitxers |
    | Opcions | `rw,sync,hard,intr,_netdev` | Opcions de muntatge |
    | dump | `0` | No fer backup amb `dump` (sempre 0 per a NFS) |
    | pass | `0` | No comprovar el FS amb `fsck` (sempre 0 per a NFS) |

    ## L'opció _netdev és obligatòria

    !!! warning "_netdev és obligatòria en NFS"
        Sense `_netdev`, el sistema intenta muntar el directori NFS **abans** que la xarxa estigui disponible durant l'arrencada. Resultat: el sistema queda penjat o entra en mode de recuperació. **Sempre inclou `_netdev` a les entrades NFS de `/etc/fstab`**.

    Amb `_netdev`, systemd sap que ha d'esperar que la xarxa estigui activa (`network.target`) abans de muntar el sistema de fitxers.

    ## Opcions recomanades per a /etc/fstab NFS

    ```
    192.168.100.10:/srv/nfs/dades   /mnt/nfs/dades   nfs   rw,sync,hard,intr,_netdev,timeo=14,retrans=5   0   0
    ```

    | Opció | Funció |
    |-------|--------|
    | `rw` | Lectura i escriptura |
    | `sync` | Escriptura síncrona |
    | `hard` | Reintenta si el servidor no respon |
    | `intr` | Permet interrompre operacions amb Ctrl+C |
    | `_netdev` | Espera la xarxa per muntar |
    | `timeo=14` | Temps d'espera inicial (en 0,1s = 1,4 s) |
    | `retrans=5` | Nombre de reintentos abans de retornar error |

    ## Aplicació sense reiniciar

    Un cop editat `/etc/fstab`, comprova i aplica sense reiniciar:

    ```bash
    # Verifica la sintaxi de fstab
    sudo findmnt --verify

    # Munta tots els sistemes pendents de /etc/fstab
    sudo mount -a
    ```

    Si no hi ha errors, el muntatge és actiu:

    ```bash
    df -h | grep nfs
    ```

    ## Verificació a l'arrencada

    Després de reiniciar el client, verifica que el muntatge NFS s'ha fet automàticament:

    ```bash
    sudo reboot
    # ... (reinici)
    df -h | grep nfs
    mount | grep nfs
    ```

    ## Comparativa: muntatge manual vs. fstab vs. autofs

    | Mètode | Quan munta | Persisteix | Cas d'ús |
    |--------|-----------|-----------|----------|
    | `mount -t nfs` manual | Ara, fins al reinici | No | Proves, accés puntual |
    | `/etc/fstab` | A cada reinici | Sí | Recursos fixes sempre muntats |
    | `autofs` (UT2 Bloc 8) | Quan s'accedeix | Sí | Perfils mòbils, molts usuaris |

    !!! tip "Connexió amb UT2"
        A la UT2 vam usar `autofs` per als perfils mòbils: muntatge dinàmic quan l'usuari inicia sessió. `/etc/fstab` és més senzill però munta sempre, tant si l'usuari accedeix com si no. Per a recursos que sempre han d'estar disponibles (discs compartits de l'empresa), `/etc/fstab` és la solució correcta.

    ??? question "Auto-avaluació"
        **1.** Per quin motiu és imprescindible l'opció `_netdev` a `/etc/fstab` per a muntatges NFS?

        ??? success "Resposta"
            Perquè `/etc/fstab` es processa durant l'arrencada, **abans** que la xarxa estigui completament disponible. Sense `_netdev`, el sistema intenta muntar el directori NFS quan la xarxa encara no funciona, causant errors o bloquejos a l'arrencada. `_netdev` indica a systemd que postposi el muntatge fins que la xarxa estigui activa.

        **2.** Quina ordre aplica els canvis de `/etc/fstab` sense reiniciar el sistema?

        ??? success "Resposta"
            `sudo mount -a`. Munta tots els sistemes de fitxers definits a `/etc/fstab` que encara no estan muntats. Útil per provar que l'entrada és correcta sense necessitat de reiniciar. Complementa amb `sudo findmnt --verify` per validar la sintaxi de `/etc/fstab`.

        **3.** Quins valors han de tenir els camps "dump" i "pass" per a una entrada NFS a `/etc/fstab`?

        ??? success "Resposta"
            Tots dos `0`. El camp "dump" controla si `dump` fa còpies de seguretat del FS (0 = no); el camp "pass" controla si `fsck` comprova el FS a l'arrencada (0 = no). Per a sistemes de fitxers de xarxa com NFS, no té sentit fer `dump` ni `fsck` localment.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.17 · Muntatge persistent via /etc/fstab

    **Objectiu**: configurar el muntatge automàtic d'una exportació NFS via `/etc/fstab` i verificar la persistència.
    **Temps estimat**: 30 minuts

    ---

    ### Pas 1 – Fes una còpia de seguretat de fstab

    ```bash
    sudo cp /etc/fstab /etc/fstab.bak
    ```

    ### Pas 2 – Crea el punt de muntatge

    ```bash
    sudo mkdir -p /mnt/nfs/dades
    ```

    ### Pas 3 – Afegeix l'entrada NFS a /etc/fstab

    ```bash
    echo "192.168.100.10:/srv/nfs/dades   /mnt/nfs/dades   nfs   rw,sync,hard,intr,_netdev   0   0" | sudo tee -a /etc/fstab
    ```

    ### Pas 4 – Verifica la sintaxi i aplica

    ```bash
    sudo findmnt --verify
    sudo mount -a
    df -h | grep nfs
    ```

    ### Pas 5 – Prova la persistència

    ```bash
    sudo reboot
    # Espera el reinici i verifica:
    df -h | grep nfs
    ls /mnt/nfs/dades
    ```

    El muntatge ha d'aparèixer automàticament sense cap ordre manual.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"NFS fstab persistent mount Linux _netdev"`
        - `"etc/fstab NFS mount Ubuntu tutorial"`
        - `"Linux fstab NFS options explained"`
