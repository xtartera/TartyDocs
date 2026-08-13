---
title: oddjob-mkhomedir – creació automàtica de home dirs
tags:
  - ut4
  - active-directory
  - linux
  - pam
---

# :material-home-plus: oddjob-mkhomedir – creació automàtica de home dirs

!!! abstract "Concepte clau"
    **oddjob-mkhomedir** és un servei PAM que crea automàticament el directori home d'un usuari AD la primera vegada que inicia sessió a Linux. Sense ell, l'usuari queda autenticat correctament però sense directori home, i el login falla o és incomplet.

=== ":material-notebook-outline: Apunts"

    ## El problema: usuaris AD sense directori home

    Quan un usuari AD (`director201@ad-cognom.local`) inicia sessió en un client Linux per primera vegada, no té un directori `/home/director201` — perquè l'usuari no existia prèviament al sistema Linux. La sessió s'obre però l'usuari comença al directori `/` o rebria un error.

    **oddjob-mkhomedir** resol aquest problema: en el moment del login PAM, detecta si el directori home no existeix i el crea automàticament.

    ## Instal·lació i activació

    ```bash
    sudo apt install -y oddjob oddjob-mkhomedir

    # Activa el servei oddjobd
    sudo systemctl enable --now oddjobd
    sudo systemctl status oddjobd
    ```

    ## Configuració PAM

    `realm join` configura PAM automàticament. Però si no, cal afegir manualment:

    ```bash
    # Configura pam-auth-update
    sudo pam-auth-update --enable mkhomedir
    ```

    Alternativament, afegeix manualment a `/etc/pam.d/common-session`:

    ```
    session optional pam_mkhomedir.so skel=/etc/skel umask=077
    ```

    ## Verificació

    ```bash
    # Inicia sessió com a usuari AD per primera vegada
    su - director201@ad-cognom.local

    # Comprova que el directori home s'ha creat
    ls -la /home/
    # Ha d'aparèixer: director201@ad-cognom.local/ (o director201/ si use_fully_qualified_names=False)

    # Contingut inicial (copiat de /etc/skel)
    ls -la /home/director201@ad-cognom.local/
    ```

    ## Directori esquelet /etc/skel

    Els fitxers que `mkhomedir` copia al nou home provenen de `/etc/skel`:

    ```bash
    ls -la /etc/skel/
    # .bash_logout  .bashrc  .profile
    ```

    Pots afegir fitxers a `/etc/skel` per personalitzar l'entorn dels nous usuaris (p.ex., un `.bashrc` corporatiu).

    ## Permisos del directori home creat

    `mkhomedir` crea el home amb `umask 0077` per defecte → permisos `700` (accés únicament per al propietari). Pots canviar-ho:

    ```
    session optional pam_mkhomedir.so skel=/etc/skel umask=0022
    # umask 0022 → permisos 755 (lectura per a tots)
    ```

    !!! tip "Alt al mkhomedir: perfils NFS"
        En entorns amb molts clients, és millor usar **NFS + autofs** per a perfils mòbils: el directori home no es crea localment al client sinó que es munta des d'un servidor NFS (vegeu pàgina 21). Amb `mkhomedir`, el home és **local** a cada màquina i no es sincronitza entre clients.

    !!! warning "SELinux/AppArmor i mkhomedir"
        En Ubuntu amb AppArmor actiu, `oddjobd` necessita el perfil AppArmor corresponent. Si el directori home no es crea i veus errors de `permission denied` als logs (`journalctl -u oddjobd`), verifica que el paquet `oddjob-mkhomedir` inclou el perfil AppArmor necessari o desactiva temporalment AppArmor per a les proves.

    ??? question "Auto-avaluació"
        **1.** Quin problema resol `oddjob-mkhomedir` en entorns Linux integrats amb AD?

        ??? success "Resposta"
            Crea automàticament el **directori home** d'un usuari AD la primera vegada que inicia sessió al client Linux. Sense aquest servei, l'usuari s'autentica correctament (les credencials AD són vàlides) però no té un directori `/home/usuari` on desar fitxers, configuracions i variables d'entorn. Moltes aplicacions requereixen que existeixi un directori home per funcionar correctament.

        **2.** D'on provenen els fitxers inicials que apareixen al directori home nou?

        ??? success "Resposta"
            Del directori **`/etc/skel`** (de "skeleton", esquelet). `pam_mkhomedir.so` copia el contingut de `/etc/skel` al nou directori home de l'usuari. Per defecte, conté `.bash_logout`, `.bashrc` i `.profile`. Pots afegir fitxers personalitzats a `/etc/skel` per establir un entorn estàndard per a tots els nous usuaris (p.ex., un `.bashrc` corporatiu o una carpeta `Documentos/`).

        **3.** Quina diferència hi ha entre `mkhomedir` (local) i NFS (perfils roaming) per a la gestió del home dir?

        ??? success "Resposta"
            Amb **mkhomedir**, el directori home es crea **localment** a cada màquina client. Si l'usuari inicia sessió en un altre equip, se li crea un home nou i buit en aquell equip — no conserva els seus fitxers. Amb **NFS + autofs** (perfils roaming), el home dir es munta des d'un servidor NFS centralitzat: l'usuari veu els mateixos fitxers des de qualsevol màquina del domini. Per a entorns on els usuaris treballen en múltiples equips, NFS és la solució adequada.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 4.16 · Creació automàtica de homes amb mkhomedir

    **Objectiu**: verificar que `oddjob-mkhomedir` crea els homes automàticament per a usuaris AD.
    **Temps estimat**: 15 minuts
    **Prerequisit**: realm join i sssd.conf configurats (Activitats 4.13, 4.14)

    ---

    ### Pas 1 – Instal·la i activa oddjobd

    ```bash
    sudo apt install -y oddjob oddjob-mkhomedir
    sudo systemctl enable --now oddjobd
    ```

    ### Pas 2 – Activa mkhomedir via pam-auth-update

    ```bash
    sudo pam-auth-update --enable mkhomedir
    ```

    Verifica: `grep mkhomedir /etc/pam.d/common-session`

    ### Pas 3 – Login com a usuari AD (primera vegada)

    ```bash
    su - director201
    ```

    Comprova que el home s'ha creat:

    ```bash
    ls -la /home/
    ls -la /home/director201/
    ```

    ### Pas 4 – Crea un fitxer i comprova la persistència

    ```bash
    # Com a director201
    echo "test" > ~/test.txt
    exit

    # Torna a entrar
    su - director201
    cat ~/test.txt   # Ha de mostrar "test"
    ```

    ### Pas 5 – Personalitza el skel

    Afegeix un fitxer de benvinguda a `/etc/skel`:

    ```bash
    sudo bash -c 'echo "Benvingut al domini AD-COGNOM!" > /etc/skel/benvinguda.txt'
    ```

    Crea un altre usuari AD (p.ex., `tecnic203`) i comprova que `benvinguda.txt` apareix al seu home.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"oddjob-mkhomedir Linux Active Directory home directory"`
        - `"pam_mkhomedir.so PAM Linux home creation"`
        - `"Linux AD integration home directory automatic"`
