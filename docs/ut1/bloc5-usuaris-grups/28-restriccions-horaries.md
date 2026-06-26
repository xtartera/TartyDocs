---
title: Restriccions horàries d'accés
tags:
  - active directory
  - seguretat
  - usuaris
  - UT1
---

# :material-clock-alert: Restriccions horàries d'accés

!!! abstract "Concepte clau"
    Les **restriccions horàries** limiten en quines hores del dia un usuari pot iniciar sessió al domini. Útil per impedir que alumnes accedeixin als sistemes fora de l'horari lectiu. Es configuren per usuari des de la fitxa de compte a ADUC.

=== ":material-notebook-outline: Apunts"

    ## Com funcionen les restriccions horàries?

    Les hores d'inici de sessió es configuren a les propietats de cada compte d'usuari. Windows compara l'hora actual del DC amb l'horari permès:

    - Si l'hora **és permesa**: l'inici de sessió s'autoritza normalment
    - Si l'hora **no és permesa**: l'inici de sessió es denega amb un missatge d'error

    !!! warning "Les restriccions horàries impedeixen **nous inicis de sessió**, però no tanquen automàticament les sessions ja obertes. Per forçar el tancament quan acaba l'horari cal activar l'opció addicional 'Finalitza la sessió automàticament quan el temps d'inici de sessió expiri'."

    ## Configuració via ADUC (GUI)

    1. Obre **Active Directory Users and Computers**
    2. Cerca l'usuari → doble clic per obrir les propietats
    3. Pestanya **Compte** → fes clic a **Hores d'inici de sessió**
    4. A la quadrícula (files = dies, columnes = hores):
        - Les cel·les **blaves** = hores permeses
        - Les cel·les **blanques** = hores denegades
    5. Selecciona el rang d'hores → tria **Permetre** o **Denegar**
    6. Fes clic a **D'acord**

    ### Exemple: horari lectiu (dilluns–divendres, 8h–21h)

    ```
           0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19 20 21 22 23
    Dill.  □  □  □  □  □  □  □  □  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  □  □  □
    Dim.   □  □  □  □  □  □  □  □  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  □  □  □
    Dim.   □  □  □  □  □  □  □  □  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  □  □  □
    Dij.   □  □  □  □  □  □  □  □  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  □  □  □
    Div.   □  □  □  □  □  □  □  □  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  □  □  □
    Dis.   □  □  □  □  □  □  □  □  □  □  □  □  □  □  □  □  □  □  □  □  □  □  □  □
    Diu.   □  □  □  □  □  □  □  □  □  □  □  □  □  □  □  □  □  □  □  □  □  □  □  □

    ■ = Permès    □ = Denegat
    ```

    ## Configuració via PowerShell

    PowerShell representa l'horari com un array de 21 bytes (1 bit per hora, 7 dies × 24 hores = 168 bits).

    ```powershell
    # Consultar l'horari actual d'un usuari
    Get-ADUser "maria.puig" -Properties LogonHours |
        Select-Object Name, LogonHours

    # Permetre TOTES les hores (sense restriccions)
    $tothom = [byte[]]([System.Convert]::FromBase64String("////////////////////AA=="))
    Set-ADUser "maria.puig" -Replace @{logonHours = $tothom}

    # Denegar TOTES les hores (compte bloquejat per horari)
    $ningú = [byte[]](0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0)
    Set-ADUser "maria.puig" -Replace @{logonHours = $ningú}
    ```

    !!! tip "Per a restriccions horàries complexes per PowerShell, és més pràctic construir l'array de bytes manualment o usar una funció auxiliar. La GUI d'ADUC és molt més còmoda per a aquesta configuració."

    ## Activar el tancament automàtic de sessions

    Per defecte, les restriccions impedeixen inicis de sessió nous però no tanquen les sessions actives. Per forçar el tancament:

    **Via GPO** (Default Domain Policy o GPO de domini):
    ```
    Configuració de l'ordinador
    └── Configuració de Windows
        └── Configuració de seguretat
            └── Opcions de seguretat
                → "Servidor de xarxa de Microsoft: desconnectar clients quan expirin les hores d'inici de sessió"
                → Activar
    ```

    ## Verificació per línia d'ordres

    ```cmd
    :: Comprova les hores d'inici de sessió d'un usuari
    net user maria.puig /domain
    ```

    Sortida rellevant:
    ```text
    Hores d'inici de sessió permeses   Dill 08:00 - 21:00; Dim 08:00 - 21:00;
                                        Dim 08:00 - 21:00; Dij 08:00 - 21:00;
                                        Div 08:00 - 21:00
    ```

    ??? question "Auto-avaluació"

        **1.** Un alumne ha deixat la sessió oberta quan acaben les hores permeses. Continuarà treballant? Què passa quan intenta fer alguna acció de xarxa?

        ??? success "Resposta"
            **Per defecte, la sessió no es talla**. L'alumne pot continuar treballant localment. Però si intenta accedir a recursos del domini (carpetes compartides, impressores) o el sistema detecta la caducitat de les credencials, pot rebre errors d'autenticació. Activant l'opció "desconnectar clients quan expirin les hores" a GPO, la sessió es tanca automàticament en arribar l'hora límit.

        **2.** Quin avantatge tenen les restriccions horàries per UO respecte a configurar-les usuari per usuari?

        ??? success "Resposta"
            Les restriccions horàries **no es configuren per UO** directament: s'apliquen per usuari individual a les propietats del compte. Per aplicar el mateix horari a molts usuaris eficientment, cal usar un script PowerShell que apliqui la mateixa configuració a tots els usuaris d'una UO, o usar Fine-Grained Password Policies amb la configuració d'horari associada.

        **3.** A quina pestanya de les propietats d'un usuari a ADUC es troben les restriccions horàries?

        ??? success "Resposta"
            A la pestanya **Compte**, fent clic al botó **"Hores d'inici de sessió"**. La quadrícula que apareix mostra els 7 dies de la setmana (files) i les 24 hores (columnes), on pots definir les franges horàries permeses i denegades.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 5.4 · Configura restriccions horàries per als alumnes

    **Objectiu**: restringir l'accés dels alumnes al domini a l'horari lectiu.

    **Temps estimat**: 20 minuts

    **Prerequisit**: Usuaris d'alumnes creats a la UO correcta

    ---

    ### Part A – Configura l'horari via ADUC

    Per a l'usuari `maria.puig`:

    1. Obre ADUC → `OU=SMX-1,OU=Alumnes` → doble clic a `maria.puig`
    2. Pestanya **Compte** → **Hores d'inici de sessió**
    3. Configura: dilluns a divendres de 08:00 a 21:00 (permès)
    4. Fes clic a **D'acord** i aplica els canvis

    ### Part B – Verifica amb `net user`

    Al servidor, executa:
    ```cmd
    net user maria.puig /domain
    ```
    Confirma que les hores apareixen correctament al camp "Hores d'inici de sessió permeses".

    ### Part C – Prova de restricció (opcional)

    Si pots canviar l'hora del sistema del DC temporalment a un dissabte:

    1. Canvia l'hora del DC a dissabte 10:00
    2. Des d'un client, intenta iniciar sessió com a `maria.puig`
    3. Quin missatge d'error apareix?
    4. Restaura l'hora del DC correcta

    !!! warning "Canviar l'hora del DC afecta Kerberos (tolerància de 5 min). Restaura-la immediatament després de la prova."

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Active Directory logon hours restrict users ADUC"`
        - `"Active Directory logon hours PowerShell"`
        - `"Windows Server force logoff expired logon hours GPO"`
