---
title: Usuaris i grups locals
tags:
  - ut2
  - linux
  - usuaris
  - seguretat
---

# :material-account-multiple: Usuaris i grups locals

!!! abstract "Concepte clau"
    Abans de centralitzar els usuaris amb LDAP, cal saber gestionar-los **localment** a cada màquina Linux: crear-los, posar-los en grups, assignar contrasenyes i entendre els fitxers `/etc/passwd`, `/etc/shadow` i `/etc/group`.

=== ":material-notebook-outline: Apunts"

    ## Tipus d'usuari

    | Tipus | UID | Característica |
    |-------|-----|---------------|
    | **root** | 0 | Superusuari, privilegis totals |
    | **Sistema** | 1–999 | Serveis (www-data, sshd...), sense login |
    | **Normals** | ≥ 1000 | Persones, amb `/home` propi |

    ## Crear i eliminar usuaris

    ```bash
    sudo adduser maria.puig            # crea usuari + home + grup propi (interactiu)
    sudo deluser --remove-home pere.costa   # elimina usuari i la seva home
    ```

    ## Grups

    ```bash
    sudo addgroup professorat
    sudo usermod -aG professorat maria.puig   # afegeix al grup (secundari)
    sudo delgroup professorat
    groups maria.puig                          # grups de l'usuari
    id maria.puig                              # UID, GID i grups
    ```

    !!! warning "El paràmetre `-a` és crític"
        `usermod -aG grup usuari` **afegeix** un grup secundari. Si oblides la `-a` (`usermod -G grup usuari`), **substituïs** tots els grups secundaris de l'usuari pel que indiques, i el pots deixar sense els que tenia.

    ## Contrasenyes i caducitat

    ```bash
    sudo passwd maria.puig             # assigna/canvia contrasenya
    sudo usermod -L maria.puig         # bloqueja el compte
    sudo usermod -U maria.puig         # el desbloqueja
    sudo chage -M 90 maria.puig        # contrasenya caduca als 90 dies
    ```

    ## Els fitxers clau

    | Fitxer | Contingut |
    |--------|-----------|
    | `/etc/passwd` | Usuaris: nom, UID, GID, home, shell (llegible per tothom) |
    | `/etc/shadow` | Contrasenyes **xifrades** (només root) |
    | `/etc/group` | Grups i els seus membres |
    | `/etc/sudoers` | Qui pot fer `sudo` (editar amb `visudo`) |

    Exemple de línia de `/etc/passwd`:

    ```text
    maria.puig:x:1001:1001:Maria Puig:/home/maria.puig:/bin/bash
    ```

    !!! tip "Connexió amb UT1 i cap a LDAP"
        A UT1 gestionaves usuaris **centralitzats** a Active Directory. Aquí els gestiones **localment**, màquina per màquina. El problema d'aquest model és evident: en un aula de 20 equips, hauries de crear cada usuari 20 vegades. Això és justament el que resoldrà **LDAP** (blocs següents): un directori central d'usuaris.

    !!! danger "Edita `/etc/sudoers` només amb `visudo`"
        `visudo` valida la sintaxi abans de desar. Un error a `/etc/sudoers` editat a mà pot deixar-te **sense accés a `sudo`** a tot el sistema.

    ??? question "Auto-avaluació"
        **1.** Quina diferència hi ha entre `usermod -aG` i `usermod -G`?

        ??? success "Resposta"
            `usermod -aG grup usuari` **afegeix** l'usuari a un grup secundari mantenint els que ja tenia. `usermod -G grup usuari` (sense `-a`) **reemplaça** tota la llista de grups secundaris, de manera que l'usuari perd els altres grups.

        **2.** Per què `/etc/shadow` només el pot llegir root?

        ??? success "Resposta"
            Perquè conté les contrasenyes **xifrades**. Tot i estar xifrades, exposar-les facilitaria atacs de força bruta offline; per això té permisos molt restrictius, a diferència de `/etc/passwd`, que és llegible per tothom.

        **3.** Quin inconvenient té gestionar els usuaris localment en un parc de molts equips?

        ??? success "Resposta"
            Cal crear i mantenir cada usuari a **cada** màquina per separat, cosa inviable i inconsistent en un parc gran. La solució és centralitzar-los en un directori (LDAP/AD).

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.11 · Alta d'usuaris i grups

    **Objectiu**: crear l'estructura local d'usuaris i grups d'un departament.
    **Temps estimat**: 30 minuts · **Modalitat**: individual

    ---

    ### Tasca 1 – Usuaris

    Crea `maria.puig`, `pere.costa` i `anna.valls` amb `adduser`. Comprova'ls a `/etc/passwd`.

    ### Tasca 2 – Grups

    Crea el grup `professorat` i afegeix-hi `maria.puig` i `pere.costa` amb `usermod -aG`. Verifica amb `id` i `groups`.

    ### Tasca 3 – Seguretat

    Estableix caducitat de 90 dies a `maria.puig` amb `chage` i bloqueja temporalment `pere.costa`. Documenta les ordres i el resultat.

    ### Tasca 4 – Reflexió

    Explica per què aquest sistema no escala bé en un institut amb 300 alumnes i com ho resoldrà LDAP.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"linux user management adduser usermod"`
        - `"etc passwd shadow group explained"`
        - `"linux sudoers visudo tutorial"`
