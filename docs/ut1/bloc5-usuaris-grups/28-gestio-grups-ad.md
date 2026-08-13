---
title: Creació i gestió de grups AD
tags:
  - active directory
  - grups
  - UT1
---

# :material-account-group: Creació i gestió de grups AD

!!! abstract "Concepte clau"
    Els **grups d'Active Directory** agrupen usuaris per assignar-los permisos a recursos de manera col·lectiva. Entendre la diferència entre **tipus** (Seguretat vs Distribució) i **àmbit** (Global, Local de Domini, Universal) és essencial per dissenyar una infraestructura escalable.

=== ":material-notebook-outline: Apunts"

    ## Tipus de grups

    | Tipus | Funció | Ús típic |
    |-------|--------|---------|
    | **Seguretat** | Assignar permisos a recursos i aplicar GPO | **El que usem al curs** |
    | **Distribució** | Llistes de distribució d'email (Exchange) | No s'usa per permisos |

    !!! info "Sempre crea grups de **Seguretat**. Els grups de Distribució no poden tenir permisos NTFS ni d'accés a recursos."

    ## Àmbit dels grups

    L'**àmbit** determina on pot tenir membres i on es pot usar el grup:

    ```mermaid
    graph TD
        subgraph Bosc
            subgraph DominiA["Domini A"]
                GG["🔵 Grup Global\n- Membres: usuaris del Domini A\n- Es pot usar: a qualsevol domini"]
                DL["🟢 Grup Local de Domini\n- Membres: qualsevol domini\n- Es pot usar: permisos al Domini A"]
                U["🟡 Grup Universal\n- Membres: qualsevol domini\n- Es pot usar: qualsevol domini"]
            end
        end
    ```

    | Àmbit | Membres | On s'aplica | Ús recomanat |
    |-------|---------|------------|-------------|
    | **Global** | Usuaris i grups del **mateix domini** | Qualsevol domini del bosc | Grups d'usuaris (Professors, Alumnes-SMX1) |
    | **Local de domini** | Qualsevol usuari o grup | Només al **domini on és** | Permisos a recursos (Lectura-Projectes) |
    | **Universal** | Qualsevol | Qualsevol domini | Boscos amb múltiples dominis |

    !!! tip "Per al curs (un sol domini): usa sempre **Àmbit Global** per als grups d'usuaris. En entorns multi-domini s'usa el model AGdLP (Account → Global → domain Local → Permission)."

    ## Creació via ADUC (GUI)

    1. Navega a la UO on vols crear el grup
    2. Clic dret → **Nou → Grup**
    3. Nom del grup (ex: `Comercial`, `TIC`, `RRHH`)
    4. Àmbit: **Global** · Tipus: **Seguretat**
    5. Fes clic a **D'acord**
    6. Obre el grup → pestanya **Membres** → **Afegeix** → cerca i afegeix usuaris

    ## Creació i gestió via PowerShell

    ```powershell
    # Crear un grup de seguretat global
    New-ADGroup `
        -Name "Comercial" `
        -GroupScope Global `
        -GroupCategory Security `
        -Path "OU=Alumnes,DC=cirvianum,DC=local" `
        -Description "Grup del departament comercial"

    # Afegir membres al grup
    Add-ADGroupMember -Identity "Comercial" -Members "maria.puig","pere.costa"

    # Afegir un grup a un altre grup (grups anidats)
    Add-ADGroupMember -Identity "Tots-Alumnes" -Members "Comercial","TIC","RRHH"

    # Veure els membres d'un grup
    Get-ADGroupMember -Identity "Comercial" | Select-Object Name, SamAccountName

    # Veure tots els grups a on pertany un usuari
    Get-ADPrincipalGroupMembership -Identity "maria.puig" | Select-Object Name

    # Treure un usuari d'un grup
    Remove-ADGroupMember -Identity "Comercial" -Members "pere.costa" -Confirm:$false
    ```

    ## Verificació al client: `whoami /groups`

    Quan un usuari inicia sessió, pots verificar a quins grups pertany:

    ```cmd
    whoami /groups
    ```

    Sortida típica (resumida):
    ```text
    Nom del grup                              Tipus     SID
    ========================================= ========= =========================
    CIRVIANUM\Comercial                        Grup      S-1-5-21-...-1104
    CIRVIANUM\Tots-Alumnes                     Grup      S-1-5-21-...-1105
    NT AUTHORITY\Usuaris autenticats           Grup      S-1-5-11
    ```

    !!! tip "Si un usuari no veu els grups nous als quals s'ha afegit, cal que **tanqui sessió i la torni a iniciar**. L'informació de grups s'obté del token Kerberos que es crea en el moment de l'autenticació."

    ## Estructura de grups per al laboratori (Projecte 3)

    ```mermaid
    graph TD
        subgraph Projectes["Domini cirvianum.local"]
            G1["🔵 Comercial\n(Grup Global)"]
            G2["🔵 TIC\n(Grup Global)"]
            G3["🔵 RRHH\n(Grup Global)"]

            U1["👤 maria.puig"] --> G1
            U2["👤 pere.costa"] --> G1
            U3["👤 anna.valls"] --> G2
            U4["👤 joan.mas"] --> G3
        end
    ```

    ??? question "Auto-avaluació"

        **1.** Tens 20 alumnes de SMX i vols donar-los accés de lectura a la carpeta `C:\Projectes`. Quin és el procés correcte?

        ??? success "Resposta"
            1. Crea un **grup de Seguretat Global** anomenat `Alumnes-SMX` o `SMX-1`.
            2. Afegeix els 20 alumnes com a membres del grup.
            3. Assigna el permís de **Lectura** a la carpeta `C:\Projectes` per al **grup** (no per a cada usuari individualment).
            D'aquesta manera, afegir o treure alumnes del grup actualitza automàticament els seus permisos sense tocar la configuració de la carpeta.

        **2.** Quin àmbit de grup és el més adequat per a un grup d'usuaris en un domini únic com el del laboratori?

        ??? success "Resposta"
            **Àmbit Global**. En un entorn d'un sol domini, els grups Globals contenen usuaris del domini i es poden usar per assignar permisos a qualsevol recurs del domini. És l'àmbit estàndard per a grups d'usuaris (Professors, Alumnes, Comercial...).

        **3.** Un usuari t'assegura que pertany al grup `TIC` però `whoami /groups` no el mostra. Quin és el motiu i la solució?

        ??? success "Resposta"
            El **token Kerberos** amb la informació de grups es genera en el moment de l'inici de sessió. Si l'usuari s'ha afegit al grup **mentre tenia la sessió oberta**, el token antic no reflecteix el canvi. Solució: l'usuari ha de **tancar la sessió i tornar a iniciar-la** per obtenir un token nou amb els grups actualitzats.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 5.2 · Crea l'estructura de grups del laboratori

    **Objectiu**: crear els grups del Projecte 3 i verificar l'assignació de membres.

    **Temps estimat**: 25 minuts

    **Prerequisit**: Usuaris creats (Activitat 5.1)

    ---

    ### Part A – Crea els grups

    Via PowerShell, crea els tres grups a la UO `OU=Alumnes,DC=cirvianum,DC=local`:

    ```powershell
    "Comercial","TIC","RRHH" | ForEach-Object {
        New-ADGroup -Name $_ -GroupScope Global -GroupCategory Security `
            -Path "OU=Alumnes,DC=cirvianum,DC=local" `
            -Description "Grup $_"
    }
    ```

    ### Part B – Assigna membres

    - Grup `Comercial`: afegeix `maria.puig` i `pere.costa`
    - Grup `TIC`: afegeix `anna.valls` i un altre usuari a elecció
    - Grup `RRHH`: afegeix almenys 1 usuari

    ### Part C – Verifica

    1. Des d'un client unit al domini, inicia sessió com a `maria.puig`
    2. Executa `whoami /groups` i confirma que apareix el grup `Comercial`
    3. Executa al servidor:
    ```powershell
    Get-ADGroupMember "Comercial" | Select-Object Name, SamAccountName
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Active Directory groups types scope explained"`
        - `"New-ADGroup Add-ADGroupMember PowerShell tutorial"`
        - `"whoami /groups Active Directory verify membership"`
        - `"AGdLP model Active Directory best practice"`
