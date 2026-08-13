---
title: Default Domain Policy
tags:
  - GPO
  - seguretat
  - domini
  - UT1
---

# :material-domain: Default Domain Policy

!!! abstract "Concepte clau"
    La **Default Domain Policy** és la GPO preinstal·lada que s'aplica a tots els usuaris i equips del domini. Conté les **polítiques de contrasenya i de bloqueig de comptes** — les úniques configuracions que Windows respecta des del nivell de domini per a l'autenticació. No s'hauria de modificar per a res més.

=== ":material-notebook-outline: Apunts"

    ## Quines configuracions conté per defecte?

    La Default Domain Policy conté exclusivament les polítiques d'autenticació obligatòries del domini:

    ```
    Configuració de l'ordinador
    └── Directrius
        └── Configuració de Windows
            └── Configuració de seguretat
                └── Polítiques de compte
                    ├── Política de contrasenyes    ← (C27)
                    ├── Política de bloqueig de comptes  ← (C27)
                    └── Política Kerberos
    ```

    ### Política de contrasenyes (valors per defecte)

    | Paràmetre | Valor per defecte de Windows |
    |-----------|------------------------------|
    | Historial de contrasenyes | 24 contrasenyes |
    | Caducitat màxima | 42 dies |
    | Caducitat mínima | 1 dia |
    | Longitud mínima | 7 caràcters |
    | Complexitat | Activada |
    | Xifrat reversible | Desactivat |

    ### Política de bloqueig (valors per defecte)

    | Paràmetre | Valor per defecte de Windows |
    |-----------|------------------------------|
    | Llindar de bloqueig | 0 (desactivat) |
    | Durada del bloqueig | No definit |
    | Restabliment del comptador | No definit |

    !!! danger "El valor per defecte de bloqueig és **0 intents** (desactivat). Sense configurar-lo, un atacant pot intentar contrasenyes indefinidament. Configura sempre un llindar de 3–5 intents."

    ### Política Kerberos (valors per defecte)

    | Paràmetre | Valor | Significat |
    |-----------|-------|-----------|
    | Màxima tolerància de rellotge | **5 minuts** | El client i el DC no poden tenir més de 5 min de diferència horària |
    | Durada del tiquet de servei | 600 minuts | 10 hores |
    | Durada màxima del tiquet d'usuari | 10 hores | Temps de vida del TGT |

    !!! warning "La tolerància de rellotge de **5 minuts** és crítica. Si el rellotge del client i el DC difereixen en més de 5 minuts, Kerberos rebutja tots els intents d'autenticació i l'usuari no pot iniciar sessió. En VMs, sincronitza sempre el rellotge (W32tm o NTP)."

    ## Bones pràctiques de gestió

    | Recomanació | Raó |
    |-------------|-----|
    | No afegeixis configuracions noves a la DDP | Manté-la neta per a les polítiques d'autenticació |
    | Crea GPOs separades per a la resta de configuracions | Facilita el diagnòstic i revertir canvis |
    | No suprimeixis ni desvinculis la DDP | Pot trencar l'autenticació del domini |
    | Documenta qualsevol canvi a la DDP | Els canvis afecten tots els usuaris del domini |

    ## Editar la Default Domain Policy

    ```powershell
    # Veure la Default Domain Policy via PowerShell
    Get-GPO -Name "Default Domain Policy" | Format-List

    # Obrir l'editor directament (equivalent a GPMC → Edita)
    # (Executa al servidor com a Administrador)
    gpmc.msc
    ```

    Via GUI (GPMC):
    1. Expandeix `cirvianum.local`
    2. Clic dret a **Default Domain Policy → Edita**
    3. Navega a `Configuració de l'ordinador → Directrius → Configuració de Windows → Configuració de seguretat → Polítiques de compte`

    ## Verificació de la política aplicada

    ```powershell
    # Veure la política de contrasenya i bloqueig actuals
    Get-ADDefaultDomainPasswordPolicy

    # Forçar l'aplicació i verificar
    gpupdate /force
    gpresult /r /scope computer
    ```

    ```cmd
    :: Verificació clàssica
    net accounts /domain
    ```

    Sortida de `net accounts /domain`:
    ```text
    Forçar desconnexió del servidor en...   Mai
    Temps mínim de contrasenya (dies):      1
    Temps màxim de contrasenya (dies):      90
    Longitud mínima de contrasenya:         8
    Historial de contrasenyes:              3
    Llindar de bloqueig:                    5
    Durada del bloqueig (minuts):           15
    Finestra d'observació del bloqueig:     15
    Rol del servidor:                       PRIMARY
    ```

    ??? question "Auto-avaluació"

        **1.** Per quin motiu no es recomana afegir configuracions d'escriptori o de restriccions d'usuari a la Default Domain Policy?

        ??? success "Resposta"
            La Default Domain Policy s'aplica a **tots** els usuaris i equips del domini sense excepció. Afegir-hi configuracions d'escriptori o restriccions afectaria també els administradors, els servidors i tots els equips. A més, barrejar polítiques d'autenticació (que han d'estar al domini) amb restriccions d'usuari (que han d'estar a les UOs) fa el diagnòstic molt més difícil. La pràctica correcta és crear GPOs dedicades i vincular-les a les UOs concretes.

        **2.** El rellotge d'un client Windows 11 s'ha desincronitzat i té 8 minuts de diferència amb el DC. Quin problema provocarà i com el soluciones?

        ??? success "Resposta"
            Kerberos rebutjarà tots els intents d'autenticació del client, que no podrà iniciar sessió al domini. L'error típic és "El temps de la sol·licitud d'autenticació no s'ajusta al temps del sistema del servidor". Solució: sincronitza l'hora del client amb el DC: `w32tm /resync /force` o configura el servidor NTP del client a la IP del DC: `w32tm /config /manualpeerlist:10.0.2.10 /syncfromflags:manual /update`.

        **3.** `net accounts /domain` mostra "Llindar de bloqueig: 0". Quin és el risc i com el configures correctament?

        ??? success "Resposta"
            Un llindar de 0 significa que el **bloqueig de comptes està desactivat**: un atacant pot intentar contrasenyes indefinidament sense que el compte es bloquegi (atac de força bruta). Per configurar-lo: a la Default Domain Policy, `Polítiques de compte → Política de bloqueig → Llindar de bloqueig del compte: 5`. Afegeix també una durada de 15 minuts i un restabliment de 15 minuts.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 8.2 · Configura la Default Domain Policy

    **Objectiu**: revisar i configurar els paràmetres d'autenticació del domini.

    **Temps estimat**: 20 minuts

    **Prerequisit**: GPMC accessible, sessió com a Administrador

    ---

    ### Part A – Revisa els valors actuals

    ```cmd
    net accounts /domain
    ```

    ```powershell
    Get-ADDefaultDomainPasswordPolicy
    ```

    Documenta els valors actuals de cada paràmetre a una taula del dossier.

    ### Part B – Aplica la política del Projecte 4

    Via GPMC, edita la **Default Domain Policy** i configura:

    | Paràmetre | Valor |
    |-----------|-------|
    | Longitud mínima | 8 |
    | Complexitat | Activada |
    | Caducitat màxima | 90 dies |
    | Historial | 3 contrasenyes |
    | Llindar de bloqueig | 5 intents |
    | Durada del bloqueig | 15 minuts |
    | Restabliment del comptador | 15 minuts |

    ### Part C – Verifica

    ```cmd
    gpupdate /force
    net accounts /domain
    ```

    Els valors coincideixen amb el que has configurat?

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Default Domain Policy Windows Server 2022 configure"`
        - `"Kerberos clock skew 5 minutes Active Directory fix"`
        - `"net accounts domain password policy verify"`
        - `"w32tm sync time Windows Server NTP"`
