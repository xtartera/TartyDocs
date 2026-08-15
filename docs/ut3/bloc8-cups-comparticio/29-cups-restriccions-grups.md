---
title: CUPS – Restriccions per grups (cupsd.conf)
tags:
  - ut3
  - cups
  - seguretat
---

# :material-shield-account: CUPS – Restriccions per grups (cupsd.conf)

!!! abstract "Concepte clau"
    `cupsd.conf` usa blocs `<Location>` amb directives `AuthType` i `Require` per restringir qui pot usar les impressores i qui pot administrar CUPS. La directiva `Require user @grup` limita l'accés a membres d'un grup Linux concret.

=== ":material-notebook-outline: Apunts"

    ## Estructura de control d'accés a cupsd.conf

    CUPS usa un sistema de control d'accés similar a Apache:

    ```apache
    <Location /ruta>
      AuthType [None | Default | Basic | Negotiate]
      Require [user | group | @group | valid-user | ...]
      Order allow,deny
      Allow [IP | @LOCAL | all]
      Deny [IP | @LOCAL | all]
    </Location>
    ```

    ### Blocs Location principals

    | Block | Ruta protegida | Ús típic |
    |-------|---------------|---------|
    | `<Location />` | Totes les operacions | Impressió general |
    | `<Location /admin>` | Administració CUPS | Afegir/eliminar impressores |
    | `<Location /admin/conf>` | Configuració del servidor | Editar cupsd.conf via web |
    | `<Location /printers/PDF>` | Una impressora concreta | Accés a la impressora PDF |

    ## Restricció per grup Linux

    Exemple: permetre impressió únicament als membres del grup `alumnes`:

    ```apache
    <Location /printers/PDF>
      AuthType Default
      Require user @alumnes
      Order allow,deny
      Allow @LOCAL
    </Location>
    ```

    - `AuthType Default` — demana autenticació
    - `Require user @alumnes` — l'usuari autenticat ha de pertànyer al grup `alumnes`
    - `@alumnes` = grup Linux `alumnes` (la `@` indica grup)

    ### Restricció per múltiples grups

    ```apache
    <Location /printers/PDF>
      AuthType Default
      Require user @alumnes @professors
      Order allow,deny
      Allow @LOCAL
    </Location>
    ```

    ### Restricció per usuaris concrets

    ```apache
    <Location /admin>
      AuthType Default
      Require user maria.puig admin-cups
      Order allow,deny
      Allow @LOCAL
    </Location>
    ```

    ## Configuració completa de exemple

    ```apache
    # Impressió: tots els usuaris de la xarxa local
    <Location />
      Order allow,deny
      Allow @LOCAL
    </Location>

    # Impressora PDF: únicament grup alumnes
    <Location /printers/PDF>
      AuthType Default
      Require user @alumnes
      Order allow,deny
      Allow @LOCAL
    </Location>

    # Administració: únicament grup lpadmin
    <Location /admin>
      AuthType Default
      Require user @lpadmin
      Order allow,deny
      Allow @LOCAL
    </Location>

    # Configuració del servidor: únicament root / @SYSTEM
    <Location /admin/conf>
      AuthType Default
      Require user @SYSTEM
      Order allow,deny
      Allow @LOCAL
    </Location>
    ```

    ## Aplica els canvis

    ```bash
    sudo systemctl restart cups
    ```

    Verifica l'accés des d'un usuari del grup i des d'un usuari que no hi és:

    ```bash
    # Des del client, com a maria.puig (membre d'alumnes)
    lp -h 192.168.100.10 -d PDF -U maria.puig document.txt
    # Ha de funcionar

    # Com a anna.valls (NO membre d'alumnes)
    lp -h 192.168.100.10 -d PDF -U anna.valls document.txt
    # Ha de donar error 401 o 403
    ```

    !!! warning "Error freqüent"
        Afegir la restricció `Require user @alumnes` però no especificar `AuthType Default`. Sense `AuthType`, CUPS no demana credencials i no pot verificar el grup de l'usuari. El resultat és que l'accés es permet o es denega de manera inconsistent. `AuthType Default` és obligatori quan s'usa `Require user`.

    ??? question "Auto-avaluació"
        **1.** Quina directiva de CUPS restringeix l'accés a la impressora `PDF` als membres del grup `alumnes`?

        ??? success "Resposta"
            Dins del bloc `<Location /printers/PDF>`: `Require user @alumnes`. La `@` indica que es refereix a un grup Linux, no a un usuari individual. Combinat amb `AuthType Default`, CUPS demanarà credencials i verificarà la pertinença al grup.

        **2.** Quina diferència hi ha entre `Require user @alumnes` i `Require valid-user`?

        ??? success "Resposta"
            `Require user @alumnes` permet l'accés **únicament als membres del grup `alumnes`**. `Require valid-user` permet l'accés a **qualsevol usuari que s'autentiqui correctament**, independentment del grup. `valid-user` és més permissiu.

        **3.** Quins dos canvis cal fer al bloc `<Location>` per activar la restricció per grup?

        ??? success "Resposta"
            1. `AuthType Default` (o `AuthType Basic`) — indica a CUPS que ha de demanar autenticació.
            2. `Require user @grup` — especifica quin usuari o grup és autoritzat. Sense `AuthType`, CUPS no demana credencials i la directiva `Require` no s'aplica correctament.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.27 · Restriccions d'accés per grups a CUPS

    **Objectiu**: configurar CUPS perquè la impressora PDF sigui accessible únicament als membres del grup `alumnes`.
    **Temps estimat**: 35 minuts

    ---

    ### Pas 1 – Crea el grup i afegeix usuaris

    ```bash
    sudo groupadd alumnes
    sudo usermod -aG alumnes maria.puig
    # pere.costa NO és a alumnes (per provar el bloqueig)
    ```

    ### Pas 2 – Modifica cupsd.conf

    ```bash
    sudo nano /etc/cups/cupsd.conf
    ```

    Afegeix (o modifica) el bloc de la impressora PDF:

    ```apache
    <Location /printers/PDF>
      AuthType Default
      Require user @alumnes
      Order allow,deny
      Allow @LOCAL
    </Location>
    ```

    ### Pas 3 – Reinicia i prova

    ```bash
    sudo systemctl restart cups
    ```

    Des del client com a `maria.puig` (ha de funcionar):

    ```bash
    lp -h 192.168.100.10 -d PDF -U maria.puig /etc/hostname
    ```

    Des del client com a `pere.costa` (ha de donar error):

    ```bash
    lp -h 192.168.100.10 -d PDF -U pere.costa /etc/hostname
    ```

    ### Pas 4 – Comprova els logs

    ```bash
    sudo tail -20 /var/log/cups/access_log
    sudo tail -20 /var/log/cups/error_log
    ```

    Documenta els missatges d'error per a l'accés denegat.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"CUPS cupsd.conf access control groups Linux"`
        - `"CUPS restrict printer access group Ubuntu"`
        - `"cupsd.conf Location AuthType Require tutorial"`
