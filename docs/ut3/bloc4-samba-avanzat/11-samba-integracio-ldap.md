---
title: Samba – Integració amb LDAP
tags:
  - ut3
  - samba
  - ldap
---

# :material-account-key: Samba – Integració amb LDAP

!!! abstract "Concepte clau"
    Samba pot usar **OpenLDAP com a backend d'autenticació** (`passdb backend = ldapsam`), eliminant la base de dades `tdbsam` local. Això unifica la gestió d'identitats: un sol directori LDAP per a Linux (SSSD), Samba i potencialment CUPS.

=== ":material-notebook-outline: Apunts"

    ## Motivació: per quin motiu integrar Samba amb LDAP?

    Sense integració LDAP:
    - Cada servidor Samba manté la seva pròpia base de dades (`tdbsam`)
    - Cal sincronitzar usuaris manualment entre servidors
    - Si un usuari canvia la contrasenya LDAP, la contrasenya Samba **no s'actualitza automàticament**

    Amb integració LDAP:
    - Un sol directori (OpenLDAP) gestiona tots els comptes
    - Modificar un usuari al LDAP afecta Samba i Linux alhora
    - Escalable per a entorns amb molts servidors Samba

    ## Prerequisits

    - OpenLDAP funcional amb usuaris POSIX (UT2 Blocs 3–4)
    - Extensió `sambaSamAccount` al schema LDAP
    - Paquet `samba` i `libpam-smbpass` o `smbldap-tools`

    ### Instal·lació de l'schema Samba per a LDAP

    ```bash
    # Instal·la smbldap-tools
    sudo apt install smbldap-tools -y

    # Afegeix l'schema Samba a OpenLDAP
    sudo ldapadd -Y EXTERNAL -H ldapi:/// \
      -f /usr/share/doc/smbldap-tools/examples/samba.schema
    ```

    ## Configuració de smb.conf per a LDAP

    ```ini
    [global]
        workgroup = LAFITA
        security = user

        # Backend LDAP en lloc de tdbsam
        passdb backend = ldapsam:ldap://localhost

        # Connexió al directori LDAP
        ldap suffix = dc=lafita,dc=local
        ldap user suffix = ou=usuaris
        ldap group suffix = ou=grups
        ldap machine suffix = ou=maquines
        ldap admin dn = cn=admin,dc=lafita,dc=local

        # SSL/TLS (si s'usa)
        ldap ssl = no
    ```

    Guarda la contrasenya de l'admin LDAP per a Samba:

    ```bash
    sudo smbpasswd -W
    # (introdueix la contrasenya de l'admin LDAP)
    ```

    ## Creació d'usuaris Samba a LDAP

    Amb `smbldap-tools`, els usuaris es creen directament al LDAP amb els atributs Samba:

    ```bash
    # Crea un usuari LDAP amb atributs Samba
    sudo smbldap-useradd -a -m maria.puig

    # Assigna contrasenya Samba a l'usuari LDAP
    sudo smbldap-passwd maria.puig
    ```

    Alternativament, via `smbpasswd` si LDAP ja té l'usuari POSIX:

    ```bash
    sudo smbpasswd -a maria.puig
    # Samba escriu els atributs sambaSamAccount al LDAP
    ```

    ## Atributs Samba al LDAP

    Un usuari LDAP amb integració Samba inclou l'objectClass `sambaSamAccount` i atributs com:

    ```ldif
    objectClass: sambaSamAccount
    sambaSID: S-1-5-21-...
    sambaLMPassword: [hash LM]
    sambaNTPassword: [hash NT]
    sambaAcctFlags: [U          ]
    ```

    ## Diagrama d'arquitectura

    ```mermaid
    graph TD
        CL["Clients Windows/Linux"] -->|SMB · port 445| SMBD["smbd"]
        CL2["Clients Linux"] -->|SSH / Login| PAM["PAM + SSSD"]
        SMBD -->|"passdb backend = ldapsam"| LDAP["OpenLDAP\n(dc=lafita,dc=local)"]
        PAM -->|nsswitch + SSSD| LDAP
        LDAP --> OU_U["ou=usuaris\n(posixAccount + sambaSamAccount)"]
        LDAP --> OU_G["ou=grups\n(posixGroup)"]
    ```

    Amb aquesta arquitectura, un sol directori LDAP gestiona els comptes per a:
    - Login Linux local (via SSSD + PAM)
    - Autenticació Samba (via ldapsam)
    - Potencialment CUPS, NFS (via UID/GID LDAP)

    !!! tip "Connexió amb UT2"
        A la UT2 vam configurar OpenLDAP amb usuaris POSIX i SSSD per al login Linux. La integració Samba-LDAP **reutilitza el mateix directori**: afegim l'objectClass `sambaSamAccount` als usuaris existents. No cal crear nous usuaris; cal **ampliar** els existents.

    !!! warning "Error freqüent"
        Oblidar fer `sudo smbpasswd -W` per desar la contrasenya de l'admin LDAP al secret store de Samba. Sense aquest pas, `smbd` no pot connectar al LDAP i tots els intents d'autenticació fallaran amb "Failed to find entry for user" als logs.

    ??? question "Auto-avaluació"
        **1.** Quina directiva de `smb.conf` canvia el backend d'autenticació de `tdbsam` a LDAP?

        ??? success "Resposta"
            `passdb backend = ldapsam:ldap://localhost`. Canviar de `tdbsam` (base de dades local) a `ldapsam` (OpenLDAP) fa que Samba consulti el directori LDAP per autenticar els usuaris en lloc de la seva pròpia base de dades.

        **2.** Quina objectClass s'afegeix als usuaris LDAP per a la integració Samba?

        ??? success "Resposta"
            `sambaSamAccount`. Aquesta objectClass afegeix atributs específics de Samba a un compte LDAP existent: `sambaSID` (identificador de seguretat), `sambaLMPassword` i `sambaNTPassword` (hashes de contrasenya en format Windows), i `sambaAcctFlags` (estat del compte).

        **3.** Quina és la principal avantatge d'integrar Samba amb LDAP en un entorn amb múltiples servidors?

        ??? success "Resposta"
            La **gestió centralitzada d'identitats**: un sol directori LDAP manté tots els comptes d'usuari. Quan un usuari canvia la contrasenya al LDAP, el canvi afecta immediatament tots els servidors Samba (i Linux via SSSD). Sense LDAP, caldria actualitzar la contrasenya a cada servidor Samba individualment.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.11 · Samba amb backend LDAP

    **Objectiu**: configurar Samba per autenticar usuaris via OpenLDAP.
    **Temps estimat**: 45 minuts
    **Prerequisit**: OpenLDAP funcional amb usuaris POSIX (UT2 Projectes 22–23)

    ---

    ### Pas 1 – Instal·la els paquets necessaris

    ```bash
    sudo apt install smbldap-tools -y
    ```

    ### Pas 2 – Modifica smb.conf

    Canvia a la secció `[global]`:

    ```ini
    passdb backend = ldapsam:ldap://localhost
    ldap suffix = dc=lafita,dc=local
    ldap user suffix = ou=usuaris
    ldap group suffix = ou=grups
    ldap admin dn = cn=admin,dc=lafita,dc=local
    ldap ssl = no
    ```

    ### Pas 3 – Desa la contrasenya admin LDAP

    ```bash
    sudo smbpasswd -W
    ```

    ### Pas 4 – Reinicia i verifica

    ```bash
    sudo systemctl restart smbd
    sudo smbclient -L //localhost -U maria.puig
    ```

    Si l'usuari `maria.puig` existeix al LDAP amb `sambaSamAccount`, ha de poder autenticar-se.

    ### Pas 5 – Comprova els logs si hi ha error

    ```bash
    sudo tail -50 /var/log/samba/log.smbd
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Samba LDAP integration passdb backend ldapsam"`
        - `"smbldap-tools setup Ubuntu OpenLDAP"`
        - `"Samba OpenLDAP authentication Ubuntu tutorial"`
