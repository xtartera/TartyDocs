---
title: /etc/exports – Opcions d'exportació
tags:
  - ut3
  - nfs
---

# :material-file-cog: /etc/exports – Opcions d'exportació

!!! abstract "Concepte clau"
    `/etc/exports` defineix quins directoris exporta el servidor NFS, a quins clients i amb quines opcions. Cada línia segueix el format: `directori client(opcions)`. Després de modificar-lo, cal executar `exportfs -ra` per aplicar els canvis sense reiniciar NFS.

=== ":material-notebook-outline: Apunts"

    ## Format de /etc/exports

    ```
    /ruta/del/directori   client(opcions)
    ```

    Exemples:

    ```
    # Accés de tothom a la mateixa xarxa (lectura i escriptura)
    /srv/nfs/dades   192.168.100.0/24(rw,sync,no_subtree_check)

    # Accés d'un client específic
    /srv/nfs/backup  192.168.100.20(ro,sync,no_subtree_check)

    # Accés per hostname
    /srv/nfs/dades   client-linux.local(rw,sync)
    ```

    !!! warning "Espai entre directori i client"
        Cal **no posar espai** entre el client i les opcions: `192.168.100.20(rw,sync)` ✅. Si poses un espai `192.168.100.20 (rw,sync)`, NFS interpreta el client com `192.168.100.20` (sense opcions) i les opcions s'apliquen a **qualsevol host** (*). Error molt comú.

    ## Opcions principals

    ### Opcions de permisos

    | Opció | Funció |
    |-------|--------|
    | `rw` | Lectura i escriptura (Read/Write) |
    | `ro` | Només lectura (Read Only) — valor per defecte |

    ### Opcions de sincronització

    | Opció | Funció |
    |-------|--------|
    | `sync` | Escriptura síncrona: el servidor confirma quan les dades estan al disc (segur) |
    | `async` | Escriptura asíncrona: més ràpid però risc de pèrdua de dades si el servidor cau |

    Usa sempre **`sync`** a menys que el rendiment sigui crític i acceptis el risc.

    ### Opcions de seguretat

    | Opció | Funció |
    |-------|--------|
    | `no_subtree_check` | Desactiva la comprovació de subárbre (recomanat per rendiment i compatibilitat) |
    | `no_root_squash` | L'usuari root del client actua com a root al servidor (**PERILLÓS**) |
    | `root_squash` | L'usuari root del client es mapeja a `nobody` al servidor (**per defecte**) |
    | `all_squash` | Tots els usuaris del client es mapegen a `nobody` al servidor |
    | `anonuid=N` | Defineix l'UID de l'usuari anònim (amb `all_squash`) |
    | `anongid=N` | Defineix el GID de l'usuari anònim (amb `all_squash`) |

    ## Configuració mínima recomanada

    Per a la majoria d'exportacions:

    ```
    /srv/nfs/dades   192.168.100.0/24(rw,sync,no_subtree_check)
    ```

    | Opció | Per quin motiu |
    |-------|--------------|
    | `rw` | Accés de lectura i escriptura |
    | `sync` | Consistència de dades |
    | `no_subtree_check` | Evita problemes de compatibilitat i millora el rendiment |

    ## Múltiples clients per a una exportació

    ```
    /srv/nfs/dades   192.168.100.20(rw,sync,no_subtree_check) 192.168.100.21(ro,sync,no_subtree_check)
    ```

    El client `.20` té R/W i el `.21` té R/O.

    !!! tip "Connexió amb UT2"
        A la UT2 (pàgina 36) vam veure `/etc/exports` per exportar `/perfils`. La sintaxi és idèntica; ara aprofundim en les opcions de seguretat (`all_squash`, `root_squash`) i en el control per IP.

    ??? question "Auto-avaluació"
        **1.** Quina diferència hi ha entre `root_squash` (per defecte) i `no_root_squash`?

        ??? success "Resposta"
            `root_squash` (actiu per defecte) mapeja l'usuari `root` del client a `nobody` al servidor, impedint que el root del client tingui accés privilegiat als fitxers del servidor. `no_root_squash` permet que el root del client actuï com a root al servidor — molt perillós en entorns on el client no és de confiança absoluta.

        **2.** Quina opció de `/etc/exports` cal usar perquè el servidor confirmi l'escriptura al disc?

        ??? success "Resposta"
            `sync`. Amb `sync`, el servidor no confirma l'operació d'escriptura al client fins que les dades estan físicament al disc. Amb `async` (més ràpid), el servidor confirma abans que les dades s'escriguin al disc, cosa que pot causar corrupció si el servidor cau inesperadament.

        **3.** Què passa si hi ha un espai entre la IP del client i les opcions a `/etc/exports`?

        ??? success "Resposta"
            NFS interpreta que el client és la IP (sense cap opció, per tant, accés de lectura per defecte) i que les opcions s'apliquen a **tots els hosts** (`*`). Això pot obrir l'exportació a qualsevol client de la xarxa, un error de seguretat greu. Sempre escriu `IP(opcions)` sense espai.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.14 · Configuració de /etc/exports

    **Objectiu**: definir exportacions NFS amb opcions de control d'accés i verificar la configuració.
    **Temps estimat**: 25 minuts

    ---

    ### Pas 1 – Edita /etc/exports

    ```bash
    sudo nano /etc/exports
    ```

    Afegeix:

    ```
    # Exportació amb R/W per al rang de xarxa de l'aula
    /srv/nfs/dades     192.168.100.0/24(rw,sync,no_subtree_check)

    # Exportació de backup: R/O per a un client específic
    /srv/nfs/backup    192.168.100.20(ro,sync,no_subtree_check)
    ```

    ### Pas 2 – Aplica els canvis

    ```bash
    sudo exportfs -rav
    ```

    Sortida esperada:

    ```text
    exporting 192.168.100.0/24:/srv/nfs/dades
    exporting 192.168.100.20:/srv/nfs/backup
    ```

    ### Pas 3 – Verifica les exportacions actives

    ```bash
    sudo exportfs -v
    showmount -e localhost
    ```

    Documenta totes les opcions efectives de cada exportació (incloses les opcions per defecte que NFS aplica).

    ### Pas 4 – Prova l'error de l'espai

    Afegeix una línia amb espai entre IP i opcions i comprova el resultat de `exportfs -rav`. Quina advertència mostra?

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"/etc/exports NFS options explained Linux"`
        - `"NFS server exports root_squash no_root_squash"`
        - `"Linux NFS exports sync async options"`
