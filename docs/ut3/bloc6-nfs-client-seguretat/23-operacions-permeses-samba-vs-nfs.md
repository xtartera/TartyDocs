---
title: Operacions permeses - smbclient, CIFS i NFS
tags:
  - ut3
  - samba
  - nfs
  - cifs
---

# :material-compare: Operacions permeses: smbclient, CIFS i NFS

!!! abstract "Concepte clau"
    No totes les formes d'accedir a un recurs remot ofereixen la mateixa llibertat. **`smbclient`** és una interfície de transferència de fitxers (com un FTP), **`mount -t cifs`** munta un sistema de fitxers però amb permisos fixats en muntar, i **NFS** es comporta com un disc Unix natiu des del primer moment. Triar malament l'eina fa que una tasca senzilla sembli "feixuga" quan en realitat és una limitació coneguda del protocol.

=== ":material-notebook-outline: Apunts"

    ## Per què Samba "sembla" més limitat que NFS

    SMB va néixer per compartir fitxers amb clients **Windows**, que no tenen el mateix model de permisos que Unix (propietari, grup, `chmod`). NFS, en canvi, és un protocol **nadiu Unix**: exporta directament un tros del sistema de fitxers del servidor, amb els mateixos permisos, propietaris i enllaços que tindria en local. Aquesta diferència d'origen és la causa de tot el que ve a continuació — no és que Samba estigui pitjor implementat, és que resol un problema diferent.

    ## Taula comparativa: què pots fer amb cada eina

    | Operació | `smbclient` | `mount -t cifs` | `mount -t nfs` |
    |---|:---:|:---:|:---:|
    | Llistar i navegar (`ls`, `cd`) | ✅ (ordres pròpies) | ✅ (ordres Linux normals) | ✅ (ordres Linux normals) |
    | Pujar/baixar un fitxer | ✅ (`put`/`get`) | ✅ (`cp` normal) | ✅ (`cp` normal) |
    | Editar un fitxer remot in situ (`nano`, `vim`) | ❌ | ✅ | ✅ |
    | `grep`, `sed`, `tar`, `rsync` directament sobre el remot | ❌ (cal baixar primer) | ✅ | ✅ |
    | Copiar/moure un fitxer *dins* del mateix recurs (`cp`, `mv`) | ❌ (baixar + pujar) | ✅ | ✅ |
    | `chmod` / `chown` sobre un fitxer concret | ❌ | ⚠️ normalment sense efecte (mode fixat per `file_mode`/`dir_mode` del muntatge) | ✅ (segons `squash`) |
    | Enllaços simbòlics (`ln -s`) | ❌ | ⚠️ normalment falla sense configuració addicional | ✅ nadiu |
    | Enllaços durs (`ln`) | ❌ | ❌ | ✅ (dins del mateix export) |
    | Pipes i redireccions (`cat fitxer \| grep ...`) | ❌ | ✅ | ✅ |

    !!! tip "No és que CIFS estigui \"trencat\""
        `mount -t cifs` sí que és un muntatge real i la majoria d'operacions de fitxer hi funcionen amb normalitat. El que no funciona igual que en un disc Unix són les **metadades avançades**: permisos individuals, propietat per fitxer i enllaços. El protocol SMB simplement no va dissenyar-se per representar-les tal com ho fa Unix.

    ## Exemple pràctic: la mateixa tasca, tres eines

    Suposem que volem editar `informe.txt`, que ja existeix al recurs remot, canviant-hi una línia amb `sed`.

    **Amb `smbclient` (no es pot fer directament):**

    ```bash
    smbclient //192.168.100.10/dades -U maria.puig
    smb: \> get informe.txt
    smb: \> exit
    sed -i 's/esborrany/versió final/' informe.txt
    smbclient //192.168.100.10/dades -U maria.puig -c "put informe.txt informe.txt"
    ```

    Tres ordres i un fitxer temporal local, només per canviar una línia.

    **Amb `mount -t cifs` o `mount -t nfs` (un sol pas):**

    ```bash
    sed -i 's/esborrany/versió final/' /mnt/dades/informe.txt
    ```

    El fitxer remot es tracta exactament com si fos local, perquè **és** un punt de muntatge.

    ## Exemple: per què un enllaç simbòlic falla en CIFS

    ```bash
    # Sobre un muntatge NFS: funciona
    ln -s /mnt/nfs/dades/informe.txt /mnt/nfs/dades/informe-link.txt
    ls -la /mnt/nfs/dades/informe-link.txt
    # lrwxrwxrwx ... informe-link.txt -> /mnt/nfs/dades/informe.txt

    # Sobre un muntatge CIFS: sol fallar
    ln -s /mnt/dades/informe.txt /mnt/dades/informe-link.txt
    # ln: failed to create symbolic link 'informe-link.txt': Operation not supported
    ```

    L'error no és un bug ni una mala configuració: SMB, tal com s'ha ensenyat en aquesta unitat, no representa enllaços simbòlics Unix.

    ## Quan triar cada eina

    | Situació | Eina recomanada |
    |---|---|
    | Consultar puntualment un recurs Windows/Samba, pujar o baixar algun fitxer | `smbclient` |
    | Un servei/script necessita llegir o escriure fitxers d'un recurs Samba com si fossin locals | `mount -t cifs` |
    | Perfils mòbils, directoris `/home`, o qualsevol cas on calguin permisos Unix reals, enllaços o eines Linux estàndard | NFS |

    !!! warning "Error freqüent"
        Muntar un recurs Samba amb `mount -t cifs` i sorprendre's que `chmod 600 fitxer.txt` "no fa res". No és un error de permisos: el mode dels fitxers ve fixat pels paràmetres `file_mode`/`dir_mode` indicats **en muntar**, no es pot canviar fitxer a fitxer després. Si cal control de permisos individual, cal reconsiderar si NFS és una opció més adequada per a aquell recurs.

    ??? question "Auto-avaluació"
        **1.** Explica per què `smbclient` no permet aplicar `grep` directament sobre un fitxer remot, mentre que un muntatge `mount -t cifs` sí que ho permet.

        ??? success "Resposta"
            `smbclient` no munta cap sistema de fitxers: obre una sessió de transferència tipus FTP amb un joc d'ordres tancat (`get`, `put`, `ls`...). Cap eina de Linux pot operar sobre un fitxer que no existeix localment. `mount -t cifs`, en canvi, integra el recurs remot al sistema de fitxers local, de manera que qualsevol ordre estàndard (`grep`, `cat`, `sed`) hi funciona amb normalitat.

        **2.** Un company es queixa que després de muntar un recurs Samba amb `mount -t cifs`, `chmod 700` sobre un fitxer concret no té cap efecte. Explica per què passa i quina alternativa consideraries si necessita permisos individuals per fitxer.

        ??? success "Resposta"
            Amb un muntatge CIFS estàndard, els permisos que veu el client vénen fixats pels paràmetres `file_mode`/`dir_mode` indicats en muntar, no pel sistema de fitxers remot; per això `chmod` sobre un fitxer individual no té efecte real. Si cal control de permisos per fitxer, NFS (que preserva permisos Unix natius) o una revisió de la configuració del recurs són alternatives més adequades.

        **3.** Per què els enllaços simbòlics funcionen de manera nadiua sobre NFS però normalment fallen sobre un muntatge CIFS?

        ??? success "Resposta"
            NFS és un protocol nadiu Unix que exporta el sistema de fitxers del servidor tal qual, incloent-hi els enllaços simbòlics com a objectes reals del sistema de fitxers. SMB/CIFS va néixer per a un model de fitxers de Windows que no té el concepte d'enllaç simbòlic Unix, per la qual cosa un muntatge CIFS estàndard no els pot representar ni crear.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 6.23 · Les mateixes tres tasques, tres eines diferents

    **Objectiu**: comprovar de primera mà les diferències operatives entre `smbclient`, `mount -t cifs` i `mount -t nfs`.
    **Temps estimat**: 30 minuts
    **Prerequisit**: Activitats de muntatge NFS i client SMB completades (Bloc 6)

    ---

    ### Tasca 1 – Edició directa

    Intenta editar un fitxer existent amb `nano` directament:

    - Des d'una sessió `smbclient` (documenta per què no és possible sense passos previs)
    - Des d'un muntatge `mount -t cifs`
    - Des d'un muntatge `mount -t nfs`

    ### Tasca 2 – Enllaç simbòlic

    Intenta crear un enllaç simbòlic (`ln -s`) a cadascun dels dos muntatges (`cifs` i `nfs`) i documenta el resultat de cada intent, amb el missatge d'error si n'hi ha.

    ### Tasca 3 – chmod individual

    Sobre el mateix fitxer, prova `chmod 600` primer al muntatge CIFS i després al muntatge NFS. Comprova amb `ls -la` si el canvi s'ha aplicat realment a cada cas.

    ### Tasca 4 – Reflexió

    Omple la taula amb les teves pròpies paraules:

    | Eina | Què vaig poder fer | Què NO vaig poder fer | Per què (una frase) |
    |---|---|---|---|
    | `smbclient` | | | |
    | `mount -t cifs` | | | |
    | `mount -t nfs` | | | |

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"smbclient vs mount cifs Linux differences"`
        - `"CIFS mount permissions chmod not working"`
        - `"NFS vs SMB symbolic links Linux"`
