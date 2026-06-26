# Anàlisi de projectes UT1 – Windows Server
## Fase 1-4 · PROMPT_MESTRE V2

> Document intern. No es publica. Base per a la redacció del manual.

---

## Fase 1 – Conceptes identificats per projecte

### Projecte 1 – Instal·lació WS2022
| Activitat | Conceptes extrets |
|-----------|-------------------|
| A1 – Estudi previ | Requisits maquinari WS2022, comparativa host vs requisits |
| A2 – Modes instal·lació | Server Core vs Desktop Experience |
| A3 – Instal·lació pas a pas | ISO, BIOS/UEFI, assistent, creació administrador |
| A4 – Particionament | Càlcul de particions, percentatges, gestió de disc |
| A5 – Sistemes de fitxers | NTFS, FAT32, ReFS – característiques i ús recomanat |
| A6 – Configuració xarxa | IP estàtica, DNS, porta d'enllaç, nom de màquina |
| A7 – Rols i característiques | File Services, IIS, Remote Management, Server Manager |
| A8 – Personalització | PowerShell bàsic, energia, dreceres |
| A9 – Automatització | unattend.xml, estructura i aplicació |
| A10 – Verificació | ping, ipconfig, proves de connectivitat |
| A11 – Monitoratge | Administrador de tasques, Monitor de rendiment, Event Viewer, manteniment, Task Scheduler |
| A12 – Documentació | Redacció tècnica |

### Projecte 2 – Active Directory
| Activitat | Conceptes extrets |
|-----------|-------------------|
| A1 – Config. inicial | IP fixa, particionament, Isard vs VirtualBox |
| A2 – Instal·lació AD DS | Rol AD DS, Server Manager, funcions del rol |
| A3 – Promoció DC | Bosc, domini, DSRM, DNS integrat |
| A4 – Validació AD | ping, nslookup, ipconfig, Event Viewer al DC |
| A5 – Estructura empresa | UO, usuaris, grups (Comercial, TIC, RRHH) |
| A6 – GPO | GPO bàsiques: fons escriptori, panell de control, gpupdate |
| A7 – Reflexió | Avantatges AD, eines d'administració |
| A8 – Dossier | Documentació tècnica |

### Projecte 3 – Gestió avançada AD (Part II)
| Activitat | Conceptes extrets |
|-----------|-------------------|
| A1 – UO i usuaris | Format nom.cognom, UPN, sAMAccountName, canvi de contrasenya primer inici |
| A2 – Unió clients W11 | DNS al client, canvi nom PC, unió al domini, whoami /upn, %logonserver%, nltest, gpresult, TestComputerSecureChannel |
| A3 – Restricció horària | Hores d'inici de sessió a ADUC, net user /domain |
| A4 – Grups | Creació grups seguretat, àmbit global, cerca avançada, whoami /groups |
| A5 – Carpeta compartida | C:\Productes, permisos NTFS diferenciats per usuari |
| A6 – Herència permisos | Trencar herència, permisos específics subcarpeta |
| A7 – Muntatge xarxa | Explorador > Connecta unitat, net use, New-PSDrive |
| A8 – Auditoria | GPO auditoria objectes, Event Viewer ID 4624/4663, auditpol |
| A9 – PowerShell AD | New-ADUser, Add-ADGroupMember, Get-ADGroupMember, Get-ADUser, Import CSV |
| A10 – Dossier | Reflexió guiada 18 preguntes |

### Projecte 4 – Roaming Profiles i GPOs
| Activitat | Conceptes extrets |
|-----------|-------------------|
| A1 – Estructura domini | UO jeràrquica (Cirvianum: Administració, Professors, Alumnes/SMX-1, SMX-2), equips a UO |
| A2 – Grups eficients | Grups per UO, cerca avançada, whoami /groups |
| A3 – Perfils mòbils config. | C:\Perfils compartida, permisos, camí \\server\Perfils\%username% a fitxa usuari |
| A4 – Validació perfils | Persistència entre clients, whoami /user |
| A5 – Default Domain Policy | Contrasenya mínima, caducitat, bloqueig, Ctrl+Alt+Supr |
| A6 – GPO per UO | Alumnes_GPO (panell control), Professors_GPO (pàgina inici Edge) |
| A7 – Restriccions alumnes | RestriccionsAlumnes: Task Manager, unitat C: oculta, USB denegat |
| A8 – Documentació | Estat perfils, Configuració avançada del sistema > Perfils d'usuari |
| A9 – Reflexió | 6 preguntes guiades |

