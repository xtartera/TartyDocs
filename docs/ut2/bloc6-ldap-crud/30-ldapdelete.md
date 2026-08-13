---
title: ldapdelete
tags:
  - ut2
  - ldap
  - ldapdelete
---

# :material-account-remove: ldapdelete: eliminació d'entrades LDAP

!!! abstract "Concepte clau"
    **`ldapdelete`** elimina una o més entrades del directori LDAP. A diferència de `ldapmodify`, rep el DN directament com a argument (no cal fitxer LDIF). Una restricció important: **no es pot eliminar una entrada que contingui fills** — cal eliminar els fills primer.

=== ":material-notebook-outline: Apunts"

    ## Sintaxi

    ```bash
    # Elimina una única entrada pel seu DN
    ldapdelete -x -D "cn=admin,dc=lafita,dc=local" -W "DN_a_eliminar"

    # Elimina múltiples entrades des d'un fitxer (un DN per línia)
    ldapdelete -x -D "cn=admin,dc=lafita,dc=local" -W -f fitxer-dns.txt
    ```

    | Opció | Significat |
    |-------|-----------|
    | `-x` | Autenticació simple |
    | `-D DN` | Compte admin per autenticar |
    | `-W` | Contrasenya interactiva |
    | `-f FITXER` | Fitxer amb un DN per línia |
    | `-r` | **No disponible** a `ldap-utils` estàndard — cal eliminar fills manualment |

    ## Exemples del laboratori

    ### Eliminar un usuari

    ```bash
    ldapdelete -x -D "cn=admin,dc=lafita,dc=local" -W \
               "uid=anna.valls,ou=usuaris,dc=lafita,dc=local"
    ```

    Sortida esperada (sense output = èxit):
    ```text
    Enter LDAP Password: 
    ```

    Verifica:
    ```bash
    ldapsearch -x -b "ou=usuaris,dc=lafita,dc=local" "(uid=anna.valls)"
    # Ha de retornar 0 resultats
    ```

    ### Eliminar múltiples usuaris des d'un fitxer

    ```bash
    # Crea el fitxer amb els DNs a eliminar (un per línia)
    cat > ~/ldif/elimina-usuaris.txt << 'EOF'
    uid=pere.costa,ou=usuaris,dc=lafita,dc=local
    uid=maria.puig,ou=usuaris,dc=lafita,dc=local
    EOF

    ldapdelete -x -D "cn=admin,dc=lafita,dc=local" -W \
               -f ~/ldif/elimina-usuaris.txt
    ```

    ### Eliminar un grup

    ```bash
    ldapdelete -x -D "cn=admin,dc=lafita,dc=local" -W \
               "cn=alumnes,ou=grups,dc=lafita,dc=local"
    ```

    ### Eliminar una OU i tot el seu contingut

    Una OU no es pot eliminar si té fills (usuaris, grups o altres OUs). Cal eliminar primer tots els fills:

    ```bash
    # Pas 1: elimina tots els usuaris de la OU
    ldapdelete -x -D "cn=admin,dc=lafita,dc=local" -W \
               "uid=maria.puig,ou=usuaris,dc=lafita,dc=local"
    ldapdelete -x -D "cn=admin,dc=lafita,dc=local" -W \
               "uid=pere.costa,ou=usuaris,dc=lafita,dc=local"
    ldapdelete -x -D "cn=admin,dc=lafita,dc=local" -W \
               "uid=anna.valls,ou=usuaris,dc=lafita,dc=local"

    # Pas 2: ara sí, elimina la OU buida
    ldapdelete -x -D "cn=admin,dc=lafita,dc=local" -W \
               "ou=usuaris,dc=lafita,dc=local"
    ```

    !!! danger "No es pot eliminar una OU amb fills"
        Si intentes `ldapdelete "ou=usuaris,dc=lafita,dc=local"` quan encara hi ha usuaris dins, retornarà `ldap_delete: Not Allowed On Non-leaf (66)`. Al laboratori, el reset complet es fa millor amb `apt purge slapd` que eliminar entrada per entrada.

    ## Script per buidar el directori d'usuaris (reset de laboratori)

    Per tornar a un estat net sense reinstal·lar `slapd`:

    ```bash
    #!/bin/bash
    # reset-ldap-usuaris.sh — elimina tots els usuaris i grups del laboratori
    ADMIN="cn=admin,dc=lafita,dc=local"

    echo "Eliminant usuaris..."
    for uid in maria.puig pere.costa anna.valls; do
        ldapdelete -x -D "$ADMIN" -W \
                   "uid=${uid},ou=usuaris,dc=lafita,dc=local" 2>/dev/null
    done

    echo "Eliminant grups..."
    ldapdelete -x -D "$ADMIN" -W \
               "cn=alumnes,ou=grups,dc=lafita,dc=local" 2>/dev/null

    echo "Eliminant OUs..."
    ldapdelete -x -D "$ADMIN" -W \
               "ou=usuaris,dc=lafita,dc=local" 2>/dev/null
    ldapdelete -x -D "$ADMIN" -W \
               "ou=grups,dc=lafita,dc=local" 2>/dev/null

    echo "Reset completat. Pots tornar a poblar amb ldapadd."
    ```

    !!! warning "El script demana la contrasenya múltiples vegades"
        Cada `ldapdelete` separat demana la contrasenya. Per evitar-ho en un script automatitzat (no recomanat per a producció), pots usar `-w contrasenya` en lloc de `-W`. Al laboratori, és acceptable per senzillesa.

    ## Comparativa de les quatre operacions LDAP (CRUD)

    | Operació | Eina LDAP | Equivalent SQL |
    |----------|----------|---------------|
    | **C**reate | `ldapadd` | `INSERT INTO ...` |
    | **R**ead | `ldapsearch` | `SELECT ... FROM ...` |
    | **U**pdate | `ldapmodify` | `UPDATE ... SET ...` |
    | **D**elete | `ldapdelete` | `DELETE FROM ...` |

    ??? question "Auto-avaluació"

        **1.** Executes `ldapdelete "ou=grups,dc=lafita,dc=local"` i retorna `ldap_delete: Not Allowed On Non-leaf (66)`. Explica per quin motiu i com ho soluciones.

        ??? success "Resposta"
            L'error 66 (*Not Allowed On Non-leaf*) indica que l'entrada que intentes eliminar té **entrades filles** — en aquest cas, el grup `cn=alumnes` dins de `ou=grups`. LDAP no permet eliminar un contenidor que no estigui buit (igual que no pots fer `rmdir` a Linux si la carpeta té fitxers). La solució és eliminar primer tots els fills: `ldapdelete "cn=alumnes,ou=grups,dc=lafita,dc=local"` i, si hi hagués més grups, eliminar-los tots. Un cop la OU estigui buida, `ldapdelete "ou=grups,dc=lafita,dc=local"` funcionarà.

        **2.** Per quin motiu `ldapdelete` no necessita un fitxer LDIF com `ldapadd` i `ldapmodify`?

        ??? success "Resposta"
            Perquè eliminar una entrada únicament requereix conèixer el seu **DN** — cap altre paràmetre addicional. `ldapadd` necessita el fitxer LDIF perquè ha de saber tots els atributs de la nova entrada. `ldapmodify` necessita el fitxer LDIF perquè ha de saber quins atributs canviar i amb quins valors. `ldapdelete` és l'operació més simple: "elimina l'entrada amb aquest DN", sense cap altra informació necessària. Per a múltiples DNs, el paràmetre `-f` accepta un fitxer de text pla (un DN per línia), sense format LDIF.

        **3.** Vols eliminar `anna.valls` però primer comprovar que el DN és exactament el correcte. Quina ordre executes?

        ??? success "Resposta"
            ```bash
            ldapsearch -x -b "ou=usuaris,dc=lafita,dc=local" "(uid=anna.valls)" dn
            ```
            La sortida mostrarà el DN exacte tal com existeix al directori: `dn: uid=anna.valls,ou=usuaris,dc=lafita,dc=local`. Un cop confirmat, l'uses directament a `ldapdelete`. Verificar el DN abans d'eliminar és una bona pràctica: un error tipogràfic al DN de `ldapdelete` causa l'error 32 (*No such object*), però millor que esborrar l'entrada equivocada per descuit.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 5.2 · Elimina i repobla el directori

    **Objectiu**: practicar `ldapdelete` i el cicle complet create→delete→recreate.

    **Temps estimat**: 20 minuts

    ---

    ### Part A – Elimina un usuari i verifica

    ```bash
    ldapdelete -x -D "cn=admin,dc=lafita,dc=local" -W \
               "uid=anna.valls,ou=usuaris,dc=lafita,dc=local"

    ldapsearch -x -b "ou=usuaris,dc=lafita,dc=local" "(uid=*)" uid
    ```

    Ara hi hauria de quedar únicament `maria.puig` i `pere.costa`.

    ### Part B – Torna a afegir `anna.valls`

    ```bash
    ldapadd -x -D "cn=admin,dc=lafita,dc=local" -W -f ~/ldif/alumnes.ldif
    ```

    Hauria de fallar per a les dues primeres entrades (ja existeixen) però tenir èxit per a `anna.valls`. Quants errors retorna? El directori ha quedat complet?

    ### Part C – Prova el reset complet

    ```bash
    # Reset buidant tot el directori d'usuaris
    # (elimina en ordre invers: usuaris → grup → OUs)
    ldapdelete -x -D "cn=admin,dc=lafita,dc=local" -W \
               "uid=maria.puig,ou=usuaris,dc=lafita,dc=local"
    ldapdelete -x -D "cn=admin,dc=lafita,dc=local" -W \
               "uid=pere.costa,ou=usuaris,dc=lafita,dc=local"
    ldapdelete -x -D "cn=admin,dc=lafita,dc=local" -W \
               "uid=anna.valls,ou=usuaris,dc=lafita,dc=local"
    ldapdelete -x -D "cn=admin,dc=lafita,dc=local" -W \
               "cn=alumnes,ou=grups,dc=lafita,dc=local"
    ldapdelete -x -D "cn=admin,dc=lafita,dc=local" -W \
               "ou=usuaris,dc=lafita,dc=local"
    ldapdelete -x -D "cn=admin,dc=lafita,dc=local" -W \
               "ou=grups,dc=lafita,dc=local"

    # Verifica que el directori està buit (únicament l'arrel i l'admin)
    ldapsearch -x -b "dc=lafita,dc=local" "(objectClass=*)" dn

    # Repobla des del fitxer complet
    ldapadd -x -D "cn=admin,dc=lafita,dc=local" -W \
            -f ~/ldif/laboratori-complet.ldif
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"ldapdelete OpenLDAP delete entry tutorial"`
        - `"LDAP delete user group OU command line"`
        - `"ldapdelete not allowed non-leaf error fix"`
