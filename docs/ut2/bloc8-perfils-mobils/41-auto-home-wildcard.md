---
title: "auto.perfils amb wildcard *"
tags:
  - ut2
  - autofs
  - perfils
---

# :material-folder-sync: auto.perfils amb wildcard: muntatge per a tots els usuaris

!!! abstract "Concepte clau"
    `/etc/auto.perfils` és el mapa d'autofs que defineix com muntar el directori home de cada usuari. Usant un **wildcard** (`*`) com a clau i `&` com a substitut del nom d'usuari, una sola línia de configuració cobreix tots els usuaris LDAP: quan `maria.puig` fa login, autofs munta `192.168.100.10:/perfils/maria.puig` a `/perfils/maria.puig` automàticament.

=== ":material-notebook-outline: Apunts"

    ## Format d'un mapa autofs

    ```text
    CLAU   OPCIONS-MUNTATGE   SERVIDOR:RUTA
    ```

    Exemples sense wildcard:
    ```text
    # Munta únicament maria.puig
    maria.puig    -rw,soft,intr    192.168.100.10:/perfils/maria.puig
    ```

    Amb wildcard — **una sola línia per a tots els usuaris**:
    ```text
    *    -rw,soft,intr    192.168.100.10:/perfils/&
    ```

    ## El wildcard `*` i la substitució `&`

    | Símbol | Significat |
    |--------|-----------|
    | `*` | Qualsevol clau (qualsevol nom d'usuari) |
    | `&` | El valor que ha coincidit amb `*` (el nom d'usuari) |

    Quan `pere.costa` accedeix a `/perfils/pere.costa`:
    - `*` coincideix amb `pere.costa`
    - `&` se substitueix per `pere.costa`
    - autofs munta: `192.168.100.10:/perfils/pere.costa` a `/perfils/pere.costa`

    ```mermaid
    flowchart LR
        A["Accés a /perfils/anna.valls"] --> B["autofs consulta auto.perfils\n* coincideix amb anna.valls"]
        B --> C["& = anna.valls\nmunta 192.168.100.10:/perfils/anna.valls"]
        C --> D["/perfils/anna.valls\ndisponible al client"]

    ```

    ## Creació de /etc/auto.perfils

    ```bash
    sudo nano /etc/auto.perfils
    ```

    Contingut del fitxer:

    ```text title="/etc/auto.perfils"
    *    -rw,soft,intr    192.168.100.10:/perfils/&
    ```

    Explicació de les opcions de muntatge:

    | Opció | Significat |
    |-------|-----------|
    | `rw` | Lectura i escriptura (el perfil és modificable) |
    | `soft` | Si el servidor NFS no respon, retorna error en comptes de bloquejar indefinidament |
    | `intr` | Permet interrompre operacions NFS penjades amb Ctrl+C |

    ## Aplicació de la configuració

    Reinicia autofs per aplicar els canvis:

    ```bash
    sudo systemctl restart autofs
    ```

    ## Verificació pas a pas

    ### Pas 1: comprova que /perfils mostra els directoris (ghost)

    ```bash
    ls /perfils
    ```

    ```text
    maria.puig  pere.costa  anna.valls
    ```

    Si el directori és buit, comprova que `--ghost` és a `auto.master` i que `auto.perfils` existeix.

    ### Pas 2: accedeix a un directori d'usuari per disparar el muntatge

    ```bash
    ls /perfils/maria.puig
    ```

    La primera vegada, autofs dispara el muntatge NFS (pot trigar un o dos segons). Hauries de veure el contingut del directori home de `maria.puig`.

    ### Pas 3: verifica que el muntatge NFS és actiu

    ```bash
    cat /proc/mounts | grep perfils
    ```

    ```text
    192.168.100.10:/perfils/maria.puig /perfils/maria.puig nfs4 rw,relatime,... 0 0
    ```

    ### Pas 4: prova el login complet

    ```bash
    su - maria.puig
    ```

    ```text
    maria.puig@client:~$ pwd
    /perfils/maria.puig
    ```

    El directori home és `/perfils/maria.puig`, muntat automàticament per autofs via NFS des del servidor.

    ## Error crític: autofs sense --ghost

    !!! danger "El directori sembla no existir sense --ghost"
        Sense `--ghost` a `auto.master`, el directori `/perfils/maria.puig` no existeix aparentment fins que autofs el munta. Alguns programes de login (PAM, shells) comproven si el directori home existeix **abans** que autofs el munti i fallen:

        ```text
        su: warning: cannot change directory to /perfils/maria.puig: No such file or directory
        ```

        O bé obren la sessió a `/` en comptes de `/perfils/maria.puig`.

        **Diagnòstic**:
        ```bash
        ls /perfils          # buit sense --ghost
        ls /perfils/maria.puig  # dispara el muntatge (funciona)
        ```

        **Solució**: afegeix `--ghost` a la línia de `/etc/auto.master` i reinicia autofs.

    ## Diagnòstic: fluxograma si el muntatge falla

    ```mermaid
    flowchart TD
        A["su - maria.puig falla\no directori buit"] --> B{"ls /perfils mostra\nels directoris?"}
        B -->|No| C["Falta --ghost a auto.master\n→ afegeix --ghost i\nsudo systemctl restart autofs"]
        B -->|Sí| D{"ls /perfils/maria.puig\nfunciona?"}
        D -->|No| E{"showmount -e 192.168.100.10\nmosta /perfils?"}
        E -->|No| F["NFS no configurat\n→ revisa Bloc 7\n(exportfs -ra)"]
        E -->|Sí| G["Comprova /etc/auto.perfils:\n* -rw,soft,intr 192.168.100.10:/perfils/&"]
        D -->|Sí| H{"getent passwd maria.puig\nretorna homeDirectory=/perfils/...?"}
        H -->|No| I["SSSD no funciona\n→ revisa Bloc 6"]
        H -->|Sí| J["Funciona correctament"]

    ```

    ??? question "Auto-avaluació"

        **1.** Explica per quin motiu `*` i `&` permeten gestionar 100 usuaris amb una sola línia a `auto.perfils`.

        ??? success "Resposta"
            El wildcard `*` coincideix amb qualsevol nom d'usuari. Quan autofs ha de muntar `/perfils/X` per a qualsevol usuari X, busca una coincidència al mapa: `*` coincideix amb X. Aleshores, `&` se substitueix per X a la ruta del servidor: `192.168.100.10:/perfils/X`. Sense el wildcard, caldria una línia per a cada usuari (100 línies per a 100 usuaris). Amb el wildcard, una sola línia cobreix qualsevol usuari present o futur al directori LDAP.

        **2.** Quin és el comportament de l'opció `soft` en comptes de `hard` (comportament per defecte)?

        ??? success "Resposta"
            Amb `hard` (per defecte), si el servidor NFS no respon, el client espera indefinidament — la comanda sembla penjada i no pots interrompre-la fàcilment. Amb `soft`, si el servidor no respon, l'operació retorna un error (`I/O error`) després d'uns reintents. Per a un directori home, `soft` és preferible: si el servidor cau, l'usuari obté un error (desagradable però recuperable) en comptes d'un sistema bloquejat. L'opció `intr` complementa `soft`: permet matar processos bloquejats amb Ctrl+C fins i tot amb `hard`.

        **3.** `ls /perfils/maria.puig` funciona però `su - maria.puig` falla amb "cannot change directory". Quines dues causes potencials examines?

        ??? success "Resposta"
            (1) **Permisos del directori home**: el directori `/perfils/maria.puig` al servidor pot tenir propietat incorrecta. Comprova `ls -la /perfils/` al servidor: ha de tenir `1001:2001` com a propietari i permisos 700. Si el directori és de `root`, `maria.puig` (UID 1001) no hi pot entrar. (2) **Ghost no actiu o el punt de muntatge no és accessible en el moment del login**: pot ser que `ls /perfils/maria.puig` dispari el muntatge manualment però PAM no el trobi en el moment del login. Verifica que `--ghost` és a `auto.master` i que `getent passwd maria.puig` retorna `homeDirectory: /perfils/maria.puig` (no `/home/maria.puig`).

=== ":material-pencil-ruler: Activitat"

    ## Activitat 8.4 · Crea auto.perfils i prova el muntatge

    **Objectiu**: configurar el mapa wildcard i verificar el muntatge automàtic.

    **Temps estimat**: 25 minuts

    ---

    ### Part A – Crea /etc/auto.perfils

    ```bash
    sudo nano /etc/auto.perfils
    ```

    Contingut:
    ```text
    *    -rw,soft,intr    192.168.100.10:/perfils/&
    ```

    ```bash
    sudo systemctl restart autofs
    ```

    ### Part B – Verifica el ghost

    ```bash
    ls /perfils
    ```

    Hauries de veure `maria.puig`, `pere.costa`, `anna.valls` com a directoris (encara buits — fantasmes).

    ### Part C – Dispara el muntatge

    ```bash
    ls /perfils/maria.puig
    cat /proc/mounts | grep perfils
    ```

    Comprova que el muntatge NFS és actiu.

    ### Part D – Login complet

    ```bash
    su - maria.puig
    pwd
    id
    echo "Perfil mòbil funcionant!" > ~/prova-autofs.txt
    exit
    ```

    Verifica que el fitxer creat existeix al servidor:
    ```bash
    cat /perfils/maria.puig/prova-autofs.txt
    ```

    ### Part E – Comprova el desmuntatge automàtic

    ```bash
    # Espera 70 segons sense accedir a /perfils/maria.puig
    sleep 70
    cat /proc/mounts | grep perfils
    ```

    El muntatge hauria de desaparèixer automàticament.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"autofs wildcard map home directory NFS Linux"`
        - `"auto.home wildcard ampersand NFS Ubuntu"`
        - `"autofs mount on demand NFS home directory test"`
