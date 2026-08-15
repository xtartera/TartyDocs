---
title: CUPS + Samba – Compartició amb Windows
tags:
  - ut3
  - cups
  - samba
---

# :material-microsoft-windows: CUPS + Samba – Compartició amb Windows

!!! abstract "Concepte clau"
    Combinant **CUPS** i **Samba**, un servidor Ubuntu pot compartir impressores amb clients Windows via SMB/CIFS — el protocol natiu de Windows. Samba actua com a intermediari: exposa les impressores CUPS com si fossin impressores Windows locals.

=== ":material-notebook-outline: Apunts"

    ## Arquitectura CUPS + Samba

    ```mermaid
    graph LR
        W["Client Windows"] -->|"SMB · port 445"| SAMBA["Samba (smbd)"]
        L["Client Linux"] -->|"IPP · port 631"| CUPS["CUPS (cupsd)"]
        SAMBA -->|"printcap = cups"| CUPS
        CUPS -->|"cups-pdf backend"| PDF["Fitxer PDF"]
        CUPS -->|"usb/socket backend"| PRINT["Impressora física"]
        subgraph "Ubuntu Server"
            SAMBA
            CUPS
        end
    ```

    El client Windows accedeix via SMB (port 445) → Samba reenvia el treball a CUPS → CUPS el processa i l'envia a la impressora (o genera el PDF).

    ## Configuració de Samba per a impressores CUPS

    Afegeix o modifica la secció `[global]` de `smb.conf`:

    ```ini
    [global]
        # Habilita la integració CUPS
        printing = cups
        printcap name = cups
        load printers = yes
        cups options = raw
    ```

    Afegeix la secció `[printers]` per compartir totes les impressores CUPS:

    ```ini
    [printers]
        comment = Impressores via CUPS
        browseable = no
        path = /var/spool/samba
        printable = yes
        guest ok = no
        read only = yes
        create mask = 0700
    ```

    ## Directori d'espool Samba

    ```bash
    sudo mkdir -p /var/spool/samba
    sudo chmod 1777 /var/spool/samba
    ```

    El directori `/var/spool/samba` és el directori temporal on Samba desa els treballs d'impressió abans d'enviar-los a CUPS.

    ## Compartició de drivers per a Windows

    Per als clients Windows, sovint cal compartir els drivers d'impressora:

    ```ini
    [print$]
        comment = Drivers d'impressores
        path = /var/lib/samba/printers
        browseable = yes
        read only = yes
        guest ok = no
        write list = @lpadmin
    ```

    ```bash
    sudo mkdir -p /var/lib/samba/printers
    sudo chown root:lpadmin /var/lib/samba/printers
    sudo chmod 775 /var/lib/samba/printers
    ```

    ## Aplica i verifica

    ```bash
    testparm
    sudo systemctl restart smbd
    ```

    Des del client Windows:
    1. Obre "Xarxa" a l'Explorador
    2. Busca el servidor per nom o IP: `\\192.168.100.10`
    3. Les impressores compartides apareixeran a la llista

    ## Instal·lació del driver al client Windows

    Si CUPS exposa la impressora PDF, Windows pot instal·lar un driver genèric PostScript o usar el driver IPP Everywhere (Windows 10+):

    ```
    \\192.168.100.10\PDF
    → Doble clic → Connecta → Instal·la driver genèric PostScript
    ```

    !!! tip "IPP directe des de Windows (alternativa a Samba)"
        Windows 10 i 11 suporten IPP natiu. En lloc d'usar Samba, pots afegir la impressora CUPS directament des de Windows:
        - Afegeix impressora → "La impressora que vull no apareix" → "Impressora TCP/IP o web"
        - URI: `http://192.168.100.10:631/printers/PDF`

        Aquesta opció no requereix Samba i és més senzilla en entorns moderns.

    !!! warning "Error freqüent"
        Oblidar crear el directori `/var/spool/samba` o no assignar-hi els permisos correctes (`chmod 1777`). Sense aquest directori, Samba no pot espolsar els treballs d'impressió i falla amb errors de permís als logs (`/var/log/samba/log.smbd`).

    ??? question "Auto-avaluació"
        **1.** Quines directives cal afegir a la secció `[global]` de `smb.conf` per integrar Samba amb CUPS?

        ??? success "Resposta"
            `printing = cups` (indica a Samba que el sistema d'impressió és CUPS) i `printcap name = cups` (indica a Samba que obtingui la llista d'impressores de CUPS en lloc de `/etc/printcap`). Opcionalment, `load printers = yes` per compartir automàticament totes les impressores CUPS.

        **2.** Quin protocol usa el client Windows per accedir a les impressores compartides via Samba?

        ??? success "Resposta"
            El protocol **SMB/CIFS** (port 445). Samba exposa les impressores CUPS com si fossin impressores Windows locals via SMB. Alternativament, Windows 10/11 pot usar **IPP** directe (port 631) sense necessitat de Samba.

        **3.** Quin és el propòsit de la secció `[print$]` a `smb.conf`?

        ??? success "Resposta"
            La secció `[print$]` comparteix els **drivers d'impressora** per a clients Windows. Quan un client Windows es connecta a una impressora Samba, pot descarregar el driver des d'aquest recurs compartit automàticament, sense necessitat d'instal·lar el driver manualment al client.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.29 · CUPS + Samba per a clients Windows

    **Objectiu**: configurar Samba per exposar impressores CUPS als clients Windows.
    **Temps estimat**: 40 minuts
    **Prerequisit**: Samba instal·lat (Bloc 2) i CUPS funcional en xarxa (Activitat 3.26)

    ---

    ### Pas 1 – Crea el directori d'espool

    ```bash
    sudo mkdir -p /var/spool/samba
    sudo chmod 1777 /var/spool/samba
    ```

    ### Pas 2 – Modifica smb.conf

    Afegeix a `[global]`:

    ```ini
    printing = cups
    printcap name = cups
    load printers = yes
    cups options = raw
    ```

    Afegeix la secció `[printers]`:

    ```ini
    [printers]
        comment = Impressores via CUPS
        browseable = no
        path = /var/spool/samba
        printable = yes
        guest ok = no
        read only = yes
        create mask = 0700
    ```

    ### Pas 3 – Reinicia i verifica

    ```bash
    testparm
    sudo systemctl restart smbd
    smbclient -L //localhost -N | grep -i print
    ```

    ### Pas 4 – Connecta des de Windows (si disponible)

    Des d'un client Windows: `\\192.168.100.10` → hauria de veure les impressores compartides.

    ### Pas 5 – Alternativa: IPP directe des de Windows

    Si no tens client Windows, documenta el procés alternatiu IPP:
    ```
    URI a usar: http://192.168.100.10:631/printers/PDF
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Samba CUPS Windows printing Linux server"`
        - `"Ubuntu Samba print server Windows clients"`
        - `"CUPS IPP Windows 10 11 add printer"`
