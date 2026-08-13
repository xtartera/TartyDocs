---
title: Perfils mòbils al domini Samba AD
tags:
  - ut4
  - samba
  - perfils
  - active-directory
---

# :material-folder-account: Perfils mòbils al domini Samba AD

!!! abstract "Concepte clau"
    Igual que a un AD de Windows, en un domini Samba AD es pot configurar que el perfil de l'usuari es desi al servidor i el segueixi de màquina en màquina (roaming), amb el sufix `.V6` als clients Windows moderns.

=== ":material-notebook-outline: Apunts"

    ## Recurs de perfils al servidor

    Es defineix una compartició `[profiles]` a `smb.conf` del DC (o d'un servidor de fitxers del domini):

    ```ini
    [profiles]
       path = /srv/samba/profiles
       read only = no
       browsable = no
       vfs objects = acl_xattr
    ```

    Permisos del directori (cada usuari ha de poder escriure el seu perfil):

    ```bash
    sudo mkdir -p /srv/samba/profiles
    sudo chmod 1770 /srv/samba/profiles
    sudo chgrp 'domain users' /srv/samba/profiles
    ```

    ## Assignar el perfil a l'usuari

    Amb `samba-tool` o des de RSAT (pestanya *Perfil* de l'usuari), s'estableix la ruta del perfil:

    ```bash
    sudo samba-tool user setprofilepath maria.puig '\\dc1\profiles\maria.puig'
    ```

    ```mermaid
    graph LR
        U["maria.puig\ninicia sessió"] --> C["Client Windows 11"]
        C -->|"carrega/desa perfil"| P["\\\\dc1\\profiles\\maria.puig.V6"]
    ```

    !!! info "El sufix .V6 (repàs de UT1)"
        Windows afegeix un sufix de versió a la carpeta del perfil segons la versió del SO (`.V6` per a Windows 10/11). Si es barregen versions de client, es generen carpetes de perfil diferents. És el mateix comportament que a la UT1 amb AD de Windows.

    ## Validació

    | Comprovació | Com |
    |-------------|-----|
    | El perfil es crea al servidor | Apareix `maria.puig.V6` a `/srv/samba/profiles` |
    | El roaming funciona | Iniciar sessió en **dos** clients i veure canvis replicats |
    | Permisos correctes | Cada usuari només accedeix al seu perfil |

    !!! warning "Error freqüent"
        Si el perfil no es desa, sol ser un problema de **permisos** al directori `profiles` (l'usuari no hi pot escriure) o de la **ruta UNC** mal escrita a l'atribut de perfil. Revisa `chmod`/`chgrp` i la ruta `\\dc1\profiles\...`.

    ??? question "Auto-avaluació"
        **1.** Per què el directori de perfils es marca amb permisos tipus `1770` i grup `domain users`?

        ??? success "Resposta"
            Perquè tots els usuaris del domini han de poder crear-hi el seu perfil (accés de grup), però el bit *sticky* (`1`) impedeix que un usuari esborri o modifiqui les carpetes de perfil dels altres. Així es garanteix escriptura pròpia i aïllament entre usuaris.

        **2.** Què és el sufix `.V6` i quan pot causar problemes?

        ??? success "Resposta"
            És el sufix de versió que Windows afegeix a la carpeta del perfil segons la versió del SO client. Causa problemes si es barregen versions de Windows diferents, perquè cada versió genera una carpeta de perfil separada i el roaming no es comparteix entre elles.

        **3.** On assignes la ruta del perfil mòbil a un usuari del domini Samba?

        ??? success "Resposta"
            A l'atribut de perfil de l'usuari, amb `samba-tool user setprofilepath` o des de RSAT (pestanya Perfil), indicant la ruta UNC `\\dc1\profiles\<usuari>`.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.C4 · Perfils que viatgen

    **Objectiu**: configurar i validar un perfil mòbil al domini Samba AD.
    **Temps estimat**: 45 minuts · **Modalitat**: individual

    ---

    ### Tasca 1 – Recurs

    Crea la compartició `[profiles]` i ajusta permisos (`1770`, grup `domain users`).

    ### Tasca 2 – Assignació

    Assigna la ruta de perfil a `maria.puig` amb `samba-tool user setprofilepath`.

    ### Tasca 3 – Validació del roaming

    Inicia sessió amb `maria.puig` en un client Windows, crea un fitxer a l'escriptori, tanca sessió i entra en un **segon** client. Comprova que el fitxer hi és. Documenta-ho.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"samba ad roaming profiles configuration"`
        - `"samba-tool setprofilepath"`
        - `"windows roaming profile V6 suffix"`
