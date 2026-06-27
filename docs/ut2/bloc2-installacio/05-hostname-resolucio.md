---
title: Hostname i resolució local
tags:
  - ut2
  - linux
  - xarxa
---

# :material-text-box-outline: Hostname i resolució local

!!! abstract "Concepte clau"
    El **hostname** identifica el servidor a la xarxa. A Linux, és un nom senzill (`srv-ldap`) o qualificat (`srv-ldap.lafita.local`). El fitxer `/etc/hosts` actua com un DNS local manual: sense una entrada correcta aquí, OpenLDAP, SSSD i NFS no es podran trobar pel nom.

=== ":material-notebook-outline: Apunts"

    ## Configuració del hostname

    ```bash
    # Veure el hostname actual
    hostname
    hostnamectl

    # Canviar el hostname (permanent, s'aplica immediatament)
    sudo hostnamectl set-hostname srv-ldap
    ```

    `hostnamectl` mostra informació ampliada:

    ```text
    Static hostname: srv-ldap
    Icon name: computer-server
    Chassis: server
    Machine ID: a1b2c3d4...
    Boot ID: e5f6a7b8...
    Operating System: Ubuntu 24.04.1 LTS
    Kernel: Linux 6.8.0-45-generic
    Architecture: x86-64
    ```

    ## El fitxer `/etc/hosts`

    `/etc/hosts` és el "DNS local" del sistema. S'consulta **abans** que el servidor DNS de xarxa per a cada petició de nom.

    Format:
    ```
    IP_adreça    nom_qualificat    àlies_curt
    ```

    ### Contingut mínim per al laboratori

    ```bash
    sudo nano /etc/hosts
    ```

    ```text
    127.0.0.1    localhost
    127.0.1.1    srv-ldap
    192.168.100.10    srv-ldap.lafita.local    srv-ldap
    ```

    !!! warning "La línia `127.0.1.1` és crítica per a OpenLDAP"
        OpenLDAP fa un `gethostbyname()` del hostname durant l'arrencada. Si el hostname no es resol (ni per DNS ni per `/etc/hosts`), `slapd` pot fallar a l'iniciar. La línia `127.0.1.1 srv-ldap` garanteix que el hostname sempre es resol localment, independentment del DNS de xarxa.

    ## Verificació

    ```bash
    # Comprova que el hostname es resol correctament
    hostname
    hostname -f    # Nom completament qualificat (FQDN)
    getent hosts srv-ldap
    getent hosts srv-ldap.lafita.local
    ping -c 1 srv-ldap
    ```

    Sortida esperada de `hostname -f`:
    ```text
    srv-ldap.lafita.local
    ```

    ## Relació entre hostname i domini LDAP

    Al laboratori, usem el domini LDAP `dc=lafita,dc=local`, que correspon al domini DNS `lafita.local`. Convencionalment, el servidor s'anomena `srv-ldap.lafita.local`.

    | Element | Valor de laboratori |
    |---------|-------------------|
    | Hostname curt | `srv-ldap` |
    | Domini DNS | `lafita.local` |
    | FQDN | `srv-ldap.lafita.local` |
    | Base DN LDAP | `dc=lafita,dc=local` |

    ??? question "Auto-avaluació"

        **1.** Executes `hostname -f` i obtens simplement `srv-ldap` en lloc de `srv-ldap.lafita.local`. Com ho soluciones?

        ??? success "Resposta"
            Cal afegir o corregir la línia al fitxer `/etc/hosts`: `192.168.100.10 srv-ldap.lafita.local srv-ldap`. El nom completament qualificat (FQDN) és el segon camp de la línia (el primer és l'IP, el segon el FQDN, el tercer i posteriors els àlies). Sense aquesta línia, el sistema no sap quin domini correspon al hostname curt `srv-ldap`.

        **2.** Per quin motiu és important que `/etc/hosts` tingui l'entrada correcta **abans** d'instal·lar OpenLDAP?

        ??? success "Resposta"
            `dpkg-reconfigure slapd` (la configuració inicial de OpenLDAP) determina el **base DN** a partir del hostname del sistema. Si el hostname és `srv-ldap.lafita.local`, proposa `dc=lafita,dc=local` com a base DN. Si el hostname és incorrecte o no es resol, la configuració inicial pot fallar o generar un domini LDAP incorrecte que després és molt difícil de canviar sense reinstal·lar.

        **3.** Quin és l'equivalent de `/etc/hosts` a Windows i com s'hi accedeix?

        ??? success "Resposta"
            L'equivalent és `C:\Windows\System32\drivers\etc\hosts`. La sintaxi és idèntica (una IP seguida dels noms). A Windows, cal editar-lo amb el Bloc de notes executat com a Administrador (no el pots editar com a usuari normal per motius de seguretat). Al laboratori de la UT1 el vàrem usar per resoldre el nom del DC si el DNS no funcionava.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 2.3 · Configura el hostname i la resolució local

    **Objectiu**: establir el hostname del servidor i la resolució local de noms per al laboratori.

    **Temps estimat**: 10 minuts

    ---

    ### Part A – Estableix el hostname

    ```bash
    sudo hostnamectl set-hostname srv-ldap
    ```

    Verifica:
    ```bash
    hostname
    ```

    ### Part B – Edita `/etc/hosts`

    ```bash
    sudo nano /etc/hosts
    ```

    Assegura't que conté (a més de les línies existents):
    ```text
    192.168.100.10    srv-ldap.lafita.local    srv-ldap
    ```

    Desa i verifica:
    ```bash
    hostname -f
    ping -c 1 srv-ldap.lafita.local
    ```

    Obté `srv-ldap.lafita.local`? Si no, revisa el fitxer `/etc/hosts`.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Ubuntu Server hostname change hostnamectl permanent"`
        - `"etc hosts file Linux explained DNS local"`
        - `"Linux FQDN fully qualified domain name setup"`
