---
title: CUPS – PPD i URI d'impressora
tags:
  - ut3
  - cups
---

# :material-file-document-outline: CUPS – PPD i URI d'impressora

!!! abstract "Concepte clau"
    Una **URI** (Uniform Resource Identifier) identifica on és la impressora i com s'hi comunica CUPS. Un fitxer **PPD** (PostScript Printer Description) descriu les capacitats de la impressora. Conèixer els formats URI i els PPD permet afegir i gestionar impressores manualment des de la línia d'ordres.

=== ":material-notebook-outline: Apunts"

    ## URI d'impressora a CUPS

    La URI especifica el **protocol**, l'**adreça** i el **recurs** de la impressora:

    ```
    protocol://host:port/recurs
    ```

    ### Formats de URI principals

    | URI | Protocol | Ús |
    |-----|---------|-----|
    | `cups-pdf:/` | cups-pdf | Impressora PDF virtual local |
    | `ipp://servidor:631/printers/PDF` | IPP | Impressora CUPS remota via IPP |
    | `socket://192.168.1.50:9100` | RAW socket | Impressora de xarxa amb port JetDirect |
    | `usb://Marca/Model?serial=XXX` | USB | Impressora connectada per USB |
    | `lpd://servidor/cua` | LPD | Servidor d'impressió antic (legacy) |
    | `smb://servidor/impressora` | SMB | Impressora compartida via Samba/Windows |

    ## PPD — PostScript Printer Description

    Els fitxers PPD descriuen les capacitats d'una impressora:
    - Mides de paper suportades (A4, Letter, Legal...)
    - Resolucions disponibles (300dpi, 600dpi, 1200dpi...)
    - Funcions especials (impressió a doble cara, color, grapa...)
    - Tipus de paper acceptat

    Els PPDs s'emmagatzemen a `/etc/cups/ppd/<nom-impressora>.ppd`.

    ### Opcions d'obtenció de PPD

    | Mètode | Quan usar |
    |--------|----------|
    | `everywhere` (IPP Everywhere) | Impressores modernes que suporten IPP 2.0+ |
    | Paquet del fabricant (`hplip`, `gutenprint`) | Impressores amb drivers específics |
    | Fitxer PPD descarregat | Models antics o de nínxol |
    | PPD genèric de CUPS | Impressores PostScript genèriques |

    ## Afegir impressores amb lpadmin

    `lpadmin` és l'eina de línia d'ordres per gestionar impressores a CUPS:

    ```bash
    # Afegir la impressora PDF virtual
    sudo lpadmin -p PDF -E -v cups-pdf:/ -m CUPS-PDF.ppd

    # Afegir una impressora IPP remota
    sudo lpadmin -p Remota -E \
      -v ipp://192.168.100.10:631/printers/PDF \
      -m everywhere

    # Afegir una impressora de xarxa via socket
    sudo lpadmin -p HP-Oficina -E \
      -v socket://192.168.1.50:9100 \
      -m drv:///sample.drv/generic.ppd

    # Eliminar una impressora
    sudo lpadmin -x nom-impressora
    ```

    ### Opcions principals de lpadmin

    | Opció | Funció |
    |-------|--------|
    | `-p nom` | Nom de la impressora |
    | `-E` | Habilita la impressora |
    | `-v uri` | URI del dispositiu |
    | `-m model` | Fitxer PPD o model predefinit |
    | `-x nom` | Elimina la impressora |
    | `-d nom` | Estableix com a impressora per defecte |

    ## Consulta de les URIs actives

    ```bash
    # Llista totes les impressores amb la seva URI
    lpstat -v

    # O des de cupsd.conf i printers.conf
    sudo cat /etc/cups/printers.conf | grep -E "PrinterName|DeviceURI"
    ```

    Sortida de `lpstat -v`:

    ```text
    device for PDF: cups-pdf:/
    device for HP-Remota: ipp://192.168.100.10:631/printers/PDF
    ```

    !!! warning "Error freqüent"
        Usar una URI incorrecta en `lpadmin -v`. Els errors habituals: oblidar el port (`:631`), escriure la ruta `/printers/` incorrectament, o usar `http://` en lloc de `ipp://`. CUPS accepta la definició però la impressora queda en estat "parada" amb errors de connexió. Comprova sempre `lpstat -v` i els logs de CUPS.

    ??? question "Auto-avaluació"
        **1.** Quina URI s'usa per afegir una impressora remota CUPS via protocol IPP?

        ??? success "Resposta"
            `ipp://servidor:631/printers/nom-impressora`. Per exemple: `ipp://192.168.100.10:631/printers/PDF`. Si el servidor usa HTTPS, es pot usar `ipps://...` (IPP segur).

        **2.** Quina funció té el fitxer PPD d'una impressora?

        ??? success "Resposta"
            El PPD (PostScript Printer Description) descriu les **capacitats** de la impressora: mides de paper suportades, resolucions disponibles, opcions de color, impressió a doble cara, etc. CUPS usa el PPD per saber quines opcions pot oferir a l'usuari en el moment d'imprimir.

        **3.** Quina ordre afegeix la impressora `PDF-Aula` al client apuntant a la impressora `PDF` del servidor `192.168.100.10`?

        ??? success "Resposta"
            `sudo lpadmin -p PDF-Aula -E -v ipp://192.168.100.10:631/printers/PDF -m everywhere`. `-m everywhere` usa el driver IPP Everywhere genèric, adequat per a impressores modernes que suporten IPP 2.0+.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.28 · Gestió d'impressores amb lpadmin

    **Objectiu**: afegir, verificar i eliminar impressores amb `lpadmin` i explorar les URIs.
    **Temps estimat**: 30 minuts

    ---

    ### Pas 1 – Consulta les impressores actuals

    ```bash
    lpstat -v
    lpstat -p
    ```

    Documenta la URI de cada impressora instal·lada.

    ### Pas 2 – Afegeix la impressora remota al client

    Des del client (`192.168.100.20`):

    ```bash
    sudo lpadmin -p PDF-Servidor -E \
      -v ipp://192.168.100.10:631/printers/PDF \
      -m everywhere
    ```

    Verifica:

    ```bash
    lpstat -v
    lpstat -p PDF-Servidor
    ```

    ### Pas 3 – Imprimeix a través de la nova impressora

    ```bash
    lp -d PDF-Servidor /etc/hostname
    ```

    Verifica al servidor que el PDF s'ha generat.

    ### Pas 4 – Consulta el PPD

    ```bash
    # Al servidor
    ls /etc/cups/ppd/
    cat /etc/cups/ppd/PDF.ppd | head -30
    ```

    Documenta: quin model d'impressora descriu el PPD?

    ### Pas 5 – Elimina la impressora afegida

    ```bash
    sudo lpadmin -x PDF-Servidor
    lpstat -v
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"CUPS lpadmin add printer URI Linux"`
        - `"PPD file PostScript Printer Description explained"`
        - `"CUPS IPP URI printer setup Linux terminal"`
