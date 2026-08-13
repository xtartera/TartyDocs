# Examen tipus test · UT4 — Integració de sistemes heterogenis

**Mòdul:** Sistemes Operatius en Xarxa · **Curs:** 2n CFGM SMX
**40 preguntes · 4 opcions (A–D), només una correcta**

**Nom i cognoms:** ______________________________  **Data:** ____________  **Grup:** ______

> Marca una sola resposta per pregunta. No es descompta per errada.

---

## Unitat 4 — Integració de sistemes heterogenis

### Bloc 1 · Fonaments de la heterogeneïtat

**1.** Què és un entorn **heterogeni**?
- A) Un entorn amb tots els sistemes del mateix fabricant
- B) Un entorn format només per equips Windows
- C) Un entorn que funciona sense cap xarxa
- D) Un entorn que combina SO de fabricants diferents

**2.** Què és **Samba AD DC**?
- A) Un client de correu electrònic corporatiu
- B) Un controlador de domini compatible amb AD lliure
- C) Un protocol de transport de xarxa
- D) Un sistema de fitxers distribuït

**3.** En què consisteix la fricció d'**identitats** entre Windows i Linux?
- A) Windows identifica per SID i Linux per UID/GID
- B) Tots dos usen exactament el mateix identificador
- C) Les identitats no importen mai en la integració
- D) Només Linux fa servir identificadors

**4.** Quina afirmació sobre permisos NTFS i POSIX és correcta?
- A) Són exactament equivalents entre ells
- B) El POSIX bàsic és més granular que NTFS
- C) NTFS té ACL riques; POSIX bàsic només 3 subjectes
- D) NTFS no té cap sistema de permisos

**5.** Quina condició imposa Kerberos sobre el rellotge?
- A) No li afecta l'hora en absolut
- B) Tolera qualsevol desfasament horari
- C) Necessita el port 80 obert
- D) Rebutja tiquets si el desfasament supera ~5 minuts

**6.** Com es resol la fricció d'identitats en provisionar un Samba AD DC?
- A) Desactivant completament el servei DNS
- B) Provisionant amb `--use-rfc2307` (UID/GID estables)
- C) Formatant els discos en FAT32
- D) Eliminant tots els usuaris del domini

### Bloc 2 · Compartició creuada

**7.** Per exportar NFS des d'un Windows Server 2022 cap a Ubuntu, què cal a Windows?
- A) El rol *Server for NFS*
- B) El paquet `samba`
- C) Instal·lar CUPS
- D) Desactivar el domini

**8.** Com accedeix un client **Linux** a una compartició SMB de Windows?
- A) Amb `exportfs`
- B) Amb `showmount`
- C) Amb `smbclient` o `mount -t cifs`
- D) Amb `useradd`

**9.** Els fitxers d'un recurs muntat apareixen com a propietat de `nobody`/`root`. Causa més probable?
- A) Un problema de xarxa
- B) Que el servidor està apagat
- C) Que falta memòria RAM
- D) Un mapatge d'identitats mal resolt

**10.** Per muntar per NFS un recurs d'Ubuntu des de Windows, què cal a Windows?
- A) El rol *Server for NFS*
- B) La característica *Client for NFS*
- C) El paquet `samba`
- D) El servei CUPS

**11.** Per a què serveix `vfs objects = acl_xattr` a Samba?
- A) Conservar permisos estil Windows en fitxers Linux
- B) Xifrar la connexió SMB de dades
- C) Accelerar la transferència de fitxers
- D) Crear usuaris nous al domini

**12.** En muntar un recurs CIFS, què defineixen `file_mode` i `dir_mode`?
- A) Xifren els fitxers muntats
- B) Obren el tallafoc del client
- C) Defineixen els permisos POSIX aparents
- D) Creen els usuaris del sistema

### Bloc 3 · Autenticació creuada

**13.** Amb quina eina s'uneix un Ubuntu a un domini Active Directory de Windows?
- A) `exportfs`
- B) `smbpasswd`
- C) `useradd`
- D) `realm join` (realmd)

**14.** Quina relació té l'SSSD de la UT4 amb el de la UT2?
- A) És una eina completament diferent
- B) És el mateix SSSD però apuntant a AD
- C) No serveix per a AD
- D) Substitueix Kerberos

**15.** `realm join` falla dient que no troba el domini i el DNS del client és `8.8.8.8`. Causa?
- A) El DNS del client ha d'apuntar al DC
- B) El client no té prou memòria RAM
- C) El domini està formatat en FAT32
- D) Cal desactivar el servei SSSD

**16.** Què fa `oddjob-mkhomedir`?
- A) Xifra la carpeta personal de l'usuari
- B) Elimina la carpeta personal
- C) Crea la home el primer cop que l'usuari entra
- D) Comparteix la home per NFS

**17.** Què és un **TGT** a Kerberos?
- A) Una contrasenya en clar
- B) Un fitxer de configuració del sistema
- C) Un permís NTFS especial
- D) Un tiquet que demostra l'autenticació

**18.** Un usuari de domini no pot entrar a Ubuntu just després de restaurar una instantània. Sospita?
- A) Que el disc està ple
- B) Que el rellotge està desajustat (Kerberos)
- C) Que falta el navegador web
- D) Que el domini ja no existeix

### Bloc 4 · Samba com a AD DC

**19.** Quina ordre provisiona un domini Samba AD DC?
- A) `samba-tool domain provision`
- B) `exportfs -ra`
- C) `smbpasswd -a`
- D) `useradd`

