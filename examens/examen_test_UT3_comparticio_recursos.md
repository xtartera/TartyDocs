# Examen tipus test · UT3 — Compartició de recursos (Samba · NFS · CUPS)

**Mòdul:** Sistemes Operatius en Xarxa · **Curs:** 2n CFGM SMX
**40 preguntes · 4 opcions (A–D), només una correcta**

**Nom i cognoms:** ______________________________  **Data:** ____________  **Grup:** ______

> Marca una sola resposta per pregunta. No es descompta per errada.

---

## Unitat 3 — Compartició de recursos

### Bloc 1 · Conceptes

**1.** Per a un entorn amb clients **Windows i Linux barrejats**, quina tecnologia de compartició de fitxers encaixa millor?
- A) NFS, perquè és natiu de Windows
- B) Cap dels dos funciona amb Windows
- C) Samba, perquè el protocol SMB és multiplataforma
- D) NFS, perquè no necessita permisos

**2.** Quin protocol fa servir Samba?
- A) SMB/CIFS
- B) NFS
- C) IPP
- D) FTP

**3.** Per a què serveix CUPS?
- A) Compartir carpetes de fitxers
- B) Gestionar usuaris del sistema
- C) Configurar el tallafoc
- D) Gestionar la impressió en xarxa

### Bloc 2 · Samba: instal·lació

**4.** Què conté la secció `[global]` d'un `smb.conf`?
- A) Defineix un recurs compartit concret
- B) Conté la configuració general del servidor
- C) És el fitxer de contrasenyes
- D) Guarda els permisos NTFS

**5.** Què implica `guest ok = yes` en un recurs amb dades sensibles?
- A) És la configuració més recomanada
- B) Xifra el recurs de manera automàtica
- C) Permet l'accés sense autenticar-se (risc)
- D) Bloqueja completament tots els usuaris

**6.** Quin paquet instal·la el servidor Samba?
- A) `samba`
- B) `nfs-kernel-server`
- C) `cups`
- D) `bind9`

### Bloc 3 · Samba: control d'accés

**7.** Què fa `valid users = @professorat` en un recurs?
- A) Permet l'accés a tothom
- B) Bloqueja el recurs completament
- C) Xifra el recurs
- D) Restringeix l'accés al grup professorat

**8.** Per a què serveix `smbpasswd`?
- A) Canvia la contrasenya de root del sistema
- B) Dóna d'alta un usuari a la base de Samba
- C) Configura el tallafoc
- D) Munta un recurs NFS

**9.** Un usuari existeix a `getent passwd` però no pot connectar-se a Samba. Per què?
- A) Perquè el servidor Samba està apagat
- B) Perquè la carpeta compartida no existeix
- C) Perquè Samba té base pròpia (cal `smbpasswd -a`)
- D) Perquè l'usuari no té carpeta personal

**10.** Com es dóna accés a un recurs Samba a tots els membres d'un grup Linux?
- A) `valid users = @grup`
- B) `guest ok = yes`
- C) `read only = yes`
- D) `browseable = no`

### Bloc 4 · Samba: gestió avançada

**11.** Amb `create mask = 0600`, el grup no pot modificar els fitxers dels companys. Com ho corregeixes?
- A) Posar `guest ok = yes`
- B) Reinstal·lar Samba
- C) Formatar la carpeta compartida
- D) Canviar la màscara a 0660 per donar permís de grup

**12.** Quin avantatge principal té integrar Samba amb LDAP?
- A) Fa el servidor sensiblement més ràpid
- B) Centralitza els usuaris en un sol directori
- C) Elimina la necessitat de permisos
- D) Xifra tot el trànsit automàticament

**13.** Per a què serveixen les **quotes** a Samba?
- A) Per xifrar els fitxers dels usuaris
- B) Per accelerar la transferència de dades
- C) Per limitar l'espai que pot ocupar un usuari
- D) Per bloquejar l'accés per adreça IP

**14.** Què fa `force group` en un recurs Samba?
- A) Assigna un grup propietari fix als fitxers creats
- B) Elimina el grup del sistema
- C) Xifra el grup d'usuaris
- D) Dóna accés de convidat al recurs

### Bloc 5 · NFS: servidor

**15.** Per què és perillós `no_root_squash` a `/etc/exports`?
- A) Fa el servidor NFS més lent
- B) Ocupa massa espai al disc
- C) Impedeix muntar el recurs
- D) El root del client actua com a root al servidor

**16.** Després de modificar `/etc/exports`, què cal fer?
- A) Cal reiniciar tot el servidor
- B) Cal aplicar-ho amb `exportfs -ra`
- C) No cal fer res més
- D) Cal formatar la carpeta

**17.** En què es basa principalment el control d'accés de NFS?
- A) Contrasenya per a cada usuari
- B) Certificats digitals
- C) Adreça IP i UID/GID
- D) Kerberos de manera obligatòria

**18.** Per a què serveix `all_squash` en una exportació NFS?
- A) Fer que tothom accedeixi com un usuari anònim
- B) Donar privilegis de root a tots els clients
- C) Xifrar tot el trànsit de dades NFS
- D) Bloquejar completament l'exportació

### Bloc 6 · NFS: client i client SMB

