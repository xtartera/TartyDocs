---
title: "sssctl: diagnòstic de SSSD"
tags:
  - ut2
  - sssd
  - diagnostic
---

# :material-bug-check: sssctl: diagnòstic de SSSD

!!! abstract "Concepte clau"
    `sssctl` (*SSSD control*) és l'eina de diagnòstic oficial de SSSD. Permet verificar la configuració, consultar l'estat dels dominis, inspeccionar la caché i forçar-ne la renovació. Quan `getent` no funciona i SSSD sembla arrencat, `sssctl` és el primer lloc on mirar.

=== ":material-notebook-outline: Apunts"

    ## Instal·lació

    `sssctl` forma part del paquet `sssd-tools`:

    ```bash
    sudo apt install -y sssd-tools   # (ja instal·lat si has seguit la pàgina 28)
    ```

    ## Verificació de la configuració: config-check

    ```bash
    sudo sssctl config-check
    ```

    Sortida si la configuració és correcta:
    ```text
    Issues identified by validators: 0
    Messages generated during configuration merging: 0
    Used configuration snippet files: 0
    ```

    Sortida si hi ha errors:
    ```text
    [rule/allowed_subdomain_options]: Attribute 'enumerate' is not allowed in section 'domain/lafita'. Check for typos.
    Issues identified by validators: 1
    ```

    `sssctl config-check` detecta:
    - Paràmetres mal escrits o mal ubicats
    - Seccions mal nomenades
    - Errors de sintaxi INI (claudàtors no tancats, etc.)

    !!! warning "config-check no comprova la connectivitat LDAP"
        `sssctl config-check` valida la sintaxi del fitxer però no verifica si el servidor LDAP és accessible ni si el DN base existeix. Per verificar la connectivitat, usa `ldapsearch -x -b "dc=lafita,dc=local"`.

    ## Estat dels dominis: domain-list i domain-status

    ```bash
    # Llista els dominis configurats
    sudo sssctl domain-list
    ```
    ```text
    lafita
    ```

    ```bash
    # Estat del domini 'lafita'
    sudo sssctl domain-status lafita
    ```

    Sortida esperada:
    ```text
    Online status: Online

    Active servers:
    LDAP: 192.168.100.10

    Discovered LDAP servers:
    - 192.168.100.10
    ```

    Si el domini és `Offline`:
    ```bash
    # Verifica connectivitat al servidor LDAP
    ping -c 3 192.168.100.10
    ldapsearch -x -H ldap://192.168.100.10 -b "" -s base namingContexts
    ```

    ## Comprovació d'un usuari concret: user-checks

    ```bash
    sudo sssctl user-checks maria.puig
    ```

    Sortida esperada:
    ```text
    user: maria.puig
    action: acct
    service: system-auth

    SSSD nss user lookup result:
     - user name: maria.puig
     - user id: 1001
     - group id: 2001
     - gecos: Maria Puig
     - home directory: /perfils/maria.puig
     - shell: /bin/bash
    ```

    Si l'usuari no es troba, `sssctl user-checks` mostra l'error exacte i on ha fallat la cerca.

    ## Gestió de la caché

    La caché de SSSD pot causar inconsistències quan modifiques el directori LDAP:

    ```bash
    # Veure l'estat de la caché per a un usuari concret
    sudo sssctl cache-expire -u maria.puig

    # Expirar TOTA la caché (força re-consulta LDAP en la pròxima operació)
    sudo sssctl cache-expire -E

    # Reiniciar SSSD (també buidarà la caché en memòria)
    sudo systemctl restart sssd
    ```

    !!! tip "Quan usar cache-expire"
        Usa `sssctl cache-expire -E` quan:
        - Has modificat un usuari LDAP amb `ldapmodify` i `getent` continua mostrant el valor antic
        - Has afegit un usuari nou amb `ldapadd` i `getent` no el troba
        - Has canviat la contrasenya d'un usuari i el login continua fallant

    ## Logs de SSSD

    SSSD genera logs detallats per a cada servei:

    ```bash
    # Logs generals de SSSD (últimes 50 línies)
    journalctl -u sssd -n 50

    # Logs del servei NSS (resolució de noms)
    sudo tail -f /var/log/sssd/sssd_nss.log

    # Logs del servei PAM (autenticació)
    sudo tail -f /var/log/sssd/sssd_pam.log

    # Logs del domini lafita (consultes LDAP)
    sudo tail -f /var/log/sssd/sssd_lafita.log
    ```

    ### Augmentar el nivell de log (per a diagnòstic profund)

    Afegeix a `/etc/sssd/sssd.conf` (secció `[domain/lafita]`):

    ```ini
    debug_level = 7
    ```

    Reinicia SSSD i observa `/var/log/sssd/sssd_lafita.log` en temps real:

    ```bash
    sudo chmod 600 /etc/sssd/sssd.conf
    sudo systemctl restart sssd
    sudo tail -f /var/log/sssd/sssd_lafita.log
    ```

    !!! warning "Treu `debug_level` quan no el necessitis"
        El `debug_level = 7` genera molta informació i pot omplir el disc ràpidament. Un cop resolt el problema, elimina la línia i reinicia SSSD.

    ## Resum d'ordres de diagnòstic

    | Ordre | Quan usar-la |
    |-------|-------------|
    | `sudo sssctl config-check` | Primer pas: verifica que `sssd.conf` no té errors de sintaxi |
    | `sudo sssctl domain-list` | Confirma que el domini `lafita` és reconegut |
    | `sudo sssctl domain-status lafita` | Verifica si SSSD pot arribar al servidor LDAP |
    | `sudo sssctl user-checks maria.puig` | Verifica si un usuari concret és resolt per SSSD |
    | `sudo sssctl cache-expire -E` | Força re-consulta al servidor LDAP, descartant la caché |
    | `journalctl -u sssd -n 50` | Veu els últims events del servei SSSD |
    | `sudo tail -f /var/log/sssd/sssd_lafita.log` | Diagnòstic detallat de les consultes al domini LDAP |

    ??? question "Auto-avaluació"

        **1.** `sssctl config-check` retorna 0 errors però `getent passwd maria.puig` no funciona. Quins passos de diagnòstic fas a continuació?

        ??? success "Resposta"
            `sssctl config-check` únicament valida la sintaxi del fitxer — no comprova la connectivitat. El flux seria: (1) `sudo sssctl domain-status lafita` — si mostra `Offline`, el problema és de connectivitat al servidor LDAP. (2) `ping 192.168.100.10` — verifica que el servidor és accessible per xarxa. (3) `ldapsearch -x -b "dc=lafita,dc=local" "(uid=maria.puig)"` — comprova que l'usuari existeix al directori. (4) `grep sss /etc/nsswitch.conf` — verifica que `sss` apareix a la línia `passwd`. (5) Si tot el precedent és correcte, `sudo sssctl cache-expire -E` i torna a provar `getent`.

        **2.** Has canviat la contrasenya de `pere.costa` amb `ldapmodify` (pàgina 23) però `su - pere.costa` continua acceptant la contrasenya antiga. Per quin motiu? Com ho soluciones?

        ??? success "Resposta"
            SSSD ha guardat les credencials antigues a la caché (`cache_credentials = true`). Quan un usuari s'ha autenticat prèviament, SSSD pot verificar futures autenticacions contra la caché local sense consultar LDAP — per donar servei offline i reduir la càrrega. La solució és expirar la caché per a `pere.costa`: `sudo sssctl cache-expire -u pere.costa`. Alternativament, `sudo sssctl cache-expire -E` expira tota la caché. Després del canvi, `su - pere.costa` consulta LDAP directament i verifica la nova contrasenya.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 6.5 · Diagnòstic complet amb sssctl

    **Objectiu**: usar les eines de diagnòstic de SSSD per verificar i depurar la integració LDAP.

    **Temps estimat**: 20 minuts

    ---

    ### Part A – Verificació de la configuració

    ```bash
    sudo sssctl config-check
    sudo sssctl domain-list
    sudo sssctl domain-status lafita
    ```

    Anota la sortida de cada comanda. El domini ha d'estar `Online`.

    ### Part B – Comprovació d'usuaris

    ```bash
    sudo sssctl user-checks maria.puig
    sudo sssctl user-checks pere.costa
    sudo sssctl user-checks anna.valls
    ```

    ### Part C – Prova de la caché

    ```bash
    # Pas 1: expirar la caché
    sudo sssctl cache-expire -E

    # Pas 2: verificar que getent continua funcionant (re-consulta LDAP)
    getent passwd maria.puig
    id maria.puig
    ```

    ### Part D – Logs en temps real

    Obre dos terminals:
    - **Terminal 1**: `sudo journalctl -u sssd -f`
    - **Terminal 2**: executa `getent passwd anna.valls`

    Observa quins missatges apareixen al Terminal 1 quan el Terminal 2 fa la consulta.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"sssctl diagnostic SSSD config-check domain-status"`
        - `"SSSD cache expire user-checks troubleshooting"`
        - `"SSSD logs debug level journalctl troubleshooting"`
