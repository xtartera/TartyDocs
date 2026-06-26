---
title: Promoció a controlador de domini
tags:
  - active directory
  - DC
  - domini
  - UT1
---

# :material-crown: Promoció a controlador de domini

!!! abstract "Concepte clau"
    La **promoció a DC** és el procés que transforma un servidor amb el rol AD DS instal·lat en un controlador de domini real. Crea el domini, la base de dades NTDS.dit, les zones DNS integrades i el repositori SYSVOL. Requereix reinici i és **difícilment reversible**.

=== ":material-notebook-outline: Apunts"

    ## Opcions de promoció

    L'assistent de promoció ofereix tres escenaris:

    ```mermaid
    graph TD
        Q{Quin escenari?}
        Q --> A["Afegir un DC a un\ndomi existent\n(redundància)"]
        Q --> B["Afegir un domini nou a\nun bosc existent\n(subdomini)"]
        Q --> C["✅ Afegir un nou bosc\n(el nostre cas: domini nou\ndes de zero)"]
    ```

    Al curs sempre triem **"Afegir un nou bosc"**, que crea el primer DC d'un domini nou.

    ## Paràmetres crítics de la promoció

    ### Nom del domini arrel (Root domain name)

    El nom que triis **no es pot canviar sense tornar a crear el domini des de zero**.

    | Entorn | Recomanació | Exemple |
    |--------|-------------|---------|
    | Laboratori | Nom fictici amb `.local` | `cirvianum.local` |
    | Producció | Nom DNS real de l'empresa | `cirvianum.cat` |

    !!! warning "Evita noms d'un sol label (`cirvianum` sense punt) i noms reservats (`local.`, `.lan`). El format `nom.local` és l'estàndard per a laboratoris."

    ### Nivell funcional del bosc i del domini

    El nivell funcional determina quines funcions d'AD estan disponibles:

    | Nivell | Requisit mínim DC | Funcions disponibles |
    |--------|-----------------|----------------------|
    | Windows Server 2016 | WS 2016 | Reciclatge de contrasenyes, LAPS |
    | **Windows Server 2022** | WS 2022 | Totes les actuals |

    Al curs: selecciona **Windows Server 2022** per a tots dos nivells.

    ### Contrasenya DSRM ⚠️ CRÍTICA

    La **Directory Services Restore Mode (DSRM)** és una contrasenya independent de la contrasenya d'Administrador del domini. S'usa únicament per arrencar el DC en mode de recuperació quan AD DS ha fallat.

    !!! danger "Si oblides la contrasenya DSRM i el DC falla, **no podràs recuperar la base de dades d'Active Directory**. Anota-la en un lloc segur junt amb la contrasenya de l'Administrador. Són contrasenyes **independents**."

    ## Procés pas a pas (GUI)

    **Via notificació de Server Manager**:

    1. Fes clic a la notificació groga → **"Promou aquest servidor a controlador de domini"**

    O bé via PowerShell directament (veure més avall).

    **Assistent pas a pas**:

    | Pas | Camp | Valor per al curs |
    |----|------|-------------------|
    | 1 | Operació de desplegament | **Afegir un nou bosc** |
    | 2 | Nom del domini arrel | `cirvianum.local` |
    | 3 | Nivell funcional del bosc | Windows Server 2022 |
    | 4 | Nivell funcional del domini | Windows Server 2022 |
    | 5 | Opcions del DC | DNS Server ✅ · Global Catalog ✅ |
    | 6 | Contrasenya DSRM | (tria una contrasenya i **apunta-la**) |
    | 7 | Delegació DNS | Ometre (no tenim DNS pare) |
    | 8 | Nom NetBIOS | S'omple automàticament (`CIRVIANUM`) |
    | 9 | Rutes de bases de dades | Deixa les rutes per defecte |
    | 10 | Revisió | Revisa el resum i fes clic a **Instal·la** |

    L'assistent valida els prerequisits automàticament. Si tot és correcte, inicia la promoció i **reinicia el servidor** automàticament.

    ## Promoció via PowerShell

    ```powershell
    # Importa el mòdul AD DS
    Import-Module ADDSDeployment

    # Promou el servidor a DC d'un domini nou
    Install-ADDSForest `
        -DomainName "cirvianum.local" `
        -DomainNetbiosName "CIRVIANUM" `
        -ForestMode "WinThreshold" `
        -DomainMode "WinThreshold" `
        -InstallDns:$true `
        -DatabasePath "C:\Windows\NTDS" `
        -LogPath "C:\Windows\NTDS" `
        -SysvolPath "C:\Windows\SYSVOL" `
        -Force:$true
    # Demanarà la contrasenya DSRM de forma segura (SecureString)
    ```

    ## Verificació post-promoció

    Quan el servidor reinicia, comprovem que la promoció ha funcionat:

    ```powershell
    # Comprova que AD DS funciona
    Get-Service ADWS, NTDS, DNS, Netlogon | Select-Object Name, Status

    # Comprova informació del domini
    Get-ADDomain | Select-Object DNSRoot, NetBIOSName, DomainMode

    # Comprova que el DC s'ha registrat correctament
    nltest /dsgetdc:cirvianum.local
    ```

    ## Fitxers creats durant la promoció

    | Fitxer / Carpeta | Ubicació | Contingut |
    |------------------|----------|-----------|
    | **NTDS.dit** | `C:\Windows\NTDS\` | Base de dades de tots els objectes AD |
    | **Logs NTDS** | `C:\Windows\NTDS\` | Registres de transaccions |
    | **SYSVOL** | `C:\Windows\SYSVOL\` | Scripts d'inici de sessió i plantilles GPO |

    ??? question "Auto-avaluació"

        **1.** Quina diferència hi ha entre la contrasenya de l'Administrador del domini i la contrasenya DSRM?

        ??? success "Resposta"
            La **contrasenya de l'Administrador del domini** s'usa per iniciar sessió normalment al domini quan AD DS funciona correctament. La **contrasenya DSRM** és independent i s'usa únicament quan el servidor arrenca en Mode de Restauració de Serveis de Directori (per recuperació d'AD o reparació de la base de dades). Poden ser (i haurien de ser) contrasenyes diferentes.

        **2.** Per quin motiu has de seleccionar "Afegir un nou bosc" (i no "Afegir un DC a un domini existent") quan crees el primer DC del laboratori?

        ??? success "Resposta"
            Perquè el teu domini `cirvianum.local` **no existeix prèviament**: l'has de crear des de zero. "Afegir un nou bosc" crea el primer domini d'una nova infraestructura AD. "Afegir un DC a un domini existent" s'usa per afegir redundància a un domini que ja té almenys un DC actiu.

        **3.** Quin fitxer conté la base de dades de tots els objectes d'Active Directory i on es troba per defecte?

        ??? success "Resposta"
            El fitxer **NTDS.dit** (`NT Directory Services Database`), ubicat per defecte a `C:\Windows\NTDS\`. Conté tots els usuaris, grups, equips, UOs, contrasenyes (hash) i atributs del domini. La seva corrupció o eliminació sense còpia de seguretat és catastròfica.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.4 · Promou el servidor a controlador de domini

    **Objectiu**: crear el domini `cirvianum.local` promovent el servidor a DC.

    **Temps estimat**: 20 minuts (+ ~10 min d'espera i reinici)

    **Prerequisit**: Rol AD DS instal·lat (Activitat 4.3)

    ---

    ### Checklist de la promoció

    - [ ] **Instantània prèvia** feta: "Pre-promoció DC"
    - [ ] Nom del domini triat: `cirvianum.local` (o el nom acordat)
    - [ ] Contrasenya DSRM anotada al dossier
    - [ ] Opcions DNS i Global Catalog marcades
    - [ ] Prerequisits de l'assistent validades sense errors crítics (advertències de delegació DNS són normals)
    - [ ] Promoció completada i servidor reiniciat
    - [ ] Primer inici de sessió com a `CIRVIANUM\Administrador`

    ### Verificació post-promoció

    Executa les ordres de verificació de la secció d'Apunts i documenta:

    1. Estat dels serveis `ADWS`, `NTDS`, `DNS`, `Netlogon` → tots han d'estar "Running"
    2. Resultat de `Get-ADDomain` → confirma el nom del domini i el mode funcional
    3. Captura de ADUC mostrant el domini creat amb els contenidors per defecte

    ### Instantània final

    Fes una instantània: **"DC01 - cirvianum.local - Promoció completada"**

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"promote Windows Server 2022 domain controller step by step"`
        - `"Install-ADDSForest PowerShell new forest domain"`
        - `"Active Directory DSRM password what is it"`
        - `"Windows Server 2022 new forest domain creation tutorial"`
