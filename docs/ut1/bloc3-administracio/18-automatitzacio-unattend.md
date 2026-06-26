---
title: Automatització d'instal·lació amb unattend.xml
tags:
  - instal·lació
  - automatització
  - unattend
  - UT1
---

# :material-xml: Automatització d'instal·lació amb unattend.xml

!!! abstract "Concepte clau"
    **unattend.xml** és un fitxer de resposta que automatitza la instal·lació de Windows Server, eliminant la necessitat de respondre manualment a cada pregunta de l'assistent. Permet desplegar desenes de servidors idèntics sense intervenció humana.

=== ":material-notebook-outline: Apunts"

    ## Què és unattend.xml?

    Quan l'instal·lador de Windows troba un fitxer `unattend.xml` (també anomenat fitxer de resposta), llegeix les respostes predefinides i instal·la el sistema sense demanar res a l'usuari. És la base del desplegament massiu de Windows en empreses i escoles.

    ```mermaid
    graph LR
        ISO[💿 ISO Windows Server]
        UX[📄 unattend.xml]
        INS[⚙️ Instal·lador\nWindows Setup]
        SRV[✅ Servidor configurat\nautomàticament]

        ISO --> INS
        UX --> INS
        INS --> SRV
    ```

    ## Fases de la instal·lació (Configuration Passes)

    L'instal·lador de Windows passa per múltiples fases. Cada fase (`pass`) té el seu propi bloc al fitxer XML:

    | Pass | Moment | Configuració habitual |
    |------|--------|-----------------------|
    | **windowsPE** | Entorn pre-instal·lació | Idioma, teclat, particions |
    | **specialize** | Primera vegada que arrenque el SO | Nom del servidor, zona horària, IP |
    | **oobeSystem** | Primera vegada que l'usuari inicia sessió | Contrasenya admin, configuració pantalla |

    ## Estructura bàsica d'un unattend.xml

    ```xml
    <?xml version="1.0" encoding="utf-8"?>
    <unattend xmlns="urn:schemas-microsoft-com:unattend">

      <!-- FASE 1: Configuració de l'entorn pre-instal·lació -->
      <settings pass="windowsPE">
        <component name="Microsoft-Windows-International-Core-WinPE"
                   processorArchitecture="amd64"
                   publicKeyToken="31bf3856ad364e35"
                   language="neutral"
                   versionScope="nonSxS">
          <SetupUILanguage>
            <UILanguage>ca-ES</UILanguage>
          </SetupUILanguage>
          <InputLocale>ca-ES</InputLocale>
          <SystemLocale>ca-ES</SystemLocale>
          <UILanguage>ca-ES</UILanguage>
          <UserLocale>ca-ES</UserLocale>
        </component>

        <component name="Microsoft-Windows-Setup"
                   processorArchitecture="amd64"
                   publicKeyToken="31bf3856ad364e35"
                   language="neutral"
                   versionScope="nonSxS">
          <DiskConfiguration>
            <Disk wcm:action="add">
              <DiskID>0</DiskID>
              <WillWipeDisk>true</WillWipeDisk>
              <CreatePartitions>
                <CreatePartition wcm:action="add">
                  <Order>1</Order>
                  <Type>Primary</Type>
                  <Extend>true</Extend>
                </CreatePartition>
              </CreatePartitions>
              <ModifyPartitions>
                <ModifyPartition wcm:action="add">
                  <Order>1</Order>
                  <PartitionID>1</PartitionID>
                  <Format>NTFS</Format>
                  <Label>Sistema</Label>
                  <Letter>C</Letter>
                </ModifyPartition>
              </ModifyPartitions>
            </Disk>
          </DiskConfiguration>
          <UserData>
            <AcceptEula>true</AcceptEula>
          </UserData>
        </component>
      </settings>

      <!-- FASE 2: Especialització del sistema -->
      <settings pass="specialize">
        <component name="Microsoft-Windows-Shell-Setup"
                   processorArchitecture="amd64"
                   publicKeyToken="31bf3856ad364e35"
                   language="neutral"
                   versionScope="nonSxS">
          <ComputerName>SRV-WS2022</ComputerName>
          <TimeZone>Romance Standard Time</TimeZone>
        </component>
      </settings>

      <!-- FASE 3: Configuració de l'experiència d'usuari -->
      <settings pass="oobeSystem">
        <component name="Microsoft-Windows-Shell-Setup"
                   processorArchitecture="amd64"
                   publicKeyToken="31bf3856ad364e35"
                   language="neutral"
                   versionScope="nonSxS">
          <AutoLogon>
            <Password>
              <Value>P@ssw0rd2024!</Value>
              <PlainText>true</PlainText>
            </Password>
            <Enabled>true</Enabled>
            <Username>Administrador</Username>
          </AutoLogon>
          <UserAccounts>
            <AdministratorPassword>
              <Value>P@ssw0rd2024!</Value>
              <PlainText>true</PlainText>
            </AdministratorPassword>
          </UserAccounts>
          <OOBE>
            <HideEULAPage>true</HideEULAPage>
            <SkipMachineOOBE>true</SkipMachineOOBE>
          </OOBE>
        </component>
      </settings>

    </unattend>
    ```

    ## Com usar unattend.xml a VirtualBox

    Hi ha dues maneres d'usar el fitxer de resposta a la nostra MV:

    ### Opció A: Directa a VirtualBox

    VirtualBox 7+ permet especificar un fitxer de resposta directament a la configuració de la MV:

    1. Selecciona la MV → **Configuració → Sistema → Placa base**
    2. A l'opció "Fitxer de resposta de Sysprep", selecciona el teu `unattend.xml`

    ### Opció B: Al disc d'instal·lació

    Afegeix el fitxer `autounattend.xml` a l'arrel de la ISO o USB d'instal·lació. L'instal·lador el detecta automàticament.

    ## Windows System Image Manager (WSIM)

    Per crear fitxers `unattend.xml` complexos sense escriure XML manualment, usa **Windows System Image Manager** (inclòs al Windows Assessment and Deployment Kit, ADK):

    - Obre la imatge de Windows (install.wim de la ISO)
    - Arrossega els components als passes corresponents
    - Omple els valors als camps del formulari
    - Exporta com a `unattend.xml`

    !!! info "Per al curs, amb l'exemple XML anterior és suficient. El WSIM és per a desplegaments de producció amb molts paràmetres."

    ??? question "Auto-avaluació"

        **1.** Quin és l'avantatge principal d'usar `unattend.xml` en un centre educatiu que ha de preparar 30 MVs iguals?

        ??? success "Resposta"
            **L'automatització completa**: un sol fitxer `unattend.xml` instal·la i configura les 30 MVs de manera idèntica (mateix nom de servidor, mateixa contrasenya, mateixa zona horària, mateixes particions) sense que l'administrador hagi de respondre cap pregunta. Estalvia temps i evita errors de configuració inconsistents.

        **2.** En quin `pass` del fitxer `unattend.xml` configures el nom del servidor i la zona horària?

        ??? success "Resposta"
            Al pass **`specialize`**, que s'executa la primera vegada que el SO arrenca. En aquell moment, el sistema ja té els fitxers instal·lats i pot aplicar configuracions específiques de la màquina com el nom de l'ordinador o la zona horària.

        **3.** Per quin motiu pot ser un risc de seguretat guardar la contrasenya en `PlainText: true` al fitxer unattend.xml?

        ??? success "Resposta"
            El fitxer `unattend.xml` en text pla conté la contrasenya de l'Administrador llegible per qualsevol que accedeixi al fitxer. Si es deixa a l'arrel del disc d'instal·lació o es comparteix sense xifrar, qualsevol pot veure la contrasenya. En producció, s'usa l'opció `PlainText: false` amb la contrasenya xifrada en base64, o s'elimina el fitxer just après de la instal·lació.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.8 · Crea i prova un fitxer unattend.xml

    **Objectiu**: crear un fitxer de resposta bàsic i verificar que automatitza correctament la instal·lació.

    **Temps estimat**: 45 minuts

    ---

    ### Part A – Prepara el fitxer

    1. Copia l'exemple XML de la secció d'Apunts a un fitxer anomenat `autounattend.xml`
    2. Modifica els valors:
        - `ComputerName`: canvia a `SRV-AUTO-[les teves inicials]`
        - Contrasenya: usa la mateixa que fas servir al laboratori
        - Zona horària: verifica que és `Romance Standard Time`

    ### Part B – Prova a VirtualBox

    1. Crea una MV nova buida (60 GB, 4 GB RAM)
    2. Muntes la ISO de Windows Server 2022
    3. A **Configuració → Sistema**, afegeix el teu `autounattend.xml`
    4. Arrenca la MV i observa si la instal·lació s'executa sense demanar res

    ### Part C – Documenta el resultat

    Un cop completada la instal·lació automàtica:

    1. Verifica el nom del servidor amb `$env:COMPUTERNAME`
    2. Verifica la zona horària amb `Get-TimeZone`
    3. Documenta quant temps ha trigat la instal·lació desatesa vs. la manual (Activitat 2.4)

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"unattend.xml Windows Server 2022 automated install"`
        - `"Windows Answer File autounattend.xml tutorial"`
        - `"Windows ADK WSIM answer file creation"`
        - `"VirtualBox unattended installation Windows Server"`
