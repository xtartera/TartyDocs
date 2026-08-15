---
title: Checklist d'enduriment
tags:
  - ut3
  - seguretat
  - samba
  - nfs
  - cups
---

# :material-clipboard-check: Checklist d'enduriment (abans de producció)

!!! abstract "Concepte clau"
    Abans de posar un servei de compartició en producció, cal repassar una **llista de comprovació** de seguretat. Aquest capítol recull, servei per servei, què revisar per deixar Samba, NFS i CUPS **endurits**.

=== ":material-notebook-outline: Apunts"

    ## Checklist general

    - [ ] Cada recurs té definit **qui hi accedeix** i amb quins permisos (mínim privilegi).
    - [ ] No hi ha recursos sensibles amb accés de **convidat**.
    - [ ] El **firewall** (`ufw`) només obre els ports necessaris.
    - [ ] Les **contrasenyes** no viatgen ni es desen en clar.
    - [ ] Hi ha **registre/auditoria** als recursos crítics.
    - [ ] S'ha comprovat des d'un client **no autoritzat** que l'accés es denega.

    ## Samba

    | Comprovació | Directiva / acció |
    |-------------|-------------------|
    | Accés restringit per grup | `valid users = @grup` |
    | Sense convidats en dades reals | `guest ok = no` |
    | Xifratge en recursos sensibles | `smb encrypt = required` |
    | Permisos coherents | màscares + ACL (`acl_xattr`) |
    | Auditoria | `vfs objects = full_audit` |
    | Validació de sintaxi | `testparm` |

    ## NFS

    | Comprovació | Opció / acció |
    |-------------|---------------|
    | Sense privilegis de root del client | `root_squash` (per defecte) |
    | Accés limitat per xarxa | exportar a subxarxa/IP, no a `*` |
    | Opcions de seguretat del muntatge | `noexec`, `nosuid`, `nodev` |
    | Ports controlats | `ufw` (2049, 111) |
    | Usuaris anònims on cal | `all_squash` + `anonuid`/`anongid` |

    ## CUPS

    | Comprovació | Acció |
    |-------------|-------|
    | Impressió restringida per grup | `AllowUser @grup` |
    | Interfície d'administració protegida | accés limitat, contrasenya |
    | Compartició només on cal | no exposar totes les impressores |

    !!! tip "`testparm`: valida abans de desar"
        Executa sempre `testparm` després de tocar `smb.conf`: comprova la sintaxi i mostra la configuració efectiva. Evita deixar el servei amb errors que el facin insegur o inaccessible.

    !!! warning "La seguretat es prova, no es suposa"
        No n'hi ha prou de configurar-ho: cal **verificar** amb un client autoritzat (que hi accedeix) i un de no autoritzat (que és rebutjat). Una regla mal escrita pot deixar un recurs obert sense que te n'adonis.

    ??? question "Auto-avaluació"
        **1.** Quina ordre valida la configuració de Samba abans de posar-la en producció?

        ??? success "Resposta"
            `testparm`, que comprova la sintaxi de `smb.conf` i mostra la configuració efectiva que aplicarà el servidor.

        **2.** Per a NFS, cita tres mesures d'enduriment del checklist.

        ??? success "Resposta"
            Mantenir `root_squash`, exportar només a la subxarxa/IPs necessàries (no a `*`) i muntar amb opcions de seguretat com `noexec`, `nosuid` i `nodev`.

        **3.** Per què cal provar l'accés amb un client no autoritzat?

        ??? success "Resposta"
            Per verificar que la restricció funciona realment i que el recurs es denega a qui no hi ha de tenir accés. Configurar-ho no garanteix que sigui correcte; cal comprovar-ho empíricament.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 9.34 · Endureix la teva infraestructura

    **Objectiu**: aplicar el checklist a tots els serveis de la UT3.
    **Temps estimat**: 45 minuts · **Modalitat**: individual

    ---

    ### Tasca 1 – Repàs

    Recorre el checklist de Samba, NFS i CUPS sobre la teva infraestructura i marca què compleixes i què no.

    ### Tasca 2 – Correcció

    Corregeix almenys tres punts que no complien. Valida Samba amb `testparm`.

    ### Tasca 3 – Prova final

    Comprova, amb un usuari autoritzat i un de no autoritzat, que cada recurs es comporta com toca. Documenta els resultats.

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"samba hardening checklist"`
        - `"nfs security options noexec nosuid"`
        - `"testparm samba configuration check"`
