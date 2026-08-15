---
title: Auditoria i registre d'accessos
tags:
  - ut3
  - seguretat
  - samba
  - diagnostic
---

# :material-clipboard-text-clock: Auditoria i registre d'accessos

!!! abstract "Concepte clau"
    Saber **qui** accedeix a **què** i **quan** és essencial per detectar usos indeguts i diagnosticar problemes. Samba i el sistema ofereixen registres (logs) i mòduls d'auditoria per deixar-ne constància.

=== ":material-notebook-outline: Apunts"

    ## Registres de Samba

    Samba escriu els seus logs, típicament a `/var/log/samba/`:

    ```bash
    ls /var/log/samba/
    sudo tail -f /var/log/samba/log.smbd      # en directe
    ```

    El nivell de detall es controla amb `log level` a `smb.conf`:

    ```ini
    [global]
       log level = 1
       log file = /var/log/samba/log.%m       # un log per màquina client
       max log size = 1000
    ```

    ## Auditoria d'accessos amb `full_audit`

    El mòdul VFS **`full_audit`** registra les operacions (obrir, llegir, escriure, esborrar) sobre un recurs:

    ```ini
    [dades]
       path = /srv/dades
       vfs objects = full_audit
       full_audit:prefix = %u|%I|%m
       full_audit:success = mkdir rename unlink rmdir open
       full_audit:failure = connect
       full_audit:facility = local5
       full_audit:priority = notice
    ```

    | Directiva | Registra |
    |-----------|----------|
    | `full_audit:success` | operacions realitzades correctament |
    | `full_audit:failure` | intents fallits (p. ex. `connect` denegat) |
    | `full_audit:prefix` | usuari, IP i màquina de cada acció |

    Els registres surten via **syslog**:

    ```bash
    sudo tail -f /var/log/syslog | grep smbd_audit
    ```

    !!! tip "Connexió amb UT1"
        A Windows (UT1) l'auditoria d'accés a objectes es feia amb el **Visor d'Esdeveniments** i les directives d'auditoria. A Linux/Samba, l'equivalent és `full_audit` + syslog: mateixa finalitat (traçabilitat), eines diferents.

    !!! warning "Privadesa i volum"
        L'auditoria genera **molts** registres. Activa-la només on cal (recursos sensibles), controla la mida dels logs (`max log size`, rotació) i tingues present la normativa de protecció de dades.

    ??? question "Auto-avaluació"
        **1.** Per a què serveix el mòdul `full_audit` de Samba?

        ??? success "Resposta"
            Per registrar les operacions (obrir, escriure, esborrar, reanomenar...) que els usuaris fan sobre un recurs compartit, deixant constància de qui, des d'on i quan, útil per a traçabilitat i diagnòstic.

        **2.** Quina és l'eina equivalent a Windows per a l'auditoria d'accessos?

        ??? success "Resposta"
            El **Visor d'Esdeveniments** juntament amb les directives d'auditoria d'accés a objectes (vist a la UT1). Compleix la mateixa funció de traçabilitat.

        **3.** Quins riscos té activar l'auditoria de forma indiscriminada?

        ??? success "Resposta"
            Genera un gran volum de registres (pot omplir el disc si no es controla la rotació) i pot recollir informació personal, per la qual cosa cal limitar-la als recursos necessaris i respectar la normativa de protecció de dades.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 9.33 · Deixa rastre dels accessos

    **Objectiu**: activar i llegir l'auditoria d'un recurs Samba.
    **Temps estimat**: 35 minuts · **Modalitat**: individual

    ---

    ### Tasca 1 – Activació

    Afegeix `vfs objects = full_audit` a un recurs `[dades]` amb el prefix d'usuari/IP/màquina.

    ### Tasca 2 – Generar activitat

    Des d'un client, crea, modifica i esborra fitxers al recurs.

    ### Tasca 3 – Lectura

    Amb `grep smbd_audit /var/log/syslog`, localitza les teves accions i identifica qui les ha fet. Documenta un exemple.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"samba full_audit vfs module"`
        - `"samba logging log level configuration"`
        - `"samba audit user access syslog"`
