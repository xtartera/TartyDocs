---
title: Automatització de tasques amb cron
tags:
  - ut2
  - linux
  - cron
  - automatitzacio
---

# :material-clock-outline: Automatització de tasques amb cron

!!! abstract "Concepte clau"
    **cron** és el servei que executa ordres o scripts de forma **periòdica** (cada nit, cada hora, cada dilluns...). És l'equivalent Linux del Planificador de tasques de Windows.

=== ":material-notebook-outline: Apunts"

    ## El dimoni cron i el crontab

    El servei `cron` llegeix taules de tasques (**crontab**) i les executa a l'hora programada.

    ```bash
    crontab -l          # llista les teves tasques
    crontab -e          # edita-les
    crontab -r          # elimina-les totes
    sudo crontab -e     # crontab del root
    ```

    ## Format d'una línia de crontab

    ```text
    ┌───── minut (0-59)
    │ ┌───── hora (0-23)
    │ │ ┌───── dia del mes (1-31)
    │ │ │ ┌───── mes (1-12)
    │ │ │ │ ┌───── dia de la setmana (0-7, 0 i 7 = diumenge)
    │ │ │ │ │
    * * * * *  ordre-a-executar
    ```

    | Símbol | Significat | Exemple |
    |--------|-----------|---------|
    | `*` | tot el rang | `* * * * *` = cada minut |
    | `,` | llista | `0,30` = minut 0 i 30 |
    | `-` | interval | `1-5` (dl a dv) |
    | `*/n` | cada n | `*/15` = cada 15 min |

    ## Exemples pràctics

    ```text
    # Còpia cada nit a les 2:00
    0 2 * * *  /home/admin/backup.sh

    # Comprovar l'espai de disc cada hora
    0 * * * *  df -h > /var/log/disc.log

    # Cada dilluns a les 8:00
    0 8 * * 1  /home/admin/informe-setmanal.sh
    ```

    !!! tip "Connexió amb UT1"
        A UT1 programaves tasques amb el **Planificador de tasques** de Windows (desencadenant + acció). `cron` fa exactament el mateix a Linux: defineixes *quan* (els 5 camps) i *què* (l'ordre o script). El paral·lelisme és directe.

    !!! warning "Error freqüent"
        Dins de cron, l'entorn és **mínim** (el `PATH` és curt). Si un script funciona a la teva terminal però falla per cron, usa **rutes absolutes** a les ordres i fitxers (`/usr/bin/rsync`, `/home/admin/backup.sh`) i redirigeix la sortida a un log per depurar-lo.

    ## Verificació

    ```bash
    grep CRON /var/log/syslog | tail    # veure execucions recents
    ```

    ??? question "Auto-avaluació"
        **1.** Què executa la línia `30 6 * * 1-5 /home/admin/tasca.sh`?

        ??? success "Resposta"
            Executa `/home/admin/tasca.sh` a les **6:30 del matí, de dilluns a divendres** (camps: minut 30, hora 6, qualsevol dia del mes, qualsevol mes, dies 1–5 de la setmana).

        **2.** Per què un script pot funcionar a la terminal però fallar quan l'executa cron?

        ??? success "Resposta"
            Perquè cron s'executa amb un **entorn mínim** (PATH reduït, sense les variables de la teva sessió). Cal usar rutes absolutes i no dependre de configuracions del perfil de l'usuari.

        **3.** Amb quina ordre edites les teves tasques programades?

        ??? success "Resposta"
            `crontab -e` (o `sudo crontab -e` per a les tasques del root).

=== ":material-pencil-ruler: Activitat"

    ## Activitat 3.13 · Programa una còpia automàtica

    **Objectiu**: automatitzar una tasca de manteniment amb cron.
    **Temps estimat**: 35 minuts · **Modalitat**: individual

    ---

    ### Tasca 1 – Script

    Reutilitza (o crea) un script `backup.sh` que copiï `/srv/dades` a `/backup` amb marca de temps.

    ### Tasca 2 – Programació

    Amb `crontab -e`, programa'l cada nit a les 2:00. Escriu també una tasca que registri l'espai de disc cada hora.

    ### Tasca 3 – Verificació

    Programa una tasca cada minut de prova (que escrigui a un fitxer), espera i comprova amb `grep CRON /var/log/syslog` que s'executa. Després treu-la.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"linux cron crontab tutorial"`
        - `"crontab syntax explained 5 fields"`
        - `"cron job not running path problem"`
