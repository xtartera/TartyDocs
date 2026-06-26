---
title: SO escriptori vs SO en xarxa
tags:
  - fonaments
  - sistema operatiu
  - UT1
---

# :material-monitor: SO escriptori vs SO en xarxa

!!! abstract "Concepte clau"
    Un SO d'escriptori gestiona recursos d'una sola màquina per a un usuari. Un SO en xarxa gestiona serveis centralitzats per a múltiples usuaris simultanis.

=== ":material-notebook-outline: Apunts"

    ## Sistemes operatius d'escriptori

    Un **sistema operatiu d'escriptori** (Windows 10/11, macOS, Ubuntu Desktop) està dissenyat per ser usat per una sola persona en un sol equip. Les seves prioritats són:

    - Interfície gràfica intuïtiva i amigable
    - Reproducció multimèdia i entreteniment
    - Aplicacions de productivitat personal
    - Rendiment òptim per a tasques de l'usuari local

    ## Sistemes operatius en xarxa

    Un **sistema operatiu en xarxa** (Windows Server 2022, Ubuntu Server, RHEL) proporciona **serveis centralitzats** a molts usuaris i equips. Les seves prioritats són:

    - **Alta disponibilitat**: ha de funcionar 24/7 sense interrupcions
    - **Multiusuari**: gestiona centenars o milers de connexions simultànies
    - **Escalabilitat**: creix afegint recursos o servidors addicionals
    - **Seguretat centralitzada**: controla l'accés a tots els recursos de la xarxa

    ## Diagrama comparatiu

    ```mermaid
    graph LR
        subgraph Escriptori["💻 SO Escriptori"]
            direction TB
            U1[👤 Un usuari]
            R1[CPU · RAM · Disc]
            U1 --> R1
        end

        subgraph Xarxa["🖥️ SO en Xarxa"]
            direction TB
            SRV[Servidor]
            CL1[👤 Client 1]
            CL2[👤 Client 2]
            CL3[👤 Client n]
            SRV --> CL1
            SRV --> CL2
            SRV --> CL3
        end
    ```

    ## Taula comparativa

    | Característica | SO Escriptori | SO en Xarxa |
    |---|---|---|
    | **Usuaris simultanis** | 1 | Centenars o milers |
    | **Disponibilitat** | Normal (s'apaga) | 24/7/365 |
    | **Interfície gràfica** | Sempre activa | Opcional (Server Core) |
    | **Preu** | Econòmic (~150 €) | Car (llicències per usuari/nucli) |
    | **Exemple Windows** | Windows 11 Home/Pro | Windows Server 2022 |
    | **Exemple Linux** | Ubuntu 24.04 Desktop | Ubuntu 24.04 Server |
    | **Ús principal** | Productivitat personal | AD, fitxers, web, impressió |

    ## Per què no usar Windows 11 com a servidor?

    Tècnicament és possible compartir carpetes des de Windows 11, però:

    - **Límit de 20 connexions simultànies** (imposat per llicència Microsoft)
    - **No inclou Active Directory** — no pot ser controlador de domini
    - **No té IIS complet** per a serveis web d'empresa
    - **No té redundància** (failover clustering, Storage Spaces Direct)
    - **Actualitzacions de seguretat** menys prioritàries i amb reinicis forçats

    !!! warning "Error de concepte freqüent"
        Molts estudiants pensen que un servidor és simplement "un PC molt potent". La diferència no és el maquinari: és el **rol** i el **sistema operatiu** que gestiona la infraestructura. Un portàtil humil pot actuar com a servidor si té el SO adequat.

    ??? question "Auto-avaluació"

        **1.** Quina és la diferència fonamental entre un SO d'escriptori i un SO en xarxa?

        ??? success "Resposta"
            Un SO d'escriptori serveix a un usuari local; un SO en xarxa proveeix serveis centralitzats a múltiples usuaris i equips de manera simultània.

        **2.** Per quin motiu no es recomana Windows 11 Pro com a servidor d'empresa?

        ??? success "Resposta"
            Té un límit de 20 connexions simultànies, no pot actuar com a controlador de domini Active Directory, i no inclou les característiques de disponibilitat i redundància d'un SO de servidor.

        **3.** Posa un exemple real on sigui imprescindible un SO en xarxa i justifica per què un SO d'escriptori no seria suficient.

        ??? success "Resposta"
            Una empresa amb 50 treballadors necessita autenticació centralitzada (AD), carpetes compartides per departament i còpies de seguretat automatitzades. Cap SO d'escriptori pot gestionar això: el límit de connexions i l'absència d'Active Directory ho impedeix.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 1.1 · Comparativa de sistemes operatius

    **Objectiu**: identificar les diferències entre SO d'escriptori i SO en xarxa a partir de casos reals.

    **Temps estimat**: 20 minuts

    ---

    ### Part A – Classifica els escenaris

    Per a cada escenari, indica si necessites un **SO d'escriptori** (E) o un **SO en xarxa** (X) i justifica la resposta en una frase:

    | # | Escenari | Tipus | Justificació |
    |---|----------|-------|--------------|
    | 1 | Editar vídeos i fotografies a casa | | |
    | 2 | Gestionar els comptes de 200 alumnes d'una escola | | |
    | 3 | Servidor de correu corporatiu per a 80 empleats | | |
    | 4 | Reproduir música i navegar per internet | | |
    | 5 | Allotjar el lloc web públic d'una empresa | | |
    | 6 | Controlar qui pot imprimir a la impressora de l'oficina | | |

    ### Part B – Reflexió sobre el teu entorn

    Respon breument (2-3 línies per pregunta):

    1. Al teu institut hi ha un o més servidors. Quins serveis creus que proporcionen als alumnes i professors?
    2. Quina diferència trobes entre iniciar sessió al PC de l'aula i iniciar sessió al mòbil personal?
    3. Si el servidor del centre s'apaga, quins serveis deixen de funcionar? Quins continuen?

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        Usa aquests termes per trobar vídeos actualitzats:

        - `"Windows Server 2022 vs Windows 11 differences"`
        - `"qué es un sistema operativo en red"`
        - `"diferencias sistema operativo escritorio servidor"`

    !!! tip "Microsoft Learn"
        La plataforma oficial de Microsoft (learn.microsoft.com) té mòduls gratuïts d'introducció a Windows Server en castellà i anglès.
