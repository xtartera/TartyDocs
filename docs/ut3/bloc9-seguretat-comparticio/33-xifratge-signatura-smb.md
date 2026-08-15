---
title: Xifratge i signatura SMB
tags:
  - ut3
  - seguretat
  - samba
  - xifratge
---

# :material-lock-network: Xifratge i signatura SMB

!!! abstract "Concepte clau"
    Per defecte, moltes comparticions transmeten dades **sense xifrar**. Samba (SMB3) permet **signar** les connexions (integritat) i **xifrar-les** (confidencialitat), per protegir la informació que viatja per la xarxa.

=== ":material-notebook-outline: Apunts"

    ## El problema: dades en clar

    Sense protecció, algú que capturi el trànsit de la xarxa (p. ex. amb Wireshark) pot llegir el contingut dels fitxers transferits. En una xarxa d'institut compartida, això és un risc real.

    ## Signatura SMB (integritat)

    La **signatura** garanteix que els paquets no s'han manipulat pel camí (protecció contra atacs *man-in-the-middle*), però no xifra el contingut.

    ```ini
    [global]
       server signing = mandatory
    ```

    ## Xifratge SMB3 (confidencialitat)

    El **xifratge** (disponible a SMB3) fa que el contingut viatgi il·legible. Es pot exigir globalment o per recurs:

    ```ini
    [global]
       smb encrypt = required

    [confidencial]
       path = /srv/confidencial
       smb encrypt = required
       valid users = @direccio
    ```

    | Valor de `smb encrypt` | Significat |
    |------------------------|-----------|
    | `off` | mai xifra |
    | `desired` | xifra si el client ho admet |
    | `required` | **obliga** a xifrar (rebutja clients sense suport) |

    !!! tip "Compromís rendiment/seguretat"
        Xifrar té un cost de CPU. Per a recursos amb dades sensibles (`direccio`, expedients) val la pena `required`; per a un recurs públic de només lectura, potser no cal. Aplica-ho on aporta valor.

    !!! warning "Compatibilitat de clients"
        `smb encrypt = required` pot deixar fora clients molt antics que no suporten SMB3. Comprova que els teus clients (Windows 10/11, Linux recents) el suporten abans d'exigir-lo a tot arreu.

    ## Verificació

    ```bash
    # Estat de les connexions actives (mostra xifratge/signatura)
    sudo smbstatus
    ```

    ??? question "Auto-avaluació"
        **1.** Quina diferència hi ha entre signar i xifrar una connexió SMB?

        ??? success "Resposta"
            La **signatura** garanteix la **integritat** (els paquets no s'han manipulat) però no amaga el contingut; el **xifratge** garanteix la **confidencialitat** (el contingut viatja il·legible per a qui capturi el trànsit).

        **2.** Què fa `smb encrypt = required` i quin inconvenient té?

        ??? success "Resposta"
            Obliga a xifrar totes les connexions del recurs (o servidor), rebutjant clients que no ho suporten. L'inconvenient és el cost de CPU i possibles problemes amb clients antics sense SMB3.

        **3.** Amb quina ordre pots comprovar l'estat de xifratge de les connexions Samba?

        ??? success "Resposta"
            `sudo smbstatus`, que mostra les sessions i connexions actives, incloent-hi si estan signades/xifrades.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 9.32 · Xifra un recurs sensible

    **Objectiu**: protegir la transmissió d'un recurs amb dades reservades.
    **Temps estimat**: 35 minuts · **Modalitat**: individual

    ---

    ### Tasca 1 – Recurs confidencial

    Crea un recurs `[confidencial]` per al grup `direccio` amb `smb encrypt = required`.

    ### Tasca 2 – Verificació

    Connecta't des d'un client i comprova amb `sudo smbstatus` que la connexió està xifrada.

    ### Tasca 3 – Comparació (opcional)

    Amb Wireshark, compara el trànsit d'un recurs sense xifrar i el del recurs xifrat. Documenta la diferència.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"samba smb encryption smb3 configuration"`
        - `"smb signing vs encryption"`
        - `"smbstatus samba connections"`
