# Examen tipus test · UT2 — Linux Server i LDAP

**Mòdul:** Sistemes Operatius en Xarxa · **Curs:** 2n CFGM SMX
**40 preguntes · 4 opcions (A–D), només una correcta**

**Nom i cognoms:** ______________________________  **Data:** ____________  **Grup:** ______

> Marca una sola resposta per pregunta. No es descompta per errada.

---

## Unitat 2 — Linux Server i LDAP

### Bloc 1 · Fonaments Linux

**1.** Quina diferència caracteritza Ubuntu Server respecte a Windows Server?
- A) Ubuntu Server només té interfície gràfica
- B) S'administra sobretot per CLI i és lliure i gratuït
- C) Windows Server no pot fer de servidor de fitxers
- D) Ubuntu Server no admet usuaris ni permisos

**2.** Què significa que Ubuntu 24.04 sigui una versió **LTS**?
- A) Una versió sense cap mena de suport oficial
- B) Una edició pensada només per a escriptori
- C) Una versió que caduca al cap de sis mesos
- D) Una versió amb suport a llarg termini (LTS)

### Bloc 2 · Instal·lació i xarxa

**3.** Un `netplan` amb `dhcp4: true` i una adreça estàtica a la vegada. Quin és l'error?
- A) `dhcp4: true` entra en conflicte amb una IP estàtica
- B) netplan no admet mai IP estàtica
- C) Cal formatar la interfície abans
- D) L'adreça ha d'anar sense màscara

**4.** Quina ordre actualitza la llista de paquets disponibles?
- A) `apt remove`
- B) `apt purge`
- C) `apt update`
- D) `apt autoremove`

**5.** Quina mesura assegura millor l'accés SSH a un servidor?
- A) Permetre login directe de root amb contrasenya
- B) Usar claus i limitar el port amb ufw
- C) Obrir tots els ports del tallafoc
- D) Desactivar completament l'autenticació

**6.** Per què és important la sincronització horària en un entorn amb autenticació centralitzada?
- A) Perquè fa més ràpida la connexió de xarxa
- B) Perquè redueix molt el consum de disc
- C) Perquè millora la resolució de la pantalla
- D) Perquè un rellotge desajustat trenca Kerberos

**7.** Per a què serveix el fitxer `/etc/hosts`?
- A) Resoldre noms a IP localment, sense DNS
- B) Assignar permisos als fitxers
- C) Configurar el tallafoc del sistema
- D) Guardar les contrasenyes dels usuaris

### Bloc 3 · Administració bàsica de Linux

**8.** Què significa `chmod 750` sobre un directori?
- A) Ningú no hi pot entrar
- B) Tothom hi té control total
- C) Propietari rwx, grup r-x, altres cap
- D) Només lectura per a tothom

**9.** Quina diferència hi ha entre `usermod -aG` i `usermod -G`?
- A) `-aG` reemplaça tots els grups secundaris
- B) `-aG` afegeix un grup sense treure els altres
- C) `-G` afegeix mantenint els anteriors
- D) Són exactament equivalents

**10.** Què conté el fitxer `/etc/shadow`?
- A) Els permisos de tots els fitxers
- B) És un fitxer llegible per qualsevol usuari
- C) Guarda la configuració de la xarxa
- D) Les contrasenyes xifrades (només root)

**11.** Respecte a la línia `#!/bin/bash` d'un script:
- A) Indica l'intèrpret i ha d'anar a la 1a línia
- B) És un comentari qualsevol dins de l'script
- C) Ha d'anar sempre a l'última línia del fitxer
- D) No és necessari en cap cas als scripts

**12.** Què fa la línia de cron `0 2 * * * /home/admin/backup.sh`?
- A) L'executa cada 2 minuts
- B) L'executa cada 2 hores
- C) L'executa cada dia a les 2:00
- D) L'executa cada 2 dies

**13.** A quin port i protocol s'accedeix a Webmin per defecte?
- A) Port 631 per HTTP
- B) Port 10000 per HTTPS
- C) Port 22 per SSH
- D) Port 80 sense xifrar

### Bloc 4 · LDAP – Conceptes

**14.** Per a un centre **100 % Linux**, quina solució de directori encaixa millor?
- A) AD, perquè és programari lliure i gratuït
- B) AD, perquè funciona sense necessitat de DNS
- C) OpenLDAP, perquè ja inclou Kerberos i GPO
- D) OpenLDAP, per la integració nativa amb Linux

**15.** Què és el format **LDIF**?
- A) El format de text per representar entrades del directori
- B) Un protocol de xifratge de xarxa
- C) Un tipus de partició de disc
- D) Una eina gràfica d'administració

**16.** Què fa `ldapsearch`?
- A) Crea usuaris nous al directori
- B) Elimina entrades del directori
- C) Consulta i mostra entrades del directori
- D) Xifra les contrasenyes del directori

**17.** Quin paquet instal·la el servidor OpenLDAP?
- A) `apache2`
- B) `slapd`
- C) `bind9`
- D) `nginx`

**18.** Un LDIF d'usuari sense `posixAccount` ni `gidNumber`. Quin problema tindrà?
- A) L'usuari tindrà permisos excessius al sistema
- B) El directori LDAP sencer es corromprà
- C) La contrasenya quedarà visible en clar
- D) No serà un compte POSIX vàlid a Linux

### Bloc 5 · LDAP – Usuaris i grups

**19.** Què fa `slappasswd`?
- A) Genera un hash SSHA per a la contrasenya
- B) Crea l'estructura del directori
- C) Elimina un usuari del directori
- D) Mostra les entrades del directori

