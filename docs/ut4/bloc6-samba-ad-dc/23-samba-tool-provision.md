---
title: samba-tool domain provision – configuració inicial
tags:
  - ut4
  - samba
  - active-directory
---

# :material-cog-play: samba-tool domain provision – configuració inicial

!!! abstract "Concepte clau"
    `samba-tool domain provision` és l'ordre que inicialitza Samba com a controlador de domini AD. Crea la base de dades del directori, configura Kerberos i DNS, i genera `smb.conf` amb la configuració del DC. És equivalent a `dcpromo` de Windows.

=== ":material-notebook-outline: Apunts"

    ## Prerequisits

    ```bash
    # Paquet Samba 4 (versió 4.19+ a Ubuntu 24.04)
    sudo apt install -y samba samba-dsdb-modules samba-vfs-modules \
        krb5-config winbind libpam-winbind libnss-winbind

    # DESACTIVA els serveis conflictius PRIMER
    sudo systemctl disable --now smbd nmbd winbind

    # Verifica la versió de Samba
    samba --version
    ```

    ## Configuració de la IP estàtica i hostname

    ```bash
    # Hostname del DC
    sudo hostnamectl set-hostname dc1.libretic.local

    # /etc/hosts — afegeix el DC amb IP estàtica
    # 172.16.XXX.10    dc1.libretic.local    dc1

    # Verifica
    hostname -f    # dc1.libretic.local
    ```

    ## Execució de samba-tool domain provision

    ```bash
    sudo samba-tool domain provision \
        --use-rfc2307 \
        --interactive
    ```

    L'assistent interactiu demana:

    | Pregunta | Valor exemple |
    |---------|--------------|
    | Realm | `LIBRETIC.LOCAL` |
    | Domain | `LIBRETIC` (NetBIOS, màx 15 caràcters) |
    | Server Role | `dc` |
    | DNS backend | `SAMBA_INTERNAL` |
    | Administrator password | (mínim 7 caràcters, complexitat) |

    ### Alternativa no interactiva

    ```bash
    sudo samba-tool domain provision \
        --realm=LIBRETIC.LOCAL \
        --domain=LIBRETIC \
        --server-role=dc \
        --dns-backend=SAMBA_INTERNAL \
        --adminpass="P@ssw0rd123!" \
        --use-rfc2307
    ```

    `--use-rfc2307` habilita els atributs POSIX (UID/GID) per als comptes del domini.

    ## Post-provisió: configuració de Kerberos

    ```bash
    # Copia el fitxer krb5.conf generat
    sudo cp /var/lib/samba/private/krb5.conf /etc/krb5.conf

    # Verifica
    cat /etc/krb5.conf
    ```

    ## Activa i inicia samba-ad-dc

    ```bash
    sudo systemctl unmask samba-ad-dc
    sudo systemctl enable --now samba-ad-dc
    sudo systemctl status samba-ad-dc
    ```

    ## Verificació post-provisió

    ```bash
    # Llista usuaris del domini
    sudo wbinfo -u
    # Sortida: LIBRETIC\Administrator, LIBRETIC\Guest, ...

    # Llista grups
    sudo wbinfo -g

    # Prova Kerberos
    kinit administrator@LIBRETIC.LOCAL
    klist

    # Llistat d'objectes del directori
    sudo samba-tool user list
    sudo samba-tool group list

    # Comprova el DNS intern
    host -t SRV _ldap._tcp.libretic.local 127.0.0.1
    host -t SRV _kerberos._tcp.libretic.local 127.0.0.1
    ```

    ## smb.conf generat per domain provision

    ```ini
    [global]
        workgroup = LIBRETIC
        realm = LIBRETIC.LOCAL
        netbios name = DC1
        server role = active directory domain controller
        dns forwarder = 8.8.8.8
        idmap_ldb:use rfc2307 = yes

    [netlogon]
        path = /var/lib/samba/sysvol/libretic.local/scripts
        read only = No

    [sysvol]
        path = /var/lib/samba/sysvol
        read only = No
    ```

    !!! warning "Elimina smb.conf existent ABANS de la provisió"
        Si hi ha un `smb.conf` preexistent (de UT3 o d'una instal·lació anterior de Samba), la provisió pot fallar o generar conflictes. Elimina'l abans: `sudo mv /etc/samba/smb.conf /etc/samba/smb.conf.bak`. `samba-tool domain provision` crea un `smb.conf` nou automàticament.

    !!! tip "Password de l'Administrator: complexitat obligatòria"
        Samba-AD requereix que la contrasenya de `Administrator` compleixi la política de complexitat d'AD: mínim 7 caràcters, majúscules + minúscules + números + caràcters especials. Si no compleix, la provisió falla amb `Failed to set password`. Usa una contrasenya com `P@ssw0rd123!`.

    ??? question "Auto-avaluació"
        **1.** Quin és el propòsit de l'opció `--use-rfc2307` en `samba-tool domain provision`?

        ??? success "Resposta"
            RFC 2307 defineix els atributs LDAP per a comptes POSIX Unix: `uidNumber`, `gidNumber`, `homeDirectory`, `loginShell`, etc. L'opció `--use-rfc2307` habilita el suport per a aquests atributs a la base de dades del domini Samba, de manera que els comptes de domini poden tenir UIDs i GIDs numèrics vàlids per a sistemes Linux. Sense això, els clients Linux no podrien mapar correctament els usuaris del domini a UIDs Unix.

        **2.** Per quin motiu cal copiar `/var/lib/samba/private/krb5.conf` a `/etc/krb5.conf` després de la provisió?

        ??? success "Resposta"
            `samba-tool domain provision` genera un fitxer `krb5.conf` personalitzat amb la configuració correcta del realm Kerberos (nom del realm, servidor KDC, etc.). Copiant-lo a `/etc/krb5.conf`, totes les eines Kerberos del sistema (`kinit`, `klist`, SSSD, etc.) usaran la configuració correcta per al domini Samba. Sense aquest pas, les eines Kerberos no sabran on és el KDC i `kinit` fallarà.

        **3.** Quina ordre verifica que el DNS intern de Samba ha creat correctament els SRV records del domini?

        ??? success "Resposta"
            `host -t SRV _ldap._tcp.libretic.local 127.0.0.1` (o `nslookup -type=SRV _ldap._tcp.libretic.local 127.0.0.1`). La IP `127.0.0.1` força la consulta al DNS local de Samba (en lloc d'un DNS extern). Si retorna un SRV record apuntant a `dc1.libretic.local:389`, el DNS intern funciona correctament.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.23 · Provisió del domini Samba-AD

    **Objectiu**: executar `samba-tool domain provision` per crear el domini `libretic.local`.
    **Temps estimat**: 40 minuts
    **Prerequisit**: Ubuntu Server 24.04, Samba instal·lat

    ---

    ### Pas 1 – Prerequisits

    ```bash
    sudo apt install -y samba samba-dsdb-modules krb5-config
    sudo systemctl disable --now smbd nmbd
    sudo mv /etc/samba/smb.conf /etc/samba/smb.conf.bak 2>/dev/null
    sudo hostnamectl set-hostname dc1.libretic.local
    ```

    ### Pas 2 – Executa la provisió

    ```bash
    sudo samba-tool domain provision --use-rfc2307 --interactive
    ```

    Usa: Realm=`LIBRETIC.LOCAL`, Domain=`LIBRETIC`, DNS=`SAMBA_INTERNAL`

    ### Pas 3 – Configura Kerberos

    ```bash
    sudo cp /var/lib/samba/private/krb5.conf /etc/krb5.conf
    ```

    ### Pas 4 – Activa i verifica

    ```bash
    sudo systemctl enable --now samba-ad-dc
    sudo wbinfo -u
    sudo samba-tool user list
    host -t SRV _ldap._tcp.libretic.local 127.0.0.1
    kinit administrator@LIBRETIC.LOCAL
    klist
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"samba-tool domain provision Ubuntu 22.04 24.04"`
        - `"Samba AD Domain Controller setup step by step"`
        - `"wbinfo samba domain controller verify"`
