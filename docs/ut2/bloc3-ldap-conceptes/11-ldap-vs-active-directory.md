---
title: LDAP vs Active Directory
tags:
  - ut2
  - ldap
  - active-directory
---

# :material-swap-horizontal: LDAP vs Active Directory

!!! abstract "Concepte clau"
    **Active Directory és una implementació de LDAP**, igual que OpenLDAP — però Microsoft hi va afegir Kerberos, DNS integrat, GPO i una interfície gràfica. Entendre la relació entre tots dos et permet reutilitzar el que saps de UT1 per comprendre OpenLDAP.

=== ":material-notebook-outline: Apunts"

    ## La relació entre LDAP i Active Directory

    LDAP és el **protocol** (l'estàndard obert). Active Directory i OpenLDAP són **implementacions** d'aquest protocol, cadascuna amb les seves extensions:

    ```mermaid
    graph TD
        LDAP["Protocol LDAP (RFC 4511)"] --> AD["Active Directory\n(Microsoft)"]
        LDAP --> OL["OpenLDAP\n(codi obert)"]
        AD --> AD2["+ Kerberos · DNS integrat · GPO · Replicació multi-DC"]
        OL --> OL2["+ slapd · ldap-utils · backends pluggables (MDB)"]

        style LDAP fill:#1565C0,color:#fff
        style AD fill:#0078D4,color:#fff
        style OL fill:#E65100,color:#fff
    ```

    ## Comparativa: Active Directory vs OpenLDAP

    | Característica | Active Directory (UT1) | OpenLDAP (UT2) |
    |---------------|----------------------|----------------|
    | **Empresa** | Microsoft | Comunitat (OpenLDAP Foundation) |
    | **Llicència** | Propietari | Open-source (OpenLDAP Public License) |
    | **Plataforma** | Windows Server | Linux/Unix (multiplataforma) |
    | **Protocol base** | LDAP v3 | LDAP v3 |
    | **Autenticació** | Kerberos 5 | SASL, simple bind, TLS |
    | **Interfície de gestió** | GUI: Active Directory Users and Computers | CLI: `ldapadd`, `ldapmodify`, phpLDAPadmin |
    | **DNS integrat** | Sí, obligatori | No (configures tu el DNS) |
    | **GPO** | Sí | No |
    | **Replicació** | Multi-DC integrada | Syncrepl (manual) |
    | **Instal·lació** | Rol "AD DS" a Windows Server | `apt install slapd ldap-utils` |
    | **Arxius de config** | Base de dades interna AD | `/etc/ldap/slapd.d/` (OLC) |
    | **Port per defecte** | 389 (LDAP), 636 (LDAPS) | 389 (LDAP), 636 (LDAPS) |
    | **Integració Linux** | Via SSSD + realmd/winbind | Via SSSD (UT2 Bloc 6) |

    ## Terminologia comparada

    | Concepte | Active Directory | OpenLDAP |
    |----------|-----------------|---------|
    | Domini | `lafita.local` | `dc=lafita,dc=local` |
    | Unitat organitzativa | OU "Alumnes" | `ou=alumnes,dc=lafita,dc=local` |
    | Usuari | Objecte User a AD | Entrada `inetOrgPerson` + `posixAccount` |
    | Grup | Grup de seguretat AD | Entrada `posixGroup` |
    | Administrador | `Administrator` (BUILTIN) | `cn=admin,dc=lafita,dc=local` |
    | Autenticació | Kerberos / NTLM | Simple bind (contras. en clar sobre TLS) |
    | Eina de consulta | `Get-ADUser` (PowerShell) | `ldapsearch` |

    !!! info "Mateixa estructura, diferent sintaxi"
        La base DN de l'AD és `DC=lafita,DC=local` (majúscules) mentre que a OpenLDAP és `dc=lafita,dc=local` (minúscules). LDAP és insensible a majúscules en els noms d'atributs, però per convenció s'usen minúscules a OpenLDAP.

    ## Quan usar OpenLDAP en lloc d'AD?

    | Escenari | Solució recomanada |
    |----------|-------------------|
    | Entorn 100% Windows, organització mitjana/gran | Active Directory |
    | Entorn 100% Linux/Unix, control total del directori | OpenLDAP |
    | Entorn mixt (Windows + Linux) | AD com a directori central + SSSD als clients Linux |
    | Recursos econòmics limitats, servidor únic | OpenLDAP (llicència gratuïta, menys maquinari) |

    ## Conceptes de UT1 que es reutilitzen a UT2

    Gràcies a que tots dos usen LDAP v3, **no cal aprendre tot de zero**:

    - **Base DN**: la mateixa lògica de `dc=lafita,dc=local`
    - **OUs com a contenidors**: `ou=usuaris` equival a una OU d'AD
    - **Port 389**: el mateix en ambdós casos
    - **SSSD als clients Linux**: a UT2 l'usaràs per connectar a OpenLDAP, exactament igual que si fos un AD

    ??? question "Auto-avaluació"

        **1.** Afirma o refuta: "Active Directory i OpenLDAP son incompatibles perquè un és de Microsoft i l'altre és open-source."

        ??? success "Resposta"
            Fals. Tots dos implementen el **protocol estàndard LDAP v3** (RFC 4511). Un client SSSD configurat per parlar LDAP pot connectar tant a un servidor OpenLDAP com a un Active Directory. De fet, a UT4 veuràs entorns on clients Linux s'autentiquen contra un AD de Windows via SSSD. La incompatibilitat real es troba en les extensions propietàries de Microsoft (GPO, SID, esquema AD estès), però el nucli LDAP és interoperable.

        **2.** A la UT1 creaves grups de seguretat a Active Directory. Quin seria el seu equivalent a OpenLDAP?

        ??? success "Resposta"
            Els grups a OpenLDAP s'implementen com a entrades amb `objectClass: posixGroup`. Contenen l'atribut `gidNumber` (l'equivalent numèric al GID de Linux, no al SID de Windows) i `memberUid` per llistar els usuaris membres pel seu `uid` (text). A diferència dels grups AD, no hi ha herència de grups ni anidament complex; el model POSIX és més simple.

        **3.** Per quin motiu OpenLDAP no necessita DNS integrat mentre que Active Directory sí?

        ??? success "Resposta"
            Active Directory **depèn** de DNS per a la descoberta de serveis: els clients Windows usen DNS SRV records per trobar els Domain Controllers (`_ldap._tcp.lafita.local`, `_kerberos._tcp.lafita.local`). Sense DNS, els clients no saben a quin servidor connectar. OpenLDAP no implementa la descoberta automàtica de serveis via DNS: la IP del servidor LDAP es configura manualment al client (a `sssd.conf` a UT2). Això és menys elegant però més simple per a laboratoris petits.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.2 · Relaciona conceptes UT1 ↔ UT2

    **Objectiu**: ancorar els nous conceptes LDAP als ja coneguts de Active Directory.

    **Temps estimat**: 10 minuts (teòric)

    ---

    ### Completa la taula

    Omple la columna "Equivalent OpenLDAP" basant-te en el que has après a UT1 i la teoria d'aquesta pàgina:

    | Concepte AD (UT1) | Equivalent OpenLDAP (UT2) |
    |------------------|--------------------------|
    | `DC=lafita,DC=local` (Base DN) | ? |
    | OU "Alumnes" a l'AD | ? |
    | Compte d'usuari "Maria Puig" | ? |
    | Grup de seguretat "Alumnes" | ? |
    | Administrador del domini | ? |
    | `Get-ADUser` (PowerShell) | ? |

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"LDAP vs Active Directory explained difference"`
        - `"OpenLDAP vs Microsoft Active Directory comparison"`
        - `"when to use OpenLDAP vs Active Directory enterprise"`
