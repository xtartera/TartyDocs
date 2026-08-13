---
title: Configuració base d'OpenLDAP
tags:
  - ut2
  - ldap
  - openldap
---

# :material-cog: Configuració base amb dpkg-reconfigure slapd

!!! abstract "Concepte clau"
    **`dpkg-reconfigure slapd`** és l'ordre per reconfigurar el servidor OpenLDAP sense haver de reinstal·lar-lo. Et permet establir el domini base (`dc=lafita,dc=local`), el nom de l'organització i la contrasenya de l'administrador. És el pas obligatori si el domini instal·lat per defecte no és el correcte.

=== ":material-notebook-outline: Apunts"

    ## Per quin motiu cal `dpkg-reconfigure`?

    Durant la instal·lació de `slapd` amb `apt`, el diàleg configura un domini base derivat del hostname del servidor. Si el hostname no estava ben configurat en aquell moment, o si vols canviar el domini, cal executar `dpkg-reconfigure slapd` per reconfigura'l sense perdre la base de dades.

    ## Execució pas a pas

    ```bash
    sudo dpkg-reconfigure slapd
    ```

    El comandament obre un **assistent interactiu de text** (ncurses). Segueix les respostes per al laboratori:

    ---

    **Pregunta 1**: *Omit OpenLDAP server configuration?*

    ```
    → No
    ```

    (Si dius "Yes", surt sense fer res.)

    ---

    **Pregunta 2**: *DNS domain name*

    ```
    → lafita.local
    ```

    OpenLDAP converteix automàticament `lafita.local` en `dc=lafita,dc=local`.

    ---

    **Pregunta 3**: *Organization name*

    ```
    → lafita
    ```

    El nom de l'organització s'emmagatzema a l'atribut `o=` de l'entrada arrel. Pot ser qualsevol text descriptiu.

    ---

    **Pregunta 4**: *Administrator password* (i confirmació)

    ```
    → [la contrasenya que indicarà el professor, ex: ldap1234]
    ```

    !!! danger "Contrasenya de l'admin LDAP"
        Aquesta és la contrasenya del compte `cn=admin,dc=lafita,dc=local`. Sense ella no podràs afegir ni modificar entrades LDAP. Anota-la.

    ---

    **Pregunta 5**: *Database backend to use*

    ```
    → MDB
    ```

    MDB (*Memory-Mapped Database*) és el backend per defecte i recomanat a Ubuntu 24.04. És el més ràpid i eficient per a la majoria de casos d'ús.

    ---

    **Pregunta 6**: *Do you want the database to be removed when slapd is purged?*

    ```
    → No
    ```

    Mantén la base de dades fins i tot si desinstal·les `slapd`. Permet recuperar les dades si cal reinstal·lar.

    ---

    **Pregunta 7**: *Move old database?*

    ```
    → Yes
    ```

    Mou la base de dades anterior a `/var/backups/` i crea una nova base buida amb el nou domini.

    ---

    Un cop l'assistent finalitza, `slapd` es reinicia automàticament amb la nova configuració.

    ## Verificació post-configuració

    ```bash
    # Verifica que el domini base és el correcte
    ldapsearch -x -b "" -s base namingContexts
    ```

    Sortida esperada:
    ```text
    namingContexts: dc=lafita,dc=local
    ```

    ```bash
    # Verifica que pots autenticar-te com a admin
    ldapwhoami -x -D "cn=admin,dc=lafita,dc=local" -W
    ```

    Sortida esperada (et demanarà la contrasenya):
    ```text
    Enter LDAP Password:
    dn:cn=admin,dc=lafita,dc=local
    ```

    ```bash
    # Consulta l'arrel del directori per veure les entrades inicials
    ldapsearch -x -b "dc=lafita,dc=local" -D "cn=admin,dc=lafita,dc=local" -W
    ```

    Sortida esperada (directori buit excepte l'entrada arrel i l'admin):
    ```text
    # lafita.local
    dn: dc=lafita,dc=local
    objectClass: top
    objectClass: dcObject
    objectClass: organization
    o: lafita
    dc: lafita

    # admin, lafita.local
    dn: cn=admin,dc=lafita,dc=local
    objectClass: simpleSecurityObject
    objectClass: organizationalRole
    cn: admin
    description: LDAP administrator
    ```

    ## El fitxer `/etc/ldap/ldap.conf`

    Aquest fitxer configura els **valors per defecte dels clients LDAP** (ldapsearch, ldapadd, etc.). Editant-lo pots evitar repetir `-b` i `-H` a cada ordre:

    ```bash
    sudo nano /etc/ldap/ldap.conf
    ```

    Contingut recomanat per al laboratori:
    ```text
    # URI del servidor LDAP
    URI     ldap://localhost

    # Base DN per defecte per a les consultes
    BASE    dc=lafita,dc=local
    ```

    Amb aquesta configuració, `ldapsearch -x "(uid=*)"` equivalent a:
    ```bash
    ldapsearch -x -H ldap://localhost -b "dc=lafita,dc=local" "(uid=*)"
    ```

    ??? question "Auto-avaluació"

        **1.** Executes `dpkg-reconfigure slapd` i en la pregunta "DNS domain name" introdueixes `lafita.local`. Quin serà el DN base del directori resultant?

        ??? success "Resposta"
            `dc=lafita,dc=local`. OpenLDAP converteix automàticament el nom de domini DNS en fragments `dc=`. `lafita.local` té dos components separats per punt: `lafita` → `dc=lafita` i `local` → `dc=local`. El resultat és `dc=lafita,dc=local`. Si el domini fos `escola.cirvianum.cat`, el base DN seria `dc=escola,dc=cirvianum,dc=cat`.

        **2.** Per quin motiu es recomana respondre "No" a la pregunta "Remove database when slapd is purged"?

        ??? success "Resposta"
            Si respons "Yes", quan facis `apt purge slapd` per reinstal·lar (per exemple, per corregir una configuració errònia), la base de dades amb tots els usuaris creats s'eliminarà. Responent "No", la base de dades se conserva a `/var/lib/ldap/` i la pots recuperar si cal. En un entorn de producció, perdre tots els usuaris per una reinstal·lació seria un desastre. Al laboratori, és igualment recomanable per evitar perdre la feina feta.

        **3.** Explica la diferència entre el fitxer `/etc/ldap/ldap.conf` i el directori `/etc/ldap/slapd.d/`.

        ??? success "Resposta"
            Són dues coses completament separades: `/etc/ldap/ldap.conf` és la configuració dels **clients LDAP** (ldapsearch, ldapadd, etc.) — defineix a quin servidor connectar i quina base DN usar per defecte. `/etc/ldap/slapd.d/` és la configuració del **servidor `slapd`** en format OLC (*On-Line Configuration*) — conté tot el que el servidor necessita per funcionar: esquema, backend de base de dades, ACLs, indexos, etc. Modificar `ldap.conf` afecta com tu consultes el directori; modificar `slapd.d/` afecta com el servidor funciona.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.4 · Reconfigura slapd per al laboratori

    **Objectiu**: assegurar que el directori base és `dc=lafita,dc=local` i que l'autenticació d'admin funciona.

    **Temps estimat**: 15 minuts

    ---

    ### Part A – Reconfigura slapd

    ```bash
    sudo dpkg-reconfigure slapd
    ```

    Respon a cada pregunta com s'indica a la teoria. En especial:
    - DNS domain name: `lafita.local`
    - Organization name: `lafita`
    - Database backend: `MDB`

    ### Part B – Verifica el domini base

    ```bash
    ldapsearch -x -b "" -s base namingContexts
    ```

    La sortida ha de mostrar `namingContexts: dc=lafita,dc=local`.

    ### Part C – Verifica l'autenticació d'admin

    ```bash
    ldapwhoami -x -D "cn=admin,dc=lafita,dc=local" -W
    ```

    Introdueix la contrasenya d'admin. La sortida ha de mostrar `dn:cn=admin,dc=lafita,dc=local`.

    ### Part D – Configura ldap.conf

    ```bash
    sudo nano /etc/ldap/ldap.conf
    ```

    Afegeix les línies:
    ```text
    URI     ldap://localhost
    BASE    dc=lafita,dc=local
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"dpkg-reconfigure slapd Ubuntu LDAP domain setup"`
        - `"configure OpenLDAP domain Ubuntu 24.04 slapd"`
        - `"ldap.conf client configuration Ubuntu tutorial"`
