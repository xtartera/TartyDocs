---
title: gpresult – Resultat de polítiques aplicades
tags:
  - GPO
  - diagnòstic
  - clients
  - UT1
---

# :material-file-chart: gpresult – Resultat de polítiques aplicades

!!! abstract "Concepte clau"
    **`gpresult`** mostra quines GPO s'han aplicat realment a un usuari o equip, i quines s'han filtrat o denegat. És l'eina definitiva per diagnosticar per quin motiu una política no té efecte, i s'usa en tots els projectes a partir del Projecte 2.

=== ":material-notebook-outline: Apunts"

    ## Sintaxi i modes principals

    ```cmd
    gpresult /r              :: Resum per a l'usuari i equip actuals
    gpresult /v              :: Mode verbose (molt detallat)
    gpresult /h informe.html :: Informe HTML complet (recomanat per al dossier)
    gpresult /z              :: Mode super-verbose (inclou configuració de cada paràmetre)
    ```

    ### Paràmetres de filtre útils

    ```cmd
    :: Mostra només les GPO aplicades a l'equip
    gpresult /r /scope computer

    :: Mostra les GPO aplicades a l'usuari (requereix sessió d'usuari)
    gpresult /r /scope user

    :: Obté el resultat per a un usuari concret (executar com a Admin)
    gpresult /r /user maria.puig

    :: Obté el resultat d'un equip remot
    gpresult /r /s PC-AULA01 /user CIRVIANUM\maria.puig
    ```

    ## Interpretar la sortida de `gpresult /r`

    ```text
    Microsoft Windows [Versió 10.0.22621.xxx]
    ==========================================
    DADES DE RSOP PER A CIRVIANUM\maria.puig
    ==========================================

    Informació de l'ordinador
    -------------------------
        Nom de l'ordinador: PC-AULA01
        Lloc:               Default-First-Site-Name
        ← Aquí van les GPO aplicades a l'EQUIP →

    Objectes de directiva de grup aplicats
    ----------------------------------------
        Default Domain Policy       ← GPO de domini (contrasenya, etc.)
        Restriccions-Equips         ← GPO vinculada a OU=Equips

    Objectes de directiva de grup que no s'han aplicat (filtrats)
    ---------------------------------------------------------------
        GPO-Professors              ← No s'aplica: l'usuari no és a OU=Professors
            Motiu de filtratge: Accés denegat (sense permís de lectura)

    Informació de l'usuari
    ----------------------
        Nom de l'usuari: CIRVIANUM\maria.puig
        ← Aquí van les GPO aplicades a l'USUARI →

    Objectes de directiva de grup aplicats
    ----------------------------------------
        Default Domain Policy       ← GPO de domini
        Alumnes_GPO                 ← GPO vinculada a OU=Alumnes
        RestriccionsAlumnes         ← GPO vinculada a OU=SMX-1
    ```

    ## Motius habituals per which una GPO no s'aplica

    | Motiu mostrat | Causa | Solució |
    |---------------|-------|---------|
    | `Accés denegat (sense permís de lectura)` | L'usuari/equip no té permisos sobre la GPO | Afegeix el grup a les **Permissions de seguretat** de la GPO |
    | `Filtrat de seguretat` | La GPO té un filtre de seguretat que exclou l'usuari | Afegeix l'usuari/grup al filtre |
    | `Bloqueada per herència` | Un pare ha bloquejat l'herència i la GPO és d'un contenidor superior | Revisa **Block Inheritance** i **Enforced** a GPMC |
    | `L'enllaç de GPO està desactivat` | La GPO existeix però l'enllaç a la UO és desactivat | Activa l'enllaç a GPMC |
    | *(GPO absent de la llista)* | La UO de l'usuari/equip no té cap GPO vinculada | Vincula la GPO a la UO correcta |

    ## Informe HTML: la millor opció per al dossier

    ```cmd
    :: Genera un informe HTML complet (requereix privilegis d'administrador)
    gpresult /h "C:\Informes\gpresult-maria.html" /f

    :: Genera l'informe per a un usuari específic
    gpresult /h "C:\Informes\gpresult-aula01.html" /user CIRVIANUM\maria.puig /f
    ```

    L'informe HTML mostra:

    - **Totes les GPO aplicades** a l'equip i a l'usuari
    - **Les GPO que no s'han aplicat** i el motiu
    - **Els paràmetres concrets** de cada GPO (en mode `/v` o l'informe HTML)
    - **Informació de xarxa i d'autenticació**

    !!! tip "L'informe HTML és molt més llegible que la sortida de consola i és l'evidència perfecta per al dossier del projecte. Obre'l amb qualsevol navegador web."

    ## `gpresult` vs RSoP

    `gpresult` és la implementació moderna del **RSoP** (Resultant Set of Policy). L'eina gràfica `rsop.msc` fa el mateix però menys detallada:

    ```cmd
    :: Obre la consola RSoP gràfica (menys detallada que gpresult /h)
    rsop.msc
    ```

    Per a diagnòstic, sempre prefereix `gpresult /h` sobre `rsop.msc`.

    ## Flux de diagnòstic de GPO

    ```mermaid
    graph TD
        P["❓ Una GPO no té efecte"]
        P --> A["gpresult /r\nApareix a la llista?"]
        A -->|"No"| B["Revisa la vinculació\na la UO correcta\ni el filtre de seguretat"]
        A -->|"Sí però filtrada"| C["Llegeix el motiu\nde filtratge\ni actua en conseqüència"]
        A -->|"Sí i aplicada"| D["La GPO s'aplica\nPerò la configuració\npot ser sobreescrita\nper una altra GPO\nde major prioritat"]
        D --> E["gpresult /v\nVeure la configuració\nresultant del paràmetre concret"]
    ```

    ??? question "Auto-avaluació"

        **1.** La GPO `RestriccionsAlumnes` hauria d'impedir als alumnes obrir el Panell de control, però `maria.puig` hi pot accedir. `gpresult /r` mostra la GPO com a aplicada. Quin és el següent pas de diagnòstic?

        ??? success "Resposta"
            Si la GPO apareix com a aplicada però el comportament no és el correcte, cal verificar si **una altra GPO de major prioritat sobreescriu la configuració**. Executa `gpresult /v` (verbose) o l'informe HTML per veure el valor resultant de la política concreta del Panell de control. Pot ser que la `Default Domain Policy` o una altra GPO estigui habilitant l'accés amb prioritat superior.

        **2.** Quin paràmetre de `gpresult` genera un informe en format HTML llegible amb un navegador?

        ??? success "Resposta"
            `gpresult /h nomfitxer.html`. El paràmetre `/f` força la sobreescriptura si el fitxer ja existeix: `gpresult /h "C:\Informes\gpresult.html" /f`. L'informe HTML conté tota la informació de GPO aplicades, filtrades i els seus paràmetres, en un format molt més llegible que la sortida de consola.

        **3.** A `gpresult /r`, la GPO `Professors_GPO` apareix com "no aplicada" amb el motiu "Accés denegat (sense permís de lectura)". Quin és el problema i com el soluciones?

        ??? success "Resposta"
            El grup o usuari no té permisos de **Lectura i Aplicar política de grup** a la GPO. A **GPMC**, selecciona la GPO → pestanya **Delegació** → **Afegit** → selecciona el grup d'usuaris/equips que han de rebre la política i assigna el permís "Lectura" i "Aplicar política de grup". Torna a executar `gpupdate /force` al client i verifica amb `gpresult /r`.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 6.4 · Analitza les GPO aplicades amb gpresult

    **Objectiu**: verificar que les GPO correctes s'apliquen als clients i als usuaris del domini.

    **Temps estimat**: 25 minuts

    **Prerequisit**: Client W11 unit al domini, sessió iniciada amb `maria.puig`

    ---

    ### Part A – Resum bàsic

    Des del client `PC-AULA01` amb sessió de `maria.puig`, executa:

    ```cmd
    gpresult /r
    ```

    Documenta:

    1. Quines GPO s'apliquen a l'**equip** `PC-AULA01`?
    2. Quines GPO s'apliquen a l'**usuari** `maria.puig`?
    3. Hi ha alguna GPO filtrada o no aplicada? Quin motiu indica?

    ### Part B – Informe HTML

    ```cmd
    gpresult /h "C:\Informes\gpresult-maria.html" /f
    ```

    1. Obre l'informe HTML al navegador
    2. Identifica la secció "Objectes de directiva de grup aplicats" per a l'usuari
    3. Inclou una captura de pantalla de l'informe al dossier

    ### Part C – Comprova des del servidor

    Al servidor DC (com a Administrador), obté el resultat de l'equip client:

    ```cmd
    gpresult /r /s PC-AULA01 /scope computer
    ```

    Quines GPO s'apliquen a l'equip? Coincideixen amb el que veies al client?

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"gpresult /r Windows Server Group Policy verify"`
        - `"gpresult HTML report Active Directory GPO"`
        - `"Group Policy troubleshooting gpresult rsop"`
        - `"GPO not applying troubleshoot Windows Server 2022"`
