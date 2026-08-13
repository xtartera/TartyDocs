---
title: Auditoria d'accés a objectes
tags:
  - auditoria
  - seguretat
  - NTFS
  - UT1
---

# :material-magnify-scan: Auditoria d'accés a objectes

!!! abstract "Concepte clau"
    L'**auditoria d'accés** registra al Visor d'esdeveniments qui ha accedit (o intentat accedir) a una carpeta o fitxer concret. Requereix activar-la en dos llocs: a la **GPO** (habilitar la política d'auditoria) i a la **carpeta** (definir quins accessos s'enregistren). El resultat apareix al canal **Seguretat** del Visor amb l'Event ID 4663.

=== ":material-notebook-outline: Apunts"

    ## Dos passos obligatoris

    ```mermaid
    graph LR
        P1["Pas 1️⃣\nGPO: Habilita\nl'auditoria d'objectes\n(Configuració de l'equip)"]
        P2["Pas 2️⃣\nCarpeta: Defineix\nquins accessos auditar\n(SACL a Propietats → Seguretat)"]
        R["📋 Registre\nal canal Seguretat\ndel Visor (ID 4663)"]

        P1 --> R
        P2 --> R
    ```

    Si falta qualsevol dels dos passos, no es genera cap registre d'auditoria.

    ## Pas 1: Habilitar la política d'auditoria via GPO

    **Via GPMC** (Default Domain Policy o GPO d'equips):

    ```
    Configuració de l'equip
    └── Directrius
        └── Configuració de Windows
            └── Configuració de seguretat
                └── Directrius d'auditoria locals
                    └── Audita l'accés a objectes
                        → Habilita per a: ✅ Èxit  ✅ Errors
    ```

    **Via PowerShell (auditpol):**

    ```cmd
    :: Habilita l'auditoria d'accés a objectes (Èxit i Error)
    auditpol /set /subcategory:"File System" /success:enable /failure:enable

    :: Verifica la configuració actual d'auditoria
    auditpol /get /subcategory:"File System"
    ```

    ## Pas 2: Configurar la SACL a la carpeta

    La **SACL** (System Access Control List) defineix quins tipus d'accés a una carpeta concreta es registren.

    **Via GUI:**

    1. Clic dret a la carpeta → **Propietats → Seguretat → Opcions avançades**
    2. Pestanya **Auditoria → Afegeix**
    3. Selecciona el principal: `Tothom` (per auditar qualsevol usuari)
    4. Tipus: `Tots` (Èxit + Error)
    5. Marca els accessos a auditar: `Lectura`, `Escriptura`, `Suprimir`
    6. **D'acord**

    **Via PowerShell:**

    ```powershell
    # Afegeix una regla d'auditoria a una carpeta
    $ruta = "C:\Dades\Projectes"
    $acl = Get-Acl $ruta

    # Auditoria d'Escriptura i Supressió per a Tothom (Èxit i Error)
    $regla = New-Object System.Security.AccessControl.FileSystemAuditRule(
        "Everyone",
        "Write, Delete",
        "ContainerInherit, ObjectInherit",
        "None",
        "Success, Failure"
    )

    $acl.AddAuditRule($regla)
    Set-Acl $ruta $acl

    Write-Host "✅ SACL configurada a: $ruta"
    ```

    ## Event IDs clau d'auditoria

    | Event ID | Canal | Descripció |
    |----------|-------|-----------|
    | **4663** | Seguretat | Accés a un objecte (fitxer/carpeta) — l'entrada més important |
    | **4656** | Seguretat | S'ha sol·licitat un descriptor d'accés a un objecte |
    | **4660** | Seguretat | S'ha suprimit un objecte |
    | **4670** | Seguretat | S'han canviat els permisos d'un objecte |
    | **4907** | Seguretat | S'han canviat la política d'auditoria d'un objecte (SACL) |

    ## Interpretar el Event 4663

    ```text
    S'ha accedit a un objecte.

    Assumpte:
      Nom del compte de seguretat:  CIRVIANUM\maria.puig
      Tipus de compte:               Usuari
      SID del compte:                S-1-5-21-...

    Informació de l'objecte:
      Servidor d'objectes:           Security
      Tipus d'objecte:               File
      Nom de l'objecte:              C:\Dades\Projectes\informe.docx
      Id. del controlador:           0x7e4

    Informació d'accés:
      Màscara d'accés:               0x2
      Accessos:                      WriteData (o AddFile)    ← ha creat/modificat un fitxer
    ```

    ## Consultar els events d'auditoria amb PowerShell

    ```powershell
    # Cerca els últims 20 accessos a fitxers (Event 4663)
    Get-WinEvent -FilterHashtable @{
        LogName   = 'Security'
        Id        = 4663
        StartTime = (Get-Date).AddHours(-24)
    } -MaxEvents 20 |
        ForEach-Object {
            $xml = [xml]$_.ToXml()
            [PSCustomObject]@{
                Hora    = $_.TimeCreated
                Usuari  = $xml.Event.EventData.Data | Where-Object {$_.Name -eq 'SubjectUserName'} | Select-Object -ExpandProperty '#text'
                Fitxer  = $xml.Event.EventData.Data | Where-Object {$_.Name -eq 'ObjectName'} | Select-Object -ExpandProperty '#text'
                Accès   = $xml.Event.EventData.Data | Where-Object {$_.Name -eq 'AccessList'} | Select-Object -ExpandProperty '#text'
            }
        } | Format-Table -AutoSize

    # Cerca accessos fallits (intents d'accés denegats)
    Get-WinEvent -FilterHashtable @{
        LogName  = 'Security'
        Id       = 4663
        Keywords = 0x10000000000000  # Failure
    } -MaxEvents 10
    ```

    !!! tip "El canal Seguretat pot acumular milers d'events molt ràpidament si s'auditen molts fitxers. Filtra sempre per carpetes concretes (no tot el disc) i per tipus d'accés rellevants (Escriptura, Supressió), no per Lectura, que és molt voluminosa."

    ??? question "Auto-avaluació"

        **1.** Configures la SACL de `C:\Dades\Projectes` per auditar accessos, però no apareix cap Event 4663 al Visor. Quin és el motiu?

        ??? success "Resposta"
            Falta el **Pas 1**: la política d'auditoria d'objectes no està habilitada a la GPO. La SACL de la carpeta defineix *quins* accessos s'han d'enregistrar, però la política d'auditoria a la GPO és el **commutador global** que habilita o deshabilita el registre d'auditoria del sistema. Si la GPO no habilita `Audita l'accés a objectes: Èxit`, el sistema no genera cap event 4663, independentment de la SACL configurada.

        **2.** Quin event registra que un usuari ha **suprimit** un fitxer de `C:\Dades\Projectes`?

        ??? success "Resposta"
            L'**Event ID 4663** amb el camp `Accessos` = `Delete`. L'Event 4660 ("S'ha suprimit un objecte") es genera conjuntament amb el 4663 quan l'objecte s'elimina físicament. Per a un diagnòstic complet de supressions, filtra per ID 4663 i busca `Delete` al camp d'accés, o filtra directament per ID 4660.

        **3.** Per quin motiu NO es recomana auditar accessos de **Lectura** a carpetes amb molts fitxers?

        ??? success "Resposta"
            Cada lectura d'un fitxer genera un Event 4663 al canal Seguretat. En una carpeta de projectes amb 50 fitxers que 30 alumnes obren diverses vegades al dia, es podrien generar **milers d'events per hora**. Això omple ràpidament el canal Seguretat (que per defecte té un límit de mida), sobreescriu events antics importants, i fa pràcticament impossible trobar events rellevants entre el soroll. Audita únicament les operacions sensibles: `Escriptura`, `Supressió` i `Canvi de permisos`.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 10.1 · Configura l'auditoria d'accés a `C:\Dades\Projectes`

    **Objectiu**: detectar qui ha modificat o suprimit fitxers de la carpeta de projectes.

    **Temps estimat**: 35 minuts

    **Prerequisit**: GPO accessible, `C:\Dades\Projectes` existent, client W11 unit al domini

    ---

    ### Part A – Habilita la política d'auditoria

    A la **Default Domain Policy** (o una GPO d'equips):
    ```
    Configuració de l'equip → Directrius → Configuració de Windows
    → Configuració de seguretat → Directrius d'auditoria locals
    → Audita l'accés a objectes → ✅ Èxit ✅ Errors
    ```

    Aplica: `gpupdate /force` al servidor i al client.

    Verifica:
    ```cmd
    auditpol /get /subcategory:"File System"
    ```

    ### Part B – Configura la SACL

    Executa l'script PowerShell de la secció d'Apunts per afegir auditoria d'`Escriptura` i `Delete` a `C:\Dades\Projectes`.

    ### Part C – Genera i analitza events

    Des del client `PC-AULA01` com a `maria.puig`:

    1. Crea un fitxer a `\\SRV-WS2022\Projectes\prova-auditoria.txt`
    2. Modifica'l
    3. Elimina'l

    Al servidor, executa la consulta PowerShell de la secció d'Apunts i documenta:

    | Hora | Usuari | Fitxer | Tipus d'accés |
    |------|--------|--------|--------------|
    | | | | |
    | | | | |

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"NTFS auditing object access Windows Server 2022 SACL"`
        - `"Event 4663 file access audit Windows Security log"`
        - `"auditpol Windows Server file system auditing enable"`
        - `"Get-WinEvent Security log 4663 PowerShell audit"`
