---
title: Sufix .V6 i format de carpetes de perfil
tags:
  - perfils mòbils
  - V6
  - compatibilitat
  - UT1
---

# :material-tag-text: Sufix .V6 i format de carpetes de perfil

!!! abstract "Concepte clau"
    Windows afegeix automàticament un **sufix de versió** al nom de la carpeta de perfil mòbil per garantir la compatibilitat entre versions del sistema operatiu. Per a Windows 10 i 11, el sufix és **`.V6`**. Conèixer-ho evita errors de diagnòstic quan no es troba la carpeta de perfil esperada.

=== ":material-notebook-outline: Apunts"

    ## Evolució dels sufixos de versió

    | Versió de Windows | Sufix de carpeta de perfil |
    |------------------|--------------------------|
    | Windows XP / 2003 | *(sense sufix)* `maria.puig` |
    | Windows Vista / 7 | `.V2` → `maria.puig.V2` |
    | Windows 8 | `.V3` → `maria.puig.V3` |
    | Windows 8.1 | `.V4` → `maria.puig.V4` |
    | Windows 10 (1507–1511) | `.V5` → `maria.puig.V5` |
    | **Windows 10 (1607+) i Windows 11** | **`.V6`** → `maria.puig.V6` |
    | Windows Server 2019/2022 (com a client) | **`.V6`** |

    !!! tip "Al laboratori (Windows 11 + Windows Server 2022), totes les carpetes de perfil tindran el sufix **`.V6`**. Si en un diagnòstic veus `maria.puig` sense sufix, correspon a un perfil de Windows XP heretat, no al perfil actual."

    ## Per quin motiu existeixen sufixos?

    Els formats de perfil no són compatibles entre versions majors de Windows: la configuració del Registre (`NTUSER.DAT`) i l'estructura de carpetes varien. Si Windows 7 carregués un perfil creat per Windows 10, podria malmetre'l o generar errors.

    El sistema de sufixos garanteix que cada versió d'OS **usa exclusivament la seva pròpia carpeta**, evitant corrupcions i incompatibilitats.

    ## La ruta real al disc vs la ruta configurada

    | On s'especifica | Ruta |
    |-----------------|------|
    | ADUC (fitxa d'usuari) | `\\SRV-WS2022\Perfils\maria.puig` ← **sense sufix** |
    | GPO de perfil | `\\SRV-WS2022\Perfils\%USERNAME%` ← **sense sufix** |
    | Carpeta real al servidor | `C:\Perfils\maria.puig.V6` ← **amb sufix** |
    | Compartida visible al servidor | `\\SRV-WS2022\Perfils\maria.puig.V6` |

    Windows afegeix el sufix automàticament. **Mai no has d'escriure `.V6` manualment** a ADUC ni a les GPOs.

    ## Diagnòstic: verificar quines carpetes de perfil existeixen

    ```powershell
    # Llista totes les carpetes de perfil al servidor
    Get-ChildItem "C:\Perfils" | Select-Object Name, LastWriteTime, CreationTime

    # Filtra únicament les carpetes V6
    Get-ChildItem "C:\Perfils" | Where-Object {$_.Name -like "*.V6"} |
        Select-Object Name, @{N='Mida_MB';E={
            [math]::Round((Get-ChildItem $_.FullName -Recurse -ErrorAction SilentlyContinue |
            Measure-Object -Property Length -Sum).Sum / 1MB, 1)
        }}, LastWriteTime
    ```

    ## Escenari d'entorns mixtos (múltiples versions d'OS)

    En una organització amb clients Windows 7 i Windows 11:

    ```
    C:\Perfils\
    ├── maria.puig.V2\   ← Perfil Windows 7 de maria.puig
    └── maria.puig.V6\   ← Perfil Windows 11 de maria.puig
    ```

    Cada versió manté el seu propi perfil independent. Els canvis fets des d'un Windows 7 no es veuen des d'un Windows 11 i viceversa. Al laboratori (tot Windows 11) únicament hi haurà carpetes `.V6`.

    ## Event IDs relacionats amb els perfils al Visor

    | Event ID | Canal | Descripció |
    |----------|-------|-----------|
    | **1500** | User Profiles | Perfil carregat correctament |
    | **1502** | User Profiles | Perfil mòbil sincronitzat correctament |
    | **1509** | User Profiles | Sessió simultània detectada — no s'ha sincronitzat |
    | **1521** | User Profiles | No s'ha pogut accedir al perfil mòbil — s'usa el local |
    | **1525** | User Profiles | Error en pujar el perfil al servidor en tancar sessió |

    !!! warning "L'**Event 1521** és el més crític: indica que Windows no ha pogut accedir a la ruta de perfil mòbil i ha carregat un **perfil temporal** o local en el seu lloc. L'usuari no veu les seves dades. Causa habitual: la carpeta del servidor no existeix, la ruta de perfil és incorrecta, o els permisos no permeten l'accés."

    ??? question "Auto-avaluació"

        **1.** Un tècnic cerca la carpeta de perfil de `pere.costa` al servidor i no troba `C:\Perfils\pere.costa`. Quin és el motiu i on ha de buscar?

        ??? success "Resposta"
            Windows afegeix el sufix **`.V6`** automàticament al nom de la carpeta de perfil per a Windows 10/11. La carpeta real és **`C:\Perfils\pere.costa.V6`**, no `C:\Perfils\pere.costa`. Si tampoc existeix `pere.costa.V6`, pot ser que `pere.costa` encara no hagi iniciat sessió amb perfil mòbil, o que la ruta de perfil a ADUC no estigui configurada.

        **2.** Una empresa té clients Windows 7 i Windows 11. L'usuari `joan.mas` fa canvis a l'escriptori des d'un Windows 7. Veurà els canvis quan iniciï sessió des d'un Windows 11? Per quin motiu?

        ??? success "Resposta"
            **No**. Windows 7 usa el sufix `.V2` i Windows 11 usa el sufix `.V6`. Cada versió d'OS carrega la seva pròpia carpeta de perfil. Els canvis fets des de `joan.mas.V2` (Windows 7) no afecten `joan.mas.V6` (Windows 11): són dues carpetes de perfil independents. Per migrar la configuració entre versions, cal usar eines específiques de migració de perfil com USMT (User State Migration Tool).

        **3.** Configures la ruta de perfil a ADUC com `\\SRV-WS2022\Perfils\maria.puig.V6`. És correcte?

        ??? success "Resposta"
            **No és correcte**. La ruta a ADUC ha de ser **sense el sufix `.V6`**: `\\SRV-WS2022\Perfils\maria.puig`. Windows afegeix el sufix `.V6` automàticament. Si poses el sufix manualment, Windows crearà la carpeta `maria.puig.V6.V6` (amb doble sufix), que no funcionarà correctament.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 9.4 · Verifica les carpetes de perfil al servidor

    **Objectiu**: explorar i comprendre l'estructura de carpetes de perfil generades al servidor.

    **Temps estimat**: 15 minuts

    **Prerequisit**: Almenys un usuari ha iniciat sessió amb perfil mòbil (Activitat 9.3)

    ---

    ### Part A – Examina les carpetes de perfil

    Al servidor, executa:

    ```powershell
    # Llista les carpetes de perfil amb mida i data
    Get-ChildItem "C:\Perfils" | ForEach-Object {
        $mida = (Get-ChildItem $_.FullName -Recurse -ErrorAction SilentlyContinue |
                 Measure-Object -Property Length -Sum).Sum
        [PSCustomObject]@{
            Nom         = $_.Name
            Creat       = $_.CreationTime
            UltimAcces  = $_.LastWriteTime
            MidaMB      = [math]::Round($mida/1MB, 2)
        }
    } | Format-Table -AutoSize
    ```

    Documenta al dossier:
    1. Quines carpetes han aparegut? Tienen el sufix `.V6`?
    2. Quina mida té el perfil de `maria.puig.V6`?
    3. Quins subdirectoris conté?

    ### Part B – Comprova el Visor d'esdeveniments

    Al client, obre el Visor d'esdeveniments:
    ```cmd
    eventvwr.msc
    ```

    Navega a `Registres d'aplicacions i serveis → Microsoft → Windows → User Profiles → Operational`.

    Identifica els events 1500 (perfil carregat) i 1502 (sincronitzat). Hi ha algun event d'error (1509, 1521)?

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"roaming profile V6 suffix Windows 10 11 Server"`
        - `"Windows user profile version suffix V2 V4 V6 explained"`
        - `"Event 1521 roaming profile error fix Windows"`
        - `"User Profiles event log Windows Server troubleshoot"`
