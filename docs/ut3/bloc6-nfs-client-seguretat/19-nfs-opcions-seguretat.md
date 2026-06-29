---
title: NFS – Opcions de seguretat (noexec, nosuid)
tags:
  - ut3
  - nfs
  - seguretat
---

# :material-shield-lock: NFS – Opcions de seguretat (noexec, nosuid)

!!! abstract "Concepte clau"
    `noexec` impedeix l'execució de binaris des d'una exportació NFS muntada. `nosuid` ignora els bits SUID/SGID als fitxers remots. Ambdues opcions limiten el risc d'atacs de privilege escalation quan els clients no són totalment de confiança.

=== ":material-notebook-outline: Apunts"

    ## Per quin motiu cal restringir l'execució en NFS?

    Sense restriccions, un usuari amb accés d'escriptura a una exportació NFS podria:

    1. **Pujar un binari maliciós** a l'exportació
    2. **Executar-lo** des del punt de muntatge local
    3. Si el binari té SUID de root, **escalar privilegis** al sistema client

    Les opcions `noexec` i `nosuid` eviten aquests escenaris.

    ## Opcions de seguretat del muntatge

    ### noexec

    Impedeix l'execució de qualsevol binari o script des del punt de muntatge:

    ```bash
    sudo mount -t nfs -o noexec 192.168.100.10:/srv/nfs/dades /mnt/dades
    ```

    Intent d'execució des del client:

    ```bash
    # Copia un script al NFS
    cp /bin/ls /mnt/dades/ls-test

    # Intent d'execució: falla
    /mnt/dades/ls-test
    # bash: /mnt/dades/ls-test: Permission denied
    ```

    ### nosuid

    Ignora els bits SUID i SGID dels fitxers remots. Fins i tot si un fitxer té `chmod 4755` (SUID root), el kernel del client l'executa com a usuari normal:

    ```bash
    sudo mount -t nfs -o nosuid 192.168.100.10:/srv/nfs/dades /mnt/dades
    ```

    ### Combinació recomanada

    Per a exportacions on els clients no cal que executin res:

    ```bash
    sudo mount -t nfs -o ro,noexec,nosuid,nodev 192.168.100.10:/srv/nfs/dades /mnt/dades
    ```

    | Opció | Protegeix contra |
    |-------|-----------------|
    | `noexec` | Execució de binaris maliciosos |
    | `nosuid` | Privilege escalation via SUID |
    | `nodev` | Fitxers de dispositiu especials |
    | `ro` | Modificació de fitxers |

    ## Opcions al costat del servidor vs. del client

    Les opcions de seguretat es poden especificar tant al servidor (`/etc/exports`) com al client (`mount` o `/etc/fstab`). La seguretat real és al **client**: el servidor no pot forçar que el client munti amb `noexec`.

    | Opcions | On s'especifiquen | Qui les aplica |
    |---------|------------------|----------------|
    | `ro`, `rw`, `sync`, `no_root_squash` | `/etc/exports` al servidor | El servidor controla el permís |
    | `noexec`, `nosuid`, `nodev` | `mount` o `fstab` al client | El kernel del client les aplica |

    !!! warning "noexec no protegeix contra scripts interpretats"
        `noexec` impedeix l'execució directa de binaris (`./fitxer`), però un usuari que pugui invocar un intèrpret pot esquivar-ho: `bash /mnt/dades/script.sh` o `python3 /mnt/dades/exploit.py` funcionen tot i `noexec`. La defensa completa requereix combinar `noexec` + control d'accés + `ro` quan sigui possible.

    ## /etc/fstab amb opcions de seguretat

    ```
    192.168.100.10:/srv/nfs/dades   /mnt/nfs/dades   nfs   ro,noexec,nosuid,nodev,_netdev   0   0
    ```

    ??? question "Auto-avaluació"
        **1.** Quina opció de muntatge NFS impedeix l'execució de binaris des de l'exportació?

        ??? success "Resposta"
            `noexec`. Amb aquesta opció, el kernel del client rebutja qualsevol intent d'execució de fitxers ubicats al punt de muntatge NFS, independentment dels permisos de fitxer (`chmod +x`). El fitxer pot existir i tenir permisos d'execució, però el kernel no el deixarà executar.

        **2.** En quin costat (servidor o client) s'apliquen `noexec` i `nosuid`?

        ??? success "Resposta"
            Al **client**, a les opcions de muntatge (`mount -o noexec,nosuid ...` o a `/etc/fstab`). El servidor NFS no pot forçar que el client munti amb aquestes opcions; és responsabilitat de l'administrador del client aplicar-les. Per seguretat, cal gestionar tant el servidor (qui pot muntar) com el client (com es munta).

        **3.** Quina és la diferència entre `nosuid` i `no_root_squash`?

        ??? success "Resposta"
            `nosuid` (opció del client) ignora els bits SUID/SGID dels fitxers al punt de muntatge — evita que un fitxer SUID root s'executi com a root al client. `no_root_squash` (opció del servidor a `/etc/exports`) permet que l'usuari root del client accedeixi als fitxers com a root al servidor. Són mecanismes independents: `nosuid` protegeix el client; `no_root_squash`/`root_squash` protegeix el servidor.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.19 · Opcions de seguretat noexec i nosuid

    **Objectiu**: verificar l'efecte de `noexec` i `nosuid` en un muntatge NFS.
    **Temps estimat**: 25 minuts

    ---

    ### Pas 1 – Munta sense restriccions (baseline)

    ```bash
    sudo mount -t nfs 192.168.100.10:/srv/nfs/dades /mnt/nfs/dades
    ```

    Copia un script al NFS i executa'l:

    ```bash
    echo '#!/bin/bash
    echo "Script executat!"' | sudo tee /mnt/nfs/dades/test.sh
    sudo chmod +x /mnt/nfs/dades/test.sh
    /mnt/nfs/dades/test.sh   # Ha d'executar-se
    ```

    ### Pas 2 – Desmunta i remunta amb noexec

    ```bash
    sudo umount /mnt/nfs/dades
    sudo mount -t nfs -o noexec 192.168.100.10:/srv/nfs/dades /mnt/nfs/dades
    ```

    Intenta executar el mateix script:

    ```bash
    /mnt/nfs/dades/test.sh   # Ha de donar "Permission denied"
    ```

    ### Pas 3 – Verifica que l'intèrpret esquiva noexec

    ```bash
    bash /mnt/nfs/dades/test.sh   # Funciona igualment!
    ```

    Documenta i reflexiona: per quin motiu `bash script.sh` funciona però `./script.sh` no?

    ### Pas 4 – Afegeix a /etc/fstab amb seguretat completa

    ```
    192.168.100.10:/srv/nfs/dades   /mnt/nfs/dades   nfs   rw,sync,noexec,nosuid,nodev,_netdev   0   0
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"NFS noexec nosuid mount options security"`
        - `"Linux mount noexec security explained"`
        - `"NFS privilege escalation prevention Linux"`
