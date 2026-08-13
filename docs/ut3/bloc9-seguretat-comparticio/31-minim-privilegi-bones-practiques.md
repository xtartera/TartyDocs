---
title: Principi de mínim privilegi i bones pràctiques
tags:
  - ut3
  - seguretat
  - samba
  - nfs
---

# :material-shield-lock: Principi de mínim privilegi i bones pràctiques

!!! abstract "Concepte clau"
    Compartir recursos amb seguretat vol dir donar a cada usuari **només** els permisos que necessita, i **cap** més. El **principi de mínim privilegi** és la regla d'or de tota compartició (Samba, NFS o CUPS).

=== ":material-notebook-outline: Apunts"

    ## Què és el mínim privilegi

    Cada usuari o grup ha de tenir **exactament** els permisos imprescindibles per fer la seva feina. Ni més (risc de seguretat), ni menys (no pot treballar).

    ```mermaid
    graph TD
        R["Recurs compartit"]
        R --> P["professorat\nlectura + escriptura"]
        R --> A["alumnat\nnomés lectura"]
        R --> X["resta\ncap accés"]
    ```

    ## Males pràctiques habituals (i la seva correcció)

    | Mala pràctica | Risc | Correcció |
    |---------------|------|-----------|
    | `guest ok = yes` en recursos sensibles | qualsevol hi entra sense autenticar | `valid users = @grup` |
    | `chmod 777` a la carpeta compartida | tothom pot esborrar-ho tot | permisos ajustats + ACL |
    | `no_root_squash` a NFS | el root del client és root al servidor | `root_squash` (per defecte) |
    | Contrasenya a `/etc/fstab` en clar | qualsevol la llegeix | fitxer de credencials `600` |
    | Exportar a `*` (tota la xarxa) | accés des de qualsevol IP | restringir per subxarxa/IP |

    ## Checklist de bones pràctiques

    - **Autenticació**: evita convidats en recursos amb dades reals.
    - **Grups, no usuaris solts**: assigna permisos a grups (`@professorat`) per mantenir-ho.
    - **Restricció per xarxa**: limita l'accés a la subxarxa o IPs conegudes.
    - **Mínim exposat**: comparteix només la carpeta necessària, no `/` ni `/home` sencer.
    - **Documenta**: qui té accés a què i per què.

    !!! tip "Connexió amb UT1"
        A Windows (UT1) el mínim privilegi es concretava amb els **permisos NTFS** i els grups d'AD. A Linux és el mateix principi amb `valid users`, permisos POSIX i ACL. La idea de seguretat és universal, canvien les eines.

    ??? question "Auto-avaluació"
        **1.** Enuncia el principi de mínim privilegi aplicat a un recurs compartit.

        ??? success "Resposta"
            Cada usuari o grup ha de rebre únicament els permisos estrictament necessaris per a la seva tasca, i cap més. Així es limita el dany possible davant d'un error o una intrusió.

        **2.** Per què és millor assignar permisos a grups que a usuaris individuals?

        ??? success "Resposta"
            Perquè simplifica el manteniment i redueix errors: quan un usuari canvia de rol, només cal modificar la seva pertinença al grup, sense retocar els permisos de cada recurs un per un.

        **3.** Cita dues males pràctiques freqüents i la seva correcció.

        ??? success "Resposta"
            Per exemple: `guest ok = yes` en recursos sensibles → usar `valid users = @grup`; i `no_root_squash` a NFS → mantenir `root_squash`. També `chmod 777` → permisos ajustats amb ACL.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 9.31 · Audita els teus recursos

    **Objectiu**: revisar els recursos creats a la UT3 amb ulls de seguretat.
    **Temps estimat**: 30 minuts · **Modalitat**: individual

    ---

    ### Tasca 1 – Inventari

    Fes una taula amb tots els recursos que has compartit (Samba/NFS/CUPS): nom, qui hi accedeix i amb quins permisos.

    ### Tasca 2 – Detecció

    Per a cada recurs, identifica si hi ha alguna mala pràctica de la llista i proposa la correcció.

    ### Tasca 3 – Aplicació

    Corregeix almenys dos recursos aplicant el mínim privilegi i documenta el canvi.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"principle of least privilege explained"`
        - `"samba share security best practices"`
        - `"nfs security root_squash"`
