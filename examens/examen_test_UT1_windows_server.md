# Examen tipus test · UT1 — Windows Server 2022

**Mòdul:** Sistemes Operatius en Xarxa · **Curs:** 2n CFGM SMX
**40 preguntes · 4 opcions (A–D), només una correcta**

**Nom i cognoms:** ______________________________  **Data:** ____________  **Grup:** ______

> Marca una sola resposta per pregunta. No es descompta per errada.

---

## Unitat 1 — Windows Server 2022

### Bloc 1 · Fonaments

**1.** Quina és la diferència principal entre un SO d'escriptori i un SO de servidor?
- A) Està optimitzat per oferir serveis a molts clients de forma concurrent
- B) Si és d'escriptori, no pot connectar-se a cap xarxa local
- C) El de servidor només funciona en màquines físiques
- D) No hi ha cap diferència tècnica, només el preu

**2.** En el model client-servidor, què caracteritza el servidor?
- A) Sol·licita serveis i espera la resposta d'un altre equip
- B) Només s'usa en xarxes domèstiques petites
- C) Centralitza i proporciona recursos o serveis als equips que els demanen
- D) És sempre l'equip amb menys recursos de maquinari

**3.** Per què s'usa la virtualització en un entorn de pràctiques amb Windows Server?
- A) És l'única manera possible d'instal·lar Windows Server
- B) Elimina completament la necessitat de configurar la xarxa
- C) Fa que el servidor deixi de consumir memòria RAM
- D) Permet provar i aïllar servidors sense maquinari dedicat

**4.** Un servidor farà de Controlador de Domini per a 40 equips i de servidor de fitxers. Quin dimensionament és més raonable?
- A) 512 MB de RAM i disc de 20 GB
- B) RAM i disc amplis, amb IP fixa assignada
- C) IP per DHCP i una sola CPU
- D) FAT32 com a sistema de fitxers i sense IP fixa

### Bloc 2 · Instal·lació

**5.** Quin avantatge principal té el mode **Server Core** respecte a l'Experiència d'escriptori?
- A) Redueix la superfície d'atac i el consum de recursos
- B) Té més eines gràfiques preinstal·lades
- C) No permet cap administració remota
- D) Només pot fer de client, mai de servidor

**6.** Quin sistema de fitxers és el recomanat per a les particions d'un Windows Server?
- A) FAT32, per màxima compatibilitat
- B) exFAT, dissenyat per a servidors
- C) NTFS, amb permisos i registre de transaccions
- D) ext4, sistema natiu de Windows Server

**7.** Per què **no** és bona idea posar sistema, dades i perfils en una única partició?
- A) Windows no permet crear més d'una partició
- B) Les particions múltiples no són compatibles amb NTFS
- C) El sistema no arrencaria en cap cas
- D) Dificulta la gestió, les còpies i la recuperació

**8.** Després d'instal·lar el servidor, quina configuració inicial és imprescindible per a un futur DC?
- A) Desactivar el tallafoc de manera permanent
- B) Assignar una IP estàtica i un nom d'equip adequat
- C) Instal·lar un navegador web modern
- D) Formatar el disc del sistema en FAT32

### Bloc 3 · Administració

**9.** Quina eina centralitza la instal·lació de rols i característiques?
- A) El Bloc de notes de Windows
- B) L'Explorador de fitxers
- C) El Server Manager (Administrador del servidor)
- D) El Visor d'Esdeveniments

**10.** Vols crear 30 usuaris a partir d'un full de càlcul sense fer-ho un a un. Quina és la millor via?
- A) Un script de PowerShell que llegeixi les dades i creï els comptes
- B) Crear-los a mà a l'ADUC, un usuari cada vegada
- C) Copiar i enganxar la carpeta d'un usuari ja existent
- D) No es pot fer; s'han de crear des de cada client

**11.** Veus molts esdeveniments **4625** seguits d'un **4624** per al mateix usuari. Què indica de manera més probable?
- A) Que el servidor s'ha reiniciat de manera inesperada
- B) Que hi ha hagut un error greu del disc dur
- C) Que l'usuari ha canviat el seu nom de compte
- D) Diversos intents fallits i finalment un d'exitós