### Projecte 5 – Perfils Mòbils via GPO
| Activitat | Conceptes extrets |
|-----------|-------------------|
| A0 – Preparació | Neteja prèvia: eliminar usuaris locals i carpeta perfils antiga. .v6 sufix |
| A1 – Carpeta compartida | C:\Perfils, permisos: Usuaris del domini (Lectura+Canvi), Admins (Control total) |
| A2 – UO i usuaris | OU=Alumnes, format UPN, contrasenya inicial, forçar canvi |
| A3 – GPO PerfilsMòbils | Configuració d'equips > Sistema > Perfils d'usuari > Establir ruta |
| A4 – Permisos NTFS | Deshabilitar herència subcarpeta, control total per usuari + admins, icacls |
| A5 – Redirecció carpetes | GPO DadesServidorUsuaris, redirecció Documents + Escriptori |
| A6 – Validació | Persistència fitxers + configuració visual entre clients, Event Viewer ID 1521 |
| A7 – Diagnòstic | eventvwr (ID 1521/1525/1509), ping, nslookup, gpresult, PowerShell (Test-Connection, Test-Path, Get-ADUser) |
| A8 – Informe | Documentació completa i reflexió |

---

## Fase 2 – Mapa d'aprenentatge (52 conceptes ordenats per dificultat)

