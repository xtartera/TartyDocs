---
title: "Lliçó 1.1 - Introducció a Windows Server"
module: Windows Server
tags:
  - teoria
  - activitat
---

# :material-server: Lliçó 1.1 — Introducció a Windows Server i les xarxes client-servidor

=== ":material-book-open: Apunts"

    ## Objectius d'aprenentatge

    En acabar aquesta lliçó seràs capaç de:

    - [ ] Explicar per què una empresa necessita un sistema operatiu en xarxa.
    - [ ] Diferenciar el rol d'un client i d'un servidor en una xarxa corporativa.
    - [ ] Descriure l'arquitectura client-servidor i els seus components principals.
    - [ ] Identificar i explicar almenys sis serveis que ofereix Windows Server.
    - [ ] Justificar per què la virtualització és la norma actual en entorns empresarials.
    - [ ] Aplicar les bones pràctiques bàsiques en la configuració inicial d'un servidor.

    ---

    ## 1. Context: per què existeixen els servidors?

    Imagina una empresa amb 50 treballadors. Cada persona té el seu ordinador
    i necessita:

    - Accedir als mateixos fitxers de treball que els seus companys.
    - Imprimir en impressores compartides.
    - Rebre correus electrònics corporatius.
    - Connectar-se amb les seves credencials des de qualsevol equip de l'oficina.
    - Que l'administrador pugui gestionar tots els equips des d'un punt central.

    Si cadascú gestionés tot això al seu propi ordinador, el caos seria immediat:
    fitxers duplicats, contrasenyes inconsistents, impressores que ningú sap
    configurar i cap manera de garantir la seguretat.

    La solució és centralitzar tots aquests serveis en un **servidor**.

    !!! tip "Analogia"
        Pensa en un servidor com el **cervell d'una empresa**. Els ordinadors
        dels treballadors (clients) fan preguntes i el servidor les respon:
        *"Qui ets?"*, *"Quins fitxers pots veure?"*, *"Quina IP tens?"*.

    ---

    ## 2. Sistemes operatius d'escriptori vs. en xarxa

    No tots els sistemes operatius estan pensats per a les mateixes tasques.

    | Característica | Windows 11 (escriptori) | Windows Server 2022 |
    |----------------|------------------------|---------------------|
    | Usuaris simultanis | 1 | Molts (RDP, serveis) |
    | Interfície gràfica | Sí (per defecte) | Opcional (Core mode) |
    | Rol principal | Productivitat personal | Oferir serveis a la xarxa |
    | Active Directory | No | Sí |
    | Llicència | Per equip | Per nuclis de CPU |
    | Estabilitat prioritària | Rendiment d'usuari | Disponibilitat contínua |

    !!! tip "Recorda"
        Windows Server **no** està pensat perquè els usuaris hi treballin directament.
        La seva funció és oferir serveis als ordinadors de la xarxa de forma
        contínua i fiable, idealment sense interrupcions.

    ---

    ## 3. Arquitectura client-servidor

    El model **client-servidor** és la base de totes les xarxes empresarials.
    En aquest model hi ha dos tipus d'actors:

    - **Servidor:** equip que ofereix recursos i serveis. Sempre està encès i
      disponible. Té una adreça IP fixa per ser localitzable en tot moment.
    - **Client:** equip que consumeix els serveis del servidor. Pot ser un
      ordinador de sobretaula, un portàtil o fins i tot un mòbil.

    ``` mermaid
    flowchart LR
        subgraph Servidor["🖥️ Windows Server"]
            AD[Active Directory]
            DNS[DNS]
            DHCP[DHCP]
            FS[Fitxers]
            GPO[GPO]
        end
        subgraph Clients
            C1[💻 PC Comptabilitat]
            C2[💻 PC Administració]
            C3[💻 PC Direcció]
        end
        AD -- autenticació --> C1
        AD -- autenticació --> C2
        AD -- autenticació --> C3
        DNS -- noms --> C1
        DHCP -- IP --> C2
        FS -- carpetes --> C3
        GPO -- polítiques --> C1
        GPO -- polítiques --> C2
        GPO -- polítiques --> C3
    ```

    Quan un treballador engega el seu ordinador i introdueix la contrasenya,
    el que passa en realitat és:

    1. El client envia les credencials al servidor (Active Directory).
    2. El servidor verifica si l'usuari existeix i si la contrasenya és correcta.
    3. Si tot és correcte, aplica les polítiques de grup (GPO) corresponents.
    4. Munta les unitats de xarxa i carpetes als quals l'usuari té accés.
    5. L'usuari veu el seu escriptori habitual, des de qualsevol equip de l'empresa.

    ---

    ## 4. Serveis principals de Windows Server

    Windows Server no és un únic programa sinó una plataforma que pot oferir
    múltiples **rols**. Cada rol és un servei independent que es pot instal·lar
    o desinstal·lar segons les necessitats.

    | Rol / Servei | Sigles | Funció |
    |-------------|--------|--------|
    | Active Directory Domain Services | AD DS | Gestió centralitzada d'usuaris, equips i polítiques |
    | Domain Name System | DNS | Traducció de noms (`srv-win01`) a adreces IP |
    | Dynamic Host Configuration Protocol | DHCP | Assignació automàtica d'IP als clients |
    | File and Storage Services | FSS | Compartició de carpetes amb permisos granulars |
    | Print and Document Services | PDS | Gestió centralitzada d'impressores |
    | Group Policy | GPO | Aplicació de configuracions i restriccions a tots els equips |
    | Remote Desktop Services | RDS | Accés remot al servidor o a aplicacions centralitzades |
    | Windows Server Update Services | WSUS | Gestió centralitzada d'actualitzacions de Windows |

    !!! note "Quants rols instal·lem?"
        En entorns petits (PIME), un únic servidor pot tenir AD DS + DNS + DHCP + File Services
        instal·lats alhora. En empreses grans, cada rol sol estar en un servidor dedicat
        per motius de rendiment i seguretat.

    ---

    ## 5. Virtualització de servidors

    Fins fa uns anys, cada servidor era un equip físic independent. Avui, la majoria
    de servidors empresarials s'executen com a **màquines virtuals (MV)** sobre
    un únic equip físic potent, anomenat **hipervisor**.

    ### Què és un hipervisor?

    Un hipervisor és un programari que permet crear i gestionar màquines virtuals.
    Cada MV es comporta com un ordinador independent amb el seu propi sistema
    operatiu, però comparteix el maquinari físic amb les altres MV.

    ``` mermaid
    flowchart TB
        HW[🖥️ Maquinari físic\nCPU · RAM · Discos · Xarxa]
        HW --> HV[Hipervisor\nex: Hyper-V · VMware ESXi · Proxmox]
        HV --> MV1[MV 1\nWindows Server\nDC + DNS]
        HV --> MV2[MV 2\nWindows Server\nFitxers + Impressió]
        HV --> MV3[MV 3\nUbuntu Server\nWeb + Correu]
    ```

    ### Per què és millor virtualitzar?

    <div class="grid cards" markdown>

    - :material-currency-eur: **Reducció de costos**

        Un servidor físic potent substitueix cinc servidors antics. Menys
        consum elèctric, menys espai i menys manteniment.

    - :material-camera: **Snapshots**

        Abans de fer un canvi important, fas una instantània de la MV.
        Si alguna cosa va malament, la restaures en segons.

    - :material-transfer: **Portabilitat**

        Una MV és un fitxer. Pots copiar-la, moure-la o restaurar-la
        en qualsevol altre hipervisor compatible.

    - :material-shield-check: **Aïllament**

        Si una MV es veu compromesa per un virus o error, les altres
        continuen funcionant de forma independent.

    </div>

    !!! warning "Error habitual"
        No configuris mai el servidor amb **IP dinàmica (DHCP)**. Si la IP canvia,
        cap client no el podrà trobar i tots els serveis deixaran de funcionar.
        **Sempre IP fixa.**

    !!! warning "Segon error habitual"
        No apaguis mai un servidor virtual fent clic a "Tancar" des de dins
        del sistema operatiu guest. Utilitza sempre les opcions de l'hipervisor
        per aturar-lo de forma controlada.

    ---

    ## 6. Cas real: l'empresa Tecnollum S.L.

    **Tecnollum S.L.** és una PIME de 30 treballadors dedicada a la venda i
    instal·lació de material elèctric. Fins fa dos anys, cada treballador
    guardava els seus fitxers al propi ordinador i compartia contrasenyes
    per WhatsApp. Quan algú marxava de l'empresa, ningú sabia a quins
    sistemes tenia accés.

    El nou responsable de TIC va proposar implantar Windows Server i va
    aconseguir els resultats següents:

    | Problema anterior | Solució amb Windows Server |
    |-------------------|---------------------------|
    | Fitxers dispersos en 30 ordinadors | Carpetes compartides centralitzades (File Services) |
    | Contrasenyes compartides per WhatsApp | Usuaris individuals amb Active Directory |
    | Accés sense control quan marxava algú | Desactivar l'usuari a AD en 30 segons |
    | Cap control sobre els ordinadors | GPO que aplica el fons d'escriptori, restriccions i actualitzacions |
    | IPs canviants que trencaven les impressores | DHCP centralitzat amb reserves d'IP |

    !!! success "Resultat"
        La implantació va costar 3.000 € (servidor + llicències) i va estalviar
        a l'empresa hores setmanals de suport tècnic i incidents de seguretat.

    ---

    ## 7. Bones pràctiques inicials

    <div class="grid cards" markdown>

    - :material-ip-network: **IP fixa**

        Assigna una adreça estàtica al servidor. Mai DHCP.
        Exemple: `192.168.1.10/24`

    - :material-rename-box: **Nom descriptiu**

        Utilitza noms com `SRV-WIN01` o `DC01-TECNOLLUM`.
        Evita noms com `SERVIDOR` o `PC-JOAN`.

    - :material-file-document-edit: **Documentació**

        Registra tota la configuració: IPs, noms, contrasenyes, rols instal·lats
        i data dels canvis. Ho agrairàs en 6 mesos.

    - :material-dns: **DNS apuntant a ell mateix**

        Quan el servidor és el DNS de la xarxa, la seva pròpia adreça DNS
        ha d'apuntar a `127.0.0.1` o a la seva IP fixa, mai a un DNS extern.

    - :material-shield-lock: **Contrasenya forta**

        L'administrador local ha de tenir una contrasenya complexa i única.
        No facis servir `Admin123` ni `P@ssw0rd` en producció.

    - :material-update: **Actualitzacions planificades**

        Programa les actualitzacions fora de l'horari laboral.
        Un servidor que es reinicia a les 10 del matí és un problema.

    </div>

    ---

    ## Relació amb els projectes del curs

    Els conceptes d'aquesta lliçó són la base de tots els projectes del mòdul:

    - **Projecte 1:** Instal·lació i configuració d'un servidor Windows Server en
      VirtualBox (Activitat 1.1.1).
    - **Projecte 2:** Creació d'un domini Active Directory per a una PIME fictícia.
    - **Projecte 3:** Configuració de serveis DNS, DHCP i compartició de fitxers.
    - **Projecte final:** Infraestructura completa d'una empresa amb múltiples
      servidors virtuals i clients unificats al domini.

    ---

    ## Resum

    Un **sistema operatiu en xarxa** com Windows Server permet centralitzar tots els
    recursos d'una empresa: autenticació d'usuaris (AD DS), resolució de noms (DNS),
    assignació d'adreces (DHCP), fitxers compartits i polítiques de seguretat (GPO).

    La **virtualització** ha transformat la manera com es desplega la infraestructura:
    avui, un sol servidor físic pot allotjar múltiples servidors virtuals, cadascun
    amb el seu rol específic, permetent estalviar costos, facilitar les còpies de
    seguretat i recuperar-se de fallades en minuts.

    El **model client-servidor** és la base de tota xarxa corporativa: els clients
    sol·liciten serveis, el servidor els proporciona de forma centralitzada, segura i
    controlada.

    ---

    ## :material-help-circle: Autoavaluació

    ??? question "1. Per quin motiu una empresa amb 50 treballadors necessita un servidor?"
        Perquè necessita centralitzar recursos: fitxers compartits, autenticació
        d'usuaris, impressores, actualitzacions i polítiques de seguretat. Sense
        servidor, cada equip funcionaria de forma aïllada i la gestió seria inviable.

    ??? question "2. Quina diferència hi ha entre Windows 11 i Windows Server?"
        Windows 11 està dissenyat per a un únic usuari en mode escriptori.
        Windows Server està dissenyat per oferir serveis a múltiples usuaris
        simultàniament, amb rols específics com AD DS, DNS o DHCP.

    ??? question "3. Explica el model client-servidor amb les teves paraules."
        El servidor és l'equip que ofereix serveis (fitxers, autenticació, DNS...).
        El client és l'equip que consumeix aquests serveis. El client envia una
        petició, el servidor la processa i retorna una resposta.

    ??? question "4. Quins sis rols o serveis principals ofereix Windows Server?"
        AD DS, DNS, DHCP, File and Storage Services, Print and Document Services
        i Group Policy. Opcionals habituals: RDS i WSUS.

    ??? question "5. Què és un hipervisor i per a quin serveix?"
        Un hipervisor és un programari que permet crear i executar màquines virtuals
        sobre un equip físic. Exemples: Hyper-V, VMware ESXi, Proxmox.
        Serveix per aprofitar millor el maquinari i aïllar els servidors entre ells.

    ??? question "6. Quins avantatges té un *snapshot* d'una màquina virtual?"
        Permet fer una fotografia de l'estat de la MV en un moment concret.
        Si alguna cosa va malament després d'un canvi, es pot restaurar l'estat
        anterior en pocs segons, sense pèrdua de dades.

    ??? question "7. Per quin motiu el servidor ha de tenir IP fixa?"
        Perquè els clients necessiten trobar el servidor sempre a la mateixa adreça.
        Si la IP canviés (com passa amb DHCP), els serveis de DNS, AD i fitxers
        deixarien de funcionar per als clients.

    ??? question "8. Quin problema soluciona Active Directory en una empresa?"
        Centralitza la gestió d'usuaris i equips. Permet que un treballador
        s'autentiqui amb les seves credencials des de qualsevol equip del domini,
        i que l'administrador pugui gestionar permisos i accesos des d'un punt únic.

    ??? question "9. Quina diferència hi ha entre DNS i DHCP?"
        **DNS** tradueix noms de domini a adreces IP (ex: `srv-win01` → `192.168.1.10`).
        **DHCP** assigna automàticament una adreça IP a cada equip que es connecta
        a la xarxa, evitant configurar-les manualment una per una.

    ??? question "10. En el cas de Tecnollum S.L., quin servei hauria evitat compartir contrasenyes per WhatsApp?"
        Active Directory Domain Services (AD DS). Amb AD, cada treballador té
        el seu propi usuari i contrasenya individual. L'administrador pot crear,
        modificar o desactivar comptes en qualsevol moment sense tocar els altres.

