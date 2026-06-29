---
title: smbpasswd – Gestió d'usuaris Samba
tags:
  - ut3
  - samba
---

# :material-account-key: smbpasswd – Gestió d'usuaris Samba

!!! abstract "Concepte clau"
    Samba manté una base de dades de contrasenyes **independent** del sistema Linux (`/var/lib/samba/private/passdb.tdb`). `smbpasswd` gestiona aquesta base de dades: crear, modificar, desactivar i eliminar comptes Samba.

=== ":material-notebook-outline: Apunts"

    ## Per quin motiu Samba té la seva pròpia base de dades?

    Linux desa les contrasenyes en format `SHA-512` a `/etc/shadow`. El protocol SMB necessita un hash diferent (LM hash / NT hash) per a la seva autenticació. Per aquest motiu, Samba manté una base de dades pròpia que desa les contrasenyes en el format que entén el protocol SMB.

    !!! warning "Confusió habitual"
        Un usuari pot tenir contrasenya de Linux i contrasenya de Samba **completament independents**. Si canvies la contrasenya de Linux (`passwd maria.puig`), la contrasenya de Samba **no canvia**. Cal actualitzar-les per separat o usar integració LDAP (Bloc 4).

    ## Ordres principals de smbpasswd

    | Ordre | Funció |
    |-------|--------|
    | `sudo smbpasswd -a usuari` | **Afegeix** un compte Samba (l'usuari ha d'existir a Linux) |
    | `sudo smbpasswd -x usuari` | **Elimina** el compte Samba (no elimina l'usuari Linux) |
    | `sudo smbpasswd -d usuari` | **Desactiva** temporalment el compte Samba |
    | `sudo smbpasswd -e usuari` | **Reactiva** un compte Samba desactivat |
    | `sudo smbpasswd usuari` | **Canvia** la contrasenya Samba d'un usuari (com a root) |
    | `smbpasswd` | Canvia la teva pròpia contrasenya Samba (com a usuari normal) |

    ## Flux de creació d'un usuari Samba

    ```bash
    # 1. L'usuari ha d'existir primer al sistema Linux
    sudo adduser maria.puig

    # 2. Crea el compte Samba (demana contrasenya dues vegades)
    sudo smbpasswd -a maria.puig

    # 3. Verifica que existeix a la base de dades Samba
    sudo pdbedit -L
    ```

    Sortida de `pdbedit -L`:

    ```text
    maria.puig:1001:Maria Puig
    pere.costa:1002:Pere Costa
    ```

    ## pdbedit — gestió avançada

    `pdbedit` és una eina més completa per gestionar la base de dades Samba:

    ```bash
    # Llista tots els comptes Samba
    sudo pdbedit -L

    # Informació detallada d'un usuari
    sudo pdbedit -L -v maria.puig

    # Elimina un compte Samba
    sudo pdbedit -x maria.puig
    ```

    ## Exemple complet: tres usuaris amb rols diferents

    ```bash
    # Crea usuaris Linux
    sudo adduser maria.puig
    sudo adduser pere.costa
    sudo adduser anna.valls

    # Crea comptes Samba
    sudo smbpasswd -a maria.puig   # administradora
    sudo smbpasswd -a pere.costa   # lectura
    sudo smbpasswd -a anna.valls   # lectura

    # Verifica
    sudo pdbedit -L
    ```

    A `smb.conf`:

    ```ini
    [documents]
        path = /srv/samba/documents
        valid users = maria.puig pere.costa anna.valls
        write list = maria.puig
        read only = yes
    ```

    ??? question "Auto-avaluació"
        **1.** Quina ordre crea un compte Samba per a l'usuari `pere.costa` que ja existeix a Linux?

        ??? success "Resposta"
            `sudo smbpasswd -a pere.costa`. L'opció `-a` afegeix ("add") un compte a la base de dades Samba. Si l'usuari no existeix a Linux, l'ordre falla amb "Failed to find entry for user".

        **2.** Com pots desactivar temporalment el compte Samba d'un usuari sense eliminar-lo?

        ??? success "Resposta"
            `sudo smbpasswd -d nomUsuari` desactiva el compte (disabled). L'usuari continua existint a la base de dades però no pot autenticar-se. Per reactivar: `sudo smbpasswd -e nomUsuari`.

        **3.** Quina diferència hi ha entre `smbpasswd` i `pdbedit`?

        ??? success "Resposta"
            `smbpasswd` és l'eina tradicional per gestionar contrasenyes i estat de comptes Samba (afegir, eliminar, desactivar, canviar contrasenya). `pdbedit` és una eina més moderna i completa que permet llistar usuaris amb detalls, exportar/importar la base de dades i modificar atributs avançats dels comptes.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.8 · Gestió d'usuaris Samba amb smbpasswd

    **Objectiu**: crear, verificar, desactivar i eliminar comptes Samba.
    **Temps estimat**: 25 minuts

    ---

    ### Pas 1 – Crea usuaris Linux i Samba

    ```bash
    sudo adduser maria.puig
    sudo adduser pere.costa
    sudo smbpasswd -a maria.puig
    sudo smbpasswd -a pere.costa
    sudo pdbedit -L
    ```

    ### Pas 2 – Prova l'autenticació

    Des del client:

    ```bash
    smbclient //192.168.100.10/privat -U maria.puig
    # Ha de demanar contrasenya i permetre l'accés
    ```

    ### Pas 3 – Desactiva un compte

    ```bash
    sudo smbpasswd -d pere.costa
    ```

    Torna a provar la connexió com a `pere.costa`: ha de donar error d'autenticació.

    ### Pas 4 – Reactiva el compte

    ```bash
    sudo smbpasswd -e pere.costa
    ```

    Verifica que ara torna a funcionar.

    ### Pas 5 – Canvia la contrasenya Samba

    ```bash
    sudo smbpasswd maria.puig
    ```

    Verifica que la nova contrasenya funciona des del client.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"smbpasswd create Samba user Linux"`
        - `"pdbedit list Samba users"`
        - `"Samba user management Ubuntu tutorial"`
