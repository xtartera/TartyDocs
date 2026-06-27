---
title: Autenticació real Linux amb LDAP
tags:
  - ut2
  - sssd
  - ldap
---

# :material-login: Autenticació real: login amb usuaris LDAP

!!! abstract "Concepte clau"
    Un cop SSSD i NSS estan configurats correctament, un usuari LDAP pot fer login al sistema Linux exactament igual que un usuari local: amb `su -`, via SSH, o en el prompt de login gràfic. Aquest és l'objectiu de tot el Bloc 6: un sistema Linux que autentica via LDAP de manera transparent.

=== ":material-notebook-outline: Apunts"

    ## Prerequisits per fer login amb LDAP

    Abans de provar el login, verifica que tot el Bloc 6 és correcte:

    ```bash
    # 1. SSSD funciona
    systemctl status sssd | grep "Active:"

    # 2. L'usuari es resol via NSS
    getent passwd maria.puig

    # 3. El servidor LDAP és accessible
    ldapsearch -x -b "ou=usuaris,dc=lafita,dc=local" "(uid=maria.puig)" dn

    # 4. PAM té el mòdul SSSD activat
    grep pam_sss /etc/pam.d/common-auth
    ```

    Si qualsevol d'aquests passos falla, revisa les pàgines anteriors del Bloc 6 abans de continuar.

    ## Verificar que PAM usa SSSD

    Durant la instal·lació de `libpam-sss` (pàgina 28), el paquet activa automàticament el mòdul PAM. Pots verificar-ho:

    ```bash
    grep pam_sss /etc/pam.d/common-auth
    ```

    Ha de mostrar alguna cosa similar a:
    ```text
    auth    [success=2 default=ignore]      pam_sss.so use_first_pass
    ```

    Si la línia no apareix, activa SSSD manualment:
    ```bash
    sudo pam-auth-update --enable sssd
    ```

    ## Preparació del directori home

    !!! warning "El directori `/perfils/` ha d'existir per al login"
        Al Bloc 6, el directori home dels usuaris LDAP (`/perfils/maria.puig`) **no existeix** al servidor. Sense el directori home, el login falla amb: `su: warning: cannot change directory to /perfils/maria.puig: No such file or directory`.

        Als Blocs 7 i 8, NFS i autofs muntaran `/perfils/` automàticament quan un usuari faci login. Per ara, el crearàs manualment per a la prova:

    ```bash
    # Crea els directoris home de prova per als tres usuaris
    sudo mkdir -p /perfils/maria.puig
    sudo mkdir -p /perfils/pere.costa
    sudo mkdir -p /perfils/anna.valls

    # Assigna la propietat correcta (UID i GID de LDAP)
    sudo chown 1001:2001 /perfils/maria.puig
    sudo chown 1002:2001 /perfils/pere.costa
    sudo chown 1003:2001 /perfils/anna.valls

    # Permisos de directori home estàndard
    sudo chmod 700 /perfils/maria.puig
    sudo chmod 700 /perfils/pere.costa
    sudo chmod 700 /perfils/anna.valls
    ```

    ## Primer login: su -

    ```bash
    su - maria.puig
    ```

    Sortida esperada:
    ```text
    Password:
    ```

    Introdueix la contrasenya LDAP de `maria.puig` (la que vas configurar al LDIF amb `slappasswd`). Si tot funciona:

    ```text
    maria.puig@srv-ldap:~$
    ```

    Verifica que ets l'usuari correcte:
    ```bash
    whoami
    # → maria.puig

    id
    # → uid=1001(maria.puig) gid=2001(alumnes) groups=2001(alumnes)

    pwd
    # → /perfils/maria.puig
    ```

    Per tornar a l'usuari anterior:
    ```bash
    exit
    ```

    ## Login via SSH

    Des del mateix servidor (o des del client 192.168.100.20 si en tens un):

    ```bash
    ssh maria.puig@192.168.100.10
    ```

    Sortida esperada (primera connexió):
    ```text
    The authenticity of host '192.168.100.10 (192.168.100.10)' can't be established.
    ED25519 key fingerprint is SHA256:...
    Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
    Warning: Permanently added '192.168.100.10' (ED25519) to the list of known hosts.
    maria.puig@192.168.100.10's password:
    ```

    Introdueix la contrasenya LDAP. Si l'autenticació és correcta:
    ```text
    maria.puig@srv-ldap:~$
    ```

    ## Errors habituals en el primer login

    | Error | Causa | Solució |
    |-------|-------|---------|
    | `Authentication failure` | Contrasenya incorrecta o hash SSHA incorrecte | Verifica: `ldapwhoami -x -D "uid=maria.puig,ou=usuaris,dc=lafita,dc=local" -W` |
    | `No such file or directory: /perfils/maria.puig` | El directori home no existeix | `sudo mkdir -p /perfils/maria.puig && sudo chown 1001:2001 /perfils/maria.puig` |
    | `su: user maria.puig does not exist` | NSS no resol l'usuari | `getent passwd maria.puig` — si falla, revisa nsswitch.conf i SSSD |
    | `Connection refused` (SSH) | SSH no instal·lat o aturat | `sudo apt install -y openssh-server && sudo systemctl start ssh` |
    | `Permission denied (publickey)` | SSH del servidor requereix clau, no contrasenya | Edita `/etc/ssh/sshd_config`: `PasswordAuthentication yes` |

    ## Flux complet de l'autenticació LDAP

    El que passa internament quan `maria.puig` fa login:

    ```mermaid
    sequenceDiagram
        participant U as Usuari (terminal)
        participant PAM as PAM
        participant SSSD as SSSD
        participant LDAP as slapd (LDAP)

        U->>PAM: login: maria.puig<br/>password: ****
        PAM->>SSSD: pam_sss.so: autentica maria.puig
        SSSD->>LDAP: ldap_bind: uid=maria.puig,ou=usuaris,...<br/>contrasenya: ****
        LDAP-->>SSSD: ldap_bind: success (0)
        SSSD-->>PAM: autenticació OK
        PAM->>U: sessió oberta<br/>maria.puig@srv-ldap:~$
    ```

    SSSD verifica la contrasenya fent un **bind LDAP com a l'usuari** (no com a admin) — exactament el que feies manualment amb `ldapwhoami -D "uid=maria.puig,..."`.

    ## Nota sobre els Blocs 7 i 8

    En el laboratori actual, has creat `/perfils/maria.puig` manualment. Als Blocs 7 i 8:

    - **Bloc 7 (NFS)**: el servidor exportarà `/perfils/` per xarxa
    - **Bloc 8 (autofs)**: el client muntarà automàticament `/perfils/usuari` quan un usuari faci login, sense necessitat de crear-lo manualment

    Quan hagis completat els Blocs 7 i 8, podràs eliminar els directoris que acabes de crear:
    ```bash
    sudo rm -rf /perfils/maria.puig /perfils/pere.costa /perfils/anna.valls
    ```
    I els perfils es crearan automàticament via NFS+autofs en cada login.

    !!! tip "Connexió amb UT1"
        A Active Directory, quan un usuari del domini fa login a un PC Windows, el sistema autentica via Kerberos contra el Controlador de Domini i munta el *roaming profile* automàticament. A Linux amb LDAP+SSSD+NFS+autofs, estem construint l'equivalent manual: SSSD fa l'autenticació (com Kerberos) i autofs muntarà el perfil (com el roaming profile de Windows). El resultat és el mateix: l'usuari fa login amb les seves credencials i troba el seu escriptori (o directori home) independentment de quin ordinador usi.

    ??? question "Auto-avaluació"

        **1.** `su - maria.puig` falla amb `Authentication failure`. Quins tres passos de diagnòstic fas i en quin ordre?

        ??? success "Resposta"
            (1) **Verifica que SSSD veu l'usuari**: `getent passwd maria.puig`. Si no retorna res, el problema és de NSS/SSSD (pàgines 29–31), no de contrasenya. (2) **Verifica la contrasenya directament contra LDAP**: `ldapwhoami -x -D "uid=maria.puig,ou=usuaris,dc=lafita,dc=local" -W` — introdueix la contrasenya. Si retorna error 49, la contrasenya és incorrecta o el hash SSHA al LDIF era incorrecte (pàgina 18). Si retorna error 53, l'usuari no té `userPassword`. (3) **Verifica que PAM usa SSSD**: `grep pam_sss /etc/pam.d/common-auth`. Si la línia no apareix, executa `sudo pam-auth-update --enable sssd`.

        **2.** `su - anna.valls` funciona però el terminal mostra: `su: warning: cannot change directory to /perfils/anna.valls: No such file or directory`. La sessió s'obre però a `/`  en lloc de `/perfils/anna.valls`. Explica el problema i la solució provisional.

        ??? success "Resposta"
            L'autenticació ha funcionat (contrasenya correcta, SSSD funciona), però el directori home especificat al LDAP (`homeDirectory: /perfils/anna.valls`) no existeix físicament al servidor. Linux mostra l'avís i obre la sessió al directori arrel `/` com a mesura de seguretat. Solució provisional: `sudo mkdir -p /perfils/anna.valls && sudo chown 1003:2001 /perfils/anna.valls && sudo chmod 700 /perfils/anna.valls`. Solució definitiva (Blocs 7–8): NFS exportarà `/perfils/` i autofs el muntarà automàticament en cada login.

        **3.** Un cop completat el Bloc 6, quins quatre components han de funcionar conjuntament per permetre el login de `maria.puig`? Anomena'ls i la funció de cadascun.

        ??? success "Resposta"
            (1) **OpenLDAP (slapd)**: emmagatzema les credencials i els atributs POSIX de l'usuari (`uid`, `uidNumber`, `gidNumber`, `homeDirectory`, `loginShell`, `userPassword`). (2) **SSSD**: fa de pont entre Linux i LDAP — consulta el directori per obtenir informació d'usuaris i verifica contrasenyes fent un bind LDAP com a l'usuari. (3) **NSS (`/etc/nsswitch.conf`)**: indica al sistema operatiu que consulti SSSD (`sss`) per resoldre noms d'usuari i grup. Sense NSS, `id` i `getent` no funcionarien. (4) **PAM (`pam_sss.so`)**: integra SSSD amb el sistema d'autenticació de Linux. Quan un usuari fa login, PAM delega la verificació de la contrasenya a SSSD.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 6.6 · Login complet amb usuaris LDAP

    **Objectiu**: completar el cicle d'autenticació real: login amb `su -` i via SSH amb els tres usuaris LDAP.

    **Temps estimat**: 25 minuts

    ---

    ### Part A – Prepara els directoris home

    ```bash
    sudo mkdir -p /perfils/{maria.puig,pere.costa,anna.valls}
    sudo chown 1001:2001 /perfils/maria.puig
    sudo chown 1002:2001 /perfils/pere.costa
    sudo chown 1003:2001 /perfils/anna.valls
    sudo chmod 700 /perfils/maria.puig /perfils/pere.costa /perfils/anna.valls
    ```

    ### Part B – Login amb su -

    ```bash
    su - maria.puig
    ```

    Un cop dins:
    ```bash
    whoami
    id
    pwd
    echo "Hola des de LDAP!" > ~/prova.txt
    cat ~/prova.txt
    exit
    ```

    Repeteix per a `pere.costa` i `anna.valls`.

    ### Part C – Login via SSH

    ```bash
    # Des del servidor mateix (loopback)
    ssh maria.puig@localhost
    ```

    Si SSH rebutja l'autenticació per contrasenya, verifica:
    ```bash
    grep PasswordAuthentication /etc/ssh/sshd_config
    # Ha de ser 'yes' o la línia ha d'estar comentada (comportament per defecte)
    ```

    ### Part D – Verifica la caché SSSD

    Canvia la contrasenya de `pere.costa` des de l'admin LDAP:
    ```bash
    # Genera nou hash
    slappasswd
    # Aplica el canvi
    ldapmodify -x -D "cn=admin,dc=lafita,dc=local" -W << 'EOF'
    dn: uid=pere.costa,ou=usuaris,dc=lafita,dc=local
    changetype: modify
    replace: userPassword
    userPassword: {SSHA}NOVA_HASH_AQUI
    EOF
    ```

    Prova el login amb la contrasenya antiga (hauria de fallar o funcionar per caché). Llavors expira la caché i torna a provar:
    ```bash
    sudo sssctl cache-expire -u pere.costa
    su - pere.costa   # ara ha de demanar la nova contrasenya
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Linux LDAP login authentication SSSD su ssh test"`
        - `"PAM SSSD authentication Linux user login test"`
        - `"pam_sss Ubuntu LDAP login complete setup"`
