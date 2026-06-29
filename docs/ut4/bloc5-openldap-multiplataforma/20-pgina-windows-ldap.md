---
title: pGina – autenticació Windows via OpenLDAP
tags:
  - ut4
  - ldap
  - windows
  - pgina
---

# :material-microsoft-windows: pGina – autenticació Windows via OpenLDAP

!!! abstract "Concepte clau"
    **pGina** és un plugin de login per a Windows que reemplaça l'autenticació local i la redirigeix a un servidor LDAP. Permet que usuaris definits a OpenLDAP iniciïn sessió a Windows **sense unir el PC a un domini AD**. Ideal per a entorns educatius amb servidors Linux LDAP.

=== ":material-notebook-outline: Apunts"

    ## Com funciona pGina

    ```mermaid
    graph LR
        WIN["Windows Login\n(usuari + password)"]
        WIN -->|"Intercepta"| PGINA["pGina\n(DLL de login)"]
        PGINA -->|"LDAP Bind\nport 389"| SLAPD["OpenLDAP\n(slapd)\n172.16.XXX.20"]
        SLAPD -->|"Autenticat / Rebutjat"| PGINA
        PGINA -->|"Crea sessió local"| SESS["Sessió Windows\n(compte local temporal)"]
    ```

    pGina no crea un compte de domini; crea un **compte local temporal** a Windows per a la sessió. Quan l'usuari tanca sessió, el compte pot eliminar-se automàticament.

    ## Instal·lació de pGina

    1. Descarrega pGina des del seu repositori oficial (GitHub: pgina/pgina)
    2. Executa l'instal·lador (`.msi`) com a administrador
    3. Reinicia Windows
    4. Obre la consola pGina: `Menú Inici → pGina → pGina Configuration`

    ## Configuració del plugin LDAP

    A la consola pGina:

    1. **Plugin Selection** → activa `LDAP Authentication`
    2. **LDAP Authentication** tab:

    | Camp | Valor |
    |------|-------|
    | LDAP Host(s) | `172.16.XXX.20` |
    | LDAP Port | `389` |
    | Search DN | `ou=usuaris,dc=cognom,dc=local` |
    | Search Filter | `(uid=%u)` — `%u` es substitueix pel nom d'usuari |
    | DN Pattern | `uid=%u,ou=usuaris,dc=cognom,dc=local` |
    | Allow Empty Password | No |

    3. **Gateway** tab: activa `Local Machine` → afegeix l'usuari al grup `Users` de Windows

    ## Test de la configuració

    A la consola pGina → **Simulate**:

    - Username: `director201`
    - Password: (contrasenya LDAP)
    - Resultat esperat: `Authentication success`

    Si falla:
    - `Can't contact LDAP server` → verifica la IP i port del servidor
    - `Invalid credentials` → el DN o la contrasenya és incorrecte
    - `No such object` → el Search DN no existeix al LDAP

    ## Primer login amb pGina

    1. Reinicia o tanca sessió a Windows
    2. A la pantalla de login: introdueix `director201` i la contrasenya LDAP
    3. pGina autentica contra OpenLDAP i crea una sessió local

    ```powershell
    # Dins de Windows, comprova l'usuari actiu
    whoami
    # Sortida: NOM-EQUIP\director201 (no AD-COGNOM\director201!)

    # Llista els comptes locals (pGina hauria creat el temporal)
    net user
    ```

    !!! warning "pGina no és un domain join"
        pGina crea una **sessió local temporal**, no una sessió de domini. Diferències importants: (1) l'usuari no pot accedir a recursos de xarxa del domini AD (GPOs, carpetes compartides autenticades), (2) `whoami` mostra `NOM-EQUIP\usuari` no `DOMINI\usuari`, (3) les GPOs d'AD no s'apliquen. pGina és útil per a autenticació centralitzada simple en entorns Linux-centric.

    !!! tip "pGina + Samba: accés a recursos compartits"
        Combinant pGina (login LDAP a Windows) amb Samba (recursos compartits Samba autenticats via LDAP), l'usuari pot accedir a carpetes compartides des de Windows: `\\LSRVXXX\lliure\`. La clau: Samba usa el mateix servidor LDAP que pGina, de manera que les credencials coincideixen.

    ??? question "Auto-avaluació"
        **1.** Quina diferència fonamental hi ha entre iniciar sessió a Windows amb pGina i fer un domain join a Active Directory?

        ??? success "Resposta"
            Amb **domain join**, Windows s'integra completament al domini: l'usuari rep una sessió de domini (`DOMINI\usuari`), s'apliquen GPOs, s'accedeix a recursos de xarxa autenticats. Amb **pGina**, s'autentica contra LDAP però Windows crea un compte **local temporal**: `whoami` mostra `NOM-EQUIP\usuari`, no hi ha GPOs de domini, i l'accés a recursos requereix credencials explícites. pGina és una solució de compromís per a entorns sense AD.

        **2.** Quin és el camp `DN Pattern` en la configuració LDAP de pGina i per a quin propòsit s'usa?

        ??? success "Resposta"
            El `DN Pattern` especifica com construir el **Distinguished Name** de l'usuari per fer el bind LDAP. `uid=%u,ou=usuaris,dc=cognom,dc=local` fa que pGina substitueixi `%u` pel nom d'usuari introduït al login. Per exemple, si l'usuari escriu `director201`, pGina farà `ldap_bind("uid=director201,ou=usuaris,dc=cognom,dc=local", password)`. Si el bind té èxit, l'usuari s'autentica.

        **3.** Com es fa una prova de l'autenticació LDAP a pGina sense tancar la sessió actual?

        ??? success "Resposta"
            Usant la funció **Simulate** de la consola pGina: obre la consola pGina, selecciona `Simulate`, introdueix el nom d'usuari i contrasenya LDAP, i pGina intenta l'autenticació i mostra el resultat (`Authentication success` o el missatge d'error específic). Això permet provar la configuració sense arriscar quedar-se sense accés al sistema si hi ha un error de configuració.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.20 · Instal·lació i configuració de pGina

    **Objectiu**: configurar pGina al client Windows per autenticar usuaris OpenLDAP.
    **Temps estimat**: 30 minuts
    **Prerequisit**: servidor OpenLDAP amb usuaris POSIX (Activitat 4.17)

    ---

    ### Pas 1 – Instal·la pGina

    Descarrega i instal·la pGina. Reinicia Windows.

    ### Pas 2 – Configura el plugin LDAP

    A la consola pGina → **Plugin Selection** → activa `LDAP Authentication`:

    - LDAP Host: `172.16.XXX.20`
    - LDAP Port: `389`
    - Search Filter: `(uid=%u)`
    - DN Pattern: `uid=%u,ou=usuaris,dc=cognom,dc=local`

    ### Pas 3 – Prova amb Simulate

    ```
    pGina Console → Simulate
    Username: director201
    Password: (contrasenya LDAP)
    ```

    Documenta el resultat: success o error? Si error, quin missatge?

    ### Pas 4 – Login real

    Tanca sessió a Windows. Inicia sessió com a `director201` (contrasenya LDAP).

    Comprova:
    ```powershell
    whoami
    net user director201
    ```

    ### Pas 5 – Accés a recursos Samba

    Obre l'explorador de Windows i accedeix a `\\172.16.XXX.20\lliure\`. Comprova que l'accés funciona amb les credencials LDAP.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"pGina LDAP authentication Windows tutorial"`
        - `"pGina OpenLDAP Windows login setup"`
        - `"pGina configuration LDAP plugin Windows"`
