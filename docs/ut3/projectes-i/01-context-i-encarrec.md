---
title: Context i encàrrec · Projecte Integrador UT3
icon: material/office-building-outline
hide:
  - toc
---

# 1 · Context i encàrrec

## Situació inicial

**Pyrenees Outdoor Group** és una empresa dedicada a la distribució de material esportiu de muntanya. L'empresa obrirà una nova delegació i necessita desplegar una infraestructura basada principalment en **Linux** que permeti compartir recursos entre els seus treballadors de manera organitzada, segura i recuperable.

La delegació disposarà dels departaments d'**Administració, Comercial, Logística i Informàtica**, amb un total d'entre 8 i 20 treballadors. L'empresa utilitza equips Linux i Windows, necessita compartir fitxers entre diferents perfils d'usuari, disposar d'una impressora centralitzada i protegir la informació important.

!!! quote "Projecte integrador obert"
    No rebràs una seqüència completa de comandes. Hauràs d'analitzar les necessitats, prendre decisions, implementar-les, comprovar-les i justificar-les. No existeix una única solució correcta.

## Fitxa resum del projecte

| Apartat | Informació |
|---|---|
| Client | Pyrenees Outdoor Group |
| Sector | Distribució de material esportiu de muntanya |
| Projecte | Infraestructura corporativa de recursos compartits per a una nova delegació |
| Departaments | Administració, Comercial, Logística, Informàtica |
| Nombre de treballadors | Entre 8 i 20 |
| Situació inicial | Equips Linux i Windows sense compartició organitzada de fitxers ni impressió centralitzada. |
| Problema detectat | Manca d'un sistema segur i recuperable de compartició de recursos entre perfils d'usuari heterogenis. |
| Rol assignat | Administrador/a de sistemes responsable del disseny, implementació, validació i documentació de la infraestructura. |
| Infraestructura prevista | Usuaris, grups, permisos Unix i ACL, recursos compartits amb Samba i NFS, impressora centralitzada amb CUPS, còpies de seguretat amb `tar`, tallafoc UFW i un servei transversal de transferència de fitxers (SFTP o equivalent). |

## Punt de partida

**No existeix una única solució correcta.** Tu ets qui decideix la distribució d'usuaris i grups, quins recursos es publiquen amb Samba i quins amb NFS, com s'estructuren els directoris i quines mesures de seguretat s'apliquen. La responsabilitat d'analitzar les necessitats, prendre les decisions i justificar-les tècnicament és teva.

## L'encàrrec professional

Se t'ha encarregat el disseny i la implementació d'una infraestructura de recursos compartits que permeti als quatre departaments accedir de manera segura als recursos que necessiten, imprimir de manera centralitzada i recuperar la informació en cas de pèrdua o error.

Per aconseguir-ho hauràs d'analitzar les necessitats de cada departament, dissenyar l'estructura d'usuaris, grups i recursos, implementar els serveis necessaris i demostrar-ne el correcte funcionament des dels clients Linux i Windows.

---

<div class="grid cards" markdown>

- :material-arrow-left:{ .lg }

    [:octicons-arrow-left-24: Tornar a la presentació](index.md){ .md-button }

- :material-arrow-right:{ .lg }

    [:octicons-arrow-right-24: Objectius i requisits](02-objectius-i-requisits.md){ .md-button .md-button--primary }

</div>
