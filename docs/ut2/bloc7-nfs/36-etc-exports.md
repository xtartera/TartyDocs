---
title: "/etc/exports: opcions d'exportació NFS"
tags:
  - ut2
  - nfs
---

# :material-file-code: /etc/exports: opcions d'exportació NFS

!!! abstract "Concepte clau"
    `/etc/exports` és el fitxer de configuració central de NFS: defineix quins directoris s'exporten i a quins clients amb quines opcions. **Editar el fitxer no activa els canvis — cal executar `exportfs -ra` explícitament.**

=== ":material-notebook-outline: Apunts"

    ## Format de /etc/exports

    Cada línia segueix el format:

    ```text
    DIRECTORI   CLIENT(opcions)
    ```

    Exemples:
    ```text
    # Exporta /perfils a tota la xarxa del laboratori
    /perfils    192.168.100.0/24(rw,sync,no_subtree_check,no_root_squash)

    # Exporta /dades únicament al client específic, en mode lectura
    /dades      192.168.100.20(ro,sync,no_subtree_check)

    # Exporta a tots els hosts (no recomanat en producció)
    /public     *(ro,sync,no_subtree_check)
    ```

    !!! warning "No deixis espai entre el client i les opcions"
        `192.168.100.0/24 (rw,...)` amb espai és diferent de `192.168.100.0/24(rw,...)`. L'espai fa que les opcions s'apliquin al client genèric `*`, no al rang especificat — un error de seguretat subtil i freqüent.

    ## Opcions principals

    | Opció | Significat |
    |-------|-----------|
    | `rw` | El client pot llegir i escriure (*read-write*) |
    | `ro` | El client només pot llegir (*read-only*) |
    | `sync` | El servidor confirma les escriptures a disc abans de respondre (segur) |
    | `async` | El servidor confirma en memòria (ràpid, però risc de pèrdua de dades) |
    | `no_subtree_check` | Desactiva la verificació de subarbres (millora rendiment; recomanat) |
    | `root_squash` | (per defecte) El root del client és tractat com `nobody` al servidor |
    | `no_root_squash` | El root del client manté privilegis de root al servidor |
    | `all_squash` | Tots els usuaris del client son tractats com `nobody` |

    ### root_squash vs no_root_squash

    !!! warning "Opció crítica per al laboratori: `no_root_squash`"
        Per defecte, NFS aplica `root_squash`: el procés root del client és remapat a `nobody` (UID 65534) al servidor. Això protegeix el servidor contra un client root maliciós.

        Al nostre laboratori, **autofs** (Bloc 8) corre com a root al client i necessita accedir als punts de muntatge de `/perfils/`. Amb `root_squash`, autofs veuria els fitxers com a `nobody` i fallaria amb `Permission denied`.

        Per a un laboratori educatiu, `no_root_squash` és acceptable. En producció, l'alternativa és NFSv4 amb Kerberos (`sec=krb5`).

    ## Configuració del laboratori

    Edita `/etc/exports`:

    ```bash
    sudo nano /etc/exports
    ```

    Afegeix aquesta línia (sense espai entre el client i les opcions):

    ```text title="/etc/exports"
    /perfils    192.168.100.0/24(rw,sync,no_subtree_check,no_root_squash)
    ```

    Significat de cada opció:

    | Opció | Per quin motiu |
    |-------|----------------|
    | `/perfils` | Carpeta dels perfils dels usuaris LDAP |
    | `192.168.100.0/24` | Qualsevol host de la xarxa interna del laboratori |
    | `rw` | Els usuaris han de poder escriure al seu perfil |
    | `sync` | Escriptures segures — imprescindible per a fitxers de perfil |
    | `no_subtree_check` | Millora el rendiment; recomanat per a Ubuntu 24.04 |
    | `no_root_squash` | Necessari per a autofs al Bloc 8 |

    ## Aplicació dels canvis

    !!! danger "Editar /etc/exports NO activa els canvis automàticament"
        Aquesta és l'error més freqüent amb NFS: modificar `/etc/exports`, desar el fitxer i pensar que el canvi és immediat. **No ho és.**

        El dimoni NFS no detecta els canvis al fitxer. Continues exportant (o no exportant) exactament el que tenia configurat abans de l'edició. Fins i tot `showmount -e localhost` continuarà mostrant les exportacions antigues.

        **Sempre** has d'executar:

        ```bash
        sudo exportfs -ra
        ```

    Cada vegada que modifiquis `/etc/exports`:

    ```bash
    # 1. Aplica els canvis
    sudo exportfs -ra

    # 2. Verifica que s'han aplicat
    sudo exportfs -v
    ```

    Sortida de `exportfs -v`:
    ```text
    /perfils      	192.168.100.0/24(sync,wdelay,hide,no_subtree_check,sec=sys,rw,secure,no_root_squash,no_all_squash)
    ```

    NFS afegeix algunes opcions per defecte (`wdelay`, `hide`, `sec=sys`) que no has especificat però que el servidor aplica internament.

    ## Especificació de clients

    | Especificació | Exemple | Descripció |
    |--------------|---------|-----------|
    | IP individual | `192.168.100.20` | Únicament el client específic |
    | Rang CIDR | `192.168.100.0/24` | Tota la subxarxa |
    | Hostname | `client.lafita.local` | Per hostname (requereix DNS) |
    | Wildcard | `*.lafita.local` | Tots els hosts del domini |
    | Tothom | `*` | Qualsevol host (no recomanat en producció) |

    Per al laboratori, `192.168.100.0/24` és la millor opció: permet qualsevol client de la xarxa interna sense dependre de DNS.

    ## Verificació

    ```bash
    # Al servidor: llista les exportacions actives
    sudo exportfs -v

    # Al servidor: comprovació via showmount
    showmount -e localhost
    ```

    Sortida esperada de `showmount -e localhost`:
    ```text
    Export list for localhost:
    /perfils 192.168.100.0/24
    ```

    ??? question "Auto-avaluació"

        **1.** Has afegit `/data 192.168.100.20(rw,sync,no_subtree_check)` a `/etc/exports` i has desat el fitxer. `showmount -e localhost` no mostra l'exportació. Quina és la causa i com la resolus?

        ??? success "Resposta"
            Has oblidat executar `sudo exportfs -ra`. Editar i desar `/etc/exports` guarda els canvis al disc, però **no notifica el dimoni NFS**. El servei continua treballant amb la configuració que tenia en memòria. Solució: `sudo exportfs -ra` i torna a verificar amb `showmount -e localhost`.

        **2.** Per quin motiu `no_root_squash` és necessari per al laboratori però no es recomanaria en producció?

        ??? success "Resposta"
            Al laboratori, `no_root_squash` és necessari perquè autofs (Bloc 8) corre com a root al client i necessita accedir als punts de muntatge de `/perfils/`. En producció, `no_root_squash` és perillós: si un client es veu compromès, un atacant amb root al client tindria accés de root als fitxers del servidor NFS — podria llegir o modificar fitxers d'altres usuaris. La solució en producció és NFSv4 amb Kerberos (`sec=krb5`), que autentica criptogràficament independentment dels UID/GID.

        **3.** Quin problema ocasiona escriure `/perfils 192.168.100.0/24 (rw,sync)` amb espai entre el client i les opcions?

        ??? success "Resposta"
            L'espai fa que NFS interpreti les opcions com a aplicades al client `*` (tothom) en lloc de `192.168.100.0/24`. El resultat és que `/perfils` s'exporta al rang especificat sense cap opció (permisos per defecte, probablement `ro`) i a tothom amb `rw,sync`. Això és un error de seguretat: qualsevol host extern podria accedir als perfils en mode lectura/escriptura.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 7.3 · Configura i prova l'error de /etc/exports

    **Objectiu**: afegir l'exportació de `/perfils/` i aprendre que `exportfs -ra` és obligatori.

    **Temps estimat**: 20 minuts

    ---

    ### Part A – Prova l'error deliberadament

    ```bash
    # 1. Edita /etc/exports
    sudo nano /etc/exports
    ```

    Afegeix: `/perfils    192.168.100.0/24(rw,sync,no_subtree_check,no_root_squash)`

    ```bash
    # 2. SENSE executar exportfs -ra, verifica showmount
    showmount -e localhost
    ```

    Observa que l'exportació **no apareix** — el fitxer s'ha desat però el dimoni NFS no ho sap.

    ### Part B – Aplica els canvis

    ```bash
    sudo exportfs -ra
    showmount -e localhost
    ```

    Ara ha d'aparèixer `/perfils 192.168.100.0/24`.

    ### Part C – Verifica les opcions actives

    ```bash
    sudo exportfs -v
    ```

    Comprova que les opcions inclouen `rw`, `sync`, `no_subtree_check`, `no_root_squash`.

    ### Part D – Des del client (si en tens un)

    ```bash
    # Des de 192.168.100.20
    showmount -e 192.168.100.10
    ```

    Ha de mostrar `/perfils 192.168.100.0/24`.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"etc exports NFS Linux configuration tutorial"`
        - `"NFS exports options root_squash no_root_squash explained"`
        - `"exportfs -ra apply NFS exports changes Linux"`
