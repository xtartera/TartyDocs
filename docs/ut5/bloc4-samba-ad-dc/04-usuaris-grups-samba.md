---
title: Gestió d'usuaris i grups del domini Samba AD
tags:
  - ut5
  - samba
  - active-directory
  - usuaris
---

# :material-account-group: Gestió d'usuaris i grups del domini Samba AD

!!! abstract "Concepte clau"
    `samba-tool` és l'eina de línia de comandes per crear i administrar usuaris, grups i polítiques de contrasenya del domini, sense necessitat de cap client Windows.

=== ":material-notebook-outline: Apunts"

    ## Usuaris

    ```bash
    # Crear un usuari
    sudo samba-tool user create maria.puig 'Contrasenya.2026' \
      --given-name=Maria --surname=Puig

    # Llistar, mostrar, deshabilitar, esborrar
    sudo samba-tool user list
    sudo samba-tool user show maria.puig
    sudo samba-tool user disable maria.puig
    sudo samba-tool user delete maria.puig

    # Canviar contrasenya
    sudo samba-tool user setpassword maria.puig
    ```

    !!! tip "Coherència amb UT1/UT2"
        Fem servir els mateixos usuaris que a la resta del manual (`maria.puig`, `pere.costa`, `anna.valls`). Així l'alumne reconeix els comptes i pot comparar com es gestiona el mateix usuari a AD (UT1), OpenLDAP (UT2) i Samba-AD (UT5).

    ## Grups

    ```bash
    sudo samba-tool group add professorat
    sudo samba-tool group addmembers professorat maria.puig,pere.costa
    sudo samba-tool group listmembers professorat
    sudo samba-tool group removemembers professorat pere.costa
    ```

    ## Polítiques de contrasenya del domini

    ```bash
    # Veure la política actual
    sudo samba-tool domain passwordsettings show

    # Ajustar-la (exemple: longitud mínima i complexitat)
    sudo samba-tool domain passwordsettings set --min-pwd-length=10
    sudo samba-tool domain passwordsettings set --complexity=on
    ```

    | Paràmetre | Efecte |
    |-----------|--------|
    | `--min-pwd-length` | Longitud mínima |
    | `--complexity` | Exigeix majúscules/minúscules/dígits |
    | `--max-pwd-age` | Caducitat de la contrasenya |

    !!! warning "Error freqüent"
        Si `user create` falla amb un error de contrasenya, sol ser perquè **no compleix la política de complexitat** del domini (per defecte activa). Usa una contrasenya amb majúscula, minúscula, dígit i símbol, o ajusta la política.

    ## Atributs POSIX (per als clients Linux)

    Com que el domini es va provisionar amb `--use-rfc2307`, es poden assignar `uidNumber`/`gidNumber` als comptes perquè els clients Linux els vegin de forma coherent (via RSAT, la pestanya "Atributs UNIX", o editant el directori).

    ```mermaid
    graph LR
        A["samba-tool\nuser/group"] --> DC["Directori del domini\n(lafita.local)"]
        DC --> W["Clients Windows\nSID"]
        DC --> L["Clients Linux\nuidNumber/gidNumber (rfc2307)"]
    ```

    ??? question "Auto-avaluació"
        **1.** Amb quina ordre crees un usuari i amb quina afegeixes membres a un grup?

        ??? success "Resposta"
            `samba-tool user create <usuari> <contrasenya>` per crear l'usuari i `samba-tool group addmembers <grup> <usuari1>,<usuari2>` per afegir-hi membres.

        **2.** Per què pot fallar la creació d'un usuari amb un error de contrasenya?

        ??? success "Resposta"
            Perquè la contrasenya no compleix la **política de complexitat** del domini (activa per defecte). Cal una contrasenya prou llarga i amb varietat de caràcters, o modificar la política amb `samba-tool domain passwordsettings`.

        **3.** Què cal perquè un compte del domini tingui un UID/GID coherent als clients Linux?

        ??? success "Resposta"
            Que el domini s'hagi provisionat amb `--use-rfc2307` i que el compte tingui assignats `uidNumber`/`gidNumber` al directori, de manera que tots els clients Linux resolguin el mateix número.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 5.C3 · Població del domini

    **Objectiu**: crear l'estructura d'usuaris i grups del centre.
    **Temps estimat**: 40 minuts · **Modalitat**: individual

    ---

    ### Tasca 1 – Usuaris

    Crea `maria.puig`, `pere.costa` i `anna.valls` amb `samba-tool user create`. Comprova-ho amb `user list`.

    ### Tasca 2 – Grups

    Crea els grups `professorat` i `alumnat`, i reparteix-hi els usuaris. Llista'n els membres.

    ### Tasca 3 – Política

    Mostra la política de contrasenya i ajusta la longitud mínima a 10. Prova de crear un usuari amb una contrasenya feble i documenta l'error.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"samba-tool user create group management"`
        - `"samba domain passwordsettings"`
        - `"samba rfc2307 uidNumber unix attributes"`
