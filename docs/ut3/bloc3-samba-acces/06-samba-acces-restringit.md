---
title: Samba – Accés restringit (valid users)
tags:
  - ut3
  - samba
---

# :material-shield-lock: Samba – Accés restringit (valid users)

!!! abstract "Concepte clau"
    `valid users` limita l'accés a un recurs Samba a una llista explícita d'usuaris. Combina **autenticació SMB** (contrasenya Samba) amb **permisos del sistema de fitxers Linux**. Ambdós nivells han de permetre l'accés perquè funcioni.

=== ":material-notebook-outline: Apunts"

    ## Configuració de l'accés restringit

    ```ini
    [privat]
        path = /srv/samba/privat
        browseable = yes
        writable = no
        read only = yes
        valid users = maria.puig pere.costa
        write list = maria.puig
        comment = Carpeta privada
    ```

    ### Directives clau

    | Directiva | Funció |
    |-----------|--------|
    | `valid users` | Llista d'usuaris autoritzats a connectar-se (separats per espais o comes) |
    | `write list` | Subconjunt de `valid users` que pot escriure (la resta, llegir) |
    | `read only` | `yes` per defecte; posar `no` per permetre escriptura a tots els `valid users` |
    | `writable` | Àlies de `read only = no` |

    ## Dos nivells de permisos

    Samba aplica **dos nivells independents** de control d'accés:

    ```mermaid
    graph TD
        C["Client connecta"] --> A["Nivell 1\nAutenticació Samba\n(smbpasswd / tdbsam)"]
        A -->|"OK"| B["Nivell 2\nPermisos del FS Linux\n(chmod / chown)"]
        A -->|"KO"| X1["❌ Accés denegat\n(contrasenya incorrecta)"]
        B -->|"OK"| OK["✅ Accés concedit"]
        B -->|"KO"| X2["❌ Accés denegat\n(permisos insuficients)"]
    ```

    **Regla pràctica**: si un usuari no pot accedir, comprova primer si existeix a Samba (`smbpasswd`) i després si té permisos al directori Linux (`ls -la`).

    ## Creació de l'usuari per a l'accés restringit

    Per a accés restringit, l'usuari ha d'existir al sistema Linux **i** a la base de dades Samba:

    ```bash
    # 1. Crea l'usuari Linux (si no existeix)
    sudo adduser maria.puig

    # 2. Crea el compte Samba (contrasenya Samba independent)
    sudo smbpasswd -a maria.puig

    # 3. Crea el directori i assigna propietari
    sudo mkdir -p /srv/samba/privat
    sudo chown maria.puig:maria.puig /srv/samba/privat
    sudo chmod 750 /srv/samba/privat
    ```

    ## Verificació

    Des del client Linux, identificant-se:

    ```bash
    # Connexió com a maria.puig (demanarà contrasenya Samba)
    smbclient //192.168.100.10/privat -U maria.puig

    # Connexió com a pere.costa (ha de poder llegir però no escriure)
    smbclient //192.168.100.10/privat -U pere.costa
    ```

    !!! warning "Error freqüent"
        Crear l'usuari Linux amb `adduser` però oblidar `smbpasswd -a`. Samba **no usa la contrasenya de Linux** per defecte; manté la seva pròpia base de dades (`tdbsam`). Sense `smbpasswd -a`, l'usuari existeix a Linux però no pot autenticar-se a Samba.

    ??? question "Auto-avaluació"
        **1.** Quina diferència hi ha entre `valid users` i `write list`?

        ??? success "Resposta"
            `valid users` especifica qui pot **connectar-se** al recurs (llegir o escriure, depenent d'altres opcions). `write list` especifica, dins dels `valid users`, qui té permís d'**escriptura**. Usuaris que estan a `valid users` però no a `write list` tenen accés de **lectura**.

        **2.** Per quin motiu no n'hi ha prou amb tenir `valid users` configurat si els permisos Linux de la carpeta no coincideixen?

        ??? success "Resposta"
            Perquè Samba aplica dos nivells de control d'accés: primer verifica l'autenticació (`valid users`), i després verifica els permisos del sistema de fitxers Linux. Si la carpeta té `chmod 700` i el propietari és `root`, cap usuari que no sigui root podrà escriure-hi, independentment del que diu `smb.conf`.

        **3.** Com es comprova que un usuari existeix a la base de dades Samba?

        ??? success "Resposta"
            `sudo pdbedit -L` llista tots els comptes Samba existents. Alternativament, `sudo smbpasswd -e usuari` mostra si l'usuari està actiu. Si l'usuari no apareix, cal crear-lo amb `sudo smbpasswd -a nomUsuari`.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.6 · Recurs amb accés restringit

    **Objectiu**: crear un recurs Samba accessible només per a usuaris específics amb contrasenyes.
    **Temps estimat**: 35 minuts
    **Prerequisit**: Activitat 3.5 completada

    ---

    ### Pas 1 – Crea els usuaris Linux i Samba

    ```bash
    sudo adduser maria.puig
    sudo adduser pere.costa
    sudo smbpasswd -a maria.puig
    sudo smbpasswd -a pere.costa
    ```

    ### Pas 2 – Crea el directori amb permisos

    ```bash
    sudo mkdir -p /srv/samba/privat
    sudo chown root:root /srv/samba/privat
    sudo chmod 770 /srv/samba/privat
    # Afegeix els usuaris al grup del directori si cal
    ```

    ### Pas 3 – Configura smb.conf

    ```ini
    [privat]
        path = /srv/samba/privat
        browseable = yes
        read only = yes
        valid users = maria.puig pere.costa
        write list = maria.puig
        comment = Carpeta privada
    ```

    ### Pas 4 – Valida, reinicia i prova

    ```bash
    testparm && sudo systemctl restart smbd
    ```

    Prova des del client com a `maria.puig` (ha de poder escriure) i com a `pere.costa` (ha de poder llegir però no escriure). Documenta el comportament de cada usuari.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Samba valid users write list configuration"`
        - `"Samba user authentication Linux tutorial"`
        - `"smbpasswd create Samba user Ubuntu"`