| ID | Concepte | Dificultat | Dependències | Projectes | Diagrama | Pràctica |
|----|----------|------------|--------------|-----------|----------|----------|
| C01 | SO escriptori vs. en xarxa | 1 | — | P1, P2 | Sí | No |
| C02 | Arquitectura client-servidor | 1 | C01 | P1, P2 | Sí | No |
| C03 | Windows Server 2022 – serveis principals | 1 | C01, C02 | P1, P2 | Sí | No |
| C04 | Virtualització – hipervisors | 2 | C02 | P1 | Sí | Sí |
| C05 | Requisits de maquinari WS2022 | 2 | C03, C04 | P1 | No | No |
| C06 | Modes d'instal·lació: Server Core vs Desktop | 2 | C03 | P1 | No | No |
| C07 | Particionament del disc | 2 | C05 | P1, P2 | Sí | Sí |
| C08 | Sistemes de fitxers: NTFS, FAT32, ReFS | 2 | C07 | P1 | No | No |
| C09 | Instal·lació pas a pas WS2022 | 3 | C05, C06, C07 | P1, P2 | No | Sí |
| C10 | Configuració inicial (IP, nom, idioma) | 3 | C09 | P1, P2, P3 | No | Sí |
| C11 | Server Manager i rols del servidor | 3 | C09, C10 | P1, P2 | Sí | Sí |
| C12 | Instal·lació de rols (File, IIS, Remote) | 3 | C11 | P1 | No | Sí |
| C13 | PowerShell bàsic d'administració | 3 | C10 | P1, P3, P4 | No | Sí |
| C14 | Monitoratge: Administrador de tasques i Monitor de rendiment | 3 | C10 | P1 | No | Sí |
| C15 | Visor d'Esdeveniments (Event Viewer) | 3 | C10 | P1, P3, P5 | No | Sí |
| C16 | Manteniment: neteja i punts de restauració | 3 | C10 | P1 | No | Sí |
| C17 | Planificador de tasques | 3 | C10 | P1 | No | Sí |
| C18 | Automatització: unattend.xml | 4 | C09 | P1 | No | Sí |
| C19 | Verificació de connectivitat (ping, ipconfig) | 3 | C10 | P1, P2, P3 | No | Sí |
| C20 | Active Directory: bosc, domini, arbre | 4 | C02, C10 | P2, P3 | Sí | No |
| C21 | Unitats Organitzatives (UO) | 4 | C20 | P2, P3, P4, P5 | Sí | Sí |
| C22 | Instal·lació del rol AD DS | 4 | C11, C20 | P2 | No | Sí |
| C23 | Promoció a controlador de domini | 5 | C22 | P2 | Sí | Sí |
| C24 | DNS integrat amb Active Directory | 5 | C23, C19 | P2, P3 | Sí | Sí |
| C25 | Creació i gestió d'usuaris AD | 5 | C21, C23 | P2, P3, P4, P5 | No | Sí |
| C26 | Creació i gestió de grups AD | 5 | C25 | P2, P3, P4 | Sí | Sí |
| C27 | Polítiques de contrasenya i bloqueig | 5 | C25 | P4 | No | Sí |
| C28 | Restriccions horàries d'accés | 5 | C25 | P3 | No | Sí |
| C29 | PowerShell per gestió AD | 6 | C13, C25, C26 | P3, P4 | No | Sí |
| C30 | Unió de clients Windows 11 al domini | 5 | C24, C25 | P3, P4, P5 | Sí | Sí |
| C31 | Configuració DNS al client | 5 | C24, C30 | P3, P4, P5 | No | Sí |
| C32 | Validació de la integració al domini | 5 | C30, C31 | P3 | No | Sí |
| C33 | Verificació de GPO aplicades (gpresult) | 6 | C32 | P3, P4, P5 | No | Sí |
| C34 | Carpetes compartides al servidor | 5 | C10, C25 | P3, P5 | No | Sí |
| C35 | Permisos NTFS vs permisos de compartició | 6 | C34 | P3, P5 | Sí | Sí |
| C36 | Herència de permisos NTFS | 6 | C35 | P3, P5 | Sí | Sí |
| C37 | icacls – permisos per línia d'ordres | 6 | C35, C36 | P3, P5 | No | Sí |
| C38 | Muntatge de carpetes de xarxa | 6 | C34, C35 | P3 | No | Sí |
| C39 | GPO – conceptes i estructura | 5 | C23 | P2, P3, P4, P5 | Sí | No |
| C40 | Default Domain Policy – seguretat global | 6 | C39 | P4 | No | Sí |
| C41 | GPO per UO – polítiques diferenciades | 7 | C39, C21 | P2, P4 | Sí | Sí |
| C42 | GPO de restriccions per alumnes | 7 | C41 | P4 | No | Sí |
| C43 | gpupdate i aplicació de polítiques | 6 | C39 | P2, P3, P4, P5 | No | Sí |
| C44 | Tipus de perfils d'usuari | 6 | C25, C30 | P4, P5 | Sí | No |
| C45 | Carpeta compartida per a perfils mòbils | 6 | C34, C44 | P4, P5 | No | Sí |
| C46 | Configuració perfils mòbils: fitxa vs GPO | 7 | C44, C45, C39 | P4, P5 | Sí | Sí |
| C47 | Sufix .v6 i format de carpetes de perfil | 7 | C46 | P5 | No | No |
| C48 | Permisos NTFS a subcarpetes de perfil | 7 | C45, C36 | P5 | No | Sí |
| C49 | Redirecció de carpetes via GPO | 7 | C46, C41 | P5 | No | Sí |
| C50 | Auditoria d'accés a objectes | 7 | C15, C41 | P3 | No | Sí |
| C51 | Diagnòstic de perfils mòbils (Event Viewer) | 8 | C15, C46 | P5 | No | Sí |
| C52 | PowerShell de diagnòstic del sistema | 8 | C13, C29 | P5 | No | Sí |

---

## Fase 3 – Matriu de traçabilitat (resum)

