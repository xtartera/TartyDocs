---
title: "/etc/auto.master"
tags:
  - ut2
  - autofs
---

# :material-file-tree: /etc/auto.master: el mapa principal d'autofs

!!! abstract "Concepte clau"
    `/etc/auto.master` és el fitxer de configuració principal d'autofs. Cada línia indica un **punt de muntatge base**, el **mapa de detall** que ha d'usar per als muntatges dins d'aquell punt, i les **opcions** (timeout, ghost). Qualsevol canvi a `auto.master` requereix reiniciar autofs.

=== ":material-notebook-outline: Apunts"

    ## Format d'auto.master

    ```text
    PUNT-DE-MUNTATGE   MAPA   [OPCIONS]
    ```

    | Camp | Descripció |
    |------|-----------|
    | `PUNT-DE-MUNTATGE` | Directori base on autofs controlarà els muntatges |
    | `MAPA` | Fitxer (o programa) que descriu com muntar cada entrada |
    | `OPCIONS` | Paràmetres addicionals d'autofs (timeout, ghost, etc.) |

    ## Contingut per defecte a Ubuntu 24.04

    ```bash
    cat /etc/auto.master
    ```

    ```text title="/etc/auto.master (per defecte)"
    # This is an automounter map and it has the following format
    # key [ -mount-options-separated-by-comma ] location
    # For details of the format look at autofs(5).
    #
    +dir:/etc/auto.master.d
    #
    # Include /etc/auto.master.d/*.autofs
    # To add new entries copy the file 'README.auto.master' to 'name.autofs'
    # (where 'name' is descriptive) in the /etc/auto.master.d directory.

    +auto.master
    ```

    El fitxer per defecte inclou dos mecanismes d'inclusió:
    - `+dir:/etc/auto.master.d` → inclou tots els fitxers `.autofs` del directori
    - `+auto.master` → inclou un mapa NIS/LDAP si n'hi ha

    ## Configuració per al laboratori

    Edita `/etc/auto.master` i afegeix la línia per al directori de perfils:

    ```bash
    sudo nano /etc/auto.master
    ```

    Afegeix al final (o substitueix la línia de prova de la pàgina 39 si en tenies):

    ```text title="/etc/auto.master (laboratori)"
    /perfils    /etc/auto.perfils    --timeout=60 --ghost
    ```

    Significat:

    | Part | Valor | Significat |
    |------|-------|-----------|
    | Punt de muntatge | `/perfils` | autofs controla tot el que hi ha sota `/perfils/` |
    | Mapa | `/etc/auto.perfils` | El fitxer que defineix com muntar cada usuari |
    | `--timeout=60` | 60 segons | Desmunta el directori si no s'ha accedit en 60 s |
    | `--ghost` | activat | Crea directoris fantasma per als usuaris coneguts |

    ## Les opcions: --timeout i --ghost

    ### --timeout=60

    autofs desmunta un directori passat el temps especificat d'inactivitat:

    ```bash
    # Comprova quant de temps porta actiu un muntatge
    cat /proc/mounts | grep autofs
    ```

    Per al laboratori, 60 segons és suficient. En producció, valors entre 300 i 600 son habituals.

    ### --ghost

    !!! danger "No oblidis `--ghost` — és el error crític d'autofs"
        Sense `--ghost`, autofs **no crea els directoris** de `/perfils/` fins que algú hi accedeix explícitament. El resultat és que quan PAM intenta obrir la sessió de `maria.puig` a `/perfils/maria.puig`, el directori no existeix aparentment i el login falla o obre la sessió a `/` amb un avís.

        ```text
        # Sense --ghost: el login pot fallar amb:
        su: warning: cannot change directory to /perfils/maria.puig: No such file or directory
        ```

        Amb `--ghost`, autofs crea directoris buits (punts de muntatge virtuals) per a totes les entrades del mapa. Quan PAM accedeix a `/perfils/maria.puig`, autofs dispara el muntatge NFS immediatament.

    ## Aplicació dels canvis

    Qualsevol canvi a `/etc/auto.master` requereix reiniciar autofs:

    ```bash
    sudo systemctl restart autofs
    ```

    Verifica que autofs ha carregat la configuració:
    ```bash
    systemctl status autofs
    sudo journalctl -u autofs -n 20
    ```

    ## Verificació: el directori /perfils és gestionat per autofs

    ```bash
    # Comprova que autofs gestiona /perfils
    cat /proc/mounts | grep autofs
    ```

    Sortida esperada:
    ```text
    /etc/auto.perfils /perfils autofs rw,relatime,fd=...,pgrp=...,timeout=60,minproto=5,maxproto=5,direct,pipe_ino=... 0 0
    ```

    ```bash
    # Intenta llistar /perfils (amb --ghost ha de mostrar els directoris)
    ls /perfils
    ```

    ```text
    maria.puig  pere.costa  anna.valls
    ```

    Si `/etc/auto.perfils` existeix i té entrades vàlides (pàgina 41), els tres directoris apareixeran com a fantasmes.

    ??? question "Auto-avaluació"

        **1.** Tens la línia `/perfils /etc/auto.perfils --timeout=60` a `auto.master`. `ls /perfils` mostra un directori buit. Quina opció has oblidat?

        ??? success "Resposta"
            Has oblidat `--ghost`. Sense `--ghost`, autofs no crea els directoris fantasma i `/perfils` sembla buit fins que algú intenta accedir a un subdirectori específicament (per exemple, `ls /perfils/maria.puig` dispara el muntatge). Afegeix `--ghost` a la línia: `/perfils /etc/auto.perfils --timeout=60 --ghost` i executa `sudo systemctl restart autofs`.

        **2.** Per quin motiu la línia de `auto.master` apunta a un fitxer (`/etc/auto.perfils`) en comptes de definir el muntatge directament?

        ??? success "Resposta"
            La separació en dos fitxers facilita la gestió: `auto.master` és l'índex (on es munten les coses) i `auto.perfils` és el detall (com es munta cada entrada). Si tens 100 usuaris, afegeixes les seves entrades a `auto.perfils` sense tocar `auto.master`. A més, pots tenir múltiples mapes per a múltiples punts de muntatge (`/perfils`, `/opt`, `/projectes`) tots des del mateix `auto.master`. Aquesta separació de responsabilitats és una pràctica estàndard d'autofs.

        **3.** Quin és el risc de posar un `--timeout` molt baix (per exemple, 5 segons)?

        ??? success "Resposta"
            Amb `--timeout=5`, autofs desmuntaria `/perfils/maria.puig` 5 segons després que `maria.puig` deixi d'accedir-hi. Si l'usuari té el terminal obert però no fa res durant 5 segons, el sistema desmuntaria el directori home mentre la sessió és activa. El proper accés (per exemple, executar una comanda) requerirà que autofs el torni a muntar, causant un breu retard i potencialment errors a programes que mantinguin fitxers oberts. Per a un entorn de laboratori, 60 s és un bon equilibri; en producció, 300 s o més és habitual.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 8.3 · Configura auto.master

    **Objectiu**: afegir la configuració de perfils a `/etc/auto.master`.

    **Temps estimat**: 15 minuts

    ---

    ### Part A – Edita auto.master

    ```bash
    sudo nano /etc/auto.master
    ```

    Afegeix al final:
    ```text
    /perfils    /etc/auto.perfils    --timeout=60 --ghost
    ```

    ### Part B – Prova l'error sense --ghost (opcional)

    Si vols experimentar l'error:
    ```bash
    # Edita i treu --ghost temporalment
    # Reinicia i comprova que /perfils sembla buit
    ls /perfils
    # Torna a afegir --ghost i reinicia
    sudo systemctl restart autofs
    ```

    ### Part C – Reinicia autofs i verifica

    ```bash
    sudo systemctl restart autofs
    systemctl status autofs
    cat /proc/mounts | grep autofs
    ```

    Nota: `ls /perfils` pot continuar buit fins que creïs `/etc/auto.perfils` (pàgina 41).

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"autofs auto.master configuration Linux tutorial"`
        - `"autofs ghost option mount point Linux"`
        - `"autofs timeout configuration NFS home directory"`
