---
title: "SSH: accés remot al servidor"
tags:
  - ut2
  - linux
  - ssh
---

# :material-ssh: SSH: accés remot al servidor

!!! abstract "Concepte clau"
    **SSH** (*Secure Shell*) és el protocol per administrar servidors Linux de manera remota i segura. Un cop configurat al servidor, pots administrar-lo des del teu PC Windows o Linux amb una sola ordre, sense necessitat d'interactuar físicament amb el servidor. És l'equivalent a RDP (Remote Desktop Protocol) de Windows, però en mode text.

=== ":material-notebook-outline: Apunts"

    ## SSH: conceptes bàsics

    ```mermaid
    sequenceDiagram
        participant CLI as Client (PC Windows/Linux)
        participant SRV as Servidor Ubuntu 24.04

        CLI->>SRV: Connexió TCP port 22
        SRV-->>CLI: Clau pública del servidor
        CLI->>SRV: Autenticació (contrasenya o clau privada)
        SRV-->>CLI: Sessió bash xifrada

        Note over CLI,SRV: Tot el tràfic va xifrat (AES-256)
    ```

    ## Instal·lació i activació al servidor

    ```bash
    # Instal·la el servidor SSH (normalment ja instal·lat a Ubuntu Server)
    sudo apt install -y openssh-server

    # Habilita i arrenca el servei
    sudo systemctl enable --now ssh

    # Comprova l'estat
    systemctl status ssh
    ```

    Sortida esperada:
    ```text
    ● ssh.service - OpenBSD Secure Shell server
         Loaded: loaded (/usr/lib/systemd/system/ssh.service; enabled)
         Active: active (running) since ...
    ```

    ## Connexió des d'un client

    Des d'un altre ordinador Linux o macOS (o Git Bash / Windows Terminal a Windows):

    ```bash
    # Connexió bàsica
    ssh usuari@192.168.100.10

    # La primera vegada et demana confirmar la clau del servidor
    # "Are you sure you want to continue connecting (yes/no)?"
    # Escriu: yes

    # Connexió especificant port (si no és el 22 per defecte)
    ssh -p 2222 usuari@192.168.100.10
    ```

    Des de Windows amb **PuTTY** o **Windows Terminal** (SSH integrat des de Windows 10):
    ```
    Amfitrió: 192.168.100.10
    Port: 22
    Usuari: (el teu usuari Ubuntu)
    ```

    ## Còpia de fitxers per SSH (scp)

    ```bash
    # Copiar un fitxer LOCAL al servidor
    scp fitxer-local.ldif usuari@192.168.100.10:/home/usuari/

    # Copiar un fitxer del SERVIDOR al PC local
    scp usuari@192.168.100.10:/etc/ldap/slapd.d/cn=config.ldif ./

    # Copiar un directori sencer
    scp -r directori/ usuari@192.168.100.10:/home/usuari/
    ```

    ## Configuració del servidor SSH

    El fitxer de configuració és `/etc/ssh/sshd_config`. Canvis que milloren la seguretat en un entorn de producció:

    ```bash
    sudo nano /etc/ssh/sshd_config
    ```

    ```text
    # Desactiva el login de root per SSH (recomanat)
    PermitRootLogin no

    # Permet únicament usuaris específics
    AllowUsers xavier alumne1

    # Canvia el port per defecte (opcional, dificulta escaneig automatitzat)
    Port 22
    ```

    Aplica els canvis:
    ```bash
    sudo systemctl reload ssh
    ```

    !!! tip "Al laboratori, la configuració per defecte és suficient"
        En un entorn de producció real, és imprescindible almenys desactivar `PermitRootLogin`. Al laboratori de l'escola, la configuració per defecte funciona per als exercicis de la UT2.

    ??? question "Auto-avaluació"

        **1.** Intentes connectar-te per SSH al servidor amb `ssh alumne@192.168.100.10` i obtens `Connection refused`. Quines són les causes possibles i com les descartaries?

        ??? success "Resposta"
            Les causes possibles per ordre de probabilitat: (1) El servei SSH no està actiu al servidor — comprova amb `systemctl status ssh` **al servidor** (accedeix per consola directa). (2) El port 22 està bloquejat pel firewall `ufw` — comprova amb `sudo ufw status` i, si cal, obre el port: `sudo ufw allow 22`. (3) L'adreça IP és incorrecta — comprova amb `ip a show enp0s8` que el servidor té `192.168.100.10`. (4) El client no és a la mateixa xarxa que el servidor — comprova que el client té una IP `192.168.100.x/24`.

        **2.** Per quin motiu SSH és més segur que Telnet, que era el protocol equivalent en els anys 90?

        ??? success "Resposta"
            Telnet envia tot el tràfic (inclosa la contrasenya) en **text en clar**: qualsevol persona a la mateixa xarxa pot capturar el tràfic amb Wireshark i llegir les credencials. SSH xifra **tot el tràfic** de la sessió (incloent la contrasenya inicial) amb algoritmes moderns (AES-256-GCM, ChaCha20). A més, SSH verifica la identitat del servidor amb la seva clau pública, protegint contra atacs de "man-in-the-middle". Per això, Telnet és considerat insegur i no s'usa en entorns moderns.

        **3.** Quin avantatge té usar `scp` per transferir fitxers LDIF al servidor en lloc d'editar-los directament al servidor?

        ??? success "Resposta"
            Editar fitxers LDIF directament al servidor amb `nano` pot ser incòmode per fitxers llargs i propensos a errors de sintaxi. Amb `scp`, pots crear i editar el fitxer al teu PC local amb el teu editor preferit (VS Code, Notepad++, etc. amb ressaltat de sintaxi), copiar-lo al servidor quan estigui preparat, i executar `ldapadd` des del servidor. Això redueix els errors, permet usar sistemes de control de versions (git), i facilita la reutilització dels fitxers LDIF entre sessions.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 2.5 · Configura i verifica l'accés SSH

    **Objectiu**: accedir al servidor Ubuntu per SSH des del PC client.

    **Temps estimat**: 15 minuts

    ---

    ### Part A – Activa SSH al servidor

    A la consola del servidor Ubuntu:
    ```bash
    sudo systemctl enable --now ssh
    systemctl status ssh
    ```

    ### Part B – Connecta't des del client

    Des d'un altre ordinador (o des de la MV client, si en tens una):
    ```bash
    ssh [el-teu-usuari]@192.168.100.10
    ```

    Estàs connectat si el prompt canvia a quelcom com:
    ```text
    [el-teu-usuari]@srv-ldap:~$
    ```

    ### Part C – Comprova que pots executar ordres remotament

    Sense sortir de la sessió SSH, executa:
    ```bash
    hostname
    ip a show enp0s8
    uptime
    ```

    Tanca la sessió amb `exit` o `Ctrl+D`.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"SSH tutorial Linux beginners Ubuntu Server"`
        - `"how to connect SSH Ubuntu Server from Windows"`
        - `"scp copy files SSH Linux tutorial"`
        - `"SSH security best practices Linux Server"`