| ID | Concepte | P1 | P2 | P3 | P4 | P5 | RA | CA | Fitxer MD |
|----|----------|----|----|----|----|----|----|-----|-----------|
| C01 | SO escriptori vs xarxa | A1 | A1 | — | — | — | RA1 | 1.1, 1.2 | 01-so-escriptori-vs-xarxa.md |
| C02 | Arquitectura client-servidor | A1 | — | — | — | — | RA1 | 1.1 | 02-arquitectura-client-servidor.md |
| C03 | Windows Server 2022 intro | A1, A7 | A2 | — | — | — | RA1 | 1.2, 1.5 | 03-windows-server-serveis.md |
| C04 | Virtualització | A1 | A1 | — | — | — | RA1 | 1.1 | 04-virtualitzacio.md |
| C05 | Requisits maquinari | A1 | A1 | — | — | — | RA1 | 1.1 | 05-requisits-maquinari.md |
| C06 | Server Core vs Desktop | A2 | — | — | — | — | RA1 | 1.2 | 06-modes-installacio.md |
| C07 | Particionament disc | A4 | A1 | — | — | — | RA1 | 1.3 | 07-particionament.md |
| C08 | NTFS FAT32 ReFS | A5 | — | — | — | — | RA1 | 1.4 | 08-sistemes-fitxers.md |
| C09 | Instal·lació pas a pas | A3 | A1 | — | — | — | RA1 | 1.3 | 09-installacio-pas-a-pas.md |
| C10 | Config. inicial | A6 | A1 | — | — | — | RA1 | 1.7, 1.9 | 10-configuracio-inicial.md |
| C11 | Server Manager | A7 | A2 | — | — | — | RA1 | 1.5 | 11-server-manager.md |
| C12 | Rols del servidor | A7 | A2 | — | — | — | RA1 | 1.5 | 12-rols-caracteristiques.md |
| C13 | PowerShell bàsic | A8 | — | — | — | — | RA1 | 1.7 | 13-powershell-basic.md |
| C14 | Monitoratge resources | A11 | — | — | — | — | RA5 | 5.1, 5.2 | 14-monitoratge-recursos.md |
| C15 | Event Viewer | A11 | A4 | A8 | — | A7 | RA5 | 5.3 | 15-visor-esdeveniments.md |
| C16 | Manteniment sistema | A11 | — | — | — | — | RA5 | 5.4 | 16-manteniment-sistema.md |
| C17 | Task Scheduler | A11 | — | — | — | — | RA5 | 5.5 | 17-planificador-tasques.md |
| C18 | unattend.xml | A9 | — | — | — | — | RA1 | 1.6 | 18-automatitzacio-unattend.md |
| C19 | Connectivitat ping/ipconfig | A10 | A4 | — | — | — | RA1 | 1.9 | 19-verificacio-connectivitat.md |
| C20 | AD: bosc, domini, arbre | — | A3 | — | — | — | RA3 | 3.1, 3.2 | 20-conceptes-ad.md |
| C21 | Unitats Organitzatives | — | A5 | A1 | A1 | A2 | RA3 | 3.1 | 21-unitats-organitzatives.md |
| C22 | Instal·lació AD DS | — | A2 | — | — | — | RA3 | 3.4 | 22-installacio-ad-ds.md |
| C23 | Promoció DC | — | A3 | — | — | — | RA3 | 3.5 | 23-promocio-dc.md |
| C24 | DNS integrat AD | — | A3, A4 | — | — | — | RA3 | 3.4 | 24-dns-integrat-ad.md |
| C25 | Usuaris AD | — | A5 | A1 | A1 | A2 | RA2 | 2.1, 2.4 | 25-gestio-usuaris-ad.md |
| C26 | Grups AD | — | A5 | A4 | A2 | — | RA2 | 2.5, 2.6 | 26-gestio-grups-ad.md |
| C27 | Contrasenyes i bloqueig | — | — | — | A5 | — | RA3 | 3.5 | 27-politiques-contrasenya.md |
| C28 | Restriccions horàries | — | — | A3 | — | — | RA2 | 2.3 | 28-restriccions-horaries.md |
| C29 | PowerShell AD | — | — | A9 | — | — | RA2 | 2.8, 2.9 | 29-powershell-ad.md |
| C30 | Unió clients W11 | — | — | A2 | A1 | A2 | RA3 | 3.7 | 30-unio-clients-domini.md |
| C31 | DNS al client | — | — | A2 | A1 | A2 | RA3 | 3.7 | 31-configuracio-dns-client.md |
| C32 | Validació integració | — | — | A2 | — | A2 | RA3 | 3.7, 3.8 | 32-validacio-integracio.md |
| C33 | gpresult /r | — | — | A2 | A8 | A3 | RA3 | 3.8 | 33-gpresult.md |
| C34 | Carpetes compartides | — | — | A5 | A3 | A1 | RA4 | 4.3 | 34-carpetes-compartides.md |
| C35 | Permisos NTFS | — | — | A5 | A3 | A4 | RA4 | 4.1, 4.2 | 35-permisos-ntfs.md |
| C36 | Herència de permisos | — | — | A6 | — | A4 | RA4 | 4.4 | 36-herencia-permisos.md |
| C37 | icacls | — | — | A5, A6 | — | A4 | RA4 | 4.2 | 37-icacls.md |
| C38 | Muntatge carpetes xarxa | — | — | A7 | — | — | RA4 | 4.3 | 38-muntatge-carpetes-xarxa.md |
| C39 | GPO conceptes | — | A6 | — | A5, A6 | A3 | RA3 | 3.6 | 39-gpo-conceptes.md |
| C40 | Default Domain Policy | — | — | — | A5 | — | RA3 | 3.5 | 40-default-domain-policy.md |
| C41 | GPO per UO | — | A6 | — | A6, A7 | A3, A5 | RA3 | 3.6 | 41-gpo-per-uo.md |
| C42 | GPO restriccions alumnes | — | — | — | A7 | — | RA3 | 3.6, 3.8 | 42-gpo-restriccions.md |
| C43 | gpupdate | — | A6 | A8 | A5, A6 | A3 | RA3 | 3.8 | 43-gpupdate.md |
| C44 | Tipus de perfils | — | — | — | A3 | A0 | RA2 | 2.2 | 44-tipus-perfils.md |
| C45 | Carpeta per a perfils mòbils | — | — | — | A3 | A1 | RA4 | 4.1 | 45-carpeta-perfils-mobils.md |
| C46 | Configuració perfils: fitxa vs GPO | — | — | — | A3, A4 | A0, A3 | RA2 | 2.8 | 46-configuracio-perfils-mobils.md |
| C47 | Sufix .v6 | — | — | — | — | A0, A3 | RA2 | 2.8 | 47-sufix-v6.md |
| C48 | Permisos NTFS subcarpetes perfil | — | — | — | — | A4 | RA4 | 4.2 | 48-permisos-ntfs-perfils.md |
| C49 | Redirecció carpetes GPO | — | — | — | — | A5 | RA4 | 4.1 | 49-redireccio-carpetes-gpo.md |
| C50 | Auditoria accés a objectes | — | — | A8 | — | — | RA5 | 5.1, 5.3 | 50-auditoria-acces.md |
| C51 | Diagnòstic perfils mòbils | — | — | — | — | A7 | RA5 | 5.1, 5.4 | 51-diagnostic-perfils.md |
| C52 | PowerShell de diagnòstic | — | — | — | — | A7 | RA5 | 5.6 | 52-powershell-diagnostic.md |

