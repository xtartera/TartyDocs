# Solucionari · Examen test UT4 — Integració de sistemes heterogenis

**Ús exclusiu del professorat.** Distribució de respostes correctes: **10 A, 10 B, 10 C, 10 D**.

## Graella de correcció ràpida

| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:--:|
| D | B | A | C | D | B | A | C | D | B |

| 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| A | C | D | B | A | C | D | B | A | C |

| 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| D | B | A | C | D | B | A | C | D | B |

| 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| A | C | D | B | A | C | D | B | A | C |

---

## Justificacions

1. **D** — Un entorn heterogeni combina SO de fabricants/famílies diferents (Windows + Linux).
2. **B** — Samba AD DC és un controlador de domini compatible amb AD sense llicència Microsoft.
3. **A** — Windows identifica per SID i Linux per UID/GID: cal mapar-los.
4. **C** — NTFS admet ACL riques; el POSIX bàsic només distingeix propietari/grup/altres.
5. **D** — Kerberos rebutja tiquets si el desfasament horari supera uns 5 minuts.
6. **B** — `--use-rfc2307` guarda UID/GID al directori, coherents a tots els clients.
7. **A** — A Windows cal el rol *Server for NFS* per exportar cap a Linux.
8. **C** — Des de Linux s'accedeix a SMB amb `smbclient` o `mount -t cifs`.
9. **D** — Propietat `nobody`/`root` = mapatge d'identitats mal resolt, no un problema de xarxa.
10. **B** — A Windows cal la característica *Client for NFS* per muntar recursos NFS.
11. **A** — `acl_xattr` conserva permisos estil Windows sobre el sistema de fitxers Linux.
12. **C** — `file_mode`/`dir_mode` fixen els permisos POSIX aparents del recurs CIFS.
13. **D** — `realm join` (realmd) uneix l'Ubuntu al domini AD.
14. **B** — És el mateix SSSD, però configurat cap a un backend AD.
15. **A** — El DNS del client ha d'apuntar al DC per localitzar el domini (SRV).
16. **C** — `oddjob-mkhomedir` crea la home la primera vegada que l'usuari inicia sessió.
17. **D** — El TGT és un tiquet que demostra que l'usuari s'ha autenticat.
18. **B** — En restaurar una instantània el rellotge pot quedar enrere i Kerberos falla.
19. **A** — `samba-tool domain provision` crea el domini.
20. **C** — En mode DC cal deshabilitar `smbd`/`nmbd`; `samba-ad-dc` els integra.
21. **D** — `samba-tool user create` crea usuaris del domini.
22. **B** — `host -t SRV _ldap._tcp.domini` comprova els registres SRV del DC.
23. **A** — `dns forwarder` reenvia les consultes externes a un DNS d'internet.
24. **C** — El client Windows ha de tenir el DNS apuntant al DC abans d'unir-se.
25. **D** — `samba-tool domain passwordsettings` gestiona la política de contrasenya.
26. **B** — El directori de perfils usa sticky bit i grup domain users per aïllar els perfils.
27. **A** — RSAT administra el domini (usuaris, GPO) des de Windows amb GUI.
28. **C** — Samba implementa els mateixos protocols (LDAP/Kerberos/SMB) que AD.
29. **D** — Sense Windows Server i amb baix pressupost, Samba AD DC evita llicències.
30. **B** — L'AD de Windows aporta suport oficial i totes les funcions; a canvi, cost.
31. **A** — El POSIX bàsic només té 3 subjectes; per a dos grups calen ACL.
32. **C** — `setfacl`/`getfacl` (ACL POSIX) donen permisos granulars.
33. **D** — `acl_xattr` + `map acl inherit` conserven i hereten les ACL estil Windows.
34. **B** — L'idmap `ad`+rfc2307 llegeix UID/GID del directori: coherents a tot arreu.
35. **A** — No poder modificar fitxers muntats sol ser un mapatge d'identitats incorrecte.
36. **C** — `klist` mostra els tiquets Kerberos actius.
37. **D** — El DNS i la sincronització horària són transversals a tota la infraestructura.
38. **B** — El pla ha de cobrir resolució de noms, autenticació dels dos clients, recursos i impressió.
39. **A** — Diagnòstic per capes: unió, resolució, tiquets i home; no reinstal·lar ni formatar.
40. **C** — Canviar el DC no elimina les dificultats de fons (identitats, permisos, Kerberos, DNS).
