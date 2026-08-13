---
title: Introducció als scripts de bash
tags:
  - ut2
  - linux
  - bash
  - scripts
---

# :material-script-text: Introducció als scripts de bash

!!! abstract "Concepte clau"
    Un **script** és un fitxer de text amb ordres que s'executen en seqüència. Permet **automatitzar** tasques repetitives d'administració (còpies, comprovacions, altes d'usuaris) en lloc de teclejar-les una a una.

=== ":material-notebook-outline: Apunts"

    ## El primer script

    ```bash
    #!/bin/bash
    # comprova.sh — mostra informació bàsica del sistema
    echo "Hostname: $(hostname)"
    echo "Data: $(date)"
    echo "Usuaris connectats: $(who | wc -l)"
    ```

    | Element | Significat |
    |---------|-----------|
    | `#!/bin/bash` | **Shebang**: indica quin intèrpret executa l'script (primera línia obligatòria) |
    | `#` | Comentari (excepte a la primera línia) |
    | `$(ordre)` | Substitució: insereix la sortida d'una ordre |

    ## Fer-lo executable i executar-lo

    ```bash
    chmod +x comprova.sh
    ./comprova.sh          # execució directa (cal permís x)
    bash comprova.sh       # alternativa sense permís x
    ```

    ## Variables

    ```bash
    #!/bin/bash
    SERVIDOR="192.168.100.10"
    echo "Farem ping a $SERVIDOR"
    ping -c 1 "$SERVIDOR"
    ```

    !!! tip "Cometes: la font d'errors número u"
        - `"dobles"` → substitueixen variables: `"Hola $USER"` → `Hola maria.puig`
        - `'simples'` → text literal: `'Hola $USER'` → `Hola $USER`
        - `` `invertides` `` (o `$( )`) → executen una ordre i n'insereixen la sortida

    ## Paràmetres

    ```bash
    #!/bin/bash
    # backup.sh <carpeta>
    echo "Farem còpia de: $1"      # $1 = primer paràmetre
    ```

    ```bash
    ./backup.sh /srv/dades
    ```

    ## Condicions i bucles

    ```bash
    #!/bin/bash
    if [ -d "/srv/dades" ]; then
        echo "La carpeta existeix"
    else
        echo "No existeix, la creo"
        mkdir -p /srv/dades
    fi

    for usuari in maria.puig pere.costa anna.valls; do
        echo "Processant $usuari"
    done
    ```

    !!! tip "Connexió amb UT1"
        A UT1 automatitzaves amb **PowerShell**. Bash és l'equivalent al món Linux: canvia la sintaxi, però la idea és idèntica — escriure un cop una seqüència d'ordres i reutilitzar-la.

    !!! warning "Error freqüent"
        Oblidar els espais dins dels claudàtors de les condicions: s'ha d'escriure `[ -d "$ruta" ]` **amb espais** després de `[` i abans de `]`. Sense els espais, bash dóna error de sintaxi.

    ??? question "Auto-avaluació"
        **1.** Per a què serveix la línia `#!/bin/bash` i on ha d'anar?

        ??? success "Resposta"
            És el **shebang**: indica al sistema quin intèrpret ha d'executar l'script (bash). Ha d'anar sempre a la **primera línia** del fitxer.

        **2.** Quina diferència hi ha entre cometes dobles i simples en un `echo`?

        ??? success "Resposta"
            Les dobles (`"..."`) **substitueixen** les variables (`$VAR` pel seu valor); les simples (`'...'`) tracten el text de forma **literal**, sense substituir res.

        **3.** Què representa `$1` dins d'un script?

        ??? success "Resposta"
            El **primer paràmetre** passat a l'script en executar-lo (p. ex. a `./backup.sh /srv/dades`, `$1` val `/srv/dades`).

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.12 · El teu primer script d'administració

    **Objectiu**: escriure un script útil per a l'administració del servidor.
    **Temps estimat**: 40 minuts · **Modalitat**: individual

    ---

    ### Tasca 1 – Informe del sistema

    Escriu `informe.sh` que mostri hostname, data, espai de disc (`df -h`) i usuaris connectats. Fes-lo executable i executa'l.

    ### Tasca 2 – Amb paràmetre

    Escriu `revisa.sh <carpeta>` que comprovi si la carpeta existeix i, si no, la creï. Prova-ho amb una carpeta existent i una que no.

    ### Tasca 3 – Bucle

    Amplia l'script perquè, amb un `for`, mostri un missatge per a cada usuari d'una llista. Documenta la sortida.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"bash scripting for beginners"`
        - `"bash variables quotes explained"`
        - `"bash if else for loop tutorial"`