=== ":material-hammer-wrench: Activitat 1.1.1"

    ## ACTIVITAT 1.1.1 — Instal·lació de Windows Server en VirtualBox

    <div class="grid cards" markdown>

    - :material-clock-outline: **Durada estimada**

        2 hores

    - :material-signal: **Nivell**

        Inicial

    - :material-tools: **Eina**

        Oracle VirtualBox

    </div>

    ---

    ### Objectiu

    Instal·lar Windows Server 2022 en una màquina virtual i configurar els
    paràmetres bàsics inicials.

    ---

    ### Material necessari

    - VirtualBox instal·lat a l'ordinador.
    - ISO de Windows Server 2022 (proporcionada pel professor).
    - Mínim 4 GB de RAM disponible a l'ordinador amfitrió.

    ---

    ### Procediment

    !!! note "Pas 1 — Crear la màquina virtual"
        - Obre VirtualBox → **Nova**
        - Nom: `SRV-WIN01`
        - Tipus: `Microsoft Windows` / Versió: `Windows 2022 (64-bit)`
        - RAM: `2048 MB` mínim (recomanat `4096 MB`)
        - Disc dur: `60 GB` (VDI, expansió dinàmica)

    !!! note "Pas 2 — Configurar la xarxa"
        - Configuració de la MV → **Xarxa**
        - Adaptador 1: **Xarxa NAT** (accés a internet durant la instal·lació)

    !!! note "Pas 3 — Instal·lar Windows Server"
        - Munta la ISO a la unitat òptica virtual
        - Inicia la màquina i segueix l'assistent
        - Selecciona **Windows Server 2022 Standard (Desktop Experience)**
        - Contrasenya de l'administrador: `P@ssw0rd` *(només en entorn de pràctiques)*

    !!! note "Pas 4 — Configuració post-instal·lació"

        ```powershell
        # Canviar el nom del servidor
        Rename-Computer -NewName "SRV-WIN01" -Restart

        # Assignar IP fixa (després del reinici)
        New-NetIPAddress `
            -InterfaceAlias "Ethernet" `
            -IPAddress 192.168.1.10 `
            -PrefixLength 24 `
            -DefaultGateway 192.168.1.1

        Set-DnsClientServerAddress `
            -InterfaceAlias "Ethernet" `
            -ServerAddresses 8.8.8.8
        ```

    ---

    ### Lliurament

    !!! success "Captura de pantalla requerida"
        **Server Manager** amb el nom `SRV-WIN01` visible i la IP fixa configurada.

    ---

    ### Criteris d'avaluació

    | Criteri | Punts |
    |---------|:-----:|
    | MV creada amb els paràmetres correctes | 2 |
    | Windows Server instal·lat correctament | 3 |
    | Nom del servidor configurat (`SRV-WIN01`) | 2 |
    | IP fixa assignada correctament | 3 |
    | **Total** | **10** |

=== ":material-play-circle: Vídeo"

    ## Recursos de vídeo

    !!! info "Pròximament"
        Els vídeos d'aquesta lliçó s'afegiran aviat.

    <!--
    Quan tinguis la URL del vídeo, substitueix ID_VIDEO per l'identificador de YouTube:

    <iframe
      width="100%"
      height="420"
      src="https://www.youtube.com/embed/ID_VIDEO"
      title="Lliçó 1.1 - Introducció a Windows Server"
      frameborder="0"
      allowfullscreen>
    </iframe>
    -->
