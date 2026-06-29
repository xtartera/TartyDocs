---
title: GPO – restriccions pràctiques
tags:
  - ut4
  - active-directory
  - gpo
  - seguretat
---

# :material-shield-check: GPO – restriccions pràctiques

!!! abstract "Concepte clau"
    Les GPOs permeten aplicar **restriccions de seguretat** als clients del domini: desactivar el panell de control, establir un fons de pantalla corporatiu, bloquejar dispositius USB o limitar l'accés a aplicacions. Es configuren al **Group Policy Management Editor** i apliquen automàticament als usuaris de la OU.

=== ":material-notebook-outline: Apunts"

    ## Restricció 1: Desactivar el panell de control

    **Ruta**: `User Configuration → Policies → Administrative Templates → Control Panel`

    | Política | Estat | Efecte |
    |---------|-------|--------|
    | **Prohibit access to Control Panel and PC settings** | Enabled | L'usuari no pot obrir el panell de control ni Configuració de Windows |

    Des de PowerShell:

    ```powershell
    Set-GPRegistryValue -Name "GPO-OU201-Restriccions" `
        -Key "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" `
        -ValueName "NoControlPanel" `
        -Type DWord -Value 1
    ```

    ## Restricció 2: Fons de pantalla corporatiu

    **Ruta**: `User Configuration → Policies → Administrative Templates → Desktop → Desktop`

    | Política | Valor | Efecte |
    |---------|-------|--------|
    | **Desktop Wallpaper** | Enabled → ruta del fitxer | Força el fons de pantalla i impedeix canviar-lo |

    Exemple de ruta: `\\WSRV201\wallpaper$\corporatiu.jpg` (recurs compartit al DC).

    ```powershell
    Set-GPRegistryValue -Name "GPO-OU201-Restriccions" `
        -Key "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\System" `
        -ValueName "Wallpaper" `
        -Type String -Value "\\WSRV201\wallpaper$\corporatiu.jpg"

    Set-GPRegistryValue -Name "GPO-OU201-Restriccions" `
        -Key "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\System" `
        -ValueName "WallpaperStyle" `
        -Type String -Value "2"
    ```

    ## Restricció 3: Bloquejar dispositius USB (emmagatzematge)

    **Ruta**: `Computer Configuration → Policies → Administrative Templates → System → Removable Storage Access`

    | Política | Estat | Efecte |
    |---------|-------|--------|
    | **All Removable Storage classes: Deny all access** | Enabled | Bloqueja lectura i escriptura de dispositius USB |

    O de forma més específica:

    | Política | Estat |
    |---------|-------|
    | **Removable Disks: Deny write access** | Enabled |
    | **Removable Disks: Deny read access** | Enabled |

    ```powershell
    Set-GPRegistryValue -Name "GPO-OU201-Restriccions" `
        -Key "HKLM\Software\Policies\Microsoft\Windows\RemovableStorageDevices\{53f5630d-b6bf-11d0-94f2-00a0c91efb8b}" `
        -ValueName "Deny_All" `
        -Type DWord -Value 1
    ```

    ## Verificació de les restriccions al client

    ```powershell
    # Al client (com a usuari del domini afectat per la GPO)
    gpupdate /force

    # Comprova les polítiques aplicades
    gpresult /r

    # O informe complet en HTML
    gpresult /h C:\gpo-report.html
    start C:\gpo-report.html
    ```

    ## Resum de rutes de polítiques

    | Restricció | Secció | Ruta en GPME |
    |-----------|--------|-------------|
    | Desactivar panell control | User Config | `Policies → Admin Templates → Control Panel` |
    | Fons de pantalla | User Config | `Policies → Admin Templates → Desktop → Desktop` |
    | Bloquejar USB | Computer Config | `Policies → Admin Templates → System → Removable Storage` |
    | Mapes de xarxa | User Config | `Preferences → Windows Settings → Drive Maps` |
    | Scripts d'inici sessió | User Config | `Policies → Windows Settings → Scripts` |

    !!! warning "Computer vs User: qui reinicia?"
        Les polítiques de `Computer Configuration` s'apliquen quan l'**equip arrenca** (no quan l'usuari inicia sessió). Si configures una restricció USB a `Computer Configuration` i fas `gpupdate /force`, la política no s'aplicarà fins al proper **reinici de l'equip**. Les de `User Configuration` s'apliquen en el proper inici de sessió.

    !!! tip "Filtratge de seguretat (Security Filtering)"
        Per defecte, una GPO aplica a tots els usuaris i equips de la OU. Pots restringir-la a un grup concret: a la GPMC, selecciona la GPO → **Scope** → **Security Filtering** → afegeix o elimina grups. D'aquesta manera la mateixa OU pot tenir polítiques diferents per a professors i alumnes.

    ??? question "Auto-avaluació"
        **1.** En quina ruta del Group Policy Management Editor es configura la restricció per desactivar el panell de control?

        ??? success "Resposta"
            `User Configuration → Policies → Administrative Templates → Control Panel → Prohibit access to Control Panel and PC settings` → **Enabled**. Aquesta política afecta únicament la **sessió de l'usuari** (es troba a User Configuration) i aplica quan l'usuari inicia sessió al domini.

        **2.** Per quin motiu és millor bloquejar dispositius USB des de `Computer Configuration` en lloc de `User Configuration`?

        ??? success "Resposta"
            Si es configura a `Computer Configuration`, la restricció aplica a **qualsevol usuari** que iniciï sessió en aquell equip, fins i tot l'administrador local (si no s'excloent). Des de `User Configuration`, un altre usuari sense la GPO (per exemple, un administrador que no pertany a la OU) podria usar el USB. Per seguretat física de l'equip, `Computer Configuration` és més robust.

        **3.** Com es comprova que una restricció GPO s'ha aplicat correctament al client?

        ??? success "Resposta"
            `gpresult /r` (al client com a usuari afectat) mostra la llista de GPOs aplicades i la secció "Applied Group Policy Objects". Per una verificació visual: intenta obrir el panell de control — si apareix un missatge "This operation has been cancelled due to restrictions in effect on this computer", la política funciona. `gpresult /h C:\report.html` genera un informe complet amb els detalls de cada política aplicada.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.09 · Restriccions de seguretat amb GPO

    **Objectiu**: configurar restriccions pràctiques amb GPO i verificar-ne l'efecte als clients.
    **Temps estimat**: 35 minuts
    **Prerequisit**: GPO creada i vinculada (Activitat 4.08)

    ---

    ### Pas 1 – Obre el Group Policy Management Editor

    Al DC: **Group Policy Management → GPO-OU201-Restriccions → Edit**

    ### Pas 2 – Desactiva el panell de control

    Navega a: `User Configuration → Policies → Administrative Templates → Control Panel`

    Activa: **Prohibit access to Control Panel and PC settings → Enabled**

    ### Pas 3 – Estableix el fons de pantalla

    Navega a: `User Configuration → Policies → Administrative Templates → Desktop → Desktop → Desktop Wallpaper`

    Activa i especifica la ruta d'un fitxer d'imatge accessible al client.

    ### Pas 4 – Bloqueja els USB

    Navega a: `Computer Configuration → Policies → Administrative Templates → System → Removable Storage Access`

    Activa: **All Removable Storage classes: Deny all access → Enabled**

    ### Pas 5 – Aplica i verifica al client

    ```powershell
    gpupdate /force
    gpresult /r
    ```

    Prova d'obrir el panell de control (ha d'aparèixer un missatge de restricció). Connecta un USB (ha de demanar permisos o no reconèixer-lo).

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"GPO disable control panel Windows 10 11"`
        - `"GPO block USB drives removable storage"`
        - `"Group Policy wallpaper corporate Windows domain"`
