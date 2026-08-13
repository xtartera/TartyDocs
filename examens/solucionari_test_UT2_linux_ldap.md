# Solucionari · Examen test UT2 — Linux Server i LDAP

**Ús exclusiu del professorat.** Distribució de respostes correctes: **10 A, 10 B, 10 C, 10 D**.

## Graella de correcció ràpida

| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:--:|
| B | D | A | C | B | D | A | C | B | D |

| 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| A | C | B | D | A | C | B | D | A | C |

| 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| B | D | A | C | B | D | A | C | B | D |

| 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| A | C | B | D | A | C | B | D | A | C |

---

## Justificacions

1. **B** — Ubuntu Server s'administra sobretot per CLI i és lliure; les altres afirmacions són falses.
2. **D** — LTS = suport a llarg termini (5 anys), no una versió efímera ni només d'escriptori.
3. **A** — `dhcp4: true` és incompatible amb assignar una IP estàtica alhora.
4. **C** — `apt update` refresca la llista de paquets; les altres eliminen o netegen.
5. **B** — Claus SSH + limitar el port amb ufw és el més segur; permetre root o obrir tot és insegur.
6. **D** — Kerberos rebutja tiquets si el rellotge difereix; la sincronització és crítica.
7. **A** — `/etc/hosts` resol noms a IP localment sense DNS.
8. **C** — 750 = propietari rwx (7), grup r-x (5), altres cap (0).
9. **B** — `-aG` **afegeix** grups secundaris; `-G` sol els reemplaça.
10. **D** — `/etc/shadow` conté les contrasenyes xifrades i només el pot llegir root.
11. **A** — El shebang indica l'intèrpret i ha d'anar a la primera línia.
12. **C** — `0 2 * * *` = cada dia a les 2:00.
13. **B** — Webmin escolta al port 10000 per HTTPS.
14. **D** — En un entorn 100 % Linux, OpenLDAP té integració nativa; OpenLDAP no inclou Kerberos/GPO (per això C és fals).
15. **A** — LDIF és el format de text per representar entrades del directori.
16. **C** — `ldapsearch` consulta i mostra entrades; no crea ni esborra.
17. **B** — `slapd` és el servidor OpenLDAP.
18. **D** — Sense `posixAccount`/`gidNumber`/shell no és un compte POSIX vàlid i el sistema no el reconeix.
19. **A** — `slappasswd` genera el hash SSHA de la contrasenya.
20. **C** — Linux identifica per número: un UID duplicat provoca confusió de propietat de fitxers.
21. **B** — Els atributs POSIX (`uidNumber`, `gidNumber`, `homeDirectory`, `loginShell`) són imprescindibles.
22. **D** — phpLDAPadmin és una interfície web de gestió del directori, no un substitut del servidor.
23. **A** — `ldapwhoami` comprova amb quina identitat t'has autenticat.
24. **C** — En text pla qualsevol veuria la contrasenya; cal el hash de `slappasswd`.
25. **B** — `ldapmodify` modifica atributs d'entrades existents.
26. **D** — L'entorn de proves permet experimentar sense malmetre el directori de producció.
27. **A** — `ldapdelete` elimina entrades del directori.
28. **C** — SSSD connecta Linux a un directori (LDAP/AD) via PAM i NSS.
29. **B** — Si `ldapsearch` va bé però `getent` no, el problema és a NSS: `nsswitch.conf`/SSSD.
30. **D** — `sssd.conf` ha de tenir permisos 600; si no, SSSD no arrenca.
31. **A** — `getent`/`id` confirmen la resolució nom↔UID (NSS), no l'existència de la home ni el muntatge.
32. **C** — `sssctl config-check` valida la sintaxi de la configuració de SSSD.
33. **B** — Cal `rw` a `/etc/exports` i aplicar-ho amb `exportfs -ra`.
34. **D** — `showmount -e` mostra els recursos que exporta el servidor NFS.
35. **A** — NFS usa el 2049 i el portmapper (111).
36. **C** — El comodí `*` i el `&` permeten muntar qualsevol home sota demanda amb una sola regla.
37. **B** — El comportament dels perfils mòbils difereix entre 22.04 i 24.04 (pam_mkhomedir vs autofs).
38. **D** — `auto.master` és el mapa principal d'autofs que apunta als submapes.
39. **A** — autofs munta sota demanda i escala millor; fstab exigiria una entrada per usuari.
40. **C** — Símptoma típic de home no muntada (autofs/NFS) o inexistent, no de contrasenya ni domini.
