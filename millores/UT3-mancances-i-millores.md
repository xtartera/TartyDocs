# UT3 · Compartició de recursos — Mancances i propostes de millora

> Anàlisi comparativa entre el material local (TartyDocs · UT3) i el manual de referència [SOX de Sergi Coll](https://sergi-coll.gitbook.io/sox) (UF3).
> Objectiu: detectar buits i proposar un índex evolucionat que mantingui el que ja tenim i hi afegeixi les novetats.

---

## 1. Estat actual del material (què ja tenim)

UT3 té **9 blocs / ~30 pàgines** i és **més completa i tècnica** que la referència en Samba/NFS/CUPS:

- Conceptes i comparativa Samba/NFS/CUPS.
- **Samba**: instal·lació, `smb.conf`, accés lliure/restringit/per grups, `smbpasswd`, màscares i permisos compostos, quotes, integració amb LDAP.
- **NFS**: arquitectura, `/etc/exports`, `exportfs`/`showmount`, muntatge manual i `fstab`, control per IP, opcions de seguretat (`noexec`, `nosuid`), ports i `ufw`, `all_squash`/`anonuid`/`anongid`.
- **CUPS**: instal·lació, interfície web (631), impressora PDF, ordres, compartició en xarxa, restriccions per grup, PPD/URI, integració Samba+Windows.
- Diagnòstic integral i projectes SpeedRun.

---

## 2. Mancances detectades (ho cobreix la referència, aquí no)

La referència titula aquesta unitat "Compartició de recursos **i seguretat**". El nostre material toca la seguretat de forma dispersa (opcions NFS, permisos) però **no com a eix propi**.

| # | Mancança | A la referència (UF3) | Prioritat |
|---|----------|----------------------|:---------:|
| 1 | **Eix de seguretat transversal**: bones pràctiques de compartició, principi de mínim privilegi, auditoria d'accés, xifratge del trànsit (SMB signing/encryption), enduriment. | Present com a fil de la UF | **Alta** |
| 2 | **Accés a comparticions Windows des de Linux** com a client (`smbclient`, `mount -t cifs`, `cifs-utils`, entrada a `/etc/fstab`). | Sí (pràctic) | Mitjana |

> Nota d'organització: la referència situa la **compartició d'arxius i impressores de Windows** dins d'aquesta unitat; a TartyDocs això ja està cobert a **UT1 · Bloc 7 (Recursos compartits)**. No és una mancança de contingut, només una ubicació diferent. Val la pena afegir una referència creuada.

---

## 3. Propostes de millora del material actual

1. **Consolidar la seguretat en un bloc propi** en lloc de tenir-la escampada: reunir el mínim privilegi, l'auditoria d'accessos, el xifratge SMB i l'enduriment de serveis en un bloc "Seguretat en la compartició". Això alinea la UT amb el títol curricular complet.
2. **Afegir el vessant client Linux → SMB de Windows** (`smbclient`/`mount.cifs`), que complementa el que ja tens (Linux servint cap a Windows) i tanca el cercle bidireccional. *(Alternativament, aquest capítol pot anar a UT4; decidir on encaixa millor pedagògicament.)*
3. **Referència creuada amb UT1**: enllaçar la compartició Windows (UT1 Bloc 7) des de la comparativa inicial de UT3, perquè l'alumne vegi els dos mons costat a costat.
4. **Checklist de seguretat** al final de cada servei (Samba/NFS/CUPS): una taula de "què cal revisar abans de posar-ho en producció".
5. **Autoavaluació orientada a riscos**: preguntes sobre males configuracions (p. ex. `guest ok = yes` en un recurs sensible, `no_root_squash`) que ja apareixen a la proposta d'examen competencial.

---

## 4. Índex proposat a desenvolupar

Llegenda: *(sense marca)* = ja existent · **[NOU]** = capítol a crear · **[MILLORA]** = capítol existent a ampliar.

- **Bloc 1 · Conceptes**
    - Protocols de compartició (01)
    - Comparativa Samba/NFS/CUPS (02)
    - **[MILLORA] Referència creuada** a la compartició Windows (UT1 Bloc 7)
- **Bloc 2 · Samba: instal·lació** — (03–05) sense canvis
- **Bloc 3 · Samba: control d'accés** — (06–08) sense canvis
- **Bloc 4 · Samba: gestió avançada** — (09–11) sense canvis
- **Bloc 5 · NFS: servidor** — (12–15) sense canvis
- **Bloc 6 · NFS: client i seguretat** — (16–21) sense canvis
    - **[NOU] Accés a comparticions Windows des de Linux** — `smbclient`, `mount -t cifs`, `cifs-utils`, `/etc/fstab`
- **Bloc 7 · CUPS: instal·lació** — (22–25) sense canvis
- **Bloc 8 · CUPS: compartició** — (26–29) sense canvis
- **[NOU] Bloc · Seguretat en la compartició**
    - **[NOU] Principi de mínim privilegi i bones pràctiques**
    - **[NOU] Xifratge i signatura SMB** (SMB signing/encryption)
    - **[NOU] Auditoria i registre d'accessos** als recursos
    - **[NOU] Checklist d'enduriment** (Samba/NFS/CUPS abans de producció)
- **Bloc 9 · Diagnòstic** — (30) sense canvis
- **SpeedRun** — projectes existents

**Resum de feina nova a UT3:** 1 capítol de client SMB des de Linux + 1 bloc de seguretat (4 capítols) + referències creuades. La base tècnica ja és forta; el creixement és sobretot en l'eix de seguretat.
