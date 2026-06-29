---
title: CUPS – Arquitectura i instal·lació
tags:
  - ut3
  - cups
---

# :material-printer: CUPS – Arquitectura i instal·lació

!!! abstract "Concepte clau"
    **CUPS** (Common UNIX Printing System) és el sistema d'impressió estàndard a Linux i macOS. Actua com a intermediari entre les aplicacions i les impressores, gestiona les cues d'impressió i ofereix una interfície web d'administració al **port 631** via protocol IPP.

=== ":material-notebook-outline: Apunts"

    ## Arquitectura CUPS

    ```mermaid
    graph TD
        subgraph Aplicacions
            A1["LibreOffice"] 
            A2["Firefox"]
            A3["lp / lpr"]
        end
        A1 & A2 & A3 -->|"IPP · port 631"| CUPSD["cupsd\n(dimoni CUPS)"]
        CUPSD --> FILTER["Filtres\n(converteix a format impressora)"]
        FILTER --> BACKEND["Backend\n(comunica amb la impressora)"]
        BACKEND --> P1["Impressora física\n(USB, xarxa...)"]
        BACKEND --> P2["cups-pdf\n(fitxer PDF)"]
        subgraph "Ubuntu Server"
            CUPSD
            FILTER
            BACKEND
        end
    ```

    ### Components principals

    | Component | Funció |
    |-----------|--------|
    | `cupsd` | Dimoni principal: gestiona connexions, cues i autenticació |
    | Filtres | Converteixen el document al format que entén la impressora (PostScript, PCL...) |
    | Backends | Gestionen la comunicació amb la impressora (USB, IPP, socket, cups-pdf...) |
    | Interfície web | `http://servidor:631` — administració gràfica |

    ## Instal·lació

    ```bash
    sudo apt update
    sudo apt install cups cups-pdf -y
    ```

    - `cups` — servidor d'impressió principal
    - `cups-pdf` — impressora virtual que genera PDFs

    Verificació:

    ```bash
    sudo systemctl status cups
    sudo systemctl enable cups
    ```

    Sortida esperada:

    ```text
    ● cups.service - CUPS Scheduler
         Loaded: loaded (/lib/systemd/system/cups.service; enabled; ...)
         Active: active (running) ...
    ```

    ## El grup lpadmin

    Per administrar CUPS (afegir impressores, gestionar cues), l'usuari ha de pertànyer al grup `lpadmin`:

    ```bash
    sudo adduser $USER lpadmin
    # o per a un usuari concret:
    sudo usermod -aG lpadmin maria.puig
    ```

    !!! warning "Cal tancar sessió i tornar a entrar"
        Afegir un usuari a `lpadmin` no té efecte fins que l'usuari tanca la sessió i la torna a obrir (el grup s'activa al login). Si l'usuari intenta accedir a l'administració CUPS just després de ser afegit, rebrà un error 403.

    ## Verificació del port 631

    ```bash
    ss -tulnp | grep 631
    ```

    Sortida esperada:

    ```text
    tcp  LISTEN  0  5  127.0.0.1:631  0.0.0.0:*  users:(("cupsd",...))
    ```

    Per defecte, CUPS escolta **únicament a localhost** (`127.0.0.1:631`). Per a la compartició en xarxa cal modificar aquesta configuració (Bloc 8, pàgina 26).

    ## Fitxers de configuració principals

    | Fitxer | Funció |
    |--------|--------|
    | `/etc/cups/cupsd.conf` | Configuració principal del servidor CUPS |
    | `/etc/cups/printers.conf` | Definició de les impressores instal·lades |
    | `/etc/cups/ppd/` | Fitxers PPD de cada impressora |
    | `/var/spool/cups/` | Cua d'impressió (treballs pendents) |
    | `/var/spool/cups-pdf/` | PDFs generats per cups-pdf |
    | `/var/log/cups/` | Logs d'accés i errors |

    !!! tip "Connexió amb UT1"
        A Windows Server, la gestió d'impressores es fa des del "Print Management" (gestió gràfica via MMC). A Linux, CUPS ofereix una interfície web equivalent (port 631). Les dues permeten afegir impressores, gestionar cues i configurar permisos, però amb tecnologies completament diferents.

    ??? question "Auto-avaluació"
        **1.** Quin paquet proporciona la impressora PDF virtual a CUPS?

        ??? success "Resposta"
            `cups-pdf`. Un cop instal·lat, CUPS registra automàticament una impressora virtual anomenada "PDF". Qualsevol document imprès en aquesta impressora es desa com a fitxer PDF al directori `/var/spool/cups-pdf/<usuari>/`.

        **2.** A quin port escolta CUPS per defecte i per a quin protocol?

        ??? success "Resposta"
            El **port 631**, protocol **IPP** (Internet Printing Protocol), que funciona sobre HTTP/HTTPS. Per defecte, CUPS escolta únicament a `127.0.0.1:631` (localhost), limitant l'accés a la màquina local.

        **3.** A quin grup ha de pertànyer un usuari per administrar CUPS?

        ??? success "Resposta"
            Al grup **`lpadmin`**. Sense pertànyer a aquest grup, l'usuari pot accedir a la interfície web de CUPS en mode de sols lectura, però no pot afegir ni modificar impressores. Cal un logout/login per activar el canvi de grup.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.22 · Instal·lació i verificació de CUPS

    **Objectiu**: instal·lar CUPS, verificar el servei i afegir l'usuari al grup `lpadmin`.
    **Temps estimat**: 20 minuts

    ---

    ### Pas 1 – Instal·la CUPS i cups-pdf

    ```bash
    sudo apt update && sudo apt install cups cups-pdf -y
    ```

    ### Pas 2 – Verifica el servei

    ```bash
    sudo systemctl status cups
    sudo systemctl is-enabled cups
    ss -tulnp | grep 631
    ```

    ### Pas 3 – Afegeix l'usuari al grup lpadmin

    ```bash
    sudo usermod -aG lpadmin $USER
    # Tanca la sessió i torna a entrar, o usa:
    newgrp lpadmin
    groups  # Verifica que lpadmin apareix
    ```

    ### Pas 4 – Accedeix a la interfície web

    Obri un navegador a `http://localhost:631` i documenta:
    - Nom del servidor
    - Versió de CUPS instal·lada
    - Impressores disponibles (hauria d'aparèixer "PDF" gràcies a cups-pdf)

    ### Pas 5 – Explora els fitxers de configuració

    ```bash
    ls /etc/cups/
    sudo head -30 /etc/cups/cupsd.conf
    ls /var/spool/cups-pdf/
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"CUPS install Ubuntu 24.04 printing server"`
        - `"cups-pdf virtual printer Linux tutorial"`
        - `"CUPS lpadmin group Ubuntu setup"`
