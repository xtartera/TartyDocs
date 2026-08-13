---
title: Administració remota amb RSAT
tags:
  - ut4
  - samba
  - active-directory
  - rsat
  - windows
---

# :material-microsoft-windows: Administració remota amb RSAT

!!! abstract "Concepte clau"
    Un domini Samba AD s'administra amb les **mateixes eines gràfiques de Windows** (RSAT: *Usuaris i equips d'Active Directory*, *Gestió de directives de grup*) que un AD real, perquè és compatible amb el protocol.

=== ":material-notebook-outline: Apunts"

    ## Què és RSAT

    **RSAT** (Remote Server Administration Tools) és el conjunt d'eines de Microsoft per administrar un domini des d'un client Windows sense estar al servidor. Com que Samba AD és compatible amb AD, RSAT funciona igual que amb un DC de Windows.

    ```mermaid
    graph LR
        ADM["Windows 11\n+ RSAT"] -->|"LDAP/Kerberos"| DC["Samba AD DC\n(dc1.lafita.local)"]
        ADM -.->|"Usuaris i equips d'AD"| DC
        ADM -.->|"Gestió de GPO"| DC
    ```

    ## Instal·lació de RSAT (Windows 11)

    A *Configuració → Aplicacions → Característiques opcionals → Afegeix* i instal·la:

    - **RSAT: AD DS and AD LDS Tools** (Usuaris i equips d'AD)
    - **RSAT: Group Policy Management Tools** (GPO)

    !!! tip "Requisit previ"
        El client Windows ha d'estar **unit al domini** `lafita.local` i iniciar sessió amb un compte amb privilegis (p. ex. `LAFITA\administrator`).

    ## Tasques habituals amb RSAT

    | Eina | Tasques |
    |------|---------|
    | **Usuaris i equips d'Active Directory** | Crear/editar usuaris i grups, moure'ls entre UO, restablir contrasenyes |
    | **Gestió de directives de grup (GPMC)** | Crear GPO, enllaçar-les a UO, editar polítiques |
    | **Atributs UNIX** | Assignar `uidNumber`/`gidNumber` (rfc2307) als comptes |

    !!! info "CLI i GUI conviuen"
        Pots crear un usuari amb `samba-tool` (servidor) i editar-lo amb RSAT (client Windows): actuen sobre el **mateix directori**. És útil per a l'alumnat que ve de la UT1 (on tot es feia amb RSAT/GUI).

    !!! warning "Límit conegut"
        Algunes funcions molt avançades d'AD de Windows (certs esquemes, replicació multi-DC complexa) poden no estar disponibles o comportar-se diferent a Samba. Per a l'administració habitual (usuaris, grups, GPO bàsiques) funciona sense problemes.

    ??? question "Auto-avaluació"
        **1.** Per què RSAT pot administrar un domini Samba AD si és una eina de Microsoft?

        ??? success "Resposta"
            Perquè Samba AD DC **implementa els mateixos protocols** (LDAP, Kerberos, SMB) i l'esquema d'Active Directory. Des del punt de vista de RSAT, un DC de Samba es comporta com un DC de Windows.

        **2.** Quin requisit ha de complir el client Windows per poder usar RSAT contra el domini?

        ??? success "Resposta"
            Estar **unit al domini** i iniciar sessió amb un compte amb privilegis d'administració del domini (p. ex. `LAFITA\administrator`).

        **3.** Pots barrejar `samba-tool` i RSAT per gestionar el mateix usuari?

        ??? success "Resposta"
            Sí: totes dues eines actuen sobre el mateix directori del domini. Pots crear un compte per CLI amb `samba-tool` i editar-lo després gràficament amb RSAT, o a l'inrevés.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.C5 · Administra amb RSAT

    **Objectiu**: gestionar el domini Samba des d'un client Windows amb eines gràfiques.
    **Temps estimat**: 40 minuts · **Modalitat**: individual

    ---

    ### Tasca 1 – Instal·lació

    Uneix un Windows 11 al domini i instal·la RSAT (AD DS + GPMC). Documenta els passos.

    ### Tasca 2 – Usuaris i equips d'AD

    Obre l'eina, localitza els usuaris creats per `samba-tool` i crea'n un de nou des de la GUI. Comprova-ho després al servidor amb `samba-tool user list`.

    ### Tasca 3 – GPO

    Amb GPMC, crea una GPO senzilla (p. ex. fons d'escriptori o restricció) i enllaça-la a una UO. Valida-la en un client.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"install RSAT windows 11 manage samba ad"`
        - `"samba ad group policy management RSAT"`
        - `"active directory users and computers samba"`