**19.** Com es fa un muntatge NFS **persistent** en un client?
- A) Amb `showmount`
- B) Amb `smbpasswd`
- C) Reiniciant el client cada cop
- D) Amb una entrada a `/etc/fstab`

**20.** Com accedeixes a una compartició SMB de Windows **des d'un client Linux**?
- A) Amb `exportfs`
- B) Amb `smbclient` o `mount -t cifs`
- C) Amb `showmount`
- D) Amb `useradd`

**21.** En muntar un recurs CIFS, per què s'indiquen `uid`/`gid`?
- A) Per accelerar el muntatge
- B) Per xifrar la connexió
- C) Per assignar la propietat local dels fitxers
- D) Per obrir el tallafoc

**22.** Quins ports has d'obrir amb `ufw` per a NFS?
- A) 2049 i 111
- B) Només el 445
- C) El 631 i el 22
- D) El 80 i el 443

**23.** Quines opcions apliquen seguretat en el muntatge d'un recurs NFS?
- A) `rw` i `sync`
- B) `guest` i `browseable`
- C) `force user`
- D) `noexec`, `nosuid`, `nodev`

### Bloc 7 · CUPS: instal·lació

**24.** A quin port ofereix CUPS la seva interfície web?
- A) 445
- B) 631
- C) 22
- D) 2049

**25.** Com pots provar CUPS sense tenir cap impressora física?
- A) Cal comprar una impressora
- B) No es pot provar de cap manera
- C) Amb una impressora PDF virtual
- D) Amb `showmount`

**26.** Què mostra `lpstat -p`?
- A) L'estat de les impressores i la cua
- B) Els usuaris del sistema
- C) Els recursos NFS exportats
- D) Les regles del tallafoc

**27.** Una impressora està en estat `disabled` amb treballs a la cua. Què cal fer?
- A) Cal reinstal·lar CUPS
- B) Cal formatar el disc
- C) És el comportament normal
- D) Cal reactivar-la perquè surtin els documents

### Bloc 8 · CUPS: compartició

**28.** Com restringeixes la impressió a un grup concret a CUPS?
- A) Amb `valid users` a `smb.conf`
- B) Amb `AllowUser @grup` a la impressora
- C) Amb `exportfs`
- D) Amb `chmod 777`

**29.** Què descriu un fitxer **PPD**?
- A) La ubicació de la impressora
- B) El protocol de xarxa emprat
- C) Les capacitats i el controlador de la impressora
- D) L'usuari propietari del treball

**30.** Què identifica una **URI** d'impressora?
- A) La ubicació i el protocol d'accés
- B) El color per defecte de la impressora
- C) El grup d'usuaris autoritzats
- D) El sistema de fitxers del servidor

**31.** Com poden imprimir els clients **Windows** a una impressora gestionada per CUPS?
- A) Via NFS
- B) Via FTP
- C) Via SSH
- D) Via Samba (compartició de la impressora)

### Bloc 9 · Seguretat en la compartició

**32.** En què consisteix el principi de **mínim privilegi**?
- A) Donar sempre control total per evitar problemes
- B) Donar només els permisos estrictament necessaris
- C) Bloquejar l'accés a absolutament tothom
- D) Compartir-ho tot amb usuaris convidats

**33.** Quina diferència hi ha entre **signar** i **xifrar** una connexió SMB?
- A) Signar amaga el contingut i xifrar no ho fa
- B) Són exactament el mateix mecanisme
- C) Signar dóna integritat; xifrar, confidencialitat
- D) Cap dels dos protegeix realment res

**34.** Per a què serveix el mòdul `full_audit` de Samba?
- A) Registrar les operacions sobre un recurs
- B) Xifrar el recurs compartit
- C) Accelerar les transferències
- D) Crear usuaris nous al sistema

**35.** Per a què serveix `testparm`?
- A) Muntar recursos NFS
- B) Crear impressores noves
- C) Xifrar el trànsit de Samba
- D) Validar la sintaxi de `smb.conf`

**36.** Què fa `smb encrypt = required`?
- A) Desactiva el xifratge del recurs
- B) Obliga a xifrar (rebutja clients sense suport)
- C) Xifra només els noms de fitxer
- D) Redueix la seguretat de la connexió

**37.** Després d'endurir un servei, què cal fer **sempre**?
- A) Reiniciar el servidor sencer cada dia
- B) Esborrar tots els registres del sistema
- C) Provar amb un client autoritzat i un no
- D) Obrir tots els ports del tallafoc

### Bloc 10 · Diagnòstic

**38.** Un client no pot muntar un recurs NFS. Quin és el primer pas raonable?
- A) Comprovar connectivitat, exports i firewall
- B) Reinstal·lar el sistema operatiu del client
- C) Formatar el disc sencer del servidor
- D) Canviar totes les contrasenyes del domini

**39.** Quina eina mostra les connexions Samba actives i el seu estat de xifratge?
- A) `showmount`
- B) `exportfs`
- C) `lpstat`
- D) `smbstatus`

**40.** Has de donar a un departament una carpeta comuna i una impressora. Quin és el millor enfocament?
- A) Fer-ho tot amb accés de convidat obert
- B) Triar el servei adequat i permisos coherents
- C) Donar control total a tots els usuaris
- D) Fer servir només el protocol FTP antic