---

## Fase 4 – Índex del manual UT1

### Estructura de carpetes proposada

```
docs/ut1/
├── index.md                          ← presentació del mòdul (ja existent - REVISAR)
├── bloc1-fonaments/
│   ├── 01-so-escriptori-vs-xarxa.md
│   ├── 02-arquitectura-client-servidor.md
│   ├── 03-windows-server-serveis.md
│   ├── 04-virtualitzacio.md
│   └── 05-requisits-maquinari.md
├── bloc2-installacio/
│   ├── 06-modes-installacio.md
│   ├── 07-particionament.md
│   ├── 08-sistemes-fitxers.md
│   ├── 09-installacio-pas-a-pas.md
│   └── 10-configuracio-inicial.md
├── bloc3-administracio/
│   ├── 11-server-manager.md
│   ├── 12-rols-caracteristiques.md
│   ├── 13-powershell-basic.md
│   ├── 14-monitoratge-recursos.md
│   ├── 15-visor-esdeveniments.md
│   ├── 16-manteniment-sistema.md
│   ├── 17-planificador-tasques.md
│   ├── 18-automatitzacio-unattend.md
│   └── 19-verificacio-connectivitat.md
├── bloc4-active-directory/
│   ├── 20-conceptes-ad.md
│   ├── 21-unitats-organitzatives.md
│   ├── 22-installacio-ad-ds.md
│   ├── 23-promocio-dc.md
│   └── 24-dns-integrat-ad.md
├── bloc5-usuaris-grups/
│   ├── 25-gestio-usuaris-ad.md
│   ├── 26-gestio-grups-ad.md
│   ├── 27-politiques-contrasenya.md
│   ├── 28-restriccions-horaries.md
│   └── 29-powershell-ad.md
├── bloc6-clients/
│   ├── 30-unio-clients-domini.md
│   ├── 31-configuracio-dns-client.md
│   ├── 32-validacio-integracio.md
│   └── 33-gpresult.md
├── bloc7-recursos/
│   ├── 34-carpetes-compartides.md
│   ├── 35-permisos-ntfs.md
│   ├── 36-herencia-permisos.md
│   ├── 37-icacls.md
│   └── 38-muntatge-carpetes-xarxa.md
├── bloc8-gpo/
│   ├── 39-gpo-conceptes.md
│   ├── 40-default-domain-policy.md
│   ├── 41-gpo-per-uo.md
│   ├── 42-gpo-restriccions.md
│   └── 43-gpupdate.md
├── bloc9-perfils/
│   ├── 44-tipus-perfils.md
│   ├── 45-carpeta-perfils-mobils.md
│   ├── 46-configuracio-perfils-mobils.md
│   ├── 47-sufix-v6.md
│   ├── 48-permisos-ntfs-perfils.md
│   └── 49-redireccio-carpetes-gpo.md
└── bloc10-monitoratge/
    ├── 50-auditoria-acces.md
    ├── 51-diagnostic-perfils.md
    └── 52-powershell-diagnostic.md
```

