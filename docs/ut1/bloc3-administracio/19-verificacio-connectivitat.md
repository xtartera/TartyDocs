---
title: Verificació de connectivitat
tags:
  - xarxa
  - diagnòstic
  - connectivitat
  - UT1
---

# :material-network-check: Verificació de connectivitat

!!! abstract "Concepte clau"
    Saber verificar la connectivitat de xarxa és imprescindible per diagnosticar problemes en qualsevol projecte. `ping`, `ipconfig`, `nslookup` i els seus equivalents PowerShell permeten confirmar que el servidor i els clients es veuen correctament **abans** d'instal·lar cap rol.

=== ":material-notebook-outline: Apunts"

    ## Seqüència de diagnòstic de xarxa

    Quan un servei no funciona, segueix sempre aquesta seqüència de verificació de baix a dalt:

    ```mermaid
    graph TD
        L1["1️⃣ Capa física\nipconfig — tens IP?\nMàscara i gateway correctes?"]
        L2["2️⃣ Capa de xarxa\nping gateway — arribes al router?"]
        L3["3️⃣ Connectivitat exterior\nping 8.8.8.8 — arribes a internet?"]
        L4["4️⃣ Resolució de noms\nnslookup google.com — funciona el DNS?"]
        L5["5️⃣ Servei específic\nTest-NetConnection IP -Port 443\nel port del servei és accessible?"]

        L1 --> L2 --> L3 --> L4 --> L5
    ```

    ## `ipconfig` / `ipconfig /all`

    ```cmd
    ipconfig          # Resum: IP, màscara, gateway per adaptador
    ipconfig /all     # Tot: MAC, DHCP, DNS, WINS, durada del lloguer
    ipconfig /release # Allibera la IP de DHCP (si n'hi ha)
    ipconfig /renew   # Sol·licita nova IP de DHCP
    ipconfig /flushdns   # Esborra la caché DNS local
    ipconfig /registerdns # Torna a registrar el nom al servidor DNS
    ```

    **Informació clau a `/all`:**

    | Camp | Qué comproves |
    |------|---------------|
    | **Adreça IPv4** | IP correcta per a la subxarxa |
    | **Màscara de subxarxa** | Ha de coincidir entre tots els equips |
    | **Porta d'enllaç predeterminada** | Ha de ser la IP del router/gateway |
    | **Servidors DNS** | Ha d'apuntar al DC (en entorn de domini) |
    | **Servidor DHCP** | Si és `0.0.0.0` o buida, l'IP és estàtica |

    ## `ping`

    ```cmd
    ping 10.0.2.1          # Prova connectivitat a una IP
    ping SRV-WS2022        # Prova resolució de noms + connectivitat
    ping -t 10.0.2.10      # Ping continu (Ctrl+C per aturar)
    ping -n 10 10.0.2.10   # Envia 10 paquets (per defecte són 4)
    ```

    !!! warning "El Firewall de Windows Server bloqueja el ping (ICMP) per defecte. Si el `ping` falla, comprova primer si el Firewall és la causa. Habilitar temporalment el ping: **Firewall de Windows Defender → Configuració avançada → Regles d'entrada → Eco ICMPv4 → Habilita**."

    ## `nslookup`

    Verifica que el servidor DNS resol noms correctament:

    ```cmd
    nslookup google.com          # Resol un nom extern
    nslookup SRV-WS2022          # Resol el nom del servidor intern
    nslookup cirvianum.local      # Resol el nom del domini AD (Projecte 2)
    nslookup -type=SRV _ldap._tcp.cirvianum.local  # Cerca registres SRV del DC
    ```

    ## `tracert`

    Mostra tots els salts (routers) entre l'origen i la destinació:

    ```cmd
    tracert 8.8.8.8             # Salts fins a DNS de Google
    tracert SRV-WS2022.cirvianum.local   # Comprova el camí fins al DC
    ```

    ## Equivalents PowerShell

    ```powershell
    # Equivalent a ping
    Test-Connection 10.0.2.10 -Count 3

    # Prova de port específic (equivalent a telnet + ping)
    Test-NetConnection 10.0.2.10 -Port 445   # SMB (fitxers compartits)
    Test-NetConnection 10.0.2.10 -Port 389   # LDAP (Active Directory)
    Test-NetConnection 10.0.2.10 -Port 53    # DNS

    # Configuració de xarxa completa
    Get-NetIPConfiguration

    # Esborra caché DNS
    Clear-DnsClientCache

    # Mostra caché DNS actual
    Get-DnsClientCache
    ```

    ## IDs de port habituals al curs

    | Port | Protocol | Servei |
    |------|----------|--------|
    | **53** | DNS | Resolució de noms |
    | **88** | Kerberos | Autenticació AD |
    | **135** | RPC | Remote Procedure Call |
    | **139 / 445** | SMB | Fitxers compartits |
    | **389** | LDAP | Directori Active Directory |
    | **636** | LDAPS | LDAP xifrat |
    | **3389** | RDP | Escriptori remot |

    !!! tip "Quan un client no pot unir-se al domini, comprova amb `Test-NetConnection DC01 -Port 389` si el port LDAP és accessible. Si no ho és, el problema és de firewall o de xarxa, no d'AD."

    ??? question "Auto-avaluació"

        **1.** Un client Windows 11 no pot unir-se al domini. El `ping` a la IP del servidor funciona però el `ping` al nom `SRV-WS2022` falla. Quin és el problema?

        ??? success "Resposta"
            El problema és de **resolució de noms DNS**. El client pot arribar al servidor (connectivitat de xarxa OK) però el DNS del client no resol el nom del servidor. Cal comprovar que la **IP del servidor DNS al client apunta al DC** (no a 8.8.8.8 ni al router) i que el servidor DNS té el registre A del servidor.

        **2.** Quin és l'ordre per esborrar la caché DNS local d'un client i forçar-lo a tornar a consultar el servidor DNS?

        ??? success "Resposta"
            `ipconfig /flushdns` (en cmd) o `Clear-DnsClientCache` (en PowerShell). Útil quan el client té una IP antiga en caché i el servidor ha canviat d'IP.

        **3.** Per quin motiu `ping SRV-WS2022` pot fallar fins i tot si la connectivitat de xarxa és correcta?

        ??? success "Resposta"
            Perquè el **Firewall de Windows** del servidor bloqueja les sol·licituds ICMP (ping) per defecte. El missatge d'error seria "Host de destí inaccessible" o "Temps d'espera esgotat". Solució: habilitar la regla de Firewall "Eco ICMPv4" o usar `Test-NetConnection -Port [port]` que no depèn d'ICMP.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.9 · Diagnòstic complet de xarxa

    **Objectiu**: aplicar la seqüència de verificació de xarxa i documentar l'estat de connectivitat del laboratori.

    **Temps estimat**: 25 minuts

    **Prerequisit**: MV de Windows Server 2022 configurada amb IP estàtica

    ---

    ### Part A – Seqüència de diagnòstic

    Executa les ordres en ordre i documenta el resultat de cada pas:

    | Pas | Ordre | Resultat | OK? |
    |----|-------|----------|-----|
    | 1 | `ipconfig /all` | IP: ___ · Gateway: ___ · DNS: ___ | |
    | 2 | `ping [gateway]` | Paquets enviats/rebuts: ___ | |
    | 3 | `ping 8.8.8.8` | Resposta en ms: ___ | |
    | 4 | `nslookup google.com` | Resolt a: ___ | |
    | 5 | `Test-NetConnection 8.8.8.8 -Port 443` | TcpTestSucceeded: ___ | |

    ### Part B – Habilita el ping al servidor

    1. Obre **Firewall de Windows Defender → Configuració avançada**
    2. **Regles d'entrada** → Filtra per "Eco"
    3. Habilita la regla "Eco ICMPv4 - Entrada"
    4. Des d'un client de la mateixa xarxa, verifica que ara el `ping` al servidor funciona

    ### Part C – Script de diagnòstic

    Crea un script `C:\Scripts\comprova-xarxa.ps1` que executi automàticament els 5 passos de la Part A i guardi el resultat a `C:\Informes\xarxa-[data].txt`.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"ping ipconfig nslookup Windows diagnóstico red"`
        - `"Test-NetConnection PowerShell tutorial"`
        - `"Windows Server network troubleshooting commands"`
        - `"tracert traceroute Windows explained"`
