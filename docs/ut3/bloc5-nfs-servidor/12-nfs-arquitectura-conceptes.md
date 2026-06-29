---
title: NFS – Arquitectura i conceptes
tags:
  - ut3
  - nfs
---

# :material-folder-network: NFS – Arquitectura i conceptes

!!! abstract "Concepte clau"
    **NFS** (Network File System) és el protocol estàndard Unix/Linux per exportar sistemes de fitxers via xarxa. El servidor **exporta** directoris i els clients els **munten** com si fossin locals. No hi ha autenticació per usuari: el control és per adreça IP i UID/GID.

=== ":material-notebook-outline: Apunts"

    ## Arquitectura NFS

    ```mermaid
    graph LR
        subgraph Servidor["Ubuntu Server · 192.168.100.10"]
            NFS["nfs-kernel-server"]
            EXP["/etc/exports"]
            FS["/srv/nfs/dades"]
            NFS --> EXP
            NFS --> FS
        end
        subgraph Client["Ubuntu Client · 192.168.100.20"]
            MNT["/mnt/dades"]
        end
        Client -->|"mount -t nfs\nport 2049"| Servidor
        FS -.->|"vista transparent"| MNT
    ```

    El client munta la carpeta remota i la veu com si fos local a `/mnt/dades`. Qualsevol fitxer creat allà s'emmagatzema físicament al servidor.

    ## Versions NFS

    | Versió | Característiques | Ús actual |
    |--------|-----------------|----------|
    | NFSv2 | Bàsica, obsoleta | No recomanat |
    | NFSv3 | Fitxers >2 GB, UDP/TCP | Compatible, àmpliament usat |
    | NFSv4 | Millors permisos, Kerberos, port únic 2049 | Recomanat per producció |

    Ubuntu 24.04 usa **NFSv4** per defecte, però manté compatibilitat amb NFSv3.

    ## Ports i serveis NFS

    | Port | Protocol | Servei |
    |------|---------|--------|
    | 111 | TCP/UDP | `rpcbind` (mapeig de ports RPC) |
    | 2049 | TCP/UDP | NFS (servei principal) |
    | Dynamic | TCP/UDP | `mountd`, `lockd`, `statd` (NFSv3) |

    !!! tip "NFSv4 i ports"
        NFSv4 usa **únicament el port 2049**, a diferència de NFSv3 que requeria múltiples ports dinàmics. Això simplifica la configuració del firewall amb NFSv4.

    ## Comparativa NFS vs Samba vs UT2 Bloc 7

    !!! tip "Connexió amb UT2"
        A la UT2 (Bloc 7) vam introduir NFS breument com a base per als perfils mòbils. En aquesta unitat aprofundim en la seguretat, el control d'accés per IP, les opcions de muntatge i la gestió de UID/GID — aspectes que a la UT2 no vam treballar.

    | Aspecte | UT2 Bloc 7 (NFS bàsic) | UT3 Bloc 5–6 (NFS avançat) |
    |---------|----------------------|--------------------------|
    | Instal·lació | ✅ | ✅ (repàs) |
    | `/etc/exports` bàsic | ✅ | ✅ (ampliació) |
    | Control per IP | — | ✅ |
    | `noexec`, `nosuid` | — | ✅ |
    | `all_squash` / UID/GID | — | ✅ |
    | UFW + ports NFS | — | ✅ |

    ## Model de seguretat NFS

    NFS **no autentifica usuaris individualment**. La seguretat es basa en:

    1. **Control per IP**: quins clients (IPs/xarxes) poden muntar una exportació
    2. **UID/GID**: els permisos als fitxers es basen en l'UID/GID del client, que Samba **compara directament** amb els permisos del servidor
    3. **Opcions de muntatge**: `ro`, `noexec`, `nosuid`, `all_squash`...

    !!! warning "Error freqüent"
        Si el client té l'usuari `maria.puig` amb UID 1001 i al servidor la carpeta és propietat de l'usuari amb UID 1002, l'accés fallarà o serà de sol lectura, **sense cap missatge d'error clar** als logs. La sincronització de UID/GID entre client i servidor és crítica en NFS.

    ??? question "Auto-avaluació"
        **1.** Quina diferència clau hi ha entre el model de seguretat de NFS i el de Samba?

        ??? success "Resposta"
            Samba autentica **usuaris individuals** amb contrasenyes (via `tdbsam` o LDAP). NFS usa **adreces IP** com a mecanisme de control d'accés; no hi ha autenticació per usuari pròpia del protocol. Els permisos dins de l'exportació es gestionen pels UID/GID del sistema operatiu.

        **2.** Per quin port principal escolta NFS?

        ??? success "Resposta"
            El **port 2049** (NFSv4) o els ports 2049 + 111 (NFSv3 amb rpcbind). NFSv4 simplifica el firewall usant únicament el 2049.

        **3.** Quina ordre NFS instal·la el client?

        ??? success "Resposta"
            `sudo apt install nfs-common`. Aquest paquet proporciona les eines del costat client: `mount.nfs`, `showmount`, `rpcinfo`, etc. El servidor usa `nfs-kernel-server`.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.12 · Exploració de la topologia NFS

    **Objectiu**: entendre l'arquitectura NFS i preparar la topologia del laboratori.
    **Temps estimat**: 20 minuts

    ---

    ### Pas 1 – Identifica les IPs del teu entorn

    Al servidor:

    ```bash
    ip a | grep 192.168
    hostname
    ```

    Al client:

    ```bash
    ip a | grep 192.168
    hostname
    ```

    Documenta: IP del servidor, IP del client, hostnames.

    ### Pas 2 – Comprova la connectivitat

    ```bash
    # Des del client, verifica que el servidor és accessible
    ping -c 3 192.168.100.10
    ```

    ### Pas 3 – Verifica que rpcbind funciona

    Al servidor (abans d'instal·lar NFS):

    ```bash
    sudo apt install rpcbind -y
    sudo systemctl status rpcbind
    rpcinfo -p localhost
    ```

    Documenta els serveis RPC registrats.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"NFS Network File System explained Linux"`
        - `"NFS vs Samba Linux comparison"`
        - `"NFSv4 vs NFSv3 differences explained"`