**Total: 52 pàgines de contingut + 1 índex del mòdul = 53 fitxers**

---

## Recomanacions pedagògiques

1. **No saltar blocs.** Un alumne que no entén C02 (client-servidor) no pot entendre C23 (DC).
2. **Cada bloc és un projecte.** Bloc 1-3 = Projecte 1 | Bloc 4-5 = Projecte 2 | Bloc 6-7 = Projecte 3 | Bloc 8 = Projecte 4 | Bloc 9-10 = Projecte 5.
3. **C07 (particionament) i C08 (sistemes de fitxers) estan molt relacionats** però convé mantenir-los separats: C07 és procedimental, C08 és conceptual.
4. **C46 és el concepte clau del curs.** La diferència fitxa d'usuari vs GPO per a perfils apareix als Projectes 4 i 5 i genera molts errors. Cal aprofundir.
5. **C13 i C29 (PowerShell)** s'introdueixen en moments molt separats. C13 és bàsic (P1), C29 és avançat (P3). El manual ha de reflectir aquesta progressió.
6. **Errors habituals crítics** identificats als projectes:
   - IP dinàmica en servidor → trenca tots els serveis
   - DNS del client apuntant a Google (8.8.8.8) en comptes del DC → no unió al domini
   - Herència de permisos activada a subcarpetes de perfil → conflictes
   - Configurar perfils per fitxa d'usuari I per GPO alhora → duplicats .v6
   - Carpeta de perfils no netetjada entre Projecte 4 i 5 → errors de sincronització

---

## Proposta de seqüència d'aprenentatge

```
Setmana 1-2: Bloc 1 + Bloc 2 (C01-C10) → Projecte 1 (part 1)
Setmana 3:   Bloc 3 (C11-C19) → Projecte 1 (part 2, monitoratge)
Setmana 4-5: Bloc 4 (C20-C24) → Projecte 2 (AD instal·lació)
Setmana 6:   Bloc 5 (C25-C29) → Projecte 2 (AD gestió)
Setmana 7:   Bloc 6 (C30-C33) → Projecte 3 (part 1, clients)
Setmana 8:   Bloc 7 (C34-C38) → Projecte 3 (part 2, recursos)
Setmana 9:   Bloc 8 (C39-C43) → Projecte 4 (GPO)
Setmana 10:  Bloc 9 (C44-C49) → Projecte 5 (perfils)
Setmana 11:  Bloc 10 (C50-C52) → Projecte 3+5 (monitoratge avançat)
```

---

## Nota sobre llico-1-1.md existent

El fitxer `docs/ut1/llico-1-1.md` generat anteriorment cobreix parcialment C01, C02, C03 i C10 en una sola pàgina. Segons el PROMPT_MESTRE V2, cal que cada pàgina tracti UN únic concepte. Per tant:

- El contingut de `llico-1-1.md` es distribuirà entre `01-so-escriptori-vs-xarxa.md`, `02-arquitectura-client-servidor.md`, `03-windows-server-serveis.md` i `04-virtualitzacio.md`.
- El fitxer `llico-1-1.md` quedarà **obsolet** i s'eliminarà un cop generades les noves pàgines.
- La **lliçó** (tab Activitat 1.1.1) es mantindrà però s'associarà al concepte `09-installacio-pas-a-pas.md`.
