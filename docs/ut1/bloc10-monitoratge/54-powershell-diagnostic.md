---
title: PowerShell de diagnòstic del sistema
tags:
  - PowerShell
  - diagnòstic
  - monitoratge
  - UT1
---

# :material-console-line: PowerShell de diagnòstic del sistema

!!! abstract "Concepte clau"
    PowerShell permet construir **scripts de diagnòstic complets** que comproven en un sol pas l'estat de tots els components del domini: serveis AD, DNS, connectivitat, usuaris, perfils i recursos compartits. Al final de la UT1, tens totes les eines per diagnosticar i resoldre qualsevol incidència del Projecte 5.

=== ":material-notebook-outline: Apunts"

    ## Diagnòstic del Controlador de Domini

    ```powershell
    # ============================================
    # Script de diagnòstic del DC — executa al servidor
    # ============================================

    Write-Host "=== DIAGNÒSTIC DEL CONTROLADOR DE DOMINI ===" -ForegroundColor Cyan

    # 1. Serveis AD DS essencials
    Write-Host "`n[1] Serveis AD DS:" -ForegroundColor Yellow
    $serveis = @("ADWS","DNS","KDC","Netlogon","NTDS","W32Time")
    foreach ($s in $serveis) {
        $srv = Get-Service -Name $s -ErrorAction SilentlyContinue
        $estat = if ($srv.Status -eq "Running") {"✅ Running"} else {"❌ $($srv.Status)"}
        Write-Host "  $s : $estat"
    }

    # 2. Verificació del domini
    Write-Host "`n[2] Domini:" -ForegroundColor Yellow
    $dc = Get-ADDomainController
    Write-Host "  Nom DC:    $($dc.Name)"
    Write-Host "  Domini:    $($dc.Domain)"
    Write-Host "  Lloc:      $($dc.Site)"
    Write-Host "  Versió OS: $($dc.OperatingSystem)"

    # 3. DNS — registres SRV
    Write-Host "`n[3] Registres DNS SRV del domini:" -ForegroundColor Yellow
    $srvRecords = @("_ldap._tcp","_kerberos._tcp","_gc._tcp")
    foreach ($r in $srvRecords) {
        try {
            $res = Resolve-DnsName "$r.cirvianum.local" -Type SRV -ErrorAction Stop
            Write-Host "  ✅ $r → $($res.NameTarget):$($res.Port)"
        } catch {
            Write-Host "  ❌ $r → NO RESOLT" -ForegroundColor Red
        }
    }

    # 4. Replicació AD (només si hi ha múltiples DC)
    Write-Host "`n[4] Comprovació de replicació AD:" -ForegroundColor Yellow
    repadmin /showrepl 2>&1 | Select-String "error|Error|FAIL" | ForEach-Object {
        Write-Host "  ⚠️  $_" -ForegroundColor DarkYellow
    }
    if (-not (repadmin /showrepl 2>&1 | Select-String "error|FAIL")) {
        Write-Host "  ✅ Sense errors de replicació"
    }

    Write-Host "`n=== FI DEL DIAGNÒSTIC ===" -ForegroundColor Cyan
    ```

    ## Diagnòstic d'usuaris i grups

    ```powershell
    # Resum de l'estat dels comptes d'usuari del domini
    Write-Host "=== ESTAT DE COMPTES D'USUARI ===" -ForegroundColor Cyan

    $tots = Get-ADUser -Filter * -Properties LockedOut, Enabled, PasswordExpired,
                                              LastLogonDate, ProfilePath

    Write-Host "`n[Total d'usuaris]: $($tots.Count)"
    Write-Host "[Activats]:  $(($tots | Where-Object Enabled).Count)"
    Write-Host "[Desactivats]: $(($tots | Where-Object {-not $_.Enabled}).Count)"
    Write-Host "[Bloquejats]: $(($tots | Where-Object LockedOut).Count)"
    Write-Host "[Contrasenya caducada]: $(($tots | Where-Object PasswordExpired).Count)"

    # Usuaris bloquejats (si n'hi ha)
    $bloquejats = $tots | Where-Object LockedOut
    if ($bloquejats) {
        Write-Host "`n⚠️  Comptes bloquejats:" -ForegroundColor DarkYellow
        $bloquejats | Select-Object Name, SamAccountName | Format-Table
    }

    # Usuaris sense perfil mòbil configurat (a la OU Alumnes)
    Write-Host "`n[Alumnes sense perfil mòbil:]"
    Get-ADUser -Filter * -SearchBase "OU=Alumnes,DC=cirvianum,DC=local" `
               -Properties ProfilePath |
        Where-Object {[string]::IsNullOrEmpty($_.ProfilePath)} |
        Select-Object Name, SamAccountName | Format-Table
    ```

    ## Diagnòstic de recursos compartits i connectivitat

    ```powershell
    # Verifica l'estat de les carpetes compartides i l'accés al domini
    Write-Host "=== DIAGNÒSTIC DE RECURSOS ===" -ForegroundColor Cyan

    # Carpetes compartides (exclou les administratives)
    Write-Host "`n[Carpetes compartides actives:]" -ForegroundColor Yellow
    Get-SmbShare | Where-Object {$_.Name -notmatch '^\w\$$|^ADMIN\$|^IPC\$'} |
        Select-Object Name, Path, Description | Format-Table

    # Connexions de clients actuals
    Write-Host "`n[Clients connectats ara:]" -ForegroundColor Yellow
    Get-SmbSession | Select-Object ClientComputerName, ClientUserName,
                                   NumOpens, SecondsIdle | Format-Table

    # Perfils mòbils al servidor
    Write-Host "`n[Carpetes de perfil al servidor:]" -ForegroundColor Yellow
    Get-ChildItem "C:\Perfils" -ErrorAction SilentlyContinue |
        ForEach-Object {
            $mida = (Get-ChildItem $_.FullName -Recurse -EA SilentlyContinue |
                     Measure-Object -Property Length -Sum).Sum
            [PSCustomObject]@{
                Perfil   = $_.Name
                MidaMB   = [math]::Round($mida/1MB, 1)
                UltimÚs  = $_.LastWriteTime
            }
        } | Sort-Object MidaMB -Descending | Format-Table
    ```

    ## Script de diagnòstic des del CLIENT

    ```powershell
    # Executa al client Windows 11 (com a usuari de domini)
    Write-Host "=== DIAGNÒSTIC CLIENT-DOMINI ===" -ForegroundColor Cyan

    # Identitat
    Write-Host "`n[Sessió actual]:" -ForegroundColor Yellow
    Write-Host "  Usuari:     $(whoami)"
    Write-Host "  UPN:        $((whoami /upn) -join '')"
    Write-Host "  DC:         $($env:LOGONSERVER)"

    # Canal de confiança
    Write-Host "`n[Canal de confiança amb el DC]:" -ForegroundColor Yellow
    $canal = Test-ComputerSecureChannel
    if ($canal) { Write-Host "  ✅ Canal OK" }
    else         { Write-Host "  ❌ Canal TRENCAT — executa: Test-ComputerSecureChannel -Repair" -ForegroundColor Red }

    # DNS
    Write-Host "`n[Resolució DNS del domini]:" -ForegroundColor Yellow
    try {
        $ip = (Resolve-DnsName "cirvianum.local" -Type A -ErrorAction Stop).IPAddress
        Write-Host "  ✅ cirvianum.local → $ip"
    } catch {
        Write-Host "  ❌ No resolt — comprova DNS del client" -ForegroundColor Red
    }

    # Ruta del perfil mòbil
    Write-Host "`n[Perfil de l'usuari actual]:" -ForegroundColor Yellow
    Write-Host "  Ruta:   $($env:USERPROFILE)"
    Write-Host "  Tipus:  $((Get-WmiObject Win32_UserProfile | Where-Object {$_.LocalPath -eq $env:USERPROFILE}).RoamingConfigured)"

    # Unitats de xarxa actives
    Write-Host "`n[Unitats de xarxa muntades]:" -ForegroundColor Yellow
    Get-PSDrive -PSProvider FileSystem | Where-Object {$_.Root -like "\\*"} |
        Select-Object Name, Root | Format-Table

    # GPO aplicades (resum)
    Write-Host "`n[GPO aplicades (últimes 5)]:" -ForegroundColor Yellow
    gpresult /r 2>&1 | Select-String "Objecte de directiva" | Select-Object -First 5
    ```

    ## Taula resum de totes les eines de diagnòstic del curs

    | Eina | On s'executa | Comprova |
    |------|-------------|---------|
    | `ping`, `Test-NetConnection` | Client / Servidor | Connectivitat de xarxa |
    | `nslookup`, `Resolve-DnsName` | Client | Resolució DNS del domini |
    | `nltest /dsgetdc:` | Client | Localitza el DC |
    | `Test-ComputerSecureChannel` | Client (admin local) | Canal de confiança amb el DC |
    | `whoami /upn /groups` | Client | Identitat i grups de la sessió |
    | `gpresult /r` | Client | GPO aplicades i filtrades |
    | `gpupdate /force` | Client | Força l'aplicació de GPO |
    | `Get-ADUser -Properties` | Servidor | Estat dels comptes d'usuari |
    | `Get-ADDefaultDomainPasswordPolicy` | Servidor | Política de contrasenya |
    | `Get-SmbShare`, `Get-SmbSession` | Servidor | Recursos compartits actius |
    | `Get-WinEvent` (Seguretat, User Profiles) | Servidor / Client | Events d'auditoria i perfils |
    | `auditpol /get` | Servidor | Política d'auditoria activa |
    | `icacls` | Servidor | Permisos NTFS des de la línia |
    | `repadmin /showrepl` | Servidor | Replicació entre DCs |

    ??? question "Auto-avaluació"

        **1.** Un alumne diu "no puc iniciar sessió al domini". Llista les 5 comprovacions que fas per ordre de prioritat.

        ??? success "Resposta"
            Per ordre de prioritat: **(1)** `ping 10.0.2.10` — el client arriba físicament al DC? **(2)** `ipconfig /all` — el DNS preferit és la IP del DC (no `8.8.8.8`)? **(3)** `nslookup cirvianum.local` — el client pot resoldre el nom del domini? **(4)** Al servidor: `Get-ADUser "nom.usuari" -Properties LockedOut, Enabled` — el compte existeix, és actiu i no està bloquejat? **(5)** Al client: hora del sistema — difereix en més de 5 minuts del DC (error Kerberos)? Amb aquestes 5 comprovacions es resolen el 95% dels problemes d'inici de sessió.

        **2.** Crees un script que comprova mensualment quins usuaris no han iniciat sessió en els últims 90 dies. Escriu el cmdlet de PowerShell.

        ??? success "Resposta"
            ```powershell
            $dataLlimit = (Get-Date).AddDays(-90)
            Get-ADUser -Filter {Enabled -eq $true} `
                       -Properties LastLogonDate |
                Where-Object {
                    $_.LastLogonDate -lt $dataLlimit -or
                    $_.LastLogonDate -eq $null
                } |
                Select-Object Name, SamAccountName, LastLogonDate |
                Sort-Object LastLogonDate |
                Export-Csv "C:\Informes\inactius-90dies.csv" -NoTypeInformation -Encoding UTF8
            ```

        **3.** Al script de diagnòstic del DC, el servei `KDC` apareix com "❌ Stopped". Quin impacte té i com el reinicies?

        ??? success "Resposta"
            El servei **KDC** (Key Distribution Center) és el component de Kerberos al DC. Si està aturat, **cap usuari del domini pot autenticar-se**: tots els intents d'inici de sessió i d'accés a recursos de domini fallaran immediatament. Per reiniciar-lo: `Start-Service -Name KDC` o `net start kdc`. Si no arrenca, comprova el Visor d'esdeveniments per al motiu de l'error (pot ser un problema amb el servei NTDS o DNS que KDC depèn).

