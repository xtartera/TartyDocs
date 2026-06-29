---
title: Samba – Quotes i límits de fitxer
tags:
  - ut3
  - samba
---

# :material-database-check: Samba – Quotes i límits de fitxer

!!! abstract "Concepte clau"
    Samba permet limitar la **mida màxima dels fitxers** pujats (`max file size`) i **simular l'espai disponible** d'un recurs (`dfree command`). Aquests mecanismes controlen l'ús del disc per part dels usuaris i eviten que un recurs es quedi sense espai.

=== ":material-notebook-outline: Apunts"

    ## Limitació de la mida dels fitxers

    La directiva `max file size` impedeix pujar fitxers que superin una mida determinada:

    ```ini
    [alumnes]
        path = /srv/samba/alumnes
        valid users = @alumnes
        write list = @alumnes
        max file size = 10485760
    ```

    El valor és en **bytes**:

    | Valor | Equivalent |
    |-------|-----------|
    | `1048576` | 1 MB |
    | `10485760` | 10 MB |
    | `104857600` | 100 MB |
    | `1073741824` | 1 GB |

    Quan un usuari intenta pujar un fitxer que supera el límit, Samba rebutja l'operació amb l'error "Disc ple" o "Operació no permesa" al client.

    ## Simulació d'espai disponible (dfree command)

    La directiva `dfree command` permet executar un script que retorna l'espai lliure "virtual" del recurs, independent de l'espai real del disc:

    ```ini
    [alumnes]
        path = /srv/samba/alumnes
        valid users = @alumnes
        write list = @alumnes
        dfree command = /usr/local/bin/dfree-alumnes.sh
    ```

    El script ha de retornar dos valors separats per espai: **espai total** i **espai lliure** (en blocs de 1 KB):

    ```bash
    #!/bin/bash
    # /usr/local/bin/dfree-alumnes.sh
    # Simula 1 GB total, 512 MB lliures
    echo "1048576 524288"
    ```

    ```bash
    sudo chmod +x /usr/local/bin/dfree-alumnes.sh
    ```

    ### Cas d'ús pedagògic

    En entorns escolars, es pot usar `dfree command` per mostrar als alumnes que el seu "disc" té capacitat limitada, fins i tot si el disc físic del servidor té molt d'espai disponible:

    ```bash
    #!/bin/bash
    # Simula una quota de 500 MB per usuari
    USED=$(du -sk /srv/samba/alumnes 2>/dev/null | cut -f1)
    TOTAL=512000
    FREE=$(( TOTAL - USED ))
    [ $FREE -lt 0 ] && FREE=0
    echo "$TOTAL $FREE"
    ```

    ## Comparativa: limitació de fitxer vs. quotes reals

    | Mecanisme | Granularitat | Implementació |
    |-----------|-------------|---------------|
    | `max file size` | Per fitxer individual | Directiva `smb.conf` |
    | `dfree command` | Espai visible al client | Script personalitzat |
    | Quotes Linux (`quota`) | Per usuari/grup, al disc | `quota`, `repquota`, `edquota` |
    | Quotes BTRFS/ZFS | Per volum, al FS | Nativo del FS |

    `max file size` i `dfree command` són **simulació** a nivell Samba. Per a quotes reals, cal configurar les quotes del sistema de fitxers Linux.

    !!! tip "Connexió amb UT1"
        A Windows Server, les quotes de disc es configuren des de la consola de gestió "File Server Resource Manager" (FSRM) amb polítiques per carpeta i per usuari. A Samba, la implementació nativa és més limitada; `max file size` i `dfree command` són eines complementàries, no equivalents complets de FSRM.

    !!! warning "Error freqüent"
        L'script de `dfree command` ha de ser **executable** (`chmod +x`) i ha de retornar exactament dos números separats per un espai. Si retorna text addicional o té un format diferent, Samba ignora el resultat i mostra l'espai real del disc.

    ??? question "Auto-avaluació"
        **1.** Quin valor de `max file size` cal posar per limitar els fitxers a 50 MB?

        ??? success "Resposta"
            `52428800` (50 × 1024 × 1024 = 52.428.800 bytes). Cal recordar que el valor és en bytes, no en megabytes.

        **2.** Quins dos valors ha de retornar el script de `dfree command`?

        ??? success "Resposta"
            Espai **total** i espai **lliure**, tots dos en blocs de 1 KB, separats per un espai. Per exemple, `1048576 524288` significa 1 GB total i 512 MB lliures.

        **3.** Quina diferència hi ha entre `max file size` i les quotes del sistema de fitxers Linux?

        ??? success "Resposta"
            `max file size` limita la mida d'un **fitxer individual** en el moment de la pujada via SMB. Les quotes del sistema de fitxers Linux limiten l'**espai total** que pot usar un usuari o grup al disc, independentment del nombre de fitxers. Les quotes Linux s'apliquen a qualsevol accés (Samba, NFS, local), mentre que `max file size` només s'aplica via Samba.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.10 · Límit de mida i simulació d'espai

    **Objectiu**: configurar `max file size` i un script `dfree command` personalitzat.
    **Temps estimat**: 35 minuts

    ---

    ### Pas 1 – Configura max file size

    Afegeix a la secció `[alumnes]` de `smb.conf`:

    ```ini
    max file size = 5242880
    ```

    (5 MB màxim)

    ### Pas 2 – Prova el límit

    Des del client, intenta pujar un fitxer de 6 MB:

    ```bash
    # Crea un fitxer de 6 MB al client
    dd if=/dev/zero of=/tmp/fitxer-gran.dat bs=1M count=6

    # Intenta pujar-lo via smbclient
    smbclient //192.168.100.10/alumnes -U maria.puig -c "put /tmp/fitxer-gran.dat gran.dat"
    ```

    Documenta l'error que retorna Samba.

    ### Pas 3 – Crea el script dfree

    ```bash
    sudo nano /usr/local/bin/dfree-alumnes.sh
    ```

    Contingut:

    ```bash
    #!/bin/bash
    echo "102400 51200"
    ```

    (100 MB total, 50 MB lliures simulats)

    ```bash
    sudo chmod +x /usr/local/bin/dfree-alumnes.sh
    ```

    ### Pas 4 – Configura i verifica

    Afegeix a `smb.conf`:

    ```ini
    dfree command = /usr/local/bin/dfree-alumnes.sh
    ```

    Reinicia `smbd` i comprova l'espai disponible des del client Windows (propietats de la unitat de xarxa).

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Samba max file size limit configuration"`
        - `"Samba dfree command disk quota script"`
        - `"Linux Samba disk quota control"`
