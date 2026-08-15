# Proposta · Fixar Ubuntu 22.04 LTS a la UT4 (en lloc de 24.04)

> Generat per Claude arran de la petició de l'usuari sobre `projecte41.md` i `projecte42.md`.

## Diagnosi

He revisat totes les mencions a Ubuntu dins la UT4 i l'abast és **més gran que els dos fitxers SpeedRun** que has assenyalat. Hi ha **9 fitxers** que mencionen "24.04":

| Fitxer | Tipus de menció | Risc si es deixa igual |
|---|---|---|
| `speedrun/projecte41.md` | Material necessari + objectiu | Alt — instrueix explícitament fer servir 24.04 |
| `speedrun/projecte42.md` | Material necessari (DC i client) | Alt — instrueix explícitament fer servir 24.04 |
| `speedrun/projecte44.md` | Material necessari (servidor/client NFS) | Mitjà — mateix patró, tot i que NFS és menys sensible a la versió que Samba AD DC |
| `bloc4-samba-ad-dc/06-ubuntu-samba-ad-dc.md` | **Afirmació tècnica**: "Ubuntu 24.04 inclou Samba 4.19+ per defecte" | **Alt** — és una dada, no només una etiqueta; cal reescriure-la, no només substituir el número |
| `bloc4-samba-ad-dc/01-samba-ad-dc-arquitectura.md` | "cal Samba 4.x (disponible a Ubuntu 24.04 via `apt`)" | Alt — mateix problema que l'anterior |
| `bloc4-samba-ad-dc/02-installacio-provisio.md` | Suggeriment de cerca a YouTube | Baix — només un terme de cerca |
| `bloc3-autenticacio-creuada/01-ubuntu-ad-realmd.md` | Comentari de codi + prerequisit + cerca YouTube | Mitjà |
| `bloc2-comparticio-creuada/01-nfs-windows-server-2022.md` | Capçalera de secció ("Al client Ubuntu 24.04:") | Baix |
| `bloc1-fonaments/00-anatomia-infraestructura-heterogenia.md` | Resum dels blocs ("Bloc 2 — NFS ... Ubuntu 24.04") | Baix |

## Per què l'abast no es pot limitar als dos SpeedRun

