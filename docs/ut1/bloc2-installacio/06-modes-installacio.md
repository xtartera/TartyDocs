---
title: Modes d'instal·lació – Server Core vs Desktop Experience
tags:
  - instal·lació
  - windows server
  - UT1
---

# :material-application-settings: Modes d'instal·lació

!!! abstract "Concepte clau"
    Windows Server 2022 s'instal·la en dos modes: **Desktop Experience** (amb GUI, el que usem al curs) o **Server Core** (només línia d'ordres, preferit en producció per seguretat i eficiència).

=== ":material-notebook-outline: Apunts"

    ## Els dos modes d'instal·lació

    Durant la instal·lació de Windows Server 2022, l'assistent demana quin mode vols instal·lar. Aquesta decisió és **permanent**: no es pot canviar fàcilment un cop instal·lat.

    ```mermaid
    graph TD
        ISO[💿 ISO Windows Server 2022]
        ISO --> Q{Quin mode?}
        Q --> DE["Desktop Experience\n(GUI completa)"]
        Q --> SC["Server Core\n(Línia d'ordres)"]
        DE --> U1[🖥️ Server Manager + GUI]
        SC --> U2[⌨️ PowerShell + sconfig]
    ```

    ## Desktop Experience

    El mode **Desktop Experience** inclou la interfície gràfica completa de Windows: escriptori, barra de tasques, Explorador de fitxers, Server Manager visual, etc.

    **Característiques:**

    - Interfície visual idèntica a Windows 10/11, adaptada a servidor
    - Totes les eines de gestió accessibles via menús
    - Ideal per a aprenentatge i entorns on els administradors prefereixen GUI
    - Consum extra de RAM (~1 GB més que Server Core)
    - Més components instal·lats = major superfície d'atac

    !!! info "Mode del curs"
        Al curs usem **Desktop Experience** perquè facilita l'aprenentatge. Pots veure el resultat de les teves accions visualment i comets menys errors en eines crítiques.

    ## Server Core

    El mode **Server Core** elimina completament la interfície gràfica. Quan arrenques, veus directament una finestra de consola (`cmd.exe`). Tota l'administració es fa per:

    - **PowerShell** (preferit)
    - **sconfig**: eina de text per a la configuració bàsica inicial
    - **RSAT** des d'un altre ordinador amb GUI (administració remota)

    **Característiques:**

    - ~1 GB menys de RAM consumida
    - Menys components = menys actualitzacions i menys vulnerabilitats
    - Reinicis menys freqüents
    - Preferit per empreses amb molts servidors gestionats remotament

    ## Comparativa

    | | Desktop Experience | Server Core |
    |-|:-----------------:|:-----------:|
    | **GUI** | Completa | No |
    | **Eina principal** | Server Manager + GUI | PowerShell + sconfig |
    | **RAM extra** | ~1 GB | — |
    | **Actualitzacions** | Més freqüents | Menys freqüents |
    | **Superfície d'atac** | Més gran | Reduïda |
    | **Administració remota** | Opcional | Habitual |
    | **Ús recomanat** | Aprenentatge, PIMES | Producció, datacenters |
    | **Al curs** | **Sí** | Opcional (avançat) |

    ## Com identificar el mode instal·lat

    Si reps un servidor i no saps quin mode té, comprova-ho amb PowerShell:

    ```powershell
    # Retorna "ServerCore" o "Server" (Desktop Experience)
    Get-ItemProperty "HKLM:\Software\Microsoft\Windows NT\CurrentVersion" `
        -Name InstallationType | Select-Object InstallationType
    ```

    !!! warning "Error a evitar a la instal·lació"
        Durant la instal·lació, l'opció per defecte a la llista és **Windows Server 2022 Standard** sense text addicional, que correspon a **Server Core**. Per instal·lar la versió amb GUI has de seleccionar explícitament **"Windows Server 2022 Standard (Desktop Experience)"**.

    ??? question "Auto-avaluació"

        **1.** Quin mode d'instal·lació té GUI i quin no en té?

        ??? success "Resposta"
            **Desktop Experience** inclou la interfície gràfica completa. **Server Core** no té GUI: s'administra per PowerShell, sconfig o eines remotes.

        **2.** Per quin motiu les empreses grans prefereixen Server Core en producció?

        ??? success "Resposta"
            Menys components instal·lats significa menys superfície d'atac per a vulnerabilitats, menys actualitzacions necessàries, menys reinicis i menor consum de RAM. En un datacenter amb centenars de servidors, l'administració remota (PowerShell Remoting, RSAT) compensa l'absència de GUI.

        **3.** Durant la instal·lació de WS2022, com identifiques visualment l'opció que inclou la GUI?

        ??? success "Resposta"
            L'opció amb GUI porta el text **(Desktop Experience)** al costat del nom de l'edició. L'opció sense text addicional instal·la el mode Server Core sense GUI.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 2.1 · Tria el mode d'instal·lació adequat

    **Objectiu**: decidir quin mode d'instal·lació és més adequat en funció del context.

    **Temps estimat**: 15 minuts

    ---

    ### Part A – Tria el mode

    Per a cada escenari, indica si triaries **Desktop Experience (DE)** o **Server Core (SC)** i justifica en una frase:

    | # | Escenari | Mode | Justificació |
    |---|----------|------|--------------|
    | 1 | Servidor AD del nostre laboratori de pràctiques | | |
    | 2 | 50 servidors virtuals en un datacenter gestionats per PowerShell | | |
    | 3 | Primer servidor d'una PIME on l'administrador no coneix PowerShell | | |
    | 4 | Servidor web IIS que ningú toca manualment cada dia | | |
    | 5 | Servidor de pràctiques on els alumnes aprenen a instal·lar rols | | |

    ### Part B – Exploració de sconfig

    Obre un PowerShell al Windows Server i escriu `sconfig`. Documenta:

    1. Quines opcions de configuració ofereix sconfig?
    2. Quines d'aquestes opcions no podries fer des de la GUI del Desktop Experience?
    3. Per quin motiu `sconfig` és útil fins i tot en mode Desktop Experience?

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Windows Server 2022 Desktop Experience vs Server Core"`
        - `"sconfig Windows Server tutorial"`
        - `"Server Core administration PowerShell remotely"`
