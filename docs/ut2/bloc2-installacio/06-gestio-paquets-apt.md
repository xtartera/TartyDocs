---
title: Gestió de paquets amb apt
tags:
  - ut2
  - linux
  - apt
---

# :material-package-variant: Gestió de paquets amb apt

!!! abstract "Concepte clau"
    `apt` (*Advanced Package Tool*) és el gestor de paquets d'Ubuntu: l'equivalent al Centre de Programari o a instal·lar un `.exe` a Windows, però des de la línia d'ordres, automàtic, amb resolució de dependències i accés a milers de paquets oficials. Tot el programari del laboratori (OpenLDAP, SSSD, NFS, autofs) s'instal·la amb `apt`.

=== ":material-notebook-outline: Apunts"

    ## Ordres fonamentals

    | Ordre | Funció |
    |-------|--------|
    | `sudo apt update` | Actualitza la llista de paquets disponibles (com a "Comprova actualitzacions") |
    | `sudo apt upgrade` | Instal·la les actualitzacions disponibles |
    | `sudo apt install NOM` | Instal·la un paquet |
    | `sudo apt remove NOM` | Desinstal·la un paquet (conserva configuració) |
    | `sudo apt purge NOM` | Desinstal·la un paquet i la seva configuració |
    | `sudo apt autoremove` | Elimina paquets instal·lats com a dependències que ja no calen |
    | `apt search TERME` | Cerca paquets per nom o descripció |
    | `apt show NOM` | Informació detallada d'un paquet |
    | `dpkg -l NOM` | Comprova si un paquet és instal·lat |

    ## Flux de treball habitual

    ```bash
    # Pas 1: actualitza la llista de paquets (SEMPRE primer)
    sudo apt update

    # Pas 2: instal·la el paquet (exemple: OpenLDAP)
    sudo apt install -y slapd ldap-utils

    # L'opció -y respon "sí" automàticament a les preguntes de confirmació
    ```

    !!! warning "Fes sempre `apt update` abans d'`apt install`"
        Sense `apt update` previ, instal·les la versió que tens a la caché local, que pot tenir setmanes d'antiguitat. A més, si el paquet és nou i la llista no s'ha actualitzat, `apt install` retornarà `Unable to locate package`.

    ## Preparació del servidor per al laboratori

    ```bash
    # Actualitza la llista i el sistema completament
    sudo apt update && sudo apt upgrade -y

    # Instal·la eines bàsiques que usaràs durant la UT2
    sudo apt install -y curl wget net-tools dnsutils vim tree

    # Elimina paquets obsolets
    sudo apt autoremove -y
    ```

    ## Paquets clau de la UT2

    | Projecte | Paquets que s'instal·laran |
    |---------|---------------------------|
    | P21 | `openssh-server`, `chrony`, `ufw` |
    | P22 | `slapd`, `ldap-utils` |
    | P25 | `sssd`, `sssd-ldap`, `libnss-sss`, `libpam-sss` |
    | P26 | `nfs-kernel-server`, `autofs` |

    ## Informació sobre un paquet instal·lat

    ```bash
    # Versió instal·lada d'OpenLDAP
    dpkg -l slapd

    # Fitxers que ha instal·lat el paquet
    dpkg -L slapd | head -20

    # Comprova si el paquet és instal·lat (retorna 0 si sí)
    dpkg -l slapd | grep -q "^ii" && echo "Instal·lat" || echo "No instal·lat"
    ```

    ??? question "Auto-avaluació"

        **1.** Intentes instal·lar `slapd` però `apt` retorna `E: Unable to locate package slapd`. Quin és el motiu habitual i com ho soluciones?

        ??? success "Resposta"
            El motiu habitual és que la llista de paquets està desactualitzada o el paquet no existeix amb aquell nom exacte. Solució: (1) Executa `sudo apt update` primer per actualitzar la llista. (2) Si continua el problema, verifica el nom exacte amb `apt search slapd`. El paquet real pot tenir un nom lleugerament diferent. (3) Comprova que el repositori `universe` estigui habilitat: `sudo add-apt-repository universe && sudo apt update`.

        **2.** Quina és la diferència entre `apt remove slapd` i `apt purge slapd`? En quin cas usaries cadascun?

        ??? success "Resposta"
            `apt remove` desinstal·la el programa però **conserva els fitxers de configuració** (a `/etc/ldap/`, per exemple). És útil si vols tornar a instal·lar el paquet conservant la configuració anterior. `apt purge` desinstal·la el programa **i elimina tots els fitxers de configuració**. Es usa quan vols "tornar a zero" completament — per exemple, si la configuració de `slapd` ha quedat en un estat incorrecte i vols reconfigurar des de l'inici. Al laboratori, si una configuració de `slapd` no funciona correctament, `sudo apt purge slapd && sudo apt install slapd` és la manera de recomençar net.

        **3.** Per quin motiu `apt install` necessita `sudo` però `apt search` no?

        ??? success "Resposta"
            Instal·lar un paquet requereix escriure a directoris del sistema (`/usr/`, `/etc/`, `/var/`) i modificar la base de dades de paquets (`/var/lib/dpkg/`), operacions que requereixen permisos de root. `apt search` únicament llegeix la llista de paquets local (a `/var/lib/apt/lists/`), una operació de lectura que qualsevol usuari pot fer. El principi és el **mínim privilegi**: no cal ser root per cercar informació, però sí per modificar el sistema.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 2.4 · Prepara el servidor per al laboratori

    **Objectiu**: actualitzar el sistema i instal·lar les eines bàsiques per a la UT2.

    **Temps estimat**: 20 minuts (depèn de la velocitat d'Internet)

    ---

    ### Part A – Actualització del sistema

    ```bash
    sudo apt update
    sudo apt upgrade -y
    ```

    Quants paquets s'han actualitzat?

    ### Part B – Instal·la eines bàsiques

    ```bash
    sudo apt install -y openssh-server curl vim tree
    ```

    Verifica:
    ```bash
    dpkg -l openssh-server | grep "^ii"
    systemctl status ssh
    ```

    ### Part C – Neteja

    ```bash
    sudo apt autoremove -y
    sudo apt clean
    ```

    `apt clean` buida la caché de paquets descarregats (estalvia espai al disc).

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"apt package manager Ubuntu tutorial beginners"`
        - `"apt update upgrade install Ubuntu Server explained"`
        - `"dpkg apt difference Ubuntu package management"`
