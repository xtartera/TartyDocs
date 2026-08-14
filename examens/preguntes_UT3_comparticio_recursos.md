# Dossier de preguntes · UT3 — Compartició de recursos (Samba · NFS · CUPS)

**Mòdul:** Sistemes Operatius en Xarxa · **Curs:** 2n CFGM SMX

**Nom i cognoms:** ______________________________  **Data:** ____________  **Grup:** ______

> Preguntes de resposta escrita. Respon amb les teves pròpies paraules i justifica sempre la resposta.

---

## Bloc 1 · Conceptes de compartició

**1.** Explica què és la compartició de recursos en un entorn de xarxa i quins tres tipus de recursos posa a disposició dels clients un servidor.

**2.** Compara els protocols SMB, NFS i IPP: quin port utilitza cadascun i quin tipus de recurs comparteix.

**3.** Un centre té 20 equips Windows i 5 equips Linux que han d'accedir a la mateixa carpeta de projectes. Justifica quina tecnologia de compartició (Samba, NFS o totes dues) recomanaries i per què.

**4.** Explica la diferència entre el mecanisme d'autenticació de Samba i el de NFS.

**5.** Per a un clúster de 50 nodes exclusivament Linux que comparteixen un directori de dades, justifica per què NFS és més adequat que Samba en aquest escenari.

**6.** Relaciona la compartició de recursos a Linux (UT3) amb l'equivalent que vas veure a Windows Server (UT1): quina tecnologia Linux fa la funció de "Carpetes compartides" de Windows i quina fa la funció de perfils/DFS?

## Bloc 2 · Samba: instal·lació

**7.** Descriu la funció dels dos dimonis principals de Samba (`smbd` i `nmbd`) i indica en quins ports escolta cadascun.

**8.** Explica els passos, amb les ordres corresponents, per instal·lar Samba en un servidor Ubuntu i verificar que els dimonis s'han iniciat correctament.

**9.** Descriu l'estructura general d'un fitxer `smb.conf`: quina diferència hi ha entre la secció `[global]` i les seccions de recurs compartit?

**10.** Explica per a què serveix l'ordre `testparm` i en quin moment del procés de modificació de `smb.conf` s'ha d'executar.

**11.** Un tècnic modifica `smb.conf` per afegir un recurs nou, però els clients no el veuen. Explica quina pot ser la causa i com es resol.

**12.** Explica què significa `guest ok = yes` en un recurs Samba i quina directiva addicional de la secció `[global]` cal perquè funcioni correctament amb usuaris desconeguts.

**13.** Un recurs té `guest ok = yes` a `smb.conf` però els usuaris no poden escriure-hi. Explica quina altra capa de permisos cal revisar i per què.

## Bloc 3 · Samba: control d'accés

**14.** Explica la diferència entre les directives `valid users` i `write list` en un recurs Samba, amb un exemple.

**15.** Descriu els dos nivells de control d'accés que aplica Samba quan un client es connecta a un recurs restringit, i explica per què cal que tots dos es compleixin.

**16.** Explica per què cal executar `smbpasswd -a` per a un usuari que ja existeix al sistema Linux, i què passaria si només s'hagués creat amb `adduser`.

**17.** Explica l'avantatge d'utilitzar la notació `@grup` a `valid users` en comptes de llistar els usuaris un per un, i com afecta la gestió quan s'incorpora un usuari nou.

**18.** Descriu els passos (ordres incloses) per crear un grup Linux, afegir-hi usuaris i configurar un recurs Samba perquè només hi accedeixin els membres d'aquest grup.

**19.** Explica per què Samba manté una base de dades de contrasenyes pròpia (`tdbsam`) diferent de la contrasenya del sistema Linux, i quina conseqüència té si es canvia la contrasenya de Linux amb `passwd`.

**20.** Indica quina ordre permet desactivar temporalment el compte Samba d'un usuari sense eliminar-lo, i en quina situació faries servir aquesta opció en comptes d'eliminar-lo directament.

## Bloc 4 · Samba: gestió avançada

**21.** Explica com funciona `create mask` sobre els permisos que demana un client en crear un fitxer via Samba, amb un exemple numèric.

**22.** Descriu la diferència entre `create mask` i `force create mode`, i per què normalment s'utilitza la primera.

**23.** Explica per a què serveix la directiva `force user` en un recurs de treball compartit i quin problema concret evita.

**24.** Descriu com Samba pot simular l'espai disponible d'un recurs amb `dfree command`, i quin format ha de retornar el script perquè funcioni.

