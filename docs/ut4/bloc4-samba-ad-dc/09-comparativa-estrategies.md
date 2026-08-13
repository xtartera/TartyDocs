---
title: Comparativa d'estratègies d'integració
tags:
  - ut4
  - samba
  - active-directory
  - conceptes
---

# :material-scale-balance: Comparativa d'estratègies d'integració

!!! abstract "Concepte clau"
    Per unificar la gestió d'identitats en un entorn heterogeni hi ha dues grans vies: **unir els Linux a un AD de Windows** o **muntar un Samba AD DC** propi. Cap és universalment millor; la tria depèn del context.

=== ":material-notebook-outline: Apunts"

    ## Les dues estratègies

    ```mermaid
    graph TD
        Q["Vull unificar identitats\nWindows + Linux"]
        Q --> A["Estratègia A\nAD de Windows +\nunir-hi els Linux"]
        Q --> B["Estratègia B\nSamba AD DC\n(sense Windows Server)"]
    ```

    ## Taula comparativa

    | Criteri | A · AD de Windows + Linux units | B · Samba AD DC |
    |---------|--------------------------------|-----------------|
    | **Cost de llicència** | Windows Server (de pagament) | Sense llicència (programari lliure) |
    | **Dependència de Windows** | Alta (cal un WS de pagament) | Cap (corre sobre Ubuntu) |
    | **Compatibilitat amb clients Windows** | Total (és AD natiu) | Molt bona (compatible AD) |
    | **Compatibilitat amb clients Linux** | Bona (realmd/SSSD) | Bona (realmd/SSSD + rfc2307) |
    | **Eines gràfiques (RSAT)** | Sí | Sí (compatible) |
    | **Corba d'aprenentatge** | Menor si ja saps Windows | Major (CLI, `samba-tool`) |
    | **Suport oficial** | Microsoft | Comunitat / suport de tercers |
    | **Funcions AD avançades** | Totes | La majoria; algunes limitades |

    ## Quan triar cadascuna

    | Context | Estratègia recomanada |
    |---------|----------------------|
    | Ja hi ha un Windows Server amb AD en producció | **A** — aprofita'l i uneix-hi els Linux |
    | Pressupost limitat, sense Windows Server | **B** — Samba AD DC estalvia llicències |
    | Parc majoritàriament Windows amb suport corporatiu | **A** |
    | Entorn educatiu / laboratori / PIME sense llicències | **B** |

    !!! tip "Connexió amb tota la UT4"
        Sigui quina sigui l'estratègia, les **dificultats de fons són les mateixes** (identitats, permisos, Kerberos/DNS/temps, protocols). Per això la Part A i la Part B són el nucli: canvia *qui fa de DC*, però no *per què és difícil* integrar mons.

    !!! info "I Zentyal?"
        Existeix la temptació d'una "appliance" amb GUI (com Zentyal) que embolcalla Samba AD. S'ha descartat en aquest manual: enganxa l'alumne a una interfície concreta d'un producte de nínxol, en lloc de consolidar els fonaments transferibles (`samba-tool`, Kerberos, LDAP) que serveixen en qualsevol entorn.

    ??? question "Auto-avaluació"
        **1.** Un institut sense pressupost per a llicències vol un domini per a Windows i Linux. Quina estratègia recomanaries i per què?

        ??? success "Resposta"
            L'estratègia **B (Samba AD DC)**: ofereix un domini compatible amb AD sense cost de llicència, corre sobre Ubuntu i dóna servei tant a clients Windows com Linux. L'inconvenient és una corba d'aprenentatge més gran i el suport comunitari en lloc d'oficial.

        **2.** Quina és la principal fortalesa de l'estratègia A davant la B?

        ??? success "Resposta"
            La compatibilitat i el suport: és AD natiu de Microsoft, amb totes les funcions avançades i suport oficial. La contrapartida és el cost de llicència i la dependència de Windows Server.

        **3.** Per què es diu que "les dificultats de fons són les mateixes" en totes dues estratègies?

        ??? success "Resposta"
            Perquè, canviï qui faci de controlador de domini, cal resoldre igualment el mapatge d'identitats (SID↔UID/GID), la traducció de permisos (NTFS↔POSIX↔ACL), l'autenticació Kerberos amb DNS i temps correctes, i la interoperabilitat de protocols SMB↔NFS.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.C6 · Decideix i defensa

    **Objectiu**: triar una estratègia d'integració justificada per a un supòsit.
    **Temps estimat**: 30 minuts · **Modalitat**: individual o debat

    ---

    ### Tasca 1 – Supòsit

    Un centre té 20 equips Windows, 10 Ubuntu i **cap** Windows Server. La direcció vol gestió d'usuaris unificada amb el mínim cost.

    ### Tasca 2 – Decisió

    Tria l'estratègia (A o B) i omple una taula de pros i contres per al cas concret.

    ### Tasca 3 – Defensa

    Escriu un paràgraf argumentant la teva decisió a la direcció, anticipant **una objecció** que et podrien fer i com la respondries.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"samba ad dc vs windows active directory comparison"`
        - `"join linux to active directory vs samba"`
        - `"active directory licensing cost small business"`
