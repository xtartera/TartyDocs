---
title: GPO – Group Policy Management
tags:
  - ut4
  - active-directory
  - gpo
---

# :material-shield-lock: GPO – Group Policy Management

!!! abstract "Concepte clau"
    Una **GPO** (Group Policy Object) és un conjunt de configuracions de sistema i seguretat que s'aplica automàticament als usuaris i equips d'una OU d'Active Directory. Es gestionen des de la consola **GPMC** (Group Policy Management Console).

=== ":material-notebook-outline: Apunts"

    ## Conceptes bàsics de GPO

    ```mermaid
    graph LR
        DC["Domain Controller\n(emmagatzema GPOs\na SYSVOL)"]
        DC -->|"Descàrrega via SMB\n\\ad-cognom.local\SYSVOL"| CLI["Client Windows"]
        CLI -->|"gpupdate /force"| APLICA["Aplica la política\nal usuari/equip"]
    ```

    Les GPOs s'emmagatzemen a `\\ad-cognom.local\SYSVOL\ad-cognom.local\Policies\{GUID}\`. Cada GPO té un **GUID** únic.

    ## Tipus de configuració en una GPO

    | Secció | Afecta | Exemples |
    |--------|--------|---------|
    | **Computer Configuration** | L'equip (aplica en arrencar) | Desactivar USB, fons de pantalla de l'equip |
    | **User Configuration** | L'usuari (aplica en iniciar sessió) | Desactivar panell de control, mapes de xarxa |

    ## Crear i vincular una GPO

    ```powershell
    # Crea una GPO nova
    New-GPO -Name "Politica-Restriccions-OU201" -Comment "Restriccions per a OU201"

    # Vincula la GPO a una OU
    New-GPLink -Name "Politica-Restriccions-OU201" `
        -Target "OU=OU201,DC=ad-cognom,DC=local" `
        -LinkEnabled Yes

    # Verifica
    Get-GPO -Name "Politica-Restriccions-OU201"
    Get-GPInheritance -Target "OU=OU201,DC=ad-cognom,DC=local"
    ```

    ## Editar una GPO (GUI)

    1. Obre **Group Policy Management** (GPMC)
    2. Navega: `Forest → Domains → ad-cognom.local → Group Policy Objects`
    3. Clic dret a la GPO → **Edit** → s'obre el **Group Policy Management Editor**
    4. Navega per: `User Configuration → Policies → Administrative Templates`

    ## Ordres de forçat i verificació

    ```powershell
    # Al client: força l'actualització de GPOs
    gpupdate /force

    # Verifica quines GPOs s'apliquen
    gpresult /r
    gpresult /h C:\gpo-report.html  # Informe HTML complet

    # Al DC: informe de GPOs
    Get-GPOReport -Name "Politica-Restriccions-OU201" -ReportType HTML -Path "C:\gpo.html"
    ```

    ## Prioritat i herència de GPOs

    Les GPOs s'apliquen per ordre de precedència (**LSDOU**): Local → Site → Domain → OU. En cas de conflicte, guanya la política de la OU més específica (la que està més a prop de l'objecte).

    ```
    Default Domain Policy (domini)
      └── Politica-Restriccions-OU201 (OU=OU201)  ← GUANYA en conflicte
              └── Usuaris i equips de OU201
    ```

    !!! warning "gpupdate vs reinici"
        Algunes polítiques de `Computer Configuration` únicament s'apliquen en **reiniciar l'equip** (no amb `gpupdate /force`). Les de `User Configuration` s'apliquen en **iniciar sessió**. `gpupdate /force` refresca les polítiques sense reiniciar, però no garanteix que les de `Computer Configuration` s'apliquin immediatament.

    !!! tip "Default Domain Policy: no modificar directament"
        La **Default Domain Policy** (que aplica a tot el domini) no s'hauria de modificar per a polítiques específiques d'una OU. Crea sempre una GPO nova i vincula-la a la OU concreta. Modificar la Default Domain Policy afecta tots els usuaris del domini, cosa que pot tenir efectes indesitjats.

    ??? question "Auto-avaluació"
        **1.** Quin és l'ordre de prioritat d'aplicació de GPOs (LSDOU)?

        ??? success "Resposta"
            **L**ocal (polítiques locals de l'equip) → **S**ite (lloc d'Active Directory) → **D**omain (domini complet) → **O**U (Unitat Organitzativa, de la més genèrica a la més específica). En cas de conflicte entre dues GPOs, guanya la de la capa més **propera** a l'objecte (OU > Domain > Site > Local). Això permet que les polítiques d'OU sobreescriguin les del domini.

        **2.** Quina diferència hi ha entre `Computer Configuration` i `User Configuration` en una GPO?

        ??? success "Resposta"
            **Computer Configuration** conté polítiques que s'apliquen a l'**equip** quan arrenca, independentment de qui iniciï sessió. **User Configuration** conté polítiques que s'apliquen a l'**usuari** quan inicia sessió, independentment de quin equip usi. Per exemple: una restricció d'USB seria millor a `Computer Configuration` (aplica sempre); una restricció del panell de control seria a `User Configuration` (aplica a l'usuari concret).

        **3.** Com es verifica quines GPOs s'estan aplicant a un equip client?

        ??? success "Resposta"
            `gpresult /r` (al client, com a administrador) mostra un resum de les GPOs aplicades a l'equip i a l'usuari actual. `gpresult /h C:\report.html` genera un informe HTML detallat. Per forçar l'aplicació de les últimes polítiques: `gpupdate /force`. Al DC: `Get-GPResultantSetOfPolicy` des de PowerShell.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.08 · Primera GPO

    **Objectiu**: crear una GPO i vincular-la a la OU del projecte.
    **Temps estimat**: 25 minuts
    **Prerequisit**: OUs i usuaris creats (Activitats 4.06, 4.07)

    ---

    ### Pas 1 – Crea la GPO

    ```powershell
    New-GPO -Name "GPO-OU201-Restriccions" -Comment "Polítiques de seguretat OU201"
    ```

    ### Pas 2 – Vincula la GPO a la OU

    ```powershell
    New-GPLink -Name "GPO-OU201-Restriccions" `
        -Target "OU=OU201,DC=ad-cognom,DC=local" `
        -LinkEnabled Yes
    ```

    ### Pas 3 – Comprova la herència

    ```powershell
    Get-GPInheritance -Target "OU=OU201,DC=ad-cognom,DC=local"
    ```

    ### Pas 4 – Explora la GPMC

    Obre **Group Policy Management** (GPMC) al DC:
    - Comprova que la GPO apareix sota `OU=OU201`
    - Fes doble clic per editar-la (de moment no cal canviar res)
    - Documenta: on s'emmagatzema físicament la GPO? (busca a SYSVOL)

    ### Pas 5 – Al client

    ```powershell
    gpupdate /force
    gpresult /r
    ```

    Verifica que la nova GPO apareix llistada a la secció "Applied Group Policy Objects".

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Group Policy Management Console GPMC tutorial"`
        - `"New-GPO New-GPLink PowerShell Group Policy"`
        - `"gpresult gpupdate troubleshoot GPO"`