**20.** Un usuari LDAP té `uidNumber: 5000`, però ja existeix un usuari local amb UID 5000. Quin risc hi ha?
- A) Cap risc; són completament independents
- B) El sistema operatiu no arrencarà mai més
- C) Confusió de propietat, perquè s'identifica per número
- D) La contrasenya de l'usuari deixarà de funcionar

**21.** Quins atributs són imprescindibles perquè un usuari LDAP pugui iniciar sessió a Linux?
- A) `cn` i `sn` només
- B) `uidNumber`, `gidNumber`, `homeDirectory`, `loginShell`
- C) `mail` i `telephoneNumber`
- D) `objectClass` i res més

**22.** Què és **phpLDAPadmin**?
- A) És un client de correu electrònic
- B) Substitueix completament el servidor LDAP
- C) És un tallafoc per a LDAP
- D) És una interfície web per gestionar el directori

**23.** Per a què serveix `ldapwhoami`?
- A) Verifica amb quina identitat t'has autenticat al directori
- B) Crea una entrada nova al directori
- C) Elimina el directori sencer
- D) Canvia el port del servei

**24.** Per què és mala pràctica posar `userPassword` en text pla dins d'un LDIF?
- A) Perquè ocupa massa espai dins del directori
- B) Perquè LDAP no admet cap contrasenya
- C) Perquè qualsevol la veuria; s'ha d'usar `slappasswd`
- D) Perquè fa el directori sensiblement més lent

### Bloc 6 · LDAP – Operacions CRUD

**25.** Què fa `ldapmodify`?
- A) Crea el directori des de zero
- B) Modifica atributs d'entrades existents
- C) Només serveix per fer cerques
- D) Reinicia el servei slapd

**26.** Per què convé fer les proves LDAP en un **entorn de proves**?
- A) Per fer el directori més ràpid
- B) Perquè és obligatori per llei
- C) Per estalviar espai de disc
- D) Per provar operacions sense malmetre producció

**27.** Què fa `ldapdelete`?
- A) Elimina entrades del directori
- B) Crea grups nous al directori
- C) Xifra les contrasenyes
- D) Mostra la configuració del servei

### Bloc 7 · SSSD

**28.** Per a què serveix **SSSD**?
- A) Compartir carpetes de xarxa amb NFS
- B) Configurar les regles del tallafoc ufw
- C) Connectar Linux a un directori via PAM/NSS
- D) Gestionar les particions del disc dur

**29.** `ldapsearch` troba l'usuari però `getent passwd usuari` no retorna res. On mires primer?
- A) Al servidor DNS
- B) A `nsswitch.conf` i SSSD (NSS)
- C) Al fitxer `/etc/exports`
- D) A la configuració de netplan

**30.** Quins permisos ha de tenir `sssd.conf`?
- A) Ha de tenir permisos oberts 777
- B) Ha de ser llegible per qualsevol usuari
- C) No necessita cap permís concret
- D) Ha de ser 600 o SSSD no arrenca

**31.** Què confirmen `getent passwd` i `id` sobre un usuari de directori?
- A) Que la resolució de nom↔UID funciona (NSS)
- B) Que la home ja existeix físicament
- C) Que el tallafoc està obert
- D) Que el perfil mòbil està muntat

**32.** Què fa `sssctl config-check`?
- A) Reinicia el servei sssd
- B) Crea usuaris nous al sistema
- C) Comprova la sintaxi de la configuració de SSSD
- D) Munta els recursos NFS

### Bloc 8 · NFS

**33.** Un `/etc/exports` amb `ro` i els clients no poden escriure. Com ho soluciones?
- A) Cal reinstal·lar NFS des de zero
- B) Cal canviar `ro` per `rw` i fer `exportfs -ra`
- C) Cal formatar la carpeta exportada
- D) Cal desactivar el tallafoc del client

**34.** Què fa `showmount -e servidor`?
- A) Munta un recurs NFS al client
- B) Configura el tallafoc del servidor
- C) Crea una exportació nova
- D) Mostra quins recursos exporta un servidor NFS

**35.** Quins ports intervenen típicament en NFS?
- A) 2049 (NFS) i 111 (portmapper)
- B) Només el port 80
- C) El 443 i el 22
- D) El 631 i el 25

### Bloc 9 · Perfils mòbils

**36.** Per a què serveixen el comodí `*` i el símbol `&` a `auto.home`?
- A) Munten totes les carpetes en cada arrencada
- B) Serveixen per xifrar les carpetes personals
- C) Munten qualsevol home sota demanda amb una regla
- D) Bloquegen l'accés de l'usuari a la seva home

**37.** Respecte als perfils mòbils entre Ubuntu 22.04 i 24.04:
- A) No hi ha cap diferència de comportament
- B) El comportament dels perfils mòbils canvia segons la versió
- C) La 24.04 no admet perfils mòbils
- D) La 22.04 no disposa d'autofs

**38.** Què és el fitxer `auto.master`?
- A) És el fitxer de contrasenyes del sistema
- B) Configura el tallafoc del servidor
- C) Defineix les exportacions NFS
- D) És el mapa principal d'autofs que apunta als submapes

**39.** Quin avantatge té muntar la home per autofs+NFS respecte a fer-ho tot per `/etc/fstab`?
- A) Es munta sota demanda i escala millor a molts usuaris
- B) Consumeix sempre molta més memòria
- C) Requereix una línia per a cada usuari
- D) No funciona amb usuaris de LDAP

### Bloc 10 · Diagnòstic

**40.** Un usuari LDAP inicia sessió però queda a `/` i no troba els seus fitxers. Causa més probable?
- A) Que el tallafoc del servidor està tancat
- B) Que la contrasenya introduïda és incorrecta
- C) Que la home no s'ha muntat (autofs/NFS)
- D) Que el domini LDAP no existeix
