---
title: Unitats Organitzatives (OUs) i delegació
tags:
  - ut4
  - active-directory
  - ous
---

# :material-folder-account: Unitats Organitzatives (OUs) i delegació

!!! abstract "Concepte clau"
    Una **Unitat Organitzativa (OU)** és un contenidor d'Active Directory que agrupa comptes d'usuari, equips i altres OUs. Les OUs permeten aplicar **GPOs** de forma granular i **delegar** l'administració a persones concretes sense donar-los permisos de domini complets.

=== ":material-notebook-outline: Apunts"

    ## Estructura d'OUs típica d'empresa

    ```mermaid
    graph TD
        D["Domini: ad-cognom.local"]
        D --> OU1["OU=Empresa"]
        OU1 --> OU2["OU=Usuaris"]
        OU1 --> OU3["OU=Equips"]
        OU1 --> OU4["OU=Grups"]
        OU1 --> OU5["OU=Servidors"]
        OU2 --> U1["usuari: director201"]
        OU2 --> U2["usuari: tecnic201"]
        OU3 --> E1["equip: CLI-WIN-201"]
        OU4 --> G1["grup: GRP-Tecnics"]
    ```

    ## Crear OUs amb PowerShell

    ```powershell
    # Crea l'OU principal
    New-ADOrganizationalUnit -Name "OU201" `
        -Path "DC=ad-cognom,DC=local"

    # Crea sub-OUs
    New-ADOrganizationalUnit -Name "Usuaris" `
        -Path "OU=OU201,DC=ad-cognom,DC=local"

    New-ADOrganizationalUnit -Name "Equips" `
        -Path "OU=OU201,DC=ad-cognom,DC=local"

    New-ADOrganizationalUnit -Name "Grups" `
        -Path "OU=OU201,DC=ad-cognom,DC=local"

    # Verifica
    Get-ADOrganizationalUnit -Filter * | Select-Object Name, DistinguishedName
    ```

    ## Crear OUs des de la GUI (ADUC)

    1. Obre **Active Directory Users and Computers** (ADUC)
    2. Clic dret al domini → **New → Organizational Unit**
    3. Nom: `OU201` → OK
    4. Repeteix per a les sub-OUs

    ## Distinguished Name (DN) de les OUs

    Cada objecte AD té un **Distinguished Name** únic:

    ```
    OU=Usuaris,OU=OU201,DC=ad-cognom,DC=local
    ```

    - `OU=Usuaris` → nom de la OU
    - `OU=OU201` → OU pare
    - `DC=ad-cognom,DC=local` → domini

    ## Delegació d'administració

    Pots delegar el control d'una OU a un usuari sense fer-lo administrador del domini:

    ```
    ADUC → clic dret a la OU → Delegate Control...
    → Afegeix l'usuari delegat
    → Escull les tasques: "Create, delete, and manage user accounts"
    ```

    Exemple: l'usuari `tecnic201` pot gestionar comptes a `OU=Usuaris,OU=OU201` però no pot fer res fora d'aquesta OU.

    ## Moure objectes entre OUs

    ```powershell
    # Mou un usuari a una altra OU
    Move-ADObject -Identity "CN=tecnic201,OU=Usuaris,OU=OU201,DC=ad-cognom,DC=local" `
        -TargetPath "OU=Tecnics,OU=OU201,DC=ad-cognom,DC=local"
    ```

    !!! tip "Protecció contra eliminació accidental"
        Quan crees una OU important, activa la protecció: clic dret → Properties → Object → ✓ **Protect object from accidental deletion**. Sense aquesta opció, un `Remove-ADOrganizationalUnit` accidental pot eliminar tota l'estructura.

    !!! warning "OUs vs Grups"
        Les **OUs** s'usen per a organització administrativa (aplicar GPOs, delegar control). Els **Grups** s'usen per a control d'accés (permisos a carpetes, `valid users` a Samba). No confondre: posar un usuari a una OU no li dona accés a res; cal afegir-lo a un **grup** per controlar permisos.

    ??? question "Auto-avaluació"
        **1.** Quina és la diferència principal entre una OU i un Grup d'Active Directory?

        ??? success "Resposta"
            Una **OU** (Unitat Organitzativa) és un contenidor administratiu: serveix per **organitzar objectes** (usuaris, equips) i **aplicar GPOs** de forma granular. Un **Grup** és un col·lector de seguretat: serveix per **controlar l'accés** a recursos (carpetes compartides, impressores). Posar un usuari a una OU no li dona cap permís; posar-lo a un grup pot donar-li accés a recursos o aplicar polítiques.

        **2.** Quin és el format del Distinguished Name d'un usuari `ana` dins de `OU=Usuaris,OU=OU201` al domini `ad-cognom.local`?

        ??? success "Resposta"
            `CN=ana,OU=Usuaris,OU=OU201,DC=ad-cognom,DC=local`. El DN s'escriu de forma inversa (de l'objecte cap al domini): `CN` és el nom comú de l'objecte, seguit de la cadena de OUs des de la més específica a la més general, i finalment els components del domini (`DC`).

        **3.** Per quin motiu és recomanable activar la protecció contra eliminació accidental en les OUs importants?

        ??? success "Resposta"
            Sense protecció, una ordre com `Remove-ADOrganizationalUnit -Recursive` eliminaria la OU i **tots els objectes que conté** (usuaris, grups, equips, sub-OUs) en un sol pas. Amb la protecció activada, cal desmarcar explícitament l'opció antes de poder eliminar, cosa que evita errors accidentals que podrien ser devastadors en entorns de producció.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.06 · Estructura d'OUs per a l'empresa

    **Objectiu**: crear l'estructura d'OUs del projecte P41 al domini AD.
    **Temps estimat**: 25 minuts
    **Prerequisit**: DC Active Directory operatiu (Activitat 4.04)

    ---

    ### Pas 1 – Crea l'estructura bàsica

    ```powershell
    $base = "DC=ad-cognom,DC=local"
    $ouPrincipal = "OU=OU201,$base"

    New-ADOrganizationalUnit -Name "OU201" -Path $base -ProtectedFromAccidentalDeletion $true
    New-ADOrganizationalUnit -Name "Usuaris" -Path $ouPrincipal -ProtectedFromAccidentalDeletion $true
    New-ADOrganizationalUnit -Name "Equips" -Path $ouPrincipal -ProtectedFromAccidentalDeletion $true
    New-ADOrganizationalUnit -Name "Grups" -Path $ouPrincipal -ProtectedFromAccidentalDeletion $true
    New-ADOrganizationalUnit -Name "Servidors" -Path $ouPrincipal -ProtectedFromAccidentalDeletion $true
    ```

    ### Pas 2 – Verifica amb ADUC i PowerShell

    ```powershell
    Get-ADOrganizationalUnit -Filter * | Select-Object Name, DistinguishedName
    ```

    Obre **Active Directory Users and Computers** i comprova que l'estructura és visible.

    ### Pas 3 – Documenta

    Crea un esquema de l'estructura al teu dossier amb el Distinguished Name complet de cada OU.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Active Directory Organizational Units tutorial"`
        - `"New-ADOrganizationalUnit PowerShell create OU"`
        - `"Active Directory delegate control OU"`