**20.** En mode AD DC, quins serveis cal deshabilitar?
- A) Els serveis sssd i realmd
- B) Els serveis cups i nfs-server
- C) smbd i nmbd (els integra samba-ad-dc)
- D) No cal deshabilitar-ne cap

**21.** Quina ordre crea un usuari al domini Samba?
- A) `useradd`
- B) `adduser`
- C) `smbpasswd -a`
- D) `samba-tool user create`

**22.** Com comproves que el DC és localitzable via DNS (registres SRV)?
- A) `showmount -e`
- B) `host -t SRV _ldap._tcp.domini`
- C) `lpstat -p`
- D) `exportfs -v`

**23.** Per a què serveix `dns forwarder` a `smb.conf`?
- A) Reenviar consultes externes a un DNS d'internet
- B) Xifrar el domini sencer
- C) Crear usuaris del domini
- D) Muntar recursos NFS

**24.** Quina comprovació prèvia és clau per unir un Windows 11 al domini Samba?
- A) Formatar el client abans d'unir-lo
- B) Desactivar Kerberos al client
- C) Que el DNS del client apunti al DC
- D) Instal·lar CUPS al client

**25.** Amb quina ordre s'ajusta la política de contrasenya del domini Samba?
- A) `exportfs`
- B) `smbpasswd`
- C) `chmod`
- D) `samba-tool domain passwordsettings`

**26.** Com han de ser els permisos del directori de perfils mòbils del domini?
- A) 777 per a tothom
- B) Amb sticky bit i grup domain users (aïllament)
- C) No necessita cap permís concret
- D) Ha d'estar sempre completament buit

**27.** Què permet fer RSAT?
- A) Administrar el domini Samba des de Windows (GUI)
- B) Xifrar el disc dur del servidor
- C) Muntar recursos NFS al client
- D) Crear impressores noves a CUPS

**28.** Per què RSAT pot administrar un domini Samba AD?
- A) Perquè Samba és un producte de Microsoft
- B) Perquè no fa falta cap domini actiu
- C) Perquè Samba implementa els protocols d'AD
- D) Perquè RSAT no necessita cap xarxa

**29.** Un centre sense Windows Server i amb pressupost limitat vol un domini. Estratègia recomanada?
- A) Comprar diverses llicències de Windows Server
- B) No unificar la gestió d'usuaris
- C) Usar només un servidor FTP
- D) Muntar un Samba AD DC (sense llicència)

**30.** Quin és l'avantatge principal d'un AD de Windows davant un Samba AD DC?
- A) Que sempre és més barat
- B) Suport oficial i totes les funcions AD
- C) Que no necessita DNS
- D) Que no necessita Kerberos

### Bloc 5 · Recursos i ACLs

**31.** Per què `chmod 770` es queda curt si dos grups diferents necessiten accessos diferents?
- A) POSIX bàsic només distingeix propietari/grup/altres
- B) `chmod` no existeix a Linux
- C) Perquè xifra la carpeta automàticament
- D) Perquè elimina tots els permisos

**32.** Quina eina dóna permisos granulars a diversos grups a Linux?
- A) `smbpasswd`
- B) `exportfs`
- C) `setfacl`/`getfacl` (ACL POSIX)
- D) `lpstat`

**33.** Què aconsegueix `vfs objects = acl_xattr` amb `map acl inherit`?
- A) Xifrar el recurs compartit
- B) Crear usuaris del domini
- C) Muntar recursos NFS
- D) Conservar i heretar ACL estil Windows

**34.** Quin avantatge té l'idmap backend `ad` amb rfc2307?
- A) Ofereix menys seguretat
- B) UID/GID coherents llegits del directori
- C) Xifra tot el trànsit de dades
- D) Més velocitat del disc dur

**35.** "No puc modificar els fitxers muntats des de l'altre sistema." Causa més probable?
- A) Un mapatge d'identitats mal resolt
- B) Falta de memòria al client
- C) Que el domini no existeix
- D) Un problema puntual de DNS

### Bloc 6 · Diagnòstic integral

**36.** Un login de domini falla a Linux. Quina eina comprova els tiquets Kerberos?
- A) `exportfs`
- B) `lpstat`
- C) `klist`
- D) `showmount`

**37.** Quins elements són transversals i crítics en tot entorn heterogeni?
- A) El navegador i el correu electrònic
- B) Els sistemes FAT32 i exFAT
- C) Els protocols FTP i Telnet
- D) El DNS i la sincronització horària

**38.** Què ha de validar un pla de proves integral de l'entorn?
- A) Únicament que el servidor engegui bé
- B) Noms, autenticació dels 2 clients, recursos i impressió
- C) Únicament la memòria RAM lliure
- D) Únicament el color de la pantalla

**39.** Quin és l'ordre lògic per diagnosticar un login de domini que falla?
- A) Comprovar unió, resolució, tiquets i home
- B) Reinstal·lar el client de manera directa
- C) Formatar el controlador de domini
- D) Esborrar tots els usuaris del domini

**40.** Canviar qui fa de DC (Windows AD o Samba AD) en un entorn heterogeni...
- A) Elimina del tot les dificultats d'integració
- B) Fa que el DNS sigui del tot innecessari
- C) No canvia les dificultats de fons (identitats, permisos, Kerberos)
- D) Fa que ja no calguin permisos de cap mena