**12.** Quina eina permet gravar mètriques de rendiment durant hores per analitzar-les després?
- A) L'Administrador de tasques, únicament
- B) El Monitor de rendiment amb conjunts de recollida
- C) El Planificador de tasques del sistema
- D) El Símbol del sistema (cmd)

**13.** Per a què serveix un fitxer **unattend.xml**?
- A) Per registrar tots els errors del sistema
- B) Per desar les contrasenyes dels usuaris
- C) Per automatitzar la instal·lació sense intervenció
- D) Per configurar el Visor d'Esdeveniments

### Bloc 4 · Active Directory

**14.** Quin protocol d'autenticació usa AD de manera nativa sense enviar la contrasenya per la xarxa?
- A) FTP
- B) HTTP
- C) Telnet
- D) Kerberos

**15.** Què és un **bosc** (forest) a Active Directory?
- A) El contenidor de seguretat de nivell més alt d'AD
- B) Una única unitat organitzativa dins d'un domini
- C) Un grup de seguretat amb privilegis especials
- D) Una carpeta compartida replicada entre servidors

**16.** Dins d'un mateix bosc, com són les relacions de confiança entre dominis?
- A) Unidireccionals i sempre configurades a mà
- B) Bidireccionals i transitives, creades automàticament
- C) Inexistents; cal un bosc per cada domini
- D) Només de lectura entre els dominis

**17.** El domini A confia en el domini B (confiança unidireccional). Què implica?
- A) Els usuaris d'A i de B tenen accés total mutu
- B) El domini B queda absorbit dins del domini A
- C) Cap usuari pot iniciar sessió en cap dels dominis
- D) Els usuaris de B poden ser reconeguts a A

**18.** Has establert una relació de confiança amb un altre domini. Un usuari seu accedeix automàticament a una carpeta teva?
- A) Sí, la confiança dóna accés directe a tot
- B) Sí, però només a les carpetes públiques
- C) No; el fa reconegut, però cal assignar-li permisos
- D) No, mai és possible entre dominis diferents

**19.** Quin servei és **crític** perquè un client localitzi el Controlador de Domini (registres SRV)?
- A) DHCP
- B) DNS
- C) FTP
- D) SMTP

### Bloc 5 · Usuaris i grups

**20.** Quina eina gràfica clàssica gestiona usuaris, grups i UO d'un domini?
- A) Usuaris i equips d'Active Directory (ADUC)
- B) L'Administrador de discos
- C) El Monitor de recursos
- D) L'Editor del registre

**21.** Les **restriccions horàries** d'un usuari serveixen per:
- A) Limitar l'espai de disc de l'usuari
- B) Programar l'apagada del servidor
- C) Restringir quins programes pot obrir
- D) Definir en quines hores pot iniciar sessió

**22.** Un professor demana que la seva contrasenya **no caduqui mai**. Quina resposta és més correcta?
- A) Acceptar-ho sense cap condició per a tothom
- B) Eliminar totes les polítiques de contrasenya del domini
- C) Valorar el risc i cercar alternatives abans de fer-ho
- D) Posar la mateixa contrasenya senzilla a tothom

**23.** Quin cmdlet de PowerShell crea un usuari nou a Active Directory?
- A) `Add-Computer`
- B) `New-ADUser`
- C) `New-Item`
- D) `Set-Location`

### Bloc 6 · Clients al domini

**24.** Un client W11 no pot unir-se al domini i el seu DNS apunta a `8.8.8.8`. Causa més probable?
- A) El DNS del client ha d'apuntar al Controlador de Domini
- B) El client no té prou memòria RAM
- C) El domini està format en FAT32
- D) Cal desactivar Kerberos al client

**25.** Quina ordre mostra el domini de l'usuari i els grups de la seva sessió?
- A) `ping domini`
- B) `format C:`
- C) `shutdown /r`
- D) `whoami /all`

**26.** Què fa `gpresult /r`?
- A) Reinicia les polítiques de grup del servidor
- B) Crea una GPO nova al domini
- C) Mostra quines GPO s'apliquen i quines es deneguen
- D) Elimina el perfil de l'usuari actual

