---
title: Projecte Integrador · UT3
icon: material/domain
hide:
  - toc
---

# Projecte Integrador · UT3

*Infraestructura corporativa de recursos compartits amb Samba, NFS i CUPS*

!!! abstract "De què tracta"
    Projecte obert de síntesi de la UT3: **dissenya, implementa i documenta** una infraestructura de recursos compartits per a **Pyrenees Outdoor Group**, una empresa que obre una nova delegació. A diferència dels quaderns interactius, aquí no rebràs una seqüència completa de comandes — ets tu qui analitza les necessitats, pren les decisions i les justifica.

| :material-clock-outline: Modalitat | :material-book-open-variant: Blocs | :material-school: RA avaluats | :material-account-search: Microauditoria |
|:---:|:---:|:---:|:---:|
| Individual | **UT3 completa** | **RA2, RA4, RA5, RA6** | Oral, davant del professor |

[:material-file-pdf-box: Descarrega l'enunciat del projecte (PDF)](Projecte_integrador_UT3_V3_recursos_compartits.pdf){ .md-button .md-button--primary }

## Missió del projecte

**Pyrenees Outdoor Group**, una empresa de distribució de material esportiu de muntanya, obrirà una nova delegació amb els departaments d'Administració, Comercial, Logística i Informàtica (entre 8 i 20 treballadors). Necessita una infraestructura basada principalment en Linux que permeti compartir fitxers de manera organitzada, segura i recuperable entre equips Linux i Windows, disposar d'una impressora centralitzada i protegir la informació important.

### El repte

Hauràs de planificar la infraestructura, gestionar usuaris, grups i permisos (Unix i ACL), decidir i justificar quan utilitzar **Samba** i quan **NFS**, integrar una impressora amb **CUPS**, protegir el servidor amb **UFW** i una segona mesura de seguretat, i implementar còpies de seguretat amb `tar`. **No existeix una única solució correcta**: la distribució d'usuaris, l'adreçament IP, l'estructura de directoris i la majoria de decisions tècniques les defineixes tu.

### Què hauràs de lliurar

- La infraestructura completament funcional (servidor, client Linux i client Windows).
- El dossier tècnic amb el disseny, la implementació, les proves i les justificacions.
- Les evidències de totes les activitats, incloent-hi una incidència real diagnosticada.
- Una **microauditoria pràctica**: el professor et podrà demanar modificar un permís, crear un usuari, comprovar un muntatge o recuperar un fitxer, en directe.

## Estructura del projecte

<div class="grid cards" markdown>

- :material-office-building-outline:{ .lg }

    ### 1 · Context i encàrrec

    Pyrenees Outdoor Group, l'escenari mínim i l'encàrrec professional.

    [:octicons-arrow-right-24: Veure context i encàrrec](01-context-i-encarrec.md){ .md-button .md-button--primary }

- :material-target:{ .lg }

    ### 2 · Objectius i requisits

    Objectius del projecte i l'escenari mínim que ha de complir la infraestructura.

    [:octicons-arrow-right-24: Veure objectius i requisits](02-objectius-i-requisits.md){ .md-button .md-button--primary }

- :material-rocket-launch-outline:{ .lg }

    ### 3 · Desenvolupament (11 activitats)

    El nucli del projecte: disseny, usuaris i permisos, Samba i NFS, CUPS, còpies, seguretat i validació.

    [:octicons-arrow-right-24: Veure les 11 activitats](03-desenvolupament.md){ .md-button .md-button--primary }

- :material-clipboard-check-outline:{ .lg }

    ### 4 · Lliurament i avaluació

    Dossier tècnic, microauditoria i com s'avaluarà el projecte (RA, CA i rúbrica).

    [:octicons-arrow-right-24: Veure lliurament i avaluació](04-lliurament-i-avaluacio.md){ .md-button .md-button--primary }

</div>

!!! tip "Recomanacions"
    - No cal aportar una captura per cada comanda executada: selecciona evidències que demostrin inequívocament el resultat.
    - Documenta almenys una incidència real seguint l'esquema símptoma → hipòtesis → comprovacions → causa → solució → validació.
    - Prepara't per explicar i defensar qualsevol part de la infraestructura: la microauditoria final valida que la feina és teva.

!!! warning "Important"
    No es valorarà únicament que la configuració funcioni. També es valora la capacitat de decidir, justificar, demostrar amb evidències, diagnosticar incidències i explicar les diferències entre les tecnologies utilitzades.
