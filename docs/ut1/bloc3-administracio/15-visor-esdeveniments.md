---
title: Visor d'Esdeveniments (Event Viewer)
tags:
  - administració
  - diagnòstic
  - event viewer
  - UT1
---

# :material-text-search: Visor d'Esdeveniments (Event Viewer)

!!! abstract "Concepte clau"
    El **Visor d'Esdeveniments** és el registre central del sistema. Cada error, advertència o acció important queda enregistrada amb un **ID d'event** únic. Aprendre a interpretar-lo és la clau per diagnosticar problemes d'AD, perfils, autenticació i auditoria.

=== ":material-notebook-outline: Apunts"

    ## Què és el Visor d'Esdeveniments?

    El **Visor d'Esdeveniments** (`eventvwr.msc`) registra de manera automàtica tot el que passa al sistema: serveis que s'inicien o fallen, usuaris que inicien sessió, errors de programes, canvis de configuració i molt més. Cada entrada té:

    - **ID de l'event**: número únic que identifica el tipus d'event
    - **Nivell**: Informació, Advertència, Error, Crític
    - **Data i hora**: marca temporal exacta
    - **Font**: component o servei que ha generat l'event
    - **Descripció**: missatge detallat amb la causa i informació de context

    ## Estructura dels logs

    ```mermaid
    graph TD
        EV[📋 Visor d'Esdeveniments]
        EV --> W[Registres de Windows]
        EV --> A[Registres d'Aplicacions\ni Serveis]

        W --> APP[Application\nerrors de programes]
        W --> SEC[Security\nautenticació i auditoria]
        W --> SYS[System\nerrros del SO i serveis]
        W --> SET[Setup\ninstal·lació de Windows]

        A --> DNS2[DNS Server]
        A --> AD[Directory Services\nActive Directory]
        A --> DFS[DFS Replication]
    ```

    ## Nivells d'events

    | Nivell | Icona | Significat |
    |--------|-------|-----------|
    | **Informació** | ℹ️ | Operació normal completada |
    | **Advertència** | ⚠️ | Possible problema que no ha causat error |
    | **Error** | ❌ | Ha fallat alguna cosa però el sistema segueix funcionant |
    | **Crític** | 🔴 | Error greu; el sistema o component no pot recuperar-se |
    | **Auditoria correcta** | ✅ | Acció auditada completada amb èxit (log Security) |
    | **Auditoria incorrecta** | 🚫 | Intent d'acció auditada que ha fallat |

    ## IDs d'event rellevants per al curs

    Aquests IDs apareixeran als projectes. Memoritzar-los facilita el diagnòstic:

    ### Log Security – Autenticació i auditoria

    | ID | Event | Quan apareix |
    |----|-------|-------------|
    | **4624** | Inici de sessió correcte | Usuari inicia sessió al domini |
    | **4625** | Inici de sessió fallit | Contrasenya incorrecta o compte bloquejat |
    | **4648** | Inici de sessió amb credencials explícites | RunAs, PSRemoting |
    | **4663** | Intent d'accés a un objecte | Auditoria activada a una carpeta → accés a fitxer |
    | **4720** | Compte d'usuari creat | New-ADUser o ADUC → crear usuari |
    | **4740** | Compte d'usuari bloquejat | Massa intents fallits de contrasenya |

    ### Log System – Serveis i sistema

    | ID | Event | Quan apareix |
    |----|-------|-------------|
    | **7036** | Servei canviat d'estat | Inici o aturada d'un servei |
    | **7045** | Servei nou instal·lat | Instal·lació d'un rol o driver |

    ### Log Application – Perfils mòbils

    | ID | Event | Quan apareix |
    |----|-------|-------------|
    | **1521** | Error en carregar el perfil | Perfil mòbil no accessible |
    | **1509** | Perfil temporal usat | No s'ha pogut carregar el perfil correcte |
    | **1525** | Error en descarregar el perfil | El perfil no s'ha desat correctament en tancar sessió |

    !!! tip "Quan un alumne diu 'el perfil no es guarda', el primer pas és mirar els IDs 1521/1509/1525 al log Application del client i del servidor."

    ## Filtrar i cercar events

    ### Via GUI

    1. Clic dret sobre un log → **Filtra el registre actual**
    2. Introdueix l'ID de l'event al camp **Event ID**
    3. Defineix el rang de dates i el nivell

    ### Via PowerShell

    ```powershell
    # Últims 20 errors del log System
    Get-EventLog -LogName System -EntryType Error -Newest 20

    # Cercar un ID concret al log Security
    Get-WinEvent -FilterHashtable @{
        LogName   = 'Security'
        Id        = 4624
        StartTime = (Get-Date).AddHours(-2)
    } | Select-Object TimeCreated, Message -First 10

    # Cercar events de perfils mòbils (IDs 1521, 1509, 1525)
    Get-WinEvent -FilterHashtable @{
        LogName = 'Application'
        Id      = 1521, 1509, 1525
    } | Format-List TimeCreated, Id, Message
    ```

    ## Vistes personalitzades

    Pots crear una **vista personalitzada** que filtri múltiples logs i IDs alhora, accessible amb un sol clic al panell esquerre. Útil per crear una "Vista de diagnòstic de perfils" que agreguji els IDs 1521+1509+1525.

    ??? question "Auto-avaluació"

        **1.** Un usuari no pot iniciar sessió. A quin log i amb quin ID d'event buscaries la causa?

        ??? success "Resposta"
            Al log **Security**, event ID **4625** (inici de sessió fallit). El missatge inclou el nom d'usuari, el tipus de fallada (contrasenya incorrecta, compte desactivat, compte bloquejat...) i la IP del client que ha intentat iniciar sessió.

        **2.** Quin ID d'event indica que un usuari ha accedit a un fitxer auditat? En quin log?

        ??? success "Resposta"
            L'event ID **4663** al log **Security**. Apareix quan la GPO d'auditoria d'objectes està activada per a una carpeta concreta i un usuari fa una operació sobre un fitxer d'aquella carpeta (lectura, escriptura, eliminació...).

        **3.** Al finalitzar una pràctica de perfils mòbils, un alumne et diu que els canvis no es guarden en tancar sessió. Quins IDs d'event comproves i en quin log?

        ??? success "Resposta"
            Al log **Application**, cerca els IDs **1521** (error en carregar el perfil), **1509** (perfil temporal usat) i **1525** (error en descarregar el perfil). Aquests events apareixen tant al client com al servidor i indiquen problemes d'accés a la carpeta de perfils, permisos incorrectes o problemes de xarxa.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.5 · Investiga el Visor d'Esdeveniments

    **Objectiu**: navegar pels logs del sistema i interpretar events reals del servidor.

    **Temps estimat**: 25 minuts

    **Prerequisit**: Windows Server 2022 en funcionament

    ---

    ### Part A – Exploració dels logs

    1. Obre `eventvwr.msc`
    2. Ves a **Registres de Windows → Sistema**
    3. Busca el primer error o advertència de la llista. Documenta:
        - ID de l'event
        - Font
        - Descripció (resum de les primeres línies)
        - Quin podria ser el motiu?

    ### Part B – Cerca un event específic

    1. Al log **Security**, filtra per ID **4624** (inici de sessió correcte)
    2. Identifica quantes vegades has iniciat sessió avui
    3. Quin és el tipus d'inici de sessió (Logon Type)? Busca a internet que significa el número que apareix

    ### Part C – PowerShell

    Executa la cerca per PowerShell de la secció d'Apunts per als IDs 4624 de les últimes 2 hores i verifica que el resultat coincideix amb el que veus a la GUI.

    ### Part D – Vista personalitzada

    Crea una vista personalitzada que mostri alhora:

    - Log: **Application**
    - IDs: 1521, 1509, 1525
    - Nom de la vista: "Diagnòstic Perfils Mòbils"

    Fes una captura de la vista creada (estarà buida per ara, però serà molt útil als Projectes 4 i 5).

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Event Viewer Windows Server tutorial español"`
        - `"Windows Event IDs 4624 4625 explained"`
        - `"Get-WinEvent PowerShell filter event log"`
        - `"Windows Server event log custom views"`
