---
title: Unitats Organitzatives (UO)
tags:
  - active directory
  - UO
  - organització
  - UT1
---

# :material-folder-multiple: Unitats Organitzatives (UO)

!!! abstract "Concepte clau"
    Les **Unitats Organitzatives** (UO) són contenidors d'Active Directory que permeten organitzar usuaris, equips i grups seguint l'estructura real de l'organització. Sobre cada UO es poden aplicar **GPO** i **delegar** l'administració de manera independent.

=== ":material-notebook-outline: Apunts"

    ## Què és una UO?

    Una **Unitat Organitzativa** (Organizational Unit, OU) és un contenidor d'Active Directory que pot contenir:

    - Usuaris
    - Grups
    - Equips
    - Impressores
    - Altres UOs (jerarquia anidada)

    A diferència d'un grup, una UO **no s'usa per assignar permisos** a recursos: serveix per organitzar els objectes i aplicar-los **polítiques de grup (GPO)** i per **delegar** la gestió a altres administradors.

    ## UO vs. Grup: diferència clau

    | | **UO** | **Grup** |
    |-|:------:|:--------:|
    | **Funció** | Organitzar objectes i aplicar GPO | Assignar permisos a recursos |
    | **Pot contenir** | Usuaris, equips, grups, altres UOs | Usuaris, grups (no equips habitualment) |
    | **S'usa per a GPO** | **Sí** | No |
    | **S'usa per a permisos NTFS** | No | **Sí** |
    | **Exemple** | UO `Alumnes` → GPO de restriccions | Grup `Lectura-Projectes` → permís a carpeta |

    !!! tip "Regla pràctica: si vols aplicar una política → usa UO. Si vols donar accés a un recurs → usa Grup."

    ## Estructura de UOs per al laboratori (Projecte 4)

    El Projecte 4 proposa aquesta estructura d'UOs per a un institut:

    ```mermaid
    graph TD
        DOM["🏢 Domini: cirvianum.local"]

        DOM --> ADM["📁 Administracio"]
        DOM --> PROF["📁 Professors"]
        DOM --> ALU["📁 Alumnes"]
        DOM --> EQU["📁 Equips"]

        ALU --> SMX1["📁 SMX-1"]
        ALU --> SMX2["📁 SMX-2"]
        ALU --> DAM["📁 DAM"]

        EQU --> EAULA["📁 Equips-Aula"]
        EQU --> EADMIN["📁 Equips-Administracio"]

        ADM --> U1["👤 director"]
        PROF --> U2["👤 xavier.tartera"]
        SMX1 --> U3["👤 alumne01.smx"]
        SMX2 --> U4["👤 alumne01.smx2"]
    ```

    ## Convencions de nom per a UOs

    | Criteri | Recomanació | Exemple |
    |---------|-------------|---------|
    | **Idioma** | Consistència: tot en català o tot en anglès | `Alumnes` o `Students`, no barrejar |
    | **Majúscules** | Primera lletra majúscula | `Professors`, no `professors` |
    | **Espais** | Evita'ls (usa guió o CamelCase) | `SMX-1` o `SMX1`, no `SMX 1` |
    | **Abreviatures** | Usa les estàndard del sector | `TIC`, `RRHH`, `ADM` |
    | **Jerarquia** | Màxim 3-4 nivells d'anidament | Dom → Dpt → Grup → Usuaris |

    ## Operacions bàsiques amb UOs

    ### Via ADUC (GUI)

    1. **Server Manager → Tools → Active Directory Users and Computers**
    2. Clic dret sobre el domini o una UO existent → **Nova → Unitat organitzativa**
    3. Posa el nom → marca **"Protegir contenidor contra eliminació accidental"**
    4. Fes clic a **D'acord**

    !!! warning "La protecció contra eliminació accidental és activa per defecte des de Windows Server 2008. Per eliminar una UO protegida, primer has de desactivar la protecció: **Visualitza → Característiques avançades** → UO → Propietats → pestanya Objecte → desmarca la casella."

    ### Via PowerShell

    ```powershell
    # Crear UOs principals
    New-ADOrganizationalUnit -Name "Alumnes" -Path "DC=cirvianum,DC=local" -ProtectedFromAccidentalDeletion $true
    New-ADOrganizationalUnit -Name "Professors" -Path "DC=cirvianum,DC=local"
    New-ADOrganizationalUnit -Name "Administracio" -Path "DC=cirvianum,DC=local"

    # Crear UO filla dins d'Alumnes
    New-ADOrganizationalUnit -Name "SMX-1" -Path "OU=Alumnes,DC=cirvianum,DC=local"
    New-ADOrganizationalUnit -Name "SMX-2" -Path "OU=Alumnes,DC=cirvianum,DC=local"

    # Llistar totes les UOs del domini
    Get-ADOrganizationalUnit -Filter * | Select-Object Name, DistinguishedName

    # Moure un usuari a una UO
    Move-ADObject -Identity "CN=nom.cognom,CN=Users,DC=cirvianum,DC=local" `
                  -TargetPath "OU=SMX-1,OU=Alumnes,DC=cirvianum,DC=local"
    ```

    ## Distinguished Name (DN)

    Cada objecte d'AD té un **Distinguished Name (DN)** únic que descriu la seva posició a la jerarquia:

    ```
    CN=xavier.tartera,OU=Professors,DC=cirvianum,DC=local
    │                  │              │
    │                  │              └─ Componentes del domini
    │                  └─ Unitat Organitzativa
    └─ Common Name (nom de l'objecte)
    ```

    | Prefix | Significat |
    |--------|-----------|
    | **CN** | Common Name (usuaris, grups, equips) |
    | **OU** | Organizational Unit |
    | **DC** | Domain Component (parts del nom de domini) |

    ??? question "Auto-avaluació"

        **1.** Tens 30 alumnes de SMX i vols aplicar-los una política de restricció de panell de control. Quin tipus d'objecte AD uses: un **grup** o una **UO**? Per quin motiu?

        ??? success "Resposta"
            Una **UO**. Les GPO s'apliquen sobre UOs, no sobre grups. Crea una UO `SMX`, mou els 30 alumnes dins d'ella i vincula la GPO de restriccions a aquella UO. Tots els usuaris dins de la UO rebran automàticament la política.

        **2.** Quin és el Distinguished Name d'un usuari `maria.puig` que es troba a la UO `SMX-2` que és filla de la UO `Alumnes` al domini `cirvianum.local`?

        ??? success "Resposta"
            `CN=maria.puig,OU=SMX-2,OU=Alumnes,DC=cirvianum,DC=local`. El DN es llegeix de l'objecte cap al domini (de baix a dalt de la jerarquia).

        **3.** Per quin motiu s'activa per defecte la protecció contra eliminació accidental en crear una UO?

        ??? success "Resposta"
            Perquè eliminar una UO que conté usuaris, grups i equips esborrada accidentalment és catastròfic en producció: es perden tots els objectes continguts. La protecció afegeix una regla de control d'accés que impedeix l'eliminació de l'objecte fins que s'elimina explícitament, forçant una acció conscient de l'administrador.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.2 · Crea l'estructura d'UOs del laboratori

    **Objectiu**: crear l'estructura completa d'UOs per al domini de pràctiques seguint l'esquema del Projecte 4.

    **Temps estimat**: 25 minuts

    **Prerequisit**: Domini `cirvianum.local` creat i operatiu (Activitat 4.4)

    ---

    ### Part A – Crea les UOs via PowerShell

    Executa el bloc d'ordres de la secció d'Apunts per crear:

    - UOs principals: `Alumnes`, `Professors`, `Administracio`, `Equips`
    - UOs filles d'Alumnes: `SMX-1`, `SMX-2`
    - UOs filles d'Equips: `Equips-Aula`, `Equips-Administracio`

    ### Part B – Verifica via ADUC

    1. Obre **Active Directory Users and Computers**
    2. Activa **Visualitza → Característiques avançades**
    3. Confirma que totes les UOs estan creades i correctament anidades
    4. Fes una captura de la vista en arbre mostrant l'estructura completa

    ### Part C – Explora el DN

    Selecciona la UO `SMX-1` a ADUC → Propietats → pestanya Atribut Editor. Troba el camp `distinguishedName` i confirma que el valor és `OU=SMX-1,OU=Alumnes,DC=cirvianum,DC=local`.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Active Directory organizational units OU tutorial"`
        - `"New-ADOrganizationalUnit PowerShell crear UO"`
        - `"OU vs group Active Directory difference explained"`
        - `"ADUC Active Directory Users Computers Windows Server 2022"`
