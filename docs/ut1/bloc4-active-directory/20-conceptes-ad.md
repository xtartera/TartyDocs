---
title: Conceptes d'Active Directory
tags:
  - active directory
  - domini
  - UT1
---

# :material-forest: Conceptes d'Active Directory

!!! abstract "Concepte clau"
    **Active Directory** és el servei de directori de Microsoft que centralitza la gestió d'identitats i recursos d'una xarxa. Organitza tots els objectes (usuaris, equips, grups) en una estructura jeràrquica de **boscs**, **arbres** i **dominis**.

=== ":material-notebook-outline: Apunts"

    ## Què és Active Directory?

    **Active Directory Domain Services (AD DS)** és el servei que permet a una xarxa Windows tenir:

    - Un únic punt d'autenticació: l'usuari inicia sessió una sola vegada i accedeix a tots els recursos permesos
    - Gestió centralitzada de tots els usuaris, grups i equips
    - Polítiques de seguretat aplicades uniformement (GPO)
    - Control d'accés basat en permisos granulars

    Sense AD, cada servidor i cada PC gestionaria els seus propis usuaris localment: 50 PCs = 50 llistes d'usuaris separades.

    ## L'estructura jeràrquica

    ```mermaid
    graph TD
        subgraph Bosc["🌲 Bosc (Forest): cirvianum.cat"]
            subgraph Arbre1["🌳 Arbre: cirvianum.cat"]
                D1["🏢 Domini arrel\ncirvianum.cat"]
                D2["🏢 Subdomini\nsmx.cirvianum.cat"]
                D3["🏢 Subdomini\nadmin.cirvianum.cat"]
                D1 --> D2
                D1 --> D3
            end
            subgraph Arbre2["🌳 Arbre: cirvianum.net"]
                D4["🏢 Domini\ncirvianum.net"]
            end
        end
    ```

    ### Bosc (Forest)

    El **bosc** és el límit de seguretat màxim d'Active Directory. Tots els dominis d'un bosc comparteixen:

    - Un **esquema** (schema) comú: la definició de tots els tipus d'objectes i atributs
    - Un **catàleg global** (Global Catalog): índex de tots els objectes del bosc
    - **Relacions de confiança** transitives entre tots els dominis del bosc

    Un bosc pot tenir un o múltiples arbres.

    ### Arbre (Tree)

    Un **arbre** és un conjunt de dominis amb un espai de noms DNS contigu. Per exemple, `cirvianum.cat`, `smx.cirvianum.cat` i `admin.cirvianum.cat` formen un arbre.

    ### Domini (Domain)

    El **domini** és la unitat d'administració bàsica d'Active Directory. Defineix:

    - L'àmbit de l'autenticació (els usuaris d'un domini s'autentiquen al seu DC)
    - Les polítiques de seguretat pròpies
    - La base de dades de directori pròpia (NTDS.dit)

    Al curs creem un **domini nou en un bosc nou**, que és el cas més senzill i habitual en PIMES: `cirvianum.local` (o el nom que triis).

    !!! info "El sufix `.local` és habitual en entorns de laboratori perquè no requereix tenir un domini DNS públic registrat. En producció real, s'usa el nom de domini de l'empresa: `cirvianum.cat`."

    ## Objectes d'Active Directory

    Dins d'un domini, tot és un **objecte**: usuaris, grups, equips, impressores, polítiques...

    | Tipus d'objecte | Descripció | Exemple |
    |-----------------|-----------|---------|
    | **Usuari** | Compte personal d'una persona | `xavier.tartera` |
    | **Grup** | Col·lecció d'usuaris o equips | `Professors`, `SMX-1` |
    | **Equip** | PC o servidor membre del domini | `PC-AULA01` |
    | **UO** | Contenidor per organitzar objectes | `Alumnes/SMX-1` |
    | **GPO** | Política vinculada a una UO | `RestriccionsAlumnes` |

    ## Controlador de domini (DC)

    El **controlador de domini** (Domain Controller, DC) és el servidor que executa AD DS. És responsable de:

    - Autenticar tots els usuaris quan inicien sessió
    - Respondre a les consultes LDAP
    - Replicar els canvis del directori (en entorns amb múltiples DC)
    - Executar el servei Kerberos per a l'autenticació

    !!! warning "El DC és el component més crític de la infraestructura. Si el DC cau i no hi ha DC secundari, **cap usuari pot iniciar sessió al domini**. Per aquest motiu, en producció sempre hi ha almenys 2 DCs."

    ## Autenticació amb Kerberos

    Active Directory usa el protocol **Kerberos v5** per a l'autenticació:

    ```mermaid
    sequenceDiagram
        participant C as 💻 Client
        participant DC as 🖥️ DC (KDC)
        participant S as 📁 Servidor de recursos

        C->>DC: 1. Sol·licita tiquet (TGT) amb credencials
        DC-->>C: 2. Entrega TGT xifrat
        C->>DC: 3. Demana tiquet de servei (TGS)
        DC-->>C: 4. Entrega TGS per al servidor
        C->>S: 5. Presenta el TGS
        S-->>C: 6. Accés concedit ✅
    ```

    Kerberos no envia mai la contrasenya per la xarxa: treballa amb tiquets xifrats de vida limitada (per defecte, 10 hores).

    ??? question "Auto-avaluació"

        **1.** Quina diferència hi ha entre un **domini** i un **bosc** d'Active Directory?

        ??? success "Resposta"
            Un **domini** és la unitat d'administració bàsica: té la seva pròpia base de dades d'objectes, polítiques i límit d'autenticació. Un **bosc** és el límit de seguretat màxim i conté un o múltiples dominis que comparteixen esquema, catàleg global i relacions de confiança transitives entre ells.

        **2.** Per quin motiu el controlador de domini és el component més crític d'una infraestructura Windows?

        ??? success "Resposta"
            Perquè **tots els inicis de sessió al domini passen pel DC**. Si el DC no és accessible (caiguda, problema de xarxa), cap usuari pot autenticar-se, el que bloqueja l'accés a tots els recursos del domini: fitxers compartits, impressores, aplicacions i qualsevol servei que requereixi credencials de domini.

        **3.** Quin protocol d'autenticació usa Active Directory i quin avantatge té respecte a enviar la contrasenya per la xarxa?

        ??? success "Resposta"
            **Kerberos v5**. L'avantatge principal és que la contrasenya **mai es transmet per la xarxa**: l'autenticació es basa en tiquets xifrats amb vida limitada. Fins i tot si algú captura el trànsit de xarxa, no obté la contrasenya, sinó un tiquet que caduca en 10 hores.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.1 · Dissenya l'estructura AD de la teva empresa

    **Objectiu**: aplicar els conceptes de bosc, arbre, domini i UO a un cas pràctic.

    **Temps estimat**: 20 minuts

    ---

    ### Escenari

    Ets l'administrador de sistemes de l'empresa **TecnoCirc, SL**, amb seu a Vic. L'empresa té:

    - 30 treballadors a Vic (oficina central)
    - 10 treballadors a Barcelona (delegació)
    - Un departament de TIC, un de Vendes i un d'Administració
    - Un servidor principal a Vic i un servidor secundari a Barcelona

    ### Tasques

    1. Proposa el nom del domini principal (usa el format `empresa.local` per a laboratori)
    2. Necessites un sol domini o múltiples? Justifica la resposta
    3. Quantes UOs de primer nivell crearies? Llista-les amb el seu nom
    4. On posaries els 10 treballadors de Barcelona: en el mateix domini o en un subdomini?
    5. Dibuixa (a mà o digitalment) l'estructura jeràrquica resultant

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Active Directory conceptos basicos dominio bosque arbol"`
        - `"What is Active Directory explained simply"`
        - `"Kerberos authentication explained Active Directory"`
        - `"Active Directory Domain Services overview Windows Server"`
