---
title: CUPS – Ordres d'impressió (lp, lpq, cancel)
tags:
  - ut3
  - cups
---

# :material-console: CUPS – Ordres d'impressió (lp, lpq, cancel)

!!! abstract "Concepte clau"
    CUPS ofereix un conjunt d'ordres de línia per gestionar la impressió: `lp` (enviar treballs), `lpstat` (estat de les impressores), `lpq` (veure la cua), `cancel` (cancel·lar un treball) i `lprm` (eliminar de la cua). Conèixer-les és essencial per a la gestió des de SSH.

=== ":material-notebook-outline: Apunts"

    ## lp — enviar treballs d'impressió

    ```bash
    lp [opcions] fitxer
    ```

    | Opció | Funció | Exemple |
    |-------|--------|---------|
    | `-d impressora` | Impressora de destinació | `lp -d PDF document.txt` |
    | `-n N` | Nombre de còpies | `lp -d PDF -n 3 document.txt` |
    | `-t "títol"` | Títol del treball | `lp -d PDF -t "Informe Abril" informe.pdf` |
    | `-P rang` | Pàgines a imprimir | `lp -d PDF -P 1-5 document.pdf` |
    | `-o sides=two-sided-long-edge` | Impressió a doble cara | `lp -d PDF -o sides=two-sided-long-edge doc.pdf` |

    Sortida:

    ```text
    request id is PDF-12 (1 file(s))
    ```

    El número de treball (`PDF-12`) serveix per cancel·lar-lo si cal.

    ## lpstat — estat de les impressores i treballs

    ```bash
    # Estat de totes les impressores
    lpstat -p

    # Estat de la impressora PDF amb detalls
    lpstat -p PDF -l

    # Informació del servidor CUPS
    lpstat -r

    # Impressora per defecte
    lpstat -d

    # Tots els treballs actius
    lpstat -o
    ```

    Sortida de `lpstat -p`:

    ```text
    printer PDF is idle.  enabled since Mon 23 Jun 2025 10:15:00 AM CEST
    printer HP-LaserJet is stopped.  enabled since ...
    ```

    ## lpq — estat de la cua

    ```bash
    # Cua de la impressora per defecte
    lpq

    # Cua d'una impressora concreta
    lpq -P PDF
    ```

    Sortida:

    ```text
    PDF is ready
    Rank    Owner   Job     File(s)         Total Size
    1st     maria   PDF-12  document.txt    2048 bytes
    2nd     pere    PDF-13  informe.pdf     45056 bytes
    ```

    ## cancel — cancel·lar treballs

    ```bash
    # Cancel·la el treball PDF-12
    cancel PDF-12

    # Cancel·la tots els treballs de la impressora PDF
    cancel -a PDF

    # cancel com a root per cancel·lar treballs d'altres usuaris
    sudo cancel -a -u maria.puig PDF
    ```

    ## lprm — eliminar treballs de la cua

    ```bash
    # Elimina el treball 12 de la impressora PDF
    lprm -P PDF 12

    # Elimina tots els treballs propis
    lprm -
    ```

    `cancel` i `lprm` fan essencialment la mateixa cosa; `cancel` és l'ordre IPP moderna, `lprm` és la compatibilitat amb BSD.

    ## Taula resum d'ordres

    | Tasca | Ordre | Exemple |
    |-------|-------|---------|
    | Enviar treball | `lp -d impressora fitxer` | `lp -d PDF document.txt` |
    | Veure impressores | `lpstat -p` | — |
    | Veure cua | `lpq -P impressora` | `lpq -P PDF` |
    | Cancel·lar treball | `cancel ID` | `cancel PDF-12` |
    | Cancel·lar tots | `cancel -a impressora` | `cancel -a PDF` |
    | Veure treballs actius | `lpstat -o` | — |

    !!! tip "Connexió amb UT1"
        A Windows, la gestió de la cua d'impressió es fa des del "Panel de control → Dispositius i impressores" o amb PowerShell (`Get-PrintJob`, `Remove-PrintJob`). A Linux, les ordres `lp`/`lpq`/`cancel` permeten fer el mateix des d'un terminal SSH sense accés gràfic — especialment útil per a servidors headless.

    !!! warning "Error freqüent"
        Confondre `lpstat -p` (estat de les impressores) amb `lpstat -o` (estat dels treballs). `-p` = printers, `-o` = output/jobs. Memoritza: `lp` per imprimir, `lpstat -p` per veure les impressores, `lpq` per veure la cua.

    ??? question "Auto-avaluació"
        **1.** Quina ordre envia el fitxer `informe.txt` a la impressora `PDF` i n'imprimeix 2 còpies?

        ??? success "Resposta"
            `lp -d PDF -n 2 informe.txt`. L'opció `-d` especifica la impressora (destinació) i `-n` el nombre de còpies.

        **2.** Com es cancel·len **tots** els treballs d'impressió de la impressora `PDF`?

        ??? success "Resposta"
            `cancel -a PDF`. L'opció `-a` (all) cancel·la tots els treballs de la impressora especificada. Com a root, també es poden cancel·lar treballs d'altres usuaris: `sudo cancel -a PDF`.

        **3.** Quina diferència hi ha entre `lpstat -p` i `lpq`?

        ??? success "Resposta"
            `lpstat -p` mostra l'**estat de les impressores** (activa, parada, habilitada...). `lpq` mostra els **treballs en cua** d'una impressora (qui espera, en quin ordre, mida del document). Per veure l'estat global, usa `lpstat -p`; per veure qui espera que imprimeixi, usa `lpq -P impressora`.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.25 · Gestió de la cua d'impressió

    **Objectiu**: practicar les ordres d'impressió CUPS: enviar treballs, veure la cua i cancel·lar.
    **Temps estimat**: 25 minuts

    ---

    ### Pas 1 – Envia múltiples treballs

    ```bash
    lp -d PDF /etc/hostname
    lp -d PDF /etc/hosts
    lp -d PDF -n 2 /etc/fstab
    ```

    ### Pas 2 – Pausa la impressora i envia més treballs

    ```bash
    # Pausa la impressora (des de la interfície web o:)
    sudo cupsdisable PDF

    # Envia un treball mentre la impressora està pausada
    lp -d PDF /etc/passwd
    ```

    ### Pas 3 – Observa la cua

    ```bash
    lpq -P PDF
    lpstat -p PDF
    lpstat -o
    ```

    Documenta l'ID de cada treball en cua.

    ### Pas 4 – Cancel·la un treball concret

    ```bash
    cancel PDF-XX   # substitueix XX per l'ID del treball
    lpq -P PDF     # verifica que ha desaparegut de la cua
    ```

    ### Pas 5 – Reprèn i processa

    ```bash
    sudo cupsenable PDF
    lpq -P PDF     # verifica que la cua es buida
    ls /var/spool/cups-pdf/$(whoami)/  # verifica els PDFs generats
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"CUPS lp lpstat lpq cancel commands Linux"`
        - `"Linux print queue management terminal"`
        - `"CUPS command line printing Ubuntu tutorial"`
