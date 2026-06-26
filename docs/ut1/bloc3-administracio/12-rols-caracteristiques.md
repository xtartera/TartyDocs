---
title: Rols i característiques del servidor
tags:
  - administració
  - rols
  - UT1
---

# :material-puzzle: Rols i característiques del servidor

!!! abstract "Concepte clau"
    Els **rols** afegeixen serveis de xarxa al servidor (AD DS, DNS, IIS...). Les **característiques** afegeixen funcionalitats al sistema operatiu (.NET, PowerShell, RSAT...). Tots dos s'instal·len i es desinstal·len sense reinstal·lar el SO.

=== ":material-notebook-outline: Apunts"

    ## Rols vs característiques

    Windows Server separa els seus components en dues categories:

    | | **Rols** | **Característiques** |
    |-|:--------:|:--------------------:|
    | **Funció** | Serveis de xarxa per als clients | Funcionalitats del propi servidor |
    | **Exemples** | AD DS, DNS, DHCP, IIS, Hyper-V | .NET Framework, RSAT, PowerShell ISE |
    | **Visible per als clients?** | Sí | Normalment no |
    | **Requisit previ?** | Sovint sí (ex: AD DS necessita DNS) | Rarament |

    ## Rols principals i quan s'usen al curs

    ```mermaid
    mindmap
      root((Rols\nWindows Server))
        Identitat
          AD DS ←UT1 P2
          AD CS
          AD FS
        Xarxa
          DNS ←UT1 P2
          DHCP
          Remote Access
        Fitxers i impressió
          File and Storage Services ←UT1 P3
          Print Services ←UT3
        Web i aplicacions
          IIS ←UT1 P1 opcional
        Virtualització
          Hyper-V
    ```

    ### Rols del Projecte 1 (instal·lació bàsica)

    | Rol | Servei instal·lat | Per a què |
    |-----|-------------------|-----------|
    | **File and Storage Services** | Carpetes compartides SMB | Compartir fitxers a la xarxa |
    | **IIS** (Web Server) | Internet Information Services | Allotjar pàgines web internes |
    | **Remote Management** | WinRM, PSRemoting | Administrar el servidor remotament |

    ## Instal·lació via Server Manager

    1. Server Manager → **Gestiona** → **Afegir rols i característiques**
    2. Tipus d'instal·lació: **Instal·lació basada en rol o característica**
    3. Selecciona el servidor de destí
    4. Marca el rol desitjat → Accepta les dependències proposades
    5. Fes clic a **Instal·la** (no cal reiniciar per a la majoria de rols)

    !!! tip "Dependències automàtiques"
        Quan marques un rol, Server Manager detecta automàticament les eines de gestió i les característiques necessàries i les proposa per instal·lar. Sempre accepta les dependències recomanades.

    ## Instal·lació via PowerShell

    ```powershell
    # Veure tots els rols i característiques disponibles
    Get-WindowsFeature

    # Instal·lar el rol de servidor web (IIS) amb les eines de gestió
    Install-WindowsFeature -Name Web-Server -IncludeManagementTools

    # Instal·lar múltiples rols alhora
    Install-WindowsFeature -Name AD-Domain-Services, DNS, RSAT-ADDS

    # Desinstal·lar un rol
    Uninstall-WindowsFeature -Name Web-Server

    # Veure els rols instal·lats
    Get-WindowsFeature | Where-Object {$_.InstallState -eq "Installed"}
    ```

    ## Desinstal·lació de rols

    La desinstal·lació segueix el procés invers:

    1. Server Manager → **Gestiona** → **Treure rols i característiques**
    2. Desactiva el rol
    3. Reinicia si és necessari

    !!! warning "Desinstal·lar AD DS requereix primer **degradar el controlador de domini** (dcpromo). No es pot treure el rol AD DS directament si el servidor és DC."

    ??? question "Auto-avaluació"

        **1.** Quina és la diferència entre un **rol** i una **característica** a Windows Server?

        ??? success "Resposta"
            Un **rol** proporciona un servei de xarxa als clients (AD DS, DNS, IIS...). Una **característica** afegeix funcionalitat al propi servidor o a l'entorn d'administrador (.NET Framework, RSAT, Telnet Client...). Tots dos s'instal·len des del mateix assistent.

        **2.** Quin cmdlet de PowerShell instal·la un rol i inclou automàticament les eines de gestió?

        ??? success "Resposta"
            `Install-WindowsFeature -Name [NomRol] -IncludeManagementTools`. El paràmetre `-IncludeManagementTools` afegeix les consoles MMC i snap-ins necessaris per gestionar el rol (per exemple, el DNS Manager quan instal·les el rol DNS).

        **3.** Quan instal·les el rol **AD DS**, per quin motiu Server Manager proposa instal·lar també **DNS Server**?

        ??? success "Resposta"
            Active Directory Domain Services **depèn de DNS** per funcionar: usa DNS per localitzar controladors de domini (registres SRV), resoldre noms del domini i permetre que els clients trobin el DC. Sense DNS, AD DS no pot iniciar-se correctament.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.2 · Instal·la i explora rols

    **Objectiu**: instal·lar el rol File and Storage Services i verificar-ne el funcionament.

    **Temps estimat**: 25 minuts

    **Prerequisit**: Windows Server 2022 configurat (Activitat 2.5)

    ---

    ### Part A – Instal·la IIS i File Services

    1. Obre Server Manager → Afegir rols i característiques
    2. Instal·la el rol **Web Server (IIS)** acceptant les dependències
    3. Instal·la el rol **File and Storage Services** (normalment ja instal·lat per defecte)
    4. Verifica des del Dashboard que els rols apareixen als nodes laterals

    ### Part B – Comprova per PowerShell

    ```powershell
    # Llista els rols instal·lats
    Get-WindowsFeature | Where-Object {$_.InstallState -eq "Installed"} |
        Select-Object Name, DisplayName | Format-Table -AutoSize
    ```

    Fes una captura del resultat i identifica els rols que acabes d'instal·lar.

    ### Part C – Prova IIS

    1. Obre el navegador del servidor i accedeix a `http://localhost`
    2. Hauries de veure la pàgina de benvinguda d'IIS. Fes una captura.
    3. Des d'un client de la mateixa xarxa, accedeix a `http://[IP_SERVIDOR]`. Funciona? Per quin motiu sí o no?

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Windows Server 2022 add roles features tutorial"`
        - `"Install-WindowsFeature PowerShell Windows Server"`
        - `"IIS Windows Server 2022 install configure"`