### Bloc 7 · Recursos compartits

**27.** En accedir per xarxa, com es combinen els permisos de **compartició** i els **NTFS**?
- A) Preval sempre el permís de compartició
- B) S'aplica el permís més restrictiu dels dos
- C) Preval sempre el permís NTFS
- D) Se sumen tots dos conjunts de permisos

**28.** Quina utilitat de línia de comandes gestiona permisos NTFS?
- A) `icacls`
- B) `ipconfig`
- C) `gpupdate`
- D) `chkdsk`

**29.** Què és l'**herència de permisos** NTFS?
- A) Que només l'administrador tingui permisos
- B) Un tipus de permís exclusiu de la compartició
- C) La còpia de permisos entre servidors diferents
- D) Els permisos es propaguen als subelements

**30.** `Departaments`: *Tothom → Control total* a compartició i *Alumnes → Modificar* a NTFS. Permís efectiu per xarxa d'un alumne?
- A) Control total
- B) Modificar
- C) Cap accés
- D) Només lectura

### Bloc 8 · GPO

**31.** Què és una GPO (directiva de grup)?
- A) Un grup d'usuaris amb permisos especials
- B) Una carpeta compartida del domini
- C) Configuracions aplicades de forma centralitzada
- D) Un tipus de compte de servei del sistema

**32.** Quina GPO conté per defecte les polítiques de contrasenya del domini?
- A) La Default Domain Policy
- B) La GPO local de cada client
- C) Una GPO anomenada Perfils
- D) La política d'auditoria d'accés

**33.** Després de modificar una GPO, quina ordre força l'actualització immediata al client?
- A) `gpresult /z`
- B) `ipconfig /flushdns`
- C) `sfc /scannow`
- D) `gpupdate /force`

**34.** Una GPO apareix com a **denegada per filtratge** a `gpresult`. Què és el més probable?
- A) Que el servidor de domini està apagat
- B) Que la GPO ja no existeix al domini
- C) Que l'usuari o equip queda fora de l'abast
- D) Que cal reinstal·lar el client afectat

### Bloc 9 · Perfils mòbils

**35.** Un **perfil mòbil** permet que:
- A) L'usuari no pugui canviar mai res de la seva configuració
- B) L'usuari trobi el seu escriptori des de qualsevol equip
- C) El servidor s'apagui de manera automàtica
- D) Es comparteixin impressores entre dominis diferents

**36.** Per què apareix la carpeta `usuari.V6` al servidor amb clients Windows 11?
- A) El sufix indica la versió del perfil del client
- B) És un error de configuració del servidor
- C) L'usuari té sis perfils diferents creats
- D) El disc del servidor està completament ple

**37.** La **redirecció de carpetes** (Documents, Escriptori) per GPO serveix per:
- A) Amagar les carpetes a l'usuari final
- B) Xifrar el disc dur del client
- C) Bloquejar l'accés a internet de l'usuari
- D) Desar-les al servidor perquè segueixin l'usuari

**38.** Si configures la carpeta de perfils al servidor només amb permís de **lectura**, què passa?
- A) Tot funcionarà correctament igualment
- B) Els perfils es xifraran automàticament
- C) Els usuaris no podran desar els seus perfils
- D) El servidor denegarà l'inici de sessió local

### Bloc 10 · Diagnòstic

**39.** Per poder investigar després qui ha accedit a una carpeta sensible, què cal fer **prèviament**?
- A) Res; els accessos ja es registren sempre amb detall
- B) Activar l'auditoria d'accés a objectes a la carpeta
- C) Desactivar el tallafoc del servidor
- D) Eliminar els permisos NTFS de la carpeta

**40.** Quin és el flux de diagnòstic més raonable davant una incidència d'accés?
- A) Revisar l'auditoria i correlacionar amb permisos
- B) Reinstal·lar el servidor de manera immediata
- C) Esborrar tots els registres d'esdeveniments
- D) Canviar totes les contrasenyes sense investigar-ho
