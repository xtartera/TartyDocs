---
title: GPO – Conceptes i estructura
tags:
  - GPO
  - Active Directory
  - administració
  - UT1
---

# :material-shield-account: GPO – Conceptes i estructura

!!! abstract "Concepte clau"
    Una **GPO** (Group Policy Object) és un conjunt de configuracions que Windows aplica automàticament als usuaris i equips d'un domini. Permet gestionar centenars de PCs des del servidor: fons de pantalla, restriccions de seguretat, unitats de xarxa, scripts d'inici… sense tocar físicament cap client.

=== ":material-notebook-outline: Apunts"

    ## Què és una GPO?

    Una GPO és un **objecte d'Active Directory** que conté dues branques de configuració:

    | Branca | S'aplica a | Quan s'aplica |
    |--------|-----------|---------------|
    | **Configuració de l'ordinador** | El compte d'equip | En l'arrencada del PC |
    | **Configuració de l'usuari** | El compte d'usuari | En l'inici de sessió |

    Dins de cada branca hi ha tres àrees principals:

    ```mermaid
    graph TD
        GPO["🗂️ GPO (Group Policy Object)"]
        GPO --> CO["💻 Configuració de l'ordinador"]
        GPO --> CU["👤 Configuració de l'usuari"]

        CO --> SW["📜 Configuració de Windows\n(scripts d'inici, directrius de seguretat)"]
        CO --> AT["⚙️ Plantilles administratives\n(configuració del sistema)"]

        CU --> SU["📜 Configuració de Windows\n(scripts d'inici/tancament sessió, redireccions)"]
        CU --> AU["⚙️ Plantilles administratives\n(escriptori, panell de control...)"]
        CU --> PR["🔧 Preferències\n(unitats de xarxa, impressores, dreceres)"]
    ```

    ## On es vincula una GPO?

    Les GPOs s'**eleven** des d'un contenidor d'AD: Lloc, Domini o UO. Els objectes del contenidor reben la política en el pròxim cicle d'aplicació.

    ```mermaid
    graph TD
        Site["🌐 Lloc (Site)\nS'aplica a tots els equips del lloc físic"]
        Dom["🏢 Domini\nS'aplica a tots els usuaris i equips del domini"]
        OU1["📁 OU=Alumnes\nS'aplica als usuaris d'Alumnes"]
        OU2["📁 OU=SMX-1\nS'aplica als usuaris de SMX-1"]

        Site --> Dom --> OU1 --> OU2
    ```

    **Una GPO vinculada a una UO superior s'hereda per les UOs filles**, tret que s'activi `Block Inheritance`.

    ## Ordre d'aplicació (LSDOU)

    Quan hi ha múltiples GPOs, s'apliquen en aquest ordre:

    | Ordre | Nivell | Exemple |
    |-------|--------|---------|
    | 1r | **L**ocal | Política local del PC (gpedit.msc) |
    | 2n | **S**ite | Política del lloc AD |
    | 3r | **D**omini | Default Domain Policy |
    | 4t | **OU** | GPO de la UO (de pare a fill) |

    L'**última política aplicada guanya** (la més específica té prioritat). Per tant, una GPO d'una UO filla sobreescriu la del domini si configuren el mateix paràmetre.

    !!! tip "Mnemotècnic: **LSDOU** → Local, Site, Domain, Organizational Unit. La OU sempre guanya (tret que una política superior tingui `Enforced`)."

    ## Eines de gestió

    | Eina | Funció |
    |------|--------|
    | **GPMC** (`gpmc.msc`) | Consola de gestió de GPOs: crear, vincular, editar, simular |
    | **gpedit.msc** | Editor de política local (sense AD) |
    | **gpupdate** | Força l'aplicació immediata de les GPO al client |
    | **gpresult** | Mostra quines GPO s'han aplicat i el resultat (C33) |
    | **Get-GPO** (PowerShell) | Gestió de GPOs via PowerShell |

    ## Modificadors especials

    | Modificador | Efecte |
    |-------------|--------|
    | **Enforced** (anteriorment "No Override") | La GPO no pot ser sobreescrita per GPOs de contenidors fills |
    | **Block Inheritance** | La UO no hereta les GPOs del contenidor pare |
    | **Filtre de seguretat** | Aplica la GPO només als membres d'un grup concret |
    | **Item-Level Targeting** | Aplica configuracions específiques a subconjunts (preferències) |

    !!! warning "`Enforced` guanya sempre sobre `Block Inheritance`. Una GPO marcada com a `Enforced` s'aplica fins i tot a les UOs que han bloquejat l'herència."

    ??? question "Auto-avaluació"

        **1.** Una GPO vinculada al domini configura el fons de pantalla com a blau. Una altra GPO vinculada a `OU=Alumnes` configura el fons com a verd. Quin fons veuen els alumnes?

        ??? success "Resposta"
            Els alumnes veuen el fons **verd**. Segons l'ordre LSDOU, les GPOs de les UOs s'apliquen **després** (guanyen) que les del domini. La GPO de `OU=Alumnes` sobreescriu la del domini per als usuaris d'aquella OU. Si la GPO de domini estigués marcada com a `Enforced`, llavors guanyaria el blau.

        **2.** Quina diferència hi ha entre "Configuració de l'ordinador" i "Configuració de l'usuari" dins d'una GPO?

        ??? success "Resposta"
            **Configuració de l'ordinador** s'aplica al **compte d'equip** quan el PC arrenca, independentment de quin usuari iniciï sessió. **Configuració de l'usuari** s'aplica al **compte d'usuari** quan aquest inicia sessió, independentment del PC que usi. Per exemple: una política de contrasenya va a Configuració de l'ordinador; una política de fons de pantalla personalitzat per als alumnes va a Configuració de l'usuari.

        **3.** Una UO té `Block Inheritance` activat, però la GPO de domini té `Enforced`. Quina GPO s'aplica als usuaris de la UO?

        ??? success "Resposta"
            **La GPO de domini s'aplica**. `Enforced` té **prioritat absoluta** sobre `Block Inheritance`: una GPO marcada com a `Enforced` s'aplica sempre als objectes dels contenidors fills, fins i tot si han bloquejat l'herència. `Block Inheritance` només bloqueja les GPOs normals, no les marcades com a `Enforced`.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 8.1 · Explora GPMC i la Default Domain Policy

    **Objectiu**: familiaritzar-se amb la consola GPMC i identificar l'estructura de GPOs del domini.

    **Temps estimat**: 20 minuts

    **Prerequisit**: DC operatiu, sessió com a Administrador

    ---

    ### Part A – Obre GPMC

    1. **Server Manager → Tools → Group Policy Management**
    2. Expandeix el bosc → domini `cirvianum.local`
    3. Identifica:
       - Quantes GPOs hi ha per defecte?
       - On estan vinculades?
       - Quin és l'estat de `Default Domain Policy`?

    ### Part B – Explora l'estructura

    1. Expandeix `cirvianum.local → Group Policy Objects`
    2. Quantes GPOs existeixen al domini? (inclou les creades en activitats anteriors)
    3. Clic dret a una GPO → **Edita** → identifica les dues branques principals
    4. Navega a `Configuració de l'ordinador → Plantilles administratives → Sistema`
    5. Compta quantes polítiques hi ha disponibles (informació curiosa sobre la magnitud)

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Group Policy Object GPO explained Windows Server 2022"`
        - `"GPMC Group Policy Management Console tutorial"`
        - `"LSDOU group policy processing order explained"`
        - `"GPO enforced block inheritance Windows Server"`
