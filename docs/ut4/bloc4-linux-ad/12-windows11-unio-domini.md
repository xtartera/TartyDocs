---
title: Windows 11 Pro – unió al domini AD
tags:
  - ut4
  - active-directory
  - windows
---

# :material-microsoft-windows: Windows 11 Pro – unió al domini AD

!!! abstract "Concepte clau"
    **Unir Windows 11 al domini** (`domain join`) és el procés que registra l'equip a l'Active Directory. Requereix DNS configurat apuntant al DC, credencials d'un compte amb permisos per afegir equips, i finalitza amb un reinici. Després, l'usuari pot iniciar sessió amb comptes de domini.

=== ":material-notebook-outline: Apunts"

    ## Prerequisits

    | Requisit | Verificació |
    |---------|------------|
    | DNS apunta al DC | `nslookup ad-cognom.local` ha de resoldre |
    | Connectivitat al DC | `ping 172.16.XXX.10` ha de respondre |
    | Compte amb permisos | Administrador del domini o compte delegat |
    | Windows 11 Pro | Home Edition NO suporta domain join |

    ## Mètode 1 – GUI (Configuració)

    1. **Configuració → Sistema → Temes/Sobre → Informació del domini**
    2. O bé: Clic dret a `Aquest equip → Propietats → Canvia la configuració`
    3. **Nom de l'equip → Canvia... → Domini**: escriu `ad-cognom.local`
    4. Credentials: `Administrator@ad-cognom.local` + contrasenya
    5. Reinicia

    ## Mètode 2 – PowerShell

    ```powershell
    # Configura DNS primer (si no és a DHCP)
    Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses "172.16.XXX.10"

    # Uneix al domini
    Add-Computer -DomainName "ad-cognom.local" `
        -OUPath "OU=Equips,OU=OU201,DC=ad-cognom,DC=local" `
        -Credential (Get-Credential) `
        -Restart
    ```

    L'opció `-OUPath` col·loca l'equip directament a la OU correcta (si no s'especifica, va a `Computers`).

    ## Mètode 3 – netdom

    ```powershell
    netdom join %COMPUTERNAME% /domain:ad-cognom.local `
        /userd:AD-COGNOM\Administrator /passwordd:* /ou:"OU=Equips,OU=OU201,DC=ad-cognom,DC=local"
    ```

    ## Verificació post-domain-join

    ```powershell
    # Reinicia i inicia sessió com a AD-COGNOM\director201

    # Verifica que l'equip és al domini
    (Get-WmiObject Win32_ComputerSystem).Domain
    # Ha de mostrar: ad-cognom.local

    # Verifica les credencials de l'usuari
    whoami
    # Ha de mostrar: ad-cognom\director201

    whoami /groups
    # Mostra tots els grups (Domain Users, GRP-Directors, etc.)

    # Verifica que el compte és de domini
    net user director201 /domain
    ```

    ## Moure l'equip a la OU correcta (si cal)

    Si el domain join es va fer sense especificar OU, l'equip va a `CN=Computers`. Mou-lo:

    ```powershell
    # Al DC
    Get-ADComputer -Filter {Name -eq "CLI-WIN-201"} | Select-Object DistinguishedName
    Move-ADObject -Identity "CN=CLI-WIN-201,CN=Computers,DC=ad-cognom,DC=local" `
        -TargetPath "OU=Equips,OU=OU201,DC=ad-cognom,DC=local"
    ```

    !!! warning "Error més freqüent: DNS incorrecte"
        Si el client apunta a `8.8.8.8` com a DNS, no trobarà el domini. El missatge d'error típic és `"An Active Directory Domain Controller (AD DC) for the domain ad-cognom.local could not be contacted"`. La solució: configurar el DNS del client apuntant al DC (172.16.XXX.10) **before** del domain join.

    !!! tip "Windows 11 Home no pot unir-se a un domini"
        Únicament Windows 11 **Pro**, **Enterprise** i **Education** suporten domain join. Si el laboratori té equips amb Windows 11 Home, cal actualitzar la llicència o usar una màquina virtual amb Pro.

    ??? question "Auto-avaluació"
        **1.** Quins dos requisits previs (al client) cal complir sempre abans d'unir Windows 11 a un domini AD?

        ??? success "Resposta"
            1. **DNS configurat apuntant al DC**: el client ha de poder resoldre el nom del domini (`nslookup ad-cognom.local`) per localitzar el DC via SRV records. 2. **Connectivitat al DC**: el client ha de poder arribar al DC per xarxa (`ping 172.16.XXX.10`). A més, cal disposar de credencials amb permisos per afegir equips al domini (normalment l'administrador del domini).

        **2.** Quin és l'avantatge d'especificar `-OUPath` quan es fa `Add-Computer`?

        ??? success "Resposta"
            Sense `-OUPath`, l'equip va al contenidor per defecte `CN=Computers,DC=...`, que no té GPOs específiques assignades. Especificant `-OUPath "OU=Equips,OU=OU201,DC=..."`, l'equip es col·loca **directament** a la OU correcta i **rep immediatament** les GPOs associades a aquella OU en el primer reinici. Evita el pas manual de moure l'equip des de ADUC.

        **3.** Com es verifica, des de PowerShell al client, que l'equip ha quedat unit al domini correctament?

        ??? success "Resposta"
            `(Get-WmiObject Win32_ComputerSystem).Domain` retorna el nom del domini si l'equip hi pertany. A més, `whoami` mostra `domini\usuari` (en comptes de `hostname\usuari` si fos local). `net user director201 /domain` verifica que el compte existeix al domini. `whoami /groups` mostra els grups de domini als quals pertany l'usuari actual.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.12 · Domain join de Windows 11

    **Objectiu**: unir un client Windows 11 Pro al domini AD i verificar l'autenticació de domini.
    **Temps estimat**: 25 minuts
    **Prerequisit**: DC operatiu, client Windows 11 Pro

    ---

    ### Pas 1 – Configura el DNS al client

    ```powershell
    Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses "172.16.XXX.10"
    nslookup ad-cognom.local
    ```

    ### Pas 2 – Uneix al domini

    ```powershell
    Add-Computer -DomainName "ad-cognom.local" `
        -OUPath "OU=Equips,OU=OU201,DC=ad-cognom,DC=local" `
        -Credential AD-COGNOM\Administrator `
        -Restart
    ```

    ### Pas 3 – Inicia sessió amb un compte de domini

    Reinicia i inicia sessió com a `AD-COGNOM\director201` (o `director201@ad-cognom.local`).

    ### Pas 4 – Verifica

    ```powershell
    whoami
    whoami /groups
    net user director201 /domain
    (Get-WmiObject Win32_ComputerSystem).Domain
    ```

    Documenta: quins grups apareixen a `whoami /groups`?

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Windows 11 join Active Directory domain step by step"`
        - `"Add-Computer PowerShell domain join"`
        - `"whoami /groups domain user verification"`
