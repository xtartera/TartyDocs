---
title: Samba – Permisos compostos (create mask, force user)
tags:
  - ut3
  - samba
---

# :material-lock-check: Samba – Permisos compostos (create mask, force user)

!!! abstract "Concepte clau"
    Les directives `create mask`, `directory mask` i `force user` controlen els permisos finals dels fitxers creats via Samba. Actuen com a **filtre**: modifiquen els permisos que l'aplicació client demana, garantint que tots els fitxers tinguin un conjunt mínim o màxim de permisos al servidor.

=== ":material-notebook-outline: Apunts"

    ## El problema dels permisos en entorns multiusuari

    Quan l'usuari `maria.puig` crea un fitxer des de Windows via Samba, el client Windows envia una petició de permisos. El problema: Windows i Linux gestionen els permisos de manera diferent. Sense `create mask`, els fitxers podrien acabar amb permisos incorrectes (`644`, `600`, `777`...) depenent del client.

    ## create mask i directory mask

    Funcionen com a **màscara AND**: limiten els permisos **màxims** que pot tenir un fitxer o directori creat via Samba.

    ```ini
    [alumnes]
        path = /srv/samba/alumnes
        valid users = @alumnes
        write list = @alumnes
        create mask = 0664
        directory mask = 0775
    ```

    ### Com funciona la màscara

    ```
    Permisos demanats pel client:  0777  (rwxrwxrwx)
    create mask:                   0664  (rw-rw-r--)
    ──────────────────────────────
    AND lògic:                     0664  (rw-rw-r--)
    Permisos finals del fitxer:    0664
    ```

    La màscara **retira** els bits que no estan actius a la màscara. En l'exemple:
    - `0664` permet rw per a propietari i grup, r per a la resta
    - El bit d'execució mai s'activa (bé per a fitxers de dades)

    ### Valors recomanats

    | Escenari | create mask | directory mask |
    |----------|------------|----------------|
    | Fitxers de dades (aula) | `0664` | `0775` |
    | Fitxers privats | `0640` | `0750` |
    | Fitxers públics | `0666` | `0777` |

    ## force user i force group

    `force user` fa que **tots els fitxers creats via Samba** tinguin un propietari fix, independentment de quin usuari s'hagi autenticat:

    ```ini
    [compartit]
        path = /srv/samba/compartit
        valid users = @alumnes
        write list = @alumnes
        force user = alumne-comun
        force group = alumnes
        create mask = 0664
        directory mask = 0775
    ```

    Amb aquesta configuració, tots els fitxers creats per qualsevol membre del grup `alumnes` tindran propietari `alumne-comun` i grup `alumnes`.

    ### Quan usar force user

    Útil quan:
    - Cal que tots els fitxers compartits tinguin el **mateix propietari** (per a backups, permisos simplificats)
    - Vols evitar que `maria.puig` sigui propietària d'un fitxer i `pere.costa` no pugui modificar-lo

    !!! warning "Error freqüent"
        Confondre `create mask` amb `force create mode`. `create mask` retira bits (AND); `force create mode` afegeix bits (OR). En la majoria de casos, `create mask` és el que es necessita. `force create mode` pot activar bits d'execució indesitjats.

    ## Verificació de permisos

    Crea un fitxer via Samba i comprova els permisos al servidor:

    ```bash
    # Des del client (via smbclient o muntatge)
    # Crea un fitxer

    # Al servidor, verifica els permisos
    ls -la /srv/samba/alumnes/
    ```

    ??? question "Auto-avaluació"
        **1.** Amb `create mask = 0644`, un client crea un fitxer amb permisos `0777`. Quins permisos tindrà el fitxer al servidor?

        ??? success "Resposta"
            `0644` (rw-r--r--). La màscara fa un AND lògic: `0777 AND 0644 = 0644`. Els bits que no estan a la màscara (escriptura per a grup i altres) es retiren. El resultat és que el propietari pot llegir/escriure, el grup i els altres només llegir.

        **2.** Quin és l'efecte de `force group = alumnes` en els fitxers creats via Samba?

        ??? success "Resposta"
            Tots els fitxers creats via Samba en aquell recurs tindran el **grup `alumnes`**, independentment del grup primari de l'usuari que els crea. Això facilita la col·laboració: tots els membres d'`alumnes` podran llegir i modificar els fitxers de la resta (si `create mask` permet `rw` al grup).

        **3.** Per quin motiu pot ser útil `force user` en un recurs compartit de treball en grup?

        ??? success "Resposta"
            Si cada usuari és propietari dels fitxers que crea, pot donar-se que `pere.costa` no pugui modificar un fitxer creat per `maria.puig` (perquè el propietari és `maria.puig`). Amb `force user = usuari-comú`, tots els fitxers pertanyen al mateix compte i tots els membres del grup hi poden accedir amb igualtat.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.9 · Permisos amb create mask

    **Objectiu**: verificar l'efecte de `create mask` i `force group` sobre els permisos dels fitxers creats via Samba.
    **Temps estimat**: 30 minuts

    ---

    ### Pas 1 – Configura el recurs amb màscara

    ```ini
    [alumnes]
        path = /srv/samba/alumnes
        valid users = @alumnes
        write list = @alumnes
        create mask = 0664
        directory mask = 0775
        force group = alumnes
    ```

    ### Pas 2 – Reinicia i crea fitxers des del client

    Des de `smbclient` (com a `maria.puig`):

    ```bash
    smbclient //192.168.100.10/alumnes -U maria.puig
    # smb: \> put /tmp/prova.txt prova-maria.txt
    ```

    ### Pas 3 – Comprova al servidor

    ```bash
    ls -la /srv/samba/alumnes/
    ```

    Documenta: propietari, grup i permisos del fitxer. Confirma que els permisos coincideixen amb `create mask = 0664`.

    ### Pas 4 – Prova sense force group

    Elimina `force group` de la configuració, reinicia, crea un altre fitxer i compara els permisos. Quin és el grup del fitxer ara?

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Samba create mask directory mask permissions"`
        - `"Samba force user group configuration"`
        - `"Linux file permissions umask Samba"`
