---
title: Gestió d'arxius i permisos
tags:
  - ut2
  - linux
  - seguretat
  - permisos
---

# :material-file-cog: Gestió d'arxius i permisos

!!! abstract "Concepte clau"
    A Linux **tot és un fitxer** i cada fitxer té un **propietari**, un **grup** i un joc de **permisos** (`rwx`) per a tres subjectes: propietari, grup i altres. Dominar `chmod`, `chown` i els permisos octals és la base per administrar el sistema i, més endavant, els recursos compartits.

=== ":material-notebook-outline: Apunts"

    ## Navegació i inspecció

    ```bash
    pwd                # on soc
    ls -la /srv        # llista detallada (permisos, propietari, grup, mida)
    cd /srv/dades      # canvia de directori
    ```

    Sortida típica de `ls -la`:

    ```text
    drwxr-x--- 2 maria.puig professorat 4096 gen 10 09:12 informes
    -rw-r--r-- 1 maria.puig professorat  215 gen 10 09:12 nota.txt
    ```

    | Camp | Exemple | Significat |
    |------|---------|-----------|
    | Tipus + permisos | `drwxr-x---` | `d`=directori · després 3 grups de `rwx` |
    | Propietari | `maria.puig` | usuari amo del fitxer |
    | Grup | `professorat` | grup propietari |

    ## Els permisos: propietari / grup / altres

    ```text
    d   rwx   r-x   ---
    │    │     │     └── altres: cap permís
    │    │     └──────── grup: llegir + executar
    │    └────────────── propietari: llegir + escriure + executar
    └─────────────────── tipus (d = directori, - = fitxer)
    ```

    | Permís | Fitxer | Directori |
    |--------|--------|-----------|
    | `r` (4) | llegir contingut | llistar-ne el contingut |
    | `w` (2) | modificar | crear/esborrar fitxers dins |
    | `x` (1) | executar | entrar-hi (`cd`) |

    ## `chmod`: canviar permisos

    ```bash
    # Notació octal (suma r=4, w=2, x=1)
    chmod 640 nota.txt      # propietari rw- , grup r-- , altres ---
    chmod 750 informes      # propietari rwx , grup r-x , altres ---

    # Notació simbòlica
    chmod g+w nota.txt      # afegeix escriptura al grup
    chmod o-r nota.txt      # treu lectura a altres
    chmod -R 750 informes   # recursiu
    ```

    ## `chown` i `chgrp`: canviar propietari i grup

    ```bash
    sudo chown maria.puig nota.txt
    sudo chgrp professorat nota.txt
    sudo chown maria.puig:professorat nota.txt   # tots dos alhora
    sudo chown -R maria.puig:professorat /srv/dades
    ```

    !!! tip "Connexió amb UT1"
        A Windows (UT1) els permisos es gestionaven amb **NTFS** i `icacls`. A Linux l'equivalent és `chmod`/`chown` amb el model propietari/grup/altres. La gran diferència: NTFS permet ACL riques per a molts usuaris; el POSIX bàsic només distingeix tres subjectes (per a més granularitat calen les ACL POSIX, que veuràs més endavant).

    !!! warning "Error freqüent"
        Donar `chmod 777` a tot "perquè funcioni". És un forat de seguretat: qualsevol usuari pot modificar i esborrar els fitxers. Aplica sempre el **mínim privilegi** necessari.

    ??? question "Auto-avaluació"
        **1.** Què vol dir exactament `chmod 750` sobre un directori?

        ??? success "Resposta"
            Propietari `rwx` (7 = llegir+escriure+entrar), grup `r-x` (5 = llegir+entrar), altres `---` (0 = cap accés). En un directori, `x` permet entrar-hi (`cd`) i `r` llistar-ne el contingut.

        **2.** Per què `chmod 777` és una mala pràctica?

        ??? success "Resposta"
            Perquè dóna permisos totals (lectura, escriptura i execució) a **tothom**, inclosos usuaris no autoritzats. Trenca el principi de mínim privilegi i permet que qualsevol modifiqui o esborri els fitxers.

        **3.** Quina ordre canvia alhora el propietari i el grup d'un fitxer?

        ??? success "Resposta"
            `sudo chown usuari:grup fitxer`, p. ex. `sudo chown maria.puig:professorat nota.txt`.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.10 · Permisos d'un directori compartit

    **Objectiu**: aplicar permisos coherents a una estructura de carpetes.
    **Temps estimat**: 30 minuts · **Modalitat**: individual

    ---

    ### Tasca 1 – Estructura

    Crea `/srv/dades/informes` i un fitxer `nota.txt` a dins. Mostra'n l'estat amb `ls -la`.

    ### Tasca 2 – Propietat i permisos

    Fes que el directori sigui propietat de `maria.puig:professorat`, amb permisos `750`, i el fitxer `640`. Verifica-ho.

    ### Tasca 3 – Prova d'accés

    Amb un altre usuari que **no** sigui del grup `professorat`, intenta entrar al directori i llegir el fitxer. Documenta què passa i per què.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"linux file permissions chmod chown explained"`
        - `"permisos octals linux"`
        - `"linux rwx directory vs file"`
