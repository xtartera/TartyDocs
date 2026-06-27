---
title: "ldapwhoami: validació d'autenticació"
tags:
  - ut2
  - ldap
---

# :material-check-decagram: ldapwhoami: validació d'autenticació

!!! abstract "Concepte clau"
    **`ldapwhoami`** és l'eina per verificar que un compte LDAP pot autenticar-se correctament. Pregunta al servidor "qui sóc?" i retorna el DN de la sessió activa. És la primera comprovació que has de fer quan afegeixes un usuari nou: si `ldapwhoami` funciona, la contrasenya i el DN de l'usuari son correctes.

=== ":material-notebook-outline: Apunts"

    ## Sintaxi

    ```bash
    ldapwhoami -x -D "DN_del_compte" -W
    ```

    | Opció | Significat |
    |-------|-----------|
    | `-x` | Autenticació simple (*simple bind*) |
    | `-D DN` | DN del compte amb el qual t'autentiques |
    | `-W` | Demana la contrasenya interactivament |
    | `-H URI` | URI del servidor (opcional si `ldap.conf` ja el té) |

    ## Casos d'ús habituals

    ### 1. Verificar l'autenticació de l'admin LDAP

    ```bash
    ldapwhoami -x -D "cn=admin,dc=lafita,dc=local" -W
    ```

    Sortida esperada:
    ```text
    Enter LDAP Password: 
    dn:cn=admin,dc=lafita,dc=local
    ```

    Usa'l immediatament després de `dpkg-reconfigure slapd` per confirmar que la contrasenya d'admin és la correcta.

    ### 2. Verificar l'autenticació d'un usuari del directori

    ```bash
    ldapwhoami -x -D "uid=maria.puig,ou=usuaris,dc=lafita,dc=local" -W
    ```

    Sortida esperada:
    ```text
    Enter LDAP Password: 
    dn:uid=maria.puig,ou=usuaris,dc=lafita,dc=local
    ```

    Usa'l just després de `ldapadd` per confirmar que: (1) l'usuari existeix, (2) la contrasenya `{SSHA}` del LDIF és correcta.

    ### 3. Verificar la connexió anònima (sense autenticació)

    ```bash
    ldapwhoami -x
    ```

    Sortida esperada:
    ```text
    anonymous
    ```

    Si no retorna `anonymous` sinó un error de connexió, el servidor `slapd` no és accessible des d'on executes l'ordre.

    ### 4. Verificar la connexió des d'un client remot

    ```bash
    # Des del client Ubuntu (192.168.100.20)
    ldapwhoami -x -H ldap://192.168.100.10 \
               -D "uid=maria.puig,ou=usuaris,dc=lafita,dc=local" \
               -W
    ```

    Si funciona, confirma que: (1) el port 389 del servidor és accessible, (2) l'autenticació LDAP funciona per xarxa.

    ## Errors freqüents i diagnòstic

    | Error | Codi | Causa | Solució |
    |-------|------|-------|---------|
    | `ldap_bind: Invalid credentials (49)` | 49 | Contrasenya incorrecta | Verifica la contrasenya; potser el hash SSHA és incorrecte |
    | `ldap_bind: No such object (32)` | 32 | El DN no existeix | Verifica el DN exacte amb `ldapsearch` |
    | `ldap_sasl_bind: Can't contact LDAP server (-1)` | -1 | El servidor no és accessible | Comprova `systemctl status slapd` i el port 389 |
    | `ldap_bind: Server is unwilling to perform (53)` | 53 | L'usuari no té `userPassword` al LDIF | Afegeix `userPassword: {SSHA}...` via `ldapmodify` |

    !!! warning "Error 53: l'usuari no té contrasenya"
        Si afegeixes un usuari LDIF sense el camp `userPassword`, l'usuari existeix al directori però no pot autenticar-se. `ldapwhoami` retornarà `ldap_bind: Server is unwilling to perform (53)`. Solució: afegir la contrasenya amb `ldapmodify` (Bloc 5).

    ## Diferència entre `ldapwhoami` i `ldapsearch`

    | Eina | Funció | Quan usar-la |
    |------|--------|-------------|
    | `ldapwhoami` | Verifica la **identitat** d'una autenticació | Per confirmar que un usuari pot fer login |
    | `ldapsearch` | Consulta **dades** del directori | Per veure atributs d'un usuari o grup |

    Tipicament s'usen juntes: `ldapsearch` per veure si l'usuari existeix i quins atributs té, `ldapwhoami` per confirmar que la contrasenya és correcta.

    ??? question "Auto-avaluació"

        **1.** Executes `ldapwhoami -x -D "uid=maria.puig,ou=usuaris,dc=lafita,dc=local" -W` i retorna `ldap_bind: No such object (32)`. Quines causes possibles hi ha?

        ??? success "Resposta"
            L'error 32 indica que el DN especificat no existeix al directori. Les causes habituals: (1) L'usuari `maria.puig` no s'ha afegit encara — verifica amb `ldapsearch -x -b "ou=usuaris,dc=lafita,dc=local" "(uid=*)"`. (2) La OU `ou=usuaris` no existeix — verifica amb `ldapsearch -x -b "dc=lafita,dc=local" -s one "(objectClass=*)"`. (3) Error tipogràfic al DN (per exemple, `ou=usuario` en lloc de `ou=usuaris`, o `dc=lafita,dc=local` mal escrit). Comprova el DN caràcter a caràcter.

        **2.** Per quin motiu s'usa `-W` (contrasenya interactiva) en lloc de `-w ldap1234` (contrasenya a la línia d'ordres)?

        ??? success "Resposta"
            Quan escrius la contrasenya a la línia d'ordres amb `-w ldap1234`, aquesta queda registrada a l'**historial de bash** (`~/.bash_history`) i pot ser vista per qualsevol que tingui accés al fitxer o que executi `history`. A més, apareix als llogs del sistema i en processos en curs (`ps aux` pot mostrar els arguments de les ordres en execució). `-W` evita tots aquests problemes perquè la contrasenya s'introdueix de forma interactiva i no es registra en cap lloc visible.

        **3.** Quin és l'estat final d'un `ldapwhoami` anònim (`ldapwhoami -x` sense `-D`) i per quin motiu és útil?

        ??? success "Resposta"
            Retorna `anonymous`. És útil per verificar que el servidor LDAP és accessible sense necessitat de credencials: si retorna `anonymous`, confirma que (1) el servei `slapd` funciona, (2) el port 389 és accessible, (3) s'accepten connexions LDAP. Si retorna un error de connexió, el problema és el servidor o la xarxa, independent de cap problema d'autenticació. Permet separar "el servidor és accessible" de "les credencials son correctes".

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.5 · Valida l'autenticació dels usuaris del laboratori

    **Objectiu**: confirmar que els tres usuaris del directori poden autenticar-se.

    **Temps estimat**: 15 minuts

    ---

    ### Part A – Verifica l'admin

    ```bash
    ldapwhoami -x -D "cn=admin,dc=lafita,dc=local" -W
    ```

    La sortida ha de ser `dn:cn=admin,dc=lafita,dc=local`.

    ### Part B – Verifica cada usuari

    Repeteix per als tres usuaris del laboratori:

    ```bash
    ldapwhoami -x -D "uid=maria.puig,ou=usuaris,dc=lafita,dc=local" -W
    ldapwhoami -x -D "uid=pere.costa,ou=usuaris,dc=lafita,dc=local" -W
    ldapwhoami -x -D "uid=anna.valls,ou=usuaris,dc=lafita,dc=local" -W
    ```

    Omple la taula de resultats:

    | Usuari | ldapwhoami resultat | Contrasenya correcta? |
    |--------|-------------------|----------------------|
    | `maria.puig` | | |
    | `pere.costa` | | |
    | `anna.valls` | | |

    ### Part C – Prova des del client (opcional)

    Si tens el client Ubuntu configurat a `192.168.100.20`:

    ```bash
    # Al client
    sudo apt install -y ldap-utils
    ldapwhoami -x -H ldap://192.168.100.10 \
               -D "uid=maria.puig,ou=usuaris,dc=lafita,dc=local" -W
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"ldapwhoami verify LDAP authentication tutorial"`
        - `"OpenLDAP test user authentication ldapwhoami bind"`
        - `"ldap_bind invalid credentials 49 fix OpenLDAP"`
