---
title: PowerShell per a la gestió d'Active Directory
tags:
  - powershell
  - active directory
  - automatització
  - UT1
---

# :material-powershell: PowerShell per a la gestió d'Active Directory

!!! abstract "Concepte clau"
    El mòdul **ActiveDirectory** de PowerShell permet crear, modificar i consultar objectes d'AD de manera massiva i automatitzada. La importació de CSV és especialment potent: permet crear 30 usuaris en 5 línies de codi, eliminant errors de tipografia i inconsistències.

=== ":material-notebook-outline: Apunts"

    ## El mòdul ActiveDirectory

    El mòdul `ActiveDirectory` s'instal·la automàticament amb el rol AD DS. Conté aproximadament **150 cmdlets** organitzats per objecte:

    ```powershell
    # Comprova que el mòdul és disponible
    Get-Module -ListAvailable ActiveDirectory

    # Importa el mòdul (normalment s'importa automàticament)
    Import-Module ActiveDirectory

    # Llista tots els cmdlets del mòdul
    Get-Command -Module ActiveDirectory | Select-Object Name | Sort-Object Name
    ```

    ## Cmdlets principals per objecte

    ### Usuaris

    ```powershell
    # CREAR usuari complet
    New-ADUser `
        -Name "Pere Costa" `
        -GivenName "Pere" `
        -Surname "Costa" `
        -SamAccountName "pere.costa" `
        -UserPrincipalName "pere.costa@cirvianum.local" `
        -Path "OU=SMX-1,OU=Alumnes,DC=cirvianum,DC=local" `
        -AccountPassword (ConvertTo-SecureString "P@ssw0rd!" -AsPlainText -Force) `
        -ChangePasswordAtLogon $true `
        -Enabled $true

    # CERCAR usuaris amb filtre
    Get-ADUser -Filter {Department -eq "SMX"} `
               -Properties Department, Title, LastLogonDate |
        Select-Object Name, SamAccountName, Department, LastLogonDate

    # CERCAR un usuari per nom parcial
    Get-ADUser -Filter {Name -like "Pere*"} | Select-Object Name, SamAccountName

    # MODIFICAR atributs
    Set-ADUser -Identity "pere.costa" `
               -Department "SMX" `
               -Title "Alumne" `
               -Description "Alumne SMX-1 curs 2024-25"

    # MOURE a una UO diferent
    Move-ADObject -Identity "CN=Pere Costa,OU=SMX-1,OU=Alumnes,DC=cirvianum,DC=local" `
                  -TargetPath "OU=SMX-2,OU=Alumnes,DC=cirvianum,DC=local"

    # RESTABLIR contrasenya
    Set-ADAccountPassword -Identity "pere.costa" `
        -NewPassword (ConvertTo-SecureString "NovaPwd!" -AsPlainText -Force) `
        -Reset
    Set-ADUser -Identity "pere.costa" -ChangePasswordAtLogon $true

    # ELIMINAR (amb confirmació)
    Remove-ADUser -Identity "pere.costa"
    ```

    ### Grups

    ```powershell
    # CREAR grup
    New-ADGroup -Name "SMX-Alumnes" `
                -GroupScope Global `
                -GroupCategory Security `
                -Path "OU=Alumnes,DC=cirvianum,DC=local"

    # AFEGIR membres
    Add-ADGroupMember -Identity "SMX-Alumnes" `
                      -Members "pere.costa","maria.puig","anna.valls"

    # VEURE membres
    Get-ADGroupMember -Identity "SMX-Alumnes" -Recursive |
        Select-Object Name, SamAccountName, ObjectClass

    # VEURE grups d'un usuari
    Get-ADPrincipalGroupMembership -Identity "pere.costa" |
        Select-Object Name, GroupScope, GroupCategory
    ```

    ## Creació massiva des de CSV (Projecte 3)

    La tècnica més important del curs: crear tots els usuaris d'una classe des d'un fitxer CSV.

    ### Estructura del fitxer CSV

    ```csv
    Nom,Cognom,SamAccountName,UO,Departament
    Maria,Puig,maria.puig,"OU=SMX-1,OU=Alumnes,DC=cirvianum,DC=local",SMX
    Pere,Costa,pere.costa,"OU=SMX-1,OU=Alumnes,DC=cirvianum,DC=local",SMX
    Anna,Valls,anna.valls,"OU=SMX-2,OU=Alumnes,DC=cirvianum,DC=local",SMX
    Joan,Mas,joan.mas,"OU=Professors,DC=cirvianum,DC=local",TIC
    ```

    ### Script d'importació

    ```powershell
    # Llegeix el CSV i crea un usuari per cada fila
    $usuaris = Import-Csv -Path "C:\Scripts\usuaris.csv" -Delimiter ","

    foreach ($u in $usuaris) {
        $nom = "$($u.Nom) $($u.Cognom)"
        $upn = "$($u.SamAccountName)@cirvianum.local"

        New-ADUser `
            -Name $nom `
            -GivenName $u.Nom `
            -Surname $u.Cognom `
            -SamAccountName $u.SamAccountName `
            -UserPrincipalName $upn `
            -Path $u.UO `
            -Department $u.Departament `
            -AccountPassword (ConvertTo-SecureString "P@ssw0rd!" -AsPlainText -Force) `
            -ChangePasswordAtLogon $true `
            -Enabled $true

        Write-Host "✅ Creat: $nom ($($u.SamAccountName))"
    }
    ```

    ## Consultes i informes

    ```powershell
    # Tots els usuaris que NO han iniciat sessió mai
    Get-ADUser -Filter {LastLogonDate -notlike "*"} -Properties LastLogonDate |
        Select-Object Name, SamAccountName

    # Comptes desactivats
    Search-ADAccount -AccountDisabled | Select-Object Name, SamAccountName

    # Comptes amb contrasenya que no caduca
    Get-ADUser -Filter {PasswordNeverExpires -eq $true} -Properties PasswordNeverExpires |
        Select-Object Name, SamAccountName

    # Exportar tots els usuaris a CSV
    Get-ADUser -Filter * -Properties Department, Title, EmailAddress |
        Select-Object Name, SamAccountName, Department, Title |
        Export-Csv "C:\Informes\usuaris-domini.csv" -NoTypeInformation -Encoding UTF8
    ```

    !!! tip "El paràmetre `-Properties *` carrega **tots** els atributs AD d'un usuari (>100). Usa `-Properties NomAtribut1, NomAtribut2` per carregar només els que necessites: és molt més ràpid en dominis amb milers d'usuaris."

    ## Errors freqüents al treballar amb PowerShell AD

    | Error | Causa | Solució |
    |-------|-------|---------|
    | `The server is unwilling to process the request` | Contrasenya no compleix la política | Usa una contrasenya que compleixi complexitat i longitud mínima |
    | `Cannot find an object with identity` | L'usuari no existeix o el nom és incorrecte | Verifica amb `Get-ADUser -Filter {SamAccountName -eq "nom"}` |
    | `Access denied` | Executant PowerShell sense privilegis d'Administrador del domini | Executa PowerShell com a Administrador o usa `Run as different user` |
    | `The distinguished name...is invalid` | Ruta `-Path` incorrecta | Verifica la ruta amb `Get-ADOrganizationalUnit -Filter *` |

    ??? question "Auto-avaluació"

        **1.** Quin avantatge té crear usuaris des d'un CSV en lloc de fer-ho manualment via ADUC?

        ??? success "Resposta"
            La creació per CSV és **ràpida, consistent i repetible**: 30 usuaris es creen en 30 segons, tots amb els mateixos atributs i convenció de noms. Elimina errors de tipografia en noms i contrasenyes, i el fitxer CSV pot servir de registre dels comptes creats. A ADUC, crear 30 usuaris manualment prendria ~30 minuts amb alt risc d'errors.

        **2.** Vols buscar tots els usuaris del departament "SMX" que tinguin la contrasenya caducada. Escriu el cmdlet de PowerShell.

        ??? success "Resposta"
            ```powershell
            Get-ADUser -Filter {Department -eq "SMX"} `
                       -Properties Department, PasswordExpired |
                Where-Object {$_.PasswordExpired -eq $true} |
                Select-Object Name, SamAccountName, PasswordExpired
            ```

        **3.** Tens un fitxer CSV amb 50 usuaris nous. El script d'importació falla a l'usuari número 23 perquè el seu `SamAccountName` té un espai. Com modificaries el script per saltar-lo i continuar amb els altres?

        ??? success "Resposta"
            Afegint un bloc `try/catch` dins del `foreach`:
            ```powershell
            foreach ($u in $usuaris) {
                try {
                    New-ADUser -Name "$($u.Nom) $($u.Cognom)" ...
                    Write-Host "✅ Creat: $($u.SamAccountName)"
                } catch {
                    Write-Warning "❌ Error amb $($u.SamAccountName): $_"
                }
            }
            ```
            El `catch` captura l'error, el mostra com a advertència i el bucle continua amb el següent usuari.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 5.5 · Importació massiva d'usuaris des de CSV

    **Objectiu**: crear tots els usuaris del laboratori automàticament des d'un fitxer CSV.

    **Temps estimat**: 30 minuts

    **Prerequisit**: UOs i grups creats (Activitats 4.2 i 5.2)

    ---

    ### Part A – Prepara el CSV

    Crea el fitxer `C:\Scripts\usuaris-lab.csv` amb almenys 8 usuaris (2 professors, 3 alumnes SMX-1, 3 alumnes SMX-2). Usa la convenció `nom.cognom` per al `SamAccountName`.

    ### Part B – Executa l'script d'importació

    Copia l'script de la secció d'Apunts, adapta la ruta del CSV i executa'l. Documenta:

    - Quants usuaris s'han creat correctament?
    - Hi ha hagut algun error? Quin motiu?

    ### Part C – Verifica i exporta

    ```powershell
    # Verifica que tots els usuaris existeixen
    Get-ADUser -Filter * -SearchBase "DC=cirvianum,DC=local" |
        Measure-Object

    # Exporta el resultat a CSV per al dossier
    Get-ADUser -Filter * -Properties Department |
        Select-Object Name, SamAccountName, Enabled, Department |
        Export-Csv "C:\Informes\usuaris-creats.csv" -NoTypeInformation -Encoding UTF8
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"PowerShell Active Directory New-ADUser bulk import CSV"`
        - `"Get-ADUser filter properties PowerShell tutorial"`
        - `"Active Directory PowerShell module cmdlets overview"`
        - `"Import-Csv PowerShell crear usuarios Active Directory masivo"`
