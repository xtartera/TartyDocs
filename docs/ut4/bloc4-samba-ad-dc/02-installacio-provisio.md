---
title: Instal·lació i provisió del domini Samba AD DC
tags:
  - ut4
  - samba
  - active-directory
---

# :material-download-network: Instal·lació i provisió del domini Samba AD DC

!!! abstract "Concepte clau"
    Provisionar un domini amb Samba 4 significa crear el directori, el KDC de Kerberos i el DNS intern amb `samba-tool domain provision`, i deixar actiu el dimoni `samba-ad-dc` (i **només** aquest).

=== ":material-notebook-outline: Apunts"

    ## Preparació prèvia (checklist)

    | Requisit | Valor de laboratori | Per què |
    |----------|--------------------|---------|
    | IP estàtica | `192.168.100.10/24` | Un DC no pot canviar d'IP |
    | Hostname FQDN | `dc1.lafita.local` | Kerberos i DNS depenen del nom |
    | Rellotge sincronitzat | NTP actiu | Kerberos (regla dels 5 min) |
    | `/etc/hosts` coherent | `192.168.100.10 dc1.lafita.local dc1` | Resolució local |

    ## Instal·lació dels paquets

    ```bash
    sudo apt update
    sudo apt install samba krb5-config winbind
    ```

    !!! warning "Compte amb l'assistent de Kerberos"
        Durant la instal·lació es demana el **REALM** per defecte: introdueix `LAFITA.LOCAL` (en majúscules). Si t'equivoques, es pot corregir després editant `/etc/krb5.conf`.

    ## Provisió del domini

    Abans, cal aturar i desactivar els serveis SMB clàssics (entren en conflicte amb el mode DC):

    ```bash
    sudo systemctl stop smbd nmbd winbind
    sudo systemctl disable smbd nmbd winbind
    ```

    Esborra qualsevol `smb.conf` previ i provisiona:

    ```bash
    sudo mv /etc/samba/smb.conf /etc/samba/smb.conf.bak 2>/dev/null
    sudo samba-tool domain provision \
      --use-rfc2307 \
      --realm=LAFITA.LOCAL \
      --domain=LAFITA \
      --server-role=dc \
      --dns-backend=SAMBA_INTERNAL \
      --adminpass='Contrasenya.2026'
    ```

    | Paràmetre | Significat |
    |-----------|-----------|
    | `--use-rfc2307` | Habilita atributs POSIX (UID/GID coherents) — **clau per als clients Linux** |
    | `--realm` | Realm Kerberos (majúscules) |
    | `--domain` | Nom NetBIOS curt |
    | `--dns-backend=SAMBA_INTERNAL` | DNS intern gestionat pel propi Samba |
    | `--adminpass` | Contrasenya de l'Administrador del domini |

    ## Activar el dimoni correcte

    ```bash
    sudo systemctl unmask samba-ad-dc
    sudo systemctl enable samba-ad-dc
    sudo systemctl start samba-ad-dc
    ```

    !!! danger "Un sol dimoni!"
        En mode AD DC, el servei `samba-ad-dc` **integra** smbd/nmbd/winbind. Si `smbd` i `nmbd` també estan actius, el DC **no arrenca** correctament. Aquesta és la incidència número u en muntar Samba AD.

    ## Configurar el DNS i el Kerberos del propi servidor

    ```bash
    # Usar el krb5.conf generat per la provisió
    sudo cp /var/lib/samba/private/krb5.conf /etc/krb5.conf
    ```

    El servidor s'ha d'apuntar a si mateix com a DNS (`/etc/resolv.conf` o netplan → `nameservers: 192.168.100.10`).

    ## Verificació de la provisió

    ```bash
    # Usuaris i grups del nou domini
    sudo samba-tool user list
    sudo samba-tool group list

    # Registres SRV del DNS intern (localització del DC)
    host -t SRV _ldap._tcp.lafita.local 127.0.0.1
    host -t SRV _kerberos._udp.lafita.local 127.0.0.1

    # Tiquet Kerberos de l'Administrador
    kinit administrator@LAFITA.LOCAL
    klist
    ```

    !!! warning "Error freqüent"
        Si `host -t SRV` no retorna res, el DNS intern no funciona: comprova que el servidor s'apunta a si mateix com a DNS i que el dimoni `samba-ad-dc` està actiu.

    ??? question "Auto-avaluació"
        **1.** Per què cal desactivar `smbd` i `nmbd` abans d'activar `samba-ad-dc`?

        ??? success "Resposta"
            Perquè en mode controlador de domini el dimoni `samba-ad-dc` ja integra les funcions d'`smbd`/`nmbd`/`winbind`. Tenir-los actius alhora provoca conflictes de ports i serveis, i el DC no arrenca correctament.

        **2.** Quin efecte té `--use-rfc2307` i per què és rellevant en un entorn amb clients Linux?

        ??? success "Resposta"
            Habilita l'emmagatzematge d'atributs POSIX (`uidNumber`, `gidNumber`...) al directori, de manera que els clients Linux obtenen UID/GID coherents i estables per a cada compte, evitant problemes de propietat de fitxers.

        **3.** Com comproves que la localització del DC via DNS funciona?

        ??? success "Resposta"
            Consultant els registres SRV del domini, p. ex. `host -t SRV _ldap._tcp.lafita.local`, que han de retornar el nom del DC. Sense aquests registres, els clients no poden localitzar el controlador.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.C1 · Provisiona el teu domini

    **Objectiu**: muntar un domini Samba AD DC funcional des de zero.
    **Temps estimat**: 60 minuts · **Modalitat**: individual

    ---

    ### Tasca 1 – Preparació

    Configura IP estàtica, hostname `dc1.lafita.local`, NTP i `/etc/hosts`. Documenta cada valor.

    ### Tasca 2 – Provisió

    Executa la provisió amb `--use-rfc2307`. Enganxa la sortida i explica què significa cada paràmetre que has usat.

    ### Tasca 3 – Verificació

    Comprova: `samba-tool user list`, registres SRV amb `host -t SRV`, i obtenció de tiquet amb `kinit administrator@LAFITA.LOCAL` + `klist`.

    ### Tasca 4 – Provoca l'error

    Torna a activar `smbd` i `nmbd`, reinicia i observa què passa amb `samba-ad-dc`. Documenta el missatge i torna-ho a deixar bé.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"samba active directory domain controller ubuntu 24.04 provision"`
        - `"samba-tool domain provision use-rfc2307"`
        - `"samba internal dns SRV records verify"`
