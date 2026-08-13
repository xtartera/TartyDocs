---
title: Particularitats i dificultats de la integració
tags:
  - ut5
  - conceptes
  - heterogenis
  - seguretat
---

# :material-alert-decagram: Particularitats i dificultats de la integració

!!! abstract "Concepte clau"
    Fer conviure Windows i Linux no és connectar cables: cada món representa les **identitats**, els **permisos**, l'**autenticació** i els **noms** de manera diferent. Aquest capítol és l'eix de la UT5: entendre *on* apareixen les friccions i *per què*.

=== ":material-notebook-outline: Apunts"

    ## Per què és difícil?

    Windows i Linux van néixer per separat i resolen els mateixos problemes amb models diferents. Quan els fem col·laborar (compartir carpetes, autenticar el mateix usuari a totes dues bandes), aquests models han de **traduir-se** l'un a l'altre. Cada traducció és un punt de fricció potencial.

    ```mermaid
    graph TD
        H["Integració\nWindows ↔ Linux"]
        H --> I["1. Identitats\nSID ↔ UID/GID"]
        H --> P["2. Permisos\nNTFS ↔ POSIX ↔ ACL"]
        H --> A["3. Autenticació\nKerberos · DNS · rellotge"]
        H --> PR["4. Protocols\nSMB/CIFS ↔ NFS"]
    ```

    ## 1. Identitats: SID ↔ UID/GID

    | Món | Com identifica un usuari | Exemple |
    |-----|--------------------------|---------|
    | **Windows** | **SID** (Security Identifier), cadena llarga i única | `S-1-5-21-...-1103` |
    | **Linux** | **UID** (usuari) i **GID** (grup), números | `uid=10001 gid=10001` |

    El problema: quan un usuari de Windows accedeix a un recurs Linux (o a l'inrevés), el sistema ha de **decidir quin número/SID li correspon a l'altre món**. Si la correspondència no és coherent, l'usuari perd la propietat dels seus fitxers o n'obté d'aliens.

    !!! tip "La peça clau: `--use-rfc2307` i el mapatge d'ID"
        A Samba AD DC es provisiona amb `--use-rfc2307` justament per **emmagatzemar atributs POSIX (uidNumber/gidNumber) dins del directori**, de manera que un mateix compte tingui un UID/GID estable a tots els clients Linux. SSSD, per la seva banda, pot generar IDs de forma automàtica (`ldap_id_mapping`) a partir del SID — però llavors cal que **tots els clients facin el mateix mapatge** per no divergir.

    ## 2. Permisos: NTFS ↔ POSIX ↔ ACL

    Els tres models de permisos no són equivalents:

    | Model | Món | Granularitat |
    |-------|-----|--------------|
    | **NTFS** | Windows | Molt fi (ACL per usuari/grup, herència, drets especials) |
    | **POSIX bàsic** | Linux | Només *propietari / grup / altres* × *rwx* |
    | **ACL POSIX** | Linux | Fi (múltiples usuaris/grups amb `setfacl`) |

    Quan compartim una carpeta Linux cap a Windows (Samba) o muntem NFS entre mons, els permisos NTFS rics **no caben** dins del POSIX bàsic. Per això calen les **ACL POSIX** (`setfacl`/`getfacl`) i, a Samba, `vfs objects = acl_xattr` per emmagatzemar ACLs estil Windows.

    !!! warning "Error conceptual freqüent"
        Pensar que `chmod 770` és "equivalent" a donar permís a un grup a Windows. No ho és: `chmod` només distingeix propietari/grup/altres. Si necessites que **dos grups diferents** tinguin accessos diferents a la mateixa carpeta, el POSIX bàsic no arriba i necessites ACLs.

    ## 3. Autenticació: Kerberos, DNS i rellotge

    En un domini (AD o Samba-AD) l'autenticació és **Kerberos**, i Kerberos és exigent:

    ```mermaid
    graph LR
        C["Client\n(Windows o Linux)"] -->|"1. Resol el DC pel nom\n(DNS + registres SRV)"| DNS["DNS del domini"]
        C -->|"2. Demana tiquet\n(hora ha de coincidir)"| KDC["KDC (DC)"]
        KDC -->|"3. Tiquet vàlid ~10 h"| C
    ```

    Tres dependències que trenquen l'autenticació si fallen:

    | Dependència | Si falla… | Símptoma típic |
    |-------------|-----------|----------------|
    | **DNS del domini** (SRV) | El client no localitza el DC | "No es troba el domini" en unir-se |
    | **Rellotge sincronitzat** | Kerberos rebutja els tiquets | Error de tiquet / no pot iniciar sessió |
    | **Nom del domini correcte** | No es genera el tiquet | Falla `realm join` / login de domini |

    !!! info "Regla dels 5 minuts"
        Kerberos tolera un desfasament màxim d'uns **5 minuts** entre client i DC (protecció anti-replay). En entorns virtualitzats, les VM que es pausen/reprenen són una font habitual de rellotges desajustats.

    ## 4. Protocols: SMB/CIFS ↔ NFS

    | Protocol | Món natiu | Client de l'altre món |
    |----------|-----------|------------------------|
    | **SMB/CIFS** | Windows | Linux amb `smbclient` / `mount -t cifs` (`cifs-utils`) |
    | **NFS** | Linux/Unix | Windows amb *Client for NFS* |

    Cap dels dos és "millor": la clau és triar el que encaixi amb qui ha de consumir el recurs, i preveure el mapatge d'identitats a la frontera.

    ## Resum: el mapa de les friccions

    | Fricció | On apareix a la UT5 |
    |---------|---------------------|
    | Identitats SID↔UID/GID | Compartició creuada · Samba AD (`--use-rfc2307`) |
    | Permisos NTFS↔POSIX↔ACL | Compartició creuada · Recursos i ACLs |
    | Kerberos/DNS/rellotge | Autenticació creuada · Samba AD |
    | Protocols SMB↔NFS | Tota la Part B |

    ??? question "Auto-avaluació"
        **1.** Per què no n'hi ha prou amb `chmod` per replicar els permisos NTFS d'una carpeta compartida amb dos grups diferents?

        ??? success "Resposta"
            Perquè el POSIX bàsic (`chmod`) només distingeix tres subjectes: propietari, grup i altres. No pot assignar permisos diferents a **dos grups** alhora sobre la mateixa carpeta. Per fer-ho calen **ACLs POSIX** (`setfacl`), que permeten múltiples entrades usuari/grup, equivalent conceptual a les ACL de NTFS.

        **2.** Un client Linux acabat de restaurar d'una instantània no pot iniciar sessió amb el compte de domini. Quina causa relacionada amb la integració sospitaries primer?

        ??? success "Resposta"
            El **desfasament horari**: en restaurar la instantània, el rellotge de la VM pot haver quedat enrere. Kerberos rebutja els tiquets si la diferència amb el DC supera ~5 minuts. Cal resincronitzar l'hora (NTP) abans de tornar a provar.

        **3.** Què aporta provisionar Samba AD DC amb `--use-rfc2307`?

        ??? success "Resposta"
            Guarda els atributs POSIX (`uidNumber`, `gidNumber`, `homeDirectory`, `loginShell`) dins del directori, de manera que cada compte tingui un **UID/GID estable i coherent** a tots els clients Linux del domini, evitant divergències de propietat de fitxers.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 5.03 · Cataloga les friccions

    **Objectiu**: aprendre a identificar de quin tipus és cada dificultat d'integració.
    **Temps estimat**: 25 minuts · **Modalitat**: individual o parelles

    ---

    ### Tasca 1 – Classifica

    Per a cada situació, indica a quina de les 4 famílies de fricció pertany (Identitats / Permisos / Autenticació / Protocols) i justifica-ho:

    1. Un usuari de Windows crea un fitxer en una carpeta compartida per Samba i, des de Linux, apareix com a propietat de "ningú" (UID desconegut).
    2. En unir un Ubuntu al domini falla amb "no s'ha pogut resoldre el domini".
    3. Vols que un client Windows llegeixi una carpeta exportada per NFS des d'Ubuntu.
    4. Dos grups (`professorat` i `alumnat`) necessiten permisos diferents sobre la mateixa carpeta d'un servidor Linux.
    5. Després de reprendre una VM, els comptes de domini deixen de validar-se.

    ### Tasca 2 – Proposa la mitigació

    Per a cada cas anterior, escriu en una frase **quina eina o mesura** resoldria la fricció (p. ex. `--use-rfc2307`, `setfacl`, sincronització NTP, `cifs-utils`, DNS cap al DC).

    ### Tasca 3 – Diagrama

    Dibuixa el teu propi mapa de les 4 friccions i, sota cada branca, anota un exemple real que t'hagi passat (o que preveus) al laboratori.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Windows Linux SID to UID mapping Samba explained"`
        - `"Kerberos clock skew authentication error"`
        - `"POSIX ACL vs NTFS permissions"`
        - `"Samba idmap rfc2307 explained"`
