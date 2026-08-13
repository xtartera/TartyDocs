# Solucionari · Examen test UT3 — Compartició de recursos

**Ús exclusiu del professorat.** Distribució de respostes correctes: **10 A, 10 B, 10 C, 10 D**.

## Graella de correcció ràpida

| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:--:|
| C | A | D | B | C | A | D | B | C | A |

| 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| D | B | C | A | D | B | C | A | D | B |

| 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| C | A | D | B | C | A | D | B | C | A |

| 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| D | B | C | A | D | B | C | A | D | B |

---

## Justificacions

1. **C** — SMB (Samba) és multiplataforma; NFS és natiu Unix, no de Windows.
2. **A** — Samba parla SMB/CIFS.
3. **D** — CUPS gestiona la impressió en xarxa.
4. **B** — `[global]` conté la configuració general del servidor Samba.
5. **C** — `guest ok = yes` permet l'accés sense autenticar-se: risc en dades sensibles.
6. **A** — El paquet és `samba`.
7. **D** — `valid users = @professorat` limita l'accés a aquest grup.
8. **B** — `smbpasswd` gestiona els comptes de la base de contrasenyes de Samba.
9. **C** — Samba manté una base pròpia; cal `smbpasswd -a` per donar-hi d'alta l'usuari.
10. **A** — `valid users = @grup` dóna accés a tot el grup Linux.
11. **D** — Amb `0660` el grup pot llegir i escriure els fitxers dels companys.
12. **B** — Integrar amb LDAP centralitza els usuaris en un únic directori.
13. **C** — Les quotes limiten l'espai per usuari.
14. **A** — `force group` fixa el grup propietari dels fitxers creats.
15. **D** — `no_root_squash` deixa que el root del client sigui root al servidor: molt perillós.
16. **B** — Cal aplicar els canvis amb `exportfs -ra`.
17. **C** — NFS es basa en IP i UID/GID, no en contrasenyes per usuari.
18. **A** — `all_squash` mapeja tots els accessos a un usuari anònim.
19. **D** — El muntatge persistent es fa amb una entrada a `/etc/fstab`.
20. **B** — Des de Linux s'accedeix a SMB amb `smbclient` o `mount -t cifs`.
21. **C** — `uid`/`gid` assignen la propietat local; SMB no transmet la identitat POSIX.
22. **A** — NFS necessita el 2049 i el portmapper 111.
23. **D** — `noexec`, `nosuid` i `nodev` endureixen el muntatge.
24. **B** — CUPS ofereix la interfície web al port 631.
25. **C** — Amb una impressora PDF virtual es pot provar sense maquinari.
26. **A** — `lpstat -p` mostra l'estat de les impressores i la cua.
27. **D** — Cal reactivar la impressora `disabled` perquè processi la cua.
28. **B** — A CUPS es restringeix amb `AllowUser @grup`.
29. **C** — El PPD descriu les capacitats i el controlador de la impressora.
30. **A** — La URI indica la ubicació i el protocol d'accés (p. ex. `ipp://`, `smb://`).
31. **D** — Els clients Windows imprimeixen a CUPS mitjançant la compartició Samba.
32. **B** — Mínim privilegi = donar només els permisos estrictament necessaris.
33. **C** — Signar aporta integritat; xifrar, confidencialitat.
34. **A** — `full_audit` registra les operacions dels usuaris sobre un recurs.
35. **D** — `testparm` valida la sintaxi de `smb.conf`.
36. **B** — `smb encrypt = required` obliga a xifrar i rebutja clients sense SMB3.
37. **C** — Cal provar amb un client autoritzat (accedeix) i un no autoritzat (es denega).
38. **A** — Primer, diagnòstic incremental: connectivitat, exports i firewall, no mesures dràstiques.
39. **D** — `smbstatus` mostra les connexions actives i el seu estat.
40. **B** — Cal triar el servei adequat a cada necessitat i mantenir permisos coherents.