**25.** Explica la diferència entre `max file size` (Samba) i les quotes de disc del sistema de fitxers Linux, pel que fa a l'abast de la limitació.

**26.** Explica què significa canviar el `passdb backend` de Samba de `tdbsam` a `ldapsam`, i quin avantatge aporta en un entorn amb diversos servidors Samba.

**27.** Relaciona la integració Samba-LDAP amb el que vas treballar a la UT2: per què no cal crear usuaris nous al directori, sinó "ampliar" els existents?

## Bloc 5 · NFS: servidor

**28.** Explica el model de seguretat de NFS: per quins dos mecanismes es controla qui pot accedir a una exportació i quines dades s'hi poden manipular.

**29.** Compara les versions NFSv3 i NFSv4 pel que fa als ports que utilitzen, i explica per què NFSv4 simplifica la configuració del firewall.

**30.** Descriu els passos, amb ordres, per instal·lar el servidor NFS en un Ubuntu Server i preparar un directori d'exportació.

**31.** Explica el format d'una línia de `/etc/exports` i posa un exemple que permeti lectura i escriptura a tota una subxarxa /24.

**32.** Un tècnic escriu `/srv/nfs/dades 192.168.100.20 (rw,sync)` a `/etc/exports` (amb un espai abans del parèntesi). Explica quin efecte real té aquest error i per què és perillós.

**33.** Explica la diferència entre les opcions `sync` i `async` a `/etc/exports`, i quina recomanaries per defecte.

**34.** Descriu la diferència entre `root_squash` i `no_root_squash`, i per quin motiu `no_root_squash` es considera una configuració arriscada.

**35.** Explica per a què serveix l'ordre `exportfs -ra` i per què cal executar-la després de modificar `/etc/exports`.

**36.** Explica la diferència entre `showmount -e` i `exportfs -v` a l'hora de verificar les exportacions NFS d'un servidor.

## Bloc 6 · NFS i client SMB des de Linux

**37.** Descriu els passos per muntar manualment una exportació NFS des d'un client Linux, incloent-hi la instal·lació prèvia necessària.

**38.** Explica la diferència entre les opcions de muntatge `hard` i `soft` a NFS, i quins riscos té cadascuna.

**39.** Explica per què l'opció `_netdev` és imprescindible en una entrada NFS a `/etc/fstab`, i què pot passar si s'omet.

**40.** Compara els tres mètodes de muntatge NFS (manual, `/etc/fstab` i `autofs` de la UT2) pel que fa a quan es munta el recurs i si persisteix després d'un reinici.

**41.** Explica com es pot donar accés de lectura/escriptura a un client concret i accés de només lectura a la resta de la subxarxa per a la mateixa exportació NFS.

**42.** Descriu per a què serveixen les opcions de muntatge `noexec` i `nosuid`, i explica per quin motiu no protegeixen totalment contra l'execució de scripts interpretats.

**43.** Explica per què `noexec` i `nosuid` s'apliquen al costat del client i no del servidor, i quina conseqüència té això per a la seguretat real de l'exportació.

**44.** Quins dos ports cal obrir al tallafoc (UFW) perquè un client pugui muntar una exportació NFSv3, i per què en calen dos?

**45.** Explica la diferència entre `root_squash` i `all_squash`, i posa un exemple de quan faries servir `all_squash` amb `anonuid`/`anongid`.

**46.** Explica per què és important que els UID i GID coincideixin entre client i servidor quan no s'utilitza `all_squash`, i quin problema apareix si no coincideixen.

**47.** Explica la diferència pràctica entre `smbclient` i `mount -t cifs` per accedir a una compartició SMB des d'un client Linux.

**48.** Per què cal indicar les opcions `uid` i `gid` en muntar un recurs CIFS des de Linux, i què passa si s'ometen?

**49.** Descriu com es pot muntar de forma persistent i segura una compartició SMB a `/etc/fstab` sense exposar la contrasenya en clar.

## Bloc 7 · CUPS: instal·lació

**50.** Explica l'arquitectura bàsica de CUPS: quin paper té el dimoni `cupsd`, els filtres i els backends.

**51.** Descriu els passos per instal·lar CUPS amb la impressora PDF virtual en un Ubuntu Server i verificar que el servei funciona.

**52.** Explica per què un usuari acabat d'afegir al grup `lpadmin` no pot administrar CUPS immediatament, i què cal fer perquè el canvi tingui efecte.

**53.** Per defecte, CUPS escolta únicament a `127.0.0.1:631`. Explica què significa això i quina conseqüència té per als clients de la xarxa.

