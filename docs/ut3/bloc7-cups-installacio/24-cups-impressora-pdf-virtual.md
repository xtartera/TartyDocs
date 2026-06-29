---
title: CUPS – Impressora PDF virtual
tags:
  - ut3
  - cups
---

# :material-file-pdf-box: CUPS – Impressora PDF virtual

!!! abstract "Concepte clau"
    `cups-pdf` crea una impressora virtual que converteix qualsevol document imprès en un **fitxer PDF**. Els PDFs es desen a `/var/spool/cups-pdf/<usuari>/`. Ideal per a entorns sense impressora física i per verificar la configuració CUPS sense hardware real.

=== ":material-notebook-outline: Apunts"

    ## Com funciona cups-pdf

    ```mermaid
    graph LR
        APP["Aplicació\n(Firefox, LibreOffice...)"] -->|"Imprimeix a 'PDF'"| CUPS["cupsd\n(CUPS)"]
        CUPS -->|"Filtre PostScript"| PS["Document\nPostScript"]
        PS -->|"cups-pdf backend"| PDF["Fitxer PDF"]
        PDF --> DIR["/var/spool/cups-pdf/\n<usuari>/document.pdf"]
    ```

    L'aplicació envia el treball a la impressora `PDF` (registrada a CUPS). CUPS aplica els filtres de conversió i el backend `cups-pdf` genera el fitxer PDF al directori de sortida.

    ## Instal·lació i registre

    `cups-pdf` s'instal·la com a part del paquet del mateix nom:

    ```bash
    sudo apt install cups-pdf -y
    ```

    Un cop instal·lat, la impressora `PDF` apareix automàticament a CUPS. Verifica:

    ```bash
    lpstat -p
    ```

    Sortida:

    ```text
    printer PDF is idle.  enabled since ...
    ```

    ## Directori de sortida

    Els PDFs es desen per defecte a:

    ```
    /var/spool/cups-pdf/<nom-usuari>/
    ```

    Exemples:
    - Usuari `maria.puig` imprimeix → `/var/spool/cups-pdf/maria.puig/document.pdf`
    - Usuari `root` imprimeix → `/var/spool/cups-pdf/root/document.pdf`

    Verifica els PDFs creats:

    ```bash
    ls -la /var/spool/cups-pdf/
    ls -la /var/spool/cups-pdf/$(whoami)/
    ```

    ## Impressió des de la línia d'ordres

    ```bash
    # Imprimeix un document de text
    lp -d PDF /etc/hostname

    # Imprimeix la pàgina de prova estàndard de CUPS
    lp -d PDF /usr/share/cups/data/testprint

    # Imprimeix un fitxer PDF existent (el converteix i en genera un de nou)
    lp -d PDF fitxer-existent.pdf

    # Imprimeix múltiples còpies
    lp -d PDF -n 3 document.txt
    ```

    ## Configuració del directori de sortida

    El directori de sortida es pot canviar a `/etc/cups/cups-pdf.conf`:

    ```bash
    sudo nano /etc/cups/cups-pdf.conf
    ```

    Opció rellevant:

    ```
    Out /home/${USER}/PDF
    ```

    Amb `${USER}`, els PDFs van al directori `/home/<usuari>/PDF/` de cada usuari — més còmode per a l'usuari que `/var/spool/cups-pdf/`.

    Aplica els canvis reiniciant CUPS:

    ```bash
    sudo systemctl restart cups
    ```

    ## Permisos del directori de sortida

    Per defecte, `/var/spool/cups-pdf/` és propietat de `root` i el directori de cada usuari es crea automàticament en el primer ús. Si l'usuari no pot llegir el seu PDF:

    ```bash
    ls -la /var/spool/cups-pdf/maria.puig/
    sudo chown maria.puig:maria.puig /var/spool/cups-pdf/maria.puig/
    ```

    !!! tip "Ús pedagògic de cups-pdf"
        `cups-pdf` és perfecta per a entorns d'aula on no hi ha impressores físiques. Permet practicar tota la gestió CUPS (cues, permisos, restriccions per grups) amb un resultat tangible (el fitxer PDF) sense necessitat de hardware.

    !!! warning "Error freqüent"
        El PDF es genera però l'usuari no el troba. Causa: es desa a `/var/spool/cups-pdf/root/` perquè l'ordre `lp` s'ha executat com a `sudo`. Sense `sudo`, el PDF va al directori de l'usuari actual. Evita `sudo lp` si vols que el PDF vagi al teu directori.

    ??? question "Auto-avaluació"
        **1.** On es desen els PDFs generats per `cups-pdf` per a l'usuari `pere.costa`?

        ??? success "Resposta"
            A `/var/spool/cups-pdf/pere.costa/`. El directori es crea automàticament la primera vegada que `pere.costa` imprimeix a la impressora `PDF`. Si el directori no existeix és que l'usuari encara no ha imprès res via `cups-pdf`.

        **2.** Quina ordre imprimeix el fitxer `/etc/hosts` a la impressora PDF virtual?

        ??? success "Resposta"
            `lp -d PDF /etc/hosts`. L'opció `-d PDF` especifica la impressora de destinació (destí). Sense `-d`, `lp` usa la impressora per defecte del sistema.

        **3.** Com es canvia el directori de sortida dels PDFs a la carpeta home de cada usuari?

        ??? success "Resposta"
            Editant `/etc/cups/cups-pdf.conf` i canviant la directiva `Out`: `Out /home/${USER}/PDF`. La variable `${USER}` s'expandeix al nom de l'usuari que imprimeix. Després cal reiniciar CUPS amb `sudo systemctl restart cups` i crear el directori `~/PDF` per als usuaris que l'usaran.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.24 · Impressora PDF virtual

    **Objectiu**: imprimir documents a la impressora PDF virtual i verificar la generació dels fitxers.
    **Temps estimat**: 25 minuts

    ---

    ### Pas 1 – Verifica la impressora PDF

    ```bash
    lpstat -p
    lpstat -p PDF -l
    ```

    ### Pas 2 – Imprimeix des de la línia d'ordres

    ```bash
    lp -d PDF /etc/hostname
    lp -d PDF /etc/hosts
    ```

    ### Pas 3 – Verifica els PDFs generats

    ```bash
    ls -la /var/spool/cups-pdf/$(whoami)/
    ```

    ### Pas 4 – Canvia el directori de sortida

    ```bash
    sudo nano /etc/cups/cups-pdf.conf
    # Canvia: Out /home/${USER}/PDF
    sudo systemctl restart cups
    mkdir -p ~/PDF
    ```

    Imprimeix un document nou i verifica que el PDF apareix a `~/PDF/`.

    ### Pas 5 – Prova des d'una aplicació gràfica (opcional)

    Si tens entorn gràfic disponible, obri LibreOffice Writer o un navegador, crea un document senzill i imprimeix-lo seleccionant la impressora `PDF`.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"cups-pdf virtual PDF printer Linux setup"`
        - `"CUPS PDF printer lp command Linux"`
        - `"Ubuntu print to PDF CUPS cups-pdf"`
