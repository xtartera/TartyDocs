---
title: Permisos NTFS i de compartició
tags:
  - NTFS
  - permisos
  - seguretat
  - UT1
---

# :material-shield-lock: Permisos NTFS i de compartició

!!! abstract "Concepte clau"
    L'accés a una carpeta compartida passa per **dos filtres superposats**: els permisos de compartit (SMB) i els permisos NTFS. El resultat final és sempre el **més restrictiu dels dos**. La pràctica estàndard és deixar el compartit amb `Control total` per a tots i gestionar l'accés únicament via NTFS.

=== ":material-notebook-outline: Apunts"

    ## Dos sistemes de permisos superposats

    Quan un client accedeix a `\\SRV-WS2022\Projectes`, Windows aplica **seqüencialment** dos filtres:

    ```mermaid
    graph LR
        C["💻 Client\nPetició d'accés"]
        S["🔒 Filtre 1\nPermisos de COMPARTIT\n(SMB)"]
        N["🔒 Filtre 2\nPermisos NTFS\n(del disc)"]
        R["📁 Fitxer / Carpeta"]

        C --> S -->|"Permís efectiu\n= més restrictiu"| N --> R
    ```

    !!! tip "**Regla d'or**: deixa els permisos de compartit amb `Control total` per al grup d'usuaris, i controla l'accés **únicament amb NTFS**. Evita gestionar dos sistemes alhora."

    ## Permisos de compartit (SMB) — 3 nivells

    | Permís | Lectura | Crear/Modificar | Eliminar | Canviar permisos |
    |--------|---------|-----------------|----------|-----------------|
    | **Lectura** | ✅ | ❌ | ❌ | ❌ |
    | **Canvi** | ✅ | ✅ | ✅ | ❌ |
    | **Control total** | ✅ | ✅ | ✅ | ✅ |

    ## Permisos NTFS estàndard — 6 nivells

    | Permís | Significat |
    |--------|-----------|
    | **Control total** | Tot + canviar permisos i propietari |
    | **Modificació** | Llegir, escriure, eliminar fitxers i subcarpetes |
    | **Lectura i execució** | Veure contingut i executar programes |
    | **Llista de contingut** | Veure noms de fitxers i subcarpetes |
    | **Lectura** | Veure el contingut dels fitxers |
    | **Escriptura** | Crear fitxers i subcarpetes, modificar atributs |

    ### Permisos NTFS especials

    Cada permís estàndard és una combinació de **permisos especials** granulars (Travessa carpeta, Llista carpeta, Llegeix atributs, Crea fitxers, Crea carpetes, Suprimeix, etc.). Es configuren a **Propietats → Seguretat → Opcions avançades**.

    ## La regla de combinació: el més restrictiu guanya

    | Permís compartit | Permís NTFS | Resultat efectiu |
    |-----------------|------------|-----------------|
    | Control total | Lectura | **Lectura** ← guanya NTFS |
    | Lectura | Control total | **Lectura** ← guanya compartit |
    | Canvi | Modificació | **Modificació** ← equivalent, tots dos permeten escriptura |
    | Control total | Modificació | **Modificació** ← guanya NTFS |
    | Control total | Control total | **Control total** |

    ## Configuració de permisos NTFS via GUI

    1. Clic dret a la carpeta → **Propietats → Seguretat**
    2. Fes clic a **Edita**
    3. **Afegeix** → escriu el nom del grup → **Comprova els noms → D'acord**
    4. Selecciona el grup i marca els permisos desitjats
    5. Fes clic a **Aplicar → D'acord**

    ## Configuració via PowerShell (Get-Acl / Set-Acl)

    ```powershell
    # Veure permisos NTFS actuals d'una carpeta
    Get-Acl "C:\Dades\Projectes" | Format-List

    # Afegir un permís NTFS a un grup
    $acl = Get-Acl "C:\Dades\Projectes"

    $regla = New-Object System.Security.AccessControl.FileSystemAccessRule(
        "CIRVIANUM\Alumnes-SMX",   # Identitat
        "Modify",                   # Permís (Modify, ReadAndExecute, FullControl...)
        "ContainerInherit,ObjectInherit",  # S'aplica a carpetes i fitxers fills
        "None",
        "Allow"
    )

    $acl.SetAccessRule($regla)
    Set-Acl "C:\Dades\Projectes" $acl

    # Verificar el resultat
    (Get-Acl "C:\Dades\Projectes").Access |
        Select-Object IdentityReference, FileSystemRights, AccessControlType
    ```

    ## Bones pràctiques

    1. **Nega explícita té prioritat**: un `Deny` explícit sobreescriu qualsevol `Allow`, fins i tot de `Control total`.
    2. **Assigna permisos a grups, mai a usuaris individuals**: és molt més fàcil mantenir quan l'usuari canvia de rol.
    3. **Usa el nivell mínim necessari**: si una persona només ha de llegir, dona `Lectura`, no `Modificació`.
    4. **Documenta els canvis**: registra qui té accés i per quin motiu.

    ??? question "Auto-avaluació"

        **1.** Un usuari pertany al grup `Alumnes` (que té `Modificació` NTFS) i al grup `Becaris` (que té `Lectura` NTFS). Quin permís efectiu té l'usuari?

        ??? success "Resposta"
            **`Modificació`**. Quan un usuari pertany a múltiples grups, els permisos NTFS **s'acumulen** (la unió): l'usuari obté el permís més permissiu dels grups als quals pertany. `Modificació` + `Lectura` = `Modificació`. L'excepció és el `Deny` explícit, que sempre guanya.

        **2.** El permís de compartit d'una carpeta és `Control total` per al grup `Professors`, però el permís NTFS és `Lectura`. Un professor intenta crear un fitxer. Pot fer-ho?

        ??? success "Resposta"
            **No**. El resultat és el **més restrictiu dels dos**: `Control total` (compartit) ∩ `Lectura` (NTFS) = **`Lectura`**. El professor pot veure els fitxers però no crear-ne. Per permetre la creació, cal afegir almenys `Escriptura` o `Modificació` als permisos NTFS.

        **3.** Per quin motiu és una bona pràctica donar `Control total` al compartit i gestionar els permisos únicament via NTFS?

        ??? success "Resposta"
            Gestionar dos sistemes de permisos alhora és complex i propens a errors: un canvi en un d'ells pot tenir efectes inesperats en la combinació. Deixant el compartit amb `Control total` per als usuaris autoritzats, **tot l'accés es controla des d'un únic punt** (NTFS), que és més granular, s'aplica tant en accés local com en xarxa, i és més fàcil d'auditar i documentar.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 7.2 · Configura els permisos NTFS de les carpetes compartides

    **Objectiu**: aplicar la matriu de permisos del Projecte 4 usant NTFS.

    **Temps estimat**: 30 minuts

    **Prerequisit**: Carpetes compartides creades (Activitat 7.1)

    ---

    ### Matriu de permisos a aplicar

    | Carpeta | Grup | Permís NTFS |
    |---------|------|------------|
    | `C:\Dades\Projectes` | `CIRVIANUM\Comercial` | Modificació |
    | `C:\Dades\Projectes` | `CIRVIANUM\TIC` | Control total |
    | `C:\Dades\Projectes` | `CIRVIANUM\RRHH` | Lectura |
    | `C:\Dades\Professors` | `CIRVIANUM\Professors` | Control total |
    | `C:\Dades\Public` | `Tothom` | Lectura i execució |

    ### Part A – Aplica els permisos via GUI

    Per a `C:\Dades\Projectes`:
    1. Propietats → Seguretat → Edita
    2. Elimina `Usuaris (NOM-SERVIDOR\Usuaris)` si hi és
    3. Afegeix `Comercial` → `Modificació`
    4. Afegeix `TIC` → `Control total`
    5. Afegeix `RRHH` → `Lectura`

    ### Part B – Verifica el permís efectiu

    1. A la pestanya **Seguretat → Opcions avançades → Accés efectiu**
    2. Selecciona l'usuari `maria.puig` (membre de `Comercial`)
    3. Quins permisos efectius apareixen? Coincideixen amb `Modificació`?

    ### Part C – Prova des del client

    Inicia sessió com a cada usuari i documenta:

    | Usuari | Grup | Pot llegir? | Pot crear? | Pot eliminar? |
    |--------|------|------------|-----------|--------------|
    | `maria.puig` | Comercial | | | |
    | `anna.valls` | TIC | | | |
    | `joan.mas` | RRHH | | | |

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"NTFS permissions vs share permissions Windows Server explained"`
        - `"NTFS permissions effective access Windows 11"`
        - `"Set-Acl Get-Acl PowerShell NTFS permissions"`
        - `"permisos NTFS carpetas compartidas Windows Server 2022"`
