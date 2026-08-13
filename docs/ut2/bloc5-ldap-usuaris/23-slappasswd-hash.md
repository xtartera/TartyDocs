---
title: "slappasswd: generació de hash SSHA"
tags:
  - ut2
  - ldap
  - seguretat
---

# :material-lock-check: slappasswd: generació de hash de contrasenya

!!! abstract "Concepte clau"
    **`slappasswd`** és l'eina d'OpenLDAP per generar el hash criptogràfic d'una contrasenya en format **SSHA** (*Salted SHA-1*). El hash resultant és el valor que cal posar al camp `userPassword` dels fitxers LDIF — mai la contrasenya en text clar.

=== ":material-notebook-outline: Apunts"

    ## Per quin motiu usar hash i no text clar?

    Emmagatzemar `userPassword: ldap1234` seria un risc crític: qualsevol accés a la base de dades LDAP (backup, log, exploració anònima) revelaria les contrasenyes. Amb `{SSHA}`, el servidor emmagatzema el hash i, quan un usuari intenta autenticar-se, computa el hash de la contrasenya introduïda i els compara.

    !!! tip "Connexió amb UT1"
        A Active Directory, Windows emmagatzema les contrasenyes com a hash NTLM i Kerberos. El principi és el mateix: mai la contrasenya en text clar. La diferència és que AD ho gestiona tot automàticament; a OpenLDAP ho fem manualment amb `slappasswd`.

    ## Sintaxi i ús

    ```bash
    # Genera el hash interactivament (demana la contrasenya dues vegades)
    slappasswd
    ```

    Exemple de sessió interactiva:
    ```text
    New password: 
    Re-enter new password: 
    {SSHA}K8Z7mXq2vNpL3JwYoRtPeF1cBnDsHgAi
    ```

    El resultat `{SSHA}K8Z7mXq2vNpL3JwYoRtPeF1cBnDsHgAi` és el valor que va al camp `userPassword`.

    ```bash
    # Opció: contrasenya directament (menys segur, queda al historial de bash)
    slappasswd -s ldap1234
    ```

    !!! warning "Cada crida genera un hash diferent"
        Si executes `slappasswd` dues vegades amb la mateixa contrasenya, obtens **dos hash completament diferents**. Això és per disseny: el "salt" (bytes aleatoris afegits) garanteix que dos usuaris amb la mateixa contrasenya tinguin hash diferents, impedint atacs de taula de hash (*rainbow table attacks*). Tots dos hash son igualment vàlids per a la mateixa contrasenya.

    ## Opcions principals

    | Opció | Significat | Exemple |
    |-------|-----------|---------|
    | `-s PASS` | Contrasenya per línia d'ordres | `slappasswd -s ldap1234` |
    | `-h SCHEME` | Esquema de hash | `slappasswd -h {MD5}` (no recomanat) |
    | `-n` | Sense salt (hash pur, menys segur) | No recomanat per a producció |

    Per al laboratori, usa sempre `slappasswd` sense opcions (SSHA per defecte).

    ## Com integrar el hash als fitxers LDIF

    Executa `slappasswd` per a cada usuari i copia el resultat al camp `userPassword`:

    ```bash
    # Pas 1: genera el hash (exemple per a maria.puig)
    slappasswd
    # New password: [escriu la contrasenya]
    # Re-enter: [torna a escriure]
    # → {SSHA}K8Z7mXq2vNpL3JwYoRtPeF1cBnDsHgAi
    ```

    ```ldif
    # Pas 2: posa el hash al fitxer LDIF
    dn: uid=maria.puig,ou=usuaris,dc=lafita,dc=local
    objectClass: inetOrgPerson
    objectClass: posixAccount
    objectClass: shadowAccount
    uid: maria.puig
    cn: Maria Puig
    sn: Puig
    uidNumber: 1001
    gidNumber: 2001
    homeDirectory: /perfils/maria.puig
    loginShell: /bin/bash
    userPassword: {SSHA}K8Z7mXq2vNpL3JwYoRtPeF1cBnDsHgAi
    ```

    ## Automatitzar amb un script

    Si has de generar el hash de molts usuaris i ja saps les contrasenyes, pots automatitzar-ho:

    ```bash
    # Genera hash i l'afegeix directament al fitxer LDIF
    HASH=$(slappasswd -s ldap1234)
    echo "userPassword: $HASH"
    ```

    Sortida:
    ```text
    userPassword: {SSHA}K8Z7mXq2vNpL3JwYoRtPeF1cBnDsHgAi
    ```

    ## Verificació: comprovar que el hash funciona

    Després d'afegir l'usuari al directori (amb `ldapadd`, pàgina següent), pots verificar que la contrasenya és correcta amb `ldapwhoami`:

    ```bash
    ldapwhoami -x \
               -D "uid=maria.puig,ou=usuaris,dc=lafita,dc=local" \
               -W
    # Enter LDAP Password: [escriu la contrasenya original]
    # → dn:uid=maria.puig,ou=usuaris,dc=lafita,dc=local
    ```

    Si la contrasenya és incorrecta, retorna `ldap_bind: Invalid credentials (49)`.

    ??? question "Auto-avaluació"

        **1.** Executes `slappasswd` dues vegades amb la contrasenya `ldap1234` i obtens dos hash completament diferents. Quin d'ells és vàlid per a LDAP?

        ??? success "Resposta"
            **Tots dos** són vàlids i equivalents. El format SSHA (*Salted SHA-1*) afegeix un conjunt de bytes aleatoris (*salt*) abans de computar el hash SHA-1. El resultat final codifica en Base64 tant el hash com el salt. Quan LDAP verifica una contrasenya, extreu el salt del hash emmagatzemat, el combina amb la contrasenya introduïda, computa el SHA-1 i el compara. Qualsevol dels dos hash que hi posis al LDIF permetrà l'autenticació amb `ldap1234`.

        **2.** Per quin motiu no es recomana usar `-h {MD5}` amb `slappasswd`?

        ??? success "Resposta"
            MD5 és un algorisme de hash **criptogràficament obsolet**: existeixen bases de dades de milions de hash MD5 precalculats (*rainbow tables*) que permeten invertir el hash en qüestió de segons. A més, les GPUs modernes poden calcular milions de hash MD5 per segon, fent factibles els atacs de força bruta. SHA-1 (usat per SSHA) tampoc és ideal en entorns d'alta seguretat (on s'usaria bcrypt o Argon2), però és l'estàndard suportat per OpenLDAP per defecte i acceptable per al laboratori. En producció real, es configuraria LDAP per usar `{CRYPT}$6$...` (SHA-512 crypt).

        **3.** Un alumne copia el camp `userPassword: {SSHA}abc123` directament sense executar `slappasswd` (inventa el hash). Què passarà quan intenti autenticar-se?

        ??? success "Resposta"
            L'autenticació fallarà amb `ldap_bind: Invalid credentials (49)`. `{SSHA}abc123` no és un hash vàlid de cap contrasenya real — és una cadena Base64 inventada que no correspon a cap valor calculat correctament. LDAP intentarà extreure el salt i el hash de la cadena, computarà el hash de la contrasenya introduïda, els compararà, i no coincidiran mai. La solució és sempre executar `slappasswd` per generar el hash real d'una contrasenya coneguda.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.3 · Genera els hash de contrasenya per als usuaris

    **Objectiu**: generar els hash SSHA per als tres usuaris del laboratori i preparar el fitxer LDIF complet.

    **Temps estimat**: 15 minuts

    ---

    ### Part A – Genera el hash per a cada usuari

    Al servidor Ubuntu, executa `slappasswd` tres vegades (una per cada usuari) amb la contrasenya que indiqui el professor (ex: `ldap1234`):

    ```bash
    slappasswd
    # → copia el resultat {SSHA}...
    ```

    Anota cada hash (seran tres valors `{SSHA}...` diferents).

    ### Part B – Completa el fitxer LDIF

    Crea o edita `~/alumnes.ldif` i substitueix `HASH_AQUI` per cada hash generat:

    ```bash
    nano ~/alumnes.ldif
    ```

    El fitxer ha de tenir les tres entrades d'usuari amb `userPassword: {SSHA}...` real.

    ### Part C – Verifica el fitxer

    ```bash
    cat ~/alumnes.ldif
    ```

    Comprova que: (1) hi ha una línia en blanc entre cada usuari, (2) `userPassword` comença per `{SSHA}`, (3) `homeDirectory` és `/perfils/` (no `/home/`).

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"slappasswd SSHA hash OpenLDAP password tutorial"`
        - `"LDAP password hash SSHA salted SHA explained"`
        - `"OpenLDAP userPassword SSHA generate slappasswd"`
