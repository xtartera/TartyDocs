---
title: "autofs: conceptes i arquitectura"
tags:
  - ut2
  - autofs
  - linux
---

# :material-folder-sync: autofs: muntatge automàtic de sistemes de fitxers

!!! abstract "Concepte clau"
    `autofs` (*automounter*) és el dimoni de Linux que munta sistemes de fitxers **sota demanda**: quan un procés accedeix a un directori configurat, autofs el munta automàticament; quan el directori porta un temps sense usar-se, el desmunta sol. Per als perfils mòbils, autofs munta `/perfils/maria.puig` via NFS en el moment del login i el desmunta quan l'usuari tanca la sessió.

=== ":material-notebook-outline: Apunts"

    ## Per quin motiu autofs i no /etc/fstab?

    La alternativa a autofs és muntar NFS permanentment via `/etc/fstab`. La comparativa:

    | Aspecte | `/etc/fstab` (estàtic) | `autofs` (dinàmic) |
    |---------|----------------------|--------------------|
    | **Quan munta** | A l'arrencada del sistema | Quan un procés accedeix al directori |
    | **Quan desmunta** | Mai (fins a `umount`) | Automàticament després d'inactivitat |
    | **Recursos** | Connexió NFS permanent | Connexió NFS únicament quan cal |
    | **Si el servidor cau** | Client pot quedar penjat | Torna a muntar quan el servidor torna |
    | **Multi-usuari** | Un punt de muntatge fix | Un punt de muntatge per usuari, dinàmic |
    | **Configuració** | Al client, manualment | Centralitzada, arxiu de mapes |

    Per a perfils mòbils amb múltiples usuaris, autofs és clarament superior: si cap usuari és actiu, no hi ha connexions NFS obertes.

    ## Arquitectura d'autofs: mapes

    autofs s'organitza en dos nivells de fitxers de configuració:

    ```mermaid
    flowchart TD
        AM["/etc/auto.master\nMapa principal\n'on muntar' i 'quin mapa usar'"] --> AP

        AP["/etc/auto.perfils\nMapa de perfils\n'cada usuari → servidor:ruta'"]

        AUTOFS["autofs (dimoni)"] --> AM
        AUTOFS --> AP

        style AM fill:#1565C0,color:#fff
        style AP fill:#1B5E20,color:#fff
        style AUTOFS fill:#4A148C,color:#fff
    ```

    | Fitxer | Propòsit |
    |--------|---------|
    | `/etc/auto.master` | Mapa principal: defineix on es munten les coses i quin mapa usar |
    | `/etc/auto.perfils` | Mapa de detall: defineix com muntar cada entrada |

    ## El concepte de mapa (map)

    Un **mapa** és un fitxer que descriu les regles de muntatge. La separació en dos fitxers permet:
    - `auto.master`: dir a autofs "per al directori `/perfils`, usa el mapa `/etc/auto.perfils`"
    - `auto.perfils`: dir a autofs "per a cada usuari `*`, munta `servidor:/perfils/usuari`"

    Pots tenir múltiples mapes per a múltiples punts de muntatge:
    ```text title="/etc/auto.master (exemple amb múltiples mapes)"
    /perfils    /etc/auto.perfils    --timeout=60 --ghost
    /opt        /etc/auto.opt        --timeout=120
    ```

    ## L'opció --ghost (directori fantasma)

    !!! warning "Error freqüent: autofs sense `--ghost`"
        Sense `--ghost`, els subdirectoris de `/perfils/` **no apareixen** quan executes `ls /perfils` — el directori sembla buit. Alguns programes de login comproven si el directori home existeix abans de muntar-lo i fallen.

        Amb `--ghost`, autofs crea directoris "fantasma" (punts de muntatge buits) per a les entrades conegudes, de manera que el directori sembla existir fins i tot abans que el muntatge NFS s'hagi produït.

    ```text title="/etc/auto.master"
    /perfils    /etc/auto.perfils    --timeout=60 --ghost
    ```

    ## El timeout d'inactivitat

    `--timeout=60` indica a autofs que desmunti un directori si no s'ha accedit en 60 segons:

    ```bash
    # Veure els muntatges actius en un moment determinat
    cat /proc/mounts | grep autofs
    ```

    Quan `maria.puig` tanca la sessió:
    1. El directori `/perfils/maria.puig` deixa de tenir accessos
    2. Passats 60 segons, autofs el desmunta automàticament
    3. La connexió NFS al servidor es tanca

    ## Paquet i instal·lació

    ```bash
    # Al client (192.168.100.20)
    sudo apt install -y autofs
    ```

    Comprova que el servei és actiu:
    ```bash
    systemctl status autofs
    ```

    ```text
    ● autofs.service - Automounts filesystems on demand
         Loaded: loaded (/usr/lib/systemd/system/autofs.service; enabled; preset: enabled)
         Active: active (running) since ...
    ```

    ## Gestió del servei autofs

    ```bash
    # Reiniciar (necessari quan modifiques auto.master o auto.perfils)
    sudo systemctl restart autofs

    # Recarregar la configuració sense reiniciar
    sudo systemctl reload autofs

    # Veure l'activitat d'autofs en temps real
    sudo journalctl -u autofs -f
    ```

    !!! info "Ubuntu 24.04: autofs ja inclòs com a dependència de nfs-common"
        A Ubuntu 24.04, instal·lar `nfs-common` no instal·la autofs automàticament. Has d'instal·lar `autofs` explícitament.

    ??? question "Auto-avaluació"

        **1.** Per quin motiu `--timeout=60` és important en un entorn amb molts usuaris?

        ??? success "Resposta"
            Cada muntatge NFS actiu implica una connexió oberta al servidor i recursos del kernel en els dos extrems. En un entorn amb 30 alumnes, si tots fan login al matí i el sistema no desmunta els directoris inactius, el servidor hauria de mantenir 30 connexions NFS actives durant tota la jornada, fins i tot pels usuaris que fa hores que no treballen. Amb `--timeout=60`, autofs desmunta automàticament els directoris inactius i el servidor únicament manté connexions per als usuaris que estan treballant activament.

        **2.** Quina diferència hi ha entre `systemctl restart autofs` i `systemctl reload autofs`?

        ??? success "Resposta"
            `systemctl restart autofs` atura i torna a arrencar el dimoni completament — desmunta tots els sistemes de fitxers autofs actius i els torna a muntar. Pot interrompre sessions d'usuaris actius. `systemctl reload autofs` envia un senyal al dimoni perquè rellegeixi la configuració sense aturar-se — no desmunta res que estigui muntat. En general, usa `reload` per aplicar canvis en calent; usa `restart` si `reload` no reflecteix els canvis o si has canviat opcions de `auto.master`.

        **3.** `ls /perfils` mostra un directori buit tot i que autofs està configurat. Quin paràmetre probablement falta a `/etc/auto.master`?

        ??? success "Resposta"
            Falta l'opció `--ghost`. Sense `--ghost`, autofs no crea els directoris fantasma prèviament — el directori `/perfils` sembla buit perquè cap usuari ha accedit als subdirectoris i autofs no ha creat els punts de muntatge. Amb `--ghost`, autofs crea directoris buits per a cada entrada del mapa de manera que `ls /perfils` mostra els directoris esperats. Afegeix `--ghost` a la línia de `/etc/auto.master` i executa `sudo systemctl restart autofs`.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 8.2 · Instal·la autofs i explora la seva arquitectura

    **Objectiu**: instal·lar autofs i entendre l'arquitectura de mapes.

    **Temps estimat**: 15 minuts

    ---

    ### Part A – Instal·lació

    ```bash
    # Al client (192.168.100.20)
    sudo apt install -y autofs
    systemctl status autofs
    ```

    ### Part B – Explora els fitxers de configuració

    ```bash
    cat /etc/auto.master
    ls /etc/auto.*
    ```

    Observa el contingut per defecte d'`auto.master`. Anota quins mapes hi ha preconfigurats.

    ### Part C – Comprova el comportament sense ghost

    ```bash
    # Afegeix temporalment /perfils sense --ghost (ho corregiràs a la pàgina 40)
    echo "/perfils /etc/auto.perfils --timeout=30" | sudo tee -a /etc/auto.master
    sudo systemctl restart autofs
    ls /perfils   # sembla buit — normal sense --ghost
    ```

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"autofs Linux automount explained tutorial"`
        - `"autofs vs fstab NFS mount comparison Linux"`
        - `"autofs ghost option directory Ubuntu setup"`