**54.** Descriu les seccions principals de la interfície web de CUPS (Administration, Printers, Jobs...) i per a què serveix cadascuna.

**55.** Un usuari rep un error "403 Forbidden" en intentar administrar CUPS des de la interfície web. Explica tres coses que hauries de comprovar.

**56.** Explica com funciona `cups-pdf` (des que un usuari imprimeix fins que obté el fitxer) i on es desa el PDF resultant per defecte.

**57.** Un usuari imprimeix amb `sudo lp -d PDF fitxer.txt` i no troba el PDF resultant al seu directori. Explica per què passa això i com s'hauria d'haver fet.

**58.** Explica la diferència entre `lpstat -p` i `lpq`, i quina faries servir per saber si una impressora concreta està activa o aturada.

**59.** Descriu quines ordres utilitzaries per enviar un document a la impressora `PDF` amb 3 còpies, consultar la cua i cancel·lar-ne un treball concret.

## Bloc 8 · CUPS: compartició en xarxa

**60.** Explica quins dos canvis cal fer a `cupsd.conf` perquè CUPS accepti connexions des d'altres equips de la xarxa, i per què cal fer tots dos.

**61.** Un administrador canvia `Listen localhost:631` per `Listen 0.0.0.0:631` però els clients externs continuen rebent un error 403. Explica quina configuració falta.

**62.** Explica com es restringeix l'ús d'una impressora concreta a un grup Linux determinat des de `cupsd.conf`, indicant les dues directives necessàries dins del bloc `<Location>`.

**63.** Quina diferència hi ha entre `Require user @alumnes` i `Require valid-user` en un bloc `<Location>` de CUPS?

**64.** Explica la diferència entre una URI d'impressora i un fitxer PPD: quina informació aporta cadascun i per què tots dos són necessaris.

**65.** Descriu l'ordre `lpadmin` necessària per afegir, des d'un client, una impressora remota que apunta a la impressora `PDF` d'un servidor CUPS via IPP.

**66.** Explica com es pot compartir una impressora gestionada per CUPS amb clients Windows fent servir Samba, i quin paper té la secció `[printers]` de `smb.conf`.

**67.** A banda de Samba, explica quina altra via poden fer servir els clients Windows 10/11 per connectar-se directament a una impressora CUPS.

## Bloc 9 · Seguretat en la compartició

**68.** Explica el principi de mínim privilegi aplicat a un recurs compartit i per què és preferible assignar permisos a grups en lloc de a usuaris individuals.

**69.** Tria dues males pràctiques habituals en la compartició de recursos (Samba o NFS) descrites als apunts i explica com es corregeixen.

**70.** Explica la diferència entre la signatura SMB i el xifratge SMB: què protegeix cadascuna i quina és la diferència entre "integritat" i "confidencialitat" en aquest context.

**71.** Explica els tres valors possibles de la directiva `smb encrypt` (`off`, `desired`, `required`) i quin inconvenient pot tenir exigir el xifratge a tots els clients.

**72.** Descriu per a què serveix el mòdul `full_audit` de Samba i quin risc té activar-lo de manera indiscriminada a tots els recursos.

**73.** Relaciona l'auditoria d'accessos a Samba (`full_audit` + syslog) amb l'eina equivalent que vas fer servir a Windows Server (UT1).

**74.** Explica per què no n'hi ha prou de configurar una restricció d'accés: quin pas addicional cal fer per comprovar que realment funciona.

**75.** Resumeix, per a cadascun dels tres serveis (Samba, NFS, CUPS), dues mesures d'enduriment que aplicaries abans de posar-los en producció.

## Bloc 10 · Diagnòstic

**76.** Descriu el protocol general de diagnòstic d'un problema de compartició de recursos, des de la comprovació més senzilla fins a la més complexa.

**77.** Un usuari rep l'error `NT_STATUS_LOGON_FAILURE` en connectar a un recurs Samba. Explica la causa més probable i com se soluciona.

**78.** Un client executa `mount -t nfs servidor:/srv/nfs/dades /mnt/nfs` i rep `mount.nfs: access denied`. Indica tres causes possibles i en quin ordre les comprovaries.

**79.** Un usuari envia un treball d'impressió a CUPS però no troba el PDF resultant. Explica la causa més probable, relacionant-ho amb el que vas veure al Bloc 7.

**80.** Explica per què no és recomanable reiniciar un servei com a primera acció de diagnòstic, i quin hauria de ser el primer pas en el seu lloc.

**81.** Indica, per a Samba, NFS i CUPS respectivament, quina ordre faries servir per comprovar ràpidament que el servei escolta al port que li correspon.