=== ":material-pencil-ruler: Activitat"

    ## Activitat 10.3 · Script de diagnòstic complet del Projecte 5

    **Objectiu**: crear un script de diagnòstic integral que verifiqui tots els components del domini del laboratori.

    **Temps estimat**: 40 minuts

    **Prerequisit**: Tots els blocs anteriors completats

    ---

    ### Part A – Script de diagnòstic del servidor

    Combina els tres blocs de PowerShell de la secció d'Apunts en un únic script `C:\Scripts\diagnostic-servidor.ps1`.

    Afegeix al final un resum amb el nombre de comprovacions superades vs fallides:

    ```powershell
    # Al final del script
    Write-Host "`n==========================================" -ForegroundColor Cyan
    Write-Host "RESUM: $ok comprovacions OK | $errors errors" -ForegroundColor $(if ($errors -gt 0) {"Red"} else {"Green"})
    ```

    ### Part B – Script de diagnòstic del client

    Desa el script de diagnòstic del client com a `C:\Scripts\diagnostic-client.ps1` i executa'l:

    ```powershell
    # Executa al client com a Administrador
    & "C:\Scripts\diagnostic-client.ps1"
    ```

    Documenta al dossier:
    - Quantes comprovacions passen?
    - Hi ha alguna ❌? Quin és el motiu?

    ### Part C – Informe final del Projecte 5

    Redacta un informe breu (taula al dossier) amb l'estat de tots els components:

    | Component | Eina de verificació | Estat | Observacions |
    |-----------|-------------------|-------|-------------|
    | Servei AD DS | `Get-Service NTDS` | | |
    | DNS (SRV `_ldap`) | `Resolve-DnsName` | | |
    | Canal de confiança | `Test-ComputerSecureChannel` | | |
    | Perfil mòbil `maria.puig` | Visor / carpeta `.V6` | | |
    | Carpeta compartida `Projectes` | `Get-SmbShare` | | |
    | GPO `Restriccions-Alumnes` | `gpresult /r` | | |
    | Auditoria `C:\Dades\Projectes` | `auditpol /get` | | |

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"PowerShell Active Directory health check script"`
        - `"Windows Server diagnostic script automation PowerShell"`
        - `"AD DS health check repadmin dcdiag Windows Server"`
        - `"PowerShell monitoring domain controller services"`
