---
title: gpupdate i aplicació de polítiques
tags:
  - GPO
  - gpupdate
  - diagnòstic
  - UT1
---

# :material-refresh: gpupdate i aplicació de polítiques

!!! abstract "Concepte clau"
    Per defecte, Windows aplica les GPOs cada **90 minuts** (±30 min aleatoris) als clients i cada **5 minuts** als controladors de domini. `gpupdate /force` força l'aplicació immediata sense esperar el pròxim cicle, i és imprescindible per verificar que els canvis de GPO funcionen durant les pràctiques.

=== ":material-notebook-outline: Apunts"

    ## Cicle d'aplicació automàtica de GPOs

    | Context | Freqüència automàtica |
    |---------|----------------------|
    | Clients (usuari i equip) | Cada 90 minuts ± 30 min aleatoris |
    | Controladors de domini | Cada 5 minuts |
    | En l'arrencada del PC | Sempre (Configuració de l'ordinador) |
    | En l'inici de sessió | Sempre (Configuració de l'usuari) |

    El cicle automàtic evita que tots els clients contactin el DC alhora (la variació aleatòria de ±30 min escampa la càrrega).

    ## Sintaxi de `gpupdate`

    ```cmd
    gpupdate                    :: Actualitza les polítiques modificades des de l'últim cicle
    gpupdate /force             :: Força la reaplicació de TOTES les polítiques
    gpupdate /force /logoff     :: Força l'aplicació i tanca la sessió (aplica polítiques d'usuari)
    gpupdate /force /boot       :: Força l'aplicació i reinicia (aplica polítiques d'equip)
    gpupdate /target:computer   :: Actualitza únicament les polítiques d'equip
    gpupdate /target:user       :: Actualitza únicament les polítiques d'usuari
    gpupdate /sync              :: Aplica de forma síncrona (espera fins que acaba)
    ```

    !!! tip "Usa `gpupdate /force` per verificar canvis de GPO durant les pràctiques. Si la GPO configura polítiques **d'usuari**, necessitaràs tancar la sessió i tornar a iniciar-la (`/logoff`) per veure l'efecte. Si configura polítiques **d'equip**, pot caldre reiniciar (`/boot`)."

    ## Flux complet d'aplicació de GPOs

    ```mermaid
    sequenceDiagram
        participant C as 💻 Client
        participant DC as 🖥️ DC (SYSVOL)

        Note over C: Arrencada del PC
        C->>DC: Quines GPOs apliquen a aquest equip?
        DC-->>C: Llista de GPOs (GUID + versió)
        C->>C: Comprova versions locals vs noves
        C->>DC: Descarrega les GPOs noves o modificades
        DC-->>C: Fitxers de política (SYSVOL)
        C->>C: Aplica Configuració de l'ordinador

        Note over C: Inici de sessió d'usuari
        C->>DC: Quines GPOs apliquen a maria.puig?
        DC-->>C: Llista de GPOs d'usuari
        C->>DC: Descarrega les GPOs modificades
        DC-->>C: Fitxers de política
        C->>C: Aplica Configuració de l'usuari
        Note over C: Escriptori disponible
    ```

    ## Polítiques que requereixen reinici o logoff

    Algunes configuracions no s'apliquen amb `gpupdate /force` perquè requereixen un estat específic del sistema:

    | Tipus de política | Quan s'aplica |
    |------------------|---------------|
    | **Assignació de programari** (MSI) | En arrencada o inici de sessió |
    | **Scripts d'inici de màquina** | En arrencada del PC |
    | **Scripts d'inici de sessió d'usuari** | En inici de sessió |
    | **Redirecció de carpetes** | En inici de sessió |
    | **Polítiques de contrasenya** | Immediatament (s'apliquen al DC, no al client) |
    | **Restriccions d'escriptori** | Amb `gpupdate /force /logoff` |

    ## Actualitzar GPOs en equips remots

    ```powershell
    # Forçar gpupdate en un equip remot (Windows Server 2012+)
    Invoke-GPUpdate -Computer "PC-AULA01" -Force

    # Forçar gpupdate en tots els equips d'una UO
    Get-ADComputer -Filter * -SearchBase "OU=Equips-Aula,DC=cirvianum,DC=local" |
        ForEach-Object {
            Invoke-GPUpdate -Computer $_.Name -Force -RandomDelayInMinutes 0
            Write-Host "✅ GPUpdate enviat a: $($_.Name)"
        }
    ```

    ## Diagnòstic d'aplicació de GPOs

    Quan `gpupdate /force` falla o una GPO no s'aplica:

    ```cmd
    :: Pas 1: Força l'actualització
    gpupdate /force

    :: Pas 2: Verifica quines GPOs s'apliquen
    gpresult /r

    :: Pas 3: Comprova el registre d'esdeveniments de GPO
    eventvwr.msc → Registres de Windows → Sistema → Filtra per origen "GroupPolicy"
    ```

    ```powershell
    # Veure els últims 10 esdeveniments de GroupPolicy
    Get-WinEvent -FilterHashtable @{
        LogName = 'System'
        ProviderName = 'Microsoft-Windows-GroupPolicy'
    } -MaxEvents 10 | Select-Object TimeCreated, Id, Message
    ```

    ### Errors freqüents de GPO

    | ID d'esdeveniment | Descripció |
    |------------------|-----------|
    | `1500` | GPO aplicada correctament |
    | `1058` | No s'ha pogut accedir al fitxer de política (problema de SYSVOL o DNS) |
    | `1030` | Error de xarxa en accedir al SYSVOL |
    | `7016` | Temps d'espera expirat en aplicar les extensions |

    ??? question "Auto-avaluació"

        **1.** Configures una GPO que canvia el fons de pantalla dels alumnes. Executes `gpupdate /force` al client, però el fons no canvia. Quin és el motiu probable i com ho soluciones?

        ??? success "Resposta"
            Les polítiques de **Configuració d'usuari** com el fons de pantalla requereixen que l'usuari **tanqui la sessió i torni a iniciar-la** per aplicar-se completament. `gpupdate /force` descarrega i processa les GPOs, però algunes configuracions d'usuari (escriptori, panell de control, etc.) no tenen efecte fins al pròxim inici de sessió. Solució: `gpupdate /force /logoff` o tancar sessió manualment i tornar a entrar.

        **2.** Quin és el motiu que el cicle automàtic d'actualització de GPOs als clients sigui de 90 minuts **±30 minuts aleatoris** en lloc d'exactament 90 minuts?

        ??? success "Resposta"
            La variació aleatòria de ±30 minuts **escampa la càrrega** sobre el DC i la xarxa. Si tots els clients s'actualitzessin exactament cada 90 minuts, un domini amb 200 clients generaria un pic de tràfic al DC cada hora i mitja. L'aleatorietat fa que les actualitzacions es distribueixin uniformement al llarg del temps, evitant congestions.

        **3.** Vols forçar `gpupdate` a tots els equips de `OU=Equips-Aula` sense accedir físicament a cada PC. Quin cmdlet de PowerShell uses?

        ??? success "Resposta"
            `Invoke-GPUpdate` combinat amb `Get-ADComputer`:
            ```powershell
            Get-ADComputer -Filter * -SearchBase "OU=Equips-Aula,DC=cirvianum,DC=local" |
                ForEach-Object { Invoke-GPUpdate -Computer $_.Name -Force -RandomDelayInMinutes 0 }
            ```
            Requereix que els equips estiguin encesos, accessibles per xarxa i que el firewall permeti la comunicació de gestió remota (`Enable-NetFirewallRule -DisplayGroup "Remote Scheduled Tasks Management"`).

=== ":material-pencil-ruler: Activitat"

    ## Activitat 8.5 · Verifica l'aplicació de GPOs amb gpupdate i gpresult

    **Objectiu**: practicar el cicle complet de configuració, aplicació i verificació de GPOs.

    **Temps estimat**: 25 minuts

    **Prerequisit**: GPO `Restriccions-Alumnes` configurada (Activitat 8.4), client W11 unit al domini

    ---

    ### Part A – Cicle complet de verificació

    1. Fes un canvi a la GPO `Restriccions-Alumnes` (ex: activa una nova restricció)
    2. Al client, executa `gpupdate /force`
    3. Executa `gpresult /r` → confirma que la GPO apareix a la llista
    4. Tanca la sessió i torna a iniciar-la com a `maria.puig`
    5. Verifica que la nova restricció és activa

    ### Part B – Actualització remota

    Des del servidor DC, força l'actualització al client:

    ```powershell
    Invoke-GPUpdate -Computer "PC-AULA01" -Force -RandomDelayInMinutes 0
    ```

    Ha funcionat? Quins ports ha d'obrir el firewall del client per a `Invoke-GPUpdate`?

    ### Part C – Diagnòstic d'errors

    Al client, obre el Visor d'esdeveniments:
    ```cmd
    eventvwr.msc
    ```
    Filtra per `Registres de Windows → Sistema → Origen: GroupPolicy`.

    1. Hi ha errors (IDs 1058, 1030)?
    2. Hi ha informació sobre les GPOs aplicades correctament?
    3. Quin és el temps d'aplicació de les GPOs (en el registre)?

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"gpupdate force logoff boot Windows Server Group Policy"`
        - `"Invoke-GPUpdate PowerShell remote computers"`
        - `"Group Policy not applying troubleshoot gpupdate"`
        - `"Event Viewer Group Policy errors 1058 1030 fix"`