Els SpeedRun són targetes-resum que enllacen als blocs de contingut real. Si només canvio `projecte41.md`/`projecte42.md` a "22.04" però el **Bloc 4** (la part tècnica de Samba AD DC que l'alumnat seguirà pas a pas) continua dient "Ubuntu 24.04 inclou Samba 4.19+ per defecte", quedaria una contradicció flagrant just on més importa.

## Un matís important: no és un simple "cerca i substitueix"

La majoria de mencions són etiquetes de versió (`Ubuntu 24.04 LTS (VM) — ...`) que es poden canviar directament i sense risc. Però **dues mencions són afirmacions tècniques factuals**, no etiquetes:

- `06-ubuntu-samba-ad-dc.md`: *"Ubuntu 24.04 inclou Samba 4.19+ per defecte"*
- `01-samba-ad-dc-arquitectura.md`: *"cal Samba 4.x (disponible a Ubuntu 24.04 via apt)"*

No tinc manera de verificar en aquest moment quina versió exacta de Samba distribueix Ubuntu 22.04 als seus repositoris (pot variar amb actualitzacions de manteniment). Per no inventar-me una xifra, proposo reformular aquestes dues frases perquè **no depenguin d'un número de versió concret**, sinó que remetin a `samba --version` per comprovar-ho en el moment — cosa que, a més, és una bona pràctica que ja es fa servir en altres punts dels apunts.

## Recomanació

**Sí, val la pena fer-ho, i amb l'abast complet (9 fitxers), no només els 2 SpeedRun.** A més del canvi de versió, proposo afegir un avís explícit i visible (`!!! warning`) a totes dues targetes SpeedRun i al Bloc 4, deixant clar que **cal usar exactament Ubuntu 22.04 LTS** i que versions posteriors no estan garantides.

### Text d'avís proposat (per a `projecte41.md` i `projecte42.md`)

```markdown
!!! warning "Versió d'Ubuntu obligatòria: 22.04 LTS"
    Aquest projecte s'ha de dur a terme amb **Ubuntu 22.04 LTS**, no amb una versió posterior. El comportament del sistema (Samba, `realmd`/SSSD, xarxa) ha canviat prou entre versions perquè els passos d'aquesta guia no estiguin garantits amb Ubuntu 24.04 o superior.
```

### Text d'avís proposat per al Bloc 4 (reformulat, sense inventar versions)

Substituiria:

> `!!! warning "Versió de Samba: 4.x recomanat"`
> `Samba versions anteriors a 4.x no suporten completament el mode AD DC. Ubuntu 24.04 inclou Samba 4.19+ per defecte. Verifica: samba --version.`

Per:

```markdown
!!! warning "Ubuntu 22.04 LTS obligatori"
    Aquest bloc s'ha de treballar amb **Ubuntu 22.04 LTS**. Samba versions anteriors a 4.x no suporten completament el mode AD DC — comprova la versió instal·lada amb `samba --version` abans de començar el provisionament. No es garanteix el funcionament d'aquesta guia amb Ubuntu 24.04 o posterior.
```

## Canvis concrets proposats, fitxer per fitxer

| Fitxer | Canvi |
|---|---|
| `speedrun/projecte41.md` | "Ubuntu 24.04" → "Ubuntu 22.04" (×2) + afegir avís sota "Material necessari" |
| `speedrun/projecte42.md` | "Ubuntu 24.04" → "Ubuntu 22.04" (×2) + afegir avís sota "Material necessari" |
| `speedrun/projecte44.md` | "Ubuntu 24.04" → "Ubuntu 22.04" (×1) — es pot valorar si aplica el mateix avís (NFS és menys sensible, però mantenir coherència amb la resta de la UT4) |
| `bloc4-samba-ad-dc/06-ubuntu-samba-ad-dc.md` | Reescriure l'avís existent (veure text proposat) |
| `bloc4-samba-ad-dc/01-samba-ad-dc-arquitectura.md` | "disponible a Ubuntu 24.04 via `apt`" → "disponible a Ubuntu 22.04 via `apt`" |
| `bloc4-samba-ad-dc/02-installacio-provisio.md` | Terme de cerca YouTube: "ubuntu 24.04" → "ubuntu 22.04" |
| `bloc3-autenticacio-creuada/01-ubuntu-ad-realmd.md` | Comentari de codi, prerequisit i terme de cerca: "24.04" → "22.04" (el terme de cerca ja menciona "22.04 24.04" junts — es pot deixar o simplificar a només 22.04) |
| `bloc2-comparticio-creuada/01-nfs-windows-server-2022.md` | "Al client Ubuntu 24.04:" → "Al client Ubuntu 22.04:" |
| `bloc1-fonaments/00-anatomia-infraestructura-heterogenia.md` | "Ubuntu 24.04" → "Ubuntu 22.04" al resum de blocs |

## El que et demano abans d'aplicar-ho

1. **Confirma l'abast**: aplico el canvi als 9 fitxers, o només als 2 SpeedRun que vas assenyalar (deixant el Bloc 4 inconsistent)?
2. **Confirma el text de l'avís**: t'agrada la redacció proposada, o vols que hi afegeixi el motiu tècnic exacte (quin canvi concret entre 22.04 i 24.04 ha trencat la pràctica)? Si em dones el detall concret que vas observar, l'afegeixo a l'avís perquè sigui més útil per a l'alumnat en lloc d'una advertència genèrica.
3. **`projecte44.md`**: hi afegeixo també l'avís explícit, o només el canvi de número (ja que NFS és menys sensible a la versió que Samba AD DC)?

No he tocat cap fitxer de `docs/` — a l'espera de la teva confirmació.
