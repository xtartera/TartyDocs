# PROMPT_MESTRE_UT — Prompt operatiu per a l'anàlisi i redacció de Unitats de Treball

> **Versió**: 1.0 — Basat en l'experiència de la UT1 (Windows Server)
> **Ús**: Carrega aquest fitxer al principi de cada nova sessió quan treballis una UT nova.
> **Repositori**: TartyDocs — Manual docent SMX · Sistemes Operatius en Xarxa (MP04-0224) · 2n CFGM

---

## Context del projecte

**TartyDocs** és un manual digital per al mòdul **MP04-0224 Sistemes Operatius en Xarxa** de 2n CFGM SMX, publicat amb MkDocs Material a GitHub Pages. L'autor és **Xavi Tartera**, docent a l'Institut Cirvianum.

El manual s'organitza en **4 Unitats de Treball**:

| UT | Títol | Contingut principal |
|----|-------|---------------------|
| UT1 | Windows Server | AD DS, DNS, GPO, perfils mòbils |
| UT2 | Linux Server | Ubuntu Server, serveis, permisos |
| UT3 | Compartició de recursos | SAMBA, NFS |
| UT4 | Sistemes heterogenis | Interoperabilitat Windows-Linux |

**Stack tècnic**: MkDocs Material, Python-Markdown, pymdownx (tabbed, superfences, details, emoji), GitHub Actions → GitHub Pages.

**Idioma**: tot el contingut es redacta en **català**.

---

## Principi fonamental: ANALITZA PRIMER, ESCRIU DESPRÈS

**Mai comencis a escriure contingut sense haver completat les Fases 1–4.**

La resposta a la recepció de projectes NO és contingut directe. És l'anàlisi estructurada que genera:

1. Mapa d'aprenentatge
2. Matriu de traçabilitat
3. Índex complet
4. Recomanacions pedagògiques
5. Proposta de seqüència
6. Llista de fitxers Markdown a generar

Guarda l'anàlisi a `decisions/UT[N]-ANALISI-PROJECTES.md`. **No generis cap pàgina de contingut fins que l'usuari validi explícitament l'índex.**

---

## FASE 1 — Extracció de conceptes per projecte

Per a cada projecte/PDF rebut, crea una taula amb format:

```markdown
### Projecte [N] – [Títol]
| Activitat | Conceptes extrets |
|-----------|-------------------|
| A1 – [Nom] | [Concepte A], [Concepte B], [Concepte C] |
| A2 – [Nom] | ... |
```

**Instruccions d'extracció**:

