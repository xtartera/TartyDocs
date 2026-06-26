---
title: icacls – Permisos per línia d'ordres
tags:
  - NTFS
  - icacls
  - permisos
  - UT1
---

# :material-console: icacls – Permisos per línia d'ordres

!!! abstract "Concepte clau"
    **`icacls`** (Integrity Control Access Control List) és l'eina de línia d'ordres per llegir i modificar permisos NTFS. Imprescindible per a scripts d'automatització i situacions on la GUI no és accessible (Server Core, connexions remotes, massivitat).

=== ":material-notebook-outline: Apunts"

    ## Sintaxi bàsica

    ```cmd
    icacls <ruta> [opcions]
    ```

    | Opció | Acció |
    |-------|-------|
    | `/grant usuari:(permisos)` | Afegeix o modifica permisos per a un usuari/grup |
    | `/deny usuari:(permisos)` | Denega explícitament permisos |
    | `/remove usuari` | Elimina totes les entrades d'un usuari |
    | `/reset` | Restableix els permisos per defecte (herència del pare) |
    | `/inheritance:e` | Habilita l'herència |
    | `/inheritance:d` | Deshabilita l'herència, conserva els permisos |
    | `/inheritance:r` | Deshabilita l'herència, elimina els heretats |
    | `/t` | Aplica recursivament a subcarpetes i fitxers |
    | `/c` | Continua en cas d'error |
    | `/save fitxer.acl` | Exporta els permisos a un fitxer |
    | `/restore fitxer.acl` | Importa els permisos des d'un fitxer |

    ## Llegir permisos actuals

    ```cmd
    :: Permisos de la carpeta Projectes
    icacls "C:\Dades\Projectes"
    ```

    Sortida típica:
    ```text
    C:\Dades\Projectes CIRVIANUM\TIC:(OI)(CI)(F)
                       CIRVIANUM\Comercial:(OI)(CI)(M)
                       CIRVIANUM\RRHH:(OI)(CI)(R)
                       NT AUTHORITY\SYSTEM:(OI)(CI)(F)
                       BUILTIN\Administradors:(OI)(CI)(F)
    ```

    ### Flags d'herència

    | Flag | Significat |
    |------|-----------|
    | `(OI)` | **Object Inherit** — s'aplica als fitxers fills |
    | `(CI)` | **Container Inherit** — s'aplica a les subcarpetes filles |
    | `(IO)` | **Inherit Only** — no s'aplica a la carpeta actual, només als fills |
    | `(NP)` | **No Propagate** — no es propaga més d'un nivell |
    | `(I)` | Permís **heretat** del pare |

    ### Abreviatures de permisos

    | Abreviatura | Permís NTFS |
    |-------------|------------|
    | `F` | Full control (Control total) |
    | `M` | Modify (Modificació) |
    | `RX` | Read & Execute (Lectura i execució) |
    | `R` | Read (Lectura) |
    | `W` | Write (Escriptura) |
    | `D` | Delete (Suprimir) |

    ## Afegir i modificar permisos

    ```cmd
    :: Dona Control total al grup TIC (recursiu)
    icacls "C:\Dades\Projectes" /grant "CIRVIANUM\TIC:(OI)(CI)F" /t

    :: Dona Modificació al grup Comercial
    icacls "C:\Dades\Projectes" /grant "CIRVIANUM\Comercial:(OI)(CI)M"

    :: Dona Lectura al grup RRHH
    icacls "C:\Dades\Projectes" /grant "CIRVIANUM\RRHH:(OI)(CI)R"

    :: Denega l'accés explícitament (Deny sempre guanya sobre Allow)
    icacls "C:\Dades\Confidencial" /deny "CIRVIANUM\Alumnes:(OI)(CI)R"
    ```

    !!! warning "Usa `/grant:r` (en lloc de `/grant`) per **substituir** completament els permisos existents d'un usuari. `/grant` afegeix entrades noves sense eliminar les anteriors, que pot generar conflictes."

    ## Eliminar i restablir permisos

    ```cmd
    :: Elimina totes les entrades del grup Becaris
    icacls "C:\Dades\Projectes" /remove "CIRVIANUM\Becaris"

    :: Restableix els permisos per defecte (herència del pare)
    icacls "C:\Dades\Projectes" /reset /t

    :: Deshabilita l'herència i elimina els permisos heretats
    icacls "C:\Dades\Personal\maria.puig" /inheritance:r
    ```

    ## Exportar i importar permisos (backup)

    ```cmd
    :: Exporta els permisos de tota la carpeta Dades
    icacls "C:\Dades" /save "C:\Backup\permisos-dades.acl" /t

    :: Restaura els permisos des del backup
    icacls "C:\" /restore "C:\Backup\permisos-dades.acl"
    ```

    !!! tip "Exporta els permisos **abans** de fer canvis massius. Si alguna cosa va malament, pots restaurar l'estat anterior en un sol comando."

    ## PowerShell com a alternativa

    ```powershell
    # Equivalent a icacls per llegir permisos
    (Get-Acl "C:\Dades\Projectes").Access |
        Select-Object IdentityReference, FileSystemRights, IsInherited

    # Afegir un permís de Lectura al grup RRHH
    $acl = Get-Acl "C:\Dades\Projectes"
    $regla = New-Object System.Security.AccessControl.FileSystemAccessRule(
        "CIRVIANUM\RRHH","Read","ContainerInherit,ObjectInherit","None","Allow")
    $acl.AddAccessRule($regla)
    Set-Acl "C:\Dades\Projectes" $acl
    ```

    ??? question "Auto-avaluació"

        **1.** Quina diferència hi ha entre `icacls carpeta /grant Grup:(OI)(CI)M` i `icacls carpeta /grant:r Grup:(OI)(CI)M`?

        ??? success "Resposta"
            `/grant` **afegeix** una nova entrada ACL per al grup, sense eliminar les entrades anteriors del mateix grup. Si el grup ja tenia permisos, ara tindrà dos registres (l'antic i el nou), que pot generar comportaments inesperats. `/grant:r` **substitueix** completament els permisos existents del grup per la nova entrada, assegurant que el grup té exactament els permisos especificats. Usa sempre `/grant:r` quan vols definir un estat específic.

        **2.** Quin és el significat de la sortida `CIRVIANUM\Comercial:(OI)(CI)(I)(M)` en icacls?

        ??? success "Resposta"
            - `CIRVIANUM\Comercial`: el grup Comercial del domini
            - `(OI)`: s'aplica als **fitxers fills** (Object Inherit)
            - `(CI)`: s'aplica a les **subcarpetes filles** (Container Inherit)
            - `(I)`: aquest permís és **heretat** de la carpeta pare
            - `(M)`: el nivell de permís és **Modificació** (llegir, escriure, eliminar)

        **3.** Vols fer un backup dels permisos de `C:\Dades` abans d'un canvi massiu. Quin comando uses i on guardes el fitxer?

        ??? success "Resposta"
            ```cmd
            icacls "C:\Dades" /save "C:\Backup\permisos-dades.acl" /t
            ```
            El paràmetre `/t` assegura que s'exportin els permisos de tota l'estructura de subcarpetes i fitxers. El fitxer `.acl` es pot restaurar amb `icacls "C:\" /restore "C:\Backup\permisos-dades.acl"`. Guarda el backup en una ubicació diferent de la carpeta afectada.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 7.4 · Gestiona permisos amb icacls

    **Objectiu**: aplicar i verificar permisos NTFS usant la línia d'ordres.

    **Temps estimat**: 25 minuts

    **Prerequisit**: Carpetes compartides i permisos bàsics de les activitats anteriors

    ---

    ### Part A – Llegeix els permisos actuals

    ```cmd
    icacls "C:\Dades\Projectes"
    icacls "C:\Dades\Personal\maria.puig"
    ```

    Per a cada sortida, identifica:
    1. Quins usuaris/grups hi apareixen?
    2. Quin permís té cada un?
    3. Quin flag `(OI)(CI)` porta cada permís?
    4. Hi ha permisos heretats `(I)`?

    ### Part B – Modifica permisos via icacls

    Afegeix el grup `Becaris` amb permís de `Lectura` a `C:\Dades\Projectes`:
    ```cmd
    icacls "C:\Dades\Projectes" /grant "CIRVIANUM\Becaris:(OI)(CI)R" /t
    ```

    Verifica el resultat:
    ```cmd
    icacls "C:\Dades\Projectes"
    ```

    Elimina el permís de `Becaris`:
    ```cmd
    icacls "C:\Dades\Projectes" /remove "CIRVIANUM\Becaris" /t
    ```

    ### Part C – Exporta i restaura

    1. Exporta els permisos actuals: `icacls "C:\Dades" /save "C:\Backup\pre-canvis.acl" /t`
    2. Fes un canvi de prova (afegeix qualsevol permís)
    3. Restaura: `icacls "C:\" /restore "C:\Backup\pre-canvis.acl"`
    4. Verifica que el canvi s'ha revertit

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"icacls Windows command line NTFS permissions tutorial"`
        - `"icacls grant deny reset permissions Windows Server"`
        - `"icacls save restore backup ACL permissions"`
        - `"NTFS permissions command line icacls vs cacls Windows"`
