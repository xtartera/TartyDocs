---
title: Validació de la integració al domini
tags:
  - domini
  - diagnòstic
  - clients
  - UT1
---

# :material-check-decagram: Validació de la integració al domini

!!! abstract "Concepte clau"
    Unir un client al domini no és suficient: cal **verificar** que la integració és correcta. Les eines `whoami`, `%logonserver%`, `nltest` i `Test-ComputerSecureChannel` confirmen que l'autenticació, la confiança i les GPO funcionen com s'espera.

=== ":material-notebook-outline: Apunts"

    ## Per quin ordre values la integració?

    ```mermaid
    graph TD
        A["1️⃣ whoami\n¿Com ha iniciat sessió l'usuari?"]
        B["2️⃣ %logonserver%\n¿Quin DC l'ha autenticat?"]
        C["3️⃣ nltest /dsgetdc:\n¿El client pot trobar el DC?"]
        D["4️⃣ Test-ComputerSecureChannel\n¿El canal de confiança és vàlid?"]
        E["5️⃣ gpresult /r\n¿S'apliquen les GPO correctament?"]

        A --> B --> C --> D --> E
    ```

    ## 1. `whoami` — qui és l'usuari actual?

    ```cmd
    whoami
    ```
    Sortida si ha iniciat sessió al **domini**: `CIRVIANUM\maria.puig`
    Sortida si ha iniciat sessió **localment**: `PC-AULA01\maria.puig`

    ```cmd
    :: Mostra el User Principal Name (UPN) complet
    whoami /upn
    ```
    Sortida esperada: `maria.puig@cirvianum.local`

    !!! warning "Si `whoami` mostra `PC-AULA01\usuari` en lloc de `CIRVIANUM\usuari`, l'usuari ha iniciat sessió amb el compte **local** del PC, no amb el compte de domini. Cal seleccionar el domini a la pantalla d'inici de sessió o escriure `CIRVIANUM\maria.puig` com a nom d'usuari."

    ## 2. `%logonserver%` — quin DC ha autenticat l'usuari?

    ```cmd
    echo %logonserver%
    ```
    Sortida esperada: `\\SRV-WS2022`

    Si retorna `\\PC-AULA01` (el propi PC), l'usuari s'ha autenticat localment.
    Si retorna buit o error, pot haver-hi un problema de confiança amb el DC.

    ## 3. `nltest` — troba el controlador de domini

    ```cmd
    :: Localitza el DC del domini especificat
    nltest /dsgetdc:cirvianum.local
    ```

    Sortida correcta:
    ```text
    DC: \\SRV-WS2022
    Address: \\10.0.2.10
    Dom Guid: {xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx}
    Dom Name: CIRVIANUM
    Forest Name: cirvianum.local
    Dc Site Name: Default-First-Site-Name
    Our Site Name: Default-First-Site-Name
    Flags: PDC GC DS LDAP KDC TIMESERV WRITABLE DNS_FOREST CLOSE_SITE FULL_SECRET WS DS_8 DS_9 DS_10
    The command completed successfully
    ```

    Si falla o retorna error, el client no pot trobar el DC (problema de DNS o xarxa).

    ## 4. `Test-ComputerSecureChannel` — canal de confiança

    Cada PC membre del domini manté un **canal de confiança** (secure channel) amb el DC, amb una contrasenya que es renova automàticament cada 30 dies.

    ```powershell
    # Verifica el canal de confiança (ha d'executar-se com a Administrador local)
    Test-ComputerSecureChannel -Verbose
    ```

    Sortida correcta:
    ```text
    VERBOSE: Performing the operation "Test" on target "SRV-WS2022.cirvianum.local".
    True
    ```

    Si retorna `False`, el canal de confiança s'ha trencat. Solució:

    ```powershell
    # Repara el canal de confiança sense treure el PC del domini
    Test-ComputerSecureChannel -Repair -Credential (Get-Credential "CIRVIANUM\Administrador")
    ```

    !!! tip "El canal de confiança trencat és un error comú en MVs que s'han clonat o restaurat d'una instantània antiga: el PC té una contrasenya de compte d'equip que ja no coincideix amb la del DC. `Test-ComputerSecureChannel -Repair` ho soluciona sense tornar a unir el PC al domini."

    ## 5. Resum de totes les comprovacions

    ```powershell
    # Script de diagnòstic complet de la integració al domini
    Write-Host "=== Validació d'integració al domini ===" -ForegroundColor Cyan

    Write-Host "`n[1] Identitat de l'usuari actual:"
    whoami
    whoami /upn

    Write-Host "`n[2] Servidor d'autenticació:"
    cmd /c "echo %logonserver%"

    Write-Host "`n[3] Localització del DC:"
    nltest /dsgetdc:cirvianum.local 2>&1 | Select-String "DC:|Address:|Flags:"

    Write-Host "`n[4] Canal de confiança:"
    $canal = Test-ComputerSecureChannel
    if ($canal) { Write-Host "✅ Canal de confiança: OK" -ForegroundColor Green }
    else         { Write-Host "❌ Canal de confiança: TRENCAT" -ForegroundColor Red }

    Write-Host "`n[5] GPO aplicades (resum):"
    gpresult /r 2>&1 | Select-String "Objecte de directiva de grup aplicat|S'han aplicat els OGP"
    ```

    ??? question "Auto-avaluació"

        **1.** `whoami` retorna `PC-AULA01\xavier` en lloc de `CIRVIANUM\xavier`. Quin és el problema i com l'alumne pot solucionar-ho sense reiniciar?

        ??? success "Resposta"
            L'usuari ha iniciat sessió amb el compte **local** del PC, no amb el compte de domini. Per iniciar sessió al domini sense reiniciar, cal **tancar la sessió** i a la pantalla d'inici de sessió escriure el nom complet `CIRVIANUM\xavier` o `xavier@cirvianum.local`. El PC ha d'estar unit al domini i el DC ha d'estar accessible.

        **2.** `Test-ComputerSecureChannel` retorna `False` en un PC que estava unit al domini fa 3 mesos. Quin és el motiu probable i com es repara?

        ??? success "Resposta"
            El motiu probable és que el **canal de confiança** s'ha trencat: la contrasenya del compte d'equip al PC no coincideix amb la que té el DC (pot passar si es restaura una instantània antiga o si el PC ha estat desconnectat molt de temps). Es repara amb `Test-ComputerSecureChannel -Repair -Credential (Get-Credential "CIRVIANUM\Administrador")`, que sincronitza la contrasenya sense treure el PC del domini ni perdre cap configuració.

        **3.** `echo %logonserver%` retorna `\\PC-AULA01`. Significa que Active Directory no funciona?

        ??? success "Resposta"
            No necessàriament. Significa que **l'usuari actual ha iniciat sessió localment** (amb un compte local del PC), no que AD no funcioni. Pot ser que l'usuari hagi triat el compte local a la pantalla d'inici de sessió. Comprova amb `whoami`: si mostra `PC-AULA01\usuari`, confirma que és una sessió local. Per verificar si AD funciona, executa `nltest /dsgetdc:cirvianum.local` o inicia sessió amb un compte de domini.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 6.3 · Valida la integració del client al domini

    **Objectiu**: executar totes les comprovacions de validació i documentar els resultats.

    **Temps estimat**: 20 minuts

    **Prerequisit**: Client W11 unit al domini i sessió iniciada com a usuari de domini

    ---

    ### Part A – Comprovacions bàsiques

    Des del client `PC-AULA01` amb sessió de `maria.puig@cirvianum.local`:

    | Ordre | Resultat obtingut | Correcte? |
    |-------|------------------|-----------|
    | `whoami` | | CIRVIANUM\maria.puig? |
    | `whoami /upn` | | maria.puig@cirvianum.local? |
    | `echo %logonserver%` | | \\SRV-WS2022? |
    | `nltest /dsgetdc:cirvianum.local` | | Retorna el DC? |
    | `Test-ComputerSecureChannel` | | True? |

    ### Part B – Prova els grups

    ```cmd
    whoami /groups
    ```

    1. Apareix el grup `CIRVIANUM\Comercial` o `CIRVIANUM\SMX-1` a la llista?
    2. Apareix `NT AUTHORITY\Usuaris autenticats`?
    3. Apareix `BUILTIN\Usuaris`?

    ### Part C – Script de diagnòstic

    Executa l'script de diagnòstic complet de la secció d'Apunts i guarda el resultat a `C:\Informes\validacio-domini.txt`:

    ```powershell
    # Redirigeix la sortida a un fitxer
    & { whoami; whoami /upn; cmd /c "echo %logonserver%"; nltest /dsgetdc:cirvianum.local } |
        Out-File "C:\Informes\validacio-domini.txt" -Encoding UTF8
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"whoami upn logonserver Active Directory verify domain login"`
        - `"nltest dsgetdc Active Directory domain controller locate"`
        - `"Test-ComputerSecureChannel PowerShell fix broken trust"`
        - `"validate Windows 11 domain join Active Directory"`