- Cada cel·la "Conceptes extrets" pot tenir múltiples conceptes separats per comes
- Extreu conceptes a nivell ATÒMIC: "Instal·lació AD DS" i "Promoció DC" són conceptes separats, no un sol concepte
- Inclou tant conceptes teòrics (què és X) com procedimentals (com es configura X) com de diagnòstic (com es depura X)
- Identifica errors habituals que es mencionen als projectes (seran advertències al manual)
- Anota les eines i ordres específiques (cmdlets PowerShell, eines GUI, IDs d'Event Viewer)

---

## FASE 2 — Mapa d'aprenentatge

Llista TOTS els conceptes únics identificats, eliminant duplicats i agrupant-los en BLOCS PEDAGÒGICS ordenats per dificultat creixent.

**Format de la taula**:

```markdown
| ID | Concepte | Dificultat | Dependències | Projectes | Diagrama | Pràctica |
|----|----------|------------|--------------|-----------|----------|----------|
| C01 | [Nom del concepte] | 1–8 | C0X, C0Y | P1, P2 | Sí/No | Sí/No |
```

**Criteris de dificultat (escala 1–8)**:

| Nivell | Descripció | Exemples |
|--------|------------|---------|
| 1 | Conceptual pur, sense prerequisits | Definicions, comparatives |
| 2 | Conceptual amb prerequisit senzill | Requisits, tipus, modes |
| 3 | Procedimental bàsic | Instal·lació, configuració inicial |
| 4 | Procedimental amb context | Rols, estructures de directori |
| 5 | Tècnic amb múltiples prerequisits | AD, DNS, clients de domini |
| 6 | Tècnic avançat | Permisos NTFS, GPO bàsiques |
| 7 | Complex, combina múltiples conceptes | Perfils mòbils, GPO per UO |
| 8 | Diagnòstic i resolució de problemes | Event Viewer avançat, PowerShell diagnòstic |

**Criteris per a la columna "Diagrama"**: Sí si el concepte és una estructura, jerarquia, flux o arquitectura que s'entén millor visualment.

**Criteris per a "Pràctica"**: Sí si l'alumne ha de fer alguna acció al sistema (instal·lar, configurar, verificar). No si és purament teòric/conceptual.

**Criteris d'agrupació en blocs**:
- Els blocs han de seguir la progressió natural del curs (normalment = ordre dels projectes)
- Cada bloc ha de ser cohesiu temàticament
- Prefereix blocs de 4–6 conceptes; evita blocs de menys de 3 o més de 10
- Nomena cada bloc amb format: `bloc[N]-[nom-kebab-case]/`

---

## FASE 3 — Matriu de traçabilitat

Per a cada concepte, traça la seva presència als projectes i el seu alineament curricular.

```markdown
| ID | Concepte | P1 | P2 | P3 | ... | RA | CA | Fitxer MD |
|----|----------|----|----|----|-----|----|----|-----------|
| C01 | [Nom] | A1 | — | — | ... | RA1 | 1.1, 1.2 | 01-nom-kebab.md |
```

**Convencions de noms de fitxer**:
- Format: `[NN]-[nom-kebab-case].md` on `[NN]` és el número de seqüència amb zero inicial (01, 02... 52)
- Kebab-case en català: sense accents, sense apòstrofs, guions entre paraules
- El número de seqüència defineix l'ordre d'aparició al manual i a la navegació
- Màxim 40 caràcters en total per al nom del fitxer

**Codis RA/CA**: Usa els codis oficials del mòdul MP04-0224. Si no els coneixes, posa `RA?` i demana'ls a l'usuari.

---

## FASE 4 — Índex complet del manual

Proposa l'estructura completa de carpetes i fitxers:

```
docs/ut[N]/
├── index.md                          ← presentació de la UT
├── [bloc1-nom]/
│   ├── 01-primer-concepte.md
│   └── 02-segon-concepte.md
├── [bloc2-nom]/
│   └── ...
```

Indica el total de fitxers i confirma que cada fitxer de la Fase 3 apareix exactament una vegada.

**Abans de concloure la Fase 4**, comprova:
- [ ] Tots els conceptes de la Fase 2 tenen un fitxer assignat
- [ ] Els fitxers estan ordenats per dificultat creixent dins de cada bloc
- [ ] Els blocs estan ordenats per ordre pedagògic (prerequisits primer)
- [ ] El nom de cada fitxer és descriptiu i en kebab-case

---

## FORMAT DE CADA PÀGINA DE CONTINGUT

Un cop l'usuari validi l'índex, genera les pàgines seguint aquest format MkDocs Material:

### Capçalera (front matter)

```yaml
---
title: [Títol llegible del concepte]
tags:
  - [UT en minúscules: ut1, ut2...]
  - [tema: active-directory, linux, samba...]
---
```

### Estructura de la pàgina

```markdown
# [ICONA_MATERIAL] [Títol del concepte]

!!! abstract "Concepte clau"
    Una frase que resumeix el concepte en ≤ 25 paraules. Ha de respondre "QUÈ és" i "PER QUÈ importa".

=== ":material-notebook-outline: Apunts"

    ## [Subtítol 1]
    [Contingut teòric]
    
    ## Diagrama
    ```mermaid
    [diagrama si s'escau]
    ```
    
    ## [Subtítols addicionals si cal]
    
    !!! warning "Error freqüent"
        [Error típic de l'alumne i per quina raó passa]
    
    !!! tip "[Nota de context]"
        [Connexió amb la realitat de l'aula o l'empresa]
    
    ??? question "Auto-avaluació"
        **1.** [Pregunta]
        ??? success "Resposta"
            [Resposta]
        
        **2.** [Pregunta]
        ??? success "Resposta"
            [Resposta]
        
        **3.** [Pregunta]
        ??? success "Resposta"
            [Resposta]

=== ":material-pencil-ruler: Activitat"

    ## Activitat [UT].[N] · [Títol descriptiu]

    **Objectiu**: [verb d'acció + resultat esperat]
    **Temps estimat**: [X minuts]
    [**Prerequisit**: si cal una MV o configuració prèvia]

    ---

    ### Pas 1 – [Títol del pas]
    [Instruccions numerades o taula a completar]

    ### Pas 2 – [...]
    [...]

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"[terme de cerca 1]"`
        - `"[terme de cerca 2]"`
    
    !!! tip "[Recurs oficial si n'hi ha]"
        [Indicació del recurs (sense URL directa)]
```

---

## CONVENCIONS DE CONTINGUT

### Diagrames Mermaid

Usa Mermaid per a:
- **`graph TD/LR`**: arquitectures, fluxos, relacions
- **`mindmap`**: visió general d'un conjunt de conceptes
- **`sequenceDiagram`**: protocols, ordres d'operació
- **`graph`** amb subgrups (`subgraph`): comparatives costat a costat

### Blocs d'admonició (ús adequat)

| Tipus | Quan usar-lo |
|-------|--------------|
| `!!! abstract` | Concepte clau (1 per pàgina, al principi) |
| `!!! warning` | Error freqüent o risc real |
| `!!! tip` | Millor pràctica o consell professional |
| `!!! info` | Informació contextual neutra |
| `!!! danger` | Acció destructiva o irreversible |
| `??? question` | Auto-avaluació (col·lapsable) |
| `??? success` | Resposta d'auto-avaluació (col·lapsable dins de question) |

### Blocs de codi

Usa blocs de codi per a:
- Ordres PowerShell o cmd: ` ```powershell `
- Ordres bash/shell Linux: ` ```bash `
- Fitxers de configuració XML/YAML: ` ```xml ` / ` ```yaml `
- Sortida de consola (sense ressaltat): ` ```text `

### Taules

Usa taules per a comparatives, llistes d'atributs amb valors, i matrius. Mínimo 3 columnes quan sigui possible per aportar valor.

### Icones Material (exemples útils)

| Icona | Codi | Ús típic |
|-------|------|---------|
| :material-server: | `:material-server:` | Servidor en general |
| :material-server-network: | `:material-server-network:` | Xarxa de servidors |
| :material-windows: | `:material-windows:` | Windows Server |
| :material-linux: | `:material-linux:` | Linux |
| :material-powershell: | `:material-powershell:` | PowerShell |
| :material-console: | `:material-console:` | Línia d'ordres |
| :material-folder-network: | `:material-folder-network:` | Carpetes compartides |
| :material-shield-lock: | `:material-shield-lock:` | Permisos / Seguretat |
| :material-account-multiple: | `:material-account-multiple:` | Usuaris |
| :material-account-group: | `:material-account-group:` | Grups |
| :material-file-cog: | `:material-file-cog:` | GPO / Polítiques |
| :material-dns: | `:material-dns:` | DNS |
| :material-forest: | `:material-forest:` | Bosc/domini AD |
| :material-bug-check: | `:material-bug-check:` | Diagnòstic |

---

## CONVENCIONS DE NAVEGACIÓ (mkdocs.yml)

Afegeix els fitxers nous al `nav:` de `mkdocs.yml` seguint el patró:

```yaml
- "UT[N] · [Nom UT]":
    - Presentació: ut[N]/index.md
    - "Bloc 1 · [Nom bloc]":
        - "[Nom concepte]": ut[N]/bloc1-[nom]/01-fitxer.md
        - "[Nom concepte]": ut[N]/bloc1-[nom]/02-fitxer.md
    - "Bloc 2 · [Nom bloc]":
        - ...
```

**Notes**:
- Els títols al nav poden tenir accents i caràcters especials (van entre cometes si contenen `:` o `·`)
- El nom del fitxer al nav ha de ser descriptiu i curt (3–5 paraules)
- Manté l'ordre numèric dins de cada bloc

---

## RECOMANACIONS PEDAGÒGIQUES (obligatòries a l'informe)

A la Fase 4, sempre inclou una secció de recomanacions amb almenys:

1. **Dependències crítiques**: quins conceptes NO es poden saltar (prerequisits durs)
2. **Concepte clau del tema**: el concepte més important o més difícil del tema
3. **Errors habituals**: mínim 3 errors típics dels alumnes identificats als projectes
4. **Progressió PowerShell/CLI**: si hi ha eines de línia d'ordres, indica com progressa la dificultat
5. **Seqüència setmanal**: estimació de setmanes per bloc, lligada als projectes

---

## CRITERIS DE QUALITAT PER PÀGINA

Abans de donar una pàgina per acabada, comprova:

- [ ] Front matter complet (title + tags)
- [ ] Concepte clau en ≤ 25 paraules a l'admonició `abstract`
- [ ] Mínim 1 diagrama Mermaid si el camp "Diagrama" = Sí a la Fase 2
- [ ] Mínim 1 `!!! warning` amb un error freqüent real (extret dels projectes)
- [ ] 3 preguntes d'auto-avaluació amb respostes col·lapsables (`??? success`)
- [ ] Activitat amb objectiu, temps estimat i passos clars
- [ ] Secció Vídeo amb 3–4 termes de cerca (NO URLs directes)
- [ ] Tot el text en **català** (noms tècnics en anglès permesos: "PowerShell", "Active Directory"...)
- [ ] Codi en blocs de codi amb el llenguatge especificat

---

## FITXERS DE REFERÈNCIA DEL PROJECTE

| Fitxer | Contingut |
|--------|-----------|
| `decisions/UT1-ANALISI-PROJECTES.md` | Anàlisi completa Fases 1–4 de UT1 (referència d'exemple) |
| `decisions/ADR-002–Convencions-redaccio.md` | Convencions lingüístiques i d'estil |
| `decisions/ADR-003 – Plantilla.md` | Plantilla base de pàgina |
| `decisions/ADR-004 – Estructura del contingut.md` | Criteris d'estructura |
| `mkdocs.yml` | Configuració del lloc i navegació |
| `docs/ut1/bloc1-fonaments/01-so-escriptori-vs-xarxa.md` | Exemple de pàgina completa (C01) |
| `docs/ut1/bloc1-fonaments/04-virtualitzacio.md` | Exemple amb diagrama complex (C04) |

---

## FLUX DE TREBALL PER A UNA NOVA UT

```
1. L'usuari proporciona els PDF dels projectes de la UTX
   ↓
2. Executa Fase 1 → Fase 2 → Fase 3 → Fase 4
   ↓
3. Guarda l'anàlisi a decisions/UTX-ANALISI-PROJECTES.md
   ↓
4. Presenta el resum a l'usuari i demana validació explícita
   ↓ (ESPERA CONFIRMACIÓ)
5. Actualitza mkdocs.yml amb la nova navegació
   ↓
6. Crea l'estructura de directoris docs/utX/
   ↓
7. Escriu les pàgines del Bloc 1 amb contingut complet
   ↓
8. Crea stubs ("En construcció") per als blocs restants
   ↓
9. Continua Bloc per Bloc fins a completar la UT
```

**Nota sobre stubs**: cada stub ha d'indicar el Bloc, la Dificultat i el RA al cos del fitxer, per facilitar la redacció posterior.
