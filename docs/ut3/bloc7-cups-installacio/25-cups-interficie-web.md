---
title: CUPS – Interfície web (port 631)
tags:
  - ut3
  - cups
---

# :material-web: CUPS – Interfície web (port 631)

!!! abstract "Concepte clau"
    CUPS inclou una interfície web d'administració a `http://servidor:631`. Des d'aquí es poden afegir impressores, gestionar cues, configurar polítiques d'accés i monitorar el sistema d'impressió sense editar fitxers de configuració manualment.

=== ":material-notebook-outline: Apunts"

    ## Accés a la interfície web

    Per defecte, la interfície és accessible des de la mateixa màquina:

    ```
    http://localhost:631
    ```

    Per accedir-hi des de la xarxa (cal configurar CUPS primer, Bloc 8):

    ```
    http://192.168.100.10:631
    ```

    ## Seccions principals de la interfície

    | Secció | Funció |
    |--------|--------|
    | **Home** | Estat general: impressores, cues, versió CUPS |
    | **Administration** | Afegir/modificar/eliminar impressores, gestionar servidors |
    | **Classes** | Agrupa impressores en classes (load balancing) |
    | **Jobs** | Llista de treballs pendents, actius i completats |
    | **Printers** | Llista d'impressores, aturar/reprendre, provar |

    ## Afegir una impressora des de la interfície

    ### Pas a pas: afegir la impressora PDF virtual

    1. Ves a **Administration → Add Printer**
    2. Selecciona "Local Printers: CUPS-PDF (Virtual PDF Printer)"
    3. Fes clic a **Continue**
    4. Omple el formulari:
       - **Name**: `PDF`
       - **Description**: `Impressora PDF Virtual`
       - **Location**: `Servidor`
    5. Fes clic a **Continue → Add Printer**
    6. Selecciona les opcions per defecte i fes clic a **Set Default Options**

    ## Gestió d'impressores des de la interfície

    Des de la secció **Printers**, per a cada impressora pots:

    - **Print Test Page** — imprimeix una pàgina de prova
    - **Pause Printer** — para l'impressora temporalment
    - **Resume Printer** — reprèn l'impressora pausada
    - **Reject Jobs** — rebutja nous treballs (però processa els pendents)
    - **Cancel All Jobs** — cancel·la tots els treballs en cua
    - **Delete Printer** — elimina la impressora

    ## Autenticació a la interfície

    CUPS demana autenticació per a les operacions d'administració. Usa les credencials del sistema Linux de l'usuari del grup `lpadmin`.

    !!! warning "403 Forbidden a la interfície web"
        Si la interfície mostra "403 Forbidden" quan intentes fer una acció administrativa, comprova:
        1. L'usuari és al grup `lpadmin` (`groups $USER`)
        2. S'ha fet logout/login per activar el grup
        3. El navegador envia les credencials correctes (prova en mode incògnit)

    ## Impressió d'una pàgina de prova

    Des de la interfície o des de la línia d'ordres:

    ```bash
    # Via interfície: Printers → PDF → Print Test Page

    # Via línia d'ordres:
    lp -d PDF /usr/share/cups/data/testprint
    ```

    El PDF generat apareixerà a `/var/spool/cups-pdf/root/` (si l'executes com a root) o `/var/spool/cups-pdf/usuari/`.

    ??? question "Auto-avaluació"
        **1.** A quina secció de la interfície web de CUPS es poden afegir impressores noves?

        ??? success "Resposta"
            A la secció **Administration** (Administración). Des d'aquí, el botó "Add Printer" inicia l'assistent que detecta les impressores locals i permet configurar les de xarxa manualment.

        **2.** On es desen els fitxers PDF generats per la impressora virtual `cups-pdf`?

        ??? success "Resposta"
            A `/var/spool/cups-pdf/<nom-usuari>/`. Cada usuari té el seu propi subdirectori. Si l'usuari que imprimeix és `maria.puig`, els PDFs van a `/var/spool/cups-pdf/maria.puig/`. Si l'usuari és `root`, van a `/var/spool/cups-pdf/root/`.

        **3.** Quina acció de la interfície web permet enviar una pàgina de prova a una impressora?

        ??? success "Resposta"
            A la secció **Printers**, selecciona la impressora i fes clic a **"Print Test Page"** (o "Imprimir pàgina de prova"). CUPS envia un document de prova estàndard a la impressora per verificar que funciona correctament.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.23 · Exploració de la interfície web CUPS

    **Objectiu**: explorar la interfície web de CUPS, afegir la impressora PDF i imprimir una pàgina de prova.
    **Temps estimat**: 25 minuts

    ---

    ### Pas 1 – Accedeix a la interfície

    Obri un navegador a `http://localhost:631` i explora les seccions: Home, Administration, Printers, Jobs.

    ### Pas 2 – Comprova les impressores disponibles

    Ves a **Printers** i documenta:
    - Quines impressores apareixen?
    - Quin és l'estat de cadascuna?

    ### Pas 3 – Afegeix la impressora PDF si no apareix

    Administration → Add Printer → CUPS-PDF (Virtual PDF Printer)

    ### Pas 4 – Imprimeix una pàgina de prova

    ```bash
    lp -d PDF /usr/share/cups/data/testprint
    ```

    Verifica que el PDF s'ha creat:

    ```bash
    ls -la /var/spool/cups-pdf/
    # Explora el subdirectori del teu usuari
    ```

    ### Pas 5 – Gestiona la cua

    Ves a la secció **Jobs** de la interfície web mentre tens un treball en cua i documenta la informació que mostra (ID, usuari, mida, estat).

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"CUPS web interface port 631 Linux tutorial"`
        - `"CUPS add printer web admin Ubuntu"`
        - `"CUPS PDF virtual printer test page Linux"`
