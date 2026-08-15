---
title: CUPS – Compartició en xarxa
tags:
  - ut3
  - cups
---

# :material-printer-wireless: CUPS – Compartició en xarxa

!!! abstract "Concepte clau"
    Per defecte, CUPS escolta **únicament a localhost**. Per permetre la impressió remota, cal modificar `cupsd.conf` per fer-lo escoltar en totes les interfícies (`Listen 0.0.0.0:631`), activar la navegació (`Browsing On`) i definir quines IPs hi poden accedir.

=== ":material-notebook-outline: Apunts"

    ## Problema: CUPS per defecte no és accessible en xarxa

    ```bash
    ss -tulnp | grep 631
    # tcp  LISTEN  0  5  127.0.0.1:631  ...
    ```

    `127.0.0.1:631` significa que CUPS únicament accepta connexions des de la mateixa màquina. Un client a `192.168.100.20` no pot imprimir.

    ## Configuració de cupsd.conf

    ```bash
    sudo nano /etc/cups/cupsd.conf
    ```

    ### Canvis necessaris

    **1. Canvia `Listen localhost:631` per escoltar en totes les interfícies:**

    ```apache
    # Línia original (comenta-la o elimina-la):
    #Listen localhost:631

    # Nova línia:
    Listen 0.0.0.0:631
    ```

    **2. Activa la navegació de xarxa:**

    ```apache
    Browsing On
    BrowseLocalProtocols DNSSD
    ```

    **3. Permet l'accés des de la xarxa local als blocs `<Location>`:**

    ```apache
    <Location />
      Order allow,deny
      Allow @LOCAL
    </Location>

    <Location /admin>
      Order allow,deny
      Allow @LOCAL
    </Location>

    <Location /admin/conf>
      AuthType Default
      Require user @SYSTEM
      Order allow,deny
      Allow @LOCAL
    </Location>
    ```

    `@LOCAL` significa "la xarxa local d'aquesta interfície" — qualsevol IP de la mateixa subxarxa.

    ### Alternativa: permet per IP específica

    ```apache
    <Location />
      Order allow,deny
      Allow 192.168.100.0/24
    </Location>
    ```

    ## Aplica els canvis

    ```bash
    sudo systemctl restart cups
    ss -tulnp | grep 631
    ```

    Ara CUPS hauria d'escoltar en totes les interfícies:

    ```text
    tcp  LISTEN  0  5  0.0.0.0:631  0.0.0.0:*
    ```

    ## Firewall

    Si UFW està actiu, cal permetre el port 631:

    ```bash
    # Des de la xarxa de l'aula
    sudo ufw allow from 192.168.100.0/24 to any port 631
    sudo ufw status
    ```

    ## Impressió des del client

    Des d'un client Linux, instal·la les eines CUPS:

    ```bash
    sudo apt install cups-client -y
    ```

    Descobreix les impressores del servidor:

    ```bash
    lpstat -h 192.168.100.10 -p
    ```

    Imprimeix:

    ```bash
    lp -h 192.168.100.10 -d PDF document.txt
    ```

    O bé, afegeix la impressora remota al client:

    ```bash
    sudo lpadmin -p PDF-remota -E \
      -v ipp://192.168.100.10:631/printers/PDF \
      -m everywhere
    ```

    !!! tip "Connexió amb UT1"
        A Windows, l'equivalent és "Afegir una impressora de xarxa". CUPS amb `Listen 0.0.0.0:631` és equivalent a tenir el "Print Server" de Windows activat i visible a la xarxa. La diferència: a Windows es gestiona via GUI des del servidor; a Linux, editant `cupsd.conf`.

    !!! warning "Error freqüent"
        Canviar `Listen` a `0.0.0.0:631` però no modificar els blocs `<Location>`. Sense `Allow @LOCAL` als blocs Location, CUPS escolta en totes les interfícies però **rebutja totes les connexions externes** amb error 403. Ambdós canvis (Listen + Location) són necessaris.

    ??? question "Auto-avaluació"
        **1.** Quina directiva de `cupsd.conf` fa que CUPS escolti en totes les interfícies de xarxa?

        ??? success "Resposta"
            `Listen 0.0.0.0:631`. Canvia de `Listen localhost:631` (únicament local) a escoltar en qualsevol adreça IP (`0.0.0.0`). Per a IPv6 es pot afegir `Listen [::]:631`. Cal reiniciar `cups` per aplicar el canvi.

        **2.** Quin és el propòsit de la directiva `Allow @LOCAL` als blocs `<Location>` de CUPS?

        ??? success "Resposta"
            Permet l'accés als recursos CUPS des de qualsevol IP de la **mateixa xarxa local** que el servidor. `@LOCAL` és una macro de CUPS que resol a tots els rangs de xarxa de les interfícies locals del servidor. Sense aquesta directiva, les connexions externes reben un error 403 Forbidden.

        **3.** Quina ordre afegeix una impressora CUPS remota al client Linux?

        ??? success "Resposta"
            `sudo lpadmin -p nom-impressora -E -v ipp://IP-servidor:631/printers/nom -m everywhere`. L'opció `-p` és el nom local de la impressora, `-E` l'habilita, `-v` és la URI de la impressora remota i `-m everywhere` usa el driver IPP Everywhere (genèric, compatible amb la majoria d'impressores modernes).

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.26 · CUPS en xarxa

    **Objectiu**: configurar CUPS per acceptar connexions de la xarxa i imprimir des d'un client remot.
    **Temps estimat**: 30 minuts

    ---

    ### Pas 1 – Fes una còpia de seguretat de cupsd.conf

    ```bash
    sudo cp /etc/cups/cupsd.conf /etc/cups/cupsd.conf.bak
    ```

    ### Pas 2 – Modifica cupsd.conf

    ```bash
    sudo nano /etc/cups/cupsd.conf
    ```

    Canvia `Listen localhost:631` per `Listen 0.0.0.0:631`.

    Als blocs `<Location />` i `<Location /admin>`, afegeix `Allow @LOCAL`.

    ### Pas 3 – Reinicia i verifica

    ```bash
    sudo systemctl restart cups
    ss -tulnp | grep 631
    # Hauria de mostrar 0.0.0.0:631
    ```

    ### Pas 4 – Obre el port al firewall

    ```bash
    sudo ufw allow from 192.168.100.0/24 to any port 631
    ```

    ### Pas 5 – Imprimeix des del client

    ```bash
    # Des del client (192.168.100.20)
    sudo apt install cups-client -y
    lpstat -h 192.168.100.10 -p
    lp -h 192.168.100.10 -d PDF /etc/hostname
    ```

    Verifica al servidor que el PDF s'ha generat.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"CUPS network printing Ubuntu server setup"`
        - `"cupsd.conf Listen 0.0.0.0 network access"`
        - `"CUPS remote printing Linux client server"`
