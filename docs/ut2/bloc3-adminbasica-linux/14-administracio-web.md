---
title: Administració web del servidor
tags:
  - ut2
  - linux
  - administracio
  - monitoratge
---

# :material-web: Administració web del servidor

!!! abstract "Concepte clau"
    Existeixen eines que permeten **administrar i monitoritzar** un servidor Linux des d'un **navegador**, sense dependre només de la línia de comandes. La més coneguda és **Webmin**; per a monitoratge, **Cockpit** és una alternativa moderna.

=== ":material-notebook-outline: Apunts"

    ## Webmin: administració gràfica remota

    Webmin ofereix una interfície web per gestionar usuaris, serveis, paquets, xarxa, tallafocs i molt més.

    ```bash
    # Instal·lació via repositori oficial (recomanat per rebre actualitzacions)
    curl -o setup-repos.sh https://raw.githubusercontent.com/webmin/webmin/master/setup-repos.sh
    sudo sh setup-repos.sh
    sudo apt install webmin
    ```

    Accés: **`https://192.168.100.10:10000`** (usuari root o un usuari amb permisos).

    | Mòdul de Webmin | Permet |
    |-----------------|--------|
    | Users and Groups | gestionar usuaris/grups (equivalent gràfic al que fas per CLI) |
    | Software Packages | instal·lar/actualitzar paquets |
    | Networking | interfícies, firewall |
    | System logs | consultar registres |

    !!! warning "Seguretat"
        Webmin escolta al port **10000 per HTTPS**. No l'exposis a Internet sense restriccions; limita l'accés per `ufw` a la xarxa d'administració i usa contrasenyes fortes.

    ## Cockpit: monitoratge modern (alternativa)

    Cockpit (mantingut per Red Hat, disponible a Ubuntu) és lleuger i ideal per **veure l'estat** del sistema en temps real:

    ```bash
    sudo apt install cockpit
    ```

    Accés: **`https://192.168.100.10:9090`**. Mostra CPU, memòria, disc, serveis, registres i un terminal web.

    ## Quan usar què

    | Necessitat | Eina |
    |-----------|------|
    | Administració completa via web (usuaris, serveis, paquets) | Webmin |
    | Monitoratge visual i gestió lleugera | Cockpit |
    | Control total i automatització | Línia de comandes (sempre) |

    !!! tip "El web no substitueix la CLI"
        Aquestes eines són còmodes, però un administrador ha de saber fer-ho tot per **línia de comandes**: és el que funciona sempre (per SSH, sense entorn gràfic) i el que permet automatitzar amb scripts i cron.

    ??? question "Auto-avaluació"
        **1.** A quin port i amb quin protocol s'accedeix a Webmin per defecte?

        ??? success "Resposta"
            Al port **10000** mitjançant **HTTPS** (`https://IP:10000`).

        **2.** Quina diferència d'enfocament hi ha entre Webmin i Cockpit?

        ??? success "Resposta"
            Webmin és una eina d'**administració completa** (usuaris, serveis, paquets, xarxa...) via web; Cockpit està més orientat al **monitoratge** i la gestió lleugera de l'estat del sistema en temps real.

        **3.** Per què convé no dependre només de l'administració web?

        ??? success "Resposta"
            Perquè la línia de comandes funciona sempre (per SSH, sense entorn gràfic), permet automatitzar amb scripts i cron, i dóna control total. El web és un complement, no un substitut.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.14 · Administra des del navegador

    **Objectiu**: instal·lar una eina d'administració web i fer-hi una tasca.
    **Temps estimat**: 40 minuts · **Modalitat**: individual

    ---

    ### Tasca 1 – Instal·lació

    Instal·la Webmin i accedeix-hi des del navegador d'un client de la xarxa interna (`https://192.168.100.10:10000`).

    ### Tasca 2 – Tasca gràfica

    Crea un usuari des del mòdul *Users and Groups* i comprova després per CLI (`getent passwd`) que existeix. Compara les dues vies.

    ### Tasca 3 – Firewall

    Amb `ufw`, permet l'accés al port 10000 només des de la xarxa d'administració. Documenta la regla.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"install webmin ubuntu 24.04"`
        - `"cockpit web console ubuntu"`
        - `"webmin user management tutorial"`
