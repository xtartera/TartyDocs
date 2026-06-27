---
title: Persistència i roaming multi-client
tags:
  - ut2
  - perfils
  - autofs
---

# :material-laptop-account: Persistència i roaming multi-client

!!! abstract "Concepte clau"
    Un cop la pila completa (LDAP + SSSD + NFS + autofs) funciona, `maria.puig` pot fer login des de qualsevol client i trobar exactament els mateixos fitxers, perquè tots ells resideixen al servidor. Això és el **roaming**: el perfil "viatja" amb l'usuari, independentment del client que usi.

=== ":material-notebook-outline: Apunts"

    ## Què significa "roaming"?

    Sense roaming, el directori home és local a cada client:

    ```text
    Client A: /home/maria.puig/  ← fitxers de la sessió al client A
    Client B: /home/maria.puig/  ← directori diferent, fitxers diferents
    ```

    Amb roaming via NFS + autofs:

    ```text
    Client A: /perfils/maria.puig/  ← munta 192.168.100.10:/perfils/maria.puig
    Client B: /perfils/maria.puig/  ← munta 192.168.100.10:/perfils/maria.puig
    ```

    Ambdós clients accedeixen al **mateix directori físic** al servidor. Un fitxer creat des del client A és immediatament visible des del client B.

    ## Prova de roaming: dos clients

    ### Escenari: client A i client B

    ```bash
    # ── Al client A (192.168.100.20) ─────────────────────────────
    su - maria.puig
    echo "Fitxer creat des del client A" > ~/prova-roaming.txt
    date >> ~/prova-roaming.txt
    exit

    # ── Al client B (un segon client, o connexió SSH diferent) ────
    su - maria.puig
    cat ~/prova-roaming.txt
    ```

    Sortida esperada al client B:
    ```text
    Fitxer creat des del client A
    Sat Jun 27 10:23:45 UTC 2026
    ```

    El fitxer creat al client A és visible immediatament al client B — els dos clients veuen el mateix directori NFS.

    ### Prova amb SSH (des del servidor mateix)

    Si tens un únic client, pots simular el roaming fent login des de dos terminals:

    ```bash
    # Terminal 1: login local
    su - maria.puig
    echo "Missatge des del terminal 1" > ~/terminal1.txt

    # Terminal 2: login via SSH
    ssh maria.puig@localhost
    cat ~/terminal1.txt
    # ← ha de mostrar el missatge
    ```

    ## Què persisteix i què no

    | Contingut | Persisteix? | Per quin motiu |
    |-----------|------------|----------------|
    | Fitxers a `~/` (home NFS) | ✅ Sí | Emmagatzemats al servidor NFS |
    | Configuració (`.bashrc`, `.profile`) | ✅ Sí | Emmagatzemada al servidor NFS |
    | Historial de comandes (`.bash_history`) | ✅ Sí | Emmagatzemat al servidor NFS |
    | Processos en execució | ❌ No | Son locals al client — es perden en tancar sessió |
    | Variables d'entorn de la sessió | ❌ No | Locals al client — es recalculen en cada login |
    | Fitxers temporals de `/tmp/` | ❌ No | Locals al client |
    | Caché d'aplicacions (`.cache/`) | ✅/⚠️ Depèn | Si la app usa `~/.cache/`, és persistent; si usa `/tmp/`, no |

    ## El .bashrc i la configuració inicial

    Quan `maria.puig` fa login per primera vegada en un client nou i el directori home existeix però està buit, no té `.bashrc`:

    ```bash
    ls -la /perfils/maria.puig/
    # directori buit
    ```

    Pots copiar la configuració inicial des de `/etc/skel/`:

    ```bash
    # Al servidor, com a root
    sudo cp /etc/skel/.bashrc /perfils/maria.puig/
    sudo cp /etc/skel/.profile /perfils/maria.puig/
    sudo chown 1001:2001 /perfils/maria.puig/.bashrc /perfils/maria.puig/.profile
    ```

    A partir d'aquí, `maria.puig` tindrà la configuració inicial estàndard en qualsevol client.

    ## Muntatges simultanis: dos clients al mateix home

    Dos clients poden tenir `/perfils/maria.puig` muntat simultàniament (NFS ho permet). Però si ambdós clients modifiquen el mateix fitxer alhora, pot haver-hi un conflicte de fitxers:

    !!! warning "Escriptura simultània al mateix fitxer"
        Si el client A i el client B escriuen al mateix fitxer de configuració (per exemple, `.bashrc`) simultàniament, NFS no garanteix coherència — l'últim que escriu guanya i pot sobreescriure els canvis de l'altre. En un entorn de laboratori amb un sol usuari per sessió, això no és un problema pràctic. En producció amb NFS, s'usa `NFSv4` amb locking adequat o sistemes de fitxers de xarxa amb locking distribuït com GlusterFS o Ceph.

    ## Verificació del roaming complet

    ```bash
    # 1. Comprova des del servidor que els fitxers existeixen
    ls -la /perfils/maria.puig/

    # 2. Comprova des del client A que el home és NFS
    su - maria.puig -c "df -h ~"

    # 3. Comprova que el login funciona sense directoris manuals previs
    # (elimina el punt de muntatge ghost i torna a fer login)
    sudo systemctl restart autofs
    su - maria.puig
    ```

    ??? question "Auto-avaluació"

        **1.** `maria.puig` fa login al client A, crea un fitxer, tanca sessió. Fa login al client B. El fitxer no apareix. Quines tres causes potencials examines?

        ??? success "Resposta"
            (1) **El client B no té autofs configurat o no munta `/perfils/`**: comprova `cat /proc/mounts | grep perfils` al client B. Si no hi ha cap entrada NFS, autofs no funciona al client B — revisa `auto.master` i `auto.perfils`. (2) **El fitxer es va crear a un directori temporal en comptes del home NFS**: comprova que `pwd` dins de la sessió de `maria.puig` retorna `/perfils/maria.puig` i no `/` o `/home/maria.puig`. (3) **Dos servidor NFS diferent**: verifica que `auto.perfils` al client B apunta a `192.168.100.10` (el servidor correcte) i no a un altre host.

        **2.** `maria.puig` fa login correctament i crea fitxers. Al cap d'un minut, torna a accedir al directori i obté `Transport endpoint is not connected`. Quina és la causa?

        ??? success "Resposta"
            El muntatge NFS ha expirat pel timeout d'autofs (`--timeout=60`) i ha intentat desmuntar-se mentre una aplicació o el shell encara tenia referències al directori obert. Quan autofs desmunta el directori, les referències existents queden "penjades" (*stale NFS mount*). Solució immediata: `sudo systemctl restart autofs` i torna a fer login. Per evitar-ho, augmenta el timeout a 300 s o més si els usuaris han de tenir sessions llargues inactives.

        **3.** Per quin motiu `.bash_history` (l'historial de comandes) sí que persisteix entre sessions i entre clients?

        ??? success "Resposta"
            `.bash_history` és un fitxer que el shell (`bash`) guarda al directori home: `~/.bash_history`. Com que el directori home és NFS, el fitxer resideix al servidor. Quan `maria.puig` fa login al client B, el seu `.bash_history` del client A ja hi és (perquè és el mateix fitxer al servidor). Bash el llegeix en l'inici de sessió i escriu al final de la sessió. Així, l'historial acumula comandes de totes les sessions, des de qualsevol client.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 8.6 · Prova el roaming entre dos punts d'accés

    **Objectiu**: verificar que els fitxers persisteixen i son accessibles des de múltiples sessions.

    **Temps estimat**: 20 minuts

    ---

    ### Part A – Crea contingut des del primer punt d'accés

    ```bash
    su - maria.puig
    mkdir ~/documents
    echo "Creat: $(date) des de $(hostname)" > ~/documents/roaming-test.txt
    echo "Línia 2" >> ~/documents/roaming-test.txt
    exit
    ```

    ### Part B – Verifica des d'un segon punt d'accés

    Obre un segon terminal i:
    ```bash
    ssh maria.puig@localhost
    cat ~/documents/roaming-test.txt
    echo "Llegit des de: $(hostname) el $(date)" >> ~/documents/roaming-test.txt
    exit
    ```

    ### Part C – Verifica al servidor

    Com a root al servidor:
    ```bash
    cat /perfils/maria.puig/documents/roaming-test.txt
    ```

    Ha de mostrar les dues línies afegides des dels dos punts d'accés.

    ### Part D – Repeteix per a tots els usuaris

    Fes la prova amb `pere.costa` i `anna.valls` i comprova que cada usuari té el seu propi directori, inaccessible pels altres.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Linux roaming profile NFS test multiple clients"`
        - `"NFS home directory persistence autofs Linux"`
        - `"autofs NFS roaming user profile verification test"`
