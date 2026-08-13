# UT1 · Windows Server — Mancances i propostes de millora

> Anàlisi comparativa entre el material local (TartyDocs · UT1) i el manual de referència [SOX de Sergi Coll](https://sergi-coll.gitbook.io/sox) (UF1).
> Objectiu: detectar buits i proposar un índex evolucionat que mantingui el que ja tenim i hi afegeixi les novetats.

> **✅ ESTAT: IMPLEMENTAT (2026-08-13).** Aplicat i **publicat** (commit `9624517`). S'han afegit al Bloc 4 els capítols **Boscos, arbres i dominis** (21) i **Relacions de confiança** (22), amb diagrames Mermaid, autoavaluació i enllaç cap a la UT4. UT1 passa de 52 a 54 pàgines. Document mantingut com a **registre històric**.

---

## 1. Estat actual del material (què ja tenim)

UT1 té **10 blocs / 52 pàgines** i és, en general, **més profund i pràctic** que la referència:

- Fonaments, instal·lació (particionament, NTFS/ReFS, `unattend.xml`), administració (Server Manager, PowerShell, Visor d'Esdeveniments, planificador).
- Active Directory complet: conceptes, UO, instal·lació AD DS, promoció a DC, DNS integrat.
- Usuaris/grups, polítiques de contrasenya, restriccions horàries, PowerShell per a AD.
- Clients al domini, `gpresult`, recursos compartits, permisos NTFS, `icacls`.
- GPO (Default Domain Policy, per UO, de restriccions, `gpupdate`).
- Perfils mòbils (`.V6`, redirecció de carpetes) i diagnòstic/auditoria.
- Projectes **SpeedRun** guiats.

---

## 2. Mancances detectades (ho cobreix la referència, aquí no)

| # | Mancança | A la referència (UF1) | Prioritat |
|---|----------|----------------------|:---------:|
| 1 | **Relacions de confiança (trusts)** entre dominis: unidireccionals/bidireccionals, transitives/no transitives, boscos i subdominis. | Sí (teòric amb diagrames) | **Alta** |
| 2 | **Concepte de bosc (forest) i arbre de dominis** de forma explícita (jerarquia, dominis fills, catàleg global). | Implícit a "introducció als dominis" | Mitjana |

> La resta de continguts de la referència (supervisió, instal·lació, AD, perfils, directives de grup) ja els tens coberts, sovint amb més detall.

---

## 3. Propostes de millora del material actual

1. **Ampliar el Bloc 4 (Active Directory)** amb la dimensió multidomini: bosc, arbre, dominis fills i relacions de confiança. Ara la UT1 assumeix un únic domini pla.
2. **Reforçar la connexió amb la UT4**: les relacions de confiança i els boscos són la base conceptual per entendre després la integració heterogènia i Samba AD DC. Afegir una nota d'enllaç cap a UT4.
3. **Afegir un diagrama Mermaid** de topologia de bosc/dominis (coherent amb l'estil visual del manual).
4. **Autoavaluació**: incloure 2-3 preguntes competencials sobre quan cal (i quan no) una relació de confiança, per evitar que quedi com a contingut merament teòric.

---

## 4. Índex proposat a desenvolupar

Llegenda: *(sense marca)* = ja existent · **[NOU]** = capítol a crear · **[MILLORA]** = capítol existent a ampliar.

- **Bloc 1 · Fonaments** — (01–05) sense canvis
- **Bloc 2 · Instal·lació** — (06–10) sense canvis
- **Bloc 3 · Administració** — (11–19) sense canvis
- **Bloc 4 · Active Directory**
    - Conceptes AD (20)
    - **[FET] Boscos, arbres i dominis** (21) — jerarquia, domini arrel, dominis fills, catàleg global
    - **[FET] Relacions de confiança** (22) — direccionalitat, transitivitat, confiança vs permís; diagrama Mermaid
    - Unitats Organitzatives (23)
    - Instal·lació AD DS (24)
    - Promoció a DC (25)
    - DNS integrat amb AD (26)
- **Bloc 5 · Usuaris i grups** — (25–29) sense canvis
- **Bloc 6 · Clients al domini** — (30–33) sense canvis
- **Bloc 7 · Recursos compartits** — (34–38) sense canvis
- **Bloc 8 · GPO** — (39–43) sense canvis
- **Bloc 9 · Perfils mòbils** — (44–49) sense canvis
- **Bloc 10 · Diagnòstic** — (50–52) sense canvis

**Resum de feina nova a UT1:** ✅ **Fet.** 2 capítols nous al Bloc 4 (boscos/dominis i relacions de confiança) + millores d'enllaç i autoavaluació. Era la UT amb menys mancances.
