---
title: Instal·lació del rol AD DS
tags:
  - active directory
  - AD DS
  - instal·lació
  - UT1
---

# :material-server-plus: Instal·lació del rol AD DS

!!! abstract "Concepte clau"
    Instal·lar el rol **AD DS** afegeix els binaris d'Active Directory al servidor, però **no crea cap domini**. El domini es crea al pas següent: la promoció a controlador de domini. Confondre aquests dos passos és l'error més freqüent del Projecte 2.

=== ":material-notebook-outline: Apunts"

    ## Instal·lació vs. Promoció: la diferència clau

    ```mermaid
    graph LR
        A["1️⃣ Instal·la el rol AD DS\nAfegeix fitxers i eines\n⏱️ ~2 min"]
        B["2️⃣ Promou el servidor a DC\nCrea el domini i la base de dades\n⏱️ ~10 min + reinici"]
        C["✅ Servidor és ara un DC\namb domini operatiu"]

        A -->|"Pas obligatori previ"| B --> C
    ```

    Molts alumnes instal·len AD DS i esperen que el domini estigui llest. Però sense la promoció (Pas 2), el servidor és un servidor Windows normal que té les eines d'AD instal·lades però sense cap domini configurat.

    ## Prerequisits obligatoris

    Abans d'instal·lar AD DS, verifica que el servidor compleix:

    | Prerequisit | Comprovació |
    |-------------|-------------|
    | **IP estàtica** | `Get-NetIPConfiguration` → l'IP no ve de DHCP |
    | **Nom del servidor** | `$env:COMPUTERNAME` → nom descriptiu (no `WIN-K3J2H7P`) |
    | **DNS temporal** | El servidor pot resoldre noms externs (ping a google.com funciona) |
    | **Espai en disc** | Mínim 2 GB lliures a `C:\` per a NTDS, logs i SYSVOL |

    !!! danger "Si el servidor té IP dinàmica quan instal·les AD DS i el promous a DC, Active Directory registrarà una IP que pot canviar en el pròxim reinici. Tots els clients deixaran de poder autenticar-se. **Configura la IP estàtica primer, sempre.**"

    ## Instal·lació via Server Manager

    1. **Server Manager → Gestiona → Afegir rols i característiques**
    2. Tipus: **Instal·lació basada en rol o característica**
    3. Servidor: el teu servidor local
    4. Rols: marca **Active Directory Domain Services**
    5. Finestra emergent: **Afegeix característiques** (accepta les dependències: RSAT tools, AD PowerShell, etc.)
    6. Característiques: deixa les opcions per defecte
    7. Fes clic a **Instal·la** (no cal reiniciar)

    Al finalitzar, Server Manager mostra una notificació: *"Configuració posterior a la implementació requerida"* amb un triangle groc. **Fes clic aquí per promoure el servidor.**

    ## Instal·lació via PowerShell

    ```powershell
    # Instal·la AD DS amb totes les eines de gestió
    Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools

    # Verifica que el rol s'ha instal·lat correctament
    Get-WindowsFeature AD-Domain-Services | Select-Object Name, InstallState, DisplayName
    ```

    Sortida esperada:
    ```text
    Name                  InstallState  DisplayName
    ----                  ------------  -----------
    AD-Domain-Services    Installed     Active Directory Domain Services
    ```

    ## Mòduls PowerShell instal·lats amb AD DS

    Quan instal·les el rol AD DS amb `-IncludeManagementTools`, s'afegeixen els cmdlets del mòdul **ActiveDirectory**:

    ```powershell
    # Verifica que el mòdul AD és disponible
    Get-Module -ListAvailable ActiveDirectory

    # Importa el mòdul (necessari si no es carrega automàticament)
    Import-Module ActiveDirectory

    # Exemples de cmdlets disponibles un cop hi hagi un domini
    Get-Command -Module ActiveDirectory | Measure-Object   # ~150 cmdlets
    ```

    !!! tip "El mòdul ActiveDirectory no funciona completament fins que el servidor s'ha promogut a DC i el domini existeix. Instal·lar-lo ara és preparar-se per al pas següent."

    ## Eines gràfiques instal·lades

    Un cop instal·lat el rol, al menú **Tools** de Server Manager apareixen noves eines:

    | Eina | Abreviació | Funció |
    |------|-----------|--------|
    | Active Directory Users and Computers | ADUC | Gestionar usuaris, grups, UOs, equips |
    | Active Directory Domains and Trusts | ADDT | Gestionar relacions de confiança entre dominis |
    | Active Directory Sites and Services | ADSS | Gestionar la replicació entre llocs |
    | Active Directory Administrative Center | ADAC | Consola moderna (alternativa a ADUC) |
    | Group Policy Management | GPMC | Crear i gestionar GPO |

    ??? question "Auto-avaluació"

        **1.** Quin és l'estat del servidor immediatament després d'instal·lar el rol AD DS però **abans** de la promoció?

        ??? success "Resposta"
            El servidor té els **binaris i eines d'AD DS instal·lats** (ADUC, GPMC, mòdul PowerShell AD...) però **no hi ha cap domini creat**. Segueix sent un servidor membre d'un grup de treball (Workgroup), no un DC. El domini es crea únicament durant la promoció.

        **2.** Per quin motiu `Install-WindowsFeature` usa el paràmetre `-IncludeManagementTools`?

        ??? success "Resposta"
            Per instal·lar automàticament totes les consoles de gestió (ADUC, GPMC, DNS Manager...) i el mòdul PowerShell `ActiveDirectory` junt amb el rol. Sense aquest paràmetre, s'instal·len els binaris del servei però no les eines d'administració.

        **3.** La notificació "Configuració posterior a la implementació requerida" que apareix a Server Manager significa que el rol AD DS no s'ha instal·lat correctament. Verdader o fals?

        ??? success "Resposta"
            **Fals**. La notificació és un avis normal que indica que el rol s'ha instal·lat correctament però **falta el pas de promoció** per crear el domini. No és un error: és el servidor demanant que es completi el procés fent clic al botó de promoció.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.3 · Instal·la el rol AD DS

    **Objectiu**: instal·lar el rol AD DS i verificar que tots els prerequisits estan complerts.

    **Temps estimat**: 20 minuts

    **Prerequisit**: Servidor amb IP estàtica, nom configurat i actualitzat (Activitat 2.5)

    ---

    ### Checklist de prerequisits

    Comprova i documenta cada punt **abans** d'instal·lar el rol:

    ```powershell
    # 1. Verifica l'IP estàtica
    Get-NetIPConfiguration | Select-Object InterfaceAlias, IPv4Address, IPv4DefaultGateway

    # 2. Verifica el nom del servidor
    $env:COMPUTERNAME

    # 3. Verifica la connectivitat DNS externa
    Resolve-DnsName google.com

    # 4. Verifica l'espai lliure a C:\
    Get-PSDrive C | Select-Object Used, Free
    ```

    | Prerequisit | Valor comprovat | OK? |
    |-------------|----------------|-----|
    | IP estàtica configurada | | |
    | Nom del servidor (no WIN-XXXXXX) | | |
    | DNS extern funcional | | |
    | Espai lliure C:\ > 2 GB | | |

    ### Instal·lació

    1. Instal·la el rol via PowerShell o Server Manager
    2. Verifica la instal·lació amb `Get-WindowsFeature AD-Domain-Services`
    3. Confirma que la notificació "Configuració posterior" apareix a Server Manager
    4. **NO facis la promoció ara** — és el tema de la pàgina 23

    ### Instantània

    Fes una instantània de VirtualBox: **"SRV-WS2022 - AD DS instal·lat - pendent promoció"**

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Install Active Directory Domain Services Windows Server 2022"`
        - `"AD DS role installation PowerShell Install-WindowsFeature"`
        - `"Windows Server 2022 Active Directory prerequisites"`
