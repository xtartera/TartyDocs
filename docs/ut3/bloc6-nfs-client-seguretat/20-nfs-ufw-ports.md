---
title: NFS – UFW i ports de servei
tags:
  - ut3
  - nfs
  - seguretat
---

# :material-wall-fire: NFS – UFW i ports de servei

!!! abstract "Concepte clau"
    NFS usa els ports **111** (rpcbind) i **2049** (nfs). Amb UFW actiu, cal permetre l'accés a ambdós ports **des de les IPs dels clients NFS autoritzats**. Restringir per IP garanteix que el servei és accessible per als clients correctes i invisible per a la resta.

=== ":material-notebook-outline: Apunts"

    ## Ports que usa NFS

    | Port | Protocol | Servei | Funció |
    |------|---------|--------|--------|
    | 111 | TCP/UDP | `rpcbind` | Registre i descoberta de serveis RPC |
    | 2049 | TCP/UDP | `nfs` | Transferència de dades NFS |
    | Dynamic | TCP/UDP | `mountd`, `statd`, `lockd` | Serveis auxiliars NFSv3 |

    !!! tip "NFSv4 simplifica el firewall"
        NFSv4 usa **únicament el port 2049** (sense ports dinàmics). Si configures el servidor en mode NFSv4, el firewall és molt més senzill: només cal obrir el 2049.

    ## Configuració UFW per a NFS

    ### Opció 1: regles per IP concreta (recomanat)

    Permet accés NFS **només** des de clients autoritzats:

    ```bash
    # Permet rpcbind (111) des del client .20
    sudo ufw allow from 192.168.100.20 to any port 111

    # Permet NFS (2049) des del client .20
    sudo ufw allow from 192.168.100.20 to any port 2049
    ```

    ### Opció 2: regles per rang de xarxa

    ```bash
    # Permet NFS des de tota la subxarxa de l'aula
    sudo ufw allow from 192.168.100.0/24 to any port 111
    sudo ufw allow from 192.168.100.0/24 to any port 2049
    ```

    ### Opció 3: regla genèrica (menys segura)

    ```bash
    # Perfil UFW predefinit per a NFS (si existeix)
    sudo ufw allow nfs
    # Equivalent a: allow 2049/tcp i 2049/udp des de qualsevol
    ```

    Evita l'opció 3 en producció: obre NFS a tothom.

    ## Verificació

    ```bash
    sudo ufw status verbose
    ```

    Sortida esperada:

    ```text
    Status: active

    To                         Action      From
    --                         ------      ----
    111                        ALLOW IN    192.168.100.20
    2049                       ALLOW IN    192.168.100.20
    22/tcp                     ALLOW IN    Anywhere
    ```

    ## Diagnòstic: el client no pot muntar

    Seqüència de diagnòstic quan `mount -t nfs` falla:

    ```bash
    # 1. Al servidor: verifica que NFS escolta
    ss -tulnp | grep -E '111|2049'

    # 2. Al servidor: verifica les regles UFW
    sudo ufw status verbose

    # 3. Des del client: prova la connectivitat al port 2049
    nc -zv 192.168.100.10 2049
    # Expected: Connection to 192.168.100.10 2049 port [tcp/*] succeeded!

    # 4. Des del client: prova rpcbind
    rpcinfo -p 192.168.100.10
    ```

    Si `nc` al port 2049 falla però el servidor té NFS actiu, el problema és el firewall.

    !!! warning "Error freqüent"
        Obrir el port 2049 però no el 111 (rpcbind). `mountd` usa rpcbind per registrar-se; sense el port 111 obert, el client no pot completar el protocol de muntatge NFSv3 tot i que el port 2049 estigui obert. Obre sempre **ambdós ports** per a NFSv3.

    ??? question "Auto-avaluació"
        **1.** Quins dos ports cal obrir al firewall per a NFSv3?

        ??? success "Resposta"
            El port **111** (rpcbind/portmapper) i el port **2049** (nfs). rpcbind és necessari perquè els clients descobreixin els ports dels serveis NFS auxiliars (mountd, statd, lockd). NFSv4 simplifica a un sol port (2049).

        **2.** Com es permet l'accés NFS als ports 111 i 2049 únicament des del client `192.168.100.25`?

        ??? success "Resposta"
            ```bash
            sudo ufw allow from 192.168.100.25 to any port 111
            sudo ufw allow from 192.168.100.25 to any port 2049
            ```
            Especificant la IP d'origen amb `from IP`, UFW rebutja peticions als mateixos ports des de qualsevol altra IP.

        **3.** Quina ordre de diagnòstic verifica des del client si el port 2049 del servidor és accessible?

        ??? success "Resposta"
            `nc -zv 192.168.100.10 2049` o `telnet 192.168.100.10 2049`. Si la connexió s'estableix, el port és accessible. Si falla amb "Connection refused" o "timed out", o bé NFS no escolta o bé el firewall el bloqueja.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.20 · UFW i ports NFS

    **Objectiu**: configurar UFW al servidor per permetre NFS només des del client autoritzat i verificar el bloqueig des d'altres IPs.
    **Temps estimat**: 25 minuts

    ---

    ### Pas 1 – Activa UFW si no ho està

    ```bash
    sudo ufw allow ssh   # IMPORTANT: permet SSH primer!
    sudo ufw enable
    sudo ufw status
    ```

    ### Pas 2 – Bloqueja NFS per defecte i permet per IP

    ```bash
    sudo ufw allow from 192.168.100.20 to any port 111
    sudo ufw allow from 192.168.100.20 to any port 2049
    sudo ufw status verbose
    ```

    ### Pas 3 – Verifica des del client autoritzat (.20)

    ```bash
    nc -zv 192.168.100.10 2049
    showmount -e 192.168.100.10
    sudo mount -t nfs 192.168.100.10:/srv/nfs/dades /mnt/nfs/dades
    ```

    ### Pas 4 – Verifica el bloqueig des d'una altra IP

    Usa `rpcinfo` o `nc` des d'una IP no autoritzada i documenta el resultat.

    ### Pas 5 – Comprova els logs

    ```bash
    sudo ufw show listening
    sudo journalctl -u ufw --since "5 minutes ago"
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"UFW firewall NFS ports 111 2049 Ubuntu"`
        - `"NFS server firewall configuration Linux"`
        - `"ufw allow from IP port Linux tutorial"`
