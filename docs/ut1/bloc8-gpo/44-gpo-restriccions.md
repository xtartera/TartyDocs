---
title: GPO de restriccions per a alumnes
tags:
  - GPO
  - restriccions
  - alumnes
  - UT1
---

# :material-lock-outline: GPO de restriccions per a alumnes

!!! abstract "Concepte clau"
    Les **GPO de restriccions** limiten el que els alumnes poden fer als equips de l'aula: impedeixen accedir al Panell de control, canviar el fons de pantalla, instal·lar programes o accedir al Registre. Totes es configuren a `Configuració d'usuari → Plantilles administratives` i s'apliquen en l'inici de sessió.

=== ":material-notebook-outline: Apunts"

    ## Restriccions de l'escriptori i el sistema

    Les restriccions més usades al curs es troben a:

    ```
    Configuració d'usuari
    └── Plantilles administratives
        ├── Panell de control          ← ocultar/desactivar panell
        ├── Escriptori                 ← fons, icones
        ├── Components de Windows
        │   ├── Explorador de fitxers  ← ocultar unitats, accés restringit
        │   └── Tasques de Windows
        └── Sistema                    ← accés al registre, símbol del sistema
    ```

    ## Restriccions habituals per a alumnes

    ### 1. Ocultar el Panell de control i Configuració

    ```
    Configuració d'usuari → Plantilles administratives → Panell de control
    → Prohibir l'accés al Panell de control i a la Configuració del PC: Activada
    ```

    ### 2. Fons de pantalla corporatiu (no modificable)

    ```
    Configuració d'usuari → Plantilles administratives → Escriptori → Escriptori
    → Tapís d'escriptori: Activada
    → Nom del tapís: \\SRV-WS2022\Public\fons-cirvianum.jpg
    → Estil del tapís: Ajusta

    Configuració d'usuari → Plantilles administratives → Panell de control → Personalització
    → Evitar el canvi de fons d'escriptori: Activada
    ```

    ### 3. Impedir l'accés al símbol del sistema

    ```
    Configuració d'usuari → Plantilles administratives → Sistema
    → Impedir l'accés al símbol del sistema: Activada
    ```

    ### 4. Impedir l'accés a l'editor del Registre

    ```
    Configuració d'usuari → Plantilles administratives → Sistema
    → Impedir l'accés a eines d'edició del Registre: Activada
    ```

    ### 5. Ocultar unitats específiques

    ```
    Configuració d'usuari → Plantilles administratives → Components de Windows → Explorador de fitxers
    → Oculta aquestes unitats especificades en Equip: Activada → Restringeix unitats A, B, C i D
    ```

    !!! warning "Ocultar una unitat **no impedeix l'accés**: un alumne que sap la ruta directa (`C:\Windows\System32`) hi pot accedir igualment. Per bloquejar l'accés real, usa `Impedir l'accés a les unitats des de L'equip de l'usuari`."

    ## Configuració via PowerShell (Set-GPRegistryValue)

    Les plantilles administratives modifiquen valors del Registre de Windows. Pots configurar-les via PowerShell:

    ```powershell
    # Desactivar el Panell de control
    Set-GPRegistryValue `
        -Name "Restriccions-Alumnes" `
        -Key "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" `
        -ValueName "NoControlPanel" `
        -Type DWord `
        -Value 1

    # Impedir el canvi de fons de pantalla
    Set-GPRegistryValue `
        -Name "Restriccions-Alumnes" `
        -Key "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\ActiveDesktop" `
        -ValueName "NoChangingWallPaper" `
        -Type DWord `
        -Value 1

    # Llegir un valor de GPO des del Registre
    Get-GPRegistryValue `
        -Name "Restriccions-Alumnes" `
        -Key "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" `
        -ValueName "NoControlPanel"
    ```

    ## Matriu de restriccions recomanada per al laboratori

    | Restricció | GPO | UO d'aplicació | Efecte |
    |-----------|-----|---------------|--------|
    | Oculta Panell de control | Restriccions-Alumnes | OU=Alumnes | Alumnes no poden canviar configuració |
    | Fons corporatiu fix | Restriccions-Alumnes | OU=Alumnes | Imatge uniforme a l'aula |
    | Bloqueig CMD | Restriccions-Alumnes | OU=Alumnes | Dificulta l'execució de scripts no autoritzats |
    | Bloqueig Registre | Restriccions-Alumnes | OU=Alumnes | Impedeix modificar el sistema |
    | Unitats de xarxa Z: i H: | Unitats-Alumnes | OU=Alumnes | Accés fàcil a recursos compartits |

    ## Verificació de les restriccions

    ```cmd
    :: Força l'aplicació de les GPOs al client
    gpupdate /force

    :: Verifica que la GPO s'aplica
    gpresult /r
    ```

    Després de `gpupdate /force` i reinici de sessió, prova manualment cada restricció:
    - Intenta obrir el Panell de control → ha d'aparèixer el missatge "Aquesta operació ha estat cancel·lada"
    - Intenta canviar el fons de pantalla → l'opció ha d'estar desactivada

    !!! tip "Algunes restriccions requereixen **tancar la sessió i tornar a iniciar-la** per aplicar-se, no n'hi ha prou amb `gpupdate /force`. El `gpupdate /force /logoff` tanca la sessió automàticament per forçar l'aplicació de les polítiques d'usuari."

    ??? question "Auto-avaluació"

        **1.** Configures la restricció "Oculta les unitats especificades" per ocultar la unitat C:. Un alumne escriu `C:\Windows` a la barra d'adreces de l'Explorador. Pot accedir-hi?

        ??? success "Resposta"
            **Sí, pot accedir-hi**. La política "Oculta les unitats especificades" només **oculta** la unitat de la vista de "Aquest equip", però **no bloqueja l'accés** si s'introdueix la ruta directament. Per bloquejar realment l'accés, cal usar la política "**Impedir l'accés a les unitats des de L'equip de l'usuari**", que sí que denega l'accés a la ruta, no només l'oculta.

        **2.** Un professor necessita accedir al Panell de control des d'un PC de l'aula. La GPO de restriccions l'oculta perquè afecta la UO `Alumnes`, i el professor ha iniciat sessió des d'un PC de l'aula. Tindrà la restricció?

        ??? success "Resposta"
            **Depèn**. La **Configuració d'usuari** de la GPO s'aplica al compte d'usuari (qui inicia sessió), no al PC. Si la GPO és a `OU=Alumnes` (on estan els comptes d'alumne) i el professor té el compte a `OU=Professors`, el professor **no rebrà la restricció** tot i iniciar sessió des d'un PC de l'aula — perquè el seu compte no pertany a `OU=Alumnes`.

        **3.** Quin és l'avantatge d'usar `Set-GPRegistryValue` en lloc de configurar les restriccions via GUI de GPMC?

        ??? success "Resposta"
            `Set-GPRegistryValue` permet **automatitzar i scripting**: pots configurar desenes de restriccions en un únic script, reproducible i documentat. És especialment útil per a desplegar el mateix conjunt de restriccions a múltiples dominis de laboratori o per a recrear la configuració ràpidament si la GPO s'ha d'eliminar i recrear. La GUI és més intuïtiva per a una o dues configuracions; PowerShell és superior per a configuracions massives o repetitives.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 8.4 · Configura les restriccions de la GPO d'alumnes

    **Objectiu**: aplicar el conjunt de restriccions del Projecte 4 als alumnes del domini.

    **Temps estimat**: 35 minuts

    **Prerequisit**: GPO `Restriccions-Alumnes` creada i vinculada (Activitat 8.3)

    ---

    ### Part A – Configura les restriccions via GPMC

    Edita la GPO `Restriccions-Alumnes` i activa:

    1. **Oculta el Panell de control i la Configuració**
       (`Configuració d'usuari → Plantilles administratives → Panell de control`)

    2. **Fons de pantalla institucional** (usa qualsevol imatge del servidor)
       (`Configuració d'usuari → Plantilles administratives → Escriptori → Escriptori → Tapís d'escriptori`)

    3. **Evita el canvi de fons**
       (`Configuració d'usuari → Plantilles administratives → Panell de control → Personalització`)

    ### Part B – Aplica i verifica

    Al client `PC-AULA01`:

    ```cmd
    gpupdate /force
    ```

    Tanca la sessió i torna a iniciar-la com a `maria.puig`. Comprova:

    | Restricció | Resultat observat | Funciona? |
    |-----------|------------------|-----------|
    | Panell de control inaccessible | | |
    | Fons de pantalla fix | | |
    | No es pot canviar el fons | | |

    ### Part C – Verifica que NO afecta l'administrador

    Inicia sessió com a `CIRVIANUM\Administrador` al mateix PC:
    - Pot accedir al Panell de control? (ha de poder)
    - Pot canviar el fons de pantalla? (ha de poder)

    Si l'Administrador també rep les restriccions, quin és el problema i com el soluciones?

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Group Policy restrict Control Panel Windows Server 2022"`
        - `"GPO wallpaper desktop background administrative templates"`
        - `"Set-GPRegistryValue PowerShell configure group policy"`
        - `"GPO restricciones alumnos escritorio Windows Server"`
