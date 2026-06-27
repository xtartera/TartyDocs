---
title: Perfils mòbils Ubuntu 22.04 vs 24.04
tags:
  - ut2
  - perfils
  - ubuntu
---

# :material-swap-horizontal: Perfils mòbils: Ubuntu 22.04 vs Ubuntu 24.04

!!! abstract "Concepte clau"
    La manera de configurar perfils mòbils va canviar significativament entre Ubuntu 22.04 i 24.04. A 22.04, la solució habitual era `pam_mkhomedir` + `/etc/fstab` (muntatge estàtic). A 24.04, la solució recomanada és autofs + NFS (muntatge dinàmic). Si trobes tutorials a Internet sobre perfils mòbils Linux i no funcionen, probablement son de 22.04.

=== ":material-notebook-outline: Apunts"

    ## Per quin motiu existeix aquesta diferència?

    Entre Ubuntu 22.04 i 24.04 van canviar diverses coses rellevants per als perfils mòbils:

    - **systemd-homed**: Ubuntu 24.04 adopta per defecte `systemd-homed` per a usuaris locals, que interfereix amb `pam_mkhomedir` en alguns escenaris
    - **PAM per defecte**: la cadena PAM predeterminada d'Ubuntu 24.04 gestiona diferent la creació automàtica de directoris home
    - **Recomanació upstream**: la documentació d'Ubuntu 24.04 afavoreix autofs per a perfils en xarxa en comptes de `/etc/fstab` estàtic

    ## Enfocament Ubuntu 22.04: pam_mkhomedir + /etc/fstab

    ### Com funcionava

    ```mermaid
    flowchart LR
        A["Arrencada del client"] --> B["/etc/fstab munta\n192.168.100.10:/perfils\na /perfils\npermanentment"]
        B --> C["Login de l'usuari"]
        C --> D["pam_mkhomedir\ncrea /perfils/maria.puig\nsi no existeix"]
        D --> E["Sessió oberta\na /perfils/maria.puig"]

        style A fill:#1565C0,color:#fff
        style E fill:#1B5E20,color:#fff
    ```

    ### Configuració típica a 22.04

    **`/etc/fstab`** (al client):
    ```text
    192.168.100.10:/perfils    /perfils    nfs    defaults,_netdev    0 0
    ```

    **PAM** (`/etc/pam.d/common-session`):
    ```text
    session optional    pam_mkhomedir.so skel=/etc/skel/ umask=077
    ```

    `pam_mkhomedir` crea el directori home automàticament en el primer login si no existeix.

    ### Per quin motiu no es recomana a 24.04

    - El muntatge NFS de `/etc/fstab` és **permanent**: si el servidor no és accessible en el moment de l'arrencada, el client pot quedar bloquejat esperant el muntatge
    - `pam_mkhomedir` pot tenir comportament inesperat amb systemd-homed actiu
    - Escala malament: tots els clients mantenen connexions NFS obertes contínuament, independentment de si hi ha usuaris actius

    ## Enfocament Ubuntu 24.04: autofs + NFS

    ### Com funciona

    ```mermaid
    flowchart LR
        A["Login de l'usuari"] --> B["PAM verifica via SSSD/LDAP"]
        B --> C["PAM accedeix a\n/perfils/maria.puig"]
        C --> D["autofs detecta l'accés\nmunta 192.168.100.10:/perfils/maria.puig"]
        D --> E["Sessió oberta\na /perfils/maria.puig"]
        E --> F["Inactivitat > 60 s"]
        F --> G["autofs desmunta\nautomàticament"]

        style A fill:#1565C0,color:#fff
        style E fill:#1B5E20,color:#fff
        style G fill:#6A1B9A,color:#fff
    ```

    ### Configuració a 24.04 (el que hem fet als Blocs 7 i 8)

    **`/etc/auto.master`**:
    ```text
    /perfils    /etc/auto.perfils    --timeout=60 --ghost
    ```

    **`/etc/auto.perfils`**:
    ```text
    *    -rw,soft,intr    192.168.100.10:/perfils/&
    ```

    No cal tocar `/etc/fstab` ni `pam_mkhomedir`.

    ## Taula comparativa completa

    | Aspecte | Ubuntu 22.04 | Ubuntu 24.04 |
    |---------|-------------|-------------|
    | **Muntatge NFS** | `/etc/fstab` (estàtic, a l'arrencada) | autofs (dinàmic, sota demanda) |
    | **Creació home** | `pam_mkhomedir` (crea si no existeix) | Manual (Bloc 6) o pre-creat al servidor |
    | **Si el servidor cau a l'arrencada** | Client bloquejat | Client arrenca normalment |
    | **Connexions NFS obertes** | Sempre (des de l'arrencada) | Únicament quan hi ha usuaris actius |
    | **Escalabilitat** | Limitada | Bona (desmunta en inactivitat) |
    | **Complexitat de configuració** | Menor (2 línies) | Major (auto.master + auto.perfils) |
    | **Compatibilitat amb systemd-homed** | Possible conflicte | Compatible |
    | **Tutorials a Internet** | Abundants (però per 22.04) | Menys (però correctes per 24.04) |

    ## Identificar la versió d'Ubuntu dels tutorials

    !!! warning "Alerta amb tutorials de 22.04 a Internet"
        Quan busques documentació sobre perfils mòbils Linux, molts tutorials populars son de 2021-2022 i usen Ubuntu 22.04 o fins i tot 20.04. Pots identificar-los perquè:

        - Mencionen `pam_mkhomedir` com a solució principal
        - Afegeixen entrades a `/etc/fstab` per a NFS
        - No mencionen autofs o ho presenten com a opcional
        - El directori home per defecte és `/home/usuari` en comptes de `/perfils/usuari`

        Si segueixes un d'aquests tutorials en Ubuntu 24.04, el resultat pot ser un sistema que aparentment funciona però que té problemes subtils amb el timeout de NFS o amb `systemd-homed`.

    ## Diagnòstic: "he seguit un tutorial però no funciona a 24.04"

    Si has trobat un tutorial que usava la solució 22.04 i no funciona:

    ```bash
    # Comprova si tens NFS muntat via fstab (solució 22.04)
    grep nfs /etc/fstab

    # Si hi és, comenta la línia i usa autofs en el seu lloc
    sudo nano /etc/fstab   # comenta la línia NFS

    # Comprova si pam_mkhomedir és actiu (solució 22.04)
    grep mkhomedir /etc/pam.d/common-session

    # Si hi és, pots deixar-lo però no és necessari amb autofs
    # (autofs munta el directori que JA EXISTEIX al servidor)
    ```

    ??? question "Auto-avaluació"

        **1.** Un company segueix un tutorial de 2022 i afegeix `/etc/fstab` i `pam_mkhomedir`. El sistema sembla funcionar però el client triga molt a arrencar quan el servidor NFS no és actiu. Per quin motiu?

        ??? success "Resposta"
            Amb `/etc/fstab`, el sistema intenta muntar `/perfils` durant l'arrencada. Si el servidor NFS no respon, el client espera fins al timeout de muntatge (típicament 60-90 s amb l'opció `_netdev`) abans de continuar l'arrencada. Amb autofs, el client arrenca normalment i el muntatge NFS s'intenta únicament quan un usuari fa login. Si el servidor no és accessible, autofs retorna un error al usuari però el sistema continua funcionant.

        **2.** Per quin motiu `pam_mkhomedir` no és necessari amb la configuració d'Ubuntu 24.04 que hem fet?

        ??? success "Resposta"
            `pam_mkhomedir` crea el directori home si no existeix en el moment del login. Amb la nostra configuració, els directoris home `/perfils/maria.puig`, `/perfils/pere.costa` i `/perfils/anna.valls` JA EXISTEIXEN al servidor (els vam crear al Bloc 6). autofs els munta sota demanda però no els crea — simplement accedeix al directori existent al servidor. Si necessitéssim que el directori s'creés automàticament per a usuaris nous, hauríem de crear-lo manualment al servidor o usar un script PAM específic.

        **3.** Trobes un tutorial que diu "afegeix `session optional pam_mkhomedir.so` a `/etc/pam.d/common-session`". Funciona a Ubuntu 24.04 amb la nostra configuració autofs?

        ??? success "Resposta"
            Tècnicament pot funcionar però no és necessari i pot tenir efectes secundaris. `pam_mkhomedir` crearia el directori al punt de muntatge local (el punt de muntatge autofs) en comptes de crear-lo al servidor NFS — i desapareixeria en el proper muntatge. A més, podria interferir amb `systemd-homed`. Amb la nostra configuració, el directori existeix al servidor i autofs el munta automàticament: no cal `pam_mkhomedir`. Seguir tutorials de 22.04 cegament pot introduir components innecessaris que compliquen el diagnòstic.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 8.5 · Identifica l'enfocament dels tutorials que trobes

    **Objectiu**: aprendre a distingir tutorials de 22.04 i 24.04 per als perfils mòbils.

    **Temps estimat**: 15 minuts

    ---

    ### Part A – Cerca de tutorials

    Busca a Internet "linux LDAP roaming profiles autofs NFS" i troba dos tutorials:
    - Un que mencioni `pam_mkhomedir` o `/etc/fstab` per a NFS
    - Un que mencioni autofs i `auto.master`

    Per a cada tutorial, anota:
    - La versió d'Ubuntu que usa
    - El mètode de muntatge (fstab o autofs)
    - Si menciona `pam_mkhomedir`

    ### Part B – Comprova la teva configuració

    ```bash
    # Confirma que NO tens NFS a fstab
    grep nfs /etc/fstab    # ha de ser buit

    # Confirma que autofs gestiona /perfils
    cat /proc/mounts | grep autofs

    # Confirma que pam_mkhomedir NO és necessari
    grep mkhomedir /etc/pam.d/common-session
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"Ubuntu 22.04 vs 24.04 NFS home directory differences"`
        - `"pam_mkhomedir vs autofs Linux home directory"`
        - `"autofs NFS home directory Ubuntu 24.04 setup"`
